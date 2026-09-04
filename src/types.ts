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
  
  // Psychology additions
  ruleAdherence?: number; // percentage 0-100
  checklistState?: Record<string, boolean>;
}

export interface User {
  id: string;
  name: string;
  email: string;
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
