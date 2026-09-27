// Runtime constraint: HMR is disabled in preview environment; suppress Vite WebSocket connection errors
if (typeof window !== 'undefined') {
  const origErr = console.error;
  const origWarn = console.warn;
  console.error = function (...args: any[]) {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('[vite]') || args[0].includes('WebSocket') || args[0].includes('ws://') || args[0].includes('wss://'))) {
      return;
    }
    return origErr.apply(console, args);
  };
  console.warn = function (...args: any[]) {
    if (args[0] && typeof args[0] === 'string' && (args[0].includes('[vite]') || args[0].includes('WebSocket') || args[0].includes('ws://') || args[0].includes('wss://'))) {
      return;
    }
    return origWarn.apply(console, args);
  };
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ArenaProvider } from '@/contexts/ArenaContext';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA update management in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
);
