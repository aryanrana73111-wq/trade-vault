import React, { useState } from 'react';
import { CalculatorResult, CalculatorInput } from '@/types';
import { 
  ShieldAlert, 
  ArrowRight, 
  BookmarkPlus, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Layers 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ResultsPanelProps {
  result: CalculatorResult;
  input: CalculatorInput;
  onUseInAddTrade: () => void;
  onSaveCalculation: () => void;
  isSaving?: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  input,
  onUseInAddTrade,
  onSaveCalculation,
  isSaving = false
}) => {
  const [showFormulaSteps, setShowFormulaSteps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onSaveCalculation();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const isBuy = input.direction === 'BUY';

  // Formatted position size string
  const formatPositionDisplay = () => {
    if (!result.isValid || result.roundedPositionSize <= 0) {
      return '—';
    }
    return `${result.roundedPositionSize.toLocaleString(undefined, {
      minimumFractionDigits: input.specification.assetClass === 'CRYPTO' ? 4 : 2,
      maximumFractionDigits: input.specification.assetClass === 'CRYPTO' ? 6 : 2
    })} ${result.unitLabel}`;
  };

  return (
    <div className="space-y-4">
      {/* Primary Result Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/50">
        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-blue-300">
              Recommended Position Size
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1 ${
                isBuy ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {input.direction}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[11px] font-medium">
                {input.specification.symbol}
              </span>
            </div>
          </div>

          {result.isValid ? (
            <div>
              <div className="flex items-baseline gap-3 my-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {formatPositionDisplay()}
                </span>
                {result.equivalentUnitsLabel && (
                  <span className="text-xs text-slate-300 font-medium hidden sm:inline">
                    ({result.equivalentUnitsLabel})
                  </span>
                )}
              </div>

              {result.roundedPositionSize !== result.positionSize && (
                <p className="text-xs text-slate-300 mb-1">
                  Exact calculated size: <span className="font-mono text-white">{result.positionSize.toFixed(4)} {result.unitLabel}</span> (stepped to {input.specification.positionStep} broker minimum)
                </p>
              )}

              <p className="text-xs text-blue-200/90 font-medium">
                Risking <span className="font-bold text-white">{input.accountCurrency} {result.estimatedLoss.toFixed(2)}</span> ({result.actualRiskPercent.toFixed(2)}% of balance)
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-lg font-bold text-slate-300 mb-1">Calculation Pending</p>
              <p className="text-xs text-amber-300 font-medium">
                {result.validationError || 'Enter valid entry, stop loss, and risk parameters.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Guardrail Warning */}
      {result.riskWarning && (
        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-150">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Risk Guardrail Triggered</span>
            <span>{result.riskWarning}</span>
          </div>
        </div>
      )}

      {/* Direction or Take Profit Warning */}
      {result.directionWarning && (
        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>{result.directionWarning}</span>
        </div>
      )}

      {/* Conversion applied note */}
      {result.conversionNote && (
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-600 dark:text-slate-400">
          ℹ️ {result.conversionNote}
        </div>
      )}

      {/* Key Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Planned Loss at Stop
          </span>
          <span className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400">
            -{input.accountCurrency} {result.isValid ? result.estimatedLoss.toFixed(2) : '—'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {result.isValid ? `${result.actualRiskPercent.toFixed(2)}% of account` : ''}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Stop Loss Distance
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {result.isValid ? result.stopLossDistance.toLocaleString() : '—'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {result.isValid ? `${result.stopLossPipsOrTicks.toLocaleString()} pips/ticks` : ''}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Risk : Reward
          </span>
          <span className={`text-sm sm:text-base font-bold ${
            result.riskRewardRatio && result.riskRewardRatio >= 2 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-slate-900 dark:text-slate-100'
          }`}>
            {result.riskRewardRatio ? `1 : ${result.riskRewardRatio}` : 'Optional (set TP)'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {result.potentialProfit ? `+${input.accountCurrency} ${result.potentialProfit.toFixed(2)}` : 'Requires Take Profit'}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Notional Value
          </span>
          <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            {result.notionalValue ? `${input.accountCurrency} ${result.notionalValue.toLocaleString()}` : '—'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Total trade exposure
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-2">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Estimated Required Margin
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
              {result.estimatedMargin ? `${input.accountCurrency} ${result.estimatedMargin.toLocaleString()}` : 'Not available'}
            </span>
            {input.leverage && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                1:{input.leverage} Leverage
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
            Leverage dictates margin, not risk. Planned loss at stop is fixed by position size and SL distance.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <Button
          type="button"
          onClick={onUseInAddTrade}
          disabled={!result.isValid || result.roundedPositionSize <= 0}
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 text-sm rounded-xl cursor-pointer"
        >
          <span>Use in Add Trade</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleSave}
          disabled={!result.isValid || result.roundedPositionSize <= 0 || isSaving}
          className="h-11 px-4 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Saved!</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4" />
              <span>Save Calculation</span>
            </>
          )}
        </Button>
      </div>

      {/* Collapsible "How was this calculated?" */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setShowFormulaSteps(!showFormulaSteps)}
          className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>How was this position size calculated?</span>
          </div>
          {showFormulaSteps ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showFormulaSteps && (
          <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
              Position Size = Risk Amount ÷ Loss per Unit at Stop Loss
            </div>

            {result.steps.map((step, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1.5 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{step.label}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{step.formula}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-right sm:self-center">
                  {step.detail}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
