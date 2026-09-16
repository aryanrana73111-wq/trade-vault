import React, { useState } from 'react';
import { Library, ExternalLink, Video, FileText, Search } from 'lucide-react';

export const MaxResourceLibrary: React.FC = () => {
  const [search, setSearch] = useState('');

  const resources = [
    { title: "Institutional Order Flow Masterclass", type: "Video", author: "TradeVault Official", duration: "1h 45m" },
    { title: "Understanding BIX Options Skew", type: "Article", author: "CME Group Insights", duration: "15m read" },
    { title: "Risk of Ruin Calculator", type: "Tool", author: "MathTrading", duration: "Interactive" },
    { title: "The Psychology of Drawdowns", type: "Video", author: "Dr. Brett Steenbarger", duration: "45m" },
    { title: "Advanced Volume Profile Guide", type: "Article", author: "OrderFlowLabs", duration: "20m read" },
    { title: "Macro Economic Calendar Cheat Sheet", type: "PDF", author: "TradeVault Official", duration: "Download" },
  ];

  const filtered = resources.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-amber-500" />
            <span>Resource Library</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            Verified videos, articles, and tools. Externally sourced materials are vetted for institutional accuracy.
          </p>
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((res, i) => (
          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-amber-400 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  res.type === 'Video' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                  res.type === 'Article' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  {res.type}
                </span>
                <span className="text-xs font-bold text-slate-400">{res.duration}</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {res.title}
              </h4>
              <p className="text-xs text-slate-500 font-semibold">{res.author}</p>
            </div>
            <button className="mt-5 w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
              <span>Access Resource</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 font-bold">
          No resources found matching "{search}"
        </div>
      )}
    </div>
  );
};
