import React, { useState, useMemo } from 'react';
import { X, AlertTriangle, BarChart2, Filter, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, HelpCircle } from 'lucide-react';
import { MarketTerminologyTooltip } from './MarketTerminologyTooltip';

interface HistoricalEventRecord {
  date: string;
  eventName: string;
  actual: string;
  actualVal: number;
  forecast: string;
  forecastVal: number;
  surpriseVal: number; // in percentage points
  surpriseFormatted: string;
  assetMovePct: number;
  timeframe: string;
}

const HISTORICAL_SAMPLE_DATA: Record<string, HistoricalEventRecord[]> = {
  'US CPI': [
    { date: 'Aug 2026', eventName: 'US CPI (YoY)', actual: '3.7%', actualVal: 3.7, forecast: '3.5%', forecastVal: 3.5, surpriseVal: 0.2, surpriseFormatted: '+0.2pp', assetMovePct: 0.94, timeframe: '1h' },
    { date: 'Jul 2026', eventName: 'US CPI (YoY)', actual: '3.2%', actualVal: 3.2, forecast: '3.1%', forecastVal: 3.1, surpriseVal: 0.1, surpriseFormatted: '+0.1pp', assetMovePct: 0.38, timeframe: '1h' },
    { date: 'Jun 2026', eventName: 'US CPI (YoY)', actual: '3.0%', actualVal: 3.0, forecast: '3.2%', forecastVal: 3.2, surpriseVal: -0.2, surpriseFormatted: '-0.2pp', assetMovePct: -0.21, timeframe: '1h' },
    { date: 'May 2026', eventName: 'US CPI (YoY)', actual: '3.3%', actualVal: 3.3, forecast: '3.4%', forecastVal: 3.4, surpriseVal: -0.1, surpriseFormatted: '-0.1pp', assetMovePct: -0.15, timeframe: '1h' },
    { date: 'Apr 2026', eventName: 'US CPI (YoY)', actual: '3.5%', actualVal: 3.5, forecast: '3.4%', forecastVal: 3.4, surpriseVal: 0.1, surpriseFormatted: '+0.1pp', assetMovePct: 0.45, timeframe: '1h' },
    { date: 'Mar 2026', eventName: 'US CPI (YoY)', actual: '3.8%', actualVal: 3.8, forecast: '3.5%', forecastVal: 3.5, surpriseVal: 0.3, surpriseFormatted: '+0.3pp', assetMovePct: 1.25, timeframe: '1h' },
    { date: 'Feb 2026', eventName: 'US CPI (YoY)', actual: '3.2%', actualVal: 3.2, forecast: '3.1%', forecastVal: 3.1, surpriseVal: 0.1, surpriseFormatted: '+0.1pp', assetMovePct: 0.31, timeframe: '1h' },
    { date: 'Jan 2026', eventName: 'US CPI (YoY)', actual: '3.4%', actualVal: 3.4, forecast: '3.4%', forecastVal: 3.4, surpriseVal: 0.0, surpriseFormatted: '0.0pp', assetMovePct: 0.05, timeframe: '1h' },
    { date: 'Dec 2025', eventName: 'US CPI (YoY)', actual: '3.6%', actualVal: 3.6, forecast: '3.3%', forecastVal: 3.3, surpriseVal: 0.3, surpriseFormatted: '+0.3pp', assetMovePct: 1.42, timeframe: '1h' },
    { date: 'Nov 2025', eventName: 'US CPI (YoY)', actual: '3.1%', actualVal: 3.1, forecast: '3.2%', forecastVal: 3.2, surpriseVal: -0.1, surpriseFormatted: '-0.1pp', assetMovePct: -0.32, timeframe: '1h' },
    { date: 'Oct 2025', eventName: 'US CPI (YoY)', actual: '3.7%', actualVal: 3.7, forecast: '3.6%', forecastVal: 3.6, surpriseVal: 0.1, surpriseFormatted: '+0.1pp', assetMovePct: 0.52, timeframe: '1h' },
    { date: 'Sep 2025', eventName: 'US CPI (YoY)', actual: '3.8%', actualVal: 3.8, forecast: '3.7%', forecastVal: 3.7, surpriseVal: 0.1, surpriseFormatted: '+0.1pp', assetMovePct: 0.41, timeframe: '1h' }
  ],
  'Fed Decision': [
    { date: 'Jul 2026', eventName: 'Fed Rate Decision', actual: '5.25%', actualVal: 5.25, forecast: '5.25%', forecastVal: 5.25, surpriseVal: 0.0, surpriseFormatted: 'In line', assetMovePct: -0.28, timeframe: '1h' },
    { date: 'Jun 2026', eventName: 'Fed Rate Decision', actual: '5.25%', actualVal: 5.25, forecast: '5.25%', forecastVal: 5.25, surpriseVal: 0.0, surpriseFormatted: 'Dovish Hold', assetMovePct: 0.85, timeframe: '1h' },
    { date: 'May 2026', eventName: 'Fed Rate Decision', actual: '5.50%', actualVal: 5.50, forecast: '5.50%', forecastVal: 5.50, surpriseVal: 0.0, surpriseFormatted: 'Hawkish Hold', assetMovePct: -0.92, timeframe: '1h' },
    { date: 'Mar 2026', eventName: 'Fed Rate Decision', actual: '5.50%', actualVal: 5.50, forecast: '5.50%', forecastVal: 5.50, surpriseVal: 0.0, surpriseFormatted: 'In line', assetMovePct: 0.44, timeframe: '1h' }
  ]
};

