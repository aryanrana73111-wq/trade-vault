import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

export function StrategyResearchTab({ trades }: { trades: Trade[] }) {
  const strategyStats = useMemo(() => {
    const strats = new Set(trades.map(t => t.strategy).filter(Boolean) as string[]);
    const stats = Array.from(strats).map(strat => {
      const stratTrades = trades.filter(t => t.strategy === strat);
      const metrics = calculateInstitutionalMetrics(stratTrades);
      return { strategy: strat, metrics };
    });
    return stats.sort((a, b) => (b.metrics.netPnl || 0) - (a.metrics.netPnl || 0));
  }, [trades]);

  const marketHeatmap = useMemo(() => {
    const markets = Array.from(new Set(trades.map(t => t.market).filter(Boolean)));
    const strats = strategyStats.map(s => s.strategy);
    
    const map = new Map<string, any>();
    let bestCell = { strat: '', market: '', value: -Infinity, label: '' };
    let worstCell = { strat: '', market: '', value: Infinity, label: '' };

    strats.forEach(strat => {
      markets.forEach(market => {
        const cellTrades = trades.filter(t => t.strategy === strat && t.market === market);
        const metrics = calculateInstitutionalMetrics(cellTrades);
        const key = `${strat}-${market}`;
        
        if (metrics.closedTradesCount >= 3) {
          if (metrics.expectancy > bestCell.value) bestCell = { strat, market, value: metrics.expectancy, label: 'Highest Expectancy' };
          if (metrics.expectancy < worstCell.value) worstCell = { strat, market, value: metrics.expectancy, label: 'Lowest Expectancy' };
        }
        
        map.set(key, { count: metrics.closedTradesCount, pnl: metrics.netPnl, expectancy: metrics.expectancy, winRate: metrics.winRate });
      });
    });
    
    return { markets, strats, map, bestCell, worstCell };
  }, [trades, strategyStats]);

  const sessionHeatmap = useMemo(() => {
    const sessions = Array.from(new Set(trades.map(t => t.session).filter(Boolean)));
    const strats = strategyStats.map(s => s.strategy);
    
    let bestCell = { strat: '', session: '', value: -Infinity, label: '' };
    let worstCell = { strat: '', session: '', value: Infinity, label: '' };

    strats.forEach(strat => {
      sessions.forEach(session => {
        const cellTrades = trades.filter(t => t.strategy === strat && t.session === session);
        const metrics = calculateInstitutionalMetrics(cellTrades);
        
        if (metrics.closedTradesCount >= 3) {
          if (metrics.expectancy > bestCell.value) bestCell = { strat, session, value: metrics.expectancy, label: 'Highest Expectancy' };
          if (metrics.expectancy < worstCell.value) worstCell = { strat, session, value: metrics.expectancy, label: 'Lowest Expectancy' };
        }
      });
    });
    
    return { bestCell, worstCell };
  }, [trades, strategyStats]);

  const pnlChartData = strategyStats.map(s => ({
    name: s.strategy,
    pnl: s.metrics.netPnl
  }));

  if (trades.length === 0) return <div>No data available</div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Summary Box */}
      <Card className="p-5 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-100 dark:border-indigo-800/50">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" />
          Strategy Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white/40 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-xs uppercase tracking-wider">Strongest Historical Combination</span>
            {marketHeatmap.bestCell.strat ? (
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{marketHeatmap.bestCell.strat}</span> 
                <span className="text-slate-500"> on </span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{marketHeatmap.bestCell.market}</span>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 text-xs">
                  {formatCurrency(marketHeatmap.bestCell.value)} Avg Expectancy
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Insufficient data</span>
            )}
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white/40 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-xs uppercase tracking-wider">Weakest Historical Combination</span>
            {marketHeatmap.worstCell.strat ? (
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{marketHeatmap.worstCell.strat}</span> 
                <span className="text-slate-500"> on </span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{marketHeatmap.worstCell.market}</span>
                <div className="text-rose-600 dark:text-rose-400 font-semibold mt-0.5 text-xs">
                  {formatCurrency(marketHeatmap.worstCell.value)} Avg Expectancy
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Insufficient data</span>
            )}
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white/40 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-xs uppercase tracking-wider">Strongest Session Pairing</span>
            {sessionHeatmap.bestCell.strat ? (
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.bestCell.strat}</span> 
                <span className="text-slate-500"> on </span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.bestCell.session}</span>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 text-xs">
                  {formatCurrency(sessionHeatmap.bestCell.value)} Avg Expectancy
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Insufficient data</span>
            )}
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white/40 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-xs uppercase tracking-wider">Weakest Session Pairing</span>
            {sessionHeatmap.worstCell.strat ? (
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.worstCell.strat}</span> 
                <span className="text-slate-500"> on </span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.worstCell.session}</span>
                <div className="text-rose-600 dark:text-rose-400 font-semibold mt-0.5 text-xs">
                  {formatCurrency(sessionHeatmap.worstCell.value)} Avg Expectancy
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Insufficient data</span>
            )}
          </div>
        </div>
      </Card>

      {/* Comparison Chart */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-80">
        <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-slate-100">Strategy P&L Comparison</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pnlChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis 
              tickFormatter={(val) => `$${val}`} 
              tick={{ fontSize: 12 }} 
              axisLine={false} 
              tickLine={false}
              width={60}
            />
            <RechartsTooltip 
              formatter={(val: number) => [formatCurrency(val), 'Net P&L']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
              {pnlChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Strategy Table */}
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3 text-right">Trades</th>
                <th className="px-4 py-3 text-right">Win Rate</th>
                <th className="px-4 py-3 text-right">Avg R</th>
                <th className="px-4 py-3 text-right">Expectancy</th>
                <th className="px-4 py-3 text-right">Profit Factor</th>
                <th className="px-4 py-3 text-right">Max DD</th>
                <th className="px-4 py-3 text-right">Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {strategyStats.map(({ strategy, metrics }) => (
                <tr key={strategy} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{strategy}</td>
                  <td className="px-4 py-3 text-right">{metrics.totalTrades}</td>
                  <td className="px-4 py-3 text-right">{formatNumber(metrics.winRate, 1)}%</td>
                  <td className="px-4 py-3 text-right">{formatNumber(metrics.averageR, 2)}R</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(metrics.expectancy)}</td>
                  <td className="px-4 py-3 text-right">{metrics.profitFactor === 'MAX' ? 'MAX' : formatNumber(metrics.profitFactor as number, 2)}</td>
                  <td className="px-4 py-3 text-right text-rose-500">{formatCurrency(metrics.maxDrawdown)}</td>
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
  );
}
