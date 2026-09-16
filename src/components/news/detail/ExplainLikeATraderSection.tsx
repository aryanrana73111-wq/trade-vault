import React from 'react';
import { ExplainLikeATraderData } from '@/types/eventIntelligence';
import { Sparkles, MessageSquare, AlertCircle, Compass, ArrowRight } from 'lucide-react';

interface ExplainLikeATraderSectionProps {
  data: ExplainLikeATraderData;
}

export function ExplainLikeATraderSection({ data }: ExplainLikeATraderSectionProps) {
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Explain Like a Trader
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Executive Synthesis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* 1. WHAT HAPPENED? */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. What Happened?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {data.whatHappened}
            </p>
          </div>
        </div>

        {/* 2. WHY DOES IT MATTER? */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                2. Why Does it Matter?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {data.whyItMatters}
            </p>
          </div>
        </div>

        {/* 3. WHAT CHANGED? */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                3. What Changed?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {data.whatChanged}
            </p>
          </div>
        </div>

        {/* 4. WHAT SHOULD I WATCH NEXT? */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                4. What Should I Watch Next?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {data.whatToWatchNext}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
