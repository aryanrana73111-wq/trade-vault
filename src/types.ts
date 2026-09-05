export type Market = 'XAU/USD' | 'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'XRP/USD' | 'EUR/USD' | 'GBP/USD' | 'JPY/USD' | string;
export type Direction = 'BUY' | 'SELL';
export type Session = 'Asian' | 'London' | 'New York' | 'Sydney' | string;
export type Emotion = 'Calm' | 'FOMO' | 'Revenge' | 'Fear' | 'Greed' | 'Confident' | 'Hesitant' | 'Impatient' | 'Overconfident' | 'Frustrated' | 'Neutral' | string;
export type Result = 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | '';
export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '4H' | 'Daily' | 'Other' | string;
export type MarketCondition = 'Trending' | 'Ranging' | 'Breakout' | 'Reversal' | 'Choppy' | 'Other' | string;

export interface Trade {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  
  date: number; // timestamp of the trade date
  time?: string; // HH:mm
  market: Market;
  direction: Direction;
  
  entry: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  risk: number; // Dollar amount
  riskPercent?: number; // % of account
  rewardAmount?: number;
  
  strategy: string;
  session: Session;
  timeframe?: Timeframe;
  marketCondition?: MarketCondition;
  emotions: Emotion[];
  
  screenshot?: string; // legacy string support
  screenshots?: { before?: string; during?: string; after?: string };
  
  notes: string;
  mistake: string;
  learning: string;
  
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
  setupQuality?: 'A+' | 'A' | 'B' | 'C' | string;
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

export interface StrategyVersion {
  version: string;
  updatedAt: number;
  changes: string;
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
  notes: string;
  createdAt: number;
  updatedAt: number;
  versions?: StrategyVersion[];
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

