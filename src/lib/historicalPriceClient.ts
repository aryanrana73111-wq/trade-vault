import { auth } from './firebase';
import { HistoricalQuoteResult } from '../types/marketData';

export interface HistoricalPriceLookupParams {
  symbol: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  direction?: 'BUY' | 'SELL';
  timezone?: string;
}

export interface HistoricalPriceLookupResponse {
  success: boolean;
  quote?: HistoricalQuoteResult;
  suggestedPrice?: number;
  source?: string;
  isMarketClosed?: boolean;
  marketStatusMessage?: string;
  exactMatch?: boolean;
  offsetSeconds?: number;
  error?: string;
}

/**
 * Client service to request verified historical market prices
 */
export async function fetchHistoricalPrice(
  params: HistoricalPriceLookupParams
): Promise<HistoricalPriceLookupResponse> {
  const { symbol, date, time = '12:00', direction = 'BUY', timezone = 'UTC' } = params;

  if (!symbol || !date) {
    return { success: false, error: 'Symbol and Date are required.' };
  }

  // Parse to timestamp ms
  let timestampMs: number;
  try {
    const dateTimeStr = time ? `${date}T${time}:00Z` : `${date}T12:00:00Z`;
    timestampMs = new Date(dateTimeStr).getTime();
    if (isNaN(timestampMs)) {
      timestampMs = new Date(`${date}T12:00:00`).getTime();
    }
  } catch {
    return { success: false, error: 'Invalid date/time format.' };
  }

  try {
    const user = auth.currentUser;
    const token = user ? await user.getIdToken() : '';
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const query = new URLSearchParams({
      symbol: symbol.trim(),
      timestamp: timestampMs.toString(),
      direction,
      timezone
    });

    const res = await fetch(`/api/market-data/historical-quote?${query.toString()}`, { headers });
    const data = await res.json();

    if (!res.ok || !data.success || !data.quote) {
      return {
        success: false,
        error: data.error || 'Historical price unavailable for this market/time.'
      };
    }

    const q: HistoricalQuoteResult = data.quote;
    return {
      success: true,
      quote: q,
      suggestedPrice: q.suggestedEntry || q.last || q.bid || q.ask || undefined,
      source: q.source,
      isMarketClosed: q.isMarketClosed,
      marketStatusMessage: q.marketStatusMessage,
      exactMatch: q.exactMatch,
      offsetSeconds: q.offsetSeconds
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error fetching historical quote.'
    };
  }
}
