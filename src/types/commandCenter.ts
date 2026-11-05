import { Trade, Strategy, LearningEntry, TradingRule, Session, Market, Emotion, Direction } from '@/types';

export type CommandCenterTimeRange = 'today' | '7d' | '30d' | '90d' | 'all';

export type ComparisonWindowSize = 5 | 10 | 20;

export interface CommandCenterSummary {
  todayPnl: number | null;
  todayPnlFormatted: string;
  tradesTodayCount: number;
  riskUsedToday: number;
  riskUsedTodayPercent: number | null;
  currentStreak: {
    type: 'WIN' | 'LOSS' | 'NONE';
    count: number;
    text: string;
  };
  averageR: number | null;
  averageRFormatted: string;
  winRate: number | null;
  profitFactor: number | null;
  currentEquity: number;
  currentDrawdown: number;
  ruleAdherence: number | null;
  ruleAdherenceFormatted: string;
  psychologyCompletion: number | null;
  psychologyCompletionFormatted: string;
  executionQualityScore: number;
  totalTradesInRange: number;
  closedTradesInRange: number;
}

export interface TraderHealthScore {
  overallScore: number; // 0-100
  level: string; // e.g. "Disciplined Practitioner", "Developing", "Elite Executor"
  components: {
    riskDiscipline: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    executionQuality: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    ruleAdherence: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    psychologyCompletion: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    processConsistency: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    journalQuality: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    strategyDiscipline: { score: number; max: number; note: string; calculation: string; tradesCount: number };
    learningProgress: { score: number; max: number; note: string; calculation: string; tradesCount: number };
  };
}

export type AttentionSeverity = 'critical' | 'warning' | 'notice' | 'positive';

export type AttentionCategory = 
  | 'risk' 
  | 'psychology' 
  | 'strategy' 
  | 'rules' 
  | 'behavior' 
  | 'data_quality'
  | 'performance'
  | 'execution';

export interface AttentionItem {
  id: string;
  title: string;
  explanation: string;
  whyText: string;
  severity: AttentionSeverity;
  category: AttentionCategory;
  sampleSize?: number;
  tradeIds: string[];
  strategyId?: string;
  ruleId?: string;
  learningId?: string;
  metricComparison?: {
    metricName: string;
    currentValue: string;
    baselineValue: string;
  };
  investigateAction: {
    type: 'trades' | 'psychology' | 'strategy' | 'rules' | 'learning' | 'ai_labs' | 'risk';
    targetId?: string;
    route?: string;
    label: string;
  };
}

export interface ProcessActionItem {
  id: string;
  title: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: 'review' | 'journal' | 'rule' | 'experiment' | 'psychology' | 'risk';
  route: string;
  buttonLabel: string;
  supportingTradeIds?: string[];
}

export interface TodayTradingPlan {
  todayFocus: string;
  riskLimitPercent: number;
  maxTrades: number;
  preferredSessions: string[];
  preferredStrategies: string[];
  rulesToRemember: string[];
  psychologyReminder: string;
  learningObjective: string;
  postTradeRequirement: string;
  updatedAt: number;
}

export interface PreTradeCheckItem {
  id: string;
  label: string;
  checked: boolean;
  category: 'setup' | 'risk' | 'execution' | 'psychology';
}

export interface ExecutionQualityReport {
  score: number; // 0-100
  status: 'Good' | 'Needs Review' | 'Insufficient Data';
  entryDiscipline: { score: number; note: string };
  stopLossDiscipline: { score: number; note: string };
  takeProfitDiscipline: { score: number; note: string };
  riskCompliance: { score: number; note: string };
  postTradeDiscipline: { score: number; note: string };
  evidenceTrades: Trade[];
}

export interface TradeAnalysisInsight {
  tradeId: string;
  trade: Trade;
  whatWentWell: string[];
  whatCouldImprove: string[];
  whatToInvestigate: string[];
  nextAction: string;
}

export interface BehavioralPattern {
  id: string;
  name: string;
  type: 'FOMO' | 'REVENGE' | 'OVERTRADING' | 'RISK_ESCALATION' | 'EARLY_EXIT' | 'DISCIPLINE_PEAK';
  confidence: 'Low' | 'Medium' | 'High';
  detected: boolean;
  occurrenceCount: number;
  evidenceNotes: string;
  supportingTradeIds: string[];
}

export interface PlannedVsActualRiskItem {
  tradeId: string;
  market: string;
  direction: string;
  date: number;
  plannedRiskPercent: number;
  actualRiskPercent: number;
  plannedRiskDollar: number;
  actualRiskDollar: number;
  deviationPercent: number;
  isCompliant: boolean;
  result: string;
  pnl: number;
}

export interface DrawdownProfileMetrics {
  currentDrawdownDollar: number;
  currentDrawdownPercent: number;
  maxHistoricalDrawdownDollar: number;
  maxHistoricalDrawdownPercent: number;
  avgDrawdownDollar: number;
  longestRecoveryTrades: number;
  longestRecoveryDays: number;
  recoveryEfficiencyRate: number; // 0-100%
  underwaterCurve: Array<{ date: number; equity: number; drawdown: number; tradeIndex: number }>;
}

export interface MistakeCluster {
  category: string;
  occurrences: number;
  totalPnlImpact: number;
  avgLossPerOccurrence: number;
  tradeIds: string[];
}

