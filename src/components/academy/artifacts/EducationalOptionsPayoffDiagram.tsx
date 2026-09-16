import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalOptionsPayoffDiagram: React.FC = () => {
  const [strategy, setStrategy] = useState<'long-call' | 'long-put' | 'covered-call' | 'straddle'>('long-call');
  const [strikePrice, setStrikePrice] = useState<number>(100);
  const [premiumPaid, setPremiumPaid] = useState<number>(4.50);

  const payoffData = useMemo(() => {
    const points = [];
    const minPrice = strikePrice - 25;
    const maxPrice = strikePrice + 25;

    for (let s = minPrice; s <= maxPrice; s += 2) {
      let pnl = 0;

      if (strategy === 'long-call') {
        // Max(0, S - K) - Premium
        pnl = Math.max(0, s - strikePrice) - premiumPaid;
      } else if (strategy === 'long-put') {
        // Max(0, K - S) - Premium
        pnl = Math.max(0, strikePrice - s) - premiumPaid;
      } else if (strategy === 'covered-call') {
        // Long Stock (S - S0) + Short Call (Premium - Max(0, S - K))
        const stockPnl = s - strikePrice;
        const shortCallPnl = premiumPaid - Math.max(0, s - strikePrice);
        pnl = stockPnl + shortCallPnl;
      } else if (strategy === 'straddle') {
        // Long Call + Long Put: Max(0, S - K) + Max(0, K - S) - 2 * Premium
        pnl = Math.max(0, s - strikePrice) + Math.max(0, strikePrice - s) - (2 * premiumPaid);
      }

      points.push({
        price: s,
        pnl: Number(pnl.toFixed(2)),
        zeroLine: 0
      });
    }
    return points;
  }, [strategy, strikePrice, premiumPaid]);

  const breakevenCall = (strikePrice + premiumPaid).toFixed(2);
  const breakevenPut = (strikePrice - premiumPaid).toFixed(2);
  const maxLoss = strategy === 'long-call' || strategy === 'long-put' 
    ? `-$${premiumPaid.toFixed(2)}` 
    : strategy === 'straddle' 
    ? `-$${(2 * premiumPaid).toFixed(2)}` 
    : 'Unlimited downside';

  return (
    <EducationalChartCard
      title="Options Non-Linear Payoff & Expiration Profiles"
      subtitle="Visualizing asymmetric derivatives payoff functions, defined risk boundaries, and breakeven horizons"
      badge="Simulation"
      category="DERIVATIVES & QUANTITATIVE"
      units="Profit / Loss ($ per share) vs Underlying Stock Price"
      whatAmILookingAt="An options expiration payoff graph (hockey-stick diagram). The horizontal dotted line represents $0.00 breakeven. Notice how single-leg long options feature strictly capped, defined maximum downside (limited to the premium paid: -$4.50) with mathematically unlimited upside potential."
      whyItMatters="Unlike spot equities where risk is linear (1:1 with price), options provide convex, non-linear exposure. However, long options suffer from continuous Theta (time decay) attrition: if the underlying stock does not move past the breakeven strike before expiration, 100% of the premium evaporates."
      commonMistake="Buying out-of-the-money options because they look 'cheap', ignoring that their statistical probability of expiring worthless (>80%) creates severe negative drift on portfolio equity."
      metrics={[
        { label: 'Strike Price (K)', value: `$${strikePrice}.00`, color: 'text-blue-600 dark:text-blue-400', subtext: 'Contract Exercise Level' },
        { label: 'Contract Premium', value: `$${premiumPaid.toFixed(2)}`, color: 'text-amber-500', subtext: '$' + (premiumPaid * 100).toFixed(0) + ' per 100-share contract' },
        { label: 'Max Defined Loss', value: maxLoss, color: 'text-rose-600', subtext: 'Capped Downside Liability' },
        { label: 'Breakeven Price', value: strategy === 'long-call' ? `$${breakevenCall}` : strategy === 'long-put' ? `$${breakevenPut}` : `±$${(2 * premiumPaid).toFixed(2)}`, subtext: 'Zero P&L Threshold' }
      ]}
      controls={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Strategy:</span>
            {(['long-call', 'long-put', 'covered-call', 'straddle'] as const).map(strat => (
              <button
                key={strat}
                onClick={() => setStrategy(strat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  strategy === strat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {strat.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Strike Price ($):</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">${strikePrice}</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                step={5}
                value={strikePrice}
                onChange={e => setStrikePrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                <span>Option Premium ($):</span>
                <span className="font-mono text-amber-500 font-bold">${premiumPaid.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={1.00}
                max={10.00}
                step={0.50}
                value={premiumPaid}
                onChange={e => setPremiumPaid(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={payoffData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis dataKey="price" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${v}`} label={{ value: 'Underlying Stock Price at Expiration', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
              formatter={(val: any) => [`${Number(val) > 0 ? '+' : ''}$${val} / share`, 'P&L']}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" />
            <ReferenceLine x={strikePrice} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: `Strike $${strikePrice}`, fill: '#3b82f6', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="pnl"
              name="Net P&L Profile"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </EducationalChartCard>
  );
};
