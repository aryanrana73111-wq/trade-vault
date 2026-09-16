import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Flame, 
  ChevronRight, 
  BookOpen,
  Clock 
} from 'lucide-react';
import { LevelInfo } from '@/types/academy';

interface LearningPathNodeProps {
  levelInfo: LevelInfo;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  isLast?: boolean;
  onSelectLevel: (levelNumber: number) => void;
  className?: string;
}

export const LearningPathNode: React.FC<LearningPathNodeProps> = ({
  levelInfo,
  isUnlocked,
  isCompleted,
  isCurrent,
  completedLessonsCount,
  totalLessonsCount,
  isLast = false,
  onSelectLevel,
  className = ''
}) => {
  const pct = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  return (
    <div className={`relative flex items-start gap-4 sm:gap-6 ${className}`}>
      {/* Left Node & Vertical Connector Line */}
      <div className="flex flex-col items-center flex-shrink-0">
        <button
          onClick={() => isUnlocked && onSelectLevel(levelInfo.level)}
          disabled={!isUnlocked}
          className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-black text-sm transition-all relative z-10 ${
            isCurrent
              ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-500/20 shadow-blue-500/30'
              : isCompleted
              ? 'bg-emerald-600 text-white shadow-xs'
              : isUnlocked
              ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : isCurrent ? (
            <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          ) : isUnlocked ? (
            <span>L{levelInfo.level}</span>
          ) : (
            <Lock className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Vertical connector line */}
        {!isLast && (
          <div 
            className={`w-0.5 h-16 sm:h-20 my-1 transition-colors ${
              isCompleted 
                ? 'bg-emerald-500/60' 
                : isCurrent 
                ? 'bg-blue-500/40' 
                : 'bg-slate-200 dark:bg-slate-800'
            }`} 
          />
        )}
      </div>

      {/* Right Node Content Card */}
      <div 
        onClick={() => isUnlocked && onSelectLevel(levelInfo.level)}
        className={`flex-1 p-4 sm:p-5 rounded-2xl border transition-all ${
          isCurrent
            ? 'bg-white dark:bg-slate-850 border-blue-500/60 shadow-md cursor-pointer ring-1 ring-blue-500/10'
            : isCompleted
            ? 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 shadow-xs cursor-pointer'
            : isUnlocked
            ? 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-blue-400 shadow-xs cursor-pointer'
            : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-70'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                LEVEL {levelInfo.level}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {levelInfo.difficulty}
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Mastered
                </span>
              )}
            </div>

            <h4 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug mt-0.5">
              {levelInfo.title}
            </h4>
          </div>

          {/* Quick Progress pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">
            <span>{completedLessonsCount} / {totalLessonsCount} lessons</span>
            <div className="w-14 sm:w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
          {levelInfo.subtitle}
        </p>

        {/* Domain Focus Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          {levelInfo.domainFocus.map(d => (
            <span
              key={d}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400"
            >
              {d}
            </span>
          ))}

          {isUnlocked && (
            <div className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
              <span>{isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Enter'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
