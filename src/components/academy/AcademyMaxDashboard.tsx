import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Activity,
  Radio,
  Building2,
  Globe2,
  Gauge,
  Flame,
  Star,
  Plus,
  Play,
  Pause,
  ArrowUpRight,
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Sparkles,
  Layers,
  FileText,
  Calculator,
  Compass,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Volume2,
  TrendingUp,
  TrendingDown,
  Scale,
  Award,
  BookMarked,
  Languages,
  X,
  Share2
} from 'lucide-react';

import {
  ROADMAP_PHASES_DATA,
  ALL_135_CONCEPTS,
  MAX_CASE_STUDIES,
  MAX_TRADING_MYTHS,
  MAX_BULL_BEAR_DEBATES,
  CANDLESTICK_PATTERNS_SPEC,
  CHART_PATTERNS_SPEC
} from '@/data/academy/maxCurriculumData';

import {
  ULTRA_MASTERCLASSES,
  ULTRA_RESEARCH_PAPERS,
  ULTRA_BOOKS_LIBRARY,
  ULTRA_FORMULAS_COMPENDIUM,
  ULTRA_COMPETENCY_TRACKS,
  HINDI_TRADING_GLOSSARY
} from '@/data/academy/ultraCurriculumData';

import { MaxConceptItem, MaxCaseStudy, UltraMasterclass, UltraResearchPaper } from '@/types/academyTier';
import { Lesson } from '@/types/academy';

interface AcademyMaxDashboardProps {
  onOpenLesson?: (lesson: Lesson) => void;
  onNavigateTab?: (tabId: string) => void;
}

// Benchmark items with real-time indicators
const BENCHMARK_ITEMS = [
  { symbol: 'S&P 500', name: 'S&P 500 Index', price: '5,584.20', changePct: 0.54, category: 'EQUITIES' },
  { symbol: 'NASDAQ', name: 'Nasdaq 100', price: '19,742.10', changePct: 0.82, category: 'EQUITIES' },
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', price: '25,388.90', changePct: 0.76, category: 'EQUITIES' },
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: '1.1034', changePct: -0.22, category: 'FX' },
  { symbol: 'USD/INR', name: 'US Dollar / Rupee', price: '83.94', changePct: 0.04, category: 'FX' },
  { symbol: 'GOLD', name: 'Spot Gold (XAU/USD)', price: '2,514.80', changePct: 0.84, category: 'COMMODITIES' },
  { symbol: 'CRUDE OIL', name: 'WTI Crude', price: '68.97', changePct: 0.92, category: 'COMMODITIES' },
  { symbol: 'BITCOIN', name: 'Bitcoin (BTC/USD)', price: '58,240.00', changePct: 2.45, category: 'CRYPTO' },
  { symbol: 'US 10Y', name: 'US 10Y Yield', price: '3.65%', changePct: -0.04, category: 'BONDS' }
];

const SUB_SECTION_TABS = [
  { id: 'intelligence', label: 'Market Terminal', icon: Activity },
  { id: 'roadmap', label: '10-Phase Roadmap', icon: Compass },
  { id: 'concepts', label: '135 Concepts Vault', icon: Layers },
  { id: 'masterclasses', label: '22 Masterclasses', icon: GraduationCap },
  { id: 'cases', label: '15 Case Studies', icon: FileText },
  { id: 'research', label: 'Academic Papers & Books', icon: BookOpen },
  { id: 'formulas', label: 'Live Formulas & Sizing', icon: Calculator },
  { id: 'hindi', label: 'हिंदी शब्दावली (Glossary)', icon: Languages }
] as const;

