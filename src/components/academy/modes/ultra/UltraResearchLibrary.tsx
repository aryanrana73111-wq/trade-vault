import React, { useState } from 'react';
import { BookOpen, Search, ExternalLink, Library, Bookmark, ShieldCheck, Clock } from 'lucide-react';
import { ULTRA_RESEARCH_PAPERS, ULTRA_BOOKS_LIBRARY } from '@/data/academy/ultraCurriculumData';

export const UltraResearchLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'papers' | 'books'>('papers');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-indigo-500" />
            <span>Research Library</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Verified academic papers, institutional research, and foundational trading literature.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'papers' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Academic Papers
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'books' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Core Literature
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search research titles, authors, or topics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      <div className="grid gap-4">
        {activeTab === 'papers' && ULTRA_RESEARCH_PAPERS.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((paper) => (
          <div key={paper.id} className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400">
                    Academic Paper
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {paper.source} • {paper.year}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {paper.title}
                </h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {paper.authors}
                </p>
              </div>
              <a 
                href={paper.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Key Finding</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {paper.keyFinding}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plain Summary</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {paper.plainSummary}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>Save to Workbench</span>
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'books' && ULTRA_BOOKS_LIBRARY.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase())).map((book) => (
          <div key={book.id} className="p-6 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-400">
                    {book.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {book.level}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {book.title}
                </h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {book.author}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Key Lesson</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {book.keyLesson}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2 italic">
                "{book.whyRecommended}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
