import React from 'react';
import { CalculatorInput } from '@/types';
import { calculateRiskScenarios } from '@/lib/riskCalculator';
import { Table, ArrowRight, ShieldAlert, Check } from 'lucide-react';

interface RiskScenariosTableProps {
  input: CalculatorInput;
  onApplyScenario: (riskPercent: number) => void;
  maxConfiguredRisk?: number;
}

export const RiskScenariosTable: React.FC<RiskScenariosTableProps> = ({
  input,
  onApplyScenario,
  maxConfiguredRisk
}) => {
  const scenarios = calculateRiskScenarios(input, undefined, maxConfiguredRisk);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Risk Scenario Comparison Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hypothetical scenarios based on your current inputs: <span className="font-semibold text-slate-700 dark:text-slate-300">{input.specification.symbol}</span> | Entry: <span className="font-mono">{input.entry || 0}</span> | SL: <span className="font-mono">{input.stopLoss || 0}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
            <tr>
              <th className="px-4 py-3">Risk %</th>
              <th className="px-4 py-3">Risk Amount</th>
              <th className="px-4 py-3">Position Size</th>
              <th className="px-4 py-3">Broker Stepped</th>
              <th className="px-4 py-3">Actual Loss at SL</th>
              <th className="px-4 py-3">Potential Profit</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {scenarios.map((sc) => {
              const isCurrent = Math.abs(input.riskPercent - sc.percent) < 0.001 && input.riskMode === 'percent';
              return (
                <tr
                  key={sc.percent}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                    isCurrent ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span>{sc.percent.toFixed(2)}%</span>
                      {sc.exceedsMaxRisk && (
                        <span title={`Exceeds max configured risk (${maxConfiguredRisk}%)`} className="text-amber-500">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                          Active
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                    {input.accountCurrency} {sc.riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {sc.positionSize > 0 
                      ? `${sc.positionSize.toFixed(4)} ${sc.unitLabel}` 
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {sc.roundedPositionSize > 0 
                      ? `${sc.roundedPositionSize.toLocaleString()} ${sc.unitLabel}` 
                      : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-rose-600 dark:text-rose-400 font-semibold">
                    {sc.estimatedLoss > 0 ? `-${input.accountCurrency} ${sc.estimatedLoss.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {sc.potentialProfit && sc.potentialProfit > 0 
                      ? `+${input.accountCurrency} ${sc.potentialProfit.toFixed(2)}` 
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onApplyScenario(sc.percent)}
                      disabled={isCurrent}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white cursor-default'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Applied</span>
                        </>
                      ) : (
                        <>
                          <span>Apply</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Pro Tip:</span> Comparing multiple risk scenarios lets you evaluate exposure across conservative (0.25%-0.5%) vs standard (1%) risk parameters without changing your stop-loss placement.
      </div>
    </div>
  );
};
