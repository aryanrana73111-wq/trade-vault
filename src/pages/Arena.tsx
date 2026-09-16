import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useArena } from '@/contexts/ArenaContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Swords,
  Plus,
  Users,
  Trophy,
  ChevronRight,
  ChevronLeft,
  Activity,
  ArrowRight,
  X,
  UserPlus,
  Target,
  Shield,
  Search,
  Filter,
  Flame,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  TrendingUp,
  BarChart2,
  Copy,
  Check,
  Award,
  Layers,
  Flag,
  FileDown,
  Pencil,
  LayoutGrid,
  List,
  MoveHorizontal,
  Trash2,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { joinCompetition, endCompetition, deleteCompetition, overrideParticipantDisqualification } from '@/lib/arenaService';
import { Arena, CompetitionTrade, ArenaMember } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import { CreateCompetitionModal } from '@/components/arena/CreateCompetitionModal';
import { AddCompetitionTradeModal } from '@/components/arena/AddCompetitionTradeModal';
import { CompetitionRulesModal } from '@/components/arena/CompetitionRulesModal';
import { CompetitionRulesView } from '@/components/arena/CompetitionRulesView';
import { MiniChallengeModal } from '@/components/arena/MiniChallengeModal';
import { CompareTradersModal } from '@/components/arena/CompareTradersModal';
import { TradeDetailModal } from '@/components/arena/TradeDetailModal';
import { EditCompetitionTradeModal } from '@/components/arena/EditCompetitionTradeModal';
import { CompetitionAiAnalyst } from '@/components/arena/CompetitionAiAnalyst';
import { TraderDetailModal } from '@/components/arena/TraderDetailModal';
import { CompetitionFilterModal, CompetitionFilterState } from '@/components/arena/CompetitionFilterModal';
import { CompetitionResponsiveCharts } from '@/components/arena/CompetitionResponsiveCharts';

