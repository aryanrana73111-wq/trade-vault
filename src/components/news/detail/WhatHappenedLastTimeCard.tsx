import React from 'react';
import { ReleaseHistoryEntry } from '@/types/eventIntelligence';
import { History, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

interface WhatHappenedLastTimeCardProps {
  entry: ReleaseHistoryEntry;
  unit?: string;
  eventName: string;
}

export function WhatHappenedLastTimeCard({
  entry,
  unit = '%',
  eventName
}: WhatHappenedLastTimeCardProps) {
  const isSurprisePositive = entry.surprise > 0;
  const isSurpriseNegative = entry.surprise < 0;

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              What Happened Last Time?
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Direct precedent from the previous comparable cycle ({entry.date})
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
          {entry.period}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Prior Actual
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {entry.actual}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Prior Consensus
          </span>
          <span className="text-base font-bold text-slate-700 dark:text-slate-300">
            {entry.consensus}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Surprise
          </span>
          <span className={`text-base font-bold ${
            isSurprisePositive ? 'text-emerald-600 dark:text-emerald-400' : isSurpriseNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
          }`}>
            {isSurprisePositive ? `+${entry.surprise}${unit}` : isSurpriseNegative ? `${entry.surprise}${unit}` : `0.0${unit}`}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            15m Gold Reaction
          </span>
          <span className={`text-base font-bold ${
            entry.marketReaction15m?.direction === 'UP' ? 'text-emerald-600 dark:text-emerald-400' : entry.marketReaction15m?.direction === 'DOWN' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
          }`}>
            {entry.marketReaction15m ? `${entry.marketReaction15m.pctMove > 0 ? '+' : ''}${entry.marketReaction15m.pctMove}%` : '—'}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-600 dark:text-slate-400">
        In the preceding cycle ({entry.date}), the print landed {entry.surpriseLabel.toLowerCase()}, driving a {entry.marketReaction15m?.direction === 'UP' ? 'positive upside continuation' : entry.marketReaction15m?.direction === 'DOWN' ? 'downside correction' : 'consolidation'} across benchmark instruments within the initial 15-minute trading window.
      </div>
    </div>
  );
}
