import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalAreaChart: React.FC = () => {
  const [pocCenter, setPocCenter] = useState<number>(150); // Point of Control price
  const [valueAreaPct, setValueAreaPct] = useState<number>(70); // 70% value area

  const volumeData = useMemo(() => {
    const data = [];
    for (let p = pocCenter - 15; p <= pocCenter + 15; p += 1) {
      // Gaussian distribution centered at POC
      const diff = p - pocCenter;
      const gaussian = Math.exp(-Math.pow(diff, 2) / 32);
      const volume = Math.round(5000 + gaussian * 45000);
      const isValueArea = Math.abs(diff) <= (valueAreaPct / 10);

      data.push({
        price: `$${p}`,
        priceNum: p,
        volume: volume,
        valueAreaVolume: isValueArea ? volume : 0
      });
    }
    return data;
  }, [pocCenter, valueAreaPct]);

  const totalVol = volumeData.reduce((acc, curr) => acc + curr.volume, 0);
  const vah = pocCenter + Math.round(valueAreaPct / 10);
  const val = pocCenter - Math.round(valueAreaPct / 10);

  return (
    <EducationalChartCard
      title="Cumulative Volume Profile & Value Area Distribution"
      subtitle="Visualizing volume-weighted market acceptance and liquidity concentration nodes"
      badge="Simulation"
      category="TECHNICAL ANALYSIS & MICROSTRUCTURE"
      units="Shares Traded per Price Level"
      whatAmILookingAt="An Area Chart representing Volume at Price (Volume Profile). The peak of the bell curve is the Point of Control (POC), representing the price where the greatest volume transacted. The highlighted area is the Value Area (VA), encompassing ~70% of total transacted auction volume."
      whyItMatters="High Volume Nodes (HVNs) act as institutional acceptance zones where price tends to consolidate or revisit. Low Volume Nodes (LVNs) act as rejection areas where price moves rapidly through thin order liquidity."
      commonMistake="Placing stop orders directly inside High Volume Nodes where market rotation and liquidity sweeps are most frequent, rather than beyond structural inflection boundaries."
      metrics={[
        { label: 'Point of Control (POC)', value: `$${pocCenter}.00`, color: 'text-amber-500', subtext: 'Highest Acceptance Node' },
        { label: 'Value Area High (VAH)', value: `$${vah}.00`, color: 'text-blue-600', subtext: 'Upper 70% Volume Cutoff' },
        { label: 'Value Area Low (VAL)', value: `$${val}.00`, color: 'text-rose-600', subtext: 'Lower 70% Volume Cutoff' },
        { label: 'Total Volume', value: `${(totalVol / 1000).toFixed(0)}k Shares`, subtext: 'Transacted in Session' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Point of Control (POC) Anchor:</span>
              <span className="font-mono text-amber-500 font-bold">${pocCenter}</span>
            </div>
            <input
              type="range"
              min={130}
              max={170}
              step={2}
              value={pocCenter}
              onChange={e => setPocCenter(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Value Area Width (VA %):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{valueAreaPct}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={85}
              step={5}
              value={valueAreaPct}
              onChange={e => setValueAreaPct(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={volumeData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="price" tick={{ fontSize: 11, fill: '#64748b' }} interval={3} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(val: any) => [`${Number(val).toLocaleString()} contracts`, 'Volume']}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#2563eb"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVol)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
