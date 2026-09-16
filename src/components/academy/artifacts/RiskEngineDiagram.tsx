import React, { useState } from 'react';
import { Sliders, Shield, AlertTriangle, ArrowRight, DollarSign } from 'lucide-react';

interface RiskEngineDiagramProps {
  initialEquity?: number;
  initialRiskPct?: number;
  initialEntry?: number;
  initialStop?: number;
}

export const RiskEngineDiagram: React.FC<RiskEngineDiagramProps> = ({
  initialEquity = 25000,
  initialRiskPct = 1.0,
  initialEntry = 150.00,
  initialStop = 145.00
}) => {
  const [equity, setEquity] = useState(initialEquity);
  const [riskPct, setRiskPct] = useState(initialRiskPct);
  const [entryPrice, setEntryPrice] = useState(initialEntry);
  const [stopPrice, setStopPrice] = useState(initialStop);

  const dollarRisk = (equity * (riskPct / 100));
  const stopDistance = Math.abs(entryPrice - stopPrice);
  const positionSize = stopDistance > 0 ? Math.floor(dollarRisk / stopDistance) : 0;
  const notionalExposure = positionSize * entryPrice;
  const effectiveLeverage = equity > 0 ? (notionalExposure / equity).toFixed(2) : '0';

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 my-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Dynamic Position Sizing Engine</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Fixed Fractional Risk Model (Risk Invariance)</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Interactive Artifact
        </span>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-5">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Account Equity: <span className="text-blue-600 font-bold">${equity.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={equity}
            onChange={(e) => setEquity(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Risk Per Trade: <span className="text-blue-600 font-bold">{riskPct.toFixed(1)}%</span>
          </label>
          <input
            type="range"
            min={0.25}
            max={5.0}
            step={0.25}
            value={riskPct}
            onChange={(e) => setRiskPct(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Entry Price: <span className="text-slate-800 dark:text-slate-200 font-bold">${entryPrice.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={10}
            max={500}
            step={1}
            value={entryPrice}
            onChange={(e) => {
              const val = Number(e.target.value);
              setEntryPrice(val);
              if (stopPrice >= val) setStopPrice(Number((val * 0.96).toFixed(2)));
            }}
            className="w-full accent-slate-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Stop Price: <span className="text-red-600 dark:text-red-400 font-bold">${stopPrice.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={Math.max(1, entryPrice * 0.5)}
            max={entryPrice - 0.5}
            step={0.5}
            value={stopPrice}
            onChange={(e) => setStopPrice(Number(e.target.value))}
            className="w-full accent-red-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Step-by-Step Mathematical Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">1. Account Equity</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">${equity.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500">Available capital</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/20">
          <p className="text-[11px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-semibold">2. Dollar Risk (1R)</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">${dollarRisk.toFixed(2)}</p>
          <span className="text-[11px] text-blue-600/80 font-medium">{riskPct}% budget limit</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">3. Stop Distance</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">${stopDistance.toFixed(2)}</p>
          <span className="text-[11px] text-slate-500">Chart invalidation</span>
        </div>

        <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800">
          <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-bold">4. Calculated Size</p>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">{positionSize.toLocaleString()} units</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Risk ÷ Stop Distance</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">5. Exposure & Leverage</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">${notionalExposure.toLocaleString()}</p>
          <span className="text-[11px] text-slate-500">{effectiveLeverage}x effective leverage</span>
        </div>
      </div>

      {/* Explanatory Takeaway */}
      <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
        <DollarSign className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Key Educational Insight:</span> If your stop distance increases from $5.00 to $10.00, notice how the position size automatically cuts in half from {positionSize} units to {Math.floor(dollarRisk / (stopDistance * 2 || 1))} units. <strong className="underline">Your dollar risk stays locked at exactly ${dollarRisk.toFixed(2)}.</strong>
        </div>
      </div>
    </div>
  );
};
