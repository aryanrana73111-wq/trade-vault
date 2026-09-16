export type EvidenceGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export type StrategyCategory =
  | 'TREND FOLLOWING'
  | 'MOMENTUM'
  | 'MEAN REVERSION'
  | 'BREAKOUT'
  | 'MARKET STRUCTURE'
  | 'PRICE ACTION'
  | 'VOLATILITY'
  | 'VOLUME'
  | 'STATISTICAL'
  | 'PAIRS / SPREAD'
  | 'FACTOR'
  | 'VALUE'
  | 'CARRY'
  | 'DEFENSIVE'
  | 'QUANTITATIVE'
  | 'FUNDAMENTAL'
  | 'MACRO'
  | 'EVENT DRIVEN'
  | 'OPTIONS'
  | 'FUTURES'
  | 'PORTFOLIO'
  | 'EXECUTION'
  | 'MULTI-ASSET'
  | 'INSTITUTIONAL';

export type StrategyMarket =
  | 'FOREX'
  | 'GOLD'
  | 'SILVER'
  | 'COMMODITIES'
  | 'CRYPTO'
  | 'EQUITIES'
  | 'INDEX'
  | 'FUTURES'
  | 'OPTIONS'
  | 'MULTI-ASSET';

export type MarketType = StrategyMarket;

export type StrategyTimeframe =
  | 'SCALPING'
  | 'INTRADAY'
  | 'SWING'
  | 'POSITION'
  | 'LONG TERM';

export type TimeframeType = StrategyTimeframe;

export type TradingStyle = 'Systematic' | 'Discretionary' | 'Hybrid' | 'Algorithmic';

export interface ResearchSourceItem {
  id: string;
  title: string;
  author: string;
  institution?: string;
  publicationDate: string;
  sourceType: 
    | 'ACADEMIC' 
    | 'INSTITUTIONAL' 
    | 'ASSET MANAGER RESEARCH' 
    | 'EXCHANGE RESEARCH' 
    | 'REGULATORY' 
    | 'EDUCATIONAL' 
    | 'NEWS' 
    | 'OPINION' 
    | 'PROMOTIONAL';
  urlOrCitation: string;
  relevantClaims: string[];
  limitations: string[];
  evidenceQuality: 'High' | 'Moderate' | 'Limited' | 'Unverified';
}

export interface BacktestQualityMetadata {
  hasBacktest: boolean;
  dataPeriod?: string;
  sampleSize?: number;
  outOfSampleTested?: boolean;
  walkForwardTested?: boolean;
  transactionCostsIncluded?: boolean;
  slippageIncluded?: boolean;
  overfittingRisk?: 'Low' | 'Moderate' | 'High' | 'Severe' | 'Unassessed';
  notes?: string;
}

export interface VerifiedMetrics {
  sampleSize?: number;
  winRate?: number; // e.g. 52.4
  avgWin?: number;  // in R or currency
  avgLoss?: number; // in R or currency
  profitFactor?: number;
  expectancy?: number; // in R
  avgR?: number;
  maxDrawdownPercent?: number;
  sharpeRatio?: number;
  sortinoRatio?: number;
  tradeFrequency?: string;
}

export interface RegimePerformanceItem {
  regime: string; // e.g. 'Trending Bull', 'High Volatility Compression'
  behavior: 'Favorable' | 'Neutral' | 'Adverse' | 'Untested';
  notes: string;
  winRateEstimate?: string;
  drawdownRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
}

export interface RecommendedStrategy {
  id: string;
  name: string;
  category: StrategyCategory;
  markets: StrategyMarket[];
  timeframes: StrategyTimeframe[];
  tradingStyle: TradingStyle;
  longShortCapability: 'Long Only' | 'Short Only' | 'Long & Short';
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Institutional';
  typicalHoldingPeriod: string;
  
  evidenceGrade: EvidenceGrade;
  evidenceGradeReason: string;
  researchStatus: 'Peer-Reviewed Academic' | 'Institutional Consensus' | 'Empirical Practitioner' | 'Hypothesis / Educational';
  backtestStatus: 'Out-of-Sample Validated' | 'In-Sample Only' | 'Walk-Forward Tested' | 'Historical Simulation' | 'Backtest data unavailable';
  
  // Backtest integrity & Verified metrics (if any - NO fake numbers allowed)
  metrics?: VerifiedMetrics;
  backtestQuality: BacktestQualityMetadata;

  transactionCostSensitivity: 'Low' | 'Moderate' | 'High' | 'Extreme';
  regimeSensitivity: 'High' | 'Moderate' | 'Low';
  crossMarketEvidence: 'Strong' | 'Moderate' | 'Limited' | 'Single-Market Specific';
  outOfSampleEvidence: 'Confirmed' | 'Partial' | 'None' | 'Untested';
  lastResearchUpdate: string;
  
  // Strategy Core Logic
  coreIdea: string;
  marketLogic: string;
  entryConditions: string[];
  exitConditions: string[];
  stopLossLogic: string;
  positionSizing: string;
  riskRules: string[];
  exampleTrade: {
    market: string;
    setupDescription: string;
    entryPoint: string;
    invalidation: string;
    target: string;
    outcomeNote: string;
  };
  invalidConditions: string[];
  bestMarketConditions: string[];
  worstMarketConditions: string[];
  regimes: RegimePerformanceItem[];

  // Psychology & Execution
  psychologyRequirements: string[];
  commonTraderMistakes: string[];
  failureModes: string[];
  preTradeChecklist: string[];

  // Citations & Limitations
  sources: ResearchSourceItem[];
  limitations: string[];
  howToTestYourself: string;
}
