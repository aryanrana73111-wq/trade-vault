import React, { useState } from 'react';
import { BookA, Search, Shield, Tag, ExternalLink } from 'lucide-react';
import { TRADING_GLOSSARY } from '@/data/academy/glossary';
import { GlossaryTerm } from '@/types/academy';

export const GlossaryTab: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  const domains = ['All', 'Market Knowledge', 'Execution', 'Risk Management', 'Technical Analysis', 'Quantitative Analysis', 'Trading Psychology', 'Portfolio Management', 'Professional Practice'];

  const filteredTerms = TRADING_GLOSSARY.filter(t => {
    const matchesSearch = search === '' || 
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || t.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Search & Domain Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search trading terminology, alpha, kurtosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
          {domains.slice(0, 6).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-slate-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map(item => (
          <div
            key={item.term}
            className="p-5 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-base font-black text-slate-900 dark:text-slate-100">
                {item.term}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                {item.domain} • L{item.level}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.definition}
            </p>

            {item.institutionalContext && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Institutional Context: </span>
                  {item.institutionalContext}
                </div>
              </div>
            )}

            {item.relatedTerms && item.relatedTerms.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Related:</span>
                {item.relatedTerms.map(rt => (
                  <span
                    key={rt}
                    onClick={() => setSearch(rt)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    {rt}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
