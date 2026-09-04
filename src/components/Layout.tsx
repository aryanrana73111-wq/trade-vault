import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PlusCircle, label: 'Add Trade', path: '/add' },
  { icon: BookOpen, label: 'Journal', path: '/journal' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics', hiddenMobile: true },
  { icon: Target, label: 'Strategies', path: '/strategies' },
  { icon: Brain, label: 'Psychology', path: '/psychology' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout, activeDashboard, dashboards, setActiveDashboard } = useAuth();
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDashboardSwitch = (d: any) => {
    setActiveDashboard(d);
    setShowDashboardMenu(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-slate-200 bg-white flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
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
                {dashboards.map(d => (
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
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-lg tracking-tight">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          TradeVault
        </div>

        <div className="flex items-center gap-3 relative">
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
          
          <button onClick={handleLogout} className="text-slate-500 hover:text-slate-900">
            <LogOut className="w-5 h-5" />
          </button>

          {showDashboardMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-1 z-50 overflow-hidden">
              <div className="max-h-48 overflow-y-auto py-1">
                {dashboards.map(d => (
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-30 flex items-center justify-around px-2 pb-safe">
        {navItems.filter(item => !item.hiddenMobile).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto pt-16 pb-20 md:pt-0 md:pb-0 relative z-10">
        <div className="p-4 sm:p-6 md:p-8 w-full max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
