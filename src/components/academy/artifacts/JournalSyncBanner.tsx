import React from 'react';
import { useAcademy } from '@/contexts/AcademyContext';
import { BarChart3, TrendingUp, AlertTriangle, ArrowUpRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JournalSyncBannerProps {
  conceptDomain?: string;
}

export const JournalSyncBanner: React.FC<JournalSyncBannerProps> = ({ conceptDomain }) => {
  const { journalStats } = useAcademy();

  if (journalStats.totalTrades === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/60 dark:to-slate-900/60 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4 my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">Connect Theory to Your Real Trades</h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Log trades in TradeVault to unlock real-time mathematical validation against the curriculum.
              </p>
            </div>
          </div>
          <Link
            to="/journal"
            className="text-xs px-3 py-1.5 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-xs"
          >
            <span>Open Journal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl p-4 my-4 shadow-md border border-slate-700/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-bold tracking-tight">Your Real TradeVault Performance Integration</h5>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                Live Journal Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Benchmarking your logged {journalStats.totalTrades} trades against institutional risk principles
            </p>
          </div>
        </div>
        <Link
          to="/analytics"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold transition-colors"
        >
          <span>Deep Analytics</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
        <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/40">
          <span className="text-[10px] uppercase text-slate-400 font-semibold">Your Win Rate</span>
          <p className="text-base font-bold text-white mt-0.5">{journalStats.winRate}%</p>
          <span className="text-[10px] text-slate-400">{journalStats.totalTrades} closed trades</span>
        </div>

        <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/40">
          <span className="text-[10px] uppercase text-slate-400 font-semibold">Expected Value</span>
          <p className={`text-base font-bold mt-0.5 ${journalStats.expectedValueR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {journalStats.expectedValueR >= 0 ? '+' : ''}{journalStats.expectedValueR} R
          </p>
          <span className="text-[10px] text-slate-400">Per trade expectancy</span>
        </div>

        <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/40">
          <span className="text-[10px] uppercase text-slate-400 font-semibold">Payoff Ratio</span>
          <p className="text-base font-bold text-white mt-0.5">
            {journalStats.avgLossR > 0 ? (journalStats.avgWinR / journalStats.avgLossR).toFixed(2) : '0'}:1
          </p>
          <span className="text-[10px] text-slate-400">Avg Win {journalStats.avgWinR}R / Loss {journalStats.avgLossR}R</span>
        </div>

        <div className="p-2.5 bg-slate-800/70 rounded-xl border border-slate-700/40">
          <span className="text-[10px] uppercase text-slate-400 font-semibold">Max Peak Drawdown</span>
          <p className="text-base font-bold text-rose-400 mt-0.5">{journalStats.maxDrawdownPct}%</p>
          <span className="text-[10px] text-slate-400">Recorded drawdown</span>
        </div>
      </div>
    </div>
  );
};
