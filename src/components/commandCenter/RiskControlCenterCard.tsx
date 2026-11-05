import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  DollarSign, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { Trade } from '@/types';
import { PlannedVsActualRiskItem, DrawdownProfileMetrics } from '@/types/commandCenter';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RiskControlCenterCardProps {
  trades: Trade[];
  plannedVsActual: PlannedVsActualRiskItem[];
  drawdownProfile: DrawdownProfileMetrics;
  onSelectTrade: (tradeId: string) => void;
}

export function RiskControlCenterCard({
  trades,
  plannedVsActual,
  drawdownProfile,
  onSelectTrade
}: RiskControlCenterCardProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'drawdown'>('matrix');

  const deviations = plannedVsActual.filter(i => !i.isCompliant);

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Risk Control Center & Drawdown Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auditing planned risk vs executed risk, drawdown recovery velocity, and sizing compliance.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Risk Matrix ({deviations.length} Deviations)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('drawdown')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'drawdown'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Drawdown Curve & Recovery
          </button>
        </div>
      </div>

      {/* Top 3 Risk Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Current Drawdown
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-rose-600 dark:text-rose-400 mt-1 block">
            -{formatCurrency(drawdownProfile.currentDrawdownDollar)} ({drawdownProfile.currentDrawdownPercent}%)
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Peak-to-valley depth
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Max Historical Drawdown
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            -{formatCurrency(drawdownProfile.maxHistoricalDrawdownDollar)} ({drawdownProfile.maxHistoricalDrawdownPercent}%)
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Historical worst episode
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Recovery Speed
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
            {drawdownProfile.longestRecoveryTrades} Trades ({drawdownProfile.longestRecoveryDays} Days)
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
            Recovery efficiency: {drawdownProfile.recoveryEfficiencyRate}%
          </span>
        </div>
      </div>

      {/* Tab 1: Planned vs Actual Risk Matrix Table */}
      {activeTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Planned vs Executed Risk Table
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Target baseline: 1.0% per trade
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5 sm:p-3">Market</th>
                  <th className="p-2.5 sm:p-3">Planned Risk</th>
                  <th className="p-2.5 sm:p-3">Actual Risk</th>
                  <th className="p-2.5 sm:p-3">Deviation</th>
                  <th className="p-2.5 sm:p-3">Status</th>
                  <th className="p-2.5 sm:p-3">Result</th>
                  <th className="p-2.5 sm:p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {plannedVsActual.slice(0, 8).map((item) => (
                  <tr key={item.tradeId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2.5 sm:p-3 font-bold text-slate-900 dark:text-slate-100">
                      {item.market} <span className="text-[10px] font-normal text-slate-400">({item.direction})</span>
                    </td>
                    <td className="p-2.5 sm:p-3 text-slate-600 dark:text-slate-300">
                      {item.plannedRiskPercent}%
                    </td>
                    <td className="p-2.5 sm:p-3 font-bold text-slate-900 dark:text-slate-100">
                      {item.actualRiskPercent}%
                    </td>
                    <td className="p-2.5 sm:p-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.deviationPercent > 10 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'text-slate-500'
                      }`}>
                        {item.deviationPercent > 0 ? '+' : ''}{item.deviationPercent}%
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3">
                      {item.isCompliant ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Compliant
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Exceeded
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 sm:p-3 font-bold">
                      <span className={item.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelectTrade(item.tradeId)}
                        className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Underwater Drawdown Curve */}
      {activeTab === 'drawdown' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Underwater Drawdown Trajectory
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Depth from previous high-water mark
            </span>
          </div>

          <div className="h-[220px] w-full min-w-0">
            {drawdownProfile.underwaterCurve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={drawdownProfile.underwaterCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="tradeIndex" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(val: number) => [formatCurrency(val), 'Drawdown Depth']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="drawdown" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Log closed trades to plot drawdown curve.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
