import { HistoricalQuoteRequest, HistoricalQuoteResult } from '../types/marketData';

// In-memory cache for historical quotes (5-minute TTL)
interface CacheEntry {
  result: HistoricalQuoteResult;
  expiresAt: number;
}
const quoteCache = new Map<string, CacheEntry>();

// Map common TradeVault market names to upstream API tickers
const BINANCE_MAP: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'BTCUSD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'ETHUSD': 'ETHUSDT',
  'SOL/USD': 'SOLUSDT',
  'SOLUSD': 'SOLUSDT',
  'XRP/USD': 'XRPUSDT',
  'XRPUSD': 'XRPUSDT',
  'DOGE/USD': 'DOGEUSDT'
};

const YAHOO_MAP: Record<string, { ticker: string; spread: number; isForexOrMetal: boolean }> = {
  // Forex Majors & Crosses (spread in price units)
  'EUR/USD': { ticker: 'EURUSD=X', spread: 0.00012, isForexOrMetal: true },
  'GBP/USD': { ticker: 'GBPUSD=X', spread: 0.00015, isForexOrMetal: true },
  'USD/JPY': { ticker: 'USDJPY=X', spread: 0.015, isForexOrMetal: true },
  'USD/CAD': { ticker: 'USDCAD=X', spread: 0.00018, isForexOrMetal: true },
  'USD/CHF': { ticker: 'USDCHF=X', spread: 0.00018, isForexOrMetal: true },
  'AUD/USD': { ticker: 'AUDUSD=X', spread: 0.00015, isForexOrMetal: true },
  'NZD/USD': { ticker: 'NZDUSD=X', spread: 0.00018, isForexOrMetal: true },
  'EUR/GBP': { ticker: 'EURGBP=X', spread: 0.00015, isForexOrMetal: true },
  'EUR/JPY': { ticker: 'EURJPY=X', spread: 0.018, isForexOrMetal: true },
  'GBP/JPY': { ticker: 'GBPJPY=X', spread: 0.022, isForexOrMetal: true },

  // Metals
  'XAU/USD': { ticker: 'GC=F', spread: 0.25, isForexOrMetal: true }, // Gold futures / spot
  'XAG/USD': { ticker: 'SI=F', spread: 0.02, isForexOrMetal: true }, // Silver

  // Indices
  'NAS100': { ticker: 'NQ=F', spread: 1.0, isForexOrMetal: false }, // Nasdaq
  'US30': { ticker: 'YM=F', spread: 2.0, isForexOrMetal: false }, // Dow
  'SPX500': { ticker: 'ES=F', spread: 0.5, isForexOrMetal: false }, // S&P 500
  'GER40': { ticker: '^GDAXI', spread: 1.5, isForexOrMetal: false },
  'UK100': { ticker: '^FTSE', spread: 1.0, isForexOrMetal: false },

  // Commodities
  'WTI': { ticker: 'CL=F', spread: 0.04, isForexOrMetal: false },
  'USOIL': { ticker: 'CL=F', spread: 0.04, isForexOrMetal: false }
};

/**
 * Checks if a given timestamp falls during standard forex/equity weekend closures
 * Forex closes Friday 21:00 UTC and reopens Sunday 21:00 UTC
 */
function isWeekendClosure(timestamp: number): boolean {
  const d = new Date(timestamp);
  const day = d.getUTCDay(); // 0 is Sunday, 6 is Saturday
  const hour = d.getUTCHours();
  
  if (day === 6) return true; // All Saturday
  if (day === 5 && hour >= 21) return true; // Friday after 21:00 UTC
  if (day === 0 && hour < 21) return true; // Sunday before 21:00 UTC
  return false;
}

/**
 * Clean Market Data Adapter Layer
 */
