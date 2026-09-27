import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Eye, 
  UserX, 
  UserCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Mail, 
  Calendar,
  Clock,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AdminUserListItem, AdminUserDetail, adminService } from '@/services/adminService';
import { AdminUserDetailModal } from './AdminUserDetailModal';
import { AdminStatusModal } from './AdminStatusModal';
import { AdminDeleteModal } from './AdminDeleteModal';
import { format, isToday, isYesterday } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AdminUsersSectionProps {
  initialUserUid?: string;
}

export function AdminUsersSection({ initialUserUid }: AdminUsersSectionProps = {}) {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Query Params
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(initialUserUid || null);
  const [statusModalUser, setStatusModalUser] = useState<AdminUserListItem | null>(null);
  const [deleteModalUser, setDeleteModalUser] = useState<AdminUserListItem | null>(null);

  useEffect(() => {
    if (initialUserUid) {
      setSelectedUserUid(initialUserUid);
    }
  }, [initialUserUid]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 25,
        search,
        filter,
        sortBy,
        sortOrder
      });
      setUsers(res.users || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.totalCount || 0);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.warn('Users load notice:', err?.message || err);
      setError(err?.message || 'Unable to load registered users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, sortBy, sortOrder]);

  // Load when query params change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Real-time listener: automatically reload users when Firestore users change
  useEffect(() => {
    const unsub = adminService.subscribeUsers(() => {
      loadUsers();
    });
    return () => unsub();
  }, [loadUsers]);

  const handleStatusConfirm = async (uid: string, newStatus: 'ACTIVE' | 'DISABLED', reason?: string) => {
    await adminService.updateUserStatus(uid, newStatus, reason);
    loadUsers();
  };

  const handleDeleteConfirm = async (uid: string) => {
    await adminService.deleteUserAccount(uid, 'DELETE');
    if (selectedUserUid === uid) setSelectedUserUid(null);
    loadUsers();
  };

  const formatDate = (ts: number | undefined) => {
    if (!ts || ts === 0) return '—';
    try {
      return format(new Date(ts), 'MMM d, yyyy');
    } catch {
      return '—';
    }
  };

  const formatLastUpdatedString = (date: Date) => {
    try {
      if (isToday(date)) {
        return `Today, ${format(date, 'h:mm a')}`;
      }
      if (isYesterday(date)) {
        return `Yesterday, ${format(date, 'h:mm a')}`;
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return 'Just now';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <span>User Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              {totalCount} Total
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <p className="text-xs text-slate-400">
              Search, filter, inspect profiles, and manage authentication status across all TradeVault accounts.
            </p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Last updated: {formatLastUpdatedString(lastUpdated)}
            </span>
          </div>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user by Name, Email or UID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter select */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Accounts</option>
                <option value="ACTIVE" className="bg-slate-900 text-slate-200">Active Only</option>
                <option value="DISABLED" className="bg-slate-900 text-slate-200">Disabled Only</option>
                <option value="GOOGLE" className="bg-slate-900 text-slate-200">Google OAuth</option>
                <option value="PASSWORD" className="bg-slate-900 text-slate-200">Email/Password</option>
                <option value="VERIFIED" className="bg-slate-900 text-slate-200">Email Verified</option>
                <option value="UNVERIFIED" className="bg-slate-900 text-slate-200">Unverified</option>
                <option value="TODAY" className="bg-slate-900 text-slate-200">Joined Today</option>
                <option value="THIS_WEEK" className="bg-slate-900 text-slate-200">Joined This Week</option>
                <option value="THIS_MONTH" className="bg-slate-900 text-slate-200">Joined This Month</option>
              </select>
            </div>

            {/* Sort by */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, ord] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(ord as 'asc' | 'desc');
                  setPage(1);
                }}
                className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="createdAt-desc" className="bg-slate-900 text-slate-200">Newest User</option>
                <option value="createdAt-asc" className="bg-slate-900 text-slate-200">Oldest User</option>
                <option value="lastLoginAt-desc" className="bg-slate-900 text-slate-200">Last Login (Recent)</option>
                <option value="name-asc" className="bg-slate-900 text-slate-200">Name (A-Z)</option>
                <option value="email-asc" className="bg-slate-900 text-slate-200">Email (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Content */}
      {loading ? (
        <div className="p-16 text-center space-y-3 bg-slate-900/40 border border-slate-800 rounded-2xl">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading verified users from Firebase...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-semibold text-rose-200">{error}</h3>
          <button
            onClick={loadUsers}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="p-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">No users found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No registered accounts match the active search query or filter selection.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Authentication</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5">Last Login</th>
                  <th className="p-3.5">Email Verified</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((u) => {
                  const isGoogle = u.provider.includes('google');
                  const isVerified = u.emailVerified;
                  const isActive = u.status === 'ACTIVE';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      {/* User Column */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          {u.photoURL ? (
                            <img
                              src={u.photoURL}
                              alt={u.name}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate" title={u.uid}>
                              {u.uid.slice(0, 14)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-3.5 text-slate-300 font-mono">
                        {u.email}
                      </td>

                      {/* Provider */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/80 text-[11px] font-medium text-slate-200">
                          {isGoogle ? (
                            <>
                              <Globe className="w-3 h-3 text-blue-400" />
                              <span>Google</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>Password</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="p-3.5 text-slate-400 font-mono">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Last Login */}
                      <td className="p-3.5 text-slate-400 font-mono">
                        {formatDate(u.lastLoginAt)}
                      </td>

                      {/* Verified */}
                      <td className="p-3.5">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400/90 font-medium">
                            Unverified
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUserUid(u.uid)}
                            title="Inspect Profile & Trading Data"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatusModalUser(u)}
                            title={isActive ? 'Disable User' : 'Enable User'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteModalUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards View */}
          <div className="block lg:hidden space-y-3">
            {users.map((u) => {
              const isGoogle = u.provider.includes('google');
              const isActive = u.status === 'ACTIVE';

              return (
                <div
                  key={u.uid}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt={u.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-100">{u.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {u.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Created</span>
                      <p className="font-mono text-slate-300">{formatDate(u.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Last Login</span>
                      <p className="font-mono text-slate-300">{formatDate(u.lastLoginAt)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Auth</span>
                      <p className="text-slate-300">{isGoogle ? 'Google' : 'Password'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Email Verified</span>
                      <p className={u.emailVerified ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                        {u.emailVerified ? 'Verified' : 'Unverified'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserUid(u.uid)}
                      className="flex-1 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile & Data</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStatusModalUser(u)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {isActive ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModalUser(u)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-400">
            <div>
              Showing <span className="text-slate-200 font-semibold">{users.length}</span> of{' '}
              <span className="text-slate-200 font-semibold">{totalCount}</span> registered users
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1 font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-slate-950 font-mono text-slate-200 border border-slate-800/80">
                Page {page} of {totalPages}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Detail Inspection Modal */}
      <AdminUserDetailModal
        uid={selectedUserUid}
        onClose={() => {
          setSelectedUserUid(null);
          if (initialUserUid) navigate('/admin?tab=users');
        }}
        onStatusChangeRequest={(u) => setStatusModalUser(u)}
        onDeleteRequest={(u) => setDeleteModalUser(u)}
      />

      {/* Account Status Modal */}
      <AdminStatusModal
        user={statusModalUser}
        isOpen={Boolean(statusModalUser)}
        onClose={() => setStatusModalUser(null)}
        onConfirm={handleStatusConfirm}
      />

      {/* Delete User Modal */}
      <AdminDeleteModal
        user={deleteModalUser}
        isOpen={Boolean(deleteModalUser)}
        onClose={() => setDeleteModalUser(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
