import React from 'react';
import { History, CheckCircle2, Award, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { Lesson } from '@/types/academy';

interface NormalLearningHistoryProps {
  onOpenLesson: (lesson: Lesson) => void;
}

export const NormalLearningHistory: React.FC<NormalLearningHistoryProps> = ({ onOpenLesson }) => {
  const { progress } = useAcademy();

  const completedLessonObjects = ACADEMY_LESSONS.filter(l =>
    progress.completedLessons.includes(l.id)
  );

  const quizAttemptEntries = Object.entries(progress.quizAttempts);

  return (
    <div id="normal-learning-history" className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Your Learning History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified record of completed lessons, quiz scores, and study activity.
            </p>
          </div>
        </div>
      </div>

      {/* Two columns: Completed Lessons & Quiz Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Lessons */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Completed Lessons ({completedLessonObjects.length})</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </h4>

          {completedLessonObjects.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                You haven't completed any lessons yet. Complete your first module in Level 0 to begin your verified history!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedLessonObjects.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-0.5 max-w-[75%]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        Level {lesson.level}
                      </span>
                      <span className="text-[10px] text-slate-400">{lesson.domain}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {lesson.title}
                    </h5>
                  </div>

                  <button
                    onClick={() => onOpenLesson(lesson)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Scores & Attempts */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Knowledge Checks & Quizzes ({quizAttemptEntries.length})</span>
            <Award className="w-4 h-4 text-amber-500" />
          </h4>

          {quizAttemptEntries.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                No quizzes completed yet. Take the knowledge checks at the end of each lesson to test your mastery!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {quizAttemptEntries.map(([lessonId, attempt]) => {
                const lesson = ACADEMY_LESSONS.find(l => l.id === lessonId);
                const score = attempt.bestScore ?? attempt.lastScore ?? 0;
                const isPassed = score >= 70;

                return (
                  <div
                    key={lessonId}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {lesson ? lesson.title : `Module: ${lessonId}`}
                      </h5>
                      <p className="text-[10px] text-slate-400">
                        Attempts: {attempt.attempts || 1}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-black ${
                        isPassed 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}>
                        {score}%
                      </span>
                      {lesson && (
                        <button
                          onClick={() => onOpenLesson(lesson)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Open quiz"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
