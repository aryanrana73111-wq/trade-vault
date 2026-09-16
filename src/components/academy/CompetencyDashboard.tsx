import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Award, 
  Flame, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Brain,
  TrendingUp,
  Compass,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { AcademyDomain, Lesson } from '@/types/academy';
import { 
  EducationalMasteryState, 
  getMasteryBadgeColor, 
  getMasteryState,
  AssessmentResult 
} from '@/types/assessment';
import { ProgressRing } from './components/ProgressRing';
import { CompetencyRadarChart } from './assessment/CompetencyRadarChart';
import { LevelProgressionGraph } from './assessment/LevelProgressionGraph';
import { ReassessmentAnalysisCard } from './assessment/ReassessmentAnalysisCard';
import { FindMyLevelModal } from './FindMyLevelModal';

interface CompetencyDashboardProps {
  onNavigateTab: (tabId: string) => void;
  onOpenLesson?: (lesson: Lesson) => void;
}

export const CompetencyDashboard: React.FC<CompetencyDashboardProps> = ({
  onNavigateTab,
  onOpenLesson
}) => {
  const { progress } = useAcademy();
  const [isAssessmentOpen, setIsAssessmentOpen] = useState(false);

  const currentLevelNumber = progress.currentLevel ?? 0;
  const currentLevelInfo = ACADEMY_LEVELS.find(l => l.level === currentLevelNumber) || ACADEMY_LEVELS[0];
  const currentLevelLessons = ACADEMY_LESSONS.filter(l => l.level === currentLevelNumber);
  const currentCompletedCount = currentLevelLessons.filter(l => progress.completedLessons.includes(l.id)).length;

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

  // Derive domain scores directly from verified progress / assessment
  const domainScores = useMemo(() => {
    return progress.domainMastery;
  }, [progress.domainMastery]);

  // Overall accuracy / mastery
  const overallMastery = progress.overallMastery;
  const overallMasteryState = getMasteryState(overallMastery);

  // Strongest and weakest domains
  const { strongestDomain, weakestDomain } = useMemo(() => {
    let strong = domainsList[0];
    let weak = domainsList[0];
    let max = -1;
    let min = 999;

    domainsList.forEach(d => {
      const score = domainScores[d] || 0;
      if (score > max) {
        max = score;
        strong = d;
      }
      if (score < min) {
        min = score;
        weak = d;
      }
    });

    return { strongestDomain: strong, weakestDomain: weak };
  }, [domainScores]);

  // Transform placement test result into AssessmentResult format if present
  const assessmentResult: AssessmentResult | null = useMemo(() => {
    if (!progress.placementTestResult) return null;
    const pt = progress.placementTestResult as any;

    const domainDetails: any = {};
    domainsList.forEach(d => {
      const pct = pt.domainScores?.[d] || 0;
      domainDetails[d] = {
        domain: d,
        totalQuestions: 2,
        correctAnswers: Math.round(pct / 50),
        percentage: pct,
        masteryState: getMasteryState(pct)
      };
    });

    // Determine differentials / recommendations
    const remainingWeaknesses = domainsList.filter(d => (pt.domainScores?.[d] || 0) < 60);
    const recommendedNextStudy = remainingWeaknesses.slice(0, 3).map(d => {
      const lesson = ACADEMY_LESSONS.find(l => l.domain === d) || ACADEMY_LESSONS[0];
      return {
        lessonId: lesson.id,
        title: lesson.title,
        domain: d,
        reason: `Targeted remediation to achieve ≥60% proficiency in ${d}.`
      };
    });

    return {
      id: 'stored-result',
      timestamp: pt.completedAt || new Date().toISOString(),
      assessedLevel: pt.assessedLevel ?? progress.currentLevel,
      recommendedStartingLevel: pt.recommendedStartingLevel ?? progress.currentLevel,
      overallAccuracy: progress.overallMastery,
      confidenceLevel: 'High',
      domainScores: pt.domainScores || progress.domainMastery,
      domainDetails,
      strongestDomain,
      weakestDomain,
      strengths: domainsList.filter(d => (pt.domainScores?.[d] || 0) >= 75),
      weaknesses: remainingWeaknesses,
      recommendedLessonIds: pt.recommendedLessonIds || [],
      answers: {},
      isReassessment: true,
      remainingWeaknesses,
      recommendedNextStudy
    };
  }, [progress.placementTestResult, progress.domainMastery, progress.currentLevel, progress.overallMastery, strongestDomain, weakestDomain]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Institutional Competency Framework
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Skill Passport
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Educational competency record measuring practical market structure, execution, and risk knowledge. Track your verified learning state from Not Started through Strong. This is an educational and research framework, not an employment credential.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAssessmentOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{progress.placementTestCompleted ? 'Reassess My Level' : 'Take Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* Mandatory Educational Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-bold">Educational Labels Only:</strong> Mastery states (Not Started, Learning, Practicing, Developing, Proficient, Strong) are pedagogical progress indicators derived strictly from your verified diagnostic answers and completed exercises. They do not constitute professional certification, financial licensing, or advisory credentials.
        </p>
      </div>

      {/* Top Metrics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Mastery Card with Progress Ring */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Overall Mastery
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {overallMastery}%
            </div>
            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${getMasteryBadgeColor(overallMasteryState).bg} ${getMasteryBadgeColor(overallMasteryState).text} ${getMasteryBadgeColor(overallMasteryState).border}`}>
              {overallMasteryState}
            </span>
          </div>
          <ProgressRing
            value={overallMastery}
            size={64}
            strokeWidth={6}
            color="stroke-blue-600"
            trackColor="stroke-slate-200 dark:stroke-slate-800"
          />
        </div>

        {/* Current Level Card */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Curriculum Position
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            Level {progress.currentLevel}
          </div>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
            {currentLevelInfo.title}
          </p>
          <div className="text-[10px] text-slate-400 pt-0.5">
            {currentCompletedCount} / {currentLevelLessons.length} level lessons mastered
          </div>
        </div>

        {/* Strongest Domain */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Strongest Domain
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
            {strongestDomain}
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {domainScores[strongestDomain] || 0}% Accuracy
          </div>
          <span className="text-[10px] text-slate-400">
            State: {getMasteryState(domainScores[strongestDomain] || 0)}
          </span>
        </div>

        {/* Weakest Domain */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Weakest Domain
          </span>
          <div className="text-lg font-black text-slate-900 dark:text-slate-100 truncate">
            {weakestDomain}
          </div>
          <div className="text-sm font-bold text-rose-500 font-mono">
            {domainScores[weakestDomain] || 0}% Accuracy
          </div>
          <span className="text-[10px] text-slate-400">
            State: {getMasteryState(domainScores[weakestDomain] || 0)}
          </span>
        </div>
      </div>

      {/* Curriculum Level Progression Graph */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <LevelProgressionGraph
          currentLevel={progress.currentLevel}
          recommendedStartingLevel={progress.placementTestResult?.recommendedStartingLevel ?? progress.currentLevel}
          onSelectLevel={() => onNavigateTab('path')}
        />
      </div>

      {/* Reassessment Differential Card (if assessment was performed) */}
      {assessmentResult && (
        <ReassessmentAnalysisCard
          result={assessmentResult}
          onSelectLesson={(lessonId) => {
            const l = ACADEMY_LESSONS.find(item => item.id === lessonId);
            if (l && onOpenLesson) {
              onOpenLesson(l);
            } else {
              onNavigateTab('path');
            }
          }}
        />
      )}

      {/* Middle Grid: Radar Visualization & Domain Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 8-Axis Radar Visualization */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                8-Domain Competency Radar
              </h3>
              <p className="text-[11px] text-slate-400">
                Polygon area represents verified domain depth relative to 80% benchmark
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              Live Topology
            </span>
          </div>

          <CompetencyRadarChart
            scores={domainScores}
            targetBenchmark={80}
            size={340}
          />
        </div>

        {/* 8 Domain Progress Bars with Educational Mastery Badges */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                Domain Mastery Progression
              </h3>
              <p className="text-[11px] text-slate-400">
                Categorized by educational mastery thresholds (0% → 100%)
              </p>
            </div>
            <button
              onClick={() => setIsAssessmentOpen(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Reassess
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {domainsList.map(domain => {
              const score = domainScores[domain] || 0;
              const state = getMasteryState(score);
              const color = getMasteryBadgeColor(state);

              return (
                <div key={domain} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {domain}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${color.bg} ${color.text} ${color.border}`}>
                        {state}
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300 w-10 text-right">
                        {score}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      {isAssessmentOpen && (
        <FindMyLevelModal
          onClose={() => setIsAssessmentOpen(false)}
          onSelectLesson={(lessonId) => {
            setIsAssessmentOpen(false);
            const l = ACADEMY_LESSONS.find(item => item.id === lessonId);
            if (l && onOpenLesson) onOpenLesson(l);
          }}
          onNavigateTab={onNavigateTab}
        />
      )}
    </div>
  );
};
