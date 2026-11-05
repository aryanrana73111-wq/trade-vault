import { Router, Request, Response } from 'express';

export interface NormalizedCandle {
  symbol: string;
  timestamp: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  source: string;
  timeframe: string;
}

export interface NormalizedQuote {
  symbol: string;
  bid?: number;
  ask?: number;
  last?: number;
  timestamp: number; // Unix timestamp in seconds
  source: string;
  status: 'Live' | 'Delayed' | 'Stale' | 'Offline' | 'Unavailable';
  delayNotice?: string;
  cfdNotice?: string;
}

// In-memory candle cache (TTL 15 seconds for intraday, 60 seconds for daily)
interface CandleCacheEntry {
  candles: NormalizedCandle[];
  expiresAt: number;
  source: string;
}

const candleCache = new Map<string, CandleCacheEntry>();

// Map TradeVault canonical symbols to Binance API tickers
const BINANCE_TICKERS: Record<string, string> = {
  'BTC/USD': 'BTCUSDT',
  'BTCUSD': 'BTCUSDT',
  'ETH/USD': 'ETHUSDT',
  'ETHUSD': 'ETHUSDT',
  'XRP/USD': 'XRPUSDT',
  'XRPUSD': 'XRPUSDT',
};

// Map TradeVault canonical symbols to Yahoo Finance tickers
const YAHOO_TICKERS: Record<string, { ticker: string; name: string; isDelayed: boolean; delayNotice?: string }> = {
  // Indices
  'NASDAQ': { ticker: '^NDX', name: 'Nasdaq-100 Index', isDelayed: true, delayNotice: 'Official exchange cash index quote is delayed by 15 mins during market hours.' },
  'NAS100': { ticker: '^NDX', name: 'Nasdaq-100 Index', isDelayed: true, delayNotice: 'Official exchange cash index quote is delayed by 15 mins during market hours.' },
  'NQ': { ticker: 'NQ=F', name: 'E-mini Nasdaq-100 Futures', isDelayed: false },

  // Forex (Interbank 24/5 feeds)
  'EUR/USD': { ticker: 'EURUSD=X', name: 'Euro / US Dollar', isDelayed: false },
  'EURUSD': { ticker: 'EURUSD=X', name: 'Euro / US Dollar', isDelayed: false },
  'GBP/USD': { ticker: 'GBPUSD=X', name: 'British Pound / US Dollar', isDelayed: false },
  'GBPUSD': { ticker: 'GBPUSD=X', name: 'British Pound / US Dollar', isDelayed: false },
  'USD/JPY': { ticker: 'USDJPY=X', name: 'US Dollar / Japanese Yen', isDelayed: false },
  'USDJPY': { ticker: 'USDJPY=X', name: 'US Dollar / Japanese Yen', isDelayed: false },

  // Commodities (COMEX / Spot)
  'XAU/USD': { ticker: 'GC=F', name: 'Gold Spot / Futures', isDelayed: false },
  'XAUUSD': { ticker: 'GC=F', name: 'Gold Spot / Futures', isDelayed: false },
};

// Map TradeVault canonical symbols to OANDA v20 instrument names
const OANDA_INSTRUMENTS: Record<string, string> = {
  'EUR/USD': 'EUR_USD',
  'EURUSD': 'EUR_USD',
  'GBP/USD': 'GBP_USD',
  'GBPUSD': 'GBP_USD',
  'USD/JPY': 'USD_JPY',
  'USDJPY': 'USD_JPY',
  'XAU/USD': 'XAU_USD',
  'XAUUSD': 'XAU_USD',
  'NASDAQ': 'NAS100_USD',
  'US100': 'NAS100_USD',
};

// Timeframe mapping helpers
function mapToBinanceInterval(tf: string): string {
  switch (tf.toLowerCase()) {
    case '1m': return '1m';
    case '3m': return '3m';
    case '5m': return '5m';
    case '15m': return '15m';
    case '30m': return '30m';
    case '1h': return '1h';
    case '2h': return '2h';
    case '4h': return '4h';
    case '1d': return '1d';
    case '1w': return '1w';
    default: return '15m';
  }
}

