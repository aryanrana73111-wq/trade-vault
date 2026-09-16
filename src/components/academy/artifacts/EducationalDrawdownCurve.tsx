import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalDrawdownCurve: React.FC = () => {
  const [scenario, setScenario] = useState<'moderate' | 'deep' | 'controlled'>('deep');

  const data = useMemo(() => {
    if (scenario === 'controlled') {
      return [
        { trade: 0, equity: 10000, peak: 10000, drawdown: 0 },
        { trade: 5, equity: 10800, peak: 10800, drawdown: 0 },
        { trade: 10, equity: 10300, peak: 10800, drawdown: -4.6 },
        { trade: 15, equity: 11400, peak: 11400, drawdown: 0 },
        { trade: 20, equity: 11000, peak: 11400, drawdown: -3.5 },
        { trade: 25, equity: 12100, peak: 12100, drawdown: 0 },
        { trade: 30, equity: 12900, peak: 12900, drawdown: 0 },
        { trade: 35, equity: 12400, peak: 12900, drawdown: -3.8 },
        { trade: 40, equity: 13800, peak: 13800, drawdown: 0 },
      ];
    }
    if (scenario === 'moderate') {
      return [
        { trade: 0, equity: 10000, peak: 10000, drawdown: 0 },
        { trade: 5, equity: 11500, peak: 11500, drawdown: 0 },
        { trade: 10, equity: 10200, peak: 11500, drawdown: -11.3 },
        { trade: 15, equity: 9500, peak: 11500, drawdown: -17.4 },
        { trade: 20, equity: 10800, peak: 11500, drawdown: -6.0 },
        { trade: 25, equity: 11800, peak: 11800, drawdown: 0 },
        { trade: 30, equity: 12500, peak: 12500, drawdown: 0 },
        { trade: 35, equity: 11200, peak: 12500, drawdown: -10.4 },
        { trade: 40, equity: 13400, peak: 13400, drawdown: 0 },
      ];
    }
    // Deep catastrophic drawdown (-50%)
    return [
      { trade: 0, equity: 10000, peak: 10000, drawdown: 0 },
      { trade: 5, equity: 13000, peak: 13000, drawdown: 0 },
      { trade: 10, equity: 10400, peak: 13000, drawdown: -20.0 },
      { trade: 15, equity: 8450, peak: 13000, drawdown: -35.0 },
      { trade: 20, equity: 6500, peak: 13000, drawdown: -50.0 }, // 50% Drawdown
      { trade: 25, equity: 7800, peak: 13000, drawdown: -40.0 },
      { trade: 30, equity: 9750, peak: 13000, drawdown: -25.0 },
      { trade: 35, equity: 11700, peak: 13000, drawdown: -10.0 },
      { trade: 40, equity: 13000, peak: 13000, drawdown: 0 }, // Breakeven after +100% gain!
    ];
  }, [scenario]);

  const maxDd = Math.min(...data.map(d => d.drawdown));
  const absDd = Math.abs(maxDd);
  const requiredGain = absDd > 0 ? ((absDd / (100 - absDd)) * 100).toFixed(1) : '0';

  return (
    <EducationalChartCard
      title="Dual Equity Curve & Underwater Drawdown Profile"
      subtitle="Exposing the non-linear geometric penalty of deep portfolio drawdowns"
      badge="Simulation"
      category="RISK MANAGEMENT"
      units="USD ($) and Drawdown % from High Water Mark"
      whatAmILookingAt="Two vertically synchronized panels: The top panel shows account equity against its historical High-Water Mark (dotted line). The bottom panel shows the 'Underwater' drawdown curve measuring percentage drop from peak capital."
      whyItMatters="Losses compound geometrically. A 10% drawdown requires an 11.1% gain to break even. A 30% drawdown requires a 42.8% gain. But a 50% drawdown requires a massive +100% gain just to get back to zero! Avoiding deep drawdowns is the single most important law of trading longevity."
      commonMistake="Revenge trading after a 20% drawdown with doubled position size, causing drawdown to spiral into irreversible 50%+ territory."
      metrics={[
        { label: 'Max Peak Drawdown', value: `${maxDd.toFixed(1)}%`, color: 'text-rose-600', subtext: 'Trough from Peak Equity' },
        { label: 'Required Recovery Gain', value: `+${requiredGain}%`, color: 'text-amber-500', subtext: 'Return Needed to Breakeven' },
        { label: 'Initial Capital', value: '$10,000', subtext: 'Starting Principal' },
        { label: 'Recovery Multiplier', value: absDd > 0 ? `${(Number(requiredGain) / absDd).toFixed(2)}x` : '1.0x', subtext: 'Effort Penalty Ratio' }
      ]}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Scenario:</span>
          {(['controlled', 'moderate', 'deep'] as const).map(sc => (
            <button
              key={sc}
              onClick={() => setScenario(sc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                scenario === sc
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {sc === 'deep' ? 'Catastrophic (-50% DD)' : sc === 'moderate' ? 'Moderate (-17% DD)' : 'Controlled (-5% DD)'}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top: Equity Curve */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>Portfolio Equity Curve & High Water Mark ($)</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Peak: $13,000</span>
          </div>
          <div className="h-44 sm:h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="trade" hide />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Equity']}
                />
                <Line type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="stepAfter" dataKey="peak" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Underwater Drawdown Area */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
            <span>Underwater Drawdown Profile (% from Peak)</span>
            <span className="font-mono text-rose-500 font-bold">Max: {maxDd.toFixed(1)}%</span>
          </div>
          <div className="h-32 sm:h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="drawdownFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="trade" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Trade #', position: 'insideBottomRight', offset: -5, fontSize: 10, fill: '#94a3b8' }} />
                <YAxis domain={[-60, 0]} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                  formatter={(val: any) => [`${val}%`, 'Drawdown']}
                />
                <Area type="monotone" dataKey="drawdown" stroke="#ef4444" strokeWidth={2} fill="url(#drawdownFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </EducationalChartCard>
  );
};
