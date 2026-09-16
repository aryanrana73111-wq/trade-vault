import React from 'react';
import { PlayCircle, ArrowRight, BookOpen, Calculator, BarChart3, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { MaxSubTab } from '../MaxMode';

interface MaxExploreProps {
  onNavigateTab: (tab: MaxSubTab) => void;
}

export const MaxExplore: React.FC<MaxExploreProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* Daily Max Lesson */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/20 text-white">
              Daily Max Lesson
            </span>
            <span className="text-xs text-amber-100 font-medium">
              Based on your weak quiz areas
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Drawdown Mathematics & Recovery
          </h3>
          <p className="text-sm text-amber-100 leading-relaxed">
            Your recent learning suggests revisiting drawdown recovery. Visualizing the exponential return required to recover from a steep drawdown is the fastest way to respect risk management.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('practice')}
          className="px-6 py-3.5 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 w-full md:w-auto"
        >
          <PlayCircle className="w-5 h-5" />
          <span>Launch Visualizer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('curriculum')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Vault</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore 120+ structured trading concepts across 14 market domains.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('practice')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Visual Labs</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Interactive simulators for candlesticks, risk, and portfolio equity curves.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('practice')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Case Studies</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              20+ deep dive post-mortems on real market events and execution errors.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('mastery')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-amber-400 dark:hover:border-amber-500 transition-all space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Mastery Analytics</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track your competence across 14 domains with visual radar charts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
