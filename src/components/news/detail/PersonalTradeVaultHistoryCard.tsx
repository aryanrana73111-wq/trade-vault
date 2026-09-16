import React, { useMemo } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { getTrades } from '@/lib/storage';
import { Trade } from '@/types';
import { BookOpen, UserCheck, ShieldAlert, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

interface PersonalTradeVaultHistoryCardProps {
  event: NewsEvent;
  onOpenEventStudy: () => void;
}

export function PersonalTradeVaultHistoryCard({
  event,
  onOpenEventStudy
}: PersonalTradeVaultHistoryCardProps) {
  // Load real trades from TradeVault user database
  const userStats = useMemo(() => {
    try {
      const allTrades: Trade[] = getTrades();
      if (!allTrades || allTrades.length === 0) return null;

      // Match trades relevant to this event currency or macro catalyst
      // E.g., for USD events -> XAU/USD, EUR/USD, GBP/USD, etc.
      const relevantMarkets = event.currency === 'USD' 
        ? ['XAU/USD', 'EUR/USD', 'GBP/USD', 'BTC/USD'] 
        : event.currency === 'EUR'
        ? ['EUR/USD', 'EUR/GBP', 'EUR/JPY']
        : event.currency === 'GBP'
        ? ['GBP/USD', 'EUR/GBP', 'GBP/JPY']
        : event.currency === 'JPY'
        ? ['USD/JPY', 'EUR/JPY', 'GBP/JPY']
        : [event.currency];

      const matchingTrades = allTrades.filter(t => {
        if (!t.market) return false;
        return relevantMarkets.some(m => t.market.toUpperCase().includes(m.toUpperCase()) || t.market.toUpperCase().includes(event.currency));
      });

      if (matchingTrades.length === 0) {
        return { count: 0, hasSufficientData: false };
      }

      // Check sample size (minimum 3 trades for sufficient statistical confidence)
      const hasSufficientData = matchingTrades.length >= 3;

      const wins = matchingTrades.filter(t => t.result === 'WIN').length;
      const losses = matchingTrades.filter(t => t.result === 'LOSS').length;
      const winRate = Math.round((wins / (matchingTrades.length || 1)) * 100);

      // R-Multiple calculations
      const rValues = matchingTrades
        .map(t => typeof t.rMultiple === 'number' ? t.rMultiple : (t.result === 'WIN' ? 1.5 : t.result === 'LOSS' ? -1 : 0))
        .filter(r => !isNaN(r));

      const totalR = rValues.reduce((acc, val) => acc + val, 0);
      const avgR = rValues.length > 0 ? totalR / rValues.length : 0;

      return {
        count: matchingTrades.length,
        hasSufficientData,
        winRate,
        avgR: Number(avgR.toFixed(2)),
        totalR: Number(totalR.toFixed(1)),
        sampleMarkets: Array.from(new Set(matchingTrades.map(t => t.market))).slice(0, 3).join(', ')
      };
    } catch {
      return null;
    }
  }, [event.currency]);

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Trading History Around This Event
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Personal journal verification ({event.currency} related instruments)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEventStudy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-2xs transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open My Event Study</span>
        </button>
      </div>

      {userStats && userStats.hasSufficientData ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                Recorded Trades
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {userStats.count}
              </span>
              <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                {userStats.sampleMarkets}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                Win Rate
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {userStats.winRate}%
              </span>
              <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                Observed sample
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                Average R
              </span>
              <span className={`text-xl font-bold ${
                userStats.avgR > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {userStats.avgR > 0 ? `+${userStats.avgR}R` : `${userStats.avgR}R`}
              </span>
              <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                Per trade expectancy
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
                Total Realized R
              </span>
              <span className={`text-xl font-bold ${
                userStats.totalR > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {userStats.totalR > 0 ? `+${userStats.totalR}R` : `${userStats.totalR}R`}
              </span>
              <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                Net cumulative R
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Note:
            </span>
            <span>
              Historical observation only. Not indicative of future execution performance or market volatility.
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Insufficient Personal Event Data
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You currently have {userStats?.count || 0} recorded trades around {event.currency} catalysts in your TradeVault journal. A minimum of 3 trades is required to compute reliable personal win rate and expectancy metrics.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
