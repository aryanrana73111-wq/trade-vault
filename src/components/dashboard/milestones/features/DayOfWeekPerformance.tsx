import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateDayOfWeekAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface DayOfWeekPerformanceProps {
  trades: Trade[];
}

export function DayOfWeekPerformance({ trades }: DayOfWeekPerformanceProps) {
  const days = useMemo(() => calculateDayOfWeekAnalytics(trades), [trades]);

  const bestDay = useMemo(() => {
    const withTrades = days.filter(d => d.tradeCount > 0);
    if (withTrades.length === 0) return null;
    return [...withTrades].sort((a, b) => b.netPnl - a.netPnl)[0];
  }, [days]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Day-of-Week Performance Profile</h4>
            <p className="text-xs text-slate-400">Historical performance distribution across Monday through Friday execution days</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Top Day:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            {bestDay ? `${bestDay.dayName} (+${formatCurrency(bestDay.netPnl)})` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Weekdays Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {days.map(d => (
          <Card key={d.dayIndex} className="p-4 bg-slate-900/70 border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{d.dayName}</span>
                <span className="text-[10px] text-slate-500">{d.tradeCount} trades</span>
              </div>
              <span className={`text-lg font-extrabold block mt-1.5 ${d.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {d.netPnl >= 0 ? '+' : ''}{formatCurrency(d.netPnl)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-semibold text-white">{d.winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg R:</span>
                <span className="font-semibold text-blue-400">{d.avgR}R</span>
              </div>
              <div className="flex justify-between">
                <span>Record:</span>
                <span className="font-semibold text-slate-300">{d.winCount}W / {d.lossCount}L</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bar Chart */}
      <Card className="p-4 sm:p-5 bg-slate-900/70 border-slate-800">
        <h5 className="text-sm font-semibold text-white mb-1">Net P&L by Weekday</h5>
        <p className="text-xs text-slate-400 mb-4">Cumulative dollar outcome aggregated for each day of the trading week</p>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="dayName" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <p className="font-bold text-white">{row.dayName}</p>
                        <p className="text-slate-300">Total P&L: <strong className={row.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{row.netPnl >= 0 ? '+' : ''}{formatCurrency(row.netPnl)}</strong></p>
                        <p className="text-slate-300">Win Rate: <strong className="text-white">{row.winRate}%</strong></p>
                        <p className="text-slate-300">Executions: <strong className="text-white">{row.tradeCount} trades</strong></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
              <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
                {days.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.netPnl >= 0 ? (entry.tradeCount > 0 ? '#10B981' : '#334155') : '#F43F5E'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