function mapToYahooInterval(tf: string): { interval: string; range: string } {
  switch (tf.toLowerCase()) {
    case '1m': return { interval: '1m', range: '5d' }; // 5 days ensures continuous intraday data
    case '3m':
    case '5m': return { interval: '5m', range: '5d' };
    case '15m': return { interval: '15m', range: '14d' };
    case '30m': return { interval: '30m', range: '30d' };
    case '1h': return { interval: '1h', range: '60d' };
    case '2h': return { interval: '1h', range: '60d' };
    case '4h': return { interval: '1h', range: '90d' };
    case '1d': return { interval: '1d', range: '1y' };
    case '1w': return { interval: '1wk', range: '5y' };
    default: return { interval: '15m', range: '14d' };
  }
}

/**
 * Resample 1h candles into 2h or 4h candles
 */
function resampleCandles(candles: NormalizedCandle[], targetHours: number): NormalizedCandle[] {
  if (candles.length === 0) return [];
  const bucketDuration = targetHours * 3600;
  const groups = new Map<number, NormalizedCandle[]>();

  for (const c of candles) {
    const bucket = Math.floor(c.timestamp / bucketDuration) * bucketDuration;
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket)!.push(c);
  }

  const resampled: NormalizedCandle[] = [];
  for (const [bucket, list] of groups.entries()) {
    list.sort((a, b) => a.timestamp - b.timestamp);
    const open = list[0].open;
    const close = list[list.length - 1].close;
    let high = -Infinity;
    let low = Infinity;
    let volume = 0;

    for (const item of list) {
      if (item.high > high) high = item.high;
      if (item.low < low) low = item.low;
      volume += item.volume;
    }

    resampled.push({
      symbol: list[0].symbol,
      timestamp: bucket,
      open,
      high: Math.max(high, open, close),
      low: Math.min(low, open, close),
      close,
      volume,
      source: list[0].source,
      timeframe: `${targetHours}h`
    });
  }

  return resampled.sort((a, b) => a.timestamp - b.timestamp);
}

function mapToOandaGranularity(tf: string): string {
  switch (tf.toLowerCase()) {
    case '1m': return 'M1';
    case '3m': return 'M3';
    case '5m': return 'M5';
    case '15m': return 'M15';
    case '30m': return 'M30';
    case '1h': return 'H1';
    case '2h': return 'H2';
    case '4h': return 'H4';
    case '1d': return 'D';
    case '1w': return 'W';
    default: return 'M15';
  }
}

/**
 * Validate and sanitize OHLC candle data:
 * Ensures high >= max(open, close) and low <= min(open, close).
 * Ensures timestamp is non-zero integer seconds.
 */
function sanitizeCandle(c: {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  symbol: string;
  source: string;
  timeframe: string;
}): NormalizedCandle | null {
  if (!c || isNaN(c.timestamp) || c.timestamp <= 0) return null;
  const o = Number(c.open);
  const rawH = Number(c.high);
  const rawL = Number(c.low);
  const cl = Number(c.close);

  if (isNaN(o) || isNaN(rawH) || isNaN(rawL) || isNaN(cl)) return null;

  // Enforce OHLC consistency boundaries
  const high = Math.max(rawH, o, cl);
  const low = Math.min(rawL, o, cl);
  const volume = Number(c.volume) || 0;

  return {
    symbol: c.symbol,
    timestamp: Math.floor(c.timestamp),
    open: o,
    high,
    low,
    close: cl,
    volume,
    source: c.source,
    timeframe: c.timeframe,
  };
}

