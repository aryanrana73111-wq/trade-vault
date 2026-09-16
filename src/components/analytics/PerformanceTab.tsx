import React, { useState } from 'react';
import { Trade } from '@/types';
import { AnalyticsMetrics } from '@/lib/analyticsEngine';
import { Card } from '@/components/ui/Input';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Info, Activity, ShieldAlert, BarChart2 } from 'lucide-react';

function MetricRow({ label, value, tooltip }: { label: string, value: React.ReactNode, tooltip: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <div className="group/tooltip relative">
          <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help" />
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block w-56 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
            {tooltip}
          </div>
        </div>
      </div>
      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}

export function PerformanceTab({ trades, metrics }: { trades: Trade[], metrics: AnalyticsMetrics }) {
  const insufficientData = metrics.closedTradesCount < 10;
  
  return (
    <div className="space-y-6 animate-in fade-in">
      {insufficientData && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Insufficient Sample Size</h4>
            <p className="text-sm opacity-90 mt-1">
              Many advanced performance metrics require a larger sample size (at least 10-30 trades) to be statistically significant. Results below may be misleading until more trades are logged.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Core Ratios */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Core Ratios</h3>
          </div>
          <div className="space-y-1">
            <MetricRow label="Profit Factor" value={metrics.profitFactor === 'MAX' ? 'MAX' : formatNumber(metrics.profitFactor as number, 2)} tooltip="Gross Profit divided by Gross Loss. Above 1.0 is profitable." />
            <MetricRow label="Payoff Ratio" value={formatNumber(metrics.payoffRatio, 2)} tooltip="Average Win divided by Average Loss." />
            <MetricRow label="Expectancy (P&L)" value={formatCurrency(metrics.expectancy)} tooltip="Average amount expected to be won or lost per trade." />
            <MetricRow label="Expectancy (R)" value={`${formatNumber(metrics.averageR, 2)}R`} tooltip="Average R-Multiple per trade." />
            <MetricRow label="Median R" value={`${formatNumber(metrics.medianR, 2)}R`} tooltip="The midpoint R-Multiple. Often more representative than average if you have massive outlier wins." />
          </div>
        </Card>

        {/* Risk-Adjusted Returns */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Risk-Adjusted</h3>
          </div>
          <div className="space-y-1">
            <MetricRow label="Sharpe Ratio" value={metrics.sharpeRatio !== null ? formatNumber(metrics.sharpeRatio, 2) : 'N/A'} tooltip="Measures return relative to overall volatility. Higher is better." />
            <MetricRow label="Sortino Ratio" value={metrics.sortinoRatio !== null ? formatNumber(metrics.sortinoRatio, 2) : 'N/A'} tooltip="Measures return relative to downside volatility. Typically preferred over Sharpe for trading." />
            <MetricRow label="Calmar Ratio" value={metrics.calmarRatio !== null ? formatNumber(metrics.calmarRatio, 2) : 'N/A'} tooltip="Measures return relative to maximum drawdown." />
            <MetricRow label="System Quality (SQN)" value={metrics.sqn !== null ? formatNumber(metrics.sqn, 2) : 'N/A'} tooltip="System Quality Number. > 1.6 = Average, > 2.0 = Good, > 3.0 = Excellent." />
            <MetricRow label="Recovery Factor" value={formatNumber(metrics.recoveryFactor, 2)} tooltip="Net Profit divided by Maximum Drawdown. Measures how quickly a system recovers from dips." />
          </div>
        </Card>

        {/* Drawdown & Risk */}
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Drawdown & Risk</h3>
          </div>
          <div className="space-y-1">
            <MetricRow label="Maximum Drawdown" value={formatCurrency(metrics.maxDrawdown)} tooltip="The largest peak-to-trough drop in equity." />
            <MetricRow label="Average Drawdown" value={formatCurrency(metrics.averageDrawdown)} tooltip="The average size of equity dips before recovering." />
            <MetricRow label="Risk of Ruin" value={metrics.riskOfRuin !== null ? `${formatNumber(metrics.riskOfRuin, 2)}%` : 'N/A'} tooltip="Estimated probability of losing the entire account based on win rate and payoff ratio." />
            <MetricRow label="Gross Loss" value={formatCurrency(metrics.grossLoss)} tooltip="Total sum of all losing trades." />
            <MetricRow label="Gross Profit" value={formatCurrency(metrics.grossProfit)} tooltip="Total sum of all winning trades." />
          </div>
        </Card>
            </div>
      
      {/* Time-Based Periodicity (Daily / Weekly / Monthly) */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Cumulative Progress</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Total P&L</div>
             <div className={`text-xl font-bold ${metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
               {formatCurrency(metrics.netPnl)}
             </div>
           </div>
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Cumulative R</div>
             <div className={`text-xl font-bold ${metrics.averageR * metrics.closedTradesCount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
               {metrics.closedTradesCount > 0 ? (metrics.averageR * metrics.closedTradesCount).toFixed(2) + 'R' : '0R'}
             </div>
           </div>
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Average Win</div>
             <div className="text-xl font-bold text-emerald-600">
               {formatCurrency(metrics.averageWin)}
             </div>
           </div>
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Average Loss</div>
             <div className="text-xl font-bold text-rose-600">
               -{formatCurrency(metrics.averageLoss)}
             </div>
           </div>
        </div>
      </Card>
    </div>
  );
}
