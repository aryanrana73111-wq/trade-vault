import React, { useState } from 'react';
import { 
  X, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Award, 
  TrendingUp, 
  ShieldAlert, 
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  BarChart3,
  Layers
} from 'lucide-react';
import { COMPREHENSIVE_ASSESSMENT_QUESTIONS } from '@/data/academy/assessmentQuestions';
import { evaluateAcademyAssessment } from '@/data/academy/assessmentEngine';
import { 
  AssessmentResult, 
  getMasteryBadgeColor, 
  getMasteryState 
} from '@/types/assessment';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { AssessmentChartViewer } from './assessment/AssessmentChartViewer';
import { CompetencyRadarChart } from './assessment/CompetencyRadarChart';
import { ReassessmentAnalysisCard } from './assessment/ReassessmentAnalysisCard';
import { LevelProgressionGraph } from './assessment/LevelProgressionGraph';

interface FindMyLevelModalProps {
  onClose: () => void;
  onSelectLesson?: (lessonId: string) => void;
  onNavigateTab?: (tabId: string) => void;
}

export const FindMyLevelModal: React.FC<FindMyLevelModalProps> = ({
  onClose,
  onSelectLesson,
  onNavigateTab
}) => {
  const { progress, recordPlacementResult } = useAcademy();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const questions = COMPREHENSIVE_ASSESSMENT_QUESTIONS;
  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPct = Math.round(((currentIndex + 1) / questions.length) * 100);

  const isReassessment = !!progress.placementTestResult;

  const handleSelectOption = (idx: number) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Complete and evaluate assessment
      const prevResult: any = progress.placementTestResult;
      const evalResult = evaluateAcademyAssessment(answers, prevResult, questions);
      setResult(evalResult);

      // Persist into Academy context
      recordPlacementResult({
        assessedLevel: evalResult.assessedLevel,
        recommendedStartingLevel: evalResult.recommendedStartingLevel,
        domainScores: evalResult.domainScores,
        confidence: evalResult.confidenceLevel,
        strengths: evalResult.strengths,
        weaknesses: evalResult.weaknesses,
        recommendedLessonIds: evalResult.recommendedLessonIds,
        completedAt: evalResult.timestamp
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
  };

  const handleConnectToLearningPath = () => {
    onClose();
    if (onNavigateTab) {
      onNavigateTab('path');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  FIND MY TRADING LEVEL
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {isReassessment ? 'Reassessment Mode' : 'Diagnostic Placement'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Institutional Competency & Practical Skill Assessment (Levels 0 → 10)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {!result ? (
            /* Active Question Screen */
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Progress and Domain Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-[10px]">
                      {currentQ.domain}
                    </span>
                    <span className="text-slate-400">| Target L{currentQ.targetLevel}</span>
                  </span>
                  <span>Question {currentIndex + 1} of {questions.length} ({progressPct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                    {currentQ.type.replace('-', ' ').toUpperCase()} • {currentQ.skillEvaluated}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {currentQ.question}
                  </h2>
                </div>

                {currentQ.context && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                    {currentQ.context}
                  </p>
                )}

                {/* Embedded Visual Chart Interpretation */}
                {currentQ.chartData && (
                  <AssessmentChartViewer data={currentQ.chartData} />
                )}

                {/* Answer Options */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = answers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full p-4 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-400/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  disabled={answers[currentQ.id] === undefined}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1.5"
                >
                  <span>{isLastQuestion ? 'Complete Assessment' : 'Next Question'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Educational Disclaimer Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200/80 dark:border-amber-900/50 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                  <strong className="font-black uppercase tracking-wider">Educational Assessment Notice:</strong> Scores and mastery levels are pedagogical diagnostics derived from actual answers. They do not constitute professional certification, regulatory licensing, or financial advice.
                </div>
              </div>

              {/* Top Overview Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Assessed Level */}
                <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    Current Level
                  </span>
                  <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                    Level {result.assessedLevel}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Accuracy: {result.overallAccuracy}% across {questions.length} questions
                  </p>
                </div>

                {/* Recommended Starting Level */}
                <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                    Recommended Starting Level
                  </span>
                  <div className="text-3xl font-black text-amber-700 dark:text-amber-300">
                    Level {result.recommendedStartingLevel}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Guarantees mandatory risk and survival mastery
                  </p>
                </div>

                {/* Strongest Domain */}
                <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Strongest Domain
                  </span>
                  <div className="text-base font-black text-emerald-800 dark:text-emerald-200 truncate">
                    {result.strongestDomain}
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                    {result.domainScores[result.strongestDomain]}% Accuracy
                  </p>
                </div>

                {/* Weakest Domain */}
                <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
                    Weakest Domain
                  </span>
                  <div className="text-base font-black text-rose-800 dark:text-rose-200 truncate">
                    {result.weakestDomain}
                  </div>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 font-bold">
                    {result.domainScores[result.weakestDomain]}% Accuracy
                  </p>
                </div>
              </div>

              {/* Visual Progression Roadmap */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <LevelProgressionGraph
                  currentLevel={result.assessedLevel}
                  recommendedStartingLevel={result.recommendedStartingLevel}
                  onSelectLevel={(lvl) => {
                    onClose();
                    if (onNavigateTab) onNavigateTab('path');
                  }}
                />
              </div>

              {/* Reassessment Differential Card (if reassessment) */}
              {result.isReassessment && (
                <ReassessmentAnalysisCard
                  result={result}
                  onSelectLesson={(lessonId) => {
                    onClose();
                    if (onSelectLesson) onSelectLesson(lessonId);
                  }}
                />
              )}

              {/* Domain Breakdown & Spider Visualization */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 8-Domain Competency Radar Chart */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between mb-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      8-Domain Competency Radar
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                      Confidence: {result.confidenceLevel}
                    </span>
                  </div>

                  <CompetencyRadarChart
                    scores={result.domainScores}
                    targetBenchmark={80}
                    size={320}
                  />
                </div>

                {/* Domain Scores & Educational Mastery Progress Bars */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Domain Scores & Mastery States
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Actual Answers Verified
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {Object.entries(result.domainDetails).map(([dom, detail]) => {
                      const color = getMasteryBadgeColor(detail.masteryState);
                      return (
                        <div key={dom} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-800 dark:text-slate-200">{dom}</span>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.2 rounded-md text-[10px] font-black border ${color.bg} ${color.text} ${color.border}`}>
                                {detail.masteryState}
                              </span>
                              <span className="text-slate-600 dark:text-slate-400 font-mono">
                                {detail.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${detail.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recommended Lessons */}
              {result.recommendedLessonIds.length > 0 && (
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                        Recommended Lessons To Bridge Weaknesses
                      </h4>
                    </div>
                    <span className="text-xs text-slate-400">
                      {result.recommendedLessonIds.length} Targeted Lessons
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.recommendedLessonIds.map(lessonId => {
                      const lesson = ACADEMY_LESSONS.find(l => l.id === lessonId);
                      if (!lesson) return null;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            onClose();
                            if (onSelectLesson) onSelectLesson(lesson.id);
                          }}
                          className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer group space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                            <span>Level {lesson.level}</span>
                            <span>{lesson.domain}</span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {lesson.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {lesson.whatIsIt}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Assessment</span>
                </button>

                <button
                  onClick={handleConnectToLearningPath}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Begin Recommended Learning Path (Level {result.recommendedStartingLevel})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
