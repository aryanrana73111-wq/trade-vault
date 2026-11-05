import { 
  MT5OpenPosition,
  MT5CompletedTrade
} from '../../../types/mt5';

/**
 * REAL MT5 PROVIDER CONTRACT
 * This is an architectural contract.
 * Do not fake implementations behind these methods.
 */
export interface MT5Provider {
  readonly name: string;

  /**
   * Whether the external provider credentials (API token, gateway key) are configured
   */
  isConfigured?(): boolean;

  /**
   * Verify server reachability via provider
   */
  verifyServer?(
    server: string
  ): Promise<{
    verified: boolean;
    status: 'VERIFIED' | 'NOT_VERIFIED' | 'INVALID';
    message: string;
    latencyMs?: number;
  }>;

  connect(input: {
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
  }>;

  getAccountInfo(providerAccountId: string): Promise<{
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
  }>;

  getOpenPositions(
    providerAccountId: string
  ): Promise<MT5OpenPosition[]>;

  getClosedTrades(
    providerAccountId: string,
    from: number,
    to: number
  ): Promise<MT5CompletedTrade[]>;

  getConnectionStatus(
    providerAccountId: string
  ): Promise<{
    connected: boolean;
    status: string;
    message?: string;
  }>;

  disconnect(
    providerAccountId: string
  ): Promise<void>;
}