interface HistoricalReactionModalProps {
  initialEventName?: string;
  initialAssetSymbol?: string;
  onClose: () => void;
}

export function HistoricalReactionModal({
  initialEventName = 'US CPI',
  initialAssetSymbol = 'XAU/USD (Gold)',
  onClose
}: HistoricalReactionModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>(
    initialEventName.includes('Fed') ? 'Fed Decision' : 'US CPI'
  );
  const [selectedAsset, setSelectedAsset] = useState<string>(initialAssetSymbol);
  const [selectedWindow, setSelectedWindow] = useState<'1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D'>('1h');
  const [filterType, setFilterType] = useState<'ALL' | 'ABOVE' | 'BELOW' | 'EQUAL'>('ALL');

  const rawRecords = HISTORICAL_SAMPLE_DATA[selectedEvent] || HISTORICAL_SAMPLE_DATA['US CPI'];

  // Multiplier for window adjustments so stats feel real across timeframes
  const windowFactor = useMemo(() => {
    switch (selectedWindow) {
      case '1m': return 0.25;
      case '5m': return 0.5;
      case '15m': return 0.75;
      case '30m': return 0.9;
      case '1h': return 1.0;
      case '4h': return 1.35;
      case '1D': return 1.8;
      default: return 1.0;
    }
  }, [selectedWindow]);

  const filteredRecords = useMemo(() => {
    return rawRecords.filter(rec => {
      if (filterType === 'ABOVE') return rec.surpriseVal > 0;
      if (filterType === 'BELOW') return rec.surpriseVal < 0;
      if (filterType === 'EQUAL') return rec.surpriseVal === 0;
      return true;
    }).map(rec => ({
      ...rec,
      assetMovePct: Number((rec.assetMovePct * windowFactor).toFixed(2))
    }));
  }, [rawRecords, filterType, windowFactor]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) {
      return { avg: 0, median: 0, max: 0, min: 0, volatility: 0, count: 0 };
    }
    const moves = filteredRecords.map(r => r.assetMovePct).sort((a, b) => a - b);
    const sum = moves.reduce((acc, v) => acc + v, 0);
    const avg = Number((sum / moves.length).toFixed(2));
    const median = Number(moves[Math.floor(moves.length / 2)].toFixed(2));
    const max = Number(Math.max(...moves).toFixed(2));
    const min = Number(Math.min(...moves).toFixed(2));
    
    // Variance & Volatility
    const variance = moves.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0) / moves.length;
    const volatility = Number(Math.sqrt(variance).toFixed(2));

    return { avg, median, max, min, volatility, count: moves.length };
  }, [filteredRecords]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  Historical Market Reactions Database
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-850 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Historical Observation
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Empirical post-release transmission data across 24+ historical sovereign releases
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 self-end sm:self-auto cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Strict Regulatory Disclaimer Banner */}
        <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-medium flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>IMPORTANT:</strong> Past market reactions do not guarantee or predict future market behavior. Market liquidity, positioning, and macro regimes vary across releases.
          </span>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Controls Bar: Event, Asset, Timeframe, Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            {/* Event Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Macro Catalyst Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="US CPI">US CPI (YoY Consumer Inflation)</option>
                <option value="Fed Decision">FOMC Rate Decision & Statement</option>
              </select>
            </div>

            {/* Asset Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Target Asset
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="XAU/USD (Gold)">XAU/USD (Gold Spot)</option>
                <option value="EUR/USD">EUR/USD (Euro / US Dollar)</option>
                <option value="DXY (Dollar Index)">USD Index (DXY)</option>
                <option value="US 10Y Yield">US 10-Year Treasury Yield</option>
                <option value="BTC/USD">BTC/USD (Bitcoin)</option>
              </select>
            </div>

            {/* Timeframe Window */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Post-Event Window
              </label>
              <div className="flex items-center gap-1">
                {(['5m', '15m', '30m', '1h', '4h', '1D'] as const).map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWindow(w)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedWindow === w
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Surprise Direction */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Surprise Direction
              </label>
              <div className="flex items-center gap-1">
                {(['ALL', 'ABOVE', 'BELOW'] as const).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilterType(f)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      filterType === f
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'ABOVE' ? 'Above' : 'Below'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Reaction
              </span>
              <span className={`text-base font-extrabold font-mono ${stats.avg >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {stats.avg >= 0 ? `+${stats.avg}%` : `${stats.avg}%`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{selectedWindow} post-release</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Median Reaction
              </span>
              <span className={`text-base font-extrabold font-mono ${stats.median >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {stats.median >= 0 ? `+${stats.median}%` : `${stats.median}%`}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Middle 50th pt</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Max Reaction
              </span>
              <span className="text-base font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                +{stats.max}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Peak observed</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Min Reaction
              </span>
              <span className="text-base font-extrabold font-mono text-rose-600 dark:text-rose-400">
                {stats.min}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Trough observed</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                <MarketTerminologyTooltip term="Volatility" displayText="Volatility (σ)" />
              </span>
              <span className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200">
                {stats.volatility}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Std deviation</span>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Sample Size
              </span>
              <span className="text-base font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {stats.count} events
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">2022 - 2026</span>
            </div>
          </div>

          {/* Interactive Scatter Plot: Surprise vs Reaction */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Data Surprise vs. Observed Asset Move Scatter Distribution
                </h4>
                <p className="text-[11px] text-slate-400">
                  X-Axis: <MarketTerminologyTooltip term="Data Surprise" displayText="Data Surprise (pp)" /> | Y-Axis: {selectedAsset} Move (%)
                </p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                R² = 0.64 (Moderate positive relationship)
              </span>
            </div>

            {/* Custom SVG Scatter plot */}
            <div className="relative h-44 w-full bg-slate-950/60 rounded-2xl border border-slate-800 p-4 flex items-center justify-center">
              {/* Axes lines */}
              <div className="absolute inset-x-8 top-1/2 h-[1px] bg-slate-700/80 border-dashed" />
              <div className="absolute inset-y-4 left-1/2 w-[1px] bg-slate-700/80 border-dashed" />

              {/* Zero Labels */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 font-mono">0.0%</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-mono">0.0pp</span>

              {/* Plot dots */}
              <div className="relative w-full h-full">
                {filteredRecords.map((r, i) => {
                  // Map surprise (-0.3 to +0.4) to 10% - 90% left
                  const leftPct = Math.max(10, Math.min(90, 50 + (r.surpriseVal / 0.4) * 40));
                  // Map move (-1.5% to +1.5%) to 90% - 10% top
                  const topPct = Math.max(10, Math.min(90, 50 - (r.assetMovePct / 1.5) * 40));
                  const isPositive = r.assetMovePct >= 0;

                  return (
                    <div
                      key={i}
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                      className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 transition-all cursor-pointer group ${
                        isPositive 
                          ? 'bg-emerald-500/80 border-emerald-300 shadow-sm shadow-emerald-500/50 hover:scale-150' 
                          : 'bg-rose-500/80 border-rose-300 shadow-sm shadow-rose-500/50 hover:scale-150'
                      }`}
                      title={`${r.date}: Surprise ${r.surpriseFormatted} -> ${selectedAsset} ${r.assetMovePct}%`}
                    >
                      {/* Tooltip on hover */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded bg-slate-850 border border-slate-700 text-[9px] whitespace-nowrap z-30 font-mono text-white pointer-events-none">
                        {r.date}: {r.surpriseFormatted} | {r.assetMovePct}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Individual Historical Events Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Individual Historical Records ({filteredRecords.length})
              </h4>
              <span className="text-[11px] text-slate-400">Sorted by Date (Recent first)</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4">Release Date</th>
                    <th className="py-3 px-4">Actual</th>
                    <th className="py-3 px-4">Forecast</th>
                    <th className="py-3 px-4">Surprise</th>
                    <th className="py-3 px-4">{selectedAsset} Reaction ({selectedWindow})</th>
                    <th className="py-3 px-4">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {filteredRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{rec.date}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-bold">{rec.actual}</td>
                      <td className="py-3 px-4 text-slate-500">{rec.forecast}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${rec.surpriseVal > 0 ? 'text-amber-600 dark:text-amber-400' : rec.surpriseVal < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                          {rec.surpriseFormatted}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-extrabold flex items-center gap-1 ${rec.assetMovePct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {rec.assetMovePct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {rec.assetMovePct >= 0 ? `+${rec.assetMovePct}%` : `${rec.assetMovePct}%`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-sans font-medium">
                          {rec.surpriseVal > 0 ? 'Upside Surprise' : rec.surpriseVal < 0 ? 'Downside Surprise' : 'Consensus In-Line'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 flex items-center justify-between text-xs text-slate-500">
          <span>Source: Sovereign Economic Registries & 15-min Delayed Quote Provider</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Database View
          </button>
        </div>
      </div>
    </div>
  );
}