export interface PersonalLeak {
  id: string;
  title: string;
  category: 'Risk' | 'Entry' | 'Exit' | 'Psychology' | 'Rules' | 'Overtrading' | 'Strategy' | 'Journal';
  frequency: number;
  estimatedHistoricalImpact: number;
  sampleSize: number;
  supportingTradeIds: string[];
  actionRecommendation: string;
}

export interface PersonalStrength {
  id: string;
  title: string;
  category: 'Risk' | 'Discipline' | 'Journal' | 'Execution' | 'Strategy';
  adherenceRate: number;
  sampleSize: number;
  positivePnlAttribution: number;
  supportingTradeIds: string[];
}

export interface ThirtyDayImprovementPlan {
  week1Observation: { task: string; done: boolean }[];
  week2Correction: { task: string; done: boolean }[];
  week3Experiment: { task: string; done: boolean }[];
  week4Review: { task: string; done: boolean }[];
  lastSavedAt: number;
}

export interface TraderSkillNode {
  id: string;
  name: string;
  tier: 'Beginner' | 'Foundation' | 'Risk' | 'Execution' | 'Strategy' | 'Psychology' | 'Quant' | 'Professional';
  unlocked: boolean;
  progressPercent: number;
  requirements: string[];
  competencies: string[];
  academyRoute: string;
}

export interface TradingExperiment {
  id: string;
  hypothesis: string;
  variable: string;
  baselineMetric: string;
  targetSampleSize: number;
  currentSampleSize: number;
  startDate: string;
  endDate?: string;
  status: 'In Progress' | 'Completed' | 'Draft';
  conclusion?: string;
}

export interface HypothesisItem {
  id: string;
  statement: string;
  evidenceFor: string[];
  evidenceAgainst: string[];
  sampleSize: number;
  status: 'Insufficient Data' | 'Early Evidence' | 'Preliminary' | 'Stronger Historical Evidence';
}

export interface WhatIfSimulationResult {
  scenarioName: string;
  originalNetPnl: number;
  simulatedNetPnl: number;
  deltaNetPnl: number;
  originalWinRate: number;
  simulatedWinRate: number;
  originalAvgR: number;
  simulatedAvgR: number;
  excludedTradesCount: number;
  assumptions: string;
}

export interface TraderLevelInfo {
  level: number;
  title: string;
  nextLevelTitle: string;
  currentXp: number;
  xpToNextLevel: number;
  progressPercent: number;
  milestonesUnlocked: number;
  competenciesDemonstrated: string[];
}

export interface StateTrendMetric {
  key: string;
  label: string;
  state: 'elevated' | 'normal' | 'reduced' | 'improved' | 'declined' | 'stable';
  badgeText: string;
  badgeVariant: 'warning' | 'info' | 'success' | 'neutral' | 'danger';
  currentValueFormatted: string;
  previousValueFormatted: string;
  deltaFormatted: string;
  observationNote: string;
  sampleTrades: Trade[];
}

export interface CurrentTradingState {
  windowSize: number;
  recentTradesCount: number;
  previousTradesCount: number;
  metrics: StateTrendMetric[];
  recentTradeIds: string[];
  previousTradeIds: string[];
}

export type PinnedItemType = 'trade' | 'strategy' | 'learning' | 'rule' | 'hypothesis' | 'ai_insight' | 'leak';

export interface PinnedItem {
  id: string;
  recordId: string;
  type: PinnedItemType;
  title: string;
  subtitle: string;
  pinnedAt: number;
  route: string;
  badge?: string;
  metadata?: Record<string, any>;
}

export interface RecentActivityEvent {
  id: string;
  type: 
    | 'trade_added' 
    | 'trade_edited' 
    | 'psychology_updated' 
    | 'learning_saved' 
    | 'rule_created' 
    | 'rule_updated' 
    | 'strategy_updated' 
    | 'ai_analysis_run';
  title: string;
  description: string;
  timestamp: number;
  recordId: string;
  route: string;
  badgeText: string;
  badgeColor: string;
}

export interface InvestigationResult {
  query: string;
  matchedTrades: Trade[];
  matchedStrategies: Strategy[];
  matchedRules: TradingRule[];
  matchedLearnings: LearningEntry[];
  summaryMessage: string;
  isInsufficient: boolean;
  filtersApplied: {
    market?: string;
    session?: string;
    emotion?: string;
    strategy?: string;
    direction?: string;
    limit?: number;
    riskCondition?: string;
  };
}

export interface CommandCenterLayoutConfig {
  visibleWidgets: {
    topSummary: boolean;
    cockpitSummary: boolean;
    statusHeader: boolean;
    attentionPanel: boolean;
    todayPlan: boolean;
    tradeIntelligence: boolean;
    psychologyCenter: boolean;
    riskControl: boolean;
    strategyCenter: boolean;
    learningRules: boolean;
    growthCenter: boolean;
    experimentLab: boolean;
    aiAnalyst: boolean;
    operatingSystemBoard: boolean;
    recentActivity: boolean;
    pinnedItems: boolean;
  };
  widgetOrder: string[];
  visibleMetrics: {
    todayPnl: boolean;
    tradesToday: boolean;
    riskUsedToday: boolean;
    currentStreak: boolean;
    averageR: boolean;
    winRate: boolean;
    profitFactor: boolean;
    ruleAdherence: boolean;
    psychologyCompletion: boolean;
    healthScore: boolean;
  };
  recentWindowSize: 5 | 10 | 20;
  timeRange: CommandCenterTimeRange;
}
