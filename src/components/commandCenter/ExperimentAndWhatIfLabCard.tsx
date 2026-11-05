import React, { useState } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Scale 
} from 'lucide-react';
import { WhatIfSimulationResult, HypothesisItem } from '@/types/commandCenter';
import { formatCurrency } from '@/lib/utils';

interface ExperimentAndWhatIfLabCardProps {
  whatIfResults: WhatIfSimulationResult[];
  hypotheses: HypothesisItem[];
}

export function ExperimentAndWhatIfLabCard({ whatIfResults, hypotheses }: ExperimentAndWhatIfLabCardProps) {
  const [activeTab, setActiveTab] = useState<'whatIf' | 'hypotheses'>('whatIf');

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-900/60">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Experiment & What-If Scenario Lab
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate historical rule modifications without altering your original trade records.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('whatIf')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'whatIf' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            What-If Simulations ({whatIfResults.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hypotheses')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'hypotheses' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Hypothesis Lab ({hypotheses.length})
          </button>
        </div>
      </div>

      {/* 1. What-If Simulations */}
      {activeTab === 'whatIf' && (
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            HISTORICAL WHAT-IF SIMULATION (DOES NOT MODIFY ACTUAL TRADES)
          </span>

          {whatIfResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {whatIfResults.map((sim, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block leading-tight">
                      {sim.scenarioName}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {sim.assumptions}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual P&L:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(sim.originalNetPnl)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Simulated P&L:</span>
                      <span className={`font-bold ${sim.simulatedNetPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatCurrency(sim.simulatedNetPnl)}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between font-black">
                      <span className="text-slate-500">P&L Delta:</span>
                      <span className={sim.deltaNetPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {sim.deltaNetPnl >= 0 ? '+' : ''}{formatCurrency(sim.deltaNetPnl)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Insufficient Data for Scenarios</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Log closed trades to simulate risk capping and setup quality filtering.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Hypothesis Lab */}
      {activeTab === 'hypotheses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {hypotheses.map((hyp) => (
            <div
              key={hyp.id}
              className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {hyp.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">n={hyp.sampleSize}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  &ldquo;{hyp.statement}&rdquo;
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                {hyp.evidenceFor.length > 0 && (
                  <div className="text-emerald-700 dark:text-emerald-400">
                    <strong>Evidence For:</strong> {hyp.evidenceFor.join(' ')}
                  </div>
                )}
                {hyp.evidenceAgainst.length > 0 && (
                  <div className="text-rose-700 dark:text-rose-400">
                    <strong>Evidence Against:</strong> {hyp.evidenceAgainst.join(' ')}
                  </div>
                )}
                {hyp.evidenceFor.length === 0 && hyp.evidenceAgainst.length === 0 && (
                  <span className="text-slate-400 italic">Gathering sample trade records...</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
