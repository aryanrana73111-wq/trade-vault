import React, { useState } from 'react';
import { 
  Brain, 
  Flame, 
  Zap, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Smile, 
  Frown 
} from 'lucide-react';
import { Trade } from '@/types';
import { BehavioralPattern } from '@/types/commandCenter';
import { formatCurrency } from '@/lib/utils';
import { hasEmotion } from '@/lib/commandCenter/engine';

interface PsychologyCenterCardProps {
  trades: Trade[];
  patterns: BehavioralPattern[];
  onInvestigatePattern: (pattern: BehavioralPattern) => void;
}

export function PsychologyCenterCard({ trades, patterns, onInvestigatePattern }: PsychologyCenterCardProps) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  // Calculate Emotion Counts & Win Rates
  const emotionStats: Record<string, { total: number; wins: number; pnl: number }> = {};
  const commonEmotions = ['Confident', 'Calm', 'FOMO', 'Anxious', 'Greedy', 'Impatient', 'Revenge', 'Disciplined'];

  completed.forEach(t => {
    commonEmotions.forEach(em => {
      if (hasEmotion(t, em)) {
        if (!emotionStats[em]) emotionStats[em] = { total: 0, wins: 0, pnl: 0 };
        emotionStats[em].total++;
        if (t.result === 'WIN') emotionStats[em].wins++;
        emotionStats[em].pnl += (t.pnl || 0);
      }
    });
  });

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/60">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Psychology & Behavioral Command Center
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Observational pattern detection linking emotional impulses with execution outcomes.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 self-start sm:self-auto">
          Sample: {completed.length} Trades
        </span>
      </div>

      {/* 1. Visual Pipeline: Emotion → Behavior → Execution → Result */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Behavioral Impact Pipeline
        </span>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">1. State</span>
            <span className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400 mt-1 block">
              FOMO / Impatience
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Pre-trade urge</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">2. Behavior</span>
            <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 mt-1 block">
              Chasing / Late Entry
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Skipped confirmation</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">3. Execution</span>
            <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 mt-1 block">
              Subpar R:R Ratio
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Wider stop placement</span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">4. Result</span>
            <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white mt-1 block">
              Lower Win Rate
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Documented historical cost</span>
          </div>
        </div>
      </div>

      {/* 2. Behavioral Pattern Detectors (Revenge, FOMO, Overtrading) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Algorithmic Pattern Detectors
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {patterns.map((pat) => (
            <div
              key={pat.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                pat.detected
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {pat.name}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    pat.detected
                      ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {pat.confidence} Confidence
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {pat.evidenceNotes}
                </p>
              </div>

              {pat.detected && (
                <div className="mt-3 pt-2 border-t border-amber-100 dark:border-amber-900/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                    {pat.occurrenceCount} occurrences
                  </span>
                  <button
                    type="button"
                    onClick={() => onInvestigatePattern(pat)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Trades</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Emotion Heatmap Matrix */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Emotion vs Performance Matrix
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {commonEmotions.map((em) => {
            const stat = emotionStats[em];
            const hasData = stat && stat.total > 0;
            const wr = hasData ? (stat.wins / stat.total) * 100 : null;

            return (
              <div
                key={em}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{em}</span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    n={stat?.total || 0}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                    {wr !== null ? `${wr.toFixed(0)}% Win` : 'No Data'}
                  </span>
                  <span className={`text-[11px] font-mono font-bold ${
                    (stat?.pnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {stat?.pnl !== undefined ? formatCurrency(stat.pnl) : '--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
