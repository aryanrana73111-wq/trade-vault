import React from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { RotateCcw, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface CoreDataSurpriseCardProps {
  event: NewsEvent;
  surpriseNumeric: number | null;
  surpriseLabel: 'Above Consensus' | 'Below Consensus' | 'In Line';
  onOpenRevisionPopover?: () => void;
}

export function CoreDataSurpriseCard({
  event,
  surpriseNumeric,
  surpriseLabel,
  onOpenRevisionPopover
}: CoreDataSurpriseCardProps) {
  const isReleased = event.status === 'Released' || event.status === 'Revised';
  const hasRevision = Boolean(event.revisedPrevious || event.revisionDetails);

  // Format numbers with unit
  const formatVal = (v: number | string | undefined) => {
    if (v === undefined || v === null || v === '') return '—';
    const str = String(v);
    if (event.unit && !str.includes(event.unit) && event.unit !== 'pts') {
      return `${str}${event.unit}`;
    }
    return str;
  };

  const getSurpriseStyle = () => {
    switch (surpriseLabel) {
      case 'Above Consensus':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
          badge: 'bg-emerald-600 text-white',
          icon: <TrendingUp className="w-4 h-4" />
        };
      case 'Below Consensus':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
          badge: 'bg-rose-600 text-white',
          icon: <TrendingDown className="w-4 h-4" />
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
          badge: 'bg-slate-600 text-white',
          icon: <Minus className="w-4 h-4" />
        };
    }
  };

  const style = getSurpriseStyle();

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* Top Banner: Core Data Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4 font-mono">
        {/* 1. ACTUAL (Large) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Actual Print
            </span>
            {isReleased ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Official Published Print" />
            ) : (
              <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                Awaiting
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isReleased ? formatVal(event.actual) : 'Pending'}
          </div>
          <span className="text-[10px] font-sans text-slate-400 mt-1">
            {isReleased ? 'Official agency publication' : 'Scheduled release'}
          </span>
        </div>

        {/* 2. CONSENSUS */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <span className="text-[11px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Consensus
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            {formatVal(event.forecast)}
          </div>
          <span className="text-[10px] font-sans text-slate-400 mt-1">
            Surveyed median of economists
          </span>
        </div>

        {/* 3. PREVIOUS */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Previous
            </span>
            {hasRevision && (
              <button
                type="button"
                onClick={onOpenRevisionPopover}
                className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:bg-amber-200 transition-colors"
                title="View revision details"
              >
                <RotateCcw className="w-3 h-3" />
                <span>REVISED *</span>
              </button>
            )}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-baseline gap-2">
            <span>{formatVal(event.previous)}</span>
            {event.revisedPrevious && (
              <span className="text-xs text-amber-600 dark:text-amber-400 line-through">
                {formatVal(event.revisedPrevious)}
              </span>
            )}
          </div>
          <span className="text-[10px] font-sans text-slate-400 mt-1">
            Prior cycle published metric
          </span>
        </div>

        {/* 4. FORECAST (Distinguished from Consensus) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200 dark:border-slate-750 flex flex-col justify-between">
          <span className="text-[11px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Institutional Forecast
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            {formatVal(event.forecast)}
          </div>
          <span className="text-[10px] font-sans text-slate-400 mt-1">
            Econometric model estimate
          </span>
        </div>
      </div>

      {/* Surprise Bar & Direction Interpretation */}
      {isReleased && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${style.bg}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.badge}`}>
              {style.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Surprise Evaluation:
                </span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80">
                  {surpriseLabel}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-0.5">
                {surpriseNumeric !== null ? (
                  <span>
                    Actual printed <strong>{surpriseNumeric > 0 ? `+${surpriseNumeric}` : surpriseNumeric}{event.unit || ''}</strong> relative to consensus expectation of {formatVal(event.forecast)}.
                  </span>
                ) : (
                  <span>Actual print registered exactly in line with consensus projections.</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] opacity-75 sm:text-right">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Descriptive macro deviation (direction not guaranteed)</span>
          </div>
        </div>
      )}

      {/* Previous Revision Detail Banner (if present) */}
      {hasRevision && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Historical Revision:</strong> Previously published at {formatVal(event.previous)} and officially revised to {formatVal(event.revisedPrevious ?? event.previous)}.
            </span>
          </div>
          {onOpenRevisionPopover && (
            <button
              type="button"
              onClick={onOpenRevisionPopover}
              className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0"
            >
              Inspect Methodology Statement →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
