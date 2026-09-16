import React, { useState, useEffect } from 'react';
import { X, Lock, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { MarketNewsArticle } from '@/types/newsIntelligence';

interface PrivateNoteModalProps {
  article: MarketNewsArticle;
  existingNote?: string;
  onSave: (articleId: string, noteText: string) => void;
  onClose: () => void;
}

export function PrivateNoteModal({
  article,
  existingNote = '',
  onSave,
  onClose
}: PrivateNoteModalProps) {
  const [noteText, setNoteText] = useState(existingNote);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    // Check if there is already a note in local storage
    const stored = localStorage.getItem(`tv_news_note_${article.id}`);
    if (stored && !existingNote) {
      setNoteText(stored);
    }
  }, [article.id, existingNote]);

  const handleSave = () => {
    localStorage.setItem(`tv_news_note_${article.id}`, noteText.trim());
    onSave(article.id, noteText.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDelete = () => {
    localStorage.removeItem(`tv_news_note_${article.id}`);
    onSave(article.id, '');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Private News Note
              </h3>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Private & confidential • Stored in TradeVault
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Article Context Snippet */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px] block">
            Associated Intelligence Item:
          </span>
          <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5">
            {article.headline}
          </p>
        </div>

        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Your Observations, Key Levels & Execution Plan:
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="e.g. Watch Gold reaction at $2,340 if yields pull back. Check open XAU/USD limit orders before London close..."
            rows={5}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {noteText.trim() ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Note</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Note</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
