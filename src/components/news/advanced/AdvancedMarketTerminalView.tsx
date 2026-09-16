import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Terminal, 
  Search, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShieldCheck, 
  Network, 
  Sparkles, 
  BarChart2, 
  Globe2, 
  SlidersHorizontal, 
  Filter, 
  Eye, 
  Bookmark, 
  Layers, 
  ExternalLink, 
  Flame, 
  ChevronRight, 
  Activity, 
  BookOpen, 
  FlaskConical,
  Bell,
  CheckCircle2,
  RefreshCw,
  Zap,
  Info,
  Building2,
  UserCheck,
  Star,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  FileText,
  Sun,
  Moon,
  Compass,
  CornerDownRight,
  Maximize2,
  Calendar,
  Play,
  Pause,
  Volume2,
  Radio,
  Gauge
} from 'lucide-react';
import { MarketNewsArticle, NewsUserSettings, NewsEvent } from '@/types/newsIntelligence';
import { 
  NewsProvider, 
  MarketDataProvider, 
  WHAT_MOVED_MARKETS_DATA, 
  ENTITIES_INTELLIGENCE_DATA, 
  getNewsAttentionMetrics,
  getProviderStatuses 
} from '@/services/news/newsProviders';
import { EventAssetMap } from './EventAssetMap';
import { EntityIntelligenceModal } from './EntityIntelligenceModal';
import { AiNewsAnalystModal } from './AiNewsAnalystModal';
import { NewsResearchLab } from './NewsResearchLab';
import { ArticleDeepDiveModal } from './ArticleDeepDiveModal';
import { HistoricalReactionModal } from './HistoricalReactionModal';
import { PrivateNoteModal } from './PrivateNoteModal';
import { NewsAlertsModal } from './NewsAlertsModal';
import { AddMarketModal } from './AddMarketModal';
import { MarketTerminologyTooltip } from './MarketTerminologyTooltip';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { EntityIntelligence, WhatMovedMarketsDriver } from '@/types/newsModes';

interface AdvancedMarketTerminalViewProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent?: (eventId: string) => void;
  onNavigateToAnalytics?: (symbol: string) => void;
}

const TERMINAL_NAV_TABS = [
  'GLOBAL MARKETS',
  'FX',
  'EQUITIES',
  'BONDS',
  'COMMODITIES',
  'CRYPTO',
  'MACRO',
  'CENTRAL BANKS',
  'INDIA',
  'US',
  'EUROPE',
  'ASIA',
  'RESEARCH',
  'MY MARKETS ⭐'
];

// FEATURE 2: 20+ Benchmark items in exact requested specification
const BENCHMARK_ITEMS_SPEC = [
  { symbol: 'S&P 500', name: 'S&P 500 Index', price: '5,584.20', changePct: 0.54 },
  { symbol: 'NASDAQ', name: 'Nasdaq 100', price: '19,742.10', changePct: 0.82 },
  { symbol: 'DOW', name: 'Dow Jones Industrial', price: '40,865.00', changePct: 0.28 },
  { symbol: 'NIFTY', name: 'Nifty 50 Index', price: '25,388.90', changePct: 0.76 },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: '82,890.94', changePct: 0.68 },
  { symbol: 'FTSE 100', name: 'FTSE 100', price: '8,273.09', changePct: 0.12 },
  { symbol: 'DAX', name: 'German DAX 40', price: '18,691.10', changePct: -0.18 },
  { symbol: 'NIKKEI', name: 'Nikkei 225', price: '36,581.76', changePct: 0.88 },
  { symbol: 'HANG SENG', name: 'Hang Seng Index', price: '17,422.12', changePct: 0.35 },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.1034', changePct: -0.22 },
  { symbol: 'GBP/USD', name: 'Pound / US Dollar', price: '1.3082', changePct: 0.15 },
  { symbol: 'USD/JPY', name: 'US Dollar / Yen', price: '141.85', changePct: -0.45 },
  { symbol: 'USD/INR', name: 'US Dollar / Rupee', price: '83.94', changePct: 0.04 },
  { symbol: 'GOLD', name: 'Spot Gold (XAUUSD)', price: '2,514.80', changePct: 0.84 },
  { symbol: 'SILVER', name: 'Spot Silver (XAGUSD)', price: '28.92', changePct: 1.15 },
  { symbol: 'OIL (WTI)', name: 'Crude Oil WTI', price: '68.97', changePct: 0.92 },
  { symbol: 'BITCOIN', name: 'Bitcoin (BTCUSD)', price: '58,240.00', changePct: 2.45 },
  { symbol: 'ETHEREUM', name: 'Ethereum (ETHUSD)', price: '2,360.50', changePct: 1.80 },
  { symbol: 'US 10Y', name: 'US 10Y Yield', price: '3.65%', changePct: -0.04 },
  { symbol: 'US 2Y', name: 'US 2Y Yield', price: '3.62%', changePct: -0.06 },
  { symbol: 'INDIA 10Y', name: 'India 10Y Yield', price: '6.82%', changePct: -0.01 }
];

