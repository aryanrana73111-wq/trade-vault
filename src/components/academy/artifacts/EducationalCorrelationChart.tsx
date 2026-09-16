import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalCorrelationChart: React.FC = () => {
  const [correlation, setCorrelation] = useState<number>(0.85); // r = -1.0 to +1.0

  const correlationData = useMemo(() => {
    const points = [];
    let priceA = 100;
    let priceB = 100;

    const pseudo = (seed: number) => {
      const x = Math.sin(seed * 7.123) * 10000;
      return (x - Math.floor(x)) * 2 - 1; // -1 to +1
    };

    for (let t = 0; t <= 30; t++) {
      const shockA = pseudo(t);
      // Construct Asset B with correlation r: shockB = r * shockA + sqrt(1 - r^2) * independentShock
      const independentShock = pseudo(t + 100);
      const shockB = correlation * shockA + Math.sqrt(Math.max(0, 1 - Math.pow(correlation, 2))) * independentShock;

      priceA = Math.max(50, priceA + shockA * 2.5);
      priceB = Math.max(50, priceB + shockB * 2.5);

      points.push({
        day: `Day ${t}`,
        assetA: Number(priceA.toFixed(2)),
        assetB: Number(priceB.toFixed(2))
      });
    }
    return points;
  }, [correlation]);

  const correlationCategory = correlation > 0.6 
    ? 'Strong Positive (Direct Risk Clustering)' 
    : correlation < -0.6 
    ? 'Strong Negative (Natural Portfolio Hedge)' 
    : 'Uncorrelated (True Diversification)';

  return (
    <EducationalChartCard
      title="Asset Interdependence & Cross-Correlation Matrix"
      subtitle="Visualizing co-movement dynamics between two distinct trading assets"
      badge="Simulation"
      category="PORTFOLIO & RISK MANAGEMENT"
      units="Indexed Asset Prices (Normalized to 100)"
      whatAmILookingAt="Two simulated price series over 30 days. Asset A (Blue) and Asset B (Amber) exhibit co-movement dictated by the Pearson correlation coefficient (r) slider, spanning from perfect inverse movement (-1.0) to zero correlation (0.0) to locked tandem movement (+1.0)."
      whyItMatters="If you open long positions in 4 different tech stocks that all have r > 0.85 with each other, you do not have 4 diversified trades — you have 1 gigantic 4x leveraged bet. If the sector drops, all 4 will stop out simultaneously."
      commonMistake="Believing holding multiple assets automatically creates diversification without calculating their statistical correlation coefficient."
      metrics={[
        { label: 'Correlation (r)', value: `${correlation > 0 ? '+' : ''}${correlation.toFixed(2)}`, color: correlation > 0.5 ? 'text-amber-500' : correlation < -0.5 ? 'text-blue-600' : 'text-emerald-600', subtext: 'Pearson Metric' },
        { label: 'Regime Type', value: correlationCategory, subtext: 'Statistical Behavior' },
        { label: 'Diversification Ratio', value: `${((1 - Math.abs(correlation)) * 100).toFixed(0)}%`, color: 'text-purple-600', subtext: 'Orthogonal Edge' },
        { label: 'Observed Days', value: '30 Sessions', subtext: 'Sample Window' }
      ]}
      controls={
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            <span>Pearson Correlation Coefficient (r):</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{correlation > 0 ? '+' : ''}{correlation.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={-1.0}
            max={1.0}
            step={0.05}
            value={correlation}
            onChange={e => setCorrelation(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>-1.0 (Inverse Hedge)</span>
            <span>0.0 (Uncorrelated)</span>
            <span>+1.0 (Identical Tandem)</span>
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={correlationData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(val: any) => [`$${val}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="assetA"
              name="Asset A (Benchmark Index)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 2 }}
            />
            <Line
              type="monotone"
              dataKey="assetB"
              name="Asset B (Correlated Candidate)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
