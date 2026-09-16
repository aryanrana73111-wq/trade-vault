import React from 'react';
import { Trade } from '@/types';
import { AnalyticsMetrics } from '@/lib/analyticsEngine';
import { Card } from '@/components/ui/Input';
import { EquityChart } from '@/components/analytics/EquityChart';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  DollarSign, Target, Crosshair, TrendingUp, TrendingDown, Scale, Activity, ArrowUpRight, ArrowDownRight, Info, LineChart
} from 'lucide-react';

function StatCard({ title, value, icon, trend, tooltip, sampleSize }: { title: string, value: React.ReactNode, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' | 'none', tooltip?: string, sampleSize?: number }) {
  return (
    <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
          {tooltip && (
            <div className="group/tooltip relative">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                {tooltip}
                {sampleSize !== undefined && (
                  <div className="mt-1 pt-1 border-t border-slate-700 font-mono">
                    n = {sampleSize} trades
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2 relative z-10">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
        {trend !== 'none' && (
          <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
            trend === 'down' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : trend === 'down' ? <ArrowDownRight className="w-4 h-4 mr-0.5" /> : null}
          </span>
        )}
      </div>
    </Card>
  );
}

export function OverviewTab({ trades, metrics, onOpenEvidence }: { trades: Trade[], metrics: AnalyticsMetrics, onOpenEvidence?: any }) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Net P&L" tooltip="Total Realized Profit & Loss" sampleSize={metrics.closedTradesCount} 
          value={metrics.closedTradesCount > 0 ? formatCurrency(metrics.netPnl) : '--'}
          icon={<DollarSign className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : metrics.netPnl >= 0 ? 'up' : 'down'}
        />
        <StatCard 
          title="Win Rate" tooltip="Winning Trades / Total Closed Trades" sampleSize={metrics.closedTradesCount} 
          value={metrics.closedTradesCount > 0 ? `${formatNumber(metrics.winRate, 1)}%` : '--'}
          icon={<Target className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : metrics.winRate >= 50 ? 'up' : 'down'}
        />
        <StatCard 
          title="Expectancy" tooltip="Average Net P&L per Trade" sampleSize={metrics.closedTradesCount} 
          value={metrics.closedTradesCount > 0 ? formatCurrency(metrics.expectancy) : '--'}
          icon={<Crosshair className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : metrics.expectancy >= 0 ? 'up' : 'down'}
        />
        <StatCard 
          title="Profit Factor" tooltip="Gross Profit / Gross Loss" sampleSize={metrics.closedTradesCount} 
          value={metrics.closedTradesCount === 0 ? '--' : (metrics.profitFactor === 'MAX' ? 'MAX' : formatNumber(metrics.profitFactor as number, 2))}
          icon={<TrendingUp className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : (metrics.profitFactor === 'MAX' || (metrics.profitFactor as number) >= 1 ? 'up' : 'down')}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Average R" tooltip="Average Risk Multiple (R-Multiple) per Trade" sampleSize={metrics.closedTradesCount} 
          value={metrics.closedTradesCount > 0 ? `${formatNumber(metrics.averageR, 2)}R` : '--'}
          icon={<Target className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : metrics.averageR > 0 ? 'up' : 'down'}
        />
        <StatCard 
          title="Max Drawdown" tooltip="Maximum Peak-to-Trough Equity Drop" sampleSize={metrics.closedTradesCount} 
          value={metrics.closedTradesCount > 0 ? (metrics.maxDrawdown > 0 ? `-${formatCurrency(metrics.maxDrawdown)}` : '$0.00') : '--'}
          icon={<TrendingDown className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : metrics.maxDrawdown > 0 ? 'down' : 'neutral'}
        />
        <StatCard 
          title="Payoff Ratio" tooltip="Average Win / Average Loss" sampleSize={metrics.closedTradesCount}
          value={metrics.closedTradesCount > 0 ? formatNumber(metrics.payoffRatio, 2) : '--'}
          icon={<Scale className="w-5 h-5" />}
          trend={metrics.closedTradesCount === 0 ? 'none' : metrics.payoffRatio >= 1 ? 'up' : 'down'}
        />
        <StatCard 
          title="Total Trades" tooltip="Total Number of Trades"
          value={metrics.totalTrades}
          icon={<Activity className="w-5 h-5" />}
          trend="none"
        />
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-600" />
            Equity Curve
          </h3>
        </div>
        <EquityChart trades={trades} />
      </div>
    </div>
  );
}
