import React from 'react';
import { AlertOctagon, CheckCircle2, RotateCcw, ShieldCheck, ArrowRight, Bot, Sparkles } from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';

interface MistakeBankTabProps {
  onOpenAITutor?: (prompt?: string) => void;
}

export const MistakeBankTab: React.FC<MistakeBankTabProps> = ({ onOpenAITutor }) => {
  const { progress, markMistakeReviewed } = useAcademy();

  if (progress.mistakeBank.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 text-center max-w-md mx-auto my-6 space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Zero Recorded Weaknesses
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your Mistake Bank is completely clean! When you take comprehension quizzes across the levels, any incorrect answers are automatically logged here for targeted spaced review.
        </p>
        {onOpenAITutor && (
          <button
            onClick={() => onOpenAITutor('Challenge me with an institutional risk question to test my edge.')}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            <span>Challenge Me with AI Tutor</span>
          </button>
        )}
      </div>
    );
  }

  const unreviewed = progress.mistakeBank.filter(m => !m.reviewed);
  const reviewed = progress.mistakeBank.filter(m => m.reviewed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-rose-900/40 via-slate-900 to-slate-900 rounded-2xl border border-rose-900/40 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Error Remediation Engine
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Personal Mistake Bank ({unreviewed.length} Pending Review)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Institutional trading desks treat execution and analytical mistakes as high-value data. Review missed concepts below to eliminate blind spots.
          </p>
        </div>

        {onOpenAITutor && unreviewed.length > 0 && (
          <button
            onClick={() => onOpenAITutor('Explain my mistake and give me a similar question to re-test.')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs flex-shrink-0 self-start sm:self-center"
          >
            <Bot className="w-4 h-4" />
            <span>Remediate with AI Tutor</span>
          </button>
        )}
      </div>

      {/* Unreviewed Mistakes */}
      <div className="space-y-4">
        {progress.mistakeBank.map((m, idx) => (
          <div
            key={m.questionId}
            className={`p-5 rounded-2xl border transition-all ${
              m.reviewed
                ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
                : 'bg-white dark:bg-slate-850 border-rose-200 dark:border-rose-950/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {m.domain} • Logged {m.dateAdded}
              </span>
              <button
                onClick={() => markMistakeReviewed(m.questionId)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  m.reviewed
                    ? 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                    : 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{m.reviewed ? 'Marked Reviewed' : 'Mark as Mastered'}</span>
              </button>
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {m.questionText}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 text-xs">
              <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 rounded-xl border border-rose-100 dark:border-rose-900/40 text-rose-900 dark:text-rose-200">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-rose-600 mb-1">
                  Your Answer (Flawed Assumption):
                </span>
                <p>{m.userChoice}</p>
              </div>

              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-emerald-600 mb-1">
                  Institutional Truth:
                </span>
                <p>{m.correctAnswer}</p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold">Pedagogical Explanation: </span>
                {m.explanation}
              </div>
              {onOpenAITutor && (
                <button
                  onClick={() => onOpenAITutor(`Explain my mistake regarding "${m.questionText}" and give me a similar question to re-test.`)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-colors flex items-center gap-1 flex-shrink-0 self-start sm:self-center"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Drill with AI</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
