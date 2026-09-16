import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Award, 
  MapPin, 
  ArrowRight,
  Sparkles 
} from 'lucide-react';
import { ACADEMY_LEVELS } from '@/data/academy/levels';

interface LevelProgressionGraphProps {
  currentLevel: number;
  recommendedStartingLevel: number;
  unlockedLevels?: number[];
  onSelectLevel?: (level: number) => void;
}

export const LevelProgressionGraph: React.FC<LevelProgressionGraphProps> = ({
  currentLevel,
  recommendedStartingLevel,
  unlockedLevels = [],
  onSelectLevel
}) => {
  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Curriculum Progression Graph (Levels 0 → 10)
        </span>
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            Current Level ({currentLevel})
          </span>
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
            <MapPin className="w-3 h-3 text-amber-500 inline-block" />
            Recommended Start ({recommendedStartingLevel})
          </span>
        </div>
      </div>

      {/* Horizontal Progression Roadmap */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-[720px] p-2 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          {ACADEMY_LEVELS.map((lvl, index) => {
            const isCurrent = lvl.level === currentLevel;
            const isRecommendedStart = lvl.level === recommendedStartingLevel;
            const isUnlocked = lvl.level <= currentLevel || unlockedLevels.includes(lvl.level);
            const isPassed = lvl.level < currentLevel;

            return (
              <React.Fragment key={lvl.level}>
                <div
                  onClick={() => onSelectLevel && onSelectLevel(lvl.level)}
                  className={`group relative p-3 rounded-xl border flex-1 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400/40'
                      : isRecommendedStart
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      : isPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200'
                      : isUnlocked
                      ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                      : 'bg-slate-100/60 dark:bg-slate-900/30 border-slate-200/40 dark:border-slate-800/40 text-slate-400 opacity-60'
                  }`}
                >
                  {/* Floating Marker Badge */}
                  {isRecommendedStart && (
                    <span className="absolute -top-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 flex items-center gap-0.5 shadow-xs whitespace-nowrap">
                      <MapPin className="w-2.5 h-2.5" />
                      Start
                    </span>
                  )}
                  {isCurrent && !isRecommendedStart && (
                    <span className="absolute -top-2.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-white text-blue-700 flex items-center gap-0.5 shadow-xs whitespace-nowrap">
                      Active
                    </span>
                  )}

                  {/* Level Number & Icon */}
                  <div className="flex items-center gap-1 mb-1">
                    {isPassed ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-500'}`} />
                    ) : isUnlocked ? (
                      <Award className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-blue-500'}`} />
                    ) : (
                      <Lock className="w-3 h-3 text-slate-400" />
                    )}
                    <span className="text-xs font-black">L{lvl.level}</span>
                  </div>

                  {/* Level Short Title */}
                  <p className={`text-[10px] font-bold line-clamp-1 max-w-[80px] ${
                    isCurrent ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {lvl.title.replace('Level ' + lvl.level + ': ', '').replace('Level ' + lvl.level + ' - ', '')}
                  </p>
                </div>

                {/* Arrow Connector between steps */}
                {index < ACADEMY_LEVELS.length - 1 && (
                  <div className="text-slate-300 dark:text-slate-700 shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
