import React from 'react';
import { 
  Eye, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Database, 
  TrendingUp, 
  Activity, 
  Bookmark, 
  Flame,
  Search
} from 'lucide-react';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { ECONOMIC_INDICATORS } from '@/data/economicIndicatorsData';
import { NewsUserSettings } from '@/types/newsIntelligence';
import { Trade } from '@/types';
import { formatEventDateTime } from '@/lib/news/newsStore';

interface WatchlistIntelligenceViewProps {
  settings: NewsUserSettings;
  userTrades?: Trade[];
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent: (eventId: string) => void;
  onSelectIndicator: (code: string) => void;
  onFilterNewsByAsset: (symbol: string) => void;
}

export const WatchlistIntelligenceView: React.FC<WatchlistIntelligenceViewProps> = ({
  settings,
  userTrades = [],
  onUpdateSettings,
  onSelectEvent,
  onSelectIndicator,
  onFilterNewsByAsset
}) => {
  const watchlistedEventIds = settings.watchlistedEventIds || settings.watchlistEventIds || [];
  const watchedIndicatorIds = settings.watchedIndicatorIds || [];

  // Extract distinct markets the user actively trades in TradeVault
  const userTradedMarkets = React.useMemo(() => {
    const set = new Set<string>();
    userTrades.forEach(t => {
      if (t.market) set.add(t.market);
    });
    // Add default fallbacks if user has no trades yet
    if (set.size === 0) {
      settings.watchlistAssets.forEach(a => set.add(a));
    }
    return Array.from(set);
  }, [userTrades, settings.watchlistAssets]);

  const watchedEvents = NEWS_EVENTS.filter(ev => watchlistedEventIds.includes(ev.id));
  const watchedIndicators = ECONOMIC_INDICATORS.filter(ind => watchedIndicatorIds.includes(ind.id));

  const handleRemoveEvent = (id: string) => {
    onUpdateSettings({
      watchlistedEventIds: watchlistedEventIds.filter(item => item !== id)
    });
  };

  const handleRemoveIndicator = (id: string) => {
    onUpdateSettings({
      watchedIndicatorIds: watchedIndicatorIds.filter(item => item !== id)
    });
  };

  return (
    <div id="watchlist-intelligence-view" className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Eye className="w-3.5 h-3.5" />
            Personal Intelligence Watchlist
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            My Tracked Catalysts & Markets
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Consolidated view of your pinned economic releases, watched indicators, and active trading assets synchronized directly with your TradeVault trade journal.
          </p>
        </div>
      </div>

      {/* 1. Traded Markets from User Journal */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-500" />
              Markets From Your Trade Journal
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              News and macroeconomic catalysts for these assets are automatically prioritized in your feed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {userTradedMarkets.map(market => (
            <div
              key={market}
              className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary-500 dark:hover:border-primary-500 transition-colors flex items-center justify-between group cursor-pointer"
              onClick={() => onFilterNewsByAsset(market)}
            >
              <div>
                <div className="font-bold text-sm text-neutral-900 dark:text-white">
                  {market}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Click to view news
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Watched Economic Calendar Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Pinned Calendar Events ({watchedEvents.length})
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Events you have pinned for pre-release preparation and volatility alerts.
            </p>
          </div>
        </div>

        {watchedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchedEvents.map(event => {
              const { dateStr, timeStr } = formatEventDateTime(event.dateTime, settings.timezone);

              return (
                <div
                  key={event.id}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                          {event.countryCode} • {event.currency}
                        </span>
                        <span className="text-xs text-neutral-500">{dateStr} {timeStr}</span>
                      </div>
                      <h4 className="font-bold text-base text-neutral-900 dark:text-white mt-1">
                        {event.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleRemoveEvent(event.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Unpin event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {event.simpleExplanation}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <span className="font-semibold text-neutral-500">
                      Forecast: {event.forecast !== undefined ? `${event.forecast}${event.unit || ''}` : '--'}
                    </span>
                    <button
                      onClick={() => onSelectEvent(event.id)}
                      className="font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                    >
                      View Intelligence →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 text-xs text-neutral-500">
            You have not pinned any economic calendar events yet. Click the Eye icon on any event in the Economic Calendar to track it here.
          </div>
        )}
      </div>

      {/* 3. Watched Macroeconomic Indicators */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              Watched Economic Indicators ({watchedIndicators.length})
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Macro series pinned from the Economic Data tab.
            </p>
          </div>
        </div>

        {watchedIndicators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {watchedIndicators.map(ind => (
              <div
                key={ind.id}
                className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {ind.countryCode} • {ind.category}
                      </span>
                      <span className="text-xs text-neutral-500 font-mono">{ind.code}</span>
                    </div>
                    <h4 className="font-bold text-base text-neutral-900 dark:text-white mt-1">
                      {ind.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleRemoveIndicator(ind.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove indicator"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-baseline gap-4 pt-1">
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase">Latest ({ind.releasePeriod})</div>
                    <div className="text-lg font-bold text-neutral-900 dark:text-white">
                      {ind.latestValue}{ind.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase">Previous</div>
                    <div className="text-lg font-semibold text-neutral-500">
                      {ind.previousValue}{ind.unit}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <span className="text-neutral-500 truncate max-w-[200px]">Source: {ind.source}</span>
                  <button
                    onClick={() => onSelectIndicator(ind.code)}
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    Explore Series →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-dashed border-neutral-300 dark:border-neutral-700 text-xs text-neutral-500">
            No indicators in your watchlist. Visit the Economic Data tab and click the Eye icon on any indicator to track it here.
          </div>
        )}
      </div>
    </div>
  );
};
