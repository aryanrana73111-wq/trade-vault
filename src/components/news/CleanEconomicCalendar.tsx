import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Globe, 
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Flame,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
  RotateCcw,
  SlidersHorizontal,
  Layers,
  ChevronDown,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Check,
  Building2,
  Share2
} from 'lucide-react';
import { NormalizedEconomicEvent, EventImportance } from '@/types/normalizedCalendar';
import { getEventsForDate, getUpcomingEvents, getAllEventsForDateRange, determineEventStatus, mergeExternalEvents } from '@/services/news/economicCalendarService';
import { CurrencyBadge, COUNTRY_FLAG_MAP, CURRENCY_FULL_NAMES, CURRENCY_OPTIONS } from './CurrencyBadge';
import { EconomicEventDetailDrawer } from './calendar/EconomicEventDetailDrawer';
import { NormalizedNewsArticle } from '@/types/normalizedNews';
import { format, parseISO, differenceInMinutes, differenceInSeconds, addDays, subDays } from 'date-fns';

interface CleanEconomicCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  todayDateStr: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onOpenCalendarModal: () => void;
  articles?: NormalizedNewsArticle[];
  onSelectArticle?: (article: NormalizedNewsArticle) => void;
}

export const CALENDAR_CATEGORIES = [
  'All',
  'Inflation',
  'Labor',
  'Central Banks',
  'Manufacturing',
  'Economy',
  'Sentiment',
  'Housing',
  'Energy',
  'Commodities',
  'Trade',
  'Government'
];

export const TIMEZONE_LIST = [
  { code: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)', short: 'IST' },
  { code: 'UTC', label: 'UTC (GMT+0)', short: 'UTC' },
  { code: 'America/New_York', label: 'America/New_York (EST/EDT)', short: 'EST' },
  { code: 'Europe/London', label: 'Europe/London (GMT/BST)', short: 'GMT' },
  { code: 'Europe/Berlin', label: 'Europe/Berlin (CET)', short: 'CET' },
  { code: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)', short: 'JST' },
  { code: 'Australia/Sydney', label: 'Australia/Sydney (AEST)', short: 'AEST' },
];

