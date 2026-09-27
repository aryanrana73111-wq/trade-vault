import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { AdminUserDetail, adminService } from '@/services/adminService';
import { format } from 'date-fns';

interface AdminUserDetailModalProps {
  uid: string | null;
  onClose: () => void;
  onStatusChangeRequest: (user: AdminUserDetail) => void;
  onDeleteRequest: (user: AdminUserDetail) => void;
}

export function AdminUserDetailModal({
  uid,
  onClose,
  onStatusChangeRequest,
  onDeleteRequest
}: AdminUserDetailModalProps) {
  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    adminService.getUserDetail(uid)
      .then((data) => {
        if (isMounted) {
          setUserDetail(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Failed to load user details.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uid]);

  if (!uid) return null;

  const formatDate = (ts: number | undefined) => {
    if (!ts || ts === 0) return 'Unavailable';
    try {
      return format(new Date(ts), 'PPpp');
    } catch {
      return 'Unavailable';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">User Profile & Account Inspection</h2>
              <p className="text-xs text-slate-400">Read-only administrative overview of account credentials and trading metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Loading user profile and aggregating trading summary...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-950/20 border border-rose-900/40 rounded-xl text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-400 mx-auto" />
              <p className="text-xs font-semibold text-rose-200">{error}</p>
            </div>
          ) : userDetail ? (
            <>
              {/* Profile Card */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {userDetail.photoURL ? (
                    <img
                      src={userDetail.photoURL}
                      alt={userDetail.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-lg font-bold">
                      {userDetail.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-100">{userDetail.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        userDetail.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {userDetail.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{userDetail.email}</span>
                      {userDetail.emailVerified ? (
                        <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-0.5" title="Verified Email">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px] font-semibold" title="Unverified Email">
                          Unverified
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => onStatusChangeRequest(userDetail)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      userDetail.status === 'ACTIVE'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {userDetail.status === 'ACTIVE' ? 'Disable Account' : 'Enable Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRequest(userDetail)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Firebase UID</span>
                  <p className="text-xs font-mono font-medium text-slate-200 select-all truncate" title={userDetail.uid}>
                    {userDetail.uid}
                  </p>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Authentication Provider</span>
                  <p className="text-xs font-medium text-slate-200 flex items-center gap-1.5 capitalize">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    {userDetail.provider.includes('google') ? 'Google OAuth' : 'Email + Password'}
                  </p>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account Created</span>
                  <p className="text-xs font-mono text-slate-200">
                    {formatDate(userDetail.createdAt)}
                  </p>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Login</span>
                  <p className="text-xs font-mono text-slate-200">
                    {userDetail.lastLoginAt && userDetail.lastLoginAt > 0
                      ? formatDate(userDetail.lastLoginAt)
                      : 'Historical login activity is not available.'}
                  </p>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Trading Style</span>
                  <p className="text-xs text-slate-200">
                    {userDetail.tradingStyle || 'Day Trading'}
                  </p>
                </div>

                <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Preferred Markets</span>
                  <p className="text-xs text-slate-200 truncate">
                    {userDetail.preferredMarkets || 'Forex & Commodities'}
                  </p>
                </div>
              </div>

              {/* Trading Summary Section */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Trading Summary (Real Data Aggregation)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Calculated from actual trade records
                  </span>
                </div>

                {userDetail.tradingSummary.totalTrades === 0 ? (
                  <div className="p-6 bg-slate-950/30 border border-slate-800/60 rounded-xl text-center">
                    <p className="text-xs text-slate-400">No trades recorded for this user account yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Trades</span>
                        <div className="text-xl font-bold font-mono text-slate-100 mt-0.5">
                          {userDetail.tradingSummary.totalTrades}
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-emerald-400 uppercase font-semibold">Winning Trades</span>
                        <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                          {userDetail.tradingSummary.winningTrades}
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-rose-400 uppercase font-semibold">Losing Trades</span>
                        <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
                          {userDetail.tradingSummary.losingTrades}
                        </div>
                      </div>

                      <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-center">
                        <span className="text-[10px] text-blue-400 uppercase font-semibold">Win Rate</span>
                        <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">
                          {userDetail.tradingSummary.winRate}%
                        </div>
                      </div>
                    </div>

                    {/* Total P&L Banner */}
                    <div className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Total Cumulative Net P&L</span>
                      <span className={`text-base font-bold font-mono ${
                        userDetail.tradingSummary.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {userDetail.tradingSummary.totalPnl >= 0 ? '+' : ''}${userDetail.tradingSummary.totalPnl.toFixed(2)}
                      </span>
                    </div>

                    {/* Recent Trades Table */}
                    {userDetail.tradingSummary.recentTrades.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Recent Trade Executions
                        </span>
                        <div className="border border-slate-800/80 rounded-xl overflow-hidden">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                              <tr>
                                <th className="p-2.5">Date</th>
                                <th className="p-2.5">Market</th>
                                <th className="p-2.5">Direction</th>
                                <th className="p-2.5">Result</th>
                                <th className="p-2.5 text-right">P&L</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 font-mono">
                              {userDetail.tradingSummary.recentTrades.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-800/30">
                                  <td className="p-2.5 text-slate-400">
                                    {t.date ? format(new Date(t.date), 'MMM d, yyyy') : '—'}
                                  </td>
                                  <td className="p-2.5 text-slate-200 font-bold">{t.market}</td>
                                  <td className="p-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                      t.direction === 'BUY'
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                      {t.direction}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-300">{t.result}</td>
                                  <td className={`p-2.5 text-right font-bold ${
                                    t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                  }`}>
                                    {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
