import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '@/lib/settings';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { formatCurrency, formatNumber, dedupById } from '@/lib/utils';
import { calculateKPIs } from '@/lib/calculations';
import { calculateAdvancedKPIs, generateMonteCarlo } from '@/lib/advancedAnalytics';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell, Line
} from 'recharts';
import { 
  ArrowUpRight, ArrowDownRight, Activity, Target, TrendingUp, DollarSign, Crosshair, TrendingDown, 
  Shield, Pin, Plus, ArrowRight, GraduationCap, Zap, 
  Filter, X, SlidersHorizontal, Newspaper, BookOpenCheck,
  Clock, Globe, Sparkles, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { TradingCalendarWidget } from '@/components/dashboard/TradingCalendarWidget';
import { HighImpactNewsWidget } from '@/components/dashboard/HighImpactNewsWidget';
import { mt5ClientService } from '@/services/mt5ClientService';
import { ConnectedTradingAccount } from '@/types/mt5';
import { MT5AccountCenterModal } from '@/components/mt5/MT5AccountCenterModal';

// Safe date helpers to prevent RangeError: Invalid time value
function safeDate(d: any): number {
  if (!d) return Date.now();
  if (typeof d === 'number') return isNaN(d) ? Date.now() : d;
  if (d instanceof Date) return isNaN(d.getTime()) ? Date.now() : d.getTime();
  if (typeof d?.toMillis === 'function') return d.toMillis();
  if (typeof d?.toDate === 'function') return d.toDate().getTime();
  if (typeof d?.seconds === 'number') return d.seconds * 1000;
  const parsed = new Date(d).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

function safeFormatDate(d: any, formatStr: string = 'MMM dd'): string {
  try {
    const ts = safeDate(d);
    return format(new Date(ts), formatStr);
  } catch {
    return '-';
  }
}

// Global market sessions status helper
function getSessionStatus() {
  const now = new Date();
  const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
  // Tokyo / Asian: 00:00 - 09:00 UTC
  // London: 08:00 - 16:30 UTC
  // New York: 13:00 - 21:00 UTC
  // Overlap (London + NY): 13:00 - 16:30 UTC
  const isAsian = utcHour >= 0 && utcHour < 9;
  const isLondon = utcHour >= 8 && utcHour < 16.5;
  const isNY = utcHour >= 13 && utcHour < 21;
  const isOverlap = utcHour >= 13 && utcHour < 16.5;

  return { isAsian, isLondon, isNY, isOverlap, utcHour };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { trades: rawTrades, learnings, rules, saveTrade } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState(getSettings());
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Interactive filtering states
  const [timeRange, setTimeRange] = useState<string>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [crossFilterMarket, setCrossFilterMarket] = useState<string | null>(null);

  // Chart modes
  const [chartMode, setChartMode] = useState<'Equity' | 'Return' | 'R-Multiple'>('Equity');

  // MT5 Accounts State
  const [connectedMT5Accounts, setConnectedMT5Accounts] = useState<ConnectedTradingAccount[]>([]);
  const [isMT5ModalOpen, setIsMT5ModalOpen] = useState(false);
  const [mt5ModalInitialTab, setMt5ModalInitialTab] = useState<'connect' | 'create'>('connect');

  // Live session status
  const sessionStatus = useMemo(() => getSessionStatus(), []);

  useEffect(() => {
    const sorted = [...rawTrades].sort((a, b) => safeDate(a.date) - safeDate(b.date));
    setTrades(sorted);
    
    const handleSettingsUpdate = () => setSettings(getSettings());
    window.addEventListener('tradevault_settings_updated', handleSettingsUpdate);

    // Subscribe to MT5 connected accounts for current user
    const unsubMT5 = mt5ClientService.subscribeConnectedAccounts((list) => {
      setConnectedMT5Accounts(list);
    });

    return () => {
      window.removeEventListener('tradevault_settings_updated', handleSettingsUpdate);
      unsubMT5();
    };
  }, [rawTrades]);

  // Filtered closed trades for analytics & charts
  const filteredTrades = useMemo(() => {
    let filtered = [...trades].filter(t => t.result && t.result !== 'PENDING').sort((a, b) => safeDate(a.date) - safeDate(b.date));

    if (timeRange !== 'ALL') {
      const now = new Date();
      let cutoff = new Date(now);
      if (timeRange === '1D') cutoff.setDate(cutoff.getDate() - 1);
      if (timeRange === '1W') cutoff.setDate(cutoff.getDate() - 7);
      if (timeRange === '1M') cutoff.setMonth(cutoff.getMonth() - 1);
      if (timeRange === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
      if (timeRange === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
      if (timeRange === 'YTD') cutoff = new Date(now.getFullYear(), 0, 1);
      const cutoffTime = cutoff.getTime();
      filtered = filtered.filter(t => safeDate(t.date) >= cutoffTime);
    }

    if (selectedAccount !== 'ALL') {
      if (selectedAccount === 'MANUAL') {
        filtered = filtered.filter(t => t.tradeSource !== 'mt5');
      } else {
        filtered = filtered.filter(t => 
          t.tradingAccountId === selectedAccount || 
          t.mt5AccountId === selectedAccount ||
          (t.accountId || t.dashboardId || "Default") === selectedAccount
        );
      }
    }
    if (selectedMarket !== 'ALL') filtered = filtered.filter(t => (t.pair || t.market) === selectedMarket);
    if (selectedStrategy !== 'ALL') filtered = filtered.filter(t => t.strategy === selectedStrategy);
    if (crossFilterMarket) filtered = filtered.filter(t => (t.pair || t.market) === crossFilterMarket);

    return filtered;
  }, [trades, timeRange, selectedAccount, selectedMarket, selectedStrategy, crossFilterMarket]);

  // Overall and advanced KPIs
  const kpis = useMemo(() => calculateKPIs(trades), [trades]);
  const advKpis = useMemo(() => calculateAdvancedKPIs(filteredTrades), [filteredTrades]);

  const accounts = useMemo(() => Array.from(new Set(trades.map(t => t.accountId || t.dashboardId || "Default").filter(Boolean))), [trades]);
  const markets = useMemo(() => Array.from(new Set(trades.map(t => t.pair || t.market).filter(Boolean))), [trades]);
  const strategies = useMemo(() => Array.from(new Set(trades.map(t => t.strategy).filter(Boolean))), [trades]);

  // Advanced Equity Curve with Drawdown, Return %, and R-Multiple
  const advancedEquityData = useMemo(() => {
    let runningEquity = 0;
    let maxEquity = 0;
    let runningR = 0;
    const initialBalance = 10000;
    return filteredTrades.map((t, index) => {
      runningEquity += (t.pnl || 0);
      maxEquity = Math.max(maxEquity, runningEquity);
      runningR += (t.rMultiple || 0);
      return {
        tradeIndex: index + 1,
        name: safeFormatDate(t.date, 'MMM dd'),
        equity: runningEquity,
        drawdown: runningEquity - maxEquity,
        rMultiple: runningR,
        returnPercent: (runningEquity / initialBalance) * 100,
        pnl: t.pnl || 0,
        trade: t
      };
    });
  }, [filteredTrades]);

  // Advanced PnL Distribution histogram
  const pnlDistData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    const pnls = filteredTrades.map(t => t.pnl || 0);
    const min = Math.min(...pnls);
    const max = Math.max(...pnls);
    if (max === min) {
      return [{ range: `$${Math.round(min)}`, count: filteredTrades.length, val: min }];
    }
    const step = (max - min) / 8 || 1;
    const bins: { range: string; count: number; val: number }[] = [];
    for (let i = 0; i <= 8; i++) {
      const val = min + i * step;
      bins.push({ range: `$${Math.round(val)}`, count: 0, val });
    }
    filteredTrades.forEach(t => {
      const pnl = t.pnl || 0;
      const idx = Math.min(8, Math.max(0, Math.floor((pnl - min) / step)));
      if (bins[idx]) bins[idx].count++;
    });
    return bins.filter(b => b.count > 0 || b.val === 0);
  }, [filteredTrades]);

  // R-Multiple Distribution
  const rDistribution = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    const buckets: Record<string, number> = { '<-2R': 0, '-2R to -1R': 0, '-1R to 0R': 0, '0R to 1R': 0, '1R to 2R': 0, '>2R': 0 };
    filteredTrades.forEach(t => {
      const r = t.rMultiple || 0;
      if (r < -2) buckets['<-2R']++;
      else if (r < -1) buckets['-2R to -1R']++;
      else if (r < 0) buckets['-1R to 0R']++;
      else if (r < 1) buckets['0R to 1R']++;
      else if (r < 2) buckets['1R to 2R']++;
      else buckets['>2R']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [filteredTrades]);

  // Session Performance Heatmap data
  const sessionData = useMemo(() => {
    const sessions = ['Asian', 'London', 'New York', 'Overlap'];
    const days = [1, 2, 3, 4, 5]; // Mon to Fri
    return sessions.map(session => {
      const dayStats = days.map(day => {
        const matching = filteredTrades.filter(t => {
          const s = t.session || '';
          const matchesSession = s.toLowerCase().includes(session.toLowerCase()) || 
            (session === 'Asian' && (s.toLowerCase().includes('tokyo') || s.toLowerCase().includes('sydney')));
          const d = new Date(safeDate(t.date)).getDay();
          return matchesSession && d === day;
        });
        const pnl = matching.reduce((acc, t) => acc + (t.pnl || 0), 0);
        return { day, pnl, count: matching.length };
      });
      return { session, dayStats };
    });
  }, [filteredTrades]);

  // Strategy Attribution
  const strategyData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    const map = new Map<string, { pnl: number; count: number }>();
    filteredTrades.forEach(t => {
      const s = t.strategy || 'Discretionary';
      const cur = map.get(s) || { pnl: 0, count: 0 };
      map.set(s, { pnl: cur.pnl + (t.pnl || 0), count: cur.count + 1 });
    });
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Monte Carlo Simulation (safe 250 runs, 40 steps)
  const monteCarloData = useMemo(() => {
    if (filteredTrades.length < 3) return [];
    try {
      return generateMonteCarlo(filteredTrades, 250, 40);
    } catch {
      return [];
    }
  }, [filteredTrades]);

  // Instrument Performance table
  const instrumentData = useMemo(() => {
    if (filteredTrades.length === 0) return [];
    const map = new Map<string, { pnl: number; count: number; wins: number; r: number }>();
    filteredTrades.forEach(t => {
      const pair = t.pair || t.market || 'Unknown';
      const d = map.get(pair) || { pnl: 0, count: 0, wins: 0, r: 0 };
      d.pnl += (t.pnl || 0);
      d.count++;
      d.r += (t.rMultiple || 0);
      if ((t.pnl || 0) > 0) d.wins++;
      map.set(pair, d);
    });
    return Array.from(map.entries()).map(([pair, d]) => ({
      pair,
      pnl: d.pnl,
      count: d.count,
      wr: (d.wins / d.count) * 100,
      avgR: d.r / d.count
    })).sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Sample data seeder for first-time traders
  const handleLoadSampleTrades = async () => {
    try {
      setIsSeeding(true);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const sampleTrades = [
        {
          market: 'XAU/USD',
          pair: 'XAU/USD',
          direction: 'BUY' as const,
          entry: 2634.50,
          stopLoss: 2628.00,
          takeProfit: 2655.00,
          positionSize: 1.5,
          risk: 150,
          riskPercent: 1.5,
          strategy: 'London Breakout',
          session: 'London',
          timeframe: '15m',
          result: 'WIN' as const,
          pnl: 420.00,
          rrRatio: 3.15,
          rMultiple: 2.8,
          notes: 'High-volume expansion out of London open consolidation.',
          date: now - (5 * oneDay),
          time: '08:35'
        },
        {
          market: 'EUR/USD',
          pair: 'EUR/USD',
          direction: 'SELL' as const,
          entry: 1.0845,
          stopLoss: 1.0870,
          takeProfit: 1.0790,
          positionSize: 2.0,
          risk: 100,
          riskPercent: 1.0,
          strategy: 'FVG Retracement',
          session: 'New York',
          timeframe: '5m',
          result: 'WIN' as const,
          pnl: 220.00,
          rrRatio: 2.2,
          rMultiple: 2.2,
          notes: 'Clean reaction to 15m bearish Fair Value Gap following CPI news.',
          date: now - (4 * oneDay),
          time: '14:15'
        },
        {
          market: 'BTC/USD',
          pair: 'BTC/USD',
          direction: 'BUY' as const,
          entry: 92400,
          stopLoss: 91500,
          takeProfit: 95000,
          positionSize: 0.25,
          risk: 225,
          riskPercent: 2.0,
          strategy: 'Liquidity Sweep',
          session: 'Asian',
          timeframe: '1H',
          result: 'WIN' as const,
          pnl: 650.00,
          rrRatio: 2.88,
          rMultiple: 2.88,
          notes: 'Clean sweep of Asian range low followed by instantaneous displacement.',
          date: now - (3 * oneDay),
          time: '02:40'
        },
        {
          market: 'GBP/USD',
          pair: 'GBP/USD',
          direction: 'BUY' as const,
          entry: 1.2980,
          stopLoss: 1.2955,
          takeProfit: 1.3040,
          positionSize: 1.0,
          risk: 120,
          riskPercent: 1.2,
          strategy: 'Trend Continuation',
          session: 'London',
          timeframe: '15m',
          result: 'LOSS' as const,
          pnl: -120.00,
          rrRatio: 2.4,
          rMultiple: -1.0,
          notes: 'Stopped out during BOE rate announcement spread spike. Followed discipline.',
          date: now - (2 * oneDay),
          time: '11:05'
        },
        {
          market: 'XAU/USD',
          pair: 'XAU/USD',
          direction: 'SELL' as const,
          entry: 2658.20,
          stopLoss: 2664.00,
          takeProfit: 2642.00,
          positionSize: 1.0,
          risk: 150,
          riskPercent: 1.5,
          strategy: 'Order Block Rejection',
          session: 'New York',
          timeframe: '5m',
          result: 'WIN' as const,
          pnl: 380.00,
          rrRatio: 2.79,
          rMultiple: 2.53,
          notes: 'M15 bearish order block tapped during NY session overlap.',
          date: now - (1 * oneDay),
          time: '15:20'
        },
        {
          market: 'ETH/USD',
          pair: 'ETH/USD',
          direction: 'BUY' as const,
          entry: 3340,
          stopLoss: 3310,
          takeProfit: 3420,
          positionSize: 1.5,
          risk: 150,
          riskPercent: 1.5,
          strategy: 'Break & Retest',
          session: 'New York',
          timeframe: '15m',
          result: 'PENDING' as const,
          pnl: 0,
          rrRatio: 2.66,
          rMultiple: 0,
          notes: 'Currently active trade running in profit. Stop loss moved to breakeven.',
          date: now,
          time: '09:10'
        }
      ];

      for (const t of sampleTrades) {
        await saveTrade(t);
      }
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to load sample trades:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const hasActiveFilters = timeRange !== 'ALL' || selectedAccount !== 'ALL' || selectedMarket !== 'ALL' || selectedStrategy !== 'ALL' || crossFilterMarket !== null;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate('/settings?tab=profile')}
            className="group relative rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shrink-0"
            title="Edit Profile Settings"
          >
            <UserAvatar 
              avatarUrl={profile?.avatarUrl} 
              size="lg" 
              className="border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform"
            />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {profile?.fullName || user?.displayName || 'Trader Dashboard'}
              </h1>
              {profile?.tradingStyle && (
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wider shrink-0">
                  {profile.tradingStyle}
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 truncate">
              Institutional-grade execution journal & behavioral performance metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Global Trading Sessions & Market Hours Radar Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xs border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <Globe className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
          <span className="font-semibold text-white">Global Markets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
            sessionStatus.isAsian 
              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' 
              : 'bg-slate-800/60 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sessionStatus.isAsian ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span>Tokyo / Asian</span>
            <span className="text-[9px] opacity-70">00:00-09:00 UTC</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
            sessionStatus.isLondon 
              ? 'bg-blue-950/80 border-blue-500 text-blue-300' 
              : 'bg-slate-800/60 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sessionStatus.isLondon ? 'bg-blue-400 animate-ping' : 'bg-slate-500'}`} />
            <span>London</span>
            <span className="text-[9px] opacity-70">08:00-16:30 UTC</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
            sessionStatus.isNY 
              ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300' 
              : 'bg-slate-800/60 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sessionStatus.isNY ? 'bg-indigo-400 animate-ping' : 'bg-slate-500'}`} />
            <span>New York</span>
            <span className="text-[9px] opacity-70">13:00-21:00 UTC</span>
          </div>

          {sessionStatus.isOverlap && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-500 text-amber-300 text-[11px] font-bold animate-pulse">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>London/NY Overlap (Peak Liquidity)</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 ml-auto">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>UTC {format(new Date(), 'HH:mm')}</span>
        </div>
      </div>

      {/* First-Time Welcome / Empty State Banner */}
      {trades.length === 0 && (
        <Card className="p-5 sm:p-6 border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Welcome to Your TradeVault Operating System</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Start tracking and elevating your statistical edge today
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Log your real or paper trades to automatically generate your Equity Curves, Monte Carlo projections, R-Multiple distributions, and session heatmaps. Or load sample trades to explore all features immediately.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => navigate('/add')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log First Trade</span>
              </button>
              <button
                onClick={handleLoadSampleTrades}
                disabled={isSeeding}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Importing...' : 'Load Sample Data'}</span>
              </button>
            </div>
          </div>

          {seedSuccess && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sample trades imported successfully! Enjoy exploring your dynamic analytics below.</span>
            </div>
          )}
        </Card>
      )}

      {/* Interactive Global Time & Dimension Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl glass-card shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Range:</span>
          </div>
          <div className="flex items-center bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-0.5 border border-slate-200/80 dark:border-white/[0.08]">
            {['1D', '1W', '1M', '3M', '6M', 'YTD', 'ALL'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {crossFilterMarket && (
            <button
              type="button"
              onClick={() => setCrossFilterMarket(null)}
              className="px-2.5 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            >
              <Filter className="w-3 h-3" />
              <span>{crossFilterMarket}</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Account: All</option>
            {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
          </select>

          <select
            value={selectedMarket}
            onChange={e => setSelectedMarket(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Market: All</option>
            {markets.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select
            value={selectedStrategy}
            onChange={e => setSelectedStrategy(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 outline-none cursor-pointer focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Strategy: All</option>
            {strategies.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setTimeRange('ALL');
                setSelectedAccount('ALL');
                setSelectedMarket('ALL');
                setSelectedStrategy('ALL');
                setCrossFilterMarket(null);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Reset Filters <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 min-w-0">
        <StatCard 
          title="Net P&L" 
          value={formatCurrency(filteredTrades.length > 0 ? advKpis.netPnl : kpis.netPnl)}
          icon={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
          trend={(filteredTrades.length > 0 ? advKpis.netPnl : kpis.netPnl) >= 0 ? 'up' : 'down'}
          subtitle={hasActiveFilters ? 'Filtered Range' : 'Cumulative'}
        />
        <StatCard 
          title="Win Rate" 
          value={`${formatNumber(filteredTrades.length > 0 ? advKpis.winRate * 100 : kpis.winRate, 1)}%`}
          icon={<Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
          trend={(filteredTrades.length > 0 ? advKpis.winRate * 100 : kpis.winRate) >= 50 ? 'up' : 'down'}
          subtitle={`${filteredTrades.filter(t => (t.pnl || 0) > 0).length} wins / ${filteredTrades.length} trades`}
        />
        <StatCard 
          title="Total Trades" 
          value={filteredTrades.length.toString()}
          icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
          trend="neutral"
          subtitle={`${trades.length} recorded across all time`}
        />
        <StatCard 
          title="Profit Factor" 
          value={filteredTrades.length === 0 ? '--' : (advKpis.profitFactor >= 99 ? 'Max (No Loss)' : (advKpis.profitFactor > 0 ? formatNumber(advKpis.profitFactor, 2) : '0.00'))}
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
          trend={filteredTrades.length === 0 ? 'neutral' : (advKpis.profitFactor >= 1 ? 'up' : 'down')}
          subtitle="Gross Gains / Losses"
        />
      </div>

      {/* KPI Stats Row 2: Advanced Quant Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 min-w-0">
        <StatCard 
          title="Sharpe Ratio" 
          value={filteredTrades.length > 2 && advKpis.sharpeRatio !== 0 ? advKpis.sharpeRatio.toFixed(2) : '--'}
          icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />}
          trend={advKpis.sharpeRatio >= 1 ? 'up' : 'neutral'}
          subtitle="Risk-adjusted return"
        />
        <StatCard 
          title="Sortino Ratio" 
          value={filteredTrades.length > 2 && advKpis.sortinoRatio !== 0 ? advKpis.sortinoRatio.toFixed(2) : '--'}
          icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />}
          trend={advKpis.sortinoRatio >= 1.5 ? 'up' : 'neutral'}
          subtitle="Downside adjusted"
        />
        <StatCard 
          title="Expectancy" 
          value={filteredTrades.length > 0 ? `${advKpis.expectancy > 0 ? '+' : ''}${advKpis.expectancy.toFixed(2)}R` : '--'}
          icon={<Crosshair className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />}
          trend={advKpis.expectancy >= 0 && filteredTrades.length > 0 ? 'up' : (filteredTrades.length > 0 ? 'down' : 'neutral')}
          subtitle="Average R yield per trade"
        />
        <StatCard 
          title="Max Drawdown" 
          value={kpis.closedTradesCount > 0 ? (kpis.maxDrawdown > 0 ? `-${formatCurrency(kpis.maxDrawdown)}` : '$0.00') : '--'}
          icon={<TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />}
          trend={kpis.closedTradesCount > 0 && kpis.maxDrawdown > 0 ? 'down' : 'neutral'}
          subtitle="Peak to valley drawdown"
        />
      </div>

      {/* Row 3: Advanced Equity Curve & Rolling Performance Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {/* Advanced Equity Curve */}
        <Card className="lg:col-span-2 p-4 sm:p-6 min-w-0 w-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Advance Equity Curve</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300">
                  {chartMode}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cumulative progression with underwater drawdown tracking
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setChartMode('Equity')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartMode === 'Equity'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Equity ($)
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('Return')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartMode === 'Return'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  % Return
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('R-Multiple')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    chartMode === 'R-Multiple'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  R-Multiple
                </button>
              </div>
            </div>
          </div>

          <div className="h-[280px] sm:h-[340px] w-full min-w-0">
            {advancedEquityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={advancedEquityData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="normColorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="normColorDrawdown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }} 
                    dy={8}
                    minTickGap={25}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(val) => chartMode === 'Equity' ? `$${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}` : chartMode === 'R-Multiple' ? `${val}R` : `${val}%`}
                    dx={-5}
                    width={52}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => {
                      if (name === 'equity') return [formatCurrency(value), 'Equity'];
                      if (name === 'drawdown') return [formatCurrency(value), 'Drawdown'];
                      if (name === 'returnPercent') return [`${value.toFixed(1)}%`, 'Return %'];
                      if (name === 'rMultiple') return [`${value.toFixed(2)}R`, 'Cumulative R'];
                      return [value, name];
                    }}
                  />
                  <ReferenceLine y={0} stroke="#cbd5e1" />
                  {chartMode === 'Equity' && (
                    <Area type="monotone" dataKey="drawdown" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#normColorDrawdown)" />
                  )}
                  {chartMode === 'Equity' && (
                    <Area type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#normColorEquity)" />
                  )}
                  {chartMode === 'Return' && (
                    <Area type="monotone" dataKey="returnPercent" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#normColorEquity)" />
                  )}
                  {chartMode === 'R-Multiple' && (
                    <Area type="monotone" dataKey="rMultiple" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#normColorEquity)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <TrendingUp className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No closed trades recorded yet</p>
                <p className="text-xs text-slate-400 mt-1">Log a trade or import sample data to visualize your equity trajectory.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Rolling Performance Windows */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">Rolling Consistency</h3>
              <span className="text-[11px] text-slate-400 font-medium">PnL & Win Rate</span>
            </div>
            <div className="space-y-4">
              {[7, 14, 30, 90].map(days => {
                const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
                const period = filteredTrades.filter(t => safeDate(t.date) >= cutoff);
                const p = period.reduce((s, t) => s + (t.pnl || 0), 0);
                const wr = period.length ? (period.filter(t => (t.pnl || 0) > 0).length / period.length) * 100 : 0;
                const isPositive = p >= 0;

                return (
                  <div key={days} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300">{days} Days Rolling</span>
                      <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isPositive ? '+' : ''}{formatCurrency(p)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                        style={{ width: `${Math.min(100, Math.max(0, wr))}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span>{wr.toFixed(0)}% Win Rate</span>
                      <span>{period.length} trades</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Measures execution consistency across rolling holding periods</span>
          </div>
        </Card>
      </div>

      {/* Row 4: Advance PnL Distribution & R-Multiple Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Advance PnL Distribution Histogram */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Advance P&L Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution of profits and losses across trade outcomes</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Profit</span>
              <span className="flex items-center gap-1 text-rose-600 font-medium"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Loss</span>
            </div>
          </div>
          <div className="h-[240px] w-full min-w-0">
            {pnlDistData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val: number) => [`${val} Trades`, 'Frequency']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {pnlDistData.map((entry, index) => (
                      <Cell key={index} fill={entry.val < 0 ? '#f43f5e' : entry.val === 0 ? '#94a3b8' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Log closed trades to display distribution histogram.
              </div>
            )}
          </div>
        </Card>

        {/* R-Multiple Distribution */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">R-Multiple Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Bucket sizing by realized Risk-to-Reward multiples</p>
            </div>
          </div>
          <div className="h-[240px] w-full min-w-0">
            {rDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val: number) => [`${val} Trades`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {rDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.range.includes('-') ? '#f43f5e' : entry.range.includes('0') ? '#94a3b8' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No closed trades to display R distribution.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 5: Session Heatmap & Instrument Performance Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Session Performance Heatmap */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Session Performance Heatmap</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">P&L matrix across trading sessions and weekdays</p>
            </div>
          </div>
          <div className="flex-1 mt-1">
            <div className="grid grid-cols-6 gap-1 text-[11px] font-bold text-center mb-1.5 text-slate-400">
              <div className="text-left pl-1">Session</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div>
            </div>
            {sessionData.map(({ session, dayStats }) => (
              <div key={session} className="grid grid-cols-6 gap-1 mb-1.5">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center pl-1 truncate">{session}</div>
                {dayStats.map(({ day, pnl, count }) => {
                  const isProfit = pnl > 0;
                  const isLoss = pnl < 0;
                  const bg = isProfit 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300' 
                    : isLoss 
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 text-slate-400';

                  return (
                    <div 
                      key={day} 
                      className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer ${bg}`}
                      title={`${session} Day ${day}: ${count} trades, P&L: ${formatCurrency(pnl)}`}
                    >
                      <span>{pnl !== 0 ? (pnl > 0 ? `+$${Math.round(pnl)}` : `-$${Math.abs(Math.round(pnl))}`) : '-'}</span>
                      {count > 0 && <span className="text-[9px] font-normal opacity-70">{count} tr</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        {/* Instrument Performance Table */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Instrument Breakdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Click any row to cross-filter the dashboard</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">{instrumentData.length} pairs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5 font-semibold">Instrument</th>
                  <th className="py-2.5 font-semibold">Trades</th>
                  <th className="py-2.5 font-semibold">Win Rate</th>
                  <th className="py-2.5 font-semibold text-right">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {instrumentData.slice(0, 6).map(d => (
                  <tr 
                    key={d.pair} 
                    onClick={() => setCrossFilterMarket(crossFilterMarket === d.pair ? null : d.pair)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                      crossFilterMarket === d.pair ? 'bg-blue-50/70 dark:bg-blue-950/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2.5 text-slate-900 dark:text-slate-100 font-medium flex items-center gap-1.5">
                      <Filter className={`w-3 h-3 ${crossFilterMarket === d.pair ? 'text-blue-600' : 'text-slate-400 opacity-40'}`} />
                      <span>{d.pair}</span>
                    </td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{d.count}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-medium">{d.wr.toFixed(0)}%</td>
                    <td className={`py-2.5 text-right font-bold ${d.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {d.pnl >= 0 ? '+' : ''}{formatCurrency(d.pnl)}
                    </td>
                  </tr>
                ))}
                {instrumentData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      No instrument data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Row 6: Strategy Attribution & Monte Carlo Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Strategy Attribution */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Strategy Playbook Yield</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">P&L yield categorized by execution playbook</p>
              </div>
            </div>
            <div className="space-y-3 mt-2">
              {strategyData.length > 0 ? (
                strategyData.map(s => {
                  const isProfit = s.pnl >= 0;
                  return (
                    <div key={s.name} className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                      <div className="flex justify-between items-center text-xs font-semibold mb-1">
                        <span className="text-slate-800 dark:text-slate-200">{s.name} ({s.count} trades)</span>
                        <span className={isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                          {isProfit ? '+' : ''}{formatCurrency(s.pnl)}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                          style={{ width: '100%' }} 
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No strategy tags assigned to current filtered trades.
                </div>
              )}
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Categorized via Strategy Setup tag on each trade entry
          </div>
        </Card>

        {/* Monte Carlo Simulation */}
        <Card className="p-4 sm:p-6 min-w-0 w-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Monte Carlo Simulation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Projected forward equity bands (5th to 95th percentile)</p>
            </div>
          </div>
          <div className="h-[240px] w-full min-w-0">
            {monteCarloData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monteCarloData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.6} />
                  <XAxis dataKey="t" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val: number, name: string) => [formatCurrency(val), name === 'p50' ? 'Median Path' : name.toUpperCase()]}
                  />
                  <Area type="monotone" dataKey="p95" stroke="none" fill="#10b981" fillOpacity={0.12} />
                  <Area type="monotone" dataKey="p75" stroke="none" fill="#10b981" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="p25" stroke="none" fill="#f59e0b" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="p5" stroke="none" fill="#f43f5e" fillOpacity={0.15} />
                  <Line type="monotone" dataKey="p50" stroke="#2563eb" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Log at least 3 trades to generate forward probabilistic Monte Carlo bands.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Row 7: Trading Calendar View */}
      <TradingCalendarWidget trades={trades} />

      {/* Row 8: High-Impact News Radar */}
      <HighImpactNewsWidget />

      {/* Row 9: Secondary Insights - Daily Learning & Discipline Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {/* Today Learning Widget */}
        <Card className="p-4 sm:p-6 min-w-0 w-full">
          <div className="flex items-center justify-between mb-3 sm:mb-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpenCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">Today's Learning</h2>
            </div>
            <button
              onClick={() => navigate('/learning-rules?tab=learning')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 shrink-0"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {(() => {
            const todayStr = format(new Date(), 'yyyy-MM-dd');
            const todayLearnings = learnings.filter(l => l.dateString === todayStr);
            const latestLearning = learnings[0];

            return (
              <div className="space-y-2.5 sm:space-y-3 min-w-0">
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 min-w-0">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">Today's Insights Logged</span>
                  <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2.5 py-0.5 rounded-full shrink-0">
                    {todayLearnings.length}
                  </span>
                </div>

                {latestLearning ? (
                  <div className="p-2.5 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs min-w-0">
                    <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px] gap-2 min-w-0">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{latestLearning.category}</span>
                      <span className="shrink-0">{latestLearning.dateString || safeFormatDate(latestLearning.date || latestLearning.createdAt, 'MMM dd')}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed break-words">
                      {latestLearning.content}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No learning entry recorded yet today.
                  </p>
                )}

                <button
                  onClick={() => navigate('/learning-rules?tab=learning')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Record Daily Learning
                </button>
              </div>
            );
          })()}
        </Card>

        {/* My Rules Widget */}
        <Card className="p-4 sm:p-6 min-w-0 w-full">
          <div className="flex items-center justify-between mb-3 sm:mb-4 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">Discipline Rules</h2>
            </div>
            <button
              onClick={() => navigate('/learning-rules?tab=rules')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 shrink-0"
            >
              View Rules <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {(() => {
            const uniqueRules = dedupById(rules);
            const activeRules = uniqueRules.filter(r => r.status === 'Active');
            const pinnedRules = uniqueRules.filter(r => r.isPinned);
            const displayRules = pinnedRules.length > 0 ? pinnedRules : activeRules;

            return (
              <div className="space-y-2.5 sm:space-y-3 min-w-0">
                <div className="grid grid-cols-2 gap-2 text-center text-xs min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 min-w-0">
                    <span className="text-slate-400 block text-[10px] sm:text-[11px] truncate">Active</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate block">{activeRules.length}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 min-w-0">
                    <span className="text-amber-700 dark:text-amber-400 block text-[10px] sm:text-[11px] font-medium truncate">Pinned</span>
                    <span className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-200 truncate block">{pinnedRules.length}</span>
                  </div>
                </div>

                {displayRules.length > 0 ? (
                  <div className="space-y-1.5 min-w-0">
                    {displayRules.slice(0, 3).map(r => (
                      <div key={r.id} className="p-2 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start gap-2 text-xs min-w-0">
                        {r.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mt-0.5 shrink-0" />}
                        <p className="text-slate-800 dark:text-slate-200 line-clamp-1 flex-1 font-medium break-words">{r.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No trading rules created yet.
                  </p>
                )}

                <button
                  onClick={() => navigate('/learning-rules?tab=rules')}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors min-h-[38px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Manage Trading Rules
                </button>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* Row 10: Recent Executions */}
      <Card className="p-4 sm:p-6 min-w-0 w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">Recent Executions</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest trade journal records</p>
          </div>
          <button
            onClick={() => navigate('/journal')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1"
          >
            Full Journal <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-2.5 sm:space-y-3 min-w-0">
          {dedupById(trades).slice(-5).reverse().map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${trade.direction === 'BUY' ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300'}`}>
                    {trade.direction}
                  </span>
                  <span className="font-medium text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">{trade.market || trade.pair}</span>
                  {trade.strategy && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate hidden sm:inline-block">
                      {trade.strategy}
                    </span>
                  )}
                  {trade.session && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 truncate hidden sm:inline-block">
                      {trade.session}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {safeFormatDate(trade.date, 'MMM dd')} {trade.time || ''}
                </div>
              </div>
              <div className={`font-semibold text-xs sm:text-sm shrink-0 text-right ${trade.pnl && trade.pnl >= 0 ? 'text-green-600 dark:text-green-400' : (trade.pnl ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400')}`}>
                {trade.result === 'PENDING' ? 'Pending' : (trade.pnl && trade.pnl > 0 ? '+' : '') + formatCurrency(trade.pnl || 0)}
              </div>
            </div>
          ))}
          {trades.length === 0 && (
            <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center py-6">
              No recent executions logged yet. Click "+ Add Trade" to log your first trade!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend,
  subtitle 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  trend: 'up' | 'down' | 'neutral';
  subtitle?: string;
}) {
  return (
    <Card className="p-3.5 sm:p-5 flex flex-col justify-between min-h-[110px] sm:h-36 w-full min-w-0 overflow-hidden group hover:border-blue-400/40 dark:hover:border-blue-500/40 transition-all">
      <div className="flex justify-between items-start gap-2 min-w-0">
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</span>
        <div className="p-1.5 sm:p-2 bg-blue-500/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/15 shrink-0 group-hover:bg-blue-500/15 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex flex-col mt-2 min-w-0">
        <div className="flex items-baseline justify-between gap-1 overflow-hidden">
          <span className="text-lg sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 truncate block" title={value}>
            {value}
          </span>
          {trend !== 'neutral' && (
            <span className={`inline-flex items-center text-xs sm:text-sm font-medium shrink-0 ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5" />}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {subtitle}
          </span>
        )}
      </div>
    </Card>
  );
}
