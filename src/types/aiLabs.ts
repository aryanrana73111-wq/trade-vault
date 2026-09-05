import { Trade, Emotion, Session, Market, Direction } from '@/types';

export type EvidenceLevel = 
  | 'insufficient'   // 0–4 trades
  | 'early'          // 5–14 trades
  | 'preliminary'    // 15–29 trades
  | 'moderate'       // 30–49 trades
  | 'reliable';      // 50+ trades

export type AIMode = 'evidence' | 'coach' | 'research';

export type AnalysisDateRange = 
  | '7d' 
  | '30d' 
  | '90d' 
  | '6m' 
  | '1y' 
  | 'all' 
  | 'custom';

export type FocusArea = 
  | 'risk' 
  | 'execution' 
  | 'psychology' 
  | 'strategy' 
  | 'consistency' 
  | 'rules' 
  | 'selection' 
  | 'overtrading';

export interface DataAccessPermissions {
  trades: boolean;
  psychology: boolean;
  strategies: boolean;
  journal: boolean;
  learningRules: boolean;
  riskBehavior: boolean;
}

export interface AIObservation {
  id: string;
  title: string;
  category: FocusArea;
  observation: string;
  evidence: string;
  sampleSize: {
    current: number;
    previous?: number;
  };
  dateRange: string;
  evidenceLevel: EvidenceLevel;
  possibleAlternatives: string[];
  tradeIds: string[];
  highlightFields: (keyof Trade | string)[];
  showMeWhy: ShowMeWhyDetails;
  coachQuestions?: string[];
  researchNotes?: {
    supportingCount: number;
    contradictingCount: number;
    dataGaps: string[];
  };
}

export interface ShowMeWhyDetails {
  detected: string;
  fieldsUsed: string[];
  tradesAnalyzed: number;
  supportingEvidence: string;
  contradictingEvidence?: string;
  confoundingFactors: string[];
  dataToImprove: string;
}

export interface PeriodComparison {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  currentCount: number;
  previousCount: number;
  
  winRate: { current: number; previous: number; delta: number };
  avgR: { current: number; previous: number; delta: number };
  netR: { current: number; previous: number; delta: number };
  netPnl: { current: number; previous: number; delta: number };
  profitFactor: { current: number; previous: number; delta: number };
  avgRiskPercent: { current: number; previous: number; delta: number };
  ruleAdherence: { current: number; previous: number; delta: number };
  fomoFrequency: { current: number; previous: number; delta: number };
  revengeFrequency: { current: number; previous: number; delta: number };
  
  sessionDistribution: Record<string, { current: number; previous: number }>;
  strategyUsage: Record<string, { current: number; previous: number }>;
}

export interface DiscoveredPattern {
  id: string;
  title: string;
  description: string;
  setupA: { label: string; count: number; avgR: number; winRate: number };
  setupB: { label: string; count: number; avgR: number; winRate: number };
  sampleSize: number;
  dateRange: string;
  evidenceLevel: EvidenceLevel;
  supportingTradeIds: string[];
  contradictingTradeIds: string[];
  alternativeExplanation: string;
  showMeWhy: ShowMeWhyDetails;
}

export type AILabsTab = 
  | 'analyst' 
  | 'patterns' 
  | 'hypothesis' 
  | 'scenarios' 
  | 'experiments' 
  | 'alerts' 
  | 'quality' 
  | 'controls';

export interface Hypothesis {
  id: string;
  userId?: string;
  dashboardId?: string;
  title?: string;
  category?: string;
  statement: string;
  market?: Market | 'All';
  strategy?: string | 'All';
  session?: Session | 'All';
  direction?: Direction | 'All';
  minSampleSize?: number;
  sampleSize?: number;
  criteria?: Record<string, any>;
  conclusionNotes?: string;
  
  supportingTradeIds: string[];
  contradictingTradeIds: string[];
  neutralTradeIds: string[];
  totalRelevantTrades: number;
  evidenceLevel: EvidenceLevel;
  status: 'insufficient' | 'early' | 'preliminary' | 'moderate' | 'reliable';
  
  createdAt: number;
  updatedAt: number;
  notes?: string;
}

export interface ScenarioSimulationResult {
  id: string;
  name: string;
  description: string;
  ruleType: 'fixed_risk' | 'exclude_fomo' | 'strict_rules' | 'session_filter' | 'strategy_filter' | 'custom';
  
  actual: {
    tradeCount: number;
    winRate: number;
    avgR: number;
    netR: number;
    netPnl: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  
  simulated: {
    tradeCount: number;
    winRate: number;
    avgR: number;
    netR: number;
    netPnl: number;
    profitFactor: number;
    maxDrawdown: number;
  };
  
  includedTradeIds: string[];
  excludedTradeIds: string[];
  sampleSize: number;
  dateRange: string;
}

export interface Experiment {
  id: string;
  userId?: string;
  dashboardId?: string;
  name: string;
  changeTested?: string;
  hypothesis?: string;
  startDate?: number;
  targetSampleSize?: number;
  currentSampleSize?: number;
  targetTradesCount?: number;
  tradeIds?: string[];
  reflectionNotes?: string;
  
  baselineTradeIds?: string[];
  experimentTradeIds?: string[];
  
  baseline?: {
    winRate: number;
    avgR: number;
    ruleAdherence: number;
    fomoFrequency: number;
  };
  current?: {
    winRate: number;
    avgR: number;
    ruleAdherence: number;
    fomoFrequency: number;
  };

  baselineMetrics?: {
    tradeCount: number;
    avgR: number;
    winRate: number;
    ruleAdherence: number;
    fomoPercent: number;
    avgRisk: number;
  };
  
  experimentMetrics?: {
    tradeCount: number;
    avgR: number;
    winRate: number;
    ruleAdherence: number;
    fomoPercent: number;
    avgRisk: number;
  };
  
  conclusionStatus?: 'no_difference' | 'early' | 'moderate' | 'stronger';
  status: 'active' | 'completed' | 'ongoing' | 'early_improvement' | 'early_degradation' | 'inconclusive';
  createdAt?: number;
}

export interface AIAlert {
  id: string;
  type: 'risk_behavior' | 'reentry_pattern' | 'strategy_sample' | 'psychology_gap' | 'overtrading' | 'rule_drift';
  title: string;
  message: string;
  evidence: string;
  severity: 'info' | 'warning' | 'alert';
  tradeIds: string[];
  date: number;
  dismissed?: boolean;
}

export interface DataQualityAudit {
  totalTrades: number;
  completeRecords: number;
  overallScore: number; // 0-100%
  
  missingSessions: number;
  missingStrategies: number;
  missingPsychology: number;
  missingR: number;
  missingScreenshots: number;
  missingNotes: number;
  missingAdherence: number;
  
  incompleteTrades: {
    trade: Trade;
    missingFields: string[];
  }[];
}

export interface AIAnswerResponse {
  answer: string;
  evidence: string;
  sampleSize: string;
  limitations: string;
  nextInvestigation: string;
  relevantTradeIds: string[];
  hasSufficientData: boolean;
}

export interface StoredInsight {
  id: string;
  timestamp: number;
  title: string;
  observation: string;
  sampleSize: string;
  dateRange: string;
  evidenceLevel: EvidenceLevel;
  category: string;
  tradeIds: string[];
  archived?: boolean;
}
