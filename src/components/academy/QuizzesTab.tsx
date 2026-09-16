import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  RotateCcw, 
  HelpCircle, 
  Search, 
  Award, 
  Flame, 
  Filter,
  X,
  Play,
  ArrowRight
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { QuizCard, QuizInfo } from './components';
import { ScrollableTabs } from './ScrollableTabs';
import { HorizontalScrollRow } from './HorizontalScrollRow';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { QuizQuestion, AcademyDomain, Lesson } from '@/types/academy';

interface QuizzesTabProps {
  onOpenLessonWithQuiz: (lesson: Lesson) => void;
}

export const QuizzesTab: React.FC<QuizzesTabProps> = ({ onOpenLessonWithQuiz }) => {
  const { progress, recordQuizAttempt } = useAcademy();
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [activeQuizLesson, setActiveQuizLesson] = useState<Lesson | null>(null);

  // Active quiz in-modal runner state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [sessionMistakes, setSessionMistakes] = useState<any[]>([]);

  // Collect all quizzes from lessons that have questions
  const allQuizzes: { quizInfo: QuizInfo; lesson: Lesson }[] = useMemo(() => {
    return ACADEMY_LESSONS.filter(l => (l.quiz && l.quiz.length > 0) || (l.quizQuestions && l.quizQuestions.length > 0))
      .map(l => {
        const questions = l.quiz || l.quizQuestions || [];
        return {
          quizInfo: {
            id: `quiz-${l.id}`,
            lessonId: l.id,
            title: `${l.title} — Comprehension Quiz`,
            level: l.level,
            domain: l.domain,
            questionCount: questions.length,
            passingScorePct: 80
          },
          lesson: l
        };
      });
  }, []);

  const filteredQuizzes = useMemo(() => {
    return allQuizzes.filter(({ quizInfo }) => {
      if (selectedDomain !== 'All' && quizInfo.domain !== selectedDomain) return false;
      if (selectedLevel !== 'All' && quizInfo.level !== parseInt(selectedLevel, 10)) return false;
      return true;
    });
  }, [allQuizzes, selectedDomain, selectedLevel]);

  // Launch modal quiz runner
  const handleStartQuiz = (lesson: Lesson) => {
    setActiveQuizLesson(lesson);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setQuizScore(0);
    setQuizFinished(false);
    setSessionMistakes([]);
  };

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
    setShowExplanation(true);

    const currentQ = (activeQuizLesson?.quiz || activeQuizLesson?.quizQuestions || [])[currentQuestionIndex];
    const correctIdx = currentQ?.correctIndex ?? currentQ?.correctAnswerIndex ?? 0;
    const isCorrect = index === correctIdx;

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    } else if (activeQuizLesson && currentQ) {
      // Record mistake
      const mistake = {
        questionId: currentQ.id || `q-${currentQuestionIndex}`,
        questionText: currentQ.question,
        domain: activeQuizLesson.domain,
        userChoice: currentQ.options[index] || '',
        correctAnswer: currentQ.options[correctIdx] || '',
        explanation: currentQ.explanation
      };
      setSessionMistakes(prev => [...prev, mistake]);
    }
  };

  const handleNextQuestion = () => {
    const questions = activeQuizLesson?.quiz || activeQuizLesson?.quizQuestions || [];
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finished quiz
      setQuizFinished(true);
      const totalQ = questions.length;
      const scorePct = totalQ > 0 ? Math.round((quizScore / totalQ) * 100) : 0;
      if (activeQuizLesson) {
        recordQuizAttempt(activeQuizLesson.id, scorePct, sessionMistakes);
      }
    }
  };

  const domainsList: AcademyDomain[] = [
    'Market Knowledge',
    'Technical Analysis',
    'Fundamental Analysis',
    'Risk Management',
    'Execution',
    'Trading Psychology',
    'Behavioral Finance',
    'Quantitative Analysis',
    'Portfolio Management',
    'Derivatives',
    'Macro Economics',
    'Market Microstructure',
    'Research',
    'Professional Practice'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Diagnostic Hub
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Institutional Comprehension Quizzes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Verify theoretical and numerical mastery before deploying live capital. Incorrect answers automatically route to your personal Mistake Bank for structured remediation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800">
            {Object.keys(progress.quizAttempts).length} / {allQuizzes.length} Quizzes Attempted
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="space-y-3 p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Domain Scrollable Tabs */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
          <ScrollableTabs
            tabs={[
              { id: 'All', label: 'All Domains' },
              ...domainsList.map(d => ({ id: d, label: d }))
            ]}
            activeTab={selectedDomain}
            onTabChange={(id) => setSelectedDomain(id)}
            ariaLabel="Quiz domains"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Levels</option>
              {Array.from({ length: 11 }, (_, i) => (
                <option key={i} value={i}>Level {i}</option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredQuizzes.length} quizzes
          </span>
        </div>
      </div>

      {/* Featured Quizzes Carousel if viewing all */}
      {selectedDomain === 'All' && selectedLevel === 'All' && (
        <HorizontalScrollRow
          title="Recommended Institutional Quizzes"
          subtitle="Priority comprehension assessments across critical market risk and execution domains"
          showControls={true}
          itemSpacing="gap-3.5"
        >
          {allQuizzes.slice(0, 6).map(({ quizInfo, lesson }) => {
            const attemptData = progress.quizAttempts[lesson.id];
            return (
              <div key={`featured-${quizInfo.id}`} className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">
                <QuizCard
                  quiz={quizInfo}
                  bestScore={attemptData?.bestScore}
                  attemptsCount={attemptData?.attempts}
                  onTakeQuiz={() => handleStartQuiz(lesson)}
                />
              </div>
            );
          })}
        </HorizontalScrollRow>
      )}

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuizzes.map(({ quizInfo, lesson }) => {
          const attemptData = progress.quizAttempts[lesson.id];
          return (
            <QuizCard
              key={quizInfo.id}
              quiz={quizInfo}
              bestScore={attemptData?.bestScore}
              attemptsCount={attemptData?.attempts}
              onTakeQuiz={() => handleStartQuiz(lesson)}
            />
          );
        })}
      </div>

      {/* Interactive Quiz Runner Modal */}
      {activeQuizLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                  Level {activeQuizLesson.level} • {activeQuizLesson.domain}
                </span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mt-1">
                  {activeQuizLesson.title} — Quiz
                </h3>
              </div>

              <button
                onClick={() => setActiveQuizLesson(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {!quizFinished ? (
                (() => {
                  const questions = activeQuizLesson.quiz || activeQuizLesson.quizQuestions || [];
                  const q = questions[currentQuestionIndex];
                  if (!q) return null;
                  const correctIdx = q.correctIndex ?? q.correctAnswerIndex ?? 0;

                  return (
                    <div className="space-y-4">
                      {/* Question counter & progress */}
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span>Score: {quizScore}</span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Prompt */}
                      <h4 className="text-base font-black text-slate-900 dark:text-slate-100 leading-snug pt-2">
                        {q.question}
                      </h4>

                      {/* Options */}
                      <div className="space-y-2 pt-2">
                        {q.options.map((opt, idx) => {
                          const isChosen = selectedOption === idx;
                          const isCorrect = idx === correctIdx;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              disabled={showExplanation}
                              className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 ${
                                showExplanation
                                  ? isCorrect
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100'
                                    : isChosen
                                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-100'
                                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 opacity-60'
                                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              <span>{opt}</span>
                              {showExplanation && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Institutional Explanation */}
                      {showExplanation && (
                        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-1.5 animate-in fade-in duration-150">
                          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                            Institutional Explanation
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                /* Quiz Complete Result Screen */
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                    <Award className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                      Quiz Completed!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Score: {quizScore} out of {(activeQuizLesson.quiz || activeQuizLesson.quizQuestions || []).length} ({Math.round((quizScore / ((activeQuizLesson.quiz || activeQuizLesson.quizQuestions || []).length || 1)) * 100)}%)
                    </p>
                  </div>

                  {sessionMistakes.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
                      {sessionMistakes.length} misconception(s) automatically added to your Mistake Bank for spaced review.
                    </div>
                  )}

                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleStartQuiz(activeQuizLesson)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                    <button
                      onClick={() => setActiveQuizLesson(null)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            {!quizFinished && showExplanation && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
