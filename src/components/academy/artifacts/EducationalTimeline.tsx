import React, { useState } from 'react';
import { Clock, Calendar, AlertOctagon, ShieldAlert, ArrowRight, Activity, Flame } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalTimeline: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('gfc-2008');

  const historicalEvents = [
    {
      id: 'black-monday-1987',
      year: '1987',
      title: 'Black Monday Portfolio Insurance Cascade',
      drop: '-22.6% in 1 Day',
      mechanism: 'Algorithmic dynamic hedging rules (portfolio insurance) created a feedback loop of automated market-order selling into illiquid order books.',
      lesson: 'Never assume liquidity is continuous during automated panic execution.',
      vixPeak: '150+'
    },
    {
      id: 'ltcm-1998',
      year: '1998',
      title: 'Long-Term Capital Management (LTCM) Liquidity Crisis',
      drop: 'Fund Liquidation',
      mechanism: 'Excessive leverage (25:1 to 100:1) on fixed-income convergence arbitrage failed when Russian sovereign default widened spreads beyond capital reserves.',
      lesson: 'Models that assume liquidity will always exist to exit positions guarantee eventual bankruptcy when extreme stress hits.',
      vixPeak: '45.7'
    },
    {
      id: 'gfc-2008',
      year: '2008',
      title: 'Global Financial Crisis & Lehman Collapse',
      drop: '-56.8% Peak-to-Trough',
      mechanism: 'Interbank credit freeze triggered by subprime mortgage CDO contagion, culminating in broker-dealer insolvency and multi-year credit contraction.',
      lesson: 'Correlations between supposedly independent asset classes spike toward +1.0 during systematic de-leveraging.',
      vixPeak: '89.5'
    },
    {
      id: 'flash-crash-2010',
      year: '2010',
      title: 'The 2010 E-Mini Flash Crash',
      drop: '-9.0% in 36 Minutes',
      mechanism: 'A large automated sell algorithm fed aggressive market orders into thin liquidity, causing high-frequency market makers to withdraw limit orders completely.',
      lesson: 'Market depth can instantaneously evaporate to zero, leaving stub quotes as the only resting bids.',
      vixPeak: '45.8'
    },
    {
      id: 'covid-2020',
      year: '2020',
      title: 'Covid-19 Global Liquidity Shock',
      drop: '-34% in 22 Trading Days',
      mechanism: 'Fastest 30% drawdown in stock market history; simultaneous collapse in equities and long-term treasuries as funds liquidated all assets to raise US Dollar cash.',
      lesson: 'Cash is the ultimate risk hedge when margin calls force multi-asset liquidation across global macro funds.',
      vixPeak: '85.4'
    },
    {
      id: 'svb-2023',
      year: '2023',
      title: 'Silicon Valley Bank Run & Duration Shock',
      drop: 'Fastest $42B Bank Run',
      mechanism: 'Rapid Federal Reserve rate hikes caused unhedged long-duration bond portfolios to incur massive mark-to-market unrealized losses, triggering digital bank runs.',
      lesson: 'Interest rate duration risk must be strictly modeled and hedged even in "risk-free" government paper.',
      vixPeak: '30.8'
    }
  ];

  const activeEvent = historicalEvents.find(e => e.id === selectedEventId) || historicalEvents[0];

  return (
    <EducationalChartCard
      title="Historical Market Shocks & Liquidity Cascades Timeline"
      subtitle="Chronology of systemic market failures and the immutable structural lessons they teach"
      badge="Educational Example"
      category="MACRO & INSTITUTIONAL TRADING"
      units="Calendar Milestones & Drawdown Severity"
      whatAmILookingAt="An interactive timeline of modern financial crises. Selecting any event breaks down the exact microstructure mechanism that triggered the collapse, the peak volatility metric, and the timeless risk lesson required for portfolio survival."
      whyItMatters="Every market crisis feels unique in the headlines, but beneath the surface, the structural mechanics are identical: excessive leverage + illiquidity + sudden correlation convergence + forced margin liquidation."
      commonMistake="Believing 'this time is different' and removing stop losses because modern markets or technology allegedly prevent historical crashes."
      metrics={[
        { label: 'Selected Event', value: activeEvent.year, color: 'text-blue-600 dark:text-blue-400', subtext: activeEvent.title.split(' ')[0] },
        { label: 'Shock Severity', value: activeEvent.drop, color: 'text-rose-600', subtext: 'Peak-to-Trough Impact' },
        { label: 'VIX Volatility Peak', value: activeEvent.vixPeak, color: 'text-amber-500', subtext: 'Fear Index Spike' },
        { label: 'Catalyst Type', value: 'Liquidity / Leverage', subtext: 'Systemic Breakdown' }
      ]}
      controls={
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {historicalEvents.map(evt => (
            <button
              key={evt.id}
              onClick={() => setSelectedEventId(evt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedEventId === evt.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{evt.year}</span>
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Active Event Showcase Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                Year {activeEvent.year} Systemic Milestone
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                {activeEvent.title}
              </h4>
            </div>
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 self-start sm:self-center">
              {activeEvent.drop}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-500" />
                <span>Microstructure Failure Mechanism</span>
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeEvent.mechanism}
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-500" />
                <span>Institutional Risk Rule</span>
              </span>
              <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                {activeEvent.lesson}
              </p>
            </div>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
