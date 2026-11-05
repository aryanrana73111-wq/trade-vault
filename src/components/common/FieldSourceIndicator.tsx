import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Camera, Calculator, Edit3, Zap } from 'lucide-react';

export type FieldSource = 'manual' | 'historical_quote' | 'mt5_screenshot' | 'auto_calculated' | 'quick_result_1r';

interface FieldSourceIndicatorProps {
  source?: FieldSource | string;
  className?: string;
  showIcon?: boolean;
}

export function FieldSourceIndicator({ source, className, showIcon = true }: FieldSourceIndicatorProps) {
  if (!source || source === 'manual') return null;

  switch (source) {
    case 'historical_quote':
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60",
            className
          )}
          title="Populated from verified institutional market data"
        >
          {showIcon && <Sparkles className="w-2.5 h-2.5" />}
          <span>Historical Data</span>
        </span>
      );

    case 'mt5_screenshot':
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60",
            className
          )}
          title="Extracted from MT5 screenshot"
        >
          {showIcon && <Camera className="w-2.5 h-2.5" />}
          <span>MT5 Screenshot</span>
        </span>
      );

    case 'auto_calculated':
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60",
            className
          )}
          title="Calculated from instrument specifications"
        >
          {showIcon && <Calculator className="w-2.5 h-2.5" />}
          <span>Calculated</span>
        </span>
      );

    case 'quick_result_1r':
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60",
            className
          )}
          title="Estimated 1R shortcut (editable)"
        >
          {showIcon && <Zap className="w-2.5 h-2.5" />}
          <span>Estimated 1R</span>
        </span>
      );

    default:
      return null;
  }
}
