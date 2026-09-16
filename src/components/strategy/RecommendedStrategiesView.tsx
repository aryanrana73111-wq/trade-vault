import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RECOMMENDED_STRATEGIES } from '@/data/strategyResearchLibrary';
import { RecommendedStrategy, StrategyCategory, MarketType, TimeframeType, EvidenceGrade } from '@/data/strategyResearchTypes';
import { RecommendedStrategyDetailModal } from './RecommendedStrategyDetailModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Filter, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Info, 
  CheckCircle2, 
  BookOpen, 
  Layers,
  Sparkles,
  BarChart2,
  X,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';

interface Props {
  onCompareStrategies?: (strategies: RecommendedStrategy[]) => void;
}

export const RecommendedStrategiesView: React.FC<Props> = ({ onCompareStrategies }) => {
  const navigate = useNavigate();
  const { saveStrategy } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMarket, setSelectedMarket] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedStyle, setSelectedStyle] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'grade' | 'expectancy' | 'sampleSize' | 'profitFactor' | 'drawdown' | 'name'>('grade');

  // Modal State
  const [activeStrategy, setActiveStrategy] = useState<RecommendedStrategy | null>(null);

  // Comparison State
  const [comparedStrategies, setComparedStrategies] = useState<RecommendedStrategy[]>([]);

  // Clone Notification
  const [clonedId, setClonedId] = useState<string | null>(null);

  // Toggle Compare
  const toggleCompare = (strat: RecommendedStrategy) => {
    if (comparedStrategies.find(s => s.id === strat.id)) {
      setComparedStrategies(comparedStrategies.filter(s => s.id !== strat.id));
    } else {
      if (comparedStrategies.length >= 4) {
        alert('You can compare a maximum of 4 strategies simultaneously.');
        return;
      }
      setComparedStrategies([...comparedStrategies, strat]);
    }
  };

  const handleQuickClone = async (strategy: RecommendedStrategy, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveStrategy({
        name: `${strategy.name} (My Research)`,
        shortDescription: strategy.coreIdea,
        detailedDescription: `${strategy.marketLogic}\n\nEvidence Grade: ${strategy.evidenceGrade}\nCategory: ${strategy.category}\nResearch Status: ${strategy.researchStatus}`,
        markets: strategy.markets,
        sessions: ['London', 'New York'],
        timeframes: strategy.timeframes,
        entryRules: strategy.entryConditions.map((cond, idx) => ({ id: `rule-${idx}`, text: cond })),
        invalidationRules: (strategy.invalidConditions || []).map((inv, idx) => ({ id: `inv-${idx}`, text: inv })),
        exitRules: {
          takeProfitLogic: strategy.exitConditions.join('; '),
          stopLossLogic: strategy.stopLossLogic,
          partialExitRules: 'Scale 50% at 1.5R, trail remainder behind structure.',
          trailingStopRules: 'Trail behind previous swing low/high on trade timeframe.',
          minimumRR: strategy.metrics?.avgR || 2.0
        },
        riskRules: {
          defaultRisk: 1.0,
          maxRisk: 2.0,
          minRR: strategy.metrics?.avgR || 2.0,
          maxTradesPerDay: 3
        },
        checklist: strategy.entryConditions.map((cond, idx) => ({ id: `check-${idx}`, text: cond })),
        screenshots: {},
        status: 'Active',
        notes: `Imported from TradeVault Strategy Research Library. Reference sources: ${strategy.sources.map(s => s.title).join(', ')}`
      });
      setClonedId(strategy.id);
      setTimeout(() => setClonedId(null), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered & Sorted Strategies
  const filteredStrategies = useMemo(() => {
    return RECOMMENDED_STRATEGIES.filter(strat => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = strat.name.toLowerCase().includes(q);
        const matchesCategory = strat.category.toLowerCase().includes(q);
        const matchesIdea = strat.coreIdea.toLowerCase().includes(q);
        const matchesMarkets = strat.markets.some(m => m.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesIdea && !matchesMarkets) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && strat.category !== selectedCategory) return false;

      // Market
      if (selectedMarket !== 'ALL' && !strat.markets.includes(selectedMarket as MarketType)) return false;

      // Timeframe
      if (selectedTimeframe !== 'ALL' && !strat.timeframes.includes(selectedTimeframe as TimeframeType)) return false;

      // Grade
      if (selectedGrade !== 'ALL' && strat.evidenceGrade !== selectedGrade) return false;

      // Style
      if (selectedStyle !== 'ALL' && strat.tradingStyle !== selectedStyle) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'grade') {
        const order: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
        return (order[a.evidenceGrade] || 99) - (order[b.evidenceGrade] || 99);
      }
      if (sortBy === 'expectancy') {
        return (b.metrics?.expectancy || 0) - (a.metrics?.expectancy || 0);
      }
      if (sortBy === 'sampleSize') {
        return (b.metrics?.sampleSize || 0) - (a.metrics?.sampleSize || 0);
      }
      if (sortBy === 'profitFactor') {
        return (b.metrics?.profitFactor || 0) - (a.metrics?.profitFactor || 0);
      }
      if (sortBy === 'drawdown') {
        return (a.metrics?.maxDrawdownPercent || 99) - (b.metrics?.maxDrawdownPercent || 99);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedMarket, selectedTimeframe, selectedGrade, selectedStyle, sortBy]);

  const gradeBadgeStyles: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    B: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    C: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    D: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    E: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <div className="space-y-6">
      {/* Evidence & Win Rate Policy Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800 border border-blue-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              TradeVault Academic & Institutional Research Registry
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Every candidate strategy is cataloged with an explicit <span className="font-semibold text-slate-900 dark:text-slate-100">Evidence Grade (A to E)</span>, complete academic citations, and transparent limitations. <span className="font-semibold text-blue-700 dark:text-blue-400">Win Rate Policy:</span> Win rate alone does not define mathematical edge. A 40% win-rate trend strategy with 3R average winners has positive expectancy, while an 85% win-rate system with catastrophic left-tail risk can blow up an account.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
            {RECOMMENDED_STRATEGIES.length} Verified Strategies
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by strategy name, economic logic, market, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="grade">Evidence Grade (A → E)</option>
              <option value="expectancy">Expectancy (High → Low)</option>
              <option value="sampleSize">Sample Size (Largest First)</option>
              <option value="profitFactor">Profit Factor (High → Low)</option>
              <option value="drawdown">Max Drawdown (Lowest First)</option>
              <option value="name">Strategy Name (A → Z)</option>
            </select>
          </div>
        </div>

        {/* Multi-Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Categories</option>
              <option value="TREND FOLLOWING">Trend Following</option>
              <option value="MOMENTUM">Momentum</option>
              <option value="MEAN REVERSION">Mean Reversion</option>
              <option value="BREAKOUT">Breakout</option>
              <option value="MARKET STRUCTURE">Market Structure</option>
              <option value="VOLUME">Volume / Order Flow</option>
              <option value="STATISTICAL">Statistical Arbitrage</option>
              <option value="CARRY">Carry Trade</option>
              <option value="PRICE ACTION">Price Action</option>
              <option value="FACTOR">Factor Investing</option>
              <option value="VOLATILITY">Volatility</option>
              <option value="MACRO">Macro / Monetary</option>
              <option value="QUANTITATIVE">Quantitative</option>
              <option value="EXECUTION">Institutional Execution</option>
              <option value="OPTIONS">Options</option>
              <option value="DEFENSIVE">Defensive Asset Allocation</option>
              <option value="PAIRS / SPREAD">Pairs / Spreads</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Markets</option>
              <option value="FOREX">Forex</option>
              <option value="GOLD">Gold</option>
              <option value="SILVER">Silver</option>
              <option value="EQUITIES">Equities</option>
              <option value="INDEX">Index</option>
              <option value="FUTURES">Futures</option>
              <option value="CRYPTO">Crypto</option>
              <option value="OPTIONS">Options</option>
              <option value="MULTI-ASSET">Multi-Asset</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Timeframes</option>
              <option value="INTRADAY">Intraday</option>
              <option value="SWING">Swing</option>
              <option value="POSITION">Position</option>
              <option value="LONG TERM">Long Term</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Evidence Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Grades (A to E)</option>
              <option value="A">Grade A (Peer-Reviewed)</option>
              <option value="B">Grade B (Institutional)</option>
              <option value="C">Grade C (Practitioner)</option>
              <option value="D">Grade D (Preliminary)</option>
              <option value="E">Grade E (Theoretical)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Trading Style</label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Styles</option>
              <option value="Systematic">Systematic</option>
              <option value="Discretionary">Discretionary</option>
              <option value="Algorithmic">Algorithmic</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Multi-Strategy Compare Floating Drawer */}
      {comparedStrategies.length > 0 && (
        <div className="sticky top-4 z-40 p-4 bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-semibold">
              Comparing ({comparedStrategies.length} / 4 strategies):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {comparedStrategies.map(s => (
                <span key={s.id} className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1">
                  {s.name.length > 20 ? `${s.name.substring(0, 18)}...` : s.name}
                  <button onClick={() => toggleCompare(s)} className="text-slate-400 hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparedStrategies([])}
              className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (onCompareStrategies) {
                  onCompareStrategies(comparedStrategies);
                }
              }}
              className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white gap-1.5"
            >
              <Scale className="w-3.5 h-3.5" /> Launch Side-by-Side Comparison
            </Button>
          </div>
        </div>
      )}

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStrategies.map(strategy => {
          const isCompared = !!comparedStrategies.find(s => s.id === strategy.id);
          const isCloned = clonedId === strategy.id;

          return (
            <div
              key={strategy.id}
              onClick={() => setActiveStrategy(strategy)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {strategy.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold border", gradeBadgeStyles[strategy.evidenceGrade])}>
                      Grade {strategy.evidenceGrade}
                    </div>
                  </div>
                </div>

                {/* Strategy Title */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {strategy.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {strategy.coreIdea}
                  </p>
                </div>

                {/* Market & Timeframe Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {strategy.markets.slice(0, 3).map(m => (
                    <span key={m} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                      {m}
                    </span>
                  ))}
                  {strategy.markets.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px]">
                      +{strategy.markets.length - 3}
                    </span>
                  )}
                  <span className="text-slate-300 dark:text-slate-700 self-center">•</span>
                  {strategy.timeframes.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Metrics Box (Verified Only) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800/80">
                  {strategy.metrics ? (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-slate-400">Expectancy</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          +{strategy.metrics.expectancy}R
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Win Rate</div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {strategy.metrics.winRate ? `${strategy.metrics.winRate}%` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Max DD</div>
                        <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                          -{strategy.metrics.maxDrawdownPercent}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-center text-slate-500 dark:text-slate-400 italic">
                      Backtest data unavailable • Educational framework
                    </div>
                  )}
                </div>

                {/* Limitations / Sources indicator */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>{strategy.sources.length} academic / institutional source{strategy.sources.length > 1 ? 's' : ''}</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">{strategy.tradingStyle}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompare(strategy);
                  }}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition-colors",
                    isCompared 
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-300 text-blue-700 dark:text-blue-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Scale className="w-3.5 h-3.5" />
                  {isCompared ? "Compared" : "Compare"}
                </button>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleQuickClone(strategy, e)}
                    className="text-xs h-8 px-2 text-slate-600 dark:text-slate-400 hover:text-blue-600"
                  >
                    {isCloned ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 px-3 font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  >
                    View Dossier
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStrategies.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No matching strategies found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your filters or search terms to browse the full TradeVault academic strategy registry.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedMarket('ALL');
              setSelectedTimeframe('ALL');
              setSelectedGrade('ALL');
              setSelectedStyle('ALL');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Detail Dossier Modal */}
      <RecommendedStrategyDetailModal
        strategy={activeStrategy}
        onClose={() => setActiveStrategy(null)}
        onSelectForCompare={toggleCompare}
        isCompared={!!activeStrategy && !!comparedStrategies.find(s => s.id === activeStrategy.id)}
      />
    </div>
  );
};
