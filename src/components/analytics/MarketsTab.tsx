import React, { useState } from 'react';
import { Trade } from '@/types';
import { AnalyticsMetrics, calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface MarketsTabProps {
  trades: Trade[];
  onOpenEvidence: (
    claim: string, 
    methodology: string, 
    limitations: string, 
    filteredTrades: Trade[],
    statLabel: string,
    statValue: string
  ) => void;
}

export function MarketsTab({ trades, onOpenEvidence }: MarketsTabProps) {
  const [activeTab, setActiveTab] = useState<'market' | 'strategy'>('market');
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  if (closed.length < 5) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Insufficient Data for Segmentation</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Segmentation analysis requires a minimum of 5 closed trades.
        </p>
      </div>
    );
  }

  const groupBy = (key: keyof Trade) => {
    const map = new Map<string, Trade[]>();
    closed.forEach(t => {
      const val = t[key] ? String(t[key]) : 'Uncategorized';
      if (!map.has(val)) map.set(val, []);
      map.get(val)!.push(t);
    });
    return Array.from(map.entries()).map(([name, groupTrades]) => {
      return {
        name,
        trades: groupTrades,
        metrics: calculateInstitutionalMetrics(groupTrades)
      };
    }).sort((a,b) => b.trades.length - a.trades.length);
  };

  const data = groupBy(activeTab);

  return (
    <div className="space-y-6">
      
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button 
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'market' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          By Market
        </button>
        <button 
          onClick={() => setActiveTab('strategy')}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'strategy' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          By Strategy
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">{activeTab === 'market' ? 'Market' : 'Strategy'}</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Trades</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Win Rate</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Avg R</th>
              <th className="px-4 py-3 font-semibold text-slate-700">Net PnL</th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(row => (
              <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900">{row.name}</td>
                <td className="px-4 py-3 text-slate-600">{row.trades.length}</td>
                <td className="px-4 py-3 text-slate-600">{formatNumber(row.metrics.winRate, 1)}%</td>
                <td className="px-4 py-3 text-slate-600">{formatNumber(row.metrics.averageR, 2)}R</td>
                <td className="px-4 py-3 font-medium">
                  <span className={row.metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {formatCurrency(row.metrics.netPnl)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      onOpenEvidence(
                        `Performance observation for ${row.name}`,
                        `Filtered closed trades where ${activeTab === 'market' ? 'market' : 'strategy'} is exactly "${row.name}". Evaluated standard performance metrics across this subset.`,
                        `This analysis only includes explicitly categorized historical trades. Past performance is not indicative of future results. Small sample sizes significantly reduce statistical reliability.`,
                        row.trades,
                        "Net PnL",
                        formatCurrency(row.metrics.netPnl)
                      );
                    }}
                  >
                    View Evidence
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
