import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalCompoundingCurve: React.FC = () => {
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [monthlyReturnPct, setMonthlyReturnPct] = useState<number>(3.0); // 3% monthly
  const [timeHorizonMonths, setTimeHorizonMonths] = useState<number>(36); // 3 years

  const compoundingData = useMemo(() => {
    const data = [];
    let compounded = initialCapital;
    const linearMonthly = initialCapital * (monthlyReturnPct / 100);

    for (let m = 0; m <= timeHorizonMonths; m += 3) {
      const linearVal = initialCapital + (linearMonthly * m);
      data.push({
        month: `M${m}`,
        linear: Math.round(linearVal),
        compounded: Math.round(compounded)
      });
      // Advance compounded capital by 3 months: (1 + r)^3
      compounded = compounded * Math.pow(1 + (monthlyReturnPct / 100), 3);
    }
    return data;
  }, [initialCapital, monthlyReturnPct, timeHorizonMonths]);

  const finalCompounded = compoundingData[compoundingData.length - 1].compounded;
  const finalLinear = compoundingData[compoundingData.length - 1].linear;
  const excessGain = finalCompounded - finalLinear;

  return (
    <EducationalChartCard
      title="The Compounding Curve: Linear vs Exponential Growth"
      subtitle="Demonstrating how reinvesting mathematical edge creates explosive geometric divergence over time"
      badge="Simulation"
      category="PORTFOLIO & QUANTITATIVE"
      units="USD ($) across Monthly Periods"
      whatAmILookingAt="A comparison of two capital accumulation paths starting from $10,000 at a 3% monthly return. The gray line represents Linear (simple) growth where profits are withdrawn every month. The green line represents Exponential geometric compounding where profits are continuously reinvested."
      whyItMatters="In the early stages (Months 0 to 12), linear and exponential curves look almost identical. But by Month 24 to 36, the geometric curve curves aggressively upward. Compounding requires consistency and patient execution without taking destructive drawdowns."
      commonMistake="Overleveraging in year 1 trying to get rich quick, which causes a 50%+ drawdown and resets the compounding clock to zero."
      metrics={[
        { label: 'Compounded Capital', value: `$${finalCompounded.toLocaleString()}`, color: 'text-emerald-600', subtext: `After ${timeHorizonMonths} Months` },
        { label: 'Linear Capital', value: `$${finalLinear.toLocaleString()}`, color: 'text-slate-400', subtext: 'Without Reinvestment' },
        { label: 'Compounding Bonus', value: `+$${excessGain.toLocaleString()}`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Pure Geometric Advantage' },
        { label: 'Effective Annual (APY)', value: `${((Math.pow(1 + monthlyReturnPct / 100, 12) - 1) * 100).toFixed(1)}%`, subtext: 'Annualized Compound Rate' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Initial Principal ($):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">${initialCapital.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={2500}
              max={50000}
              step={2500}
              value={initialCapital}
              onChange={e => setInitialCapital(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Monthly Edge / Return (%):</span>
              <span className="font-mono text-emerald-600 font-bold">{monthlyReturnPct}% / mo</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={6.0}
              step={0.5}
              value={monthlyReturnPct}
              onChange={e => setMonthlyReturnPct(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Time Horizon:</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{timeHorizonMonths} Months</span>
            </div>
            <input
              type="range"
              min={12}
              max={60}
              step={6}
              value={timeHorizonMonths}
              onChange={e => setTimeHorizonMonths(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={compoundingData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="compounded"
              name="Exponential Reinvested Compounding"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="linear"
              name="Linear Simple Growth (Profits Withdrawn)"
              stroke="#94a3b8"
              strokeWidth={1.8}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
