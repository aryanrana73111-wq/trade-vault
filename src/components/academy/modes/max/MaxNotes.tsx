import React, { useState } from 'react';
import { NotebookText, Search, Plus, Save, Clock, Trash2 } from 'lucide-react';

export const MaxNotes: React.FC = () => {
  const [activeNote, setActiveNote] = useState<number | null>(null);

  const notes = [
    { id: 1, title: "Market Structure Reminders", preview: "Always wait for the close of the H1 candle to confirm a sweep...", date: "2 hrs ago" },
    { id: 2, drawdowns: "Risk Management Math", preview: "If I hit a 20% drawdown, cut position size by half until I recover 5%...", date: "1 day ago" },
    { id: 3, title: "Psychology Check", preview: "When I feel FOMO on a breakout, I need to zoom out to the Daily timeframe...", date: "3 days ago" }
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <NotebookText className="w-6 h-6 text-amber-500" />
            <span>My Notes & Revision</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl">
            Store your personal trading rules, flashcards, and concept summaries here.
          </p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold transition-colors flex items-center justify-center gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notes..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="space-y-2">
            {notes.map((note) => (
              <button 
                key={note.id}
                onClick={() => setActiveNote(note.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  activeNote === note.id 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate pr-2">{note.title || note.drawdowns}</h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">{note.date}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{note.preview}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeNote ? (
            <div className="flex flex-col h-[600px] rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <input 
                  type="text" 
                  defaultValue={notes.find(n => n.id === activeNote)?.title || notes.find(n => n.id === activeNote)?.drawdowns}
                  className="bg-transparent border-none text-lg font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-0 w-full"
                />
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-bold transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                </div>
              </div>
              <textarea 
                className="flex-1 w-full p-6 bg-transparent border-none resize-none focus:outline-hidden focus:ring-0 text-slate-700 dark:text-slate-300 leading-relaxed"
                defaultValue={notes.find(n => n.id === activeNote)?.preview}
                placeholder="Start typing your notes here..."
              />
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Last edited {notes.find(n => n.id === activeNote)?.date}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[600px] rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
              <NotebookText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="font-bold">Select a note to view or edit</p>
              <p className="text-sm mt-1">Or click "New Note" to start writing.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
