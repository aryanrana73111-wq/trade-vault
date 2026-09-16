import React from 'react';
import { FileText, Save, Plus } from 'lucide-react';

export const UltraWorkbench: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" />
            <span>Research Workbench</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your personal institutional workspace. Document hypotheses, data, methodology, and conclusions.
          </p>
        </div>
        
        <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-md">
          <Plus className="w-4 h-4" />
          <span>New Research Document</span>
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs min-h-[500px] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Research Documents Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            Start a new research document to structure your trading ideas logically from hypothesis to conclusion.
          </p>
        </div>
      </div>
    </div>
  );
};
