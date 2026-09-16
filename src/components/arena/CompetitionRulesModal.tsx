import React from 'react';
import { Arena } from '@/types';
import { X, Scale } from 'lucide-react';
import { CompetitionRulesView } from './CompetitionRulesView';

interface CompetitionRulesModalProps {
  arena: Arena;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function CompetitionRulesModal({ arena, isOpen, onClose, onRefresh }: CompetitionRulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                Competition Rules & Fair Play Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Automated enforcement parameters governing {arena.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <CompetitionRulesView arena={arena} onRefresh={onRefresh} />
        </div>
      </div>
    </div>
  );
}