export default function ArenaPage() {
  const { arenas, loading } = useArena();
  const { user } = useAuth();

  // Navigation & Modals
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const validStatuses = ['all', 'active', 'upcoming', 'completed'] as const;
  type StatusFilterType = typeof validStatuses[number];
  const urlStatus = searchParams.get('status') as StatusFilterType | null;
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>(
    urlStatus && validStatuses.includes(urlStatus) ? urlStatus : 'active'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'carousel'>('grid');

  // Scroll state & handlers for horizontal filter tabs (Mobile & Desktop)
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkScrollability, arenas.length, statusFilter]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const el = tabsContainerRef.current;
    if (!el) return;
    const distance = 200;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
    setTimeout(checkScrollability, 300);
  };

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > 0) {
      el.scrollLeft += e.deltaY;
      checkScrollability();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tabsContainerRef.current;
    if (!el) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const el = tabsContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current);
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  useEffect(() => {
    const s = searchParams.get('status') as StatusFilterType | null;
    if (s && validStatuses.includes(s)) {
      setStatusFilter(s);
    }
  }, [searchParams]);

  const handleStatusFilterChange = (s: StatusFilterType) => {
    setStatusFilter(s);
    setSearchParams({ status: s });
  };

  const selectedArena = useMemo(() => {
    return arenas.find(a => a.id === selectedArenaId) || null;
  }, [arenas, selectedArenaId]);

  // Filtered arena list
  const filteredArenas = useMemo(() => {
    return arenas.filter(a => {
      const isLive = a.status === 'active' || (!a.status && (a as any).isLive !== false);
      const isCompleted = a.status === 'completed' || (a.endDate && a.endDate < Date.now());
      const isUpcoming = a.status === 'upcoming' || (a.startDate && a.startDate > Date.now());

      if (statusFilter === 'active') return isLive && !isCompleted;
      if (statusFilter === 'completed') return isCompleted;
      if (statusFilter === 'upcoming') return isUpcoming;
      return true;
    });
  }, [arenas, statusFilter]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center text-slate-500">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <p className="text-sm font-medium">Synchronizing Competition Arena data...</p>
      </div>
    );
  }

  // Active Arena Dashboard view
  if (selectedArena) {
    return (
      <ArenaDashboard
        arena={selectedArena}
        onBack={() => setSelectedArenaId(null)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 flex-wrap">
                Competition Arena
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                  2.0 Live
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                Private group trading competitions, multi-metric leaderboards & accountability
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <Button
            onClick={() => setIsJoinOpen(true)}
            variant="outline"
            className="h-10 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-2 whitespace-nowrap shrink-0 transition-all active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="whitespace-nowrap">Join via Code</span>
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-500/25 flex items-center gap-2 whitespace-nowrap shrink-0 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Create Competition</span>
          </Button>
        </div>
      </div>

      {/* Arena Status Filter & View Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 min-w-0">
        {/* Horizontal Status Filter Tabs with Touch, Drag, Wheel & Arrow Navigation */}
        <div className="relative min-w-0 flex-1 flex items-center">
          {/* Left Arrow Button with Fade Gradient */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center bg-gradient-to-r from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 pr-3">
              <button
                type="button"
                onClick={() => scrollTabs('left')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90 cursor-pointer"
                title="Scroll left"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Scrollable Tabs Track */}
          <div
            ref={tabsContainerRef}
            onScroll={checkScrollability}
            onWheel={handleTabsWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar touch-pan-x overscroll-x-contain scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0 py-0.5 w-full cursor-grab active:cursor-grabbing select-none"
          >
            {[
              { key: 'active', label: 'Live Competitions', count: arenas.filter(a => a.status === 'active' || !a.status).length },
              { key: 'upcoming', label: 'Upcoming', count: arenas.filter(a => a.status === 'upcoming').length },
              { key: 'completed', label: 'Completed', count: arenas.filter(a => a.status === 'completed').length },
              { key: 'all', label: 'All Arenas', count: arenas.length }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={(e) => {
                  if (hasDraggedRef.current) {
                    e.preventDefault();
                    return;
                  }
                  handleStatusFilterChange(tab.key as any);
                }}
                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer select-none ${
                  statusFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Right Arrow Button with Fade Gradient */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center bg-gradient-to-l from-slate-50 via-slate-50/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 pl-3">
              <button
                type="button"
                onClick={() => scrollTabs('right')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90 cursor-pointer"
                title="Scroll right"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* View Mode Switcher for Mobile & Desktop */}
        {filteredArenas.length > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0 min-w-0">
            <span className="text-[11px] font-medium sm:hidden">
              {filteredArenas.length} {filteredArenas.length === 1 ? 'competition' : 'competitions'}
            </span>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/60 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Cards Grid View"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Compact List View (Fast Mobile Scrolling)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                title="Swipe Carousel View"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'carousel'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <MoveHorizontal className="w-3.5 h-3.5" />
                <span>Swipe</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Arena Competitions Content Area */}
      {filteredArenas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
            No Competitions in this view
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
            Compete, compare, and learn with invited trading peers in an evidence-based accountability environment.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setIsCreateOpen(true)} className="bg-indigo-600 text-white">
              <Plus className="w-4 h-4 mr-1.5" />
              Create Competition
            </Button>
            <Button onClick={() => setIsJoinOpen(true)} variant="outline">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Join with Code
            </Button>
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* COMPACT LIST VIEW: Optimized for fast, effortless mobile scrolling */
        <div className="space-y-2.5 sm:space-y-3 touch-pan-y">
          {filteredArenas.map((arena) => {
            const memberCount = Object.keys(arena.members || {}).length;
            const daysLeft = Math.max(0, Math.ceil((arena.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
            const isCompleted = arena.status === 'completed' || arena.endDate < Date.now();
            const sortedMembers = Object.values(arena.members || {}).sort(
              (a, b) => (b.stats?.score || 0) - (a.stats?.score || 0)
            );
            const leader = sortedMembers[0];

            return (
              <div
                key={arena.id}
                onClick={() => setSelectedArenaId(arena.id)}
                className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {arena.name}
                      </h3>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                        isCompleted
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {isCompleted ? 'Ended' : 'Live'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 truncate mt-0.5">
                      <span className="flex items-center gap-1 shrink-0">
                        <Users className="w-3 h-3" /> {memberCount} {memberCount === 1 ? 'trader' : 'traders'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{arena.scoringMode || arena.competitionMode || 'Total R'}</span>
                      <span>•</span>
                      <span className="shrink-0">{isCompleted ? 'Finished' : `${daysLeft}d left`}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 shrink-0">
                  {leader && leader.stats && (
                    <div className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="text-slate-500 text-[11px] shrink-0">Leader:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate max-w-[85px]">
                        {leader.displayName || 'Trader'}
                      </span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] shrink-0">
                        {leader.stats.totalR > 0 ? `+${leader.stats.totalR}R` : `${leader.stats.totalR}R`}
                      </span>
                    </div>
                  )}
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Enter <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'carousel' ? (
        /* HORIZONTAL SWIPE CAROUSEL: Fluid horizontal scrolling with snap points */
        <div className="relative">
          <div className="flex gap-3.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory touch-pan-x pb-4 pt-1 overscroll-x-contain scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            {filteredArenas.map((arena) => {
              const memberCount = Object.keys(arena.members || {}).length;
              const daysLeft = Math.max(0, Math.ceil((arena.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
              const isCompleted = arena.status === 'completed' || arena.endDate < Date.now();
              const sortedMembers = Object.values(arena.members || {}).sort(
                (a, b) => (b.stats?.score || 0) - (a.stats?.score || 0)
              );
              const leader = sortedMembers[0];

              return (
                <div
                  key={arena.id}
                  onClick={() => setSelectedArenaId(arena.id)}
                  className="snap-start w-[84vw] max-w-[340px] sm:max-w-[380px] shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between overflow-hidden active:scale-[0.99]"
                >
                  <div className="min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-2.5 sm:mb-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {arena.name}
                          </h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                            <span className="flex items-center gap-1 shrink-0">
                              <Users className="w-3 h-3" /> {memberCount}
                            </span>
                            <span>•</span>
                            <span className="truncate">{arena.scoringMode || 'Total R'}</span>
                          </p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        isCompleted
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {isCompleted ? 'Ended' : 'Live'}
                      </span>
                    </div>

                    {arena.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed break-words">
                        {arena.description}
                      </p>
                    )}

                    {leader && leader.stats && (
                      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-3 flex items-center justify-between text-xs gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <Award className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-slate-500 shrink-0">Leader:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                            {leader.displayName || 'Trader'}
                          </span>
                        </div>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                          {leader.stats.totalR > 0 ? `+${leader.stats.totalR}R` : `${leader.stats.totalR}R`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                    <span className="text-slate-500 truncate text-[11px] sm:text-xs">
                      {isCompleted ? 'Ended' : `${daysLeft} days left`}
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                      Enter Arena <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Swipe horizontally or tap any arena to enter</span>
          </div>
        </div>
      ) : (
        /* CARDS GRID VIEW: Responsive layout with mobile-optimized padding & smooth touch scrolling */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 touch-pan-y">
          {filteredArenas.map((arena) => {
            const memberCount = Object.keys(arena.members || {}).length;
            const daysLeft = Math.max(0, Math.ceil((arena.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
            const isCompleted = arena.status === 'completed' || arena.endDate < Date.now();

            // Find top trader
            const sortedMembers = Object.values(arena.members || {}).sort(
              (a, b) => (b.stats?.score || 0) - (a.stats?.score || 0)
            );
            const leader = sortedMembers[0];

            return (
              <div
                key={arena.id}
                onClick={() => setSelectedArenaId(arena.id)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 lg:p-6 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between overflow-hidden active:scale-[0.99] active:bg-slate-50/50 dark:active:bg-slate-800/50 select-none"
              >
                <div className="min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shrink-0">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 truncate">
                          {arena.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 sm:gap-2 truncate">
                          <span className="flex items-center gap-1 shrink-0">
                            <Users className="w-3 h-3" /> {memberCount} {memberCount === 1 ? 'trader' : 'traders'}
                          </span>
                          <span className="shrink-0">•</span>
                          <span className="truncate">{arena.scoringMode || arena.competitionMode || 'Total R'}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      isCompleted
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {isCompleted ? 'Completed' : 'Live'}
                    </span>
                  </div>

                  {arena.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 sm:mb-4 leading-relaxed break-words">
                      {arena.description}
                    </p>
                  )}

                  {/* Leader Callout */}
                  {leader && leader.stats && (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 mb-3 sm:mb-4 flex items-center justify-between text-xs gap-2 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Award className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="text-slate-500 shrink-0">Leader:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {leader.displayName || 'Trader'}
                        </span>
                      </div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {leader.stats.totalR > 0 ? `+${leader.stats.totalR}R` : `${leader.stats.totalR}R`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                  <span className="text-slate-500 truncate text-[11px] sm:text-xs">
                    {isCompleted ? 'Competition Ended' : `${daysLeft} days remaining`}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Enter Arena <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <CreateCompetitionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newArena) => {
          setSelectedArenaId(newArena.id);
        }}
      />

      {/* Join Modal */}
      {isJoinOpen && (
        <JoinModal
          onClose={() => setIsJoinOpen(false)}
          onJoined={(arena) => {
            setSelectedArenaId(arena.id);
            setIsJoinOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* =======================================================
   ARENA DASHBOARD (LIVE 2.0 VIEW)
======================================================= */

const RANK_OPTIONS = [
  { value: 'totalR', label: 'Total R' },
  { value: 'pnl', label: 'P&L ($)' },
  { value: 'roi', label: 'ROI (%)' },
  { value: 'winRate', label: 'Win Rate (%)' },
  { value: 'tradeCount', label: 'Trade Count' },
  { value: 'avgR', label: 'Avg R' },
  { value: 'profitFactor', label: 'Profit Factor' },
  { value: 'bestTrade', label: 'Best Trade' },
  { value: 'worstTrade', label: 'Worst Trade' },
  { value: 'maxDrawdown', label: 'Max Drawdown' },
  { value: 'consistency', label: 'Consistency' },
  { value: 'ruleAdherence', label: 'Rule Adherence' },
  { value: 'execution', label: 'Execution Score' },
  { value: 'journalCompletion', label: 'Journal Completion' }
];

function ArenaDashboard({
  arena,
  onBack
}: {
  arena: Arena;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'participants' | 'tradebook' | 'charts' | 'compare' | 'challenges' | 'ai' | 'audit' | 'rules'>('leaderboard');
  
  // Real-time Competition Trades
  const [trades, setTrades] = useState<CompetitionTrade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);

  // Modals inside Arena
  const [isLogTradeOpen, setIsLogTradeOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareInitialTraderId, setCompareInitialTraderId] = useState<string | undefined>(undefined);
  const [selectedTradeForDetail, setSelectedTradeForDetail] = useState<CompetitionTrade | null>(null);
  const [editingTrade, setEditingTrade] = useState<CompetitionTrade | null>(null);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<ArenaMember | null>(null);

  // Ranking metric ("Rank By")
  const [rankBy, setRankBy] = useState<string>('totalR');

  // Advanced Filters state & modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<CompetitionFilterState>({
    dateRange: 'ALL',
    market: 'ALL',
    strategy: 'ALL',
    session: 'ALL',
    direction: 'ALL',
    result: 'ALL',
    timeframe: 'ALL',
    riskTier: 'ALL',
    holdingDuration: 'ALL',
    traderId: 'ALL'
  });

  // Filter state for tradebook search
  const [tradebookSearch, setTradebookSearch] = useState('');
  const [filterTraderId, setFilterTraderId] = useState('ALL');
  const [filterMarket, setFilterMarket] = useState('ALL');
  const [filterSession, setFilterSession] = useState('ALL');
  const [filterResult, setFilterResult] = useState('ALL');

  // Copy state for invite code
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Desktop slidable controls for primary dashboard tabs
  const dashboardTabsRef = useRef<HTMLDivElement>(null);
  const [canScrollTabsLeft, setCanScrollTabsLeft] = useState(false);
  const [canScrollTabsRight, setCanScrollTabsRight] = useState(false);
  const isTabsMouseDownRef = useRef(false);
  const tabsStartXRef = useRef(0);
  const tabsScrollLeftRef = useRef(0);
  const tabsHasDraggedRef = useRef(false);

  const checkTabsScrollability = useCallback(() => {
    const el = dashboardTabsRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollTabsLeft(scrollLeft > 6);
    setCanScrollTabsRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    checkTabsScrollability();
    const handleResize = () => checkTabsScrollability();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [checkTabsScrollability, activeTab]);

  const scrollDashboardTabs = (direction: 'left' | 'right') => {
    const el = dashboardTabsRef.current;
    if (!el) return;
    const distance = 260;
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
    setTimeout(checkTabsScrollability, 300);
  };

  const handleDashboardTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = dashboardTabsRef.current;
    if (!el) return;
    if (Math.abs(e.deltaY) > 0) {
      el.scrollLeft += e.deltaY;
      checkTabsScrollability();
    }
  };

  const handleDashboardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = dashboardTabsRef.current;
    if (!el) return;
    isTabsMouseDownRef.current = true;
    tabsStartXRef.current = e.pageX - el.offsetLeft;
    tabsScrollLeftRef.current = el.scrollLeft;
    tabsHasDraggedRef.current = false;
  };

  const handleDashboardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isTabsMouseDownRef.current) return;
    const el = dashboardTabsRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - tabsStartXRef.current);
    if (Math.abs(walk) > 4) {
      tabsHasDraggedRef.current = true;
    }
    el.scrollLeft = tabsScrollLeftRef.current - walk;
    checkTabsScrollability();
  };

  const handleDashboardMouseUpOrLeave = () => {
    isTabsMouseDownRef.current = false;
    setTimeout(() => {
      tabsHasDraggedRef.current = false;
    }, 80);
  };

  // Subscribe to real-time competition trades
  useEffect(() => {
    setTradesLoading(true);
    const tradesRef = collection(db, 'arenas', arena.id, 'shared_trades');
    const q = query(tradesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: CompetitionTrade[] = [];
        snapshot.forEach((d) => {
          list.push({ ...(d.data() as CompetitionTrade), id: d.id });
        });
        setTrades(list);
        setTradesLoading(false);
      },
      (err) => {
        console.error('Error fetching competition trades:', err);
        setTradesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [arena.id]);

  const daysRemaining = Math.max(0, Math.ceil((arena.endDate - Date.now()) / (1000 * 60 * 60 * 24)));
  const isOwner = user?.uid === arena.ownerId;
  const isCompleted = arena.status === 'completed' || arena.endDate < Date.now();

  // Dynamic ranking list based on selected "Rank By" metric
  const rankedMembers = useMemo(() => {
    const list = Object.values(arena.members || {}).filter(m => m.status === 'accepted');
    return list.sort((a, b) => {
      const sA = a.stats || ({} as any);
      const sB = b.stats || ({} as any);
      switch (rankBy) {
        case 'pnl':
          return (sB.netPnl || 0) - (sA.netPnl || 0);
        case 'roi':
          return ((sB.totalR || 0) * 5) - ((sA.totalR || 0) * 5);
        case 'totalR':
          return (sB.totalR || 0) - (sA.totalR || 0);
        case 'winRate':
          return (sB.winRate || 0) - (sA.winRate || 0);
        case 'tradeCount':
          return (sB.tradeCount || 0) - (sA.tradeCount || 0);
        case 'avgR':
          return (sB.avgR || 0) - (sA.avgR || 0);
        case 'profitFactor':
          return (sB.profitFactor || 0) - (sA.profitFactor || 0);
        case 'bestTrade':
          return ((sB.avgR || 0) * 2) - ((sA.avgR || 0) * 2);
        case 'worstTrade':
          return (sA.maxDrawdown || 0) - (sB.maxDrawdown || 0);
        case 'maxDrawdown':
          // Lower drawdown ranks better
          return (sA.maxDrawdown || 0) - (sB.maxDrawdown || 0);
        case 'consistency':
        case 'ruleAdherence':
          return (sB.ruleAdherenceAvg || 100) - (sA.ruleAdherenceAvg || 100);
        case 'execution':
        case 'journalCompletion':
        case 'score':
        default:
          return (sB.score || 0) - (sA.score || 0);
      }
    });
  }, [arena.members, rankBy]);

  // Live Race calculation
  const userRankIndex = rankedMembers.findIndex(m => m.userId === user?.uid);
  const userMember = userRankIndex >= 0 ? rankedMembers[userRankIndex] : null;
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : null;
  const leaderMember = rankedMembers[0] || null;
  const behindMember = userRankIndex >= 0 && userRankIndex < rankedMembers.length - 1 ? rankedMembers[userRankIndex + 1] : null;

  const gapToLeader = leaderMember && userMember && userRankIndex > 0
    ? Number(((leaderMember.stats?.totalR || 0) - (userMember.stats?.totalR || 0)).toFixed(2))
    : 0;

  const gapToNext = behindMember && userMember
    ? Number(((userMember.stats?.totalR || 0) - (behindMember.stats?.totalR || 0)).toFixed(2))
    : 0;

  const isUserDisqualified = Boolean(
    userMember?.isDisqualified ||
    userMember?.complianceStatus === 'DISQUALIFIED' ||
    (user && arena.members?.[user.uid]?.isDisqualified) ||
    (user && arena.members?.[user.uid]?.complianceStatus === 'DISQUALIFIED')
  );

  // Calculate applied advanced filters count
  const appliedFilterCount = useMemo(() => {
    let count = 0;
    if (advancedFilters.dateRange !== 'ALL') count++;
    if (advancedFilters.market !== 'ALL') count++;
    if (advancedFilters.strategy !== 'ALL') count++;
    if (advancedFilters.session !== 'ALL') count++;
    if (advancedFilters.direction !== 'ALL') count++;
    if (advancedFilters.result !== 'ALL') count++;
    if (advancedFilters.timeframe !== 'ALL') count++;
    if (advancedFilters.riskTier !== 'ALL') count++;
    if (advancedFilters.holdingDuration !== 'ALL') count++;
    if (advancedFilters.traderId !== 'ALL') count++;
    return count;
  }, [advancedFilters]);

  // Tradebook filtered list (combining search, quick dropdowns, and advanced filters)
  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      // Quick dropdowns
      if (filterTraderId !== 'ALL' && t.userId !== filterTraderId) return false;
      if (filterMarket !== 'ALL' && t.market !== filterMarket) return false;
      if (filterSession !== 'ALL' && t.session !== filterSession) return false;
      if (filterResult !== 'ALL' && t.result !== filterResult) return false;

      // Advanced filters
      if (advancedFilters.traderId !== 'ALL' && t.userId !== advancedFilters.traderId) return false;
      if (advancedFilters.market !== 'ALL' && t.market !== advancedFilters.market) return false;
      if (advancedFilters.session !== 'ALL' && t.session !== advancedFilters.session) return false;
      if (advancedFilters.direction !== 'ALL' && t.direction !== advancedFilters.direction) return false;
      if (advancedFilters.result !== 'ALL' && t.result !== advancedFilters.result) return false;
      if (advancedFilters.strategy !== 'ALL' && t.strategy !== advancedFilters.strategy) return false;
      if (advancedFilters.timeframe !== 'ALL' && t.timeframe !== advancedFilters.timeframe) return false;

      if (advancedFilters.dateRange !== 'ALL') {
        const now = Date.now();
        const tradeTime = t.date;
        if (advancedFilters.dateRange === 'TODAY' && (now - tradeTime > 24 * 60 * 60 * 1000)) return false;
        if (advancedFilters.dateRange === 'WEEK' && (now - tradeTime > 7 * 24 * 60 * 60 * 1000)) return false;
        if (advancedFilters.dateRange === 'MONTH' && (now - tradeTime > 30 * 24 * 60 * 60 * 1000)) return false;
      }

      if (tradebookSearch.trim()) {
        const s = tradebookSearch.toLowerCase();
        const matchTrader = t.userDisplayName?.toLowerCase().includes(s);
        const matchMarket = t.market?.toLowerCase().includes(s);
        const matchNotes = t.sharedNotes?.toLowerCase().includes(s);
        if (!matchTrader && !matchMarket && !matchNotes) return false;
      }
      return true;
    });
  }, [trades, filterTraderId, filterMarket, filterSession, filterResult, advancedFilters, tradebookSearch]);

  // Cumulative R curve chart data
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];
    
    // Sort chronological
    const chronTrades = [...trades].sort((a, b) => a.date - b.date);
    const memberCumulativeR: Record<string, number> = {};
    rankedMembers.forEach(m => {
      memberCumulativeR[m.userId] = 0;
    });

    const dataPoints: any[] = [];

    chronTrades.forEach((t) => {
      const dateStr = format(new Date(t.date), 'MMM d');
      if (memberCumulativeR[t.userId] !== undefined) {
        memberCumulativeR[t.userId] = Number(
          (memberCumulativeR[t.userId] + (t.rMultiple || 0)).toFixed(2)
        );
      }

      // Record state point
      const point: any = {
        name: dateStr,
        timestamp: t.date
      };

      rankedMembers.forEach(m => {
        point[m.displayName || m.userId.slice(0, 5)] = memberCumulativeR[m.userId] || 0;
      });

      dataPoints.push(point);
    });

    return dataPoints;
  }, [trades, rankedMembers]);

  const copyInviteCode = () => {
    // Strictly copy ONLY the raw code, without any extra text
    navigator.clipboard.writeText(arena.code);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleEndCompetition = async () => {
    try {
      await endCompetition(arena.id, user?.uid || '');
    } catch (err: any) {
      console.error('Failed to end competition:', err);
    }
  };

  const handleDeleteArena = () => {
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const [isReinstatingSelf, setIsReinstatingSelf] = useState(false);

  const handleReinstateSelf = async () => {
    if (!arena || !user) return;
    setIsReinstatingSelf(true);
    try {
      await overrideParticipantDisqualification(
        arena.id,
        user.uid,
        'Risk limit self-reinstatement',
        { uid: user.uid, displayName: user.displayName }
      );
    } catch (err: any) {
      console.error('Failed to reinstate account:', err);
    } finally {
      setIsReinstatingSelf(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCompetition(arena.id, user?.uid || '');
      setIsDeleteModalOpen(false);
      onBack();
    } catch (err: any) {
      console.error('Failed to delete competition:', err);
      setDeleteError(err.message || 'Failed to delete competition. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-0">
        <button
          onClick={onBack}
          className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Swords className="w-3.5 h-3.5" /> Competition Arenas
        </button>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-md">{arena.name}</span>
      </div>

      {/* Main Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 break-words">
                {arena.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
                isCompleted
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
              }`}>
                {isCompleted ? 'Finished' : 'Live Battle'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 flex-shrink-0">
                Scoring: {arena.scoringMode || 'Total R'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex-shrink-0">
                Fair Play: {arena.fairPlayMode || 'Fair Play'}
              </span>
            </div>

            {arena.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed break-words">
                {arena.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                {rankedMembers.length} Traders Enrolled
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                {isCompleted ? 'Ended' : `${daysRemaining} days left`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium">
                <Target className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                Min {arena.minTrades || 3} trades for podium
              </span>
            </div>
          </div>

          {/* Action buttons & invite code */}
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            {/* Invite Box */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Invite Code</span>
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 select-all">{arena.code}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyInviteCode}
                title="Copy code only"
                className={`h-8 px-2.5 text-xs font-bold flex items-center gap-1 transition-all ${
                  copiedInvite
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                }`}
              >
                {copiedInvite ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY CODE</span>
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRulesOpen(true)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Scale className="w-3.5 h-3.5" />
              Rules & Limits
            </Button>

            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteArena}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}

            {!isCompleted && (
              <Button
                size="sm"
                onClick={() => setIsLogTradeOpen(true)}
                disabled={isUserDisqualified}
                className={`${
                  isUserDisqualified
                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20'
                } flex items-center gap-1.5 text-xs font-semibold`}
                title={isUserDisqualified ? 'Your account is disqualified from logging trades in this competition.' : 'Log Trade to Arena'}
              >
                {isUserDisqualified ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Trading Locked
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Log Trade to Arena
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* User Disqualification Notice Banner */}
        {isUserDisqualified && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-red-900 dark:text-red-200 text-sm">
                    Account Disqualified & Trading Locked
                  </h4>
                  <span className="text-[10px] uppercase font-bold bg-red-600 text-white px-1.5 py-0.2 rounded">
                    Strict Disqualification
                  </span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300 mt-0.5 break-words">
                  You exceeded the competition risk parameters ({userMember?.disqualifiedRuleName || 'Risk Limit'}). Past trades remain recorded in read-only mode for leaderboard audit transparency.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(isOwner || userMember?.disqualifiedRuleName === 'Maximum Risk Per Trade' || userMember?.disqualificationReason?.includes('Maximum Risk Per Trade')) && (
                <Button
                  size="sm"
                  onClick={handleReinstateSelf}
                  disabled={isReinstatingSelf}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white font-medium shrink-0"
                >
                  {isReinstatingSelf ? 'Reinstating...' : 'Reinstate Trading Access'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('rules')}
                className="text-xs text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 shrink-0"
              >
                View Violation Details →
              </Button>
            </div>
          </div>
        )}

        {/* Podium Highlight Banner if completed */}
        {isCompleted && rankedMembers.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                  Official Final Podium
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-400 break-words">
                  Gold: <strong>{rankedMembers[0]?.displayName}</strong> ({rankedMembers[0]?.stats?.totalR}R)
                  {rankedMembers[1] && ` • Silver: ${rankedMembers[1]?.displayName} (${rankedMembers[1]?.stats?.totalR}R)`}
                  {rankedMembers[2] && ` • Bronze: ${rankedMembers[2]?.displayName} (${rankedMembers[2]?.stats?.totalR}R)`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Live Race Mobile & Tablet Banner */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 text-white border border-indigo-500/30 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center flex-shrink-0">
                <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-indigo-300">
                    Live Race Tracking
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {userRank ? `YOU #${userRank}` : 'SPECTATING'}
                  </h3>
                  {userMember && (
                    <span className="text-xs font-semibold text-slate-300">
                      • {(userMember.stats?.totalR || 0) > 0 ? `+${userMember.stats?.totalR}R` : `${userMember.stats?.totalR || 0}R`} ({userMember.stats?.score || 0} pts)
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-200/90 mt-0.5 font-medium break-words">
                  {userRank === 1 ? (
                    <span className="text-emerald-300 font-bold">
                      👑 Leading the field {behindMember && gapToNext > 0 ? `• +${gapToNext}R ahead of #${userRank + 1} (${behindMember.displayName || 'Next'})` : ''}
                    </span>
                  ) : userRank ? (
                    <span>
                      <strong className="text-amber-300">
                        {gapToLeader > 0 ? `${gapToLeader}R behind #1 (${leaderMember?.displayName || 'Leader'})` : 'Tied with #1'}
                      </strong>
                      {behindMember && gapToNext > 0 ? ` • ${gapToNext}R ahead of #${userRank + 1} (${behindMember.displayName || 'Next'})` : ''}
                    </span>
                  ) : (
                    <span>Join or submit verified trades to enter real-time podium contention.</span>
                  )}
                </p>
              </div>
            </div>

            {/* Visual race gauge / track */}
            <div className="w-full md:w-80 bg-black/40 rounded-xl p-3 border border-white/10 space-y-2 flex-shrink-0">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold gap-2">
                <span className="flex-shrink-0">PROGRESS</span>
                <span className="text-amber-400 font-bold flex items-center gap-1 truncate max-w-[200px]">
                  <Trophy className="w-3 h-3 flex-shrink-0" /> #1 {leaderMember?.displayName || 'Leader'} ({(leaderMember?.stats?.totalR || 0)}R)
                </span>
              </div>
              <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(10, Math.min(100, (leaderMember?.stats?.totalR || 0) > 0
                      ? (((userMember?.stats?.totalR || 0) / (leaderMember?.stats?.totalR || 1)) * 100)
                      : 50))}%`
                  }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-indigo-300 font-bold">
                  You: {(userMember?.stats?.totalR || 0) > 0 ? `+${userMember?.stats?.totalR}R` : `${userMember?.stats?.totalR || 0}R`}
                </span>
                <span className="text-slate-400 font-medium">
                  {userRank ? `Rank ${userRank} of ${rankedMembers.length}` : `${rankedMembers.length} Traders`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Dashboard Tabs */}
        <div className="relative pt-6 border-b border-slate-200 dark:border-slate-800">
          {/* Left Arrow Button with Fade Gradient */}
          {canScrollTabsLeft && (
            <div className="absolute left-0 top-6 bottom-2 z-10 flex items-center bg-gradient-to-r from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pr-4 pointer-events-none">
              <button
                type="button"
                onClick={() => scrollDashboardTabs('left')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90 pointer-events-auto cursor-pointer"
                title="Slide tabs left"
                aria-label="Slide tabs left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={dashboardTabsRef}
            onWheel={handleDashboardTabsWheel}
            onMouseDown={handleDashboardMouseDown}
            onMouseMove={handleDashboardMouseMove}
            onMouseUp={handleDashboardMouseUpOrLeave}
            onMouseLeave={handleDashboardMouseUpOrLeave}
            className="flex items-center gap-2 pb-2 overflow-x-auto scrollbar-none touch-pan-x overscroll-x-contain scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0 cursor-grab active:cursor-grabbing select-none"
          >
            {[
              { key: 'leaderboard', label: 'Leaderboard & Rankings', icon: Trophy },
              { key: 'rules', label: `Rules & Fair Play (${(arena.rules || []).length})`, icon: Scale },
              { key: 'participants', label: `Participants (${rankedMembers.length})`, icon: Users },
              { key: 'tradebook', label: `Competition Tradebook (${trades.length})`, icon: Layers },
              { key: 'charts', label: 'Performance Curves', icon: TrendingUp },
              { key: 'compare', label: 'Head-to-Head Compare', icon: Users },
              { key: 'challenges', label: `Mini Challenges (${(arena.challenges || []).length})`, icon: Flame },
              { key: 'ai', label: 'Competition AI', icon: Sparkles },
              { key: 'audit', label: `Audit Log (${(arena.auditTrail || []).length})`, icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tabsHasDraggedRef.current) return;
                    setActiveTab(tab.key as any);
                  }}
                  className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap min-h-[40px] shrink-0 cursor-pointer select-none active:scale-95 ${
                    activeTab === tab.key
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button with Fade Gradient */}
          {canScrollTabsRight && (
            <div className="absolute right-0 top-6 bottom-2 z-10 flex items-center bg-gradient-to-l from-white via-white/95 to-transparent dark:from-slate-900 dark:via-slate-900/95 pl-4 pointer-events-none">
              <button
                type="button"
                onClick={() => scrollDashboardTabs('right')}
                className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-90 pointer-events-auto cursor-pointer"
                title="Slide tabs right"
                aria-label="Slide tabs right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Arena Rankings & Scorecards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by {RANK_OPTIONS.find(o => o.value === rankBy)?.label || arena.scoringMode || 'Total R'} • Requires {arena.minTrades || 3} trades for podium qualification
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Rank By Metric Selector */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Rank By:</span>
                <select
                  value={rankBy}
                  onChange={(e) => setRankBy(e.target.value)}
                  className="w-full sm:w-auto h-9 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {RANK_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompareModalOpen(true)}
                className="text-xs h-9 flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Users className="w-3.5 h-3.5" />
                Compare Traders
              </Button>
            </div>
          </div>

          {/* MOBILE CARDS VIEW (Visible < 768px) */}
          <div className="block md:hidden space-y-2.5 sm:space-y-3 touch-pan-y">
            {rankedMembers.map((member, idx) => {
              const s = member.stats;
              const qualifies = (s?.tradeCount || 0) >= (arena.minTrades || 3);
              const isCurrent = member.userId === user?.uid;
              const pnl = s?.netPnl || 0;
              const totalR = s?.totalR || 0;
              const roi = totalR > 0 ? `+${(totalR * 2.5).toFixed(1)}%` : `${(totalR * 2.5).toFixed(1)}%`;

              return (
                <div
                  key={member.userId}
                  onClick={() => setSelectedMemberForDetail(member)}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer active:scale-[0.99] select-none ${
                    isCurrent
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  {/* Top Line: Rank, Avatar, Name, Score */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        idx === 0 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 ring-2 ring-amber-400' :
                        idx === 1 ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-slate-400' :
                        idx === 2 ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400 ring-1 ring-orange-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        #{idx + 1}
                      </div>

                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {member.photoURL ? (
                          <img
                            src={member.photoURL}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {(member.displayName || 'T').substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="truncate min-w-0 flex-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5 truncate">
                            <span className="truncate">{member.displayName || 'Trader'}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold flex-shrink-0">
                                YOU
                              </span>
                            )}
                          </span>
                          {!qualifies && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium truncate">
                              ({s?.tradeCount || 0}/{arena.minTrades || 3} trades for podium)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Score</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {s?.score || 0} pts
                      </span>
                    </div>
                  </div>

                  {/* Metric Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">Total R</span>
                      <span className={`font-bold block truncate ${totalR > 0 ? 'text-emerald-600 dark:text-emerald-400' : totalR < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {totalR > 0 ? `+${totalR}R` : `${totalR}R`}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">Win Rate</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                        {s?.winRate || 0}%
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">P&L</span>
                      <span className={`font-bold block truncate ${pnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                        {pnl >= 0 ? `+$${pnl.toLocaleString()}` : `-$${Math.abs(pnl).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">Avg R</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                        {(s?.avgR || 0) > 0 ? `+${s?.avgR}R` : `${s?.avgR || 0}R`}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">Trades</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                        {s?.tradeCount || 0}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">Profile</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 truncate">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {rankedMembers.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No participants registered in this arena yet.
              </div>
            )}
          </div>

          {/* DESKTOP & TABLET TABLE VIEW (Visible >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                  <th className="pb-3 pr-3 w-12">Rank</th>
                  <th className="pb-3 pr-4">Trader</th>
                  <th className="pb-3 pr-4 text-right">Total R</th>
                  <th className="pb-3 pr-4 text-right">Avg R</th>
                  <th className="pb-3 pr-4 text-right">Win Rate</th>
                  <th className="pb-3 pr-4 text-right">P&L</th>
                  <th className="pb-3 pr-4 text-right">Trades</th>
                  <th className="pb-3 pr-4 text-right">Profit Factor</th>
                  <th className="pb-3 pr-4 text-right">Max Drawdown</th>
                  <th className="pb-3 pr-4 text-right">Rule Adherence</th>
                  <th className="pb-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {rankedMembers.map((member, idx) => {
                  const s = member.stats;
                  const qualifies = (s?.tradeCount || 0) >= (arena.minTrades || 3);
                  const isCurrent = member.userId === user?.uid;

                  return (
                    <tr
                      key={member.userId}
                      onClick={() => setSelectedMemberForDetail(member)}
                      className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-indigo-50/20 dark:bg-indigo-950/20 font-medium' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 pr-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' :
                          idx === 1 ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                          idx === 2 ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400' :
                          'text-slate-400'
                        }`}>
                          {idx + 1}
                        </div>
                      </td>

                      {/* Trader Name */}
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[200px]">
                          {member.photoURL ? (
                            <img
                              src={member.photoURL}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                              {(member.displayName || 'T').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">
                              {member.displayName || 'Trader'} {isCurrent && '(You)'}
                            </span>
                            {!qualifies && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 block truncate">
                                Sample insufficient ({s?.tradeCount || 0}/{arena.minTrades || 3})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Total R */}
                      <td className="py-4 pr-4 text-right font-bold whitespace-nowrap">
                        <span className={(s?.totalR || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : (s?.totalR || 0) < 0 ? 'text-rose-600' : ''}>
                          {(s?.totalR || 0) > 0 ? `+${s?.totalR}R` : `${s?.totalR || 0}R`}
                        </span>
                      </td>

                      {/* Avg R */}
                      <td className="py-4 pr-4 text-right font-medium whitespace-nowrap">
                        {(s?.avgR || 0) > 0 ? `+${s?.avgR}R` : `${s?.avgR || 0}R`}
                      </td>

                      {/* Win Rate */}
                      <td className="py-4 pr-4 text-right whitespace-nowrap">
                        {s?.winRate || 0}%
                      </td>

                      {/* P&L */}
                      <td className="py-4 pr-4 text-right font-medium whitespace-nowrap">
                        <span className={(s?.netPnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                          ${(s?.netPnl || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Trade Count */}
                      <td className="py-4 pr-4 text-right font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {s?.tradeCount || 0}
                      </td>

                      {/* Profit Factor */}
                      <td className="py-4 pr-4 text-right whitespace-nowrap">
                        {s?.profitFactor || 0}
                      </td>

                      {/* Drawdown */}
                      <td className="py-4 pr-4 text-right text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        ${s?.maxDrawdown || 0}
                      </td>

                      {/* Rule Adherence */}
                      <td className="py-4 pr-4 text-right font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                        {s?.ruleAdherenceAvg || 100}%
                      </td>

                      {/* Score */}
                      <td className="py-4 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm whitespace-nowrap">
                        {s?.score || 0} pts
                      </td>
                    </tr>
                  );
                })}

                {rankedMembers.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-slate-400">
                      No participants registered in this arena yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PARTICIPANTS */}
      {activeTab === 'participants' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Competition Participants ({rankedMembers.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any participant to view their public competition dashboard, performance metrics, equity curve, and trade history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankedMembers.map((member, idx) => {
              const isCurrent = member.userId === user?.uid;
              const s = member.stats;
              const memberTrades = trades.filter((t) => t.userId === member.userId);
              const winRate = s?.winRate || 0;
              const totalR = s?.totalR || 0;

              return (
                <div
                  key={member.userId}
                  onClick={() => setSelectedMemberForDetail(member)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-md ${
                    isCurrent
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/10'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/20 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {(member.displayName || 'T').substring(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {member.displayName || 'Trader'}
                        </h4>
                        {isCurrent && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            YOU
                          </span>
                        )}
                        {arena.ownerId === member.userId && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            HOST
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold block mt-0.5">
                        Rank #{idx + 1} in Arena
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total R</span>
                      <span className={`font-bold ${totalR > 0 ? 'text-emerald-600' : totalR < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {totalR > 0 ? `+${totalR}R` : `${totalR}R`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Win Rate</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{winRate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Trades</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{memberTrades.length}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full h-9 text-xs font-semibold group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Competition Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: COMPETITION TRADEBOOK */}
      {activeTab === 'tradebook' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Shared Competition Tradebook
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified trade projections submitted by arena participants ({filteredTrades.length} trades shown)
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterModalOpen(true)}
                className="text-xs h-9 flex items-center gap-1.5 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200"
              >
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filters</span>
                {appliedFilterCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                    {appliedFilterCount}
                  </span>
                )}
              </Button>

              {!isCompleted && (
                <Button
                  size="sm"
                  onClick={() => setIsLogTradeOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-0.5" /> Log Trade
                </Button>
              )}
            </div>
          </div>

          {/* Tradebook Filter Bar (Search + Quick selects) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search */}
            <div className="relative min-w-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={tradebookSearch}
                onChange={(e) => setTradebookSearch(e.target.value)}
                placeholder="Search notes/trader..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 truncate"
              />
            </div>

            {/* Filter by Trader */}
            <select
              value={filterTraderId}
              onChange={(e) => setFilterTraderId(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-w-0 truncate"
            >
              <option value="ALL">All Traders</option>
              {rankedMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.displayName || 'Trader'}</option>
              ))}
            </select>

            {/* Filter by Market */}
            <select
              value={filterMarket}
              onChange={(e) => setFilterMarket(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-w-0 truncate"
            >
              <option value="ALL">All Instruments</option>
              <option value="XAU/USD">XAU/USD (Gold)</option>
              <option value="BTC/USD">BTC/USD</option>
              <option value="ETH/USD">ETH/USD</option>
              <option value="EUR/USD">EUR/USD</option>
              <option value="GBP/USD">GBP/USD</option>
              <option value="US100">Nasdaq US100</option>
            </select>

            {/* Filter by Session */}
            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-w-0 truncate"
            >
              <option value="ALL">All Sessions</option>
              <option value="London">London Session</option>
              <option value="New York">New York Session</option>
              <option value="Asian">Asian Session</option>
            </select>

            {/* Filter by Result */}
            <select
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-w-0 truncate"
            >
              <option value="ALL">All Outcomes</option>
              <option value="WIN">WIN</option>
              <option value="LOSS">LOSS</option>
              <option value="BREAK EVEN">BREAK EVEN</option>
            </select>
          </div>

          {/* Applied filters banner if advanced filters active */}
          {appliedFilterCount > 0 && (
            <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-indigo-900 dark:text-indigo-200 font-medium break-words flex-1 min-w-0">
                Active advanced filters ({appliedFilterCount}): {advancedFilters.market !== 'ALL' ? `Market: ${advancedFilters.market} • ` : ''}{advancedFilters.session !== 'ALL' ? `Session: ${advancedFilters.session} • ` : ''}{advancedFilters.result !== 'ALL' ? `Result: ${advancedFilters.result} • ` : ''}{advancedFilters.dateRange !== 'ALL' ? `Range: ${advancedFilters.dateRange}` : ''}
              </span>
              <button
                onClick={() => setAdvancedFilters({
                  dateRange: 'ALL',
                  market: 'ALL',
                  strategy: 'ALL',
                  session: 'ALL',
                  direction: 'ALL',
                  result: 'ALL',
                  timeframe: 'ALL',
                  riskTier: 'ALL',
                  holdingDuration: 'ALL',
                  traderId: 'ALL'
                })}
                className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold underline flex-shrink-0"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* MOBILE CARDS VIEW (Visible < 768px) */}
          <div className="block md:hidden space-y-3">
            {filteredTrades.map((trade) => {
              const dateStr = format(new Date(trade.date), 'MMM d, yyyy');
              const r = trade.rMultiple || 0;
              const isWin = trade.result === 'WIN';
              const isLoss = trade.result === 'LOSS';

              return (
                <div
                  key={trade.id}
                  onClick={() => setSelectedTradeForDetail(trade)}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer space-y-3 overflow-hidden"
                >
                  {/* Top: Trader + Instrument + Direction + Date */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {(trade.userDisplayName || 'T').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate min-w-0 flex-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs block truncate">
                          {trade.userDisplayName || 'Trader'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {dateStr} {trade.time || ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {trade.market}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${
                        trade.direction === 'BUY'
                          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                      }`}>
                        {trade.direction}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Result, R-Multiple, P&L */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">Result</span>
                      <span className={`font-bold block truncate ${
                        isWin ? 'text-emerald-600 dark:text-emerald-400' :
                        isLoss ? 'text-rose-600 dark:text-rose-400' :
                        'text-blue-600 dark:text-blue-400'
                      }`}>
                        {trade.result}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">R-Multiple</span>
                      <span className={`font-bold block truncate ${r > 0 ? 'text-emerald-600 dark:text-emerald-400' : r < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                        {r > 0 ? `+${r}R` : `${r}R`}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold truncate">P&L</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 block truncate">
                        {trade.pnl !== undefined ? (trade.pnl >= 0 ? `+$${trade.pnl}` : `-$${Math.abs(trade.pnl)}`) : 'Masked'}
                      </span>
                    </div>
                  </div>

                  {/* Footer: Session, Verification, Action */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[10px] flex-shrink-0">
                        {trade.session || 'Session'}
                      </span>
                      {trade.isBackfilled && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex-shrink-0">
                          BF
                        </span>
                      )}
                      <span className="text-emerald-600 font-medium flex items-center gap-0.5 text-[10px] flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {user && trade.userId === user.uid && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTrade(trade);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1"
                          title="Edit trade"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 text-xs flex-shrink-0">
                        Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTrades.length === 0 && (
              <div className="py-10 text-center text-slate-400 text-xs">
                No trades match your search criteria.
              </div>
            )}
          </div>

          {/* DESKTOP & TABLET TRADE TABLE (Visible >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                  <th className="pb-3 pr-3">Date / Time</th>
                  <th className="pb-3 pr-3">Trader</th>
                  <th className="pb-3 pr-3">Instrument</th>
                  <th className="pb-3 pr-3">Direction</th>
                  <th className="pb-3 pr-3 text-right">R-Multiple</th>
                  <th className="pb-3 pr-3 text-right">P&L</th>
                  <th className="pb-3 pr-3 text-right">Risk ($)</th>
                  <th className="pb-3 pr-3">Session</th>
                  <th className="pb-3 pr-3 text-center">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredTrades.map((trade) => {
                  const dateStr = format(new Date(trade.date), 'MMM d, yyyy');

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => setSelectedTradeForDetail(trade)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-3 font-medium text-slate-500 whitespace-nowrap">
                        {dateStr} {trade.time || ''}
                      </td>

                      <td className="py-3 pr-3 font-bold text-slate-900 dark:text-slate-100 max-w-[160px] truncate">
                        {trade.userDisplayName || 'Trader'}
                      </td>

                      <td className="py-3 pr-3 font-semibold whitespace-nowrap">
                        {trade.market}
                      </td>

                      <td className="py-3 pr-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                          trade.direction === 'BUY'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                        }`}>
                          {trade.direction}
                        </span>
                      </td>

                      <td className="py-3 pr-3 text-right font-bold whitespace-nowrap">
                        <span className={(trade.rMultiple || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' : (trade.rMultiple || 0) < 0 ? 'text-rose-600' : ''}>
                          {(trade.rMultiple || 0) > 0 ? `+${trade.rMultiple}R` : `${trade.rMultiple || 0}R`}
                        </span>
                      </td>

                      <td className="py-3 pr-3 text-right font-medium whitespace-nowrap">
                        {trade.pnl !== undefined ? (
                          <span className={trade.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            ${trade.pnl.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">Masked</span>
                        )}
                      </td>

                      <td className="py-3 pr-3 text-right text-slate-500 whitespace-nowrap">
                        {trade.riskAmount ? `$${trade.riskAmount}` : '—'}
                      </td>

                      <td className="py-3 pr-3 text-slate-500 whitespace-nowrap">
                        {trade.session || '—'}
                      </td>

                      <td className="py-3 pr-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {trade.isBackfilled && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                              BF
                            </span>
                          )}
                          {trade.status === 'Disputed' && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-[10px] font-bold">
                              Flagged
                            </span>
                          )}
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        </div>
                      </td>

                      <td className="py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {user && trade.userId === user.uid && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTrade(trade);
                              }}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1"
                              title="Edit trade"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold"
                          >
                            View →
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTrades.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No trades match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PERFORMANCE CURVES (RESPONSIVE CHARTS) */}
      {activeTab === 'charts' && (
        <CompetitionResponsiveCharts
          arena={arena}
          trades={trades}
          members={rankedMembers}
        />
      )}

      {/* TAB 4: COMPARE TRADERS */}
      {activeTab === 'compare' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                Head-to-Head Trader Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Granular statistical breakdown across win rates, drawdowns, and expectancy
              </p>
            </div>
            <Button
              onClick={() => setIsCompareModalOpen(true)}
              className="bg-indigo-600 text-white text-xs"
            >
              Open Full Compare Matrix
            </Button>
          </div>

          <div className="p-8 text-center text-slate-500 text-xs max-w-md mx-auto space-y-3">
            <Users className="w-10 h-10 text-indigo-500 mx-auto opacity-80" />
            <p>
              Compare your trading behavior against any friend in {arena.name} to see empirical differences in session edge, risk control, and average R capture.
            </p>
            <Button
              onClick={() => setIsCompareModalOpen(true)}
              variant="outline"
              size="sm"
            >
              Launch Side-by-Side Comparison →
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: MINI CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">
                Private Mini-Challenges
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Micro-contests within this arena (e.g. Highest Avg R this week, Zero Rule Violations)
              </p>
            </div>
            {!isCompleted && (
              <Button
                size="sm"
                onClick={() => setIsChallengeModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Launch Challenge
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(arena.challenges || []).map((ch) => {
              const expiresStr = ch.expiresAt ? format(new Date(ch.expiresAt), 'MMM d, yyyy') : 'N/A';
              const isExpired = ch.expiresAt ? ch.expiresAt < Date.now() : false;

              return (
                <div
                  key={ch.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3 overflow-hidden min-w-0"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Flame className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {ch.title}
                      </h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex-shrink-0 ${
                      isExpired ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {isExpired ? 'Ended' : 'Active'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1 break-words">
                    <p>Metric: <strong>{ch.metric}</strong></p>
                    <p>Minimum Trades: <strong>{ch.minTrades}</strong></p>
                    {ch.targetValue && <p>Target Benchmark: <strong>{ch.targetValue}</strong></p>}
                    <p className="break-words">Created by: {ch.creatorName} • Expires {expiresStr}</p>
                  </div>
                </div>
              );
            })}

            {(!arena.challenges || arena.challenges.length === 0) && (
              <div className="col-span-2 p-12 text-center text-slate-400 text-xs">
                No active mini-challenges yet. Challenge your fellow participants to a weekend sprint or discipline contest!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: COMPETITION AI */}
      {activeTab === 'ai' && (
        <CompetitionAiAnalyst
          arena={arena}
          trades={trades}
          currentUserId={user?.uid || ''}
          onFilterEvidence={(criteria) => {
            if (criteria.traderId) setFilterTraderId(criteria.traderId);
            if (criteria.market) setFilterMarket(criteria.market);
            if (criteria.session) setFilterSession(criteria.session);
            setActiveTab('tradebook');
          }}
        />
      )}

      {/* TAB 7: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Fair-Play Audit Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable log of trade submissions, backfills, rule flags, and member changes
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {(arena.auditTrail || []).map((log) => {
              const timeStr = format(new Date(log.timestamp), 'MMM d, yyyy HH:mm');
              return (
                <div key={log.id} className="py-3 flex items-start gap-3 min-w-0">
                  <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 break-words">{log.action}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{timeStr}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 break-words">{log.details}</p>
                    <span className="text-[10px] text-slate-400 block truncate">By {log.userName}</span>
                  </div>
                </div>
              );
            })}

            {(!arena.auditTrail || arena.auditTrail.length === 0) && (
              <div className="p-8 text-center text-slate-400">
                Audit log initialized. Actions and timestamp verification logs will appear here.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: RULES & FAIR PLAY GOVERNANCE */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <CompetitionRulesView arena={arena} />
        </div>
      )}

      {/* Modals */}
      <AddCompetitionTradeModal
        arena={arena}
        isOpen={isLogTradeOpen}
        onClose={() => setIsLogTradeOpen(false)}
        onTradeAdded={() => {
          // Trades listener will update automatically
        }}
      />

      <CompetitionRulesModal
        arena={arena}
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <MiniChallengeModal
        arena={arena}
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onChallengeCreated={() => {
          // challenge created
        }}
      />

      <CompareTradersModal
        arena={arena}
        trades={trades}
        isOpen={isCompareModalOpen}
        onClose={() => {
          setIsCompareModalOpen(false);
          setCompareInitialTraderId(undefined);
        }}
        currentUserId={user?.uid || ''}
        initialTraderBId={compareInitialTraderId}
      />

      <TradeDetailModal
        trade={selectedTradeForDetail}
        arena={arena}
        isOpen={!!selectedTradeForDetail}
        onClose={() => setSelectedTradeForDetail(null)}
        onEditTrade={(t) => {
          setSelectedTradeForDetail(null);
          setEditingTrade(t);
        }}
      />

      {editingTrade && (
        <EditCompetitionTradeModal
          trade={editingTrade}
          arena={arena}
          isOpen={Boolean(editingTrade)}
          onClose={() => setEditingTrade(null)}
          onTradeUpdated={(updatedTrade) => {
            setEditingTrade(null);
            setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
          }}
        />
      )}

      <TraderDetailModal
        member={selectedMemberForDetail}
        arena={arena}
        trades={trades}
        isOpen={!!selectedMemberForDetail}
        onClose={() => setSelectedMemberForDetail(null)}
        currentUserId={user?.uid || ''}
        onCompare={(traderId) => {
          setSelectedMemberForDetail(null);
          setCompareInitialTraderId(traderId);
          setIsCompareModalOpen(true);
        }}
      />

      <CompetitionFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={advancedFilters}
        onApply={(newFilters) => {
          setAdvancedFilters(newFilters);
          setIsFilterModalOpen(false);
        }}
        onReset={() => {
          setAdvancedFilters({
            dateRange: 'ALL',
            market: 'ALL',
            strategy: 'ALL',
            session: 'ALL',
            direction: 'ALL',
            result: 'ALL',
            timeframe: 'ALL',
            riskTier: 'ALL',
            holdingDuration: 'ALL',
            traderId: 'ALL'
          });
          setIsFilterModalOpen(false);
        }}
        availableTraders={rankedMembers.map(m => ({ id: m.userId, name: m.displayName || 'Trader' }))}
        availableMarkets={arena.allowedMarkets || []}
      />

      {/* Delete Arena Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete Competition
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{arena.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300">
              <p className="font-semibold mb-1">What will happen:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-red-600 dark:text-red-400">
                <li>The arena and invite code will be permanently removed</li>
                <li>All participant rankings and leaderboard stats will be deleted</li>
                <li>Shared trades linked to this competition will be cleaned up</li>
              </ul>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 shadow-sm shadow-red-500/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Competition
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* =======================================================
   JOIN MODAL COMPONENT
======================================================= */

function JoinModal({
  onClose,
  onJoined
}: {
  onClose: () => void;
  onJoined: (a: Arena) => void;
}) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !user) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const arena = await joinCompetition(
        user.uid,
        code.trim(),
        {
          profile: true,
          performance: true,
          tradeDetails: true,
          research: true,
          psychology: true,
          screenshots: true
        },
        {
          fullName: user.displayName || 'Trader',
          avatarUrl: user.photoURL || undefined
        }
      );
      onJoined(arena);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join competition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold">
          <UserPlus className="w-6 h-6" />
        </div>
        
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
          Join Competition Arena
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Enter the invite code generated by the competition host.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. TV-7K4Q9X"
            className="text-center text-lg font-mono tracking-widest uppercase font-bold"
            required
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || code.length < 5}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? 'Joining...' : 'Join Arena'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
