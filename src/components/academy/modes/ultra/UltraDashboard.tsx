import React from 'react';
import { BookOpen, BrainCircuit, Activity, Library, FileText, ArrowRight, Network, Microscope } from 'lucide-react';
import { UltraSubTab } from '../UltraMode';

interface UltraDashboardProps {
  onNavigateTab: (tab: UltraSubTab) => void;
}

export const UltraDashboard: React.FC<UltraDashboardProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-6">
      {/* Featured Research Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/20 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full"></div>
        <div className="space-y-3 max-w-3xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-500/50">
              Featured Domain
            </span>
            <span className="text-xs text-indigo-200 font-medium">
              Market Microstructure & LOB Dynamics
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Deconstructing the Limit Order Book
          </h3>
          <p className="text-sm text-indigo-100/80 leading-relaxed">
            Understand how modern electronic matching engines clear orders with price-time priority. Explore adverse selection, order flow toxicity (VPIN), and the Glosten-Milgrom model of market making.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('microstructure')}
          className="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 shrink-0 w-full md:w-auto relative z-10"
        >
          <BookOpen className="w-5 h-5" />
          <span>Explore Domain</span>
        </button>
      </div>

      {/* Ultra Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('graph')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-400 transition-colors">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Global Knowledge Graph</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore the visually connected taxonomy of institutional trading knowledge.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('library')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-cyan-100 group-hover:text-cyan-600 dark:group-hover:bg-cyan-900/50 dark:group-hover:text-cyan-400 transition-colors">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">Research Library</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Access summaries of academic papers and foundational trading literature.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('labs')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600 dark:group-hover:bg-rose-900/50 dark:group-hover:text-rose-400 transition-colors">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Quantitative Labs</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Run Monte Carlo simulations, test hypotheses, and analyze execution slippage.
            </p>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('research')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600 dark:group-hover:bg-amber-900/50 dark:group-hover:text-amber-400 transition-colors">
            <Microscope className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Strategy Research</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Document your own hypotheses, methodology, and empirical findings.
            </p>
          </div>
        </div>
      </div>
      
      {/* AI Tutor Card */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-2xl rounded-full"></div>
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl font-black flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-amber-400" />
            <span>ULTRA Research Tutor</span>
          </h3>
          <p className="text-sm text-slate-400 max-w-2xl">
            Ask complex market structure questions, debate hypotheses (Bull vs Bear case), and have academic papers summarized for you in real-time.
          </p>
        </div>
        <button 
          onClick={() => {}}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm transition-colors flex items-center gap-2 shrink-0 relative z-10 w-full md:w-auto justify-center"
        >
          <span>Ask Question</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
