import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, BarChart3, Globe, Layers, TrendingUp } from 'lucide-react';

/**
 * Singleton script loader registry.
 * Guarantees that each TradingView widget ES module script is injected only once into document.head,
 * reused across React re-renders and page navigation, and cleaned up on load failure.
 */
const scriptLoadingPromises = new Map<string, Promise<void>>();

export function loadTradingViewWidgetScript(src: string, customTagName: string): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // If the web component is already defined in the browser customElements registry, resolve immediately
  if (typeof customElements !== 'undefined' && customElements.get(customTagName)) {
    return Promise.resolve();
  }

  // Check if the script element is already present in the DOM
  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
  if (existingScript) {
    if (existingScript.dataset.loaded === 'true') {
      return Promise.resolve();
    }
    const cachedPromise = scriptLoadingPromises.get(src);
    if (cachedPromise) {
      return cachedPromise;
    }
  }

  const promise = new Promise<void>((resolve, reject) => {
    let script = existingScript;

    if (!script) {
      script = document.createElement('script');
      script.type = 'module';
      script.src = src;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    const onLoad = () => {
      if (script) {
        script.dataset.loaded = 'true';
      }
      resolve();
    };

    const onError = () => {
      scriptLoadingPromises.delete(src);
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(new Error(`Failed to load TradingView widget script: ${src}`));
    };

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    if (typeof customElements !== 'undefined' && customElements.whenDefined) {
      customElements
        .whenDefined(customTagName)
        .then(() => {
          if (script) {
            script.dataset.loaded = 'true';
          }
          resolve();
        })
        .catch(() => {});
    }
  });

  scriptLoadingPromises.set(src, promise);
  return promise;
}

// ============================================================================
// WIDGET 1: MARKET SUMMARY
// Script: https://widgets.tradingview-widget.com/w/en/tv-market-summary.js
// Custom Element: <tv-market-summary direction="horizontal"></tv-market-summary>
// ============================================================================

export interface TradingViewMarketSummaryProps {
  direction?: 'horizontal' | 'vertical';
  theme?: 'dark' | 'light';
  className?: string;
}

