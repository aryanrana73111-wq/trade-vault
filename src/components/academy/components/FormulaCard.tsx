import React, { useState } from 'react';
import { Binary, Calculator, Info, RefreshCw, Copy, Check } from 'lucide-react';
import { TradingFormula } from '@/types/academy';

interface FormulaCardProps {
  formula: TradingFormula;
  className?: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  formula,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [inputs, setInputs] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    formula.variables.forEach(v => {
      initial[v.symbol] = v.defaultValue;
    });
    return initial;
  });

  const handleInputChange = (symbol: string, value: string) => {
    const num = parseFloat(value);
    setInputs(prev => ({
      ...prev,
      [symbol]: isNaN(num) ? 0 : num
    }));
  };

  const resetInputs = () => {
    const reset: Record<string, number> = {};
    formula.variables.forEach(v => {
      reset[v.symbol] = v.defaultValue;
    });
    setInputs(reset);
  };

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(`${formula.name}: ${formula.expression}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculatedResult = React.useMemo(() => {
    try {
      const res = formula.calculate(inputs);
      if (typeof res !== 'number' || isNaN(res) || !isFinite(res)) {
        return 0;
      }
      return res;
    } catch {
      return 0;
    }
  }, [formula, inputs]);

  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            {formula.domain}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyFormula}
              title="Copy Formula"
              aria-label="Copy Formula"
              className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={resetInputs}
              title="Reset variables to defaults"
              aria-label="Reset variables to defaults"
              className="p-2 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
          {formula.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {formula.description}
        </p>

        {/* Formula display with horizontal overflow guard */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 font-mono text-center font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 overflow-x-auto scrollbar-none">
          {formula.expression}
        </div>
      </div>

      {/* Interactive variable inputs */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Interactive Parameter Inputs
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {formula.variables.map(v => (
            <div key={v.symbol} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800 min-h-[44px]">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                {v.label} ({v.symbol})
              </label>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  step="any"
                  value={inputs[v.symbol] ?? v.defaultValue}
                  onChange={(e) => handleInputChange(v.symbol, e.target.value)}
                  className="w-20 px-2 py-1.5 text-right text-xs font-mono font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 min-h-[36px]"
                />
                {v.unit && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {v.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Output & Institutional Interpretation */}
      <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Calculated Output:
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-blue-600 dark:text-blue-400">
            {formula.formatResult(calculatedResult)}
          </span>
        </div>

        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
          <strong className="text-slate-800 dark:text-slate-200">Institutional Takeaway: </strong>
          {formula.interpretation}
        </p>
      </div>
    </div>
  );
};
