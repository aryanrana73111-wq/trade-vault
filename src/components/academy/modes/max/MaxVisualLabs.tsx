import React, { useState } from 'react';
import { PlayCircle, Activity, BarChart2, ArrowLeft, Database, Layers } from 'lucide-react';

export const MaxVisualLabs: React.FC = () => {
  const [activeLab, setActiveLab] = useState<string | null>(null);

  if (activeLab) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveLab(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Visual Labs Library</span>
        </button>
        <div className="flex flex-col items-center justify-center min-h-[500px] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-850 p-8 text-center space-y-4">
          <Activity className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Initializing {activeLab}...</h3>
          <p className="text-lg text-slate-500 dark:text-slate-400">Loading historical data models and rendering engine.</p>
          <p className="text-sm font-normal">(This interactive lab environment is coming in the next update.)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-amber-500" />
          <span>Visual Labs Library</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
          Don't just read about concepts. Interact with live simulators, manipulate market structures, and test hypotheses using historical price data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: 'Market Structure Engine', desc: 'Break down multi-timeframe trends dynamically.', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { id: 'Liquidity Heatmap Simulator', desc: 'Visualize where institutional orders accumulate.', icon: Database, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
          { id: 'Volume Profile Replay', desc: 'Replay volume nodes on historical intraday sessions.', icon: BarChart2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
        ].map((lab) => (
          <div key={lab.id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-amber-500 transition-colors">
            <div className="space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${lab.bg} ${lab.color}`}>
                <lab.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {lab.id}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {lab.desc}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveLab(lab.id)}
              className="mt-6 w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold transition-colors flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4 text-amber-500" />
              <span>Launch Lab Environment</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
