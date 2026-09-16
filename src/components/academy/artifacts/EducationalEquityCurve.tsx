import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalEquityCurve: React.FC = () => {
  const [winRate, setWinRate] = useState<number>(50); // 50%
  const [rrRatio, setRrRatio] = useState<number>(2.0); // 2:1 Reward to Risk
  const [riskPerTrade, setRiskPerTrade] = useState<number>(250); // $250 per 1R

  const simulationData = useMemo(() => {
    const points = [];
    let edgeEquity = 25000;
    let frictionEquity = 25000;

    // Deterministic pseudo-random seed generator
    const pseudo = (seed: number) => {
      const x = Math.sin(seed * 9.876) * 10000;
      return x - Math.floor(x);
    };

    points.push({
      trade: 0,
      withEdge: edgeEquity,
      noEdgeFriction: frictionEquity
    });

    for (let t = 1; t <= 60; t++) {
      const roll = pseudo(t) * 100;
      // Model 1: User's strategy parameters
      const isWin = roll < winRate;
      const edgeDelta = isWin ? (riskPerTrade * rrRatio) : -riskPerTrade;
      edgeEquity = Math.max(1000, edgeEquity + edgeDelta);

      // Model 2: Coin-flip 50/50 with 1:1 R:R plus spread/slippage friction (-$25 per round-trip)
      const isCoinWin = pseudo(t * 2.3) > 0.5;
      const frictionDelta = (isCoinWin ? riskPerTrade : -riskPerTrade) - 25;
      frictionEquity = Math.max(1000, frictionEquity + frictionDelta);

      points.push({
        trade: t,
        withEdge: Math.round(edgeEquity),
        noEdgeFriction: Math.round(frictionEquity)
      });
    }

    return points;
  }, [winRate, rrRatio, riskPerTrade]);

  const endEquity = simulationData[simulationData.length - 1].withEdge;
  const netPnL = endEquity - 25000;
  const pnlPct = ((netPnL / 25000) * 100).toFixed(1);
  const expectancy = (((winRate / 100) * rrRatio) - ((100 - winRate) / 100) * 1.0).toFixed(2);

  return (
    <EducationalChartCard
      title="System Expectancy & Equity Curve Trajectory"
      subtitle="Simulating account capital growth under positive mathematical edge versus friction decay"
      badge="Simulation"
      category="QUANTITATIVE TRADING & RISK"
      units="Account Equity ($) over 60 Trades"
      whatAmILookingAt="A simulated 60-trade equity trajectory starting from $25,000 capital. The blue curve models your configured strategy parameters (Win Rate & R:R). The gray curve models random 50/50 market betting subject to broker commissions and bid/ask spread friction."
      whyItMatters="Notice the local drawdowns along the blue curve even when expectancy is heavily positive (EV > 0). Even a winning trading system experiences clusters of 3 to 5 consecutive losses due to statistical variance."
      commonMistake="Abandoning a mathematically sound trading system after a standard 4-trade losing streak, falsely believing the strategy is broken."
      metrics={[
        { label: 'Initial Capital', value: '$25,000', subtext: 'Starting Balance' },
        { label: 'Ending Balance', value: `$${endEquity.toLocaleString()}`, color: endEquity >= 25000 ? 'text-emerald-600' : 'text-rose-600', subtext: `${pnlPct}% Return` },
        { label: 'System Expectancy', value: `${expectancy}R / trade`, color: Number(expectancy) > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600', subtext: 'Statistical Edge per Trade' },
        { label: 'Simulation Size', value: '60 Trades', subtext: 'Sequential Executions' }
      ]}
      controls={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Strategy Win Rate:</span>
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
              <span>Reward to Risk Ratio:</span>
              <span className="font-mono text-emerald-600 font-bold">1:{rrRatio.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={3.5}
              step={0.25}
              value={rrRatio}
              onChange={e => setRrRatio(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Risk Per Trade (1R):</span>
              <span className="font-mono text-amber-500 font-bold">${riskPerTrade}</span>
            </div>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={riskPerTrade}
              onChange={e => setRiskPerTrade(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={simulationData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="trade" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="withEdge"
              name="System Trajectory (+EV Edge)"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="noEdgeFriction"
              name="Random 50/50 + Execution Friction (-EV)"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
