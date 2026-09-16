import React, { useState } from 'react';
import { Activity, Play, BarChart2, TrendingUp, AlertTriangle, Search } from 'lucide-react';

export const UltraLabs: React.FC = () => {
  const [activeLab, setActiveLab] = useState<'monte-carlo' | 'hypothesis' | 'scenario'>('monte-carlo');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            <span>Quantitative Labs</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Run rigorous mathematical models and stress-test assumptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveLab('monte-carlo')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeLab === 'monte-carlo' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Monte Carlo
          </button>
          <button
            onClick={() => setActiveLab('hypothesis')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeLab === 'hypothesis' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Hypothesis Lab
          </button>
          <button
            onClick={() => setActiveLab('scenario')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeLab === 'scenario' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Scenario Lab
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[400px]">
        {activeLab === 'monte-carlo' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-sm font-bold border border-rose-200 dark:border-rose-900/50">
              <AlertTriangle className="w-4 h-4" />
              <span>Simulation, not prediction. Randomness does not guarantee future distributions.</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Win Rate (%)</label>
                <input type="number" defaultValue={45} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Avg Win (R)</label>
                <input type="number" defaultValue={2.0} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Avg Loss (R)</label>
                <input type="number" defaultValue={1.0} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">N Trades</label>
                <input type="number" defaultValue={100} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            
            <button className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
              <Play className="w-5 h-5 fill-current" />
              <span>Run 1,000 Simulations</span>
            </button>

            <div className="h-64 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 text-sm font-medium">
              Results and Distribution Graph will appear here.
            </div>
          </div>
        )}

        {activeLab === 'hypothesis' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hypothesis Tester</h3>
            <p className="text-sm text-slate-500">Enter an assumption to query the evidence database.</p>
            
            <textarea 
              placeholder="e.g. 'Trend following strategies perform better during high-volatility regimes...'"
              className="w-full h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            
            <button className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
              <Search className="w-5 h-5" />
              <span>Evaluate Evidence</span>
            </button>
          </div>
        )}

        {activeLab === 'scenario' && (
          <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
            <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <div className="text-slate-500 dark:text-slate-400">
              <p className="font-bold">Scenario What-If Simulator</p>
              <p className="text-sm">Change base variables (risk %, spread, win rate degradation) to see impact.</p>
            </div>
            <button className="px-6 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 text-sm">
              Open Scenario Builder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
