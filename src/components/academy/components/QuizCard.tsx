import React from 'react';
import { Award, CheckCircle2, Clock, RotateCcw, Play, HelpCircle } from 'lucide-react';
import { AcademyDomain } from '@/types/academy';

export interface QuizInfo {
  id: string;
  lessonId: string;
  title: string;
  level: number;
  domain: AcademyDomain;
  questionCount: number;
  passingScorePct?: number;
}

interface QuizCardProps {
  quiz: QuizInfo;
  bestScore?: number;
  attemptsCount?: number;
  onTakeQuiz: (quiz: QuizInfo) => void;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  bestScore,
  attemptsCount = 0,
  onTakeQuiz,
  className = ''
}) => {
  const isPassed = bestScore !== undefined && bestScore >= (quiz.passingScorePct ?? 80);
  const isAttempted = attemptsCount > 0;

  return (
    <div
      onClick={() => onTakeQuiz(quiz)}
      className={`group p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3.5 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
              L{quiz.level}
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              {quiz.domain}
            </span>
          </div>

          <div>
            {isPassed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed ({bestScore}%)</span>
              </span>
            ) : isAttempted ? (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                Score: {bestScore}%
              </span>
            ) : (
              <span className="text-[11px] font-medium text-slate-400">
                Unattempted
              </span>
            )}
          </div>
        </div>

        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
          {quiz.title}
        </h4>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            {quiz.questionCount} Questions
          </span>
          <span>•</span>
          <span>Pass: {quiz.passingScorePct ?? 80}%</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">
          {attemptsCount > 0 ? `${attemptsCount} attempt(s)` : 'No attempts yet'}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTakeQuiz(quiz);
          }}
          className={`py-1.5 px-3 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
            isPassed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isPassed ? (
            <>
              <RotateCcw className="w-3 h-3" />
              <span>Retake</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>{isAttempted ? 'Retry Quiz' : 'Start Quiz'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
