import { 
  MT5Provider 
} from './MT5Provider';
import { 
  MT5OpenPosition,
  MT5CompletedTrade
} from '../../../types/mt5';

export class MetaApiProvider implements MT5Provider {
  public readonly name = 'MetaApi';

  private readonly provisioningBaseUrl = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
  private readonly clientBaseUrl = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai';

  private getToken(): string | null {
    const token = process.env.META_API_TOKEN || 
                  process.env.MT5_API_KEY || 
                  process.env.MT5_PROVIDER_TOKEN || 
                  null;
    return token ? token.trim() : null;
  }

  public isConfigured(): boolean {
    const token = this.getToken();
    return Boolean(token && token.length > 5);
  }

  private getHeaders(): Record<string, string> {
    const token = this.getToken();
    if (!token) {
      throw new Error('MT5_CONNECTOR_NOT_CONFIGURED: META_API_TOKEN or MT5_API_KEY environment variable is not set on the server.');
    }
    return {
      'auth-token': token,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Helper fetch with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return res;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('MT5_CONNECTION_TIMEOUT: Request to MT5 provider timed out.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Connect to MT5 via official MetaApi REST APIs
   */
  async connect(input: {
    login: string;
    password: string;
    server: string;
    platform: 'mt5';
  }): Promise<{
    providerAccountId: string;
    login: string;
    server: string;
    broker?: string;
    status: 'CONNECTED' | 'CONNECTING' | 'FAILED';
    message?: string;
  }> {
    const { login, password, server } = input;
    const cleanLogin = String(login || '').trim();
    const cleanServer = String(server || '').trim();

    if (!this.isConfigured()) {
      return {
        providerAccountId: '',
        login: cleanLogin,
        server: cleanServer,
        status: 'FAILED',
        message: 'MT5 connector is not configured. Configure META_API_TOKEN or MT5_API_KEY in the server environment.'
      };
    }

    if (!cleanLogin || !cleanServer) {
      return {
        providerAccountId: '',
        login: cleanLogin,
        server: cleanServer,
        status: 'FAILED',
        message: 'Login ID and broker server name are required.'
      };
    }

    if (!password) {
      return {
        providerAccountId: '',
        login: cleanLogin,
        server: cleanServer,
        status: 'FAILED',
        message: 'Password is required to authenticate with the broker server.'
      };
    }

    const headers = this.getHeaders();

    try {
      // 1. Check if account already exists in MetaApi provisioning
      let providerAccountId = '';
      const listRes = await this.fetchWithTimeout(`${this.provisioningBaseUrl}/users/current/accounts`, {
        method: 'GET',
        headers
      });

      if (!listRes.ok) {
        if (listRes.status === 401 || listRes.status === 403) {
          return {
            providerAccountId: '',
            login: cleanLogin,
            server: cleanServer,
            status: 'FAILED',
            message: 'MT5 provider token authentication rejected. Verify META_API_TOKEN.'
          };
        }
        throw new Error(`MetaApi provisioning lookup failed with status ${listRes.status}`);
      }

      const existingAccounts: any[] = await listRes.json();
      const matched = existingAccounts.find(
        (a: any) => String(a.login) === cleanLogin && String(a.server).toLowerCase() === cleanServer.toLowerCase()
      );

      if (matched && matched.id) {
        providerAccountId = matched.id;
      } else {
        // Create new account in MetaApi
        const createRes = await this.fetchWithTimeout(`${this.provisioningBaseUrl}/users/current/accounts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: `TradeVault-${cleanLogin}`,
            type: 'cloud',
            login: cleanLogin,
            server: cleanServer,
            password,
            platform: 'mt5',
            magic: 0,
            quoteStreamingIntervalInSeconds: 2.5
          })
        });

        if (!createRes.ok) {
          const errData = await createRes.json().catch(() => ({}));
          const errMsg = errData.message || '';
          if (errMsg.toLowerCase().includes('password') || errMsg.toLowerCase().includes('auth')) {
            return {
              providerAccountId: '',
              login: cleanLogin,
              server: cleanServer,
              status: 'FAILED',
              message: 'Authentication failed. Broker rejected credentials.'
            };
          }
          if (errMsg.toLowerCase().includes('server')) {
            return {
              providerAccountId: '',
              login: cleanLogin,
              server: cleanServer,
              status: 'FAILED',
              message: `Broker server '${cleanServer}' was not recognized or is unreachable.`
            };
          }
          throw new Error(`MetaApi account creation error: ${errMsg || createRes.statusText}`);
        }

        const created = await createRes.json();
        providerAccountId = created.id;
      }

      // 2. Deploy account if not deployed
      await this.fetchWithTimeout(`${this.provisioningBaseUrl}/users/current/accounts/${providerAccountId}/deploy`, {
        method: 'POST',
        headers
      }).catch(() => {});

      // 3. Poll connection status to ensure terminal connects and authenticates
      let pollCount = 0;
      let isConnectedToBroker = false;

      while (pollCount < 6) {
        pollCount++;
        await new Promise(r => setTimeout(r, 2000));

        const statusRes = await this.fetchWithTimeout(`${this.provisioningBaseUrl}/users/current/accounts/${providerAccountId}`, {
          method: 'GET',
          headers
        });

        if (statusRes.ok) {
          const accountDoc = await statusRes.json();

          if (accountDoc.connectionStatus === 'CONNECTED') {
            isConnectedToBroker = true;
            break;
          }

          if (accountDoc.connectionStatus === 'DISCONNECTED') {
            const reason = (accountDoc.stateReason || accountDoc.disconnectedReason || '').toLowerCase();
            if (reason.includes('password') || reason.includes('auth') || reason.includes('invalid credentials')) {
              return {
                providerAccountId,
                login: cleanLogin,
                server: cleanServer,
                status: 'FAILED',
                message: 'Authentication failed: Invalid login number or password for this MT5 server.'
              };
            }
            if (reason.includes('server') || reason.includes('network') || reason.includes('unreachable')) {
              return {
                providerAccountId,
                login: cleanLogin,
                server: cleanServer,
                status: 'FAILED',
                message: `Server invalid: Broker server '${cleanServer}' failed connection.`
              };
            }
          }
        }
      }

      if (!isConnectedToBroker) {
        return {
          providerAccountId,
          login: cleanLogin,
          server: cleanServer,
          status: 'CONNECTING',
          message: 'Connection timed out waiting for MT5 broker terminal response.'
        };
      }

      // 4. Fetch actual account information to verify returned server & login match
      const infoRes = await this.fetchWithTimeout(
        `${this.clientBaseUrl}/users/current/accounts/${providerAccountId}/account-information`,
        { method: 'GET', headers }
      );

      let broker: string | undefined;

      if (infoRes.ok) {
        const rawInfo = await infoRes.json();
        const returnedLogin = String(rawInfo.login || '').trim();
        const returnedServer = String(rawInfo.server || '').trim();

        if (returnedLogin && returnedLogin !== cleanLogin) {
          return {
            providerAccountId,
            login: cleanLogin,
            server: cleanServer,
            status: 'FAILED',
            message: `Identity mismatch: Requested login ${cleanLogin} but provider authenticated login ${returnedLogin}.`
          };
        }

        if (returnedServer && returnedServer.toLowerCase() !== cleanServer.toLowerCase()) {
          return {
            providerAccountId,
            login: cleanLogin,
            server: cleanServer,
            status: 'FAILED',
            message: `Identity mismatch: Requested server ${cleanServer} but provider authenticated ${returnedServer}.`
          };
        }

        broker = rawInfo.broker || rawInfo.company || undefined;
      }

      return {
        providerAccountId,
        login: cleanLogin,
        server: cleanServer,
        broker,
        status: 'CONNECTED',
        message: `Successfully connected to ${cleanServer} (${broker || 'Broker'} - Account ${cleanLogin}).`
      };
    } catch (err: any) {
      console.error('MetaApi connect error:', err);
      const isTimeout = err?.message?.includes('TIMEOUT');
      return {
        providerAccountId: '',
        login: cleanLogin,
        server: cleanServer,
        status: isTimeout ? 'CONNECTING' : 'FAILED',
        message: err?.message || 'Error communicating with MT5 provider'
      };
    }
  }

  /**
   * Fetch live account metrics directly from provider
   */
  async getAccountInfo(providerAccountId: string): Promise<{
    login: string;
    server: string;
    broker?: string;
    currency?: string;
    balance: number;
    equity: number;
    margin?: number;
    freeMargin?: number;
    marginLevel?: number;
    leverage?: number;
    credit?: number;
  }> {
    if (!this.isConfigured()) {
      throw new Error('MT5_CONNECTOR_NOT_CONFIGURED: MT5 provider is not configured.');
    }

    const headers = this.getHeaders();
    const res = await this.fetchWithTimeout(
      `${this.clientBaseUrl}/users/current/accounts/${providerAccountId}/account-information`,
      { method: 'GET', headers }
    );

    if (!res.ok) {
      throw new Error(`MT5_ACCOUNT_DATA_UNAVAILABLE: Failed to get live account information (${res.statusText})`);
    }

    const raw = await res.json();
    const balance = typeof raw.balance === 'number' ? raw.balance : 0;
    const equity = typeof raw.equity === 'number' ? raw.equity : balance;

    return {
      login: String(raw.login),
      server: String(raw.server),
      broker: raw.broker || raw.company || undefined,
      currency: raw.currency || undefined,
      balance,
      equity,
      margin: typeof raw.margin === 'number' ? raw.margin : undefined,
      freeMargin: typeof raw.freeMargin === 'number' ? raw.freeMargin : undefined,
      marginLevel: typeof raw.marginLevel === 'number' ? raw.marginLevel : undefined,
      leverage: typeof raw.leverage === 'number' ? raw.leverage : undefined,
      credit: typeof raw.credit === 'number' ? raw.credit : undefined
    };
  }

  /**
   * Fetch actual live open positions from MT5
   */
  async getOpenPositions(providerAccountId: string): Promise<MT5OpenPosition[]> {
    if (!this.isConfigured()) {
      const err = new Error('MT5_CONNECTOR_NOT_CONFIGURED: MT5 provider is not configured.');
      (err as any).errorCode = 'MT5_CONNECTOR_NOT_CONFIGURED';
      throw err;
    }

    try {
      const headers = this.getHeaders();
      const res = await this.fetchWithTimeout(
        `${this.clientBaseUrl}/users/current/accounts/${providerAccountId}/positions`,
        { method: 'GET', headers }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = new Error(errData.message || `Failed to fetch open positions from provider (status ${res.status})`);
        (err as any).errorCode = 'MT5_POSITION_FETCH_FAILED';
        throw err;
      }

      const rawPositions: any[] = await res.json();
      if (!Array.isArray(rawPositions)) {
        return [];
      }

      return rawPositions.map((p: any) => ({
        id: String(p.id),
        symbol: p.symbol || 'Unknown',
        mappedMarket: p.symbol || 'Unknown',
        direction: (p.type === 'POSITION_TYPE_BUY' || p.type === 'BUY' || p.type === 0) ? 'BUY' : 'SELL',
        volume: Number(p.volume) || 0,
        openPrice: Number(p.openPrice) || 0,
        currentPrice: Number(p.currentPrice) || Number(p.openPrice) || 0,
        sl: typeof p.sl === 'number' ? p.sl : null,
        tp: typeof p.tp === 'number' ? p.tp : null,
        pnl: typeof p.profit === 'number' ? p.profit : (typeof p.unrealizedProfit === 'number' ? p.unrealizedProfit : 0),
        swap: typeof p.swap === 'number' ? p.swap : 0,
        commission: typeof p.commission === 'number' ? p.commission : 0,
        openTime: p.time ? new Date(p.time).getTime() : Date.now(),
        comment: p.comment || undefined
      }));
    } catch (err: any) {
      if (err.errorCode === 'MT5_POSITION_FETCH_FAILED' || err.errorCode === 'MT5_CONNECTOR_NOT_CONFIGURED') {
        throw err;
      }
      const wrapped = new Error(`MT5_POSITION_FETCH_FAILED: ${err?.message || 'Error communicating with MT5 terminal'}`);
      (wrapped as any).errorCode = 'MT5_POSITION_FETCH_FAILED';
      throw wrapped;
    }
  }

  /**
   * Fetch genuine closed trades / deals from MT5 history
   */
  async getClosedTrades(providerAccountId: string, from: number, to: number): Promise<MT5CompletedTrade[]> {
    if (!this.isConfigured()) return [];

    try {
      const headers = this.getHeaders();
      const startTime = new Date(from).toISOString();
      const endTime = new Date(to).toISOString();

      const res = await this.fetchWithTimeout(
        `${this.clientBaseUrl}/users/current/accounts/${providerAccountId}/history-deals/time/${encodeURIComponent(startTime)}/${encodeURIComponent(endTime)}`,
        { method: 'GET', headers }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const err = new Error(errData.message || `Failed to fetch history deals from provider (status ${res.status})`);
        (err as any).errorCode = 'MT5_SYNC_FAILED';
        throw err;
      }

      const data = await res.json();
      const deals: any[] = Array.isArray(data) ? data : (data.deals || []);

      // Filter only closing or realized deals (DEAL_ENTRY_OUT or with realized profit)
      const closedDeals = deals.filter((d: any) => 
        d.entryType === 'DEAL_ENTRY_OUT' || 
        d.entryType === 'OUT' || 
        (typeof d.profit === 'number' && d.profit !== 0)
      );

      return closedDeals.map((d: any) => {
        const pnl = Number(d.profit) || 0;
        const result: 'WIN' | 'LOSS' | 'BREAK EVEN' = 
          pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BREAK EVEN');

        const dealTime = d.time ? new Date(d.time).getTime() : Date.now();
        const openTime = d.openTime ? new Date(d.openTime).getTime() : dealTime;
        const durationSeconds = Math.max(0, Math.floor((dealTime - openTime) / 1000));
        const ticketId = String(d.id || d.positionId);
        const positionId = String(d.positionId || d.id);
        const orderId = String(d.orderId || d.id);

        return {
          externalTradeId: ticketId,
          sourceTradeKey: `${this.name}:${providerAccountId}:${positionId}:${ticketId}`,
          provider: this.name,
          providerAccountId,
          providerTradeId: ticketId,
          mt5AccountId: providerAccountId,
          mt5DealId: ticketId,
          mt5OrderId: orderId,
          mt5PositionId: positionId,
          broker: d.broker || 'MT5 Broker',
          brokerServer: d.server || 'MT5 Server',
          symbol: d.symbol || 'Instrument',
          rawSymbol: d.symbol || 'Instrument',
          mappedMarket: d.symbol || 'Instrument',
          direction: (d.type === 'DEAL_TYPE_BUY' || d.type === 'BUY' || d.type === 0) ? 'BUY' : 'SELL',
          entryPrice: Number(d.price) || 0,
          exitPrice: Number(d.price) || 0,
          volume: Number(d.volume) || 0,
          openTime,
          closeTime: dealTime,
          openTimeUtc: openTime,
          closeTimeUtc: dealTime,
          brokerTimezone: d.brokerTimezone || undefined,
          durationSeconds,
          pnl,
          commission: Number(d.commission) || 0,
          swap: Number(d.swap) || 0,
          stopLoss: typeof d.stopLoss === 'number' ? d.stopLoss : null,
          takeProfit: typeof d.takeProfit === 'number' ? d.takeProfit : null,
          riskAmount: typeof d.riskAmount === 'number' ? d.riskAmount : null,
          rMultiple: null,
          result,
          comment: d.comment || undefined
        };
      });
    } catch (err: any) {
      if (err.errorCode) throw err;
      const wrapped = new Error(`MT5_SYNC_FAILED: ${err?.message || 'Failed to fetch historical closed trades'}`);
      (wrapped as any).errorCode = 'MT5_SYNC_FAILED';
      throw wrapped;
    }
  }

  /**
   * Check connection status
   */
  async getConnectionStatus(providerAccountId: string): Promise<{
    connected: boolean;
    status: string;
    message?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        connected: false,
        status: 'NOT_CONFIGURED',
        message: 'MT5 connector is not configured on server.'
      };
    }

    try {
      const headers = this.getHeaders();
      const res = await this.fetchWithTimeout(
        `${this.provisioningBaseUrl}/users/current/accounts/${providerAccountId}`,
        { method: 'GET', headers },
        6000
      );

      if (!res.ok) {
        return {
          connected: false,
          status: 'PROVIDER_ERROR',
          message: 'Unable to check provider account status.'
        };
      }

      const account = await res.json();
      const isConnected = account.connectionStatus === 'CONNECTED';
      return {
        connected: isConnected,
        status: isConnected ? 'CONNECTED' : (account.state === 'DEPLOYED' ? 'CONNECTING' : 'DISCONNECTED'),
        message: isConnected ? 'Connected to MT5 broker terminal' : 'Terminal disconnected from broker'
      };
    } catch (err: any) {
      return {
        connected: false,
        status: 'PROVIDER_ERROR',
        message: err?.message || 'Error querying provider status'
      };
    }
  }

  /**
   * Disconnect and undeploy account
   */
  async disconnect(providerAccountId: string): Promise<void> {
    if (!this.isConfigured()) return;
    try {
      const headers = this.getHeaders();
      await this.fetchWithTimeout(
        `${this.provisioningBaseUrl}/users/current/accounts/${providerAccountId}/undeploy`,
        { method: 'POST', headers }
      );
    } catch (err) {
      console.warn('MetaApi undeploy notice:', err);
    }
  }

  /**
   * Find existing provider account ID by MT5 login and server
   */
  async findProviderAccountByLoginAndServer(login: string, server?: string): Promise<{ id: string; login: string; server: string } | null> {
    if (!this.isConfigured() || !login) return null;
    try {
      const headers = this.getHeaders();
      const res = await this.fetchWithTimeout(`${this.provisioningBaseUrl}/users/current/accounts`, {
        method: 'GET',
        headers
      }, 8000);
      if (res.ok) {
        const accounts: any[] = await res.json();
        const matched = accounts.find((a: any) => {
          const matchLogin = String(a.login) === String(login);
          if (!server) return matchLogin;
          const aServer = String(a.server || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const sServer = String(server).toLowerCase().replace(/[^a-z0-9]/g, '');
          return matchLogin && (aServer.includes(sServer) || sServer.includes(aServer));
        });
        if (matched && matched.id) {
          return { id: matched.id, login: matched.login, server: matched.server };
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  /**
   * Verify server reachability via provider
   * NEVER returns fake latency = 24 or fake reachable = true!
   */
  async verifyServer(server: string): Promise<{
    verified: boolean;
    status: 'VERIFIED' | 'NOT_VERIFIED' | 'INVALID';
    message: string;
    latencyMs?: number;
  }> {
    if (!server || !server.trim()) {
      return {
        verified: false,
        status: 'INVALID',
        message: 'Broker server name is required.'
      };
    }

    const clean = server.trim();

    if (!this.isConfigured()) {
      return {
        verified: false,
        status: 'NOT_VERIFIED',
        message: `Provider not configured. Server reachability for '${clean}' cannot be verified until META_API_TOKEN is set.`
      };
    }

    try {
      const startTime = Date.now();
      const headers = this.getHeaders();
      const res = await this.fetchWithTimeout(
        `${this.provisioningBaseUrl}/users/current/servers?query=${encodeURIComponent(clean)}`,
        { method: 'GET', headers },
        5000
      );

      const latencyMs = Date.now() - startTime;

      if (res.ok) {
        const servers = await res.json();
        const found = Array.isArray(servers) && servers.some((s: any) => 
          (s.name || s).toLowerCase().includes(clean.toLowerCase())
        );

        if (found) {
          return {
            verified: true,
            status: 'VERIFIED',
            message: `MT5 server '${clean}' recognized by provider gateway.`,
            latencyMs
          };
        }
      }

      return {
        verified: false,
        status: 'NOT_VERIFIED',
        message: `Server reachability for '${clean}' cannot be verified prior to full credential authentication.`
      };
    } catch {
      return {
        verified: false,
        status: 'NOT_VERIFIED',
        message: `MT5 server check could not verify '${clean}'. Connect will validate credentials directly.`
      };
    }
  }
}

export const metaApiProvider = new MetaApiProvider();
