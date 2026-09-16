import React, { useState } from 'react';
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
  Sliders,
  RotateCcw,
  Compass,
  Layers
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { 
  MasteryCard, 
  LevelCard, 
  DomainProgress, 
  ProgressRing 
} from './components';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { AcademyDomain, Lesson } from '@/types/academy';
import { CompetencyDashboard } from './CompetencyDashboard';

interface ProgressDashboardTabProps {
  onNavigateTab: (tabId: string) => void;
  onOpenLesson?: (lesson: Lesson) => void;
}

export const ProgressDashboardTab: React.FC<ProgressDashboardTabProps> = ({
  onNavigateTab,
  onOpenLesson
}) => {
  const { progress, journalStats, resetProgress } = useAcademy();
  const [activeSubView, setActiveSubView] = useState<'competency' | 'analytics'>('competency');

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

  // Quiz analytics
  const quizAttemptKeys = Object.keys(progress.quizAttempts);
  const averageQuizScore = quizAttemptKeys.length > 0
    ? Math.round(
        quizAttemptKeys.reduce((acc, k) => acc + (progress.quizAttempts[k]?.bestScore || 0), 0) /
          quizAttemptKeys.length
      )
    : 0;

  const passedQuizzesCount = quizAttemptKeys.filter(k => (progress.quizAttempts[k]?.bestScore || 0) >= 80).length;

  return (
    <div className="space-y-6">
      {/* Sub-view switcher */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setActiveSubView('competency')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'competency'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Skill Passport</span>
          </button>

          <button
            onClick={() => setActiveSubView('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubView === 'analytics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Journal & Quiz Analytics</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('path')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            View Roadmap Path
          </button>
        </div>
      </div>

      {activeSubView === 'competency' ? (
        <CompetencyDashboard
          onNavigateTab={onNavigateTab}
          onOpenLesson={onOpenLesson}
        />
      ) : (
        /* Journal & Quiz Analytics View */
        <div className="space-y-6">
          {/* Top Key Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LevelCard
              levelInfo={currentLevelInfo}
              isUnlocked={true}
              isCompleted={currentCompletedCount === currentLevelLessons.length && currentLevelLessons.length > 0}
              isCurrent={true}
              completedLessonsCount={currentCompletedCount}
              totalLessonsCount={currentLevelLessons.length}
              onSelectLevel={() => onNavigateTab('path')}
            />

            <MasteryCard
              overallMastery={progress.overallMastery}
              completedLessonsCount={progress.completedLessons.length}
              totalLessonsCount={ACADEMY_LESSONS.length}
              masteredConceptsCount={progress.masteredConcepts.length}
              currentLevel={progress.currentLevel}
              onExploreRoadmap={() => onNavigateTab('path')}
            />
          </div>

          {/* 8-Domain Competency Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Domain Curriculum Coverage
              </h3>
              <span className="text-xs text-slate-400">
                Calculated from completed modules and quiz verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {domainsList.map(domain => {
                const mastery = progress.domainMastery[domain] || 0;
                const domainLessons = ACADEMY_LESSONS.filter(l => l.domain === domain);
                const domainCompleted = domainLessons.filter(l => progress.completedLessons.includes(l.id)).length;

                return (
                  <DomainProgress
                    key={domain}
                    domain={domain}
                    masteryPct={mastery}
                    completedLessons={domainCompleted}
                    totalLessons={domainLessons.length}
                    onClick={() => onNavigateTab('skills')}
                  />
                );
              })}
            </div>
          </div>

          {/* Theory-to-Practice Live Journal Correlation */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                  Real-World Integration
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Journal Theory-to-Practice Correlation
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  How your actual executed trades align with institutional principles
                </p>
              </div>
            </div>

            {journalStats.totalTrades > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">Total Live Trades</span>
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {journalStats.totalTrades}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Logged in TradeVault</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">Expectancy (EV)</span>
                  <span className={`text-xl font-black ${journalStats.expectedValueR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {journalStats.expectedValueR >= 0 ? '+' : ''}{journalStats.expectedValueR}R
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Per executed trade</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">Profit Factor</span>
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {journalStats.profitFactor}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Gross Wins / Losses</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 block">Peak Drawdown</span>
                  <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                    {journalStats.maxDrawdownPct}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Max historical DD</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No live journal trades recorded yet.
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  As you log trades in TradeVault Journal, this dashboard will evaluate your live risk-reward, expectancy, and psychological discipline against Academy benchmarks.
                </p>
              </div>
            )}
          </div>

          {/* Quiz Verification Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Average Quiz Accuracy</span>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {averageQuizScore}%
                </p>
                <span className="text-[10px] text-slate-400">Across {quizAttemptKeys.length} attempts</span>
              </div>
              <ProgressRing value={averageQuizScore} size={64} strokeWidth={6} />
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Quizzes Passed</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {passedQuizzesCount}
                </p>
                <span className="text-[10px] text-slate-400">≥80% benchmark passed</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Remediation Queue</span>
                <p className="text-2xl font-black text-amber-500">
                  {progress.mistakeBank.filter(m => !m.reviewed).length}
                </p>
                <span className="text-[10px] text-slate-400">Unreviewed Mistake Bank items</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
