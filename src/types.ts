export type Market = 'XAU/USD' | 'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'XRP/USD' | 'EUR/USD' | 'GBP/USD' | 'JPY/USD' | string;
export type Direction = 'BUY' | 'SELL';
export type Session = 'Asian' | 'London' | 'New York' | 'Sydney' | string;
export type Emotion = 'Confident' | 'Unconfident' | string;
export type Result = 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | '';
export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '4H' | 'Daily' | 'Other' | string;
export type MarketCondition = 'Trending' | 'Ranging' | 'Breakout' | 'Reversal' | 'Choppy' | 'Other' | string;

export interface Dashboard {
  id: string;
  name: string;
  currency: string;
  startingBalance: number;
  createdAt: number;
  updatedAt: number;
}

export interface Trade {
  id: string;
  userId: string;
  dashboardId?: string; // Add dashboardId
  accountId?: string;
  createdAt: number;
  updatedAt: number;
  
  date: number; // timestamp of the trade date
  time?: string; // HH:mm
  market: Market;
  pair?: string;
  direction: Direction;
  
  entry: number;
  exitPrice?: number; // Add exitPrice
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  risk?: number; // Dollar amount
  riskPercent?: number; // % of account
  rewardAmount?: number;
  
  strategy?: string;
  session?: Session;
  timeframe?: Timeframe;
  marketCondition?: MarketCondition;
  emotions?: Emotion[];
  
  screenshot?: string; // legacy string support
  screenshots?: { before?: string; during?: string; after?: string };
  entryScreenshot?: string; // Execution / Entry screenshot
  exitScreenshot?: string; // Close / Exit screenshot
  
  notes?: string;
  mistake?: string;
  learning?: string;
  
  // Calculated/Result
  result?: Result;
  pnl?: number; // Actual Profit/Loss
  rrRatio?: number; // Risk:Reward ratio calculated at entry
  rMultiple?: number; // Realized R multiple
  
  // Psychology additions & detailed behavioral tracking
  ruleAdherence?: number; // percentage 0-100
  checklistState?: Record<string, boolean>;

  // Before Trade
  confidence?: number; // 1-10 scale
  setupQuality?: 'A+' | 'B' | 'C';
  setupQualityReason?: string;
  entryReason?: string;

  // During Trade
  duringEmotions?: Emotion[];
  duringEmotionalState?: string;
  riskChanged?: boolean;
  riskChangeNotes?: string;
  isReentry?: boolean;
  reentryReason?: string;
  positionManagement?: string; // e.g. 'Moved SL to BE', 'Scaled Out', 'Let Run', 'Held to TP/SL'

  // After Trade
  exitEmotion?: Emotion;
  whatToRepeat?: string;
  whatToAvoid?: string;

  // Trade Thesis
  thesis?: {
    marketThesis?: string;
    directionalBias?: string;
    catalyst?: string;
    timeHorizon?: string;
    invalidation?: string;
    expectedScenario?: string;
    alternativeScenario?: string;
  };

  // Execution Quality & Transaction Costs
  execution?: {
    plannedEntry?: number;
    plannedStop?: number;
    plannedTarget?: number;
    slippage?: number;
    spread?: number;
    commission?: number;
    fees?: number;
  };

  // News Intelligence Integration
  newsEventId?: string;
  newsEventName?: string;
  newsImpact?: 'LOW' | 'MEDIUM' | 'HIGH';
  newsProximityMinutes?: number;

  // Change / Audit History
  auditHistory?: {
    field: string;
    oldValue?: any;
    newValue?: any;
    changedAt: number;
  }[];
}

export type TradingStyle = 'Scalping' | 'Day Trading' | 'Swing Trading' | 'Position Trading' | 'Other';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  tradingStyle: TradingStyle | string;
  tradingExperience?: string;
  preferredMarkets?: string;
  preferredTradingSession?: string;
  defaultAccountType?: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: {
    aiSuggestions?: boolean;
    psychologyAnalysis?: boolean;
    privacyMasking?: boolean;
    [key: string]: any;
  };
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface StrategyRule {
  id: string;
  text: string;
}

