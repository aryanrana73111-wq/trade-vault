import { Trade } from '@/types';

export type LabCategory = 
  | 'statistical'
  | 'distribution'
  | 'stability'
  | 'risk-drawdown'
  | 'efficiency'
  | 'execution'
  | 'entry-exit'
  | 'time'
  | 'strategy-portfolio'
  | 'robustness'
  | 'research'
  | 'data-quality';

export type ReliabilityLevel = 
  | 'insufficient'   // n < 5
  | 'limited'        // 5 - 14
  | 'early'          // 15 - 29
  | 'preliminary'    // 30 - 49
  | 'adequate';      // 50+

export interface MetricExplainerData {
  title: string;
  category: string;
  questionAnswered: string;
  whatIsIt: string;
  whyItMatters: string;
  formula: string;
  variables: { name: string; description: string; sampleValue?: string }[];
  interpretation: string;
  limitations: string;
  sampleSizeCaution: string;
  calculationMethod: string;
  exampleCalculation?: string;
}

export interface FeatureCatalogItem {
  id: string;
  title: string;
  shortDescription: string;
  category: LabCategory;
  categoryLabel: string;
  questionAnswered: string;
  requiredFields: string[];
  isAvailable: (trades: Trade[]) => { available: boolean; missingReason?: string; presentCount?: number; totalCount?: number };
  sampleSizeRecommendation: number;
  explainer: MetricExplainerData;
  iconName: string;
}

export interface CustomAnalysisConfig {
  xAxis: 'duration' | 'riskPercent' | 'realizedR' | 'pnl' | 'positionSize' | 'date';
  yAxis: 'realizedR' | 'pnl' | 'riskPercent' | 'duration' | 'positionSize';
  grouping: 'strategy' | 'session' | 'market' | 'direction' | 'setupQuality' | 'result' | 'none';
  metric: 'sum' | 'avg' | 'median' | 'count';
  dateFilter?: string;
}

export interface AnalyticsSnapshot {
  id: string;
  name: string;
  createdAt: number;
  dateRange: string;
  activeFilters: Record<string, string>;
  tradeCount: number;
  notes?: string;
}

export interface ResearchNote {
  id: string;
  moduleId: string;
  moduleTitle: string;
  content: string;
  createdAt: number;
  tradeCountAtCreation: number;
}
