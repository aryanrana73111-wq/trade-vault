import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  Globe, 
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { NormalizedEconomicEvent, EventImportance } from '@/types/normalizedCalendar';
import { getEventsForDate, getUpcomingEvents } from '@/services/news/economicCalendarService';
import { format, parseISO } from 'date-fns';

interface CleanEconomicCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  todayDateStr: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  onOpenCalendarModal: () => void;
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  EU: '🇪🇺',
  GB: '🇬🇧',
  JP: '🇯🇵',
  CN: '🇨🇳',
  CA: '🇨🇦',
  AU: '🇦🇺',
  CH: '🇨🇭',
  WW: '🌐'
};

export function CleanEconomicCalendar({
  selectedDate,
  todayDateStr,
  onSelectDate,
  onOpenCalendarModal
}: CleanEconomicCalendarProps) {
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [importanceFilter, setImportanceFilter] = useState<EventImportance | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const events = useMemo(() => {
    return getEventsForDate(selectedDate, {
      date: selectedDate,
      currency: currencyFilter,
      importance: importanceFilter,
      searchQuery
    });
  }, [selectedDate, currencyFilter, importanceFilter, searchQuery]);

  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(selectedDate, 6);
  }, [selectedDate]);

  const formattedDate = (() => {
    try {
      return format(parseISO(selectedDate), 'MMMM d, yyyy');
    } catch {
      return selectedDate;
    }
  })();

  const isToday = selectedDate === todayDateStr;
  const isFuture = selectedDate > todayDateStr;

  return (
    <div className="space-y-6">
      {/* Calendar Header with explicit date */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                Macroeconomic Releases & Events
              </span>
              {isToday && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  TODAY
                </span>
              )}
              {isFuture && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  FUTURE SCHEDULE
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <span>ECONOMIC EVENTS — {formattedDate.toUpperCase()}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Official sovereign economic data indicators, central bank decisions, and statistical releases.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCalendarModal}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium flex items-center gap-2 shadow-sm transition-all self-start md:self-auto"
          >
            <CalendarIcon className="w-4 h-4 text-blue-400" />
            <span>Select Date</span>
            <span className="text-slate-400">▼</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Currencies */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-medium">Currency:</span>
            {['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CNY'].map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  currencyFilter === curr
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {curr === 'ALL' ? 'All' : `${COUNTRY_FLAGS[curr === 'CNY' ? 'CN' : curr === 'USD' ? 'US' : curr === 'EUR' ? 'EU' : curr === 'GBP' ? 'GB' : 'JP'] || ''} ${curr}`}
              </button>
            ))}
          </div>

          {/* Importance */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-medium">Impact:</span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((imp) => (
              <button
                key={imp}
                type="button"
                onClick={() => setImportanceFilter(imp)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  importanceFilter === imp
                    ? imp === 'HIGH'
                      ? 'bg-rose-600 text-white font-semibold'
                      : imp === 'MEDIUM'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {imp === 'ALL' ? 'All' : imp}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search economic indicator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((evt) => {
            const flag = COUNTRY_FLAGS[evt.countryCode] || '🌐';
            const isReleased = evt.status === 'RELEASED';

            return (
              <div
                key={evt.id}
                className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700/80 rounded-xl p-4 transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Time, Country, Title */}
                  <div className="flex items-start gap-3.5">
                    {/* Time badge */}
                    <div className="flex flex-col items-center justify-center min-w-[65px] px-2 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-xs font-mono font-bold text-slate-200">{evt.time}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">UTC</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Country Flag & Code */}
                        <span className="text-sm" title={evt.country}>{flag}</span>
                        <span className="text-xs font-semibold text-slate-300 font-mono">
                          {evt.currency}
                        </span>

                        {/* Importance Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            evt.importance === 'HIGH'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : evt.importance === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {evt.importance}
                        </span>

                        {/* Status Badge */}
                        {isReleased ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            RELEASED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            SCHEDULED
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-slate-100 mt-1">
                        {evt.event}
                      </h3>

                      {evt.description && (
                        <p className="text-xs text-slate-400 mt-0.5 max-w-2xl line-clamp-1">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Previous, Forecast, Actual, Revision */}
                  <div className="flex items-center gap-3 sm:gap-6 self-end md:self-auto bg-slate-950/40 px-3.5 py-2 rounded-xl border border-slate-800/60">
                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Previous</div>
                      <div className="text-xs font-mono font-semibold text-slate-300 mt-0.5">
                        {evt.previous || '—'}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Forecast</div>
                      <div className="text-xs font-mono font-semibold text-slate-300 mt-0.5">
                        {evt.forecast || '—'}
                      </div>
                    </div>

                    <div className="text-center pl-2 border-l border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Actual</div>
                      <div className={`text-xs font-mono font-bold mt-0.5 ${
                        evt.actual ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
                        {evt.actual || 'Pending'}
                      </div>
                    </div>

                    {evt.revision && (
                      <div className="hidden lg:block text-left pl-2 border-l border-slate-800">
                        <div className="text-[10px] text-amber-400 uppercase font-medium">Revision</div>
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                          {evt.revision}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer notes & Affected Markets */}
                {evt.affectedMarkets && evt.affectedMarkets.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Key Markets:</span>
                    <div className="flex flex-wrap gap-1">
                      {evt.affectedMarkets.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800/80 text-[10px] font-mono text-slate-300 border border-slate-700/60"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="p-3 rounded-full bg-slate-800/80 text-slate-400 inline-block">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              No economic events scheduled for {formattedDate}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are no high-impact economic releases registered on this date matching the current filters.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onSelectDate(todayDateStr)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                Go to Today
              </button>
              <button
                type="button"
                onClick={onOpenCalendarModal}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                Browse Calendar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Separately Show Scheduled Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Upcoming Major Scheduled Events
              </h2>
            </div>
            <span className="text-xs text-slate-400">Next forward-looking catalysts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                onClick={() => onSelectDate(evt.date)}
                className="cursor-pointer bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/40 rounded-xl p-3.5 transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-blue-400">{evt.date}</span>
                    <span className="text-xs font-mono text-slate-400">{evt.time} UTC</span>
                    <span className="text-xs">{COUNTRY_FLAGS[evt.countryCode] || '🌐'}</span>
                    <span className="text-xs font-bold text-slate-300 font-mono">{evt.currency}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-100 mt-1 line-clamp-1">
                    {evt.event}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