export type StrategyLifecycleStatus = 'IDEA' | 'HYPOTHESIS' | 'TESTING' | 'FORWARD_OBSERVATION' | 'REVIEW' | 'ACTIVE' | 'ARCHIVED';

export interface StrategyVersion {
  version: string;
  updatedAt: number;
  changes: string;
  reasonForChange?: string;
  performanceBeforeChange?: {
    trades: number;
    winRate: number;
    avgR: number;
    expectancy: number;
  };
  researchNotes?: string;
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  markets: string[];
  sessions: string[];
  timeframes: string[];
  
  entryRules: StrategyRule[];
  invalidationRules: StrategyRule[];
  exitRules: {
    takeProfitLogic: string;
    stopLossLogic: string;
    partialExitRules: string;
    trailingStopRules: string;
    minimumRR: number;
  };
  
  riskRules: {
    defaultRisk: number;
    maxRisk: number;
    minRR: number;
    maxTradesPerDay: number;
  };
  
  checklist: StrategyRule[];
  
  screenshots: {
    idealSetup?: string;
    invalidSetup?: string;
    exampleTrade?: string;
  };
  
  status: 'Active' | 'Archived';
  lifecycleStatus?: StrategyLifecycleStatus;
  notes: string;
  createdAt: number;
  updatedAt: number;
  versions?: StrategyVersion[];
  
  reviewCriteria?: {
    minSampleSize: number;
    maxDrawdown: number;
    minExpectancy: number;
    minRuleAdherence: number;
    maxRisk: number;
  };
}

// Risk & Position Sizing Calculator Types
export type AssetClass = 'FOREX' | 'METALS' | 'CRYPTO' | 'CUSTOM';
export type ContractType = 'Spot' | 'CFD' | 'Futures' | 'Perpetual';

export interface InstrumentSpecification {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  contractSize: number; // e.g. 100,000 for standard forex, 100 for XAU/USD, 1 for crypto spot
  pipSize: number; // e.g. 0.0001 for EUR/USD, 0.01 for USD/JPY, 0.01 for Gold, 1 for BTC
  baseCurrency: string;
  quoteCurrency: string;
  unitName: string; // 'lots', 'oz', 'BTC', 'contracts', 'units'
  contractType: ContractType;
  minPositionSize: number; // e.g. 0.01
  positionStep: number; // e.g. 0.01
  maxPositionSize?: number;
  isCustom?: boolean;
  notes?: string;
}

export interface CalculatorInput {
  accountBalance: number;
  accountCurrency: string;
  riskPercent: number;
  riskAmount: number;
  riskMode: 'percent' | 'amount';
  symbol: string;
  direction: Direction;
  entry: number;
  stopLoss: number;
  takeProfit?: number;
  leverage?: number;
  quoteToAccountRate?: number; // Rate to convert quote currency to account currency if different
  specification: InstrumentSpecification;
}

export interface CalculationStep {
  label: string;
  formula: string;
  detail: string;
}

export interface CalculatorResult {
  isValid: boolean;
  validationError?: string;
  directionWarning?: string;
  riskWarning?: string;
  positionSize: number;
  roundedPositionSize: number;
  unitLabel: string;
  equivalentUnits?: number;
  equivalentUnitsLabel?: string;
  stopLossDistance: number;
  stopLossPipsOrTicks: number;
  estimatedLoss: number;
  actualRiskPercent: number;
  takeProfitDistance?: number;
  takeProfitPipsOrTicks?: number;
  potentialProfit?: number;
  riskRewardRatio?: number;
  notionalValue?: number;
  estimatedMargin?: number;
  marginCalculable: boolean;
  marginNote?: string;
  conversionNote?: string;
  steps: CalculationStep[];
}

export interface CalculatorHistoryItem {
  id: string;
  timestamp: number;
  instrument: string;
  assetClass: AssetClass;
  direction: Direction;
  accountBalance: number;
  currency: string;
  riskPercent: number;
  riskAmount: number;
  entry: number;
  stopLoss: number;
  takeProfit?: number;
  positionSize: number;
  unitLabel: string;
  units?: number;
  contractSize: number;
  riskRewardRatio?: number;
  estimatedLoss: number;
  potentialProfit?: number;
  notionalValue?: number;
  createdAt: number;
}

