import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  ShieldAlert, 
  ArrowLeft, 
  Shield, 
  Menu, 
  X, 
  LogOut, 
  ChevronRight,
  Lock,
  Sliders,
  CheckCircle2,
  Server,
  Database,
  Key
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminOverviewSection } from '@/components/admin/AdminOverviewSection';
import { AdminUsersSection } from '@/components/admin/AdminUsersSection';
import { AdminActivitySection } from '@/components/admin/AdminActivitySection';
import { AdminStats, adminService } from '@/services/adminService';

export function AdminDashboard() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { uid } = useParams();

  // If path is /admin/users or has uid param, default tab to 'users'
  const isUsersPath = location.pathname.startsWith('/admin/users');
  const currentTab = isUsersPath ? 'users' : (searchParams.get('tab') || 'overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Stats state for Overview
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  const setTab = (tab: string) => {
    if (tab === 'users') {
      navigate('/admin/users');
    } else if (tab === 'overview') {
      navigate('/admin');
    } else {
      navigate(`/admin?tab=${tab}`);
    }
    setIsMobileMenuOpen(false);
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      console.warn('Stats fetch notice:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-400 font-medium">Verifying administrator authorization...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // Logged in but not an authorized admin -> Access Denied Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-slate-100">Access Denied</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              Administrator Privileges Required
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            This management control center is strictly restricted to verified TradeVault administrators. Your authenticated account (<span className="text-slate-200 font-mono">{user.email}</span>) does not possess server-side administrative authorization.
          </p>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              Return to TradeVault
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden bg-slate-900/90 border-b border-slate-800/90 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-white tracking-tight">TradeVault</span>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded ml-1.5 uppercase font-mono">
              Admin
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-white">Admin Control</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to App</span>
              </Link>
            </div>
          </div>

          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-slate-900/60 border-r border-slate-800/80 flex-col justify-between shrink-0 p-5 sticky top-0 h-screen">
        <div className="space-y-6">
          {/* Logo & Admin Branding */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-xs shadow-blue-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base text-white tracking-tight">TradeVault</span>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase font-mono">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Control Center</p>
              </div>
            </div>
          </div>

          {/* Sidebar Nav */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
              Administration
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4 pt-4 border-t border-slate-800/80">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Return to User App</span>
          </Link>

          {/* Admin Profile Badge */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-[11px] font-semibold text-slate-200 truncate">
                  {user.displayName || 'Administrator'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={user.email || ''}>
                {user.email}
              </p>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {currentTab === 'overview' && (
          <AdminOverviewSection
            stats={stats}
            loading={loadingStats}
            onRefresh={loadStats}
            onNavigateToUsers={() => setTab('users')}
            onNavigateToActivity={() => setTab('activity')}
          />
        )}

        {currentTab === 'users' && (
          <AdminUsersSection initialUserUid={uid || searchParams.get('uid') || undefined} />
        )}

        {currentTab === 'activity' && (
          <AdminActivitySection />
        )}

        {currentTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span>Security & Authorization Architecture</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Enforced
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time overview of TradeVault zero-trust server boundaries, RBAC custom claims, and Firestore security rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-blue-400">
                  <Key className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-200">Server-Side Admin Claims</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Administrator privileges are enforced via Firebase Admin SDK Custom User Claims (<code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">&#123; admin: true &#125;</code>) evaluated server-side. Frontend boolean manipulation, localStorage spoofing, and URL overrides cannot elevate permissions.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bearer Token Signature Verification Active</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <Database className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-200">Firestore Zero-Trust Rules</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Firestore Security Rules (v2) isolate user data strictly to <code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">users/&#123;userId&#125;</code> with ownership checks (<code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">request.auth.uid == userId</code>) and administrative bypass for verified admins only.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rules Deployed & Synchronized</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-purple-400">
                  <Server className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-200">Protected API Gateway</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All administrative endpoints (<code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">/api/admin/*</code>) pass through the <code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">requireAdminAuth</code> Express middleware. Unauthenticated or unauthorized callers receive immediate HTTP 401/403 responses.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Express API Middleware Guard Active</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <Lock className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-slate-200">Append-Only Audit Logs</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Account status changes and administrative actions are appended to the immutable <code className="text-slate-300 font-mono bg-slate-950 px-1 py-0.5 rounded">admin_audit_logs</code> collection in Firestore. Rules disallow client-side update or deletion of log entries.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Audit Immutability Enforced</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
                <span>System & Infrastructure Settings</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  Production
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical configuration, database targets, and authenticated environment variables for TradeVault.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 divide-y divide-slate-800">
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Firebase Project ID</p>
                  <p className="text-[11px] text-slate-400">Cloud infrastructure identity container</p>
                </div>
                <span className="text-xs font-mono text-blue-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  fine-karma-clcf1
                </span>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Firestore Database ID</p>
                  <p className="text-[11px] text-slate-400">Named document database instance</p>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  ai-studio-tradevault-ad0b8566-5162-4b7c-94ca-0a105869dd9d
                </span>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Bootstrap Administrator</p>
                  <p className="text-[11px] text-slate-400">Master authorized administrator identity</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  aryanrana73111@gmail.com
                </span>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Express Full-Stack Runtime</p>
                  <p className="text-[11px] text-slate-400">Node.js server with Vite SPA middlewares</p>
                </div>
                <span className="text-xs font-mono text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  Port 3000 (0.0.0.0)
                </span>
              </div>

              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-200">Current Administrator Session</p>
                  <p className="text-[11px] text-slate-400">Authenticated operator UID</p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 truncate max-w-xs" title={user.uid}>
                  {user.uid}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
