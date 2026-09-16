import React, { useState } from 'react';
import { Layers, ArrowDownUp, AlertCircle, ShoppingCart } from 'lucide-react';

interface BookLevel {
  price: number;
  size: number;
  total: number;
}

export const OrderBookDepthVisualizer: React.FC = () => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSize, setOrderSize] = useState<number>(1200);

  // Initial Asks (Sellers above mid-price)
  const asks: BookLevel[] = [
    { price: 100.30, size: 2500, total: 5700 },
    { price: 100.20, size: 1800, total: 3200 },
    { price: 100.10, size: 900, total: 1400 },
    { price: 100.05, size: 500, total: 500 } // Best Ask
  ];

  // Initial Bids (Buyers below mid-price)
  const bids: BookLevel[] = [
    { price: 99.95, size: 600, total: 600 },  // Best Bid
    { price: 99.90, size: 1100, total: 1700 },
    { price: 99.80, size: 2200, total: 3900 },
    { price: 99.70, size: 3100, total: 7000 }
  ];

  const spread = (asks[asks.length - 1].price - bids[0].price).toFixed(2);
  const midPrice = ((asks[asks.length - 1].price + bids[0].price) / 2).toFixed(2);

  // Calculate Market Buy fill across book levels
  const calculateMarketFill = (requestedQty: number) => {
    let remaining = requestedQty;
    let cost = 0;
    const fills: { price: number; filledQty: number }[] = [];

    // Fills hit asks in ascending price order
    const sortedAsks = [...asks].reverse(); // from 100.05 up
    for (const lvl of sortedAsks) {
      if (remaining <= 0) break;
      const fillThisLevel = Math.min(remaining, lvl.size);
      fills.push({ price: lvl.price, filledQty: fillThisLevel });
      cost += fillThisLevel * lvl.price;
      remaining -= fillThisLevel;
    }

    const totalFilled = requestedQty - remaining;
    const avgPrice = totalFilled > 0 ? (cost / totalFilled) : 0;
    const bestAsk = sortedAsks[0].price;
    const slippagePerShare = avgPrice > 0 ? avgPrice - bestAsk : 0;

    return { totalFilled, avgPrice, slippagePerShare, cost, remaining };
  };

  const sim = calculateMarketFill(orderSize);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Electronic Limit Order Book (Level 2 DOM)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Simulate liquidity depth, spread crossing, and market order slippage
          </p>
        </div>

        {/* Order Size Slider */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Simulate Buy Size: <span className="text-blue-600 font-bold">{orderSize.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={100}
            max={5000}
            step={100}
            value={orderSize}
            onChange={(e) => setOrderSize(Number(e.target.value))}
            className="w-28 accent-blue-600 cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The Depth Ladder */}
        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
          <div className="flex justify-between text-[11px] font-semibold text-slate-400 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span>Price ($)</span>
            <span>Size</span>
            <span>Cumulative Depth</span>
          </div>

          {/* Asks (Sell Orders - Red) */}
          <div className="space-y-1 my-2">
            {asks.map((lvl) => {
              const fillAtLvl = sim.avgPrice >= lvl.price;
              return (
                <div 
                  key={lvl.price} 
                  className={`flex justify-between items-center px-2 py-1 rounded transition-colors ${
                    fillAtLvl ? 'bg-red-100/70 dark:bg-red-950/60 font-bold text-red-700 dark:text-red-300' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  <span>${lvl.price.toFixed(2)}</span>
                  <span>{lvl.size.toLocaleString()}</span>
                  <span>{lvl.total.toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          {/* Spread Gap Indicator */}
          <div className="my-2 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-center text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center gap-2">
            <ArrowDownUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Spread: ${spread} (Mid: ${midPrice})</span>
          </div>

          {/* Bids (Buy Orders - Green) */}
          <div className="space-y-1 my-2">
            {bids.map((lvl) => (
              <div key={lvl.price} className="flex justify-between items-center px-2 py-1 rounded text-emerald-600 dark:text-emerald-400">
                <span>${lvl.price.toFixed(2)}</span>
                <span>{lvl.size.toLocaleString()}</span>
                <span>{lvl.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Metrics Panel */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              Market Buy Execution Summary
            </h5>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Best Available Ask:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">$100.05</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Average Fill Price:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">${sim.avgPrice.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Market Impact / Slippage:</span>
                <span className="font-bold text-red-600 dark:text-red-400">+${sim.slippagePerShare.toFixed(3)} / share</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Cost:</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">${sim.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Microstructure Insight:</span> Because you purchased {orderSize.toLocaleString()} units, the best ask ($100.05) with 500 units was exhausted. Your order swept into higher tiers, raising your average fill to <strong>${sim.avgPrice.toFixed(3)}</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
