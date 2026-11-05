import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, Activity, Globe, Flame, Newspaper, TrendingUp } from 'lucide-react';
import { loadTradingViewWidgetScript } from '@/components/charts/TradingViewWidgets';

/**
 * Hook to dynamically resolve and track the active TradeVault UI theme ('dark' | 'light').
 * Listens to settings update events and MutationObserver on <html class="...">.
 */
export function useResolvedTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('light') ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const checkTheme = () => {
      if (typeof document !== 'undefined') {
        const isLight = document.documentElement.classList.contains('light');
        setTheme(isLight ? 'light' : 'dark');
      }
    };

    checkTheme();
    window.addEventListener('tradevault_settings_updated', checkTheme);

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('tradevault_settings_updated', checkTheme);
      observer.disconnect();
    };
  }, []);

  return theme;
}

// ============================================================================
// WIDGET 1: TICKER TAPE
// Script: https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js
// Custom Element: <tv-ticker-tape>
// ============================================================================

export const TICKER_TAPE_SYMBOLS = 'FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD';

export interface TradingViewTickerTapeProps {
  theme?: 'dark' | 'light';
  symbols?: string;
  className?: string;
}

export function TradingViewTickerTape({
  theme,
  symbols = TICKER_TAPE_SYMBOLS,
  className = '',
}: TradingViewTickerTapeProps) {
  const resolvedTheme = useResolvedTheme();
  const activeTheme = theme || resolvedTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
  const TAG_NAME = 'tv-ticker-tape';

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
        el.setAttribute('symbols', symbols);
        el.setAttribute('theme', activeTheme);
        el.setAttribute('color-theme', activeTheme);
        el.style.width = '100%';
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Failed to load TradingView Ticker Tape');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [activeTheme, symbols, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 shadow-2xs ${className}`}
      style={{ contain: 'paint' }}
    >
      {isLoading && (
        <div className="h-14 w-full flex items-center justify-between px-4 bg-slate-50/70 dark:bg-slate-900/60 text-slate-400 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="font-medium text-slate-600 dark:text-slate-300">Loading live market ticker tape...</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">TradingView Ticker Tape</span>
        </div>
      )}

      {loadError && (
        <div className="h-14 w-full flex items-center justify-between px-4 bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{loadError}</span>
          </div>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="tradingview-ticker-tape-container"
        className={`w-full min-h-[46px] ${isLoading || loadError ? 'hidden' : 'block'}`}
      />
    </div>
  );
}

// ============================================================================
// WIDGET 2: FOREX TABLE
// Script: https://widgets.tradingview-widget.com/w/en/tv-forex-table.js
// Custom Element: <tv-forex-table>
// ============================================================================

export interface TradingViewForexTableProps {
  theme?: 'dark' | 'light';
  className?: string;
  minHeight?: number;
}

export function TradingViewForexTable({
  theme,
  className = '',
  minHeight = 440,
}: TradingViewForexTableProps) {
  const resolvedTheme = useResolvedTheme();
  const activeTheme = theme || resolvedTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-forex-table.js';
  const TAG_NAME = 'tv-forex-table';

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
        el.setAttribute('theme', activeTheme);
        el.setAttribute('color-theme', activeTheme);
        el.setAttribute('width', '100%');
        el.setAttribute('height', `${minHeight}px`);
        el.style.width = '100%';
        el.style.height = `${minHeight}px`;
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Failed to load TradingView Forex Table');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [activeTheme, minHeight, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-xs ${className}`}
      style={{ contain: 'paint' }}
    >
      {isLoading && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-900/60 text-slate-400 text-xs animate-pulse"
        >
          <Activity className="w-6 h-6 text-blue-500 animate-spin mb-3" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Loading Foreign Exchange Cross Rates...</span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">TradingView Forex Table</span>
        </div>
      )}

      {loadError && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs"
        >
          <AlertTriangle className="w-6 h-6 mb-2" />
          <span className="font-semibold">{loadError}</span>
          <button
            onClick={handleRetry}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="tradingview-forex-table-container"
        className={`w-full ${isLoading || loadError ? 'hidden' : 'block'}`}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}

// ============================================================================
// WIDGET 3: STOCK HEATMAP
// Script: https://widgets.tradingview-widget.com/w/en/tv-heatmap.js
// Custom Element: <tv-heatmap>
// Attributes: heatmap-type="stock" data-source="SPX500" grouping="sector" block-size="market_cap_basic" block-color="change"
// ============================================================================

export interface TradingViewStockHeatmapProps {
  theme?: 'dark' | 'light';
  dataSource?: string;
  grouping?: string;
  blockSize?: string;
  blockColor?: string;
  className?: string;
  minHeight?: number;
}

export function TradingViewStockHeatmap({
  theme,
  dataSource = 'SPX500',
  grouping = 'sector',
  blockSize = 'market_cap_basic',
  blockColor = 'change',
  className = '',
  minHeight = 540,
}: TradingViewStockHeatmapProps) {
  const resolvedTheme = useResolvedTheme();
  const activeTheme = theme || resolvedTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-heatmap.js';
  const TAG_NAME = 'tv-heatmap';

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
        el.setAttribute('heatmap-type', 'stock');
        el.setAttribute('data-source', dataSource);
        el.setAttribute('grouping', grouping);
        el.setAttribute('block-size', blockSize);
        el.setAttribute('block-color', blockColor);
        el.setAttribute('theme', activeTheme);
        el.setAttribute('color-theme', activeTheme);
        el.setAttribute('width', '100%');
        el.setAttribute('height', `${minHeight}px`);
        el.style.width = '100%';
        el.style.height = `${minHeight}px`;
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Failed to load TradingView Stock Heatmap');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [activeTheme, dataSource, grouping, blockSize, blockColor, minHeight, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-xs ${className}`}
      style={{ contain: 'paint' }}
    >
      {isLoading && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-900/60 text-slate-400 text-xs animate-pulse"
        >
          <Flame className="w-6 h-6 text-rose-500 animate-pulse mb-3" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Loading S&P 500 Sector Heatmap...</span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">TradingView Stock Heatmap</span>
        </div>
      )}

      {loadError && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs"
        >
          <AlertTriangle className="w-6 h-6 mb-2" />
          <span className="font-semibold">{loadError}</span>
          <button
            onClick={handleRetry}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="tradingview-stock-heatmap-container"
        className={`w-full ${isLoading || loadError ? 'hidden' : 'block'}`}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}

// ============================================================================
// WIDGET 4: ECONOMIC MAP
// Script: https://widgets.tradingview-widget.com/w/en/tv-economic-map.js
// Custom Element: <tv-economic-map>
// ============================================================================

export interface TradingViewEconomicMapProps {
  theme?: 'dark' | 'light';
  className?: string;
  minHeight?: number;
}

export function TradingViewEconomicMap({
  theme,
  className = '',
  minHeight = 520,
}: TradingViewEconomicMapProps) {
  const resolvedTheme = useResolvedTheme();
  const activeTheme = theme || resolvedTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-economic-map.js';
  const TAG_NAME = 'tv-economic-map';

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
        el.setAttribute('theme', activeTheme);
        el.setAttribute('color-theme', activeTheme);
        el.setAttribute('width', '100%');
        el.setAttribute('height', `${minHeight}px`);
        el.style.width = '100%';
        el.style.height = `${minHeight}px`;
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Failed to load TradingView Economic Map');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [activeTheme, minHeight, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-xs ${className}`}
      style={{ contain: 'paint' }}
    >
      {isLoading && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-900/60 text-slate-400 text-xs animate-pulse"
        >
          <Globe className="w-6 h-6 text-blue-500 animate-pulse mb-3" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Loading Global Economic Map...</span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">TradingView Economic Map</span>
        </div>
      )}

      {loadError && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs"
        >
          <AlertTriangle className="w-6 h-6 mb-2" />
          <span className="font-semibold">{loadError}</span>
          <button
            onClick={handleRetry}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="tradingview-economic-map-container"
        className={`w-full ${isLoading || loadError ? 'hidden' : 'block'}`}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}

// ============================================================================
// WIDGET 5: NEWS FEED
// Script: https://widgets.tradingview-widget.com/w/en/tv-news-feed.js
// Custom Element: <tv-news-feed>
// ============================================================================

export interface TradingViewNewsFeedProps {
  theme?: 'dark' | 'light';
  className?: string;
  minHeight?: number;
}

export function TradingViewNewsFeed({
  theme,
  className = '',
  minHeight = 550,
}: TradingViewNewsFeedProps) {
  const resolvedTheme = useResolvedTheme();
  const activeTheme = theme || resolvedTheme;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nonce, setNonce] = useState<number>(0);

  const SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-news-feed.js';
  const TAG_NAME = 'tv-news-feed';

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
        el.setAttribute('theme', activeTheme);
        el.setAttribute('color-theme', activeTheme);
        el.setAttribute('width', '100%');
        el.setAttribute('height', `${minHeight}px`);
        el.style.width = '100%';
        el.style.height = `${minHeight}px`;
        el.style.display = 'block';

        container.appendChild(el);
        setIsLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setIsLoading(false);
        setLoadError(err instanceof Error ? err.message : 'Failed to load TradingView News Feed');
      });

    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [activeTheme, minHeight, nonce]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 shadow-xs ${className}`}
      style={{ contain: 'paint' }}
    >
      {isLoading && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-slate-900/60 text-slate-400 text-xs animate-pulse"
        >
          <Newspaper className="w-6 h-6 text-blue-500 animate-pulse mb-3" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Loading TradingView Global News Feed...</span>
          <span className="text-[11px] text-slate-400 mt-1 font-mono">TradingView News Feed</span>
        </div>
      )}

      {loadError && (
        <div
          style={{ height: `${minHeight}px` }}
          className="w-full flex flex-col items-center justify-center p-6 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs"
        >
          <AlertTriangle className="w-6 h-6 mb-2" />
          <span className="font-semibold">{loadError}</span>
          <button
            onClick={handleRetry}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        data-testid="tradingview-news-feed-container"
        className={`w-full ${isLoading || loadError ? 'hidden' : 'block'}`}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}
