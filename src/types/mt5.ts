export type MT5ConnectionType = 'demo' | 'live';
export type MT5ConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error' | 'not_configured';

export type MT5ConnectionState =
  | 'CONNECTING'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'AUTH_FAILED'
  | 'SERVER_INVALID'
  | 'SERVER_ERROR'
  | 'PROVIDER_ERROR'
  | 'SYNC_ERROR'
  | 'NOT_CONFIGURED';

export type MT5ErrorCode =
  | 'MT5_AUTH_FAILED'
  | 'MT5_SERVER_INVALID'
  | 'MT5_ACCOUNT_NOT_FOUND'
  | 'MT5_ACCOUNT_DISABLED'
  | 'MT5_PROVIDER_UNAVAILABLE'
  | 'MT5_CONNECTION_TIMEOUT'
  | 'MT5_IDENTITY_MISMATCH'
  | 'MT5_ACCOUNT_DATA_UNAVAILABLE'
  | 'MT5_SYNC_FAILED'
  | 'MT5_CONNECTOR_NOT_CONFIGURED'
  | 'MT5_POSITION_FETCH_FAILED'
  | 'MT5_CREATION_UNSUPPORTED'
  | 'MT5_CREATION_FAILED';

export const MT5_ERROR_MESSAGES: Record<MT5ErrorCode, string> = {
  MT5_AUTH_FAILED: 'Authentication failed. Please verify your MT5 login, password, and broker server.',
  MT5_SERVER_INVALID: 'Broker server could not be resolved or is invalid. Check the exact server name provided by your broker.',
  MT5_ACCOUNT_NOT_FOUND: 'The specified MT5 account was not found on this broker server.',
  MT5_ACCOUNT_DISABLED: 'This MT5 account has been disabled or archived by your broker.',
  MT5_PROVIDER_UNAVAILABLE: 'The MT5 cloud provider gateway is temporarily unavailable. Please retry in a moment.',
  MT5_CONNECTION_TIMEOUT: 'Connection to the MT5 broker terminal timed out. Please check your network and broker status.',
  MT5_IDENTITY_MISMATCH: 'Account identity mismatch. The broker returned account details that do not match the requested credentials.',
  MT5_ACCOUNT_DATA_UNAVAILABLE: 'Unable to retrieve live balance or account metrics from the broker terminal.',
  MT5_SYNC_FAILED: 'Failed to synchronize historical trades from the MT5 server.',
  MT5_CONNECTOR_NOT_CONFIGURED: 'MT5 connector is not configured. Configure META_API_TOKEN or MT5_API_KEY in the server environment.',
  MT5_POSITION_FETCH_FAILED: 'Failed to fetch live open positions from the MT5 broker terminal.',
  MT5_CREATION_UNSUPPORTED: 'Account creation is not supported for this broker via automated API. Please register on the official broker portal.',
  MT5_CREATION_FAILED: 'The broker provisioning service rejected the account creation request.'
};

export interface MT5AccountCredentials {
  broker?: string;
  server: string;
  accountNumber: string;
  investorPassword?: string;
  connectionType?: MT5ConnectionType;
  readOnly?: boolean;
  label?: string;
  startingBalance?: number;
  challengeStartingBalance?: number;
  initialSyncPeriod?: string;
  firebaseUid?: string;
}

export interface MT5AccountInfo {
  accountNumber: string;
  broker: string | null;
  server: string;
  company?: string | null;
  name?: string | null;
  currency: string | null;
  challengeStartingBalance?: number | null;
  startingBalance?: number | null;
  balance: number;
  equity: number;
  liveMt5Balance?: number;
  liveMt5Equity?: number;
  margin?: number | null;
  freeMargin?: number | null;
  marginLevel?: number | null;
  leverage?: number | null;
  credit?: number | null;
  tradeMode?: string | null;
  openPositionsCount: number;
  completedTradesCount: number;
  isConnected: boolean;
  connectionStatus?: MT5ConnectionState;
  connectionType: MT5ConnectionType;
  lastUpdated: number;
  connectionIdentity?: {
    uid?: string;
    firebaseUid?: string;
    provider?: string;
    providerAccountId?: string;
    mt5LoginId?: string;
    mt5Login?: string;
    mt5Server: string;
    mt5AccountId: string;
    platform?: 'mt5';
  };
}

export interface MT5OpenPosition {
  id: string; // Ticket / Position ID
  symbol: string;
  mappedMarket: string;
  direction: 'BUY' | 'SELL';
  volume: number; // Lots
  openPrice: number;
  currentPrice: number;
  sl?: number | null;
  tp?: number | null;
  pnl: number; // Floating profit/loss
  swap: number;
  commission?: number;
  openTime: number; // UTC ms
  comment?: string;
}

export interface MT5DealRecord {
  id: string; // Deal ID
  positionId: string; // Grouping ID
  orderId?: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entryType: 'IN' | 'OUT' | 'INOUT';
  volume: number; // Lots
  price: number;
  pnl: number;
  commission: number;
  swap: number;
  time: number; // UTC ms
  sl?: number;
  tp?: number;
  comment?: string;
}

export interface MT5ValidationError {
  tradeTicket?: string;
  field: string;
  reason: string;
}

