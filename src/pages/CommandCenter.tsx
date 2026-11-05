import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Compass, 
  ShieldCheck, 
  SlidersHorizontal, 
  RefreshCw, 
  Plus, 
  Layers, 
  Calendar, 
  AlertTriangle, 
  ArrowRight, 
  ExternalLink, 
  BookOpenCheck, 
  Search, 
  Sparkles, 
  HelpCircle, 
  FileSpreadsheet, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Zap, 
  Brain, 
  Target, 
  FlaskConical, 
  Award, 
  Activity, 
  ShieldAlert 
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSettings, UserSettings } from '@/lib/settings';
import { Trade } from '@/types';
import { 
  CommandCenterTimeRange, 
  ComparisonWindowSize, 
  AttentionItem, 
  PinnedItem,
  CommandCenterLayoutConfig,
  ProcessActionItem,
  BehavioralPattern
} from '@/types/commandCenter';
import { 
  calculateCommandCenterSummary,
  generateAttentionItems,
  calculateCurrentTradingState,
  generateRecentActivityTimeline,
  filterTradesByTimeRange
} from '@/lib/commandCenter/engine';
import { 
  calculateTraderHealthScore,
  generateProcessActionItems,
  detectBehavioralPatterns,
  calculatePlannedVsActualRisk,
  calculateDrawdownProfile,
  calculateMistakeClusters,
  identifyPersonalLeaksAndStrengths,
  calculateTraderLevel,
  runWhatIfSimulations,
  evaluateHypotheses
} from '@/lib/commandCenter/advancedAnalyticsEngine';

// Components
import { CockpitSummaryBar } from '@/components/commandCenter/CockpitSummaryBar';
import { TraderStatusHeader } from '@/components/commandCenter/TraderStatusHeader';
import { TodayPlanAndPreTradeCard } from '@/components/commandCenter/TodayPlanAndPreTradeCard';
import { PsychologyCenterCard } from '@/components/commandCenter/PsychologyCenterCard';
import { RiskControlCenterCard } from '@/components/commandCenter/RiskControlCenterCard';
import { StrategyAndMarketCenterCard } from '@/components/commandCenter/StrategyAndMarketCenterCard';
import { LearningRulesAndMistakesCard } from '@/components/commandCenter/LearningRulesAndMistakesCard';
import { GrowthAndSkillTreeCard } from '@/components/commandCenter/GrowthAndSkillTreeCard';
import { ExperimentAndWhatIfLabCard } from '@/components/commandCenter/ExperimentAndWhatIfLabCard';
import { TradingOperatingSystemBoard } from '@/components/commandCenter/TradingOperatingSystemBoard';
import { CommandCenterGlobalSearch } from '@/components/commandCenter/CommandCenterGlobalSearch';
import { EvidenceDrawer } from '@/components/commandCenter/EvidenceDrawer';
import { LayoutCustomizerModal } from '@/components/commandCenter/LayoutCustomizerModal';
import { formatDistanceToNow } from 'date-fns';

const DEFAULT_LAYOUT: CommandCenterLayoutConfig = {
  visibleWidgets: {
    topSummary: true,
    cockpitSummary: true,
    statusHeader: true,
    attentionPanel: true,
    todayPlan: true,
    tradeIntelligence: true,
    psychologyCenter: true,
    riskControl: true,
    strategyCenter: true,
    learningRules: true,
    growthCenter: true,
    experimentLab: true,
    aiAnalyst: true,
    operatingSystemBoard: true,
    recentActivity: true,
    pinnedItems: true
  },
  widgetOrder: [
    'cockpitSummary',
    'statusHeader',
    'todayPlan',
    'psychologyCenter',
    'riskControl',
    'strategyCenter',
    'learningRules',
    'growthCenter',
    'experimentLab',
    'operatingSystemBoard'
  ],
  visibleMetrics: {
    todayPnl: true,
    tradesToday: true,
    riskUsedToday: true,
    currentStreak: true,
    averageR: true,
    winRate: true,
    profitFactor: true,
    ruleAdherence: true,
    psychologyCompletion: true,
    healthScore: true
  },
  recentWindowSize: 10,
  timeRange: '30d'
};

