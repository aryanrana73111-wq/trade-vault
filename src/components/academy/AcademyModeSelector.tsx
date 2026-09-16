import React from 'react';
import { BookOpen, Sparkles, Terminal, Lock } from 'lucide-react';

export type AcademyMode = 'normal' | 'max' | 'ultra';

interface AcademyModeSelectorProps {
  currentMode: AcademyMode;
  onSelectMode: (mode: AcademyMode) => void;
  className?: string;
}

export const AcademyModeSelector: React.FC<AcademyModeSelectorProps> = ({
  currentMode = 'normal',
  onSelectMode,
  className = ''
}) => {
  return (
    <div 
      id="academy-mode-selector"
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Academy Learning Mode
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
              Phase 3 Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select your preferred educational depth & perspective
          </p>
        </div>
      </div>

      {/* Selector pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
        {/* NORMAL MODE */}
        <button
          id="mode-btn-normal"
          type="button"
          onClick={() => onSelectMode('normal')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentMode === 'normal'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>NORMAL</span>
        </button>

        {/* MAX MODE */}
        <button
          id="mode-btn-max"
          type="button"
          onClick={() => onSelectMode('max')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentMode === 'max'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>MAX</span>
        </button>

        {/* ULTRA MODE - Now Active */}
        <button
          id="mode-btn-ultra"
          type="button"
          onClick={() => onSelectMode('ultra')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentMode === 'ultra'
              ? 'bg-slate-900 dark:bg-slate-950 text-indigo-400 border border-indigo-500/50 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>◆ ULTRA</span>
        </button>
      </div>
    </div>
  );
};
