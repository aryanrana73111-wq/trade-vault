import React, { useState } from 'react';
import { Layers, ArrowDownUp, RefreshCcw, DollarSign, Activity } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalOrderBookDiagram: React.FC = () => {
  const [spreadWidth, setSpreadWidth] = useState<number>(0.04); // $0.04 spread
  const [midPrice, setMidPrice] = useState<number>(100.00);

  const bestBid = Number((midPrice - spreadWidth / 2).toFixed(2));
  const bestAsk = Number((midPrice + spreadWidth / 2).toFixed(2));

  // 5 levels of bids (buys) and 5 levels of asks (sells)
  const asks = [
    { price: (bestAsk + 0.04).toFixed(2), size: 1450, total: 3950 },
    { price: (bestAsk + 0.03).toFixed(2), size: 950, total: 2500 },
    { price: (bestAsk + 0.02).toFixed(2), size: 680, total: 1550 },
    { price: (bestAsk + 0.01).toFixed(2), size: 520, total: 870 },
    { price: bestAsk.toFixed(2), size: 350, total: 350 }, // Best Ask
  ].reverse();

  const bids = [
    { price: bestBid.toFixed(2), size: 420, total: 420 }, // Best Bid
    { price: (bestBid - 0.01).toFixed(2), size: 610, total: 1030 },
    { price: (bestBid - 0.02).toFixed(2), size: 840, total: 1870 },
    { price: (bestBid - 0.03).toFixed(2), size: 1100, total: 2970 },
    { price: (bestBid - 0.04).toFixed(2), size: 1650, total: 4620 },
  ];

  const maxDepth = 5000;

  return (
    <EducationalChartCard
      title="Level 2 Limit Order Book & Liquidity Ladder"
      subtitle="Visualizing resting passive limit orders, market depth queues, and auction bid-ask spread"
      badge="Simulation"
      category="MARKET MICROSTRUCTURE & EXECUTION"
      units="Limit Orders (Shares) at Cent Intervals"
      whatAmILookingAt="A simulated Level 2 Order Book (Depth of Market / DOM). Green bars on the left represent passive Limit Buy orders (Bids). Red bars on the right represent passive Limit Sell orders (Asks). The empty gap in the center is the Bid-Ask spread ($0.04)."
      whyItMatters="Prices only move when aggressive market orders sweep through and consume all resting limit order liquidity at a given price level. If someone places a large market order that exceeds the resting volume at the Best Ask, price immediately skips to the next price level (Slippage)."
      commonMistake="Assuming you can execute large institutional size at the exact price visible on the screen without paying for crossing the spread or suffering market impact."
      metrics={[
        { label: 'Best Bid (Highest Buyer)', value: `$${bestBid.toFixed(2)}`, color: 'text-emerald-600', subtext: '350 Shares Resting' },
        { label: 'Best Ask (Lowest Seller)', value: `$${bestAsk.toFixed(2)}`, color: 'text-rose-600', subtext: '420 Shares Resting' },
        { label: 'Spread Width', value: `$${spreadWidth.toFixed(2)} (${((spreadWidth / midPrice) * 100).toFixed(2)}%)`, color: 'text-amber-500', subtext: 'Round-Trip Friction' },
        { label: 'Midpoint Price', value: `$${midPrice.toFixed(2)}`, subtext: 'Theoretical Fair Value' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Simulate Bid-Ask Spread ($):</span>
              <span className="font-mono text-amber-500 font-bold">${spreadWidth.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.01}
              max={0.20}
              step={0.01}
              value={spreadWidth}
              onChange={e => setSpreadWidth(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Center Mid Price:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">${midPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={50.00}
              max={250.00}
              step={5.00}
              value={midPrice}
              onChange={e => setMidPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
        {/* Bids Column (Buyers) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 pb-1 border-b border-slate-200 dark:border-slate-800">
            <span>Bids (Passive Buyers)</span>
            <span>Size (Depth)</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {bids.map((b, idx) => (
              <div key={idx} className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-between">
                {/* Horizontal Depth Fill */}
                <div
                  style={{ width: `${(b.total / maxDepth) * 100}%` }}
                  className="absolute inset-y-0 right-0 bg-emerald-500/20 dark:bg-emerald-500/30 rounded-r-lg transition-all duration-300"
                />
                <span className="relative z-10 font-bold text-emerald-600 dark:text-emerald-400">
                  ${b.price}
                </span>
                <span className="relative z-10 text-slate-600 dark:text-slate-300">
                  {b.size.toLocaleString()} shares
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks Column (Sellers) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 pb-1 border-b border-slate-200 dark:border-slate-800">
            <span>Asks (Passive Sellers)</span>
            <span>Size (Depth)</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {asks.map((a, idx) => (
              <div key={idx} className="relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 overflow-hidden flex items-center justify-between">
                {/* Horizontal Depth Fill */}
                <div
                  style={{ width: `${(a.total / maxDepth) * 100}%` }}
                  className="absolute inset-y-0 left-0 bg-rose-500/20 dark:bg-rose-500/30 rounded-l-lg transition-all duration-300"
                />
                <span className="relative z-10 font-bold text-rose-600 dark:text-rose-400">
                  ${a.price}
                </span>
                <span className="relative z-10 text-slate-600 dark:text-slate-300">
                  {a.size.toLocaleString()} shares
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
