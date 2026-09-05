import React from 'react';
import { CalculatorHistoryItem } from '@/types';
import { History, Trash2, ArrowUpRight, RotateCcw, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CalculationHistoryTabProps {
  history: CalculatorHistoryItem[];
  onLoadItem: (item: CalculatorHistoryItem) => void;
  onUseInAddTrade: (item: CalculatorHistoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const CalculationHistoryTab: React.FC<CalculationHistoryTabProps> = ({
  history,
  onLoadItem,
  onUseInAddTrade,
  onDeleteItem
}) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          No Saved Calculations Yet
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          When you calculate a position size, click <span className="font-semibold text-slate-700 dark:text-slate-300">"Save Calculation"</span> to save snapshots here for quick review or later execution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Saved Position Size Calculations ({history.length})</span>
        </h3>
        <span className="text-xs text-slate-400">Scoped to this dashboard</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {history.map((item) => {
          const isBuy = item.direction === 'BUY';
          const formattedDate = new Date(item.createdAt || item.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {item.instrument}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    isBuy ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  }`}>
                    {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {item.direction}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-medium">
                    {item.assetClass}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">{formattedDate}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                  <span>
                    Size: <strong className="text-blue-600 dark:text-blue-400 font-mono text-sm">{item.positionSize} {item.unitLabel}</strong>
                  </span>
                  <span>
                    Risk: <strong className="text-slate-900 dark:text-slate-100 font-mono">{item.currency} {item.riskAmount.toFixed(2)} ({item.riskPercent}%)</strong>
                  </span>
                  <span>
                    Entry: <strong className="font-mono">{item.entry}</strong>
                  </span>
                  <span>
                    SL: <strong className="font-mono text-rose-600 dark:text-rose-400">{item.stopLoss}</strong>
                  </span>
                  {item.takeProfit && (
                    <span>
                      TP: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{item.takeProfit}</strong>
                    </span>
                  )}
                  {item.riskRewardRatio && (
                    <span>
                      R:R: <strong className="font-mono text-blue-600 dark:text-blue-400">1:{item.riskRewardRatio}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onLoadItem(item)}
                  className="h-8 px-2.5 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                  title="Load into calculator"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reopen</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => onUseInAddTrade(item)}
                  className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Transfer to Add Trade form"
                >
                  <span>Use in Trade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete calculation snapshot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
