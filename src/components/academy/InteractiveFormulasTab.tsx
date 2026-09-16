import React, { useState } from 'react';
import { Calculator, Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { TRADING_FORMULAS } from '@/data/academy/formulas';
import { TradingFormula } from '@/types/academy';

export const InteractiveFormulasTab: React.FC = () => {
  // Store values for each formula: formulaId -> { symbol: value }
  const [inputs, setInputs] = useState<Record<string, Record<string, number>>>(() => {
    const initial: Record<string, Record<string, number>> = {};
    TRADING_FORMULAS.forEach(f => {
      initial[f.id] = {};
      f.variables.forEach(v => {
        initial[f.id][v.symbol] = v.defaultValue;
      });
    });
    return initial;
  });

  const handleInputChange = (formulaId: string, symbol: string, value: number) => {
    setInputs(prev => ({
      ...prev,
      [formulaId]: {
        ...prev[formulaId],
        [symbol]: value
      }
    }));
  };

  const handleReset = (f: TradingFormula) => {
    const defs: Record<string, number> = {};
    f.variables.forEach(v => {
      defs[v.symbol] = v.defaultValue;
    });
    setInputs(prev => ({ ...prev, [f.id]: defs }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-200" />
          <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
            Interactive Mathematical Workbench
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Institutional Trading Formulas & Calculators
        </h2>
        <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
          Manipulate quantitative parameters live to observe how position sizing, expected value, asymmetric drawdown recovery, and risk of ruin react dynamically.
        </p>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {TRADING_FORMULAS.map(formula => {
          const currentFormulaInputs = inputs[formula.id] || {};
          const resultValue = formula.calculate(currentFormulaInputs);
          const formattedResult = formula.formatResult(resultValue);

          return (
            <div
              key={formula.id}
              className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    {formula.domain}
                  </span>
                  <button
                    onClick={() => handleReset(formula)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formula.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {formula.description}
                </p>

                {/* Mathematical Expression */}
                <div className="my-3.5 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-blue-600 dark:text-blue-400 overflow-x-auto">
                  {formula.expression}
                </div>

                {/* Variable Inputs */}
                <div className="space-y-3 pt-1">
                  {formula.variables.map(v => {
                    const val = currentFormulaInputs[v.symbol] ?? v.defaultValue;
                    return (
                      <div key={v.symbol}>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>{v.label}</span>
                          <span className="text-blue-600 font-bold">{val} {v.unit}</span>
                        </div>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => handleInputChange(formula.id, v.symbol, Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculated Result Output */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-blue-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    Calculated Result:
                  </span>
                  <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
                    {formattedResult}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
                  Takeaway: {formula.interpretation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
