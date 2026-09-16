import React, { useState, useMemo } from 'react';
import { Arena, ArenaMember, CompetitionTrade } from '@/types';
import { X, Users, Trophy, Shield, TrendingUp, AlertCircle, Award, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CompareTradersModalProps {
  arena: Arena;
  trades: CompetitionTrade[];
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  initialTraderBId?: string;
}

export function CompareTradersModal({
  arena,
  trades,
  isOpen,
  onClose,
  currentUserId,
  initialTraderBId
}: CompareTradersModalProps) {
  const membersList = useMemo(() => {
    return Object.values(arena.members).filter(m => m.status === 'accepted');
  }, [arena.members]);

  const [traderAId, setTraderAId] = useState<string>(() => {
    return arena.members[currentUserId] ? currentUserId : membersList[0]?.userId || '';
  });

  const [traderBId, setTraderBId] = useState<string>(() => {
    if (initialTraderBId && arena.members[initialTraderBId]) return initialTraderBId;
    const others = membersList.filter(m => m.userId !== currentUserId);
    return others[0]?.userId || membersList[1]?.userId || '';
  });

  React.useEffect(() => {
    if (initialTraderBId && arena.members[initialTraderBId]) {
      setTraderBId(initialTraderBId);
    }
  }, [initialTraderBId, arena.members]);

  const traderA = arena.members[traderAId];
  const traderB = arena.members[traderBId];

  // Filter trades for each trader
  const tradesA = useMemo(() => trades.filter(t => t.userId === traderAId), [trades, traderAId]);
  const tradesB = useMemo(() => trades.filter(t => t.userId === traderBId), [trades, traderBId]);

  // Insights generation
  const comparativeInsights = useMemo(() => {
    if (!traderA || !traderB) return null;
    const statsA = traderA.stats;
    const statsB = traderB.stats;
    if (!statsA || !statsB) return null;

    const insights = [];

    // R comparison
    if (statsA.totalR > statsB.totalR) {
      insights.push({
        winner: traderA.displayName || 'Trader A',
        text: `generated ${Number((statsA.totalR - statsB.totalR).toFixed(1))}R more cumulative return, driven by higher expectancy per setup.`
      });
    } else if (statsB.totalR > statsA.totalR) {
      insights.push({
        winner: traderB.displayName || 'Trader B',
        text: `generated ${Number((statsB.totalR - statsA.totalR).toFixed(1))}R more cumulative return across ${statsB.tradeCount} trades.`
      });
    }

    // Win Rate vs Avg R dynamics
    if (statsA.winRate > statsB.winRate && statsB.avgR > statsA.avgR) {
      insights.push({
        winner: 'Tradeoff Observed',
        text: `${traderA.displayName || 'Trader A'} wins more often (${statsA.winRate}% vs ${statsB.winRate}%), but ${traderB.displayName || 'Trader B'} extracts larger winners (${statsB.avgR}R vs ${statsA.avgR}R).`
      });
    }

    // Drawdown discipline
    if (statsA.maxDrawdown < statsB.maxDrawdown) {
      insights.push({
        winner: traderA.displayName || 'Trader A',
        text: `maintained superior drawdown management ($${statsA.maxDrawdown} peak DD vs $${statsB.maxDrawdown}).`
      });
    } else if (statsB.maxDrawdown < statsA.maxDrawdown) {
      insights.push({
        winner: traderB.displayName || 'Trader B',
        text: `kept a tighter drawdown ceiling ($${statsB.maxDrawdown} peak DD vs $${statsA.maxDrawdown}).`
      });
    }

    return insights;
  }, [traderA, traderB]);

  if (!isOpen) return null;

  interface MetricItem {
    label: string;
    valA: any;
    valB: any;
    format: (v: any) => string;
    better: 'A' | 'B';
  }

  const metrics: MetricItem[] = traderA?.stats && traderB?.stats ? [
    {
      label: 'Sample Size (Trades)',
      valA: tradesA.length,
      valB: tradesB.length,
      format: (v: any) => `${v}`,
      better: tradesA.length >= tradesB.length ? 'A' : 'B'
    },
    {
      label: 'Total R (Risk Multiple)',
      valA: traderA.stats.totalR,
      valB: traderB.stats.totalR,
      format: (v: any) => v > 0 ? `+${v}R` : `${v}R`,
      better: traderA.stats.totalR >= traderB.stats.totalR ? 'A' : 'B'
    },
    {
      label: 'Average R / Trade',
      valA: traderA.stats.avgR,
      valB: traderB.stats.avgR,
      format: (v: any) => v > 0 ? `+${v}R` : `${v}R`,
      better: traderA.stats.avgR >= traderB.stats.avgR ? 'A' : 'B'
    },
    {
      label: 'Net Realized P&L',
      valA: traderA.stats.netPnl,
      valB: traderB.stats.netPnl,
      format: (v: any) => `$${Number(v).toLocaleString()}`,
      better: traderA.stats.netPnl >= traderB.stats.netPnl ? 'A' : 'B'
    },
    {
      label: 'Win Rate (%)',
      valA: traderA.stats.winRate,
      valB: traderB.stats.winRate,
      format: (v: any) => `${v}%`,
      better: traderA.stats.winRate >= traderB.stats.winRate ? 'A' : 'B'
    },
    {
      label: 'Profit Factor',
      valA: traderA.stats.profitFactor,
      valB: traderB.stats.profitFactor,
      format: (v: any) => `${v}`,
      better: (traderA.stats.profitFactor === 'MAX' ? 9999 : (traderA.stats.profitFactor || 0)) >= (traderB.stats.profitFactor === 'MAX' ? 9999 : (traderB.stats.profitFactor || 0)) ? 'A' : 'B'
    },
    {
      label: 'Max Drawdown',
      valA: traderA.stats.maxDrawdown,
      valB: traderB.stats.maxDrawdown,
      format: (v: any) => `$${v}`,
      better: traderA.stats.maxDrawdown <= traderB.stats.maxDrawdown ? 'A' : 'B' // lower is better
    },
    {
      label: 'Rule Adherence Discipline',
      valA: traderA.stats.ruleAdherenceAvg,
      valB: traderB.stats.ruleAdherenceAvg,
      format: (v: any) => `${v}%`,
      better: traderA.stats.ruleAdherenceAvg >= traderB.stats.ruleAdherenceAvg ? 'A' : 'B'
    },
    {
      label: 'Composite Arena Score',
      valA: traderA.stats.score,
      valB: traderB.stats.score,
      format: (v: any) => `${v} pts`,
      better: traderA.stats.score >= traderB.stats.score ? 'A' : 'B'
    }
  ] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                Head-to-Head Compare
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Evidence-based performance comparison in {arena.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Trader Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="space-y-1 min-w-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trader 1</label>
              <select
                value={traderAId}
                onChange={(e) => setTraderAId(e.target.value)}
                className="w-full h-11 px-3 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 truncate"
              >
                {membersList.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName || 'Trader'} {m.userId === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 min-w-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trader 2</label>
              <select
                value={traderBId}
                onChange={(e) => setTraderBId(e.target.value)}
                className="w-full h-11 px-3 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 truncate"
              >
                {membersList.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName || 'Trader'} {m.userId === currentUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Metric Matrix */}
          {traderA && traderB && traderA.stats && traderB.stats ? (
            <div className="space-y-5">
              
              {/* DESKTOP/TABLET TABLE (hidden on small mobile screens) */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="text-left py-3 px-4 w-1/3">Performance Metric</th>
                      <th className="text-center py-3 px-4 w-1/3 text-indigo-600 dark:text-indigo-400 truncate">
                        {traderA.displayName || 'Trader 1'} {traderAId === currentUserId ? '(You)' : ''}
                      </th>
                      <th className="text-center py-3 px-4 w-1/3 text-purple-600 dark:text-purple-400 truncate">
                        {traderB.displayName || 'Trader 2'} {traderBId === currentUserId ? '(You)' : ''}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {metrics.map((m, idx) => (
                      <tr key={m.label} className={idx % 2 === 1 ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}>
                        <td className="py-2.5 px-4 font-medium">{m.label}</td>
                        <td className={`py-2.5 px-4 text-center font-bold ${m.better === 'A' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          {m.format(m.valA)}
                        </td>
                        <td className={`py-2.5 px-4 text-center font-bold ${m.better === 'B' ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                          {m.format(m.valB)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE DEDICATED CARDS (visible on mobile < md) */}
              <div className="md:hidden space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold px-1 pb-1 gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400 truncate flex-1 text-left">
                    {traderA.displayName || 'Trader 1'} {traderAId === currentUserId ? '(You)' : ''}
                  </span>
                  <span className="text-slate-400 font-semibold flex-shrink-0">vs</span>
                  <span className="text-purple-600 dark:text-purple-400 truncate flex-1 text-right">
                    {traderB.displayName || 'Trader 2'} {traderBId === currentUserId ? '(You)' : ''}
                  </span>
                </div>

                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5 min-w-0"
                  >
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center truncate">
                      {m.label}
                    </div>
                    <div className="flex items-center justify-between text-xs font-bold gap-2">
                      <div className={`p-2 rounded-lg text-center flex-1 min-w-0 truncate ${
                        m.better === 'A'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}>
                        {m.format(m.valA)}
                      </div>
                      <div className={`p-2 rounded-lg text-center flex-1 min-w-0 truncate ${
                        m.better === 'B'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}>
                        {m.format(m.valB)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparative Insights Box */}
              {comparativeInsights && comparativeInsights.length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>Key Empirical Takeaways</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-indigo-950 dark:text-indigo-300">
                    {comparativeInsights.map((ci, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed break-words">
                        <span className="font-bold text-indigo-600 flex-shrink-0">• {ci.winner}:</span>
                        <span className="break-words">{ci.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select two traders to view head-to-head metrics.
            </div>
          )}

        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <Button onClick={onClose} variant="outline" className="h-11 px-6 text-xs font-semibold">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
