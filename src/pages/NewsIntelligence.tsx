import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Calendar, 
  Search, 
  Newspaper, 
  Activity, 
  Clock, 
  BarChart3, 
  Bookmark, 
  ChevronRight, 
  ArrowRight, 
  Filter,
  RefreshCw,
  Wifi,
  WifiOff,
  SlidersHorizontal,
  X,
  BookOpen,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Radio,
  Layers,
  Database,
  CheckCircle2,
  ShieldAlert,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { getAllMarketNews } from '@/data/marketNewsData';
import { filterNewsByTime, TimeFilter } from '@/lib/newsUtils';
import { MarketNewsArticle, NewsEvent, NewsUserSettings, NewsStoryCluster } from '@/types/newsIntelligence';
import { VisualNewsCard } from '@/components/news/VisualNewsCard';
import { HeroStoryCard } from '@/components/news/HeroStoryCard';
import { EventTimeline } from '@/components/news/EventTimeline';
import { VisualNewsArticleModal } from '@/components/news/VisualNewsArticleModal';
import { EventDetailModal } from '@/components/news/EventDetailModal';
import { UpcomingEventsSection } from '@/components/news/UpcomingEventsSection';
import { MarketImpactSection } from '@/components/news/MarketImpactSection';
import { EconomicCalendarView } from '@/components/news/EconomicCalendarView';
import { NewsAcademyView } from '@/components/news/NewsAcademyView';
import { MyNewsPerformanceView } from '@/components/news/MyNewsPerformanceView';
import { NewsSettingsModal } from '@/components/news/NewsSettingsModal';
import { MultiSourceComparisonModal } from '@/components/news/MultiSourceComparisonModal';
import { EconomicReleasesView } from '@/components/news/EconomicReleasesView';
import { EconomicDataView } from '@/components/news/EconomicDataView';
import { MarketSnapshotView } from '@/components/news/MarketSnapshotView';
import { UpcomingEventsFullView } from '@/components/news/UpcomingEventsFullView';
import { WatchlistIntelligenceView } from '@/components/news/WatchlistIntelligenceView';
import { SavedIntelligenceView } from '@/components/news/SavedIntelligenceView';
import { AlertsIntelligenceView } from '@/components/news/AlertsIntelligenceView';
import { SlidableNewsTabs } from '@/components/news/SlidableNewsTabs';
import { TopLevelNewsModeSwitcher } from '@/components/news/TopLevelNewsModeSwitcher';
import { ProNewsroomView } from '@/components/news/pro/ProNewsroomView';
import { AdvancedMarketTerminalView } from '@/components/news/advanced/AdvancedMarketTerminalView';
import { NewsSystemMode } from '@/types/newsModes';

import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { NEWS_STORY_CLUSTERS } from '@/data/newsStoryClustersData';
import { 
  getStoredNewsSettings, 
  saveStoredNewsSettings, 
  computeArticlePrioritizationScore 
} from '@/lib/news/newsStore';
import { getTrades } from '@/lib/storage';

const CATEGORIES = [
  'ALL', 
  'MACRO', 
  'FOREX', 
  'GOLD', 
  'CRYPTO', 
  'STOCKS', 
  'INDICES', 
  'CENTRAL BANKS', 
  'GEOPOLITICS', 
  'ECONOMY'
];

export type NewsTab = 
  | 'feed' 
  | 'calendar' 
  | 'releases' 
  | 'data' 
  | 'snapshot' 
  | 'upcoming' 
  | 'watchlist' 
  | 'saved' 
  | 'alerts' 
  | 'academy' 
  | 'performance';

