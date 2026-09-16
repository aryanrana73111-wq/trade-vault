import React, { useState, useMemo } from 'react';
import { Arena, CompetitionTrade, ArenaMember } from '@/types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Layers,
  Activity,
  ArrowUpDown,
  Clock
} from 'lucide-react';

interface CompetitionResponsiveChartsProps {
  arena: Arena;
  trades: CompetitionTrade[];
  members: ArenaMember[];
}

type ChartType =
  | 'cumulativeR'
  | 'cumulativePnl'
  | 'drawdown'
  | 'winLoss'
  | 'tradeCount'
  | 'sessionPerf'
  | 'marketPerf'
  | 'dailyPerf';

export function CompetitionResponsiveCharts({
  arena,
  trades,
  members
}: CompetitionResponsiveChartsProps) {
  const [selectedChart, setSelectedChart] = useState<ChartType>('cumulativeR');

  const chartOptions: { key: ChartType; label: string; icon: any }[] = [
    { key: 'cumulativeR', label: 'Cumulative R', icon: TrendingUp },
    { key: 'cumulativePnl', label: 'Equity P&L ($)', icon: DollarSign },
    { key: 'drawdown', label: 'Drawdown', icon: Activity },
    { key: 'winLoss', label: 'Win / Loss Rates', icon: PieChart },
    { key: 'tradeCount', label: 'Trade Volume', icon: BarChart3 },
    { key: 'sessionPerf', label: 'Session Perf', icon: Clock },
    { key: 'marketPerf', label: 'Market Perf', icon: Layers },
    { key: 'dailyPerf', label: 'Daily Return', icon: Calendar }
  ];

  // Distinct member colors
  const memberColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'];

  // Cumulative R data
  const cumulativeRData = useMemo(() => {
    if (trades.length === 0) return [];
    const chronTrades = [...trades].sort((a, b) => a.date - b.date);
    const memberR: Record<string, number> = {};
    members.forEach((m) => { memberR[m.userId] = 0; });

    const points: any[] = [];
    chronTrades.forEach((t) => {
      const dateStr = format(new Date(t.date), 'MMM d');
      if (memberR[t.userId] !== undefined) {
        memberR[t.userId] = Number((memberR[t.userId] + (t.rMultiple || 0)).toFixed(2));
      }
      const pt: any = { name: dateStr };
      members.forEach((m) => {
        pt[m.displayName || m.userId.slice(0, 5)] = memberR[m.userId] || 0;
      });
      points.push(pt);
    });
    return points;
  }, [trades, members]);

  // Cumulative P&L data
  const cumulativePnlData = useMemo(() => {
    if (trades.length === 0) return [];
    const chronTrades = [...trades].sort((a, b) => a.date - b.date);
    const memberPnl: Record<string, number> = {};
    members.forEach((m) => { memberPnl[m.userId] = 0; });

    const points: any[] = [];
    chronTrades.forEach((t) => {
      const dateStr = format(new Date(t.date), 'MMM d');
      if (memberPnl[t.userId] !== undefined) {
        memberPnl[t.userId] = Number((memberPnl[t.userId] + (t.pnl || 0)).toFixed(2));
      }
      const pt: any = { name: dateStr };
      members.forEach((m) => {
        pt[m.displayName || m.userId.slice(0, 5)] = memberPnl[m.userId] || 0;
      });
      points.push(pt);
    });
    return points;
  }, [trades, members]);

  // Drawdown data
  const drawdownData = useMemo(() => {
    return members.map((m) => ({
      name: m.displayName || m.userId.slice(0, 6),
      drawdown: Math.abs(m.stats?.maxDrawdown || 0)
    }));
  }, [members]);

  // Win Rate data
  const winLossData = useMemo(() => {
    return members.map((m) => ({
      name: m.displayName || m.userId.slice(0, 6),
      winRate: m.stats?.winRate || 0,
      wins: m.stats?.winCount || 0,
      losses: m.stats?.lossCount || 0
    }));
  }, [members]);

  // Trade count data
  const tradeCountData = useMemo(() => {
    return members.map((m) => ({
      name: m.displayName || m.userId.slice(0, 6),
      trades: m.stats?.tradeCount || 0
    }));
  }, [members]);

  // Session Performance
  const sessionData = useMemo(() => {
    const sessions = ['London', 'New York', 'Asian'];
    return sessions.map((sess) => {
      const sessTrades = trades.filter((t) => t.session === sess);
      const totalR = sessTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0);
      return {
        session: sess,
        totalR: Number(totalR.toFixed(2)),
        trades: sessTrades.length
      };
    });
  }, [trades]);

  // Market Performance
  const marketData = useMemo(() => {
    const map: Record<string, { r: number; trades: number }> = {};
    trades.forEach((t) => {
      const m = t.market || 'Other';
      if (!map[m]) map[m] = { r: 0, trades: 0 };
      map[m].r = Number((map[m].r + (t.rMultiple || 0)).toFixed(2));
      map[m].trades++;
    });
    return Object.entries(map).map(([market, val]) => ({
      market,
      totalR: val.r,
      trades: val.trades
    }));
  }, [trades]);

  // Daily Aggregated Return
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      const d = format(new Date(t.date), 'MMM d');
      map[d] = Number(((map[d] || 0) + (t.rMultiple || 0)).toFixed(2));
    });
    return Object.entries(map).map(([date, r]) => ({
      date,
      totalR: r
    }));
  }, [trades]);

  return (
    <div className="space-y-4">
      
      {/* Chart Selector - Touch-friendly scrolling chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {chartOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedChart === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectedChart(opt.key)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 min-w-0">
        
        {/* Title */}
        <div className="mb-4 min-w-0">
          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 truncate">
            {chartOptions.find((o) => o.key === selectedChart)?.label}
          </h4>
          <p className="text-xs text-slate-500 break-words mt-0.5">
            {selectedChart === 'cumulativeR' && 'Real-time progression of risk-adjusted return (R) captured by each trader.'}
            {selectedChart === 'cumulativePnl' && 'Dollar equity trajectories for active competition members.'}
            {selectedChart === 'drawdown' && 'Peak drawdown depth across all registered participants.'}
            {selectedChart === 'winLoss' && 'Win rate percentage achieved per participant.'}
            {selectedChart === 'tradeCount' && 'Total trades logged by each participant in this arena.'}
            {selectedChart === 'sessionPerf' && 'Group R performance segmented by major trading session.'}
            {selectedChart === 'marketPerf' && 'Aggregate group returns by instrument asset class.'}
            {selectedChart === 'dailyPerf' && 'Day-by-day aggregate return generated inside the arena.'}
          </p>
        </div>

        {/* Responsive chart viewport: h-64 on mobile, h-80 on tablet/desktop */}
        <div className="h-64 sm:h-72 md:h-80 w-full">
          {trades.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 text-center px-4">
              No trades logged in this competition yet. Charts will populate dynamically as participants submit trades.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {selectedChart === 'cumulativeR' ? (
                <LineChart data={cumulativeRData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="R" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                  {members.map((m, idx) => {
                    const col = memberColors[idx % memberColors.length];
                    const key = m.displayName || m.userId.slice(0, 5);
                    return (
                      <Line
                        key={m.userId}
                        type="monotone"
                        dataKey={key}
                        stroke={col}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })}
                </LineChart>
              ) : selectedChart === 'cumulativePnl' ? (
                <LineChart data={cumulativePnlData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="$" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                  {members.map((m, idx) => {
                    const col = memberColors[idx % memberColors.length];
                    const key = m.displayName || m.userId.slice(0, 5);
                    return (
                      <Line
                        key={m.userId}
                        type="monotone"
                        dataKey={key}
                        stroke={col}
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 5 }}
                      />
                    );
                  })}
                </LineChart>
              ) : selectedChart === 'drawdown' ? (
                <BarChart data={drawdownData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="$" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="drawdown" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : selectedChart === 'winLoss' ? (
                <BarChart data={winLossData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="%" domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="winRate" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : selectedChart === 'tradeCount' ? (
                <BarChart data={tradeCountData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="trades" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : selectedChart === 'sessionPerf' ? (
                <BarChart data={sessionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="session" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="R" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="totalR" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                    {sessionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.totalR >= 0 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : selectedChart === 'marketPerf' ? (
                <BarChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="market" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="R" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="totalR" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} unit="R" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none'
                    }}
                  />
                  <Bar dataKey="totalR" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                    {dailyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.totalR >= 0 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
