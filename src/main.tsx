// Runtime constraint: HMR is disabled in preview environment; suppress Vite WebSocket connection errors
// and benign third-party widget (TradingView / Canvas) ResizeObserver loop and datafeed timeout notifications
if (typeof window !== 'undefined') {
  const isIgnoredError = (msg?: unknown, source?: string, errorObj?: any) => {
    if (!msg && !source && !errorObj) return false;

    const collectStrings: string[] = [];
    if (msg) collectStrings.push(typeof msg === 'string' ? msg : String(msg));
    if (source) collectStrings.push(source);
    if (errorObj) {
      if (typeof errorObj.message === 'string') collectStrings.push(errorObj.message);
      if (typeof errorObj.stack === 'string') collectStrings.push(errorObj.stack);
      if (typeof errorObj.name === 'string') collectStrings.push(errorObj.name);
    }

    const combined = collectStrings.join(' ');
    return (
      combined.includes('ResizeObserver') ||
      combined.includes('ResizeObserver loop completed with undelivered notifications') ||
      combined.includes('ResizeObserver loop limit exceeded') ||
      combined.includes('[vite]') ||
      combined.includes('WebSocket') ||
      combined.includes('ws://') ||
      combined.includes('wss://') ||
      combined.includes('WDG-') ||
      combined.includes('WDG-065') ||
      combined.includes('tradingview-widget.com') ||
      combined.includes('tradingview.com') ||
      combined.includes('widgetdata.tradingview.com')
    );
  };

  // Suppress unhandled promise rejections from third-party widgets (e.g. TradingView subscribeBars timeout WDG-065)
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        isIgnoredError(
          reason?.message || (typeof reason === 'string' ? reason : undefined),
          undefined,
          reason instanceof Error ? reason : undefined
        )
      ) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );

  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    const reason = event.reason;
    if (
      isIgnoredError(
        reason?.message || (typeof reason === 'string' ? reason : undefined),
        undefined,
        reason instanceof Error ? reason : undefined
      )
    ) {
      event.preventDefault();
      return true;
    }
    return false;
  };

  // Suppress window error event (capture phase to intercept before error listeners)
  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      if (isIgnoredError(event.message, event.filename, event.error)) {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );

  // Suppress window.onerror
  const origOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    if (isIgnoredError(message, typeof source === 'string' ? source : undefined, error)) {
      return true; // Prevents the error from propagating to browser console or monitoring
    }
    if (origOnError) {
      return origOnError(message, source, lineno, colno, error);
    }
    return false;
  };

  const origErr = console.error;
  const origWarn = console.warn;
  console.error = function (...args: any[]) {
    for (const arg of args) {
      if (isIgnoredError(arg, undefined, arg instanceof Error ? arg : undefined)) {
        return;
      }
    }
    return origErr.apply(console, args);
  };
  console.warn = function (...args: any[]) {
    for (const arg of args) {
      if (isIgnoredError(arg, undefined, arg instanceof Error ? arg : undefined)) {
        return;
      }
    }
    return origWarn.apply(console, args);
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ArenaProvider } from '@/contexts/ArenaContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA update management in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({ immediate: true });
}

async function mountTradeVault() {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('TradeVault root element #root was not found.');
  }

  try {
    const [{ default: App }] = await Promise.all([
      import('./App.tsx')
    ]);

    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary fallbackTitle="Application Shell Safe Boot">
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <DataProvider>
                  <ArenaProvider>
                    <OfflineIndicator />
                    <App />
                  </ArenaProvider>
                </DataProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </StrictMode>
    );
  } catch (error: any) {
    console.error('TRADEVAULT APP BOOT FAILURE:', error);

    rootElement.innerHTML = `
      <div style="
        min-height:100vh;
        background:#020617;
        color:#f8fafc;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:24px;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      ">
        <div style="
          max-width:720px;
          width:100%;
          background:#0f172a;
          border:1px solid #334155;
          border-radius:18px;
          padding:28px;
          box-shadow:0 25px 60px rgba(0,0,0,.35);
        ">
          <div style="
            color:#f59e0b;
            font-size:11px;
            font-weight:800;
            letter-spacing:.08em;
            text-transform:uppercase;
          ">
            TRADEVAULT BOOT DIAGNOSTIC
          </div>

          <h1 style="
            margin:8px 0 0;
            font-size:21px;
            color:#fff;
          ">
            Application failed to load
          </h1>

          <p style="
            color:#94a3b8;
            line-height:1.6;
            font-size:13px;
            margin-top:8px;
          ">
            TradeVault could not load one of its application modules.
            The page has been stopped safely instead of showing a blank screen.
          </p>

          <pre style="
            margin-top:18px;
            padding:14px;
            border-radius:12px;
            background:#020617;
            border:1px solid #1e293b;
            color:#fda4af;
            font-size:12px;
            line-height:1.6;
            overflow:auto;
            white-space:pre-wrap;
          ">${String(error?.stack || error?.message || error)
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')}</pre>

          <div style="margin-top:18px; display:flex; gap:10px;">
            <button
              onclick="window.location.reload()"
              style="
                padding:10px 16px;
                border:0;
                border-radius:10px;
                background:#2563eb;
                color:white;
                font-weight:700;
                cursor:pointer;
              "
            >
              Reload TradeVault
            </button>
            <button
              onclick="localStorage.removeItem('tradevault_settings'); localStorage.removeItem('tradevault_last_dashboard'); window.location.href='/home';"
              style="
                padding:10px 16px;
                border:1px solid #334155;
                border-radius:10px;
                background:#1e293b;
                color:#cbd5e1;
                font-weight:700;
                cursor:pointer;
              "
            >
              Reset Cache & Go Home
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

mountTradeVault();
