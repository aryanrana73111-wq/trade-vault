import React from 'react';
import { X, Filter, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface CompetitionFilterState {
  dateRange: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
  market: string;
  strategy: string;
  session: string;
  direction: 'ALL' | 'BUY' | 'SELL';
  result: 'ALL' | 'WIN' | 'LOSS' | 'BREAK EVEN';
  timeframe: string;
  riskTier: 'ALL' | 'LOW' | 'MED' | 'HIGH';
  holdingDuration: 'ALL' | 'SCALP' | 'INTRADAY' | 'SWING';
  traderId: string;
}

export interface CompetitionFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CompetitionFilterState;
  onApply: (filters: CompetitionFilterState) => void;
  onReset: () => void;
  tradersList?: { userId: string; displayName: string }[];
  availableTraders?: { id?: string; userId?: string; name?: string; displayName?: string }[];
  marketsList?: string[];
  availableMarkets?: string[];
}

export function CompetitionFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  tradersList,
  availableTraders,
  marketsList,
  availableMarkets
}: CompetitionFilterModalProps) {
  const [localFilters, setLocalFilters] = React.useState<CompetitionFilterState>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const traders = (tradersList || (availableTraders || []).map((t: any) => ({
    userId: t.userId || t.id || '',
    displayName: t.displayName || t.name || 'Trader'
  })));

  const markets = marketsList || availableMarkets || [];

  if (!isOpen) return null;

  // Count active filters
  let activeCount = 0;
  if (localFilters.dateRange !== 'ALL') activeCount++;
  if (localFilters.market !== 'ALL') activeCount++;
  if (localFilters.strategy !== 'ALL') activeCount++;
  if (localFilters.session !== 'ALL') activeCount++;
  if (localFilters.direction !== 'ALL') activeCount++;
  if (localFilters.result !== 'ALL') activeCount++;
  if (localFilters.timeframe !== 'ALL') activeCount++;
  if (localFilters.riskTier !== 'ALL') activeCount++;
  if (localFilters.holdingDuration !== 'ALL') activeCount++;
  if (localFilters.traderId !== 'ALL') activeCount++;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const defaultState: CompetitionFilterState = {
      dateRange: 'ALL',
      market: 'ALL',
      strategy: 'ALL',
      session: 'ALL',
      direction: 'ALL',
      result: 'ALL',
      timeframe: 'ALL',
      riskTier: 'ALL',
      holdingDuration: 'ALL',
      traderId: 'ALL'
    };
    setLocalFilters(defaultState);
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                Filter Tradebook
              </h2>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate block">
                {activeCount > 0 ? `${activeCount} filters applied` : 'No filters applied'}
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Body (Scrollable) */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Trader Filter */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Trader / Participant
            </label>
            <select
              value={localFilters.traderId}
              onChange={(e) => setLocalFilters({ ...localFilters, traderId: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Traders</option>
              {traders.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Market / Instrument */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Market Instrument
            </label>
            <select
              value={localFilters.market}
              onChange={(e) => setLocalFilters({ ...localFilters, market: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Instruments</option>
              {markets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Direction
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['ALL', 'BUY', 'SELL'].map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, direction: dir as any })}
                  className={`h-11 rounded-xl font-bold transition-colors ${
                    localFilters.direction === dir
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>

          {/* Result / Outcome */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Trade Outcome
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'ALL', label: 'All Outcomes' },
                { key: 'WIN', label: 'Wins Only' },
                { key: 'LOSS', label: 'Losses Only' },
                { key: 'BREAK EVEN', label: 'Break Even' }
              ].map((res) => (
                <button
                  key={res.key}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, result: res.key as any })}
                  className={`h-11 rounded-xl font-bold transition-colors text-center px-2 ${
                    localFilters.result === res.key
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {res.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Trading Session
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['ALL', 'London', 'New York', 'Asian'].map((sess) => (
                <button
                  key={sess}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, session: sess })}
                  className={`h-11 rounded-xl font-semibold transition-colors ${
                    localFilters.session === sess
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sess === 'ALL' ? 'All Sessions' : sess}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Date Range
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'TODAY', label: 'Today' },
                { key: 'WEEK', label: 'Week' },
                { key: 'MONTH', label: 'Month' }
              ].map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, dateRange: d.key as any })}
                  className={`h-11 rounded-xl font-bold transition-colors text-center ${
                    localFilters.dateRange === d.key
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Timeframe
            </label>
            <select
              value={localFilters.timeframe}
              onChange={(e) => setLocalFilters({ ...localFilters, timeframe: e.target.value })}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Timeframes</option>
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1D">1D</option>
            </select>
          </div>

          {/* Holding Style / Duration */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Holding Duration Style
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'ALL', label: 'All' },
                { key: 'SCALP', label: 'Scalp' },
                { key: 'INTRADAY', label: 'Intra' },
                { key: 'SWING', label: 'Swing' }
              ].map((dur) => (
                <button
                  key={dur.key}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, holdingDuration: dur.key as any })}
                  className={`h-11 rounded-xl font-bold transition-colors text-center ${
                    localFilters.holdingDuration === dur.key
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 flex-shrink-0 bg-white dark:bg-slate-900 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex-1 h-12 flex items-center justify-center gap-2 text-xs font-semibold"
          >
            <RotateCcw className="w-4 h-4" />
            Clear All
          </Button>

          <Button
            type="button"
            onClick={handleApply}
            className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-indigo-500/20"
          >
            <Check className="w-4 h-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
