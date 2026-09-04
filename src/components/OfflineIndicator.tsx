import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-slate-900/90 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white shadow-xl shadow-slate-900/20 border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <WifiOff className="w-4 h-4 text-amber-400" />
      <span>You are currently offline</span>
    </div>
  );
};
