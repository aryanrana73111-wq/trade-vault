import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  HelpCircle, 
  Eye, 
  Layers, 
  TrendingUp, 
  Play, 
  Trash2, 
  FileText,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Trade } from '@/types';
import { Hypothesis, ShowMeWhyDetails, EvidenceLevel } from '@/types/aiLabs';
import { getEvidenceLevel, getEvidenceLevelBadge, testHypothesis } from '@/lib/aiLabs/engine';
import { Button } from '@/components/ui/Button';

interface HypothesisLabTabProps {
  trades: Trade[];
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
  onOpenShowMeWhy: (title: string, details: ShowMeWhyDetails, tradeIds: string[]) => void;
}

const DEFAULT_HYPOTHESES: Hypothesis[] = [
  {
    id: 'hypo-london-superiority',
    title: 'London Session Outperformance',
    statement: 'Trades taken during the London session achieve higher average R and win rate than other trading sessions.',
    category: 'session',
    status: 'preliminary',
    evidenceLevel: 'preliminary',
    sampleSize: 24,
    totalRelevantTrades: 24,
    supportingTradeIds: [],
    contradictingTradeIds: [],
    neutralTradeIds: [],
    criteria: { session: 'London' },
    conclusionNotes: 'London session setups benefit from the European open liquidity influx.',
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'hypo-fomo-drag',
    title: 'Emotional FOMO Drag',
    statement: 'Entries executed with an emotional tag of FOMO have a negative expected value and degrade overall win rate.',
    category: 'psychology',
    status: 'early',
    evidenceLevel: 'early',
    sampleSize: 12,
    totalRelevantTrades: 12,
    supportingTradeIds: [],
    contradictingTradeIds: [],
    neutralTradeIds: [],
    criteria: {},
    conclusionNotes: 'FOMO entries consistently feature poorer entry location and wider stop distances.',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  }
];

