import React from 'react';
import { Award, GraduationCap, ChevronRight, TrendingUp, Sparkles, BookOpenCheck } from 'lucide-react';
import { ProgressRing } from './ProgressRing';

interface MasteryCardProps {
  overallMastery: number; // 0 - 100
  completedLessonsCount: number;
  totalLessonsCount: number;
  masteredConceptsCount: number;
  currentLevel: number;
  onExploreRoadmap?: () => void;
  className?: string;
}

export const MasteryCard: React.FC<MasteryCardProps> = ({
  overallMastery,
  completedLessonsCount,
  totalLessonsCount,
  masteredConceptsCount,
  currentLevel,
  onExploreRoadmap,
  className = ''
}) => {
  const pct = Math.min(100, Math.max(0, isNaN(overallMastery) ? 0 : Math.round(overallMastery)));
  const hasStarted = completedLessonsCount > 0 || pct > 0;

  // Derive professional tier based on progress & level
  const getTraderTier = () => {
    if (pct >= 90) return { title: 'Institutional Risk Officer', color: 'text-amber-400 bg-amber-500/10 border-amber-400/30' };
    if (pct >= 70) return { title: 'Senior Desk Strategist', color: 'text-purple-400 bg-purple-500/10 border-purple-400/30' };
    if (pct >= 40) return { title: 'Quantitative Practitioner', color: 'text-blue-400 bg-blue-500/10 border-blue-400/30' };
    if (pct >= 15) return { title: 'Prop Desk Trainee', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/30' };
    return { title: 'Market Apprentice', color: 'text-slate-400 bg-slate-500/10 border-slate-400/30' };
  };

  const tier = getTraderTier();

  return (
    <div className={`p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 ${className}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Institutional Status
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.color}`}>
              {tier.title}
            </span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Overall Curriculum Mastery
          </h3>
        </div>

        {/* Circular Progress Display */}
        <ProgressRing 
          value={pct} 
          size={74} 
          strokeWidth={6} 
          color="stroke-blue-600 dark:stroke-blue-400"
        />
      </div>

      {/* Stats or Empty State */}
      {hasStarted ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block">Lessons Completed</span>
            <span className="text-base font-black text-slate-900 dark:text-slate-100">
              {completedLessonsCount} <span className="text-xs font-normal text-slate-400">/ {totalLessonsCount}</span>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block">Concepts Mastered</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {masteredConceptsCount}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-0.5">No learning activity yet.</p>
          Complete Level 0 modules or run the diagnostic placement test to begin calculating your verified institutional mastery.
        </div>
      )}

      {/* Footer Action */}
      {onExploreRoadmap && (
        <button
          onClick={onExploreRoadmap}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>View Curriculum Roadmap</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