export interface MT5CompletedTrade {
  externalTradeId: string; // Position ID or Deal ID
  sourceTradeKey?: string; // Composite: provider:providerAccountId:positionId:dealId
  provider?: string;
  providerAccountId?: string;
  providerTradeId?: string;
  mt5AccountId: string;
  mt5DealId?: string;
  mt5OrderId?: string;
  mt5PositionId?: string;
  broker: string;
  brokerServer: string;
  symbol: string;
  rawSymbol?: string;
  mappedMarket: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  volume: number; // Lots
  openTime: number; // UTC ms
  closeTime: number; // UTC ms
  openTimeUtc?: number;
  closeTimeUtc?: number;
  brokerTimezone?: string;
  durationSeconds: number;
  pnl: number; // Realized P&L
  commission: number;
  swap: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  riskAmount?: number | null;
  rMultiple?: number | null;
  result: 'WIN' | 'LOSS' | 'BREAK EVEN';
  comment?: string;
}

export interface MT5SyncPeriod {
  type: '7d' | '30d' | '90d' | '1y' | 'custom' | 'all';
  fromTimestamp?: number;
  toTimestamp?: number;
}

export interface MT5SyncResult {
  accountId: string;
  brokerServer: string;
  syncedAt: number;
  period: string;
  imported: number;
  updated: number;
  duplicates: number;
  skipped: number;
  failed?: number;
  totalProcessed: number;
  errors: string[];
  validationErrors?: MT5ValidationError[];
  importedTrades?: MT5CompletedTrade[];
}

export interface ConnectedTradingAccount {
  id: string; // Unique ID in TradeVault
  userId: string;
  provider: string; // e.g. 'metaapi'
  providerAccountId: string;
  accountNumber: string; // Display masked e.g. "****1234"
  rawAccountId?: string;
  accountName: string;
  broker: string;
  server: string;
  connectionType: MT5ConnectionType;
  status: MT5ConnectionStatus;
  connectionState?: MT5ConnectionState;
  statusMessage?: string;
  readOnly: boolean; // Always true
  currency: string;
  challengeStartingBalance?: number | null; // Metadata only
  startingBalance?: number; // Backward compatibility / metadata
  liveMt5Balance: number; // Actual live MT5 balance from provider
  liveMt5Equity: number; // Actual live MT5 equity from provider
  balance: number; // Authoritative live MT5 balance
  equity: number; // Authoritative live MT5 equity
  margin?: number | null;
  freeMargin?: number | null;
  marginLevel?: number | null;
  leverage?: number | null;
  credit?: number | null;
  tradeMode?: string | null;
  openPositionsCount: number;
  completedTradesCount: number;
  connectionIdentity?: {
    uid: string;
    firebaseUid?: string;
    provider: string;
    providerAccountId: string;
    mt5LoginId?: string;
    mt5Login: string;
    mt5Server: string;
    mt5AccountId: string;
    platform: 'mt5';
  };
  lastSyncAt?: number;
  lastSyncResult?: {
    imported: number;
    updated: number;
    duplicates: number;
    skipped: number;
    syncedAt: number;
    error?: string;
  };
  autoSyncIntervalMinutes?: number;
  targetDashboardId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MT5ConnectInput {
  uid: string;
  login: string;
  password?: string;
  server: string;
  platform?: 'mt5';
  readOnly?: boolean;
  challengeStartingBalance?: number;
  startingBalance?: number;
  label?: string;
  broker?: string;
  connectionType?: MT5ConnectionType;
}

export interface MT5ConnectionResult {
  connected: boolean;
  status: MT5ConnectionState;
  provider: string;
  providerAccountId: string;
  accountInfo: MT5AccountInfo;
  message?: string;
  errorCode?: MT5ErrorCode;
}

export interface BrokerCapabilities {
  brokerId: string;
  brokerName: string;
  category: 'prop' | 'broker';
  mt5ConnectSupported: boolean;
  demoCreationSupported: boolean;
  liveCreationSupported: boolean;
  requiresProvisioningProfile: boolean;
  provisioningProfileId?: string;
  verifiedAt: number;
  officialWebsiteUrl: string;
  demoRegistrationUrl?: string;
  liveRegistrationUrl?: string;
  notes?: string;
}

export interface MT5CreateDemoInput {
  brokerId: string;
  server?: string;
  balance?: number;
  deposit?: number;
  leverage?: number;
  currency?: string;
  name?: string;
  email?: string;
  accountType?: string;
}

export interface MT5CreateLiveInput {
  brokerId: string;
  server?: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  currency?: string;
  leverage?: number;
  accountType?: string;
}

export interface MT5CreatedAccountCredentials {
  login: string;
  password?: string;
  investorPassword?: string;
  server: string;
  platform: 'mt5';
  broker: string;
  currency?: string;
  balance?: number;
  leverage?: number;
  verificationStatus: 'READY' | 'NEEDS_VERIFICATION' | 'VERIFICATION_FAILED';
  verificationMessage?: string;
  providerAccountId?: string;
  createdAt: number;
}

export interface MT5CreationResult {
  success: boolean;
  status: 'CREATED' | 'READY' | 'NEEDS_VERIFICATION' | 'UNSUPPORTED' | 'FAILED';
  message: string;
  credentials?: MT5CreatedAccountCredentials;
  account?: ConnectedTradingAccount;
  brokerCapabilities?: BrokerCapabilities;
  errorCode?: MT5ErrorCode;
}

export interface MT5CreatedAccount {
  loginId: string;
  investorPassword: string;
  masterPassword?: string;
  server: string;
  brokerName: string;
  balance: number;
  currency: string;
  leverage: number;
}
