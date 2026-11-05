import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateStreakAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { Flame, TrendingUp, TrendingDown, ArrowRight, ShieldCheck, Zap, Activity, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface WinLossStreakAnalyzerProps {
  trades: Trade[];
}

export function WinLossStreakAnalyzer({ trades }: WinLossStreakAnalyzerProps) {
  const analytics = useMemo(() => calculateStreakAnalytics(trades), [trades]);

  const chartData = useMemo(() => {
    return analytics.streakHistory.slice(-15).map((s, idx) => ({
      index: idx + 1,
      label: `Streak #${idx + 1} (${s.type})`,
      count: s.type === 'WIN' ? s.count : -s.count,
      actualCount: s.count,
      type: s.type,
      pnl: s.pnl,
      startDate: format(new Date(s.startDate), 'MMM dd'),
      endDate: format(new Date(s.endDate), 'MMM dd')
    }));
  }, [analytics.streakHistory]);

  return (
    <div className="space-y-6">
      {/* Header Info Note */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Win/Loss Streak Dynamics</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Historical streak momentum and cumulative P&L behavior during runs</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Current Status:</span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs ${
            analytics.currentStreakType === 'WIN'
              ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30'
              : analytics.currentStreakType === 'LOSS'
              ? 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
          }`}>
            {analytics.currentStreakType === 'WIN' && <TrendingUp className="w-3.5 h-3.5" />}
            {analytics.currentStreakType === 'LOSS' && <TrendingDown className="w-3.5 h-3.5" />}
            {analytics.currentStreakCount > 0 ? `${analytics.currentStreakCount} Consecutive ${analytics.currentStreakType === 'WIN' ? 'Wins' : 'Losses'}` : 'Neutral'}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Longest Win Streak</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.longestWinStreak}</span>
            <span className="text-xs text-slate-500">trades</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Avg: {analytics.avgWinStreak} consecutive</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Longest Loss Streak</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{analytics.longestLossStreak}</span>
            <span className="text-xs text-slate-500">trades</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Avg: {analytics.avgLossStreak} consecutive</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">P&L in Win Streaks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(analytics.pnlInWinStreaks)}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Avg: +{formatCurrency(analytics.avgPnlPerWinStreak)} / run</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">P&L in Loss Streaks</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">-{formatCurrency(Math.abs(analytics.pnlInLossStreaks))}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Avg: -{formatCurrency(Math.abs(analytics.avgPnlPerLossStreak))} / run</span>
        </Card>
      </div>

      {/* Streak Sequence Bar Chart */}
      <Card className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Streak Sequences</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Green = Winning run count, Red = Consecutive loss count</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Wins</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Losses</span>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{data.type === 'WIN' ? 'Winning Streak' : 'Losing Streak'}</p>
                          <p className="text-slate-600 dark:text-slate-300">Length: <strong className="text-slate-900 dark:text-white">{data.actualCount} trades</strong></p>
                          <p className="text-slate-600 dark:text-slate-300">P&L Generated: <strong className={data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{data.pnl >= 0 ? '+' : ''}{formatCurrency(data.pnl)}</strong></p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{data.startDate} → {data.endDate}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="3 3" />
                <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'WIN' ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            Log completed trades to see streak sequence analysis.
          </div>
        )}
      </Card>
    </div>
  );
}
