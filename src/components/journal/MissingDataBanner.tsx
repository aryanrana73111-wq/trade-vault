import React, { useState } from 'react';
import { AlertCircle, ChevronRight, X, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trade } from '@/types';
import { getTradeCompleteness } from '@/lib/tradeCompleteness';

interface MissingDataBannerProps {
  trades: Trade[];
  onSelectFilter: (filterId: string) => void;
  activeFilter?: string;
}

export function MissingDataBanner({
  trades,
  onSelectFilter,
  activeFilter
}: MissingDataBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || trades.length === 0) return null;

  // Calculate missing counts across all user trades
  let incompleteCount = 0;
  let missingScreenshots = 0;
  let missingStrategies = 0;
  let missingLearnings = 0;
  let missingPsychology = 0;
  let missingExitPrices = 0;

  trades.forEach(trade => {
    const comp = getTradeCompleteness(trade);
    if (comp.hasMissingData) {
      incompleteCount++;
      comp.missingItems.forEach(item => {
        if (item.id === 'screenshot') missingScreenshots++;
        if (item.id === 'strategy') missingStrategies++;
        if (item.id === 'learning') missingLearnings++;
        if (item.id === 'psychology') missingPsychology++;
        if (item.id === 'exitPrice') missingExitPrices++;
      });
    }
  });

  if (incompleteCount === 0) {
    return null; // All trades are 100% complete!
  }

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 transition-all duration-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 rounded-lg flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                {incompleteCount} {incompleteCount === 1 ? 'trade needs' : 'trades need'} journal completion
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Missing Data Detected
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Refine your empirical trade log by attaching screenshots, learnings, and strategies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === 'Needs Review' ? 'All' : 'Needs Review')}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm",
              activeFilter === 'Needs Review'
                ? "bg-amber-600 text-white"
                : "bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
            )}
          >
            <span>Review Incomplete</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Filter className="w-3 h-3 text-slate-400" />
          Filter by missing:
        </span>
        {missingScreenshots > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === 'Missing Screenshot' ? 'All' : 'Missing Screenshot')}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors font-medium flex items-center gap-1",
              activeFilter === 'Missing Screenshot'
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{missingScreenshots} missing screenshots</span>
          </button>
        )}
        {missingStrategies > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === 'Missing Strategy' ? 'All' : 'Missing Strategy')}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors font-medium flex items-center gap-1",
              activeFilter === 'Missing Strategy'
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{missingStrategies} missing strategy</span>
          </button>
        )}
        {missingLearnings > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === 'Missing Learning' ? 'All' : 'Missing Learning')}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors font-medium flex items-center gap-1",
              activeFilter === 'Missing Learning'
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{missingLearnings} missing learning</span>
          </button>
        )}
        {missingPsychology > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === 'Missing Psychology' ? 'All' : 'Missing Psychology')}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors font-medium flex items-center gap-1",
              activeFilter === 'Missing Psychology'
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{missingPsychology} missing psychology</span>
          </button>
        )}
        {missingExitPrices > 0 && (
          <button
            type="button"
            onClick={() => onSelectFilter(activeFilter === 'Missing Exit Price' ? 'All' : 'Missing Exit Price')}
            className={cn(
              "text-xs px-2.5 py-1 rounded-full border transition-colors font-medium flex items-center gap-1",
              activeFilter === 'Missing Exit Price'
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300"
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{missingExitPrices} missing exit price</span>
          </button>
        )}
      </div>
    </div>
  );
}
