import React, { useState } from 'react';
import { GitFork, CheckCircle2, AlertTriangle, ArrowRight, CornerDownRight, ShieldCheck, Zap } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalDecisionTree: React.FC = () => {
  // Step selections in the decision path
  const [marketRegime, setMarketRegime] = useState<'trend' | 'range'>('trend');
  const [volatilityLevel, setVolatilityLevel] = useState<'normal' | 'extreme'>('normal');
  const [setupValid, setSetupValid] = useState<'yes' | 'no'>('yes');
  const [rrFavorable, setRrFavorable] = useState<'yes' | 'no'>('yes');

  // Derive final systematic trade mandate
  let decisionTitle = '';
  let decisionBadge = '';
  let decisionColor = '';
  let actionProtocol = '';

  if (setupValid === 'no') {
    decisionTitle = 'DO NOT TRADE: Setup Disqualified';
    decisionBadge = 'Stand Aside';
    decisionColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    actionProtocol = 'Zero edge exists without full checklist alignment. Preserve capital; wait for the next structural setup.';
  } else if (volatilityLevel === 'extreme') {
    decisionTitle = 'HALT / HALF SIZE: Volatility Circuit Active';
    decisionBadge = 'Risk Warning';
    decisionColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    actionProtocol = 'Extreme volatility expands spread friction and gap risk. Reduce position size by 50% or stand aside entirely.';
  } else if (rrFavorable === 'no') {
    decisionTitle = 'REJECT TRADE: Insufficient R:R Ratio (< 1.5R)';
    decisionBadge = 'Negative EV';
    decisionColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    actionProtocol = 'The distance to structural resistance does not justify the stop distance. Passing is mandatory.';
  } else if (marketRegime === 'trend') {
    decisionTitle = 'EXECUTE: Trend-Continuation Pullback (Patient Limit Order)';
    decisionBadge = 'Approved (+EV)';
    decisionColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    actionProtocol = 'Route passive Limit Buy order at the 50% retracement of the prior impulse candle with a structural stop below the swing low.';
  } else {
    decisionTitle = 'EXECUTE: Mean-Reversion Liquidity Sweep Fade';
    decisionBadge = 'Approved (+EV)';
    decisionColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
    actionProtocol = 'Wait for false breakout above range high to trap breakout traders, then enter short with target at range midpoint (POC).';
  }

  return (
    <EducationalChartCard
      title="Systematic Trade Qualification & Execution Decision Tree"
      subtitle="Interactive logic gate enforcing institutional discipline before any capital is committed"
      badge="Educational Example"
      category="SYSTEMATIC TRADING & EXECUTION"
      units="Binary Logic Gates (Pass / Fail)"
      whatAmILookingAt="An interactive trade filter tree. Before clicking 'Buy' or 'Sell', professional desk traders run through a sequential conditional tree: Regime Qualification → Volatility Gate → Structural Setup Criteria → Risk-Reward Clearance. Only setups that successfully clear every single gate are approved for execution."
      whyItMatters="Discretionary emotional trading fails because traders take low-probability trades out of boredom or FOMO. A hard-coded decision tree eliminates impulsive entries by acting as a non-negotiable firewall."
      commonMistake="Skipping the Volatility or R:R gate because 'this setup looks too good to pass up', taking a trade with a 0.8:1 R:R that destroys mathematical expectancy."
      metrics={[
        { label: 'Current Filter Outcome', value: decisionBadge, color: decisionBadge.includes('Approved') ? 'text-emerald-600' : 'text-rose-600', subtext: 'System Authorization' },
        { label: 'Regime Bias', value: marketRegime === 'trend' ? 'Trend Following' : 'Mean Reversion', color: 'text-blue-600 dark:text-blue-400', subtext: 'Structural Environment' },
        { label: 'Volatility State', value: volatilityLevel.toUpperCase(), color: volatilityLevel === 'extreme' ? 'text-amber-500' : 'text-emerald-600', subtext: 'Sizing Constraint' },
        { label: 'Expectancy Filter', value: rrFavorable === 'yes' ? 'R:R ≥ 1.5R' : 'Sub-Optimal', subtext: 'Mathematical Threshold' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">1. Market Regime:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setMarketRegime('trend')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  marketRegime === 'trend' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setMarketRegime('range')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  marketRegime === 'range' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Range-Bound
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">2. Volatility State:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setVolatilityLevel('normal')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  volatilityLevel === 'normal' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Normal (ATR ≤ 1.5x)
              </button>
              <button
                onClick={() => setVolatilityLevel('extreme')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  volatilityLevel === 'extreme' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Extreme / News
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">3. Setup Rules Met:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSetupValid('yes')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  setupValid === 'yes' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                All 4 Criteria
              </button>
              <button
                onClick={() => setSetupValid('no')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  setupValid === 'no' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Partial / Missing
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">4. Reward-to-Risk:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setRrFavorable('yes')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  rrFavorable === 'yes' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                ≥ 1.5R Target
              </button>
              <button
                onClick={() => setRrFavorable('no')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  rrFavorable === 'no' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                &lt; 1.5R Target
              </button>
            </div>
          </div>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        {/* Logic Gate Flow */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
          <div className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">1. Regime:</span>
            <span className="font-bold text-blue-600 capitalize">{marketRegime}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          <div className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">2. Volatility:</span>
            <span className={`font-bold capitalize ${volatilityLevel === 'normal' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {volatilityLevel}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          <div className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">3. Setup Check:</span>
            <span className={`font-bold capitalize ${setupValid === 'yes' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {setupValid === 'yes' ? 'Pass' : 'Fail'}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          <div className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-slate-500">4. R:R Math:</span>
            <span className={`font-bold capitalize ${rrFavorable === 'yes' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {rrFavorable === 'yes' ? 'Pass' : 'Fail'}
            </span>
          </div>
        </div>

        {/* Output Protocol Box */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${decisionColor}`}>
          <div className="flex items-center gap-2 mb-1.5">
            {decisionBadge.includes('Approved') ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <h4 className="text-sm sm:text-base font-black tracking-tight">
              {decisionTitle}
            </h4>
          </div>
          <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-medium">
            {actionProtocol}
          </p>
        </div>
      </div>
    </EducationalChartCard>
  );
};