// Learning & Rules Types
export type LearningCategory = 
  | 'Risk Management'
  | 'Strategy'
  | 'Psychology'
  | 'Execution'
  | 'Market Structure'
  | 'Technical Analysis'
  | 'Fundamental'
  | 'Mistake'
  | 'General';

export interface LearningEntry {
  id: string;
  userId: string;
  dashboardId: string;
  date: number; // timestamp
  dateString: string; // YYYY-MM-DD
  content: string;
  category: LearningCategory;
  tags: string[];
  relatedTradeId?: string;
  relatedTradeSnapshot?: {
    market: string;
    direction: Direction;
    date: number;
    pnl?: number;
    result?: Result;
  };
  createdAt: number;
  updatedAt: number;
}

export type RuleCategory = 
  | 'Risk Management'
  | 'Strategy'
  | 'Execution'
  | 'Psychology'
  | 'Market'
  | 'General';

export type RulePriority = 'Critical' | 'Important' | 'Optional';
export type RuleStatus = 'Active' | 'Paused';

export interface RuleVersion {
  version: number;
  text: string;
  category: RuleCategory;
  priority: RulePriority;
  updatedAt: number;
  note?: string;
}

export interface TradingRule {
  id: string;
  userId: string;
  dashboardId: string;
  text: string;
  category: RuleCategory;
  priority: RulePriority;
  status: RuleStatus;
  isPinned: boolean;
  order: number;
  version?: number;
  createdAt: number;
  updatedAt: number;
  versions?: RuleVersion[];
}


// ---------------------------------------------------------
// ARENA & COMPETITION 2.0 TYPES
// ---------------------------------------------------------

export type CompetitionState = 'DRAFT' | 'WAITING' | 'LIVE' | 'PAUSED' | 'ENDED' | 'ARCHIVED' | 'CANCELLED';

export type CompetitionScoringMode = 
  | 'P&L' 
  | 'ROI' 
  | 'Total R' 
  | 'Avg R' 
  | 'Risk-adjusted' 
  | 'Discipline' 
  | 'Consistency' 
  | 'Custom Composite';

export type CompetitionMode = CompetitionScoringMode | 'Execution' | 'Risk Discipline' | 'Composite';

export type PrivacyMode = 'Standard' | 'Selective' | 'Minimal';
export type FairPlayMode = 'Standard' | 'Fair Play' | 'Locked';

export type CompetitionTradeStatus = 'Normal' | 'Needs Review' | 'Disputed' | 'Invalidated';
export type VerificationStatus = 'Manual' | 'Imported' | 'Verified';

export type LeaderboardSortMode =
  | 'Highest P&L'
  | 'Highest ROI'
  | 'Highest Total R'
  | 'Highest Win Rate'
  | 'Most Trades'
  | 'Highest Avg R'
  | 'Highest Profit Factor'
  | 'Highest Single Trade'
  | 'Lowest Worst Loss'
  | 'Lowest Max Drawdown'
  | 'Best Consistency'
  | 'Best Rule Adherence'
  | 'Best Execution'
  | 'Best Journal Completion'
  | 'Longest Win Streak'
  | 'Best Day'
  | 'Lowest Average Loss';

export interface ArenaSharingPermissions {
  profile: boolean;
  performance: boolean;
  tradeDetails: boolean;
  research: boolean;
  psychology: boolean;
  screenshots?: boolean;
}

export interface ParticipantStats {
  netPnl: number;
  roi: number;
  totalR: number;
  avgR: number;
  winRate: number;
  profitFactor: number | 'MAX';
  maxDrawdown: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  breakEvenCount: number;
  highestSingleTrade: number;
  worstSingleLoss: number;
  avgWin: number;
  avgLoss: number;
  winStreak: number;
  maxWinStreak: number;
  ruleAdherenceAvg: number;
  journalCompletionRate: number;
  score: number;
  qualified: boolean; // meets min trades requirement
}