export const AcademyMaxDashboard: React.FC<AcademyMaxDashboardProps> = ({
  onOpenLesson,
  onNavigateTab
}) => {
  // Mobile/Desktop active sub-section toggle
  const [mobileSubSection, setMobileSubSection] = useState<
    'intelligence' | 'roadmap' | 'concepts' | 'masterclasses' | 'cases' | 'research' | 'formulas' | 'hindi'
  >('intelligence');

  // Desktop & Mobile slidable tabs track state
  const tabsTrackRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [canSlideLeft, setCanSlideLeft] = useState(false);
  const [canSlideRight, setCanSlideRight] = useState(false);

  // Mouse drag-to-scroll refs for desktop
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const checkScrollState = useCallback(() => {
    const el = tabsTrackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = Math.max(0, scrollWidth - clientWidth);
    setCanSlideLeft(scrollLeft > 6);
    setCanSlideRight(scrollLeft < maxScroll - 6);
  }, []);

  useEffect(() => {
    const el = tabsTrackRef.current;
    if (!el) return;
    checkScrollState();

    const handleScroll = () => checkScrollState();
    el.addEventListener('scroll', handleScroll, { passive: true });

    // Wheel event listener to slide horizontally on desktop mouse wheel
    const handleWheelNative = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollBy({ left: e.deltaY * 1.2, behavior: 'auto' });
      }
    };
    el.addEventListener('wheel', handleWheelNative, { passive: false });

    const resizeObserver = new ResizeObserver(() => checkScrollState());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      el.removeEventListener('wheel', handleWheelNative);
      resizeObserver.disconnect();
    };
  }, [checkScrollState]);

  // Center active tab smoothly on change
  useEffect(() => {
    if (activeTabRef.current && tabsTrackRef.current) {
      const container = tabsTrackRef.current;
      const tabEl = activeTabRef.current;
      const tabLeft = tabEl.offsetLeft;
      const tabWidth = tabEl.offsetWidth;
      const containerWidth = container.clientWidth;
      const targetScroll = Math.max(0, tabLeft - containerWidth / 2 + tabWidth / 2);
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [mobileSubSection]);

  const slideTabs = (direction: 'left' | 'right') => {
    const el = tabsTrackRef.current;
    if (!el) return;
    const scrollAmount = Math.max(180, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  // Drag handlers for desktop mouse dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsTrackRef.current || e.button !== 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - tabsTrackRef.current.offsetLeft;
    scrollLeftRef.current = tabsTrackRef.current.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !tabsTrackRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsTrackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    dragDistanceRef.current = Math.abs(x - startXRef.current);
    tabsTrackRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  // Watchlist state
  const [watchlist, setWatchlist] = useState<string[]>([
    'GOLD',
    'BITCOIN',
    'NIFTY 50',
    'S&P 500',
    'EUR/USD',
    'US 10Y'
  ]);
  const [newAssetSymbol, setNewAssetSymbol] = useState('');
  const [showAddAsset, setShowAddAsset] = useState(false);

  // Audio Wire player state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(28);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAudioPlaying) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsAudioPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isAudioPlaying]);

  // Currency filter selection
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  // Concept filter & search state
  const [conceptSearch, setConceptSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedConceptItem, setSelectedConceptItem] = useState<MaxConceptItem | null>(null);

  // Masterclass detail modal state
  const [selectedMasterclass, setSelectedMasterclass] = useState<UltraMasterclass | null>(null);
  const [selectedResearchPaper, setSelectedResearchPaper] = useState<UltraResearchPaper | null>(null);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<MaxCaseStudy | null>(null);

  // Live Formula Calculator State
  const [activeCalculator, setActiveCalculator] = useState<'kelly' | 'ruin' | 'sizing' | 'expectancy'>('sizing');
  const [calcEquity, setCalcEquity] = useState<number>(10000);
  const [calcRiskPct, setCalcRiskPct] = useState<number>(1.0);
  const [calcEntryPrice, setCalcEntryPrice] = useState<number>(2500);
  const [calcStopPrice, setCalcStopPrice] = useState<number>(2475);
  const [calcWinRate, setCalcWinRate] = useState<number>(50);
  const [calcRewardRatio, setCalcRewardRatio] = useState<number>(2.0);

  // Calculated values
  const riskAmount = (calcEquity * calcRiskPct) / 100;
  const stopDistance = Math.abs(calcEntryPrice - calcStopPrice);
  const calculatedUnits = stopDistance > 0 ? (riskAmount / stopDistance).toFixed(2) : '0.00';
  
  // Kelly Criterion: (b*p - q) / b
  const p = calcWinRate / 100;
  const q = 1 - p;
  const b = calcRewardRatio;
  const rawKelly = b > 0 ? ((b * p - q) / b) * 100 : 0;
  const fullKelly = Math.max(0, rawKelly).toFixed(1);
  const halfKelly = Math.max(0, rawKelly * 0.5).toFixed(1);

  // Expectancy: (WR * b) - (LR * 1)
  const mathExpectancyR = (p * b - q * 1.0).toFixed(2);
  const mathExpectancyDollar = ((p * (riskAmount * b)) - (q * riskAmount)).toFixed(2);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    return ALL_135_CONCEPTS.filter(c => {
      const matchSearch =
        conceptSearch === '' ||
        c.title.toLowerCase().includes(conceptSearch.toLowerCase()) ||
        c.simpleExplanation.toLowerCase().includes(conceptSearch.toLowerCase()) ||
        c.id.toLowerCase().includes(conceptSearch.toLowerCase());
      const matchDomain = selectedDomain === 'ALL' || c.domain === selectedDomain;
      return matchSearch && matchDomain;
    });
  }, [conceptSearch, selectedDomain]);

  // Unique domains
  const availableDomains = useMemo(() => {
    const set = new Set<string>();
    ALL_135_CONCEPTS.forEach(c => set.add(c.domain));
    return ['ALL', ...Array.from(set)];
  }, []);

  const toggleWatchlist = (sym: string) => {
    setWatchlist(prev => 
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAddCustomSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssetSymbol.trim() && !watchlist.includes(newAssetSymbol.trim().toUpperCase())) {
      setWatchlist([...watchlist, newAssetSymbol.trim().toUpperCase()]);
      setNewAssetSymbol('');
      setShowAddAsset(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HEADER & COMPACT BADGE STRIP
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                ACADEMY INTELLIGENCE
              </span>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                135 Concepts • 22 Masterclasses • Live Terminal Feed
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Market Sync
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Market Intelligence Terminal & Advanced Academy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
              Real-time cross-asset data feeds, central bank policy radar, and institutional audio wire paired seamlessly with 135 foundational concepts, Wall Street case studies, and empirical academic research.
            </p>
          </div>

          {/* Desktop & Mobile Quick Metrics */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigateTab?.('labs')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer min-h-[40px] flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5 text-blue-500" />
              <span>Interactive Labs</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.('formulas')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm cursor-pointer min-h-[40px] flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Full Curriculum</span>
            </button>
          </div>
        </div>

        {/* SUB-SECTION SELECTOR (Slidable for Desktop & Mobile) */}
        <div className="relative mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Desktop Left Slide Arrow Button */}
          <button
            type="button"
            onClick={() => slideTabs('left')}
            disabled={!canSlideLeft}
            aria-label="Slide left"
            className={`hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 items-center justify-center transition-all cursor-pointer ${
              canSlideLeft 
                ? 'opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700' 
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Left Fade Gradient Mask */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 transition-opacity duration-200 ${
              canSlideLeft ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Slidable Tab Strip Track */}
          <div
            ref={tabsTrackRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 px-1 text-xs font-semibold select-none cursor-grab active:cursor-grabbing touch-pan-x"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {SUB_SECTION_TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = mobileSubSection === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : undefined}
                  type="button"
                  onClick={(e) => {
                    if (dragDistanceRef.current > 5) {
                      e.preventDefault();
                      return;
                    }
                    setMobileSubSection(tab.id as any);
                  }}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px] shrink-0 ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Fade Gradient Mask */}
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 transition-opacity duration-200 ${
              canSlideRight ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Desktop Right Slide Arrow Button */}
          <button
            type="button"
            onClick={() => slideTabs('right')}
            disabled={!canSlideRight}
            aria-label="Slide right"
            className={`hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 items-center justify-center transition-all cursor-pointer ${
              canSlideRight 
                ? 'opacity-90 hover:opacity-100 hover:scale-110 active:scale-95 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700' 
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION: SUB-VIEW ROUTING (DESKTOP & MOBILE RESPONSIVE)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

      {/* 1. MARKET TERMINAL & INTELLIGENCE VIEW */}
      {mobileSubSection === 'intelligence' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ────────── LEFT COLUMN (lg:col-span-4) ────────── */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* 1.1 MY MARKETS WATCHLIST */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Live Watchlist
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {watchlist.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddAsset(!showAddAsset)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{showAddAsset ? 'Cancel' : 'Add'}</span>
                </button>
              </div>

              {/* Add Custom Symbol Input */}
              {showAddAsset && (
                <form onSubmit={handleAddCustomSymbol} className="flex gap-2">
                  <input
                    type="text"
                    value={newAssetSymbol}
                    onChange={e => setNewAssetSymbol(e.target.value)}
                    placeholder="Enter ticker (e.g. TSLA, SOL)..."
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </form>
              )}

              {/* Watchlist Cards */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-0.5">
                {watchlist.map(sym => {
                  const item = BENCHMARK_ITEMS.find(b => b.symbol === sym || sym.includes(b.symbol));
                  const price = item?.price || (sym.includes('BTC') ? '58,240.00' : '2,514.80');
                  const change = item?.changePct ?? (sym.includes('BTC') ? 2.45 : 0.84);
                  const isPos = change >= 0;

                  return (
                    <div
                      key={sym}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-xs text-slate-900 dark:text-white truncate">
                            {sym}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item?.category || 'ASSET'}
                          </span>
                        </div>
                        <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                          {price}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Mini Sparkline */}
                        <div className="w-14 h-5 shrink-0">
                          <svg className="w-full h-full" viewBox="0 0 70 20">
                            <path
                              d={isPos ? "M0,15 Q10,18 25,10 T45,8 T70,3" : "M0,4 Q15,6 30,12 T50,15 T70,18"}
                              fill="none"
                              stroke={isPos ? '#10b981' : '#f43f5e'}
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>

                        <span className={`font-mono text-[11px] font-extrabold px-1.5 py-0.5 rounded ${
                          isPos
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        }`}>
                          {isPos ? `+${change}%` : `${change}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 1.2 1-MINUTE INSTITUTIONAL AUDIO FLASH & WIRE */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    1-Min Audio Wire
                  </h3>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 font-black border border-cyan-200 dark:border-cyan-800">
                  INSTITUTIONAL WIRE
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                        isAudioPlaying
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
                      }`}
                      title={isAudioPlaying ? 'Pause Audio Wire' : 'Play 1-Min Audio Brief'}
                    >
                      {isAudioPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 translate-x-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        Global Macro Briefing
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {isAudioPlaying ? 'Streaming audio...' : '01:15 • Synthesized Voice'}
                      </p>
                    </div>
                  </div>

                  {/* Equalizer animation */}
                  <div className="flex items-end gap-0.5 h-5 px-1">
                    {[35, 75, 100, 55, 80].map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full bg-cyan-500 transition-all duration-200 ${
                          isAudioPlaying ? 'animate-pulse' : 'opacity-30'
                        }`}
                        style={{ height: isAudioPlaying ? `${h}%` : '30%' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-cyan-400 rounded-full transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span>00:{Math.floor(audioProgress * 0.75).toString().padStart(2, '0')}</span>
                    <span>01:15</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  Macro synthesis: US inflation prints 3.5%, sovereign yield curve bull steepens, and central bank divergence drives JPY volatility.
                </p>
              </div>
            </div>

            {/* 1.3 CENTRAL BANK POLICY RADAR */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Central Bank Rates
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  POLICY RADAR
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { bank: 'US Fed (FOMC)', rate: '5.25 - 5.50%', nextDate: 'Sep 18', odds: '88% Cut 25bps', pct: 88, color: 'bg-emerald-500' },
                  { bank: 'ECB (Eurozone)', rate: '3.75%', nextDate: 'Sep 12', odds: '72% Cut 25bps', pct: 72, color: 'bg-blue-500' },
                  { bank: 'Bank of Japan', rate: '0.25%', nextDate: 'Sep 20', odds: '28% Hike 25bps', pct: 28, color: 'bg-amber-500' },
                  { bank: 'RBI (India)', rate: '6.50%', nextDate: 'Oct 09', odds: '91% Hold', pct: 91, color: 'bg-cyan-500' },
                ].map(item => (
                  <div key={item.bank} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.bank}</span>
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">{item.rate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>Next: {item.nextDate}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.odds}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-750 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1.4 CURRENCY STRENGTH & MACRO REGIME */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    Currency Matrix (24H)
                  </h3>
                </div>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  RELATIVE
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                {[
                  { code: 'USD', val: '+0.52', pos: true },
                  { code: 'AUD', val: '+0.44', pos: true },
                  { code: 'GBP', val: '+0.28', pos: true },
                  { code: 'INR', val: '+0.06', pos: true },
                  { code: 'CAD', val: '+0.04', pos: true },
                  { code: 'EUR', val: '-0.18', pos: false },
                  { code: 'CHF', val: '-0.32', pos: false },
                  { code: 'JPY', val: '-0.68', pos: false },
                ].map(c => (
                  <div
                    key={c.code}
                    className={`p-2 rounded-xl border text-xs ${
                      c.pos
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    <div className="font-black">{c.code}</div>
                    <div className="text-[10px]">{c.val}</div>
                  </div>
                ))}
              </div>

              {/* Macro Regime Radar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
                    <Gauge className="w-3.5 h-3.5 text-purple-500" />
                    Macro Regime
                  </span>
                  <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    EXPANSION
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                    <span className="text-[9px] text-slate-400 block">Fear & Greed</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">64 • Greed</strong>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300">
                    <span className="text-[9px] text-slate-400 block">CBOE VIX</span>
                    <strong>14.82 (-4.2%)</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ────────── RIGHT COLUMN (lg:col-span-8) ────────── */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 1.5 LIVE WIRE & HIGH-IMPACT CALENDAR */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    Global Economic Data & High-Impact Events
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  LIVE FEED
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'US Consumer Price Index (CPI YoY)',
                    time: '12:30 UTC',
                    countdown: 'in 2h 15m',
                    forecast: '3.5%',
                    prior: '3.7%',
                    impact: 'HIGH',
                    lessonLink: 'Phase 6: Macro & Inflation',
                    affectedAssets: ['XAU/USD', 'EUR/USD', 'US 10Y Yield', 'S&P 500']
                  },
                  {
                    title: 'ECB Deposit Facility Rate Decision',
                    time: '13:15 UTC',
                    countdown: 'in 3h 00m',
                    forecast: '3.50%',
                    prior: '3.75%',
                    impact: 'HIGH',
                    lessonLink: 'MC19: Central Bank Policy',
                    affectedAssets: ['EUR/USD', 'EUR/GBP', 'German Bund 10Y', 'DAX 40']
                  },
                  {
                    title: 'India Industrial Production (IIP YoY)',
                    time: '17:30 IST',
                    countdown: 'in 4h 45m',
                    forecast: '4.8%',
                    prior: '4.2%',
                    impact: 'MEDIUM',
                    lessonLink: 'Phase 6: Emerging Market Macro',
                    affectedAssets: ['NIFTY 50', 'USD/INR', 'India 10Y Yield']
                  },
                  {
                    title: 'US Initial Jobless Claims',
                    time: '12:30 UTC',
                    countdown: 'in 2h 15m',
                    forecast: '230K',
                    prior: '227K',
                    impact: 'MEDIUM',
                    lessonLink: 'Phase 6: Employment Dynamics',
                    affectedAssets: ['DXY', 'NASDAQ', 'USD/JPY']
                  }
                ].map((event, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/70 border border-slate-200/80 dark:border-slate-800 space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          event.impact === 'HIGH'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                        }`}>
                          {event.impact}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {event.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-slate-500">{event.time}</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">({event.countdown})</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono pt-1">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <span>Forecast: <strong className="text-slate-900 dark:text-white">{event.forecast}</strong></span>
                        <span>Prior: <strong>{event.prior}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-sans">Sensitivities:</span>
                        {event.affectedAssets.map(a => (
                          <span key={a} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] border border-slate-200 dark:border-slate-700">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Curriculum Context: {event.lessonLink}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setMobileSubSection('masterclasses')}
                        className="text-[11px] text-slate-500 hover:text-blue-500 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Study Setup</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1.6 INTERACTIVE LAB TEASER & RECENT CONCEPTS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Calculator className="w-4 h-4" />
                  <h4 className="font-black text-xs uppercase tracking-wider">
                    Position Sizing Lab
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Calculate precise unit sizing based on your invalidation stop distance before placing trades.
                </p>
                <button
                  type="button"
                  onClick={() => setMobileSubSection('formulas')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-xs inline-flex items-center gap-1"
                >
                  <span>Open Sizing Calculator</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-4 rounded-3xl bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 border border-purple-200/80 dark:border-purple-900/60 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="font-black text-xs uppercase tracking-wider">
                    Institutional Research Papers
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Review 15 peer-reviewed studies on day trader profitability, market momentum, and backtest overfitting.
                </p>
                <button
                  type="button"
                  onClick={() => setMobileSubSection('research')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-xs inline-flex items-center gap-1"
                >
                  <span>Explore Research Library</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. 10-PHASE ELITE ROADMAP */}
      {mobileSubSection === 'roadmap' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
              The 10-Phase Trader Transformation Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Structured progressive path from complete novice literacy to systematic quantitative research.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ROADMAP_PHASES_DATA.map((phase) => (
              <div
                key={phase.phase}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-0.5 rounded-lg text-xs font-black text-white"
                    style={{ backgroundColor: phase.badgeColor || '#3B82F6' }}
                  >
                    Phase {phase.phase}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {phase.timeframe}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {phase.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {phase.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Core Concepts Covered:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {phase.concepts.slice(0, 5).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                        {c}
                      </span>
                    ))}
                    {phase.concepts.length > 5 && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                        +{phase.concepts.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-blue-600 dark:text-blue-400 block mb-0.5">Milestone Exit Requirement:</strong>
                  {phase.milestone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 135 CONCEPTS VAULT */}
      {mobileSubSection === 'concepts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  135 Institutional Concept Vault
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every concept defined with plain explanation, formula, worked example, and common retail trap.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={conceptSearch}
                  onChange={e => setConceptSearch(e.target.value)}
                  placeholder="Search 135 concepts..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Domain Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {availableDomains.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomain(d)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer text-xs font-semibold ${
                    selectedDomain === d
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConcepts.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedConceptItem(item)}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer space-y-2.5 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.domain}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.simpleExplanation}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold truncate mr-2">
                    Mistake: {item.commonMistakes?.[0] || 'Over-leveraging risk'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. 22 MASTERCLASSES (MC01 - MC22) */}
      {mobileSubSection === 'masterclasses' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
              22 Institutional Masterclasses (MC01 - MC22)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Deep curriculum covering microstructure, order flow delta, Monte Carlo simulation, and execution algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ULTRA_MASTERCLASSES.map((mc) => (
              <div
                key={mc.id}
                onClick={() => setSelectedMasterclass(mc)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer space-y-3 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-600 text-white">
                      {mc.id}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {mc.category}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {mc.durationMinutes} min • {mc.lessonsCount} lessons
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {mc.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {mc.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Prereq: <strong className="text-slate-700 dark:text-slate-300">{mc.prerequisite}</strong>
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">
                    <span>View Syllabus</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 15 WALL STREET & DALAL STREET CASE STUDIES */}
      {mobileSubSection === 'cases' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
              15 Landmark Market Case Studies
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Dissecting historical market failures, short squeezes, and currency de-pegs to extract durable risk rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MAX_CASE_STUDIES.map((cs) => (
              <div
                key={cs.id}
                onClick={() => setSelectedCaseStudy(cs)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer space-y-3 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                    Case #{cs.number} • Institutional Study
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold">
                    Risk Breakdown
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  {cs.title}
                </h3>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Setup: <span className="font-normal">{cs.setup}</span>
                  </p>
                  <p className="text-rose-600 dark:text-rose-400 line-clamp-2">
                    Reality: {cs.realityOutcome}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 p-2 rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-700 dark:text-slate-300">
                  <strong className="text-emerald-600 dark:text-emerald-400 block mb-0.5">Golden Rule Derived:</strong>
                  {cs.lesson}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ACADEMIC PAPERS & TOP 30 BOOKS */}
      {mobileSubSection === 'research' && (
        <div className="space-y-6">
          {/* Research Papers */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              15 Curated Academic Research Papers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Peer-reviewed evidence on day trading survivability, momentum anomalies, and backtest overfitting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ULTRA_RESEARCH_PAPERS.map((paper) => (
              <div
                key={paper.id}
                onClick={() => setSelectedResearchPaper(paper)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-all cursor-pointer space-y-3 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                    {paper.year} • {paper.source}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500" />
                </div>

                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">
                  {paper.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Authors: {paper.authors}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {paper.plainSummary}
                </p>

                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs">
                  <strong className="text-purple-700 dark:text-purple-300 block mb-0.5">Trader Takeaway:</strong>
                  <span className="text-slate-700 dark:text-slate-300">{paper.traderTakeaway}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top 30 Books Library */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Top 30 Professional Trading & Quantitative Books
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Categorized by proficiency level, including Indian market literature and free alternatives.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ULTRA_BOOKS_LIBRARY.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold">
                    {book.level}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{book.year}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    by {book.author}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {book.keyLesson}
                </p>

                {book.freeAlternative && (
                  <div className="text-[10px] p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                    <strong>Free Resource:</strong> {book.freeAlternative}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. LIVE FORMULAS & POSITION SIZING */}
      {mobileSubSection === 'formulas' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
              Live Mathematical Compendium & Position Sizing Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Interactive calculators for fixed-fractional sizing, Kelly criterion growth, and mathematical trade expectancy.
            </p>
          </div>

          {/* Interactive Sizing Lab Widget */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Calculator className="w-5 h-5 text-blue-600" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                Live Position Sizing & Expectancy Calculator
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Account Equity ($ / ₹)
                </label>
                <input
                  type="number"
                  value={calcEquity}
                  onChange={e => setCalcEquity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Max Risk Per Trade (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calcRiskPct}
                  onChange={e => setCalcRiskPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Entry Price ($)
                </label>
                <input
                  type="number"
                  value={calcEntryPrice}
                  onChange={e => setCalcEntryPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Stop Loss Price ($)
                </label>
                <input
                  type="number"
                  value={calcStopPrice}
                  onChange={e => setCalcStopPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                  Exact Dollar Risk (1R)
                </span>
                <p className="text-xl font-black font-mono text-blue-700 dark:text-blue-300">
                  ${riskAmount.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500">
                  {calcRiskPct}% of ${calcEquity.toLocaleString()}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Optimal Position Units
                </span>
                <p className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                  {calculatedUnits} Units
                </p>
                <span className="text-[10px] text-slate-500">
                  Based on ${stopDistance.toFixed(2)} stop distance
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-1">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  Half-Kelly Recommendation
                </span>
                <p className="text-xl font-black font-mono text-purple-700 dark:text-purple-300">
                  {halfKelly}% Sizing
                </p>
                <span className="text-[10px] text-slate-500">
                  Assuming {calcWinRate}% WR & {calcRewardRatio}:1 R:R
                </span>
              </div>
            </div>
          </div>

          {/* Formula Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ULTRA_FORMULAS_COMPENDIUM.map((f) => (
              <div
                key={f.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {f.id} • {f.section}
                  </span>
                </div>

                <h3 className="font-black text-sm text-slate-900 dark:text-white">
                  {f.name}
                </h3>

                <div className="p-3 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto">
                  {f.formula}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  <strong>Example:</strong> {f.workedExample}
                </p>

                <p className="text-xs text-rose-600 dark:text-rose-400">
                  <strong>Common Trap:</strong> {f.commonMistake}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. HINDI TRADING GLOSSARY */}
      {mobileSubSection === 'hindi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
              हिंदी ट्रेडिंग शब्दावली (Hindi Trading Terminology)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear Hindi and Hinglish translations for key institutional trading concepts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HINDI_TRADING_GLOSSARY.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                    {item.english}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {item.hinglish}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {item.hindi}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL: CONCEPT VIEW MODAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {selectedConceptItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                  {selectedConceptItem.id}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {selectedConceptItem.domain}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConceptItem(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {selectedConceptItem.title}
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Plain-English Meaning:</strong>
                <p className="leading-relaxed">{selectedConceptItem.simpleExplanation}</p>
              </div>

              {selectedConceptItem.professionalExplanation && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                  <strong className="text-slate-900 dark:text-white block mb-1">Institutional Context:</strong>
                  <p>{selectedConceptItem.professionalExplanation}</p>
                </div>
              )}

              {selectedConceptItem.formulas && selectedConceptItem.formulas.length > 0 && (
                <div>
                  <strong className="text-slate-900 dark:text-white block mb-1">Mathematical Formula:</strong>
                  <pre className="p-3 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto">
                    {selectedConceptItem.formulas[0].expression}
                  </pre>
                  <p className="text-xs text-slate-500 mt-1">{selectedConceptItem.formulas[0].description}</p>
                </div>
              )}

              {selectedConceptItem.commonMistakes && selectedConceptItem.commonMistakes.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                  <strong className="block mb-1">Common Retail Mistake / Trap:</strong>
                  <ul className="list-disc list-inside space-y-0.5">
                    {selectedConceptItem.commonMistakes.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConceptItem.realScenario?.keyTakeaway && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                  <strong className="block mb-1">Key Takeaway:</strong>
                  <p>{selectedConceptItem.realScenario.keyTakeaway}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConceptItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Close Concept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL: MASTERCLASS DETAIL MODAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {selectedMasterclass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">
                  {selectedMasterclass.id}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {selectedMasterclass.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMasterclass(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {selectedMasterclass.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {selectedMasterclass.description}
            </p>

            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Course Syllabus ({selectedMasterclass.lessons.length} Modules):
              </h3>
              <div className="space-y-2">
                {selectedMasterclass.lessons.map(les => (
                  <div key={les.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{les.title}</span>
                      <span className="font-mono text-slate-400">{les.durationMin} min</span>
                    </div>
                    <p className="text-xs text-slate-500">{les.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
              <strong className="text-blue-700 dark:text-blue-300 block mb-0.5">Practical Assignment:</strong>
              {selectedMasterclass.practicalAssignment}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMasterclass(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL: CASE STUDY DETAIL MODAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {selectedCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  Case #{selectedCaseStudy.number} • Risk Autopsy
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCaseStudy(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {selectedCaseStudy.title}
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-1">Trade Setup & Thesis:</strong>
                <p>{selectedCaseStudy.setup}</p>
              </div>

              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Market Scenario:</strong>
                <p>{selectedCaseStudy.scenario}</p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
                <strong className="text-rose-700 dark:text-rose-300 block mb-1">Reality Outcome:</strong>
                <p>{selectedCaseStudy.realityOutcome}</p>
              </div>

              {selectedCaseStudy.mathExplanation && (
                <div className="p-3 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-xs">
                  <strong className="block mb-1 text-slate-400">Mathematical Explanation:</strong>
                  <p>{selectedCaseStudy.mathExplanation}</p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200">
                <strong className="block mb-1">The Institutional Lesson:</strong>
                <p className="font-bold">{selectedCaseStudy.lesson}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCaseStudy(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL: RESEARCH PAPER DETAIL MODAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {selectedResearchPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-purple-600">
                {selectedResearchPaper.year} • {selectedResearchPaper.source}
              </span>
              <button
                type="button"
                onClick={() => setSelectedResearchPaper(null)}
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {selectedResearchPaper.title}
            </h2>

            <p className="text-xs text-slate-500 font-mono">
              Authors: {selectedResearchPaper.authors}
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div>
                <strong className="text-slate-900 dark:text-white block mb-1">Executive Summary:</strong>
                <p className="leading-relaxed">{selectedResearchPaper.plainSummary}</p>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
                <strong className="text-purple-700 dark:text-purple-300 block mb-1">Key Empirical Finding:</strong>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedResearchPaper.keyFinding}</p>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <strong className="text-blue-700 dark:text-blue-300 block mb-1">Practical Trader Takeaway:</strong>
                <p>{selectedResearchPaper.traderTakeaway}</p>
              </div>

              <div className="text-xs text-slate-500">
                <strong>Study Limitations:</strong> {selectedResearchPaper.limitations}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <a
                href={selectedResearchPaper.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                <span>Read Full Paper on SSRN/JSTOR</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setSelectedResearchPaper(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
