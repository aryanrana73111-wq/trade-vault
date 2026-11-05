import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Input';
import { CurrencyBadge } from '@/components/news/CurrencyBadge';
import { getEventsForDate, determineEventStatus } from '@/services/news/economicCalendarService';
import { getArticlesForDate } from '@/services/news/liveNewsAggregator';
import { NormalizedEconomicEvent } from '@/types/normalizedCalendar';
import { NormalizedNewsArticle } from '@/types/normalizedNews';
import { getArticleIndicatorData, formatReleaseTiming } from '@/lib/economicIndicatorMatcher';
import { format, parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { 
  Flame, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  RefreshCw,
  Radio,
  SlidersHorizontal,
  Newspaper,
  Calendar,
  AlertCircle,
  Globe,
  Sparkles,
  TrendingUp
} from 'lucide-react';

export function HighImpactNewsWidget() {
  const navigate = useNavigate();

  // Determine current today's date in local YYYY-MM-DD
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Formatted date string for header
  const formattedTodayHeader = useMemo(() => {
    try {
      return format(new Date(), 'EEEE, MMMM d, yyyy');
    } catch {
      return todayDateStr;
    }
  }, [todayDateStr]);

  // Tab: 'releases' (Today's Economic Indicators) | 'news' (Today's Live Wire Stories)
  const [activeTab, setActiveTab] = useState<'releases' | 'news'>('releases');
  const [selectedImpact, setSelectedImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const [tickerClock, setTickerClock] = useState<number>(0);

  // Live data states
  const [todayEvents, setTodayEvents] = useState<NormalizedEconomicEvent[]>([]);
  const [todayArticles, setTodayArticles] = useState<NormalizedNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User timezone from localStorage
  const userTimezone = useMemo(() => {
    try {
      return localStorage.getItem('tradevault_calendar_tz') || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    } catch {
      return 'UTC';
    }
  }, []);

  // Fetch strictly today's events and articles
  const loadTodayData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // 1. Fetch strictly today's economic calendar events
      const events = getEventsForDate(todayDateStr);
      setTodayEvents(events);

      // 2. Fetch strictly today's aggregated market news articles
      const articles = await getArticlesForDate(todayDateStr);
      setTodayArticles(articles);
    } catch (err) {
      console.warn('HighImpactNewsWidget failed to load today data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [todayDateStr]);

  // Initial load
  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  // Live ticking clock for status/countdowns every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerClock(t => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advancing Breaking Ticker every 4 seconds
  useEffect(() => {
    if (todayArticles.length === 0) return;
    const ticker = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % todayArticles.length);
    }, 4500);
    return () => clearInterval(ticker);
  }, [todayArticles.length]);

  // Filtered Events for Today
  const filteredEvents = useMemo(() => {
    let list = [...todayEvents];
    if (selectedImpact !== 'ALL') {
      list = list.filter(e => e.importance === selectedImpact);
    }
    if (selectedCurrency !== 'ALL') {
      list = list.filter(e => e.currency === selectedCurrency);
    }
    return list;
  }, [todayEvents, selectedImpact, selectedCurrency]);

  // Filtered Articles for Today
  const filteredArticles = useMemo(() => {
    let list = [...todayArticles];
    if (selectedImpact !== 'ALL') {
      list = list.filter(a => a.impact === selectedImpact);
    }
    if (selectedCurrency !== 'ALL') {
      list = list.filter(a => a.relatedMarkets?.some(m => m.toUpperCase().includes(selectedCurrency)));
    }
    return list;
  }, [todayArticles, selectedImpact, selectedCurrency]);

  // Dynamic impact counts for buttons
  const eventCounts = useMemo(() => ({
    all: todayEvents.length,
    high: todayEvents.filter(e => e.importance === 'HIGH').length,
    medium: todayEvents.filter(e => e.importance === 'MEDIUM').length,
    low: todayEvents.filter(e => e.importance === 'LOW').length,
  }), [todayEvents]);

  // Format event time safely
  const formatEventTime = (dateTimeStr: string, timeStr?: string) => {
    try {
      const d = parseISO(dateTimeStr);
      return new Intl.DateTimeFormat('en-US', {
        timeZone: userTimezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(d);
    } catch {
      return timeStr || '—';
    }
  };

  // Get dynamic release timing badge for an event
  const getEventTiming = (evt: NormalizedEconomicEvent) => {
    const status = determineEventStatus(evt);
    const now = new Date();
    const eventDate = parseISO(evt.dateTime);
    const diffMins = differenceInMinutes(eventDate, now);

    if (status === 'RELEASED') {
      const elapsedMins = Math.abs(diffMins);
      const label = elapsedMins < 60 ? `${elapsedMins}m ago` : `${Math.floor(elapsedMins / 60)}h ago`;
      return { status: 'RELEASED', label: `Released ${label}`, badgeClass: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80' };
    }

    if (status === 'AWAITING_ACTUAL') {
      return { status: 'AWAITING_ACTUAL', label: 'Awaiting Actual', badgeClass: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 animate-pulse' };
    }

    if (diffMins <= 0) {
      return { status: 'LIVE', label: 'Releasing Now', badgeClass: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/80 animate-pulse' };
    }

    if (diffMins < 60) {
      return { status: 'UPCOMING', label: `In ${diffMins}m`, badgeClass: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700/80' };
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { status: 'UPCOMING', label: `In ${hours}h ${mins}m`, badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
  };

  // Sliced items based on expanded state
  const displayedEvents = isExpanded ? filteredEvents : filteredEvents.slice(0, 4);
  const displayedArticles = isExpanded ? filteredArticles : filteredArticles.slice(0, 4);

  // Active breaking story for top ticker
  const activeBreakingStory = todayArticles[tickerIndex] || todayArticles[0];

  return (
    <Card className="p-4 sm:p-6 w-full min-w-0 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
      {/* 1. Header with Live Pulse + Title + Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shrink-0 shadow-2xs relative">
            <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                Today's Live Market Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {formattedTodayHeader} • {todayEvents.length} Economic Releases & {todayArticles.length} Market Stories
            </p>
          </div>
        </div>

        {/* Tab Switcher & Live Refresh */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('releases')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'releases'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Releases ({todayEvents.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('news')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'news'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Market News ({todayArticles.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadTodayData(true)}
            disabled={isRefreshing}
            title="Refresh Today's News"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-blue-600 dark:text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Real-Time Breaking News Ticker Bar */}
      {activeBreakingStory && (
        <div 
          onClick={() => navigate(`/news?date=${todayDateStr}`)}
          className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 flex items-center justify-between gap-3 shadow-xs cursor-pointer hover:border-blue-500/60 transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              BREAKING TODAY
            </span>
            <span className="text-xs font-semibold text-slate-200 truncate group-hover:text-blue-300 transition-colors">
              {activeBreakingStory.headline}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-slate-400 text-xs font-mono">
            <span className="hidden md:inline text-[11px] font-bold text-slate-400">
              {activeBreakingStory.sourceName}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      )}

      {/* 3. Impact & Currency Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none touch-pan-x">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Impact:
          </span>
          <button
            type="button"
            onClick={() => setSelectedImpact('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedImpact === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({eventCounts.all})
          </button>
          <button
            type="button"
            onClick={() => setSelectedImpact('HIGH')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
              selectedImpact === 'HIGH'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/80 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3 h-3 text-current" />
            <span>High ({eventCounts.high})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedImpact('MEDIUM')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
              selectedImpact === 'MEDIUM'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80 hover:bg-amber-100'
            }`}
          >
            <Activity className="w-3 h-3 text-current" />
            <span>Medium ({eventCounts.medium})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedImpact('LOW')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
              selectedImpact === 'LOW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-current" />
            <span>Low ({eventCounts.low})</span>
          </button>
        </div>

        {/* Currency Quick Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Currency:</span>
          {['ALL', 'USD', 'EUR', 'CAD', 'JPY'].map(curr => (
            <button
              key={curr}
              type="button"
              onClick={() => setSelectedCurrency(curr)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                selectedCurrency === curr
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Body Content: Tab 1 (Economic Releases) vs Tab 2 (Market News Stories) */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <RefreshCw className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Connecting to live market wire & economic indicators...</p>
        </div>
      ) : activeTab === 'releases' ? (
        /* ================= TAB 1: TODAY'S ECONOMIC RELEASES ================= */
        <div className="space-y-3">
          {displayedEvents.map((evt) => {
            const timing = getEventTiming(evt);
            const timeLabel = formatEventTime(evt.dateTime, evt.time);

            return (
              <div
                key={evt.id}
                onClick={() => navigate(`/news?tab=calendar&date=${todayDateStr}`)}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-850 hover:border-blue-500/70 dark:hover:border-blue-500/60 transition-all cursor-pointer group shadow-2xs space-y-3"
              >
                {/* Top Row: Time, Currency, Impact, Real-time Status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Time Badge */}
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeLabel}</span>
                    </div>

                    {/* Currency Badge */}
                    <CurrencyBadge code={evt.currency} size="sm" />

                    {/* Impact Indicator */}
                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      evt.importance === 'HIGH'
                        ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/80'
                        : evt.importance === 'MEDIUM'
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80'
                        : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80'
                    }`}>
                      {evt.importance === 'HIGH' && <Flame className="w-3 h-3" />}
                      {evt.importance === 'MEDIUM' && <Activity className="w-3 h-3" />}
                      {evt.importance === 'LOW' && <CheckCircle2 className="w-3 h-3" />}
                      <span>{evt.importance}</span>
                    </span>

                    {evt.category && (
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden md:inline">
                        • {evt.category}
                      </span>
                    )}
                  </div>

                  {/* Timing & Live Status Pill */}
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${timing.badgeClass}`}>
                      {timing.status === 'RELEASED' && <CheckCircle2 className="w-3 h-3" />}
                      {timing.status === 'UPCOMING' && <Clock className="w-3 h-3" />}
                      {timing.status === 'AWAITING_ACTUAL' && <Clock className="w-3 h-3 text-amber-500 animate-spin" />}
                      <span>{timing.label}</span>
                    </span>
                  </div>
                </div>

                {/* Event Name */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {evt.event}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {/* Economic Figures: Previous, Forecast, Actual */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2 bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 block">
                      Previous
                    </span>
                    <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block mt-0.5">
                      {evt.previous !== null && evt.previous !== undefined ? evt.previous : '—'}
                    </span>
                  </div>

                  <div className="p-2 bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300 block">
                      Forecast
                    </span>
                    <span className="text-xs sm:text-sm font-black font-mono text-blue-600 dark:text-sky-300 block mt-0.5">
                      {evt.forecast !== null && evt.forecast !== undefined ? evt.forecast : '—'}
                    </span>
                  </div>

                  <div className={`p-2 rounded-lg border shadow-2xs ${
                    timing.status === 'RELEASED' && evt.actual !== null && evt.actual !== undefined
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/70 text-emerald-900 dark:text-emerald-100'
                      : 'bg-white dark:bg-slate-800/90 border-dashed border-slate-300 dark:border-slate-600'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      timing.status === 'RELEASED' && evt.actual !== null && evt.actual !== undefined
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-slate-500 dark:text-slate-300'
                    }`}>
                      Actual (Live)
                    </span>
                    <span className={`text-xs sm:text-sm font-black font-mono block mt-0.5 ${
                      timing.status === 'RELEASED' && evt.actual !== null && evt.actual !== undefined
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-amber-600 dark:text-amber-300 text-xs font-bold'
                    }`}>
                      {timing.status === 'RELEASED' && evt.actual !== null && evt.actual !== undefined ? evt.actual : 'Awaiting Release'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">No today's events matched the active filter.</p>
              <button
                type="button"
                onClick={() => { setSelectedImpact('ALL'); setSelectedCurrency('ALL'); }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ================= TAB 2: TODAY'S MARKET NEWS STORIES ================= */
        <div className="space-y-3">
          {displayedArticles.map((art) => {
            const indicator = getArticleIndicatorData(art);
            const pubTime = (() => {
              try {
                return format(parseISO(art.publishedAt), 'h:mm a');
              } catch {
                return 'Today';
              }
            })();

            return (
              <div
                key={art.id}
                onClick={() => navigate(`/news?date=${todayDateStr}`)}
                className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-850 hover:border-blue-500/70 dark:hover:border-blue-500/60 transition-all cursor-pointer group shadow-2xs space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {art.sourceName}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 font-medium">{pubTime}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{art.category}</span>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    art.impact === 'HIGH'
                      ? 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700/80'
                      : art.impact === 'MEDIUM'
                      ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/80'
                      : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/80'
                  }`}>
                    {art.impact === 'HIGH' && <Flame className="w-3 h-3" />}
                    {art.impact === 'MEDIUM' && <Activity className="w-3 h-3" />}
                    {art.impact === 'LOW' && <CheckCircle2 className="w-3 h-3" />}
                    <span>{art.impact} IMPACT</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {art.headline}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>

                {/* Macro indicator snippet if available */}
                {indicator && (
                  <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{indicator.eventName}</span>
                      {indicator.currency && <CurrencyBadge code={indicator.currency} size="sm" />}
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] font-extrabold">
                      <span className="text-slate-500 dark:text-slate-300">Prev: <strong className="text-slate-900 dark:text-white">{indicator.previous || '—'}</strong></span>
                      <span className="text-blue-600 dark:text-sky-300">Fcast: <strong>{indicator.forecast || '—'}</strong></span>
                      <span className={indicator.status === 'RELEASED' && indicator.actual !== null ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}>
                        Act: <strong>{indicator.actual || 'Awaiting'}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-850 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">No today's stories matching active filters.</p>
              <button
                type="button"
                onClick={() => { setSelectedImpact('ALL'); setSelectedCurrency('ALL'); }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Footer Actions: Show All Toggle + Full Calendar Link */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        {/* Toggle to view all 10 today's items */}
        {((activeTab === 'releases' && filteredEvents.length > 4) || (activeTab === 'news' && filteredArticles.length > 4)) && (
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all shadow-2xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Show Top 4 Only</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Show All Today's {activeTab === 'releases' ? `${filteredEvents.length} Releases` : `${filteredArticles.length} Stories`}</span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={() => navigate('/news?tab=news')}
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 py-1 transition-colors"
          >
            <span>Market News Wire</span>
          </button>
          <span>•</span>
          <button
            onClick={() => navigate('/news?tab=calendar')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 py-1 transition-colors"
          >
            <span>Full Economic Calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}
