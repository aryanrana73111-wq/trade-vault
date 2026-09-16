import React from 'react';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertCircle, ChevronRight, X } from 'lucide-react';
import { Trade } from '@/types';
import { getTradeCompleteness } from '@/lib/tradeCompleteness';
import { cn } from '@/lib/utils';

interface CompletionReminderModalProps {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteNow: (trade: Trade) => void;
}

export function CompletionReminderModal({
  trade,
  isOpen,
  onClose,
  onCompleteNow
}: CompletionReminderModalProps) {
  if (!isOpen || !trade) return null;

  const comp = getTradeCompleteness(trade);
  if (!comp.hasMissingData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trade Saved</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {trade.direction} {trade.market} entry recorded to your journal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing information notice */}
        <div className="mt-4 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {comp.missingItems.length} journal {comp.missingItems.length === 1 ? 'field is' : 'fields are'} still missing
            </span>
            <span className="ml-auto text-[11px] font-mono text-amber-700 dark:text-amber-400 font-semibold">
              {comp.percentage}% complete
            </span>
          </div>

          <div className="space-y-1 mt-2">
            {comp.missingItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="text-[11px] text-slate-400">• {item.category}</span>
              </div>
            ))}
            {comp.missingItems.length > 4 && (
              <p className="text-[11px] text-slate-400 italic pl-3.5">
                + {comp.missingItems.length - 4} more optional fields
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
          You can complete the missing data now or return anytime from your journal.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            Later
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose();
              onCompleteNow(trade);
            }}
            className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm"
          >
            <span>Complete Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
