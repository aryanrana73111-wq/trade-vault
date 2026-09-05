import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Trade, Strategy } from '@/types';
import { Card, Input, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  calculatePsychologyOverview,
  calculateTradePsychologyCompletion,
  detectDetailedBehavioralPatterns,
  analyzePsychologyByStrategy,
  analyzePsychologyBySession,
  analyzeEmotions
} from '@/lib/psychology';
import { getSettings } from '@/lib/settings';
import { PsychologyOverview } from '@/components/psychology/PsychologyOverview';
import { PsychologyMatrix } from '@/components/psychology/PsychologyMatrix';
import { PsychologyPatterns } from '@/components/psychology/PsychologyPatterns';
import { PsychologyBreakdowns } from '@/components/psychology/PsychologyBreakdowns';
import { PsychologyJournalSelector } from '@/components/psychology/PsychologyJournalSelector';
import { PsychologyDetailModal } from '@/components/psychology/PsychologyDetailModal';
import { AddTradeModal } from '@/components/psychology/AddTradeModal';
import {
  Brain,
  Plus,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  BarChart3,
  ListFilter,
  Layers
} from 'lucide-react';

export default function Psychology() {
  const { trades: rawTrades, strategies: rawStrategies, updateTrade } = useData();
  const settings = getSettings();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  // Modals state
  const [isAddTradeOpen, setIsAddTradeOpen] = useState(false);
  const [isJournalSelectorOpen, setIsJournalSelectorOpen] = useState(false);
  const [selectedTradeForDetail, setSelectedTradeForDetail] = useState<Trade | null>(null);

  // Search & Filter state for the in-page trades table
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('ALL');
  const [filterEmotion, setFilterEmotion] = useState<string>('ALL');
  const [filterCompletion, setFilterCompletion] = useState<string>('ALL');
  const [filterRule, setFilterRule] = useState<string>('ALL');

  // Active view section navigation
  const [activeSection, setActiveSection] = useState<'all' | 'records' | 'matrix' | 'patterns' | 'context'>('all');

  // Sync state with Context
  useEffect(() => {
    const seen = new Set<string>();
    const unique = rawTrades.filter(t => {
      if (!t?.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    setTrades(unique.sort((a, b) => b.date - a.date));
    setStrategies([...rawStrategies]);

    // Keep selected trade in detail view up to date if it was modified
    if (selectedTradeForDetail) {
      const updated = unique.find(t => t.id === selectedTradeForDetail.id);
      if (updated) {
        setSelectedTradeForDetail(updated);
      }
    }
  }, [rawTrades, rawStrategies]);

  // Derived calculations
  const overviewMetrics = useMemo(() => {
    return calculatePsychologyOverview(trades, settings.risk.defaultRisk);
  }, [trades, settings.risk.defaultRisk]);

  const emotionStats = useMemo(() => {
    return analyzeEmotions(trades);
  }, [trades]);

  const behavioralPatterns = useMemo(() => {
    return detectDetailedBehavioralPatterns(trades, settings.risk.defaultRisk);
  }, [trades, settings.risk.defaultRisk]);

  const strategyStats = useMemo(() => {
    return analyzePsychologyByStrategy(trades);
  }, [trades]);

  const sessionStats = useMemo(() => {
    return analyzePsychologyBySession(trades);
  }, [trades]);

  // Precompute completion status for all trades
  const tradesWithCompletion = useMemo(() => {
    return trades.map(t => ({
      trade: t,
      completion: calculateTradePsychologyCompletion(t)
    }));
  }, [trades]);

  // Filtered trades list for in-page table
  const filteredTrades = useMemo(() => {
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

  // Previous trade finder for selected trade
  const previousTradeForSelected = useMemo(() => {
    if (!selectedTradeForDetail) return undefined;
    const sorted = [...trades].sort((a, b) => a.date - b.date);
    const idx = sorted.findIndex(t => t.id === selectedTradeForDetail.id);
    if (idx > 0) {
      return sorted[idx - 1];
    }
    return undefined;
  }, [trades, selectedTradeForDetail]);

  const handleTradeCreated = (newTrade: Trade) => {
    setIsAddTradeOpen(false);
    // Directly open Psychology Detail for the newly created trade!
    setSelectedTradeForDetail(newTrade);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 animate-in fade-in duration-150">
      {/* Top Header & Dedicated Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Psychology Workspace
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Behavioral analysis, execution discipline & emotional tracking connected to your trade records
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsJournalSelectorOpen(true)}
            className="gap-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            From Journal
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddTradeOpen(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + Add Trade
          </Button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={() => setActiveSection('all')}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            activeSection === 'all'
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          )}
        >
          All Workspace Modules
        </button>

        <button
          onClick={() => setActiveSection('records')}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            activeSection === 'records'
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          )}
        >
          Trade Records ({trades.length})
        </button>

        <button
          onClick={() => setActiveSection('matrix')}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            activeSection === 'matrix'
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          )}
        >
          Emotion Matrix
        </button>

        <button
          onClick={() => setActiveSection('patterns')}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            activeSection === 'patterns'
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          )}
        >
          Behavioral Patterns
        </button>

        <button
          onClick={() => setActiveSection('context')}
          className={cn(
            "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
            activeSection === 'context'
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          )}
        >
          Strategy & Session
        </button>
      </div>

      {/* 1. OVERVIEW DASHBOARD */}
      {(activeSection === 'all' || activeSection === 'matrix' || activeSection === 'records') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Psychology Overview
            </h2>
          </div>
          <PsychologyOverview metrics={overviewMetrics} />
        </section>
      )}

      {/* 2. DEDICATED TRADE RECORDS & PSYCHOLOGY AUDIT LIST */}
      {(activeSection === 'all' || activeSection === 'records') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-purple-500" /> Trade Psychology Records
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review or complete behavioral observations on any existing trade
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsJournalSelectorOpen(true)}
                className="h-8 text-xs gap-1.5"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" /> Search Journal
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-3.5 sm:p-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search market, strategy, or notes..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-xs bg-slate-50 dark:bg-slate-800/60"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <select
                value={filterResult}
                onChange={e => setFilterResult(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Outcomes</option>
                <option value="WIN">WIN</option>
                <option value="LOSS">LOSS</option>
                <option value="BREAK_EVEN">Cost to Cost (BE)</option>
                <option value="PENDING">PENDING</option>
              </select>

              <select
                value={filterCompletion}
                onChange={e => setFilterCompletion(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Completion States</option>
                <option value="COMPLETE">Complete (100%)</option>
                <option value="PARTIAL">Partially Completed</option>
                <option value="NONE">Unrecorded (0%)</option>
              </select>

              <select
                value={filterEmotion}
                onChange={e => setFilterEmotion(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
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

              <select
                value={filterRule}
                onChange={e => setFilterRule(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="ALL">All Rule Adherence</option>
                <option value="FOLLOWED">Followed (≥90%)</option>
                <option value="BROKEN">Broken (&lt;70%)</option>
              </select>
            </div>
          </Card>

          {/* Trade Cards List */}
          <div className="space-y-2.5">
            {filteredTrades.length === 0 ? (
              <Card className="p-10 text-center border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <Brain className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No trades found matching your filters</p>
                <p className="text-xs text-slate-500 mt-1">Add a new trade or select from your journal</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSearchTerm(''); setFilterResult('ALL'); setFilterEmotion('ALL'); setFilterCompletion('ALL'); setFilterRule('ALL'); }}>
                    Clear Filters
                  </Button>
                  <Button size="sm" onClick={() => setIsAddTradeOpen(true)}>
                    + Add Trade
                  </Button>
                </div>
              </Card>
            ) : (
              filteredTrades.slice(0, 10).map(({ trade: t, completion }) => {
                const strategyObj = strategies.find(s => s.id === t.strategy);
                const strategyName = strategyObj ? strategyObj.name : t.strategy;

                return (
                  <Card
                    key={t.id}
                    className="p-3.5 sm:p-4 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm cursor-pointer group"
                    onClick={() => setSelectedTradeForDetail(t)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-1.5 h-10 rounded-full flex-shrink-0",
                          t.direction === 'BUY' ? "bg-green-500" : "bg-red-500"
                        )} />

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.market}</span>
                            <Badge variant={t.direction === 'BUY' ? 'success' : 'danger'} className="text-[10px] py-0 px-1.5">
                              {t.direction}
                            </Badge>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {format(new Date(t.date), 'MMM dd, yyyy')}
                            </span>
                            {strategyName && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {strategyName}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>Entry: <strong className="text-slate-700 dark:text-slate-300">{t.entry}</strong></span>
                            {t.stopLoss && <span>SL: <strong className="text-slate-700 dark:text-slate-300">{t.stopLoss}</strong></span>}
                            {t.takeProfit && <span>TP: <strong className="text-slate-700 dark:text-slate-300">{t.takeProfit}</strong></span>}
                            {t.emotions && t.emotions.length > 0 && (
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {t.emotions.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                        <div className="text-left sm:text-right">
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

                          <div className="mt-1 flex items-center gap-1 sm:justify-end">
                            {completion.status === 'Complete' ? (
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Complete
                              </span>
                            ) : completion.status === 'Partially Completed' ? (
                              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Partial ({completion.score}%)
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Unrecorded
                              </span>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 gap-1 px-2.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTradeForDetail(t);
                          }}
                        >
                          Review <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}

            {filteredTrades.length > 10 && (
              <div className="text-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJournalSelectorOpen(true)}
                  className="text-xs"
                >
                  View All {filteredTrades.length} Trades in Journal Selector
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. EMOTION → BEHAVIOR → PERFORMANCE TABLE */}
      {(activeSection === 'all' || activeSection === 'matrix') && (
        <section className="space-y-4">
          <PsychologyMatrix emotionStats={emotionStats} />
        </section>
      )}

      {/* 4. BEHAVIORAL PATTERN DETECTION */}
      {(activeSection === 'all' || activeSection === 'patterns') && (
        <section className="space-y-4">
          <PsychologyPatterns
            patterns={behavioralPatterns}
            onSelectEvidenceTrade={(evTrade) => setSelectedTradeForDetail(evTrade)}
          />
        </section>
      )}

      {/* 5. STRATEGY & SESSION INTERSECTIONS */}
      {(activeSection === 'all' || activeSection === 'context') && (
        <section className="space-y-4">
          <PsychologyBreakdowns
            strategyStats={strategyStats}
            sessionStats={sessionStats}
          />
        </section>
      )}

      {/* MODAL 1: ADD TRADE MODAL */}
      <AddTradeModal
        isOpen={isAddTradeOpen}
        onClose={() => setIsAddTradeOpen(false)}
        onTradeCreated={handleTradeCreated}
      />

      {/* MODAL 2: JOURNAL SELECTOR */}
      <PsychologyJournalSelector
        isOpen={isJournalSelectorOpen}
        onClose={() => setIsJournalSelectorOpen(false)}
        trades={trades}
        strategies={strategies}
        onSelectTrade={(trade) => setSelectedTradeForDetail(trade)}
      />

      {/* MODAL 3: PSYCHOLOGY DETAIL FOR EXISTING TRADE */}
      <PsychologyDetailModal
        trade={selectedTradeForDetail}
        previousTrade={previousTradeForSelected}
        strategies={strategies}
        isOpen={Boolean(selectedTradeForDetail)}
        onClose={() => setSelectedTradeForDetail(null)}
        onUpdateTrade={async (id, updates) => {
          await updateTrade(id, updates);
        }}
      />
    </div>
  );
}
