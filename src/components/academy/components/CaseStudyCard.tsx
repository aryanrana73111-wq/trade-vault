import React from 'react';
import { History, ShieldAlert, ArrowRight, Calendar, AlertTriangle } from 'lucide-react';
import { CaseStudy } from '@/types/academy';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  onSelect: (caseStudy: CaseStudy) => void;
  className?: string;
}

export const CaseStudyCard: React.FC<CaseStudyCardProps> = ({
  caseStudy,
  onSelect,
  className = ''
}) => {
  return (
    <div
      onClick={() => onSelect(caseStudy)}
      className={`group p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              Institutional Crisis
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {caseStudy.dateOrEra}
            </span>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {caseStudy.difficulty}
          </span>
        </div>

        <h4 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
          {caseStudy.title}
        </h4>
        <p className="text-xs font-semibold text-rose-600/90 dark:text-rose-400/90 mt-0.5">
          {caseStudy.subtitle}
        </p>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {caseStudy.context}
        </p>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-[11px] font-medium truncate">
            <strong>Dilemma:</strong> {caseStudy.decisionPoint}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(caseStudy);
          }}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 group-hover:bg-rose-600 text-slate-800 group-hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-rose-600 transition-all flex items-center justify-center gap-1.5"
        >
          <span>Deconstruct Crisis Decisions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
