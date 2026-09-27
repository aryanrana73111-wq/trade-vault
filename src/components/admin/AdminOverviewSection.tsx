import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  ShieldCheck, 
  Mail, 
  TrendingUp, 
  RefreshCw, 
  ArrowUpRight, 
  Globe, 
  Clock, 
  Activity, 
  Shield,
  User as UserIcon,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { AdminStats, AdminAuditLogEntry, adminService } from '@/services/adminService';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

interface AdminOverviewSectionProps {
  stats: AdminStats | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigateToUsers: () => void;
  onNavigateToActivity?: () => void;
}

export function AdminOverviewSection({
  stats,
  loading,
  onRefresh,
  onNavigateToUsers,
  onNavigateToActivity
}: AdminOverviewSectionProps) {
  const [recentActivity, setRecentActivity] = useState<AdminAuditLogEntry[]>([]);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOverviewData = async () => {
    setLoadingActivity(true);
    try {
      const logs = await adminService.getActivity(5);
      setRecentActivity(logs);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Overview activity fetch notice:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleRefreshAll = () => {
    onRefresh();
    fetchOverviewData();
  };

  const s = stats || {
    totalUsers: 0,
    activeUsers: 0,
    disabledUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
    googleUsers: 0,
    passwordUsers: 0,
    verifiedEmails: 0,
    unverifiedEmails: 0,
    recentUsers: []
  };

  const formatJoinedTime = (ts: number | undefined) => {
    if (!ts || ts === 0) return 'Recently';
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatActivityTime = (ts: number | undefined) => {
    if (!ts || ts === 0) return 'Just now';
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const formatLastUpdatedString = (date: Date) => {
    try {
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-6">
      {/* Owner Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 font-mono">
                TradeVault
              </span>
              <span className="text-slate-600 font-mono">/</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Owner Admin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome, Aryan
            </h1>
            <p className="text-xs text-slate-400 max-w-xl">
              Live owner administrative control center. Real registered users, account states, and verified platform metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Last updated</span>
              <span className="text-xs font-mono font-medium text-slate-300">
                {formatLastUpdatedString(lastUpdated)}
              </span>
            </div>

            <button
              onClick={handleRefreshAll}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Refresh all real metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={onNavigateToUsers}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>View All Users</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {loading ? '...' : s.totalUsers}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              All-time registered accounts
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Users</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {loading ? '...' : s.activeUsers}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Active within last 30 days
            </div>
          </div>
        </div>

        {/* New Users Today */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">New Today</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {loading ? '...' : s.newUsersToday}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Created since 12:00 AM
            </div>
          </div>
        </div>

        {/* New Users This Week */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">This Week</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-purple-400 font-mono tracking-tight">
              {loading ? '...' : s.newUsersThisWeek}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Past 7 calendar days
            </div>
          </div>
        </div>

        {/* New Users This Month */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">This Month</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Globe className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-cyan-400 font-mono tracking-tight">
              {loading ? '...' : s.newUsersThisMonth}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Past 30 calendar days
            </div>
          </div>
        </div>
      </div>

      {/* Middle Two-Column Grid: Recent Users & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* RECENT USERS SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Recent Users
              </h3>
            </div>
            <button
              onClick={onNavigateToUsers}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Users</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!s.recentUsers || s.recentUsers.length === 0 ? (
            <div className="p-8 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center">
              <p className="text-xs text-slate-400">No registered users recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {s.recentUsers.map((u) => {
                const isGoogle = u.provider.includes('google');
                const isActive = u.status !== 'DISABLED';
                return (
                  <div key={u.uid} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div className="hidden sm:block">
                        <span className="text-[10px] font-medium text-slate-400 block">
                          {isGoogle ? 'Google' : 'Email'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {formatJoinedTime(u.createdAt)}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* USER ACTIVITY SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                User Activity
              </h3>
            </div>
            {onNavigateToActivity && (
              <button
                onClick={onNavigateToActivity}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>View Full Activity</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loadingActivity ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400">Loading recent activity...</p>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-8 bg-slate-950/40 border border-slate-800/80 rounded-xl text-center">
              <p className="text-xs text-slate-400">No recorded activity events yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentActivity.map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between gap-3 first:pt-0 last:pb-0">
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-semibold text-slate-200">
                      {act.event || act.action}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {act.userEmail || act.targetEmail || act.relatedObject || 'Recorded Event'}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {formatActivityTime(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Authentication & Security Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium">Google OAuth Accounts</span>
            <div className="text-xl font-bold font-mono text-slate-100">{s.googleUsers}</div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {s.totalUsers > 0 ? Math.round((s.googleUsers / s.totalUsers) * 100) : 0}%
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium">Email/Password Accounts</span>
            <div className="text-xl font-bold font-mono text-slate-100">{s.passwordUsers}</div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {s.totalUsers > 0 ? Math.round((s.passwordUsers / s.totalUsers) * 100) : 0}%
          </span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium">Verified Email Addresses</span>
            <div className="text-xl font-bold font-mono text-emerald-400">{s.verifiedEmails}</div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {s.totalUsers > 0 ? Math.round((s.verifiedEmails / s.totalUsers) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
