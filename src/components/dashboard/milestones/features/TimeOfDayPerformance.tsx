import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateTimeOfDayAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { Clock, TrendingUp, DollarSign, Target, Globe } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface TimeOfDayPerformanceProps {
  trades: Trade[];
}

export function TimeOfDayPerformance({ trades }: TimeOfDayPerformanceProps) {
  const data = useMemo(() => calculateTimeOfDayAnalytics(trades), [trades]);

  const activeHours = useMemo(() => data.filter(d => d.tradeCount > 0), [data]);
  const bestHour = useMemo(() => {
    if (activeHours.length === 0) return null;
    return [...activeHours].sort((a, b) => b.netPnl - a.netPnl)[0];
  }, [activeHours]);

  const highestVolumeHour = useMemo(() => {
    if (activeHours.length === 0) return null;
    return [...activeHours].sort((a, b) => b.tradeCount - a.tradeCount)[0];
  }, [activeHours]);

  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Local Timezone';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Execution Hour Distribution</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover which time blocks yield the highest expectancy and win rates</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 shadow-2xs">
          <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>Configured Timezone: <strong className="text-slate-900 dark:text-white">{userTimezone}</strong></span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Top Earning Hour</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{bestHour ? bestHour.label : 'N/A'}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            {bestHour ? `+${formatCurrency(bestHour.netPnl)} net P&L` : 'No trades logged'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Peak Execution Volume</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{highestVolumeHour ? highestVolumeHour.label : 'N/A'}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            {highestVolumeHour ? `${highestVolumeHour.tradeCount} trades executed` : 'No trades logged'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Active Trading Windows</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{activeHours.length}</span>
            <span className="text-xs text-slate-500">hours</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">out of 24h market clock</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Best Hourly Win Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {bestHour ? `${bestHour.winRate}%` : 'N/A'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            {bestHour ? `${bestHour.winCount}W / ${bestHour.lossCount}L` : '-'}
          </span>
        </Card>
      </div>

      {/* Hourly PnL Chart */}
      <Card className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
        <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Net P&L by Hour of Day</h5>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Total dollar outcome accumulated across all executions in each 60-minute window</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} interval={1} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">{row.label} Time Block</p>
                        <p className="text-slate-600 dark:text-slate-300">Trades: <strong className="text-slate-900 dark:text-white">{row.tradeCount}</strong></p>
                        <p className="text-slate-600 dark:text-slate-300">Win Rate: <strong className="text-emerald-600 dark:text-emerald-400">{row.winRate}%</strong> ({row.winCount}W / {row.lossCount}L)</p>
                        <p className="text-slate-600 dark:text-slate-300">Net P&L: <strong className={row.netPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{row.netPnl >= 0 ? '+' : ''}{formatCurrency(row.netPnl)}</strong></p>
                        <p className="text-slate-600 dark:text-slate-300">Avg R: <strong className="text-blue-600 dark:text-blue-400">{row.avgR}R</strong></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="3 3" />
              <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? (entry.tradeCount > 0 ? '#10B981' : '#94a3b8') : '#F43F5E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