export type CompetitionRuleType =
  | 'MAX_DRAWDOWN'
  | 'MAX_DAILY_LOSS'
  | 'MAX_WEEKLY_LOSS'
  | 'MAX_RISK_PER_TRADE'
  | 'MAX_TOTAL_RISK'
  | 'MAX_TRADES_TOTAL'
  | 'MAX_TRADES_PER_DAY'
  | 'MAX_DAILY_TRADES'
  | 'MIN_TRADES_TOTAL'
  | 'MAX_POSITION_SIZE'
  | 'MAX_LEVERAGE'
  | 'ALLOWED_MARKETS'
  | 'BLOCKED_MARKETS'
  | 'PROHIBITED_INSTRUMENTS'
  | 'ALLOWED_SESSIONS'
  | 'BLOCKED_SESSIONS'
  | 'MIN_HOLDING_TIME_SECONDS'
  | 'MAX_OPEN_POSITIONS'
  | 'MANDATORY_STOP_LOSS'
  | 'MAX_LOSS_PER_TRADE'
  | 'MAX_LOSS_STREAK'
  | 'TRADING_END_TIME'
  | 'NO_TRADING_AFTER_VIOLATION'
  | 'CUSTOM_RULE';

export type RuleSeverity = 'DISQUALIFY' | 'WARNING' | 'INFO';
export type RuleEnforcement = 'AUTOMATIC' | 'MANUAL_REVIEW' | 'INSTANT_DISQUALIFY' | 'STRICT_REJECT' | 'AUDIT_LOG_FLAG';

export interface RuleHistoryEntry {
  version: number;
  changedBy: string;
  changedByName?: string;
  timestamp: number;
  oldLimit?: any;
  newLimit?: any;
  oldSeverity?: RuleSeverity;
  newSeverity?: RuleSeverity;
  changeSummary: string;
}

export interface CompetitionRule {
  id: string;
  competitionId: string;
  name: string;
  type: CompetitionRuleType;
  limitValue: number | string | string[];
  unit: string;
  description: string;
  severity: RuleSeverity;
  enforcement: RuleEnforcement;
  isActive: boolean;
  version: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  createdByName?: string;
  warningThresholdPercent?: number; // e.g. 80 for 80%
  history?: RuleHistoryEntry[];
}

export interface CompetitionViolation {
  id: string;
  competitionId: string;
  userId: string;
  userName: string;
  userDisplayName?: string;
  userAvatar?: string;
  ruleId: string;
  ruleName: string;
  ruleType: CompetitionRuleType;
  ruleVersion: number;
  actualValue: number | string;
  limitValue: number | string;
  unit: string;
  comparisonOperator: '>' | '<' | '>=' | '<=' | 'IN' | 'NOT_IN' | '==';
  timestamp: number;
  severity: RuleSeverity;
  actionTaken: 'DISQUALIFY' | 'WARNING' | 'LOG_ONLY' | 'PARTICIPANT_DISQUALIFIED' | 'TRADE_REJECTED';
  status: 'LOCKED' | 'WARNED' | 'RESOLVED';
  tradeId?: string;
  details?: string;
}

export interface RuleEvaluationLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  ruleId: string;
  ruleType: CompetitionRuleType;
  limitValue: number | string;
  actualValue: number | string;
  result: 'PASS' | 'WARNING' | 'VIOLATION';
}

export interface ArenaMember {
  userId: string;
  joinedAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'removed' | 'left';
  role: 'owner' | 'member';
  displayName?: string;
  photoURL?: string;
  sharingPermissions: ArenaSharingPermissions;
  stats?: ParticipantStats;
  complianceStatus?: 'ACTIVE' | 'WARNING' | 'DISQUALIFIED' | 'COMPLETED' | 'LEFT';
  isDisqualified?: boolean;
  disqualifiedAt?: number;
  disqualificationReason?: string;
  disqualifiedRuleId?: string;
  disqualifiedRuleName?: string;
  disqualifiedActualValue?: number | string;
  disqualifiedLimitValue?: number | string;
  firstViolationAt?: number;
  firstViolationRuleId?: string;
  firstViolationType?: string;
  firstViolationValue?: number;
  firstViolationLimit?: number;
  ruleVersionAccepted?: number;
  ruleAcceptedAt?: number;
}

