import React from 'react';
import { Calendar, Newspaper, Terminal, Sparkles, ShieldCheck } from 'lucide-react';
import { NewsSystemMode } from '@/types/newsModes';

interface TopLevelNewsModeSwitcherProps {
  currentMode: NewsSystemMode;
  onModeChange: (mode: NewsSystemMode) => void;
}

export function TopLevelNewsModeSwitcher({
  currentMode,
  onModeChange
}: TopLevelNewsModeSwitcherProps) {
  const modes: {
    id: NewsSystemMode;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'NORMAL',
      label: 'Normal',
      sublabel: 'Calendar',
      icon: <Calendar className="w-3.5 h-3.5" />
    },
    {
      id: 'PRO',
      label: 'Pro',
      sublabel: 'Newsroom',
      icon: <Newspaper className="w-3.5 h-3.5" />
    },
    {
      id: 'ADVANCED',
      label: 'Advanced',
      sublabel: 'Terminal',
      icon: <Terminal className="w-3.5 h-3.5" />
    }
  ];

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const next = (index + 1) % modes.length;
      onModeChange(modes[next].id);
    } else if (e.key === 'ArrowLeft') {
      const prev = (index - 1 + modes.length) % modes.length;
      onModeChange(modes[prev].id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-1.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Mode Title & Info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              News Intelligence
            </span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:inline">
            {currentMode === 'NORMAL' && 'Economic releases, impact filters & calendar breakdown'}
            {currentMode === 'PRO' && 'Editorial newsroom, lead story & real-time wire feed'}
            {currentMode === 'ADVANCED' && 'Terminal intelligence, live reaction engine, asset map & AI analyst'}
          </span>
        </div>

        {/* Right: The 3-way Segmented Switcher */}
        <div 
          role="tablist" 
          aria-label="News intelligence mode selection" 
          className="inline-flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0"
        >
          {modes.map((mode, idx) => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onModeChange(mode.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-150 whitespace-nowrap cursor-pointer select-none ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs border border-slate-200/80 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-900/50 border border-transparent'
                }`}
                title={`${mode.label} (${mode.sublabel})`}
              >
                <span className={`transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                  {mode.icon}
                </span>
                <span>{mode.label}</span>
                <span className="hidden sm:inline text-[10px] font-normal text-slate-400 dark:text-slate-500">
                  • {mode.sublabel}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
