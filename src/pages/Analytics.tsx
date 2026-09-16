import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { calculateInstitutionalMetrics, AnalyticsMetrics } from '@/lib/analyticsEngine';
import { OverviewTab } from '@/components/analytics/OverviewTab';
import { PerformanceTab } from '@/components/analytics/PerformanceTab';
import { TradeAnalysisTab } from '@/components/analytics/TradeAnalysisTab';
import { StrategyResearchTab } from '@/components/analytics/StrategyResearchTab';
import { BehavioralAnalyticsTab } from '@/components/analytics/BehavioralAnalyticsTab';
import { SetupQualityTab } from '@/components/analytics/SetupQualityTab';
import { EvidenceExplorerModal } from '@/components/analytics/EvidenceExplorerModal';
import { 
  Calendar, 
  ChevronDown, 
  Filter, 
  RotateCcw, 
  X, 
  SearchX,
  Check,
  DollarSign,
  Target,
  Activity,
  TrendingUp,
  Crosshair,
  TrendingDown,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Bot,
  ArrowRight,
  Sparkles,
  Info,
  BarChart2,
  PieChart,
  LineChart,
  Globe2,
  Flame
} from 'lucide-react';
import { 
  isToday, 
  isThisWeek, 
  isThisMonth, 
  isThisYear, 
  subMonths, 
  isAfter, 
  isWithinInterval, 
  startOfDay, 
  endOfDay 
} from 'date-fns';

