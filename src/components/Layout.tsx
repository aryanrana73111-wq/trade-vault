import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  BarChart2, 
  Target, 
  Brain, 
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Calculator,
  BookOpenCheck,
  Sparkles,
  Compass
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { dedupById } from '@/lib/utils';
import { PWAInstallButton } from './PWAInstallButton';
import { UserAvatar } from '@/components/UserAvatar';
import { OnboardingModal } from '@/components/OnboardingModal';

// Desktop Sidebar Navigation Items
const navItems = [
  { icon: Compass, label: 'Command Center', path: '/command-center' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics', hiddenMobile: true },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: Brain, label: 'Psychology', path: '/psychology' },
  { icon: Sparkles, label: 'AI & Labs', path: '/ai-labs' },
  { icon: BookOpenCheck, label: 'Learning & Rules', path: '/learning-rules' },
];

// Mobile Slidable Bottom Navigation Items (matches requested sections)
const mobileNavItems = [
  { icon: Compass, label: 'Command Center', path: '/command-center' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Sparkles, label: 'AI & Labs', path: '/ai-labs' },
  { icon: BookOpenCheck, label: 'Learning & Rules', path: '/learning-rules' },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: Brain, label: 'Psychology', path: '/psychology' },
  { icon: Calculator, label: 'Calculator', path: '/calculator' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout, activeDashboard, dashboards, setActiveDashboard } = useAuth();
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            TradeVault
          </div>
        </div>

        <div className="px-4 py-4 relative">
          <button 
            onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors group"
          >
            <div className="flex flex-col items-start text-left truncate">
              <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">Active Journal</span>
              <span className="text-sm font-semibold text-slate-900 truncate max-w-[150px]">{activeDashboard?.name || 'Select Dashboard'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
          </button>
          
          {showDashboardMenu && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto py-1">
                {dedupById(dashboards).map(d => (
                  <button 
                    key={d.id}
                    onClick={() => handleDashboardSwitch(d)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${d.id === activeDashboard?.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 mt-1">
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=dashboards'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50/50"
                >
                  <Plus className="w-4 h-4" /> Manage Dashboards
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 pb-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {/* User Profile Navigation Bar */}
          <button
            onClick={() => navigate('/settings?tab=profile')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors mb-2 text-left group"
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

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
          <div className="mb-2">
            <PWAInstallButton />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg tracking-tight">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          TradeVault
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative">
          <div className="md:hidden">
             <PWAInstallButton />
          </div>
          <button 
            onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium text-slate-700"
          >
            <span className="max-w-[80px] truncate">{activeDashboard?.name || 'Journal'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          
          <button 
            onClick={() => navigate('/settings?tab=profile')}
            className="p-0.5 rounded-full hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none"
            title="Open Profile"
            aria-label="Profile Settings"
          >
            <UserAvatar avatarUrl={profile?.avatarUrl} size="sm" />
          </button>

          <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900 p-1" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>

          {showDashboardMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto py-1">
                {dedupById(dashboards).map(d => (
                  <button 
                    key={d.id}
                    onClick={() => handleDashboardSwitch(d)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${d.id === activeDashboard?.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 mt-1">
                <button 
                  onClick={() => { setShowDashboardMenu(false); navigate('/settings?tab=dashboards'); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50/50"
                >
                  <Plus className="w-4 h-4" /> Manage
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slidable Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)] select-none pb-[env(safe-area-inset-bottom,0px)]">
        {/* Subtle Left Fade Gradient */}
        <div 
          className={`pointer-events-none absolute left-0 top-0 bottom-[env(safe-area-inset-bottom,0px)] w-6 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 transition-opacity duration-200 ${
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
            const isCurrentActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-active={isCurrentActive}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-shrink-0 min-w-[70px] h-[52px] px-2 py-1 rounded-xl transition-all duration-150 relative group ${
                    isActive
                      ? 'bg-blue-50/90 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
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
          className={`pointer-events-none absolute right-0 top-0 bottom-[env(safe-area-inset-bottom,0px)] w-6 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 transition-opacity duration-200 ${
            canScrollRight ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden pt-16 pb-24 md:pt-0 md:pb-0 relative z-10 bg-slate-50 dark:bg-slate-950">
        <div className="p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* New User Onboarding Modal */}
      <OnboardingModal />
    </div>
  );
}
