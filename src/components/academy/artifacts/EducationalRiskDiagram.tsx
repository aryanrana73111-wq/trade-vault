import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, AlertOctagon, DollarSign, Scale, Percent } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalRiskDiagram: React.FC = () => {
  const [balance, setBalance] = useState<number>(50000);
  const [riskPct, setRiskPct] = useState<number>(1.0); // 1%
  const [entryPrice, setEntryPrice] = useState<number>(150);
  const [stopPrice, setStopPrice] = useState<number>(145);

  const riskAmount = (balance * (riskPct / 100));
  const stopDistance = Math.max(0.01, Math.abs(entryPrice - stopPrice));
  const stopPct = ((stopDistance / entryPrice) * 100).toFixed(1);
  const positionSize = Math.floor(riskAmount / stopDistance);
  const notionalValue = positionSize * entryPrice;
  const leverage = balance > 0 ? (notionalValue / balance).toFixed(2) : '0';
  const potentialLoss = positionSize * stopDistance;

  return (
    <EducationalChartCard
      title="The Systematic Risk Invariance Engine"
      subtitle="The 5-step institutional pipeline transforming account parameters into mathematical trade size"
      badge="Simulation"
      category="RISK MANAGEMENT"
      units="USD ($) and Asset Share Units"
      whatAmILookingAt="An interactive visualization of the fundamental 5-step risk-first sizing algorithm: Account Balance × Risk % gives Risk Amount ($). Dividing Risk Amount by per-share Stop Distance derives the exact Position Size in shares. No matter how close or far the stop is, your total dollar loss is guaranteed to equal exactly your risk amount."
      whyItMatters="Amateur traders pick a share size first (e.g. 'I will buy 500 shares') and let the stop determine the dollar loss. Institutional traders define the dollar loss first ($500 max) and let the chart structure dictate the exact share size."
      commonMistake="Widening stop losses without decreasing position size, or using arbitrary fixed share counts regardless of volatility or account equity."
      metrics={[
        { label: 'Risk Budget', value: `$${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-amber-500', subtext: `${riskPct}% of Account` },
        { label: 'Calculated Size', value: `${positionSize.toLocaleString()} Units`, color: 'text-blue-600 dark:text-blue-400', subtext: `$${notionalValue.toLocaleString()} Notional` },
        { label: 'Stop Distance', value: `$${stopDistance.toFixed(2)} (${stopPct}%)`, color: 'text-rose-600', subtext: 'Invalidation Room' },
        { label: 'Effective Leverage', value: `${leverage}x`, color: Number(leverage) > 3 ? 'text-rose-500' : 'text-emerald-600', subtext: 'Total Exposure / Equity' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Account Balance:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">${balance.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={250000}
              step={5000}
              value={balance}
              onChange={e => setBalance(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Risk Per Trade:</span>
              <span className="font-mono text-amber-500 font-bold">{riskPct}%</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={4.0}
              step={0.25}
              value={riskPct}
              onChange={e => setRiskPct(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Entry Price:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">${entryPrice}</span>
            </div>
            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={entryPrice}
              onChange={e => setEntryPrice(Number(e.target.value))}
              className="w-full accent-slate-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Stop Loss Price:</span>
              <span className="font-mono text-rose-500 font-bold">${stopPrice}</span>
            </div>
            <input
              type="range"
              min={entryPrice * 0.7}
              max={entryPrice - 0.5}
              step={0.5}
              value={stopPrice}
              onChange={e => setStopPrice(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      {/* 5-Step Pipeline Flow Visualizer */}
      <div className="py-4 overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between gap-2">
          {/* Step 1: Account Balance */}
          <div className="flex-1 p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-center space-y-1 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Step 1</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Account Equity</p>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">
              ${balance.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400 block">Available Capital</span>
          </div>

          <div className="text-slate-300 dark:text-slate-600 shrink-0 font-bold text-lg">
            ×
          </div>

          {/* Step 2: Risk Percentage */}
          <div className="flex-1 p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-center space-y-1 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Step 2</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Risk %</p>
            <p className="text-lg font-black text-amber-500">
              {riskPct}%
            </p>
            <span className="text-[10px] text-slate-400 block">Risk Rule</span>
          </div>

          <div className="text-slate-300 dark:text-slate-600 shrink-0 font-bold text-lg">
            =
          </div>

          {/* Step 3: Dollar Risk Amount */}
          <div className="flex-1 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-center space-y-1 shadow-xs">
            <span className="text-[10px] font-black uppercase text-amber-600">Step 3</span>
            <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Max Dollar Loss</p>
            <p className="text-lg font-black text-amber-600 dark:text-amber-400">
              ${riskAmount.toFixed(0)}
            </p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 block">Capped Liability</span>
          </div>

          <div className="text-slate-300 dark:text-slate-600 shrink-0 font-bold text-lg">
            ÷
          </div>

          {/* Step 4: Stop Distance */}
          <div className="flex-1 p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-center space-y-1 shadow-xs">
            <span className="text-[10px] font-black uppercase text-slate-400">Step 4</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Stop Distance</p>
            <p className="text-lg font-black text-rose-500">
              ${stopDistance.toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-400 block">Per-Share Loss</span>
          </div>

          <div className="text-slate-300 dark:text-slate-600 shrink-0 font-bold text-lg">
            =
          </div>

          {/* Step 5: Final Position Size */}
          <div className="flex-1 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-center space-y-1 shadow-xs">
            <span className="text-[10px] font-black uppercase text-emerald-600">Step 5</span>
            <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Position Size</p>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {positionSize.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">Total Shares / Contracts</span>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
