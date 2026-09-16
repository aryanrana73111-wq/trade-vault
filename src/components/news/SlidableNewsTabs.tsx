import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Radio, 
  CheckCircle2, 
  Database, 
  Activity, 
  Clock, 
  Eye, 
  Bookmark, 
  ShieldAlert, 
  TrendingUp, 
  BookOpen
} from 'lucide-react';
import { NewsTab } from '@/pages/NewsIntelligence';

interface TabItemConfig {
  id: NewsTab;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  live?: boolean;
}

interface SlidableNewsTabsProps {
  activeTab: NewsTab;
  onTabChange: (tab: NewsTab) => void;
  watchlistCount?: number;
  savedCount?: number;
  alertsCount?: number;
  className?: string;
}

export function SlidableNewsTabs({
  activeTab,
  onTabChange,
  watchlistCount = 0,
  savedCount = 0,
  alertsCount = 0,
  className = ''
}: SlidableNewsTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Desktop Drag-to-slide refs
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const tabs: TabItemConfig[] = [
    { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
    { id: 'feed', label: 'Market News', icon: Radio, live: true },
    { id: 'releases', label: 'Economic Releases', icon: CheckCircle2 },
    { id: 'data', label: 'Economic Data', icon: Database },
    { id: 'snapshot', label: 'Market Snapshot', icon: Activity },
    { id: 'upcoming', label: 'Upcoming Catalysts', icon: Clock },
    { id: 'watchlist', label: 'Watchlist', icon: Eye, badge: watchlistCount > 0 ? watchlistCount : undefined },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedCount > 0 ? savedCount : undefined },
    { id: 'alerts', label: 'Risk Alerts', icon: ShieldAlert, badge: alertsCount > 0 ? alertsCount : undefined },
    { id: 'performance', label: 'Execution Edge', icon: TrendingUp },
    { id: 'academy', label: 'News Academy', icon: BookOpen },
  ];

  // Update scroll bounds
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const overflow = maxScroll > 4;

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => updateScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    // Wheel event listener to slide horizontally on desktop mouse wheel
    const handleWheelNative = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
        if (el.scrollWidth > el.clientWidth) {
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          el.scrollBy({ left: delta * 1.25, behavior: 'auto' });
          e.preventDefault();
        }
      }
    };
    el.addEventListener('wheel', handleWheelNative, { passive: false });

    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheelNative);
      observer.disconnect();
    };
  }, [updateScrollState]);

  // Smoothly center the active tab into view whenever activeTab changes
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const tabEl = activeTabRef.current;

      const tabLeft = tabEl.offsetLeft;
      const tabWidth = tabEl.offsetWidth;
      const containerWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;

      const isPartiallyHiddenLeft = tabLeft < currentScroll + 40;
      const isPartiallyHiddenRight = (tabLeft + tabWidth) > (currentScroll + containerWidth - 40);

      if (isPartiallyHiddenLeft || isPartiallyHiddenRight) {
        const targetScroll = Math.max(0, tabLeft - (containerWidth / 2) + (tabWidth / 2));
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  // Desktop Slider navigation step
  const handleSlide = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const slideAmount = Math.max(220, Math.floor(el.clientWidth * 0.55));
    el.scrollBy({
      left: direction === 'left' ? -slideAmount : slideAmount,
      behavior: 'smooth'
    });
  };

  // Mouse Drag-to-Slide Handlers (desktop grab & slide with global window tracking)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || !hasOverflow) return;
    if (e.button !== 0) return; // Only primary mouse button

    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    dragDistanceRef.current = 0;

    const handleWindowMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      moveEvent.preventDefault();
      const x = moveEvent.pageX - containerRef.current.offsetLeft;
      const walk = (x - startXRef.current) * 1.5;
      dragDistanceRef.current = Math.abs(x - startXRef.current);
      containerRef.current.scrollLeft = scrollLeftRef.current - walk;
      updateScrollState();
    };

    const handleWindowMouseUp = () => {
      isDraggingRef.current = false;
      setIsDragging(false);
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 80);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
  };

  const handleCaptureClick = (e: React.MouseEvent) => {
    // If user dragged more than 5px, prevent accidental tab click
    if (dragDistanceRef.current > 5) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div 
      className={`relative flex items-center w-full group/newstabs ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Desktop Left Slide Arrow Button */}
      {hasOverflow && (
        <button
          type="button"
          onClick={() => handleSlide('left')}
          disabled={!canScrollLeft}
          title="Slide tabs left"
          aria-label="Slide tabs left"
          className={`shrink-0 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 mr-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-150 ${
            canScrollLeft 
              ? 'hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-slate-600 cursor-pointer active:scale-95 opacity-90 sm:opacity-80 sm:group-hover/newstabs:opacity-100' 
              : 'opacity-20 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Tabs Track Wrapper with Fade Overlays */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        {/* Left Gradient Fade */}
        {hasOverflow && (
          <div 
            aria-hidden="true"
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 pointer-events-none z-10 transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Right Gradient Fade */}
        {hasOverflow && (
          <div 
            aria-hidden="true"
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 pointer-events-none z-10 transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Slidable Container */}
        <div
          ref={containerRef}
          role="tablist"
          aria-label="Market Intelligence Sections"
          onMouseDown={handleMouseDown}
          onClickCapture={handleCaptureClick}
          className={`flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1.5 no-scrollbar select-none touch-pan-x ${
            isDragging ? 'scroll-auto cursor-grabbing' : 'scroll-smooth'
          } ${
            hasOverflow && !isDragging ? 'cursor-grab' : ''
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : null}
                role="tab"
                id={`tab-btn-${tab.id}`}
                aria-selected={isActive}
                onClick={(e) => {
                  if (dragDistanceRef.current > 5) {
                    e.preventDefault();
                    return;
                  }
                  onTabChange(tab.id);
                }}
                className={`group flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[36px] touch-manipulation relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'scale-105' : 'group-hover:scale-105 text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>

                {/* Live Pulse Indicator for Market News */}
                {tab.live && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                )}

                {/* Count Badge for Watchlist, Saved, Alerts */}
                {tab.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-0.5 ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Right Slide Arrow Button */}
      {hasOverflow && (
        <button
          type="button"
          onClick={() => handleSlide('right')}
          disabled={!canScrollRight}
          title="Slide tabs right"
          aria-label="Slide tabs right"
          className={`shrink-0 z-20 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 ml-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-150 ${
            canScrollRight 
              ? 'hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-slate-600 cursor-pointer active:scale-95 opacity-90 sm:opacity-80 sm:group-hover/newstabs:opacity-100' 
              : 'opacity-20 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
