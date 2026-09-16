import React, { useState } from 'react';
import { Activity, PlayCircle, BarChart3, TrendingUp, Target, Calculator, ArrowLeft } from 'lucide-react';

export const MaxPractice: React.FC = () => {
  const [activePractice, setActivePractice] = useState<string | null>(null);

  if (activePractice) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActivePractice(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Practice Center</span>
        </button>
        <div className="flex items-center justify-center h-96 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-850">
          Coming Soon: {activePractice} Module
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-500" />
          <span>Practice Center</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Test your knowledge with interactive quizzes, scenario decisions, and risk calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Practice Categories */}
        {[
          { id: 'Chart Practice', title: 'Chart Practice', desc: 'Identify structures, trends, and support/resistance on historical charts.', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { id: 'Risk Practice', title: 'Risk Practice', desc: 'Calculate proper position sizes and R:R ratios given specific scenarios.', icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { id: 'Execution Decisions', title: 'Execution Decisions', desc: 'Choose the correct order type and execution strategy for specific liquidity conditions.', icon: Target, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { id: 'Psychology Scenarios', title: 'Psychology Scenarios', desc: 'Navigate emotional tilt, FOMO, and revenge trading in simulated scenarios.', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
          { id: 'Macro Interpretation', title: 'Macro Interpretation', desc: 'Interpret NFP and CPI releases and predict the likely market reaction.', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { id: 'Options Payoff', title: 'Options Payoff', desc: 'Calculate break-evens and max loss/profit for different options spreads.', icon: BarChart3, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
        ].map((practice) => (
          <div key={practice.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${practice.bg} ${practice.color}`}>
                <practice.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {practice.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                  {practice.desc}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActivePractice(practice.title)}
              className="mt-6 w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700 text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4 text-amber-500" />
              <span>Start Practice</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
