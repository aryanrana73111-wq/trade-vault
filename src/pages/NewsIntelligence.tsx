import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  RefreshCw, 
  ExternalLink, 
  Search, 
  AlertCircle, 
  Clock, 
  Layers, 
  Newspaper, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  TrendingUp,
  ImageOff,
  Activity,
  Zap,
  Info,
  Globe,
  DollarSign,
  Building,
  Coins,
  BarChart3,
  Landmark,
  FileText
} from 'lucide-react';
import { NormalizedNewsArticle } from '@/types/normalizedNews';
import { newsProvider } from '@/services/news/newsProviders';
import { SimpleCalendarModal } from '@/components/news/SimpleCalendarModal';
import { MarketIntelligenceDrawer } from '@/components/news/MarketIntelligenceDrawer';
import { CleanEconomicCalendar } from '@/components/news/CleanEconomicCalendar';
import { CurrencyBadge, CURRENCY_OPTIONS } from '@/components/news/CurrencyBadge';
import { getArticleIndicatorData, formatReleaseTiming } from '@/lib/economicIndicatorMatcher';
import { format, parseISO, isSameDay, differenceInMinutes, subHours, subDays } from 'date-fns';
import {
  TradingViewTickerTape,
  TradingViewForexTable,
  TradingViewStockHeatmap,
  TradingViewEconomicMap,
  TradingViewNewsFeed,
  useResolvedTheme
} from '@/components/news/TradingViewNewsWidgets';

export type NewsTab = 'news' | 'calendar' | string;

const CATEGORIES = [
  'All',
  'Markets',
  'Forex',
  'Crypto',
  'Stocks',
  'Commodities',
  'Economy',
  'Central Banks',
  'Geopolitics',
  'Companies'
];

const TIME_FILTERS = [
  { id: 'ALL', label: 'All Time' },
  { id: '1H', label: '1 Hour' },
  { id: '6H', label: '6 Hours' },
  { id: 'TODAY', label: 'Today' },
  { id: 'WEEK', label: 'This Week' }
];

