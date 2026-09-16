import React, { useState } from 'react';
import { Trade } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { TradeDetailModal } from '@/components/journal/TradeDetailModal';
import { Card } from '@/components/ui/Input';

export function TradeAnalysisTab({ trades }: { trades: Trade[] }) {
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<keyof Trade>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Trade) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for new field
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    
    // Handle specific fields
    if (sortField === 'pnl') {
      valA = a.pnl || 0;
      valB = b.pnl || 0;
    } else if (sortField === 'rMultiple') {
      valA = a.rMultiple || 0;
      valB = b.rMultiple || 0;
    }

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    if (valA < valB) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-4 animate-in fade-in">
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('date')}>Date/Time</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('market')}>Market</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('direction')}>Dir</th>
                <th className="px-4 py-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('strategy')}>Strategy</th>
                <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('rMultiple')}>R Mult</th>
                <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleSort('pnl')}>Net P&L</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrades.map(trade => (
                <tr 
                  key={trade.id} 
                  onClick={() => setSelectedTrade(trade)}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {format(new Date(trade.date), 'MMM d, yyyy')}
                    </div>
                    {trade.time && <div className="text-xs text-slate-500">{trade.time}</div>}
                  </td>
                  <td className="px-4 py-3 font-medium">{trade.market}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      trade.direction === 'BUY' 
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-4 py-3 truncate max-w-[150px]">{trade.strategy || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {trade.rMultiple !== undefined ? (
                      <span className={`font-semibold ${
                        trade.rMultiple > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                        trade.rMultiple < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                      }`}>
                        {trade.rMultiple > 0 ? '+' : ''}{formatNumber(trade.rMultiple, 2)}R
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span className={
                      trade.pnl && trade.pnl > 0 ? 'text-emerald-600 dark:text-emerald-400' : 
                      trade.pnl && trade.pnl < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'
                    }>
                      {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedTrades.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No trades match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedTrade && (
        <TradeDetailModal 
          trade={selectedTrade}
          isOpen={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onEditFullTrade={() => {}}
        />
      )}
    </div>
  );
}
