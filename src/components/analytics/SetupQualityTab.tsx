import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { formatCurrency, formatNumber, cn } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Target, Activity, BarChart2, Search } from 'lucide-react';

export function SetupQualityTab({ trades, onOpenEvidence }: { trades: Trade[], onOpenEvidence?: any }) {
  const qualityStats = useMemo(() => {
    const qualities = ['A+', 'B', 'C', 'Not Rated'];
    
    return qualities.map(q => {
      const bucketTrades = trades.filter(t => 
        q === 'Not Rated' ? !t.setupQuality : t.setupQuality === q
      );
      return {
        quality: q,
        metrics: calculateInstitutionalMetrics(bucketTrades),
        count: bucketTrades.length
      };
    }).filter(s => s.count > 0);
  }, [trades]);

  const crossTabs = useMemo(() => {
    const getStats = (extractKey: (t: Trade) => string | undefined) => {
      const keys = Array.from(new Set(trades.map(t => extractKey(t)).filter(Boolean))) as string[];
      return keys.map(key => {
        const keyTrades = trades.filter(t => extractKey(t) === key);
        const aPlus = keyTrades.filter(t => t.setupQuality === 'A+').length;
        const b = keyTrades.filter(t => t.setupQuality === 'B').length;
        const c = keyTrades.filter(t => t.setupQuality === 'C').length;
        const notRated = keyTrades.filter(t => !t.setupQuality).length;
        return {
          name: key,
          'A+': aPlus,
          'B': b,
          'C': c,
          'Not Rated': notRated,
          total: keyTrades.length
        };
      }).sort((a, b) => b.total - a.total);
    };

    return {
      strategy: getStats(t => t.strategy),
      market: getStats(t => t.market),
      session: getStats(t => t.session),
      adherence: getStats(t => {
        if (t.ruleAdherence === undefined) return 'Unknown';
        if (t.ruleAdherence === 100) return '100% Perfect';
        if (t.ruleAdherence >= 80) return '80-99% Good';
        if (t.ruleAdherence >= 60) return '60-79% Poor';
        return '<60% Failed';
      })
    };
  }, [trades]);

  const totalRated = trades.filter(t => t.setupQuality).length;
  const aPlusMix = totalRated ? trades.filter(t => t.setupQuality === 'A+').length / totalRated : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Selectivity (A+ Mix)</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatNumber(aPlusMix * 100)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Of rated setups were A+</p>
        </Card>
        
        <Card className="p-4 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Total Rated</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {totalRated} <span className="text-sm font-normal text-slate-500">/ {trades.length}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Trades with setup quality graded</p>
        </Card>
      </div>

      <Card className="p-5 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-blue-500" />
          Setup Quality Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold rounded-tl-lg">Quality</th>
                <th className="px-4 py-3 font-semibold text-right">Trades</th>
                <th className="px-4 py-3 font-semibold text-right">Win Rate</th>
                <th className="px-4 py-3 font-semibold text-right">Net P&L</th>
                <th className="px-4 py-3 font-semibold text-right">Avg R</th>
                <th className="px-4 py-3 font-semibold text-right">Profit Factor</th>
                <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Expectancy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {qualityStats.map((stat) => (
                <tr key={stat.quality} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        stat.quality === 'A+' ? 'text-emerald-500' :
                        stat.quality === 'B' ? 'text-amber-500' :
                        stat.quality === 'C' ? 'text-rose-500' : 'text-slate-500'
                      )}>
                        {stat.quality}
                      </span>
                      {stat.quality === 'A+' && onOpenEvidence && stat.count > 0 && (
                        <button
                          onClick={() => onOpenEvidence('A+ Setups', 'Analyzed all trades graded as A+ setup quality by the trader.', 'Quality grading is subjective. This reflects adherence to the trader\'s perceived ideal setup criteria, not objective market probability.', trades.filter(t => t.setupQuality === 'A+'), 'A+ Trades', stat.count.toString())}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors text-[10px] uppercase tracking-wider font-bold"
                          title="View Evidence for A+ Trades"
                        >
                          <Search className="w-3 h-3" />
                          View Evidence
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{stat.count}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(stat.metrics.winRate)}%</td>
                  <td className={cn("px-4 py-3 text-right font-medium", stat.metrics.netPnl > 0 ? 'text-emerald-600' : stat.metrics.netPnl < 0 ? 'text-rose-600' : '')}>
                    {formatCurrency(stat.metrics.netPnl)}
                  </td>
                  <td className="px-4 py-3 text-right">{formatNumber(stat.metrics.averageR)}R</td>
                  <td className="px-4 py-3 text-right">{typeof stat.metrics.profitFactor === 'number' ? formatNumber(stat.metrics.profitFactor) : stat.metrics.profitFactor}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(stat.metrics.expectancy)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm">Strategy x Quality Mix</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossTabs.strategy} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="A+" stackId="a" fill="#10b981" />
                <Bar dataKey="B" stackId="a" fill="#f59e0b" />
                <Bar dataKey="C" stackId="a" fill="#f43f5e" />
                <Bar dataKey="Not Rated" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 text-sm">Rule Adherence x Quality Mix</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossTabs.adherence} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="A+" stackId="a" fill="#10b981" />
                <Bar dataKey="B" stackId="a" fill="#f59e0b" />
                <Bar dataKey="C" stackId="a" fill="#f43f5e" />
                <Bar dataKey="Not Rated" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