export function CleanEconomicCalendar({
  selectedDate,
  todayDateStr,
  onSelectDate,
  onOpenCalendarModal,
  articles = [],
  onSelectArticle
}: CleanEconomicCalendarProps) {
  // Filters State
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [importanceFilter, setImportanceFilter] = useState<EventImportance | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Timezone & Time Format (Persisted)
  const [selectedTz, setSelectedTz] = useState<string>(() => {
    try {
      return localStorage.getItem('tradevault_calendar_tz') || 'Asia/Kolkata';
    } catch {
      return 'Asia/Kolkata';
    }
  });
  const [timeFormat24H, setTimeFormat24H] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tradevault_calendar_24h') === 'true';
    } catch {
      return false;
    }
  });

  // Saved Filter preference
  const [savedFilterName, setSavedFilterName] = useState<string | null>(() => {
    try {
      return localStorage.getItem('tradevault_saved_filter_name') || null;
    } catch {
      return null;
    }
  });

  // Drawer / Detail State
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEconomicEvent | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Live Timer for ticking countdowns
  const [ticker, setTicker] = useState<number>(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => setTicker(t => t + 1), 10000);
    return () => clearInterval(timer);
  }, []);

  const handleTzChange = (tz: string) => {
    setSelectedTz(tz);
    try {
      localStorage.setItem('tradevault_calendar_tz', tz);
    } catch {}
  };

  const handleFormatChange = (is24h: boolean) => {
    setTimeFormat24H(is24h);
    try {
      localStorage.setItem('tradevault_calendar_24h', String(is24h));
    } catch {}
  };

  // Raw events for computing accurate dynamic counts
  const rawDateEvents = useMemo(() => {
    return getAllEventsForDateRange(selectedDate);
  }, [selectedDate]);

  // Dynamic counts for Impact Buttons
  const impactCounts = useMemo(() => {
    const base = currencyFilter === 'ALL' 
      ? rawDateEvents 
      : rawDateEvents.filter(e => e.currency === currencyFilter);

    return {
      ALL: base.length,
      HIGH: base.filter(e => e.importance === 'HIGH').length,
      MEDIUM: base.filter(e => e.importance === 'MEDIUM').length,
      LOW: base.filter(e => e.importance === 'LOW').length,
      'NON-ECONOMIC': base.filter(e => e.importance === 'NON-ECONOMIC').length
    };
  }, [rawDateEvents, currencyFilter]);

  // Filtered events with Category + Currency + Impact + Search
  const filteredEvents = useMemo(() => {
    let result = getEventsForDate(selectedDate, {
      date: selectedDate,
      currency: currencyFilter,
      importance: importanceFilter,
      searchQuery
    });

    if (categoryFilter && categoryFilter !== 'All') {
      const catLower = categoryFilter.toLowerCase();
      result = result.filter(e => e.category && e.category.toLowerCase().includes(catLower));
    }

    return result;
  }, [selectedDate, currencyFilter, importanceFilter, categoryFilter, searchQuery]);

  // Next Major Upcoming Event & Today at a Glance Stats
  const todayGlanceStats = useMemo(() => {
    const now = new Date();
    const highEvents = rawDateEvents.filter(e => e.importance === 'HIGH');
    const medEvents = rawDateEvents.filter(e => e.importance === 'MEDIUM');
    const lowEvents = rawDateEvents.filter(e => e.importance === 'LOW');
    const centralBankEvents = rawDateEvents.filter(e => e.category === 'Central Banks');

    // Find next upcoming event
    const upcoming = rawDateEvents
      .filter(e => parseISO(e.dateTime).getTime() > now.getTime())
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    const nextEvent = upcoming[0] || (highEvents.length > 0 ? highEvents[0] : rawDateEvents[0]);

    let countdownStr = '—';
    if (nextEvent) {
      const diffSec = differenceInSeconds(parseISO(nextEvent.dateTime), now);
      if (diffSec > 0) {
        const hrs = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        if (hrs >= 24) {
          const days = Math.floor(hrs / 24);
          const remHrs = hrs % 24;
          countdownStr = `${days}d ${remHrs}h`;
        } else if (hrs > 0) {
          countdownStr = `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
        } else {
          countdownStr = `${mins}m`;
        }
      } else {
        const status = determineEventStatus(nextEvent);
        countdownStr = status === 'AWAITING_ACTUAL' ? 'Awaiting' : 'Released';
      }
    }

    return {
      total: rawDateEvents.length,
      high: highEvents.length,
      med: medEvents.length,
      low: lowEvents.length,
      centralBank: centralBankEvents.length,
      nextEvent,
      countdownStr
    };
  }, [rawDateEvents, ticker]);

  // Upcoming catalysts for Right Panel / Mobile bottom
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(selectedDate, 5);
  }, [selectedDate]);

  // Time format helper
  const formatEventTime = (isoString: string, fallbackTime: string) => {
    try {
      const date = parseISO(isoString);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: selectedTz,
        hour: 'numeric',
        minute: '2-digit',
        hour12: !timeFormat24H
      }).format(date);
    } catch {
      return fallbackTime;
    }
  };

  // Status & Timing badge
  const getReleaseTiming = (evt: NormalizedEconomicEvent) => {
    try {
      const status = determineEventStatus(evt);
      if (status === 'CANCELLED') {
        return { label: 'Cancelled', status: 'CANCELLED' };
      }

      const evtDate = parseISO(evt.dateTime);
      const now = new Date();
      const diffSecs = differenceInSeconds(evtDate, now);

      if (status === 'UPCOMING') {
        const totalMins = Math.max(0, Math.floor(diffSecs / 60));
        if (totalMins < 60) return { label: `In ${totalMins}m`, status: 'UPCOMING' };
        const hrs = Math.floor(totalMins / 60);
        const remMins = totalMins % 60;
        if (hrs < 24) return { label: `In ${hrs}h ${remMins}m`, status: 'UPCOMING' };
        const days = Math.floor(hrs / 24);
        const remHrs = hrs % 24;
        return { label: `In ${days}d ${remHrs}h`, status: 'UPCOMING' };
      }

      if (status === 'AWAITING_ACTUAL') {
        return { label: 'Awaiting Actual', status: 'AWAITING_ACTUAL' };
      }

      // RELEASED
      const minsAgo = Math.abs(differenceInMinutes(now, evtDate));
      if (minsAgo < 1) return { label: 'Released Just now', status: 'RELEASED' };
      if (minsAgo < 60) return { label: `Released ${minsAgo}m ago`, status: 'RELEASED' };
      const hoursAgo = Math.floor(minsAgo / 60);
      if (hoursAgo < 24) return { label: `Released ${hoursAgo}h ago`, status: 'RELEASED' };
      return { label: 'Released on schedule', status: 'RELEASED' };
    } catch {
      return { label: evt.status, status: evt.status };
    }
  };

  const formattedDate = useMemo(() => {
    try {
      return format(parseISO(selectedDate), 'dd MMMM yyyy');
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const isToday = selectedDate === todayDateStr;

  // Sync with live server API on date change
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/economic-calendar?date=${selectedDate}`)
      .then(r => r.json())
      .then(res => {
        if (isMounted && res.success && Array.isArray(res.events)) {
          mergeExternalEvents(res.events);
          setTicker(t => t + 1);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, [selectedDate]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetch(`/api/economic-calendar?date=${selectedDate}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.events)) {
          mergeExternalEvents(res.events);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLastRefreshedAt(new Date());
        setTicker(t => t + 1);
        setIsRefreshing(false);
      });
  };

  // Date Quick Steppers
  const handleStepDay = (delta: number) => {
    try {
      const d = parseISO(selectedDate);
      const nextDate = delta > 0 ? addDays(d, delta) : subDays(d, Math.abs(delta));
      onSelectDate(format(nextDate, 'yyyy-MM-dd'));
    } catch {}
  };

  // Reset Filters
  const handleResetFilters = () => {
    setCurrencyFilter('ALL');
    setImportanceFilter('ALL');
    setCategoryFilter('All');
    setSearchQuery('');
  };

  // Save current view
  const handleSaveFilter = () => {
    const name = `${currencyFilter === 'ALL' ? 'Global' : currencyFilter} Calendar (${importanceFilter})`;
    setSavedFilterName(name);
    try {
      localStorage.setItem('tradevault_saved_filter_name', name);
      localStorage.setItem('tradevault_saved_currency', currencyFilter);
      localStorage.setItem('tradevault_saved_impact', importanceFilter);
    } catch {}
  };

  const handleOpenEventDetail = (evt: NormalizedEconomicEvent) => {
    setSelectedEvent(evt);
    setIsDetailDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Date Navigation Bar (TradingView Style) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Date Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 rounded-xl p-0.5 border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => handleStepDay(-1)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-center min-w-[130px] sm:min-w-[160px]">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {isToday ? 'TODAY' : selectedDate > todayDateStr ? 'UPCOMING' : 'HISTORICAL'}
              </div>
              <div className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
                {formattedDate.toUpperCase()}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleStepDay(1)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
            <button
              type="button"
              onClick={() => onSelectDate(todayDateStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isToday
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => {
                const y = subDays(parseISO(todayDateStr), 1);
                onSelectDate(format(y, 'yyyy-MM-dd'));
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              Yesterday
            </button>

            <button
              type="button"
              onClick={() => {
                const t = addDays(parseISO(todayDateStr), 1);
                onSelectDate(format(t, 'yyyy-MM-dd'));
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              Tomorrow
            </button>

            <button
              type="button"
              onClick={onOpenCalendarModal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Custom Date</span>
            </button>
          </div>
        </div>

        {/* Timezone & Freshness Controls */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Timezone Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 font-medium">TZ:</span>
            <select
              value={selectedTz}
              onChange={(e) => handleTzChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {TIMEZONE_LIST.map((tz) => (
                <option key={tz.code} value={tz.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {/* 12H / 24H Toggle */}
          <button
            type="button"
            onClick={() => handleFormatChange(!timeFormat24H)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle 12h/24h time format"
          >
            {timeFormat24H ? '24H' : '12H'}
          </button>

          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Refresh Economic Calendar Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Trader-Friendly "TODAY AT A GLANCE" Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Total Events
          </span>
          <span className="text-xl font-black font-mono text-slate-900 dark:text-slate-100 block mt-0.5">
            {todayGlanceStats.total}
          </span>
          <span className="text-[10px] text-slate-400">All filtered releases</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            High Impact
          </span>
          <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
            {todayGlanceStats.high}
          </span>
          <span className="text-[10px] text-slate-400">Prime volatility</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Medium Impact
          </span>
          <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 block mt-0.5">
            {todayGlanceStats.med}
          </span>
          <span className="text-[10px] text-slate-400">Secondary tier</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Low Impact
          </span>
          <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">
            {todayGlanceStats.low}
          </span>
          <span className="text-[10px] text-slate-400">Baseline indicators</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            Central Bank
          </span>
          <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400 block mt-0.5">
            {todayGlanceStats.centralBank}
          </span>
          <span className="text-[10px] text-slate-400">Speeches & Rates</span>
        </div>

        {/* Next Major Event Banner */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-3.5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider opacity-85">
              <span>Next Major Catalyst</span>
              <span className="font-mono bg-white/20 px-1.5 py-0.5 rounded">{todayGlanceStats.countdownStr}</span>
            </div>
            {todayGlanceStats.nextEvent ? (
              <div className="mt-1">
                <div className="text-xs font-bold truncate">
                  {todayGlanceStats.nextEvent.currency} · {todayGlanceStats.nextEvent.event}
                </div>
                <div className="text-[10px] opacity-80 font-mono">
                  {formatEventTime(todayGlanceStats.nextEvent.dateTime, todayGlanceStats.nextEvent.time)} ({selectedTz.split('/')[1] || 'TZ'})
                </div>
              </div>
            ) : (
              <div className="text-xs mt-1">No pending releases</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Filter Bar: Currency + Impact + Category + Search */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Currency Section with Clear Flag + Name + Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              CURRENCY SELECTION
            </span>

            {currencyFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setCurrencyFilter('ALL')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset Currency (Show All)
              </button>
            )}
          </div>

          {/* Currency Horizontal Chips Grid */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {CURRENCY_OPTIONS.map((c) => {
              const isSelected = currencyFilter === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrencyFilter(c.code)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all touch-manipulation shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-label={`${c.name || c.label}, ${c.code}`}
                >
                  <span className="text-sm" role="img" aria-label={c.code}>
                    {c.flag || '🌐'}
                  </span>
                  <div className="text-left leading-tight">
                    <span className="font-mono font-bold block">{c.code}</span>
                    <span className={`text-[10px] hidden sm:block ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                      {c.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency Intelligence Bar when Currency Selected */}
        {currencyFilter !== 'ALL' && (
          <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CurrencyBadge code={currencyFilter} showFullName={true} size="md" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                Showing all events for <strong className="text-slate-900 dark:text-white">{CURRENCY_FULL_NAMES[currencyFilter] || currencyFilter}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>Today's Events: {impactCounts.ALL}</span>
              <span>•</span>
              <span className="text-rose-600">High: {impactCounts.HIGH}</span>
              <span>•</span>
              <span className="text-amber-600">Med: {impactCounts.MEDIUM}</span>
              <span>•</span>
              <span className="text-emerald-600">Low: {impactCounts.LOW}</span>
            </div>
          </div>
        )}

        {/* Impact Filter Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Impact:
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
              <button
                type="button"
                onClick={() => setImportanceFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all touch-manipulation shrink-0 ${
                  importanceFilter === 'ALL'
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                ALL {impactCounts.ALL}
              </button>

              <button
                type="button"
                onClick={() => setImportanceFilter('HIGH')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                  importanceFilter === 'HIGH'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 border border-rose-600'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-current" />
                <span>HIGH {impactCounts.HIGH}</span>
              </button>

              <button
                type="button"
                onClick={() => setImportanceFilter('MEDIUM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                  importanceFilter === 'MEDIUM'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-500'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-current" />
                <span>MEDIUM {impactCounts.MEDIUM}</span>
              </button>

              <button
                type="button"
                onClick={() => setImportanceFilter('LOW')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                  importanceFilter === 'LOW'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-600'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-current" />
                <span>LOW {impactCounts.LOW}</span>
              </button>

              <button
                type="button"
                onClick={() => setImportanceFilter('NON-ECONOMIC')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                  importanceFilter === 'NON-ECONOMIC'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-current" />
                <span>NON-ECONOMIC {impactCounts['NON-ECONOMIC']}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search economic events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Category Secondary Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {CALENDAR_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all touch-manipulation shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Layout: Calendar Table/Card View + Up Next Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Cols: Hybrid Table / Cards Feed */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                ECONOMIC CALENDAR FEED
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                onClick={handleSaveFilter}
                className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
                title="Save current filters"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save View</span>
              </button>
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="space-y-3">
              {filteredEvents.map((evt) => {
                const displayTime = formatEventTime(evt.dateTime, evt.time);
                const timing = getReleaseTiming(evt);
                const isReleased = evt.status === 'RELEASED';

                return (
                  <div
                    key={evt.id}
                    onClick={() => handleOpenEventDetail(evt)}
                    className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md cursor-pointer group space-y-3.5"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleOpenEventDetail(evt); }}
                    aria-label={`${evt.event} at ${displayTime}`}
                  >
                    {/* Top Row: Time, Currency, Impact, Status, Countdown */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Time Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-500 dark:text-slate-300" />
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{displayTime}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-300 uppercase font-bold">{selectedTz.split('/')[1] || 'TZ'}</span>
                        </div>

                        {/* Currency Badge */}
                        <CurrencyBadge code={evt.currency} size="sm" />

                        {/* Impact Indicator Badge */}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            evt.importance === 'HIGH'
                              ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/80 font-bold'
                              : evt.importance === 'MEDIUM'
                              ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80 font-bold'
                              : evt.importance === 'LOW'
                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold'
                          }`}
                        >
                          {evt.importance === 'HIGH' && <Flame className="w-3 h-3 text-current" />}
                          {evt.importance === 'MEDIUM' && <Activity className="w-3 h-3 text-current" />}
                          {evt.importance === 'LOW' && <CheckCircle2 className="w-3 h-3 text-current" />}
                          <span>{evt.importance}</span>
                        </span>

                        {evt.category && (
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 hidden sm:inline">
                            • {evt.category}
                          </span>
                        )}
                      </div>

                      {/* Right Status Pill */}
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${
                          timing.status === 'RELEASED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                            : timing.status === 'AWAITING_ACTUAL'
                            ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 animate-pulse'
                            : timing.status === 'CANCELLED'
                            ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/80'
                            : 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/80'
                        }`}>
                          {timing.status === 'RELEASED' && (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>RELEASED</span>
                            </>
                          )}
                          {timing.status === 'UPCOMING' && (
                            <>
                              <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span>UPCOMING</span>
                            </>
                          )}
                          {timing.status === 'AWAITING_ACTUAL' && (
                            <>
                              <Clock className="w-3 h-3 text-amber-500 animate-spin" />
                              <span>AWAITING ACTUAL</span>
                            </>
                          )}
                          {timing.status === 'CANCELLED' && (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              <span>CANCELLED</span>
                            </>
                          )}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 font-mono">
                          {timing.label}
                        </span>
                      </div>
                    </div>

                    {/* Event Title */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {evt.event}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0 mt-1" />
                    </div>

                    {/* Numeric Values Grid: Actual / Forecast / Previous */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-200 block">
                          Previous
                        </span>
                        <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block mt-0.5">
                          {evt.previous !== null && evt.previous !== undefined ? evt.previous : '—'}
                        </span>
                      </div>

                      <div className="p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-200 block">
                          Forecast
                        </span>
                        <span className="text-xs sm:text-sm font-black font-mono text-blue-600 dark:text-sky-300 block mt-0.5">
                          {evt.forecast !== null && evt.forecast !== undefined ? evt.forecast : '—'}
                        </span>
                      </div>

                      <div className={`p-2.5 sm:p-3 rounded-xl border shadow-2xs ${
                        isReleased && evt.actual !== null && evt.actual !== undefined
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/70 text-emerald-900 dark:text-emerald-100'
                          : 'bg-slate-50 dark:bg-slate-800/90 border-dashed border-slate-300 dark:border-slate-600'
                      }`}>
                        <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                          isReleased && evt.actual !== null && evt.actual !== undefined
                            ? 'text-emerald-800 dark:text-emerald-300'
                            : 'text-slate-600 dark:text-slate-200'
                        }`}>
                          Actual (Live)
                        </span>
                        <span className={`text-xs sm:text-sm font-black font-mono block mt-0.5 ${
                          isReleased && evt.actual !== null && evt.actual !== undefined
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-amber-600 dark:text-amber-300 text-xs font-bold'
                        }`}>
                          {isReleased && evt.actual !== null && evt.actual !== undefined ? evt.actual : 'Awaiting Release'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-xs">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 inline-block">
                <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No economic events found for this selection
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                No calendar events matched your active filters on {formattedDate}.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDate(todayDateStr)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  Go to Today
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: UP NEXT Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  UP NEXT
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Real-Time</span>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onSelectDate(evt.date);
                      handleOpenEventDetail(evt);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer space-y-1.5 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-extrabold text-slate-900 dark:text-white">{formatEventTime(evt.dateTime, evt.time)}</span>
                        <CurrencyBadge code={evt.currency} size="sm" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase border ${
                        evt.importance === 'HIGH'
                          ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-700/80'
                          : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-700/80'
                      }`}>
                        {evt.importance}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {evt.event}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-300 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/70">
                      <span>{evt.date}</span>
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                        View Event →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">
                No future scheduled events registered.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 5. Detailed Drawer Modal for Event */}
      <EconomicEventDetailDrawer
        event={selectedEvent}
        timezone={selectedTz}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        relatedArticles={articles.filter(a => selectedEvent && a.relatedMarkets?.some(m => selectedEvent.affectedMarkets?.includes(m)))}
        onSelectArticle={onSelectArticle}
      />
    </div>
  );
}