export const HypothesisLabTab: React.FC<HypothesisLabTabProps> = ({
  trades,
  onOpenEvidence,
  onOpenShowMeWhy
}) => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>(() => {
    try {
      const saved = localStorage.getItem('tradevault_hypotheses');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_HYPOTHESES;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStatement, setNewStatement] = useState('');
  const [newCategory, setNewCategory] = useState<Hypothesis['category']>('session');
  const [filterSession, setFilterSession] = useState('All');
  const [filterMarket, setFilterMarket] = useState('All');
  const [filterStrategy, setFilterStrategy] = useState('All');
  const [filterDirection, setFilterDirection] = useState('All');

  // Save hypotheses whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tradevault_hypotheses', JSON.stringify(hypotheses));
    } catch (e) {
      // ignore
    }
  }, [hypotheses]);

  // Handle testing a hypothesis against live trades
  const handleTestHypothesis = (hypoId: string) => {
    setHypotheses(prev => prev.map(hypo => {
      if (hypo.id !== hypoId) return hypo;

      const result = testHypothesis(trades, hypo.criteria || {});
      return {
        ...hypo,
        supportingTradeIds: result.supportingTradeIds,
        contradictingTradeIds: result.contradictingTradeIds,
        neutralTradeIds: result.neutralTradeIds,
        totalRelevantTrades: result.totalRelevantTrades,
        evidenceLevel: result.evidenceLevel,
        status: result.status,
        updatedAt: Date.now()
      };
    }));
  };

  // Run test on mount for initial hydration if trades exist
  useEffect(() => {
    if (trades.length > 0) {
      setHypotheses(prev => prev.map(hypo => {
        const result = testHypothesis(trades, hypo.criteria || {});
        return {
          ...hypo,
          supportingTradeIds: result.supportingTradeIds,
          contradictingTradeIds: result.contradictingTradeIds,
          neutralTradeIds: result.neutralTradeIds,
          totalRelevantTrades: result.totalRelevantTrades,
          evidenceLevel: result.evidenceLevel,
          status: result.status,
          updatedAt: Date.now()
        };
      }));
    }
  }, [trades.length]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStatement.trim()) return;

    const criteria = {
      session: filterSession !== 'All' ? filterSession : undefined,
      market: filterMarket !== 'All' ? filterMarket : undefined,
      strategy: filterStrategy !== 'All' ? filterStrategy : undefined,
      direction: filterDirection !== 'All' ? filterDirection : undefined,
    };

    const testRes = testHypothesis(trades, criteria);

    const newHypo: Hypothesis = {
      id: `hypo-${Date.now()}`,
      title: newTitle.trim(),
      statement: newStatement.trim(),
      category: newCategory,
      status: testRes.status,
      evidenceLevel: testRes.evidenceLevel,
      sampleSize: testRes.totalRelevantTrades,
      totalRelevantTrades: testRes.totalRelevantTrades,
      supportingTradeIds: testRes.supportingTradeIds,
      contradictingTradeIds: testRes.contradictingTradeIds,
      neutralTradeIds: testRes.neutralTradeIds,
      criteria,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setHypotheses([newHypo, ...hypotheses]);
    setIsCreating(false);
    setNewTitle('');
    setNewStatement('');
  };

  const handleDelete = (id: string) => {
    setHypotheses(prev => prev.filter(h => h.id !== id));
  };

  const markets = ['All', ...Array.from(new Set(trades.map(t => t.market).filter(Boolean)))];
  const strategies = ['All', ...Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)))];
  const sessions = ['All', 'London', 'New York', 'Asian', 'Sydney'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Hypothesis Lab
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Formulate testable trading beliefs and systematically measure historical evidence without bias.
          </p>
        </div>

        <Button
          onClick={() => setIsCreating(true)}
          className="text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Formulate Hypothesis
        </Button>
      </div>

      {/* Creation Modal / Inline Panel */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Formulate New Testable Hypothesis
            </h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hypothesis Title
              </label>
              <input
                type="text"
                placeholder="e.g. Higher win rate during London session"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Hypothesis Statement (Specific & Testable)
              </label>
              <textarea
                placeholder="e.g. My trading records will show higher realized R on EUR/USD during London than during New York."
                value={newStatement}
                onChange={(e) => setNewStatement(e.target.value)}
                rows={2}
                required
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                >
                  <option value="session">Session</option>
                  <option value="risk">Risk</option>
                  <option value="psychology">Psychology</option>
                  <option value="strategy">Strategy</option>
                  <option value="market">Market</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Session</label>
                <select
                  value={filterSession}
                  onChange={(e) => setFilterSession(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                >
                  {sessions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Market</label>
                <select
                  value={filterMarket}
                  onChange={(e) => setFilterMarket(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                >
                  {markets.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Target Strategy</label>
                <select
                  value={filterStrategy}
                  onChange={(e) => setFilterStrategy(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs"
                >
                  {strategies.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save & Test Against Recorded Trades
            </Button>
          </div>
        </form>
      )}

      {/* Hypotheses List */}
      <div className="space-y-4">
        {hypotheses.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2">
            <Lightbulb className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No hypotheses registered yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Create a hypothesis to track whether your trading theories are supported or contradicted by your actual recorded trade logs.
            </p>
          </div>
        ) : (
          hypotheses.map(hypo => {
            const badge = getEvidenceLevelBadge(hypo.evidenceLevel);
            const total = hypo.totalRelevantTrades;
            const suppCount = hypo.supportingTradeIds.length;
            const contCount = hypo.contradictingTradeIds.length;
            const neutCount = hypo.neutralTradeIds.length;

            return (
              <div
                key={hypo.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {hypo.category}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {total} matching recorded trade{total === 1 ? '' : 's'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{hypo.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.badgeClass} flex items-center gap-1.5`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                      {badge.label}
                    </span>
                    <button
                      onClick={() => handleDelete(hypo.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      title="Delete Hypothesis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Statement */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{hypo.statement}"
                </p>

                {/* Evidence Metrics Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Supporting */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Supporting
                      </span>
                      <span className="text-lg font-bold text-emerald-900 dark:text-emerald-200 block mt-0.5">
                        {suppCount} <span className="text-[10px] font-normal text-emerald-700">({total > 0 ? ((suppCount / total) * 100).toFixed(0) : 0}%)</span>
                      </span>
                    </div>
                    {suppCount > 0 && (
                      <button
                        onClick={() => onOpenEvidence(`Supporting Trades: ${hypo.title}`, 'Trades that confirm this hypothesis', hypo.supportingTradeIds)}
                        className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    )}
                  </div>

                  {/* Contradicting */}
                  <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3.5 h-3.5" /> Contradicting
                      </span>
                      <span className="text-lg font-bold text-rose-900 dark:text-rose-200 block mt-0.5">
                        {contCount} <span className="text-[10px] font-normal text-rose-700">({total > 0 ? ((contCount / total) * 100).toFixed(0) : 0}%)</span>
                      </span>
                    </div>
                    {contCount > 0 && (
                      <button
                        onClick={() => onOpenEvidence(`Contradicting Trades: ${hypo.title}`, 'Trades that contradict this hypothesis', hypo.contradictingTradeIds)}
                        className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-0.5"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    )}
                  </div>

                  {/* Neutral */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1 text-[11px]">
                        <MinusCircle className="w-3.5 h-3.5 text-slate-400" /> Neutral / Inconclusive
                      </span>
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {neutCount} <span className="text-[10px] font-normal text-slate-500">({total > 0 ? ((neutCount / total) * 100).toFixed(0) : 0}%)</span>
                      </span>
                    </div>
                    {neutCount > 0 && (
                      <button
                        onClick={() => onOpenEvidence(`Neutral Trades: ${hypo.title}`, 'Trades with neutral outcomes', hypo.neutralTradeIds)}
                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-0.5"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenShowMeWhy(
                      hypo.title,
                      {
                        detected: `Hypothesis tested against ${total} historical trades matching criteria.`,
                        fieldsUsed: ['session', 'market', 'strategy', 'result', 'rMultiple'],
                        tradesAnalyzed: total,
                        supportingEvidence: `${suppCount} trades achieved winning or positive expectancy.`,
                        contradictingEvidence: `${contCount} trades experienced losses or negative expectancy.`,
                        confoundingFactors: [
                          'Sample size limits statistical reliability',
                          'Uncontrolled macroeconomic news events during trade entries'
                        ],
                        dataToImprove: 'Accumulate more entries under matching criteria to reach the 30+ trade threshold.'
                      },
                      [...hypo.supportingTradeIds, ...hypo.contradictingTradeIds]
                    )}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Show Me Why
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestHypothesis(hypo.id)}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" /> Test Against Recorded Trades
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
