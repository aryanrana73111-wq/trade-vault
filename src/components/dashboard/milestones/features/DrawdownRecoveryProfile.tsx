import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateDrawdownRecoveryAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { TrendingDown, Shield, RefreshCw, Activity, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface DrawdownRecoveryProfileProps {
  trades: Trade[];
}

export function DrawdownRecoveryProfile({ trades }: DrawdownRecoveryProfileProps) {
  const analytics = useMemo(() => calculateDrawdownRecoveryAnalytics(trades), [trades]);

  const curveData = useMemo(() => {
    return analytics.equityCurveWithDrawdown.map(d => ({
      index: d.index,
      label: `Trade ${d.index}`,
      date: format(new Date(d.date), 'MMM dd'),
      drawdown: d.drawdown,
      drawdownPct: d.drawdownPct,
      equity: d.equity,
      peak: d.peakEquity
    }));
  }, [analytics.equityCurveWithDrawdown]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Drawdown & Recovery Profile</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Peak-to-trough drawdown depth, recovery velocity, and account resilience</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Current Drawdown:</span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs ${
            analytics.currentDrawdownDollars === 0
              ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30'
              : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30'
          }`}>
            {analytics.currentDrawdownDollars === 0 ? 'All-Time High ($0 Drawdown)' : `-$${analytics.currentDrawdownDollars} (${analytics.currentDrawdownPercent}%)`}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Maximum Drawdown</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">-${analytics.maxDrawdownDollars}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Peak Depth: {analytics.maxDrawdownPercent}%</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Avg Drawdown Episode</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">-${analytics.avgDrawdownDollars}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">{analytics.drawdownEpisodesCount} total episodes</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Avg Drawdown Duration</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{analytics.avgDrawdownDurationTrades}</span>
            <span className="text-xs text-slate-500">trades</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Recovery: ~{analytics.avgRecoveryDurationTrades} trades</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Largest Account Recovery</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+${analytics.largestRecoveryDollars}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Recovered to fresh highs</span>
        </Card>
      </div>

      {/* Underwater Drawdown Chart */}
      <Card className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Underwater Drawdown Curve ($)</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Continuous distance below previous all-time high equity</p>
          </div>
        </div>

        {curveData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{d.label} • {d.date}</p>
                          <p className="text-slate-600 dark:text-slate-300">Drawdown: <strong className="text-rose-600 dark:text-rose-400">${Math.abs(d.drawdown)} ({Math.abs(d.drawdownPct)}%)</strong></p>
                          <p className="text-slate-600 dark:text-slate-300">Equity: <strong className="text-slate-900 dark:text-white">${d.equity}</strong></p>
                          <p className="text-slate-500 dark:text-slate-400">Peak Equity: <strong className="text-emerald-600 dark:text-emerald-400">${d.peak}</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#10B981" strokeWidth={1.5} />
                <Area type="monotone" dataKey="drawdown" stroke="#F43F5E" fillOpacity={1} fill="url(#drawdownFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            Log completed trades to see drawdown trajectory.
          </div>
        )}
      </Card>
    </div>
  );
}
