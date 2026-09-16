import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  AlertTriangle, 
  Lightbulb, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Maximize2, 
  Minimize2, 
  X,
  ShieldCheck 
} from 'lucide-react';

export interface EducationalChartMetric {
  label: string;
  value: string | number;
  color?: string;
  subtext?: string;
}

export interface EducationalChartCardProps {
  title: string;
  subtitle?: string;
  badge?: 'Educational Example' | 'Simulation';
  category?: string;
  whatAmILookingAt: string;
  whyItMatters: string;
  commonMistake: string;
  units?: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  metrics?: EducationalChartMetric[];
  className?: string;
}

export const EducationalChartCard: React.FC<EducationalChartCardProps> = ({
  title,
  subtitle,
  badge = 'Simulation',
  category,
  whatAmILookingAt,
  whyItMatters,
  commonMistake,
  units,
  children,
  controls,
  metrics,
  className = ''
}) => {
  const [showExplanation, setShowExplanation] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  return (
    <>
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 transition-all ${className}`}>
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800">
                {badge}
              </span>
              {category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                  {category}
                </span>
              )}
              {units && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Units: {units}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Expand Graph Button for deep analysis */}
            <button
              onClick={() => setIsExpanded(true)}
              className="px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 min-h-[40px] sm:min-h-0"
              title="Expand Chart to Fullscreen / Detail Mode"
              aria-label="Expand Chart"
            >
              <Maximize2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="hidden xs:inline">Expand Graph</span>
            </button>

            <button
              onClick={() => setShowExplanation(prev => !prev)}
              className="px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 min-h-[40px] sm:min-h-0"
              aria-label="Toggle Educational Explanation"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden xs:inline">Guide</span>
              {showExplanation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Key Metrics Strip */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800">
            {metrics.map((m, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block truncate">
                  {m.label}
                </span>
                <p className={`text-sm sm:text-base font-black truncate ${m.color || 'text-slate-900 dark:text-slate-100'}`}>
                  {m.value}
                </p>
                {m.subtext && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {m.subtext}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Interactive Controls Section ("Try it yourself") */}
        {controls && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Interactive Controls</span>
            </div>
            {controls}
          </div>
        )}

        {/* Chart Visualizer Stage */}
        <div className="w-full relative overflow-hidden rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 p-2 sm:p-4 border border-slate-100 dark:border-slate-850">
          {children}
        </div>

        {/* Structured Educational Scaffold */}
        {showExplanation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {/* What am I looking at? */}
            <div className="p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-bold">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>What am I looking at?</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                {whatAmILookingAt}
              </p>
            </div>

            {/* Why does it matter? */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                <span>Why does it matter?</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                {whyItMatters}
              </p>
            </div>

            {/* Common Mistake */}
            <div className="p-3.5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Common Mistake</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] sm:text-xs">
                {commonMistake}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN / DETAIL MODAL DIALOG */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setIsExpanded(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    Detailed Graph View
                  </span>
                  {units && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Units: {units}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {title}
                </h3>
              </div>

              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0"
                aria-label="Close fullscreen view"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
              {/* Metrics strip in expanded mode */}
              {metrics && metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  {metrics.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                        {m.label}
                      </span>
                      <p className={`text-base font-black truncate ${m.color || 'text-slate-900 dark:text-slate-100'}`}>
                        {m.value}
                      </p>
                      {m.subtext && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {m.subtext}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Controls inside expanded modal */}
              {controls && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" />
                    <span>Adjust Interactive Parameters</span>
                  </div>
                  {controls}
                </div>
              )}

              {/* Expanded Chart Canvas */}
              <div className="w-full min-h-[300px] sm:min-h-[420px] rounded-2xl bg-slate-50/60 dark:bg-slate-950/60 p-3 sm:p-6 border border-slate-200 dark:border-slate-800">
                {children}
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1">
                  <span className="font-bold text-blue-700 dark:text-blue-300">Observation</span>
                  <p className="text-slate-600 dark:text-slate-300">{whatAmILookingAt}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">Mathematical Rationale</span>
                  <p className="text-slate-600 dark:text-slate-300">{whyItMatters}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
                  <span className="font-bold text-rose-700 dark:text-rose-300">Downside Pitfall</span>
                  <p className="text-slate-600 dark:text-slate-300">{commonMistake}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
              <span className="text-xs text-slate-400">
                Press <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700">ESC</kbd> to exit
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
