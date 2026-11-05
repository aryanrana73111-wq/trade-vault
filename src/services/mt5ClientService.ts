import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { safeSetDoc, safeUpdateDoc } from '@/lib/firestoreSanitizer';
import { 
  MT5AccountCredentials, 
  ConnectedTradingAccount, 
  MT5AccountInfo, 
  MT5SyncResult, 
  MT5OpenPosition,
  MT5_ERROR_MESSAGES,
  MT5ErrorCode,
  BrokerCapabilities,
  MT5CreateDemoInput,
  MT5CreateLiveInput,
  MT5CreationResult
} from '@/types/mt5';
import { Trade } from '@/types';
import { 
  mapMT5TradeToTradeVaultTrade, 
  mergeMT5TradeWithExisting,
  validateMT5Trade 
} from '@/lib/mt5TradeMapper';
import { mapMT5SymbolToMarket } from '@/lib/mt5SymbolMapper';
import { MT5BrokerEntry, detectBrokerFromServer } from '@/lib/mt5BrokerDirectory';
import { syncTradeToArenas, addCompetitionTrade } from '@/lib/arenaService';

/**
 * Helper to obtain verified Firebase ID Token headers for all backend MT5 API calls
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User authentication required. Please sign in to TradeVault.');
  }

  const token = await currentUser.getIdToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

export const mt5ClientService = {
  /**
   * Check whether the MT5 Cloud Gateway is active and configured
   */
  async checkConnectorConfig(): Promise<{ configured: boolean; provider: string; message: string }> {
    try {
      const res = await fetch('/api/mt5/config-status');
      if (res.ok) {
        return await res.json();
      }
      return { configured: false, provider: 'MetaApi', message: 'Config check unavailable.' };
    } catch {
      return { configured: false, provider: 'MetaApi', message: 'Offline or server unreachable.' };
    }
  },

  /**
   * Search MT5 Broker directory
   */
  async searchBrokers(query: string = ''): Promise<MT5BrokerEntry[]> {
    try {
      const res = await fetch(`/api/mt5/brokers?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Broker directory lookup failed.');
      const data = await res.json();
      return data.brokers || [];
    } catch {
      return [];
    }
  },

  /**
   * Verify server ping and availability through the real provider
   * NEVER simulates fake latency or fake reachable: true.
   */
  async verifyServer(server: string): Promise<{
    reachable: boolean;
    status: 'VERIFIED' | 'NOT_VERIFIED' | 'INVALID';
    latencyMs?: number;
    message: string;
  }> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/mt5/verify-server', {
        method: 'POST',
        headers,
        body: JSON.stringify({ server })
      });
      const data = await res.json();
      return {
        reachable: Boolean(data.reachable),
        status: data.status || (data.reachable ? 'VERIFIED' : 'NOT_VERIFIED'),
        latencyMs: data.latencyMs,
        message: data.message || (data.reachable ? 'Server verified' : 'Server not verified')
      };
    } catch (err: any) {
      return {
        reachable: false,
        status: 'NOT_VERIFIED',
        message: err?.message || 'Server check unavailable.'
      };
    }
  },

  /**
   * Connect an MT5 account to the TradeVault user profile (Strictly Read-Only).
   * Backend verifies credentials against the real external provider.
   * NEVER invents balances or connects without genuine provider confirmation.
   */
  async connectAccount(
    credentials: MT5AccountCredentials,
    targetDashboardId: string = 'default'
  ): Promise<{ account: ConnectedTradingAccount; syncResult?: MT5SyncResult }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User authentication required.');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('MT5 sync unavailable while offline. Check your internet connection.');
    }

    const detected = detectBrokerFromServer(credentials.server);
    const enrichedCredentials = {
      ...credentials,
      broker: credentials.broker || detected.broker,
      connectionType: credentials.connectionType || detected.connectionType,
      challengeStartingBalance: credentials.challengeStartingBalance || credentials.startingBalance,
      readOnly: true
    };

    // Stage 1: Authenticate with MT5 backend bridge using Firebase ID token
    let data: any;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/mt5/connect', {
        method: 'POST',
        headers,
        body: JSON.stringify(enrichedCredentials)
      });

      data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const errorCode: MT5ErrorCode = data.errorCode || 'MT5_AUTH_FAILED';
        const rawMsg = data.error || MT5_ERROR_MESSAGES[errorCode] || 'MT5 connection failed';
        
        if (errorCode === 'MT5_CONNECTOR_NOT_CONFIGURED') {
          const err = new Error('MT5 connector is not configured. Configure META_API_TOKEN on the server.');
          (err as any).errorCode = 'MT5_CONNECTOR_NOT_CONFIGURED';
          throw err;
        }

        const formattedMsg = rawMsg.startsWith('MT5 connection failed') 
          ? rawMsg 
          : `MT5 connection failed: ${rawMsg}`;
        const err = new Error(formattedMsg);
        (err as any).errorCode = errorCode;
        throw err;
      }
    } catch (fetchErr: any) {
      throw fetchErr;
    }

    const info: MT5AccountInfo = data.accountInfo || data.account;
    const cleanAccount = credentials.accountNumber.trim();

    // Stage 2: Account Identity Verification
    if (String(info.accountNumber) !== cleanAccount || info.server.toLowerCase() !== credentials.server.toLowerCase()) {
      throw new Error('MT5 connection failed: MT5 account identity mismatch. Returned credentials do not match requested account.');
    }

    const account: ConnectedTradingAccount = data.account;

    // Stage 3: Store in user's isolated Firestore subcollection with real provider values
    try {
      const accountDocRef = doc(db, 'users', currentUser.uid, 'tradingAccounts', account.id);
      await safeSetDoc(accountDocRef, {
        ...account,
        targetDashboardId,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (fsErr: any) {
      throw new Error(`FIRESTORE_WRITE_FAILED: MT5 Connected — Trade Import Needs Attention: Saving account to database failed (${fsErr?.message || 'Database error'})`);
    }

    return { account };
  },

  /**
   * Get all connected MT5 trading accounts for the current user
   */
  async getConnectedAccounts(): Promise<ConnectedTradingAccount[]> {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    try {
      const snap = await getDocs(collection(db, 'users', currentUser.uid, 'tradingAccounts'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ConnectedTradingAccount));
    } catch (err) {
      console.warn('Failed to load trading accounts:', err);
      return [];
    }
  },

  /**
   * Subscribe in real-time to connected trading accounts
   */
  subscribeConnectedAccounts(callback: (accounts: ConnectedTradingAccount[]) => void): () => void {
    const currentUser = auth.currentUser;
    if (!currentUser) return () => {};

    try {
      const unsub = onSnapshot(collection(db, 'users', currentUser.uid, 'tradingAccounts'), (snap) => {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ConnectedTradingAccount));
        callback(list);
      }, (err) => {
        console.warn('Trading accounts subscription notice:', err);
      });
      return unsub;
    } catch {
      return () => {};
    }
  },

  /**
   * Fetch live open positions for a connected account
   */
  async getOpenPositions(accountId: string, providerAccountId?: string): Promise<MT5OpenPosition[]> {
    const headers = await getAuthHeaders();
    let provId = providerAccountId;
    if (!provId && auth.currentUser) {
      try {
        const snap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'tradingAccounts', accountId));
        if (snap.exists()) {
          provId = snap.data()?.providerAccountId;
        }
      } catch {
        // ignore
      }
    }
    const finalHeaders = {
      ...headers,
      ...(provId ? { 'x-provider-account-id': provId } : {})
    };
    const res = await fetch(`/api/mt5/positions/${encodeURIComponent(accountId)}`, { headers: finalHeaders });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const code: MT5ErrorCode = errData.errorCode || 'MT5_POSITION_FETCH_FAILED';
      const msg = errData.error || MT5_ERROR_MESSAGES[code] || 'Failed to fetch live open positions';
      const err = new Error(msg);
      (err as any).errorCode = code;
      throw err;
    }
    const data = await res.json();
    return (data.positions || []).map((p: any) => {
      const { market } = mapMT5SymbolToMarket(p.symbol);
      return {
        ...p,
        mappedMarket: market
      };
    });
  },

  /**
   * Disconnect an MT5 account
   * Preserves existing imported trades in the journal
   */
  async disconnectAccount(accountId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const accountDocRef = doc(db, 'users', currentUser.uid, 'tradingAccounts', accountId);
      let provId = '';
      try {
        const snap = await getDoc(accountDocRef);
        if (snap.exists()) {
          provId = snap.data()?.providerAccountId || '';
        }
      } catch {
        // ignore
      }

      const headers = await getAuthHeaders();
      const finalHeaders = {
        ...headers,
        ...(provId ? { 'x-provider-account-id': provId } : {})
      };
      await fetch(`/api/mt5/disconnect/${encodeURIComponent(accountId)}`, { 
        method: 'POST',
        headers: finalHeaders
      }).catch(() => {});

      await safeUpdateDoc(accountDocRef, {
        status: 'disconnected',
        connectionState: 'DISCONNECTED',
        updatedAt: Date.now()
      });
    } catch (err) {
      console.warn('Disconnect notice:', err);
    }
  },

  /**
   * Permanently remove an MT5 account from the user's connected accounts list
   * (Trades previously imported into the journal remain intact)
   */
  async removeAccount(accountId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const headers = await getAuthHeaders();
      await fetch(`/api/mt5/disconnect/${encodeURIComponent(accountId)}`, { 
        method: 'POST',
        headers
      }).catch(() => {});

      const accountDocRef = doc(db, 'users', currentUser.uid, 'tradingAccounts', accountId);
      await deleteDoc(accountDocRef);
    } catch (err) {
      console.warn('Remove account notice:', err);
    }
  },

  /**
   * Synchronize historical trades from MT5 into TradeVault journal
   * Handles idempotency, duplicate prevention, and automatic result calculation.
   */
  async syncTrades(
    accountId: string,
    dashboardId: string,
    periodDays: number = 30
  ): Promise<MT5SyncResult> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated.');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('MT5 sync unavailable while offline. Please reconnect.');
    }

    // Mark account as syncing
    const accountDocRef = doc(db, 'users', currentUser.uid, 'tradingAccounts', accountId);
    let accountData: ConnectedTradingAccount | undefined;
    try {
      const accountSnap = await getDoc(accountDocRef);
      if (accountSnap.exists()) {
        accountData = accountSnap.data() as ConnectedTradingAccount;
      }
    } catch {
      // Continue with available context
    }

    await safeUpdateDoc(accountDocRef, {
      status: 'syncing',
      updatedAt: Date.now()
    }).catch(() => {});

    try {
      const headers = await getAuthHeaders();
      const finalHeaders = {
        ...headers,
        ...(accountData?.providerAccountId ? { 'x-provider-account-id': accountData.providerAccountId } : {})
      };
      const res = await fetch(`/api/mt5/sync/${encodeURIComponent(accountId)}`, {
        method: 'POST',
        headers: finalHeaders,
        body: JSON.stringify({ 
          periodDays,
          providerAccountId: accountData?.providerAccountId,
          server: accountData?.server,
          currency: accountData?.currency
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'MT5 trade synchronization failed.');
      }

      const syncResult: MT5SyncResult = await res.json();
      const importedTrades = syncResult.importedTrades || [];

      let importedCount = 0;
      let updatedCount = 0;
      let duplicatesCount = 0;
      let skippedCount = syncResult.skipped || 0;
      const syncErrors: string[] = [...(syncResult.errors || [])];

      const tradesCollectionRef = collection(db, 'users', currentUser.uid, 'dashboards', dashboardId, 'trades');

      // Fetch existing trades to prevent duplicates using composite source identity
      const existingSnap = await getDocs(tradesCollectionRef);
      const existingMap = new Map<string, Trade>();
      existingSnap.docs.forEach(d => {
        const t = d.data() as Trade;
        const tradeDoc = { id: d.id, ...t };
        existingMap.set(d.id, tradeDoc);
        if (t.sourceTradeKey) {
          existingMap.set(t.sourceTradeKey, tradeDoc);
        }
        if (t.tradingAccountId && t.externalTradeId) {
          existingMap.set(`${t.tradingAccountId}_${t.externalTradeId}`, tradeDoc);
        }
        if (t.tradingAccountId && t.mt5DealId) {
          existingMap.set(`${t.tradingAccountId}_deal_${t.mt5DealId}`, tradeDoc);
        }
      });

      const syncRunId = `sync_${Date.now()}`;
      const provider = accountData?.provider || 'metaapi';
      const providerAccountId = accountData?.providerAccountId || '';
      const mt5Server = accountData?.server || '';
      const currency = accountData?.currency || 'USD';

      // Process and import each MT5 completed trade
      for (const rawTrade of importedTrades) {
        // 1. Strict validation - reject corrupted, NaN, Infinity, negative impossible values
        const validation = validateMT5Trade(rawTrade);
        if (!validation.valid) {
          const errMsg = `Validation rejected trade ticket ${validation.error?.tradeTicket}: Field '${validation.error?.field}' - ${validation.error?.reason}`;
          console.warn(errMsg);
          syncErrors.push(errMsg);
          skippedCount++;
          continue;
        }

        const dealId = String(rawTrade.mt5DealId || rawTrade.externalTradeId || '');
        const positionId = String(rawTrade.mt5PositionId || dealId);
        const sourceTradeKey = rawTrade.sourceTradeKey || `${provider}:${providerAccountId || accountId}:${positionId}:${dealId}`;
        const tradeId = `mt5_${accountId}_${dealId || positionId}`;

        // Account isolation check: check if already exists for this exact account
        const existing = existingMap.get(sourceTradeKey) || 
                         existingMap.get(tradeId) || 
                         existingMap.get(`${accountId}_${dealId}`) ||
                         existingMap.get(`${accountId}_deal_${dealId}`);

        if (existing) {
          duplicatesCount++;
          // Idempotent update: update only execution data without overwriting user's subjective notes/psychology
          const { hasChanged, updates } = mergeMT5TradeWithExisting(existing, rawTrade);
          if (hasChanged) {
            await safeUpdateDoc(doc(tradesCollectionRef, existing.id), updates);
            updatedCount++;
          }
        } else {
          // New trade insert mapped cleanly with ZERO undefined fields
          const newTrade = mapMT5TradeToTradeVaultTrade({
            rawTrade,
            userId: currentUser.uid,
            dashboardId,
            tradingAccountId: accountId,
            mt5AccountId: accountId,
            providerAccountId,
            provider,
            mt5Server,
            syncRunId,
            currency,
            tradeSource: 'mt5'
          });

          await safeSetDoc(doc(tradesCollectionRef, tradeId), newTrade);
          importedCount++;

          // Synchronize to active competition if user joined one
          try {
            await syncTradeToArenas(currentUser.uid, newTrade);
          } catch (arenaErr) {
            console.warn('Competition sync notice for MT5 trade:', arenaErr);
          }
        }
      }

      const finalResult: MT5SyncResult = {
        accountId,
        brokerServer: syncResult.brokerServer || mt5Server || 'MT5 Server',
        syncedAt: Date.now(),
        period: syncResult.period || `Last ${periodDays} Days`,
        imported: importedCount,
        updated: updatedCount,
        duplicates: duplicatesCount,
        skipped: skippedCount,
        failed: 0,
        totalProcessed: importedTrades.length,
        errors: syncErrors
      };

      // Count closed trades belonging specifically to this exact MT5 account
      let accountClosedTradeCount = 0;
      const refreshedSnap = await getDocs(tradesCollectionRef);
      refreshedSnap.docs.forEach(d => {
        const t = d.data() as Trade;
        if (
          (t.tradingAccountId === accountId || t.mt5AccountId === accountId || d.id.startsWith(`mt5_${accountId}_`)) &&
          t.tradeSource === 'mt5' &&
          typeof t.closeTime === 'number' && t.closeTime > 0
        ) {
          accountClosedTradeCount++;
        }
      });

      // Update account sync metadata
      await safeUpdateDoc(accountDocRef, {
        status: 'connected',
        lastSyncAt: Date.now(),
        lastSyncResult: {
          imported: importedCount,
          updated: updatedCount,
          duplicates: duplicatesCount,
          skipped: skippedCount,
          syncedAt: Date.now()
        },
        completedTradesCount: accountClosedTradeCount,
        updatedAt: Date.now()
      }).catch(() => {});

      return finalResult;
    } catch (err: any) {
      await safeUpdateDoc(accountDocRef, {
        status: 'error',
        statusMessage: err?.message || 'Sync failed',
        updatedAt: Date.now()
      }).catch(() => {});
      throw err;
    }
  },

  /**
   * Fetch data integrity diagnostics for an account
   */
  async getDiagnostics(accountId: string): Promise<Record<string, any>> {
    try {
      const headers = await getAuthHeaders();
      let provId = '';
      if (auth.currentUser) {
        try {
          const snap = await getDoc(doc(db, 'users', auth.currentUser.uid, 'tradingAccounts', accountId));
          if (snap.exists()) {
            provId = snap.data()?.providerAccountId || '';
          }
        } catch {
          // ignore
        }
      }
      const finalHeaders = {
        ...headers,
        ...(provId ? { 'x-provider-account-id': provId } : {})
      };
      const res = await fetch(`/api/mt5/diagnostics/${encodeURIComponent(accountId)}`, { headers: finalHeaders });
      if (!res.ok) return { error: 'Failed to retrieve diagnostics' };
      const data = await res.json();
      return data.diagnostics || {};
    } catch (err: any) {
      return { error: err?.message || 'Diagnostics unavailable' };
    }
  },

  /**
   * Synchronize MT5 trades specifically into a Competition
   */
  async syncCompetitionMT5Trades(
    accountId: string,
    competitionId: string,
    periodDays: number = 30
  ): Promise<MT5SyncResult> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('User not authenticated.');

    let provId = '';
    let serv = '';
    let curr = '';
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid, 'tradingAccounts', accountId));
      if (snap.exists()) {
        const d = snap.data();
        provId = d?.providerAccountId || '';
        serv = d?.server || '';
        curr = d?.currency || '';
      }
    } catch {
      // ignore
    }

    const headers = await getAuthHeaders();
    const finalHeaders = {
      ...headers,
      ...(provId ? { 'x-provider-account-id': provId } : {})
    };
    const res = await fetch(`/api/mt5/sync/${encodeURIComponent(accountId)}`, {
      method: 'POST',
      headers: finalHeaders,
      body: JSON.stringify({ 
        periodDays,
        providerAccountId: provId || undefined,
        server: serv || undefined,
        currency: curr || undefined
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'MT5 trade synchronization failed.');
    }

    const syncResult: MT5SyncResult = await res.json();
    const importedTrades = syncResult.importedTrades || [];

    let importedCount = 0;
    const errors: string[] = [];
    const syncRunId = `comp_sync_${Date.now()}`;

    for (const rawTrade of importedTrades) {
      try {
        const validation = validateMT5Trade(rawTrade);
        if (!validation.valid) {
          const errMsg = `Validation rejected trade ticket ${validation.error?.tradeTicket}: Field '${validation.error?.field}' - ${validation.error?.reason}`;
          console.warn(errMsg);
          errors.push(errMsg);
          continue;
        }

        const canonicalTrade = mapMT5TradeToTradeVaultTrade({
          rawTrade,
          userId: currentUser.uid,
          dashboardId: 'competition',
          tradingAccountId: accountId,
          syncRunId,
          tradeSource: 'competition_mt5',
          competitionId
        });

        await addCompetitionTrade({
          competitionId,
          userId: currentUser.uid,
          trade: {
            id: canonicalTrade.id,
            date: canonicalTrade.date,
            time: canonicalTrade.time,
            market: canonicalTrade.market,
            direction: canonicalTrade.direction as any,
            entry: canonicalTrade.entry,
            exit: canonicalTrade.exitPrice,
            stopLoss: canonicalTrade.stopLoss || 0,
            takeProfit: canonicalTrade.takeProfit || 0,
            positionSize: canonicalTrade.positionSize || 0.1,
            riskAmount: canonicalTrade.risk || 0,
            riskPercent: canonicalTrade.riskPercent,
            result: canonicalTrade.result as any,
            pnl: canonicalTrade.pnl,
            rMultiple: canonicalTrade.rMultiple,
            strategy: canonicalTrade.strategy,
            session: canonicalTrade.session,
            timeframe: canonicalTrade.timeframe,
            sharedNotes: canonicalTrade.notes,
            learning: canonicalTrade.learning,
            mistake: canonicalTrade.mistake,
            tradeSource: 'competition_mt5',
            tradingAccountId: accountId,
            mt5AccountId: accountId,
            durationSeconds: canonicalTrade.durationSeconds
          } as any,
          addToPersonalJournal: false
        });
        importedCount++;
      } catch (err: any) {
        console.warn('Competition MT5 trade evaluated/logged:', err);
        errors.push(err?.message || 'Rule evaluation violation logged');
      }
    }

    return {
      accountId,
      brokerServer: syncResult.brokerServer || 'MT5 Server',
      syncedAt: Date.now(),
      period: `Last ${periodDays} Days`,
      imported: importedCount,
      updated: 0,
      duplicates: 0,
      skipped: 0,
      failed: 0,
      totalProcessed: importedTrades.length,
      errors
    };
  },

  /**
   * Fetch explicit broker capabilities for automated MT5 provisioning
   */
  async getBrokerCapabilities(brokerId: string): Promise<BrokerCapabilities> {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/mt5/brokers/capabilities/${encodeURIComponent(brokerId)}`, { headers });
      if (!res.ok) {
        throw new Error('Failed to retrieve broker capabilities');
      }
      const data = await res.json();
      return data.capabilities;
    } catch (err: any) {
      // Fallback to local capability inspection
      const { getBrokerCapabilities: localCaps } = await import('@/lib/mt5BrokerDirectory');
      return localCaps(brokerId);
    }
  },

  /**
   * Provision a real MT5 demo account via external provider/broker
   * Adheres strictly to real broker confirmation and never fabricates credentials.
   */
  async createDemoAccount(input: MT5CreateDemoInput): Promise<MT5CreationResult> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User authentication required.');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('Network offline. Reconnect to request MT5 account creation.');
    }

    const headers = await getAuthHeaders();
    const res = await fetch('/api/mt5/accounts/create-demo', {
      method: 'POST',
      headers,
      body: JSON.stringify(input)
    });

    const data: MT5CreationResult = await res.json().catch(() => ({
      success: false,
      status: 'FAILED',
      message: 'Failed to parse broker provisioning response.'
    }));

    if (!res.ok && !data.credentials) {
      const code = data.errorCode || 'MT5_CREATION_FAILED';
      const msg = data.message || MT5_ERROR_MESSAGES[code] || 'Broker account creation failed';
      const err = new Error(msg);
      (err as any).errorCode = code;
      (err as any).brokerCapabilities = data.brokerCapabilities;
      throw err;
    }

    return data;
  },

  /**
   * Request live MT5 account opening (strictly guides user to official broker KYC portal)
   */
  async createLiveAccount(input: MT5CreateLiveInput): Promise<MT5CreationResult> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User authentication required.');
    }

    const headers = await getAuthHeaders();
    const res = await fetch('/api/mt5/accounts/create-live', {
      method: 'POST',
      headers,
      body: JSON.stringify(input)
    });

    const data: MT5CreationResult = await res.json().catch(() => ({
      success: false,
      status: 'UNSUPPORTED',
      message: 'Live account creation requires broker-side KYC verification.'
    }));

    return data;
  }
};
