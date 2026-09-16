import React, { useState } from 'react';
import { Sliders, Calculator, DollarSign, AlertTriangle, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalPositionSizeVisualizer: React.FC = () => {
  const [accountBalance, setAccountBalance] = useState<number>(25000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0); // 1%
  const [stopDistance, setStopDistance] = useState<number>(2.50); // $2.50 per share
  const [entryPrice, setEntryPrice] = useState<number>(125.00);

  // Dynamic calculations
  const riskAmount = accountBalance * (riskPercent / 100);
  const positionSize = stopDistance > 0 ? Math.floor(riskAmount / stopDistance) : 0;
  const notionalExposure = positionSize * entryPrice;
  const potentialLoss = positionSize * stopDistance;
  const portfolioLeverage = accountBalance > 0 ? (notionalExposure / accountBalance).toFixed(2) : '0';

  const isExcessiveRisk = riskPercent > 2.5;
  const isHighLeverage = Number(portfolioLeverage) > 4.0;

  return (
    <EducationalChartCard
      title="Dynamic Position Size & Capital Protection Sandbox"
      subtitle="Interactive calibration tool dynamically solving for exact unit size from risk parameters"
      badge="Simulation"
      category="RISK MANAGEMENT"
      units="USD ($) and Share Units"
      whatAmILookingAt="An interactive calculator showing the exact mathematical relationship between your account balance, risk tolerance percentage, and technical stop distance. Modifying any slider instantly recalculates your required share size and potential dollar loss."
      whyItMatters="Position sizing is the master dial of survival. If you keep your risk percentage fixed (e.g., 1%), a wider stop will automatically reduce your share count, protecting your account from outsized drawdowns. Conversely, a tight stop allows more shares while keeping your dollar loss strictly constant."
      commonMistake="Sizing by purchasing a fixed round number of shares (e.g., 'I always buy 1,000 shares') regardless of where your technical stop loss is located, causing random and wild fluctuations in risk."
      metrics={[
        { label: 'Risk Amount (1R)', value: `$${riskAmount.toFixed(2)}`, color: 'text-amber-500', subtext: `${riskPercent}% of Equity` },
        { label: 'Calculated Position', value: `${positionSize.toLocaleString()} Shares`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Exact Unit Allocation' },
        { label: 'Potential Loss', value: `-$${potentialLoss.toFixed(2)}`, color: 'text-rose-600', subtext: 'Loss if Stopped Out' },
        { label: 'Notional Exposure', value: `$${notionalExposure.toLocaleString()}`, color: 'text-slate-900 dark:text-slate-100', subtext: `${portfolioLeverage}x Leverage` }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Account Balance:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">${accountBalance.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={2000}
              max={100000}
              step={1000}
              value={accountBalance}
              onChange={e => setAccountBalance(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Risk % per Trade:</span>
              <span className="font-mono text-amber-500 font-bold">{riskPercent}%</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={5.0}
              step={0.25}
              value={riskPercent}
              onChange={e => setRiskPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Stop Distance ($):</span>
              <span className="font-mono text-rose-500 font-bold">${stopDistance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={15.0}
              step={0.25}
              value={stopDistance}
              onChange={e => setStopDistance(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Asset Entry Price:</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">${entryPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={10}
              max={400}
              step={5}
              value={entryPrice}
              onChange={e => setEntryPrice(Number(e.target.value))}
              className="w-full accent-slate-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Visual Allocation Breakdown Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">Account Equity Utilization</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              ${notionalExposure.toLocaleString()} / ${accountBalance.toLocaleString()} ({portfolioLeverage}x)
            </span>
          </div>

          <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
            {/* Cash Allocation */}
            <div
              style={{ width: `${Math.min(100, Math.max(5, (accountBalance / Math.max(accountBalance, notionalExposure)) * 100))}%` }}
              className="bg-blue-500 h-full transition-all duration-300"
              title="Base Capital"
            />
            {Number(portfolioLeverage) > 1 && (
              <div
                style={{ width: `${Math.min(100, ((notionalExposure - accountBalance) / notionalExposure) * 100)}%` }}
                className="bg-purple-500 h-full transition-all duration-300 opacity-80"
                title="Margin / Leveraged Exposure"
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Base Capital: ${accountBalance.toLocaleString()}</span>
            <span>Margin Debt: ${Math.max(0, notionalExposure - accountBalance).toLocaleString()}</span>
          </div>
        </div>

        {/* Safety Diagnostic Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
            isExcessiveRisk
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
          }`}>
            {isExcessiveRisk ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />}
            <div className="space-y-0.5 text-xs">
              <span className="font-bold">Risk Invariance Status:</span>
              <p className="text-[11px] opacity-90">
                {isExcessiveRisk 
                  ? `Warning: ${riskPercent}% risk exceeds standard 1-2% risk threshold. A 5-trade drawdown would consume ${(riskPercent * 5).toFixed(1)}% of capital.`
                  : `Prudent: ${riskPercent}% risk preserves institutional drawdown thresholds.`}
              </p>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
            isHighLeverage
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300'
          }`}>
            <Scale className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-bold">Leverage Factor:</span>
              <p className="text-[11px] opacity-90">
                {isHighLeverage
                  ? `High Leverage Alert: ${portfolioLeverage}x exposure means a ${(100 / Number(portfolioLeverage)).toFixed(1)}% adverse gap causes total account liquidation.`
                  : `Conservative Leverage: ${portfolioLeverage}x notional exposure is within safe portfolio parameters.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
