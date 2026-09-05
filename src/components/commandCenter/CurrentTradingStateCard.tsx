import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  SlidersHorizontal, 
  ShieldAlert, 
  CheckCircle2, 
  Brain, 
  Scale, 
  ArrowRight,
  Info
} from 'lucide-react';
import { CurrentTradingState, ComparisonWindowSize } from '@/types/commandCenter';

interface CurrentTradingStateCardProps {
  state: CurrentTradingState;
  onWindowSizeChange: (size: ComparisonWindowSize) => void;
  onInspectCohort: (tradeIds: string[], label: string) => void;
}

export const CurrentTradingStateCard: React.FC<CurrentTradingStateCardProps> = ({
  state,
  onWindowSizeChange,
  onInspectCohort
}) => {
  const getBadgeClasses = (variant: 'warning' | 'info' | 'success' | 'neutral' | 'danger') => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'risk':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'adherence':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'fomo':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'avg_r':
        return <Scale className="w-4 h-4 text-blue-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Current Trading State
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparative baseline analyzing your last {state.windowSize} trades against the previous {state.windowSize} trades.
            </p>
          </div>
        </div>

        {/* Window Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Window:
          </span>
          {([5, 10, 20] as ComparisonWindowSize[]).map(size => (
            <button
              key={size}
              onClick={() => onWindowSizeChange(size)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                state.windowSize === size
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {size} trades
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 4 Core State Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {state.metrics.map(metric => (
          <div 
            key={metric.key}
            className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.key)}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {metric.label}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeClasses(metric.badgeVariant)}`}>
                  {metric.badgeText}
                </span>
              </div>

              {/* Numbers */}
              <div className="mt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                    {metric.currentValueFormatted}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">
                    (Recent {state.recentTradesCount})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {metric.previousValueFormatted}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    prev {state.previousTradesCount}
                  </span>
                </div>
              </div>

              {/* Delta line */}
              <div className="mt-1 flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-700/40">
                <span className="text-slate-500 text-[11px]">Period Delta:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {metric.deltaFormatted}
                </span>
              </div>

              {/* Strict Language Discipline Observation */}
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/40 dark:border-slate-800">
                {metric.observationNote}
              </p>
            </div>

            <button
              onClick={() => onInspectCohort(state.recentTradeIds, `Recent ${state.recentTradesCount} Trades (${metric.label})`)}
              className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <span>Inspect {state.recentTradesCount} Trades</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
