import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Lock, 
  Flame, 
  ArrowRight,
  BookOpen,
  ChevronDown,
  Layers,
  GitFork,
  Milestone,
  Sparkles,
  Brain
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { LearningPathNode, LessonCard } from './components';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { Lesson, LevelInfo, CurriculumConcept } from '@/types/academy';
import { CurriculumRegistry } from '@/data/academy/registry';
import { CurriculumProgressionView } from './CurriculumProgressionView';
import { LockedPrerequisiteModal } from './LockedPrerequisiteModal';
import { ConceptViewModal } from './ConceptViewModal';
import { VisualLearningPath } from './VisualLearningPath';
import { AdaptiveRecommendationsPanel } from './AdaptiveRecommendationsPanel';
import { computeAdaptiveRecommendations } from '@/lib/academy/adaptiveLearningEngine';
import { ScrollableTabs } from './ScrollableTabs';
import { HorizontalScrollRow } from './HorizontalScrollRow';

interface LearningPathTabProps {
  onOpenLesson: (lesson: Lesson) => void;
  onOpenDiagnostic: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const LearningPathTab: React.FC<LearningPathTabProps> = ({
  onOpenLesson,
  onOpenDiagnostic,
  onNavigateTab
}) => {
  const { progress, toggleBookmark } = useAcademy();
  const [activeSubView, setActiveSubView] = useState<'personalized' | 'progression' | 'roadmap'>('personalized');
  const [expandedLevel, setExpandedLevel] = useState<number>(progress.currentLevel ?? 0);

  // Compute adaptive engine recommendations directly from user evidence
  const adaptiveRecommendations = useMemo(() => {
    return computeAdaptiveRecommendations(progress);
  }, [progress]);

  // Modals for concept inspection and locked prerequisites
  const [activeConceptModal, setActiveConceptModal] = useState<CurriculumConcept | null>(null);
  const [lockedModalConcept, setLockedModalConcept] = useState<CurriculumConcept | null>(null);

  const currentLevel = progress.currentLevel ?? 0;

  const handleSelectLevel = (levelNum: number) => {
    setExpandedLevel(prev => prev === levelNum ? -1 : levelNum);
  };

  const handleSelectConcept = (concept: CurriculumConcept) => {
    setActiveConceptModal(concept);
  };

  const handleLockedConcept = (concept: CurriculumConcept) => {
    setLockedModalConcept(concept);
  };

  return (
    <div className="space-y-6">
      {/* Header Info & View Switcher */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Personalized Learning Engine
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Adaptive Learning Path & Institutional Progression
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Curriculum tailored dynamically to your verified quiz results, diagnostic evidence, mistake records, and prerequisite mastery.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subview Selector */}
          <div className="w-full sm:w-auto">
            <ScrollableTabs
              tabs={[
                { id: 'personalized', label: 'Personalized Path', icon: Sparkles },
                { id: 'progression', label: 'Progression Roadmap', icon: Milestone },
                { id: 'roadmap', label: 'Level Timeline', icon: Layers }
              ]}
              activeTab={activeSubView}
              onTabChange={(id) => setActiveSubView(id as any)}
              ariaLabel="Learning path subviews"
            />
          </div>

          <button
            onClick={onOpenDiagnostic}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center justify-center gap-2 whitespace-nowrap ml-auto sm:ml-0"
          >
            <Compass className="w-4 h-4" />
            <span>Diagnostic Placement</span>
          </button>
        </div>
      </div>

      {/* Main View Modes */}
      {activeSubView === 'personalized' ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Visual Personalized Learning Path */}
          <VisualLearningPath
            visualPath={adaptiveRecommendations.visualPath}
            onOpenLesson={onOpenLesson}
            onOpenConcept={handleSelectConcept}
          />

          {/* Adaptive Recommendations Suite */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Evidence-Based Adaptive Recommendations
              </h3>
            </div>
            <AdaptiveRecommendationsPanel
              recommendations={adaptiveRecommendations}
              onOpenLesson={onOpenLesson}
              onOpenConcept={handleSelectConcept}
              onNavigateTab={onNavigateTab}
            />
          </div>
        </div>
      ) : activeSubView === 'progression' ? (
        <CurriculumProgressionView
          onSelectConcept={handleSelectConcept}
          onLockedConceptClick={handleLockedConcept}
          onLaunchLesson={onOpenLesson}
        />
      ) : (
        /* Sequential Roadmap Nodes */
        <div className="space-y-4">
          {/* Level Quick Jump Bar */}
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <ScrollableTabs
              tabs={ACADEMY_LEVELS.map(l => ({
                id: `lvl-${l.level}`,
                label: `Lvl ${l.level}: ${l.title}`,
                badge: l.level === currentLevel ? 'Current' : l.level < currentLevel ? 'Done' : undefined
              }))}
              activeTab={`lvl-${expandedLevel ?? currentLevel}`}
              onTabChange={(id) => {
                const lvlNum = parseInt(id.replace('lvl-', ''), 10);
                handleSelectLevel(lvlNum);
              }}
              ariaLabel="Level timeline jump"
            />
          </div>

          {ACADEMY_LEVELS.map((lvl, index) => {
            const isCompleted = lvl.level < currentLevel;
            const isCurrent = lvl.level === currentLevel;
            const isUnlocked = lvl.level <= currentLevel;
            const isLast = index === ACADEMY_LEVELS.length - 1;

            const levelLessons = ACADEMY_LESSONS.filter(l => l.level === lvl.level);
            const completedInLevel = levelLessons.filter(l => progress.completedLessons.includes(l.id)).length;
            const isExpanded = expandedLevel === lvl.level;

            return (
              <div key={lvl.level} className="space-y-3">
                <LearningPathNode
                  levelInfo={lvl}
                  isUnlocked={isUnlocked}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  completedLessonsCount={completedInLevel}
                  totalLessonsCount={levelLessons.length}
                  isLast={isLast && !isExpanded}
                  onSelectLevel={handleSelectLevel}
                />

                {/* Expanded Lesson Drawer */}
                {isExpanded && (
                  <div className="ml-6 sm:ml-12 pl-6 border-l-2 border-blue-500/30 py-3 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Level {lvl.level} Modules ({levelLessons.length} Lessons)
                      </span>
                      <span className="text-xs text-slate-400">
                        {completedInLevel} of {levelLessons.length} Completed
                      </span>
                    </div>

                    {levelLessons.length > 0 ? (
                      <HorizontalScrollRow
                        showControls={true}
                        itemSpacing="gap-3.5"
                      >
                        {levelLessons.map(lesson => {
                          const isDone = progress.completedLessons.includes(lesson.id);
                          const isPrereqMet = CurriculumRegistry.isPrerequisiteMet(lesson.id, progress.completedLessons);
                          
                          return (
                            <div key={lesson.id} className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">
                              <LessonCard
                                lesson={lesson}
                                isCompleted={isDone}
                                isBookmarked={progress.bookmarkedLessons.includes(lesson.id)}
                                hasNote={!!progress.personalNotes[lesson.id]}
                                bestQuizScore={progress.quizAttempts[lesson.id]?.bestScore}
                                onOpenLesson={(l) => {
                                  if (!isPrereqMet && !isDone) {
                                    const concept = CurriculumRegistry.getConceptById(l.id);
                                    if (concept) {
                                      handleLockedConcept(concept);
                                      return;
                                    }
                                  }
                                  onOpenLesson(l);
                                }}
                                onToggleBookmark={(e) => toggleBookmark('lesson', lesson.id)}
                              />
                            </div>
                          );
                        })}
                      </HorizontalScrollRow>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                        No lessons available for Level {lvl.level}.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Concept View Modal */}
      {activeConceptModal && (
        <ConceptViewModal
          concept={activeConceptModal}
          onClose={() => setActiveConceptModal(null)}
          onOpenConnectedLesson={onOpenLesson}
          onSelectConcept={(c) => setActiveConceptModal(c)}
        />
      )}

      {/* Locked Prerequisite Modal */}
      {lockedModalConcept && (
        <LockedPrerequisiteModal
          concept={lockedModalConcept}
          onClose={() => setLockedModalConcept(null)}
          onSelectPrerequisite={(prereq) => {
            setActiveConceptModal(prereq);
          }}
        />
      )}
    </div>
  );
};
