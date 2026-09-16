import React, { useState } from 'react';
import { Network, TrendingUp, ArrowRight, Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { MarketDataProvider } from '@/services/news/newsProviders';

interface EventAssetMapProps {
  onSelectAsset?: (symbol: string) => void;
}

interface TransmissionNode {
  id: string;
  name: string;
  symbol: string;
  category: string;
  typicalDirection: 'Direct Inverse' | 'Direct Correlated' | 'Yield Competing' | 'Risk Beta';
  rationale: string;
  currentObserved: string;
}

export function EventAssetMap({ onSelectAsset }: EventAssetMapProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('gold');

  const nodes: TransmissionNode[] = [
    {
      id: 'usd',
      name: 'US Dollar Index',
      symbol: 'DXY',
      category: 'Forex Benchmark',
      typicalDirection: 'Direct Correlated',
      rationale: 'Higher inflation prints lift nominal interest rate expectations, enhancing foreign yield carry into USD.',
      currentObserved: '+0.28% (Short-term USD rally)'
    },
    {
      id: 'gold',
      name: 'Spot Gold',
      symbol: 'XAU/USD',
      category: 'Monetary Metal',
      typicalDirection: 'Direct Inverse',
      rationale: 'Higher real yields increase the opportunity cost of holding non-yielding bullion, prompting short-term dip buying.',
      currentObserved: '-0.62% ($2,490.50/oz consolidation)'
    },
    {
      id: 'yields',
      name: 'US 10Y Sovereign Yield',
      symbol: 'US10Y',
      category: 'Fixed Income',
      typicalDirection: 'Direct Correlated',
      rationale: 'Bond investors demand higher coupon compensation for delayed easing; prices fall as yields adjust upward.',
      currentObserved: '+5 bps (At 3.65% on 2Y benchmark)'
    },
    {
      id: 'eurusd',
      name: 'Euro / US Dollar',
      symbol: 'EUR/USD',
      category: 'Major FX Pair',
      typicalDirection: 'Direct Inverse',
      rationale: 'Widening transatlantic policy rate differentials favor USD dollar assets over European cash equivalents.',
      currentObserved: '-0.22% (Testing 1.1020 support)'
    },
    {
      id: 'equities',
      name: 'S&P 500 / Nasdaq',
      symbol: 'SPX',
      category: 'Equity Benchmark',
      typicalDirection: 'Risk Beta',
      rationale: 'Higher discount rates reduce the present value of future long-duration corporate earnings cash flows.',
      currentObserved: '-0.34% (Tech valuation digestion)'
    },
    {
      id: 'crypto',
      name: 'Bitcoin',
      symbol: 'BTC/USD',
      category: 'Digital Store of Value',
      typicalDirection: 'Risk Beta',
      rationale: 'High-beta sensitivity to overall dollar liquidity conditions and speculative risk sentiment.',
      currentObserved: '+1.4% (Supported by ETF accumulation)'
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const connectedMarketData = MarketDataProvider.getAssetBySymbol(selectedNode.symbol);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            TRANSMISSION ENGINE
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Macro Event &rarr; Multi-Asset Transmission Map
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Source Anchor: US CPI Inflation Catalyst
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Node Tree */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-3 bg-purple-50/80 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
                Catalyst: US Core Inflation Print (Upside Surprise)
              </span>
            </div>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">
              Origin Node
            </span>
          </div>

          {/* Connected Children Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {nodes.map(node => {
              const isSelected = node.id === selectedNodeId;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (onSelectAsset) onSelectAsset(node.symbol);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                      : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-purple-300 dark:hover:border-purple-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      {node.category}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {node.symbol}
                    </span>
                  </div>
                  <div className="font-bold text-xs truncate">
                    {node.name}
                  </div>
                  <div className={`text-[10px] mt-1 truncate ${isSelected ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {node.typicalDirection}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Click any connected asset to inspect institutional transmission logic and live quote.</span>
          </div>
        </div>

        {/* Right Column: Detailed Transmission Breakdown */}
        <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Asset Dynamics
              </span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedNode.name} ({selectedNode.symbol})
              </h4>
            </div>
            
            {connectedMarketData ? (
              <div className="text-right">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {connectedMarketData.priceFormatted}
                </span>
                <div className={`text-[10px] font-bold ${connectedMarketData.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {connectedMarketData.change24h >= 0 ? `+${connectedMarketData.change24h}%` : `${connectedMarketData.change24h}%`}
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic">Market data unavailable</span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">
                Transmission Rationale:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedNode.rationale}
              </p>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">
                Observed Market Reaction:
              </span>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                {selectedNode.currentObserved}
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block italic">
                * Relationships reflect empirical financial market tendencies, not deterministic future price promises.
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
