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
  ruleAdherence: number | null;
  ruleAdherenceFormatted: string;
  psychologyCompletion: number | null;
  psychologyCompletionFormatted: string;
  totalTradesInRange: number;
  closedTradesInRange: number;
}

export type AttentionSeverity = 'critical' | 'warning' | 'notice';

export type AttentionCategory = 
  | 'risk' 
  | 'psychology' 
  | 'strategy' 
  | 'rules' 
  | 'behavior' 
  | 'data_quality'
  | 'performance';

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
    type: 'trades' | 'psychology' | 'strategy' | 'rules' | 'learning' | 'ai_labs';
    targetId?: string;
    route?: string;
    label: string;
  };
}

export type StateTrend = 'elevated' | 'normal' | 'reduced' | 'improved' | 'declined' | 'stable';

export interface CurrentTradingStateMetric {
  key: string;
  label: string;
  state: StateTrend;
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
  metrics: CurrentTradingStateMetric[];
  recentTradeIds: string[];
  previousTradeIds: string[];
}

export type PinnedItemType = 'trade' | 'strategy' | 'learning' | 'rule' | 'hypothesis' | 'ai_insight';

export interface PinnedItem {
  id: string; // unique pin id
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
    attentionPanel: boolean;
    tradingState: boolean;
    quickInvestigation: boolean;
    pinnedItems: boolean;
    recentActivity: boolean;
    connectedWorkflow: boolean;
  };
  widgetOrder: string[];
  visibleMetrics: {
    todayPnl: boolean;
    tradesToday: boolean;
    riskUsedToday: boolean;
    currentStreak: boolean;
    averageR: boolean;
    ruleAdherence: boolean;
    psychologyCompletion: boolean;
  };
  recentWindowSize: ComparisonWindowSize;
  timeRange: CommandCenterTimeRange;
}
