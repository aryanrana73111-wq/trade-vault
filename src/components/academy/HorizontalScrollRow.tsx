import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export interface HorizontalScrollRowProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  viewAllAction?: {
    label?: string;
    onClick: () => void;
  };
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  itemSpacing?: string; // e.g., 'gap-4'
  showControls?: boolean;
  arrowPosition?: 'header' | 'sides' | 'floating';
  scrollDistance?: number | 'page';
  snap?: boolean;
  edgeFade?: boolean;
  showScrollIndicator?: boolean;
  ariaLabel?: string;
}

export const HorizontalScrollRow: React.FC<HorizontalScrollRowProps> = ({
  children,
  title,
  subtitle,
  badge,
  viewAllAction,
  className = '',
  containerClassName = '',
  contentClassName = '',
  itemSpacing = 'gap-4',
  showControls = true,
  arrowPosition = 'header',
  scrollDistance = 'page',
  snap = true,
  edgeFade = true,
  showScrollIndicator = false,
  ariaLabel
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mouse drag-to-scroll state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  // Measure scrollability & progress
  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    const overflow = maxScroll > 4;

    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < maxScroll - 4);

    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    // ResizeObserver to detect layout / screen size changes
    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, children]);

  // Scroll actions
  const scrollByDirection = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const containerWidth = el.clientWidth;
    const distance = scrollDistance === 'page' 
      ? Math.max(280, Math.floor(containerWidth * 0.75)) 
      : scrollDistance;

    const targetOffset = direction === 'left' ? -distance : distance;
    el.scrollBy({ left: targetOffset, behavior: 'smooth' });
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el || !hasOverflow) return;

    // Only initiate drag on primary (left) mouse click
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    dragDistanceRef.current = 0;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Drag sensitivity
    dragDistanceRef.current = Math.abs(x - startXRef.current);
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      // Briefly maintain distance check so child click handler can intercept
      setTimeout(() => {
        dragDistanceRef.current = 0;
      }, 50);
    }
  };

  // Intercept click on child elements if user was dragging
  const handleCaptureClick = (e: React.MouseEvent) => {
    if (dragDistanceRef.current > 6) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByDirection('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByDirection('right');
    }
  };

  // Wheel handling for standard vertical mouse wheel on horizontal scroll row
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el || !hasOverflow) return;

    // If pure vertical wheel and shift not held, optionally convert deltaY to horizontal scroll if overflowing
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 10) {
      // Check if we can scroll in this direction
      const canScrollDown = e.deltaY > 0 && canScrollRight;
      const canScrollUp = e.deltaY < 0 && canScrollLeft;

      if (canScrollDown || canScrollUp) {
        // Smoothly nudge horizontally
        el.scrollLeft += e.deltaY * 0.8;
      }
    }
  };

  const hasHeader = Boolean(title || subtitle || viewAllAction || (showControls && arrowPosition === 'header'));
  const labelText = typeof title === 'string' ? title : ariaLabel || 'Feature items';

  return (
    <section 
      className={`relative w-full ${className}`}
      aria-label={labelText}
    >
      {/* Optional Header with Navigation Controls */}
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Left: Title, Subtitle, Badge */}
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {title && (
                <div className="text-base font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {title}
                </div>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Right: View All & Navigation Arrows */}
          <div className="flex items-center gap-2 shrink-0">
            {viewAllAction && (
              <button
                onClick={viewAllAction.onClick}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors px-1"
              >
                <span>{viewAllAction.label || 'View All'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {showControls && arrowPosition === 'header' && hasOverflow && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => scrollByDirection('left')}
                  disabled={!canScrollLeft}
                  aria-label={`Scroll ${labelText} backwards`}
                  className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-200 transition-all ${
                    canScrollLeft
                      ? 'hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs active:scale-95 cursor-pointer'
                      : 'opacity-30 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => scrollByDirection('right')}
                  disabled={!canScrollRight}
                  aria-label={`Scroll ${labelText} forward`}
                  className={`p-1.5 rounded-lg text-slate-700 dark:text-slate-200 transition-all ${
                    canScrollRight
                      ? 'hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 shadow-2xs active:scale-95 cursor-pointer'
                      : 'opacity-30 cursor-not-allowed text-slate-400'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Horizontal Scroll Container Wrapper */}
      <div className={`relative group/row ${containerClassName}`}>
        {/* Subtle Edge Fade: Left */}
        {edgeFade && hasOverflow && (
          <div 
            aria-hidden="true"
            className={`absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 pointer-events-none z-10 transition-opacity duration-200 ${
              canScrollLeft ? 'opacity-100' : 'opacity-0'
            }`} 
          />
        )}

        {/* Subtle Edge Fade: Right */}
        {edgeFade && hasOverflow && (
          <div 
            aria-hidden="true"
            className={`absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 pointer-events-none z-10 transition-opacity duration-200 ${
              canScrollRight ? 'opacity-100' : 'opacity-0'
            }`} 
          />
        )}

        {/* Side/Floating Navigation Arrows (when arrowPosition is 'sides' or 'floating') */}
        {showControls && (arrowPosition === 'sides' || arrowPosition === 'floating') && hasOverflow && (
          <>
            <button
              type="button"
              onClick={() => scrollByDirection('left')}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${labelText} backwards`}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-xs transition-all ${
                canScrollLeft
                  ? 'hover:scale-105 active:scale-95 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 opacity-90 hover:opacity-100 cursor-pointer'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => scrollByDirection('right')}
              disabled={!canScrollRight}
              aria-label={`Scroll ${labelText} forward`}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-xs transition-all ${
                canScrollRight
                  ? 'hover:scale-105 active:scale-95 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 opacity-90 hover:opacity-100 cursor-pointer'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          tabIndex={0}
          role="region"
          aria-label={labelText}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleCaptureClick}
          className={`flex items-stretch ${itemSpacing} overflow-x-auto overflow-y-hidden pb-2 pt-0.5 scrollbar-none ${
            snap ? 'snap-x snap-mandatory sm:snap-proximity' : ''
          } ${
            isDragging ? 'cursor-grabbing select-none' : hasOverflow ? 'cursor-grab sm:cursor-default' : ''
          } ${contentClassName}`}
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {children}
        </div>
      </div>

      {/* Optional Progress / Position Indicator */}
      {showScrollIndicator && hasOverflow && (
        <div className="w-full flex items-center justify-center pt-2">
          <div className="w-24 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(15, scrollProgress)}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
};
