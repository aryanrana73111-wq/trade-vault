import React, { useState, useMemo, useRef } from 'react';
import { 
  GraduationCap, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  Compass, 
  Layers, 
  Calculator, 
  BookA, 
  Bookmark, 
  History, 
  Calendar,
  Sparkles,
  Search,
  Check,
  Clock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { ALL_CURRICULUM_CONCEPTS, CurriculumRegistry } from '@/data/academy/registry';
import { Lesson, CurriculumConcept } from '@/types/academy';
import { NormalConceptLibrary } from '../NormalConceptLibrary';
import { NormalLevelRoadmap, NORMAL_LEVEL_DEFINITIONS } from '../NormalLevelRoadmap';
import { NormalFlashcards } from '../NormalFlashcards';
import { NormalCalculationPractice } from '../NormalCalculationPractice';
import { NormalFormulaSheet } from '../NormalFormulaSheet';
import { NormalGlossary } from '../NormalGlossary';
import { NormalSavedNotes } from '../NormalSavedNotes';
import { NormalLearningHistory } from '../NormalLearningHistory';
import { NormalDailyLearning } from '../NormalDailyLearning';
import { TRUSTED_RESOURCES } from '@/data/academy/trustedResources';
import { ResourceCard } from '../components/ResourceCard';

interface NormalModeProps {
  onOpenLessonModal: (lesson: Lesson) => void;
}

export type NormalSubTab = 
  | 'overview' 
  | 'concepts' 
  | 'levels' 
  | 'daily' 
  | 'flashcards' 
  | 'practice' 
  | 'formulas' 
  | 'glossary' 
  | 'saved-notes' 
  | 'history'
  | 'resources';

export const NormalMode: React.FC<NormalModeProps> = ({ onOpenLessonModal }) => {
  const { progress } = useAcademy();
  const [activeTab, setActiveTab] = useState<NormalSubTab>('overview');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 10) {
      hasDraggedRef.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Real User Metrics Calculation
  const currentLevelNumber = progress.currentLevel ?? 0;
  const currentLevelInfo = NORMAL_LEVEL_DEFINITIONS.find(l => l.level === currentLevelNumber) || NORMAL_LEVEL_DEFINITIONS[0];

  const totalLessonsCount = ACADEMY_LESSONS.length;
  const completedLessonsCount = progress.completedLessons.length;
  const overallProgressPct = totalLessonsCount > 0 
    ? Math.min(100, Math.round((completedLessonsCount / totalLessonsCount) * 100))
    : 0;

  // Real Quiz Accuracy Calculation
  const quizAttemptsList = Object.values(progress.quizAttempts);
  const quizAccuracyPct = useMemo(() => {
    if (quizAttemptsList.length === 0) return 0;
    const sum = quizAttemptsList.reduce((acc, curr) => acc + (curr.bestScore || 0), 0);
    return Math.round(sum / quizAttemptsList.length);
  }, [quizAttemptsList]);

  // Find Continue Learning Lesson:
  // Strictly find the first uncompleted lesson in the user's current level or curriculum.
  // Never random!
  const continueLesson: Lesson = useMemo(() => {
    // Check in current level first
    const levelLessons = ACADEMY_LESSONS.filter(l => l.level === currentLevelNumber);
    const incompleteInLevel = levelLessons.find(l => !progress.completedLessons.includes(l.id));
    if (incompleteInLevel) return incompleteInLevel;

    // Next check subsequent levels
    const nextIncomplete = ACADEMY_LESSONS.find(l => !progress.completedLessons.includes(l.id));
    if (nextIncomplete) return nextIncomplete;

    // If all completed, return first lesson
    return ACADEMY_LESSONS[0];
  }, [currentLevelNumber, progress.completedLessons]);

  // Recommended Next Lesson:
  // 1. Prerequisite concept
  // 2. Next concept in current level
  // 3. Weak quiz topic
  // 4. Next level
  const recommendedNextLesson: Lesson = useMemo(() => {
    // 3. Weak quiz topic check (< 70%)
    const weakAttempt = Object.entries(progress.quizAttempts).find(([_, attempt]) => attempt.bestScore < 70);
    if (weakAttempt) {
      const weakLesson = ACADEMY_LESSONS.find(l => l.id === weakAttempt[0]);
      if (weakLesson) return weakLesson;
    }

    // 2. Next in current level or continue lesson
    return continueLesson;
  }, [progress.quizAttempts, continueLesson]);

  // Handle open concept as lesson
  const handleOpenConcept = (concept: CurriculumConcept) => {
    const lesson = CurriculumRegistry.toLesson(concept);
    onOpenLessonModal(lesson);
  };

  return (
    <div id="normal-mode-view" className="space-y-6">
      {/* SECTION 2: NORMAL MODE DASHBOARD HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  TradeVault Academy
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Learn Trading Step by Step
                </p>
              </div>
            </div>
          </div>

          {/* Continue Learning CTA Button */}
          {continueLesson && (
            <button
              id="normal-mode-continue-learning-btn"
              onClick={() => onOpenLessonModal(continueLesson)}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 self-start md:self-auto"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 5 Core Metric Cards (All Real User Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
          {/* 1. Current Level */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Level
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
              Level {currentLevelNumber}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
              {currentLevelInfo.title}
            </div>
          </div>

          {/* 2. Overall Progress */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overall Progress
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {overallProgressPct}%
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all" 
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
          </div>

          {/* 3. Learning Streak */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Learning Streak
            </span>
            <div className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Flame className="w-4 h-4 fill-current" />
              <span>{progress.learningStreakDays || 0} Days</span>
            </div>
            <div className="text-[11px] text-slate-400">Daily Study Habit</div>
          </div>

          {/* 4. Lessons Completed */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Lessons Done
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {completedLessonsCount} / {totalLessonsCount}
            </div>
            <div className="text-[11px] text-slate-400">Verified Modules</div>
          </div>

          {/* 5. Quiz Accuracy */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quiz Accuracy
            </span>
            <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{quizAccuracyPct}%</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {quizAttemptsList.length} Completed Checks
            </div>
          </div>
        </div>
      </div>

      {/* NORMAL MODE SUB-NAVIGATION TABS */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-xs ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        <button
          id="tab-normal-overview"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('overview');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          id="tab-normal-concepts"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('concepts');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'concepts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Concepts</span>
        </button>

        <button
          id="tab-normal-levels"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('levels');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'levels'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Levels (L0-L10)</span>
        </button>

        <button
          id="tab-normal-daily"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('daily');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'daily'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Today's Learning</span>
        </button>

        <button
          id="tab-normal-flashcards"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('flashcards');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'flashcards'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Flashcards</span>
        </button>

        <button
          id="tab-normal-practice"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('practice');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'practice'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Calculations</span>
        </button>

        <button
          id="tab-normal-formulas"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('formulas');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'formulas'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>Formulas</span>
        </button>

        <button
          id="tab-normal-glossary"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('glossary');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'glossary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookA className="w-3.5 h-3.5" />
          <span>Glossary</span>
        </button>

        <button
          id="tab-normal-saved-notes"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('saved-notes');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'saved-notes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved & Notes</span>
        </button>

        <button
          id="tab-normal-history"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('history');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History</span>
        </button>

        <button
          id="tab-normal-resources"
          onClick={() => {
            if (!hasDraggedRef.current) setActiveTab('resources');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'resources'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Trusted Resources</span>
        </button>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="space-y-6">
        {/* OVERVIEW (DASHBOARD) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Continue Learning Card */}
            {continueLesson && (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
                      Up Next In Your Curriculum
                    </span>
                    <span className="text-xs text-blue-100 font-medium">
                      Level {continueLesson.level} • {continueLesson.domain}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black">
                    {continueLesson.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-100 line-clamp-2">
                    {continueLesson.whatIsIt || continueLesson.description}
                  </p>
                </div>

                <button
                  onClick={() => onOpenLessonModal(continueLesson)}
                  className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
                >
                  <span>Resume Lesson</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Quick Level Progression Summary */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Level Roadmap Preview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Step-by-step trader progression from Level 0 to Level 10
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('levels')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View All 11 Levels</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {NORMAL_LEVEL_DEFINITIONS.slice(0, 3).map((l) => {
                  const lessons = ACADEMY_LESSONS.filter(item => item.level === l.level);
                  const completed = lessons.filter(item => progress.completedLessons.includes(item.id)).length;
                  const isCurrent = l.level === currentLevelNumber;

                  return (
                    <div
                      key={l.level}
                      onClick={() => setActiveTab('levels')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isCurrent 
                          ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20' 
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400">Level {l.level}</span>
                        <span className="text-[11px] text-slate-400">{completed}/{lessons.length}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {l.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {l.simpleExplanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Micro Learning Shortcuts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('daily')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-2"
              >
                <Calendar className="w-6 h-6 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Today's Daily Drill</h4>
                <p className="text-xs text-slate-500">15-minute concept, lesson, and revision card.</p>
              </div>

              <div 
                onClick={() => setActiveTab('flashcards')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-2"
              >
                <Layers className="w-6 h-6 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Revision Flashcards</h4>
                <p className="text-xs text-slate-500">Quickly flip through definitions & key rules.</p>
              </div>

              <div 
                onClick={() => setActiveTab('practice')}
                className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-blue-400 transition-all space-y-2"
              >
                <Calculator className="w-6 h-6 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Calculation Practice</h4>
                <p className="text-xs text-slate-500">Practice 1% risk amounts and position sizing.</p>
              </div>
            </div>
          </div>
        )}

        {/* CONCEPTS TAB */}
        {activeTab === 'concepts' && (
          <NormalConceptLibrary onLearnConcept={handleOpenConcept} />
        )}

        {/* LEVELS ROADMAP TAB */}
        {activeTab === 'levels' && (
          <NormalLevelRoadmap onSelectLevelLesson={onOpenLessonModal} />
        )}

        {/* DAILY LEARNING TAB */}
        {activeTab === 'daily' && (
          <NormalDailyLearning
            onOpenLesson={onOpenLessonModal}
            onOpenConcept={handleOpenConcept}
            onOpenFlashcards={() => setActiveTab('flashcards')}
            onOpenCalculations={() => setActiveTab('practice')}
          />
        )}

        {/* FLASHCARDS TAB */}
        {activeTab === 'flashcards' && (
          <NormalFlashcards />
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'practice' && (
          <NormalCalculationPractice />
        )}

        {/* FORMULAS TAB */}
        {activeTab === 'formulas' && (
          <NormalFormulaSheet />
        )}

        {/* GLOSSARY TAB */}
        {activeTab === 'glossary' && (
          <NormalGlossary onSelectConcept={(term) => {
            setActiveTab('concepts');
          }} />
        )}

        {/* SAVED & NOTES TAB */}
        {activeTab === 'saved-notes' && (
          <NormalSavedNotes onOpenLesson={onOpenLessonModal} />
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <NormalLearningHistory onOpenLesson={onOpenLessonModal} />
        )}

        {/* TRUSTED RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Trusted Learning Resources
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Curated directory of Tier 1 official regulatory/exchange education, Tier 2 established courses, and vetted educational video channels.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRUSTED_RESOURCES.map((res) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
