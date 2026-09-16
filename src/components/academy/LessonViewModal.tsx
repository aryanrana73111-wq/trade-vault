import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Clock, 
  Shield, 
  BookOpen, 
  HelpCircle, 
  ArrowRight, 
  FileText, 
  Sparkles,
  AlertCircle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { Lesson, AcademyConcept } from '@/types/academy';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_CONCEPTS } from '@/data/academy/curriculum';
import { RiskEngineDiagram } from './artifacts/RiskEngineDiagram';
import { EquityDrawdownVisualizer } from './artifacts/EquityDrawdownVisualizer';
import { ExpectedValueVisualizer } from './artifacts/ExpectedValueVisualizer';
import { MarketStructureVisualizer } from './artifacts/MarketStructureVisualizer';
import { OrderBookDepthVisualizer } from './artifacts/OrderBookDepthVisualizer';
import { NormalDistributionVisualizer } from './artifacts/NormalDistributionVisualizer';
import { JournalSyncBanner } from './artifacts/JournalSyncBanner';
import { AcademyEcosystemBridge } from './AcademyEcosystemBridge';
import { getVisualizerById } from './artifacts/visualizerRegistry';

interface LessonViewModalProps {
  lesson: Lesson;
  onClose: () => void;
}

export const LessonViewModal: React.FC<LessonViewModalProps> = ({ lesson, onClose }) => {
  const { 
    progress, 
    completeLesson, 
    recordQuizAttempt, 
    toggleBookmark, 
    saveNote 
  } = useAcademy();

  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'notes'>('content');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [personalNote, setPersonalNote] = useState(progress.personalNotes[lesson.id] || '');
  const [savedNoteSuccess, setSavedNoteSuccess] = useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const isCompleted = progress.completedLessons.includes(lesson.id);
  const isBookmarked = progress.bookmarkedLessons.includes(lesson.id);
  const quizAttempt = progress.quizAttempts[lesson.id];

  // Retrieve related concepts
  const relatedConcepts: AcademyConcept[] = (lesson.relatedConceptIds || [])
    .map(cId => ACADEMY_CONCEPTS.find(c => c.id === cId))
    .filter((c): c is AcademyConcept => !!c);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!lesson.quizQuestions || lesson.quizQuestions.length === 0) return;
    setQuizSubmitted(true);

    let correctCount = 0;
    const mistakes: Array<{
      questionId: string;
      questionText: string;
      domain: any;
      userChoice: string;
      correctAnswer: string;
      explanation: string;
    }> = [];

    lesson.quizQuestions.forEach(q => {
      const userChoiceIdx = selectedAnswers[q.id];
      if (userChoiceIdx === q.correctAnswerIndex) {
        correctCount += 1;
      } else {
        mistakes.push({
          questionId: q.id,
          questionText: q.question,
          domain: lesson.domain,
          userChoice: userChoiceIdx !== undefined ? q.options[userChoiceIdx] : 'Unanswered',
          correctAnswer: q.options[q.correctAnswerIndex],
          explanation: q.explanation
        });
      }
    });

    const scorePct = Math.round((correctCount / lesson.quizQuestions.length) * 100);
    await recordQuizAttempt(lesson.id, scorePct, mistakes);
  };

  const handleSaveNote = async () => {
    await saveNote(lesson.id, personalNote);
    setSavedNoteSuccess(true);
    setTimeout(() => setSavedNoteSuccess(false), 2500);
  };

  const handleMarkComplete = async () => {
    await completeLesson(lesson.id);
  };

  // Render appropriate interactive artifact based on lesson
  const renderArtifact = () => {
    // 1. Direct match on artifact type from visualizerRegistry
    if (lesson.artifact?.type) {
      const vis = getVisualizerById(lesson.artifact.type);
      if (vis) {
        return React.createElement(vis.component);
      }
    }

    // 2. Specific lesson mappings
    if (lesson.id === 'l3-position-sizing-mathematics') {
      const vis = getVisualizerById('position-size-sandbox');
      return vis ? React.createElement(vis.component) : <RiskEngineDiagram />;
    }
    if (lesson.id === 'l3-drawdown-and-risk-of-ruin') {
      const vis = getVisualizerById('underwater-drawdown-curve');
      return vis ? React.createElement(vis.component) : <EquityDrawdownVisualizer />;
    }
    if (lesson.id === 'l3-expected-value-and-edge') {
      const vis = getVisualizerById('system-equity-curve');
      return vis ? React.createElement(vis.component) : <ExpectedValueVisualizer />;
    }
    if (lesson.id === 'l4-market-structure-swings') {
      const vis = getVisualizerById('market-structure-diagram');
      return vis ? React.createElement(vis.component) : <MarketStructureVisualizer />;
    }
    if (lesson.id === 'l2-order-types-execution' || lesson.id === 'l6-market-microstructure-and-tca') {
      const vis = getVisualizerById('level-2-order-book');
      return vis ? React.createElement(vis.component) : <OrderBookDepthVisualizer />;
    }
    if (lesson.id === 'l8-probability-distributions-and-monte-carlo') {
      const vis = getVisualizerById('probability-distribution');
      return vis ? React.createElement(vis.component) : <NormalDistributionVisualizer />;
    }
    if (lesson.id === 'l7-derivatives-and-convexity') {
      const vis = getVisualizerById('options-payoff-diagram');
      if (vis) return React.createElement(vis.component);
    }
    if (lesson.id === 'l9-portfolio-construction-risk-parity') {
      const vis = getVisualizerById('portfolio-circle-chart');
      if (vis) return React.createElement(vis.component);
    }
    if (lesson.id === 'l10-systematic-execution-decision') {
      const vis = getVisualizerById('execution-decision-tree');
      if (vis) return React.createElement(vis.component);
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
              Level {lesson.level}
            </span>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {lesson.domain}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{lesson.estimatedMinutes} min</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleBookmark('lesson', lesson.id)}
              className={`p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${
                isBookmarked 
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Bookmark Lesson"
              aria-label="Bookmark Lesson"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Lesson Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 bg-white dark:bg-slate-900 text-xs font-semibold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 shrink-0 min-h-[44px] ${
              activeTab === 'content'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Lesson Guide & Visuals</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 shrink-0 min-h-[44px] ${
              activeTab === 'quiz'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Comprehension Check {lesson.quizQuestions ? `(${lesson.quizQuestions.length})` : ''}</span>
            {quizAttempt && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                quizAttempt.bestScore >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'
              }`}>
                {quizAttempt.bestScore}%
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-colors flex items-center gap-2 shrink-0 min-h-[44px] ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Personal Journal Notes</span>
            {personalNote && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CONTENT */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Quick Section Jump Navigator */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold text-slate-500 scrollbar-none border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 shrink-0">Jump to:</span>
                <a 
                  href="#lesson-overview" 
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                >
                  Overview
                </a>
                <a 
                  href="#lesson-bridge" 
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                >
                  TradeVault Bridge
                </a>
                {relatedConcepts.length > 0 && (
                  <a 
                    href="#lesson-concepts" 
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                  >
                    Concepts ({relatedConcepts.length})
                  </a>
                )}
                <a 
                  href="#lesson-artifact" 
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
                >
                  Interactive Simulation
                </a>
                {lesson.learningObjectives && (
                  <a 
                    href="#lesson-objectives" 
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                  >
                    Objectives Checklist
                  </a>
                )}
              </div>

              {/* Title & Description */}
              <div id="lesson-overview" className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {lesson.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lesson.description}
                </p>
              </div>

              {/* Real Journal Live Integration & Direct Ecosystem Workflows */}
              <div id="lesson-bridge">
                <AcademyEcosystemBridge lesson={lesson} />
              </div>

              {/* Core Pedagogical Concepts */}
              {relatedConcepts.length > 0 && (
                <div id="lesson-concepts" className="my-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Core Concepts Covered
                  </h3>
                  {relatedConcepts.map(c => (
                    <div 
                      key={c.id} 
                      className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          {c.title}
                        </h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {c.difficulty}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {c.summary}
                      </p>

                      {c.mathematicalFormula && (
                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400 overflow-x-auto">
                          {c.mathematicalFormula}
                        </div>
                      )}

                      {c.institutionalInsight && (
                        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Institutional Insight: </span>
                            {c.institutionalInsight}
                          </div>
                        </div>
                      )}

                      {c.commonPitfall && (
                        <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-lg border border-rose-100 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-300 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Retail Pitfall: </span>
                            {c.commonPitfall}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Artifact */}
              <div id="lesson-artifact">
                {renderArtifact()}
              </div>

              {/* Lesson Objectives Checklist */}
              {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
                <div id="lesson-objectives" className="my-6 p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    Mastery Checklist
                  </h4>
                  <div className="space-y-2">
                    {lesson.learningObjectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: COMPREHENSION CHECK (QUIZ) */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Knowledge Verification
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Test your comprehension with institutional scenario and numerical questions. A score of 70% or higher certifies mastery of this lesson.
                </p>
              </div>

              {lesson.quizQuestions && lesson.quizQuestions.map((q, qIndex) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const userChoice = selectedAnswers[q.id];
                const isCorrect = userChoice === q.correctAnswerIndex;

                return (
                  <div 
                    key={q.id}
                    className="p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-slate-400">Question {qIndex + 1}</span>
                      {quizSubmitted && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {isCorrect ? 'Correct (+100%)' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {q.question}
                    </p>

                    {q.scenarioContext && (
                      <p className="text-xs italic text-slate-500 dark:text-slate-400 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        Scenario: {q.scenarioContext}
                      </p>
                    )}

                    {/* Options */}
                    <div className="space-y-2 pt-1">
                      {q.options.map((opt, optIndex) => {
                        const isChosen = userChoice === optIndex;
                        let optionStyle = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300';
                        
                        if (quizSubmitted) {
                          if (optIndex === q.correctAnswerIndex) {
                            optionStyle = 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                          } else if (isChosen) {
                            optionStyle = 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-900 dark:text-blue-200 font-semibold';
                        }

                        return (
                          <button
                            key={optIndex}
                            onClick={() => handleSelectOption(q.id, optIndex)}
                            disabled={quizSubmitted}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between min-h-[46px] focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${optionStyle}`}
                          >
                            <span className="leading-relaxed">{opt}</span>
                            {quizSubmitted && optIndex === q.correctAnswerIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Reveal */}
                    {quizSubmitted && (
                      <div className="p-3.5 mt-2 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                        <span className="font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit Quiz Button */}
              {!quizSubmitted && lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs text-xs sm:text-sm min-h-[48px] focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  Verify Answers & Calculate Score
                </button>
              )}

              {quizSubmitted && (
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Attempt Recorded</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Score: {progress.quizAttempts[lesson.id]?.lastScore ?? 0}%
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PERSONAL NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Lesson Journal & Personal Reflections
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Document your trading rules, epiphanies, and questions. These are saved directly to your profile.
                </p>
              </div>

              <textarea
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="E.g., Key takeaway: I must strictly calculate position size using 1R / stop distance. Never place stop at round numbers without checking order flow..."
                className="w-full h-56 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {savedNoteSuccess ? '✓ Saved to your TradeVault profile' : ''}
                </span>
                <button
                  onClick={handleSaveNote}
                  className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs text-xs"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Lesson Mastered
              </span>
            ) : (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
