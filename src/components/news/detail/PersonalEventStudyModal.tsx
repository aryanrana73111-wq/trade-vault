import React, { useState } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { X, Sparkles, Clock, Target, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';

interface PersonalEventStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: NewsEvent;
}

type StudyWindow = '15m' | '30m' | '1h' | '4h' | '1D';

export function PersonalEventStudyModal({
  isOpen,
  onClose,
  event
}: PersonalEventStudyModalProps) {
  const [selectedWindow, setSelectedWindow] = useState<StudyWindow>('1h');
  const [activePhase, setActivePhase] = useState<'before' | 'during' | 'after'>('during');

  if (!isOpen) return null;

  const WINDOW_DETAILS: Record<StudyWindow, {
    label: string;
    beforeDesc: string;
    duringDesc: string;
    afterDesc: string;
    historicalSpread: string;
    slippageEst: string;
    disciplineRule: string;
  }> = {
    '15m': {
      label: '15 Minutes',
      beforeDesc: 'Order book liquidity thins significantly. Bid-ask spreads widen 2x-4x across major pairs.',
      duringDesc: 'High execution slippage, latency queues, whipsaw fills. Stop-loss orders subject to gap risk.',
      afterDesc: 'Immediate reaction spike typically tests first liquidity pool; high fake-out probability.',
      historicalSpread: '2.8x standard spread',
      slippageEst: '± 4 to 12 ticks',
      disciplineRule: 'Avoid market orders within ±5m of release; wait for 15m candle close.'
    },
    '30m': {
      label: '30 Minutes',
      beforeDesc: 'Volatility index begins pricing binary outcome; hedging desks close short gamma exposure.',
      duringDesc: 'Initial momentum directional continuation or immediate mean-reversion trap.',
      afterDesc: 'First sustainable high or low of the session is established in 68% of major releases.',
      historicalSpread: '1.8x standard spread',
      slippageEst: '± 2 to 6 ticks',
      disciplineRule: 'Evaluate fair value gaps and liquidity sweeps once the initial 30m range forms.'
    },
    '1h': {
      label: '1 Hour',
      beforeDesc: 'Macro desks align positioning with consensus surveys; intraday volume slows.',
      duringDesc: 'Secondary reaction kicks in as institutional algorithmic models digest core breakdown.',
      afterDesc: 'Trend continuation or failure becomes visibly testable against pre-event support/resistance.',
      historicalSpread: '1.2x standard spread',
      slippageEst: 'Standard broker execution',
      disciplineRule: 'High-conviction entries occur once the 1H candle confirms directional absorption.'
    },
    '4h': {
      label: '4 Hours',
      beforeDesc: 'Multiday compression preceding the tier-1 macroeconomic print.',
      duringDesc: 'Complete digestion of headline, revisions, and central bank commentary.',
      afterDesc: 'Sovereign bond yield curve repositioning sets the multiday swing bias.',
      historicalSpread: 'Normalized spread',
      slippageEst: 'Negligible slippage',
      disciplineRule: 'Swing setups: Align trades with higher timeframe trend following daily cycle alignment.'
    },
    '1D': {
      label: '1 Day',
      beforeDesc: 'Pre-event consolidation range establishing structural key levels.',
      duringDesc: 'Day high/low established; market closes in direction of dominant institutional flow.',
      afterDesc: 'Daily candle close reveals whether the release sparked genuine trend or exhaustion.',
      historicalSpread: 'Normal',
      slippageEst: 'Zero impact',
      disciplineRule: 'Daily close above key resistance confirms sustained macro re-pricing.'
    }
  };

  const details = WINDOW_DETAILS[selectedWindow];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Personal Event Study: {event.name}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Execution timing analysis & risk discipline across release horizons
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Horizon Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
              1. Select Observation Horizon:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(['15m', '30m', '1h', '4h', '1D'] as StudyWindow[]).map((win) => (
                <button
                  key={win}
                  type="button"
                  onClick={() => setSelectedWindow(win)}
                  className={`py-2 px-2 text-center rounded-xl font-mono font-bold border transition-all ${
                    selectedWindow === win
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  {win}
                </button>
              ))}
            </div>
          </div>

          {/* Phase Switcher (Before / During / After) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 uppercase tracking-wider">
              2. Temporal Execution Phase:
            </label>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 font-semibold">
              <button
                type="button"
                onClick={() => setActivePhase('before')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                  activePhase === 'before'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Before Release
              </button>
              <button
                type="button"
                onClick={() => setActivePhase('during')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                  activePhase === 'during'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                During Release
              </button>
              <button
                type="button"
                onClick={() => setActivePhase('after')}
                className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                  activePhase === 'after'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                After Release
              </button>
            </div>
          </div>

          {/* Detailed Observations Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              {activePhase === 'before' ? 'Pre-Release Dynamic' : activePhase === 'during' ? 'Release Execution Spike' : 'Post-Release Absorption'} ({details.label})
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
              {activePhase === 'before' ? details.beforeDesc : activePhase === 'during' ? details.duringDesc : details.afterDesc}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Spread Expansion</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {details.historicalSpread}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-sans text-slate-400 block mb-0.5">Estimated Slippage</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {details.slippageEst}
                </span>
              </div>
            </div>
          </div>

          {/* TradeVault Risk Discipline Protocol */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block mb-0.5">TradeVault Protocol Rule:</strong>
              <p className="opacity-90 leading-relaxed">
                {details.disciplineRule}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Close Study
          </button>
        </div>
      </div>
    </div>
  );
}
