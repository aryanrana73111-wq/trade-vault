import React, { useState } from 'react';
import { ReactionWindowPoint, ReactionAsset } from '@/types/eventIntelligence';
import { Activity, Clock, TrendingUp, TrendingDown, Layers, CheckCircle2 } from 'lucide-react';

interface MarketReactionPanelProps {
  windows: ReactionWindowPoint[];
  eventName: string;
}

const ASSET_LABELS: Record<ReactionAsset, { name: string; category: string; color: string }> = {
  XAUUSD: { name: 'Gold (XAU/USD)', category: 'Commodities', color: '#eab308' },
  EURUSD: { name: 'Euro (EUR/USD)', category: 'Currencies', color: '#3b82f6' },
  DXY: { name: 'US Dollar (DXY)', category: 'Currencies', color: '#10b981' },
  US10Y: { name: '10Y Treasury Yield', category: 'Fixed Income', color: '#8b5cf6' },
  BTCUSD: { name: 'Bitcoin (BTC/USD)', category: 'Crypto', color: '#f97316' },
  SPX: { name: 'S&P 500 Index', category: 'Equities', color: '#ec4899' }
};

export function MarketReactionPanel({ windows, eventName }: MarketReactionPanelProps) {
  const [selectedAsset, setSelectedAsset] = useState<ReactionAsset>('XAUUSD');
  const [viewStyle, setViewStyle] = useState<'matrix' | 'normalized'>('matrix');

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Event-Window Market Reaction
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Verified tick-interval tracking (-15m to +4h)
            </span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setViewStyle('matrix')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewStyle === 'matrix'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Multi-Asset Matrix
          </button>
          <button
            type="button"
            onClick={() => setViewStyle('normalized')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              viewStyle === 'normalized'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Normalized Comparison (% Shift)
          </button>
        </div>
      </div>

      {/* Asset Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(Object.keys(ASSET_LABELS) as ReactionAsset[]).map((assetKey) => {
          const info = ASSET_LABELS[assetKey];
          const active = selectedAsset === assetKey;
          return (
            <button
              key={assetKey}
              type="button"
              onClick={() => setSelectedAsset(assetKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                active
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {info.name}
            </button>
          );
        })}
      </div>

      {/* MATRIX VIEW */}
      {viewStyle === 'matrix' && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-sans font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Event Window</th>
                <th className="py-3 px-3">Timing</th>
                <th className="py-3 px-3">Price Level</th>
                <th className="py-3 px-3">Delta vs Pre-Release</th>
                <th className="py-3 px-4 text-right">Directional Bias</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {windows.map((w) => {
                const assetData = w.assets[selectedAsset];
                const isPositive = assetData.pctChange > 0;
                const isNegative = assetData.pctChange < 0;

                return (
                  <tr key={w.window} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {w.label}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {w.minutesFromRelease < 0 ? `${Math.abs(w.minutesFromRelease)}m prior` : w.minutesFromRelease === 0 ? 'Release timestamp' : `${w.minutesFromRelease}m elapsed`}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {assetData.displayPrice}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold inline-flex items-center gap-0.5 ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                      }`}>
                        {isPositive ? `+${assetData.pctChange.toFixed(2)}%` : `${assetData.pctChange.toFixed(2)}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        isPositive 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : isNegative
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {isPositive ? 'Bullish Extension' : isNegative ? 'Bearish Retracement' : 'Baseline Reference'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* NORMALIZED COMPARISON VIEW */}
      {viewStyle === 'normalized' && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Comparing relative percentage move from 15-minute pre-release reference baseline across core instruments:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono">
            {(Object.keys(ASSET_LABELS) as ReactionAsset[]).map((assetKey) => {
              const info = ASSET_LABELS[assetKey];
              const releasePoint = windows.find(w => w.window === '+15m') || windows[windows.length - 1];
              const pct = releasePoint?.assets[assetKey]?.pctChange || 0;
              const isUp = pct > 0;
              const isDown = pct < 0;

              return (
                <div key={assetKey} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <span className="text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase truncate mb-1">
                    {info.name.split(' ')[0]}
                  </span>
                  <div className={`text-base font-bold ${
                    isUp ? 'text-emerald-600 dark:text-emerald-400' : isDown ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600'
                  }`}>
                    {isUp ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`}
                  </div>
                  <span className="text-[10px] font-sans text-slate-400 mt-1">
                    At +15m window
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
