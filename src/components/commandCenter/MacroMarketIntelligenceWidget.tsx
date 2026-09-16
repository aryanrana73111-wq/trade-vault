import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe2, 
  Flame, 
  Clock, 
  Calendar, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  Newspaper,
  Layers,
  ChevronRight,
  ShieldAlert,
  Bell
} from 'lucide-react';
import { NewsEvent, MarketNewsArticle } from '@/types/newsIntelligence';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { getMarketNews } from '@/data/marketNewsData';
import { formatEventDateTime, calculateSurprise } from '@/lib/news/newsStore';
import { extractUserMarketProfile, checkEventRelevance } from '@/lib/news/personalRelevance';
import { Trade } from '@/types';

interface MacroMarketIntelligenceWidgetProps {
  timezone: string;
  trades?: Trade[];
  onSelectEvent: (event: NewsEvent) => void;
  onOpenMyAlerts?: () => void;
}

export const MacroMarketIntelligenceWidget: React.FC<MacroMarketIntelligenceWidgetProps> = ({
  timezone,
  trades = [],
  onSelectEvent,
  onOpenMyAlerts
}) => {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'high-impact' | 'watchlist' | 'news'>('today');

  // Derive user market profile
  const userProfile = useMemo(() => extractUserMarketProfile(trades), [trades]);

  const allNews = useMemo(() => {
    try {
      return getMarketNews().slice(0, 6);
    } catch {
      return [];
    }
  }, []);

  // Compute stats and categorization
  const now = Date.now();

  const eventsWithMeta = useMemo(() => {
    return NEWS_EVENTS.map(ev => {
      const dt = new Date(ev.dateTime).getTime();
      const diffMs = dt - now;
      const diffHours = diffMs / (1000 * 60 * 60);
      const isTodayEvent = Math.abs(diffHours) <= 24;
      const isUpcoming = diffMs > 0;
      const relevance = checkEventRelevance(ev, userProfile);
      const surpriseResult = calculateSurprise(ev.actual, ev.forecast);
      const timeMeta = formatEventDateTime(ev.dateTime, timezone);

      return {
        ...ev,
        timeMeta,
        diffMs,
        diffHours,
        isTodayEvent,
        isUpcoming,
        relevance,
        surpriseResult
      };
    });
  }, [now, timezone, userProfile]);

  // Next upcoming high impact release
  const nextHighImpact = useMemo(() => {
    const upcoming = eventsWithMeta
      .filter(e => e.impact === 'HIGH' && e.diffMs > 0)
      .sort((a, b) => a.diffMs - b.diffMs);
    return upcoming[0] || null;
  }, [eventsWithMeta]);

  // Filtered list based on active tab
  const displayedEvents = useMemo(() => {
    switch (activeSubTab) {
      case 'high-impact':
        return eventsWithMeta.filter(e => e.impact === 'HIGH').slice(0, 8);
      case 'watchlist':
        return eventsWithMeta.filter(e => e.relevance.isRelevant).slice(0, 8);
      case 'today':
      default:
        return eventsWithMeta.filter(e => e.isTodayEvent || Math.abs(e.diffHours) <= 48).slice(0, 8);
    }
  }, [activeSubTab, eventsWithMeta]);

  const todayCount = eventsWithMeta.filter(e => e.isTodayEvent).length;
  const highImpactTodayCount = eventsWithMeta.filter(e => e.isTodayEvent && e.impact === 'HIGH').length;
  const watchlistCount = eventsWithMeta.filter(e => e.relevance.isRelevant).length;

  return (
    <div id="command-center-macro-widget" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Macro & Market Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {timezone}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Economic calendar catalysts, surprise data & personal asset relevance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenMyAlerts && (
            <button
              onClick={onOpenMyAlerts}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              title="View configured event alerts"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>My Alerts</span>
            </button>
          )}

          <button
            onClick={() => navigate('/news')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Full Intelligence Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Quick Status Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 border-b border-slate-100 dark:border-slate-800 text-xs bg-white dark:bg-slate-900">
        <div className="p-3.5 flex items-center justify-between">
          <span className="text-slate-500">Today's Events:</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{todayCount} scheduled</span>
        </div>
        <div className="p-3.5 flex items-center justify-between">
          <span className="text-slate-500">High Impact:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">{highImpactTodayCount} active</span>
        </div>
        <div className="p-3.5 flex items-center justify-between">
          <span className="text-slate-500">Watchlist Relevant:</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">{watchlistCount} catalysts</span>
        </div>
        <div className="p-3.5 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/20">
          <span className="text-amber-800 dark:text-amber-300 font-medium">Next Major:</span>
          <span className="font-bold text-amber-900 dark:text-amber-200 truncate max-w-[130px]" title={nextHighImpact ? `${nextHighImpact.name} (${nextHighImpact.timeMeta.relativeStr})` : 'None in 48h'}>
            {nextHighImpact ? `${nextHighImpact.code} (${nextHighImpact.timeMeta.relativeStr})` : 'None today'}
          </span>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="flex items-center justify-between px-5 pt-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/20">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveSubTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeSubTab === 'today'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Today & Upcoming ({todayCount})
          </button>
          <button
            onClick={() => setActiveSubTab('high-impact')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'high-impact'
                ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            High Impact Radar
          </button>
          <button
            onClick={() => setActiveSubTab('watchlist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'watchlist'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Watchlist Relevant ({watchlistCount})
          </button>
          <button
            onClick={() => setActiveSubTab('news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'news'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            Breaking News
          </button>
        </div>

        {userProfile.topMarkets.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-500 pb-2">
            <span>Focus asset:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {userProfile.topMarkets[0].market}
            </span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5">
        {activeSubTab === 'news' ? (
          /* News Feed Subtab */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allNews.map(article => (
              <div
                key={article.id}
                onClick={() => navigate('/news')}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/60 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      {article.source}
                    </span>
                    <span>{article.publishedAt ? formatEventDateTime(article.publishedAt, timezone).relativeStr : 'Recently'}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.headline}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {article.summary}
                  </p>
                </div>
                <div className="pt-3 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium">
                  <span>Read full analysis</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Calendar Events List Subtab */
          <div className="space-y-2.5">
            {displayedEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No economic events found for this filter in the current window.
              </div>
            ) : (
              displayedEvents.map(event => {
                const isHigh = event.impact === 'HIGH';
                const isMedium = event.impact === 'MEDIUM';

                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent(event)}
                    className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/50 bg-white dark:bg-slate-900 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    {/* Left: Flag, Currency, Name, Relevance */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-lg shadow-2xs">
                        {event.countryCode === 'US' ? '🇺🇸' :
                         event.countryCode === 'EU' ? '🇪🇺' :
                         event.countryCode === 'GB' ? '🇬🇧' :
                         event.countryCode === 'JP' ? '🇯🇵' :
                         event.countryCode === 'AU' ? '🇦🇺' :
                         event.countryCode === 'CA' ? '🇨🇦' : '🌐'}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {event.currency}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isHigh
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                              : isMedium
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {event.impact}
                          </span>

                          {event.relevance.isRelevant && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              {event.relevance.matchedMarket ? `Affects ${event.relevance.matchedMarket}` : 'Watchlist'}
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {event.timeMeta.timeStr} ({event.timeMeta.relativeStr})
                          </span>
                        </div>

                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors mt-0.5">
                          {event.name}
                        </h4>
                      </div>
                    </div>

                    {/* Right: Numbers & Detail Trigger */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-3 font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Actual</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {event.actual !== undefined && event.actual !== null ? `${event.actual}${event.unit || ''}` : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Cons.</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {event.forecast !== undefined && event.forecast !== null ? `${event.forecast}${event.unit || ''}` : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Prev.</span>
                          <span className="text-slate-600 dark:text-slate-400">
                            {event.previous !== undefined && event.previous !== null ? `${event.previous}${event.unit || ''}` : '--'}
                          </span>
                        </div>
                      </div>

                      {/* Surprise or Detail button */}
                      {event.surpriseResult?.hasSurprise ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${event.surpriseResult.badgeColor}`}>
                          {event.surpriseResult.diffFormatted}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-1">
                          <span>Detail</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
