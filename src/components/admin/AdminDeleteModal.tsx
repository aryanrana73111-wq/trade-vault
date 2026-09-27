import React, { useState } from 'react';
import { X, Trash2, AlertOctagon } from 'lucide-react';
import { AdminUserListItem } from '@/services/adminService';

interface AdminDeleteModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (uid: string) => Promise<void>;
}

export function AdminDeleteModal({
  user,
  isOpen,
  onClose,
  onConfirm
}: AdminDeleteModalProps) {
  if (!isOpen || !user) return null;

  const [confirmInput, setConfirmInput] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmInput.trim() === 'DELETE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setSubmitting(true);
    setError(null);

    try {
      await onConfirm(user.uid);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to permanently delete user account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-rose-950/80 bg-rose-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-rose-200">
                Permanently Delete User Account
              </h3>
              <p className="text-xs text-rose-400/80">Irreversible administrative purge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">User Account to Purge</span>
            <p className="text-xs font-bold text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            <p className="text-[11px] text-slate-500 font-mono">UID: {user.uid}</p>
          </div>

          <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs text-rose-300/90 leading-relaxed">
            <strong>Warning:</strong> This action will permanently remove the user's authentication credentials, all trading dashboards, journal records, rules, and analytics. This operation cannot be undone.
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              placeholder="Type DELETE"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className="w-full bg-slate-950 border border-rose-900/50 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium">{error}</p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || submitting}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-rose-950 disabled:text-rose-600 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{submitting ? 'Deleting User...' : 'Permanently Delete'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
