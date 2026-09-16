import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { AcademyProvider } from '@/contexts/AcademyContext';
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
              <AcademyProvider>
              <OfflineIndicator />
              <App />
            </AcademyProvider>
            </ArenaProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
