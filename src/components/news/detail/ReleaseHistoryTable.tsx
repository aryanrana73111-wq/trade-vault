import React, { useState } from 'react';
import { ReleaseHistoryEntry } from '@/types/eventIntelligence';
import { Table, ArrowUpDown, TrendingUp, TrendingDown, Minus, RotateCcw } from 'lucide-react';

interface ReleaseHistoryTableProps {
  releases: ReleaseHistoryEntry[];
  unit?: string;
  onOpenRevisionPopover?: (entry: ReleaseHistoryEntry) => void;
}

export function ReleaseHistoryTable({
  releases,
  unit = '%',
  onOpenRevisionPopover
}: ReleaseHistoryTableProps) {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const sortedReleases = [...releases].sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    return sortOrder === 'desc' ? diff : -diff;
  });

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Release History
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Chronological log of releases, revisions, and deviations
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort by Date ({sortOrder === 'desc' ? 'Newest First' : 'Oldest First'})</span>
        </button>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-sans font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Release Date</th>
              <th className="py-3 px-3">Period</th>
              <th className="py-3 px-3">Actual</th>
              <th className="py-3 px-3">Consensus</th>
              <th className="py-3 px-3">Previous</th>
              <th className="py-3 px-3">Revision</th>
              <th className="py-3 px-3">Surprise</th>
              <th className="py-3 px-4 text-right">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {sortedReleases.map((row) => {
              const isSurprisePositive = row.surprise > 0;
              const isSurpriseNegative = row.surprise < 0;

              return (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                    {row.period}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {row.actual}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {row.consensus}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                    {row.previous}
                  </td>
                  <td className="py-3 px-3">
                    {row.revisedPrevious ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <RotateCcw className="w-3 h-3" />
                        <span>{row.revisedPrevious}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`font-bold flex items-center gap-0.5 ${
                      isSurprisePositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isSurpriseNegative
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}>
                      {isSurprisePositive ? `+${row.surprise}${unit}` : isSurpriseNegative ? `${row.surprise}${unit}` : `0.0${unit}`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-sans font-bold ${
                      row.surpriseLabel === 'Above Consensus'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                        : row.surpriseLabel === 'Below Consensus'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {row.surpriseLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
