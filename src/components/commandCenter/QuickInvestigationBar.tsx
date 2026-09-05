import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  X, 
  ArrowRight, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  BookOpenCheck, 
  Brain,
  FileText
} from 'lucide-react';
import { Trade, Strategy, TradingRule, LearningEntry } from '@/types';
import { InvestigationResult } from '@/types/commandCenter';
import { searchAndInvestigate } from '@/lib/commandCenter/engine';
import { UserSettings } from '@/lib/settings';
import { formatCurrency } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface QuickInvestigationBarProps {
  trades: Trade[];
  strategies: Strategy[];
  rules: TradingRule[];
  learnings: LearningEntry[];
  settings?: UserSettings;
  onOpenTradeDrawer: (trades: Trade[], title: string) => void;
}

const SUGGESTIONS = [
  'Show my last 10 XAU/USD London trades',
  'Show FOMO trades',
  'Show trades where risk exceeded 1%',
  'Show recent losing trades with incomplete psychology',
  'Show London session trades',
  'Show Revenge trading trades'
];

export const QuickInvestigationBar: React.FC<QuickInvestigationBarProps> = ({
  trades,
  strategies,
  rules,
  learnings,
  settings,
  onOpenTradeDrawer
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<InvestigationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResult(null);
      setHasSearched(false);
      return;
    }
    const res = searchAndInvestigate(trimmed, trades, strategies, rules, learnings, settings);
    setResult(res);
    setHasSearched(true);
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Quick Investigation & Deep Search
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inspect subsets of your recorded history across trades, psychology, strategies, rules, and learnings.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 'Show my last 10 XAU/USD London trades' or 'Show FOMO trades'..."
          className="w-full pl-10 pr-24 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => handleSearch(query)}
            disabled={!query.trim()}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Investigate
          </button>
        </div>
      </div>

      {/* Suggested Query Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap pl-0.5">
          <Sparkles className="w-3 h-3 text-blue-500" /> Suggestions:
        </span>
        {SUGGESTIONS.map((sugg, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(sugg);
              handleSearch(sugg);
            }}
            className="px-2.5 py-1 text-xs rounded-lg font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap transition-colors cursor-pointer"
          >
            {sugg}
          </button>
        ))}
      </div>

      {/* Results View */}
      {hasSearched && result && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {result.isInsufficient ? (
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {result.summaryMessage}
              </span>
            </div>

            {/* Filters recognized */}
            {Object.keys(result.filtersApplied).length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Filters detected:</span>
                {Object.entries(result.filtersApplied).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                    {k}: {String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Matched Trades Preview */}
          {result.matchedTrades.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200/80 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Matched Trades ({result.matchedTrades.length})
                </span>
                <button
                  onClick={() => onOpenTradeDrawer(result.matchedTrades, `Investigation: "${result.query}"`)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  Inspect in Evidence Drawer ({result.matchedTrades.length}) →
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {result.matchedTrades.slice(0, 6).map(trade => (
                  <div key={trade.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        trade.direction === 'BUY' 
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' 
                          : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                      }`}>
                        {trade.direction}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">{trade.market}</span>
                        <span className="text-slate-400">Strategy: {trade.strategy || 'Unassigned'}</span>
                        {trade.session && <span className="text-slate-400 ml-2">Session: {trade.session}</span>}
                        {trade.emotions && trade.emotions.length > 0 && (
                          <span className="text-purple-600 dark:text-purple-400 ml-2">
                            [{trade.emotions.join(', ')}]
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400">
                        Risk: {trade.riskPercent ? `${trade.riskPercent}%` : formatCurrency(trade.risk)}
                      </span>
                      {trade.result && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          trade.result === 'WIN' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : trade.result === 'LOSS'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {trade.result}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Rules or Strategies */}
          {(result.matchedStrategies.length > 0 || result.matchedRules.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {result.matchedStrategies.map(strat => (
                <div 
                  key={strat.id} 
                  onClick={() => navigate(`/strategies/${strat.id}`)}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{strat.name}</span>
                      <span className="text-slate-400 block text-[11px]">{strat.status} Strategy</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}

              {result.matchedRules.map(rule => (
                <div 
                  key={rule.id} 
                  onClick={() => navigate('/learning-rules?tab=rules')}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BookOpenCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate block max-w-xs">{rule.text}</span>
                      <span className="text-slate-400 block text-[11px]">Rule • {rule.priority} Priority</span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
