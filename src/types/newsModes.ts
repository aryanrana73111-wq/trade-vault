import { MarketNewsArticle, NewsEvent, MarketSnapshotAsset } from './newsIntelligence';

export type NewsSystemMode = 'NORMAL' | 'PRO' | 'ADVANCED';

export interface ProviderStatus {
  name: string;
  type: 'news' | 'market_data' | 'calendar';
  connected: boolean;
  isLive: boolean;
  lastUpdated: string;
  sourceAttribution: string;
  latencyMs?: number;
  message?: string;
}

export interface WhatMovedMarketsDriver {
  id: string;
  title: string;
  relevance: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  source: string;
  sourceUrl?: string;
  publishedTime: string;
  explanation: string;
  affectedAssets: {
    symbol: string;
    reactionPct?: number;
    reactionLabel?: string;
    isPositive?: boolean;
  }[];
  qualification: 'Potential market driver' | 'Market reaction associated with this development';
  evidencePoints: string[];
}

export interface EntityIntelligence {
  id: string;
  name: string;
  symbolOrTicker?: string;
  type: 'Central Bank' | 'Commodity' | 'Crypto' | 'Company' | 'Currency' | 'Economic Indicator';
  description: string;
  keyStats: { label: string; value: string; subtext?: string }[];
  primaryDriver: string;
  relatedMarkets: string[];
  upcomingEventIds?: string[];
  recentStoryIds?: string[];
  historicalContext: string;
}

export interface NewsAttentionMetric {
  topic: string;
  countCurrent6h: number;
  countPrevious6h: number;
  percentChange: number;
  status: 'INCREASED' | 'STABLE' | 'DECREASED';
  summary: string;
}

export interface MarketReactionPoint {
  timeOffset: string;
  label: string;
  price: number;
  changePct: number;
}

export interface MarketReactionEventProfile {
  eventId: string;
  eventName: string;
  releaseTime: string;
  primaryAsset: string;
  assetSymbol: string;
  dataSurprise: {
    actual: string | number;
    forecast: string | number;
    previous: string | number;
    surpriseFormatted: string;
    direction: 'Above consensus' | 'Below consensus' | 'In line';
  };
  observedReactions: {
    asset: string;
    symbol: string;
    pctMove5m: number;
    pctMove15m: number;
    pctMove1h: number;
    currentPct: number;
    direction: 'UP' | 'DOWN' | 'NEUTRAL';
    points: MarketReactionPoint[];
  }[];
  observationDisclaimer: string;
}

export interface HistoricalEventStatWindow {
  window: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D';
  avgReactionPct: number;
  medianReactionPct: number;
  maxReactionPct: number;
  minReactionPct: number;
  volatilityIndex: number;
  sampleCount: number;
}

export interface EventAssetRelationshipNode {
  id: string;
  name: string;
  symbol: string;
  category: 'Forex' | 'Commodities' | 'Bonds' | 'Equities' | 'Crypto';
  transmissionRationale: string;
  historicalTendency: string;
  currentPriceFormatted?: string;
  currentChangePct?: number;
}

export interface AINewsAnalystResponse {
  query: string;
  timestamp: string;
  whatHappened: string;
  whyItMatters: string;
  marketsInvolved: string[];
  currentMarketReaction: string;
  historicalContext: string;
  evidence: string[];
  uncertainty: string[];
  whatToWatch: string[];
  source: string;
  sourceUrl?: string;
  language?: 'en' | 'hi';
}
