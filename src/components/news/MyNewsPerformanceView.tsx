import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { computeNewsTradePerformance } from '@/lib/news/newsStore';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  ArrowRight,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface MyNewsPerformanceViewProps {
  trades: Trade[];
}

export function MyNewsPerformanceView({ trades }: MyNewsPerformanceViewProps) {
  const navigate = useNavigate();
  const metrics = useMemo(() => computeNewsTradePerformance(trades), [trades]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 text-white rounded-3xl border border-purple-900/40 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-600/30 text-purple-400 border border-purple-500/30">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Empirical Journal Edge Diagnostics</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            My News & Catalyst Execution Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real performance comparison between trades executed during economic catalysts versus normal technical setups. Discover whether high-impact events add or subtract edge from your trading.
          </p>
        </div>
      </div>

      {/* Primary Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* News vs Non-News Win Rate */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-slate-400 text-xs font-semibold uppercase">Win Rate Comparison</span>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.newsWinRate}%</span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 block font-medium">News Trades ({metrics.newsTradesCount})</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-500">{metrics.nonNewsWinRate}%</span>
              <span className="text-[11px] text-slate-400 block font-medium">Standard Trades ({metrics.nonNewsTradesCount})</span>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mt-3">
            <div className="bg-blue-600 h-full" style={{ width: `${metrics.newsWinRate}%` }} />
          </div>
        </div>

        {/* Net PnL Comparison */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-slate-400 text-xs font-semibold uppercase">Net P&L Attribution</span>
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <span className={`text-2xl font-bold ${metrics.newsNetPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                ${metrics.newsNetPnl.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block font-medium">Catalyst P&L</span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${metrics.nonNewsNetPnl >= 0 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                ${metrics.nonNewsNetPnl.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block font-medium">Standard P&L</span>
            </div>
          </div>
        </div>

        {/* Average Risk % on News */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <span className="text-slate-400 text-xs font-semibold uppercase">Avg Risk Per News Trade</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white pt-1">
            {metrics.avgRiskPercentNews > 0 ? `${metrics.avgRiskPercentNews}%` : '1.0%'}
          </div>
          <span className="text-xs text-slate-400 block">
            {metrics.avgRiskPercentNews > 1.5 ? (
              <span className="text-rose-500 font-semibold">Elevated risk vs 1% rule</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Prudent risk sizing</span>
            )}
          </span>
        </div>
      </div>

      {/* Psychology & Behavioral Triggers During News */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Emotional & Behavioral Triggers During Economic Releases
          </h3>
        </div>

        {Object.keys(metrics.newsEmotionsFrequency).length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(metrics.newsEmotionsFrequency).map(([emotion, count]) => (
              <div key={emotion} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">{emotion}</span>
                <span className="text-slate-400 text-[11px]">{count} occurrence{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            No emotional tags recorded yet on news trades. Tag your emotions (e.g. FOMO, Disciplined, Impatient) in the Journal to uncover cognitive biases under volatility.
          </p>
        )}
      </div>

      {/* Algorithmic Process Recommendations */}
      <div className="p-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-200 dark:border-blue-900/50 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-base text-blue-950 dark:text-blue-200">
            Personalized Execution Guidance
          </h3>
        </div>

        <div className="space-y-2.5">
          {metrics.recommendations.map((rec, i) => (
            <div key={i} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <Target className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          Want to link an existing trade to an economic release?
        </span>
        <Button
          size="sm"
          onClick={() => navigate('/journal')}
          className="text-xs gap-1.5"
        >
          Go to Journal <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
