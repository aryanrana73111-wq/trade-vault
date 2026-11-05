import { NormalizedCandle } from '@/server/marketDataRoutes';

/**
 * Normalized Market Data Types
 */
export type Candle = {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

export type Quote = {
  symbol: string;
  bid?: number;
  ask?: number;
  last?: number;
  timestamp: number;
  source: string;
  status: 'Live' | 'Delayed' | 'Stale' | 'Offline' | 'Unavailable';
  delayNotice?: string;
  cfdNotice?: string;
};

export interface MarketDataProvider {
  getCandles(
    symbol: string,
    timeframe: string,
    from?: number,
    to?: number
  ): Promise<Candle[]>;

  getQuote(
    symbol: string
  ): Promise<Quote | null>;

  subscribeCandleStream?(
    symbol: string,
    timeframe: string,
    onCandle: (candle: Candle) => void,
    onStatusChange?: (status: string) => void
  ): () => void;
}

export interface MarketItem {
  id: string;
  symbol: string;
  displayName: string;
  category: 'Indices' | 'Forex' | 'Metals' | 'Crypto';
  provider: string;
  isDelayed?: boolean;
  delayNotice?: string;
  isCfd?: boolean;
  cfdNotice?: string;
  description: string;
  basePrecision: number;
  pipMultiplier: number;
  contractSize: number;
}

export const WATCHLIST_MARKETS: MarketItem[] = [
  {
    id: 'nasdaq',
    symbol: 'NASDAQ',
    displayName: 'Nasdaq-100 Index',
    category: 'Indices',
    provider: 'Institutional Feed (^NDX)',
    isDelayed: true,
    delayNotice: 'Exchange cash index quote is delayed by 15 mins during trading hours.',
    description: 'Top 100 non-financial tech & innovation firms listed on the Nasdaq exchange.',
    basePrecision: 2,
    pipMultiplier: 1.0,
    contractSize: 20
  },
  {
    id: 'us100',
    symbol: 'US100',
    displayName: 'US100 (Index CFD)',
    category: 'Indices',
    provider: 'Broker CFD (Over-The-Counter)',
    isCfd: true,
    cfdNotice: 'US100 is a broker-specific synthetic CFD contract without a single public exchange ticker. For official institutional benchmark data, select Nasdaq-100 Index.',
    description: 'Derivative CFD tracking US Tech 100 performance across retail brokerages.',
    basePrecision: 2,
    pipMultiplier: 1.0,
    contractSize: 20
  },
  {
    id: 'eurusd',
    symbol: 'EUR/USD',
    displayName: 'EUR/USD',
    category: 'Forex',
    provider: 'Global Interbank Forex Feed',
    isDelayed: false,
    description: 'Euro against US Dollar, the world’s most liquid currency pair.',
    basePrecision: 5,
    pipMultiplier: 10000,
    contractSize: 100000
  },
  {
    id: 'gbpusd',
    symbol: 'GBP/USD',
    displayName: 'GBP/USD',
    category: 'Forex',
    provider: 'Global Interbank Forex Feed',
    isDelayed: false,
    description: 'British Pound Sterling against US Dollar (“Cable”).',
    basePrecision: 5,
    pipMultiplier: 10000,
    contractSize: 100000
  },
  {
    id: 'usdjpy',
    symbol: 'USD/JPY',
    displayName: 'USD/JPY',
    category: 'Forex',
    provider: 'Global Interbank Forex Feed',
    isDelayed: false,
    description: 'US Dollar against Japanese Yen (“Ninja”).',
    basePrecision: 3,
    pipMultiplier: 100,
    contractSize: 100000
  },
  {
    id: 'xauusd',
    symbol: 'XAU/USD',
    displayName: 'XAU/USD (Gold)',
    category: 'Metals',
    provider: 'Spot Metals & COMEX Gold (GC=F)',
    isDelayed: false,
    description: 'Gold spot bullion priced in US Dollars per troy ounce.',
    basePrecision: 2,
    pipMultiplier: 10,
    contractSize: 100
  },
  {
    id: 'btcusd',
    symbol: 'BTC/USD',
    displayName: 'BTC/USD (Bitcoin)',
    category: 'Crypto',
    provider: 'Binance Public Spot (BTCUSDT)',
    isDelayed: false,
    description: 'Bitcoin primary liquid spot market vs Tether/USD.',
    basePrecision: 2,
    pipMultiplier: 1.0,
    contractSize: 1
  },
  {
    id: 'ethusd',
    symbol: 'ETH/USD',
    displayName: 'ETH/USD (Ethereum)',
    category: 'Crypto',
    provider: 'Binance Public Spot (ETHUSDT)',
    isDelayed: false,
    description: 'Ethereum primary liquid spot market vs Tether/USD.',
    basePrecision: 2,
    pipMultiplier: 1.0,
    contractSize: 1
  },
  {
    id: 'xrpusd',
    symbol: 'XRP/USD',
    displayName: 'XRP/USD (Ripple)',
    category: 'Crypto',
    provider: 'Binance Public Spot (XRPUSDT)',
    isDelayed: false,
    description: 'XRP liquid spot cross vs Tether/USD.',
    basePrecision: 4,
    pipMultiplier: 100,
    contractSize: 1
  }
];

export const TIMEFRAMES = [
  { id: '1m', label: '1m', desc: '1 Minute' },
  { id: '3m', label: '3m', desc: '3 Minutes' },
  { id: '5m', label: '5m', desc: '5 Minutes' },
  { id: '15m', label: '15m', desc: '15 Minutes' },
  { id: '30m', label: '30m', desc: '30 Minutes' },
  { id: '1h', label: '1h', desc: '1 Hour' },
  { id: '2h', label: '2h', desc: '2 Hours' },
  { id: '4h', label: '4h', desc: '4 Hours' },
  { id: '1d', label: '1D', desc: '1 Day' },
  { id: '1w', label: '1W', desc: '1 Week' }
];

export interface FetchCandlesResult {
  symbol: string;
  timeframe: string;
  candles: NormalizedCandle[];
  source: string;
  isDelayed?: boolean;
  delayNotice?: string;
  isCfd?: boolean;
  cfdNotice?: string;
  providerStatus: 'LIVE' | 'DELAYED' | 'STALE' | 'DISCONNECTED' | 'DATA UNAVAILABLE';
}

/**
 * Fetch historical candles through server proxy with fallbacks
 */
export async function fetchMarketCandles(symbol: string, timeframe: string): Promise<FetchCandlesResult> {
  const market = WATCHLIST_MARKETS.find(m => m.symbol.toUpperCase() === symbol.toUpperCase()) || WATCHLIST_MARKETS[0];
  
  if (market.isCfd) {
    return {
      symbol: market.symbol,
      timeframe,
      candles: [],
      source: market.provider,
      isCfd: true,
      cfdNotice: market.cfdNotice,
      providerStatus: 'DATA UNAVAILABLE'
    };
  }

  try {
    const url = `/api/market-data/candles?symbol=${encodeURIComponent(market.symbol)}&timeframe=${encodeURIComponent(timeframe)}&limit=400`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

    if (res.ok) {
      const data = await res.json();
      if (data.candles && Array.isArray(data.candles)) {
        return {
          symbol: market.symbol,
          timeframe,
          candles: data.candles,
          source: data.source || market.provider,
          isDelayed: !!data.isDelayed,
          delayNotice: data.delayNotice,
          providerStatus: data.isDelayed ? 'DELAYED' : 'LIVE'
        };
      }
    }
  } catch (err) {
    console.warn('Server proxy fetch failed, attempting client direct fallback:', err);
  }

  // Direct client fallback for crypto
  if (market.category === 'Crypto') {
    try {
      const tickerMap: Record<string, string> = {
        'BTC/USD': 'BTCUSDT',
        'ETH/USD': 'ETHUSDT',
        'XRP/USD': 'XRPUSDT',
      };
      const pair = tickerMap[market.symbol] || 'BTCUSDT';
      const bTf = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'].includes(timeframe.toLowerCase()) ? timeframe.toLowerCase() : '15m';
      const bRes = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${bTf}&limit=300`);
      if (bRes.ok) {
        const raw = await bRes.json();
        const candles: NormalizedCandle[] = raw.map((k: any) => {
          const o = parseFloat(k[1]);
          const h = parseFloat(k[2]);
          const l = parseFloat(k[3]);
          const c = parseFloat(k[4]);
          return {
            symbol: market.symbol,
            timestamp: Math.floor(k[0] / 1000),
            open: o,
            high: Math.max(h, o, c),
            low: Math.min(l, o, c),
            close: c,
            volume: parseFloat(k[5]),
            source: 'Binance Direct Public API',
            timeframe
          };
        }).sort((a: NormalizedCandle, b: NormalizedCandle) => a.timestamp - b.timestamp);

        return {
          symbol: market.symbol,
          timeframe,
          candles,
          source: 'Binance Direct Public API',
          isDelayed: false,
          providerStatus: 'LIVE'
        };
      }
    } catch (e) {
      console.warn('Direct Binance fallback failed:', e);
    }
  }

  return {
    symbol: market.symbol,
    timeframe,
    candles: [],
    source: market.provider,
    providerStatus: 'DISCONNECTED'
  };
}

export interface MarketQuote {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  high24h?: number | null;
  low24h?: number | null;
  status: 'Live' | 'Delayed' | 'Stale' | 'Offline' | 'Unavailable';
  provider: string;
  updatedAt: number;
  delayNotice?: string;
  cfdNotice?: string;
}

/**
 * Fetch latest provider-supplied quotes for all watchlist symbols
 */
export async function fetchMarketQuotes(): Promise<Record<string, MarketQuote>> {
  try {
    const res = await fetch('/api/market-data/quotes', { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data.quotes && typeof data.quotes === 'object') {
        return data.quotes;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch market quotes from server proxy:', err);
  }

  // Graceful client fallback for crypto if server is unavailable
  const fallbackQuotes: Record<string, MarketQuote> = {
    'US100': {
      symbol: 'US100',
      price: null,
      change: null,
      changePercent: null,
      status: 'Unavailable',
      provider: 'Broker CFD (Over-The-Counter)',
      cfdNotice: 'Synthetic broker CFD without a public exchange ticker.',
      updatedAt: Date.now()
    }
  };

  try {
    const cRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT"]');
    if (cRes.ok) {
      const items = await cRes.json();
      const map: Record<string, string> = { 'BTCUSDT': 'BTC/USD', 'ETHUSDT': 'ETH/USD', 'XRPUSDT': 'XRP/USD' };
      for (const item of items) {
        const s = map[item.symbol];
        if (s) {
          fallbackQuotes[s] = {
            symbol: s,
            price: parseFloat(item.lastPrice),
            change: parseFloat(item.priceChange),
            changePercent: parseFloat(item.priceChangePercent),
            status: 'Live',
            provider: `Binance Spot (${item.symbol})`,
            updatedAt: Date.now()
          };
        }
      }
    }
  } catch {
    // Ignore fallback errors
  }

  return fallbackQuotes;
}

/**
 * Concrete Normalized MarketDataProvider implementation
 */
export const defaultMarketDataProvider: MarketDataProvider = {
  async getCandles(symbol: string, timeframe: string, from?: number, to?: number): Promise<Candle[]> {
    const res = await fetchMarketCandles(symbol, timeframe);
    let candles = (res.candles || []).map(c => ({
      time: c.timestamp,
      open: c.open,
      high: Math.max(c.high, c.open, c.close),
      low: Math.min(c.low, c.open, c.close),
      close: c.close,
      volume: c.volume
    }));

    if (from !== undefined) {
      candles = candles.filter(c => c.time >= from);
    }
    if (to !== undefined) {
      candles = candles.filter(c => c.time <= to);
    }

    // Deduplicate and strictly sort ascending
    const seen = new Set<number>();
    return candles.filter(c => {
      if (seen.has(c.time)) return false;
      seen.add(c.time);
      return true;
    }).sort((a, b) => a.time - b.time);
  },

  async getQuote(symbol: string): Promise<Quote | null> {
    try {
      const res = await fetch(`/api/market-data/quote?symbol=${encodeURIComponent(symbol)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.quote) {
          return {
            symbol: data.quote.symbol,
            bid: data.quote.bid,
            ask: data.quote.ask,
            last: data.quote.last,
            timestamp: data.quote.timestamp,
            source: data.quote.source,
            status: data.quote.status,
            delayNotice: data.quote.delayNotice,
            cfdNotice: data.quote.cfdNotice
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch quote:', e);
    }
    return null;
  },

  /**
   * Subscribe to real-time candle streaming
   * Uses Binance WebSocket for crypto, or smooth non-flicker polling for Forex/Indices.
   */
  subscribeCandleStream(
    symbol: string,
    timeframe: string,
    onCandle: (candle: Candle) => void,
    onStatusChange?: (status: string) => void
  ): () => void {
    const market = WATCHLIST_MARKETS.find(m => m.symbol.toUpperCase() === symbol.toUpperCase());
    
    // Crypto: Use direct native Binance WebSocket for zero latency
    if (market?.category === 'Crypto') {
      const tickerMap: Record<string, string> = {
        'BTC/USD': 'btcusdt',
        'ETH/USD': 'ethusdt',
        'XRP/USD': 'xrpusdt',
      };
      const pair = tickerMap[symbol] || 'btcusdt';
      const bTf = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'].includes(timeframe.toLowerCase()) ? timeframe.toLowerCase() : '15m';

      let ws: WebSocket | null = null;
      let isClosed = false;

      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair}@kline_${bTf}`);

        ws.onopen = () => {
          if (!isClosed && onStatusChange) onStatusChange('Live');
        };

        ws.onmessage = (event) => {
          if (isClosed) return;
          try {
            const data = JSON.parse(event.data);
            if (data?.k) {
              const k = data.k;
              const o = parseFloat(k.o);
              const h = parseFloat(k.h);
              const l = parseFloat(k.l);
              const c = parseFloat(k.c);
              const v = parseFloat(k.v);
              const candle: Candle = {
                time: Math.floor(k.t / 1000), // convert ms to seconds
                open: o,
                high: Math.max(h, o, c),
                low: Math.min(l, o, c),
                close: c,
                volume: isNaN(v) ? 0 : v
              };
              onCandle(candle);
            }
          } catch (e) {
            console.warn('Error parsing WS kline tick:', e);
          }
        };

        ws.onerror = () => {
          if (!isClosed && onStatusChange) onStatusChange('Reconnecting');
        };

        ws.onclose = () => {
          if (!isClosed && onStatusChange) onStatusChange('Disconnected');
        };
      } catch (wsErr) {
        console.warn('Binance WS connection failed, falling back to polling:', wsErr);
      }

      return () => {
        isClosed = true;
        if (ws) {
          ws.close();
          ws = null;
        }
      };
    }

    // Forex & Indices: Polling loop (10s)
    let isCancelled = false;
    const pollInterval = setInterval(async () => {
      if (isCancelled) return;
      try {
        const candles = await defaultMarketDataProvider.getCandles(symbol, timeframe);
        if (!isCancelled && candles.length > 0) {
          const latest = candles[candles.length - 1];
          onCandle(latest);
        }
      } catch {
        // Suppress transient poll error
      }
    }, 10000);

    return () => {
      isCancelled = true;
      clearInterval(pollInterval);
    };
  }
};

/**
 * Candle continuity & market session inspection:
 * Distinguishes legitimate market closures (e.g. weekend closures for Forex/Stocks)
 * from genuine provider data gaps.
 */
export function validateCandleContinuity(candles: Candle[], symbol: string, timeframe: string): {
  hasDataGaps: boolean;
  gapDetails?: string;
  isMarketClosed: boolean;
  closureReason?: string;
} {
  const market = WATCHLIST_MARKETS.find(m => m.symbol.toUpperCase() === symbol.toUpperCase());
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sun, 6 = Sat
  const hourUtc = now.getUTCHours();

  // 1. Check legitimate market closure
  if (market?.category === 'Forex') {
    // Forex closes Friday 21:00 UTC (5pm EST) to Sunday 21:00 UTC (5pm EST)
    if (dayOfWeek === 6 || (dayOfWeek === 5 && hourUtc >= 21) || (dayOfWeek === 0 && hourUtc < 21)) {
      return {
        hasDataGaps: false,
        isMarketClosed: true,
        closureReason: 'Global Forex Market Closed for Weekend (Reopens Sun 5:00 PM EST / 21:00 UTC)'
      };
    }
  }

  if (market?.category === 'Indices' && market.symbol === 'NASDAQ') {
    // US Stock Cash Index closed on weekends and outside 13:30 - 20:00 UTC
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return {
        hasDataGaps: false,
        isMarketClosed: true,
        closureReason: 'US Equity Cash Markets Closed for Weekend'
      };
    }
  }

  if (market?.isCfd) {
    return {
      hasDataGaps: true,
      gapDetails: 'US100 is an Over-The-Counter broker CFD without an authorized public feed.',
      isMarketClosed: false
    };
  }

  if (!candles || candles.length < 2) {
    return { hasDataGaps: false, isMarketClosed: false };
  }

  // 2. Check for unexpected discontinuities in candles
  let tfSeconds = 900; // 15m
  if (timeframe === '1m') tfSeconds = 60;
  else if (timeframe === '3m') tfSeconds = 180;
  else if (timeframe === '5m') tfSeconds = 300;
  else if (timeframe === '30m') tfSeconds = 1800;
  else if (timeframe === '1h') tfSeconds = 3600;
  else if (timeframe === '4h') tfSeconds = 14400;
  else if (timeframe === '1d') tfSeconds = 86400;

  const lastCandle = candles[candles.length - 1];
  const ageSeconds = Math.floor(Date.now() / 1000) - lastCandle.time;

  if (market?.category === 'Crypto' && ageSeconds > tfSeconds * 3) {
    return {
      hasDataGaps: true,
      gapDetails: `Latest candle is ${Math.round(ageSeconds / 60)} minutes old. Checking feed reconnection...`,
      isMarketClosed: false
    };
  }

  return { hasDataGaps: false, isMarketClosed: false };
}

function getCandleTimestamp(c: NormalizedCandle | Candle): number {
  return 'time' in c ? (c as Candle).time : (c as NormalizedCandle).timestamp;
}

/**
 * Technical Indicator Calculations
 */
export function calculateEMA(candles: NormalizedCandle[] | Candle[], period: number): { time: number; value: number }[] {
  if (!candles || candles.length < period) return [];

  const k = 2 / (period + 1);
  const result: { time: number; value: number }[] = [];

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;
  result.push({ time: getCandleTimestamp(candles[period - 1]), value: Number(prevEma.toFixed(5)) });

  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const currentEma = currentClose * k + prevEma * (1 - k);
    result.push({ time: getCandleTimestamp(candles[i]), value: Number(currentEma.toFixed(5)) });
    prevEma = currentEma;
  }

  return result;
}

export function calculateRSI(candles: NormalizedCandle[] | Candle[], period: number = 14): { time: number; value: number }[] {
  if (!candles || candles.length < period + 1) return [];

  const result: { time: number; value: number }[] = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));
  result.push({ time: getCandleTimestamp(candles[period]), value: Number(rsi.toFixed(2)) });

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change >= 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
    result.push({ time: getCandleTimestamp(candles[i]), value: Number(rsi.toFixed(2)) });
  }

  return result;
}

export function calculateBollingerBands(candles: NormalizedCandle[] | Candle[], period: number = 20, multiplier: number = 2) {
  if (!candles || candles.length < period) return { upper: [], middle: [], lower: [] };

  const upper: { time: number; value: number }[] = [];
  const middle: { time: number; value: number }[] = [];
  const lower: { time: number; value: number }[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    const slice = candles.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, c) => acc + c.close, 0) / period;
    const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const t = getCandleTimestamp(candles[i]);
    middle.push({ time: t, value: Number(mean.toFixed(5)) });
    upper.push({ time: t, value: Number((mean + stdDev * multiplier).toFixed(5)) });
    lower.push({ time: t, value: Number((mean - stdDev * multiplier).toFixed(5)) });
  }

  return { upper, middle, lower };
}

export function calculateATR(candles: NormalizedCandle[] | Candle[], period: number = 14): { time: number; value: number }[] {
  if (!candles || candles.length < period + 1) return [];

  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trs.push(tr);
  }

  let atr = trs.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
  const result: { time: number; value: number }[] = [];
  result.push({ time: getCandleTimestamp(candles[period]), value: Number(atr.toFixed(5)) });

  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    result.push({ time: getCandleTimestamp(candles[i + 1]), value: Number(atr.toFixed(5)) });
  }

  return result;
}

export interface MarketConditionsReport {
  state: 'BULLISH TREND' | 'BEARISH TREND' | 'RANGING' | 'CHOPPY' | 'INSUFFICIENT DATA';
  stateColor: string;
  volatility: 'LOW' | 'NORMAL' | 'HIGH' | 'UNKNOWN';
  volatilityColor: string;
  currentPrice: number;
  atrValue: number | null;
  ema20: number | null;
  ema50: number | null;
  slope: 'RISING' | 'FALLING' | 'FLAT';
  timeframe: string;
  lastUpdated: string;
  transparencyFormula: string;
}

export function analyzeMarketConditions(candles: NormalizedCandle[] | Candle[], timeframe: string): MarketConditionsReport {
  if (!candles || candles.length < 50) {
    return {
      state: 'INSUFFICIENT DATA',
      stateColor: 'text-slate-400 bg-slate-100 dark:bg-slate-800',
      volatility: 'UNKNOWN',
      volatilityColor: 'text-slate-400',
      currentPrice: candles[candles.length - 1]?.close || 0,
      atrValue: null,
      ema20: null,
      ema50: null,
      slope: 'FLAT',
      timeframe,
      lastUpdated: new Date().toLocaleTimeString(),
      transparencyFormula: 'Requires at least 50 historical candles to calculate EMA20/50 and ATR14.'
    };
  }

  const lastCandle = candles[candles.length - 1];
  const currentPrice = lastCandle.close;

  const ema20Data = calculateEMA(candles, 20);
  const ema50Data = calculateEMA(candles, 50);
  const atrData = calculateATR(candles, 14);

  const lastEma20 = ema20Data[ema20Data.length - 1]?.value || null;
  const prevEma20 = ema20Data[ema20Data.length - 3]?.value || null;
  const lastEma50 = ema50Data[ema50Data.length - 1]?.value || null;
  const lastAtr = atrData[atrData.length - 1]?.value || null;

  let slope: 'RISING' | 'FALLING' | 'FLAT' = 'FLAT';
  if (lastEma20 !== null && prevEma20 !== null) {
    const diff = (lastEma20 - prevEma20) / prevEma20;
    if (diff > 0.0008) slope = 'RISING';
    else if (diff < -0.0008) slope = 'FALLING';
  }

  let volatility: 'LOW' | 'NORMAL' | 'HIGH' = 'NORMAL';
  let volatilityColor = 'text-amber-500';
  if (lastAtr !== null && currentPrice > 0) {
    const atrPercent = (lastAtr / currentPrice) * 100;
    if (atrPercent < 0.15) {
      volatility = 'LOW';
      volatilityColor = 'text-blue-500';
    } else if (atrPercent > 0.6) {
      volatility = 'HIGH';
      volatilityColor = 'text-rose-500';
    } else {
      volatility = 'NORMAL';
      volatilityColor = 'text-emerald-500';
    }
  }

  let state: 'BULLISH TREND' | 'BEARISH TREND' | 'RANGING' | 'CHOPPY' = 'RANGING';
  let stateColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60';

  if (lastEma20 !== null && lastEma50 !== null) {
    if (currentPrice > lastEma20 && lastEma20 > lastEma50 && slope === 'RISING') {
      state = 'BULLISH TREND';
      stateColor = 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80';
    } else if (currentPrice < lastEma20 && lastEma20 < lastEma50 && slope === 'FALLING') {
      state = 'BEARISH TREND';
      stateColor = 'text-rose-700 bg-rose-50 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-700/80';
    } else if (Math.abs(lastEma20 - lastEma50) / lastEma50 < 0.001) {
      state = 'CHOPPY';
      stateColor = 'text-amber-700 bg-amber-50 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80';
    }
  }

  return {
    state,
    stateColor,
    volatility,
    volatilityColor,
    currentPrice,
    atrValue: lastAtr,
    ema20: lastEma20,
    ema50: lastEma50,
    slope,
    timeframe,
    lastUpdated: new Date().toLocaleTimeString(),
    transparencyFormula: 'Dynamic EMA20/50 alignment + ATR14 volatility bands.'
  };
}
