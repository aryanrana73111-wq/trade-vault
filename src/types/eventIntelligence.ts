import { NewsEvent, NewsImpact, ReleaseStatus, NewsCategory } from './newsIntelligence';

export type TimeSeriesRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | '10Y' | 'MAX';

export type ReactionWindow = '-15m' | '-5m' | 'release' | '+5m' | '+15m' | '+1h' | '+4h';

export type ReactionAsset = 'XAUUSD' | 'EURUSD' | 'DXY' | 'US10Y' | 'BTCUSD' | 'SPX';

export interface ReactionWindowPoint {
  window: ReactionWindow;
  label: string;
  minutesFromRelease: number;
  // Prices and percentage moves from reference baseline (price at -15m)
  assets: Record<ReactionAsset, {
    price: number;
    pctChange: number; // e.g. +0.42%
    displayPrice: string;
    unit?: string;
  }>;
}

export interface ReleaseHistoryEntry {
  id: string;
  date: string;
  period: string;
  actual: number | string;
  consensus: number | string;
  previous: number | string;
  revisedPrevious?: number | string;
  revisionNote?: string;
  surprise: number; // actual - consensus
  surpriseLabel: 'Above Consensus' | 'Below Consensus' | 'In Line';
  marketReaction15m?: {
    asset: string;
    pctMove: number;
    direction: 'UP' | 'DOWN' | 'FLAT';
  };
}

export interface HistoricalTimePoint {
  date: string;
  value: number;
  consensus?: number;
  previous?: number;
}

export interface RelatedReleaseEvent {
  id: string;
  name: string;
  period: string;
  dateTime: string;
  status: ReleaseStatus;
  actual?: number | string;
  forecast?: number | string;
  relationship: 'previous' | 'current' | 'next' | 'sister';
}

export interface CountryMacroProfile {
  country: string;
  currency: string;
  flag: string;
  gdpGrowth: string;
  inflation: string;
  interestRate: string;
  unemployment: string;
  tenYearYield: string;
  debtToGdp: string;
}

export interface CentralBankContext {
  institution: string;
  currentRate: string;
  lastDecision: string;
  lastDecisionDate: string;
  nextDecisionDate: string;
  stance: 'Hawkish' | 'Dovish' | 'Neutral';
  recentSpeechOrStatement: string;
}

export interface ExplainLikeATraderData {
  whatHappened: string;
  whyItMatters: string;
  whatChanged: string;
  whatToWatchNext: string;
}

export interface PersonalTradeVaultEventMetric {
  market: string;
  tradesCount: number;
  wins: number;
  losses: number;
  winRate: number; // percentage 0-100
  avgR: number;
  totalR: number;
  hasSufficientData: boolean; // sample size >= 3
}

export interface PersonalEventStudyWindow {
  window: '15m' | '30m' | '1h' | '4h' | '1D';
  label: string;
  preReleaseVolatility: string;
  releaseSpike: string;
  postReleaseTrend: string;
  userPnLDistribution?: {
    profitableTrades: number;
    unprofitableTrades: number;
  };
}
