import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  Sparkles, 
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Trade } from '@/types';
import { Experiment, ShowMeWhyDetails } from '@/types/aiLabs';
import { Button } from '@/components/ui/Button';

interface ExperimentTrackerTabProps {
  trades: Trade[];
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
  onOpenShowMeWhy: (title: string, details: ShowMeWhyDetails, tradeIds: string[]) => void;
}

const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-session-limit',
    name: 'Single Trade Per Session Limit',
    changeTested: 'Cap execution to maximum 1 trade per session to eliminate revenge overtrading.',
    startDate: Date.now() - 14 * 24 * 60 * 60 * 1000,
    targetSampleSize: 20,
    currentSampleSize: 14,
    baseline: {
      winRate: 45.0,
      avgR: 0.85,
      ruleAdherence: 72,
      fomoFrequency: 28
    },
    current: {
      winRate: 57.1,
      avgR: 1.45,
      ruleAdherence: 88,
      fomoFrequency: 7
    },
    status: 'early_improvement',
    reflectionNotes: 'Limiting to 1 trade forced higher selectivity during pre-market prep.',
    tradeIds: []
  }
];

export const ExperimentTrackerTab: React.FC<ExperimentTrackerTabProps> = ({
  trades,
  onOpenEvidence,
  onOpenShowMeWhy
}) => {
  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    try {
      const saved = localStorage.getItem('tradevault_experiments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_EXPERIMENTS;
  });

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [changeTested, setChangeTested] = useState('');
  const [targetSampleSize, setTargetSampleSize] = useState(20);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('tradevault_experiments', JSON.stringify(experiments));
    } catch (e) {
      // ignore
    }
  }, [experiments]);

  // Update experiment metrics from trades after start date
  useEffect(() => {
    if (trades.length === 0) return;

    setExperiments(prev => prev.map(exp => {
      const postTrades = trades.filter(t => t.date >= exp.startDate);
      const preTrades = trades.filter(t => t.date < exp.startDate);

      const calc = (list: Trade[]) => {
        const closed = list.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
        const wins = closed.filter(t => t.result === 'WIN').length;
        const wr = closed.length > 0 ? (wins / closed.length) * 100 : 0;
        const totalR = closed.reduce((acc, t) => acc + (t.rMultiple !== undefined ? t.rMultiple : (t.pnl && t.risk ? t.pnl / t.risk : 0)), 0);
        const avgR = closed.length > 0 ? totalR / closed.length : 0;
        const adherence = list.length > 0 
          ? list.reduce((acc, t) => acc + (t.ruleAdherence || 75), 0) / list.length 
          : 75;
        const fomo = list.length > 0 
          ? (list.filter(t => t.emotions?.includes('FOMO')).length / list.length) * 100 
          : 0;
        return { winRate: wr, avgR, ruleAdherence: adherence, fomoFrequency: fomo, count: list.length, ids: list.map(t => t.id) };
      };

      const curr = calc(postTrades);
      const base = calc(preTrades);

      let status: Experiment['status'] = exp.status;
      if (curr.count >= exp.targetSampleSize) {
        status = curr.avgR > base.avgR ? 'early_improvement' : 'early_degradation';
      } else if (curr.count >= 5) {
        status = curr.avgR > base.avgR ? 'early_improvement' : 'inconclusive';
      } else {
        status = 'ongoing';
      }

      return {
        ...exp,
        currentSampleSize: curr.count,
        tradeIds: curr.ids,
        baseline: preTrades.length > 0 ? {
          winRate: base.winRate,
          avgR: base.avgR,
          ruleAdherence: base.ruleAdherence,
          fomoFrequency: base.fomoFrequency
        } : exp.baseline,
        current: {
          winRate: curr.winRate,
          avgR: curr.avgR,
          ruleAdherence: curr.ruleAdherence,
          fomoFrequency: curr.fomoFrequency
        },
        status
      };
    }));
  }, [trades.length]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !changeTested.trim()) return;

    // Calculate baseline from all existing trades
    const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
    const wins = closed.filter(t => t.result === 'WIN').length;
    const wr = closed.length > 0 ? (wins / closed.length) * 100 : 50;
    const totalR = closed.reduce((acc, t) => acc + (t.rMultiple || 0), 0);
    const avgR = closed.length > 0 ? totalR / closed.length : 1.0;

    const newExp: Experiment = {
      id: `exp-${Date.now()}`,
      name: name.trim(),
      changeTested: changeTested.trim(),
      startDate: Date.now(),
      targetSampleSize: Number(targetSampleSize) || 20,
      currentSampleSize: 0,
      baseline: {
        winRate: wr,
        avgR,
        ruleAdherence: 75,
        fomoFrequency: 15
      },
      current: {
        winRate: 0,
        avgR: 0,
        ruleAdherence: 0,
        fomoFrequency: 0
      },
      status: 'ongoing',
      reflectionNotes: reflection.trim(),
      tradeIds: []
    };

    setExperiments([newExp, ...experiments]);
    setIsCreating(false);
    setName('');
    setChangeTested('');
    setReflection('');
  };

  const handleDelete = (id: string) => {
    setExperiments(prev => prev.filter(e => e.id !== id));
  };

  const getStatusBadge = (status: Experiment['status']) => {
    switch (status) {
      case 'early_improvement':
        return {
          label: 'Early Improvement',
          className: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
      case 'early_degradation':
        return {
          label: 'Early Degradation',
          className: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        };
      case 'inconclusive':
        return {
          label: 'Inconclusive',
          className: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
        };
      case 'ongoing':
      default:
        return {
          label: 'Ongoing / Gathering Data',
          className: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Experiment Tracker
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test changes in your execution process and compare post-change metrics against your historical baseline.
          </p>
        </div>

        <Button onClick={() => setIsCreating(true)} className="text-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Start New Experiment
        </Button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Launch Trading Process Experiment
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
                Experiment Name
              </label>
              <input
                type="text"
                placeholder="e.g. Stop trading after 2 consecutive losses"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Specific Rule or Process Change Being Tested
              </label>
              <textarea
                placeholder="Describe the exact behavioral change you are committing to execute over the target sample."
                value={changeTested}
                onChange={(e) => setChangeTested(e.target.value)}
                rows={2}
                required
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Sample Size (Recommended: 15–30 trades)
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={targetSampleSize}
                  onChange={(e) => setTargetSampleSize(Number(e.target.value))}
                  required
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hypothesis / Initial Reflection
                </label>
                <input
                  type="text"
                  placeholder="e.g. Expecting lower drawdowns and less psychological friction"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Start Tracking Experiment
            </Button>
          </div>
        </form>
      )}

      {/* Experiments List */}
      <div className="space-y-4">
        {experiments.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2">
            <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active experiments</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Test a deliberate change in your rules or execution routine to observe whether it produces a measurable improvement over your baseline.
            </p>
          </div>
        ) : (
          experiments.map(exp => {
            const badge = getStatusBadge(exp.status);
            const progressPct = Math.min(100, Math.round((exp.currentSampleSize / exp.targetSampleSize) * 100));

            const deltaWR = exp.current.winRate - exp.baseline.winRate;
            const deltaR = exp.current.avgR - exp.baseline.avgR;
            const deltaAdherence = exp.current.ruleAdherence - exp.baseline.ruleAdherence;
            const deltaFOMO = exp.current.fomoFrequency - exp.baseline.fomoFrequency;

            return (
              <div
                key={exp.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Started {new Date(exp.startDate).toLocaleDateString()}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs font-semibold text-slate-500">
                        {exp.currentSampleSize} / {exp.targetSampleSize} Target Trades
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{exp.name}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      title="Delete Experiment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Change description */}
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-slate-100">Change Tested: </strong>
                  {exp.changeTested}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Sample Progress</span>
                    <span className="font-semibold">{progressPct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Baseline vs Current Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {/* Win Rate */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 text-[10px] font-semibold uppercase">Win Rate</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {exp.current.winRate.toFixed(1)}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Base: {exp.baseline.winRate.toFixed(1)}% ({deltaWR >= 0 ? '+' : ''}{deltaWR.toFixed(1)}%)
                    </div>
                  </div>

                  {/* Avg R */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 text-[10px] font-semibold uppercase">Avg R</span>
                    <div className={`font-bold text-base ${exp.current.avgR >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {exp.current.avgR > 0 ? '+' : ''}{exp.current.avgR.toFixed(2)}R
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Base: {exp.baseline.avgR.toFixed(2)}R ({deltaR >= 0 ? '+' : ''}{deltaR.toFixed(2)}R)
                    </div>
                  </div>

                  {/* Rule Adherence */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 text-[10px] font-semibold uppercase">Rule Adherence</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {exp.current.ruleAdherence.toFixed(0)}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Base: {exp.baseline.ruleAdherence.toFixed(0)}% ({deltaAdherence >= 0 ? '+' : ''}{deltaAdherence.toFixed(0)}%)
                    </div>
                  </div>

                  {/* FOMO Rate */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 text-[10px] font-semibold uppercase">FOMO Rate</span>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-base">
                      {exp.current.fomoFrequency.toFixed(0)}%
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Base: {exp.baseline.fomoFrequency.toFixed(0)}% ({deltaFOMO <= 0 ? '' : '+'}{deltaFOMO.toFixed(0)}%)
                    </div>
                  </div>
                </div>

                {exp.reflectionNotes && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 italic">
                    <strong className="font-semibold text-slate-800 dark:text-slate-200 not-italic">Trader Notes: </strong>
                    {exp.reflectionNotes}
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exp.tradeIds.length === 0}
                    onClick={() => onOpenEvidence(
                      `Experiment Trades: ${exp.name}`,
                      `${exp.currentSampleSize} trades recorded since experiment start`,
                      exp.tradeIds
                    )}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Experiment Trades ({exp.currentSampleSize})
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
