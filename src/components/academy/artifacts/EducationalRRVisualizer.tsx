import React, { useState } from 'react';
import { Target, ShieldAlert, TrendingUp, Scale, ArrowUpRight } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalRRVisualizer: React.FC = () => {
  const [entryPrice, setEntryPrice] = useState<number>(100);
  const [stopPrice, setStopPrice] = useState<number>(95);
  const [targetPrice, setTargetPrice] = useState<number>(115);

  const riskDistance = Math.max(0.1, entryPrice - stopPrice);
  const rewardDistance = Math.max(0.1, targetPrice - entryPrice);
  const rMultiple = Number((rewardDistance / riskDistance).toFixed(2));
  const breakevenWinRate = ((1 / (1 + rMultiple)) * 100).toFixed(1);

  const totalRange = (targetPrice - stopPrice);
  const riskHeightPct = ((riskDistance / totalRange) * 100).toFixed(1);
  const rewardHeightPct = ((rewardDistance / totalRange) * 100).toFixed(1);

  return (
    <EducationalChartCard
      title="Risk-to-Reward Geometry & Breakeven Thresholds"
      subtitle="Visualizing price target symmetry and calculating mathematical win rate requirements"
      badge="Simulation"
      category="TRADING FUNDAMENTALS & RISK"
      units="USD ($) and Ratio Multiple"
      whatAmILookingAt="A vertical representation of an order structure. The green box represents your profit objective (Reward = +$15.00), the central white line represents your Entry ($100.00), and the red box represents your stop loss (Risk = -$5.00). In this setup, you risk $1.00 to make $3.00 (1:3.00 R)."
      whyItMatters="The higher your R:R ratio, the lower your required win rate to break even. At 1:1 R:R, you need >50% win rate. At 1:2 R:R, you only need >33.3% win rate. At 1:3 R:R, you can be wrong 70% of the time and still remain profitable!"
      commonMistake="Setting arbitrary profit targets just to achieve a high R:R ratio on paper, without respecting structural technical resistance levels where price is likely to reverse."
      metrics={[
        { label: 'R-Multiple', value: `1 : ${rMultiple} R`, color: 'text-emerald-600', subtext: 'Risk vs Reward Multiple' },
        { label: 'Breakeven Win Rate', value: `${breakevenWinRate}%`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Minimum Accuracy Needed' },
        { label: 'Per-Share Risk', value: `-$${riskDistance.toFixed(2)}`, color: 'text-rose-600', subtext: 'Distance to Invalidation' },
        { label: 'Per-Share Reward', value: `+$${rewardDistance.toFixed(2)}`, color: 'text-emerald-600', subtext: 'Distance to Take-Profit' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Stop Loss Price:</span>
              <span className="font-mono text-rose-600 font-bold">${stopPrice}</span>
            </div>
            <input
              type="range"
              min={80}
              max={entryPrice - 1}
              step={1}
              value={stopPrice}
              onChange={e => setStopPrice(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Entry Price:</span>
              <span className="font-mono text-blue-600 font-bold">${entryPrice}</span>
            </div>
            <input
              type="range"
              min={stopPrice + 1}
              max={targetPrice - 1}
              step={1}
              value={entryPrice}
              onChange={e => setEntryPrice(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Target Profit Price:</span>
              <span className="font-mono text-emerald-600 font-bold">${targetPrice}</span>
            </div>
            <input
              type="range"
              min={entryPrice + 1}
              max={150}
              step={1}
              value={targetPrice}
              onChange={e => setTargetPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
        {/* Visual Vertical Risk/Reward Stack */}
        <div className="w-full max-w-xs flex items-stretch gap-4">
          {/* Price Scale Indicators */}
          <div className="flex flex-col justify-between text-xs font-mono font-bold text-slate-400 py-1 text-right w-16 shrink-0">
            <span className="text-emerald-500">${targetPrice.toFixed(2)}</span>
            <span className="text-blue-500">${entryPrice.toFixed(2)}</span>
            <span className="text-rose-500">${stopPrice.toFixed(2)}</span>
          </div>

          {/* Visual Boxes Container */}
          <div className="flex-1 h-64 rounded-2xl border border-slate-300 dark:border-slate-750 overflow-hidden flex flex-col shadow-inner bg-slate-100 dark:bg-slate-900">
            {/* Reward Box (Green) */}
            <div
              style={{ flex: rewardDistance }}
              className="bg-emerald-500/20 dark:bg-emerald-500/30 border-b-2 border-emerald-500 flex flex-col justify-center items-center p-3 text-center transition-all duration-300"
            >
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black text-sm sm:text-base">
                <Target className="w-4 h-4" />
                <span>Target: +${rewardDistance.toFixed(2)}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600/90 dark:text-emerald-400">
                Reward ({rMultiple}R)
              </span>
            </div>

            {/* Entry Line Divider */}
            <div className="h-0.5 bg-blue-500 relative flex items-center justify-end pr-2 shrink-0">
              <span className="absolute -top-3 right-2 text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-600 text-white shadow-xs">
                Entry: ${entryPrice.toFixed(2)}
              </span>
            </div>

            {/* Risk Box (Red) */}
            <div
              style={{ flex: riskDistance }}
              className="bg-rose-500/20 dark:bg-rose-500/30 border-t-2 border-rose-500 flex flex-col justify-center items-center p-3 text-center transition-all duration-300"
            >
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-black text-sm sm:text-base">
                <ShieldAlert className="w-4 h-4" />
                <span>Stop: -${riskDistance.toFixed(2)}</span>
              </div>
              <span className="text-[11px] font-bold text-rose-600/90 dark:text-rose-400">
                Risk (1.0R)
              </span>
            </div>
          </div>
        </div>

        {/* Expectancy & Math Breakdown Panel */}
        <div className="space-y-4 max-w-sm w-full">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              Mathematical Breakeven Formula
            </span>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
              WinRate<sub>BE</sub> = 1 / (1 + R) = 1 / (1 + {rMultiple}) = <span className="text-blue-600 font-bold">{breakevenWinRate}%</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              If your execution win rate exceeds {breakevenWinRate}%, this setup has positive mathematical expectancy over a large sample of trades.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Reward / Risk</span>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{rMultiple} : 1</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <span className="text-[10px] uppercase font-bold text-blue-600">Tolerance Rate</span>
              <p className="text-base font-black text-blue-700 dark:text-blue-300">{(100 - Number(breakevenWinRate)).toFixed(1)}% Losses</p>
            </div>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
