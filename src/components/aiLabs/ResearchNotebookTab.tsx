import React, { useState } from 'react';
import { Trade, Strategy } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { BookOpen, Search, Plus, Filter, Calendar, Activity, Link as LinkIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface ResearchNotebookTabProps {
  trades: Trade[];
}

interface NotebookEntry {
  id: string;
  date: number;
  title: string;
  content: string;
  tags: string[];
  linkedTrades: string[];
  linkedStrategies: string[];
}

export function ResearchNotebookTab({ trades }: ResearchNotebookTabProps) {
  // In a real implementation this would come from a database Context
  const [entries, setEntries] = useState<NotebookEntry[]>([
    {
      id: '1',
      date: Date.now() - 86400000 * 2,
      title: 'Initial Observations on Trend Pullbacks',
      content: 'Noticed a recurrent pattern where pullbacks to the 15-min VWAP during the NY morning session are failing more often than last month. Will set up a behavior experiment to reduce risk by 50% on these setups for the next 10 trades.',
      tags: ['VWAP', 'Pullback', 'NY Session'],
      linkedTrades: [],
      linkedStrategies: []
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredEntries = entries.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Research Notebook
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm">
            A dedicated record for your market thesis, observations, and forward-looking research notes.
          </p>
        </div>
        <Button className="shrink-0 gap-2 bg-slate-900 text-white">
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search research notes, tags, or linked IDs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
        <Button variant="outline" className="shrink-0 gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <FileText className="w-8 h-8 text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Research Notes Found</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Create your first entry to document market conditions, formulate a thesis, or record observations.
          </p>
          <Button className="mt-6" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Entry
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredEntries.map(entry => (
            <Card key={entry.id} className="p-6 border-slate-200 shadow-sm bg-white hover:border-indigo-300 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{entry.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(entry.date, 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {entry.tags.map(t => (
                    <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider rounded-md">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                {entry.content}
              </p>
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition-colors">
                  <LinkIcon className="w-3.5 h-3.5" />
                  {entry.linkedTrades.length} Linked Trades
                </div>
                <div className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition-colors">
                  <Activity className="w-3.5 h-3.5" />
                  {entry.linkedStrategies.length} Linked Strategies
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
