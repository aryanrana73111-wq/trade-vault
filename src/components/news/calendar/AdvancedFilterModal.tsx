import React, { useState, useEffect } from 'react';
import { NewsImpact, NewsCategory, ReleaseStatus } from '@/types/newsIntelligence';
import { X, Filter, RotateCcw, Check, SlidersHorizontal, Calendar as CalendarIcon } from 'lucide-react';
import { CURRENCY_FLAGS } from '../EconomicCalendarView';

export interface CalendarFilterState {
  currencies: string[];
  impacts: NewsImpact[];
  categories: NewsCategory[];
  statuses: ReleaseStatus[];
  startDate?: string;
  endDate?: string;
  searchQuery: string;
}

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCurrencies: string[];
  filters: CalendarFilterState;
  onApplyFilters: (filters: CalendarFilterState) => void;
  onResetFilters: () => void;
}

const ALL_CATEGORIES: NewsCategory[] = [
  'Central Bank',
  'Inflation',
  'Employment',
  'Manufacturing',
  'Growth',
  'Trade',
  'Consumer',
  'Energy',
  'Services',
  'Government',
  'Business',
  'Sentiment',
  'Speeches',
  'Auctions',
  'Other'
];

const ALL_IMPACTS: { key: NewsImpact; label: string; desc: string; color: string }[] = [
  { key: 'HIGH', label: 'High Impact', desc: 'Market-moving releases & rate decisions', color: 'bg-rose-500' },
  { key: 'MEDIUM', label: 'Medium Impact', desc: 'Sector indicators & secondary data', color: 'bg-amber-500' },
  { key: 'LOW', label: 'Low Impact', desc: 'Minor prints & routine metrics', color: 'bg-yellow-400' },
  { key: 'NON-ECONOMIC', label: 'Non-Economic', desc: 'Holidays, auctions & summits', color: 'bg-slate-400' }
];

const ALL_STATUSES: ReleaseStatus[] = ['Upcoming', 'Released', 'Revised', 'Delayed', 'Cancelled'];

export function AdvancedFilterModal({
  isOpen,
  onClose,
  availableCurrencies,
  filters,
  onApplyFilters,
  onResetFilters
}: AdvancedFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<CalendarFilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  if (!isOpen) return null;

  const toggleCurrency = (c: string) => {
    setLocalFilters(prev => ({
      ...prev,
      currencies: prev.currencies.includes(c)
        ? prev.currencies.filter(x => x !== c)
        : [...prev.currencies, c]
    }));
  };

  const toggleImpact = (imp: NewsImpact) => {
    setLocalFilters(prev => ({
      ...prev,
      impacts: prev.impacts.includes(imp)
        ? prev.impacts.filter(x => x !== imp)
        : [...prev.impacts, imp]
    }));
  };

  const toggleCategory = (cat: NewsCategory) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(x => x !== cat)
        : [...prev.categories, cat]
    }));
  };

  const toggleStatus = (st: ReleaseStatus) => {
    setLocalFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(st)
        ? prev.statuses.filter(x => x !== st)
        : [...prev.statuses, st]
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  const activeCount = 
    localFilters.currencies.length + 
    localFilters.impacts.length + 
    localFilters.categories.length + 
    localFilters.statuses.length +
    (localFilters.startDate ? 1 : 0) +
    (localFilters.endDate ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Advanced Calendar Filters</span>
                {activeCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {activeCount} Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter by currencies, macroeconomic categories, impact tiers and dates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          
          {/* Section 1: Currencies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Currencies ({localFilters.currencies.length === 0 ? 'All' : localFilters.currencies.length})
              </label>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLocalFilters(p => ({ ...p, currencies: [...availableCurrencies] }))}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => setLocalFilters(p => ({ ...p, currencies: [] }))}
                  className="text-slate-500 hover:underline font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {availableCurrencies.map(c => {
                const isChecked = localFilters.currencies.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCurrency(c)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left font-semibold transition-all ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{CURRENCY_FLAGS[c] || '🌐'}</span>
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Impact Tiers */}
          <div>
            <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block mb-2">
              Impact Levels
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ALL_IMPACTS.map(item => {
                const isChecked = localFilters.impacts.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleImpact(item.key)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded mt-0.5 shrink-0 ${item.color}`} />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{item.label}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Macro Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Macro Indicator Categories
              </label>
              {localFilters.categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLocalFilters(p => ({ ...p, categories: [] }))}
                  className="text-slate-500 hover:underline text-[11px]"
                >
                  Clear Categories
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map(cat => {
                const isSelected = localFilters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Custom Date Range */}
          <div>
            <label className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block mb-2">
              Custom Date Window (Optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">From Date</span>
                <input
                  type="date"
                  value={localFilters.startDate || ''}
                  onChange={(e) => setLocalFilters(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">To Date</span>
                <input
                  type="date"
                  value={localFilters.endDate || ''}
                  onChange={(e) => setLocalFilters(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-750 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
