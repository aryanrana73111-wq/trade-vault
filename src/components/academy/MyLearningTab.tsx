import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Bookmark, 
  FileEdit, 
  Plus, 
  ArrowRight,
  BookOpen,
  Award,
  Calendar,
  Brain,
  Sparkles,
  Target
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { LevelCard, LessonCard, ProgressRing } from './components';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { Lesson } from '@/types/academy';
import { computeAdaptiveRecommendations } from '@/lib/academy/adaptiveLearningEngine';
import { AdaptiveRecommendationsPanel } from './AdaptiveRecommendationsPanel';

interface MyLearningTabProps {
  onOpenLesson: (lesson: Lesson) => void;
  onNavigateTab: (tabId: string) => void;
}

export const MyLearningTab: React.FC<MyLearningTabProps> = ({
  onOpenLesson,
  onNavigateTab
}) => {
  const { progress, toggleBookmark, logStudyTime, updateDailyGoal } = useAcademy();
  const [studyMinutesInput, setStudyMinutesInput] = useState('15');

  const currentLevelNumber = progress.currentLevel ?? 0;
  const currentLevelInfo = ACADEMY_LEVELS.find(l => l.level === currentLevelNumber) || ACADEMY_LEVELS[0];
  const currentLevelLessons = ACADEMY_LESSONS.filter(l => l.level === currentLevelNumber);
  const completedCurrentCount = currentLevelLessons.filter(l => progress.completedLessons.includes(l.id)).length;

  // Completed lessons objects
  const completedLessons = ACADEMY_LESSONS.filter(l => progress.completedLessons.includes(l.id));
  
  // Bookmarked lessons objects
  const bookmarkedLessons = ACADEMY_LESSONS.filter(l => progress.bookmarkedLessons.includes(l.id));

  // In-progress lessons (not completed yet from current level)
  const inProgressLessons = currentLevelLessons.filter(l => !progress.completedLessons.includes(l.id));

  const hasActivity = progress.completedLessons.length > 0 || progress.overallMastery > 0 || progress.todayMinutesSpent > 0;

  const handleAddStudyTime = () => {
    const mins = parseInt(studyMinutesInput, 10);
    if (!isNaN(mins) && mins > 0) {
      logStudyTime(mins);
    }
  };

  const dailyGoalPct = progress.dailyGoalMinutes > 0
    ? Math.min(100, Math.round((progress.todayMinutesSpent / progress.dailyGoalMinutes) * 100))
    : 0;

  // Compute evidence-based adaptive recommendations
  const adaptive = useMemo(() => {
    return computeAdaptiveRecommendations(progress);
  }, [progress]);

  return (
    <div className="space-y-6">
      {/* Evidence-Based Adaptive Recommendations */}
      <AdaptiveRecommendationsPanel
        recommendations={adaptive}
        onOpenLesson={onOpenLesson}
        onNavigateTab={onNavigateTab}
      />

      {/* Top Banner with Daily Goal & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daily Study Goal */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Today's Study Goal
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {progress.todayMinutesSpent}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {progress.dailyGoalMinutes} mins
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                min="5"
                max="120"
                value={studyMinutesInput}
                onChange={(e) => setStudyMinutesInput(e.target.value)}
                className="w-14 px-2 py-0.5 text-xs rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-bold"
              />
              <button
                onClick={handleAddStudyTime}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                + Log Mins
              </button>
            </div>
          </div>

          <ProgressRing
            value={dailyGoalPct}
            size={68}
            strokeWidth={6}
            color="stroke-blue-600 dark:stroke-blue-400"
          />
        </div>

        {/* Learning Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Study Streak
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-500">
                {progress.learningStreakDays}
              </span>
              <span className="text-xs text-slate-400 font-semibold">Days Active</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {progress.learningStreakDays > 0 ? 'Consistent practice maintains edge' : 'Study today to ignite your streak'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200/60 dark:border-amber-900/60">
            <Flame className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Verified Mastery Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Verified Progress
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-500">
                {progress.completedLessons.length}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {ACADEMY_LESSONS.length} Completed
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {progress.overallMastery}% Curriculum Mastery
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 border border-emerald-200/60 dark:border-emerald-900/60">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Current Level Card */}
      <div className="space-y-2">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
          My Active Level
        </h3>
        <LevelCard
          levelInfo={currentLevelInfo}
          isUnlocked={true}
          isCompleted={completedCurrentCount === currentLevelLessons.length && currentLevelLessons.length > 0}
          isCurrent={true}
          completedLessonsCount={completedCurrentCount}
          totalLessonsCount={currentLevelLessons.length}
          onSelectLevel={() => onNavigateTab('path')}
        />
      </div>

      {/* Active & In-Progress Lessons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
            Current Level Modules ({inProgressLessons.length} Remaining)
          </h3>
          <button
            onClick={() => onNavigateTab('library')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Explore Full Library
          </button>
        </div>

        {inProgressLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={false}
                isBookmarked={progress.bookmarkedLessons.includes(lesson.id)}
                hasNote={!!progress.personalNotes[lesson.id]}
                bestQuizScore={progress.quizAttempts[lesson.id]?.bestScore}
                onOpenLesson={onOpenLesson}
                onToggleBookmark={(e) => toggleBookmark('lesson', lesson.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
              Level {currentLevelNumber} Fully Completed!
            </h4>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 max-w-md mx-auto">
              You have completed all lesson requirements for this level. Proceed to the Learning Path to advance to the next level.
            </p>
            <button
              onClick={() => onNavigateTab('path')}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              Advance to Next Level
            </button>
          </div>
        )}
      </div>

      {/* Mastered Lessons Section */}
      <div className="space-y-3">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
          Completed Modules ({completedLessons.length})
        </h3>

        {completedLessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedLessons.map(lesson => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                isCompleted={true}
                isBookmarked={progress.bookmarkedLessons.includes(lesson.id)}
                hasNote={!!progress.personalNotes[lesson.id]}
                bestQuizScore={progress.quizAttempts[lesson.id]?.bestScore}
                onOpenLesson={onOpenLesson}
                onToggleBookmark={(e) => toggleBookmark('lesson', lesson.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No learning activity yet.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              When you complete lessons and quizzes, they will be archived here for reference and spaced repetition.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
