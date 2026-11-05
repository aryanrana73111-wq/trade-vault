import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle, RefreshCw, BarChart2 } from 'lucide-react';

export interface TradingViewAdvancedChartProps {
  /**
   * Financial instrument symbol (e.g., 'NASDAQ:NDX', 'BINANCE:BTCUSDT', 'FX:EURUSD').
   * Defaults to 'NASDAQ:NDX'.
   */
  symbol?: string;

  /**
   * Chart timeframe/interval (e.g., '1', '5', '15', '60', '240', 'D', 'W').
   * Defaults to '15' (15-minute timeframe).
   */
  interval?: string;

  /**
   * Whether to allow the user to search and change symbols directly within the widget.
   * Defaults to true.
   */
  allowSymbolChange?: boolean;

  /**
   * Visual theme matching TradeVault dark aesthetic.
   * Defaults to 'dark'.
   */
  theme?: 'dark' | 'light';

  /**
   * Optional custom CSS class for outer container.
   */
  className?: string;

  /**
   * Optional callback when chart mounting succeeds.
   */
  onReady?: () => void;
}

/**
 * Script singleton to ensure https://widgets.tradingview-widget.com/w/en/tv-advanced-chart.js
 * is injected into document.head only once and shared across mounts/re-renders.
 */
const TRADINGVIEW_WIDGET_SCRIPT_URL = 'https://widgets.tradingview-widget.com/w/en/tv-advanced-chart.js';

let scriptLoaderPromise: Promise<void> | null = null;

export function loadTradingViewScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  // If the web component is already defined in the customElements registry, resolve immediately
  if (typeof customElements !== 'undefined' && customElements.get('tv-advanced-chart')) {
    return Promise.resolve();
  }

  // If script tag already exists in DOM
  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${TRADINGVIEW_WIDGET_SCRIPT_URL}"]`
  );

  if (existingScript) {
    if (existingScript.dataset.loaded === 'true') {
      return Promise.resolve();
    }
    if (scriptLoaderPromise) {
      return scriptLoaderPromise;
    }
  }

  // Create loading promise singleton
  scriptLoaderPromise = new Promise<void>((resolve, reject) => {
    let script = existingScript;

    if (!script) {
      script = document.createElement('script');
      script.type = 'module';
      script.src = TRADINGVIEW_WIDGET_SCRIPT_URL;
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
      // Clear cached promise on failure to allow retry
      scriptLoaderPromise = null;
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      reject(
        new Error(
          'Failed to load TradingView Advanced Chart script. Please check your network connection, ad blocker, or firewall settings.'
        )
      );
    };

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    // In modern browsers, whenDefined can safely resolve when element registers
    if (typeof customElements !== 'undefined' && customElements.whenDefined) {
      customElements
        .whenDefined('tv-advanced-chart')
        .then(() => {
          if (script) {
            script.dataset.loaded = 'true';
          }
          resolve();
        })
        .catch(() => {});
    }
  });

  return scriptLoaderPromise;
}

/**
 * Normalizes input symbol strings to standard TradingView format.
 * Defaults to 'NASDAQ:NDX'.
 */
export function formatTradingViewSymbol(symbol?: string): string {
  if (!symbol) return 'NASDAQ:NDX';
  const trimmed = symbol.trim();
  if (!trimmed) return 'NASDAQ:NDX';
  if (trimmed.includes(':')) return trimmed;

  const upper = trimmed.toUpperCase();
  switch (upper) {
    case '^NDX':
    case 'NASDAQ':
    case 'NDX':
    case 'US100':
    case 'NAS100':
      return 'NASDAQ:NDX';
    case '^GSPC':
    case 'SPX':
    case 'SP500':
    case 'US500':
      return 'FOREXCOM:SPXUSD';
    case 'EUR/USD':
    case 'EURUSD':
      return 'FX:EURUSD';
    case 'GBP/USD':
    case 'GBPUSD':
      return 'FX:GBPUSD';
    case 'USD/JPY':
    case 'USDJPY':
      return 'FX:USDJPY';
    case 'XAU/USD':
    case 'XAUUSD':
    case 'GOLD':
      return 'OANDA:XAUUSD';
    case 'BTC/USDT':
    case 'BTCUSD':
    case 'BTCUSDT':
    case 'BTC':
      return 'BINANCE:BTCUSDT';
    case 'ETH/USDT':
    case 'ETHUSD':
    case 'ETHUSDT':
    case 'ETH':
      return 'BINANCE:ETHUSDT';
    default:
      if (upper.includes('/')) {
        return `FX:${upper.replace('/', '')}`;
      }
      return `NASDAQ:${upper}`;
  }
}

