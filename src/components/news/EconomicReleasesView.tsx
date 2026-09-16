import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Filter, 
  Search, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { NewsEvent, NewsUserSettings } from '@/types/newsIntelligence';
import { calculateSurprise, formatEventDateTime } from '@/lib/news/newsStore';

interface EconomicReleasesViewProps {
  settings: NewsUserSettings;
  onSelectEvent: (eventId: string) => void;
  onSelectNewsTopic?: (topic: string) => void;
  onOpenDataTab?: (code?: string) => void;
}

export const EconomicReleasesView: React.FC<EconomicReleasesViewProps> = ({
  settings,
  onSelectEvent,
  onSelectNewsTopic,
  onOpenDataTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [surpriseFilter, setSurpriseFilter] = useState<'ALL' | 'ABOVE' | 'BELOW' | 'IN_LINE'>('ALL');

  // Extract released events or events with historical release data
  const releasedEvents = useMemo(() => {
    return NEWS_EVENTS.filter(ev => {
      // Has recent releases in history or is marked released
      const hasRecentHistory = ev.historical?.recentReleases && ev.historical.recentReleases.length > 0;
      return hasRecentHistory || ev.actual !== undefined;
    }).map(ev => {
      // Derive latest release point
      const latestHist = ev.historical?.recentReleases?.[0];
      const actualVal = ev.actual !== undefined ? ev.actual : latestHist?.actual;
      const forecastVal = ev.forecast !== undefined ? ev.forecast : latestHist?.forecast;
      const previousVal = ev.previous;
      const releaseDate = latestHist?.date || ev.dateTime;
      const surprise = calculateSurprise(actualVal, forecastVal);

      return {
        event: ev,
        actual: actualVal,
        forecast: forecastVal,
        previous: previousVal,
        releaseDate,
        surprise,
        recentReleasesCount: ev.historical?.recentReleases?.length || 0,
        sampleReactions: latestHist?.assetReactions
      };
    });
  }, []);

  const filteredReleases = useMemo(() => {
    return releasedEvents.filter(item => {
      const { event, surprise } = item;

      // Country filter
      if (selectedCountry !== 'ALL' && event.countryCode !== selectedCountry) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) {
        return false;
      }

      // Surprise filter
      if (surpriseFilter === 'ABOVE' && !surprise.isPositive) return false;
      if (surpriseFilter === 'BELOW' && !surprise.isNegative) return false;
      if (surpriseFilter === 'IN_LINE' && !surprise.isInLine) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = event.name.toLowerCase().includes(q);
        const matchesCode = event.code.toLowerCase().includes(q);
        const matchesCountry = event.country.toLowerCase().includes(q);
        const matchesSource = event.source.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCountry && !matchesSource) {
          return false;
        }
      }

      return true;
    });
  }, [releasedEvents, selectedCountry, selectedCategory, surpriseFilter, searchQuery]);

  return (
    <div id="economic-releases-view" className="space-y-6">
      {/* Header briefing */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-900 border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Macro Releases & Surprise Matrix
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Economic Releases Tracker
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Examine recent economic data prints versus market expectations. TradeVault computes transparent surprise metrics without manufacturing speculative trade signals.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-releases"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search release (e.g., CPI, NFP, GDP, FOMC)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
            />
          </div>

          {/* Country filter */}
          <select
            id="select-country-releases"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Jurisdictions</option>
            <option value="US">United States (US)</option>
            <option value="EU">Eurozone (EU)</option>
            <option value="GB">United Kingdom (UK)</option>
            <option value="JP">Japan (JP)</option>
          </select>

          {/* Surprise filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl w-full sm:w-auto shrink-0">
            <button
              onClick={() => setSurpriseFilter('ALL')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                surpriseFilter === 'ALL'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              All Prints
            </button>
            <button
              onClick={() => setSurpriseFilter('ABOVE')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                surpriseFilter === 'ABOVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              Above Consensus
            </button>
            <button
              onClick={() => setSurpriseFilter('BELOW')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                surpriseFilter === 'BELOW'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Below Consensus
            </button>
          </div>
        </div>
      </div>

      {/* Releases Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReleases.map(({ event, actual, forecast, previous, releaseDate, surprise, sampleReactions }) => {
          const { dateStr, timeStr } = formatEventDateTime(event.dateTime, settings.timezone);

          return (
            <div
              key={event.id}
              id={`release-card-${event.id}`}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm transition-all space-y-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {event.countryCode} • {event.currency}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {event.period}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {dateStr} {timeStr}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white leading-snug">
                    {event.name}
                  </h3>
                </div>

                {/* Surprise Pill */}
                {surprise.hasSurprise && (
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${surprise.badgeColor}`}>
                    {surprise.direction} ({surprise.diffFormatted})
                  </div>
                )}
              </div>

              {/* Data comparison block: PREVIOUS → FORECAST → ACTUAL */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 text-center">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Previous
                  </div>
                  <div className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">
                    {previous !== undefined ? `${previous}${event.unit || ''}` : '--'}
                  </div>
                </div>

                <div className="border-x border-neutral-200 dark:border-neutral-700">
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Consensus
                  </div>
                  <div className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-0.5">
                    {forecast !== undefined ? `${forecast}${event.unit || ''}` : '--'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actual
                  </div>
                  <div className={`text-sm font-bold mt-0.5 ${
                    surprise.isPositive 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : surprise.isNegative 
                        ? 'text-rose-600 dark:text-rose-400' 
                        : 'text-neutral-900 dark:text-white'
                  }`}>
                    {actual !== undefined ? `${actual}${event.unit || ''}` : '--'}
                  </div>
                </div>
              </div>

              {/* Sample asset moves from release if recorded */}
              {sampleReactions && (
                <div className="space-y-1.5">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Observed Post-Release Reaction:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {Object.entries(sampleReactions).map(([asset, data]: [string, any]) => (
                      <span
                        key={asset}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${
                          data.direction === 'UP'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {asset}: {data.pctMove > 0 ? `+${data.pctMove}%` : `${data.pctMove}%`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source & Actions */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400 truncate max-w-[200px]" title={event.source}>
                  Source: {event.source}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {onOpenDataTab && (
                    <button
                      onClick={() => onOpenDataTab(event.code)}
                      className="px-2.5 py-1 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Indicator
                    </button>
                  )}
                  <button
                    id={`btn-inspect-release-${event.id}`}
                    onClick={() => onSelectEvent(event.id)}
                    className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    View History & Detail →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReleases.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <Info className="w-8 h-8 text-neutral-400 mx-auto" />
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
            No economic releases match your filter criteria
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
            Try adjusting jurisdiction, category, or surprise parameters to review historic and recent macro announcements.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCountry('ALL');
              setSelectedCategory('ALL');
              setSurpriseFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
