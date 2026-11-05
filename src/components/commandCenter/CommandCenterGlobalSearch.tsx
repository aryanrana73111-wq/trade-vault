import React, { useState } from 'react';
import { Search, X, ArrowRight, Target, ShieldCheck, BookOpen, Clock } from 'lucide-react';
import { Trade, Strategy, TradingRule, LearningEntry } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface CommandCenterGlobalSearchProps {
  trades: Trade[];
  strategies: Strategy[];
  rules: TradingRule[];
  learnings: LearningEntry[];
  onSelectTrade: (tradeId: string) => void;
  onSelectRule: (ruleId: string) => void;
  onSelectStrategy: (strategyId: string) => void;
}

export function CommandCenterGlobalSearch({
  trades,
  strategies,
  rules,
  learnings,
  onSelectTrade,
  onSelectRule,
  onSelectStrategy
}: CommandCenterGlobalSearchProps) {
  const [query, setQuery] = useState('');

  const cleanQ = query.trim().toLowerCase();

  const matchedTrades = cleanQ ? trades.filter(t => 
    (t.pair || t.market || '').toLowerCase().includes(cleanQ) ||
    (t.strategy || '').toLowerCase().includes(cleanQ) ||
    (t.session || '').toLowerCase().includes(cleanQ) ||
    (t.notes || '').toLowerCase().includes(cleanQ) ||
    (t.mistake || '').toLowerCase().includes(cleanQ) ||
    (t.learning || '').toLowerCase().includes(cleanQ)
  ).slice(0, 5) : [];

  const matchedRules = cleanQ ? rules.filter(r => 
    (r.name || r.text || '').toLowerCase().includes(cleanQ) ||
    (r.description || '').toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const matchedStrategies = cleanQ ? strategies.filter(s => 
    (s.name || '').toLowerCase().includes(cleanQ) ||
    (s.shortDescription || '').toLowerCase().includes(cleanQ)
  ).slice(0, 3) : [];

  const hasResults = matchedTrades.length > 0 || matchedRules.length > 0 || matchedStrategies.length > 0;

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Global Command Search: pairs, strategies, rules, FOMO, early exits, mistakes..."
          className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Search Dropdown Results */}
      {cleanQ && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 max-h-[350px] overflow-y-auto space-y-3">
          {hasResults ? (
            <>
              {matchedTrades.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    Matching Trades ({matchedTrades.length})
                  </span>
                  {matchedTrades.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { onSelectTrade(t.id); setQuery(''); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{t.pair || t.market}</span>
                        <span className="text-slate-400">({t.direction})</span>
                        <span className="text-[10px] text-blue-600 dark:text-blue-400">{t.strategy}</span>
                      </div>
                      <span className={`font-bold ${(t.pnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatCurrency(t.pnl || 0)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {matchedRules.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    Matching Rules ({matchedRules.length})
                  </span>
                  {matchedRules.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => { onSelectRule(r.id); setQuery(''); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{r.name || r.text}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold shrink-0">View Rule</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedStrategies.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    Matching Playbooks ({matchedStrategies.length})
                  </span>
                  {matchedStrategies.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { onSelectStrategy(s.id); setQuery(''); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold shrink-0">View Playbook</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center text-xs text-slate-400">
              No matching records found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
