import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateHoldingTimeAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { Timer, Clock, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface HoldingTimeEfficiencyProps {
  trades: Trade[];
}

function formatMinutes(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export function HoldingTimeEfficiency({ trades }: HoldingTimeEfficiencyProps) {
  const analytics = useMemo(() => calculateHoldingTimeAnalytics(trades), [trades]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Holding-Time Efficiency & Duration Profiles</h4>
            <p className="text-xs text-slate-400">Identify your optimal trade duration window and evaluate holding bias</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Median Duration:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {formatMinutes(analytics.medianHoldingMinutes)}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Avg Winner Duration</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-emerald-400">{formatMinutes(analytics.avgWinDurationMinutes)}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Time to target profit</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Avg Loser Duration</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-rose-400">{formatMinutes(analytics.avgLossDurationMinutes)}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Time to stop-out</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Shortest Winning Trade</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-white">
              {analytics.shortestProfitableTrade ? formatMinutes(analytics.shortestProfitableTrade.minutes) : 'N/A'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {analytics.shortestProfitableTrade ? `${analytics.shortestProfitableTrade.market} (+${formatCurrency(analytics.shortestProfitableTrade.pnl)})` : '-'}
          </span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Longest Losing Trade</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-amber-400">
              {analytics.longestLosingTrade ? formatMinutes(analytics.longestLosingTrade.minutes) : 'N/A'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {analytics.longestLosingTrade ? `${analytics.longestLosingTrade.market} (-${formatCurrency(Math.abs(analytics.longestLosingTrade.pnl))})` : '-'}
          </span>
        </Card>
      </div>

      {/* Duration Bucket Performance Table & Bar Chart */}
      <Card className="p-4 sm:p-5 bg-slate-900/70 border-slate-800">
        <h5 className="text-sm font-semibold text-white mb-1">Performance by Holding-Time Window</h5>
        <p className="text-xs text-slate-400 mb-4">Compare profitability and win rates across scalping, intraday, and multi-session holding durations</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {analytics.buckets.map(b => (
            <div key={b.range} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">{b.label}</span>
                <span className="text-xs text-slate-500">{b.tradeCount} executions</span>
              </div>
              <div>
                <span className={`text-base font-bold block ${b.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {b.netPnl >= 0 ? '+' : ''}{formatCurrency(b.netPnl)}
                </span>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Win Rate: <strong className="text-white">{b.winRate}%</strong></span>
                  <span>Avg: <strong className="text-blue-400">{b.avgR}R</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
