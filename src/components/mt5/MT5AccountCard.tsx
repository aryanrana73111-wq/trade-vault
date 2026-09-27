import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCw, 
  PowerOff, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConnectedTradingAccount, MT5SyncResult } from '@/types/mt5';
import { mt5ClientService } from '@/services/mt5ClientService';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface MT5AccountCardProps {
  account: ConnectedTradingAccount;
  onRefresh?: () => void;
  onViewPositions?: (account: ConnectedTradingAccount) => void;
  dashboardId?: string;
}

export function MT5AccountCard({
  account,
  onRefresh,
  onViewPositions,
  dashboardId
}: MT5AccountCardProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const targetDash = dashboardId || account.targetDashboardId || 'default';
      const result: MT5SyncResult = await mt5ClientService.syncTrades(account.id, targetDash, 30);
      setSyncFeedback(`Sync complete: ${result.imported} new trades imported (${result.duplicates} duplicates verified).`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setSyncFeedback(err?.message || 'Sync failed.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 5000);
    }
  };

  const handleConfirmDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await mt5ClientService.disconnectAccount(account.id);
      setShowDisconnectConfirm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn('Disconnect notice:', err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatLastSync = (ts?: number) => {
    if (!ts) return 'Never';
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700/80 transition-all shadow-sm">
      {/* Top Details & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-100">{account.accountName || account.broker}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                account.status === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : account.status === 'syncing'
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {account.status}
              </span>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                {account.connectionType}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
              <span>{account.broker}</span>
              <span>•</span>
              <span className="text-slate-300">{account.server}</span>
              <span>•</span>
              <span className="text-blue-400">Acc: {account.accountNumber}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={handleManualSync}
            disabled={isSyncing || account.status === 'disconnected'}
            className="h-8 px-3 text-xs font-semibold gap-1.5 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            title="Synchronize trades now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </Button>

          {onViewPositions && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewPositions(account)}
              className="h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
              title="View live open positions"
            >
              <Layers className="w-3.5 h-3.5 mr-1" />
              <span>Positions ({account.openPositionsCount || 0})</span>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setShowDisconnectConfirm(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors"
            title="Disconnect MT5 account"
          >
            <PowerOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-2.5 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs text-blue-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Balance</span>
          <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">
            {formatCurrency(account.balance || 0)}
          </p>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Equity</span>
          <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">
            {formatCurrency(account.equity || 0)}
          </p>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Completed Trades</span>
          <p className="text-sm font-bold text-slate-200 mt-0.5">
            {account.completedTradesCount || 0}
          </p>
        </div>

        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Sync</span>
          <p className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatLastSync(account.lastSyncAt)}</span>
          </p>
        </div>
      </div>

      {/* Confirmation Modal: Disconnect */}
      {showDisconnectConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDisconnectConfirm(false)}
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <PowerOff className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-100">Disconnect MT5 Account?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Disconnecting MT5 will stop future background trade synchronization. <strong className="text-slate-200 font-semibold">Existing imported trades will remain preserved in your TradeVault journal.</strong>
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1 font-mono text-slate-400">
              <div>Account: <span className="text-slate-200">{account.accountNumber}</span></div>
              <div>Server: <span className="text-slate-200">{account.server}</span></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDisconnectConfirm(false)}
                disabled={isDisconnecting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDisconnect}
                disabled={isDisconnecting}
                className="bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
