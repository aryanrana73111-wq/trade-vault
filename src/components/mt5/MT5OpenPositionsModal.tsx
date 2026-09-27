import React, { useEffect, useState } from 'react';
import { 
  X, 
  Layers, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConnectedTradingAccount, MT5OpenPosition } from '@/types/mt5';
import { mt5ClientService } from '@/services/mt5ClientService';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface MT5OpenPositionsModalProps {
  account: ConnectedTradingAccount | null;
  onClose: () => void;
}

export function MT5OpenPositionsModal({ account, onClose }: MT5OpenPositionsModalProps) {
  const [positions, setPositions] = useState<MT5OpenPosition[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPositions = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const data = await mt5ClientService.getOpenPositions(account.id);
      setPositions(data);
    } catch (err) {
      console.warn('Failed to fetch open positions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchPositions();
    }
  }, [account]);

  if (!account) return null;

  const totalFloatingPnl = positions.reduce((acc, p) => acc + (p.pnl || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Open MT5 Positions</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                  Unrealized
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {account.broker} • {account.server} • Acc: {account.accountNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPositions}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Refresh positions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="px-6 py-2.5 bg-amber-950/20 border-b border-amber-900/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Open positions are unrealized and not mixed with completed journal trades.</span>
          </div>
          <span className="font-mono font-bold">
            Total Floating: {totalFloatingPnl >= 0 ? '+' : ''}{formatCurrency(totalFloatingPnl)}
          </span>
        </div>

        {/* Positions List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Loading live positions from MT5...</p>
            </div>
          ) : positions.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
              <Layers className="w-8 h-8 text-slate-600 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-200">No Open Positions</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no active open trades on this MT5 account. All completed deals are stored in your journal.
              </p>
            </div>
          ) : (
            positions.map(p => (
              <div 
                key={p.id}
                className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    p.direction === 'BUY'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {p.direction === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{p.mappedMarket || p.symbol}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        p.direction === 'BUY' ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                      }`}>
                        {p.direction}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{p.volume} lots</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Entry: {p.openPrice} • Current: {p.currentPrice} {p.sl ? `• SL: ${p.sl}` : ''} {p.tp ? `• TP: ${p.tp}` : ''}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-sm font-mono ${
                    p.pnl > 0 ? 'text-emerald-400' : p.pnl < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {p.pnl >= 0 ? '+' : ''}{formatCurrency(p.pnl)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Ticket #{p.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/30 flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs font-semibold">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
