import React from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { X, RotateCcw, AlertCircle, Info, Calendar, Building } from 'lucide-react';
import { CURRENCY_FLAGS } from '../EconomicCalendarView';

interface RevisionDetailsPopoverProps {
  event: NewsEvent;
  onClose: () => void;
}

export function RevisionDetailsPopover({ event, onClose }: RevisionDetailsPopoverProps) {
  const details = event.revisionDetails || {
    previousPublished: event.previous ?? '—',
    revisedValue: event.revisedPrevious ?? event.previous ?? '—',
    revisionDate: event.dateTime ? event.dateTime.split('T')[0] : '2026-09-10',
    reason: 'Official government statistical agency data revision following establishment survey updates.'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Official Data Revision</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  REVISED (*)
                </span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {event.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comparison Details */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 font-mono">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
                Initially Published
              </span>
              <span className="text-base font-bold text-slate-600 dark:text-slate-400 line-through">
                {details.previousPublished}{event.unit === '%' ? '%' : ''}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block mb-1">
                Official Revised Value
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {details.revisedValue}{event.unit === '%' ? '%' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Revision Effective Date: <strong className="text-slate-800 dark:text-slate-200">{details.revisionDate}</strong></span>
            </div>
            {event.source && (
              <div className="flex items-center gap-2 text-slate-500">
                <Building className="w-3.5 h-3.5" />
                <span>Reporting Agency: <strong className="text-slate-800 dark:text-slate-200">{event.source}</strong></span>
              </div>
            )}
          </div>

          {/* Agency Reason */}
          <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 mb-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Agency Statement / Methodology</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {details.reason || 'Quarterly bench-marking recalculation incorporating late reporting establishment questionnaires.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
