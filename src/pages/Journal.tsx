import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Trade, Strategy } from '@/types';
import { Card, Input, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Search, Filter, ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

export default function Journal() {
  const [searchParams] = useSearchParams();
  const initialStrategy = searchParams.get('strategy') || '';
  
  const { trades: rawTrades, strategies, updateTrade } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialStrategy);
  const [filterDirection, setFilterDirection] = useState<string>('ALL');

  useEffect(() => {
    const seen = new Set<string>();
    const unique = rawTrades.filter(t => {
      if (!t?.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    setTrades(unique.sort((a, b) => b.date - a.date));
  }, [rawTrades]);

  const filteredTrades = trades.filter(t => {
    const strategyObj = strategies.find(s => s.id === t.strategy);
    const strategyName = strategyObj ? strategyObj.name : t.strategy;
    
    const matchesSearch = (t.market || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (strategyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = filterDirection === 'ALL' || t.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  const handleUpdateResult = (id: string, result: 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING') => {
    const trade = trades.find(t => t.id === id);
    if (trade) {
      let pnl = 0;
      if (result === 'WIN') {
        const risk = trade.risk || 0;
        const rr = trade.rrRatio || 0;
        pnl = risk * rr;
      } else if (result === 'LOSS') {
        pnl = -(trade.risk || 0);
      } else if (result === 'PENDING') {
        pnl = 0;
      }
      updateTrade(id, { result, pnl: result === 'PENDING' ? undefined : pnl });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Trade Journal</h1>
          <p className="text-slate-500 mt-1">Review and manage your trading history.</p>
        </div>
      </div>

      <Card className="p-4 flex flex-col sm:flex-row gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search market or strategy..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
          >
            <option value="ALL">All Directions</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredTrades.map(trade => (
          <TradeCard key={trade.id} trade={trade} strategies={strategies} onUpdateResult={handleUpdateResult} />
        ))}
        {filteredTrades.length === 0 && (
          <div className="text-center py-12 text-slate-500 border border-dashed rounded-xl border-slate-300">
            No trades found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}

const TradeCard: React.FC<{ trade: Trade, strategies: Strategy[], onUpdateResult: (id: string, r: any) => void }> = ({ trade, strategies, onUpdateResult }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const strategyObj = strategies.find(s => s.id === trade.strategy || s.name === trade.strategy);
  const strategyDisplayName = strategyObj ? strategyObj.name : trade.strategy;

  const handleStrategyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (strategyObj) {
      navigate(`/strategies/${strategyObj.id}`);
    }
  };

  return (
    <Card className="shadow-sm overflow-hidden transition-all hover:shadow-md border-slate-200">
      <div 
        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer bg-white"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className={cn(
            "w-1.5 h-12 rounded-full",
            trade.direction === 'BUY' ? "bg-green-500" : "bg-red-500"
          )} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900">{trade.market}</span>
              <Badge variant={trade.direction === 'BUY' ? 'success' : 'danger'}>{trade.direction}</Badge>
            </div>
            <div className="text-sm text-slate-500">{format(new Date(trade.date), 'MMM dd, yyyy')} {trade.time ? `• ${trade.time}` : ''}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 flex-1 w-full md:w-auto">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Entry</div>
            <div className="font-medium text-slate-900">{trade.entry || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Stop Loss</div>
            <div className="font-medium text-slate-900">{trade.stopLoss || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Take Profit</div>
            <div className="font-medium text-slate-900">{trade.takeProfit || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">R:R</div>
            <div className="font-medium text-slate-900">{trade.rrRatio ? `1 : ${trade.rrRatio}` : '-'}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 justify-between w-full md:w-auto mt-4 md:mt-0">
          <div className="text-right min-w-[100px]">
            {trade.result === 'PENDING' ? (
              <div className="text-sm font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 inline-block">PENDING</div>
            ) : trade.pnl !== undefined ? (
               <div className={cn("font-bold text-lg", trade.pnl > 0 ? "text-green-600" : (trade.pnl < 0 ? "text-red-600" : "text-slate-500"))}>
                 {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
               </div>
            ) : (
              <div className="text-sm text-slate-400">Result Pending</div>
            )}
          </div>
          <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform", expanded && "rotate-180")} />
        </div>
      </div>

      {expanded && (
        <div className="p-5 border-t border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk Amount</h4>
                <div className="font-medium text-slate-900">{trade.risk ? formatCurrency(trade.risk) : '-'}</div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Position Size</h4>
                <div className="font-medium text-slate-900">{trade.positionSize || '-'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Context</h4>
              <div className="text-sm text-slate-600 flex flex-wrap gap-2 mb-2">
                {trade.session && <Badge variant="neutral">{trade.session}</Badge>}
                {trade.timeframe && <Badge variant="neutral">{trade.timeframe}</Badge>}
                {trade.marketCondition && <Badge variant="neutral">{trade.marketCondition}</Badge>}
              </div>
              <div className="text-sm text-slate-600 mt-2">
                {strategyDisplayName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Strategy:</span>
                    {strategyObj ? (
                      <button 
                        onClick={handleStrategyClick}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                      >
                        {strategyDisplayName} <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="font-medium text-slate-700">{strategyDisplayName}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500">No strategy specified.</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Emotions</h4>
              <div className="flex flex-wrap gap-1.5">
                {trade.emotions?.length ? trade.emotions.map(e => (
                  <Badge key={e} variant="neutral" className="bg-white">{e}</Badge>
                )) : <span className="text-sm text-slate-500">None recorded</span>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">General Notes</h4>
              <div className="text-sm text-slate-600">{trade.notes || "No notes provided."}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-1 flex items-center gap-1">
                <X className="w-4 h-4" /> Mistakes
              </h4>
              <div className="text-sm text-slate-600 bg-red-50/50 p-3 rounded-lg border border-red-100">{trade.mistake || "No mistakes recorded."}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-700 mb-1 flex items-center gap-1">
                <Check className="w-4 h-4" /> Learnings
              </h4>
              <div className="text-sm text-slate-600 bg-green-50/50 p-3 rounded-lg border border-green-100">{trade.learning || "No learnings recorded."}</div>
            </div>
            
            {(!trade.result || trade.result === 'PENDING') && (
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Mark Result</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onUpdateResult(trade.id, 'WIN'); }}>WIN</Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onUpdateResult(trade.id, 'LOSS'); }}>LOSS</Button>
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onUpdateResult(trade.id, 'BREAK EVEN'); }}>BE</Button>
                </div>
              </div>
            )}
          </div>

          {trade.screenshot && (
            <div className="md:col-span-2 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Chart Screenshot</h4>
              <img src={trade.screenshot} alt="Trade chart screenshot" className="w-full max-w-4xl rounded-lg border border-slate-200 shadow-sm object-contain bg-white" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
