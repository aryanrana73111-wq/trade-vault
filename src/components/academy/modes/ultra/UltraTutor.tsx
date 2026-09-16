import React from 'react';
import { BrainCircuit, Send, Sparkles } from 'lucide-react';

export const UltraTutor: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
            <span>AI Research Tutor</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Ask advanced institutional questions. The tutor distinguishes facts, interpretations, and user data.
          </p>
        </div>
      </div>

      <div className="flex flex-col h-[600px] bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs relative">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 max-w-2xl">
              <p className="font-bold mb-2">Welcome to the ULTRA Research Tutor.</p>
              <p>I am configured to provide institutional-grade analysis. You can ask me to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                <li>Show the mathematical intuition behind a concept.</li>
                <li>Compare competing academic views.</li>
                <li>Explain limitations and counterarguments.</li>
                <li>Recommend primary source literature.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="relative">
            <input 
              type="text"
              placeholder="Ask an advanced research question..."
              className="w-full pl-4 pr-12 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors shadow-md">
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            {['Mathematical intuition for Black-Scholes', 'Limitations of Sharpe Ratio', 'Microstructure vs Macro', 'What is VPIN?'].map((prompt, i) => (
              <button key={i} className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap hover:border-indigo-400 transition-colors">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
