import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalLineChart: React.FC = () => {
  const [volatilitySpread, setVolatilitySpread] = useState<number>(25); // percentage spread
  const [timeHorizon, setTimeHorizon] = useState<number>(30); // periods

  const data = useMemo(() => {
    const points = [];
    let lowVolPrice = 100;
    let highVolPrice = 100;

    // Deterministic simulation pseudo-random generator
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let t = 0; t <= timeHorizon; t++) {
      const r1 = (pseudoRandom(t * 1.3) - 0.48) * 2; // slight drift
      const r2 = (pseudoRandom(t * 3.7) - 0.48) * 2;

      const lowVolDelta = r1 * 0.8;
      const highVolDelta = r2 * (volatilitySpread / 10);

      lowVolPrice = Math.max(50, lowVolPrice + lowVolDelta);
      highVolPrice = Math.max(30, highVolPrice + highVolDelta);

      points.push({
        period: `T+${t}`,
        lowVol: Number(lowVolPrice.toFixed(2)),
        highVol: Number(highVolPrice.toFixed(2))
      });
    }
    return points;
  }, [volatilitySpread, timeHorizon]);

  const lowVolStd = 0.8;
  const highVolStd = (volatilitySpread / 10).toFixed(1);

  return (
    <EducationalChartCard
      title="Volatility Dispersion & Price Path Drift"
      subtitle="Comparing asset trajectories under low vs high annualized realized volatility"
      badge="Simulation"
      category="MARKETS & QUANTITATIVE"
      units="USD ($) vs Time Periods"
      whatAmILookingAt="Two simulated price trajectories starting at $100. The blue line exhibits low daily dispersion (σ = ~0.8%), creating smooth trend discovery. The violet line exhibits extreme volatility (σ = ~2.5%), creating violent whipsaws and wide price swings around the same fundamental baseline."
      whyItMatters="High volatility widens required stop-loss distances. If you trade high-volatility assets with identical share sizes as low-volatility assets, your dollar risk explodes, leading to severe account drawdown."
      commonMistake="Assuming high volatility means high profitability. In reality, unhedged volatility increases friction, widening spreads and triggering premature stop-outs."
      metrics={[
        { label: 'Baseline Price', value: '$100.00', subtext: 'Starting Asset Price' },
        { label: 'Low-Vol σ', value: `±$${lowVolStd}`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Daily Standard Deviation' },
        { label: 'High-Vol σ', value: `±$${highVolStd}`, color: 'text-purple-600 dark:text-purple-400', subtext: 'Amplified Dispersion' },
        { label: 'Horizon', value: `${timeHorizon} Periods`, subtext: 'Simulation Window' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>High-Vol Dispersion Multiplier:</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{volatilitySpread}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={volatilitySpread}
              onChange={e => setVolatilitySpread(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Time Periods:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{timeHorizon} steps</span>
            </div>
            <input
              type="range"
              min={15}
              max={50}
              step={5}
              value={timeHorizon}
              onChange={e => setTimeHorizon(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(value: any) => [`$${value}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="lowVol"
              name="Low Volatility Path (Calm)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="highVol"
              name="High Volatility Path (Turbulent)"
              stroke="#a855f7"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
