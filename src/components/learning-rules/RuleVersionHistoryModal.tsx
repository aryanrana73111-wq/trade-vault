import React from 'react';
import { RuleVersion } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { History, X, Clock, ArrowRight } from 'lucide-react';

interface RuleVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleText: string;
  currentVersion: number;
  versions?: RuleVersion[];
}

export const RuleVersionHistoryModal: React.FC<RuleVersionHistoryModalProps> = ({
  isOpen,
  onClose,
  ruleText,
  currentVersion,
  versions = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Rule Revision History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track how this rule evolved over your trading journey
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Current Active Version */}
          <div className="p-4 rounded-xl border-2 border-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Current Active Version (v{currentVersion})
              </span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
              {ruleText}
            </p>
          </div>

          {/* Previous Versions Timeline */}
          {versions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              This rule has not been edited yet. Original creation is Version 1.
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Previous Iterations ({versions.length})
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {versions.slice().reverse().map((v) => (
                  <div
                    key={v.version}
                    className="relative pl-8 group"
                  >
                    <div className="absolute left-2 top-3 w-3 h-3 -translate-x-1/2 rounded-full border-2 border-white dark:border-slate-900 bg-slate-400 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors" />
                    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Version {v.version}
                        </span>
                        <span>
                          {format(new Date(v.updatedAt), 'MMM dd, yyyy · HH:mm')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {v.category}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {v.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                        {v.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
