import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { calculateKPIs } from '@/lib/calculations';
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
  ArrowDownRight
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

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' }) {
  return (
    <Card className="p-6 shadow-sm border-slate-200 flex flex-col justify-between h-32">
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend !== 'neutral' && (
          <span className={`flex items-center text-sm font-medium mb-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
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

// --- Reusable Dropdown Component ---
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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border outline-none min-w-[140px]",
          isActive 
            ? "bg-blue-50 border-blue-200 text-blue-700" 
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
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
            className="w-4 h-4 text-blue-400 hover:text-blue-600 transition-colors" 
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
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors",
                value === opt ? "bg-blue-50/50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"
              )}
            >
              {opt}
              {value === opt && <Check className="w-4 h-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { trades: rawTrades } = useData();
  const [trades, setTrades] = useState<Trade[]>([]);
  
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

  // Fetch initial trades
  useEffect(() => {
    setTrades([...rawTrades]);
  }, [rawTrades]);

  // Compute dynamic strategy list based on user's trades
  const strategyOptions = useMemo(() => {
    const strats = new Set(trades.map(t => t.strategy).filter(Boolean) as string[]);
    return ['All Strategies', ...Array.from(strats)];
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

      return dateMatch && marketMatch && directionMatch && sessionMatch && strategyMatch && resultMatch;
    });
  }, [trades, dateRange, customStart, customEnd, market, direction, session, strategy, result]);

  const resetFilters = () => {
    setDateRange('All Time');
    setCustomStart('');
    setCustomEnd('');
    setMarket('All Markets');
    setDirection('All Directions');
    setSession('All Sessions');
    setStrategy('All Strategies');
    setResult('All Trades');
  };

  const activeFilterCount = [
    dateRange !== 'All Time',
    market !== 'All Markets',
    direction !== 'All Directions',
    session !== 'All Sessions',
    strategy !== 'All Strategies',
    result !== 'All Trades'
  ].filter(Boolean).length;

  const kpis = calculateKPIs(filteredTrades);

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
      <Card className="p-1 border border-slate-200 shadow-sm bg-white rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2 p-2">
          
          <div className="flex items-center gap-2 px-2 py-1 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 flex-1">
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
          </div>

          <div className="flex items-center gap-4 pl-4 border-l border-slate-100 ml-auto">
            <div className="text-sm font-medium text-slate-500 whitespace-nowrap">
              <span className="text-slate-900 font-bold">{filteredTrades.length}</span> trades
            </div>
            
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetFilters}
                className="text-slate-500 hover:text-slate-900 px-2 h-9 border border-transparent hover:bg-slate-100 transition-colors"
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
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Performance Overview</h2>
            
            {/* KPI Stats Row 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Net P&L" 
                value={formatCurrency(kpis.netPnl)}
                icon={<DollarSign className="w-5 h-5 text-blue-600" />}
                trend={kpis.netPnl >= 0 ? 'up' : 'down'}
              />
              <StatCard 
                title="Win Rate" 
                value={`${formatNumber(kpis.winRate, 1)}%`}
                icon={<Target className="w-5 h-5 text-blue-600" />}
                trend={kpis.winRate >= 50 ? 'up' : 'down'}
              />
              <StatCard 
                title="Total Trades" 
                value={kpis.totalTrades.toString()}
                icon={<Activity className="w-5 h-5 text-blue-600" />}
                trend="neutral"
              />
              <StatCard 
                title="Profit Factor" 
                value={kpis.closedTradesCount === 0 ? '--' : (kpis.isAllWins ? 'Max (All Wins)' : (kpis.profitFactor > 0 ? formatNumber(kpis.profitFactor, 2) : '0.00'))}
                icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
                trend={kpis.closedTradesCount === 0 ? 'neutral' : (kpis.profitFactor >= 1 ? 'up' : 'down')}
              />
            </div>

            {/* KPI Stats Row 2 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Expectancy" 
                value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.expectancy) : '--'}
                icon={<Crosshair className="w-5 h-5 text-blue-600" />}
                trend={kpis.expectancy >= 0 && kpis.closedTradesCount > 0 ? 'up' : (kpis.closedTradesCount > 0 ? 'down' : 'neutral')}
              />
              <StatCard 
                title="Average R" 
                value={kpis.closedTradesCount > 0 ? `${formatNumber(kpis.averageR, 2)}R` : '--'}
                icon={<Target className="w-5 h-5 text-blue-600" />}
                trend={kpis.averageR > 0 ? 'up' : (kpis.averageR < 0 ? 'down' : 'neutral')}
              />
              <StatCard 
                title="Max Drawdown" 
                value={kpis.maxDrawdown > 0 ? `-${formatCurrency(kpis.maxDrawdown)}` : '--'}
                icon={<TrendingDown className="w-5 h-5 text-red-600" />}
                trend="down"
              />
              <StatCard 
                title="Average Risk" 
                value={kpis.closedTradesCount > 0 ? formatCurrency(kpis.averageRisk) : '--'}
                icon={<Scale className="w-5 h-5 text-blue-600" />}
                trend="neutral"
              />
            </div>
            
            <div className="pt-8 flex flex-col items-center justify-center opacity-60">
              <p className="text-sm text-slate-400 mt-1">Charts and additional insights will be added in the next step.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
