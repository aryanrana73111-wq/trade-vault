import React from 'react';
import { CheckCircle2, Lock, ArrowRight, BookOpen } from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { Lesson } from '@/types/academy';

interface NormalLevelRoadmapProps {
  onSelectLevelLesson: (lesson: Lesson) => void;
}

export const NORMAL_LEVEL_DEFINITIONS = [
  {
    level: 0,
    title: 'Market Zero',
    tagline: 'Absolute Beginner',
    simpleExplanation: 'Understand what markets and trading actually are before risking a single dollar.',
    topics: ['What is money?', 'Why markets exist', 'Buyers and sellers', 'Trading vs investing']
  },
  {
    level: 1,
    title: 'Market Foundations',
    tagline: 'Instruments & Mechanics',
    simpleExplanation: 'Learn the core market mechanics, instruments, and participants.',
    topics: ['Stocks & Equities', 'Forex & Currencies', 'Commodities', 'Bid, Ask & Spread']
  },
  {
    level: 2,
    title: 'Trader Fundamentals',
    tagline: 'Orders & Execution',
    simpleExplanation: 'Understand orders, spreads, margin, and how trades execute on exchanges.',
    topics: ['Market vs Limit orders', 'Stop-loss orders', 'Margin & Leverage', 'Order book depth']
  },
  {
    level: 3,
    title: 'Risk & Survival',
    tagline: 'Capital Preservation',
    simpleExplanation: 'Learn how to protect your capital and control risk so you never blow up an account.',
    topics: ['1% Risk rule', 'Position sizing', 'Risk-to-reward ratio', 'Drawdown recovery math']
  },
  {
    level: 4,
    title: 'Strategy Builder',
    tagline: 'Edge & Setup Design',
    simpleExplanation: 'Build rules-based edge, technical setups, and disciplined execution plans.',
    topics: ['Support & Resistance', 'Market structure', 'Trend recognition', 'Trading checklist']
  },
  {
    level: 5,
    title: 'Execution',
    tagline: 'Trade Management',
    simpleExplanation: 'Master order entry, trade management, slippage control, and scale-outs.',
    topics: ['Entry triggers', 'Trailing stops', 'Partial take-profits', 'Handling slippage']
  },
  {
    level: 6,
    title: 'Behavioral Trader',
    tagline: 'Trading Psychology',
    simpleExplanation: 'Master trading psychology, emotional discipline, and cognitive biases.',
    topics: ['Overcoming FOMO', 'Ending revenge trading', 'Loss acceptance', 'Process vs outcome']
  },
  {
    level: 7,
    title: 'Quantitative Thinking',
    tagline: 'Probabilities & Statistics',
    simpleExplanation: 'Learn how probability and statistics improve trade decisions over large samples.',
    topics: ['Expected value (EV)', 'Law of large numbers', 'Win rate vs payoff', 'Variance streaks']
  },
  {
    level: 8,
    title: 'Portfolio',
    tagline: 'Multi-Asset Risk',
    simpleExplanation: 'Manage risk across multiple assets and build diversified, uncorrelated positions.',
    topics: ['Asset correlation', 'Portfolio heat', 'Sector exposure', 'Rebalancing rules']
  },
  {
    level: 9,
    title: 'Professional Trader',
    tagline: 'Institutional Discipline',
    simpleExplanation: 'Institutional execution, capital preservation, and professional sizing rules.',
    topics: ['Volatility-adjusted sizing', 'Liquidity pools', 'Trade journal audit', 'Capital scaling']
  },
  {
    level: 10,
    title: 'Professional Researcher',
    tagline: 'Macro Regimes & Modeling',
    simpleExplanation: 'Macro regimes, quantitative modeling, and data-driven analysis.',
    topics: ['Macro regime shifts', 'Central bank liquidity', 'Backtesting edge', 'Systematic modeling']
  }
];

export const NormalLevelRoadmap: React.FC<NormalLevelRoadmapProps> = ({ onSelectLevelLesson }) => {
  const { progress } = useAcademy();
  const currentLevelNumber = progress.currentLevel ?? 0;

  return (
    <div id="normal-level-roadmap" className="space-y-6">
      {/* Intro Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Level Progression Roadmap (L0 — L10)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clear, step-by-step trading education designed to take you from first principles to professional competency.
            </p>
          </div>
        </div>
      </div>

      {/* Level Cards */}
      <div className="space-y-3">
        {NORMAL_LEVEL_DEFINITIONS.map((def) => {
          const levelLessons = ACADEMY_LESSONS.filter(l => l.level === def.level);
          const completedCount = levelLessons.filter(l => progress.completedLessons.includes(l.id)).length;
          const isCurrent = def.level === currentLevelNumber;
          const isCompleted = levelLessons.length > 0 && completedCount >= levelLessons.length;
          const pct = levelLessons.length > 0 ? Math.round((completedCount / levelLessons.length) * 100) : 0;

          // Find first uncompleted lesson in this level
          const nextLesson = levelLessons.find(l => !progress.completedLessons.includes(l.id)) || levelLessons[0];

          return (
            <div
              key={def.level}
              id={`level-row-${def.level}`}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700/60 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left Level Info */}
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                      isCurrent 
                        ? 'bg-blue-600 text-white' 
                        : (isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300')
                    }`}>
                      Level {def.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {def.tagline}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                        Current Level
                      </span>
                    )}
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mastered
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {def.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {def.simpleExplanation}
                  </p>

                  {/* Topics tag pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {def.topics.map((t, tIdx) => (
                      <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Progress & Action */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0">
                  <div className="space-y-1 text-left sm:text-right w-full sm:w-auto">
                    <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Progress</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pct}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full sm:w-36 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {completedCount} of {levelLessons.length} lessons
                    </div>
                  </div>

                  {nextLesson && (
                    <button
                      onClick={() => onSelectLevelLesson(nextLesson)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>{isCompleted ? 'Review Lessons' : 'Start / Continue'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
