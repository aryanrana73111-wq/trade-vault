import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ArrowUpDown, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  MinusCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { Trade } from '@/types';
import { Button } from '@/components/ui/Button';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  trades: Trade[];
  highlightFields?: (keyof Trade | string)[];
  onSelectTrade?: (trade: Trade) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  trades,
  highlightFields = [],
  onSelectTrade
}) => {
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState<'ALL' | 'WIN' | 'LOSS' | 'BREAK EVEN'>('ALL');
  const [sortField, setSortField] = useState<'date' | 'rMultiple' | 'risk'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  if (!isOpen) return null;

  const isHighlighted = (field: string) => {
    return highlightFields.includes(field) || highlightFields.includes(field.toLowerCase());
  };

  const filteredTrades = trades
    .filter(t => {
      if (filterResult !== 'ALL' && t.result !== filterResult) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.market?.toLowerCase().includes(q) ||
        t.strategy?.toLowerCase().includes(q) ||
        t.session?.toLowerCase().includes(q) ||
        t.id?.toLowerCase().includes(q) ||
        (Array.isArray(t.emotions) && t.emotions.some(e => typeof e === 'string' && e.toLowerCase().includes(q))) ||
        (typeof t.emotions === 'string' && (t.emotions as string).toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortField === 'date') {
        valA = a.date || 0;
        valB = b.date || 0;
      } else if (sortField === 'rMultiple') {
        valA = a.rMultiple || 0;
        valB = b.rMultiple || 0;
      } else if (sortField === 'risk') {
        valA = a.risk || 0;
        valB = b.risk || 0;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      {/* Drawer Panel */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Underlying Evidence
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {trades.length} exact recorded trade{trades.length === 1 ? '' : 's'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by market, strategy, session, emotion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1 text-xs">
            {(['ALL', 'WIN', 'LOSS', 'BREAK EVEN'] as const).map(res => (
              <button
                key={res}
                onClick={() => setFilterResult(res)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterResult === res
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (sortField === 'date') setSortField('rMultiple');
              else if (sortField === 'rMultiple') setSortField('risk');
              else setSortField('date');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sort: <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{sortField}</span>
          </button>
        </div>

        {/* Highlight Banner */}
        {highlightFields.length > 0 && (
          <div className="px-6 py-2 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>
              Highlighted columns contributed directly to this AI observation: {' '}
              <strong>{highlightFields.join(', ')}</strong>
            </span>
          </div>
        )}

        {/* Trade Records Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredTrades.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Info className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching trades found</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or result filters.</p>
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Market</th>
                    <th className="py-2.5 px-3">Dir</th>
                    <th className={`py-2.5 px-3 ${isHighlighted('session') ? 'bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-bold' : ''}`}>
                      Session
                    </th>
                    <th className={`py-2.5 px-3 ${isHighlighted('strategy') ? 'bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-bold' : ''}`}>
                      Strategy
                    </th>
                    <th className={`py-2.5 px-3 text-right ${isHighlighted('risk') || isHighlighted('riskPercent') ? 'bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-bold' : ''}`}>
                      Risk ($/%)
                    </th>
                    <th className="py-2.5 px-3 text-center">Result</th>
                    <th className={`py-2.5 px-3 text-right ${isHighlighted('rMultiple') ? 'bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-bold' : ''}`}>
                      R
                    </th>
                    <th className={`py-2.5 px-3 ${isHighlighted('emotions') ? 'bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-bold' : ''}`}>
                      Emotion
                    </th>
                    <th className={`py-2.5 px-3 text-center ${isHighlighted('ruleAdherence') ? 'bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-bold' : ''}`}>
                      Rules
                    </th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTrades.map(trade => {
                    const isWin = trade.result === 'WIN';
                    const isLoss = trade.result === 'LOSS';
                    const isBE = trade.result === 'BREAK EVEN';
                    const dateStr = new Date(trade.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit'
                    });

                    return (
                      <tr 
                        key={trade.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {dateStr}
                          {trade.time && <span className="text-[10px] text-slate-400 ml-1">({trade.time})</span>}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {trade.market}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            trade.direction === 'BUY' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}>
                            {trade.direction}
                          </span>
                        </td>
                        <td className={`py-2.5 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300 ${isHighlighted('session') ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''}`}>
                          {trade.session || '—'}
                        </td>
                        <td className={`py-2.5 px-3 max-w-[120px] truncate text-slate-600 dark:text-slate-300 ${isHighlighted('strategy') ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''}`}>
                          {trade.strategy || '—'}
                        </td>
                        <td className={`py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 whitespace-nowrap ${isHighlighted('risk') || isHighlighted('riskPercent') ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold text-amber-700 dark:text-amber-300' : ''}`}>
                          ${trade.risk || 0}
                          {trade.riskPercent ? ` (${trade.riskPercent}%)` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {isWin && (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> WIN
                            </span>
                          )}
                          {isLoss && (
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                              <XCircle className="w-3 h-3" /> LOSS
                            </span>
                          )}
                          {isBE && (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                              <MinusCircle className="w-3 h-3" /> BE
                            </span>
                          )}
                          {!isWin && !isLoss && !isBE && (
                            <span className="text-slate-400 font-normal">{trade.result || 'OPEN'}</span>
                          )}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-mono font-bold ${isHighlighted('rMultiple') ? 'bg-amber-50 dark:bg-amber-950/20' : ''} ${
                          (trade.rMultiple || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : (trade.rMultiple || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                        }`}>
                          {trade.rMultiple !== undefined ? `${trade.rMultiple > 0 ? '+' : ''}${trade.rMultiple.toFixed(2)}R` : '—'}
                        </td>
                        <td className={`py-2.5 px-3 ${isHighlighted('emotions') ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''}`}>
                          <div className="flex flex-wrap gap-1">
                            {trade.emotions && trade.emotions.length > 0 ? (
                              trade.emotions.map(e => (
                                <span 
                                  key={e} 
                                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                                    e === 'FOMO' || e === 'Revenge' 
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}
                                >
                                  {e}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </div>
                        </td>
                        <td className={`py-2.5 px-3 text-center ${isHighlighted('ruleAdherence') ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''}`}>
                          {trade.ruleAdherence !== undefined ? (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              trade.ruleAdherence >= 80 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : trade.ruleAdherence >= 50
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                            }`}>
                              {trade.ruleAdherence}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => setSelectedTrade(trade)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="Inspect Trade Details"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Trade Detail Sub-Modal */}
        {selectedTrade && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Trade #{selectedTrade.id.slice(0, 8)}: {selectedTrade.market} ({selectedTrade.direction})</span>
              </h4>
              <button 
                onClick={() => setSelectedTrade(null)} 
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Close Inspector
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Entry / SL / TP</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTrade.entry} / {selectedTrade.stopLoss} / {selectedTrade.takeProfit}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">P&L & Realized R</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  ${selectedTrade.pnl || 0} ({selectedTrade.rMultiple !== undefined ? `${selectedTrade.rMultiple}R` : 'N/A'})
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Strategy & Session</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTrade.strategy || 'None'} / {selectedTrade.session || 'None'}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block mb-0.5">Emotions Logged</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedTrade.emotions?.join(', ') || 'None'}
                </span>
              </div>
            </div>
            {selectedTrade.notes && (
              <div className="mt-2 text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 font-semibold block mb-0.5">Trader Notes:</span>
                {selectedTrade.notes}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>All analysis reflects real recorded records from your active dashboard.</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Drawer
          </Button>
        </div>
      </div>
    </div>
  );
};
