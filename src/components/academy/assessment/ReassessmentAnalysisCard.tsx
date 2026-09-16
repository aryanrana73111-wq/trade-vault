import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { AssessmentResult } from '@/types/assessment';
import { AcademyDomain } from '@/types/academy';

interface ReassessmentAnalysisCardProps {
  result: AssessmentResult;
  onSelectLesson?: (lessonId: string) => void;
}

export const ReassessmentAnalysisCard: React.FC<ReassessmentAnalysisCardProps> = ({
  result,
  onSelectLesson
}) => {
  const improved = result.improvedDomains || [];
  const weakDomains = result.remainingWeaknesses || result.weaknesses || [];
  const nextStudy = result.recommendedNextStudy || [];

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
            Reassessment Comparative Insights
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          Verified Longitudinal Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: What Improved? */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
            <TrendingUp className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              What Improved?
            </h4>
          </div>

          {improved.length > 0 ? (
            <div className="space-y-2">
              {improved.map(item => (
                <div 
                  key={item.domain}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.domain}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    +{item.diff}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No score increases registered yet. Practice curriculum concepts before re-testing.
            </p>
          )}
        </div>

        {/* Column 2: What Remains Weak? */}
        <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/15 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              What Remains Weak?
            </h4>
          </div>

          {weakDomains.length > 0 ? (
            <div className="space-y-2">
              {weakDomains.map(domain => {
                const score = result.domainScores[domain] || 0;
                return (
                  <div 
                    key={domain}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/40 flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {domain}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                      {score}%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Zero Critical Weaknesses
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All domains scored at or above the 60% baseline threshold.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: What Should I Study Next? */}
        <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/15 border border-blue-200/60 dark:border-blue-900/40 space-y-3">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
            <BookOpen className="w-4 h-4" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              What Should I Study Next?
            </h4>
          </div>

          <div className="space-y-2">
            {nextStudy.map(item => (
              <div
                key={item.lessonId}
                onClick={() => onSelectLesson && onSelectLesson(item.lessonId)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800/40 hover:border-blue-500 transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {item.domain}
                  </span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-2">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
