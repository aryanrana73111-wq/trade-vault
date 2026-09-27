import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { AdminUserListItem } from '@/services/adminService';

interface AdminStatusModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (uid: string, newStatus: 'ACTIVE' | 'DISABLED', reason?: string) => Promise<void>;
}

export function AdminStatusModal({
  user,
  isOpen,
  onClose,
  onConfirm
}: AdminStatusModalProps) {
  if (!isOpen || !user) return null;

  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
  const isDisabling = nextStatus === 'DISABLED';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await onConfirm(user.uid, nextStatus, reason);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update user account status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isDisabling ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {isDisabling ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {isDisabling ? 'Disable User Account' : 'Re-enable User Account'}
              </h3>
              <p className="text-xs text-slate-400">Security enforcement action</p>
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
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Account</span>
            <p className="text-xs font-bold text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isDisabling ? (
              <span>
                Disabling this account will revoke authentication access and block this user from entering TradeVault until an administrator re-enables the account.
              </span>
            ) : (
              <span>
                Re-enabling this account will restore standard login capabilities and allow the trader to resume logging trades.
              </span>
            )}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Administrative Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Requested by user, Policy review, Inactivity..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              disabled={submitting}
              className={`px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs transition-colors ${
                isDisabling
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {submitting ? 'Updating...' : isDisabling ? 'Confirm Disable' : 'Confirm Enable'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
