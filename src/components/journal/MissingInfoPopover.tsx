import React, { useState, useRef, useEffect } from 'react';
import { MissingFieldItem, TradeCompletenessResult } from '@/lib/tradeCompleteness';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2, ChevronRight, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MissingInfoPopoverProps {
  completeness: TradeCompletenessResult;
  onCompleteTrade: () => void;
  className?: string;
}

export function MissingInfoPopover({
  completeness,
  onCompleteTrade,
  className
}: MissingInfoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const { status, percentage, missingItems } = completeness;

  if (status === 'Complete') {
    return (
      <div className={cn("inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60", className)}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Complete</span>
      </div>
    );
  }

  // First 1-2 missing labels for badge preview
  const previewLabel = missingItems.length === 1 
    ? `Missing ${missingItems[0].label}` 
    : `${missingItems.length} Missing`;

  return (
    <div className={cn("relative inline-block text-left", className)} ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id={`missing-info-trigger-${previewLabel.replace(/\s+/g, '-').toLowerCase()}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-150 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1",
          status === 'Needs Review'
            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 focus:ring-rose-400"
            : "bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 focus:ring-amber-400"
        )}
        title="Click to view missing information"
      >
        {/* Red dot indicator specifically meaning: 'Something important is missing' */}
        <span 
          className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0"
          aria-label="Important information missing"
        />
        <span>{previewLabel}</span>
        <span className="text-[10px] opacity-75 font-mono">({percentage}%)</span>
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div 
          className="absolute z-50 mt-1.5 w-72 sm:w-80 -right-2 sm:right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Missing Information
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Trade completeness: <span className="font-semibold text-slate-800 dark:text-slate-200">{percentage}%</span> • Status: <span className={cn("font-medium", status === 'Needs Review' ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>{status}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="my-3">
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  percentage >= 75 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Missing List */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              This trade is missing:
            </p>
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {missingItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-start gap-2 text-xs p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{item.label}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{item.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 italic mb-3">
            TradeVault preserves incomplete trades for data integrity. Complete missing fields anytime.
          </div>

          {/* CTA Action */}
          <Button
            id="btn-complete-trade-popover"
            size="sm"
            onClick={() => {
              setIsOpen(false);
              onCompleteTrade();
            }}
            className="w-full flex items-center justify-center gap-1.5 font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <span>Complete Trade</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
