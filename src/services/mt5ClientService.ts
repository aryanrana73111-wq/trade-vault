/**
 * TradeVault MT5 Client Integration Service
 * Manages connected MT5 accounts, broker verification, synchronization with Firestore,
 * and trade ingestion into the active journal dashboard.
 */

import { db, auth } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  ConnectedTradingAccount, 
  MT5AccountCredentials, 
  MT5AccountInfo, 
  MT5OpenPosition, 
  MT5SyncResult 
} from '@/types/mt5';
import { Trade } from '@/types';
import { mapMT5SymbolToMarket } from '@/lib/mt5SymbolMapper';
import { MT5BrokerEntry, detectBrokerFromServer } from '@/lib/mt5BrokerDirectory';
import { syncTradeToArenas } from '@/lib/arenaService';

export const mt5ClientService = {
  /**
   * Search MT5 Broker directory
   */
  async searchBrokers(query: string = ''): Promise<MT5BrokerEntry[]> {
    try {
      const res = await fetch(`/api/mt5/brokers?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Failed to load broker directory.');
      const data = await res.json();
      return data.brokers || [];
    } catch (err: any) {
      console.warn('Broker search fallback notice:', err);
      return [];
    }
  },

  /**
   * Create and provision a new Demo MT5 trading account
   */
  async createDemoAccount(params: {
    brokerId: string;
    balance: number;
    leverage: number;
    currency: string;
  }): Promise<{
    loginId: string;
    investorPassword: string;
    masterPassword?: string;
    server: string;
    brokerName: string;
    balance: number;
    currency: string;
    leverage: number;
  }> {
    const res = await fetch('/api/mt5/create-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to provision MT5 demo account.');
    }
    return data.account;
  },

  /**
   * Verify broker server reachability
   */
  async verifyServer(server: string): Promise<{ reachable: boolean; latencyMs?: number; message?: string }> {
    try {
      const res = await fetch('/api/mt5/verify-server', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server })
      });
      return await res.json();
    } catch (err: any) {
      return { reachable: false, message: err?.message || 'Server verification failed.' };
    }
  },

  /**
   * Connect an MT5 account (Strictly Read-Only)
   */
  async connectAccount(
    credentials: MT5AccountCredentials,
    targetDashboardId: string
  ): Promise<{ account: ConnectedTradingAccount; syncResult?: MT5SyncResult }> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User authentication required.');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new Error('MT5 sync unavailable while offline. Check your internet connection.');
    }

    // Auto-detect broker and connection type from server if not provided
    const detected = detectBrokerFromServer(credentials.server);
    const enrichedCredentials = {
      ...credentials,
      broker: credentials.broker || detected.broker,
      connectionType: credentials.connectionType || detected.connectionType,
      readOnly: true
    };

    // Call backend MT5 connector bridge
    const res = await fetch('/api/mt5/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedCredentials)
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'MT5 connection failed: Check the account number, server, and investor password.');
    }

    const info: MT5AccountInfo = data.account;
    const cleanAccount = credentials.accountNumber.trim();
    const maskedAccount = cleanAccount.length > 4 
      ? `****${cleanAccount.slice(-4)}` 
      : cleanAccount;

    const accountId = `mt5_${cleanAccount}_${credentials.server.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const newAccount: ConnectedTradingAccount = {
      id: accountId,
      userId: currentUser.uid,
      accountNumber: maskedAccount,
      accountName: credentials.label || `${enrichedCredentials.broker} (${enrichedCredentials.connectionType.toUpperCase()})`,
      broker: enrichedCredentials.broker,
      server: credentials.server,
      connectionType: enrichedCredentials.connectionType,
      status: 'connected',
      readOnly: true,
      currency: info.currency || 'USD',
      balance: info.balance || 0,
      equity: info.equity || 0,
      leverage: info.leverage || 100,
      openPositionsCount: info.openPositionsCount || 0,
      completedTradesCount: info.completedTradesCount || 0,
      targetDashboardId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Store securely in user's isolated Firestore subcollection
    const accountDocRef = doc(db, 'users', currentUser.uid, 'tradingAccounts', accountId);
    await setDoc(accountDocRef, newAccount, { merge: true });

    return { account: newAccount };
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
  async getOpenPositions(accountId: string): Promise<MT5OpenPosition[]> {
    try {
      const res = await fetch(`/api/mt5/positions/${encodeURIComponent(accountId)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.positions || []).map((p: any) => {
        const { market } = mapMT5SymbolToMarket(p.symbol);
        return {
          ...p,
          mappedMarket: market
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Disconnect an MT5 account
   * Preserves existing imported trades in the journal
   */
  async disconnectAccount(accountId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Tell backend bridge to end session
      await fetch(`/api/mt5/disconnect/${encodeURIComponent(accountId)}`, { method: 'POST' }).catch(() => {});

      // 2. Update status in Firestore to disconnected
      const accountDocRef = doc(db, 'users', currentUser.uid, 'tradingAccounts', accountId);
      await updateDoc(accountDocRef, {
        status: 'disconnected',
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
      await fetch(`/api/mt5/disconnect/${encodeURIComponent(accountId)}`, { method: 'POST' }).catch(() => {});
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
    await updateDoc(accountDocRef, {
      status: 'syncing',
      updatedAt: Date.now()
    }).catch(() => {});

    try {
      const res = await fetch(`/api/mt5/sync/${encodeURIComponent(accountId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodDays })
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

      const tradesCollectionRef = collection(db, 'users', currentUser.uid, 'dashboards', dashboardId, 'trades');

      // Fetch existing trades to prevent duplicates
      const existingSnap = await getDocs(tradesCollectionRef);
      const existingMap = new Map<string, Trade>();
      existingSnap.docs.forEach(d => {
        const t = d.data() as Trade;
        if (t.externalTradeId) {
          existingMap.set(t.externalTradeId, { id: d.id, ...t });
        }
      });

      const syncRunId = `sync_${Date.now()}`;

      // Process and import each MT5 completed trade
      for (const rawTrade of importedTrades) {
        const externalId = String(rawTrade.externalTradeId);
        const { market } = mapMT5SymbolToMarket(rawTrade.symbol);

        const tradeId = `mt5_${accountId}_${externalId}`;
        const existing = existingMap.get(externalId);

        // Date and time normalization (UTC ms)
        const openDate = new Date(rawTrade.openTime);
        const hours = String(openDate.getUTCHours()).padStart(2, '0');
        const mins = String(openDate.getUTCMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${mins}`;

        if (existing) {
          // Idempotent update: update only execution data without overwriting user's subjective notes/psychology
          duplicatesCount++;
          const updatedPayload: Partial<Trade> = {
            exitPrice: rawTrade.exitPrice,
            exitTime: rawTrade.closeTime,
            pnl: rawTrade.pnl,
            commission: rawTrade.commission,
            swap: rawTrade.swap,
            durationSeconds: rawTrade.durationSeconds,
            result: rawTrade.result,
            updatedAt: Date.now()
          };
          await updateDoc(doc(tradesCollectionRef, existing.id), updatedPayload);
          updatedCount++;
        } else {
          // New trade insert
          const newTrade: Trade = {
            id: tradeId,
            userId: currentUser.uid,
            dashboardId,
            createdAt: rawTrade.openTime,
            updatedAt: Date.now(),
            date: rawTrade.openTime,
            time: timeStr,
            market,
            direction: rawTrade.direction,
            entry: rawTrade.entryPrice,
            exitPrice: rawTrade.exitPrice,
            exitTime: rawTrade.closeTime,
            durationSeconds: rawTrade.durationSeconds,
            positionSize: rawTrade.volume,
            stopLoss: rawTrade.stopLoss,
            takeProfit: rawTrade.takeProfit,
            pnl: rawTrade.pnl,
            result: rawTrade.result,
            tradeSource: 'mt5',
            externalTradeId: externalId,
            tradingAccountId: accountId,
            mt5AccountId: rawTrade.mt5AccountId,
            brokerServer: rawTrade.brokerServer,
            importedAt: Date.now(),
            syncId: syncRunId,
            commission: rawTrade.commission,
            swap: rawTrade.swap,
            // Subjective fields remain 'Not Recorded' until user fills them
            notes: `MT5 Execution • ${rawTrade.brokerServer} • Ticket #${externalId}`,
            emotions: [],
            strategy: undefined,
            setupQuality: undefined,
            execution: {
              commission: rawTrade.commission,
              fees: rawTrade.swap
            }
          };

          await setDoc(doc(tradesCollectionRef, tradeId), newTrade);
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
        brokerServer: syncResult.brokerServer || 'MT5 Server',
        syncedAt: Date.now(),
        period: syncResult.period || `Last ${periodDays} Days`,
        imported: importedCount,
        updated: updatedCount,
        duplicates: duplicatesCount,
        skipped: syncResult.skipped || 0,
        totalProcessed: importedTrades.length,
        errors: syncResult.errors || []
      };

      // Update account sync metadata
      await updateDoc(accountDocRef, {
        status: 'connected',
        lastSyncAt: Date.now(),
        lastSyncResult: {
          imported: importedCount,
          updated: updatedCount,
          duplicates: duplicatesCount,
          skipped: syncResult.skipped || 0,
          syncedAt: Date.now()
        },
        completedTradesCount: existingSnap.size + importedCount,
        updatedAt: Date.now()
      });

      return finalResult;
    } catch (err: any) {
      await updateDoc(accountDocRef, {
        status: 'error',
        statusMessage: err?.message || 'Sync failed',
        updatedAt: Date.now()
      }).catch(() => {});
      throw err;
    }
  }
};
