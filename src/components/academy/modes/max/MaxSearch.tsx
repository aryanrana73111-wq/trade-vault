import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { MaxConceptItem } from '@/types/academyTier';

interface MaxSearchProps {
  onOpenConcept?: (concept: MaxConceptItem) => void;
}

export const MaxSearch: React.FC<MaxSearchProps> = ({ onOpenConcept }) => {
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-amber-500" />
          <span>Curriculum Search</span>
        </h2>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search concepts, modules, notes, videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
      </div>
      
      <div className="flex items-center justify-center h-64 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold">
        Enter a search term to find content.
      </div>
    </div>
  );
};