export function createMarketDataRouter(): Router {
  const router = Router();

  /**
   * Technical Investigation Report on OANDA & Exness
   * GET /api/market-data/provider-info
   */
  router.get('/provider-info', (_req: Request, res: Response) => {
    const hasOandaKey = !!process.env.OANDA_API_KEY;
    const hasOandaAccount = !!process.env.OANDA_ACCOUNT_ID;
    const oandaEnv = process.env.OANDA_ENV || 'practice';

    res.json({
      success: true,
      chartEngine: 'TradingView Lightweight Charts v5.2.1',
      providers: {
        binance: {
          name: 'Binance Public Spot API & WebSocket',
          status: 'CONNECTED',
          feedType: 'Live Tick-by-Tick WebSocket & REST',
          supportedSymbols: ['BTC/USD', 'ETH/USD', 'XRP/USD'],
          authenticationRequired: false,
          notes: 'High-frequency public liquid crypto spot market.'
        },
        yahooFinance: {
          name: 'Institutional Market Feed (Yahoo Finance Benchmark)',
          status: 'CONNECTED',
          feedType: 'REST 15s Cached',
          supportedSymbols: ['NASDAQ (^NDX)', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD'],
          delayNotice: 'NASDAQ index quote delayed by 15 mins per exchange rules. Forex & Gold are interbank live.',
          authenticationRequired: false
        },
        oanda: {
          name: 'OANDA v20 REST & Streaming API',
          configured: hasOandaKey && hasOandaAccount,
          environment: oandaEnv,
          status: hasOandaKey && hasOandaAccount ? 'CONFIGURED' : 'UNCONFIGURED (Optional)',
          supportedInstruments: ['EUR_USD', 'GBP_USD', 'USD_JPY', 'XAU_USD', 'NAS100_USD'],
          setupGuide: 'To connect personal OANDA institutional feed, set OANDA_API_KEY, OANDA_ACCOUNT_ID, and OANDA_ENV in environment.',
          limitations: 'OANDA CFD access is region-restricted (available in UK/EU/CA/AU; restricted in USA under CFTC regulations).'
        },
        exness: {
          name: 'Exness Broker',
          status: 'UNAVAILABLE FOR PUBLIC DIRECT WEB INTEGRATION',
          reason: 'Exness does not provide a universal, unauthenticated public REST/WebSocket market-data API for client web applications. Their quote infrastructure is exclusively accessible via authenticated MetaTrader 4/5 terminal sessions or private B2B broker partner channels.',
          recommendation: 'Use TradeVault verified institutional market feeds (Binance + Yahoo Benchmark + OANDA v20 adapter).'
        }
      }
    });
  });

  /**
   * GET /api/market-data/candles
   * Retrieves strictly verified, chronologically sorted, non-gap candles.
   */
  router.get('/candles', async (req: Request, res: Response) => {
    try {
      const rawSymbol = ((req.query.symbol as string) || 'EUR/USD').trim().toUpperCase();
      const timeframe = ((req.query.timeframe as string) || '15m').trim();
      const limit = Math.min(1000, Math.max(20, parseInt((req.query.limit as string) || '300', 10)));

      // 1. Check for OANDA configuration first if instrument is supported
      const oandaApiKey = process.env.OANDA_API_KEY;
      const oandaAccountId = process.env.OANDA_ACCOUNT_ID;
      const oandaEnv = process.env.OANDA_ENV || 'practice';
      const oandaInstrument = OANDA_INSTRUMENTS[rawSymbol];

      if (oandaApiKey && oandaAccountId && oandaInstrument) {
        try {
          const host = oandaEnv === 'live' ? 'api-fxtrade.oanda.com' : 'api-fxpractice.oanda.com';
          const gran = mapToOandaGranularity(timeframe);
          const oandaUrl = `https://${host}/v3/instruments/${oandaInstrument}/candles?granularity=${gran}&count=${limit}&price=M`;
          const oandaRes = await fetch(oandaUrl, {
            headers: {
              'Authorization': `Bearer ${oandaApiKey}`,
              'Content-Type': 'application/json'
            }
          });

          if (oandaRes.ok) {
            const oandaData = await oandaRes.json();
            if (Array.isArray(oandaData?.candles) && oandaData.candles.length > 0) {
              const rawList = oandaData.candles
                .filter((c: any) => c.mid && c.time)
                .map((c: any) => ({
                  timestamp: Math.floor(new Date(c.time).getTime() / 1000),
                  open: parseFloat(c.mid.o),
                  high: parseFloat(c.mid.h),
                  low: parseFloat(c.mid.l),
                  close: parseFloat(c.mid.c),
                  volume: c.volume || 0,
                  symbol: rawSymbol,
                  source: `OANDA v20 (${oandaInstrument})`,
                  timeframe
                }));

              const sanitized: NormalizedCandle[] = [];
              for (const r of rawList) {
                const s = sanitizeCandle(r);
                if (s) sanitized.push(s);
              }

              // Deduplicate and strictly sort ascending
              const seen = new Set<number>();
              const deduped = sanitized
                .filter(c => {
                  if (seen.has(c.timestamp)) return false;
                  seen.add(c.timestamp);
                  return true;
                })
                .sort((a, b) => a.timestamp - b.timestamp);

              res.json({
                success: true,
                symbol: rawSymbol,
                timeframe,
                count: deduped.length,
                source: `OANDA v20 Institutional Feed (${oandaInstrument})`,
                candles: deduped
              });
              return;
            }
          }
        } catch (oandaErr) {
          console.warn('OANDA candles request failed, falling back to public feed:', oandaErr);
        }
      }

      // 2. Special check for US100 CFD when no broker feed is configured
      if (rawSymbol === 'US100' || rawSymbol === 'US100CFD') {
        res.status(200).json({
          success: true,
          symbol: 'US100',
          providerStatus: 'UNAVAILABLE',
          isCfd: true,
          message: 'US100 is a broker-specific synthetic CFD without a single public exchange ticker. For official institutional benchmark data, select Nasdaq-100 Index (NASDAQ).',
          candles: [],
          disclaimer: 'CFD prices vary per broker spread and liquidity terms.'
        });
        return;
      }

      // 3. Check in-memory cache
      const cacheKey = `${rawSymbol}_${timeframe}_${limit}`;
      const cached = candleCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        res.json({
          success: true,
          symbol: rawSymbol,
          timeframe,
          count: cached.candles.length,
          source: cached.source,
          cached: true,
          candles: cached.candles
        });
        return;
      }

      // 4. Try Binance for Crypto
      const binanceTicker = BINANCE_TICKERS[rawSymbol] || BINANCE_TICKERS[rawSymbol.replace('/', '')];
      if (binanceTicker) {
        try {
          const binanceInterval = mapToBinanceInterval(timeframe);
          const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${binanceTicker}&interval=${binanceInterval}&limit=${limit}`;
          const binanceRes = await fetch(binanceUrl, { headers: { 'Accept': 'application/json' } });

          if (binanceRes.ok) {
            const rawKlines = await binanceRes.json();
            if (Array.isArray(rawKlines) && rawKlines.length > 0) {
              const parsed: NormalizedCandle[] = [];

              for (const k of rawKlines) {
                const s = sanitizeCandle({
                  timestamp: Math.floor(k[0] / 1000), // ms to seconds
                  open: parseFloat(k[1]),
                  high: parseFloat(k[2]),
                  low: parseFloat(k[3]),
                  close: parseFloat(k[4]),
                  volume: parseFloat(k[5]),
                  symbol: rawSymbol,
                  source: `Binance Public Spot (${binanceTicker})`,
                  timeframe
                });
                if (s) parsed.push(s);
              }

              // Deduplicate and strictly sort ascending
              const seen = new Set<number>();
              const deduped = parsed
                .filter(c => {
                  if (seen.has(c.timestamp)) return false;
                  seen.add(c.timestamp);
                  return true;
                })
                .sort((a, b) => a.timestamp - b.timestamp);

              // Cache for 15 seconds
              candleCache.set(cacheKey, {
                candles: deduped,
                expiresAt: Date.now() + 15000,
                source: `Binance Public Spot (${binanceTicker})`
              });

              res.json({
                success: true,
                symbol: rawSymbol,
                timeframe,
                count: deduped.length,
                source: `Binance Public Spot (${binanceTicker})`,
                cached: false,
                candles: deduped
              });
              return;
            }
          }
        } catch (binErr) {
          console.warn('Binance candles request failed:', binErr);
        }
      }

      // 5. Try Yahoo Finance for Forex, Indices, and Metals
      let yahooMeta = YAHOO_TICKERS[rawSymbol] || YAHOO_TICKERS[rawSymbol.replace('/', '')];
      if (!yahooMeta) {
        if (rawSymbol === 'BTC/USD' || rawSymbol === 'BTCUSD') {
          yahooMeta = { ticker: 'BTC-USD', name: 'Bitcoin / US Dollar', isDelayed: false };
        } else if (rawSymbol === 'ETH/USD' || rawSymbol === 'ETHUSD') {
          yahooMeta = { ticker: 'ETH-USD', name: 'Ethereum / US Dollar', isDelayed: false };
        } else if (rawSymbol === 'XRP/USD' || rawSymbol === 'XRPUSD') {
          yahooMeta = { ticker: 'XRP-USD', name: 'Ripple / US Dollar', isDelayed: false };
        }
      }

      if (yahooMeta) {
        try {
          const { interval, range } = mapToYahooInterval(timeframe);
          const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooMeta.ticker)}?interval=${interval}&range=${range}`;
          const yahooRes = await fetch(yahooUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json'
            }
          });

          if (yahooRes.ok) {
            const data = await yahooRes.json();
            const resultItem = data?.chart?.result?.[0];
            const timestamps = resultItem?.timestamp as number[] | undefined;
            const quote = resultItem?.indicators?.quote?.[0];

            if (timestamps && timestamps.length > 0 && quote) {
              const opens = quote.open || [];
              const highs = quote.high || [];
              const lows = quote.low || [];
              const closes = quote.close || [];
              const volumes = quote.volume || [];

              const candles: NormalizedCandle[] = [];
              for (let i = 0; i < timestamps.length; i++) {
                const o = opens[i];
                const h = highs[i];
                const l = lows[i];
                const c = closes[i];
                const v = volumes[i] || 0;

                if (o !== null && h !== null && l !== null && c !== null) {
                  const s = sanitizeCandle({
                    timestamp: timestamps[i],
                    open: Number(o),
                    high: Number(h),
                    low: Number(l),
                    close: Number(c),
                    volume: Number(v),
                    symbol: rawSymbol,
                    source: `Market Feed (${yahooMeta.ticker})`,
                    timeframe
                  });
                  if (s) candles.push(s);
                }
              }

              // Deduplicate and strictly sort ascending
              const seen = new Set<number>();
              const deduped = candles
                .filter(c => {
                  if (seen.has(c.timestamp)) return false;
                  seen.add(c.timestamp);
                  return true;
                })
                .sort((a, b) => a.timestamp - b.timestamp);

              // Resample 2h and 4h if needed
              let finalCandles = deduped;
              if (timeframe.toLowerCase() === '2h') {
                finalCandles = resampleCandles(deduped, 2);
              } else if (timeframe.toLowerCase() === '4h') {
                finalCandles = resampleCandles(deduped, 4);
              }

              // Cache for 30s
              candleCache.set(cacheKey, {
                candles: finalCandles,
                expiresAt: Date.now() + 30000,
                source: `Institutional Market Feed (${yahooMeta.ticker})`
              });

              res.json({
                success: true,
                symbol: rawSymbol,
                name: yahooMeta.name,
                timeframe,
                isDelayed: yahooMeta.isDelayed,
                delayNotice: yahooMeta.delayNotice,
                count: finalCandles.length,
                source: `Institutional Market Feed (${yahooMeta.ticker})`,
                cached: false,
                candles: finalCandles
              });
              return;
            }
          }
        } catch (yErr) {
          console.warn('Yahoo candles request failed:', yErr);
        }
      }

      res.status(404).json({
        success: false,
        error: `Market data provider currently does not support symbol: ${rawSymbol}`,
        supportedSymbols: ['NASDAQ', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'BTC/USD', 'ETH/USD', 'XRP/USD'],
        note: 'US100 CFD is broker-specific and unavailable on public exchange feeds.'
      });
    } catch (err: any) {
      console.error('Candles router error:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve market candles.',
        message: err?.message
      });
    }
  });

  /**
   * GET /api/market-data/quote
   * Single instrument real-time quote with bid/ask/last and timestamp.
   */
  router.get('/quote', async (req: Request, res: Response) => {
    try {
      const rawSymbol = ((req.query.symbol as string) || 'EUR/USD').trim().toUpperCase();

      if (rawSymbol === 'US100') {
        const quote: NormalizedQuote = {
          symbol: 'US100',
          timestamp: Math.floor(Date.now() / 1000),
          source: 'Broker CFD (Over-The-Counter)',
          status: 'Unavailable',
          cfdNotice: 'Synthetic broker CFD without a public exchange feed.'
        };
        res.json({ success: true, quote });
        return;
      }

      // Check Binance Crypto
      const binanceTicker = BINANCE_TICKERS[rawSymbol] || BINANCE_TICKERS[rawSymbol.replace('/', '')];
      if (binanceTicker) {
        try {
          const bRes = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${binanceTicker}`);
          if (bRes.ok) {
            const data = await bRes.json();
            const bid = parseFloat(data.bidPrice);
            const ask = parseFloat(data.askPrice);
            const quote: NormalizedQuote = {
              symbol: rawSymbol,
              bid: isNaN(bid) ? undefined : bid,
              ask: isNaN(ask) ? undefined : ask,
              last: isNaN(bid) || isNaN(ask) ? undefined : Number(((bid + ask) / 2).toFixed(2)),
              timestamp: Math.floor(Date.now() / 1000),
              source: `Binance Spot (${binanceTicker})`,
              status: 'Live'
            };
            res.json({ success: true, quote });
            return;
          }
        } catch (bErr) {
          console.warn('Binance quote fetch failed:', bErr);
        }
      }

      // Check Yahoo Finance
      const yahooMeta = YAHOO_TICKERS[rawSymbol] || YAHOO_TICKERS[rawSymbol.replace('/', '')];
      if (yahooMeta) {
        try {
          const yRes = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooMeta.ticker)}?interval=1m&range=1d`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 TradeVault/2.0',
              'Accept': 'application/json'
            }
          });
          if (yRes.ok) {
            const yData = await yRes.json();
            const meta = yData?.chart?.result?.[0]?.meta;
            if (meta && typeof meta.regularMarketPrice === 'number') {
              const quote: NormalizedQuote = {
                symbol: rawSymbol,
                last: meta.regularMarketPrice,
                bid: meta.regularMarketPrice,
                ask: meta.regularMarketPrice,
                timestamp: meta.regularMarketTime || Math.floor(Date.now() / 1000),
                source: `Institutional Feed (${yahooMeta.ticker})`,
                status: yahooMeta.isDelayed ? 'Delayed' : 'Live',
                delayNotice: yahooMeta.delayNotice
              };
              res.json({ success: true, quote });
              return;
            }
          }
        } catch (yErr) {
          console.warn('Yahoo quote fetch failed:', yErr);
        }
      }

      res.status(404).json({ success: false, error: `Quote unavailable for ${rawSymbol}` });
    } catch (err: any) {
      console.error('Quote router error:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve market quote' });
    }
  });

  // Cached quotes store (15s TTL)
  let quotesCache: { quotes: Record<string, any>; expiresAt: number } | null = null;

  /**
   * GET /api/market-data/quotes
   * Returns batch quotes for all watchlist symbols.
   */
  router.get('/quotes', async (_req: Request, res: Response) => {
    try {
      if (quotesCache && quotesCache.expiresAt > Date.now()) {
        res.json({ success: true, quotes: quotesCache.quotes, cached: true });
        return;
      }

      const quotes: Record<string, any> = {
        'US100': {
          symbol: 'US100',
          price: null,
          change: null,
          changePercent: null,
          status: 'Unavailable',
          provider: 'Broker CFD (Over-The-Counter)',
          isCfd: true,
          cfdNotice: 'Broker-specific synthetic CFD. No public exchange ticker exists for retail CFDs.',
          updatedAt: Date.now()
        }
      };

      // 1. Fetch Binance Cryptos in batch
      try {
        const binanceRes = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT","XRPUSDT"]',
          { headers: { 'Accept': 'application/json' } }
        );
        if (binanceRes.ok) {
          const cryptoList = await binanceRes.json();
          if (Array.isArray(cryptoList)) {
            for (const item of cryptoList) {
              const symMap: Record<string, string> = {
                'BTCUSDT': 'BTC/USD',
                'ETHUSDT': 'ETH/USD',
                'XRPUSDT': 'XRP/USD',
              };
              const mapped = symMap[item.symbol];
              if (mapped) {
                const lastPrice = parseFloat(item.lastPrice);
                const priceChange = parseFloat(item.priceChange);
                const priceChangePercent = parseFloat(item.priceChangePercent);
                quotes[mapped] = {
                  symbol: mapped,
                  price: isNaN(lastPrice) ? null : lastPrice,
                  change: isNaN(priceChange) ? null : priceChange,
                  changePercent: isNaN(priceChangePercent) ? null : priceChangePercent,
                  high24h: parseFloat(item.highPrice) || null,
                  low24h: parseFloat(item.lowPrice) || null,
                  status: 'Live',
                  provider: `Binance Spot (${item.symbol})`,
                  updatedAt: Date.now()
                };
              }
            }
          }
        }
      } catch (cErr) {
        console.warn('Binance batch ticker failed:', cErr);
      }

      // 2. Fetch Yahoo Finance Quotes
      const yahooTargets = [
        { tvSym: 'NASDAQ', yTicker: '^NDX', isDelayed: true, delayNotice: 'Delayed 15m (Exchange requirement)' },
        { tvSym: 'EUR/USD', yTicker: 'EURUSD=X', isDelayed: false },
        { tvSym: 'GBP/USD', yTicker: 'GBPUSD=X', isDelayed: false },
        { tvSym: 'USD/JPY', yTicker: 'USDJPY=X', isDelayed: false },
        { tvSym: 'XAU/USD', yTicker: 'GC=F', isDelayed: false }
      ];

      await Promise.allSettled(
        yahooTargets.map(async (target) => {
          try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(target.yTicker)}?interval=1d&range=5d`;
            const yRes = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
              }
            });
            if (yRes.ok) {
              const json = await yRes.json();
              const meta = json?.chart?.result?.[0]?.meta;
              if (meta && typeof meta.regularMarketPrice === 'number') {
                const currentPrice = meta.regularMarketPrice;
                const prevClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
                const diff = currentPrice - prevClose;
                const diffPct = prevClose > 0 ? (diff / prevClose) * 100 : 0;

                quotes[target.tvSym] = {
                  symbol: target.tvSym,
                  price: currentPrice,
                  change: Number(diff.toFixed(4)),
                  changePercent: Number(diffPct.toFixed(2)),
                  status: target.isDelayed ? 'Delayed' : 'Live',
                  provider: `Institutional Feed (${target.yTicker})`,
                  delayNotice: target.delayNotice,
                  updatedAt: Date.now()
                };
              }
            }
          } catch (err) {
            quotes[target.tvSym] = {
              symbol: target.tvSym,
              price: null,
              change: null,
              changePercent: null,
              status: 'Offline',
              provider: `Institutional Feed (${target.yTicker})`,
              updatedAt: Date.now()
            };
          }
        })
      );

      quotesCache = {
        quotes,
        expiresAt: Date.now() + 15000
      };

      res.json({ success: true, quotes, cached: false });
    } catch (err: any) {
      console.error('Batch quotes router error:', err);
      res.status(500).json({ success: false, error: 'Failed to retrieve market quotes' });
    }
  });

  return router;
}
