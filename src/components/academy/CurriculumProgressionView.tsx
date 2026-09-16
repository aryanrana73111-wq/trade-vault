import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { CurriculumConcept, CurriculumCategory, Lesson } from '@/types/academy';
import { CurriculumRegistry, CATEGORY_METADATA, ALL_CURRICULUM_CATEGORIES } from '@/data/academy/registry';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { useAcademy } from '@/contexts/AcademyContext';

interface CurriculumProgressionViewProps {
  onSelectConcept: (concept: CurriculumConcept) => void;
  onLockedConceptClick: (concept: CurriculumConcept) => void;
  onLaunchLesson: (lesson: Lesson) => void;
}

export const CurriculumProgressionView: React.FC<CurriculumProgressionViewProps> = ({
  onSelectConcept,
  onLockedConceptClick,
  onLaunchLesson
}) => {
  const { progress } = useAcademy();
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({
    0: true,
    1: true
  });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CurriculumCategory | 'ALL'>('ALL');

  const completedSet = useMemo(() => new Set([
    ...progress.completedLessons,
    ...progress.masteredConcepts
  ]), [progress.completedLessons, progress.masteredConcepts]);

  const hasStartedLearning = completedSet.size > 0;

  // Start Here Concept (Level 0, foundational)
  const startHereConcept = useMemo(() => {
    return CurriculumRegistry.getStartHere(Array.from(completedSet));
  }, [completedSet]);

  // Continue Learning Concept
  const continueLearningConcept = useMemo(() => {
    return CurriculumRegistry.getContinueLearning(Array.from(completedSet));
  }, [completedSet]);

  // Recommended Next (up to 3 concepts with met prerequisites)
  const recommendedNext = useMemo(() => {
    return CurriculumRegistry.getRecommendedNext(Array.from(completedSet), 3);
  }, [completedSet]);

  const toggleLevelExpand = (level: number) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="space-y-8">
      {/* 1. Hero Progression Action Cards: "Start Here" or "Continue Learning" */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Action Banner */}
        <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-linear-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-xl border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                {!hasStartedLearning ? 'START HERE — YOUR FIRST STEP' : 'CONTINUE LEARNING'}
              </span>
            </div>

            {!hasStartedLearning ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300">
                    LEVEL 0
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {startHereConcept.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {startHereConcept.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {startHereConcept.simpleExplanation}
                </p>
              </div>
            ) : continueLearningConcept ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300">
                    LEVEL {continueLearningConcept.level}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {continueLearningConcept.category}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {continueLearningConcept.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                  {continueLearningConcept.simpleExplanation}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-emerald-400">
                  Curriculum Mastery Attained!
                </h3>
                <p className="text-xs text-slate-300">
                  You have mastered all currently available curriculum modules from Level 0 to Level 10.
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!hasStartedLearning ? (
                <button
                  onClick={() => onSelectConcept(startHereConcept)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Begin Level 0 Foundations</span>
                </button>
              ) : continueLearningConcept ? (
                <button
                  onClick={() => onSelectConcept(continueLearningConcept)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Next Module</span>
                </button>
              ) : null}

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {!hasStartedLearning 
                    ? `${startHereConcept.estimatedLearningTime} mins` 
                    : continueLearningConcept 
                    ? `${continueLearningConcept.estimatedLearningTime} mins` 
                    : 'All modules complete'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Progress Stats Card */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Mastery Metrics
              </span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Total Concepts Mastered
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {completedSet.size}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (completedSet.size / CurriculumRegistry.getAllConcepts().length) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>Level 0</span>
                  <span>Level 10</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            {completedSet.size === 0 ? (
              <span>No fabricated progress. Start Level 0 to unlock Level 1.</span>
            ) : (
              <span>{CurriculumRegistry.getAllConcepts().length - completedSet.size} concepts remaining to complete institutional syllabus.</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. "Recommended Next" Section (Eligible Unlocked Concepts) */}
      {recommendedNext.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Recommended Next
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Prerequisites 100% Met
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedNext.map(concept => {
              const categoryMeta = CATEGORY_METADATA[concept.category] || {
                label: concept.category,
                badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
                badgeText: 'text-blue-700 dark:text-blue-300',
                badgeBorder: 'border-blue-200 dark:border-blue-900'
              };

              return (
                <div
                  key={concept.id}
                  onClick={() => onSelectConcept(concept)}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${categoryMeta.badgeBg} ${categoryMeta.badgeText} ${categoryMeta.badgeBorder}`}>
                        {categoryMeta.label}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Level {concept.level}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {concept.title}
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {concept.simpleExplanation}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {concept.estimatedLearningTime} min
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Learn
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Level 0 → Level 10 Complete Structured Progression */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              Curriculum Roadmap: Level 0 → Level 10
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Systematic learning journey designed for zero ambiguity. Complete prerequisites to unlock advanced levels.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: 11 }).map((_, levelIndex) => {
            const levelInfo = ACADEMY_LEVELS.find(l => l.level === levelIndex);
            const levelConcepts = CurriculumRegistry.getConceptsByLevel(levelIndex);
            const isExpanded = !!expandedLevels[levelIndex];

            // Calculate completed count for this level
            const completedCount = levelConcepts.filter(c => completedSet.has(c.id)).length;
            const isLevelComplete = levelConcepts.length > 0 && completedCount === levelConcepts.length;

            return (
              <div 
                key={levelIndex}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
              >
                {/* Level Card Accordion Header */}
                <div 
                  onClick={() => toggleLevelExpand(levelIndex)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isLevelComplete
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : completedCount > 0
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {isLevelComplete ? <CheckCircle2 className="w-5 h-5" /> : `L${levelIndex}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                          {levelInfo?.title || `Level ${levelIndex}`}
                        </span>
                        {levelInfo?.subtitle && (
                          <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                            — {levelInfo.subtitle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {levelInfo?.description || 'Curriculum level topics.'}
                      </p>
                    </div>
                  </div>

                  {/* Level Progress & Toggle */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {completedCount} / {levelConcepts.length}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Mastered
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Level Concepts Drawer */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                      {levelConcepts.map(concept => {
                        const status = CurriculumRegistry.getConceptStatus(
                          concept.id,
                          Array.from(completedSet)
                        );
                        const isDone = status === 'completed';
                        const isLocked = status === 'locked';
                        const missingPrereqs = CurriculumRegistry.getMissingPrerequisites(
                          concept.id,
                          Array.from(completedSet)
                        );
                        const categoryMeta = CATEGORY_METADATA[concept.category] || {
                          label: concept.category,
                          badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
                          badgeText: 'text-blue-700 dark:text-blue-300',
                          badgeBorder: 'border-blue-200 dark:border-blue-900'
                        };

                        return (
                          <div
                            key={concept.id}
                            onClick={() => {
                              if (isLocked) {
                                onLockedConceptClick(concept);
                              } else {
                                onSelectConcept(concept);
                              }
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                              isDone
                                ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/50'
                                : isLocked
                                ? 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-75 hover:opacity-100 hover:border-amber-300'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-xs'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md border ${categoryMeta.badgeBg} ${categoryMeta.badgeText} ${categoryMeta.badgeBorder}`}>
                                  {categoryMeta.label}
                                </span>

                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                ) : isLocked ? (
                                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    <Lock className="w-3 h-3" />
                                    Locked
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                    Unlocked
                                  </span>
                                )}
                              </div>

                              <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {concept.title}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                                {concept.simpleExplanation}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">
                                {concept.estimatedLearningTime} mins
                              </span>
                              {isLocked ? (
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  Prerequisites required
                                </span>
                              ) : (
                                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                  {isDone ? 'Review' : 'Start'}
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
