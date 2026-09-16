import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalProbabilityDistribution: React.FC = () => {
  const [activeSigma, setActiveSigma] = useState<number>(2); // 1, 2, or 3 sigma
  const [kurtosisTail, setKurtosisTail] = useState<number>(40); // fat tail weight

  const distributionData = useMemo(() => {
    const points = [];
    for (let x = -4.0; x <= 4.0; x += 0.2) {
      const fixedX = Number(x.toFixed(1));
      // Standard Gaussian Normal: (1 / sqrt(2pi)) * e^(-x^2 / 2)
      const normal = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(fixedX, 2));

      // Student-t / Fat-tail with excess kurtosis (higher peak, fatter tails)
      const fatFactor = kurtosisTail / 100;
      const fatTail = (1 / (Math.PI * (1 + Math.pow(fixedX, 2)))) * 1.25;
      const marketModel = normal * (1 - fatFactor) + fatTail * fatFactor;

      points.push({
        x: fixedX,
        label: `${fixedX > 0 ? '+' : ''}${fixedX}σ`,
        normalPdf: Number((normal * 100).toFixed(2)),
        marketPdf: Number((marketModel * 100).toFixed(2)),
      });
    }
    return points;
  }, [kurtosisTail]);

  const normalProbabilityInside = activeSigma === 1 ? '68.2%' : activeSigma === 2 ? '95.4%' : '99.7%';
  const tailProbabilityTheoretical = activeSigma === 1 ? '31.8%' : activeSigma === 2 ? '4.6%' : '0.3%';
  const marketActualTailRisk = activeSigma === 1 ? '36.5%' : activeSigma === 2 ? '9.8%' : '3.4%';

  return (
    <EducationalChartCard
      title="Probability Distributions: Normal Gaussian vs Fat-Tailed Market Reality"
      subtitle="Visualizing why extreme black-swan market shocks happen orders of magnitude more often than Bell curves predict"
      badge="Simulation"
      category="QUANTITATIVE TRADING & PROBABILITY"
      units="Probability Density (%) vs Standard Deviations (σ)"
      whatAmILookingAt="A comparison of asset price returns. The dashed gray line is the standard textbook Gaussian Normal distribution. The solid blue line is actual financial market return distribution, characterized by excess kurtosis: a sharper peak at the center and much 'fatter tails' at the extremes (±3σ and beyond)."
      whyItMatters="In a pure Normal distribution, a 3-standard-deviation event happens once every ~370 trading days (0.3% probability), and a 5-sigma event is essentially impossible. In real financial markets, fat tails mean 3σ to 5σ liquidity cascades happen multiple times every single year."
      commonMistake="Using standard Value-at-Risk (VaR) models based on Gaussian assumptions that severely underestimate insolvency risk during high-volatility panic events."
      metrics={[
        { label: 'Selected Threshold', value: `±${activeSigma}σ Limit`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Confidence Band' },
        { label: 'Normal Tail Risk', value: tailProbabilityTheoretical, color: 'text-slate-400', subtext: 'Gaussian Outside %' },
        { label: 'Real Market Tail Risk', value: marketActualTailRisk, color: 'text-rose-600', subtext: 'Observed Outlier %' },
        { label: 'Kurtosis Multiplier', value: `${(parseFloat(marketActualTailRisk) / parseFloat(tailProbabilityTheoretical)).toFixed(1)}x`, color: 'text-amber-500', subtext: 'Excess Tail Frequency' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Standard Deviation Marker (σ):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">±{activeSigma}σ</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(sig => (
                <button
                  key={sig}
                  onClick={() => setActiveSigma(sig)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeSigma === sig
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  ±{sig}σ
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Market Kurtosis / Fat-Tail Weight:</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{kurtosisTail}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={kurtosisTail}
              onChange={e => setKurtosisTail(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="x" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}σ`} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(val: any) => [`${val}% density`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <ReferenceLine x={activeSigma} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `+${activeSigma}σ`, fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine x={-activeSigma} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `-${activeSigma}σ`, fill: '#ef4444', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="marketPdf"
              name="Real Market (Fat-Tailed / Leptokurtic)"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="normalPdf"
              name="Textbook Gaussian Normal (Thin-Tailed)"
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