export function NewsIntelligence() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resolvedTheme = useResolvedTheme();

  // Tab: 'news' (default) vs 'calendar'
  const activeTab = searchParams.get('tab') === 'calendar' ? 'calendar' : 'news';

  // Mode: 'normal' (clean feed) vs 'market_intelligence' (detailed institutional context)
  const [activeMode, setActiveMode] = useState<'normal' | 'market_intelligence'>('normal');

  // Today Date determination (Client local timezone)
  const todayDateStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Selected Date state (Default automatically: TODAY)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const paramDate = searchParams.get('date');
    return paramDate || todayDateStr;
  });

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [selectedImpact, setSelectedImpact] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Feed State
  const [articles, setArticles] = useState<NormalizedNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceAttribution, setSourceAttribution] = useState<string>('');
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [cacheAgeMinutes, setCacheAgeMinutes] = useState<number>(0);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isFutureDate, setIsFutureDate] = useState<boolean>(false);
  const [ticker, setTicker] = useState<number>(0);

  // Live timer interval to update countdowns every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Modals & Panels
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [selectedIntelligenceArticle, setSelectedIntelligenceArticle] = useState<NormalizedNewsArticle | null>(null);

  // Fetch news function
  const loadNews = useCallback(async (dateToFetch: string, forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await newsProvider.fetchNews({
        date: dateToFetch,
        category: selectedCategory,
        impact: selectedImpact,
        searchQuery: searchQuery
      }, forceRefresh);

      if (result.isFutureDate && (!result.articles || result.articles.length === 0)) {
        setIsFutureDate(true);
        setArticles([]);
        setSourceAttribution('None');
      } else {
        setIsFutureDate(false);
        setArticles(result.articles);
        setSourceAttribution(result.source);
        setLastFetchedAt(result.fetchedAt);
        setCacheAgeMinutes(result.cacheAgeMinutes || 0);
        setIsStale(!!result.isStale);
      }
    } catch (err: any) {
      console.warn('News loading notice:', err);
      setError(err?.message || 'Live news is currently unavailable.');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedImpact, searchQuery]);

  // Load news whenever selected date or filters change
  useEffect(() => {
    if (activeTab === 'news') {
      loadNews(selectedDate, false);
    }
  }, [selectedDate, selectedCategory, selectedImpact, searchQuery, activeTab, loadNews]);

  // Handle Tab Switch
  const setTab = (tab: 'news' | 'calendar') => {
    const params = new URLSearchParams(searchParams);
    if (tab === 'calendar') {
      params.set('tab', 'calendar');
    } else {
      params.delete('tab');
    }
    setSearchParams(params);
  };

  // Handle Date Selection from Calendar
  const handleSelectDate = (newDateStr: string) => {
    setSelectedDate(newDateStr);
    const params = new URLSearchParams(searchParams);
    if (newDateStr === todayDateStr) {
      params.delete('date');
    } else {
      params.set('date', newDateStr);
    }
    setSearchParams(params);
  };

  // Refresh Trigger
  const handleRefresh = () => {
    loadNews(selectedDate, true);
  };

  // Step backward 1 day
  const handlePrevDay = () => {
    try {
      const d = parseISO(selectedDate);
      d.setDate(d.getDate() - 1);
      const newStr = d.toISOString().split('T')[0];
      handleSelectDate(newStr);
    } catch {}
  };

  // Step forward 1 day
  const handleNextDay = () => {
    try {
      const d = parseISO(selectedDate);
      d.setDate(d.getDate() + 1);
      const newStr = d.toISOString().split('T')[0];
      handleSelectDate(newStr);
    } catch {}
  };

  const isToday = selectedDate === todayDateStr;
  const isFuture = selectedDate > todayDateStr;

  const formattedSelectedDate = (() => {
    try {
      return format(parseISO(selectedDate), 'd MMMM yyyy');
    } catch {
      return selectedDate;
    }
  })();

  const formattedLastUpdated = (() => {
    if (!lastFetchedAt) return null;
    try {
      const mins = differenceInMinutes(new Date(), parseISO(lastFetchedAt));
      if (mins < 1) return 'Just now';
      if (mins === 1) return '1 minute ago';
      return `${mins} minutes ago`;
    } catch {
      return 'Recently';
    }
  })();

  // Filtered Articles based on Currency and Time Filter
  const displayArticles = useMemo(() => {
    let list = [...articles];

    // Currency filter in News
    if (selectedCurrency && selectedCurrency !== 'ALL') {
      const curr = selectedCurrency.toUpperCase();
      list = list.filter(a => 
        a.headline.toUpperCase().includes(curr) ||
        a.summary.toUpperCase().includes(curr) ||
        a.relatedMarkets?.some(m => m.toUpperCase().includes(curr))
      );
    }

    // Time filter
    if (selectedTimeFilter && selectedTimeFilter !== 'ALL') {
      const now = new Date();
      if (selectedTimeFilter === '1H') {
        const cutoff = subHours(now, 1);
        list = list.filter(a => parseISO(a.publishedAt) >= cutoff);
      } else if (selectedTimeFilter === '6H') {
        const cutoff = subHours(now, 6);
        list = list.filter(a => parseISO(a.publishedAt) >= cutoff);
      } else if (selectedTimeFilter === 'TODAY') {
        list = list.filter(a => a.publishedAt.split('T')[0] === todayDateStr);
      } else if (selectedTimeFilter === 'WEEK') {
        const cutoff = subDays(now, 7);
        list = list.filter(a => parseISO(a.publishedAt) >= cutoff);
      }
    }

    return list;
  }, [articles, selectedCurrency, selectedTimeFilter, todayDateStr]);

  // Fallback Category Illustration Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Central Banks':
        return <Landmark className="w-10 h-10 text-blue-500/70" />;
      case 'Crypto':
        return <Coins className="w-10 h-10 text-amber-500/70" />;
      case 'Forex':
        return <Globe className="w-10 h-10 text-emerald-500/70" />;
      case 'Commodities':
        return <Flame className="w-10 h-10 text-rose-500/70" />;
      case 'Stocks':
      case 'Companies':
        return <BarChart3 className="w-10 h-10 text-purple-500/70" />;
      default:
        return <Newspaper className="w-10 h-10 text-slate-400" />;
    }
  };

  // Published / Updated formatting for cards
  const renderTimestamp = (article: NormalizedNewsArticle) => {
    const pubDateStr = article.publishedAt.split('T')[0];
    const pubTime = (() => {
      try {
        return format(parseISO(article.publishedAt), 'h:mm a');
      } catch {
        return '';
      }
    })();

    if (article.updatedAt) {
      const updDateStr = article.updatedAt.split('T')[0];
      const updTime = (() => {
        try {
          return format(parseISO(article.updatedAt), 'h:mm a');
        } catch {
          return '';
        }
      })();

      if (pubDateStr !== updDateStr) {
        return (
          <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
            <span>Published: {pubTime}</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">Updated: {updTime}</span>
          </div>
        );
      }
    }

    if (pubDateStr === todayDateStr) {
      return <span>{pubTime || 'Today'}</span>;
    }

    return <span>{format(parseISO(article.publishedAt), 'MMM d, h:mm a')}</span>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header: Title & Two Primary Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-2xs">
              <Newspaper className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              TRADEVAULT MARKET INTELLIGENCE
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time macroeconomic intelligence, live wire feeds & economic releases
          </p>
        </div>

        {/* Concept Tabs: Tab 1 (MARKET NEWS) & Tab 2 (ECONOMIC CALENDAR) */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setTab('news')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'news'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>MARKET NEWS</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('calendar')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>ECONOMIC CALENDAR</span>
          </button>
        </div>
      </div>

      {/* 2. TradingView Ticker Tape at the top */}
      <TradingViewTickerTape theme={resolvedTheme} />

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'calendar' ? (
        <CleanEconomicCalendar
          selectedDate={selectedDate}
          todayDateStr={todayDateStr}
          onSelectDate={handleSelectDate}
          onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
          articles={articles}
          onSelectArticle={(art) => setSelectedIntelligenceArticle(art)}
        />
      ) : (
        /* TAB 1: MARKET NEWS */
        <div className="space-y-6">
          {/* Date Navigator Header for News */}
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-0.5 shadow-2xs shrink-0">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  title="Previous Day"
                  className="p-2 sm:p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-2.5 sm:px-3 py-1 text-center min-w-[120px] sm:min-w-[150px]">
                  <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 truncate">
                    {isToday ? 'TODAY' : isFuture ? 'FUTURE DATE' : 'HISTORICAL DATE'}
                  </div>
                  <div className="text-xs sm:text-base font-bold text-slate-900 dark:text-slate-100 font-mono truncate">
                    {formattedSelectedDate}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleNextDay}
                  title="Next Day"
                  className="p-2 sm:p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Calendar & Return to Today Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 sm:gap-2 shadow-2xs transition-all touch-manipulation min-h-[38px] sm:min-h-[42px]"
                >
                  <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  <span>Calendar</span>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {!isToday && (
                  <button
                    type="button"
                    onClick={() => handleSelectDate(todayDateStr)}
                    className="px-2.5 sm:px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-600/10 hover:bg-blue-100 dark:hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 text-xs font-semibold transition-colors touch-manipulation min-h-[38px] sm:min-h-[42px]"
                  >
                    Today
                  </button>
                )}
              </div>
            </div>

            {/* Freshness & Refresh */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
              {formattedLastUpdated && (
                <div className="text-left sm:text-right">
                  <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Freshness</div>
                  <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
                    Updated: <span className="text-slate-900 dark:text-slate-200">{formattedLastUpdated}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 transition-all disabled:opacity-50 touch-manipulation min-h-[38px] min-w-[38px] flex items-center justify-center shadow-2xs shrink-0"
                title="Refresh news feed"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Stale Cache Notice if applicable */}
          {isStale && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  Showing cached data from {cacheAgeMinutes} minutes ago. Live refresh required.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors shrink-0"
              >
                Refresh
              </button>
            </div>
          )}

          {/* Filter Bar: Impact Buttons + Currency Chips + Category Pills + Time Filter + Search */}
          <div className="space-y-4 bg-white dark:bg-slate-900/40 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
            {/* Impact Filter Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full md:w-auto">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Impact:
                </span>
                
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto touch-pan-x">
                  <button
                    type="button"
                    onClick={() => setSelectedImpact('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation shrink-0 ${
                      selectedImpact === 'ALL'
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    All Impact
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImpact('HIGH')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                      selectedImpact === 'HIGH'
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25 border border-rose-600'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-900/60'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-current" />
                    <span>High Impact</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImpact('MEDIUM')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                      selectedImpact === 'MEDIUM'
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-500'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900/60'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-current" />
                    <span>Medium Impact</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedImpact('LOW')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 touch-manipulation shrink-0 ${
                      selectedImpact === 'LOW'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-600'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-current" />
                    <span>Low Impact</span>
                  </button>
                </div>
              </div>

              {/* Time Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Time:</span>
                {TIME_FILTERS.map((tf) => (
                  <button
                    key={tf.id}
                    type="button"
                    onClick={() => setSelectedTimeFilter(tf.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedTimeFilter === tf.id
                        ? 'bg-blue-600 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Filter Chips in News */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 shrink-0 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Currency:
              </span>
              {CURRENCY_OPTIONS.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(c.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all touch-manipulation shrink-0 ${
                    selectedCurrency === c.code
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {c.code === 'ALL' ? 'All' : `${c.flag || ''} ${c.code}`}
                </button>
              ))}
            </div>

            {/* Categories & Search */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none touch-pan-x">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 shrink-0">
                  Category:
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation ${
                        selectedCategory === cat
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-72 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Feed Title Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {isToday ? "TODAY'S MARKET NEWS" : `NEWS FROM ${formattedSelectedDate.toUpperCase()}`}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {displayArticles.length} {displayArticles.length === 1 ? 'article' : 'articles'}
              </span>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Source: {sourceAttribution || 'Live Wire'}
            </div>
          </div>

          {/* News Content */}
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Connecting to live market wire feeds...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-white dark:bg-slate-900/60 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-center space-y-3 shadow-xs">
              <AlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">{error}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Live news provider could not be reached. TradeVault does not generate synthetic headlines.
              </p>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : displayArticles.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 shadow-xs">
              <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No articles found matching filters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try clearing active filters or searching for another keyword.
              </p>
            </div>
          ) : (
            /* Responsive Grid for Articles */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {displayArticles.map((article, idx) => {
                const uniqueKey = article.id || `news-art-${idx}`;
                const impact = article.impact || 'LOW';

                return (
                  <article
                    key={uniqueKey}
                    className="bg-white dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 sm:p-6 transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3.5">
                      {/* Image or Graceful Placeholder */}
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 relative flex items-center justify-center">
                        {article.imageUrl ? (
                          <img
                            src={article.imageUrl}
                            alt={article.headline}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                            {getCategoryIcon(article.category)}
                            <span className="text-[10px] font-mono font-medium uppercase tracking-wider">{article.category}</span>
                          </div>
                        )}

                        {/* Top Overlay Badge */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-xs ${
                            impact === 'HIGH'
                              ? 'bg-rose-600 text-white'
                              : impact === 'MEDIUM'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}>
                            {impact === 'HIGH' && <Flame className="w-3 h-3" />}
                            {impact === 'MEDIUM' && <Activity className="w-3 h-3" />}
                            {impact === 'LOW' && <CheckCircle2 className="w-3 h-3" />}
                            <span>{impact} IMPACT</span>
                          </span>
                        </div>
                      </div>

                      {/* Meta Top Line */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60">
                          {article.sourceName}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{renderTimestamp(article)}</span>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{article.category}</span>
                      </div>

                      {/* Headline */}
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {article.headline}
                        </a>
                      </h3>

                      {/* Short Summary */}
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>

                      {/* Macroeconomic Indicator Intelligence Box (Previous, Forecast, Actual, Status, Countdown) */}
                      {(() => {
                        const indicator = getArticleIndicatorData(article);
                        const timing = indicator ? formatReleaseTiming(indicator.releaseTime, indicator.status) : null;
                        if (!indicator || !timing) return null;

                        return (
                          <div className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl space-y-2.5 mt-2 shadow-2xs">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${indicator.status === 'RELEASED' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                  {indicator.eventName}
                                </span>
                                {indicator.currency && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-900/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-blue-600/60 shrink-0">
                                    {indicator.currency}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                {/* Release Status Badge */}
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                                  indicator.status === 'RELEASED'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
                                    : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 animate-pulse'
                                }`}>
                                  {indicator.status === 'RELEASED' ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                      <span>RELEASED</span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      <span>NOT RELEASED</span>
                                    </>
                                  )}
                                </span>

                                {/* Live Countdown or Released Time Ago */}
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${timing.badgeClass}`}>
                                  <Clock className="w-3 h-3" />
                                  <span>{timing.label}</span>
                                </span>
                              </div>
                            </div>

                            {/* Previous / Forecast / Actual Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 text-center pt-2 border-t border-slate-200/60 dark:border-slate-700/80">
                              <div className="p-2.5 bg-white dark:bg-slate-900/95 rounded-lg border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-200 block">Previous</span>
                                <span className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white block mt-0.5">
                                  {indicator.previous || 'N/A'}
                                </span>
                              </div>

                              <div className="p-2.5 bg-white dark:bg-slate-900/95 rounded-lg border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-200 block">Forecast</span>
                                <span className="text-xs sm:text-sm font-black font-mono text-blue-600 dark:text-sky-300 block mt-0.5">
                                  {indicator.forecast || 'N/A'}
                                </span>
                              </div>

                              <div className={`p-2.5 rounded-lg border shadow-2xs ${
                                indicator.status === 'RELEASED' && indicator.actual !== null
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/70 text-emerald-900 dark:text-emerald-100'
                                  : 'bg-white dark:bg-slate-900/95 border-dashed border-slate-300 dark:border-slate-600'
                              }`}>
                                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                                  indicator.status === 'RELEASED' && indicator.actual !== null
                                    ? 'text-emerald-800 dark:text-emerald-300'
                                    : 'text-slate-600 dark:text-slate-200'
                                }`}>
                                  Actual (Live)
                                </span>
                                <span className={`text-xs sm:text-sm font-black font-mono block mt-0.5 ${
                                  indicator.status === 'RELEASED' && indicator.actual !== null
                                    ? 'text-emerald-700 dark:text-emerald-300'
                                    : 'text-amber-600 dark:text-amber-300 text-xs font-bold'
                                }`}>
                                  {indicator.status === 'RELEASED' && indicator.actual !== null ? indicator.actual : 'Awaiting Release'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Actions: Source Link & Market Intelligence Context */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={article.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
                      >
                        <span>Read Full Story</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>

                      <button
                        type="button"
                        onClick={() => setSelectedIntelligenceArticle(article)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 text-xs font-semibold transition-colors shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Market Context</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TradingView Market Analysis & Intelligence Workspace */}
      <div className="space-y-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        {/* 4. Forex Table */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  FOREIGN EXCHANGE CROSS RATES
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time major and cross currency rate matrix and pip variances
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400 self-start sm:self-auto px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              TradingView Forex Table
            </span>
          </div>
          <TradingViewForexTable theme={resolvedTheme} minHeight={450} />
        </section>

        {/* 5. Stock Heatmap */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  S&P 500 SECTOR PERFORMANCE HEATMAP
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Market capitalization sizing & sector price variance
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400 self-start sm:self-auto px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              TradingView Stock Heatmap
            </span>
          </div>
          <TradingViewStockHeatmap theme={resolvedTheme} minHeight={540} />
        </section>

        {/* 6. Economic Map */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  GLOBAL ECONOMIC MAP
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Worldwide macroeconomic indicators, monetary policies, and sovereign data
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400 self-start sm:self-auto px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              TradingView Economic Map
            </span>
          </div>
          <TradingViewEconomicMap theme={resolvedTheme} minHeight={520} />
        </section>

        {/* 7. TradingView News Feed at the very bottom */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  TRADINGVIEW GLOBAL MARKET NEWS STREAM
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live international financial wire feeds, equity updates, and breaking alerts
              </p>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-400 self-start sm:self-auto px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              TradingView News Feed
            </span>
          </div>
          <TradingViewNewsFeed theme={resolvedTheme} minHeight={560} />
        </section>
      </div>

      {/* Calendar Date Picker Modal */}
      <SimpleCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        todayDateStr={todayDateStr}
      />

      {/* Market Intelligence Context Drawer */}
      <MarketIntelligenceDrawer
        article={selectedIntelligenceArticle}
        onClose={() => setSelectedIntelligenceArticle(null)}
      />
    </div>
  );
}
