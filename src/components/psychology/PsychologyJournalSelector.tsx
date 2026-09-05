import React, { useState, useMemo } from 'react';
import { Trade, Strategy } from '@/types';
import { Card, Input, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import { calculateTradePsychologyCompletion } from '@/lib/psychology';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  X,
  ChevronRight,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface PsychologyJournalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  trades: Trade[];
  strategies: Strategy[];
  onSelectTrade: (trade: Trade) => void;
}

export const PsychologyJournalSelector: React.FC<PsychologyJournalSelectorProps> = ({
  isOpen,
  onClose,
  trades,
  strategies,
  onSelectTrade,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [filterEmotion, setFilterEmotion] = useState<string>('ALL');
  const [filterCompletion, setFilterCompletion] = useState<string>('ALL');
  const [filterRule, setFilterRule] = useState<string>('ALL');

  // Precompute completion status for trades
  const tradesWithCompletion = useMemo(() => {
    return trades.map(t => ({
      trade: t,
      completion: calculateTradePsychologyCompletion(t)
    }));
  }, [trades]);

  const filteredItems = useMemo(() => {
    return tradesWithCompletion.filter(({ trade: t, completion }) => {
      // Search
      const strategyObj = strategies.find(s => s.id === t.strategy);
      const strategyName = strategyObj ? strategyObj.name : t.strategy || '';
      const marketMatch = (t.market || '').toLowerCase().includes(searchTerm.toLowerCase());
      const strategyMatch = strategyName.toLowerCase().includes(searchTerm.toLowerCase());
      const notesMatch = (t.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (searchTerm.trim() && !marketMatch && !strategyMatch && !notesMatch) return false;

      // Result filter
      if (filterResult !== 'ALL') {
        if (filterResult === 'BREAK_EVEN' && t.result !== 'BREAK EVEN') return false;
        if (filterResult !== 'BREAK_EVEN' && t.result !== filterResult) return false;
      }

      // Emotion filter
      if (filterEmotion !== 'ALL') {
        const hasEmotion = t.emotions?.includes(filterEmotion as any) || t.duringEmotions?.includes(filterEmotion as any) || t.exitEmotion === filterEmotion;
        if (!hasEmotion) return false;
      }

      // Completion filter
      if (filterCompletion !== 'ALL') {
        if (filterCompletion === 'COMPLETE' && completion.status !== 'Complete') return false;
        if (filterCompletion === 'PARTIAL' && completion.status !== 'Partially Completed') return false;
        if (filterCompletion === 'NONE' && completion.status !== 'No Psychology Data') return false;
      }

      // Rule adherence filter
      if (filterRule === 'FOLLOWED') {
        if (t.ruleAdherence === undefined || t.ruleAdherence < 90) return false;
      } else if (filterRule === 'BROKEN') {
        if (t.ruleAdherence === undefined || t.ruleAdherence >= 70) return false;
      }

      return true;
    });
  }, [tradesWithCompletion, searchTerm, filterResult, filterEmotion, filterCompletion, filterRule, strategies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] max-h-[850px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Select Trade From Journal</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose an existing trade to review or complete its behavioral psychology records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by market (e.g. XAU/USD, BTC), strategy, notes..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 h-10 w-full bg-slate-50 dark:bg-slate-800/60"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Result Filter */}
            <select
              value={filterResult}
              onChange={e => setFilterResult(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BREAK_EVEN">Cost to Cost (BE)</option>
              <option value="PENDING">PENDING</option>
            </select>

            {/* Completion Filter */}
            <select
              value={filterCompletion}
              onChange={e => setFilterCompletion(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Completion States</option>
              <option value="COMPLETE">Psychology Complete (100%)</option>
              <option value="PARTIAL">Partially Completed (1-99%)</option>
              <option value="NONE">No Psychology Data (0%)</option>
            </select>

            {/* Emotion Filter */}
            <select
              value={filterEmotion}
              onChange={e => setFilterEmotion(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Emotions</option>
              <option value="Calm">Calm</option>
              <option value="Confident">Confident</option>
              <option value="FOMO">FOMO</option>
              <option value="Revenge">Revenge</option>
              <option value="Fear">Fear</option>
              <option value="Greed">Greed</option>
              <option value="Anxious">Anxious</option>
              <option value="Impatient">Impatient</option>
              <option value="Disciplined">Disciplined</option>
            </select>

            {/* Rule Filter */}
            <select
              value={filterRule}
              onChange={e => setFilterRule(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Rule Adherence</option>
              <option value="FOLLOWED">Rules Followed (≥90%)</option>
              <option value="BROKEN">Rules Broken (&lt;70%)</option>
            </select>
          </div>
        </div>

        {/* Trade List Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
              <Brain className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="font-medium text-slate-700 dark:text-slate-300">No trades match your search or filters</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing some filter criteria or add a new trade</p>
            </div>
          ) : (
            filteredItems.map(({ trade: t, completion }) => {
              const strategyObj = strategies.find(s => s.id === t.strategy);
              const strategyName = strategyObj ? strategyObj.name : t.strategy || 'No Strategy';

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTrade(t);
                    onClose();
                  }}
                  className="group p-4 bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "w-1.5 h-12 rounded-full self-center flex-shrink-0",
                      t.direction === 'BUY' ? "bg-green-500" : "bg-red-500"
                    )} />

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-slate-900 dark:text-slate-100">{t.market}</span>
                        <Badge variant={t.direction === 'BUY' ? 'success' : 'danger'} className="text-[10px] py-0 px-1.5">
                          {t.direction}
                        </Badge>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {format(new Date(t.date), 'MMM dd, yyyy')} {t.time ? `• ${t.time}` : ''}
                        </span>
                        {strategyName && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                            {strategyName}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                        <span>Entry: <strong className="text-slate-900 dark:text-slate-100">{t.entry}</strong></span>
                        {t.stopLoss && <span>SL: <strong className="text-slate-900 dark:text-slate-100">{t.stopLoss}</strong></span>}
                        {t.takeProfit && <span>TP: <strong className="text-slate-900 dark:text-slate-100">{t.takeProfit}</strong></span>}
                        {t.rMultiple !== undefined && (
                          <span className={cn("font-semibold", t.rMultiple > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                            {t.rMultiple > 0 ? '+' : ''}{t.rMultiple}R
                          </span>
                        )}
                        {t.emotions && t.emotions.length > 0 && (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {t.emotions.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                    <div className="text-left sm:text-right">
                      {/* Result */}
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-md",
                          t.result === 'WIN' ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300" :
                          t.result === 'LOSS' ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300" :
                          t.result === 'BREAK EVEN' ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                          "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300"
                        )}>
                          {t.result || 'PENDING'}
                        </span>
                        {t.pnl !== undefined && (
                          <span className={cn("text-xs font-bold", t.pnl > 0 ? "text-green-600 dark:text-green-400" : (t.pnl < 0 ? "text-red-600 dark:text-red-400" : "text-slate-400"))}>
                            {t.pnl > 0 ? '+' : ''}{formatCurrency(t.pnl)}
                          </span>
                        )}
                      </div>

                      {/* Psychology Completion Status */}
                      <div className="mt-1 flex items-center gap-1.5 sm:justify-end">
                        {completion.status === 'Complete' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Psychology Complete
                          </span>
                        ) : completion.status === 'Partially Completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" /> Partial ({completion.score}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" /> No Psychology Data
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-1 rounded-lg text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {filteredItems.length} of {trades.length} historical trades</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
