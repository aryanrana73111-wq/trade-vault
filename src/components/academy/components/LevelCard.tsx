import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Flame 
} from 'lucide-react';
import { LevelInfo } from '@/types/academy';

interface LevelCardProps {
  levelInfo: LevelInfo;
  isUnlocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  completedLessonsCount: number;
  totalLessonsCount: number;
  onSelectLevel: (levelNumber: number) => void;
  className?: string;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  levelInfo,
  isUnlocked,
  isCompleted,
  isCurrent,
  completedLessonsCount,
  totalLessonsCount,
  onSelectLevel,
  className = ''
}) => {
  const progressPct = totalLessonsCount > 0 
    ? Math.round((completedLessonsCount / totalLessonsCount) * 100) 
    : 0;

  return (
    <div
      className={`p-6 rounded-3xl transition-all border flex flex-col justify-between space-y-4 ${
        isCurrent
          ? 'bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-blue-950/20 dark:via-slate-850 dark:to-slate-850 border-blue-500/60 shadow-md ring-1 ring-blue-500/20'
          : isCompleted
          ? 'bg-white dark:bg-slate-850 border-emerald-500/30 shadow-xs'
          : isUnlocked
          ? 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 shadow-xs'
          : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 opacity-75'
      } ${className}`}
    >
      {/* Top Badges & Status */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black tracking-tight ${
                isCurrent
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Level {levelInfo.level}
            </span>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {levelInfo.difficulty}
            </span>
          </div>

          <div>
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mastered</span>
              </span>
            ) : isCurrent ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                <Flame className="w-3.5 h-3.5" />
                <span>In Progress</span>
              </span>
            ) : isUnlocked ? (
              <span className="text-[11px] font-semibold text-slate-400">
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Locked</span>
              </span>
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
          {levelInfo.title}
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
          {levelInfo.subtitle}
        </p>

        {/* Domain Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {levelInfo.domainFocus.slice(0, 3).map(domain => (
            <span
              key={domain}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {domain}
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar & Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>{completedLessonsCount} of {totalLessonsCount} lessons</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => onSelectLevel(levelInfo.level)}
          disabled={!isUnlocked}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            isCurrent
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              : isCompleted
              ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : isUnlocked
              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200'
              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>{isCompleted ? 'Review Modules' : isCurrent ? 'Continue Level' : isUnlocked ? 'Start Level' : 'Prerequisites Required'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
