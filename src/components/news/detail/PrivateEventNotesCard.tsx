import React, { useState, useEffect } from 'react';
import { FileText, Save, Check, Lock } from 'lucide-react';

interface PrivateEventNotesCardProps {
  eventId: string;
  initialNote?: string;
  onSaveNote: (eventId: string, note: string) => void;
}

export function PrivateEventNotesCard({
  eventId,
  initialNote = '',
  onSaveNote
}: PrivateEventNotesCardProps) {
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  const handleSave = () => {
    onSaveNote(eventId, note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 overflow-y-auto max-h-[400px] overscroll-contain">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Private Event Notes
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Confidential trade observations & playbook adjustments
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-[11px]">Private to you</span>
        </div>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write your trade thesis, post-release observations, or execution checklist reminders for this event..."
        rows={3}
        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 resize-y"
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 font-mono">
          {note.length} characters
        </span>

        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
            saved
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent hover:opacity-90'
          }`}
        >
          {saved ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Notes Saved</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
