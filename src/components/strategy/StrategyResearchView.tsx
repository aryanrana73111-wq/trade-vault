import React, { useState, useMemo } from 'react';
import { MARKET_PLAYBOOKS, MarketPlaybook } from '@/data/marketPlaybooks';
import { RECOMMENDED_STRATEGIES } from '@/data/strategyResearchLibrary';
import { RecommendedStrategy } from '@/data/strategyResearchTypes';
import { RecommendedStrategyDetailModal } from './RecommendedStrategyDetailModal';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/Button';
import { 
  BookOpen, 
  Scale, 
  Sparkles, 
  Activity, 
  Sliders, 
  Workflow, 
  Compass, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Brain,
  Layers,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Props {
  initialComparedStrategies?: RecommendedStrategy[];
}

export const StrategyResearchView: React.FC<Props> = ({ initialComparedStrategies = [] }) => {
  const navigate = useNavigate();
  const { trades, strategies: userCustomStrategies } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'playbooks' | 'comparison' | 'match' | 'lab' | 'regimes' | 'workflow' | 'process'>('playbooks');

  // Selected Market Playbook
  const [selectedPlaybook, setSelectedPlaybook] = useState<MarketPlaybook>(MARKET_PLAYBOOKS[0]);

  // Compared Strategies
  const [comparedList, setComparedList] = useState<RecommendedStrategy[]>(
    initialComparedStrategies.length > 0 ? initialComparedStrategies : RECOMMENDED_STRATEGIES.slice(0, 3)
  );

  // Detail Modal State
  const [modalStrategy, setModalStrategy] = useState<RecommendedStrategy | null>(null);

  // Strategy Research Lab Parameters
  const [labMarket, setLabMarket] = useState('XAU/USD');
  const [labRisk, setLabRisk] = useState('1.0');
  const [labStopType, setLabStopType] = useState('ATR 2.0x');
  const [labTargetRR, setLabTargetRR] = useState('2.0');
  const [labSpread, setLabSpread] = useState('2.0');
  const [labSimulatedTrades, setLabSimulatedTrades] = useState<number | null>(null);

  // User Journal Analysis for Strategy Match Engine
  const journalStats = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        tradeCount: 0,
        topMarket: 'None recorded',
        avgHoldingHours: 0,
        winRate: 0,
        ruleAdherenceRate: 0,
        favSession: 'None'
      };
    }

    const marketCounts: Record<string, number> = {};
    let adherenceCount = 0;
    let winCount = 0;

    trades.forEach(t => {
      if (t.market) {
        marketCounts[t.market] = (marketCounts[t.market] || 0) + 1;
      }
      if (t.result === 'WIN') winCount++;
      if (t.ruleAdherence !== undefined ? t.ruleAdherence >= 80 : true) adherenceCount++;
    });

    const sortedMarkets = Object.entries(marketCounts).sort((a, b) => b[1] - a[1]);
    const topMarket = sortedMarkets[0] ? sortedMarkets[0][0] : 'Various';

    return {
      tradeCount: trades.length,
      topMarket,
      winRate: Math.round((winCount / trades.length) * 100),
      ruleAdherenceRate: Math.round((adherenceCount / trades.length) * 100),
      favSession: 'London / New York'
    };
  }, [trades]);

  // Recommended Strategy Matching Engine
  const matchedStrategies = useMemo(() => {
    return RECOMMENDED_STRATEGIES.map(strat => {
      let matchScore = 70; // baseline
      const reasons: string[] = [];

      // Market match
      if (journalStats.tradeCount > 0) {
        const matchingMarket = strat.markets.some(m => 
          journalStats.topMarket.toUpperCase().includes(m) || m.includes(journalStats.topMarket.toUpperCase())
        );
        if (matchingMarket) {
          matchScore += 15;
          reasons.push(`Matches your most frequent asset class (${journalStats.topMarket})`);
        }
      }

      // Adherence requirement
      if (strat.complexity === 'Beginner' && journalStats.ruleAdherenceRate < 70) {
        matchScore += 10;
        reasons.push('Streamlined rule structure ideal for building execution discipline');
      } else if (strat.complexity === 'Advanced' && journalStats.ruleAdherenceRate >= 85) {
        matchScore += 10;
        reasons.push('Matches your proven track record of disciplined rule adherence');
      }

      // Grade boost
      if (strat.evidenceGrade === 'A') {
        matchScore += 5;
        reasons.push('Backed by Grade A academic multi-decade empirical evidence');
      }

      return {
        strategy: strat,
        matchScore: Math.min(matchScore, 98),
        reasons
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [journalStats]);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1.5 shadow-sm">
        <button
          onClick={() => setActiveSubTab('playbooks')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'playbooks'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <BookOpen className="w-4 h-4" /> Market Playbooks
        </button>

        <button
          onClick={() => setActiveSubTab('comparison')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'comparison'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Scale className="w-4 h-4" /> Strategy Comparison ({comparedList.length})
        </button>

        <button
          onClick={() => setActiveSubTab('match')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'match'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Sparkles className="w-4 h-4" /> Strategy Match Engine
        </button>

        <button
          onClick={() => setActiveSubTab('regimes')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'regimes'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Activity className="w-4 h-4" /> Market Regime Engine
        </button>

        <button
          onClick={() => setActiveSubTab('lab')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'lab'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Sliders className="w-4 h-4" /> Strategy Research Lab
        </button>

        <button
          onClick={() => setActiveSubTab('workflow')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'workflow'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Workflow className="w-4 h-4" /> Trader Playbook Workflow
        </button>

        <button
          onClick={() => setActiveSubTab('process')}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2",
            activeSubTab === 'process'
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Compass className="w-4 h-4" /> Process Guidance
        </button>
      </div>

      {/* 1. MARKET PLAYBOOKS */}
      {activeSubTab === 'playbooks' && (
        <div className="space-y-6">
          {/* Asset Selector Strip */}
          {/* Market selector horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MARKET_PLAYBOOKS.map(pb => (
              <button
                key={pb.id}
                onClick={() => setSelectedPlaybook(pb)}
                className={cn(
                  "px-4 py-3 rounded-2xl border text-left transition-all shrink-0 min-w-[160px]",
                  selectedPlaybook.id === pb.id
                    ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 text-blue-900 dark:text-blue-100 shadow-sm"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300"
                )}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {pb.assetClass}
                </div>
                <div className="text-sm font-bold mt-0.5">{pb.name}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{pb.symbol}</div>
              </button>
            ))}
          </div>

          {/* Active Playbook Dossier */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <span>How to Trade This Market</span>
                  <span>•</span>
                  <span>{selectedPlaybook.assetClass}</span>
                  <span>•</span>
                  <span>{selectedPlaybook.liquidityTier}</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedPlaybook.name} ({selectedPlaybook.symbol})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigate('/calculator', {
                      state: {
                        prefill: {
                          symbol: selectedPlaybook.symbol,
                          direction: 'BUY',
                          riskPercent: '1.0'
                        }
                      }
                    });
                  }}
                  className="text-xs gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  Calculate {selectedPlaybook.symbol} Risk
                </Button>
              </div>
            </div>

            {/* Drivers & Characteristics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Drivers */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Primary Economic & Macro Drivers
                </h4>
                <div className="space-y-2">
                  {selectedPlaybook.majorDrivers.map((driver, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5 text-xs text-slate-700 dark:text-slate-300">
                      • {driver}
                    </div>
                  ))}
                </div>
              </div>

              {/* Volatility & Liquidity Behavior */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-600" /> Volatility & Session Characteristics
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Typical Volatility / ATR:</span>{' '}
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{selectedPlaybook.averageDailyVolatility}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Active Trading Sessions:</span>{' '}
                      <span className="text-slate-900 dark:text-slate-100">{selectedPlaybook.typicalSessions.join(' | ')}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-800">
                      <span className="font-semibold">Trend & Structure:</span> {selectedPlaybook.trendBehavior}
                    </div>
                  </div>
                </div>

                {/* What Should I Watch Right Now? */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-600" /> What Should I Watch In This Market?
                  </h4>
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                    {selectedPlaybook.whatToWatch.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="font-bold text-emerald-600">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Suitable vs Unsuitable Strategies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Statistically Suitable Strategy Families
                </h4>
                <div className="space-y-2">
                  {selectedPlaybook.suitableStrategyFamilies.map((item, i) => (
                    <div key={i} className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-xs">
                      <div className="font-bold text-emerald-900 dark:text-emerald-200">• {item}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> High-Risk / Unsuitable Conditions
                </h4>
                <div className="space-y-2">
                  {selectedPlaybook.unsuitableConditions.map((item, i) => (
                    <div key={i} className="p-3 bg-rose-50/40 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/30 text-xs">
                      <div className="font-bold text-rose-900 dark:text-rose-200">• {item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Execution Considerations */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                Institutional Execution Considerations & Friction
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {selectedPlaybook.executionConsiderations.map((note, idx) => (
                  <div key={idx}>• {note}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STRATEGY COMPARISON ENGINE */}
      {activeSubTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  <span>Institutional Strategy Comparison Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Side-by-side evaluation of economic logic, empirical evidence grade, verified metrics, and execution requirements.
                </p>
              </div>
            </div>

            {comparedList.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl space-y-3">
                <Scale className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No strategies selected for comparison</h4>
                <p className="text-xs text-slate-500">Go to Recommended Strategies and click "Compare" on up to 4 strategies.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3 bg-slate-50 dark:bg-slate-850 font-bold text-slate-500 w-44">Parameter</th>
                      {comparedList.map(strat => (
                        <th key={strat.id} className="p-3 bg-slate-50 dark:bg-slate-850 font-bold text-slate-900 dark:text-slate-100 min-w-[220px]">
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{strat.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">{strat.category}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Evidence Grade</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">
                          <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Grade {strat.evidenceGrade}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Research Status</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3 font-medium">{strat.researchStatus}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Trading Style</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">{strat.tradingStyle}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Primary Markets</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {strat.markets.map(m => (
                              <span key={m} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Expectancy (Verified)</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {strat.metrics ? `+${strat.metrics.expectancy}R` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Profit Factor</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3 font-semibold">
                          {strat.metrics?.profitFactor || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Win Rate</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">
                          {strat.metrics?.winRate ? `${strat.metrics.winRate}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Max Historical Drawdown</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                          {strat.metrics?.maxDrawdownPercent ? `-${strat.metrics.maxDrawdownPercent}%` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Cost Sensitivity</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">{strat.transactionCostSensitivity}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Typical Holding Time</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">{strat.typicalHoldingPeriod}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-500">Actions</td>
                      {comparedList.map(strat => (
                        <td key={strat.id} className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setModalStrategy(strat)}
                            className="text-xs h-7 px-2 font-semibold text-blue-600"
                          >
                            View Dossier
                          </Button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. STRATEGY MATCH ENGINE */}
      {activeSubTab === 'match' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Strategy Match Engine (Journal Synchronization)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Analyzes your real TradeVault journal records to match you with evidence-backed strategy candidates tailored to your asset preferences, execution discipline, and session profile.
              </p>
            </div>

            {/* Current Journal Profile Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="text-slate-400">Total Journaled Trades</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{journalStats.tradeCount} trades</div>
              </div>
              <div>
                <div className="text-slate-400">Primary Traded Market</div>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{journalStats.topMarket}</div>
              </div>
              <div>
                <div className="text-slate-400">Rule Adherence Rate</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{journalStats.ruleAdherenceRate}%</div>
              </div>
              <div>
                <div className="text-slate-400">Current Win Rate</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{journalStats.winRate}%</div>
              </div>
            </div>

            {/* Ranked Strategy Matches */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top Matched Strategies for Your Profile
              </h4>

              <div className="space-y-3">
                {matchedStrategies.slice(0, 4).map(({ strategy, matchScore, reasons }) => (
                  <div
                    key={strategy.id}
                    onClick={() => setModalStrategy(strategy)}
                    className="p-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">{strategy.category}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800">Grade {strategy.evidenceGrade}</span>
                        <span className="text-xs font-semibold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800">{strategy.tradingStyle}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{strategy.name}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{strategy.coreIdea}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {reasons.map((r, i) => (
                          <span key={i} className="text-[11px] text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                            <span>✓</span> {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Match Affinity</div>
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{matchScore}%</div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Dossier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MARKET REGIME ENGINE */}
      {activeSubTab === 'regimes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Market Regime Engine & Strategy Taxonomy</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Strategies are not all-weather machines. Edge exists only when strategy mechanics match prevailing macroeconomic and statistical market regimes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Regime 1: Trending Expansion */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-emerald-600">Regime 01</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">High Edge</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Directional Trend Expansion</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sustained institutional capital deployment driven by monetary divergence or structural macro themes. High directional autocorrelation.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">Suitable Strategies:</div>
                  <div className="text-slate-700 dark:text-slate-300">• Multi-Asset Time-Series Momentum</div>
                  <div className="text-slate-700 dark:text-slate-300">• London Opening Range Breakout</div>
                  <div className="text-slate-700 dark:text-slate-300">• Dual-Momentum Relative Rotation</div>
                </div>
                <div className="space-y-1 text-xs text-rose-600 dark:text-rose-400">
                  <div className="font-semibold">Unsuitable:</div>
                  <div>• Short-term Mean Reversion (RSI fades get run over)</div>
                </div>
              </div>

              {/* Regime 2: Range-Bound Rotational */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-blue-600">Regime 02</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">Rotational</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Range-Bound Balance (Low Volatility)</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Market participants agree on fair value. Two-way auction with responsive buying at lows and responsive selling at highs.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">Suitable Strategies:</div>
                  <div className="text-slate-700 dark:text-slate-300">• Statistical Bollinger %B Reversion</div>
                  <div className="text-slate-700 dark:text-slate-300">• VWAP Band Exhaustion Fade</div>
                  <div className="text-slate-700 dark:text-slate-300">• Cointegrated Gold/Silver Pairs</div>
                </div>
                <div className="space-y-1 text-xs text-rose-600 dark:text-rose-400">
                  <div className="font-semibold">Unsuitable:</div>
                  <div>• Breakouts (frequent whipsaws and false breaks)</div>
                </div>
              </div>

              {/* Regime 3: High Volatility Shock / Liquidity Crunch */}
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-rose-600">Regime 03</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">Defensive</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Volatility Shock / Liquidity Crunch</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  VIX surges &gt; 25. Wide bid-ask spreads, severe slippage, risk-parity unwinds, and flight-to-cash dynamics.
                </p>
                <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400">Suitable Strategies:</div>
                  <div className="text-slate-700 dark:text-slate-300">• Permanent Portfolio Cash Preservation</div>
                  <div className="text-slate-700 dark:text-slate-300">• Long Volatility Convexity Hedging</div>
                </div>
                <div className="space-y-1 text-xs text-rose-600 dark:text-rose-400">
                  <div className="font-semibold">Unsuitable:</div>
                  <div>• Carry Trade (violent crash risk)</div>
                  <div>• Short Volatility (catastrophic tail risk)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. STRATEGY RESEARCH LAB */}
      {activeSubTab === 'lab' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <span>Strategy Parameter Testing Console</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Configure execution parameters, spread models, and risk rules to evaluate parameter sensitivity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target Market</label>
                <select
                  value={labMarket}
                  onChange={(e) => setLabMarket(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="XAU/USD">Gold (XAU/USD)</option>
                  <option value="BTC/USD">Bitcoin (BTC/USD)</option>
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="ES">S&P 500 Futures</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Risk Per Trade</label>
                <select
                  value={labRisk}
                  onChange={(e) => setLabRisk(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="0.5">0.5% Account Risk</option>
                  <option value="1.0">1.0% Account Risk</option>
                  <option value="2.0">2.0% Account Risk</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Stop-Loss Model</label>
                <select
                  value={labStopType}
                  onChange={(e) => setLabStopType(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="ATR 1.5x">1.5x 20-period ATR</option>
                  <option value="ATR 2.0x">2.0x 20-period ATR</option>
                  <option value="Swing Structural">Structural Swing High/Low</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Target R:R</label>
                <select
                  value={labTargetRR}
                  onChange={(e) => setLabTargetRR(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="1.5">1.5R Multiple</option>
                  <option value="2.0">2.0R Multiple</option>
                  <option value="3.0">3.0R Multiple</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Spread & Friction</label>
                <select
                  value={labSpread}
                  onChange={(e) => setLabSpread(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="1.0">1.0 pip / Minimal</option>
                  <option value="2.0">2.0 pips / Standard</option>
                  <option value="4.0">4.0 pips / High Volatility</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => setLabSimulatedTrades(trades.length || 0)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Sliders className="w-4 h-4" /> Run Journal Sample Simulation
              </Button>
            </div>

            {/* Simulation Feedback */}
            {labSimulatedTrades !== null && (
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Journal Simulation Outcome ({trades.length} Real Recorded Trades)</span>
                  </h4>
                  <span className="text-xs text-slate-500">Live Data Synchronized</span>
                </div>

                {trades.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500">Qualifying Trades</div>
                      <div className="text-base font-bold text-slate-900 dark:text-slate-100">{trades.length}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500">Simulated Target R</div>
                      <div className="text-base font-bold text-emerald-600">+{labTargetRR}R Target</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500">Applied Risk Sizing</div>
                      <div className="text-base font-bold text-slate-900 dark:text-slate-100">{labRisk}% Equity</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-500">Spread Deducted</div>
                      <div className="text-base font-bold text-rose-600">-{labSpread} pips</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                    Historical market data is required to run this backtest. Add trades to your journal or practice in the Risk Calculator.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TRADER PLAYBOOK WORKFLOW */}
      {activeSubTab === 'workflow' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-blue-600" />
                <span>Professional Trader Playbook Workflow (14 Steps)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The institutional sequence followed by systematic prop desks from pre-market prep to end-of-day rule review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { step: '01', title: 'Macro Calendar & High-Impact Events', desc: 'Identify central bank releases (FOMC, CPI, NFP) to avoid unpriced execution slippage.' },
                { step: '02', title: 'Daily Market Regime Classification', desc: 'Classify asset regime: Trending Expansion, Rotational Balance, or Volatility Shock.' },
                { step: '03', title: 'Higher-Timeframe Key Structural Levels', desc: 'Mark Daily/Weekly horizontal pivots, previous day high/low, and Value Area boundaries.' },
                { step: '04', title: 'Strategy Qualification Check', desc: 'Select ONLY strategies verified to have positive expectancy in current regime.' },
                { step: '05', title: 'Setup Identification', desc: 'Wait for structural displacement, liquidity grab, or quantitative filter alignment.' },
                { step: '06', title: 'Invalidation & Stop Loss Formulation', desc: 'Define structural invalidation price BEFORE calculating profit target or size.' },
                { step: '07', title: 'Mathematical Position Sizing', desc: 'Calculate exact lot size: Risk Amount ($) / (Stop Distance * Tick Value). Never size by intuition.' },
                { step: '08', title: 'Limit Order Placement', desc: 'Submit bracket order (OCO) with limit entry, hard stop, and target. Avoid market chasing.' },
                { step: '09', title: 'Pre-Trade Emotional Scan', desc: 'Verify zero signs of FOMO, revenge impulse, or overconfidence before final confirmation.' },
                { step: '10', title: 'Mechanical Trade Execution', desc: 'Once order fills, do NOT micromanage. Let strategy math resolve without interference.' },
                { step: '11', title: 'Pre-Defined Trade Management', desc: 'Trail stops only according to strategy rules (e.g. at 1.5R move to breakeven).' },
                { step: '12', title: 'Exit & Outcome Acceptance', desc: 'Accept win or loss as a single statistical trial in a lifetime sample of 1,000 trades.' },
                { step: '13', title: 'TradeVault Journal Logging', desc: 'Record entry, exit, screenshot, rule adherence, emotions, and mistake tagging immediately.' },
                { step: '14', title: 'Post-Session Rule Review', desc: 'Review session adherence. If 2 losses occurred, shut down terminal for the day.' },
              ].map((s) => (
                <div key={s.step} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{s.step}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">{s.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. PROCESS RECOMMENDATIONS */}
      {activeSubTab === 'process' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Process Recommendations ("What Should I Do?")</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evidence-based process guidance. TradeVault never gives automated buy/sell signals; we cultivate disciplined trading decision architecture.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" /> If you are in a losing streak:
                </h4>
                <p className="text-blue-900 dark:text-blue-100 leading-relaxed">
                  Reduce position size by 50% immediately. Verify if the recent loss sequence is normal statistical variance (even a 60% win rate strategy experiences 5 consecutive losses every 100 trades) or if you are trading outside strategy parameters.
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> If you are in a winning streak:
                </h4>
                <p className="text-emerald-900 dark:text-emerald-100 leading-relaxed">
                  Do NOT increase your risk percentage. Winning streaks frequently induce euphoria and overconfidence. Adhere strictly to 1.0% equity risk to ensure variance mean reversion does not wipe out your accumulated profits.
                </p>
              </div>

              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-2">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> If no setups meet strategy criteria:
                </h4>
                <p className="text-amber-900 dark:text-amber-100 leading-relaxed">
                  Close your trading terminal. Sitting in 100% Cash is an active, profitable institutional position with zero drawdown. Forced boredom trading accounts for over 40% of retail account drawdowns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Detail Modal */}
      <RecommendedStrategyDetailModal
        strategy={modalStrategy}
        onClose={() => setModalStrategy(null)}
      />
    </div>
  );
};
