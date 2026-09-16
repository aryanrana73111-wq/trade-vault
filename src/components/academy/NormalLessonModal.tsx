import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bookmark, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Check, 
  RotateCcw, 
  ArrowRight, 
  Clock, 
  Award,
  FileText,
  Save,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { Lesson, QuizQuestion } from '@/types/academy';
import { useAcademy } from '@/contexts/AcademyContext';
import { getResourcesForConcept, TRUSTED_RESOURCES } from '@/data/academy/trustedResources';
import { ResourceCard } from './components/ResourceCard';

interface NormalLessonModalProps {
  lesson: Lesson;
  onClose: () => void;
  onOpenNextLesson?: (nextLessonId: string) => void;
}

export const NormalLessonModal: React.FC<NormalLessonModalProps> = ({
  lesson,
  onClose,
  onOpenNextLesson
}) => {
  const { 
    progress, 
    completeLesson, 
    recordQuizAttempt, 
    toggleBookmark, 
    saveNote 
  } = useAcademy();

  // Mode: Simple (default) vs Professional
  const [explanationMode, setExplanationMode] = useState<'simple' | 'professional'>('simple');
  const [activeTab, setActiveTab] = useState<'lesson' | 'quiz' | 'resources' | 'notes'>('lesson');

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScorePct, setQuizScorePct] = useState<number | null>(null);

  // Notes State
  const [noteContent, setNoteContent] = useState<string>(progress.personalNotes[lesson.id] || '');
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const isBookmarked = progress.bookmarkedLessons.includes(lesson.id);
  const savedQuizScore = progress.quizAttempts[lesson.id]?.bestScore;

  // Extract quizzes
  const quizList: QuizQuestion[] = lesson.quizQuestions || lesson.quiz || [];

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle Note Save
  const handleSaveNote = async () => {
    await saveNote(lesson.id, noteContent);
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
  };

  const handleDeleteNote = async () => {
    await saveNote(lesson.id, '');
    setNoteContent('');
  };

  // Handle Quiz Submission
  const handleSubmitQuiz = async () => {
    if (quizList.length === 0) return;
    let correctCount = 0;
    const mistakes: any[] = [];

    quizList.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const correctIdx = q.correctIndex ?? q.correctAnswerIndex ?? 0;
      if (selected === correctIdx) {
        correctCount += 1;
      } else {
        mistakes.push({
          questionId: q.id,
          questionText: q.question,
          domain: lesson.domain,
          userChoice: selected !== undefined ? q.options[selected] : 'Unanswered',
          correctAnswer: q.options[correctIdx],
          explanation: q.explanation
        });
      }
    });

    const scorePct = Math.round((correctCount / quizList.length) * 100);
    const passed = scorePct >= 70;
    setQuizScorePct(scorePct);
    setQuizSubmitted(true);

    await recordQuizAttempt(lesson.id, scorePct, mistakes);
    if (passed && !isCompleted) {
      await completeLesson(lesson.id);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScorePct(null);
  };

  // Get trusted resources linked to this lesson
  const relatedResources = getResourcesForConcept(lesson.id).concat(
    TRUSTED_RESOURCES.filter(r => r.category?.toLowerCase() === lesson.domain?.toLowerCase()).slice(0, 2)
  );

  return (
    <div 
      id="normal-lesson-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        id="normal-lesson-modal-container"
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                Level {lesson.level} • {lesson.domain}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {lesson.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {lesson.estimatedMinutes || 8} min
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {lesson.title}
            </h2>
          </div>

          {/* Quick Actions & Close */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Bookmark button */}
            <button
              id="lesson-bookmark-btn"
              onClick={() => toggleBookmark('lesson', lesson.id)}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Lesson'}
              className={`p-2 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              id="lesson-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab & Explanation Mode Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Internal Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('lesson')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'lesson'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Lesson
            </button>

            {quizList.length > 0 && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Quiz</span>
                {savedQuizScore !== undefined && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {savedQuizScore}%
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'resources'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Trusted Resources ({relatedResources.length})
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'notes'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Personal Notes</span>
              {noteContent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
            </button>
          </div>

          {/* Section 6: Simple / Professional Toggle */}
          {activeTab === 'lesson' && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5">
                Depth:
              </span>
              <button
                id="toggle-depth-simple"
                onClick={() => setExplanationMode('simple')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  explanationMode === 'simple'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                SIMPLE
              </button>
              <button
                id="toggle-depth-professional"
                onClick={() => setExplanationMode('professional')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  explanationMode === 'professional'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                PROFESSIONAL
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {/* TAB 1: LESSON CONTENT (Structured 7-step Normal Lesson) */}
          {activeTab === 'lesson' && (
            <div className="space-y-8 max-w-3xl mx-auto">
              {/* 1. What is it? */}
              <section id="normal-lesson-what-is-it" className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    What is it?
                  </h3>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {explanationMode === 'simple'
                      ? (lesson.explainLikeIm10 || lesson.whatIsIt || lesson.description)
                      : (lesson.professionalDefinition || lesson.whatIsIt)}
                  </p>
                </div>
              </section>

              {/* 2. Why does it matter? */}
              <section id="normal-lesson-why-matters" className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Why does it matter?
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {lesson.whyItMatters || 'Understanding this concept prevents uncalculated financial risk and creates a predictable mathematical foundation for your trading.'}
                </p>
              </section>

              {/* 3. Simple explanation */}
              <section id="normal-lesson-simple-explanation" className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {explanationMode === 'simple' ? 'Simple Explanation' : 'Detailed Mechanics'}
                  </h3>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {explanationMode === 'simple' 
                      ? (lesson.visualExplanation || lesson.whatIsIt)
                      : (lesson.professionalPerspective || lesson.visualExplanation || lesson.whatIsIt)}
                  </p>
                </div>
              </section>

              {/* 4. Real-world example */}
              {(lesson.tradingExample || lesson.numericalExample) && (
                <section id="normal-lesson-example" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs">
                      4
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Real-World Example
                    </h3>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 space-y-3">
                    {lesson.tradingExample && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                          Context: {lesson.tradingExample.context}
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                          {lesson.tradingExample.scenario}
                        </p>
                        <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-850 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/50">
                          <span className="font-bold text-slate-900 dark:text-white">Outcome: </span>
                          {lesson.tradingExample.outcome}
                        </div>
                      </div>
                    )}

                    {lesson.numericalExample && (
                      <div className="pt-2 border-t border-amber-200/60 dark:border-amber-800/60 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Calculation: {lesson.numericalExample.setup}
                        </div>
                        <div className="font-mono bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          {lesson.numericalExample.calculation} = <span className="font-bold text-emerald-600 dark:text-emerald-400">{lesson.numericalExample.result}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 italic">
                          {lesson.numericalExample.takeaway}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 5. Common mistake */}
              {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
                <section id="normal-lesson-mistakes" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold text-xs">
                      5
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Common Mistake
                    </h3>
                  </div>

                  <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 space-y-2">
                    {lesson.commonMistakes.map((mistake, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-200">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{mistake}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. Quick summary / Remember This */}
              <section id="normal-lesson-remember-this" className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
                    6
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Remember This
                  </h3>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/50 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-sm sm:text-base font-semibold text-purple-950 dark:text-purple-200 leading-relaxed">
                    {lesson.masteryCriteria || 'Discipline precedes profit. Always control predefined risk first before seeking market reward.'}
                  </p>
                </div>
              </section>

              {/* 7. Take Quick Quiz Action & Completion */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {!isCompleted ? (
                    <button
                      id="mark-completed-btn"
                      onClick={() => completeLesson(lesson.id)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Lesson Read</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lesson Completed</span>
                    </div>
                  )}
                </div>

                {quizList.length > 0 && (
                  <button
                    id="take-quiz-action-btn"
                    onClick={() => setActiveTab('quiz')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Take Quick Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NORMAL QUIZ SYSTEM (Section 7) */}
          {activeTab === 'quiz' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Knowledge Check: {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Test your understanding. Minimum 70% required to master.
                  </p>
                </div>
                {quizSubmitted && (
                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Score</span>
                    <span className={`text-xl font-black ${quizScorePct && quizScorePct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {quizScorePct}%
                    </span>
                  </div>
                )}
              </div>

              {quizList.map((q, qIndex) => {
                const selected = selectedAnswers[q.id];
                const correctIdx = q.correctIndex ?? q.correctAnswerIndex ?? 0;
                const isSelectedCorrect = selected === correctIdx;

                return (
                  <div 
                    key={q.id || qIndex} 
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                        {q.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 pt-1">
                      {q.options.map((option, optIdx) => {
                        const isChosen = selected === optIdx;
                        const isThisCorrect = optIdx === correctIdx;

                        let optStyles = 'border-slate-200 dark:border-slate-750 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';

                        if (quizSubmitted) {
                          if (isThisCorrect) {
                            optStyles = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                          } else if (isChosen && !isThisCorrect) {
                            optStyles = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold';
                          } else {
                            optStyles = 'border-slate-200 dark:border-slate-800 opacity-60 text-slate-500';
                          }
                        } else if (isChosen) {
                          optStyles = 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optStyles}`}
                          >
                            <span>{option}</span>
                            {quizSubmitted && isThisCorrect && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                Correct Answer
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback & Detailed Rationale */}
                    {quizSubmitted && (
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                        isSelectedCorrect 
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200' 
                          : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50 text-rose-900 dark:text-rose-200'
                      }`}>
                        <div className="font-bold flex items-center gap-1.5">
                          {isSelectedCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>✅ Correct</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                              <span>❌ Incorrect</span>
                            </>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          <strong className="text-slate-900 dark:text-white">Why: </strong>
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quiz Submit Footer */}
              <div className="pt-4 flex items-center justify-between">
                {!quizSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < quizList.length}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold text-sm transition-all"
                  >
                    Submit Answers ({Object.keys(selectedAnswers).length}/{quizList.length})
                  </button>
                ) : (
                  <div className="flex items-center gap-3 w-full justify-between">
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('lesson')}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                    >
                      Back to Lesson
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRUSTED RESOURCES (Sections 20, 21, 22) */}
          {activeTab === 'resources' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Trusted Learning Resources
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recommended educational sources from official institutions and vetted financial educators.
                </p>
              </div>

              {relatedResources.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500">
                    No specific external resources attached to this introductory module.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedResources.map((res) => (
                    <ResourceCard key={res.id} resource={res} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PERSONAL NOTES (Section 12) */}
          {activeTab === 'notes' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Personal Lesson Notes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Notes are permanently saved to your TradeVault profile and linked to this lesson.
                </p>
              </div>

              <textarea
                id="lesson-note-textarea"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your personal takeaways, rules, or questions about this concept..."
                rows={8}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    id="save-note-btn"
                    onClick={handleSaveNote}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                  {noteSavedFeedback && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Saved
                    </span>
                  )}
                </div>

                {noteContent && (
                  <button
                    id="delete-note-btn"
                    onClick={handleDeleteNote}
                    className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