export function TradingViewMarketSummary({
  direction = 'horizontal',
  theme = 'dark',
  className = '',
}: TradingViewMarketSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-market-summary.js';
  const TAG_NAME = 'tv-market-summary';

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;

    setIsLoading(true);
    setLoadError(null);

    loadTradingViewWidgetScript(SCRIPT_URL, TAG_NAME)
      .then(() => {
        if (isCancelled || !container) return;

        // Clean up previous elements
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const el = document.createElement(TAG_NAME);
        el.setAttribute('direction', direction);
        el.setAttribute('theme', theme);
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Unable to load Market Summary widget');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [direction, theme, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0b0f19] border border-white/[0.08] overflow-hidden min-h-[52px] ${className}`}
      style={{ contain: 'paint' }}
      data-testid="tv-market-summary-container"
    >
      <div ref={containerRef} className="w-full h-full min-h-[52px]" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b0f19]/80 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-400">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Market Summary...</span>
          </div>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-between px-4 py-3 bg-[#0b0f19] text-xs z-10">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-slate-300">Market Summary unavailable ({loadError})</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs transition"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WIDGET 2: MARKET OVERVIEW
// Script: https://widgets.tradingview-widget.com/w/en/tv-market-overview.js
// Custom Element: <tv-market-overview symbol-sectors='...'></tv-market-overview>
// Configuration:
// [
//   {"sectionName":"Indices","symbols":["FOREXCOM:SPXUSD","FOREXCOM:NSXUSD","FOREXCOM:DJI","FOREXCOM:UKXGBP"]},
//   {"sectionName":"Stocks","symbols":["NASDAQ:AAPL","NASDAQ:ADBE","NASDAQ:NVDA","NASDAQ:TSLA"]},
//   {"sectionName":"Crypto","symbols":["BITSTAMP:BTCUSD","BITSTAMP:ETHUSD","CRYPTO:XRPUSD"]}
// ]
// ============================================================================

export const DEFAULT_MARKET_OVERVIEW_SECTORS = JSON.stringify([
  {
    sectionName: 'Indices',
    symbols: ['FOREXCOM:SPXUSD', 'FOREXCOM:NSXUSD', 'FOREXCOM:DJI', 'FOREXCOM:UKXGBP'],
  },
  {
    sectionName: 'Stocks',
    symbols: ['NASDAQ:AAPL', 'NASDAQ:ADBE', 'NASDAQ:NVDA', 'NASDAQ:TSLA'],
  },
  {
    sectionName: 'Crypto',
    symbols: ['BITSTAMP:BTCUSD', 'BITSTAMP:ETHUSD', 'CRYPTO:XRPUSD'],
  },
]);

export interface TradingViewMarketOverviewProps {
  symbolSectors?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export function TradingViewMarketOverview({
  symbolSectors = DEFAULT_MARKET_OVERVIEW_SECTORS,
  theme = 'dark',
  className = '',
}: TradingViewMarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-market-overview.js';
  const TAG_NAME = 'tv-market-overview';

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;

    setIsLoading(true);
    setLoadError(null);

    loadTradingViewWidgetScript(SCRIPT_URL, TAG_NAME)
      .then(() => {
        if (isCancelled || !container) return;

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const el = document.createElement(TAG_NAME);
        el.setAttribute('symbol-sectors', symbolSectors);
        el.setAttribute('theme', theme);
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Unable to load Market Overview widget');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [symbolSectors, theme, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0b0f19] border border-white/[0.08] overflow-hidden min-h-[500px] flex flex-col ${className}`}
      style={{ contain: 'paint' }}
      data-testid="tv-market-overview-container"
    >
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-sm text-white tracking-wide">Market Overview</h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">• Indices, Tech Stocks & Crypto</span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
          Official Feed
        </span>
      </div>

      <div ref={containerRef} className="w-full flex-1 min-h-[460px]" />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0f19]/85 backdrop-blur-xs z-10">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-300">Loading Market Overview...</span>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0b0f19] z-10">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2.5" />
          <h4 className="text-sm font-bold text-white mb-1">Market Overview Unavailable</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">{loadError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WIDGET 3: MARKET DATA
// Script: https://widgets.tradingview-widget.com/w/en/tv-market-data.js
// Custom Element: <tv-market-data symbol-sectors='...'></tv-market-data>
// Configuration:
// [
//   {"sectionName":"Indices","symbols":["FOREXCOM:SPXUSD","FOREXCOM:NSXUSD","FOREXCOM:DJI","INDEX:NKY","INDEX:DEU40","FOREXCOM:UKXGBP"]},
//   {"sectionName":"Futures","symbols":["BMFBOVESPA:ISP1!","BMFBOVESPA:EUR1!","CMCMARKETS:GOLD","TVC:USOIL","BMFBOVESPA:CCM1!"]},
//   {"sectionName":"Bonds","symbols":["EUREX:FGBL1!","EUREX:FBTP1!","EUREX:FGBM1!"]},
//   {"sectionName":"Forex","symbols":["FX:EURUSD","FX:GBPUSD","FX:USDJPY","FX:USDCHF","FX:AUDUSD","FX:USDCAD"]}
// ]
// ============================================================================

export const DEFAULT_MARKET_DATA_SECTORS = JSON.stringify([
  {
    sectionName: 'Indices',
    symbols: [
      'FOREXCOM:SPXUSD',
      'FOREXCOM:NSXUSD',
      'FOREXCOM:DJI',
      'INDEX:NKY',
      'INDEX:DEU40',
      'FOREXCOM:UKXGBP',
    ],
  },
  {
    sectionName: 'Futures',
    symbols: [
      'BMFBOVESPA:ISP1!',
      'BMFBOVESPA:EUR1!',
      'CMCMARKETS:GOLD',
      'TVC:USOIL',
      'BMFBOVESPA:CCM1!',
    ],
  },
  {
    sectionName: 'Bonds',
    symbols: ['EUREX:FGBL1!', 'EUREX:FBTP1!', 'EUREX:FGBM1!'],
  },
  {
    sectionName: 'Forex',
    symbols: [
      'FX:EURUSD',
      'FX:GBPUSD',
      'FX:USDJPY',
      'FX:USDCHF',
      'FX:AUDUSD',
      'FX:USDCAD',
    ],
  },
]);

export interface TradingViewMarketDataProps {
  symbolSectors?: string;
  theme?: 'dark' | 'light';
  className?: string;
}

export function TradingViewMarketData({
  symbolSectors = DEFAULT_MARKET_DATA_SECTORS,
  theme = 'dark',
  className = '',
}: TradingViewMarketDataProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-market-data.js';
  const TAG_NAME = 'tv-market-data';

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;

    setIsLoading(true);
    setLoadError(null);

    loadTradingViewWidgetScript(SCRIPT_URL, TAG_NAME)
      .then(() => {
        if (isCancelled || !container) return;

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const el = document.createElement(TAG_NAME);
        el.setAttribute('symbol-sectors', symbolSectors);
        el.setAttribute('theme', theme);
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Unable to load Market Data widget');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [symbolSectors, theme, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0b0f19] border border-white/[0.08] overflow-hidden min-h-[520px] flex flex-col ${className}`}
      style={{ contain: 'paint' }}
      data-testid="tv-market-data-container"
    >
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm text-white tracking-wide">Cross-Asset Market Data</h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">• Indices, Futures, Bonds & Forex</span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
          Multi-Asset Table
        </span>
      </div>

      <div ref={containerRef} className="w-full flex-1 min-h-[480px] overflow-x-auto" />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0f19]/85 backdrop-blur-xs z-10">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-300">Loading Cross-Asset Market Data...</span>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0b0f19] z-10">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2.5" />
          <h4 className="text-sm font-bold text-white mb-1">Market Data Table Unavailable</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">{loadError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// WIDGET 4: WORLD MARKET SUMMARY
// Script: https://widgets.tradingview-widget.com/w/en/tv-world-market-summary.js
// Custom Element: <tv-world-market-summary></tv-world-market-summary>
// ============================================================================

export interface TradingViewWorldMarketSummaryProps {
  theme?: 'dark' | 'light';
  className?: string;
}

export function TradingViewWorldMarketSummary({
  theme = 'dark',
  className = '',
}: TradingViewWorldMarketSummaryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-world-market-summary.js';
  const TAG_NAME = 'tv-world-market-summary';

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;

    setIsLoading(true);
    setLoadError(null);

    loadTradingViewWidgetScript(SCRIPT_URL, TAG_NAME)
      .then(() => {
        if (isCancelled || !container) return;

        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        const el = document.createElement(TAG_NAME);
        el.setAttribute('theme', theme);
        el.style.width = '100%';
        el.style.height = '100%';
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(
          err instanceof Error ? err.message : 'Unable to load World Market Summary widget'
        );
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [theme, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0b0f19] border border-white/[0.08] overflow-hidden min-h-[600px] flex flex-col ${className}`}
      style={{ contain: 'paint' }}
      data-testid="tv-world-market-summary-container"
    >
      <div className="px-5 py-3.5 border-b border-white/[0.06] bg-slate-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white tracking-wide">World Market Summary</h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">• Global Equities, Currencies & Commodities Map</span>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
          Interactive World Map
        </span>
      </div>

      <div ref={containerRef} className="w-full flex-1 min-h-[550px]" />

      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0b0f19]/85 backdrop-blur-xs z-10">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs font-semibold text-slate-300">Loading World Market Summary...</span>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#0b0f19] z-10">
          <AlertTriangle className="w-10 h-10 text-amber-400 mb-2.5" />
          <h4 className="text-sm font-bold text-white mb-1">World Market Summary Unavailable</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">{loadError}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shadow-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}
    </div>
  );
}
