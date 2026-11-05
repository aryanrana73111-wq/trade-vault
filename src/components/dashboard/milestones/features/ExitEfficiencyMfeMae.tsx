import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateExitEfficiencyAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { Crosshair, Info, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface ExitEfficiencyMfeMaeProps {
  trades: Trade[];
}

export function ExitEfficiencyMfeMae({ trades }: ExitEfficiencyMfeMaeProps) {
  const analytics = useMemo(() => calculateExitEfficiencyAnalytics(trades), [trades]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Exit Efficiency & MFE / MAE Excursion</h4>
            <p className="text-xs text-slate-400">Examines Maximum Favorable (MFE) vs Adverse (MAE) excursion to optimize profit capture</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Capture Efficiency:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs bg-teal-500/20 text-teal-400 border border-teal-500/30">
            {analytics.avgExitCaptureEfficiencyPct > 0 ? `${analytics.avgExitCaptureEfficiencyPct}% of Max Move` : 'Tracking Active'}
          </span>
        </div>
      </div>

      {/* Price Path Notice if data is minimal or required */}
      {!analytics.hasPricePathData && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-300">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Unlocked — additional price-path data is required for complete MFE/MAE analysis.</p>
            <p className="mt-0.5 text-blue-300/80">
              When logging trades with target/stop-loss distances or syncing via MT5, TradeVault automatically tracks peak intra-trade excursions.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Avg Exit Capture</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-teal-400">
              {analytics.avgExitCaptureEfficiencyPct > 0 ? `${analytics.avgExitCaptureEfficiencyPct}%` : 'N/A'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">of available favorable excursion</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Optimal Exits</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-400">{analytics.optimalExitTradesCount}</span>
            <span className="text-xs text-slate-500">trades</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">&gt;75% peak move captured</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Premature / Early Exits</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-400">{analytics.earlyExitTradesCount}</span>
            <span className="text-xs text-slate-500">trades</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Left &gt;50% of move on table</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Late / Rundown Exits</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-400">{analytics.lateExitTradesCount}</span>
            <span className="text-xs text-slate-500">trades</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Profit surrendered to adverse turn</span>
        </Card>
      </div>

      {/* Trade Excursion List */}
      <Card className="p-4 sm:p-5 bg-slate-900/70 border-slate-800">
        <h5 className="text-sm font-semibold text-white mb-1">Recent Execution Exit Efficiency</h5>
        <p className="text-xs text-slate-400 mb-4">Breakdown of entry, exit, targets, and captured movement percentage</p>

        <div className="space-y-2">
          {analytics.tradesBreakdown.slice(-8).reverse().map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${t.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {t.direction}
                </span>
                <span className="font-semibold text-white">{t.market}</span>
                <span className="text-slate-400">Entry: {t.entry}</span>
                {t.exit && <span className="text-slate-400 hidden sm:inline">Exit: {t.exit}</span>}
              </div>
              <div className="flex items-center gap-3">
                {t.exitEfficiencyPct !== undefined ? (
                  <span className={`font-mono font-bold ${t.exitEfficiencyPct >= 70 ? 'text-emerald-400' : t.exitEfficiencyPct >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {t.exitEfficiencyPct}% Captured
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">Intratrade data required</span>
                )}
              </div>
            </div>
          ))}
          {analytics.tradesBreakdown.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              No executed trades logged yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
