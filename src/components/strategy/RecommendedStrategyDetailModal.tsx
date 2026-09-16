import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecommendedStrategy } from '@/data/strategyResearchTypes';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Input';
import { formatNumber, cn } from '@/lib/utils';
import { 
  X, 
  BookOpen, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  ExternalLink, 
  Calculator, 
  Plus, 
  GraduationCap, 
  Scale, 
  BarChart2, 
  FileText,
  Brain,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface ModalProps {
  strategy: RecommendedStrategy | null;
  onClose: () => void;
  onSelectForCompare?: (strategy: RecommendedStrategy) => void;
  isCompared?: boolean;
}

export const RecommendedStrategyDetailModal: React.FC<ModalProps> = ({
  strategy,
  onClose,
  onSelectForCompare,
  isCompared = false
}) => {
  const navigate = useNavigate();
  const { saveStrategy } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'execution' | 'regimes' | 'backtest' | 'psychology' | 'sources'>('overview');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneSuccess, setCloneSuccess] = useState(false);

  if (!strategy) return null;

  const handleCreateMyVersion = async () => {
    setIsCloning(true);
    try {
      await saveStrategy({
        name: `${strategy.name} (My Research)`,
        shortDescription: strategy.coreIdea,
        detailedDescription: `${strategy.marketLogic}\n\nEvidence Grade: ${strategy.evidenceGrade}\nCategory: ${strategy.category}\nResearch Status: ${strategy.researchStatus}\n\nExecution Notes:\n${strategy.entryConditions.join('\n')}`,
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
      setCloneSuccess(true);
      setTimeout(() => {
        setCloneSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCloning(false);
    }
  };

  const gradeColors: Record<string, string> = {
    A: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    B: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    C: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    D: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800',
    E: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                {strategy.category}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1", gradeColors[strategy.evidenceGrade])}>
                <span>Grade {strategy.evidenceGrade}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {strategy.tradingStyle}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {strategy.longShortCapability}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {strategy.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
              {strategy.coreIdea}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {onSelectForCompare && (
              <Button
                variant={isCompared ? "secondary" : "outline"}
                size="sm"
                onClick={() => onSelectForCompare(strategy)}
                className="gap-1.5 text-xs font-semibold"
              >
                <Scale className="w-3.5 h-3.5" />
                {isCompared ? "In Comparison" : "Compare"}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateMyVersion}
              disabled={isCloning}
              className="gap-1.5 text-xs font-semibold border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              {cloneSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Saved to My Strategies!
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Clone to My Strategies
                </>
              )}
            </Button>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('overview')}
            className={cn(
              "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === 'overview' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <BookOpen className="w-4 h-4" /> Overview & Logic
          </button>
          <button 
            onClick={() => setActiveTab('execution')}
            className={cn(
              "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === 'execution' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <FileText className="w-4 h-4" /> Rules & Setup
          </button>
          <button 
            onClick={() => setActiveTab('regimes')}
            className={cn(
              "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === 'regimes' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Activity className="w-4 h-4" /> Market Regimes
          </button>
          <button 
            onClick={() => setActiveTab('backtest')}
            className={cn(
              "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === 'backtest' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <ShieldCheck className="w-4 h-4" /> Backtest & Integrity
          </button>
          <button 
            onClick={() => setActiveTab('psychology')}
            className={cn(
              "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === 'psychology' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Brain className="w-4 h-4" /> Psychology & Mistakes
          </button>
          <button 
            onClick={() => setActiveTab('sources')}
            className={cn(
              "px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5",
              activeTab === 'sources' ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <GraduationCap className="w-4 h-4" /> Sources ({strategy.sources.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Evidence Grade Explanation Panel */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Evidence Grade: Grade {strategy.evidenceGrade}</span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Last research audit: {strategy.lastResearchUpdate}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-semibold">Why this grade?</span> {strategy.evidenceGradeReason}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Note: Evidence Grade measures historical empirical and peer-reviewed backing; it does NOT imply guaranteed future profitability.
                </p>
              </div>

              {/* Verified Metrics / Integrity Panel */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Historical Research Metrics (Verified Data Only)
                </h4>
                {strategy.metrics ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Sample Size</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{strategy.metrics.sampleSize} trades</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Win Rate</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{strategy.metrics.winRate ? `${strategy.metrics.winRate}%` : 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Expectancy</div>
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{strategy.metrics.expectancy}R</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Profit Factor</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{strategy.metrics.profitFactor || 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Max Drawdown</div>
                      <div className="text-lg font-bold text-rose-600 dark:text-rose-400">-{strategy.metrics.maxDrawdownPercent}%</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Sharpe Ratio</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{strategy.metrics.sharpeRatio ?? 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Trade Frequency</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{strategy.metrics.tradeFrequency || 'N/A'}</div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Cost Sensitivity</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{strategy.transactionCostSensitivity}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
                    Verified backtest data unavailable for this educational strategy framework. Metrics omitted per Data Integrity Policy.
                  </div>
                )}
              </div>

              {/* Market Logic */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Economic & Market Logic</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {strategy.marketLogic}
                </p>
              </div>

              {/* Target Markets and Timeframes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 block">Primary Markets</span>
                  <div className="flex flex-wrap gap-1.5">
                    {strategy.markets.map(m => (
                      <span key={m} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-semibold">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 block">Timeframes & Holding</span>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {strategy.timeframes.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Typical holding: <span className="font-semibold text-slate-700 dark:text-slate-300">{strategy.typicalHoldingPeriod}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'execution' && (
            <div className="space-y-6">
              {/* Entry Conditions */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Entry Rules & Conditions</span>
                </h4>
                <ul className="space-y-2">
                  {strategy.entryConditions.map((cond, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-blue-600 dark:text-blue-400">{i + 1}.</span>
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exit & Invalidation Conditions */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>Exit Conditions & Invalidation</span>
                </h4>
                <ul className="space-y-2">
                  {strategy.exitConditions.map((exit, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-rose-600 dark:text-rose-400">•</span>
                      <span>{exit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Stop Loss & Position Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Stop-Loss Logic</span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {strategy.stopLossLogic}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Position Sizing</span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {strategy.positionSizing}
                  </p>
                </div>
              </div>

              {/* Example Trade Breakdown */}
              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
                    Concrete Trade Case Study ({strategy.exampleTrade.market})
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-100">
                  {strategy.exampleTrade.setupDescription}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-white dark:bg-slate-850 rounded border border-blue-100 dark:border-blue-900">
                    <span className="text-slate-500">Entry:</span> <span className="font-semibold text-slate-900 dark:text-slate-100">{strategy.exampleTrade.entryPoint}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-850 rounded border border-blue-100 dark:border-blue-900">
                    <span className="text-slate-500">Invalidation:</span> <span className="font-semibold text-rose-600">{strategy.exampleTrade.invalidation}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-850 rounded border border-blue-100 dark:border-blue-900">
                    <span className="text-slate-500">Target:</span> <span className="font-semibold text-emerald-600">{strategy.exampleTrade.target}</span>
                  </div>
                </div>
                <div className="text-xs text-blue-800 dark:text-blue-300 italic">
                  Outcome: {strategy.exampleTrade.outcomeNote}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regimes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Best Market Conditions
                  </h4>
                  <ul className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    {strategy.bestMarketConditions.map((cond, i) => (
                      <li key={i}>• {cond}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Worst Market Conditions
                  </h4>
                  <ul className="text-xs text-rose-900 dark:text-rose-200 space-y-1">
                    {strategy.worstMarketConditions.map((cond, i) => (
                      <li key={i}>• {cond}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Regime Matrix Table */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Market Regime Performance Matrix
                </h4>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Regime</th>
                        <th className="p-3">Expected Behavior</th>
                        <th className="p-3">Drawdown Risk</th>
                        <th className="p-3">Observation Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {strategy.regimes.map((reg, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{reg.regime}</td>
                          <td className="p-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-semibold",
                              reg.behavior === 'Favorable' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                              reg.behavior === 'Neutral' ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300" :
                              "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            )}>
                              {reg.behavior}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={cn(
                              "font-medium",
                              reg.drawdownRisk === 'Low' ? "text-emerald-600" :
                              reg.drawdownRisk === 'Moderate' ? "text-amber-600" : "text-rose-600"
                            )}>
                              {reg.drawdownRisk}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">{reg.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backtest' && (
            <div className="space-y-6">
              {/* Backtest Integrity Panel */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Backtest Quality & Integrity Audit</span>
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    {strategy.backtestStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Data Period</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {strategy.backtestQuality.dataPeriod || 'N/A'}
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Out-of-Sample Tested</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {strategy.backtestQuality.outOfSampleTested ? 'Yes (Confirmed)' : 'No / Untested'}
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Transaction Costs</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                      {strategy.backtestQuality.transactionCostsIncluded ? 'Included (Realistic)' : 'Gross (Excluded)'}
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-500">Overfitting Risk</div>
                    <div className={cn(
                      "font-semibold mt-0.5",
                      strategy.backtestQuality.overfittingRisk === 'Low' ? "text-emerald-600" :
                      strategy.backtestQuality.overfittingRisk === 'Moderate' ? "text-amber-600" : "text-rose-600"
                    )}>
                      {strategy.backtestQuality.overfittingRisk || 'Unassessed'}
                    </div>
                  </div>
                </div>

                {strategy.backtestQuality.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                    Methodology Notes: {strategy.backtestQuality.notes}
                  </p>
                )}
              </div>

              {/* How to Test It Yourself Section */}
              <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" /> How to Test This Strategy Yourself
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  {strategy.howToTestYourself}
                </p>
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      navigate('/calculator', {
                        state: {
                          prefill: {
                            symbol: strategy.markets[0] || 'XAU/USD',
                            direction: strategy.longShortCapability === 'Short Only' ? 'SELL' : 'BUY',
                            riskPercent: '1.0'
                          }
                        }
                      });
                    }}
                    className="gap-1.5 text-xs font-semibold bg-white dark:bg-slate-850"
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-600" />
                    Open in Risk Calculator
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'psychology' && (
            <div className="space-y-6">
              {/* Psychology Requirements */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Mandatory Behavioral & Psychological Requirements</span>
                </h4>
                <ul className="space-y-2">
                  {strategy.psychologyRequirements.map((req, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-purple-600">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Trader Mistakes */}
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Common Trader Execution Mistakes
                </h4>
                <ul className="text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
                  {strategy.commonTraderMistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600">⚠</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pre-Trade Checklist */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Pre-Trade Execution Checklist
                </h4>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                  {strategy.preTradeChecklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input type="checkbox" className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" readOnly checked />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Academic & Institutional Citations
              </h4>
              {strategy.sources.map(src => (
                <div key={src.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {src.sourceType} • {src.institution || 'Academic Publication'}
                    </span>
                    <span className="text-xs text-slate-400">{src.publicationDate}</span>
                  </div>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{src.title}</h5>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">Author(s):</span> {src.author}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {src.urlOrCitation}
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Verified Empirical Claims:</div>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 space-y-0.5">
                      {src.relevantClaims.map((claim, idx) => (
                        <li key={idx}>{claim}</li>
                      ))}
                    </ul>
                  </div>
                  {src.limitations.length > 0 && (
                    <div className="text-[11px] text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/40">
                      <span className="font-bold">Noted Research Limitations:</span> {src.limitations.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Educational & Quantitative Research Framework • Not Personalized Investment Advice
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Dossier
            </Button>
            <Button
              size="sm"
              onClick={handleCreateMyVersion}
              disabled={isCloning}
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {cloneSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Added to My Strategies
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Create My Version
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
