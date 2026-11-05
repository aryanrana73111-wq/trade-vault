export interface HistoricalQuoteRequest {
  symbol: string;
  timestamp: number; // Unix timestamp in ms
  direction?: 'BUY' | 'SELL';
  timezone?: string;
}

export interface HistoricalQuoteResult {
  symbol: string;
  timestampRequested: number;
  timestampUsed: number;
  timezone: string;
  bid: number | null;
  ask: number | null;
  last: number | null;
  suggestedEntry: number | null;
  source: string;
  exactMatch: boolean;
  offsetSeconds: number;
  isMarketClosed: boolean;
  marketStatusMessage?: string;
  formattedTimeRequested?: string;
  formattedTimeUsed?: string;
}
