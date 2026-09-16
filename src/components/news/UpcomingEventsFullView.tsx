import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Flame, 
  AlertTriangle, 
  Info, 
  Filter, 
  Eye, 
  Check, 
  ArrowRight,
  Globe,
  Bell
} from 'lucide-react';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { NewsEvent, NewsUserSettings } from '@/types/newsIntelligence';
import { formatEventDateTime } from '@/lib/news/newsStore';

interface UpcomingEventsFullViewProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent: (eventId: string) => void;
  onOpenDataTab?: (code?: string) => void;
}

export const UpcomingEventsFullView: React.FC<UpcomingEventsFullViewProps> = ({
  settings,
  onUpdateSettings,
  onSelectEvent,
  onOpenDataTab
}) => {
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK'>('ALL');
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH'>('ALL');
  const [now, setNow] = useState(Date.now());

  // Live countdown clock ticker every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const watchlistedIds = settings.watchlistedEventIds || settings.watchlistEventIds || [];

  const handleToggleWatchlist = (eventId: string) => {
    const isWatched = watchlistedIds.includes(eventId);
    const updated = isWatched
      ? watchlistedIds.filter(id => id !== eventId)
      : [...watchlistedIds, eventId];
    onUpdateSettings({ watchlistedEventIds: updated });
  };

  const upcomingList = useMemo(() => {
    return NEWS_EVENTS.filter(ev => {
      const eventTime = new Date(ev.dateTime).getTime();
      return eventTime > now;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [now]);

  const filteredEvents = useMemo(() => {
    return upcomingList.filter(ev => {
      if (impactFilter === 'HIGH' && ev.impact !== 'HIGH') return false;

      const evTime = new Date(ev.dateTime).getTime();
      const diffDays = (evTime - now) / (1000 * 60 * 60 * 24);

      if (timeFilter === 'TODAY' && diffDays > 1) return false;
      if (timeFilter === 'TOMORROW' && (diffDays < 1 || diffDays > 2)) return false;
      if (timeFilter === 'THIS_WEEK' && diffDays > 7) return false;

      return true;
    });
  }, [upcomingList, impactFilter, timeFilter, now]);

  // Format countdown string
  const formatCountdown = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - now;
    if (diff <= 0) return 'Release Imminent';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div id="upcoming-events-full-view" className="space-y-6">
      {/* Header briefing */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Clock className="w-3.5 h-3.5" />
            Tier-1 Catalyst Radar & Live Countdowns
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Upcoming Economic Events
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Real-time countdowns to scheduled market-moving announcements. Times displayed in your configured timezone ({settings.timezone || 'Local'}).
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Time filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setTimeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            All Upcoming
          </button>
          <button
            onClick={() => setTimeFilter('TODAY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === 'TODAY'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Within 24 Hours
          </button>
          <button
            onClick={() => setTimeFilter('THIS_WEEK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              timeFilter === 'THIS_WEEK'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            This Week
          </button>
        </div>

        {/* Impact filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setImpactFilter(prev => prev === 'ALL' ? 'HIGH' : 'ALL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              impactFilter === 'HIGH'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            {impactFilter === 'HIGH' ? 'High Impact Only (Active)' : 'Filter High Impact'}
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.map(event => {
          const { dateStr, timeStr } = formatEventDateTime(event.dateTime, settings.timezone);
          const isWatched = watchlistedIds.includes(event.id);
          const countdown = formatCountdown(event.dateTime);

          return (
            <div
              key={event.id}
              id={`upcoming-event-row-${event.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              {/* Event details */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                    {event.countryCode} • {event.currency}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    event.impact === 'HIGH'
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {event.impact === 'HIGH' ? <Flame className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {event.impact} IMPACT
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {event.category}
                  </span>
                </div>

                <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white leading-snug">
                  {event.name}
                </h3>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 max-w-2xl">
                  {event.simpleExplanation}
                </p>

                {/* Sensitive markets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] font-medium text-neutral-400">Sensitive Markets:</span>
                  {event.affectedMarkets.slice(0, 4).map((m, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      {m.asset}
                    </span>
                  ))}
                </div>
              </div>

              {/* Time & Countdown Box */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800 gap-4 shrink-0">
                <div className="text-left md:text-right">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {dateStr} • {timeStr} ({settings.timezone || 'Local'})
                  </div>
                  <div className="text-base sm:text-lg font-mono font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 md:justify-end mt-0.5">
                    <Clock className="w-4 h-4" />
                    <span>{countdown}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleWatchlist(event.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isWatched
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                        : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                    }`}
                    title={isWatched ? 'Pinned in Watchlist' : 'Pin to Watchlist'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-open-upcoming-event-${event.id}`}
                    onClick={() => onSelectEvent(event.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
                  >
                    Event Intelligence →
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <Info className="w-8 h-8 text-neutral-400 mx-auto" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              No upcoming events match the current filter
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Expand your timeframe filter or remove impact constraints to view scheduled releases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
