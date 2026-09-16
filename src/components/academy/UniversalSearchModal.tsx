import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Command, Sparkles, BookOpen } from 'lucide-react';
import { SearchResult, SearchResultItem } from './components/SearchResult';
import { ACADEMY_LESSONS, ACADEMY_CONCEPTS } from '@/data/academy/curriculum';
import { TRADING_FORMULAS } from '@/data/academy/formulas';
import { TRADING_GLOSSARY } from '@/data/academy/glossary';
import { ACADEMY_CASE_STUDIES } from '@/data/academy/caseStudies';

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (item: SearchResultItem) => void;
}

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Index all content
  const allSearchableItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // Lessons
    ACADEMY_LESSONS.forEach(l => {
      items.push({
        id: `lesson-${l.id}`,
        type: 'lesson',
        title: l.title,
        domain: l.domain,
        level: l.level,
        description: l.whatIsIt || l.whyItMatters || '',
        rawItem: l
      });
    });

    // Concepts
    ACADEMY_CONCEPTS.forEach(c => {
      items.push({
        id: `concept-${c.id}`,
        type: 'concept',
        title: c.name,
        domain: c.domain,
        level: c.level,
        description: c.shortDefinition || c.professionalDefinition || '',
        rawItem: c
      });
    });

    // Formulas
    TRADING_FORMULAS.forEach(f => {
      items.push({
        id: `formula-${f.id}`,
        type: 'formula',
        title: f.name,
        domain: f.domain,
        description: `${f.expression} — ${f.description}`,
        rawItem: f
      });
    });

    // Glossary
    TRADING_GLOSSARY.forEach(g => {
      items.push({
        id: `glossary-${g.term}`,
        type: 'glossary',
        title: g.term,
        domain: g.domain,
        level: g.level,
        description: g.definition,
        rawItem: g
      });
    });

    // Case Studies
    ACADEMY_CASE_STUDIES.forEach(cs => {
      items.push({
        id: `case-${cs.id}`,
        type: 'case-study',
        title: cs.title,
        domain: cs.domain,
        subtitle: cs.subtitle,
        description: `${cs.marketConditions} — ${cs.decisionPoint}`,
        rawItem: cs
      });
    });

    return items;
  }, []);

  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return allSearchableItems.slice(0, 10); // initial popular recommendations

    return allSearchableItems
      .filter(item => {
        const matchesDomain = selectedDomain === 'all' || item.domain === selectedDomain;
        if (!matchesDomain) return false;

        const matchesTitle = item.title.toLowerCase().includes(trimmed);
        const matchesDesc = item.description.toLowerCase().includes(trimmed);
        const matchesDomainName = item.domain.toLowerCase().includes(trimmed);
        return matchesTitle || matchesDesc || matchesDomainName;
      })
      .slice(0, 25);
  }, [allSearchableItems, query, selectedDomain]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, concepts, formulas, glossary, crisis case studies..."
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Domain Filter Pills */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex-shrink-0">Domain:</span>
          {['all', 'Market Knowledge', 'Risk Management', 'Quantitative Analysis', 'Execution', 'Trading Psychology'].map(dom => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDomain === dom
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {dom === 'all' ? 'All Domains' : dom}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredResults.length > 0 ? (
            filteredResults.map(item => (
              <SearchResult
                key={item.id}
                item={item}
                onSelect={(selected) => {
                  onSelectResult(selected);
                  onClose();
                }}
              />
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">No matching academy results found</p>
              <p>Try searching for terms like "Expected Value", "Drawdown", "Slippage", or "LTCM".</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{allSearchableItems.length} institutional entries indexed</span>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>K to search anywhere</span>
          </span>
        </div>
      </div>
    </div>
  );
};