/**
 * Normalizes input interval strings (e.g. '15m' -> '15', '1h' -> '60', '1D' -> 'D').
 * Defaults to '15'.
 */
export function formatTradingViewInterval(interval?: string): string {
  if (!interval) return '15';
  const clean = interval.trim().toLowerCase();
  switch (clean) {
    case '1m':
    case '1':
      return '1';
    case '3m':
    case '3':
      return '3';
    case '5m':
    case '5':
      return '5';
    case '15m':
    case '15':
      return '15';
    case '30m':
    case '30':
      return '30';
    case '1h':
    case '60m':
    case '60':
      return '60';
    case '2h':
    case '120':
      return '120';
    case '4h':
    case '240':
      return '240';
    case '1d':
    case 'd':
      return 'D';
    case '1w':
    case 'w':
      return 'W';
    default:
      return interval;
  }
}

/**
 * TradingViewAdvancedChart
 *
 * Professional TradingView Advanced Chart Web Component (<tv-advanced-chart>).
 * Features:
 * - Singleton script loader (no duplicate script tags on re-renders/navigation)
 * - Safe programmatic DOM mounting inside ref container (no React reconciliation conflicts)
 * - Complete unmount cleanup
 * - Graceful loading indicator & error fallback with retry
 * - Dark theme matching TradeVault aesthetic
 */
export function TradingViewAdvancedChart({
  symbol = 'NASDAQ:NDX',
  interval = '15',
  allowSymbolChange = true,
  theme = 'dark',
  className = '',
  onReady,
}: TradingViewAdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState<number>(0);

  const resolvedSymbol = formatTradingViewSymbol(symbol);
  const resolvedInterval = formatTradingViewInterval(interval);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    setRetryNonce((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const container = containerRef.current;

    setIsLoading(true);
    setLoadError(null);

    loadTradingViewScript()
      .then(() => {
        if (isCancelled || !container) return;

        // Clean up previous chart instances inside container
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        // Dynamically instantiate the <tv-advanced-chart> custom element
        const chartElement = document.createElement('tv-advanced-chart');
        chartElement.setAttribute('symbol', resolvedSymbol);
        chartElement.setAttribute('interval', resolvedInterval);
        chartElement.setAttribute('theme', theme);
        if (allowSymbolChange) {
          chartElement.setAttribute('allow-symbol-change', '');
        }

        // Enable official documented Advanced Chart features
        chartElement.setAttribute('calendar', '');
        chartElement.setAttribute('withdateranges', '');
        chartElement.setAttribute('show-popup-button', '');
        chartElement.setAttribute('save-image', '');
        chartElement.setAttribute('timezone', 'Etc/UTC');
        chartElement.setAttribute('locale', 'en');

        // Responsive full container styling
        chartElement.style.width = '100%';
        chartElement.style.height = '100%';
        chartElement.style.display = 'block';

        container.appendChild(chartElement);
        setIsLoading(false);

        if (onReady) {
          onReady();
        }
      })
      .catch((err: unknown) => {
        if (isCancelled) return;
        setIsLoading(false);
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load TradingView chart widget.';
        setLoadError(message);
      });

    // Cleanup: upon unmount, empty container to prevent memory leaks and orphaned DOM nodes
    return () => {
      isCancelled = true;
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [resolvedSymbol, resolvedInterval, allowSymbolChange, theme, retryNonce, onReady]);

  return (
    <div
      className={`relative w-full h-full min-h-[480px] bg-[#0b0f19] overflow-hidden flex flex-col ${className}`}
      style={{ contain: 'paint' }}
      data-testid="tradingview-advanced-chart-container"
    >
      {/* Target Mount Container for <tv-advanced-chart> */}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 relative z-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0b0f19]/90 backdrop-blur-xs pointer-events-none">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3 shadow-lg shadow-blue-500/20" />
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <BarChart2 className="w-4 h-4 text-blue-400" />
            <span>Loading TradingView Advanced Chart</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            {resolvedSymbol} • {resolvedInterval}m
          </div>
        </div>
      )}

      {/* Error Fallback with Retry */}
      {loadError && !isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#0b0f19]/95 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">
            TradingView Chart Unavailable
          </h3>
          <p className="text-xs text-slate-400 max-w-md mb-5 leading-relaxed">
            {loadError}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Loading Chart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default TradingViewAdvancedChart;