export function CommandCenter() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, activeDashboard, dashboards } = useAuth();
  const { trades: rawTrades, rules, learnings, strategies } = useData();

  // Settings & Timeframe
  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [timeRange, setTimeRange] = useState<CommandCenterTimeRange>('30d');
  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Layout & Modals
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState<CommandCenterLayoutConfig>(() => {
    try {
      const key = `tv_cc_layout_${user?.uid || 'default'}`;
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LAYOUT;
  });

  // Evidence Drawer State
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceExplanation, setEvidenceExplanation] = useState('');
  const [evidenceTrades, setEvidenceTrades] = useState<Trade[]>([]);

  // Filter Trades by Account Scope
  const scopedTrades = useMemo(() => {
    let filtered = [...rawTrades];
    if (selectedAccount !== 'ALL') {
      if (selectedAccount === 'MANUAL') {
        filtered = filtered.filter(t => t.tradeSource !== 'mt5' && t.tradeSource !== 'competition_mt5' && !t.mt5TicketId);
      } else if (selectedAccount.startsWith('mt5_')) {
        filtered = filtered.filter(t => 
          t.tradingAccountId === selectedAccount || 
          t.mt5AccountId === selectedAccount || 
          t.id.startsWith(selectedAccount)
        );
      } else {
        filtered = filtered.filter(t => (t.accountId || t.dashboardId || 'Default') === selectedAccount);
      }
    }
    return filtered;
  }, [rawTrades, selectedAccount]);

  // Trades in Time Range
  const rangeTrades = useMemo(() => {
    return filterTradesByTimeRange(scopedTrades, timeRange);
  }, [scopedTrades, timeRange]);

  // Derived Analytics via Engines
  const summary = useMemo(() => {
    return calculateCommandCenterSummary(scopedTrades, timeRange, settings);
  }, [scopedTrades, timeRange, settings]);

  const healthScore = useMemo(() => {
    return calculateTraderHealthScore(rangeTrades, rules, learnings, settings);
  }, [rangeTrades, rules, learnings, settings]);

  const attentionItems = useMemo(() => {
    return generateAttentionItems(scopedTrades, strategies, rules, learnings, settings, 10);
  }, [scopedTrades, strategies, rules, learnings, settings]);

  const processActions = useMemo(() => {
    return generateProcessActionItems(scopedTrades, rules, learnings, strategies, settings);
  }, [scopedTrades, rules, learnings, strategies, settings]);

  const behavioralPatterns = useMemo(() => {
    return detectBehavioralPatterns(rangeTrades, settings);
  }, [rangeTrades, settings]);

  const plannedVsActualRisk = useMemo(() => {
    return calculatePlannedVsActualRisk(rangeTrades, settings.risk?.defaultRisk || settings.defaultRiskPercent || 1.0);
  }, [rangeTrades, settings]);

  const drawdownProfile = useMemo(() => {
    return calculateDrawdownProfile(rangeTrades);
  }, [rangeTrades]);

  const mistakeClusters = useMemo(() => {
    return calculateMistakeClusters(rangeTrades);
  }, [rangeTrades]);

  const { leaks, strengths } = useMemo(() => {
    return identifyPersonalLeaksAndStrengths(rangeTrades, rules);
  }, [rangeTrades, rules]);

  const traderLevel = useMemo(() => {
    return calculateTraderLevel(scopedTrades, rules, learnings, strategies);
  }, [scopedTrades, rules, learnings, strategies]);

  const whatIfResults = useMemo(() => {
    return runWhatIfSimulations(rangeTrades, settings);
  }, [rangeTrades, settings]);

  const hypotheses = useMemo(() => {
    return evaluateHypotheses(rangeTrades);
  }, [rangeTrades]);

  // Manual Refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastUpdated(Date.now());
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  // Investigation Trigger
  const handleInvestigateAttention = useCallback((item: AttentionItem) => {
    const matched = scopedTrades.filter(t => item.tradeIds.includes(t.id));
    setEvidenceTitle(item.title);
    setEvidenceExplanation(item.explanation);
    setEvidenceTrades(matched.length > 0 ? matched : scopedTrades.slice(0, 5));
    setIsEvidenceOpen(true);
  }, [scopedTrades]);

  const handleInvestigatePattern = useCallback((pattern: BehavioralPattern) => {
    const matched = scopedTrades.filter(t => pattern.supportingTradeIds.includes(t.id));
    setEvidenceTitle(pattern.name);
    setEvidenceExplanation(pattern.evidenceNotes);
    setEvidenceTrades(matched);
    setIsEvidenceOpen(true);
  }, [scopedTrades]);

  const handleInspectSpecificTrades = useCallback((title: string, ids: string[]) => {
    const matched = scopedTrades.filter(t => ids.includes(t.id));
    setEvidenceTitle(title);
    setEvidenceExplanation(`Showing ${matched.length} supporting trade records from your journal.`);
    setEvidenceTrades(matched);
    setIsEvidenceOpen(true);
  }, [scopedTrades]);

  const handleSelectSingleTrade = useCallback((tradeId: string) => {
    const matched = scopedTrades.filter(t => t.id === tradeId);
    if (matched.length > 0) {
      setEvidenceTitle(`Trade Inspection: ${matched[0].pair || matched[0].market}`);
      setEvidenceExplanation(`Detailed review of trade execution parameters and psychology.`);
      setEvidenceTrades(matched);
      setIsEvidenceOpen(true);
    }
  }, [scopedTrades]);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto pb-16 min-w-0">
      {/* 1. TOP COMMAND BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Command Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
                Trading Cockpit OS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3 text-slate-400" /> Read-Only
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Observe → Understand → Diagnose → Decide → Execute → Review → Learn → Improve.
            </p>
          </div>
        </div>

        {/* Controls: Account, Time Range, Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Account Filter */}
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">Account: All</option>
            <option value="MANUAL">Manual Journal</option>
            {dashboards?.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Time Range Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            {(['today', '7d', '30d', '90d', 'all'] as CommandCenterTimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg uppercase text-[11px] transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh Command Center derived analytics"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. UNIVERSAL COMMAND SEARCH BAR */}
      <CommandCenterGlobalSearch
        trades={scopedTrades}
        strategies={strategies}
        rules={rules}
        learnings={learnings}
        onSelectTrade={handleSelectSingleTrade}
        onSelectRule={() => navigate('/learning-rules')}
        onSelectStrategy={() => navigate('/strategies')}
      />

      {/* 3. 3-COLUMN COCKPIT SUMMARY (WHERE I AM | WHAT NEEDS ATTENTION | WHAT TO DO NOW) */}
      <CockpitSummaryBar
        summary={summary}
        attentionItems={attentionItems}
        processActions={processActions}
        onInvestigateAttention={handleInvestigateAttention}
        onExecuteAction={(act) => {
          if (act.supportingTradeIds && act.supportingTradeIds.length > 0) {
            handleInspectSpecificTrades(act.title, act.supportingTradeIds);
          } else {
            navigate(act.route);
          }
        }}
      />

      {/* 4. TRADER STATUS & TRANSPARENT HEALTH SCORE */}
      <TraderStatusHeader
        summary={summary}
        healthScore={healthScore}
      />

      {/* 5. TODAY'S TRADING PLAN & PRE-TRADE CHECKPOINT */}
      <TodayPlanAndPreTradeCard
        userId={user?.uid || 'default'}
        onOpenAddTrade={() => navigate('/add')}
      />

      {/* 6. PSYCHOLOGY & BEHAVIORAL COMMAND CENTER */}
      <PsychologyCenterCard
        trades={rangeTrades}
        patterns={behavioralPatterns}
        onInvestigatePattern={handleInvestigatePattern}
      />

      {/* 7. RISK CONTROL CENTER & DRAWDOWN PROFILE */}
      <RiskControlCenterCard
        trades={rangeTrades}
        plannedVsActual={plannedVsActualRisk}
        drawdownProfile={drawdownProfile}
        onSelectTrade={handleSelectSingleTrade}
      />

      {/* 8. STRATEGY, SESSION & MARKET INTELLIGENCE */}
      <StrategyAndMarketCenterCard
        trades={rangeTrades}
        strategies={strategies}
        onSelectMarket={() => {}}
        onSelectStrategy={() => navigate('/strategies')}
      />

      {/* 9. MISTAKE BANK, PERSONAL LEAKS & RULES */}
      <LearningRulesAndMistakesCard
        mistakes={mistakeClusters}
        leaks={leaks}
        strengths={strengths}
        rules={rules}
        learnings={learnings}
        onInspectTradeIds={handleInspectSpecificTrades}
      />

      {/* 10. GROWTH CENTER & TRADER SKILL TREE */}
      <GrowthAndSkillTreeCard
        traderLevel={traderLevel}
        userId={user?.uid || 'default'}
      />

      {/* 11. EXPERIMENT & HISTORICAL WHAT-IF SCENARIO LAB */}
      <ExperimentAndWhatIfLabCard
        whatIfResults={whatIfResults}
        hypotheses={hypotheses}
      />

      {/* 12. MY TRADING OPERATING SYSTEM CONSOLIDATED BOARD */}
      <TradingOperatingSystemBoard
        rules={rules}
        strategies={strategies}
        leaks={leaks}
        strengths={strengths}
        plan={{
          todayFocus: 'Execute with strict 1.0% risk discipline and wait for confirmation.',
          riskLimitPercent: settings.risk?.defaultRisk || settings.defaultRiskPercent || 1.0,
          maxTrades: 3,
          preferredSessions: ['London', 'New York'],
          preferredStrategies: strategies.map(s => s.name),
          rulesToRemember: rules.map(r => r.name || r.text),
          psychologyReminder: 'Preserving capital and discipline matters far more than catching every tick.',
          learningObjective: 'Master patient execution at key higher timeframe levels.',
          postTradeRequirement: 'Log screenshot and emotional tags immediately after trade closure.',
          updatedAt: Date.now()
        }}
        onOpenRules={() => navigate('/learning-rules')}
        onOpenStrategies={() => navigate('/strategies')}
      />

      {/* SUPPORTING EVIDENCE DRAWER */}
      <EvidenceDrawer
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        title={evidenceTitle}
        subtitle={evidenceExplanation}
        trades={evidenceTrades}
      />

      {/* LAYOUT CUSTOMIZER MODAL */}
      <LayoutCustomizerModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        config={layoutConfig}
        onSaveConfig={(newConfig) => {
          setLayoutConfig(newConfig);
          try {
            const key = `tv_cc_layout_${user?.uid || 'default'}`;
            localStorage.setItem(key, JSON.stringify(newConfig));
          } catch {}
          setIsLayoutModalOpen(false);
        }}
        onResetDefaults={() => {
          setLayoutConfig(DEFAULT_LAYOUT);
          try {
            const key = `tv_cc_layout_${user?.uid || 'default'}`;
            localStorage.setItem(key, JSON.stringify(DEFAULT_LAYOUT));
          } catch {}
          setIsLayoutModalOpen(false);
        }}
      />
    </div>
  );
}

export default CommandCenter;
