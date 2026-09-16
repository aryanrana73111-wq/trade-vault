import React, { useState } from 'react';
import { X, Search, Plus, Check, Star, TrendingUp } from 'lucide-react';
import { MARKET_SNAPSHOT_ASSETS } from '@/data/marketSnapshotData';

interface AddMarketModalProps {
  currentWatchlist: string[];
  onToggleAsset: (symbol: string) => void;
  onClose: () => void;
}

const POPULAR_ASSET_OPTIONS = [
  { symbol: 'XAU/USD', name: 'Gold Spot / US Dollar', category: 'Commodity' },
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'Crypto' },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'Crypto' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'Forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'Forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'Forex' },
  { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', category: 'Forex' },
  { symbol: 'S&P 500', name: 'S&P 500 Index', category: 'Indices' },
  { symbol: 'NASDAQ', name: 'Nasdaq 100 Index', category: 'Indices' },
  { symbol: 'NIFTY 50', name: 'Nifty 50 Benchmark', category: 'Indices' },
  { symbol: 'OIL (WTI)', name: 'Crude Oil WTI Spot', category: 'Commodity' },
  { symbol: 'SILVER', name: 'Silver Spot / US Dollar', category: 'Commodity' },
  { symbol: 'US 10Y', name: 'US 10-Year Treasury Yield', category: 'Bonds' },
  { symbol: 'INDIA 10Y', name: 'India 10-Year Sovereign Yield', category: 'Bonds' },
  { symbol: 'DAX 40', name: 'German DAX Index', category: 'Indices' },
  { symbol: 'FTSE 100', name: 'UK FTSE 100 Index', category: 'Indices' }
];

export function AddMarketModal({
  currentWatchlist,
  onToggleAsset,
  onClose
}: AddMarketModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = POPULAR_ASSET_OPTIONS.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Customize My Markets
              </h3>
              <p className="text-xs text-slate-400">
                Pin priority assets to your market intelligence feed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search symbol, currency, index, commodity..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        </div>

        {/* Assets List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {filteredAssets.map(asset => {
            const isSelected = currentWatchlist.includes(asset.symbol);
            return (
              <div
                key={asset.symbol}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white font-mono">
                      {asset.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-750 text-slate-600 dark:text-slate-400">
                      {asset.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {asset.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAsset(asset.symbol)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
