import React, { useState } from 'react';
import { ArrowRight, ArrowDownUp, AlertTriangle, ShieldCheck, Zap, DollarSign } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalBidAskVisualizer: React.FC = () => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderAction, setOrderAction] = useState<'buy' | 'sell'>('buy');
  const [orderSize, setOrderSize] = useState<number>(500); // 500 shares
  const [spreadCents, setSpreadCents] = useState<number>(6); // 6 cents spread

  const midPrice = 150.00;
  const halfSpread = (spreadCents / 100) / 2;
  const bidPrice = midPrice - halfSpread;
  const askPrice = midPrice + halfSpread;

  // Immediate fill price
  const executionPrice = orderType === 'limit'
    ? (orderAction === 'buy' ? bidPrice : askPrice)
    : (orderAction === 'buy' ? askPrice : bidPrice);

  const immediateFriction = orderType === 'market' 
    ? orderSize * halfSpread * 2
    : 0; // Limit orders capture or do not cross the spread

  return (
    <EducationalChartCard
      title="Bid/Ask Auction Dynamics & Immediate Execution Friction"
      subtitle="Visualizing the hidden cost of crossing the spread with market orders versus resting limits"
      badge="Simulation"
      category="EXECUTION & MICROSTRUCTURE"
      units="USD ($) Execution Fill and Slippage"
      whatAmILookingAt="An interactive simulation of auction order crossing. When you submit a Market Buy, you immediately cross the spread and buy at the Ask ($150.03). If you instantly sold that position back, you would sell at the Bid ($149.97), losing the entire spread ($30.00) in zero seconds before price even moved."
      whyItMatters="High-frequency scalpers and intraday traders who routinely use Market Orders leak thousands of dollars annually in invisible bid-ask spread friction. Using Patient Limit Orders captures the spread instead of paying it."
      commonMistake="Ignoring the spread on illiquid equities or during market open/close, where spreads can widen from 2 cents to 50 cents, immediately putting your trade in a -0.5R hole."
      metrics={[
        { label: 'Execution Price', value: `$${executionPrice.toFixed(2)}`, color: orderAction === 'buy' ? 'text-blue-600 dark:text-blue-400' : 'text-amber-500', subtext: `${orderType.toUpperCase()} ${orderAction.toUpperCase()} Fill` },
        { label: 'Instant Friction Loss', value: `$${immediateFriction.toFixed(2)}`, color: immediateFriction > 0 ? 'text-rose-600' : 'text-emerald-600', subtext: 'Spread Crossing Cost' },
        { label: 'Current Spread', value: `$${(spreadCents / 100).toFixed(2)} (${spreadCents}¢)`, color: 'text-slate-400', subtext: 'Bid-Ask Divergence' },
        { label: 'Order Notional', value: `$${(orderSize * executionPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, subtext: `${orderSize} Shares` }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Order Direction:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setOrderAction('buy')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderAction === 'buy' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Buy (Long)
              </button>
              <button
                onClick={() => setOrderAction('sell')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderAction === 'sell' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Sell (Short)
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">Execution Mechanism:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setOrderType('market')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'market' ? 'bg-amber-500 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Market (Taker)
              </button>
              <button
                onClick={() => setOrderType('limit')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'limit' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Limit (Maker)
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Spread Width:</span>
              <span className="font-mono text-amber-500 font-bold">{spreadCents}¢</span>
            </div>
            <input
              type="range"
              min={1}
              max={25}
              step={1}
              value={spreadCents}
              onChange={e => setSpreadCents(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Order Size:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{orderSize} shares</span>
            </div>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={orderSize}
              onChange={e => setOrderSize(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="py-4 space-y-6">
        {/* Visual Spread Tunnel */}
        <div className="relative max-w-xl mx-auto p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono font-bold pb-2 border-b border-slate-800">
            <span className="text-emerald-400">BID: ${bidPrice.toFixed(2)}</span>
            <span className="text-slate-400">MID: ${midPrice.toFixed(2)}</span>
            <span className="text-rose-400">ASK: ${askPrice.toFixed(2)}</span>
          </div>

          {/* Interactive Arrow Indicator */}
          <div className="py-6 flex items-center justify-between relative">
            {/* Bid Platform */}
            <div className="w-24 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-black block">Bid</span>
              <span className="text-sm font-black text-emerald-300">${bidPrice.toFixed(2)}</span>
            </div>

            {/* Gap Channel */}
            <div className="flex-1 mx-3 h-2 rounded-full bg-slate-800 relative flex items-center justify-center">
              <span className="text-[10px] font-bold text-amber-400 bg-slate-900 px-2 rounded-full border border-slate-700">
                Spread: ${ (spreadCents / 100).toFixed(2) }
              </span>
            </div>

            {/* Ask Platform */}
            <div className="w-24 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-center">
              <span className="text-[10px] text-rose-400 uppercase font-black block">Ask</span>
              <span className="text-sm font-black text-rose-300">${askPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Fill Banner */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                Your <strong>{orderType.toUpperCase()} {orderAction.toUpperCase()}</strong> order fills at:
              </span>
            </div>
            <span className="text-sm font-black text-white font-mono bg-blue-600 px-2.5 py-1 rounded-lg">
              ${executionPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
