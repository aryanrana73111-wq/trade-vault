import React, { useState } from 'react';
import { 
  Target, 
  Globe, 
  Clock, 
  Calendar, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  BarChart2, 
  ExternalLink 
} from 'lucide-react';
import { Trade, Strategy } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StrategyAndMarketCenterCardProps {
  trades: Trade[];
  strategies: Strategy[];
  onSelectMarket: (market: string) => void;
  onSelectStrategy: (strategyId: string) => void;
}

export function StrategyAndMarketCenterCard({
  trades,
  strategies,
  onSelectMarket,
  onSelectStrategy
}: StrategyAndMarketCenterCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'strategies' | 'sessions' | 'dayOfWeek' | 'markets'>('strategies');

  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  // 1. Strategy Aggregations
  const strategyStats: Record<string, { total: number; wins: number; pnl: number; rTotal: number }> = {};
  completed.forEach(t => {
    const s = t.strategy || 'Untagged Playbook';
    if (!strategyStats[s]) strategyStats[s] = { total: 0, wins: 0, pnl: 0, rTotal: 0 };
    strategyStats[s].total++;
    if (t.result === 'WIN') strategyStats[s].wins++;
    strategyStats[s].pnl += (t.pnl || 0);
    strategyStats[s].rTotal += (t.rMultiple || 0);
  });

  // 2. Session Aggregations
  const sessions = ['London', 'New York', 'Asian', 'Overlap'];
  const sessionStats: Record<string, { total: number; wins: number; pnl: number }> = {};
  sessions.forEach(s => { sessionStats[s] = { total: 0, wins: 0, pnl: 0 }; });

  completed.forEach(t => {
    const s = t.session || '';
    sessions.forEach(sess => {
      if (s.toLowerCase().includes(sess.toLowerCase())) {
        sessionStats[sess].total++;
        if (t.result === 'WIN') sessionStats[sess].wins++;
        sessionStats[sess].pnl += (t.pnl || 0);
      }
    });
  });

  // 3. Day of Week Aggregations
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayStats: Record<string, { total: number; wins: number; pnl: number }> = {};
  days.forEach(d => { dayStats[d] = { total: 0, wins: 0, pnl: 0 }; });

  completed.forEach(t => {
    const dIdx = new Date(t.date).getDay();
    const map = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', ''];
    const dayName = map[dIdx];
    if (dayName && dayStats[dayName]) {
      dayStats[dayName].total++;
      if (t.result === 'WIN') dayStats[dayName].wins++;
      dayStats[dayName].pnl += (t.pnl || 0);
    }
  });

  // 4. Market Breakdown
  const marketStats: Record<string, { total: number; wins: number; pnl: number }> = {};
  completed.forEach(t => {
    const m = t.pair || t.market || 'Other';
    if (!marketStats[m]) marketStats[m] = { total: 0, wins: 0, pnl: 0 };
    marketStats[m].total++;
    if (t.result === 'WIN') marketStats[m].wins++;
    marketStats[m].pnl += (t.pnl || 0);
  });

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Strategy, Session & Market Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Attribution breakdowns isolating edge across playbooks, execution windows, and asset classes.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('strategies')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'strategies' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Playbooks
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sessions')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'sessions' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Sessions
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('dayOfWeek')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'dayOfWeek' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Days
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('markets')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'markets' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Markets
          </button>
        </div>
      </div>

      {/* 1. Playbooks / Strategies */}
      {activeSubTab === 'strategies' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(strategyStats).map(([name, data]) => {
            const wr = data.total > 0 ? (data.wins / data.total) * 100 : 0;
            const avgR = data.total > 0 ? data.rTotal / data.total : 0;
            const isSmallSample = data.total < 5;

            return (
              <div
                key={name}
                className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {name}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      isSmallSample ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      n={data.total}
                    </span>
                  </div>

                  {isSmallSample && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">
                      ⚠️ Sample size too limited to establish statistical edge.
                    </span>
                  )}

                  <div className="grid grid-cols-3 gap-1 text-center mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Win Rate</span>
                      <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                        {wr.toFixed(0)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Avg R</span>
                      <span className="text-xs font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
                        {avgR.toFixed(2)}R
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Net P&L</span>
                      <span className={`text-xs font-black font-mono mt-0.5 block ${
                        data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {formatCurrency(data.pnl)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Sessions */}
      {activeSubTab === 'sessions' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sessions.map((sess) => {
            const data = sessionStats[sess];
            const wr = data.total > 0 ? (data.wins / data.total) * 100 : 0;
            return (
              <div key={sess} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{sess}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">n={data.total} executions</span>
                <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{wr.toFixed(0)}% Win</span>
                  <span className={data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {formatCurrency(data.pnl)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Day of Week */}
      {activeSubTab === 'dayOfWeek' && (
        <div className="grid grid-cols-5 gap-2 text-center font-mono">
          {days.map((d) => {
            const data = dayStats[d];
            const wr = data.total > 0 ? (data.wins / data.total) * 100 : 0;
            return (
              <div key={d} className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">{d}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{data.total} trades</span>
                <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-2 block">{wr.toFixed(0)}%</span>
                <span className={`text-[11px] font-bold mt-0.5 block ${data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(data.pnl)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Markets */}
      {activeSubTab === 'markets' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(marketStats).map(([market, data], idx) => {
            const wr = data.total > 0 ? (data.wins / data.total) * 100 : 0;
            return (
              <div key={`cmd-mkt-${market}-${idx}`} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{market}</span>
                  <span className="text-[10px] font-mono text-slate-400">n={data.total}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{wr.toFixed(0)}% Win</span>
                  <span className={data.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {formatCurrency(data.pnl)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
