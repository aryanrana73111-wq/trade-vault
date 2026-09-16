import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem<T = string> {
  id: T;
  label: string;
  icon?: React.FC<{ className?: string }>;
  count?: number;
  badge?: string;
}

export interface ScrollableTabsProps<T = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  className?: string;
  tabClassName?: (isActive: boolean) => string;
  ariaLabel?: string;
  showArrows?: boolean;
}

export function ScrollableTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  tabClassName,
  ariaLabel = 'Navigation Tabs',
  showArrows = true
}: ScrollableTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Mouse drag-to-scroll
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

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

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    // Wheel event listener to slide horizontally on desktop mouse wheel
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0 || Math.abs(e.deltaX) > 0) {
        // If there is horizontal overflow, enable mouse wheel sliding
        if (el.scrollWidth > el.clientWidth) {
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          el.scrollBy({ left: delta * 1.2, behavior: 'auto' });
          e.preventDefault();
        }
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });

    const observer = new ResizeObserver(() => updateScrollState());
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheel);
      observer.disconnect();
    };
  }, [updateScrollState, tabs]);

  // AUTO-SCROLL ACTIVE TAB INTO VIEW
  useEffect(() => {
    if (activeTabRef.current && containerRef.current) {
      const container = containerRef.current;
      const tabEl = activeTabRef.current;

      const tabLeft = tabEl.offsetLeft;
      const tabWidth = tabEl.offsetWidth;
      const containerWidth = container.clientWidth;
      const currentScroll = container.scrollLeft;

      // Check if tab is outside viewport or partially clipped
      const isPartiallyHiddenLeft = tabLeft < currentScroll + 32;
      const isPartiallyHiddenRight = (tabLeft + tabWidth) > (currentScroll + containerWidth - 32);

      if (isPartiallyHiddenLeft || isPartiallyHiddenRight) {
        // Center the active tab smoothly
        const targetScroll = Math.max(0, tabLeft - (containerWidth / 2) + (tabWidth / 2));
        container.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(160, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el || !hasOverflow) return;
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    dragDistanceRef.current = Math.abs(x - startXRef.current);
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 50);
    }
  };

  const handleCaptureClick = (e: React.MouseEvent) => {
    if (dragDistanceRef.current > 6) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className={`relative flex items-center w-full group/tabs ${className}`}>
      {/* Left scroll button */}
      {showArrows && hasOverflow && (
        <button
          type="button"
          onClick={() => scrollByDirection('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll tabs left"
          className={`shrink-0 z-20 p-1.5 mr-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs transition-all ${
            canScrollLeft 
              ? 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer active:scale-95' 
              : 'opacity-25 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Tabs track wrapper with edge fades */}
      <div className="relative flex-1 min-w-0 overflow-hidden">
        {/* Left Fade */}
        {hasOverflow && (
          <div 
            aria-hidden="true"
            className={`absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 pointer-events-none z-10 transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`} 
          />
        )}

        {/* Right Fade */}
        {hasOverflow && (
          <div 
            aria-hidden="true"
            className={`absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 pointer-events-none z-10 transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`} 
          />
        )}

        <div
          ref={containerRef}
          role="tablist"
          aria-label={ariaLabel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleCaptureClick}
          className={`flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x snap-proximity select-none ${
            hasOverflow ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            const defaultClasses = isActive
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800';

            const computedClasses = tabClassName ? tabClassName(isActive) : defaultClasses;

            return (
              <button
                key={tab.id}
                ref={isActive ? activeTabRef : undefined}
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 min-h-[40px] snap-start focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer ${computedClasses}`}
              >
                {Icon && (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                    isActive ? 'bg-white text-blue-600' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right scroll button */}
      {showArrows && hasOverflow && (
        <button
          type="button"
          onClick={() => scrollByDirection('right')}
          disabled={!canScrollRight}
          aria-label="Scroll tabs right"
          className={`shrink-0 z-20 p-1.5 ml-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs transition-all ${
            canScrollRight 
              ? 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer active:scale-95' 
              : 'opacity-25 cursor-not-allowed pointer-events-none'
          }`}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
