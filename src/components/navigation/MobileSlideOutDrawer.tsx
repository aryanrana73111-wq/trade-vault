import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Pin, 
  Clock, 
  Settings, 
  LogOut, 
  ExternalLink,
  Sparkles,
  Check,
  Star
} from 'lucide-react';
import { NAVIGATION_CONFIG, NavSection, NavChildItem, getFlattenedNavItems, FlatNavItem } from '@/config/navigationConfig';
import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar } from '@/components/UserAvatar';
import { PWAInstallButton } from '@/components/PWAInstallButton';

interface MobileSlideOutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_ROUTES_KEY = 'tradevault_nav_recent_routes';
const PINNED_ROUTES_KEY = 'tradevault_nav_pinned_routes';

const DEFAULT_PINNED_PATHS = [
  '/news?tab=calendar',
  '/calculator',
  '/ai-labs?tab=patterns',
  '/journal'
];

export const MobileSlideOutDrawer: React.FC<MobileSlideOutDrawerProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, activeDashboard, dashboards, setActiveDashboard } = useAuth();

  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Collapsed / Expanded state of sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Recent & Pinned storage state
  const [recentRoutes, setRecentRoutes] = useState<{ label: string; path: string; sectionLabel: string }[]>([]);
  const [pinnedPaths, setPinnedPaths] = useState<string[]>(DEFAULT_PINNED_PATHS);

  // Flattened items for fast searching
  const allItems = useMemo(() => getFlattenedNavItems(), []);

  // Load pinned and recent on mount
  useEffect(() => {
    try {
      const savedPinned = localStorage.getItem(PINNED_ROUTES_KEY);
      if (savedPinned) {
        setPinnedPaths(JSON.parse(savedPinned));
      }
      const savedRecent = localStorage.getItem(RECENT_ROUTES_KEY);
      if (savedRecent) {
        setRecentRoutes(JSON.parse(savedRecent));
      }
    } catch {
      // ignore
    }
  }, []);

  // Track recent visited routes
  useEffect(() => {
    const currentFull = location.pathname + (location.search || '');
    const matchedItem = allItems.find(item => item.path === currentFull) ||
      allItems.find(item => item.path === location.pathname);

    if (matchedItem) {
      setRecentRoutes(prev => {
        const filtered = prev.filter(r => r.path !== matchedItem.path);
        const updated = [
          { label: matchedItem.label, path: matchedItem.path, sectionLabel: matchedItem.sectionLabel },
          ...filtered
        ].slice(0, 5);
        try {
          localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [location.pathname, location.search, allItems]);

  // Determine current active section to auto-expand
  const currentPathWithSearch = location.pathname + (location.search || '');

  useEffect(() => {
    if (!isOpen) return;

    // Find which section holds the current active item
    for (const section of NAVIGATION_CONFIG) {
      const hasDirectChild = section.children?.some(c => 
        c.path === currentPathWithSearch || 
        c.path === location.pathname ||
        (c.path.includes('?') && currentPathWithSearch.startsWith(c.path.split('&')[0]))
      );
      const isSectionRoute = section.path === location.pathname || 
        (section.path !== '/' && location.pathname.startsWith(section.path));

      if (hasDirectChild || isSectionRoute) {
        setExpandedSections(prev => ({ ...prev, [section.id]: true }));
      }
    }
  }, [isOpen, location.pathname, location.search, currentPathWithSearch]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Touch handlers for swipe-left to dismiss drawer
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = Math.abs(e.touches[0].clientY - touchStartYRef.current);
    if (diffX < -50 && diffY < 60) {
      onClose();
      touchStartXRef.current = null;
      touchStartYRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const togglePin = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPinnedPaths(prev => {
      const updated = prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path];
      try {
        localStorage.setItem(PINNED_ROUTES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.trim().toLowerCase();

    return allItems.filter(item => {
      if (item.label.toLowerCase().includes(query)) return true;
      if (item.sectionLabel.toLowerCase().includes(query)) return true;
      if (item.description && item.description.toLowerCase().includes(query)) return true;
      if (item.keywords?.some(k => k.includes(query))) return true;
      return false;
    });
  }, [searchQuery, allItems]);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Check if a path is currently active
  const isItemActive = (targetPath: string) => {
    if (targetPath.includes('?')) {
      return currentPathWithSearch === targetPath;
    }
    return location.pathname === targetPath;
  };

  const isSectionActive = (section: NavSection) => {
    if (location.pathname === section.path && (!location.search || section.path.includes('?'))) {
      return true;
    }
    if (section.path !== '/' && location.pathname.startsWith(section.path)) {
      return true;
    }
    return false;
  };

  // Pinned items mapped to data
  const pinnedNavItems = useMemo(() => {
    return pinnedPaths
      .map(path => allItems.find(item => item.path === path))
      .filter((item): item is FlatNavItem => Boolean(item));
  }, [pinnedPaths, allItems]);

  return (
    <div 
      className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Application Navigation"
    >
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Slide-out Drawer Panel */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex flex-col w-[85vw] max-w-[340px] sm:max-w-[380px] h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 overflow-hidden transform transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">TradeVault</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">Pro</span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {activeDashboard?.name || 'Trading Journal'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Navigation Search */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search TradeVault navigation..."
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Content Area (Only drawer content scrolls) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 space-y-4 no-scrollbar">
          
          {/* SEARCH RESULTS VIEW */}
          {searchResults !== null ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>Search Results</span>
                <span>{searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-slate-600 dark:text-slate-400">No navigation destinations found</p>
                  <p className="mt-0.5 text-[11px]">Try searching for "calendar", "risk", "journal", or "drawdown"</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((item) => {
                    const active = isItemActive(item.path);
                    const isPinned = pinnedPaths.includes(item.path);

                    return (
                      <div
                        key={item.id + item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          active 
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.label}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                              {item.sectionLabel} {item.description ? `• ${item.description}` : ''}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => togglePin(item.path, e)}
                          className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                            isPinned ? 'opacity-100 text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                          }`}
                          title={isPinned ? 'Unpin destination' : 'Pin to favorites'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* PINNED / FAVORITE DESTINATIONS */}
              {pinnedNavItems.length > 0 && (
                <div className="space-y-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/70">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                      Pinned Shortcuts
                    </span>
                    <span className="text-[10px] lowercase text-slate-400">{pinnedNavItems.length} pinned</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {pinnedNavItems.map(item => {
                      const active = isItemActive(item.path);
                      return (
                        <button
                          key={'pinned-' + item.path}
                          type="button"
                          onClick={() => handleNavigate(item.path)}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors border ${
                            active
                              ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <item.icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                          <span className="truncate text-[11px]">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RECENT VISITS */}
              {recentRoutes.length > 0 && (
                <div className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800/70">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Recent
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setRecentRoutes([]);
                        try { localStorage.removeItem(RECENT_ROUTES_KEY); } catch {}
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline"
                    >
                      clear
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {recentRoutes.map(item => (
                      <button
                        key={'recent-' + item.path}
                        type="button"
                        onClick={() => handleNavigate(item.path)}
                        className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* HIERARCHICAL SECTIONS NAVIGATION (LEVEL 1 -> LEVEL 2) */}
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Application Architecture
                </div>

                {NAVIGATION_CONFIG.map((section) => {
                  const isExpanded = !!expandedSections[section.id];
                  const hasChildren = section.children && section.children.length > 0;
                  const active = isSectionActive(section);

                  return (
                    <div key={section.id} className="rounded-xl overflow-hidden">
                      {/* Section Row */}
                      <div
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                          active 
                            ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        {/* Section Label & Icon */}
                        <div 
                          className="flex items-center gap-3 min-w-0 flex-1"
                          onClick={() => {
                            if (hasChildren) {
                              toggleSection(section.id);
                            } else {
                              handleNavigate(section.path);
                            }
                          }}
                        >
                          <section.icon className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                            active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                          }`} />
                          <span className="text-xs sm:text-sm font-medium tracking-tight truncate">
                            {section.label}
                          </span>
                          {section.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                              {section.badge}
                            </span>
                          )}
                        </div>

                        {/* Expand / Direct Navigation Controls */}
                        {hasChildren ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate(section.path);
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors"
                              title={`Go to ${section.label}`}
                              aria-label={`Go to ${section.label}`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSection(section.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-transform"
                              aria-label={isExpanded ? `Collapse ${section.label}` : `Expand ${section.label}`}
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} />
                            </button>
                          </div>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                        )}
                      </div>

                      {/* Sub-sections / Children View (Level 2) */}
                      {hasChildren && isExpanded && (
                        <div className="ml-5 pl-2.5 my-1 border-l-2 border-slate-100 dark:border-slate-800 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          {section.children!.map((child) => {
                            const childActive = isItemActive(child.path);
                            const isPinned = pinnedPaths.includes(child.path);

                            return (
                              <div
                                key={child.id}
                                onClick={() => handleNavigate(child.path)}
                                className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                                  childActive
                                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {child.icon ? (
                                    <child.icon className={`w-3.5 h-3.5 shrink-0 ${childActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                  ) : (
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${childActive ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                  )}
                                  <span className="truncate">{child.label}</span>
                                  {child.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                                      {child.badge}
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => togglePin(child.path, e)}
                                  className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
                                    isPinned ? 'opacity-100 text-amber-500' : 'text-slate-300 hover:text-slate-500'
                                  }`}
                                  title={isPinned ? 'Unpin' : 'Pin shortcut'}
                                >
                                  <Pin className={`w-3 h-3 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer (Profile, Settings, Sign Out) */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/70 dark:bg-slate-900/90 backdrop-blur-md space-y-2">
          {/* User profile banner */}
          <div 
            onClick={() => handleNavigate('/settings?tab=profile')}
            className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs cursor-pointer hover:border-blue-300 transition-all"
          >
            <UserAvatar avatarUrl={profile?.avatarUrl} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                {profile?.fullName || user?.displayName || 'Trader'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {profile?.tradingStyle || user?.email || 'Active Account'}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-2xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

          <div className="pt-1">
            <PWAInstallButton />
          </div>
        </div>
      </div>
    </div>
  );
};
