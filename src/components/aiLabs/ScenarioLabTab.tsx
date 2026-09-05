import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  ArrowRight, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Filter,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Trade } from '@/types';
import { ScenarioSimulationResult, ShowMeWhyDetails } from '@/types/aiLabs';
import { simulateScenario } from '@/lib/aiLabs/engine';
import { Button } from '@/components/ui/Button';

interface ScenarioLabTabProps {
  trades: Trade[];
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
  onOpenShowMeWhy: (title: string, details: ShowMeWhyDetails, tradeIds: string[]) => void;
}

export const ScenarioLabTab: React.FC<ScenarioLabTabProps> = ({
  trades,
  onOpenEvidence,
  onOpenShowMeWhy
}) => {
  const [selectedRule, setSelectedRule] = useState<ScenarioSimulationResult['ruleType']>('fixed_risk');
  const [sessionTarget, setSessionTarget] = useState('London');
  const [strategyTarget, setStrategyTarget] = useState('');

  const strategies = Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)));
  const currentStrategy = strategyTarget || (strategies[0] || 'Strategy');

  const simulation: ScenarioSimulationResult = simulateScenario(trades, selectedRule, {
    session: sessionTarget,
    strategy: currentStrategy
  });

  const actual = simulation.actual;
  const sim = simulation.simulated;

  const deltaWR = sim.winRate - actual.winRate;
  const deltaAvgR = sim.avgR - actual.avgR;
  const deltaNetPnl = sim.netPnl - actual.netPnl;
  const deltaPF = sim.profitFactor - actual.profitFactor;
  const deltaDD = sim.maxDrawdown - actual.maxDrawdown;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Scenario Lab (Historical What-If Simulator)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Recalculate historical performance under altered rules to measure the mathematical impact on your recorded trades.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Zero-Alteration Simulation Guarantee</strong>
          This is a purely retrospective simulation based on your recorded data. Your original trades, formulas, and balance remain 100% untouched. Past simulated performance is never a guarantee of future outcomes.
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Choose Historical What-If Scenario:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {[
            { id: 'fixed_risk', label: 'Fixed 1.0% Risk', desc: 'Standardizes variable risk to exactly 1% per trade.' },
            { id: 'exclude_fomo', label: 'Exclude FOMO & Revenge', desc: 'Eliminates all trades tagged with FOMO or Revenge.' },
            { id: 'strict_rules', label: 'Strict Rule Adherence (≥80%)', desc: 'Includes only trades where checklist adherence was ≥80%.' },
            { id: 'session_filter', label: 'Session Exclusivity', desc: 'Isolates execution to a single designated session.' }
          ].map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setSelectedRule(scenario.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedRule === scenario.id
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="font-bold text-slate-900 dark:text-slate-100 mb-1">{scenario.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{scenario.desc}</div>
            </button>
          ))}
        </div>

        {/* Secondary Config if session chosen */}
        {selectedRule === 'session_filter' && (
          <div className="pt-2 flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Target Session:</span>
            {['London', 'New York', 'Asian'].map(s => (
              <button
                key={s}
                onClick={() => setSessionTarget(s)}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  sessionTarget === s 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{simulation.name}</h4>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Sample: {simulation.sampleSize} recorded trades
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{simulation.description}</p>
        </div>

        {/* Side by side metric tables */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Trades */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Trades Kept</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {sim.tradeCount} <span className="text-xs font-normal text-slate-400">/ {actual.tradeCount}</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {actual.tradeCount - sim.tradeCount} excluded
            </span>
          </div>

          {/* Win Rate */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Win Rate</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {sim.winRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className={deltaWR >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {deltaWR >= 0 ? '+' : ''}{deltaWR.toFixed(1)}%
              </span>
              <span className="text-slate-400 font-normal">vs {actual.winRate.toFixed(1)}%</span>
            </div>
          </div>

          {/* Average R */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Average R</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {sim.avgR.toFixed(2)}R
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className={deltaAvgR >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {deltaAvgR >= 0 ? '+' : ''}{deltaAvgR.toFixed(2)}R
              </span>
              <span className="text-slate-400 font-normal">vs {actual.avgR.toFixed(2)}R</span>
            </div>
          </div>

          {/* Net P&L */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Net P&L</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ${sim.netPnl.toFixed(0)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className={deltaNetPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {deltaNetPnl >= 0 ? '+' : ''}${deltaNetPnl.toFixed(0)}
              </span>
              <span className="text-slate-400 font-normal">vs ${actual.netPnl.toFixed(0)}</span>
            </div>
          </div>

          {/* Profit Factor */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Profit Factor</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {sim.profitFactor.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className={deltaPF >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {deltaPF >= 0 ? '+' : ''}{deltaPF.toFixed(2)}
              </span>
              <span className="text-slate-400 font-normal">vs {actual.profitFactor.toFixed(2)}</span>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Max Drawdown</span>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ${sim.maxDrawdown.toFixed(0)}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
              <span className={deltaDD <= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {deltaDD <= 0 ? '' : '+'}${deltaDD.toFixed(0)}
              </span>
              <span className="text-slate-400 font-normal">vs ${actual.maxDrawdown.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenEvidence(
                `Included Trades: ${simulation.name}`,
                `${simulation.includedTradeIds.length} trades included in simulation`,
                simulation.includedTradeIds
              )}
              className="text-xs flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> View Included Trades ({simulation.includedTradeIds.length})
            </Button>

            {simulation.excludedTradeIds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenEvidence(
                  `Excluded Trades: ${simulation.name}`,
                  `${simulation.excludedTradeIds.length} trades excluded by filter`,
                  simulation.excludedTradeIds
                )}
                className="text-xs flex items-center gap-1.5 text-slate-500"
              >
                <Eye className="w-3.5 h-3.5" /> View Excluded ({simulation.excludedTradeIds.length})
              </Button>
            )}
          </div>

          <button
            onClick={() => onOpenShowMeWhy(
              simulation.name,
              {
                detected: `Simulation applied the rule '${selectedRule}' to ${simulation.sampleSize} historical closed trades.`,
                fieldsUsed: ['pnl', 'risk', 'rMultiple', 'emotions', 'session', 'ruleAdherence'],
                tradesAnalyzed: simulation.sampleSize,
                supportingEvidence: `${simulation.includedTradeIds.length} trades satisfied the simulated criteria.`,
                contradictingEvidence: `${simulation.excludedTradeIds.length} trades were filtered out.`,
                confoundingFactors: [
                  'Simulation assumes trades would have executed identically if the rule were in place live',
                  'Execution slippage and psychological friction are not simulated'
                ],
                dataToImprove: 'Recording precise stop distance in pips and exit execution slippage will improve simulation realism.'
              },
              simulation.includedTradeIds
            )}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Show Me Why
          </button>
        </div>
      </div>
    </div>
  );
};
