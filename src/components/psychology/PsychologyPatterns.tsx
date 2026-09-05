import React from 'react';
import { Card } from '@/components/ui/Input';
import { BehavioralPattern } from '@/lib/psychology';
import { Trade } from '@/types';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Flame,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Repeat,
  Compass
} from 'lucide-react';

interface PsychologyPatternsProps {
  patterns: BehavioralPattern[];
  onSelectEvidenceTrade?: (trade: Trade) => void;
}

export const PsychologyPatterns: React.FC<PsychologyPatternsProps> = ({
  patterns,
  onSelectEvidenceTrade
}) => {
  return (
    <Card className="p-4 sm:p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-500" /> Behavioral Pattern Detection
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Objective pattern recognition cross-referencing your timestamps, risk parameters, and emotional logs. Uses cautious observational language.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patterns.map(pat => {
          const isDetected = pat.status === 'Detected';
          const isInsufficient = pat.status === 'Insufficient Data';

          return (
            <div
              key={pat.id}
              className={cn(
                "p-4 rounded-xl border transition-all flex flex-col justify-between",
                isDetected
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60"
                  : isInsufficient
                  ? "bg-slate-50/50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800"
                  : "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    {pat.title}
                  </h4>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    isDetected ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" :
                    isInsufficient ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" :
                    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                  )}>
                    {pat.status}
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1.5">
                  {pat.observation}
                </p>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pat.historicalDetail}
                </p>
              </div>

              {pat.evidenceTrades.length > 0 && onSelectEvidenceTrade && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Recorded Evidence:</span>
                  {pat.evidenceTrades.slice(0, 3).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onSelectEvidenceTrade(t)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {t.market} ({t.direction})
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
