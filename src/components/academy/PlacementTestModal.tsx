import React, { useState } from 'react';
import { 
  X, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Compass, 
  TrendingUp, 
  Shield, 
  BarChart3, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PLACEMENT_QUESTIONS, evaluatePlacementTest, PlacementResult } from '@/data/academy/placementTest';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';

interface PlacementTestModalProps {
  onClose: () => void;
  onSelectLesson?: (lessonId: string) => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({ onClose, onSelectLesson }) => {
  const { recordPlacementResult } = useAcademy();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);

  const currentQ = PLACEMENT_QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === PLACEMENT_QUESTIONS.length - 1;
  const progressPct = Math.round(((currentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100);

  const handleSelect = (index: number) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: index }));
  };

  const handleNext = () => {
    if (currentIndex < PLACEMENT_QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate results
      const res = evaluatePlacementTest(answers);
      setResult(res);
      recordPlacementResult(res);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Find My Trading Level Diagnostic
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Institutional Competency & Placement Assessment
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!result ? (
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Question {currentIndex + 1} of {PLACEMENT_QUESTIONS.length}</span>
                  <span>{progressPct}% complete</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Domain & Skill Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {currentQ.domain}
                </span>
                <span className="text-xs text-slate-500">
                  Target Level {currentQ.targetLevel} Concept • {currentQ.skillEvaluated}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-3">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {currentQ.question}
                </h4>

                {currentQ.context && (
                  <p className="text-xs p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 italic">
                    {currentQ.context}
                  </p>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt, optIndex) => {
                  const isSelected = answers[currentQ.id] === optIndex;
                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelect(optIndex)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* RESULTS SCREEN */
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Certification Disclaimer */}
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Educational Roadmap Diagnostic: </span>
                  This diagnostic is strictly a curriculum placement tool for personalizing your learning roadmap. It is not a professional license, FINRA certification, or accredited financial qualification.
                </div>
              </div>

              {/* Hero Result Card */}
              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
                      Assessment Outcome
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 font-bold backdrop-blur-xs">
                      {result.confidence} Confidence
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                    <h2 className="text-3xl font-black tracking-tight">
                      Assessed: Level {result.assessedLevel}
                    </h2>
                    <span className="text-blue-200 text-sm font-medium">
                      Recommended Starting Point: <strong>Level {result.recommendedStartingLevel}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-blue-100 mt-2 max-w-xl leading-relaxed">
                    Based on your analytical accuracy across foundational mathematics, market structure, and risk invariance, your curriculum will begin at Level {result.recommendedStartingLevel} to solidify essential core competencies.
                  </p>
                </div>
              </div>

              {/* Domain Mastery Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Domain Competency Radar
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(result.domainScores).map(([domain, score]) => (
                    <div 
                      key={domain}
                      className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <span className="text-[11px] text-slate-500 block truncate font-medium">{domain}</span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{score}%</span>
                        <span className={`text-[10px] font-bold ${
                          score >= 80 ? 'text-emerald-600' : score < 50 ? 'text-rose-600' : 'text-blue-600'
                        }`}>
                          {score >= 80 ? 'Strength' : score < 50 ? 'Gap' : 'Developing'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Focus Lessons */}
              {result.recommendedLessonIds.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Priority Recommended Lessons
                  </h4>
                  <div className="space-y-2">
                    {result.recommendedLessonIds.map(lessonId => {
                      const lesson = ACADEMY_LESSONS.find(l => l.id === lessonId);
                      if (!lesson) return null;
                      return (
                        <div 
                          key={lesson.id}
                          className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                                Level {lesson.level}
                              </span>
                              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {lesson.title}
                              </h5>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{lesson.domain} • {lesson.estimatedMinutes} min</p>
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectLesson) onSelectLesson(lesson.id);
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <span>Study</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          {!result ? (
            <>
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-colors ${
                  currentIndex === 0 
                    ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={answers[currentQ.id] === undefined}
                className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
                  answers[currentQ.id] !== undefined
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{isLastQuestion ? 'Evaluate Diagnostic' : 'Next Question'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => {
                  setResult(null);
                  setCurrentIndex(0);
                  setAnswers({});
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Diagnostic</span>
              </button>

              <button
                onClick={onClose}
                className="text-xs font-bold px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                Apply Level & View Roadmap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
