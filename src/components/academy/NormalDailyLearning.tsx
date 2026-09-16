import React, { useState } from 'react';
import { Calendar, Sparkles, BookOpen, HelpCircle, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { ALL_CURRICULUM_CONCEPTS } from '@/data/academy/registry';
import { ACADEMY_FLASHCARDS } from '@/data/academy/flashcards';
import { Lesson, CurriculumConcept } from '@/types/academy';

interface NormalDailyLearningProps {
  onOpenLesson: (lesson: Lesson) => void;
  onOpenConcept: (concept: CurriculumConcept) => void;
  onOpenFlashcards: () => void;
  onOpenCalculations: () => void;
}

export const NormalDailyLearning: React.FC<NormalDailyLearningProps> = ({
  onOpenLesson,
  onOpenConcept,
  onOpenFlashcards,
  onOpenCalculations
}) => {
  const { progress } = useAcademy();

  // Deterministic daily selection based on day-of-year
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

  const conceptOfTheDay = ALL_CURRICULUM_CONCEPTS[dayOfYear % ALL_CURRICULUM_CONCEPTS.length] || ALL_CURRICULUM_CONCEPTS[0];
  const lessonOfTheDay = ACADEMY_LESSONS[(dayOfYear + 3) % ACADEMY_LESSONS.length] || ACADEMY_LESSONS[0];
  const cardOfTheDay = ACADEMY_FLASHCARDS[(dayOfYear + 7) % ACADEMY_FLASHCARDS.length] || ACADEMY_FLASHCARDS[0];

  const isLessonDone = progress.completedLessons.includes(lessonOfTheDay.id);
  const quizScore = progress.quizAttempts[lessonOfTheDay.id]?.bestScore;

  const [cardRevealed, setCardRevealed] = useState(false);

  return (
    <div id="normal-daily-learning" className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              📅 Today's Learning
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build consistency with your 15-minute daily micro-learning curriculum.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold self-start sm:self-auto">
          {today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Concept of the Day */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                Concept of the Day
              </span>
              <span className="text-xs text-slate-400">Level {conceptOfTheDay.level}</span>
            </div>

            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {conceptOfTheDay.title}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {conceptOfTheDay.simpleExplanation || conceptOfTheDay.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">{conceptOfTheDay.estimatedLearningTime} min read</span>
            <button
              onClick={() => onOpenConcept(conceptOfTheDay)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-900/30 dark:hover:bg-blue-600 dark:text-blue-300 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Explore Concept</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. One Short Lesson */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                Daily Lesson
              </span>
              {isLessonDone && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}
            </div>

            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {lessonOfTheDay.title}
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
              {lessonOfTheDay.whatIsIt || lessonOfTheDay.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">{lessonOfTheDay.estimatedMinutes} min</span>
            <button
              onClick={() => onOpenLesson(lessonOfTheDay)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
            >
              <span>{isLessonDone ? 'Review Lesson' : 'Start Lesson'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Daily Revision Flashcard */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                Daily Revision Card
              </span>
              <span className="text-xs text-slate-400">{cardOfTheDay.domain}</span>
            </div>

            <div 
              onClick={() => setCardRevealed(prev => !prev)}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 cursor-pointer min-h-[90px] flex flex-col justify-center"
            >
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {cardRevealed ? cardOfTheDay.back : cardOfTheDay.front}
              </h5>
              <p className="text-[10px] text-slate-400 mt-2">
                {cardRevealed ? 'Tap to hide answer' : 'Tap to reveal answer'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Level {cardOfTheDay.level}</span>
            <button
              onClick={onOpenFlashcards}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white dark:bg-purple-900/30 dark:hover:bg-purple-600 dark:text-purple-300 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Full Flashcard Deck</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Quick Calculation Practice */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Math Habit
              </span>
              <span className="text-xs text-slate-400">5 min practice</span>
            </div>

            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Daily Risk & Sizing Calculation
            </h4>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Test your ability to quickly calculate 1% account risk, R:R multiples, and position lot sizes without hesitating.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Interactive Drill</span>
            <button
              onClick={onOpenCalculations}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:bg-emerald-900/30 dark:hover:bg-emerald-600 dark:text-emerald-300 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <span>Practice Math</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
