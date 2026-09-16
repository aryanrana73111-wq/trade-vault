import React, { useState } from 'react';
import { Search, Filter, BookOpen, Clock, Activity, Target } from 'lucide-react';
import { ALL_135_CONCEPTS } from '@/data/academy/maxCurriculumData';
import { MaxConceptItem } from '@/types/academyTier';
import { useAcademy } from '@/contexts/AcademyContext';

// We can extract categories from the concepts
const DOMAINS = Array.from(new Set(ALL_135_CONCEPTS.map(c => c.domain))).sort();

interface MaxConceptLibraryProps {
  onOpenConcept?: (concept: MaxConceptItem) => void;
}

export const MaxConceptLibrary: React.FC<MaxConceptLibraryProps> = ({ onOpenConcept }) => {
  const { progress } = useAcademy();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  
  const filtered = ALL_135_CONCEPTS.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>MAX Concept Vault</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Explore {ALL_135_CONCEPTS.length}+ advanced concepts across {DOMAINS.length} market domains.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts, patterns, principles..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Domain Filters */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedDomain('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedDomain === 'All'
                ? 'bg-amber-500 text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Domains
          </button>
          {DOMAINS.map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedDomain === domain
                  ? 'bg-amber-500 text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(concept => {
          const isMastered = progress.masteredConcepts.includes(concept.id);

          return (
            <div 
              key={concept.id}
              onClick={() => onOpenConcept && onOpenConcept(concept)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
                    Phase {concept.level} • {concept.domain}
                  </span>
                  {isMastered && (
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Target className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {concept.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {concept.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Interactive Chart</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{concept.estimatedMinutes}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500">
            No concepts match your search.
          </p>
        </div>
      )}
    </div>
  );
};
