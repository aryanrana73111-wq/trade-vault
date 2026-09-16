import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Layers, 
  ArrowDownUp, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  HelpCircle,
  Clock,
  ShieldCheck,
  Percent,
  Play
} from 'lucide-react';

interface OrderBookLevel {
  price: number;
  size: number;
  total: number;
}

interface ExecutionResult {
  timestamp: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  requestedQty: number;
  filledQty: number;
  vwapPrice: number;
  slippageDollars: number;
  slippageBps: number;
  marketImpactCents: number;
  liquidityRole: 'MAKER' | 'TAKER';
  status: 'FILLED' | 'PARTIAL' | 'RESTING';
  explanation: string;
}

export const ExecutionLab: React.FC = () => {
  // Order entry parameters
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [quantity, setQuantity] = useState<number>(2500);
  const [limitPrice, setLimitPrice] = useState<number>(100.02);
  const [stopTriggerPrice, setStopTriggerPrice] = useState<number>(100.04);
  const [history, setHistory] = useState<ExecutionResult[]>([]);

  // Simulated Order Book State
  const [initialBook, setInitialBook] = useState<{ asks: OrderBookLevel[]; bids: OrderBookLevel[] }>({
    asks: [
      { price: 100.05, size: 4000, total: 9300 },
      { price: 100.04, size: 2500, total: 5300 },
      { price: 100.03, size: 1200, total: 2800 },
      { price: 100.02, size: 1000, total: 1600 },
      { price: 100.01, size: 600, total: 600 }
    ],
    bids: [
      { price: 100.00, size: 800, total: 800 },
      { price: 99.99, size: 1500, total: 2300 },
      { price: 99.98, size: 2000, total: 4300 },
      { price: 99.97, size: 3000, total: 7300 },
      { price: 99.96, size: 5000, total: 12300 }
    ]
  });

  const bestBid = initialBook.bids[0].price;
  const bestAsk = initialBook.asks[initialBook.asks.length - 1].price;
  const spread = bestAsk - bestBid;
  const spreadBps = (spread / bestBid) * 10000;

  // Execute Simulated Order
  const handleExecuteOrder = () => {
    let filledQty = 0;
    let totalOutlay = 0;
    let slippageDollars = 0;
    let marketImpactCents = 0;
    let status: 'FILLED' | 'PARTIAL' | 'RESTING' = 'FILLED';
    let role: 'MAKER' | 'TAKER' = 'TAKER';
    let explanation = '';

    if (orderType === 'MARKET') {
      role = 'TAKER';
      if (side === 'BUY') {
        let remainingToFill = quantity;
        // Asks are sorted highest to lowest in display, but best ask is at index asks.length - 1 (100.01)
        const sortedAsks = [...initialBook.asks].sort((a, b) => a.price - b.price);
        
        let sweptLevels = 0;
        for (const level of sortedAsks) {
          if (remainingToFill <= 0) break;
          const fillHere = Math.min(remainingToFill, level.size);
          totalOutlay += fillHere * level.price;
          filledQty += fillHere;
          remainingToFill -= fillHere;
          sweptLevels++;
        }

        const vwap = filledQty > 0 ? totalOutlay / filledQty : bestAsk;
        slippageDollars = (vwap - bestAsk) * filledQty;
        const slippageBps = ((vwap - bestAsk) / bestAsk) * 10000;
        marketImpactCents = Math.round((vwap - bestAsk) * 100);

        if (remainingToFill > 0) {
          status = 'PARTIAL';
          explanation = `Market Buy order of ${quantity} shares exhausted all available visible ask depth! Filled ${filledQty} shares at VWAP $${vwap.toFixed(4)}. Swept ${sweptLevels} book levels, incurring ${slippageBps.toFixed(1)} bps slippage and driving the market up by ${marketImpactCents}¢.`;
        } else {
          status = 'FILLED';
          explanation = `Market Buy filled immediately. Because your size (${quantity.toLocaleString()} shares) exceeded the Top-of-Book depth of ${sortedAsks[0].size} shares, your order walked the book across ${sweptLevels} price levels, paying an average price of $${vwap.toFixed(4)} with $${slippageDollars.toFixed(2)} in slippage penalty.`;
        }

        const result: ExecutionResult = {
          timestamp: new Date().toLocaleTimeString(),
          side,
          type: orderType,
          requestedQty: quantity,
          filledQty,
          vwapPrice: vwap,
          slippageDollars,
          slippageBps,
          marketImpactCents,
          liquidityRole: role,
          status,
          explanation
        };

        setHistory(prev => [result, ...prev.slice(0, 7)]);
      } else {
        // Market Sell
        let remainingToFill = quantity;
        const sortedBids = [...initialBook.bids].sort((a, b) => b.price - a.price);

        let sweptLevels = 0;
        for (const level of sortedBids) {
          if (remainingToFill <= 0) break;
          const fillHere = Math.min(remainingToFill, level.size);
          totalOutlay += fillHere * level.price;
          filledQty += fillHere;
          remainingToFill -= fillHere;
          sweptLevels++;
        }

        const vwap = filledQty > 0 ? totalOutlay / filledQty : bestBid;
        slippageDollars = (bestBid - vwap) * filledQty;
        const slippageBps = ((bestBid - vwap) / bestBid) * 10000;
        marketImpactCents = Math.round((bestBid - vwap) * 100);

        status = remainingToFill > 0 ? 'PARTIAL' : 'FILLED';
        explanation = `Market Sell crossed the spread and hit the bid. Executed ${filledQty.toLocaleString()} shares at VWAP $${vwap.toFixed(4)} across ${sweptLevels} levels, causing ${marketImpactCents}¢ of negative price impact.`;

        const result: ExecutionResult = {
          timestamp: new Date().toLocaleTimeString(),
          side,
          type: orderType,
          requestedQty: quantity,
          filledQty,
          vwapPrice: vwap,
          slippageDollars,
          slippageBps,
          marketImpactCents,
          liquidityRole: role,
          status,
          explanation
        };

        setHistory(prev => [result, ...prev.slice(0, 7)]);
      }
    } else if (orderType === 'LIMIT') {
      // Limit order logic
      if (side === 'BUY') {
        if (limitPrice >= bestAsk) {
          // Crosses spread: behaves as marketable limit order
          role = 'TAKER';
          const fillHere = Math.min(quantity, 600);
          status = fillHere < quantity ? 'PARTIAL' : 'FILLED';
          explanation = `Marketable Limit Buy at $${limitPrice.toFixed(2)} crossed the spread and matched immediately against resting Ask at $${bestAsk.toFixed(2)}. Incurred taker fee with zero slippage above your limit.`;
          
          const result: ExecutionResult = {
            timestamp: new Date().toLocaleTimeString(),
            side,
            type: orderType,
            requestedQty: quantity,
            filledQty: fillHere,
            vwapPrice: bestAsk,
            slippageDollars: 0,
            slippageBps: 0,
            marketImpactCents: 0,
            liquidityRole: role,
            status,
            explanation
          };
          setHistory(prev => [result, ...prev.slice(0, 7)]);
        } else {
          // Passive resting limit order
          role = 'MAKER';
          status = 'RESTING';
          explanation = `Passive Limit Buy at $${limitPrice.toFixed(2)} is below Best Ask ($${bestAsk.toFixed(2)}). The order enters the Order Book as resting maker liquidity. No execution occurs until another market participant sells at your limit price.`;
          
          const result: ExecutionResult = {
            timestamp: new Date().toLocaleTimeString(),
            side,
            type: orderType,
            requestedQty: quantity,
            filledQty: 0,
            vwapPrice: limitPrice,
            slippageDollars: 0,
            slippageBps: 0,
            marketImpactCents: 0,
            liquidityRole: role,
            status,
            explanation
          };
          setHistory(prev => [result, ...prev.slice(0, 7)]);
        }
      } else {
        // Sell limit
        role = limitPrice <= bestBid ? 'TAKER' : 'MAKER';
        status = limitPrice <= bestBid ? 'FILLED' : 'RESTING';
        explanation = limitPrice <= bestBid
          ? `Marketable Limit Sell crossed the spread and filled at Best Bid $${bestBid.toFixed(2)}.`
          : `Passive Limit Sell at $${limitPrice.toFixed(2)} added to the ask book as resting liquidity.`;

        const result: ExecutionResult = {
          timestamp: new Date().toLocaleTimeString(),
          side,
          type: orderType,
          requestedQty: quantity,
          filledQty: limitPrice <= bestBid ? quantity : 0,
          vwapPrice: limitPrice <= bestBid ? bestBid : limitPrice,
          slippageDollars: 0,
          slippageBps: 0,
          marketImpactCents: 0,
          liquidityRole: role,
          status,
          explanation
        };
        setHistory(prev => [result, ...prev.slice(0, 7)]);
      }
    } else if (orderType === 'STOP') {
      // Stop order
      role = 'TAKER';
      status = 'RESTING';
      explanation = `Stop Order placed at $${stopTriggerPrice.toFixed(2)}. This order currently rests on the broker server as an inactive trigger. If market trade price reaches or exceeds $${stopTriggerPrice.toFixed(2)}, it immediately activates and executes as an aggressive Market Order, taking on spread and slippage.`;

      const result: ExecutionResult = {
        timestamp: new Date().toLocaleTimeString(),
        side,
        type: orderType,
        requestedQty: quantity,
        filledQty: 0,
        vwapPrice: stopTriggerPrice,
        slippageDollars: 0,
        slippageBps: 0,
        marketImpactCents: 0,
        liquidityRole: role,
        status,
        explanation
      };
      setHistory(prev => [result, ...prev.slice(0, 7)]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50 flex items-start gap-3">
        <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed">
          <strong className="font-bold uppercase tracking-wider">Simulated Market Microstructure Lab:</strong> This interactive engine simulates order book depth matching, bid/ask spread crossing, queue priority, and market impact. All books and fills are local pedagogical simulations.
        </div>
      </div>

      {/* Main Lab Layout: Order Book + Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Simulated Order Book (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              Level 2 Order Book Depth
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
              Simulated L2
            </span>
          </div>

          {/* Book Depth Display */}
          <div className="space-y-1 font-mono text-xs">
            {/* Table Header */}
            <div className="grid grid-cols-3 text-[10px] text-slate-400 font-bold uppercase pb-1 px-2">
              <span>Price ($)</span>
              <span className="text-right">Size</span>
              <span className="text-right">Cumulative</span>
            </div>

            {/* Asks (Sells) */}
            <div className="space-y-0.5">
              {initialBook.asks.map((lvl) => {
                const depthPct = (lvl.size / 4000) * 100;
                return (
                  <div 
                    key={lvl.price} 
                    className="relative grid grid-cols-3 py-1 px-2 rounded-md hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 overflow-hidden"
                  >
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none" 
                      style={{ width: `${depthPct}%` }}
                    />
                    <span className="font-bold relative z-10">${lvl.price.toFixed(2)}</span>
                    <span className="text-right relative z-10 text-slate-600 dark:text-slate-300">{lvl.size.toLocaleString()}</span>
                    <span className="text-right relative z-10 text-slate-400">{lvl.total.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {/* Bid-Ask Spread Indicator */}
            <div className="p-2.5 my-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between font-sans">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ArrowDownUp className="w-3.5 h-3.5 text-cyan-500" />
                <span>Spread: ${spread.toFixed(2)}</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {spreadBps.toFixed(1)} bps
              </span>
            </div>

            {/* Bids (Buys) */}
            <div className="space-y-0.5">
              {initialBook.bids.map((lvl) => {
                const depthPct = (lvl.size / 5000) * 100;
                return (
                  <div 
                    key={lvl.price} 
                    className="relative grid grid-cols-3 py-1 px-2 rounded-md hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 overflow-hidden"
                  >
                    <div 
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none" 
                      style={{ width: `${depthPct}%` }}
                    />
                    <span className="font-bold relative z-10">${lvl.price.toFixed(2)}</span>
                    <span className="text-right relative z-10 text-slate-600 dark:text-slate-300">{lvl.size.toLocaleString()}</span>
                    <span className="text-right relative z-10 text-slate-400">{lvl.total.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Order Ticket (7 Cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Interactive Order Execution Ticket
            </h3>
            <span className="text-xs text-slate-400">
              Test how order types interact with liquidity
            </span>
          </div>

          {/* Side Selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSide('BUY')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                side === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              BUY (Cross Ask / Bid)
            </button>
            <button
              onClick={() => setSide('SELL')}
              className={`py-2.5 rounded-xl text-xs font-black transition-all ${
                side === 'SELL'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              SELL (Hit Bid / Ask)
            </button>
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: 'MARKET', label: 'Market Order', desc: 'Instant taker execution' },
              { type: 'LIMIT', label: 'Limit Order', desc: 'Passive price control' },
              { type: 'STOP', label: 'Stop Order', desc: 'Triggered condition' }
            ].map(ot => (
              <button
                key={ot.type}
                onClick={() => setOrderType(ot.type as any)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  orderType === ot.type
                    ? 'border-cyan-500 bg-cyan-50/40 dark:bg-cyan-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-black text-slate-900 dark:text-slate-100">{ot.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{ot.desc}</div>
              </button>
            ))}
          </div>

          {/* Quantity and Price Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Order Size (Shares):
              </label>
              <input
                type="number"
                min="100"
                max="20000"
                step="500"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono"
              />
              <div className="text-[10px] text-slate-400">
                Top ask depth is 600 shares
              </div>
            </div>

            {orderType === 'LIMIT' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Limit Price ($):
                </label>
                <input
                  type="number"
                  min="90"
                  max="110"
                  step="0.01"
                  value={limitPrice}
                  onChange={e => setLimitPrice(Number(e.target.value))}
                  className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono"
                />
                <div className="text-[10px] text-slate-400">
                  Best Ask is ${bestAsk.toFixed(2)}
                </div>
              </div>
            )}

            {orderType === 'STOP' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Stop Trigger Price ($):
                </label>
                <input
                  type="number"
                  min="90"
                  max="110"
                  step="0.01"
                  value={stopTriggerPrice}
                  onChange={e => setStopTriggerPrice(Number(e.target.value))}
                  className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono"
                />
                <div className="text-[10px] text-slate-400">
                  Converts to Market Order on touch
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleExecuteOrder}
            className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Play className="w-4 h-4 fill-white" />
            Send Simulated {side} {orderType} Order
          </button>
        </div>
      </div>

      {/* Execution Post-Trade Audit Log */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Execution Audit Log & Microstructure Analysis
        </h4>

        {history.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-400">
            Submit a simulated order above to inspect fill VWAP, order book walking, slippage, and market impact.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                      h.side === 'BUY' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' : 'bg-rose-100 dark:bg-rose-950 text-rose-700'
                    }`}>
                      {h.side} {h.type}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {h.filledQty.toLocaleString()} / {h.requestedQty.toLocaleString()} Shares Filled @ ${h.vwapPrice.toFixed(4)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-slate-400">{h.timestamp}</span>
                    <span className={`font-bold ${h.slippageDollars > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      Slippage: +${h.slippageDollars.toFixed(2)} ({h.slippageBps.toFixed(1)} bps)
                    </span>
                    <span className="text-cyan-600 font-bold">
                      {h.liquidityRole}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  {h.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
