import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Flame, 
  Scale, 
  CheckCircle2, 
  Brain,
  Minus
} from 'lucide-react';
import { CommandCenterSummary } from '@/types/commandCenter';
import { formatCurrency } from '@/lib/utils';

interface CommandCenterSummaryCardsProps {
  summary: CommandCenterSummary;
  visibleMetrics?: {
    todayPnl: boolean;
    tradesToday: boolean;
    riskUsedToday: boolean;
    currentStreak: boolean;
    averageR: boolean;
    ruleAdherence: boolean;
    psychologyCompletion: boolean;
  };
}

export const CommandCenterSummaryCards: React.FC<CommandCenterSummaryCardsProps> = ({
  summary,
  visibleMetrics = {
    todayPnl: true,
    tradesToday: true,
    riskUsedToday: true,
    currentStreak: true,
    averageR: true,
    ruleAdherence: true,
    psychologyCompletion: true,
  }
}) => {
  const isPnlPositive = summary.todayPnl !== null && summary.todayPnl > 0;
  const isPnlNegative = summary.todayPnl !== null && summary.todayPnl < 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 sm:gap-4 min-w-0">
      {/* 1. Today P&L */}
      {visibleMetrics.todayPnl && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Today P&L</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 min-w-0">
            <div className={`text-sm sm:text-base lg:text-lg font-bold truncate ${
              isPnlPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : isPnlNegative
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-800 dark:text-slate-200'
            }`} title={summary.todayPnlFormatted}>
              {summary.todayPnlFormatted}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.tradesTodayCount > 0 ? `${summary.tradesTodayCount} trade${summary.tradesTodayCount > 1 ? 's' : ''} logged` : 'No activity today'}
            </p>
          </div>
        </div>
      )}

      {/* 2. Trades Today */}
      {visibleMetrics.tradesToday && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Trades Today</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {summary.tradesTodayCount}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.tradesTodayCount === 0 ? 'No trades entered' : 'Total today'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Risk Used Today */}
      {visibleMetrics.riskUsedToday && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Risk Used Today</span>
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {summary.riskUsedTodayPercent !== null
                ? `${summary.riskUsedTodayPercent.toFixed(2)}%`
                : summary.riskUsedToday > 0
                ? formatCurrency(summary.riskUsedToday)
                : '0.00%'}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.riskUsedToday > 0 ? `${formatCurrency(summary.riskUsedToday)} total` : 'No capital at risk'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Current Streak */}
      {visibleMetrics.currentStreak && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Current Streak</span>
            <Flame className={`w-3.5 h-3.5 shrink-0 ${
              summary.currentStreak.type === 'WIN' 
                ? 'text-amber-500' 
                : summary.currentStreak.type === 'LOSS' 
                ? 'text-rose-500' 
                : 'text-slate-400'
            }`} />
          </div>
          <div className="mt-2 min-w-0">
            <div className={`text-sm sm:text-base lg:text-lg font-bold truncate ${
              summary.currentStreak.type === 'WIN' 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : summary.currentStreak.type === 'LOSS' 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {summary.currentStreak.text}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.currentStreak.type === 'WIN' ? 'Consecutive wins' : summary.currentStreak.type === 'LOSS' ? 'Consecutive losses' : 'Closed trades neutral'}
            </p>
          </div>
        </div>
      )}

      {/* 5. Average R */}
      {visibleMetrics.averageR && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Average R</span>
            <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 min-w-0">
            <div className={`text-sm sm:text-base lg:text-lg font-bold truncate ${
              summary.averageR !== null && summary.averageR > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.averageR !== null && summary.averageR < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {summary.averageRFormatted}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.closedTradesInRange > 0 ? `${summary.closedTradesInRange} closed trades` : 'No closed trades'}
            </p>
          </div>
        </div>
      )}

      {/* 6. Rule Adherence */}
      {visibleMetrics.ruleAdherence && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Rule Adherence</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 min-w-0">
            <div className={`text-sm sm:text-base lg:text-lg font-bold truncate ${
              summary.ruleAdherence !== null && summary.ruleAdherence >= 80
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.ruleAdherence !== null && summary.ruleAdherence < 70
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {summary.ruleAdherenceFormatted}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.ruleAdherence !== null ? 'Compliance' : 'No adherence logged'}
            </p>
          </div>
        </div>
      )}

      {/* 7. Psychology Completion */}
      {visibleMetrics.psychologyCompletion && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium min-w-0">
            <span className="truncate">Psych Completion</span>
            <Brain className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
          <div className="mt-2 min-w-0">
            <div className={`text-sm sm:text-base lg:text-lg font-bold truncate ${
              summary.psychologyCompletion !== null && summary.psychologyCompletion >= 75
                ? 'text-emerald-600 dark:text-emerald-400'
                : summary.psychologyCompletion !== null && summary.psychologyCompletion < 50
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}>
              {summary.psychologyCompletionFormatted}
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
              {summary.totalTradesInRange > 0 ? `${summary.totalTradesInRange} trades in view` : 'No trades logged'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
