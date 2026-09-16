import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Target, 
  Clock, 
  Award, 
  Layers, 
  ShieldCheck, 
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { VisualLearningPathState } from '@/lib/academy/adaptiveLearningEngine';
import { Lesson, CurriculumConcept } from '@/types/academy';
import { HorizontalScrollRow } from './HorizontalScrollRow';

interface VisualLearningPathProps {
  visualPath: VisualLearningPathState;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenConcept?: (concept: CurriculumConcept) => void;
  className?: string;
}

export const VisualLearningPath: React.FC<VisualLearningPathProps> = ({
  visualPath,
  onOpenLesson,
  onOpenConcept,
  className = ''
}) => {
  const {
    currentPosition,
    completedConcepts,
    currentFocus,
    nextConcept,
    futureConcepts
  } = visualPath;

  return (
    <div className={`space-y-8 ${className}`}>
      {/* 1. CURRENT POSITION HEADER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Current Position • Level {currentPosition.level}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {currentPosition.statusText}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {currentPosition.levelTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {currentPosition.levelDescription}
            </p>

            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Core Domains:
              </span>
              {currentPosition.domainFocus.map((domain) => (
                <span
                  key={domain}
                  className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {domain}
                </span>
              ))}
            </div>
          </div>

          {/* Overall Mastery Meter */}
          <div className="w-full md:w-auto p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex flex-col items-center justify-center text-center shrink-0 min-w-[170px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Verified Mastery
            </span>
            <div className="text-3xl sm:text-4xl font-black text-blue-400">
              {currentPosition.overallMastery}%
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-700 mt-2.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${currentPosition.overallMastery}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 font-medium">
              Based on concrete quiz & lesson evidence
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE SEQUENTIAL STEPPING ROADMAP: Completed -> Current Focus -> Next -> Future */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Personalized Learning Path
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Evidence-Based Sequence
          </span>
        </div>

        {/* STEP 1: COMPLETED CONCEPTS */}
        <div className="space-y-3">
          {completedConcepts.length > 0 ? (
            <HorizontalScrollRow
              title={
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Completed Concepts ({completedConcepts.length})</span>
                </div>
              }
              showControls={true}
              itemSpacing="gap-3"
            >
              {completedConcepts.map((item) => (
                <div
                  key={item.concept.id}
                  className="min-w-[260px] sm:min-w-[280px] p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start justify-between gap-3 shrink-0 snap-start group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                        Level {item.concept.level} • {item.concept.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.concept.title}
                    </h4>
                    {item.quizBestScore !== undefined && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                        Quiz Score: {item.quizBestScore}%
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenLesson(item.lesson)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-600 hover:text-white transition-colors shrink-0"
                  >
                    Review
                  </button>
                </div>
              ))}
            </HorizontalScrollRow>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No completed modules recorded yet. Start with your next concept below to build verified mastery.
            </div>
          )}
        </div>

        {/* STEP 2: CURRENT FOCUS */}
        {currentFocus && (
          <div className="p-5 sm:p-6 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-500/40 dark:border-blue-700/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                  Current Focus
                </span>
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  Level {currentFocus.concept.level} • {currentFocus.concept.category}
                </span>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                In Progress
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {currentFocus.concept.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {currentFocus.keyTakeaway}
                </p>
              </div>

              <button
                onClick={() => onOpenLesson(currentFocus.lesson)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center justify-center gap-2 whitespace-nowrap transition-all"
              >
                <span>Continue Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: NEXT CONCEPT */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                Next Concept
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Level {nextConcept.concept.level} • {nextConcept.concept.category}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Prerequisites Verified</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {nextConcept.concept.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                {nextConcept.reason}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Estimated duration: {nextConcept.estimatedMinutes} minutes</span>
              </div>
            </div>

            <button
              onClick={() => onOpenLesson(nextConcept.lesson)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-xs flex items-center justify-center gap-2 whitespace-nowrap transition-all"
            >
              <span>Launch Next Concept</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP 4: FUTURE CONCEPTS (DOWNSTREAM ROADMAP) */}
        <div className="space-y-3">
          {futureConcepts.length > 0 && (
            <HorizontalScrollRow
              title={
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Future Concepts ({futureConcepts.length})</span>
                </div>
              }
              subtitle="Unlocked strictly by demonstrated prerequisite mastery and quiz performance"
              showControls={true}
              itemSpacing="gap-3"
            >
              {futureConcepts.map((item) => (
                <div
                  key={item.concept.id}
                  className="min-w-[260px] sm:min-w-[280px] p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0 snap-start select-none"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {item.isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Level {item.level} • {item.concept.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.concept.title}
                    </h4>
                    {item.isLocked && item.unlockRequirements.length > 0 && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 line-clamp-1">
                        Prerequisites: {item.unlockRequirements.join(', ')}
                      </p>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    item.isLocked 
                      ? 'bg-slate-200/80 dark:bg-slate-800 text-slate-500' 
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}>
                    {item.isLocked ? 'Locked' : 'Available'}
                  </span>
                </div>
              ))}
            </HorizontalScrollRow>
          )}
        </div>
      </div>
    </div>
  );
};
