import React from 'react';
import { Trade } from '@/types';
import { AnalyticsMetrics } from '@/lib/analyticsEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DistributionsTabProps {
  trades: Trade[];
  metrics: AnalyticsMetrics;
}

export function DistributionsTab({ trades, metrics }: DistributionsTabProps) {
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  if (closed.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Insufficient Data for Distributions</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Distribution analysis requires a minimum of 5 closed trades. You currently have {closed.length}.
        </p>
      </div>
    );
  }

  // Calculate R-Multiple Distribution (Bins)
  const rMultiples = closed.map(t => {
    if (t.rMultiple !== undefined && isFinite(t.rMultiple)) return t.rMultiple;
    if (t.pnl !== undefined && t.risk) return t.pnl / t.risk;
    return 0;
  });

  const bins = [-3, -2, -1, 0, 1, 2, 3, 4, 5, 10]; // Upper bounds
  const rDistribution = bins.map((bound, i) => {
    const lower = i === 0 ? -Infinity : bins[i - 1];
    const label = i === 0 ? `< ${bound}R` : i === bins.length - 1 ? `> ${lower}R` : `${lower}R to ${bound}R`;
    const count = rMultiples.filter(r => r > lower && r <= bound).length;
    return { name: label, count };
  }).filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4">R-Multiple Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} tickLine={false} axisLine={false} angle={-45} textAnchor="end" />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
