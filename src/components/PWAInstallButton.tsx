import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <Button
        onClick={install}
        className="flex items-center gap-2"
        title="Install TradeVault"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Install App</span>
      </Button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <Button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2"
          title="Install TradeVault"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Install on iOS</span>
        </Button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl relative text-slate-900">
              <button onClick={() => setShowIOSGuide(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold mb-3">Install on iPhone / iPad</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <p>Add TradeVault to your home screen to use it as a standalone app.</p>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Tap the <strong>Share</strong> button in the Safari toolbar (looks like a square with an arrow pointing up).</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                </ol>
              </div>
              <Button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full"
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
