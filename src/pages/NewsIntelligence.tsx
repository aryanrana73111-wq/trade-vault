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
  ImageOff
} from 'lucide-react';
import { NormalizedNewsArticle } from '@/types/normalizedNews';
import { newsProvider } from '@/services/news/newsProviders';
import { SimpleCalendarModal } from '@/components/news/SimpleCalendarModal';
import { MarketIntelligenceDrawer } from '@/components/news/MarketIntelligenceDrawer';
import { CleanEconomicCalendar } from '@/components/news/CleanEconomicCalendar';
import { format, parseISO, isSameDay, differenceInMinutes } from 'date-fns';

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

const MARKET_FILTERS = [
  'All Markets',
  'XAU/USD',
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'BTC/USD',
  'ETH/USD'
];

export function NewsIntelligence() {
  const [searchParams, setSearchParams] = useSearchParams();

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
  const [selectedMarket, setSelectedMarket] = useState<string>('All Markets');
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
        market: selectedMarket,
        searchQuery: searchQuery
      }, forceRefresh);

      if (result.isFutureDate) {
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
  }, [selectedCategory, selectedMarket, searchQuery]);

  // Load news whenever selected date or filters change
  useEffect(() => {
    if (activeTab === 'news') {
      loadNews(selectedDate, false);
    }
  }, [selectedDate, selectedCategory, selectedMarket, searchQuery, activeTab, loadNews]);

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
    } catch {
      // Ignore
    }
  };

  // Step forward 1 day
  const handleNextDay = () => {
    try {
      const d = parseISO(selectedDate);
      d.setDate(d.getDate() + 1);
      const newStr = d.toISOString().split('T')[0];
      handleSelectDate(newStr);
    } catch {
      // Ignore
    }
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
          <div className="flex flex-col text-[11px] text-slate-400">
            <span>Published: Yesterday {pubTime}</span>
            <span className="text-amber-400 font-medium">Updated: Today {updTime}</span>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Bar: Title & Simple Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">NEWS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time macroeconomic intelligence, live wire feeds & economic events
          </p>
        </div>

        {/* Concept Tabs & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Concept Tabs: Tab 1 (NEWS) & Tab 2 (ECONOMIC CALENDAR) */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => setTab('news')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>NEWS</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('calendar')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>ECONOMIC CALENDAR</span>
            </button>
          </div>

          {/* Simple Mode Toggle: NORMAL vs MARKET INTELLIGENCE */}
          {activeTab === 'news' && (
            <div className="flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMode('normal')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeMode === 'normal'
                    ? 'bg-slate-800 text-slate-100 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('market_intelligence')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                  activeMode === 'market_intelligence'
                    ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold'
                    : 'text-slate-400 hover:text-purple-300'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Market Intelligence</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Date Header & Calendar Navigator */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden p-0.5">
            <button
              type="button"
              onClick={handlePrevDay}
              title="Previous Day"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                {isToday ? 'TODAY' : isFuture ? 'FUTURE DATE' : 'HISTORICAL DATE'}
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-100 font-mono">
                {formattedSelectedDate}
              </div>
            </div>
            <button
              type="button"
              onClick={handleNextDay}
              title="Next Day"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Calendar Button */}
          <button
            type="button"
            onClick={() => setIsCalendarModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-xs transition-all"
          >
            <CalendarIcon className="w-4 h-4 text-blue-400" />
            <span>Calendar</span>
            <span className="text-slate-400 text-[10px]">▼</span>
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => handleSelectDate(todayDateStr)}
              className="px-3 py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-colors"
            >
              Return to Today
            </button>
          )}
        </div>

        {/* Refresh & Freshness Status */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {formattedLastUpdated && (
            <div className="text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Freshness</div>
              <div className="text-xs text-slate-300 font-medium">
                Last updated: <span className="text-slate-200">{formattedLastUpdated}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all disabled:opacity-50"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'calendar' ? (
        <CleanEconomicCalendar
          selectedDate={selectedDate}
          todayDateStr={todayDateStr}
          onSelectDate={handleSelectDate}
          onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        />
      ) : (
        /* TAB 1: NEWS */
        <div className="space-y-6">
          {/* Stale Cache Notice if applicable */}
          {isStale && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Showing cached data from {cacheAgeMinutes} minutes ago. Live refresh required.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors shrink-0"
              >
                Refresh
              </button>
            </div>
          )}

          {/* Filter Bar: Categories + Optional Market Filter + Search */}
          <div className="space-y-3">
            {/* Primary Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Optional Market Filter & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs text-slate-400 font-medium mr-1">Market:</span>
                {MARKET_FILTERS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMarket(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedMarket === m
                        ? 'bg-slate-800 text-blue-400 border border-blue-500/40 font-bold'
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative min-w-[220px] max-w-xs w-full sm:w-auto">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search headlines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Feed Title & Boundary Announcement */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                {isToday ? "TODAY'S NEWS" : `NEWS FROM ${formattedSelectedDate.toUpperCase()}`}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {articles.length} {articles.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            <div className="text-[11px] text-slate-400">
              Ordered: <span className="text-slate-300 font-medium">Newest → Oldest</span>
            </div>
          </div>

          {/* News Content State Machine */}
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              <p className="text-sm text-slate-400">Connecting to live financial news feed...</p>
            </div>
          ) : error ? (
            /* Honest Error State: NEVER fake live news */
            <div className="p-8 bg-slate-900/60 border border-rose-900/40 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">{error}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                The external news provider could not be reached. TradeVault does not generate fabricated headlines or substitute outdated records as current news.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isFutureDate ? (
            /* Future Date Handling */
            <div className="p-8 bg-slate-900/60 border border-purple-900/40 rounded-2xl text-center space-y-4">
              <Clock className="w-8 h-8 text-purple-400 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">
                No published news is available for this future date yet.
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Historical news articles are only recorded for dates that have already occurred. Forward-looking scheduled releases are tracked in the Economic Calendar.
              </p>
              <button
                type="button"
                onClick={() => setTab('calendar')}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
              >
                View Upcoming Scheduled Events
              </button>
            </div>
          ) : articles.length === 0 ? (
            /* Empty Filter / Date State */
            <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-3">
              <Newspaper className="w-8 h-8 text-slate-500 mx-auto" />
              <h3 className="text-base font-semibold text-slate-200">
                No articles found for {formattedSelectedDate}
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No news articles matched your active filters for this specific 24-hour date boundary.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                {selectedCategory !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                  >
                    Reset Category
                  </button>
                )}
                {!isToday && (
                  <button
                    type="button"
                    onClick={() => handleSelectDate(todayDateStr)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Go to Today
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* News Feed Cards List: Newest -> Oldest */
            <div className="space-y-4">
              {articles.map((article, idx) => {
                const uniqueKey = article.id ? `${article.id}-${idx}` : `news-art-${idx}`;
                return (
                  <article
                    key={uniqueKey}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-sm flex flex-col md:flex-row gap-5"
                  >
                    {/* Optional Image */}
                    {article.imageUrl && (
                      <div className="w-full md:w-52 h-36 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 relative">
                        <img
                          src={article.imageUrl}
                          alt={article.headline}
                          loading="lazy"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide on broken images
                            (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Article Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* Meta top line: Source, Published time, Category, Related Market */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                            {article.sourceName}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{renderTimestamp(article)}</span>
                          <span>•</span>
                          <span className="text-blue-400 font-medium">{article.category}</span>

                          {article.relatedMarkets && article.relatedMarkets.length > 0 && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1 font-mono font-semibold text-slate-300">
                                {article.relatedMarkets.slice(0, 3).map((m, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px]">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Headline */}
                        <h3 className="text-base sm:text-lg font-bold text-slate-100 hover:text-blue-400 transition-colors leading-snug">
                          <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {article.headline}
                          </a>
                        </h3>

                        {/* Summary */}
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                          {article.summary}
                        </p>
                      </div>

                      {/* Card Actions: Source Link & Market Intelligence Context */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                        >
                          <span>Read Source</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedIntelligenceArticle(article)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-800/50 text-xs font-medium transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Market Intelligence Context</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Professional Calendar Date Picker Modal */}
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
