export type MT5ConnectionType = 'demo' | 'live';
export type MT5ConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error';

export interface MT5AccountCredentials {
  broker: string;
  server: string;
  accountNumber: string;
  investorPassword?: string;
  connectionType: MT5ConnectionType;
  readOnly: boolean;
  label?: string;
}

export interface MT5AccountInfo {
  accountNumber: string;
  broker: string;
  server: string;
  name?: string;
  currency: string;
  balance: number;
  equity: number;
  margin?: number;
  freeMargin?: number;
  marginLevel?: number;
  leverage: number;
  credit?: number;
  openPositionsCount: number;
  completedTradesCount: number;
  isConnected: boolean;
  connectionType: MT5ConnectionType;
  lastUpdated: number;
}

export interface MT5OpenPosition {
  id: string; // Ticket / Position ID
  symbol: string;
  mappedMarket: string;
  direction: 'BUY' | 'SELL';
  volume: number; // Lots
  openPrice: number;
  currentPrice: number;
  sl?: number;
  tp?: number;
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

export interface MT5CompletedTrade {
  externalTradeId: string; // Position ID or Deal ID
  mt5AccountId: string;
  broker: string;
  brokerServer: string;
  symbol: string;
  mappedMarket: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  volume: number; // Lots
  openTime: number; // UTC ms
  closeTime: number; // UTC ms
  durationSeconds: number;
  pnl: number; // Realized P&L
  commission: number;
  swap: number;
  stopLoss?: number;
  takeProfit?: number;
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
  totalProcessed: number;
  errors: string[];
  importedTrades?: MT5CompletedTrade[];
}

export interface ConnectedTradingAccount {
  id: string; // Unique ID in TradeVault
  userId: string;
  accountNumber: string; // Display masked e.g. "****1234"
  rawAccountId?: string; // Hashed or masked identifier
  accountName: string; // User-defined label e.g. "FTMO 100k Challenge"
  broker: string; // e.g. "IC Markets"
  server: string; // e.g. "ICMarketsSC-Live01"
  connectionType: MT5ConnectionType;
  status: MT5ConnectionStatus;
  statusMessage?: string;
  readOnly: boolean; // Always true
  currency: string;
  balance: number;
  equity: number;
  leverage?: number;
  openPositionsCount: number;
  completedTradesCount: number;
  lastSyncAt?: number;
  lastSyncResult?: {
    imported: number;
    updated: number;
    duplicates: number;
    skipped: number;
    syncedAt: number;
    error?: string;
  };
  autoSyncIntervalMinutes?: number; // 0 = manual only, 5, 15, 30, 60
  targetDashboardId?: string; // Which journal dashboard this syncs to
  createdAt: number;
  updatedAt: number;
}
