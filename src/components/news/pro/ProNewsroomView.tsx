import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Flame, 
  Clock, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Bookmark, 
  ShieldCheck, 
  Layers, 
  ChevronRight, 
  Radio, 
  ArrowRight,
  Filter,
  RefreshCw
} from 'lucide-react';
import { MarketNewsArticle, NewsUserSettings } from '@/types/newsIntelligence';
import { NewsProvider, MarketDataProvider } from '@/services/news/newsProviders';
import { ProArticleModal } from './ProArticleModal';

interface ProNewsroomViewProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent?: (eventId: string) => void;
}

const PRO_CATEGORIES = [
  'LATEST',
  'BREAKING',
  'MARKETS',
  'FOREX',
  'STOCKS',
  'BONDS',
  'COMMODITIES',
  'CRYPTO',
  'MACRO',
  'CENTRAL BANKS',
  'COMPANIES',
  'ECONOMY',
  'GEOPOLITICS'
];

export function ProNewsroomView({
  settings,
  onUpdateSettings,
  onSelectEvent
}: ProNewsroomViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('LATEST');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<MarketNewsArticle | null>(null);
  const [activeStoryClusterId, setActiveStoryClusterId] = useState<string | null>(null);

  // Fetch all news via provider abstraction
  const allStories = useMemo(() => NewsProvider.getAllStories(), []);
  const storyClusters = useMemo(() => NewsProvider.getStoryClusters(), []);

  // Filtered stories according to category & search
  const filteredStories = useMemo(() => {
    return NewsProvider.searchStories(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Breaking / developing stories for top ticker
  const breakingStories = useMemo(() => {
    return NewsProvider.getBreakingStories().slice(0, 5);
  }, []);

  // Lead story & Right-hand latest feed
  const leadStory = filteredStories.length > 0 ? filteredStories[0] : null;
  const rightColumnStories = filteredStories.length > 1 ? filteredStories.slice(1, 5) : [];
  const gridStories = filteredStories.length > 5 ? filteredStories.slice(5) : filteredStories.slice(1);

  // Ticker market quotes
  const tickerMarkets = useMemo(() => MarketDataProvider.getTickerItems(), []);

  // Handle bookmark toggle
  const handleToggleBookmark = (articleId: string) => {
    const current = settings.bookmarkedArticleIds || [];
    const updated = current.includes(articleId)
      ? current.filter(id => id !== articleId)
      : [...current, articleId];
    onUpdateSettings({ bookmarkedArticleIds: updated });
  };

  const isBookmarked = (id: string) => (settings.bookmarkedArticleIds || []).includes(id);

  // Active Story Cluster if user clicked to inspect
  const activeCluster = useMemo(() => {
    if (!activeStoryClusterId) return null;
    return storyClusters.find(c => c.id === activeStoryClusterId) || null;
  }, [activeStoryClusterId, storyClusters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. EDITORIAL HEADER & BRAND BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              TRADEVAULT NEWSROOM
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Professional Financial Wire & Syndicate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
            Global Market News & Intelligence
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search news, markets, companies, currencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. LIVE DELAYED TICKER STRIP */}
      <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 text-xs whitespace-nowrap min-w-max">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            MARKET BENCHMARKS (15M DELAYED):
          </span>

          {tickerMarkets.map(m => (
            <div key={m.symbol} className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">{m.symbol}</span>
              <span className="font-semibold text-slate-600 dark:text-slate-400">{m.priceFormatted}</span>
              <span className={`text-[11px] font-bold flex items-center ${m.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m.change24h >= 0 ? `+${m.change24h}%` : `${m.change24h}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BREAKING NEWS STRIP */}
      {breakingStories.length > 0 && (
        <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 flex items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider shrink-0">
            <Flame className="w-3.5 h-3.5" />
            <span>BREAKING WIRE</span>
          </div>

          <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs">
            {breakingStories.map(story => (
              <button
                key={story.id}
                type="button"
                onClick={() => setSelectedArticle(story)}
                className="hover:underline text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap flex items-center gap-2 text-left cursor-pointer"
              >
                <span>{story.headline}</span>
                <span className="text-[10px] text-slate-400">({story.source})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. CATEGORY NAVIGATION TABS */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 sm:space-x-2">
          {PRO_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. MAIN EDITORIAL LAYOUT (Lead Story on Left/Center + Chronological Wire on Right) */}
      {filteredStories.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No News Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            No stories match your current query or category filter. Try clearing the search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT / CENTER (2 Cols): Large Lead Story */}
          {leadStory && (
            <div className="lg:col-span-2 space-y-6">
              <div 
                onClick={() => setSelectedArticle(leadStory)}
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Lead Image */}
                {leadStory.imageUrl && (
                  <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={leadStory.imageUrl}
                      alt={leadStory.headline}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        LEAD STORY
                      </span>
                      {leadStory.isDevelopingStory && (
                        <span className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                          DEVELOPING
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs text-[10px] text-slate-300 px-2.5 py-1 rounded">
                      Source: {leadStory.source} Wire
                    </div>
                  </div>
                )}

                {/* Lead Content */}
                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {leadStory.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(leadStory.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {leadStory.headline}
                  </h2>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {leadStory.summary}
                  </p>

                  {/* Related Markets Badges */}
                  {leadStory.markets && leadStory.markets.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                        Related Assets:
                      </span>
                      {leadStory.markets.map(m => (
                        <span key={m} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-medium">
                      By <strong className="text-slate-700 dark:text-slate-300">{leadStory.source} Financial Desk</strong>
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Full Story & Context <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT (1 Col): Latest News Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                Latest Wire Feed
              </h3>
              <span className="text-[10px] text-slate-400">Chronological</span>
            </div>

            <div className="space-y-3">
              {rightColumnStories.map(story => (
                <div
                  key={story.id}
                  onClick={() => setSelectedArticle(story)}
                  className="group cursor-pointer p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {story.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(story.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                    {story.headline}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {story.summary}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      {story.category}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                      Read brief &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 6. PRO STORY CLUSTER & DEVELOPING STORY TIMELINE */}
      {storyClusters.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white">
                STORY CLUSTERING & TIMELINE
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
                Developing Macro Story: {storyClusters[0].topicTitle}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {storyClusters[0].sourcesCount} Wire Sources Corroborated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Story Overview */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Primary Situation
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {storyClusters[0].summary}
              </p>
              
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Verified Reporting By:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {storyClusters[0].sourcesList.map((src, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {src.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirmed Facts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Verified Factual Timeline
              </h4>
              <ul className="space-y-2">
                {storyClusters[0].confirmedFacts.map((fact, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Story Timeline with actual timestamps */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Chronological Development
              </h4>
              <div className="space-y-2.5 border-l-2 border-slate-800 pl-3">
                {storyClusters[0].timeline.map((item, idx) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <strong className="text-white">{item.time}</strong> • {item.source}
                    </div>
                    <p className="text-slate-300 font-medium">{item.headline}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 7. MARKET NEWS GRID (Below Lead Section) */}
      {gridStories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Market News Wire & Analysis ({gridStories.length} stories)
            </h3>
            <span className="text-[11px] text-slate-400">Published Wire Desks</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridStories.map(story => (
              <div
                key={story.id}
                onClick={() => setSelectedArticle(story)}
                className="group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                {story.imageUrl && (
                  <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={story.imageUrl}
                      alt={story.headline}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                      {story.category}
                    </span>
                  </div>
                )}

                <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      {story.source}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(story.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {story.headline}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {story.summary}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400">
                      {story.markets?.slice(0, 2).join(' • ')}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <ProArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onBookmarkToggle={handleToggleBookmark}
          isBookmarked={isBookmarked(selectedArticle.id)}
        />
      )}

    </div>
  );
}
