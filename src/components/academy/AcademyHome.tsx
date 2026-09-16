import React, { useMemo } from 'react';
import { 
  GraduationCap, 
  Compass, 
  Flame, 
  Award, 
  BookOpen, 
  FlaskConical, 
  Building2, 
  CheckCircle2, 
  Layers, 
  Calculator, 
  Sparkles, 
  ArrowRight,
  Bot,
  Brain,
  Terminal,
  Activity,
  Radio
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { 
  MasteryCard, 
  LevelCard, 
  DomainProgress, 
  LearningPathNode,
  LessonCard,
  HorizontalScrollRow
} from './components';
import { ACADEMY_LEVELS } from '@/data/academy/levels';
import { ACADEMY_LESSONS, ACADEMY_CONCEPTS } from '@/data/academy/curriculum';
import { AcademyDomain, Lesson } from '@/types/academy';
import { computeAdaptiveRecommendations } from '@/lib/academy/adaptiveLearningEngine';
import { AdaptiveRecommendationsPanel } from './AdaptiveRecommendationsPanel';

interface AcademyHomeProps {
  onNavigateTab: (tabId: string) => void;
  onOpenLesson: (lesson: Lesson) => void;
  onOpenDiagnostic: () => void;
  onOpenAITutor: () => void;
}

export const AcademyHome: React.FC<AcademyHomeProps> = ({
  onNavigateTab,
  onOpenLesson,
  onOpenDiagnostic,
  onOpenAITutor
}) => {
  const { progress, toggleBookmark } = useAcademy();

  const currentLevelNumber = progress.currentLevel ?? 0;
  const currentLevelInfo = ACADEMY_LEVELS.find(l => l.level === currentLevelNumber) || ACADEMY_LEVELS[0];

  const currentLevelLessons = ACADEMY_LESSONS.filter(l => l.level === currentLevelNumber);
  const currentCompletedCount = currentLevelLessons.filter(l => progress.completedLessons.includes(l.id)).length;

  // Up next lesson: first uncompleted lesson in current level
  const upNextLesson = currentLevelLessons.find(l => !progress.completedLessons.includes(l.id)) || currentLevelLessons[0];
  const hasLearningActivity = progress.completedLessons.length > 0 || progress.overallMastery > 0;

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

  // Personalized Adaptive Engine driven by actual user evidence
  const adaptive = useMemo(() => {
    return computeAdaptiveRecommendations(progress);
  }, [progress]);

  return (
    <div className="space-y-6">
      {/* Critical Prerequisite Alert if present */}
      {adaptive.doNotSkipPrerequisite && (
        <div className="p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/30 border-2 border-amber-500/50 dark:border-amber-600 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                  Do Not Skip This Prerequisite
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                  Adaptive Engine Alert
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100">
                Prerequisite Foundation Needed: {adaptive.doNotSkipPrerequisite.missingPrerequisite.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                {adaptive.doNotSkipPrerequisite.warningMessage}
              </p>
            </div>
            {adaptive.doNotSkipPrerequisite.missingLesson && (
              <button
                onClick={() => onOpenLesson(adaptive.doNotSkipPrerequisite!.missingLesson!)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0 shadow-xs"
              >
                Study Prerequisite Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Academy Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>TradeVault Institutional Academy</span>
              </span>
              <span className="text-xs text-slate-400">Levels 0 to 10 Curriculum</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Institutional Trading Curriculum & Quantitative Workbench
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Master the exact risk invariance, microstructure execution, and statistical expected value principles used by proprietary trading firms and quantitative hedge funds.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenDiagnostic}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Find My Trading Level (Diagnostic)</span>
              </button>

              <button
                onClick={onOpenAITutor}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-all backdrop-blur-xs"
              >
                <Bot className="w-4 h-4 text-blue-300" />
                <span>Ask AI Tutor</span>
              </button>

              {progress.placementTestCompleted && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Placed at Level {progress.currentLevel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 min-w-[220px]">
            <div className="p-4 bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Current Level
              </span>
              <p className="text-2xl font-black text-white">L{progress.currentLevel}</p>
              <span className="text-[10px] text-slate-400">{currentLevelInfo.title}</span>
            </div>

            <div className="p-4 bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Curriculum Mastery
              </span>
              <p className="text-2xl font-black text-emerald-400">{progress.overallMastery}%</p>
              <span className="text-[10px] text-slate-400">{progress.completedLessons.length} of {ACADEMY_LESSONS.length} Lessons</span>
            </div>

            <div className="p-4 bg-slate-800/80 backdrop-blur-xs rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Daily Streak
              </span>
              <p className="text-2xl font-black text-amber-400">{progress.learningStreakDays} Days</p>
              <span className="text-[10px] text-slate-400">
                {progress.learningStreakDays === 0 ? 'No active streak yet' : 'Consistent Daily Practice'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Intelligence & Terminal Integration Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/10 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-slate-900/40 border border-blue-200/80 dark:border-blue-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              <span>MARKET INTELLIGENCE & TERMINAL</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Cross-Asset Sync
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Real-Time Market Terminal & Advanced Curriculum Integration
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Live Watchlist, 1-Minute Audio Wire, Central Bank Policy Radar, and Currency Relative Strength Matrix directly integrated with 135 institutional concepts, 22 masterclasses, and 15 Wall Street case studies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('max')}
          className="px-4 py-2.5 rounded-2xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer min-h-[44px] justify-center"
        >
          <Activity className="w-4 h-4" />
          <span>Launch Market Terminal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Current Level Card & Overall Mastery Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirement 4: Current Level Card */}
        <LevelCard
          levelInfo={currentLevelInfo}
          isUnlocked={true}
          isCompleted={currentCompletedCount === currentLevelLessons.length && currentLevelLessons.length > 0}
          isCurrent={true}
          completedLessonsCount={currentCompletedCount}
          totalLessonsCount={currentLevelLessons.length}
          onSelectLevel={() => onNavigateTab('path')}
        />

        {/* Requirement 5: Overall Mastery Card */}
        <MasteryCard
          overallMastery={progress.overallMastery}
          completedLessonsCount={progress.completedLessons.length}
          totalLessonsCount={ACADEMY_LESSONS.length}
          masteredConceptsCount={progress.masteredConcepts.length}
          currentLevel={progress.currentLevel}
          onExploreRoadmap={() => onNavigateTab('path')}
        />
      </div>

      {/* Personalized Adaptive Recommendations Suite */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <Brain className="w-4 h-4" />
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Personalized Adaptive Recommendations
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dynamically derived from your verified quiz answers, lesson completions, and mistake logs
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('path')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View Learning Path</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <AdaptiveRecommendationsPanel
          recommendations={adaptive}
          onOpenLesson={onOpenLesson}
          onNavigateTab={onNavigateTab}
        />
      </div>

      {/* Level 0 -> Level 10 Complete Roadmap Row */}
      <HorizontalScrollRow
        title="Curriculum Progression (Levels 0 → 10)"
        subtitle="11 structured milestones from foundational market terminology to quantitative microstructure"
        badge={
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Full Spectrum
          </span>
        }
        viewAllAction={{
          label: 'Open Full Path',
          onClick: () => onNavigateTab('path')
        }}
        showControls={true}
        itemSpacing="gap-3.5"
      >
        {ACADEMY_LEVELS.map(lvl => {
          const isCurrent = lvl.level === progress.currentLevel;
          const levelLessons = ACADEMY_LESSONS.filter(l => l.level === lvl.level);
          const completedCount = levelLessons.filter(l => progress.completedLessons.includes(l.id)).length;
          const isCompleted = levelLessons.length > 0 && completedCount === levelLessons.length;
          const isUnlocked = lvl.level <= progress.currentLevel;

          return (
            <div
              key={lvl.level}
              onClick={() => onNavigateTab('path')}
              className={`min-w-[240px] sm:min-w-[260px] p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shrink-0 snap-start select-none group ${
                isCurrent
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 shadow-sm ring-1 ring-blue-500/50'
                  : isCompleted
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    Level {lvl.level}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {completedCount}/{levelLessons.length} Done
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {lvl.title}
                </h4>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lvl.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  {lvl.difficulty} Tier
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  {isCurrent ? 'Current' : isCompleted ? 'Review' : 'Explore'}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </HorizontalScrollRow>

      {/* Domain Mastery Matrix as Horizontal Scroll Row */}
      <HorizontalScrollRow
        title="Institutional Domain Breakdown"
        subtitle="8 Core Competencies underpinning professional trading"
        badge={
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            8 Domains
          </span>
        }
        viewAllAction={{
          label: 'View Skill Tree',
          onClick: () => onNavigateTab('skills')
        }}
        showControls={true}
        itemSpacing="gap-3.5"
      >
        {domainsList.map(domain => {
          const mastery = progress.domainMastery[domain] || 0;
          const domainLessons = ACADEMY_LESSONS.filter(l => l.domain === domain);
          const domainCompleted = domainLessons.filter(l => progress.completedLessons.includes(l.id)).length;

          return (
            <div key={domain} className="min-w-[260px] sm:min-w-[280px] shrink-0 snap-start">
              <DomainProgress
                domain={domain}
                masteryPct={mastery}
                completedLessons={domainCompleted}
                totalLessons={domainLessons.length}
                onClick={() => onNavigateTab('skills')}
              />
            </div>
          );
        })}
      </HorizontalScrollRow>

      {/* Quick Launchers for Core Sections as Horizontal Scroll Row */}
      <HorizontalScrollRow
        title="Interactive Tools & Educational Sandboxes"
        subtitle="Hands-on quantitative simulators, diagnostics, post-mortems, and active recall drills"
        showControls={true}
        itemSpacing="gap-3"
      >
        <button
          onClick={() => onNavigateTab('labs')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 w-fit">
            <FlaskConical className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
            Interactive Labs
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Simulators & sandboxes
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('casestudies')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 w-fit">
            <Building2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-rose-600 transition-colors">
            Case Studies
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Crisis post-mortems
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('quizzes')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 w-fit">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
            Quiz Hub
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Mastery checks
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('flashcards')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 w-fit">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
            Flashcards
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Active recall deck
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('formulas')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 w-fit">
            <Calculator className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
            Formula Sheet
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Live calculators
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('glossary')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 w-fit">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 transition-colors">
            Glossary
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Institutional terms
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('mistakes')}
          className="min-w-[180px] sm:min-w-[200px] shrink-0 snap-start p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500/60 shadow-xs hover:shadow-md transition-all text-left space-y-2 group"
        >
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 w-fit">
            <Flame className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-rose-600 transition-colors">
            Mistake Bank
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1">
            Remediation queue
          </p>
        </button>
      </HorizontalScrollRow>
    </div>
  );
};
