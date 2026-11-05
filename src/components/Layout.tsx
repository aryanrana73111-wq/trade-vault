import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  CandlestickChart, 
  Cpu, 
  Trophy, 
  Newspaper, 
  PlusCircle, 
  Calculator, 
  BookOpen, 
  Target, 
  BookOpenCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Zap,
  Users,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dedupById } from '@/lib/utils';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAvatar } from '@/components/UserAvatar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { MobileSlideOutDrawer } from '@/components/navigation/MobileSlideOutDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Desktop Sidebar Navigation Items
const navItems = [
  { icon: HomeIcon, label: 'Welcome Home', path: '/home' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CandlestickChart, label: 'Charts', path: '/charts' },
  { icon: Cpu, label: 'Command Center', path: '/command-center' },
  { icon: Trophy, label: 'Competition Arena', path: '/arena' },
  { icon: Newspaper, label: 'News Intelligence', path: '/news' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: BookOpenCheck, label: 'Learning & Rules', path: '/learning-rules' },
];

// Mobile Slidable Bottom Navigation Items (matches requested sections)
const mobileNavItems = [
  { icon: HomeIcon, label: 'Home', path: '/home' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CandlestickChart, label: 'Charts', path: '/charts' },
  { icon: Cpu, label: 'Command Center', path: '/command-center' },
  { icon: Trophy, label: 'Competition Arena', path: '/arena' },
  { icon: Newspaper, label: 'News', path: '/news' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: BookOpenCheck, label: 'Learning & Rules', path: '/learning-rules' },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, activeDashboard, dashboards, setActiveDashboard, isAdmin } = useAuth();
  const isOwnerAdmin = isAdmin || user?.email?.toLowerCase() === 'aryanrana73111@gmail.com';
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  
  // Tablet/Desktop collapsible sidebar state (default to compact on tablet screens)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('tradevault_sidebar_collapsed');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
    } catch {
      return false;
    }
  });

  // Mobile/Tablet navigation slide-out drawer
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Prevent background scrolling while mobile/tablet drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tradevault_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  // Mobile Bottom Navigation scroll state & refs
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleNavScroll = () => {
    if (!mobileNavRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = mobileNavRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    handleNavScroll();
    window.addEventListener('resize', handleNavScroll);
    return () => window.removeEventListener('resize', handleNavScroll);
  }, []);

  // Smoothly center the active item when navigating
  useEffect(() => {
    if (!mobileNavRef.current) return;
    const activeEl = mobileNavRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    const timer = setTimeout(handleNavScroll, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);


  const handleDashboardSwitch = (d: any) => {
    setActiveDashboard(d);
    setShowDashboardMenu(false);
  };

  return (
    <div className="flex h-screen h-[100dvh] min-h-[100dvh] bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Subtle ambient light refractions behind glass surfaces */}
      <div className="fixed -top-10 -left-10 w-[500px] h-[500px] rounded-full bg-blue-600/[0.08] dark:bg-blue-600/[0.12] blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-0 -left-10 w-[450px] h-[450px] rounded-full bg-indigo-600/[0.06] dark:bg-indigo-600/[0.10] blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/[0.035] dark:bg-blue-500/[0.06] blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.025] dark:bg-indigo-500/[0.05] blur-[150px] pointer-events-none z-0" />

      {/* Desktop Sidebar (Collapsible with Full Transparent Glass styling) */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 border-r border-slate-200/30 dark:border-white/[0.08] bg-white/10 dark:bg-black/20 backdrop-blur-xl flex-col z-20 transition-all duration-200`}>
        <div 
          className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'} border-b border-slate-200/30 dark:border-white/[0.08] bg-transparent`}
        >
          {!isSidebarCollapsed ? (
            <>
              <Link to="/home" className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400 font-bold text-lg tracking-tight overflow-hidden hover:opacity-90 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="tracking-tight font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">TradeVault</span>
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-white/[0.08] transition-all cursor-pointer group"
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/40 dark:hover:bg-white/[0.08] transition-all cursor-pointer group"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Active Journal dropdown */}
        <div 
          className={`py-3 relative ${isSidebarCollapsed ? 'px-2' : 'px-4'} bg-transparent`}
        >
          <button 
            onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} bg-white/20 dark:bg-white/[0.06] backdrop-blur-md border border-slate-200/40 dark:border-white/[0.08] rounded-xl hover:border-blue-400/50 hover:bg-white/30 dark:hover:bg-white/[0.12] transition-all group shadow-2xs`}
            title={activeDashboard?.name || 'Active Journal'}
          >
            {isSidebarCollapsed ? (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                {(activeDashboard?.name || 'J').slice(0, 2)}
              </span>
            ) : (
              <>
                <div className="flex flex-col items-start text-left truncate">
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Active Journal</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[140px]">{activeDashboard?.name || 'Select Dashboard'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-transform" />
              </>
            )}
          </button>
          
          {showDashboardMenu && (
            <div className={`absolute top-full ${isSidebarCollapsed ? 'left-2 w-52' : 'left-4 right-4'} mt-1.5 glass-dropdown rounded-2xl shadow-xl py-1 z-50 overflow-hidden border border-slate-200/80 dark:border-white/[0.1]`}>
              <div className="max-h-48 overflow-y-auto py-1">
                {dedupById(dashboards).map(d => (
                  <button 
                    key={d.id}
                    onClick={() => handleDashboardSwitch(d)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${d.id === activeDashboard?.id ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-200/60 dark:border-white/[0.08] mt-1 space-y-0.5">
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=accounts'); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>MT5 Accounts</span>
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Auto-Sync
                  </span>
                </button>
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=dashboards'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Manage Dashboards
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav 
          className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-3'} pb-4 space-y-1 overflow-y-auto bg-transparent`}
        >
          {navItems.map((item) => {
            const isItemActive = (item.path === '/' || item.path === '/dashboard')
              ? (location.pathname === '/' || location.pathname === '/dashboard')
              : (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.label : undefined}
                className={() =>
                  `flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                    isItemActive
                      ? 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/30 shadow-2xs backdrop-blur-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/20 dark:hover:bg-white/[0.06] hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div 
          className={`p-3 border-t border-slate-200/30 dark:border-white/[0.08] space-y-1.5 bg-transparent`}
        >
          {isSidebarCollapsed ? (
            <button
              onClick={() => navigate('/settings?tab=profile')}
              className="w-full flex justify-center p-1.5 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/[0.06] transition-colors"
              title={profile?.fullName || 'Profile Settings'}
            >
              <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/settings?tab=profile')}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/[0.06] cursor-pointer transition-colors text-left group"
              title="Profile & Settings"
            >
              <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Trader'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {profile?.tradingStyle || 'Trading Profile'}
                </p>
              </div>
            </button>
          )}

          <NavLink
            to="/settings"
            title={isSidebarCollapsed ? 'Settings' : undefined}
            className={({ isActive }) =>
              `flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 shadow-2xs backdrop-blur-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Owner Admin Navigation — strictly hidden for normal users */}
          {isOwnerAdmin && (
            <div className="pt-2 mt-1 border-t border-slate-200/50 dark:border-white/[0.06] space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 font-mono">
                    Admin
                  </span>
                  <span className="text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-1 py-0.5 rounded font-mono">
                    Owner
                  </span>
                </div>
              )}

              <NavLink
                to="/admin/users"
                title={isSidebarCollapsed ? "Users (Admin)" : undefined}
                className={({ isActive }) =>
                  `flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 shadow-2xs backdrop-blur-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <Users className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                {!isSidebarCollapsed && <span>Users</span>}
              </NavLink>

              <NavLink
                to="/admin?tab=activity"
                title={isSidebarCollapsed ? "Activity (Admin)" : undefined}
                className={({ isActive }) =>
                  `flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20 shadow-2xs backdrop-blur-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <Activity className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                {!isSidebarCollapsed && <span>Activity</span>}
              </NavLink>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="mb-1">
              <PWAInstallButton />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile/Tablet Top Header (Full Transparent Glass) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/10 dark:bg-black/20 backdrop-blur-md border-b border-slate-200/20 dark:border-white/[0.06] z-30 flex items-center justify-between px-3 sm:px-4 gap-2 transition-colors">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile/Tablet Drawer Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(prev => !prev)}
            className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-white/[0.08] focus:outline-none shrink-0 cursor-pointer transition-colors"
            aria-label={isMobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileDrawerOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg tracking-tight shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-xs shadow-blue-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>TradeVault</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 relative shrink-0">
          <div className="hidden sm:block">
             <PWAInstallButton />
          </div>
          <button 
            onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            className="flex items-center gap-1 bg-white/20 dark:bg-white/[0.08] hover:bg-white/30 dark:hover:bg-white/[0.14] backdrop-blur-md border border-slate-200/40 dark:border-white/[0.12] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[105px] sm:max-w-[140px] shadow-2xs transition-all cursor-pointer"
            title="Switch Trading Account"
          >
            <span className="truncate">{activeDashboard?.name || 'Journal'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
          </button>
          
          <button 
            onClick={() => navigate('/settings?tab=profile')}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none shrink-0 cursor-pointer"
            title="Open Profile"
            aria-label="Profile Settings"
          >
            <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
          </button>

          {showDashboardMenu && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-white/95 dark:bg-black/95 backdrop-blur-2xl rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden border border-slate-200/80 dark:border-white/[0.14]">
              <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-white/[0.08]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Trading Accounts
                </span>
              </div>
              <div className="max-h-52 overflow-y-auto py-1">
                {dedupById(dashboards).map(d => (
                  <button 
                    key={d.id}
                    onClick={() => { setActiveDashboard(d); setShowDashboardMenu(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                      d.id === activeDashboard?.id
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold border-l-2 border-blue-500'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="truncate">{d.name}</span>
                    {d.id === activeDashboard?.id && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono shrink-0">Active</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-white/[0.08] pt-1">
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=dashboards'); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Manage Accounts & Dashboards
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile/Tablet Slide-Over Navigation Drawer (ChatGPT-inspired hierarchical drawer) */}
      <MobileSlideOutDrawer 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
      />

      {/* Mobile Slidable Bottom Navigation (Full Transparent Glass) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/10 dark:bg-black/20 backdrop-blur-md border-t border-slate-200/20 dark:border-white/[0.06] select-none pb-[env(safe-area-inset-bottom,0px)]">
        {/* Slidable Nav Track */}
        <nav
          ref={mobileNavRef}
          onScroll={handleNavScroll}
          className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full touch-pan-x bg-transparent h-[54px]"
          style={{ WebkitOverflowScrolling: 'touch', height: '54px' }}
          aria-label="Mobile Navigation"
        >
          {mobileNavItems.map((item) => {
            const isCurrentActive = (item.path === '/' || item.path === '/dashboard')
              ? (location.pathname === '/' || location.pathname === '/dashboard')
              : (location.pathname === item.path || location.pathname.startsWith(item.path + '/'));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-active={isCurrentActive}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-shrink-0 min-w-[70px] h-[48px] px-2 py-1 rounded-xl transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs border border-blue-500/30 backdrop-blur-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/10 dark:hover:bg-white/[0.06]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-105 stroke-[2.2]' : 'stroke-[1.75]'}`} />
                    <span className={`text-[11px] leading-tight tracking-tight whitespace-nowrap mt-1 ${isActive ? 'font-semibold text-blue-600 dark:text-blue-400' : 'font-medium'}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="absolute bottom-1 w-3 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area (Full scrollable on mobile with hidden scrollbar line) */}
      <main 
        className="flex-1 flex flex-col min-w-0 overflow-y-auto no-scrollbar pt-16 pb-36 sm:pb-32 md:pb-12 lg:pb-8 relative bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 transition-colors duration-200 overscroll-y-contain main-mobile-clearance"
        style={{ 
          WebkitOverflowScrolling: 'touch',
          scrollPaddingTop: '4.5rem',
          scrollPaddingBottom: 'calc(var(--mobile-bottom-nav-height) + env(safe-area-inset-bottom, 0px) + 2.5rem)'
        }}
      >
        <div 
          className="p-3 sm:p-6 md:p-8 w-full max-w-7xl mx-auto min-w-0 bg-transparent dark:bg-[#020202] rounded-2xl min-h-[calc(100dvh-4rem)] pb-12 transition-colors duration-200"
        >
          <ErrorBoundary fallbackTitle="Section View Recovery">
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* New User Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
}
