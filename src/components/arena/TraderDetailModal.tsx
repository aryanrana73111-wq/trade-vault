import React, { useState, useMemo } from 'react';
import { Arena, ArenaMember, CompetitionTrade } from '@/types';
import {
  X,
  Trophy,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Activity,
  Shield,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Camera,
  Clock,
  Sparkles,
  Award,
  Globe,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { TradeDetailModal } from './TradeDetailModal';

interface TraderDetailModalProps {
  member: ArenaMember | null;
  arena: Arena;
  trades: CompetitionTrade[];
  isOpen: boolean;
  onClose: () => void;
  onCompareWithUser?: (userId: string) => void;
  onCompare?: (userId: string) => void;
  currentUserId: string;
}

export function TraderDetailModal({
  member,
  arena,
  trades,
  isOpen,
  onClose,
  onCompareWithUser,
  onCompare,
  currentUserId
}: TraderDetailModalProps) {
  // Selected trade for viewing detailed execution & screenshots
  const [selectedTrade, setSelectedTrade] = useState<CompetitionTrade | null>(null);

  if (!isOpen || !member) return null;

  const isCurrentUser = member.userId === currentUserId;
  const startingBalance = arena.startingBalance || 10000;

  // STRICT COMPETITION DATA ONLY: Filter trades strictly by this member & competition
  const memberTrades = trades
    .filter((t) => t.userId === member.userId)
    .sort((a, b) => (a.date || 0) - (b.date || 0));

  // Compute Competition Performance Metrics
  const totalTrades = memberTrades.length;
  const winningTrades = memberTrades.filter((t) => t.result === 'WIN').length;
  const losingTrades = memberTrades.filter((t) => t.result === 'LOSS').length;
  const breakEvenTrades = memberTrades.filter((t) => t.result === 'BE').length;

  const winRate = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 100) : (member.stats?.winRate || 0);

  // Net P&L
  const netPnl = memberTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const currentEquity = startingBalance + netPnl;
  const returnPercent = startingBalance > 0 ? (netPnl / startingBalance) * 100 : 0;

  // Average R
  const validRTrades = memberTrades.filter((t) => t.rMultiple !== undefined);
  const avgR = validRTrades.length > 0
    ? Number((validRTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / validRTrades.length).toFixed(2))
    : member.stats?.avgR || 0;

  // Profit Factor
  const grossProfit = memberTrades
    .filter((t) => (t.pnl || 0) > 0)
    .reduce((acc, t) => acc + (t.pnl || 0), 0);
  const grossLoss = Math.abs(
    memberTrades
      .filter((t) => (t.pnl || 0) < 0)
      .reduce((acc, t) => acc + (t.pnl || 0), 0)
  );
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '-');

  // Peak-to-Trough Drawdown Calculation
  let runningEquity = startingBalance;
  let peakEquity = startingBalance;
  let maxDrawdownDollars = 0;
  let maxDrawdownPercent = 0;

  const equityData: Array<{
    step: string;
    tradeNum: number;
    date: string;
    market: string;
    tradePnl: number;
    equity: number;
  }> = [
    {
      step: 'Start',
      tradeNum: 0,
      date: format(new Date(arena.startDate || Date.now()), 'MMM d'),
      market: 'Initial Capital',
      tradePnl: 0,
      equity: startingBalance
    }
  ];

  memberTrades.forEach((t, index) => {
    runningEquity += (t.pnl || 0);
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
    }
    const drawdown = peakEquity - runningEquity;
    if (drawdown > maxDrawdownDollars) {
      maxDrawdownDollars = drawdown;
      maxDrawdownPercent = peakEquity > 0 ? (drawdown / peakEquity) * 100 : 0;
    }

    equityData.push({
      step: `Trade ${index + 1}`,
      tradeNum: index + 1,
      date: t.date ? format(new Date(t.date), 'MMM d, HH:mm') : `Trade ${index + 1}`,
      market: t.market || '',
      tradePnl: t.pnl || 0,
      equity: Math.round(runningEquity * 100) / 100
    });
  });

  // Calculate Rank in Arena
  const rankedMembers = Object.values(arena.members)
    .filter((m) => m.status === 'accepted')
    .sort((a, b) => (b.stats?.score || 0) - (a.stats?.score || 0));
  const rankIndex = rankedMembers.findIndex((m) => m.userId === member.userId);
  const rank = rankIndex >= 0 ? rankIndex + 1 : '-';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]">
          
          {/* Top Header / Profile Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {member.photoURL ? (
                <img
                  src={member.photoURL}
                  alt=""
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-600 text-white font-black flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-md shadow-indigo-500/20">
                  {(member.displayName || 'T').substring(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                    {member.displayName || 'Competition Trader'}
                  </h2>
                  {isCurrentUser && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      You
                    </span>
                  )}
                  {arena.ownerId === member.userId && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Host
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    Rank #{rank}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1 truncate">
                  <span>Competition: <strong className="text-slate-700 dark:text-slate-200">{arena.name}</strong></span>
                  <span>•</span>
                  <span>Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Dashboard Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto">
            
            {/* KPI Performance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Starting Balance */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 truncate">Starting Capital</span>
                <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  ${startingBalance.toLocaleString()}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">Fixed Base</span>
              </div>

              {/* Current Equity */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 truncate">Current Equity</span>
                <p className={`text-base sm:text-xl font-bold truncate ${
                  currentEquity >= startingBalance
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  ${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Return: {returnPercent >= 0 ? `+${returnPercent.toFixed(1)}%` : `${returnPercent.toFixed(1)}%`}
                </span>
              </div>

              {/* Net P&L */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 truncate">Competition Net P&L</span>
                <p className={`text-base sm:text-xl font-bold truncate ${
                  netPnl > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                  netPnl < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700'
                }`}>
                  {netPnl > 0 ? `+$${netPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                   netPnl < 0 ? `-$${Math.abs(netPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {avgR !== 0 ? `Avg: ${avgR > 0 ? `+${avgR}R` : `${avgR}R`}` : '0 Trades'}
                </span>
              </div>

              {/* Maximum Drawdown */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 truncate">Max Drawdown</span>
                <p className={`text-base sm:text-xl font-bold truncate ${
                  maxDrawdownDollars > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {maxDrawdownDollars > 0 ? `-$${maxDrawdownDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
                </p>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {maxDrawdownPercent > 0 ? `-${maxDrawdownPercent.toFixed(2)}% peak-to-trough` : '0.00%'}
                </span>
              </div>
            </div>

            {/* Secondary KPIs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Win Rate</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">{winRate}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{winningTrades}W • {losingTrades}L {breakEvenTrades > 0 ? `• ${breakEvenTrades}BE` : ''}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Trades</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">{totalTrades}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Arena Executions</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Profit Factor</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">{profitFactor}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">${grossProfit.toLocaleString()} / ${grossLoss.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total R Return</span>
                <span className={`text-base font-bold ${
                  (member.stats?.totalR || 0) > 0 ? 'text-emerald-600' :
                  (member.stats?.totalR || 0) < 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {(member.stats?.totalR || 0) > 0 ? `+${member.stats?.totalR}R` : `${member.stats?.totalR || 0}R`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Normalized expectancy</span>
              </div>
            </div>

            {/* Interactive Competition Equity Curve */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Participant Competition Equity Curve</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Growth from starting balance (${startingBalance.toLocaleString()}) across {totalTrades} competition trades.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    Peak: ${peakEquity.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                {equityData.length > 1 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis
                        dataKey="step"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="p-3 rounded-xl bg-slate-900 text-white text-xs border border-slate-700 shadow-xl space-y-1">
                                <div className="font-bold text-indigo-300">{d.step}: {d.market}</div>
                                <div>Date: <span className="text-slate-300">{d.date}</span></div>
                                <div>P&L: <span className={d.tradePnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {d.tradePnl >= 0 ? `+$${d.tradePnl.toLocaleString()}` : `-$${Math.abs(d.tradePnl).toLocaleString()}`}
                                </span></div>
                                <div className="pt-1 border-t border-slate-800 font-semibold">
                                  Equity: <span className="text-white">${d.equity.toLocaleString()}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="equity"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fill="url(#equityGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Activity className="w-6 h-6 mb-1 text-slate-300 dark:text-slate-600" />
                    <span>No closed competition trades yet for this participant.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Participant Trade History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Competition Trade History ({totalTrades})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click any trade to inspect entry and exit charts, parameters, and post-trade learnings.
                  </p>
                </div>
              </div>

              {memberTrades.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {memberTrades.map((t, idx) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTrade(t)}
                      className="p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-xs font-mono font-bold text-slate-400 shrink-0">
                          #{idx + 1}
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                          t.direction === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
                        }`}>
                          {t.direction}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {t.market}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                              t.result === 'WIN'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : t.result === 'LOSS'
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {t.result || 'OPEN'}
                            </span>
                            {(t.entryScreenshot || t.exitScreenshot || t.screenshot) && (
                              <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                                <Camera className="w-3 h-3" /> Charts
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t.date ? format(new Date(t.date), 'MMM d, yyyy') : 'N/A'} {t.time || ''} • Entry: {t.entry ?? '-'} • SL: {t.stopLoss ?? '-'} • TP: {t.takeProfit ?? '-'} • Risk: ${t.riskAmount || 100}
                          </p>
                          {(t.learning || t.sharedNotes) && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 italic truncate mt-1 max-w-md">
                              "{t.learning || t.sharedNotes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <div className="text-right">
                          <span className={`text-xs sm:text-sm font-bold block ${
                            (t.pnl || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                            (t.pnl || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600'
                          }`}>
                            {(t.pnl || 0) > 0 ? `+$${t.pnl?.toLocaleString()}` :
                             (t.pnl || 0) < 0 ? `-$${Math.abs(t.pnl || 0).toLocaleString()}` : '$0.00'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(t.rMultiple || 0) > 0 ? `+${t.rMultiple}R` : `${t.rMultiple || 0}R`}
                          </span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 px-2 text-xs">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  No trades recorded for this participant in this arena yet.
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Scoped to Competition data • Private journal not exposed
            </span>
            <Button onClick={onClose} variant="outline" size="sm">
              Close Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Trade Detail Modal (when participant clicks on a trade) */}
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          arena={arena}
          isOpen={Boolean(selectedTrade)}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </>
  );
}
