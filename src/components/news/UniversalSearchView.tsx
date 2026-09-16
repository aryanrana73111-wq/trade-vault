import React, { useState, useMemo } from 'react';
import { 
  searchUniversalIntelligence, 
  UniversalSearchResultItem 
} from '@/lib/news/newsStore';
import { NewsUserSettings, NewsEvent } from '@/types/newsIntelligence';
import { 
  Search, 
  Calendar, 
  BookOpen, 
  Network, 
  FileText, 
  ChevronRight, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface UniversalSearchViewProps {
  settings: NewsUserSettings;
  onNavigateToTab: (tab: string, targetId?: string) => void;
  onSelectEventById?: (id: string) => void;
}

export function UniversalSearchView({
  settings,
  onNavigateToTab,
  onSelectEventById
}: UniversalSearchViewProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    return searchUniversalIntelligence(query, settings);
  }, [query, settings]);

  const getBadgeStyle = (badge: string) => {
    if (badge.includes('HIGH')) return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300';
    if (badge.includes('ACADEMY')) return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
    if (badge.includes('KNOWLEDGE')) return 'bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Event': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'Academy': return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'Concept': return <Network className="w-4 h-4 text-cyan-500" />;
      case 'Note': return <FileText className="w-4 h-4 text-amber-500" />;
      default: return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Input Box */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search economic indicators, central banks, academy lessons, notes..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="font-semibold text-[11px]">Popular Searches:</span>
          {['FOMC', 'NFP', 'CPI', 'Powell', 'ECB', 'Transmission', 'Gold Reaction'].map(term => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results List */}
      {query && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Found {results.length} result{results.length === 1 ? '' : 's'} for "{query}"</span>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matches found</p>
              <p className="text-xs text-slate-400 mt-1">Try querying general terms like "interest rates", "unemployment", or "inflation".</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {results.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.targetTab === 'calendar' && item.targetId && onSelectEventById) {
                      onSelectEventById(item.targetId);
                    } else if (item.targetTab) {
                      onNavigateToTab(item.targetTab, item.targetId);
                    }
                  }}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getBadgeStyle(item.badge)}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                      {item.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">{item.details}</p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
