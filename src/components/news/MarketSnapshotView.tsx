import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Newspaper, 
  Calendar 
} from 'lucide-react';
import { MARKET_SNAPSHOT_ASSETS } from '@/data/marketSnapshotData';
import { MarketSnapshotAsset } from '@/types/newsIntelligence';

interface MarketSnapshotViewProps {
  onFilterNewsByAsset?: (symbol: string) => void;
  onFilterCalendarByAsset?: (symbol: string) => void;
}

export const MarketSnapshotView: React.FC<MarketSnapshotViewProps> = ({
  onFilterNewsByAsset,
  onFilterCalendarByAsset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAssets = MARKET_SNAPSHOT_ASSETS.filter(asset => {
    if (selectedCategory !== 'ALL' && asset.category.toUpperCase() !== selectedCategory.toUpperCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asset.symbol.toLowerCase().includes(q) ||
        asset.name.toLowerCase().includes(q) ||
        asset.macroDriver.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = ['ALL', 'Forex', 'Commodities', 'Crypto', 'Indices', 'Bonds'];

  return (
    <div id="market-snapshot-view" className="space-y-6">
      {/* Header briefing */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Activity className="w-3.5 h-3.5" />
            Global Asset Classes Overview
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Market Intelligence Snapshot
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Real-time market context across sovereign currencies, precious metals, energy commodities, digital assets, and bond yields. Click any asset to filter news and macroeconomic catalysts.
          </p>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-snapshot"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symbol (e.g. Gold, BTC, DXY)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map(asset => {
          const isUp = asset.change24h > 0;
          const isDown = asset.change24h < 0;

          // Simple SVG sparkline points
          const minVal = Math.min(...asset.sparkline);
          const maxVal = Math.max(...asset.sparkline);
          const range = maxVal - minVal || 1;
          const points = asset.sparkline.map((val, idx) => {
            const x = (idx / (asset.sparkline.length - 1)) * 100;
            const y = 35 - ((val - minVal) / range) * 28;
            return `${x},${y}`;
          }).join(' ');

          return (
            <div
              key={asset.symbol}
              id={`snapshot-card-${asset.symbol.replace(/[^a-zA-Z0-9]/g, '')}`}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm transition-all space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-neutral-900 dark:text-white">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase">
                      {asset.category}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {asset.name}
                  </div>
                </div>

                {/* 24h change badge */}
                <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                  isUp 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : isDown
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}>
                  {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                  {isUp ? `+${asset.change24h}%` : `${asset.change24h}%`}
                </div>
              </div>

              {/* Price & Sparkline */}
              <div className="flex items-end justify-between gap-4 pt-1">
                <div>
                  <div className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                    {asset.priceFormatted}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    24h: {asset.low24h} - {asset.high24h}
                  </div>
                </div>

                {/* SVG sparkline */}
                <div className="w-24 h-9">
                  <svg viewBox="0 0 100 35" className="w-full h-full overflow-visible">
                    <polyline
                      fill="none"
                      stroke={isUp ? '#10b981' : isDown ? '#f43f5e' : '#888888'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={points}
                    />
                  </svg>
                </div>
              </div>

              {/* Primary Macro Driver */}
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Key Driver: </span>
                {asset.macroDriver}
              </div>

              {/* Action links */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                {onFilterNewsByAsset && (
                  <button
                    onClick={() => onFilterNewsByAsset(asset.symbol)}
                    className="inline-flex items-center gap-1 font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Newspaper className="w-3.5 h-3.5" />
                    Related News
                  </button>
                )}

                {onFilterCalendarByAsset && (
                  <button
                    onClick={() => onFilterCalendarByAsset(asset.symbol)}
                    className="inline-flex items-center gap-1 font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    View Catalysts →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
