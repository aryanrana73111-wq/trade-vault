import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Scale, ShieldAlert } from 'lucide-react';

export function BehavioralAnalyticsTab({ trades }: { trades: Trade[] }) {
  const adherenceStats = useMemo(() => {
    const buckets = [
      { label: '100% (Perfect)', min: 100, max: 100 },
      { label: '80-99% (Good)', min: 80, max: 99 },
      { label: '60-79% (Poor)', min: 60, max: 79 },
      { label: '<60% (Failed)', min: 0, max: 59 }
    ];
    
    return buckets.map(b => {
      const bucketTrades = trades.filter(t => t.ruleAdherence !== undefined && t.ruleAdherence >= b.min && t.ruleAdherence <= b.max);
      return {
        label: b.label,
        metrics: calculateInstitutionalMetrics(bucketTrades)
      };
    });
  }, [trades]);

  const emotionStats = useMemo(() => {
    const emotions = new Set<string>();
    trades.forEach(t => {
      t.emotions?.forEach(e => emotions.add(e));
      t.duringEmotions?.forEach(e => emotions.add(e));
    });
    
    const stats = Array.from(emotions).map(emotion => {
      const emotionTrades = trades.filter(t => t.emotions?.includes(emotion) || t.duringEmotions?.includes(emotion));
      return {
        emotion,
        metrics: calculateInstitutionalMetrics(emotionTrades)
      };
    });
    
    return stats.sort((a, b) => b.metrics.totalTrades - a.metrics.totalTrades);
  }, [trades]);

  const emotionChartData = emotionStats.map(s => ({
    name: s.emotion,
    pnl: s.metrics.netPnl,
    winRate: s.metrics.winRate
  }));

  if (trades.length === 0) return <div>No data available</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Rule Adherence Section */}
      <div>
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-500" />
          Rule Adherence Impact
        </h3>
        <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Adherence Level</th>
                  <th className="px-4 py-3 text-right">Trades</th>
                  <th className="px-4 py-3 text-right">Win Rate</th>
                  <th className="px-4 py-3 text-right">Avg R</th>
                  <th className="px-4 py-3 text-right">Expectancy</th>
                  <th className="px-4 py-3 text-right">Net P&L</th>
                </tr>
              </thead>
              <tbody>
                {adherenceStats.map(({ label, metrics }) => (
                  <tr key={label} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{label}</td>
                    <td className="px-4 py-3 text-right">{metrics.totalTrades}</td>
                    <td className="px-4 py-3 text-right">{metrics.totalTrades > 0 ? `${formatNumber(metrics.winRate, 1)}%` : '-'}</td>
                    <td className="px-4 py-3 text-right">{metrics.totalTrades > 0 ? `${formatNumber(metrics.averageR, 2)}R` : '-'}</td>
                    <td className="px-4 py-3 text-right">{metrics.totalTrades > 0 ? formatCurrency(metrics.expectancy) : '-'}</td>
                    <td className={`px-4 py-3 text-right font-bold ${metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {metrics.totalTrades > 0 ? formatCurrency(metrics.netPnl) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Psychology Section */}
      <div>
        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-4 mt-8 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Psychology & Performance
        </h3>
        
        {emotionStats.length > 0 ? (
          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-80">
              <h4 className="text-sm font-semibold mb-4 text-slate-900 dark:text-slate-100">P&L by Emotion</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${val}`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                  <RechartsTooltip 
                    formatter={(val: number) => [formatCurrency(val), 'Net P&L']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {emotionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Emotion</th>
                      <th className="px-4 py-3 text-right">Trades</th>
                      <th className="px-4 py-3 text-right">Win Rate</th>
                      <th className="px-4 py-3 text-right">Avg R</th>
                      <th className="px-4 py-3 text-right">Expectancy</th>
                      <th className="px-4 py-3 text-right">Net P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emotionStats.map(({ emotion, metrics }) => (
                      <tr key={emotion} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{emotion}</td>
                        <td className="px-4 py-3 text-right">{metrics.totalTrades}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(metrics.winRate, 1)}%</td>
                        <td className="px-4 py-3 text-right">{formatNumber(metrics.averageR, 2)}R</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(metrics.expectancy)}</td>
                        <td className={`px-4 py-3 text-right font-bold ${metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {formatCurrency(metrics.netPnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
            No emotional tracking data available in the current selection.
          </div>
        )}
      </div>

    </div>
  );
}