export interface MiniChallenge {
  id: string;
  competitionId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  metric: 'P&L' | 'Avg R' | 'Total R' | 'Win Rate' | 'Lowest Drawdown' | 'Rule Adherence';
  market?: string;
  durationDays: number;
  minTrades: number;
  targetValue?: number;
  leaderId?: string;
  leaderName?: string;
  leaderValue?: number;
  status: 'active' | 'completed';
  createdAt: number;
  expiresAt: number;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  action: string;
  details: string;
  tradeId?: string;
  flagged?: boolean;
}

export interface CompetitionActivity {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  type: 'trade' | 'rank_change' | 'milestone' | 'challenge' | 'dispute' | 'system';
  message: string;
  metadata?: any;
}

export interface FinalCompetitionReport {
  endedAt: number;
  podium: {
    rank: number;
    userId: string;
    userName: string;
    score: number;
    totalR: number;
    pnl: number;
    winRate: number;
    tradeCount: number;
  }[];
  metricLeaders: {
    metric: string;
    leaderName: string;
    value: string;
  }[];
  whatDecided: string;
  personalReviews?: Record<string, {
    strongestMarket: string;
    strongestSession: string;
    largestLeak: string;
    betterIn: string[];
    underperformedIn: string[];
    experiment: string;
  }>;
}

export interface Arena {
  id: string;
  name: string;
  description?: string;
  code: string; // Unique invite code
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  startDate: number;
  endDate: number;
  durationDays: number;
  status: 'upcoming' | 'active' | 'completed' | 'closed';
  state: CompetitionState;
  competitionMode: CompetitionMode;
  scoringMode: CompetitionScoringMode;
  startingMode: 'Live Journal' | 'Snapshot' | 'Normalized R';
  privacyMode: PrivacyMode;
  fairPlayMode: FairPlayMode;
  timezone?: string;
  startingBalance?: number;
  maxMembers?: number;
  minTrades?: number;
  maxTrades?: number;
  allowedMarkets?: string[]; // Empty means all markets allowed
  allowedStrategies?: string[];
  allowedSessions?: string[];
  allowedDirections?: Direction[];
  riskLimits?: {
    maxRiskPercentPerTrade?: number;
    maxDrawdownPercent?: number;
  };
  members: Record<string, ArenaMember>;
  memberIds: string[];
  challenges?: MiniChallenge[];
  auditTrail?: AuditLog[];
  activities?: CompetitionActivity[];
  finalReport?: FinalCompetitionReport;
  rules?: CompetitionRule[];
  rulesVersion?: number;
  rulesSnapshot?: CompetitionRule[];
  allowRuleChangesDuringCompetition?: boolean;
  violations?: CompetitionViolation[];
  evaluationLogs?: RuleEvaluationLog[];
  settings: {
    fairPlayEnabled: boolean;
    compositeWeights?: {
      rPerformance: number;
      riskDiscipline: number;
      ruleAdherence: number;
      consistency: number;
      execution: number;
      journalCompletion: number;
    };
  };
}

export type Competition = Arena;

export interface SharedTradeProjection {
  id: string;
  arenaId: string;
  originalTradeId: string;
  userId: string;
  userDisplayName?: string;
  userAvatar?: string;
  createdAt: number;
  updatedAt: number;
  submittedAt?: number;
  
  // Conditionally populated based on sharing permissions
  date?: number;
  time?: string;
  market?: string;
  direction?: string;
  result?: string;
  pnl?: number;
  rMultiple?: number;
  entry?: number;
  exit?: number;
  stopLoss?: number;
  takeProfit?: number;
  positionSize?: number;
  riskAmount?: number;
  riskPercent?: number;
  
  strategy?: string;
  session?: string;
  timeframe?: string;
  setup?: string;
  setupQuality?: 'A+' | 'B' | 'C';
  setupQualityReason?: string;
  screenshot?: string;
  entryScreenshot?: string; // Execution / Entry screenshot
  exitScreenshot?: string; // Close / Exit screenshot
  sharedNotes?: string;
  learning?: string;
  
  emotions?: string[];
  mistakes?: string[];
  ruleAdherence?: string;
  fomoLevel?: number;

  // Fair play & Verification
  isBackfilled?: boolean;
  status?: CompetitionTradeStatus;
  verificationStatus?: VerificationStatus;
  inPersonalJournal?: boolean;
  personalTradeId?: string;
  editsCount?: number;
}

export type CompetitionTrade = SharedTradeProjection;