function StatCard({ title, value, icon, trend, tooltip, sampleSize }: { title: string, value: React.ReactNode, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' | 'none', tooltip?: string, sampleSize?: number }) {
  return (
    <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
          {tooltip && (
            <div className="group/tooltip relative">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                {tooltip}
                {sampleSize !== undefined && (
                  <div className="mt-1 pt-1 border-t border-slate-700 font-mono">
                    n = {sampleSize} trades
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2 relative z-10">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
        {trend !== 'none' && (
          <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
            trend === 'down' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : trend === 'down' ? <ArrowDownRight className="w-4 h-4 mr-0.5" /> : null}
          </span>
        )}
      </div>
    </Card>
  );
}

type DateRangeOption = 
  | 'Today'
  | 'This Week'
  | 'This Month'
  | 'Last 3 Months'
  | 'Last 6 Months'
  | 'This Year'
  | 'All Time'
  | 'Custom Range';

const DATE_OPTIONS: DateRangeOption[] = [
  'Today', 'This Week', 'This Month', 'Last 3 Months', 'Last 6 Months', 'This Year', 'All Time', 'Custom Range'
];

const MARKET_OPTIONS = ['All Markets', 'Gold', 'Crypto', 'Forex'];
const DIRECTION_OPTIONS = ['All Directions', 'BUY', 'SELL'];
const SESSION_OPTIONS = ['All Sessions', 'Asian', 'London', 'New York', 'Sydney'];
const RESULT_OPTIONS = ['All Trades', 'Winning Trades', 'Losing Trades', 'Breakeven'];
const MACRO_OPTIONS = ['All Macro Contexts', 'News Catalyst Trades Only', 'Standard Sessions Only', 'High Impact Catalyst Only'];
const TIMEFRAME_OPTIONS = ['All Timeframes', '1m', '3m', '5m', '15m', '30m', '1H', '4H', 'Daily', 'Other'];
const EMOTION_OPTIONS = ['All Emotions', 'Confident', 'Unconfident'];
const RISK_OPTIONS = ['All Risk %', '< 1%', '1-2%', '> 2%'];
const R_MULTIPLE_OPTIONS = ['All R Multiples', '< 0R', '0-1R', '1-2R', '2-3R', '> 3R'];
const RULE_ADHERENCE_OPTIONS = ['All Adherence', '100%', '80-99%', '< 80%'];
const SETUP_QUALITY_OPTIONS = ['All Qualities', 'A+ Setups', 'B Setups', 'C Setups', 'Not Rated'];

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  defaultVal,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  defaultVal: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const isActive = value !== defaultVal;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", isOpen ? "z-50" : "z-10")} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border outline-none min-w-[140px]",
          isActive 
            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300" 
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600"
        )}
      >
        <span className="truncate flex-1 text-left">
          {isActive ? (
            <span className="flex items-center gap-1.5">
              <span className="font-semibold">{label}:</span> {value}
            </span>
          ) : (
            label
          )}
        </span>
        
        {isActive ? (
          <X 
            className="w-4 h-4 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors" 
            onClick={(e) => {
              e.stopPropagation();
              onChange(defaultVal);
            }} 
          />
        ) : (
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[180px] w-max max-w-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 py-1 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
                value === opt ? "bg-blue-50/70 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              )}
            >
              <span className="truncate">{opt}</span>
              {value === opt && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { trades: rawTrades } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  
  // Tabs for the main view
  const validTabs = ['overview', 'performance', 'tradeAnalysis', 'strategyResearch', 'setupQuality', 'behavioral'] as const;
  type AnalyticsTab = typeof validTabs[number];
  const urlTab = searchParams.get('tab') as AnalyticsTab | null;
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(
    urlTab && validTabs.includes(urlTab) ? urlTab : 'overview'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') as AnalyticsTab | null;
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleSelectTab = (tab: AnalyticsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Evidence Explorer State
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [evidenceProps, setEvidenceProps] = useState({
    claim: '',
    methodology: '',
    limitations: '',
    trades: [] as Trade[],
    statisticLabel: '',
    statisticValue: ''
  });

  const handleOpenEvidence = (claim: string, methodology: string, limitations: string, filterTrades: Trade[], statisticLabel: string, statisticValue: string) => {
    setEvidenceProps({ claim, methodology, limitations, trades: filterTrades, statisticLabel, statisticValue });
    setEvidenceModalOpen(true);
  };

  
  // -- Filter States --
  const [dateRange, setDateRange] = useState<DateRangeOption>(() => {
    try {
      const saved = localStorage.getItem('tradevault_settings');
      if (saved) {
        const s = JSON.parse(saved);
        if (s.analytics?.defaultPeriod) return s.analytics.defaultPeriod as DateRangeOption;
      }
    } catch(e) {}
    return 'All Time';
  });
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  const [market, setMarket] = useState('All Markets');
  const [direction, setDirection] = useState('All Directions');
  const [session, setSession] = useState('All Sessions');
  const [strategy, setStrategy] = useState('All Strategies');
  const [result, setResult] = useState('All Trades');
  const [macroContext, setMacroContext] = useState('All Macro Contexts');
  const [timeframe, setTimeframe] = useState('All Timeframes');
  const [emotion, setEmotion] = useState('All Emotions');
  const [riskPercent, setRiskPercent] = useState('All Risk %');
  const [rMultiple, setRMultiple] = useState('All R Multiples');
  const [ruleAdherence, setRuleAdherence] = useState('All Adherence');
  const [setupQuality, setSetupQuality] = useState('All Qualities');

  // Fetch initial trades
  useEffect(() => {
    setTrades([...rawTrades]);
  }, [rawTrades]);

  // Compute dynamic strategy list based on user's trades
  const strategyOptions = useMemo(() => {
    const strats = new Set(trades.map(t => t.strategy).filter(Boolean) as string[]);
    return ['All Strategies', ...Array.from(strats)];
  }, [trades]);

  // Macro catalyst comparative breakdown
  const macroComparison = useMemo(() => {
    const newsTrades = trades.filter(t => Boolean(t.newsEventId || t.newsEventName));
    const nonNewsTrades = trades.filter(t => !t.newsEventId && !t.newsEventName);

    const calcQuickStats = (list: Trade[]) => {
      const closed = list.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
      const wins = closed.filter(t => t.result === 'WIN');
      const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
      const totalPnl = closed.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossLoss = Math.abs(closed.filter(t => t.result === 'LOSS').reduce((acc, t) => acc + (t.pnl || 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);
      return { count: list.length, closedCount: closed.length, winRate, totalPnl, profitFactor };
    };

    return {
      news: calcQuickStats(newsTrades),
      nonNews: calcQuickStats(nonNewsTrades),
      hasNewsData: newsTrades.length > 0
    };
  }, [trades]);

  // Click outside listener for Date Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // -- Central Filter Logic --
  const filteredTrades = useMemo(() => {
    return trades.filter(trade => {
      // 1. Date Range Filter
      const tradeDate = new Date(trade.date);
      const now = new Date();
      let dateMatch = true;
      
      switch (dateRange) {
        case 'Today': 
          dateMatch = isToday(tradeDate); 
          break;
        case 'This Week': 
          dateMatch = isThisWeek(tradeDate); 
          break;
        case 'This Month': 
          dateMatch = isThisMonth(tradeDate); 
          break;
        case 'Last 3 Months': 
          dateMatch = isAfter(tradeDate, subMonths(now, 3)); 
          break;
        case 'Last 6 Months': 
          dateMatch = isAfter(tradeDate, subMonths(now, 6)); 
          break;
        case 'This Year': 
          dateMatch = isThisYear(tradeDate); 
          break;
        case 'Custom Range': 
          if (customStart && customEnd) {
             dateMatch = isWithinInterval(tradeDate, { 
               start: startOfDay(new Date(customStart)), 
               end: endOfDay(new Date(customEnd)) 
             });
          }
          break;
        case 'All Time':
        default:
          dateMatch = true;
      }

      // 2. Market Filter
      const marketMatch = market === 'All Markets' || trade.market === market;
      
      // 3. Direction Filter
      const directionMatch = direction === 'All Directions' || trade.direction === direction;
      
      // 4. Session Filter
      const sessionMatch = session === 'All Sessions' || trade.session === session;
      
      // 5. Strategy Filter
      const strategyMatch = strategy === 'All Strategies' || trade.strategy === strategy;
      
      // 6. Result Filter
      let resultMatch = true;
      if (result === 'Winning Trades') resultMatch = trade.result === 'WIN';
      else if (result === 'Losing Trades') resultMatch = trade.result === 'LOSS';
      else if (result === 'Breakeven') resultMatch = trade.result === 'BREAK EVEN';

      // 7. Macro Catalyst Filter
      let macroMatch = true;
      const hasNews = Boolean(trade.newsEventId || trade.newsEventName);
      if (macroContext === 'News Catalyst Trades Only') {
        macroMatch = hasNews;
      } else if (macroContext === 'Standard Sessions Only') {
        macroMatch = !hasNews;
      } else if (macroContext === 'High Impact Catalyst Only') {
        macroMatch = hasNews && trade.newsImpact === 'HIGH';
      }

      // 8. Timeframe
      const timeframeMatch = timeframe === 'All Timeframes' || trade.timeframe === timeframe;
      // 9. Emotion
      const emotionMatch = emotion === 'All Emotions' || (trade.emotions && trade.emotions.includes(emotion));
      // 10. Risk Percent
      let riskMatch = true;
      if (riskPercent === '< 1%') riskMatch = (trade.riskPercent || 0) < 1;
      else if (riskPercent === '1-2%') riskMatch = (trade.riskPercent || 0) >= 1 && (trade.riskPercent || 0) <= 2;
      else if (riskPercent === '> 2%') riskMatch = (trade.riskPercent || 0) > 2;
      // 11. R Multiple
      let rMatch = true;
      if (rMultiple === '< 0R') rMatch = (trade.rMultiple || 0) < 0;
      else if (rMultiple === '0-1R') rMatch = (trade.rMultiple || 0) >= 0 && (trade.rMultiple || 0) <= 1;
      else if (rMultiple === '1-2R') rMatch = (trade.rMultiple || 0) > 1 && (trade.rMultiple || 0) <= 2;
      else if (rMultiple === '2-3R') rMatch = (trade.rMultiple || 0) > 2 && (trade.rMultiple || 0) <= 3;
      else if (rMultiple === '> 3R') rMatch = (trade.rMultiple || 0) > 3;
      // 12. Rule Adherence
      let ruleMatch = true;
      if (ruleAdherence === '100%') ruleMatch = trade.ruleAdherence === 100;
      else if (ruleAdherence === '80-99%') ruleMatch = (trade.ruleAdherence || 0) >= 80 && (trade.ruleAdherence || 0) < 100;
      else if (ruleAdherence === '< 80%') ruleMatch = (trade.ruleAdherence || 0) < 80;

      // 13. Setup Quality
      let qualityMatch = true;
      if (setupQuality === 'A+ Setups') qualityMatch = trade.setupQuality === 'A+';
      else if (setupQuality === 'B Setups') qualityMatch = trade.setupQuality === 'B';
      else if (setupQuality === 'C Setups') qualityMatch = trade.setupQuality === 'C';
      else if (setupQuality === 'Not Rated') qualityMatch = !trade.setupQuality;

      return dateMatch && marketMatch && directionMatch && sessionMatch && strategyMatch && resultMatch && macroMatch && timeframeMatch && emotionMatch && riskMatch && rMatch && ruleMatch && qualityMatch;
    });
  }, [trades, dateRange, customStart, customEnd, market, direction, session, strategy, result, macroContext, timeframe, emotion, riskPercent, rMultiple, ruleAdherence, setupQuality]);

  const resetFilters = () => {
    setDateRange('All Time');
    setCustomStart('');
    setCustomEnd('');
    setMarket('All Markets');
    setDirection('All Directions');
    setSession('All Sessions');
    setStrategy('All Strategies');
    setResult('All Trades');
    setMacroContext('All Macro Contexts');
    setTimeframe('All Timeframes');
    setEmotion('All Emotions');
    setRiskPercent('All Risk %');
    setRMultiple('All R Multiples');
    setRuleAdherence('All Adherence');
    setSetupQuality('All Qualities');
  };

  const activeFilterCount = [
    dateRange !== 'All Time',
    market !== 'All Markets',
    direction !== 'All Directions',
    session !== 'All Sessions',
    strategy !== 'All Strategies',
    result !== 'All Trades',
    macroContext !== 'All Macro Contexts',
    timeframe !== 'All Timeframes',
    emotion !== 'All Emotions',
    riskPercent !== 'All Risk %',
    rMultiple !== 'All R Multiples',
    ruleAdherence !== 'All Adherence',
    setupQuality !== 'All Qualities'
  ].filter(Boolean).length;

  const kpis = calculateInstitutionalMetrics(filteredTrades);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1.5 text-base">
            Understand your trading performance and discover where your edge comes from.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="relative shrink-0" ref={dateDropdownRef}>
          <button
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            className="w-full md:w-auto flex items-center justify-between gap-3 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{dateRange}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isDateDropdownOpen && "rotate-180")} />
          </button>

          {isDateDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 p-1.5">
              <div className="flex flex-col">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      if (opt !== 'Custom Range') setIsDateDropdownOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-left",
                      dateRange === opt ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {opt}
                    {dateRange === opt && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>

              {dateRange === 'Custom Range' && (
                <div className="p-3 mt-2 border-t border-slate-100 space-y-3 bg-slate-50/50 rounded-b-lg">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">Start Date</label>
                    <input 
                      type="date" 
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full text-sm p-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500">End Date</label>
                    <input 
                      type="date" 
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full text-sm p-2 rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    className="w-full mt-2" 
                    size="sm" 
                    onClick={() => setIsDateDropdownOpen(false)}
                    disabled={!customStart || !customEnd}
                  >
                    Apply Range
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-1 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-xl !overflow-visible overflow-visible relative z-30">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-2 relative z-30 overflow-visible">
          
          <div className="flex items-center gap-2 px-2 py-1 text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1 relative z-30 overflow-visible">
            <FilterDropdown 
              label="Market"
              value={market}
              options={MARKET_OPTIONS}
              onChange={setMarket}
              defaultVal="All Markets"
            />
            <FilterDropdown 
              label="Direction"
              value={direction}
              options={DIRECTION_OPTIONS}
              onChange={setDirection}
              defaultVal="All Directions"
            />
            <FilterDropdown 
              label="Session"
              value={session}
              options={SESSION_OPTIONS}
              onChange={setSession}
              defaultVal="All Sessions"
            />
            <FilterDropdown 
              label="Strategy"
              value={strategy}
              options={strategyOptions}
              onChange={setStrategy}
              defaultVal="All Strategies"
            />
            <FilterDropdown 
              label="Result"
              value={result}
              options={RESULT_OPTIONS}
              onChange={setResult}
              defaultVal="All Trades"
            />
            <FilterDropdown 
              label="Macro"
              value={macroContext}
              options={MACRO_OPTIONS}
              onChange={setMacroContext}
              defaultVal="All Macro Contexts"
            />
            <FilterDropdown 
              label="Setup Quality"
              value={setupQuality}
              options={SETUP_QUALITY_OPTIONS}
              onChange={setSetupQuality}
              defaultVal="All Qualities"
            />
            <FilterDropdown 
              label="Timeframe"
              value={timeframe}
              options={TIMEFRAME_OPTIONS}
              onChange={setTimeframe}
              defaultVal="All Timeframes"
            />
            <FilterDropdown 
              label="Emotion"
              value={emotion}
              options={EMOTION_OPTIONS}
              onChange={setEmotion}
              defaultVal="All Emotions"
            />
            <FilterDropdown 
              label="Risk %"
              value={riskPercent}
              options={RISK_OPTIONS}
              onChange={setRiskPercent}
              defaultVal="All Risk %"
            />
            <FilterDropdown 
              label="R Multiple"
              value={rMultiple}
              options={R_MULTIPLE_OPTIONS}
              onChange={setRMultiple}
              defaultVal="All R Multiples"
            />
            <FilterDropdown 
              label="Rule Adherence"
              value={ruleAdherence}
              options={RULE_ADHERENCE_OPTIONS}
              onChange={setRuleAdherence}
              defaultVal="All Adherence"
            />
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-100 dark:border-slate-800 ml-auto">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              <span className="text-slate-900 dark:text-slate-100 font-bold">{filteredTrades.length}</span> trades
            </div>
            
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 px-2 h-9 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area (To be filled in future steps) */}
      <div className="pt-6">
        {filteredTrades.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-5">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No trades match your filters</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Try changing your filters or date range to see analytics for a different set of trades.
            </p>
            {activeFilterCount > 0 && (
              <Button onClick={resetFilters} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Reset All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
              <button onClick={() => handleSelectTab('overview')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Overview</button>
              <button onClick={() => handleSelectTab('performance')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'performance' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Performance</button>
              <button onClick={() => handleSelectTab('tradeAnalysis')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'tradeAnalysis' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Trade Analysis</button>
              <button onClick={() => handleSelectTab('strategyResearch')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'strategyResearch' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Strategy Research</button>
              <button onClick={() => handleSelectTab('setupQuality')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'setupQuality' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Setup Quality</button>
              <button onClick={() => handleSelectTab('behavioral')} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'behavioral' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>Behavioral Analytics</button>
            </div>

            {activeTab === 'overview' && <OverviewTab trades={filteredTrades} metrics={kpis} onOpenEvidence={handleOpenEvidence} />}
            {activeTab === 'performance' && <PerformanceTab trades={filteredTrades} metrics={kpis} />}
            {activeTab === 'tradeAnalysis' && <TradeAnalysisTab trades={filteredTrades} />}
            {activeTab === 'strategyResearch' && <StrategyResearchTab trades={filteredTrades} />}
            {activeTab === 'setupQuality' && <SetupQualityTab trades={filteredTrades} onOpenEvidence={handleOpenEvidence} />}
            {activeTab === 'behavioral' && <BehavioralAnalyticsTab trades={filteredTrades} />}
          </div>
        )}
      </div>

      <EvidenceExplorerModal 
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        {...evidenceProps}
      />
    </div>
  );
}
