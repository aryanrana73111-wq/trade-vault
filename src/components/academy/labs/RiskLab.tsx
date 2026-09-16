import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Calculator, 
  TrendingDown, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  ArrowRight,
  Info,
  Layers,
  Scale,
  Percent,
  DollarSign,
  Maximize2
} from 'lucide-react';

export const RiskLab: React.FC = () => {
  // Primary Assumptions
  const [accountBalance, setAccountBalance] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(150.0);
  const [stopPrice, setStopPrice] = useState<number>(145.0);
  const [targetPrice, setTargetPrice] = useState<number>(165.0);
  const [leverage, setLeverage] = useState<number>(1);
  const [selectedStreakLosses, setSelectedStreakLosses] = useState<number>(5);
  const [drawdownInput, setDrawdownInput] = useState<number>(30);

  // Derived Core Calculations
  const riskAmount = useMemo(() => {
    return (accountBalance * riskPercent) / 100;
  }, [accountBalance, riskPercent]);

  const stopDistance = useMemo(() => {
    return Math.max(0.01, Math.abs(entryPrice - stopPrice));
  }, [entryPrice, stopPrice]);

  const stopDistancePct = useMemo(() => {
    return (stopDistance / entryPrice) * 100;
  }, [stopDistance, entryPrice]);

  const rewardDistance = useMemo(() => {
    return Math.max(0.01, Math.abs(targetPrice - entryPrice));
  }, [targetPrice, entryPrice]);

  const rrRatio = useMemo(() => {
    return rewardDistance / stopDistance;
  }, [rewardDistance, stopDistance]);

  const calculatedShares = useMemo(() => {
    return Math.floor(riskAmount / stopDistance);
  }, [riskAmount, stopDistance]);

  const notionalTradeValue = useMemo(() => {
    return calculatedShares * entryPrice;
  }, [calculatedShares, entryPrice]);

  const requiredMargin = useMemo(() => {
    return notionalTradeValue / Math.max(1, leverage);
  }, [notionalTradeValue, leverage]);

  // Leverage & Liquidation Education
  const liquidationDistancePct = useMemo(() => {
    if (leverage <= 1) return 100;
    return (100 / leverage);
  }, [leverage]);

  // Drawdown Recovery Mathematics
  const recoveryRequiredPct = useMemo(() => {
    if (drawdownInput >= 100) return 9999;
    return (drawdownInput / (100 - drawdownInput)) * 100;
  }, [drawdownInput]);

  // Losing streak account impact under different risk regimes
  const streakImpact = useMemo(() => {
    const computeRemaining = (riskRate: number, streak: number) => {
      let balance = accountBalance;
      for (let i = 0; i < streak; i++) {
        balance *= (1 - riskRate / 100);
      }
      return balance;
    };

    return {
      risk1: computeRemaining(1.0, selectedStreakLosses),
      risk2: computeRemaining(2.0, selectedStreakLosses),
      risk5: computeRemaining(5.0, selectedStreakLosses),
      risk10: computeRemaining(10.0, selectedStreakLosses)
    };
  }, [accountBalance, selectedStreakLosses]);

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <strong className="font-bold uppercase tracking-wider">Educational Risk Simulation:</strong> All values, models, and position sizes generated in this lab are mathematical demonstrations designed to teach risk invariance and survival mathematics. They do not constitute financial advice or live broker order routing.
        </div>
      </div>

      {/* SECTION 1: Master Position Sizing & Defined Risk Engine */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Calculator className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Institutional Position Size & Risk Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Fixed-fractional capital allocation guaranteeing that dollar risk remains constant regardless of stop distance.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            Interactive Model
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Account Balance */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Account Equity ($)
            </label>
            <input
              type="number"
              min="1000"
              max="5000000"
              step="5000"
              value={accountBalance}
              onChange={e => setAccountBalance(Math.max(100, Number(e.target.value)))}
              className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="text-[10px] text-slate-400">Total liquid capital</div>
          </div>

          {/* Risk % */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Risk Per Trade (%)
              </label>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400 font-mono">
                {riskPercent.toFixed(2)}%
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="5.0"
              step="0.25"
              value={riskPercent}
              onChange={e => setRiskPercent(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400">Institutional norm: 0.5% - 1.5%</div>
          </div>

          {/* Entry Price */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Entry Price ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="1.0"
              value={entryPrice}
              onChange={e => setEntryPrice(Math.max(0.01, Number(e.target.value)))}
              className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="text-[10px] text-slate-400">Planned fill level</div>
          </div>

          {/* Stop Loss Price */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
              Stop Loss ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="1.0"
              value={stopPrice}
              onChange={e => setStopPrice(Math.max(0.01, Number(e.target.value)))}
              className="w-full text-base font-black text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
            />
            <div className="text-[10px] text-slate-400">Technical invalidation point</div>
          </div>

          {/* Target Price */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
            <label className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
              Take Profit ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="1.0"
              value={targetPrice}
              onChange={e => setTargetPrice(Math.max(0.01, Number(e.target.value)))}
              className="w-full text-base font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            <div className="text-[10px] text-slate-400">Planned profit exit</div>
          </div>
        </div>

        {/* Dynamic Calculated Outputs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {/* Defined Dollar Risk */}
          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
              Risk Amount
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              ${riskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {riskPercent}% of equity
            </span>
          </div>

          {/* Stop Distance */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Stop Distance
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              ${stopDistance.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {stopDistancePct.toFixed(2)}% of asset
            </span>
          </div>

          {/* Position Size (Units) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Position Units
            </span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
              {calculatedShares.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Exact share quantity
            </span>
          </div>

          {/* Total Notional Outlay */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Trade Notional
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
              ${notionalTradeValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {((notionalTradeValue / accountBalance) * 100).toFixed(1)}% of account
            </span>
          </div>

          {/* R:R Ratio */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              R:R Asymmetry
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              1 : {rrRatio.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">
              Reward / Risk
            </span>
          </div>

          {/* Dollar Profit at Target */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Target Profit
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              +${(calculatedShares * rewardDistance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {(rrRatio * riskPercent).toFixed(2)}% account gain
            </span>
          </div>
        </div>

        {/* Visual R:R Ladder Stage */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5 text-blue-400">
              <Scale className="w-4 h-4" />
              Dynamic Execution Ladder & R-Multiples
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Risk Invariance Check: Loss is capped at precisely ${riskAmount.toFixed(2)}
            </span>
          </div>

          <div className="relative h-24 bg-slate-950 rounded-xl border border-slate-800 flex items-center px-6 overflow-hidden">
            {/* Progress line */}
            <div className="absolute left-6 right-6 h-1.5 bg-slate-800 rounded-full top-1/2 -translate-y-1/2" />

            {/* Stop Loss Node */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-bold text-rose-400 mb-1">
                Stop: ${stopPrice.toFixed(2)}
              </span>
              <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                -1R
              </div>
              <span className="text-[10px] font-mono text-rose-300 mt-1">
                -${riskAmount.toFixed(0)}
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1 text-center">
              <span className="text-[10px] font-bold text-slate-500">
                Risk Distance: ${stopDistance.toFixed(2)}
              </span>
            </div>

            {/* Entry Node */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-400 mb-1">
                Entry: ${entryPrice.toFixed(2)}
              </span>
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                0R
              </div>
              <span className="text-[10px] font-mono text-blue-300 mt-1">
                $0.00
              </span>
            </div>

            {/* Spacer */}
            <div className="flex-1 text-center">
              <span className="text-[10px] font-bold text-slate-500">
                Reward Distance: ${rewardDistance.toFixed(2)}
              </span>
            </div>

            {/* Target Node */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-bold text-emerald-400 mb-1">
                Target: ${targetPrice.toFixed(2)}
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                +{rrRatio.toFixed(1)}R
              </div>
              <span className="text-[10px] font-mono text-emerald-300 mt-1">
                +${(calculatedShares * rewardDistance).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Leverage Education & Margin Stress Test */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <Maximize2 className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Leverage & Liquidation Mechanics Simulator
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Educational Concept
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Broker Leverage:
                </label>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {leverage}x
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={leverage}
                onChange={e => setLeverage(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Required Initial Margin:</span>
                <span className="font-mono font-bold">${requiredMargin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Margin Cushion:</span>
                <span className="font-mono font-bold text-emerald-600">
                  ${Math.max(0, accountBalance - requiredMargin).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Adverse Move to 100% Wipeout:</span>
                <span className="font-mono font-black text-rose-500">
                  -{liquidationDistancePct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
              Institutional Reality of Leverage
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Leverage does not create trading edge; it merely accelerates variance. At <strong>{leverage}x leverage</strong>, a mere <strong>-{liquidationDistancePct.toFixed(1)}%</strong> adverse movement in the underlying asset triggers total account liquidation before your technical stop-loss can even execute.
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] text-slate-400 block">10x Leverage</span>
                <span className="font-bold text-rose-500">-10.0% Liquidation</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] text-slate-400 block">25x Leverage</span>
                <span className="font-bold text-rose-500">-4.0% Liquidation</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-[10px] text-slate-400 block">50x Leverage</span>
                <span className="font-bold text-rose-500">-2.0% Liquidation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Geometric Drawdown Recovery Simulator */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Drawdown & Non-Linear Recovery Asymmetry
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Mathematical Law
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hypothetical Drawdown Level:
                </label>
                <span className="text-sm font-black text-rose-500 font-mono">
                  -{drawdownInput}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={drawdownInput}
                onChange={e => setDrawdownInput(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Account Remaining ($50k Base):
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                  ${(accountBalance * (1 - drawdownInput / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Required Return Just to Break Even:
                </span>
                <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                  +{recoveryRequiredPct.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Formula: Required Gain = [DD% / (100 - DD%)] × 100. Because your capital base shrinks after losses, recovery requires geometrically larger percentage returns.
              </p>
            </div>
          </div>

          {/* Recovery Curve Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Drawdown</th>
                  <th className="p-3">Remaining Capital</th>
                  <th className="p-3">Required Recovery</th>
                  <th className="p-3">Survival Difficulty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { dd: 10, rem: '$45,000', gain: '+11.1%', diff: 'Normal', color: 'text-slate-700' },
                  { dd: 20, rem: '$40,000', gain: '+25.0%', diff: 'Manageable', color: 'text-blue-600' },
                  { dd: 30, rem: '$35,000', gain: '+42.9%', diff: 'Challenging', color: 'text-amber-600' },
                  { dd: 50, rem: '$25,000', gain: '+100.0%', diff: 'Extreme', color: 'text-rose-600 font-bold' },
                  { dd: 75, rem: '$12,500', gain: '+300.0%', diff: 'Catastrophic', color: 'text-purple-600 font-black' }
                ].map(row => (
                  <tr key={row.dd} className={drawdownInput === row.dd ? 'bg-blue-50/60 dark:bg-blue-950/40 font-bold' : ''}>
                    <td className="p-3 font-mono">-{row.dd}%</td>
                    <td className="p-3 font-mono">{row.rem}</td>
                    <td className={`p-3 font-mono ${row.color}`}>{row.gain}</td>
                    <td className="p-3">{row.diff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 4: Losing Streak Simulator & Risk of Ruin */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Flame className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Losing Streak Simulator: Impact of Risk-Per-Trade
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Survival Stress Test
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Simulate Consecutive Losses In a Row:
            </label>
            <div className="flex items-center gap-1.5">
              {[3, 5, 8, 10, 15].map(streak => (
                <button
                  key={streak}
                  onClick={() => setSelectedStreakLosses(streak)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    selectedStreakLosses === streak
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {streak} Losses
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* 1% Risk */}
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                1.0% Risk / Trade
              </span>
              <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 font-mono">
                ${streakImpact.risk1.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs font-bold text-emerald-600 block">
                -{((1 - streakImpact.risk1 / accountBalance) * 100).toFixed(1)}% Drawdown
              </span>
              <p className="text-[10px] text-slate-500">Completely recoverable with systematic discipline.</p>
            </div>

            {/* 2% Risk */}
            <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                2.0% Risk / Trade
              </span>
              <div className="text-xl font-black text-blue-800 dark:text-blue-200 font-mono">
                ${streakImpact.risk2.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs font-bold text-blue-600 block">
                -{((1 - streakImpact.risk2 / accountBalance) * 100).toFixed(1)}% Drawdown
              </span>
              <p className="text-[10px] text-slate-500">Moderate drawdown requiring patience.</p>
            </div>

            {/* 5% Risk */}
            <div className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">
                5.0% Risk / Trade
              </span>
              <div className="text-xl font-black text-amber-800 dark:text-amber-200 font-mono">
                ${streakImpact.risk5.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs font-bold text-amber-600 block">
                -{((1 - streakImpact.risk5 / accountBalance) * 100).toFixed(1)}% Drawdown
              </span>
              <p className="text-[10px] text-slate-500">High psychological danger zone.</p>
            </div>

            {/* 10% Risk */}
            <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 block">
                10.0% Risk / Trade
              </span>
              <div className="text-xl font-black text-rose-800 dark:text-rose-200 font-mono">
                ${streakImpact.risk10.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs font-bold text-rose-600 block">
                -{((1 - streakImpact.risk10 / accountBalance) * 100).toFixed(1)}% Drawdown
              </span>
              <p className="text-[10px] text-rose-500 font-bold">Near-certain account destruction.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
