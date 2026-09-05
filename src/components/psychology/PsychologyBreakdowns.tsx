import React, { useState } from 'react';
import { Card } from '@/components/ui/Input';
import {
  StrategyPsychologyStats,
  SessionPsychologyStats
} from '@/lib/psychology';
import { cn } from '@/lib/utils';
import { Layers, Clock, ShieldCheck, ChevronRight } from 'lucide-react';

interface PsychologyBreakdownsProps {
  strategyStats: StrategyPsychologyStats[];
  sessionStats: SessionPsychologyStats[];
}

export const PsychologyBreakdowns: React.FC<PsychologyBreakdownsProps> = ({
  strategyStats,
  sessionStats,
}) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'session'>('strategy');
  const [selectedStrategyIndex, setSelectedStrategyIndex] = useState(0);

  const currentStrat = strategyStats[selectedStrategyIndex] || strategyStats[0];

  return (
    <Card className="p-4 sm:p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      {/* Header with Tab toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Contextual Psychology: Strategy & Session
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Identify how emotions intersect with specific trading setups and market hours
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('strategy')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'strategy'
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            <Layers className="w-3.5 h-3.5" /> By Strategy
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
              activeTab === 'session'
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            <Clock className="w-3.5 h-3.5" /> By Market Session
          </button>
        </div>
      </div>

      {activeTab === 'strategy' ? (
        <div>
          {strategyStats.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No strategy data logged yet.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Strategy Selector Pills */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                {strategyStats.map((s, idx) => (
                  <button
                    key={s.strategyName}
                    onClick={() => setSelectedStrategyIndex(idx)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-2",
                      selectedStrategyIndex === idx
                        ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-bold shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    )}
                  >
                    <span>{s.strategyName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {s.totalTrades}
                    </span>
                  </button>
                ))}
              </div>

              {/* Table of emotions for this strategy */}
              {currentStrat && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-3">Emotion</th>
                        <th className="py-2.5 px-3 text-center">Trades</th>
                        <th className="py-2.5 px-3 text-center">Win Rate</th>
                        <th className="py-2.5 px-3 text-center">Avg R</th>
                        <th className="py-2.5 px-3 text-center">Rule Adherence</th>
                        <th className="py-2.5 px-3 text-right">Sample Reliability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentStrat.emotions.map(em => (
                        <tr key={em.emotion} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                            {em.emotion}
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-700 dark:text-slate-300">
                            {em.count}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold">
                            {em.count < 3 ? (
                              <span className="text-slate-400 italic">Insufficient Data</span>
                            ) : (
                              <span className={cn(em.winRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                                {em.winRate}%
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            {em.count < 3 ? (
                              <span className="text-slate-400 italic">-</span>
                            ) : (
                              <span className={cn(em.avgR > 0 ? "text-emerald-600 dark:text-emerald-400" : (em.avgR < 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"))}>
                                {em.avgR > 0 ? '+' : ''}{em.avgR}R
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {em.ruleAdherence}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {em.reliability}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Session</th>
                <th className="py-2.5 px-3 text-center">Trades</th>
                <th className="py-2.5 px-3 text-center">Win Rate</th>
                <th className="py-2.5 px-3 text-center">Avg R</th>
                <th className="py-2.5 px-3 text-center">Rule Adherence</th>
                <th className="py-2.5 px-3">Top Recorded Emotions</th>
                <th className="py-2.5 px-3 text-right">Reliability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sessionStats.map(s => (
                <tr key={s.session} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                    {s.session}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-700 dark:text-slate-300 font-medium">
                    {s.count}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {s.count < 3 ? (
                      <span className="text-slate-400 italic">Insufficient Data</span>
                    ) : (
                      <span className={cn("font-bold", s.winRate >= 50 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                        {s.winRate}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {s.count < 3 ? (
                      <span className="text-slate-400 italic">-</span>
                    ) : (
                      <span className={cn(s.avgR > 0 ? "text-emerald-600 dark:text-emerald-400" : (s.avgR < 0 ? "text-red-600 dark:text-red-400" : "text-slate-500"))}>
                        {s.avgR > 0 ? '+' : ''}{s.avgR}R
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {s.ruleAdherence}%
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {s.topEmotions.length > 0 ? (
                        s.topEmotions.map(e => (
                          <span key={e.emotion} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                            {e.emotion} ({e.count})
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {s.reliability}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
