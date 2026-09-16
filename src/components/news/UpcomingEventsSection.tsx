import React, { useState, useMemo } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { Calendar, Clock, Flame, AlertCircle, Info, ArrowRight, ChevronRight, Globe, Filter } from 'lucide-react';
import { formatEventDateTime } from '@/lib/news/newsStore';

interface Props {
  events: NewsEvent[];
  onSelectEvent: (event: NewsEvent) => void;
  timezone?: string;
}

export function UpcomingEventsSection({ events, onSelectEvent, timezone = 'LOCAL' }: Props) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK'>('THIS_WEEK');
  const [impactFilter, setImpactFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
    const startOfTomorrow = new Date(endOfToday.getTime() + 1);
    const endOfTomorrow = new Date(startOfTomorrow.getTime() + 24 * 60 * 60 * 1000 - 1);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

    return events.filter(e => {
      const eDate = new Date(e.dateTime);
      
      // Impact match
      if (impactFilter === 'HIGH' && e.impact !== 'HIGH') return false;
      if (impactFilter === 'MEDIUM' && e.impact === 'LOW') return false;

      // Day match
      if (selectedDayFilter === 'TODAY') {
        return eDate >= startOfToday && eDate <= endOfToday;
      }
      if (selectedDayFilter === 'TOMORROW') {
        return eDate >= startOfTomorrow && eDate <= endOfTomorrow;
      }
      if (selectedDayFilter === 'THIS_WEEK') {
        return eDate >= startOfToday && eDate <= endOfWeek;
      }
      return true;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [events, selectedDayFilter, impactFilter]);

  const getCountdown = (dateTimeStr: string): string => {
    const target = new Date(dateTimeStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) return 'Live / Released';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `In ${days}d ${hours % 24}h`;
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center shadow-2xs">
            <Flame className="w-3 h-3 mr-1 text-rose-500 shrink-0" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center shadow-2xs">
            <AlertCircle className="w-3 h-3 mr-1 text-amber-500 shrink-0" /> MED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center shadow-2xs">
            <Info className="w-3 h-3 mr-1 text-slate-400 shrink-0" /> LOW
          </span>
        );
    }
  };

  const getFlag = (code: string) => {
    switch (code) {
      case 'US': return '🇺🇸';
      case 'EU': return '🇪🇺';
      case 'GB': return '🇬🇧';
      case 'JP': return '🇯🇵';
      case 'CA': return '🇨🇦';
      case 'AU': return '🇦🇺';
      default: return '🌐';
    }
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Upcoming Economic Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tier-1 and volatile catalysts scheduled across global financial markets
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day chips */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {(['THIS_WEEK', 'TODAY', 'TOMORROW', 'ALL'] as const).map(filter => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedDayFilter(filter)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  selectedDayFilter === filter
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {filter === 'THIS_WEEK' ? 'Week' : filter === 'TODAY' ? 'Today' : filter === 'TOMORROW' ? 'Tomorrow' : 'All'}
              </button>
            ))}
          </div>

          {/* High Impact toggle */}
          <button
            type="button"
            onClick={() => setImpactFilter(prev => prev === 'HIGH' ? 'ALL' : 'HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              impactFilter === 'HIGH'
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800 shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${impactFilter === 'HIGH' ? 'text-rose-500' : 'text-slate-400'}`} />
            High Impact Only
          </button>
        </div>
      </div>

      {/* Events List / Cards Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Calendar className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Scheduled Events Match Criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try switching from "Today" or "High Impact" to view this week's full macroeconomic calendar.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedDayFilter('THIS_WEEK');
              setImpactFilter('ALL');
            }}
            className="mt-3 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reset Event Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredEvents.map(event => {
            const { dateStr, timeStr, relativeStr } = formatEventDateTime(event.dateTime, timezone);
            const countdown = getCountdown(event.dateTime);
            const isHigh = event.impact === 'HIGH';

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/80 rounded-2xl p-4 transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Flag, Currency, Category, Impact */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl" title={event.country}>{getFlag(event.countryCode)}</span>
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 tracking-wider">
                        {event.currency}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {event.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {getImpactBadge(event.impact)}
                    </div>
                  </div>

                  {/* Event Name */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                    {event.name}
                  </h3>

                  {/* Date, Time, Countdown */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {timeStr} ({timezone})
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900/60">
                      {countdown}
                    </span>
                  </div>
                </div>

                {/* Important Numbers: Previous, Forecast, Actual */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Previous</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {event.previous !== null && event.previous !== undefined ? `${event.previous}${event.unit || ''}` : '--'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-850">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Forecast</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {event.forecast !== null && event.forecast !== undefined ? `${event.forecast}${event.unit || ''}` : '--'}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 block font-medium">Actual</span>
                      <span className="font-bold text-blue-800 dark:text-blue-300">
                        {event.actual !== null && event.actual !== undefined ? `${event.actual}${event.unit || ''}` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[200px]">{event.source}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
