import React from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  FileEdit, 
  ChevronRight, 
  Sparkles,
  Award 
} from 'lucide-react';
import { Lesson, AcademyDomain } from '@/types/academy';

interface LessonCardProps {
  lesson: Lesson;
  isCompleted: boolean;
  isBookmarked: boolean;
  hasNote?: boolean;
  bestQuizScore?: number;
  onOpenLesson: (lesson: Lesson) => void;
  onToggleBookmark: (e: React.MouseEvent, lessonId: string) => void;
  className?: string;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  isCompleted,
  isBookmarked,
  hasNote,
  bestQuizScore,
  onOpenLesson,
  onToggleBookmark,
  className = ''
}) => {
  return (
    <div
      onClick={() => onOpenLesson(lesson)}
      className={`group p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3.5 relative ${className}`}
    >
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
            L{lesson.level}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {lesson.domain}
          </span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-slate-400">
            {lesson.difficulty}
          </span>
        </div>

        {/* Action icons: Bookmark & Status */}
        <div className="flex items-center gap-1.5">
          {hasNote && (
            <span title="Personal note attached" className="text-amber-500">
              <FileEdit className="w-3.5 h-3.5" />
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(e, lesson.id);
            }}
            className={`p-1.5 rounded-lg transition-colors ${
              isBookmarked
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Title & Short Excerpt */}
      <div>
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {lesson.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {lesson.whatIsIt || lesson.description || lesson.whyItMatters}
        </p>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-400 font-medium text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lesson.estimatedMinutes}m
          </span>
          {lesson.artifact && (
            <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
              <Sparkles className="w-3 h-3" />
              Interactive Lab
            </span>
          )}
          {bestQuizScore !== undefined && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Award className="w-3 h-3" />
              {bestQuizScore}%
            </span>
          )}
        </div>

        {isCompleted ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mastered</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
            <span>Study</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};
