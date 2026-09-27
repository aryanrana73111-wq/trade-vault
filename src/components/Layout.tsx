import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  BarChart2, 
  Target, 
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Calculator,
  BookOpenCheck,
  Compass,
  Newspaper,
  Swords,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Users,
  Activity,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dedupById } from '@/lib/utils';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAvatar } from '@/components/UserAvatar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { MobileSlideOutDrawer } from '@/components/navigation/MobileSlideOutDrawer';

// Desktop Sidebar Navigation Items
const navItems = [
  { icon: HomeIcon, label: 'Welcome Home', path: '/home' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Compass, label: 'Command Center', path: '/command-center' },
  { icon: Swords, label: 'Competition Arena', path: '/arena' },
  { icon: Newspaper, label: 'News Intelligence', path: '/news' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics', hiddenMobile: true },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: BookOpenCheck, label: 'Learning & Rules', path: '/learning-rules' },
];

// Mobile Slidable Bottom Navigation Items (matches requested sections)
const mobileNavItems = [
  { icon: HomeIcon, label: 'Home', path: '/home' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Compass, label: 'Command Center', path: '/command-center' },
  { icon: Swords, label: 'Competition Arena', path: '/arena' },
  { icon: Newspaper, label: 'News', path: '/news' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: BookOpenCheck, label: 'Learning & Rules', path: '/learning-rules' },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout, activeDashboard, dashboards, setActiveDashboard, isAdmin } = useAuth();
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDashboardSwitch = (d: any) => {
    setActiveDashboard(d);
    setShowDashboardMenu(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Subtle ambient light refractions behind glass surfaces */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/[0.035] dark:bg-blue-500/[0.04] blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] rounded-full bg-indigo-500/[0.025] dark:bg-indigo-500/[0.03] blur-[150px] pointer-events-none z-0" />

      {/* Desktop Sidebar (Collapsible with Glassmorphic styling) */}
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl flex-col z-20 transition-all duration-200 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_32px_0_rgba(0,0,0,0.35)]`}>
        <div className={`h-16 flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-between px-6'} border-b border-slate-200/60 dark:border-white/[0.06]`}>
          <Link to="/home" className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl tracking-tight overflow-hidden hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            {!isSidebarCollapsed && <span className="tracking-tight">TradeVault</span>}
          </Link>
          {!isSidebarCollapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Active Journal dropdown */}
        <div className={`py-3 relative ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}>
          <button 
            onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} bg-slate-100/70 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] rounded-xl hover:border-blue-400/60 hover:bg-slate-100/90 dark:hover:bg-slate-800/70 transition-all group shadow-2xs`}
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
              <div className="border-t border-slate-200/60 dark:border-white/[0.08] mt-1">
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=dashboards'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50/50 dark:hover:bg-blue-950/40"
                >
                  <Plus className="w-4 h-4" /> Manage Dashboards
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-2' : 'px-3'} pb-4 space-y-1 overflow-y-auto`}>
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
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-500/20 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
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
        <div className={`p-3 border-t border-slate-200/60 dark:border-white/[0.08] space-y-1.5`}>
          {isSidebarCollapsed ? (
            <button
              onClick={() => navigate('/settings?tab=profile')}
              className="w-full flex justify-center p-1.5 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors"
              title={profile?.fullName || 'Profile Settings'}
            >
              <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/settings?tab=profile')}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-white/[0.06] cursor-pointer transition-colors text-left group"
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
                  ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-500/20 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Owner Admin Navigation — strictly hidden for normal users */}
          {isOwnerAdmin && (
            <div className="pt-2 mt-1 border-t border-slate-200/60 dark:border-white/[0.08] space-y-1">
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
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-500/20 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
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
                      ? 'bg-blue-50/90 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-500/20 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
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

          <button
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Logout' : undefined}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-400 transition-colors cursor-pointer`}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>

          {/* Collapse/Expand Toggle Button at Bottom of Sidebar */}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2'} rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-colors border-t border-slate-200/60 dark:border-white/[0.06] pt-2`}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile/Tablet Top Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] z-30 flex items-center justify-between px-3 sm:px-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile/Tablet Drawer Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(prev => !prev)}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] focus:outline-none shrink-0 cursor-pointer"
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
            className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] px-2.5 py-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 max-w-[95px] sm:max-w-[130px] shadow-2xs"
          >
            <span className="truncate">{activeDashboard?.name || 'Journal'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
          </button>
          
          <button 
            onClick={() => navigate('/settings?tab=profile')}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none shrink-0"
            title="Open Profile"
            aria-label="Profile Settings"
          >
            <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
          </button>

          <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 p-1 shrink-0" title="Logout">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {showDashboardMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 glass-dropdown rounded-2xl shadow-xl py-1 z-50 overflow-hidden border border-slate-200/80 dark:border-white/[0.1]">
              <div className="max-h-48 overflow-y-auto py-1">
                {dedupById(dashboards).map(d => (
                  <button 
                    key={d.id}
                    onClick={() => { setActiveDashboard(d); setShowDashboardMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      d.id === activeDashboard?.id
                        ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-200/60 dark:border-white/[0.08] mt-1">
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=dashboards'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50/50 dark:hover:bg-blue-950/30"
                >
                  <Plus className="w-4 h-4" /> Manage
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

      {/* Mobile Slidable Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/[0.08] shadow-[0_-4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.45)] select-none pb-[env(safe-area-inset-bottom,0px)]">
        {/* Subtle Left Fade Gradient */}
        <div 
          className={`pointer-events-none absolute left-0 top-0 bottom-[env(safe-area-inset-bottom,0px)] w-6 bg-gradient-to-r from-white/90 dark:from-slate-900/90 to-transparent z-10 transition-opacity duration-200 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          }`} 
        />

        {/* Slidable Nav Track */}
        <nav
          ref={mobileNavRef}
          onScroll={handleNavScroll}
          className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar scroll-smooth w-full touch-pan-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
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
                  `flex flex-col items-center justify-center flex-shrink-0 min-w-[70px] h-[52px] px-2 py-1 rounded-xl transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-blue-50/90 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs border border-blue-200/60 dark:border-blue-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/[0.04]'
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

        {/* Subtle Right Fade Gradient */}
        <div 
          className={`pointer-events-none absolute right-0 top-0 bottom-[env(safe-area-inset-bottom,0px)] w-6 bg-gradient-to-l from-white/90 dark:from-slate-900/90 to-transparent z-10 transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-16 pb-24 md:pb-6 lg:pt-0 lg:pb-0 relative z-10 bg-transparent">
        <div className="p-3 sm:p-6 md:p-8 w-full max-w-7xl mx-auto min-w-0 relative z-10">
          <Outlet />
        </div>
      </main>

      {/* New User Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
}
