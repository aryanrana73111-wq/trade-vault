import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  isToday 
} from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Layers, 
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface TradingCalendarWidgetProps {
  trades: Trade[];
  className?: string;
}

type MetricDisplayMode = 'pnl' | 'rmultiple' | 'winloss';

interface DaySummary {
  date: Date;
  dateKey: string;
  trades: Trade[];
  totalTrades: number;
  closedTrades: Trade[];
  wins: number;
  losses: number;
  be: number;
  pending: number;
  netPnl: number;
  netR: number;
  winRate: number;
  isProfitDay: boolean;
  isLossDay: boolean;
  isBeDay: boolean;
}

export const TradingCalendarWidget: React.FC<TradingCalendarWidgetProps> = ({ trades = [], className = '' }) => {
  const navigate = useNavigate();

  // Determine initial month based on latest recorded trade or current date
  const latestTradeDate = useMemo(() => {
    if (!trades || trades.length === 0) return new Date();
    const validDates = trades
      .map(t => (t?.date ? new Date(t.date).getTime() : NaN))
      .filter(t => !isNaN(t));
    if (validDates.length === 0) return new Date();
    return new Date(Math.max(...validDates));
  }, [trades]);

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    // If there are trades in current real-world month, show current, else latest trade month
    const now = new Date();
    const hasTradesCurrentMonth = trades.some(t => {
      if (!t?.date) return false;
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return hasTradesCurrentMonth ? now : latestTradeDate;
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [metricMode, setMetricMode] = useState<MetricDisplayMode>('pnl');
  const [showWeeklyTotals, setShowWeeklyTotals] = useState<boolean>(true);

  // Group trades by "yyyy-MM-dd"
  const tradesByDate = useMemo(() => {
    const map = new Map<string, Trade[]>();
    for (const trade of trades) {
      if (!trade?.date) continue;
      const d = new Date(trade.date);
      if (isNaN(d.getTime())) continue;
      const key = format(d, 'yyyy-MM-dd');
      const existing = map.get(key) || [];
      existing.push(trade);
      map.set(key, existing);
    }
    return map;
  }, [trades]);

  // Days for the selected month grid (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Aggregate day statistics helper
  const getDaySummary = (day: Date): DaySummary => {
    const key = format(day, 'yyyy-MM-dd');
    const dayTrades = tradesByDate.get(key) || [];
    const closed = dayTrades.filter(t => t.result && t.result !== 'PENDING');
    
    let wins = 0;
    let losses = 0;
    let be = 0;
    let pending = 0;
    let netPnl = 0;
    let netR = 0;

    for (const t of dayTrades) {
      if (t.result === 'WIN') wins++;
      else if (t.result === 'LOSS') losses++;
      else if (t.result === 'BREAK EVEN' || (t.result as string) === 'BE') be++;
      else pending++;

      if (typeof t.pnl === 'number' && !isNaN(t.pnl)) {
        netPnl += t.pnl;
      }
      if (typeof t.rMultiple === 'number' && !isNaN(t.rMultiple)) {
        netR += t.rMultiple;
      } else if (t.risk && t.risk > 0 && typeof t.pnl === 'number') {
        netR += t.pnl / t.risk;
      }
    }

    const closedCount = wins + losses + be;
    const winRate = closedCount > 0 ? (wins / (wins + losses)) * 100 : 0;
    const isProfitDay = closedCount > 0 && netPnl > 0;
    const isLossDay = closedCount > 0 && netPnl < 0;
    const isBeDay = closedCount > 0 && netPnl === 0;

    return {
      date: day,
      dateKey: key,
      trades: dayTrades,
      totalTrades: dayTrades.length,
      closedTrades: closed,
      wins,
      losses,
      be,
      pending,
      netPnl,
      netR,
      winRate: isNaN(winRate) ? 0 : winRate,
      isProfitDay,
      isLossDay,
      isBeDay,
    };
  };

  // Monthly aggregated statistics
  const monthlyStats = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start, end });

    let totalMonthPnl = 0;
    let totalMonthR = 0;
    let totalMonthTrades = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalBe = 0;
    let greenDays = 0;
    let redDays = 0;
    let beDays = 0;

    let bestDay: { date: Date; pnl: number } | null = null;
    let worstDay: { date: Date; pnl: number } | null = null;

    for (const day of monthDays) {
      const summary = getDaySummary(day);
      if (summary.totalTrades > 0) {
        totalMonthTrades += summary.totalTrades;
        totalMonthPnl += summary.netPnl;
        totalMonthR += summary.netR;
        totalWins += summary.wins;
        totalLosses += summary.losses;
        totalBe += summary.be;

        if (summary.isProfitDay) greenDays++;
        else if (summary.isLossDay) redDays++;
        else if (summary.isBeDay) beDays++;

        if (summary.closedTrades.length > 0) {
          if (!bestDay || summary.netPnl > bestDay.pnl) {
            bestDay = { date: day, pnl: summary.netPnl };
          }
          if (!worstDay || summary.netPnl < worstDay.pnl) {
            worstDay = { date: day, pnl: summary.netPnl };
          }
        }
      }
    }

    const closedTradesTotal = totalWins + totalLosses;
    const monthWinRate = closedTradesTotal > 0 ? (totalWins / closedTradesTotal) * 100 : 0;
    const activeTradingDays = greenDays + redDays + beDays;
    const avgDailyPnl = activeTradingDays > 0 ? totalMonthPnl / activeTradingDays : 0;

    return {
      totalMonthPnl,
      totalMonthR,
      totalMonthTrades,
      totalWins,
      totalLosses,
      totalBe,
      monthWinRate,
      greenDays,
      redDays,
      beDays,
      activeTradingDays,
      avgDailyPnl,
      bestDay,
      worstDay,
    };
  }, [currentMonth, tradesByDate]);

  // Split calendar days into week rows (7 days each)
  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      rows.push(calendarDays.slice(i, i + 7));
    }
    return rows;
  }, [calendarDays]);

  // Selected day summary
  const selectedDaySummary = useMemo(() => {
    if (!selectedDate) return null;
    return getDaySummary(selectedDate);
  }, [selectedDate, tradesByDate]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleJumpToLatest = () => {
    setCurrentMonth(latestTradeDate);
    setSelectedDate(latestTradeDate);
  };

  // Weekday column titles
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className={`p-5 sm:p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Trading Calendar
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Daily Activity & Performance
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualize trade density, daily profit/loss, and discipline rhythm across each calendar month.
            </p>
          </div>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setMetricMode('pnl')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'pnl'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              $ P&L
            </button>
            <button
              onClick={() => setMetricMode('rmultiple')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'rmultiple'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              R-Multiple
            </button>
            <button
              onClick={() => setMetricMode('winloss')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricMode === 'winloss'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              W/L
            </button>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2 min-w-[110px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>

            <button
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            Today
          </button>

          {/* Toggle Weekly Totals */}
          <button
            onClick={() => setShowWeeklyTotals(!showWeeklyTotals)}
            className={`p-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 ${
              showWeeklyTotals
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300'
                : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
            }`}
            title="Toggle Weekly Totals Column"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Weekly Totals</span>
          </button>
        </div>
      </div>

      {/* Monthly Performance Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 py-4">
        {/* Net Month P&L */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Month Net P&L
            {monthlyStats.totalMonthPnl >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
          </span>
          <div className="mt-1">
            <span className={`text-base sm:text-lg font-bold ${
              monthlyStats.totalMonthPnl > 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : monthlyStats.totalMonthPnl < 0 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : 'text-slate-900 dark:text-slate-100'
            }`}>
              {monthlyStats.totalMonthPnl > 0 ? '+' : ''}{formatCurrency(monthlyStats.totalMonthPnl)}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {monthlyStats.totalMonthR > 0 ? '+' : ''}{formatNumber(monthlyStats.totalMonthR, 1)}R realized
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Win Rate
            <Target className="w-3.5 h-3.5 text-blue-500" />
          </span>
          <div className="mt-1">
            <span className={`text-base sm:text-lg font-bold ${
              monthlyStats.monthWinRate >= 50 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : monthlyStats.totalMonthTrades > 0 
                  ? 'text-rose-600 dark:text-rose-400' 
                  : 'text-slate-900 dark:text-slate-100'
            }`}>
              {monthlyStats.totalMonthTrades > 0 ? `${formatNumber(monthlyStats.monthWinRate, 1)}%` : '--'}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {monthlyStats.totalWins}W • {monthlyStats.totalLosses}L {monthlyStats.totalBe > 0 ? `• ${monthlyStats.totalBe}BE` : ''}
            </div>
          </div>
        </div>

        {/* Day Ratio (Green vs Red Days) */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Day Ratio
            <Activity className="w-3.5 h-3.5 text-amber-500" />
          </span>
          <div className="mt-1">
            <div className="flex items-center gap-1.5 text-base sm:text-lg font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">{monthlyStats.greenDays}G</span>
              <span className="text-slate-400 text-xs">/</span>
              <span className="text-rose-600 dark:text-rose-400">{monthlyStats.redDays}R</span>
              {monthlyStats.beDays > 0 && (
                <>
                  <span className="text-slate-400 text-xs">/</span>
                  <span className="text-slate-600 dark:text-slate-400 text-xs">{monthlyStats.beDays}BE</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {monthlyStats.activeTradingDays} active trading days
            </div>
          </div>
        </div>

        {/* Total Trades */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Total Trades
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
          </span>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {monthlyStats.totalMonthTrades}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {monthlyStats.activeTradingDays > 0 
                ? `${formatNumber(monthlyStats.totalMonthTrades / monthlyStats.activeTradingDays, 1)} / active day` 
                : 'No recorded trades'}
            </div>
          </div>
        </div>

        {/* Best Day */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Best Day
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          </span>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {monthlyStats.bestDay && monthlyStats.bestDay.pnl > 0 
                ? `+${formatCurrency(monthlyStats.bestDay.pnl)}` 
                : '--'}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {monthlyStats.bestDay ? format(monthlyStats.bestDay.date, 'EEE, MMM d') : 'None'}
            </div>
          </div>
        </div>

        {/* Worst Day */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
            Worst Day
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
          </span>
          <div className="mt-1">
            <span className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">
              {monthlyStats.worstDay && monthlyStats.worstDay.pnl < 0 
                ? formatCurrency(monthlyStats.worstDay.pnl) 
                : '--'}
            </span>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {monthlyStats.worstDay ? format(monthlyStats.worstDay.date, 'EEE, MMM d') : 'None'}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="mt-2 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/50">
        {/* Weekdays Header */}
        <div className={`grid ${showWeeklyTotals ? 'grid-cols-8' : 'grid-cols-7'} bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-semibold text-slate-600 dark:text-slate-300 py-2.5`}>
          {weekDays.map(day => (
            <div key={day} className="tracking-wide">
              {day}
            </div>
          ))}
          {showWeeklyTotals && (
            <div className="text-blue-700 dark:text-blue-400 font-bold bg-blue-50/70 dark:bg-blue-950/40 border-l border-slate-200 dark:border-slate-800">
              Week Total
            </div>
          )}
        </div>

        {/* Calendar Weeks */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {weeks.map((week, weekIdx) => {
            // Calculate week totals
            let weekPnl = 0;
            let weekTrades = 0;
            let weekWins = 0;
            let weekLosses = 0;

            for (const day of week) {
              // Only sum days that belong to current month or all days in week? Standard: sum all trades in this calendar week
              const summary = getDaySummary(day);
              weekPnl += summary.netPnl;
              weekTrades += summary.totalTrades;
              weekWins += summary.wins;
              weekLosses += summary.losses;
            }

            return (
              <div 
                key={weekIdx} 
                className={`grid ${showWeeklyTotals ? 'grid-cols-8' : 'grid-cols-7'} divide-x divide-slate-200 dark:divide-slate-800`}
              >
                {week.map(day => {
                  const summary = getDaySummary(day);
                  const inCurrentMonth = isSameMonth(day, currentMonth);
                  const isCurrentDay = isToday(day);
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const hasTrades = summary.totalTrades > 0;

                  // Determine cell background styling based on profit / loss
                  let cellBg = 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60';
                  let borderAccent = '';

                  if (hasTrades) {
                    if (summary.isProfitDay) {
                      cellBg = 'bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40';
                      borderAccent = 'border-l-2 border-l-emerald-500';
                    } else if (summary.isLossDay) {
                      cellBg = 'bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-900/40';
                      borderAccent = 'border-l-2 border-l-rose-500';
                    } else if (summary.isBeDay) {
                      cellBg = 'bg-slate-100/70 hover:bg-slate-200/70 dark:bg-slate-800/40 dark:hover:bg-slate-800/70';
                      borderAccent = 'border-l-2 border-l-slate-400';
                    }
                  }

                  if (!inCurrentMonth) {
                    cellBg = 'bg-slate-50/60 dark:bg-slate-900/30 opacity-40 hover:opacity-90';
                  }

                  if (isSelected) {
                    cellBg = `${cellBg} ring-2 ring-blue-500 dark:ring-blue-400 z-10`;
                  }

                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => {
                        setSelectedDate(prev => (prev && isSameDay(prev, day) ? null : day));
                      }}
                      className={`relative flex flex-col justify-between p-2 sm:p-2.5 min-h-[86px] sm:min-h-[102px] text-left transition-all cursor-pointer ${cellBg} ${borderAccent} focus:outline-none`}
                    >
                      {/* Top Row: Date Number & Trade Count Badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs font-semibold rounded-md px-1.5 py-0.5 ${
                          isCurrentDay
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : inCurrentMonth
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {format(day, 'd')}
                        </span>

                        {hasTrades && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                            summary.isProfitDay
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                              : summary.isLossDay
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                                : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          }`}>
                            {summary.totalTrades}T
                          </span>
                        )}
                      </div>

                      {/* Center Metric Display */}
                      <div className="my-auto py-1">
                        {hasTrades ? (
                          <>
                            {metricMode === 'pnl' && (
                              <div className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                                summary.netPnl > 0 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : summary.netPnl < 0 
                                    ? 'text-rose-600 dark:text-rose-400' 
                                    : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {summary.netPnl > 0 ? '+' : ''}{formatCurrency(summary.netPnl)}
                              </div>
                            )}

                            {metricMode === 'rmultiple' && (
                              <div className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                                summary.netR > 0 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : summary.netR < 0 
                                    ? 'text-rose-600 dark:text-rose-400' 
                                    : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {summary.netR > 0 ? '+' : ''}{formatNumber(summary.netR, 2)}R
                              </div>
                            )}

                            {metricMode === 'winloss' && (
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                <span className="text-emerald-600 dark:text-emerald-400">{summary.wins}W</span>
                                <span className="text-slate-400 mx-0.5">-</span>
                                <span className="text-rose-600 dark:text-rose-400">{summary.losses}L</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="h-4" />
                        )}
                      </div>

                      {/* Bottom Row: Win / Loss Dots indicator */}
                      <div className="flex items-center justify-between w-full pt-1">
                        {hasTrades ? (
                          <div className="flex items-center gap-1 overflow-hidden max-w-full">
                            {summary.trades.slice(0, 4).map((t, idx) => (
                              <span
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  t.result === 'WIN'
                                    ? 'bg-emerald-500'
                                    : t.result === 'LOSS'
                                      ? 'bg-rose-500'
                                      : (t.result === 'BREAK EVEN' || (t.result as string) === 'BE')
                                        ? 'bg-amber-400'
                                        : 'bg-slate-300 dark:bg-slate-600'
                                }`}
                              />
                            ))}
                            {summary.trades.length > 4 && (
                              <span className="text-[9px] text-slate-400 font-medium">
                                +{summary.trades.length - 4}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="h-2" />
                        )}

                        {hasTrades && summary.closedTrades.length > 0 && (
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 hidden sm:inline">
                            {formatNumber(summary.winRate, 0)}%
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Week Total Column */}
                {showWeeklyTotals && (
                  <div className="p-2 sm:p-2.5 flex flex-col justify-between bg-blue-50/30 dark:bg-blue-950/20 text-right min-h-[86px] sm:min-h-[102px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      W{weekIdx + 1}
                    </span>

                    <div className="my-auto py-1">
                      {weekTrades > 0 ? (
                        <>
                          <div className={`text-xs sm:text-sm font-extrabold truncate ${
                            weekPnl > 0 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : weekPnl < 0 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {weekPnl > 0 ? '+' : ''}{formatCurrency(weekPnl)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {weekWins}W • {weekLosses}L
                          </div>
                        </>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">No trades</div>
                      )}
                    </div>

                    <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {weekTrades > 0 ? `${weekTrades} trades` : ''}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800" />
            <span>Profitable Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-100 border border-rose-300 dark:bg-rose-950/60 dark:border-rose-800" />
            <span>Loss Day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700" />
            <span>Breakeven / Neutral</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Today</span>
          </div>
        </div>

        {monthlyStats.totalMonthTrades === 0 && trades.length > 0 && (
          <button
            onClick={handleJumpToLatest}
            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Jump to latest recorded trading month ({format(latestTradeDate, 'MMM yyyy')})</span>
          </button>
        )}
      </div>

      {/* Day Details Drawer / Expansion (Shown when a date is selected) */}
      {selectedDate && selectedDaySummary && (
        <div className="mt-5 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/60 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base">
                {format(selectedDate, 'dd')}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedDaySummary.totalTrades > 0
                    ? `${selectedDaySummary.totalTrades} recorded trades • ${selectedDaySummary.wins} Wins • ${selectedDaySummary.losses} Losses`
                    : 'No trading activity logged for this date'}
                </p>
              </div>
            </div>

            {/* Daily summary metrics */}
            <div className="flex items-center gap-4">
              {selectedDaySummary.totalTrades > 0 && (
                <div className="text-right">
                  <div className={`text-lg font-extrabold ${
                    selectedDaySummary.netPnl > 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : selectedDaySummary.netPnl < 0 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {selectedDaySummary.netPnl > 0 ? '+' : ''}{formatCurrency(selectedDaySummary.netPnl)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedDaySummary.netR > 0 ? '+' : ''}{formatNumber(selectedDaySummary.netR, 2)}R Realized
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                aria-label="Close day view"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trade List on Selected Day */}
          {selectedDaySummary.totalTrades > 0 ? (
            <div className="mt-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Executions on {format(selectedDate, 'MMM d')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {selectedDaySummary.trades.map(trade => (
                  <div
                    key={trade.id}
                    onClick={() => navigate(`/journal?search=${encodeURIComponent(trade.market || '')}`)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          trade.direction === 'BUY' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {trade.direction}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {trade.market}
                        </span>
                        {trade.time && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {trade.time}
                          </span>
                        )}
                      </div>

                      {/* Result / PnL */}
                      <div className="text-right">
                        <div className={`text-sm font-bold ${
                          trade.pnl && trade.pnl > 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : trade.pnl && trade.pnl < 0 
                              ? 'text-rose-600 dark:text-rose-400' 
                              : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {trade.result === 'PENDING'
                            ? 'Pending'
                            : (trade.pnl && trade.pnl > 0 ? '+' : '') + formatCurrency(trade.pnl || 0)}
                        </div>
                        {typeof trade.rMultiple === 'number' && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            {trade.rMultiple > 0 ? '+' : ''}{formatNumber(trade.rMultiple, 2)}R
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta info tags: strategy, session, emotions */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      {trade.session && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {trade.session}
                        </span>
                      )}
                      {trade.strategy && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">
                          {trade.strategy}
                        </span>
                      )}
                      {trade.result && (
                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          trade.result === 'WIN'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : trade.result === 'LOSS'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {trade.result}
                        </span>
                      )}
                      {trade.notes && (
                        <span className="italic text-[11px] text-slate-400 truncate max-w-[180px]">
                          "{trade.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => navigate('/journal')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Journal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>No trades were executed or logged on {format(selectedDate, 'MMMM d, yyyy')}.</span>
              </div>
              <button
                onClick={() => navigate(`/add?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Trade for this Date</span>
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
