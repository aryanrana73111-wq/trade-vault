import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Trash2, 
  Clock, 
  RefreshCw, 
  AlertCircle,
  Shield,
  User,
  Filter,
  TrendingUp,
  Edit3,
  Layers
} from 'lucide-react';
import { AdminAuditLogEntry, adminService } from '@/services/adminService';
import { format, isToday, isYesterday } from 'date-fns';

export function AdminActivitySection() {
  const [logs, setLogs] = useState<AdminAuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  const loadActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getActivity(50);
      setLogs(data);
    } catch (err: any) {
      console.warn('Activity load notice:', err?.message || err);
      setError(err?.message || 'Failed to retrieve administrative activity log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action === filterAction;
  });

  const getActionBadge = (log: AdminAuditLogEntry) => {
    const action = log.action;
    switch (action) {
      case 'TRADE_CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trade Created</span>
          </span>
        );
      case 'TRADE_UPDATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Edit3 className="w-3.5 h-3.5" />
            <span>Trade Updated</span>
          </span>
        );
      case 'USER_REGISTERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <User className="w-3.5 h-3.5" />
            <span>User Registered</span>
          </span>
        );
      case 'PROFILE_UPDATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Profile Updated</span>
          </span>
        );
      case 'USER_DISABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserX className="w-3.5 h-3.5" />
            <span>Account Disabled</span>
          </span>
        );
      case 'USER_ENABLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Account Enabled</span>
          </span>
        );
      case 'USER_DELETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Account Deleted</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Shield className="w-3.5 h-3.5" />
            <span>{log.event || action}</span>
          </span>
        );
    }
  };

  const formatDate = (ts: number | undefined) => {
    if (!ts) return '—';
    try {
      const date = new Date(ts);
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>User & System Activity</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Live Feed
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit of registered user events, executed trades, and administrative security actions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Action Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Activity</option>
              <option value="TRADE_CREATED" className="bg-slate-900 text-slate-200">Trades Created</option>
              <option value="TRADE_UPDATED" className="bg-slate-900 text-slate-200">Trades Updated</option>
              <option value="USER_REGISTERED" className="bg-slate-900 text-slate-200">Users Registered</option>
              <option value="PROFILE_UPDATED" className="bg-slate-900 text-slate-200">Profiles Updated</option>
              <option value="USER_DISABLED" className="bg-slate-900 text-slate-200">Accounts Disabled</option>
              <option value="USER_ENABLED" className="bg-slate-900 text-slate-200">Accounts Enabled</option>
              <option value="USER_DELETED" className="bg-slate-900 text-slate-200">Accounts Deleted</option>
            </select>
          </div>

          <button
            onClick={loadActivity}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Activity Content */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading recorded activity records...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-semibold text-rose-200">{error}</h3>
          <button
            onClick={loadActivity}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No activity logged yet</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            User registrations, trades, and administrative security actions will be recorded here in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActionBadge(log)}
                    {log.relatedObject && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono font-semibold text-xs text-slate-200">
                        {log.relatedObject}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                    {log.userName && (
                      <span className="font-semibold text-slate-200">{log.userName}</span>
                    )}
                    {log.userEmail && (
                      <span className="font-mono text-slate-400">({log.userEmail})</span>
                    )}
                    {log.adminEmail && log.action.startsWith('USER_') && log.action !== 'USER_REGISTERED' && (
                      <span className="text-slate-500 text-[11px]">
                        Executed by admin: <span className="text-slate-300">{log.adminEmail}</span>
                      </span>
                    )}
                  </div>

                  {log.details && (log.details.reason || log.details.direction || log.details.pnl !== undefined) && (
                    <div className="text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/60 max-w-xl flex flex-wrap items-center gap-3">
                      {log.details.reason && (
                        <span><span className="font-semibold text-slate-300">Reason:</span> {log.details.reason}</span>
                      )}
                      {log.details.direction && (
                        <span><span className="font-semibold text-slate-300">Direction:</span> {log.details.direction}</span>
                      )}
                      {log.details.pnl !== undefined && (
                        <span>
                          <span className="font-semibold text-slate-300">P&L:</span>{' '}
                          <span className={log.details.pnl >= 0 ? 'text-emerald-400 font-mono font-semibold' : 'text-rose-400 font-mono font-semibold'}>
                            {log.details.pnl >= 0 ? `+$${log.details.pnl}` : `-$${Math.abs(log.details.pnl)}`}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono self-end md:self-auto bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80 shrink-0">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(log.timestamp)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
