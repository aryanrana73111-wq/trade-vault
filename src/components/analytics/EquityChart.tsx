import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Trade } from '@/types';
import { TrendingDown } from 'lucide-react';

interface EquityChartProps {
  trades: Trade[];
}

export function EquityChart({ trades }: EquityChartProps) {
  const [mode, setMode] = useState<'equity' | 'drawdown'>('equity');
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN').sort((a,b) => a.date - b.date);
  
  let currentEquity = 0;
  let peak = 0;
  let maxDrawdown = 0;

  const data = closed.map((t, i) => {
    currentEquity += (t.pnl || 0);
    if (currentEquity > peak) {
      peak = currentEquity;
    }
    const drawdown = currentEquity - peak;
    const absDrawdown = Math.abs(drawdown);
    if (absDrawdown > maxDrawdown) {
      maxDrawdown = absDrawdown;
    }
    return {
      name: `Trade ${i+1}`,
      date: new Date(t.date).toLocaleDateString(),
      equity: currentEquity,
      drawdown: drawdown,
      absDrawdown: absDrawdown,
      pnl: t.pnl || 0,
      market: t.market
    };
  });

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] border border-dashed border-slate-200 rounded-xl bg-slate-50">
        <p className="text-slate-500 text-sm font-medium">Insufficient data for Equity Curve</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('equity')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              mode === 'equity'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Equity Curve
          </button>
          <button
            type="button"
            onClick={() => setMode('drawdown')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              mode === 'drawdown'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Drawdown (Underwater)
          </button>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span>Max Drawdown:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">
            {maxDrawdown > 0 ? `-${formatCurrency(maxDrawdown)}` : '$0.00'}
          </span>
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.25}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{fontSize: 12, fill: '#64748b'}}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              tick={{fontSize: 12, fill: '#64748b'}}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
                      <p className="text-xs text-slate-500 mb-2">{item.date}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Equity:</span>
                          <span className="font-semibold text-blue-600">{formatCurrency(item.equity)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Drawdown:</span>
                          <span className={`font-semibold ${item.drawdown < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
                            {item.drawdown < 0 ? `-${formatCurrency(item.absDrawdown)}` : '$0.00'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Trade PnL:</span>
                          <span className={`font-semibold ${item.pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)}
                          </span>
                        </div>
                        {item.market && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Market:</span>
                            <span className="font-medium text-slate-900 dark:text-slate-200">{item.market}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {mode === 'equity' ? (
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorEquity)" 
              />
            ) : (
              <Area 
                type="monotone" 
                dataKey="drawdown" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorDrawdown)" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