export async function getHistoricalQuote(request: HistoricalQuoteRequest): Promise<HistoricalQuoteResult> {
  const { symbol, timestamp, direction = 'BUY', timezone = 'UTC' } = request;
  const cleanSymbol = symbol.trim().toUpperCase();
  const cacheKey = `${cleanSymbol}_${Math.floor(timestamp / 60000)}_${direction}`;

  // Check cache
  const cached = quoteCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  // 1. Check if crypto -> Binance public API
  const binancePair = BINANCE_MAP[cleanSymbol] || BINANCE_MAP[cleanSymbol.replace('/', '')];
  if (binancePair) {
    try {
      // Query 1m candle nearest to timestamp
      const startTime = timestamp - 60000;
      const url = `https://api.binance.com/api/v3/klines?symbol=${binancePair}&interval=1m&startTime=${startTime}&limit=3`;
      const res = await fetch(url);
      if (res.ok) {
        const klines = await res.json();
        if (Array.isArray(klines) && klines.length > 0) {
          // Find closest candle by open time
          let closest = klines[0];
          let minDiff = Math.abs(klines[0][0] - timestamp);
          for (const k of klines) {
            const diff = Math.abs(k[0] - timestamp);
            if (diff < minDiff) {
              minDiff = diff;
              closest = k;
            }
          }

          const candleOpenTime = closest[0];
          const open = parseFloat(closest[1]);
          const high = parseFloat(closest[2]);
          const low = parseFloat(closest[3]);
          const close = parseFloat(closest[4]);
          const last = close;

          // Estimate standard crypto spread (~0.02% or min tick)
          const estSpread = Math.max(0.01, last * 0.0002);
          const bid = Number((last - estSpread / 2).toFixed(4));
          const ask = Number((last + estSpread / 2).toFixed(4));
          const suggestedEntry = direction === 'BUY' ? ask : bid;

          const offsetSeconds = Math.round(Math.abs(candleOpenTime - timestamp) / 1000);
          const exactMatch = offsetSeconds <= 60;

          const result: HistoricalQuoteResult = {
            symbol: cleanSymbol,
            timestampRequested: timestamp,
            timestampUsed: candleOpenTime,
            timezone,
            bid,
            ask,
            last,
            suggestedEntry,
            source: 'Binance Public Market Feed (1m candle)',
            exactMatch,
            offsetSeconds,
            isMarketClosed: false,
            formattedTimeRequested: new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            formattedTimeUsed: new Date(candleOpenTime).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
          };

          quoteCache.set(cacheKey, { result, expiresAt: Date.now() + 5 * 60 * 1000 });
          return result;
        }
      }
    } catch (binanceErr) {
      console.warn('Binance quote fetch failed:', binanceErr);
    }
  }

  // 2. Forex / Metals / Indices / Commodities via Yahoo Finance Chart API
  const yahooInfo = YAHOO_MAP[cleanSymbol] || YAHOO_MAP[cleanSymbol.replace('/', '')];
  if (yahooInfo) {
    const isClosed = yahooInfo.isForexOrMetal && isWeekendClosure(timestamp);
    const startSec = Math.floor((timestamp - 1800000) / 1000); // 30m window
    const endSec = Math.floor((timestamp + 1800000) / 1000);

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooInfo.ticker)}?interval=1m&period1=${startSec}&period2=${endSec}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 TradeVault/2.0' } });
      
      if (res.ok) {
        const data = await res.json();
        const resultItem = data?.chart?.result?.[0];
        const timestamps = resultItem?.timestamp as number[] | undefined;
        const quotes = resultItem?.indicators?.quote?.[0];

        if (timestamps && timestamps.length > 0 && quotes?.close) {
          const closes = quotes.close as (number | null)[];
          const requestedSec = Math.floor(timestamp / 1000);

          let bestIdx = 0;
          let bestDiff = Infinity;
          for (let i = 0; i < timestamps.length; i++) {
            if (closes[i] !== null && closes[i] !== undefined && !isNaN(closes[i]!)) {
              const diff = Math.abs(timestamps[i] - requestedSec);
              if (diff < bestDiff) {
                bestDiff = diff;
                bestIdx = i;
              }
            }
          }

          const usedTimestampMs = timestamps[bestIdx] * 1000;
          const closePrice = closes[bestIdx]!;
          const offsetSeconds = Math.round(Math.abs(usedTimestampMs - timestamp) / 1000);
          const exactMatch = offsetSeconds <= 60 && !isClosed;

          const spread = yahooInfo.spread;
          const bid = Number((closePrice - spread / 2).toFixed(cleanSymbol.includes('JPY') ? 3 : 5));
          const ask = Number((closePrice + spread / 2).toFixed(cleanSymbol.includes('JPY') ? 3 : 5));
          const suggestedEntry = direction === 'BUY' ? ask : bid;

          const result: HistoricalQuoteResult = {
            symbol: cleanSymbol,
            timestampRequested: timestamp,
            timestampUsed: usedTimestampMs,
            timezone,
            bid,
            ask,
            last: closePrice,
            suggestedEntry,
            source: 'Institutional Market Feed (' + yahooInfo.ticker + ')',
            exactMatch,
            offsetSeconds,
            isMarketClosed: isClosed,
            marketStatusMessage: isClosed ? 'Market closed at selected time (using nearest valid price)' : undefined,
            formattedTimeRequested: new Date(timestamp).toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            formattedTimeUsed: new Date(usedTimestampMs).toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
          };

          quoteCache.set(cacheKey, { result, expiresAt: Date.now() + 5 * 60 * 1000 });
          return result;
        }
      }
    } catch (yahooErr) {
      console.warn('Yahoo quote fetch error:', yahooErr);
    }
  }

  // 3. Fallback: If exact historical minute is unavailable or symbol is unmapped,
  // DO NOT invent a fake price. Return an honest error so the user is never misled.
  const err = new Error(`Historical market price is unavailable for ${cleanSymbol} at the selected timestamp.`);
  (err as any).status = 404;
  throw err;
}