export function NewsIntelligence() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab navigation - Default to 'calendar' as specified in Master Upgrade 1
  const activeTab = (searchParams.get('tab') || 'calendar') as NewsTab;
  const initialEventId = searchParams.get('eventId');
  const initialIndicatorCode = searchParams.get('indicator');

  // Filters & State
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7_DAYS');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByPriority, setSortByPriority] = useState<boolean>(true);

  // Modals & Selected Objects
  const [selectedArticle, setSelectedArticle] = useState<MarketNewsArticle | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<NewsStoryCluster | null>(null);
  const [selectedIndicatorCode, setSelectedIndicatorCode] = useState<string | undefined>(initialIndicatorCode || undefined);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Connection / Stale / Freshness State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [newsSettings, setNewsSettings] = useState<NewsUserSettings>(getStoredNewsSettings());

  // Top-Level Mode: NORMAL (default) | PRO | ADVANCED
  const [systemMode, setSystemMode] = useState<NewsSystemMode>(() => {
    const saved = localStorage.getItem('tradevault_news_mode_v3');
    if (saved === 'PRO' || saved === 'ADVANCED' || saved === 'NORMAL') {
      return saved;
    }
    return 'NORMAL'; // Default to NORMAL as mandated
  });

  const handleSystemModeChange = (newMode: NewsSystemMode) => {
    setSystemMode(newMode);
    localStorage.setItem('tradevault_news_mode_v3', newMode);
  };

  // User trades for personal prioritization & edge calculation
  const userTrades = useMemo(() => getTrades(), []);

  // Distinct traded markets from user's journal
  const userTradedMarkets = useMemo(() => {
    const set = new Set<string>();
    userTrades.forEach(t => {
      if (t.market) set.add(t.market);
    });
    if (set.size === 0 && newsSettings.watchlistAssets) {
      newsSettings.watchlistAssets.forEach(a => set.add(a));
    }
    return Array.from(set);
  }, [userTrades, newsSettings.watchlistAssets]);

  // Handle online/offline window events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check if an initialEventId was passed via search params
  useEffect(() => {
    if (initialEventId) {
      const match = NEWS_EVENTS.find(e => e.id === initialEventId);
      if (match) {
        setSelectedEvent(match);
      }
    }
  }, [initialEventId]);

  // Handle Tab Switch
  const handleTabChange = (tabKey: NewsTab) => {
    const params = new URLSearchParams(searchParams);
    if (tabKey === 'feed') {
      params.delete('tab');
    } else {
      params.set('tab', tabKey);
    }
    params.delete('eventId');
    setSearchParams(params);
  };

  // Update Settings helper
  const handleUpdateSettings = (updates: Partial<NewsUserSettings>) => {
    const newSettings = { ...newsSettings, ...updates };
    setNewsSettings(newSettings);
    saveStoredNewsSettings(newSettings);
  };

  // 1. All Base News
  const allNews = useMemo(() => getAllMarketNews(), []);

  // 2. Filter by Time Window
  const timeFilteredNews = useMemo(() => {
    const filtered = filterNewsByTime(allNews, timeFilter);
    if (filtered.length === 0 && timeFilter === 'TOMORROW') {
      return allNews.slice(0, 3);
    }
    return filtered;
  }, [allNews, timeFilter]);

  // 3. Filter by Category & Search with PRIORITIZATION ENGINE
  const displayNews = useMemo(() => {
    const filtered = timeFilteredNews.filter(article => {
      const matchCategory = categoryFilter === 'ALL' || article.category.toUpperCase() === categoryFilter;
      
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchCategory;

      const matchHeadline = article.headline.toLowerCase().includes(q);
      const matchSummary = article.summary.toLowerCase().includes(q);
      const matchSource = article.source.toLowerCase().includes(q);
      const matchPerson = article.personEntity ? article.personEntity.toLowerCase().includes(q) : false;
      const matchCategoryText = article.category.toLowerCase().includes(q);
      const matchMarkets = article.markets && article.markets.some(m => m.toLowerCase().includes(q));
      const matchWhy = article.whyItMatters ? article.whyItMatters.toLowerCase().includes(q) : false;

      return matchCategory && (matchHeadline || matchSummary || matchSource || matchPerson || matchCategoryText || matchMarkets || matchWhy);
    });

    if (sortByPriority) {
      // News Prioritization Engine ranking
      return [...filtered].sort((a, b) => {
        const scoreA = computeArticlePrioritizationScore(a, userTradedMarkets);
        const scoreB = computeArticlePrioritizationScore(b, userTradedMarkets);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    }

    // Standard chronological sort
    return [...filtered].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [timeFilteredNews, categoryFilter, searchQuery, sortByPriority, userTradedMarkets]);

  // Separate Hero from the rest
  const heroArticle = displayNews.length > 0 ? displayNews[0] : null;
  const feedNews = displayNews.length > 1 ? displayNews.slice(1) : [];

  // Determine Upcoming Events for "What Matters Now" and "Upcoming Events"
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return NEWS_EVENTS.filter(e => {
      const eDate = new Date(e.dateTime);
      return eDate >= now;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, []);

  // Important Stories / What Matters Now (High impact catalysts)
  const whatMattersNow = useMemo(() => {
    return upcomingEvents.filter(e => e.impact === 'HIGH').slice(0, 4);
  }, [upcomingEvents]);

  // Weekly Briefing Date Range String
  const currentWeekRange = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString(undefined, formatOpts)} – ${sunday.toLocaleDateString(undefined, formatOpts)}`;
  }, []);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  // Open Story Cluster
  const handleOpenCluster = (clusterId: string) => {
    const cluster = NEWS_STORY_CLUSTERS.find(c => c.id === clusterId);
    if (cluster) {
      setSelectedCluster(cluster);
    }
  };

  // Open Indicator
  const handleSelectIndicator = (code: string) => {
    setSelectedIndicatorCode(code);
    handleTabChange('data');
  };

  // Toggle Bookmark for an article
  const handleToggleArticleBookmark = (articleId: string) => {
    const current = newsSettings.bookmarkedArticleIds || [];
    const updated = current.includes(articleId)
      ? current.filter(id => id !== articleId)
      : [...current, articleId];
    handleUpdateSettings({ bookmarkedArticleIds: updated });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors duration-200">
      
      {/* 0. TOP-LEVEL MODE SWITCHER: [ NORMAL ] [ PRO ] [ ADVANCED ] */}
      <TopLevelNewsModeSwitcher
        currentMode={systemMode}
        onModeChange={handleSystemModeChange}
      />

      {systemMode === 'PRO' ? (
        <ProNewsroomView
          settings={newsSettings}
          onUpdateSettings={handleUpdateSettings}
          onSelectEvent={(eventId) => {
            const match = NEWS_EVENTS.find(e => e.id === eventId);
            if (match) setSelectedEvent(match);
          }}
        />
      ) : systemMode === 'ADVANCED' ? (
        <AdvancedMarketTerminalView
          settings={newsSettings}
          onUpdateSettings={handleUpdateSettings}
          onSelectEvent={(eventId) => {
            const match = NEWS_EVENTS.find(e => e.id === eventId);
            if (match) setSelectedEvent(match);
          }}
        />
      ) : (
        <>
          {/* 1. TOP HEADER & NAVIGATION */}
          <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            
            {/* Title & Live Status Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shadow-2xs">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Market Intelligence Center</span>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden xs:block">
                    Macro intelligence, sovereign time-series, volatility alerts & execution context
                  </p>
                </div>
              </div>

              {/* Mobile Quick Action Icons */}
              <div className="flex items-center gap-1.5 md:hidden">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Refresh news"
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  aria-label="News settings"
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop Status, Week Brief, Settings */}
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-3 py-1.5 rounded-xl flex items-center shadow-2xs">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Weekly Brief: {currentWeekRange}
                </span>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                <span>{isRefreshing ? 'Updating...' : 'Refresh'}</span>
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferences</span>
              </button>
            </div>

          </div>

          {/* Sub-view Navigation Tabs: Slidable for Desktop, Tablet & Mobile */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-850">
            <SlidableNewsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              watchlistCount={newsSettings.watchlistedEventIds?.length || 0}
              savedCount={newsSettings.bookmarkedArticleIds?.length || 0}
              alertsCount={Object.keys(newsSettings.calendarAlerts || {}).length}
            />
          </div>

        </div>
      </header>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are currently in offline mode. Viewing cached market intelligence articles and calendar records.</span>
            <button
              type="button"
              onClick={() => setIsOffline(!navigator.onLine)}
              className="ml-auto underline text-xs font-bold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB CONTENT */}
      {activeTab === 'calendar' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EconomicCalendarView 
            events={NEWS_EVENTS}
            timezone={newsSettings.timezone}
            onTimezoneChange={(tz) => handleUpdateSettings({ timezone: tz })}
            onSelectEvent={(ev) => setSelectedEvent(ev)}
            watchlistedEventIds={newsSettings.watchlistedEventIds || []}
            onToggleWatchlist={(id) => {
              const current = newsSettings.watchlistedEventIds || [];
              const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
              handleUpdateSettings({ watchlistedEventIds: updated });
            }}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      ) : activeTab === 'releases' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EconomicReleasesView
            settings={newsSettings}
            onSelectEvent={(id) => {
              const ev = NEWS_EVENTS.find(e => e.id === id);
              if (ev) setSelectedEvent(ev);
            }}
            onOpenDataTab={(code) => {
              setSelectedIndicatorCode(code);
              handleTabChange('data');
            }}
          />
        </div>
      ) : activeTab === 'data' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EconomicDataView
            settings={newsSettings}
            onUpdateSettings={handleUpdateSettings}
            initialSelectedCode={selectedIndicatorCode}
            onSelectEvent={(eventId) => {
              const ev = NEWS_EVENTS.find(e => e.id === eventId);
              if (ev) setSelectedEvent(ev);
            }}
          />
        </div>
      ) : activeTab === 'snapshot' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MarketSnapshotView
            onFilterNewsByAsset={(symbol) => {
              setSearchQuery(symbol);
              handleTabChange('feed');
            }}
            onFilterCalendarByAsset={(symbol) => {
              handleTabChange('calendar');
            }}
          />
        </div>
      ) : activeTab === 'upcoming' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <UpcomingEventsFullView
            settings={newsSettings}
            onUpdateSettings={handleUpdateSettings}
            onSelectEvent={(id) => {
              const ev = NEWS_EVENTS.find(e => e.id === id);
              if (ev) setSelectedEvent(ev);
            }}
            onOpenDataTab={(code) => {
              setSelectedIndicatorCode(code);
              handleTabChange('data');
            }}
          />
        </div>
      ) : activeTab === 'watchlist' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <WatchlistIntelligenceView
            settings={newsSettings}
            userTrades={userTrades}
            onUpdateSettings={handleUpdateSettings}
            onSelectEvent={(id) => {
              const ev = NEWS_EVENTS.find(e => e.id === id);
              if (ev) setSelectedEvent(ev);
            }}
            onSelectIndicator={(code) => {
              setSelectedIndicatorCode(code);
              handleTabChange('data');
            }}
            onFilterNewsByAsset={(symbol) => {
              setSearchQuery(symbol);
              handleTabChange('feed');
            }}
          />
        </div>
      ) : activeTab === 'saved' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SavedIntelligenceView
            settings={newsSettings}
            onUpdateSettings={handleUpdateSettings}
            onOpenArticleModal={(art) => setSelectedArticle(art)}
            onSelectEvent={(id) => {
              const ev = NEWS_EVENTS.find(e => e.id === id);
              if (ev) setSelectedEvent(ev);
            }}
          />
        </div>
      ) : activeTab === 'alerts' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AlertsIntelligenceView
            settings={newsSettings}
            onUpdateSettings={handleUpdateSettings}
            onSelectEvent={(id) => {
              const ev = NEWS_EVENTS.find(e => e.id === id);
              if (ev) setSelectedEvent(ev);
            }}
          />
        </div>
      ) : activeTab === 'academy' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <NewsAcademyView 
            bookmarkedArticleIds={newsSettings.bookmarkedArticleIds || []}
            learnedArticleIds={newsSettings.learnedArticleIds || []}
            onToggleBookmark={(id) => {
              const current = newsSettings.bookmarkedArticleIds || [];
              const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
              handleUpdateSettings({ bookmarkedArticleIds: updated });
            }}
            onToggleLearned={(id) => {
              const current = newsSettings.learnedArticleIds || [];
              const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
              handleUpdateSettings({ learnedArticleIds: updated });
            }}
            userNotes={newsSettings.userNotes || {}}
            onSaveNote={(id, text) => {
              handleUpdateSettings({
                userNotes: { ...(newsSettings.userNotes || {}), [id]: text }
              });
            }}
          />
        </div>
      ) : activeTab === 'performance' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <MyNewsPerformanceView trades={userTrades} />
        </div>
      ) : (
        /* MAIN MARKET NEWS TAB */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">
          
          {/* SEARCH & FILTERS & PRIORITIZATION TOGGLE */}
          <section className="space-y-3.5">
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Search headline, central banker (e.g. Jerome Powell), market (XAU/USD, EUR/USD), or topic..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Time Window Filters & Prioritization Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1 max-w-full">
                <TimeChip active={timeFilter === 'TODAY'} onClick={() => setTimeFilter('TODAY')} label="Today" />
                <TimeChip active={timeFilter === 'TOMORROW'} onClick={() => setTimeFilter('TOMORROW')} label="Tomorrow" />
                <TimeChip active={timeFilter === '7_DAYS'} onClick={() => setTimeFilter('7_DAYS')} label="7 Days" />
                <TimeChip active={timeFilter === '1_MONTH'} onClick={() => setTimeFilter('1_MONTH')} label="1 Month" />
                <TimeChip active={timeFilter === 'PREV_7_DAYS'} onClick={() => setTimeFilter('PREV_7_DAYS')} label="Previous 7 Days" />
              </div>

              {/* Prioritization Engine toggle & Count */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSortByPriority(!sortByPriority)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    sortByPriority
                      ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                  title={sortByPriority ? 'Ranked by personal relevance and macro impact' : 'Sorted purely by chronological recency'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>{sortByPriority ? 'Prioritized Feed' : 'Latest First'}</span>
                </button>

                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {displayNews.length} {displayNews.length === 1 ? 'story' : 'stories'}
                </span>
              </div>
            </div>
          </section>

          {/* MARKET CATEGORY CHIPS */}
          <section className="border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                    categoryFilter === cat 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* NO NEWS MATCH STATE */}
          {displayNews.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <Search className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                No Stories Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                No news articles match your current search query or active time window filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setTimeFilter('7_DAYS');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* HERO STORY */}
              {heroArticle && (
                <section>
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      Lead Catalyst & Top Story
                    </h2>
                    <span className="text-[11px] font-medium text-slate-400">Featured Institutional Brief</span>
                  </div>
                  <HeroStoryCard 
                    article={heroArticle} 
                    onClick={() => setSelectedArticle(heroArticle)} 
                  />
                </section>
              )}

              {/* IMPORTANT STORIES / WHAT MATTERS NOW */}
              {whatMattersNow.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      What Matters Now • Immediate Catalysts
                    </h2>
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      Tier-1 Volatility Alert
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {whatMattersNow.map(event => (
                      <div 
                        key={event.id} 
                        onClick={() => setSelectedEvent(event)}
                        className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800/80 rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all duration-200 shadow-2xs hover:shadow-md"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                        
                        <div className="flex justify-between items-center mb-2 pl-1">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            {event.countryCode} • {event.category}
                          </span>
                          <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60">
                            HIGH IMPACT
                          </span>
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-2 leading-snug pl-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {event.name}
                        </h3>

                        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pl-1 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 text-[11px] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                            Inspect <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* UPCOMING EVENTS */}
              <UpcomingEventsSection 
                events={NEWS_EVENTS}
                onSelectEvent={(ev) => setSelectedEvent(ev)}
                timezone={newsSettings.timezone}
              />

              {/* MARKET IMPACT & REACTION PANEL (Before / At / After release) */}
              <MarketImpactSection />

              {/* LATEST NEWS FEED WITH STORY CLUSTERING & PERSONAL RELEVANCE */}
              {feedNews.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Prioritized Market Briefings
                    </h2>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full shadow-2xs">
                      {feedNews.length} Stories
                    </span>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {feedNews.map(article => (
                      <VisualNewsCard 
                        key={article.id} 
                        article={article} 
                        onClick={() => setSelectedArticle(article)} 
                        onOpenCluster={(clusterId) => handleOpenCluster(clusterId)}
                        onSelectIndicator={(code) => handleSelectIndicator(code)}
                        onSelectEvent={(id) => {
                          const ev = NEWS_EVENTS.find(e => e.id === id);
                          if (ev) setSelectedEvent(ev);
                        }}
                        onToggleBookmark={(id) => handleToggleArticleBookmark(id)}
                        isBookmarked={(newsSettings.bookmarkedArticleIds || []).includes(article.id)}
                        userTradedMarkets={userTradedMarkets}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* WEEKLY TIMELINE SUMMARY */}
              <section className="pt-4">
                <EventTimeline 
                  events={NEWS_EVENTS} 
                  onSelectEvent={(ev) => setSelectedEvent(ev)} 
                />
              </section>
            </>
          )}

        </main>
      )}
        </>
      )}

      {/* ARTICLE DETAIL MODAL */}
      {selectedArticle && (
        <VisualNewsArticleModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)}
          onNavigateToAcademy={(topic) => {
            setSelectedArticle(null);
            handleTabChange('academy');
          }}
        />
      )}

      {/* EVENT DETAIL MODAL */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setSelectedEvent(null);
            if (initialEventId) {
              const params = new URLSearchParams(searchParams);
              params.delete('eventId');
              setSearchParams(params);
            }
          }}
          timezone={newsSettings.timezone}
          userNote={newsSettings.userNotes?.[selectedEvent.id] || ''}
          onSaveNote={(id, note) => {
            handleUpdateSettings({
              userNotes: { ...(newsSettings.userNotes || {}), [id]: note }
            });
          }}
          isWatchlisted={(newsSettings.watchlistedEventIds || []).includes(selectedEvent.id)}
          onToggleWatchlist={(id) => {
            const current = newsSettings.watchlistedEventIds || [];
            const updatedList = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
            handleUpdateSettings({ watchlistedEventIds: updatedList });
          }}
          onOpenAcademy={() => {
            setSelectedEvent(null);
            handleTabChange('academy');
          }}
          onSelectArticle={(article) => {
            setSelectedArticle(article);
          }}
          onSelectRelatedEvent={(id) => {
            const ev = NEWS_EVENTS.find(e => e.id === id);
            if (ev) setSelectedEvent(ev);
          }}
        />
      )}

      {/* MULTI-SOURCE COMPARISON MODAL */}
      {selectedCluster && (
        <MultiSourceComparisonModal
          cluster={selectedCluster}
          isOpen={Boolean(selectedCluster)}
          onClose={() => setSelectedCluster(null)}
          onSelectEvent={(id) => {
            const ev = NEWS_EVENTS.find(e => e.id === id);
            if (ev) setSelectedEvent(ev);
          }}
          onSelectIndicator={(code) => handleSelectIndicator(code)}
        />
      )}

      {/* NEWS SETTINGS MODAL */}
      <NewsSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={newsSettings}
        onSaveSettings={(newSettings) => {
          setNewsSettings(newSettings);
          saveStoredNewsSettings(newSettings);
        }}
      />

    </div>
  );
}

function TimeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all border ${
        active 
          ? 'bg-blue-600 border-blue-600 text-white shadow-2xs' 
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {label}
    </button>
  );
}
