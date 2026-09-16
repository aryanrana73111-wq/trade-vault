import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingDown, TrendingUp, RotateCcw } from 'lucide-react';

export const EquityDrawdownVisualizer: React.FC = () => {
  const [scenario, setScenario] = useState<'moderate' | 'deep' | 'steady'>('deep');

  const generateData = () => {
    if (scenario === 'steady') {
      return [
        { trade: 0, equity: 10000, drawdown: 0 },
        { trade: 5, equity: 10600, drawdown: -1.2 },
        { trade: 10, equity: 11200, drawdown: 0 },
        { trade: 15, equity: 10900, drawdown: -2.7 },
        { trade: 20, equity: 11800, drawdown: 0 },
        { trade: 25, equity: 12400, drawdown: -1.5 },
        { trade: 30, equity: 13100, drawdown: 0 },
        { trade: 35, equity: 13900, drawdown: -0.8 },
        { trade: 40, equity: 14800, drawdown: 0 },
      ];
    }
    if (scenario === 'moderate') {
      return [
        { trade: 0, equity: 10000, drawdown: 0 },
        { trade: 5, equity: 11200, drawdown: 0 },
        { trade: 10, equity: 10400, drawdown: -7.1 },
        { trade: 15, equity: 9800, drawdown: -12.5 },
        { trade: 20, equity: 10800, drawdown: -3.5 },
        { trade: 25, equity: 11600, drawdown: 0 },
        { trade: 30, equity: 12400, drawdown: 0 },
        { trade: 35, equity: 11500, drawdown: -7.2 },
        { trade: 40, equity: 13200, drawdown: 0 },
      ];
    }
    // Deep drawdown scenario (50% drop)
    return [
      { trade: 0, equity: 10000, drawdown: 0 },
      { trade: 5, equity: 12500, drawdown: 0 },
      { trade: 10, equity: 10500, drawdown: -16.0 },
      { trade: 15, equity: 8200, drawdown: -34.4 },
      { trade: 20, equity: 6250, drawdown: -50.0 }, // 50% drawdown
      { trade: 25, equity: 7500, drawdown: -40.0 },
      { trade: 30, equity: 9000, drawdown: -28.0 },
      { trade: 35, equity: 10500, drawdown: -16.0 },
      { trade: 40, equity: 12500, drawdown: 0 }, // Recovered
    ];
  };

  const data = generateData();
  const maxDd = Math.min(...data.map(d => d.drawdown));
  const reqGain = Math.abs(maxDd) > 0 ? ((Math.abs(maxDd) / (100 - Math.abs(maxDd))) * 100).toFixed(1) : '0';

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Equity Curve & Drawdown Decomposition
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visualizing the mathematical reality of peak-to-trough drawdowns
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setScenario('steady')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              scenario === 'steady'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Controlled (2% DD)
          </button>
          <button
            onClick={() => setScenario('moderate')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              scenario === 'moderate'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Moderate (12% DD)
          </button>
          <button
            onClick={() => setScenario('deep')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              scenario === 'deep'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Severe Shock (50% DD)
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Peak-to-Trough Drawdown</span>
          <p className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">{maxDd.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Required Recovery Return</span>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">+{reqGain}%</p>
        </div>
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Terminal Equity</span>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            ${data[data.length - 1].equity.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Chart 1: Equity Curve */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-3">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Portfolio Capital Equity ($)</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="trade" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip 
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Equity']}
                labelFormatter={(l) => `Trade #${l}`}
              />
              <Line type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Underwater Drawdown Curve */}
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Underwater Drawdown (%)</p>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="trade" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[-60, 0]} />
              <Tooltip 
                formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Drawdown']}
                labelFormatter={(l) => `Trade #${l}`}
              />
              <Area type="monotone" dataKey="drawdown" stroke="#dc2626" fill="#ef4444" fillOpacity={0.25} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
