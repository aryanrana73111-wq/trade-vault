import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Search, 
  TrendingUp, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Check, 
  Calendar, 
  Building2, 
  ChevronRight, 
  BarChart3,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { ECONOMIC_INDICATORS } from '@/data/economicIndicatorsData';
import { EconomicIndicator, NewsUserSettings } from '@/types/newsIntelligence';

interface EconomicDataViewProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent?: (eventId: string) => void;
  onSelectNewsTopic?: (topic: string) => void;
  initialSelectedCode?: string;
}

export const EconomicDataView: React.FC<EconomicDataViewProps> = ({
  settings,
  onUpdateSettings,
  onSelectEvent,
  onSelectNewsTopic,
  initialSelectedCode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inspectingIndicator, setInspectingIndicator] = useState<EconomicIndicator | null>(() => {
    if (initialSelectedCode) {
      return ECONOMIC_INDICATORS.find(i => i.code === initialSelectedCode || i.id === initialSelectedCode) || null;
    }
    return null;
  });

  const watchedIds = settings.watchedIndicatorIds || [];

  const handleToggleWatch = (indicatorId: string) => {
    const isWatched = watchedIds.includes(indicatorId);
    const updated = isWatched
      ? watchedIds.filter(id => id !== indicatorId)
      : [...watchedIds, indicatorId];
    onUpdateSettings({ watchedIndicatorIds: updated });
  };

  const filteredIndicators = useMemo(() => {
    return ECONOMIC_INDICATORS.filter(item => {
      if (selectedCountry !== 'ALL' && item.countryCode !== selectedCountry) {
        return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesCountry = item.country.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesCountry && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [selectedCountry, selectedCategory, searchQuery]);

  return (
    <div id="economic-data-view" className="space-y-6">
      {/* Header briefing */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Database className="w-3.5 h-3.5" />
            Macroeconomic Database
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Global Economic Indicators
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Institutional-grade macroeconomic time-series tracking GDP, Inflation, Benchmark Rates, Labor markets, and Manufacturing across sovereign economic powers.
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-indicators"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search indicator (e.g., Fed Funds, CPI, NFP, Unemployment, PMI)..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
          />
        </div>

        {/* Country */}
        <select
          id="select-country-indicators"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">All Countries</option>
          <option value="US">United States</option>
          <option value="EU">Eurozone</option>
          <option value="GB">United Kingdom</option>
          <option value="JP">Japan</option>
          <option value="AU">Australia</option>
          <option value="CN">China</option>
        </select>

        {/* Category */}
        <select
          id="select-category-indicators"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">All Macro Categories</option>
          <option value="Monetary Policy">Monetary Policy</option>
          <option value="Inflation">Inflation</option>
          <option value="Labor">Labor & Employment</option>
          <option value="Growth">GDP & Growth</option>
          <option value="Business">Manufacturing & PMI</option>
        </select>
      </div>

      {/* Table view of indicators */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Indicator & Code</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Latest</th>
                <th className="py-3.5 px-4 text-right">Previous</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Agency Source</th>
                <th className="py-3.5 px-4 text-center">Watch</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredIndicators.map((ind) => {
                const isWatched = watchedIds.includes(ind.id);

                return (
                  <tr
                    key={ind.id}
                    className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors group cursor-pointer"
                    onClick={() => setInspectingIndicator(ind)}
                  >
                    {/* Indicator Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {ind.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                        {ind.code} • {ind.frequency}
                      </div>
                    </td>

                    {/* Country */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        {ind.countryCode} {ind.country}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                        {ind.category}
                      </span>
                    </td>

                    {/* Latest */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {ind.latestValue}{ind.unit}
                      </span>
                    </td>

                    {/* Previous */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {ind.previousValue}{ind.unit}
                    </td>

                    {/* Period */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400">
                      {ind.releasePeriod}
                    </td>

                    {/* Agency Source */}
                    <td className="py-3.5 px-4 text-xs text-neutral-500 dark:text-neutral-400 max-w-[180px] truncate" title={ind.source}>
                      {ind.source}
                    </td>

                    {/* Watch button */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleWatch(ind.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isWatched
                            ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                        }`}
                        title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Detail action */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform">
                        Details →
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Indicator Modal */}
      {inspectingIndicator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div 
            id="modal-inspect-indicator"
            className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {inspectingIndicator.countryCode} • {inspectingIndicator.category}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">
                    {inspectingIndicator.code}
                  </span>
                  <span className="text-xs text-neutral-400">
                    Frequency: {inspectingIndicator.frequency}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {inspectingIndicator.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingIndicator(null)}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Stat callouts */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 text-center">
                <div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                    Latest ({inspectingIndicator.releasePeriod})
                  </div>
                  <div className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                    {inspectingIndicator.latestValue}{inspectingIndicator.unit}
                  </div>
                </div>
                <div className="border-x border-neutral-200 dark:border-neutral-700">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                    Previous
                  </div>
                  <div className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                    {inspectingIndicator.previousValue}{inspectingIndicator.unit}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold uppercase">
                    Consensus
                  </div>
                  <div className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mt-1">
                    {inspectingIndicator.forecastValue !== undefined ? `${inspectingIndicator.forecastValue}${inspectingIndicator.unit}` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* What it measures & Trader Takeaway */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 space-y-1">
                  <div className="text-xs font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                    What This Measures
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {inspectingIndicator.whatItMeasures}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 space-y-1">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Trader Relevance & Context
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {inspectingIndicator.traderTakeaway}
                  </p>
                </div>
              </div>

              {/* Historical series table */}
              {inspectingIndicator.historicalSeries && inspectingIndicator.historicalSeries.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <span>Historical Time Series</span>
                    <span>{inspectingIndicator.unit}</span>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                        <tr>
                          <th className="py-2 px-3">Date / Period</th>
                          <th className="py-2 px-3 text-right">Recorded Value</th>
                          <th className="py-2 px-3 text-right">Consensus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {inspectingIndicator.historicalSeries.map((h, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                            <td className="py-2 px-3 font-medium">{h.date}</td>
                            <td className="py-2 px-3 text-right font-bold text-neutral-900 dark:text-white">
                              {h.value}{inspectingIndicator.unit}
                            </td>
                            <td className="py-2 px-3 text-right text-neutral-500">
                              {h.consensus !== undefined ? `${h.consensus}${inspectingIndicator.unit}` : '--'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Related markets and source */}
              <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Related Markets: </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {inspectingIndicator.relatedMarkets.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Source: </span>
                  <a
                    href={inspectingIndicator.sourceUrl || '#'}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    {inspectingIndicator.source}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900">
              <button
                onClick={() => handleToggleWatch(inspectingIndicator.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  watchedIds.includes(inspectingIndicator.id)
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                {watchedIds.includes(inspectingIndicator.id) ? 'Watching Indicator' : 'Add to Watchlist'}
              </button>

              <div className="flex items-center gap-2">
                {inspectingIndicator.relatedEventId && onSelectEvent && (
                  <button
                    onClick={() => {
                      const evId = inspectingIndicator.relatedEventId!;
                      setInspectingIndicator(null);
                      onSelectEvent(evId);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100"
                  >
                    Go to Calendar Event →
                  </button>
                )}
                <button
                  onClick={() => setInspectingIndicator(null)}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