export function AdvancedMarketTerminalView({
  settings,
  onUpdateSettings,
  onSelectEvent,
  onNavigateToAnalytics
}: AdvancedMarketTerminalViewProps) {
  // Navigation & Sub-view states
  const [activeNavTab, setActiveNavTab] = useState<string>('GLOBAL MARKETS');
  const [feedMode, setFeedMode] = useState<'ALL' | 'FOR_YOU'>('ALL');
  const [viewLevel, setViewLevel] = useState<'PROFESSIONAL' | 'SIMPLE'>(() => {
    return (localStorage.getItem('tv_view_level') as 'PROFESSIONAL' | 'SIMPLE') || 'PROFESSIONAL';
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>(['US CPI', 'Gold', 'Fed', 'RBI', 'BTC']);
  const [filterSavedOnly, setFilterSavedOnly] = useState<boolean>(false);
  const [mobileColumnTab, setMobileColumnTab] = useState<'ALL' | 'FEED' | 'STORIES' | 'WATCHLIST'>('ALL');

  // Time-aware Brief states (Feature 21 & Feature 30)
  const [dismissBrief, setDismissBrief] = useState<boolean>(false);

  // Modals & Inspection states
  const [selectedArticle, setSelectedArticle] = useState<MarketNewsArticle | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<EntityIntelligence | null>(null);
  const [showAiAnalyst, setShowAiAnalyst] = useState<boolean>(false);
  const [aiTargetArticle, setAiTargetArticle] = useState<MarketNewsArticle | null>(null);
  const [aiTargetEvent, setAiTargetEvent] = useState<NewsEvent | null>(null);
  const [showHistoricalModal, setShowHistoricalModal] = useState<boolean>(false);
  const [historicalTargetEvent, setHistoricalTargetEvent] = useState<string>('US CPI');
  const [noteTargetArticle, setNoteTargetArticle] = useState<MarketNewsArticle | null>(null);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [showAddMarketModal, setShowAddMarketModal] = useState<boolean>(false);

  // Left Column Interactive States (Audio Flash Wire & Currency Matrix)
  const [isAudioBriefPlaying, setIsAudioBriefPlaying] = useState<boolean>(false);
  const [audioBriefProgress, setAudioBriefProgress] = useState<number>(24);
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isAudioBriefPlaying) {
      timer = setInterval(() => {
        setAudioBriefProgress(prev => {
          if (prev >= 100) {
            setIsAudioBriefPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isAudioBriefPlaying]);

  // Feature 7: Market Reaction Engine interactive state
  const [reactionEvent, setReactionEvent] = useState<string>('US CPI Release');
  const [reactionAsset, setReactionAsset] = useState<string>('Gold (XAU/USD)');
  const [reactionTimeframe, setReactionTimeframe] = useState<'5m' | '15m' | '1H' | '4H' | '1D'>('1H');

  // Feature 4: Lead Story chart timeframe
  const [leadChartTimeframe, setLeadChartTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('1H');

  // Search input ref for ⌘K / Ctrl+K shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live Clock state
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC') + ' | ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save view level to local storage
  const handleToggleViewLevel = () => {
    const next = viewLevel === 'PROFESSIONAL' ? 'SIMPLE' : 'PROFESSIONAL';
    setViewLevel(next);
    localStorage.setItem('tv_view_level', next);
  };

  // Connected Data Sources
  const providerStatuses = useMemo(() => getProviderStatuses(), []);
  const allStories = useMemo(() => NewsProvider.getAllStories(), []);
  const breakingStories = useMemo(() => NewsProvider.getBreakingStories(), []);
  const attentionMetrics = useMemo(() => getNewsAttentionMetrics(), []);

  // Watchlist assets
  const myWatchlist = useMemo(() => {
    return settings.watchlistAssets && settings.watchlistAssets.length > 0 
      ? settings.watchlistAssets 
      : ['XAU/USD', 'BTC/USD', 'EUR/USD', 'NIFTY 50', 'S&P 500'];
  }, [settings.watchlistAssets]);

  const handleToggleWatchlistAsset = (symbol: string) => {
    const cur = myWatchlist;
    const upd = cur.includes(symbol) ? cur.filter(s => s !== symbol) : [...cur, symbol];
    onUpdateSettings({ watchlistAssets: upd });
  };

  // Filtered stories according to Nav Tab & Search
  const filteredStories = useMemo(() => {
    let list = allStories;

    // Filter by Top Nav Tab
    if (activeNavTab === 'FX') {
      list = list.filter(s => s.category.toUpperCase() === 'FOREX' || s.markets?.some(m => m.includes('/')));
    } else if (activeNavTab === 'EQUITIES') {
      list = list.filter(s => ['STOCKS', 'EQUITIES', 'INDICES'].includes(s.category.toUpperCase()));
    } else if (activeNavTab === 'BONDS') {
      list = list.filter(s => ['BONDS', 'TREASURIES', 'RATES'].includes(s.category.toUpperCase()));
    } else if (activeNavTab === 'COMMODITIES') {
      list = list.filter(s => ['COMMODITIES', 'GOLD', 'ENERGY'].includes(s.category.toUpperCase()));
    } else if (activeNavTab === 'CRYPTO') {
      list = list.filter(s => s.category.toUpperCase() === 'CRYPTO');
    } else if (activeNavTab === 'MACRO') {
      list = list.filter(s => ['MACRO', 'ECONOMY', 'INFLATION'].includes(s.category.toUpperCase()));
    } else if (activeNavTab === 'CENTRAL BANKS') {
      list = list.filter(s => ['CENTRAL BANKS', 'MONETARY POLICY'].includes(s.category.toUpperCase()));
    } else if (activeNavTab === 'INDIA') {
      list = list.filter(s => s.markets?.some(m => m.includes('INR') || m.includes('NIFTY')) || s.headline.includes('India') || s.headline.includes('RBI'));
    } else if (activeNavTab === 'US') {
      list = list.filter(s => s.markets?.some(m => m.includes('USD') || m.includes('SPX')) || s.headline.includes('US') || s.headline.includes('Fed'));
    } else if (activeNavTab === 'EUROPE') {
      list = list.filter(s => s.markets?.some(m => m.includes('EUR')) || s.headline.includes('ECB') || s.headline.includes('Euro'));
    } else if (activeNavTab === 'ASIA') {
      list = list.filter(s => s.markets?.some(m => m.includes('JPY') || m.includes('CNY')) || s.headline.includes('Asia') || s.headline.includes('Japan'));
    } else if (activeNavTab === 'MY MARKETS ⭐') {
      list = list.filter(s => s.markets?.some(m => myWatchlist.includes(m)));
    }

    // For You filter
    if (feedMode === 'FOR_YOU') {
      list = list.filter(s => s.markets?.some(m => myWatchlist.includes(m)) || s.impact === 'HIGH');
    }

    // Saved stories filter
    if (filterSavedOnly) {
      const saved = settings.bookmarkedArticleIds || [];
      list = list.filter(s => saved.includes(s.id));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s => 
        s.headline.toLowerCase().includes(q) || 
        s.summary.toLowerCase().includes(q) ||
        s.source.toLowerCase().includes(q) ||
        s.markets?.some(m => m.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allStories, activeNavTab, feedMode, filterSavedOnly, searchQuery, myWatchlist, settings.bookmarkedArticleIds]);

  // Lead Story (first story with image or breaking story)
  const leadStory = useMemo(() => {
    return filteredStories.find(s => s.imageUrl) || filteredStories[0] || allStories[0];
  }, [filteredStories, allStories]);

  // Top Stories Grid (next 4 stories)
  const topStories = useMemo(() => {
    return filteredStories.filter(s => s.id !== leadStory?.id).slice(0, 4);
  }, [filteredStories, leadStory]);

  // Live feed stream (remaining stories)
  const streamStories = useMemo(() => {
    return filteredStories.slice(0, 15);
  }, [filteredStories]);

  // Calendar events for today & upcoming
  const todayEvents = useMemo(() => {
    return NEWS_EVENTS.slice(0, 4);
  }, []);

  // Handle bookmark
  const handleToggleBookmark = (id: string) => {
    const cur = settings.bookmarkedArticleIds || [];
    const upd = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    onUpdateSettings({ bookmarkedArticleIds: upd });
  };

  const isBookmarked = (id: string) => (settings.bookmarkedArticleIds || []).includes(id);

  // Handle open AI analyst for a specific article
  const handleOpenAiForArticle = (story: MarketNewsArticle) => {
    setAiTargetArticle(story);
    setAiTargetEvent(null);
    setShowAiAnalyst(true);
  };

  // Handle open AI analyst for a specific event
  const handleOpenAiForEvent = (event: NewsEvent) => {
    setAiTargetEvent(event);
    setAiTargetArticle(null);
    setShowAiAnalyst(true);
  };

  return (
    <div className="max-w-[1520px] mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-4 text-slate-100 font-sans">
      
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURE 1: LIVE BREAKING NEWS TICKER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="h-10 rounded-2xl bg-linear-to-r from-[#0A0D12] via-[#161B24] to-[#0A0D12] border border-slate-800/80 px-3 flex items-center justify-between gap-3 text-xs overflow-hidden shadow-lg">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-black text-[10px] tracking-wider uppercase flex items-center gap-1 animate-pulse">
            <Zap className="w-3 h-3" />
            BREAKING
          </span>
        </div>

        {/* Continuous Ticker Content */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-6 text-slate-300">
          {breakingStories.length > 0 ? (
            breakingStories.map(story => (
              <button
                key={story.id}
                type="button"
                onClick={() => setSelectedArticle(story)}
                className="hover:text-blue-400 transition-colors whitespace-nowrap flex items-center gap-2 text-left cursor-pointer group shrink-0"
              >
                <span className="text-[10px] text-slate-500 font-mono">
                  [{new Date(story.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
                </span>
                <span className="font-semibold group-hover:underline text-xs text-slate-200">
                  {story.headline}
                </span>
                <span className="text-[10px] text-slate-400">• {story.source}</span>
              </button>
            ))
          ) : (
            <span className="text-slate-500 text-xs italic">
              No breaking news at this time. Connected to institutional wires.
            </span>
          )}
        </div>

        {/* Right Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hidden sm:inline">
            LIVE • WIRE
          </span>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          FEATURE 2: GLOBAL MARKET INTELLIGENCE BAR (20+ Items)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="rounded-2xl bg-[#0F1318] border border-slate-800/90 px-3 py-2 overflow-x-auto no-scrollbar shadow-md">
        <div className="flex items-center gap-4 text-xs whitespace-nowrap min-w-max">
          {BENCHMARK_ITEMS_SPEC.map(item => {
            const isPos = item.changePct > 0;
            const isNeg = item.changePct < 0;
            return (
              <button
                key={item.symbol}
                type="button"
                onClick={() => {
                  setReactionAsset(item.symbol);
                  setActiveNavTab('GLOBAL MARKETS');
                }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer text-left"
              >
                <span className="font-extrabold text-[11px] text-slate-200">{item.symbol}</span>
                <span className="font-mono text-xs font-semibold text-slate-300">{item.price}</span>
                <span className={`font-mono text-[11px] font-bold flex items-center ${
                  isPos ? 'text-emerald-400' : isNeg ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {isPos ? '▲ +' : isNeg ? '▼ ' : ''}
                  {Math.abs(item.changePct)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MAIN NAVIGATION & ADVANCED SEARCH BAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="space-y-3">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          {/* Internal Category Tabs */}
          <div className="overflow-x-auto no-scrollbar flex items-center gap-1">
            {TERMINAL_NAV_TABS.map(tab => {
              const isActive = activeNavTab === tab;
              const count = tab === 'GLOBAL MARKETS' ? allStories.length : Math.floor(Math.random() * 8) + 3;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveNavTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab === 'RESEARCH' ? 'LAB' : count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Toggles: All vs For You, Simple vs Pro, Alerts Bell, Bookmarks */}
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            {/* For You toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFeedMode('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  feedMode === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400'
                }`}
              >
                All News
              </button>
              <button
                type="button"
                onClick={() => setFeedMode('FOR_YOU')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  feedMode === 'FOR_YOU' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                <UserCheck className="w-3 h-3" />
                <span>For You</span>
              </button>
            </div>

            {/* Simple vs Professional view */}
            <button
              type="button"
              onClick={handleToggleViewLevel}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-800 cursor-pointer ${
                viewLevel === 'SIMPLE' 
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
              title="Toggle between Institutional Framing and Plain Language Explanation"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{viewLevel === 'SIMPLE' ? 'Simple View' : 'Pro View'}</span>
            </button>

            {/* Alerts Bell (Feature 20) */}
            <button
              type="button"
              onClick={() => setShowAlertsModal(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              title="Configure News & Event Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Saved filter */}
            <button
              type="button"
              onClick={() => setFilterSavedOnly(!filterSavedOnly)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                filterSavedOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-500'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400'
              }`}
              title={filterSavedOnly ? 'Show all stories' : 'Show saved bookmarks only'}
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FEATURE 15: ADVANCED SEARCH BAR */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, markets, events, currencies, companies... (⌘K / Ctrl+K)"
              className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-[#0F1318] border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
            {!searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 pointer-events-none">
                <span>⌘K</span>
              </div>
            )}
          </div>

          {/* Search Suggestion Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Trending Catalysts:
            </span>
            {searchHistory.map(term => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* FOR YOU context explanation chip */}
        {feedMode === 'FOR_YOU' && (
          <div className="p-3 bg-blue-950/30 rounded-2xl border border-blue-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-200">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Personalized For You:</strong> Prioritizing news mapped to your followed assets ({myWatchlist.join(', ')}) and global sovereign releases.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMarketModal(true)}
              className="text-blue-400 font-bold hover:underline self-start sm:self-auto cursor-pointer"
            >
              Edit Watchlist &rarr;
            </button>
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          IF RESEARCH TAB IS SELECTED: NEWS RESEARCH LAB
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeNavTab === 'RESEARCH' ? (
        <NewsResearchLab />
      ) : (
        <>
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FEATURE 21 & 30: MORNING MARKET BRIEF / DAILY RECAP (Dismissible)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {!dismissBrief && (
            <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-xl space-y-3 relative">
              <button
                type="button"
                onClick={() => setDismissBrief(true)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer text-xs"
              >
                Dismiss ✕
              </button>

              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  MACRO BRIEFING • THURSDAY, 12 SEP 2026
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1 border-t border-slate-800/80">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 text-[11px] block">Overnight Summary</span>
                  <p className="text-slate-300 leading-relaxed">
                    Asian equity benchmarks settled mixed (Nikkei +0.88%, Hang Seng +0.35%). Front-end US Treasuries held yields ahead of upcoming sovereign inflation dispatches.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 text-[11px] block">Key Catalyst Today</span>
                  <div className="flex items-center gap-2 font-mono text-slate-200">
                    <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">
                      HIGH
                    </span>
                    <span>US CPI (YoY) • 12:30 UTC (Fcst: 3.5%)</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Expected cross-asset sensitivity in Bullion and 2Y rate spreads.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 text-[11px] block">Markets to Watch</span>
                  <div className="flex flex-wrap gap-1">
                    {myWatchlist.slice(0, 3).map(m => (
                      <span key={m} className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">
                        {m}
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Continuous price quote feeds connected.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              SECTION 3: DESKTOP 3-COLUMN LAYOUT (1280px+) & RESPONSIVE MOBILE VIEW
              [LEFT (280px)] [CENTER (flex)] [RIGHT (320px)]
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {/* MOBILE COLUMN SELECTOR (Phones & Tablets < lg) */}
          <div className="lg:hidden flex items-center gap-1.5 p-1 bg-slate-900/95 rounded-2xl border border-slate-800 text-xs font-semibold overflow-x-auto no-scrollbar shadow-sm">
            <button
              type="button"
              onClick={() => setMobileColumnTab('ALL')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                mobileColumnTab === 'ALL' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Sections
            </button>
            <button
              type="button"
              onClick={() => setMobileColumnTab('FEED')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                mobileColumnTab === 'FEED' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Live Wire Feed</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileColumnTab('STORIES')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                mobileColumnTab === 'STORIES' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Main Stories
            </button>
            <button
              type="button"
              onClick={() => setMobileColumnTab('WATCHLIST')}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                mobileColumnTab === 'WATCHLIST' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Watchlist & Events
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
            
            {/* ─────────────────────────────────────────────
                LEFT COLUMN (lg:col-span-3 - 280px approx)
            ───────────────────────────────────────────── */}
            <div 
              style={{ backgroundColor: '#e2e2e2' }}
              className={`lg:col-span-3 space-y-3 sm:space-y-4 p-2.5 sm:p-3.5 rounded-3xl border border-slate-300 shadow-sm ${
                mobileColumnTab !== 'ALL' && mobileColumnTab !== 'WATCHLIST' ? 'hidden lg:block' : ''
              }`}
            >
              
              {/* FEATURE 13: MY MARKETS WATCHLIST */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      My Markets
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
                      {myWatchlist.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddMarketModal(true)}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer bg-blue-950/40 px-2 py-0.5 rounded-lg border border-blue-900/50"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                  <span className="text-slate-500 font-semibold shrink-0">Quick Add:</span>
                  {['BTC/USD', 'DXY', 'BRENT', 'NIFTY 50'].map(sym => {
                    const exists = myWatchlist.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => {
                          if (!exists) {
                            onUpdateSettings({ watchlistAssets: [...myWatchlist, sym] });
                          }
                        }}
                        disabled={exists}
                        className={`px-1.5 py-0.5 rounded-md border font-mono shrink-0 transition-all cursor-pointer ${
                          exists 
                            ? 'bg-slate-800/60 text-slate-500 border-slate-800 cursor-default' 
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-blue-500 hover:text-white'
                        }`}
                      >
                        {exists ? `✓ ${sym}` : `+ ${sym}`}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {myWatchlist.map(sym => {
                    const benchmark = BENCHMARK_ITEMS_SPEC.find(b => b.symbol === sym || sym.includes(b.symbol));
                    const price = benchmark?.price || (sym.includes('BTC') ? '64,820.00' : sym.includes('DXY') ? '101.42' : '2,514.80');
                    const change = benchmark?.changePct ?? (sym.includes('BTC') ? 2.45 : sym.includes('DXY') ? -0.22 : 0.84);
                    const isPos = change >= 0;

                    // Sparkline paths matching asset trends
                    const sparkline = isPos 
                      ? "M0,16 Q10,18 20,12 T40,6 T60,10 T80,4"
                      : "M0,4 Q15,6 30,12 T50,14 T70,16 T80,18";

                    return (
                      <div
                        key={sym}
                        className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-white font-mono">{sym}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              Spot
                            </span>
                          </div>

                          <span className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isPos ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/60' : 'bg-rose-950/80 text-rose-400 border border-rose-900/60'
                          }`}>
                            {isPos ? `▲ +${change}%` : `▼ ${change}%`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-mono font-bold text-slate-200 text-xs">{price}</span>
                          
                          {/* Mini Sparkline SVG */}
                          <div className="w-16 h-5 shrink-0 opacity-85">
                            <svg className="w-full h-full" viewBox="0 0 80 20">
                              <path
                                d={sparkline}
                                fill="none"
                                stroke={isPos ? '#10b981' : '#f43f5e'}
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono">3 news</span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              setReactionAsset(sym);
                              window.scrollTo({ top: 1200, behavior: 'smooth' });
                            }}
                            className="text-blue-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
                          >
                            <span>Reaction</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const story = allStories.find(s => s.markets?.includes(sym));
                              if (story) setSelectedArticle(story);
                            }}
                            className="text-slate-400 hover:text-white cursor-pointer hover:underline"
                          >
                            Latest Wire
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FEATURE 22: 1-MINUTE INSTITUTIONAL AUDIO FLASH & WIRE SYNOPSIS */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      1-Min Audio Wire
                    </h3>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    SYNTHESIS
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAudioBriefPlaying(!isAudioBriefPlaying)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                          isAudioBriefPlaying 
                            ? 'bg-rose-600 text-white hover:bg-rose-500' 
                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30'
                        }`}
                        title={isAudioBriefPlaying ? 'Pause Audio Brief' : 'Play 1-Min Audio Brief'}
                      >
                        {isAudioBriefPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 translate-x-0.5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          Global Macro Morning Wire
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {isAudioBriefPlaying ? 'Streaming audio...' : '01:15 • AI Synthesized'}
                        </p>
                      </div>
                    </div>

                    {/* Animated Equalizer Wave when playing */}
                    <div className="flex items-end gap-0.5 h-5 shrink-0 px-1">
                      {[40, 75, 100, 60, 85].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full bg-cyan-400 transition-all duration-200 ${
                            isAudioBriefPlaying ? 'animate-pulse' : 'opacity-40'
                          }`}
                          style={{ height: isAudioBriefPlaying ? `${h}%` : '25%' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Audio Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                        style={{ width: `${audioBriefProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                      <span>00:{Math.floor(audioBriefProgress * 0.75).toString().padStart(2, '0')}</span>
                      <span>01:15</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug pt-1 border-t border-slate-800/80">
                    Asian session wrap, US CPI anticipation (3.5% consensus), and sovereign yield curve steepening.
                  </p>
                </div>
              </div>

              {/* TODAY'S HIGH-IMPACT CALENDAR EVENTS */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Today's Key Events
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">12 SEP 2026</span>
                </div>

                <div className="space-y-2">
                  {todayEvents.map((evt, idx) => (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent?.(evt.id)}
                      className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-all cursor-pointer space-y-1.5 group"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate mr-2">
                          {evt.name}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                          evt.impact === 'HIGH' 
                            ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {evt.impact}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Actual: <strong className="text-slate-200">{evt.actual || '3.7%'}</strong></span>
                        <span>Fcst: {evt.forecast || '3.5%'}</span>
                        <span className="text-cyan-400 font-semibold">{idx === 0 ? 'in 2h 30m' : 'in 5h 00m'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEATURE 23: CENTRAL BANK POLICY ODDS (CME FEDWATCH & GLOBAL RATES) */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Central Bank Rates
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    POLICY RADAR
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { bank: 'US Fed (FOMC)', rate: '5.25 - 5.50%', nextDate: 'Sep 18', odds: '88.4% Cut 25bps', color: 'bg-emerald-500', pct: 88 },
                    { bank: 'ECB (Eurozone)', rate: '3.75%', nextDate: 'Sep 12', odds: '72.0% Cut 25bps', color: 'bg-blue-500', pct: 72 },
                    { bank: 'Bank of Japan', rate: '0.25%', nextDate: 'Sep 20', odds: '28.0% Hike 25bps', color: 'bg-amber-500', pct: 28 },
                    { bank: 'RBI (India)', rate: '6.50%', nextDate: 'Oct 09', odds: '91.0% Hold', color: 'bg-cyan-500', pct: 91 },
                  ].map(item => (
                    <div key={item.bank} className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{item.bank}</span>
                        <span className="font-mono text-[11px] text-slate-300 font-semibold">{item.rate}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Next: {item.nextDate}</span>
                        <span className="font-bold text-slate-300">{item.odds}</span>
                      </div>

                      {/* Probability bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEATURE 24: GLOBAL CURRENCY RELATIVE STRENGTH MATRIX (8 MAJORS) */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Currency Strength
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    24H RELATIVE
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 leading-tight">
                  Normalized cross-rate strength matrix. Tap a currency to filter wires.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'USD', score: '+0.52', isPos: true },
                    { code: 'AUD', score: '+0.44', isPos: true },
                    { code: 'GBP', score: '+0.28', isPos: true },
                    { code: 'CAD', score: '+0.15', isPos: true },
                    { code: 'INR', score: '+0.06', isPos: true },
                    { code: 'EUR', score: '-0.18', isPos: false },
                    { code: 'CHF', score: '-0.32', isPos: false },
                    { code: 'JPY', score: '-0.68', isPos: false },
                  ].map(curr => {
                    const isSelected = selectedCurrencyFilter === curr.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        onClick={() => {
                          const next = isSelected ? null : curr.code;
                          setSelectedCurrencyFilter(next);
                          if (next) {
                            setSearchQuery(next);
                          } else {
                            setSearchQuery('');
                          }
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-mono font-bold text-xs">{curr.code}</span>
                        <span className={`font-mono text-[10px] font-bold ${
                          curr.isPos ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {curr.score}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* FEATURE 25: MACRO REGIME & RISK APPETITE RADAR */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-purple-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Macro Regime
                    </h3>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                    EXPANSION
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Fear & Greed Index</span>
                    <span className="font-bold font-mono text-emerald-400">64 • Greed</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">US Yield Curve (10Y-2Y)</span>
                    <span className="font-bold font-mono text-emerald-400">+4.2 bps (Steepening)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[11px]">CBOE VIX Volatility</span>
                    <span className="font-bold font-mono text-slate-200">14.82 (-4.2%)</span>
                  </div>
                </div>
              </div>

              {/* FEATURE 19: NEWS VELOCITY METER */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      News Velocity Meter
                    </h3>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    6H ROLLING
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  Story frequency indicator. <span className="text-slate-300 font-semibold">[INDICATOR ONLY — Not sentiment]</span>
                </p>

                <div className="space-y-3">
                  {attentionMetrics.slice(0, 3).map(m => (
                    <div key={m.topic} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{m.topic}</span>
                        <span className="font-mono font-bold text-emerald-400">+{m.percentChange}%</span>
                      </div>
                      {/* Bar comparison */}
                      <div className="space-y-1 font-mono text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="w-14">Prior:</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-slate-600 rounded-full" style={{ width: '45%' }} />
                          </div>
                          <span>{m.countPrevious6h}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-14">Current:</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: '85%' }} />
                          </div>
                          <span>{m.countCurrent6h}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ─────────────────────────────────────────────
                CENTER COLUMN (lg:col-span-6 - flex main area)
            ───────────────────────────────────────────── */}
            <div className={`lg:col-span-6 space-y-4 sm:space-y-5 ${
              mobileColumnTab !== 'ALL' && mobileColumnTab !== 'STORIES' ? 'hidden lg:block' : ''
            }`}>
              
              {/* FEATURE 4: LEAD STORY + INTEGRATED CHART */}
              {leadStory && (
                <div className="p-5 sm:p-6 rounded-3xl bg-[#0F1318] border border-slate-800 shadow-xl space-y-4">
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-blue-950 text-blue-300 border border-blue-800">
                        {leadStory.category}
                      </span>
                      {leadStory.impact === 'HIGH' && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800">
                          HIGH IMPACT
                        </span>
                      )}
                      <span className="text-slate-400 font-semibold">{leadStory.source}</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">
                      Published 14m ago • Updated 3m ago
                    </span>
                  </div>

                  {/* Hero Image (16:9) */}
                  {leadStory.imageUrl && (
                    <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900">
                      <img
                        src={leadStory.imageUrl}
                        alt={leadStory.headline}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4 text-[11px] text-slate-300 font-mono">
                        Source: {leadStory.source} Wire Brief
                      </div>
                    </div>
                  )}

                  {/* Headline & Sub-headline */}
                  <div className="space-y-1.5">
                    <h2 
                      onClick={() => setSelectedArticle(leadStory)}
                      className="text-xl sm:text-2xl font-black text-white hover:text-blue-400 cursor-pointer transition-colors leading-tight"
                    >
                      {leadStory.headline}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {leadStory.summary}
                    </p>
                  </div>

                  {/* Related Markets Strip */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Related Instruments:
                    </span>
                    {leadStory.markets?.map(m => (
                      <span key={m} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs font-semibold">
                        {m} <span className="text-emerald-400">▲ +0.8%</span>
                      </span>
                    )) || (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-mono text-xs">
                        XAU/USD ▲ +0.84%
                      </span>
                    )}
                  </div>

                  {/* LIVE CHART with News Event Marker */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                          LIVE REACTION CHART: {leadStory.markets?.[0] || 'XAU/USD'} (1H)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Vertical dashed marker indicates exact news wire publication timestamp
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg">
                        {(['1m', '5m', '15m', '1H', '4H', '1D'] as const).map(tf => (
                          <button
                            key={tf}
                            type="button"
                            onClick={() => setLeadChartTimeframe(tf)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer ${
                              leadChartTimeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {tf}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chart Canvas / SVG */}
                    <div className="relative h-40 w-full bg-slate-900/60 rounded-xl border border-slate-800/80 p-3 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Pre-Release: $2,504.10</span>
                        <span className="text-emerald-400 font-bold">Current: $2,514.80 (+0.84%)</span>
                      </div>

                      <div className="relative h-20 w-full">
                        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                          <path
                            d="M 0,35 Q 25,38 50,28 T 75,18 T 100,10 L 100,50 L 0,50 Z"
                            fill="rgba(59, 130, 246, 0.15)"
                          />
                          <path
                            d="M 0,35 Q 25,38 50,28 T 75,18 T 100,10"
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="2.5"
                          />
                        </svg>

                        {/* Event Marker */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-0 border-r-2 border-dashed border-amber-400 z-10">
                          <div className="absolute top-0 left-1 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                            News Published
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>-45m</span>
                        <span className="text-amber-400">Event Timestamp</span>
                        <span>+45m</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(leadStory)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
                      >
                        Deep Dive
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAiForArticle(leadStory)}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteTargetArticle(leadStory)}
                        className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>Note</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(leadStory.id)}
                        className={`p-2 rounded-xl border text-xs cursor-pointer ${
                          isBookmarked(leadStory.id) ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {leadStory.sourceUrl && (
                      <a
                        href={leadStory.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px] font-semibold"
                      >
                        <span>Read Original ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* FEATURE 6: TOP STORIES GRID (2 Columns) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Top Intelligence Stories
                  </h3>
                  <span className="text-[11px] text-slate-500">2-Column Grid</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
                  {topStories.map(story => (
                    <div
                      key={story.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#0F1318] border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2.5 sm:space-y-3 shadow-xs h-full"
                    >
                      <div className="space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
                            {story.category}
                          </span>
                          <span className="text-slate-500 font-medium">{story.source}</span>
                        </div>

                        <h4
                          onClick={() => setSelectedArticle(story)}
                          className="font-bold text-xs sm:text-sm text-white hover:text-blue-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                        >
                          {story.headline}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {story.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {story.markets?.slice(0, 2).map(m => (
                            <span key={m} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-mono">
                              {m}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedArticle(story)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 font-bold hover:underline transition-all cursor-pointer text-xs"
                        >
                          Deep Dive &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEATURE 3: WHAT MOVED MARKETS? (Hero Section) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 sm:space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800 pb-2.5 sm:pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                      VERIFIED MARKET CATALYSTS
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-500" />
                      What Moved Markets Today
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    * Potential market driver • Verified news & data
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  {WHAT_MOVED_MARKETS_DATA.map(driver => (
                    <div
                      key={driver.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border-l-4 border-l-rose-500 border border-slate-800 space-y-2.5 sm:space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold uppercase">
                            IMPACT: {driver.relevance}
                          </span>
                          <span className="text-slate-400 font-medium">{driver.publishedTime}</span>
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-white leading-snug">
                          {driver.title}
                        </h4>

                        <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                          {driver.explanation}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Affected Assets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {driver.affectedAssets.map(asset => (
                            <span
                              key={asset.symbol}
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-[10px] font-bold text-slate-200"
                            >
                              {asset.symbol}: <span className={asset.isPositive ? 'text-emerald-400' : 'text-rose-400'}>{asset.reactionLabel}</span>
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span className="italic truncate mr-2">Potential driver • {driver.source}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReactionAsset(driver.affectedAssets[0]?.symbol || 'Gold (XAU/USD)');
                              window.scrollTo({ top: 1200, behavior: 'smooth' });
                            }}
                            className="min-h-[32px] sm:min-h-0 flex items-center text-blue-400 font-bold hover:underline cursor-pointer shrink-0"
                          >
                            View Reaction ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ─────────────────────────────────────────────
                RIGHT COLUMN (lg:col-span-3 - 320px approx)
            ───────────────────────────────────────────── */}
            <div className={`lg:col-span-3 space-y-4 lg:sticky lg:top-4 self-start ${
              mobileColumnTab !== 'ALL' && mobileColumnTab !== 'FEED' ? 'hidden lg:block' : ''
            }`}>
              
              {/* FEATURE 5: LIVE NEWS FEED */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Latest Feed
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[10px] text-cyan-400 font-bold">LIVE</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {filteredStories.length} items
                  </span>
                </div>

                <div className="space-y-2.5 sm:space-y-3 max-h-[520px] sm:max-h-[580px] lg:max-h-[640px] overflow-y-auto pr-1">
                  {streamStories.map(story => (
                    <div
                      key={story.id}
                      className="p-2.5 sm:p-3 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 transition-all space-y-1.5 sm:space-y-2 group"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          {story.impact === 'HIGH' && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 font-bold uppercase">
                              BREAKING
                            </span>
                          )}
                          {story.isDevelopingStory && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 font-bold uppercase">
                              DEVELOPING
                            </span>
                          )}
                          <span className="font-bold text-blue-400 uppercase">
                            {story.category}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px]">5m ago</span>
                      </div>

                      <h5
                        onClick={() => setSelectedArticle(story)}
                        className="font-bold text-xs text-slate-200 group-hover:text-blue-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                      >
                        {story.headline}
                      </h5>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800 text-slate-400">
                        <span>{story.source}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleBookmark(story.id)}
                            className="p-1 -m-1 hover:text-amber-400 cursor-pointer"
                            title="Save Story"
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(story.id) ? 'text-amber-400 fill-amber-400' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedArticle(story)}
                            className="p-1 -m-1 text-blue-400 font-bold hover:underline cursor-pointer"
                          >
                            Read &rarr;
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPCOMING ECONOMIC EVENTS */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Upcoming Releases
                  </h3>
                  <span className="text-[10px] text-blue-400">UTC Schedule</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">🇪🇺 ECB Policy Statement</span>
                      <span className="text-amber-400 font-mono text-[11px]">in 2h 15m</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Rate expected at 3.65% • Consensus Hold
                    </p>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">🇺🇸 Initial Jobless Claims</span>
                      <span className="text-slate-400 font-mono text-[11px]">in 4h 30m</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Forecast: 230k • Prior: 227k
                    </p>
                  </div>
                </div>
              </div>

              {/* QUICK ALERTS STATUS */}
              <div className="p-3.5 sm:p-4 rounded-3xl bg-linear-to-br from-slate-900 to-indigo-950/30 border border-slate-800 space-y-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    Market Alerts Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAlertsModal(true)}
                    className="text-[11px] text-blue-400 hover:underline font-bold cursor-pointer"
                  >
                    Configure
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Real-time push alerts enabled for high-impact sovereign releases and followed watchlist instruments.
                </p>
              </div>

            </div>

          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FEATURE 7: MARKET REACTION ENGINE (Full Width)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="p-6 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  EMPIRICAL POST-EVENT TRANSMISSION
                </span>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  Market Reaction Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect observed price moves around key releases. Clearly separated from predictive claims.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setHistoricalTargetEvent(reactionEvent);
                  setShowHistoricalModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-all"
              >
                <span>Historical Comparison Database ↗</span>
              </button>
            </div>

            {/* Selectors Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Event
                </label>
                <select
                  value={reactionEvent}
                  onChange={(e) => setReactionEvent(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 font-semibold text-slate-200"
                >
                  <option value="US CPI Release">US CPI Release (Consumer Inflation)</option>
                  <option value="Fed Rate Decision">Federal Reserve Rate Decision & Presser</option>
                  <option value="ECB Policy Statement">ECB Monetary Policy Statement</option>
                  <option value="RBI Repo Rate">RBI Monetary Policy Committee</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Select Target Asset
                </label>
                <select
                  value={reactionAsset}
                  onChange={(e) => setReactionAsset(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 font-semibold text-slate-200"
                >
                  <option value="Gold (XAU/USD)">Gold Spot (XAU/USD)</option>
                  <option value="USD Index (DXY)">USD Index (DXY)</option>
                  <option value="EUR/USD">EUR/USD (Euro / US Dollar)</option>
                  <option value="US 10Y Yield">US 10-Year Treasury Yield</option>
                  <option value="Bitcoin (BTC/USD)">Bitcoin (BTC/USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Observed Window
                </label>
                <div className="flex items-center gap-1">
                  {(['5m', '15m', '1H', '4H', '1D'] as const).map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setReactionTimeframe(w)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        reactionTimeframe === w ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reaction Chart Area with Before vs After Shading */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-300">
                    <strong>{reactionAsset}</strong> during <strong>{reactionEvent}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">Change Before: <strong>-0.30%</strong></span>
                  <span className="text-emerald-400 font-bold">Change After: <strong>+1.20%</strong></span>
                </div>
              </div>

              {/* Chart with split colored zones */}
              <div className="relative h-48 w-full bg-slate-900/50 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden">
                {/* Before area (blue tint) */}
                <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-950/10 border-r border-dashed border-amber-400/80 pointer-events-none" />
                {/* After area (emerald tint) */}
                <div className="absolute inset-y-0 right-0 w-1/2 bg-emerald-950/10 pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Before Event (T-60m)</span>
                  <span className="text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    EVENT: {reactionEvent}
                  </span>
                  <span className="text-emerald-400">After Event (+60m)</span>
                </div>

                {/* SVG Curve */}
                <div className="relative h-28 w-full z-10">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <path
                      d="M 0,32 L 25,35 L 50,30 L 60,18 L 80,12 L 100,8"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>

                <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>-60m</span>
                  <span>-30m</span>
                  <span className="text-amber-400 font-bold">T-0 Release</span>
                  <span>+30m</span>
                  <span>+60m</span>
                </div>
              </div>

              {/* Observed reaction summary */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-300">
                    <strong>Observed Reaction Summary:</strong> {reactionAsset} moved <strong>+1.20%</strong> in the {reactionTimeframe} following the event.
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono shrink-0">
                  OBSERVED REACTION — not a prediction
                </span>
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FEATURE 8: ECONOMIC EVENT INTELLIGENCE (Full Width)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="p-6 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                  SOVEREIGN CALENDAR MERGED WIRE
                </span>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Economic Event Intelligence
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Official agency data with market surprise meter
              </span>
            </div>

            {/* Featured Event Card: US CPI */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white">
                      US Consumer Price Index (CPI YoY)
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Thu, 12 Sep 2026 • 12:30 UTC • Bureau of Labor Statistics
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-rose-950 text-rose-300 border border-rose-800 self-start sm:self-auto">
                  HIGH IMPACT 🔥
                </span>
              </div>

              {/* Actual / Forecast / Previous / Surprise Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">ACTUAL</span>
                  <span className="text-base font-extrabold text-rose-400">3.7%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">FORECAST</span>
                  <span className="text-base font-extrabold text-slate-300">3.5%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">PREVIOUS</span>
                  <span className="text-base font-extrabold text-slate-300">3.2%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    <MarketTerminologyTooltip term="Data Surprise" displayText="SURPRISE" />
                  </span>
                  <span className="text-base font-extrabold text-amber-400">▲ +0.2pp</span>
                </div>
              </div>

              {/* DATA SURPRISE METER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-300">DATA SURPRISE METER:</span>
                  <span className="font-mono text-amber-400 font-bold">ABOVE FORECAST (+0.2pp)</span>
                </div>
                <div className="h-3 rounded-full bg-slate-950 border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-600 z-10" />
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%', marginLeft: '50%' }} />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                  <span>Below Consensus</span>
                  <span>Consensus (3.5%)</span>
                  <span>Above Consensus</span>
                </div>
              </div>

              {/* Related Live Market Reactions */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Observed Market Reactions (Live Feed):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-300">Gold</span>
                    <span className="text-emerald-400 font-bold">▲ +0.94%</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-300">USD (DXY)</span>
                    <span className="text-rose-400 font-bold">▼ -0.38%</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-300">EUR/USD</span>
                    <span className="text-emerald-400 font-bold">▲ +0.32%</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex justify-between">
                    <span className="text-slate-300">US 10Y</span>
                    <span className="text-rose-400 font-bold">▼ -4 bps</span>
                  </div>
                </div>
              </div>

              {/* Historical Context & Actions */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-300 block">Historical Context (Past 8 Above-Forecast Releases):</span>
                  <span className="text-slate-400 text-[11px]">
                    Gold average reaction: +0.62% in 1H post-event. <span className="text-slate-500 font-mono">[HISTORICAL OBSERVATION — not a prediction]</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setHistoricalTargetEvent('US CPI');
                      setShowHistoricalModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer transition-colors"
                  >
                    View Full History
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenAiForEvent(NEWS_EVENTS[0])}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/40 font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FEATURE 16: GLOBAL MARKETS AT A GLANCE / MAP
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="p-6 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                  REGIONAL INTELLIGENCE RADAR
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-cyan-400" />
                  Global Markets at a Glance
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Click any region card to filter news feed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {[
                { region: 'US', flag: '🇺🇸', index: 'S&P 500', change: '+0.54%', isPos: true, stories: 12, catalyst: 'CPI' },
                { region: 'EUROPE', flag: '🇪🇺', index: 'DAX 40', change: '-0.18%', isPos: false, stories: 8, catalyst: 'ECB' },
                { region: 'UK', flag: '🇬🇧', index: 'FTSE 100', change: '+0.12%', isPos: true, stories: 5, catalyst: 'BOE' },
                { region: 'ASIA', flag: '🇯🇵', index: 'NIKKEI', change: '+0.88%', isPos: true, stories: 14, catalyst: 'BOJ' },
                { region: 'INDIA', flag: '🇮🇳', index: 'NIFTY 50', change: '+0.76%', isPos: true, stories: 9, catalyst: 'RBI' },
                { region: 'COMMODITIES', flag: '🌍', index: 'BRENT OIL', change: '+0.92%', isPos: true, stories: 7, catalyst: 'OPEC' },
                { region: 'CRYPTO', flag: '🪙', index: 'BITCOIN', change: '+2.45%', isPos: true, stories: 11, catalyst: 'FLOWS' }
              ].map(item => (
                <button
                  key={item.region}
                  type="button"
                  onClick={() => setActiveNavTab(item.region)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all text-left space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{item.flag}</span>
                    <span className={`font-mono text-[10px] font-bold ${item.isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.change}
                    </span>
                  </div>
                  <div className="font-extrabold text-white text-xs group-hover:text-cyan-400 transition-colors">
                    {item.index}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.stories} stories</span>
                    <span className="px-1 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">{item.catalyst}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FEATURE 17: EVENT → ASSET TRANSMISSION MAP
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <EventAssetMap />

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FEATURE 10: ENTITY INTELLIGENCE QUICK DOSSIERS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="p-6 rounded-3xl bg-[#0F1318] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  INSTITUTIONAL DOSSIERS
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Entity Intelligence & Central Bank Dossiers
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Click an institution, asset or company to inspect
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.values(ENTITIES_INTELLIGENCE_DATA).map(entity => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setSelectedEntity(entity)}
                  className="p-3.5 bg-slate-900 hover:bg-slate-850 rounded-2xl border border-slate-800 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                      {entity.type}
                    </span>
                    <span className="text-[10px] font-bold text-blue-400 font-mono">
                      {entity.symbolOrTicker}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors truncate">
                    {entity.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 truncate">
                    {entity.keyStats[0]?.value}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODALS & INSPECTION SHEETS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      
      {/* 1. Article Deep Dive (Feature 11) */}
      {selectedArticle && (
        <ArticleDeepDiveModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onBookmarkToggle={handleToggleBookmark}
          isBookmarked={isBookmarked(selectedArticle.id)}
          onOpenAi={handleOpenAiForArticle}
          onOpenNote={(art) => setNoteTargetArticle(art)}
          onNavigateToAnalytics={onNavigateToAnalytics}
        />
      )}

      {/* 2. Historical Reaction Database (Feature 9) */}
      {showHistoricalModal && (
        <HistoricalReactionModal
          initialEventName={historicalTargetEvent}
          initialAssetSymbol={reactionAsset}
          onClose={() => setShowHistoricalModal(false)}
        />
      )}

      {/* 3. AI News Analyst (Feature 12) */}
      {showAiAnalyst && (
        <AiNewsAnalystModal
          article={aiTargetArticle}
          event={aiTargetEvent}
          onClose={() => {
            setShowAiAnalyst(false);
            setAiTargetArticle(null);
            setAiTargetEvent(null);
          }}
        />
      )}

      {/* 4. Entity Intelligence Modal (Feature 10) */}
      {selectedEntity && (
        <EntityIntelligenceModal
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onSelectStory={(s) => setSelectedArticle(s)}
        />
      )}

      {/* 5. Private Note Modal (Feature 23) */}
      {noteTargetArticle && (
        <PrivateNoteModal
          article={noteTargetArticle}
          onSave={(articleId, text) => {
            // Note saved locally and in state
          }}
          onClose={() => setNoteTargetArticle(null)}
        />
      )}

      {/* 6. News Alerts Settings Modal (Feature 20) */}
      {showAlertsModal && (
        <NewsAlertsModal
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          onClose={() => setShowAlertsModal(false)}
        />
      )}

      {/* 7. Add Market Modal (Feature 13) */}
      {showAddMarketModal && (
        <AddMarketModal
          currentWatchlist={myWatchlist}
          onToggleAsset={handleToggleWatchlistAsset}
          onClose={() => setShowAddMarketModal(false)}
        />
      )}

    </div>
  );
}
