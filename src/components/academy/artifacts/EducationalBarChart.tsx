import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalBarChart: React.FC = () => {
  const [winRate, setWinRate] = useState<number>(45); // 45% win rate
  const [totalTrades, setTotalTrades] = useState<number>(100);

  const distributionData = useMemo(() => {
    // Systematic model: capped loss at -1R, multi-tiered profit targets
    const lossTrades = Math.round(totalTrades * ((100 - winRate) / 100));
    const winTrades = totalTrades - lossTrades;

    const fullLoss = Math.round(lossTrades * 0.75);
    const scratchLoss = lossTrades - fullLoss;

    const tier1Win = Math.round(winTrades * 0.45);
    const tier2Win = Math.round(winTrades * 0.35);
    const runnerWin = winTrades - tier1Win - tier2Win;

    return [
      { rMultiple: '-1.0R (Full Stop)', count: fullLoss, type: 'loss', pnl: -1 * fullLoss },
      { rMultiple: '-0.5R (Scratched)', count: scratchLoss, type: 'loss', pnl: -0.5 * scratchLoss },
      { rMultiple: '+1.0R (Scale Out)', count: tier1Win, type: 'win', pnl: 1 * tier1Win },
      { rMultiple: '+2.0R (Target)', count: tier2Win, type: 'win', pnl: 2 * tier2Win },
      { rMultiple: '+3.5R (Runner)', count: runnerWin, type: 'win', pnl: 3.5 * runnerWin }
    ];
  }, [winRate, totalTrades]);

  const netR = distributionData.reduce((acc, curr) => acc + curr.pnl, 0);
  const expectancy = (netR / totalTrades).toFixed(2);

  return (
    <EducationalChartCard
      title="Trade Return Distribution (R-Multiple Breakdown)"
      subtitle="Visualizing trade frequency by risk multiple to verify asymmetric system edge"
      badge="Educational Example"
      category="TRADING FUNDAMENTALS & RISK"
      units="Trade Frequency vs R-Multiple"
      whatAmILookingAt="A frequency distribution histogram of 100 simulated trades classified by their R-multiple payoff. Red bars represent controlled losses (-1R stop or -0.5R scratch), while green bars represent multi-tiered winning outcomes (+1R, +2R, and +3.5R runners)."
      whyItMatters="High win rates are not required for profitability. Notice that even with a 40-45% win rate, holding losses strictly to -1R while capturing multi-R gains produces a decisively positive expected return (EV > 0)."
      commonMistake="Letting losses run beyond -1.0R (e.g., holding through hope into -3R or -5R), which rapidly destroys the positive skew of your return distribution."
      metrics={[
        { label: 'Win Rate', value: `${winRate}%`, color: 'text-blue-600 dark:text-blue-400', subtext: `${winRate} Winners / ${100 - winRate} Losers` },
        { label: 'Total Net R', value: `${netR > 0 ? '+' : ''}${netR.toFixed(1)}R`, color: netR >= 0 ? 'text-emerald-600' : 'text-rose-600', subtext: 'Aggregate System Edge' },
        { label: 'Expectancy (EV)', value: `${expectancy}R / trade`, color: 'text-amber-600 dark:text-amber-400', subtext: 'Expected Value per Execution' },
        { label: 'Sample Size', value: `${totalTrades} Trades`, subtext: 'Evaluated Executions' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Win Rate (%):</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{winRate}%</span>
            </div>
            <input
              type="range"
              min={30}
              max={70}
              step={5}
              value={winRate}
              onChange={e => setWinRate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Total Sample Size:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{totalTrades} Trades</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={25}
              value={totalTrades}
              onChange={e => setTotalTrades(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distributionData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="rMultiple" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Number of Trades', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(value: any, name: any, item: any) => [
                `${value} trades (${item.payload.pnl > 0 ? '+' : ''}${item.payload.pnl.toFixed(1)}R contribution)`,
                'Frequency'
              ]}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {distributionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.type === 'win' ? '#10b981' : '#f43f5e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
