export interface EconomicIndicatorData {
  eventName: string;
  currency?: string;
  countryCode?: string;
  previous: string | number;
  forecast: string | number;
  actual?: string | number | null;
  unit?: string;
  releaseTime: string; // ISO 8601 string
  status: 'RELEASED' | 'NOT_RELEASED';
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impact?: 'HIGH' | 'MEDIUM' | 'LOW';
  consensusNote?: string;
}

export interface NormalizedNewsArticle {
  id: string;
  headline: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl?: string;
  publishedAt: string; // ISO 8601 string
  updatedAt?: string;   // ISO 8601 string if updated later
  category: string;     // 'Markets' | 'Forex' | 'Crypto' | 'Stocks' | 'Commodities' | 'Economy' | 'Central Banks' | 'Geopolitics' | 'Companies'
  country?: string;
  currencies?: string[];
  relatedMarkets?: string[];
  tags?: string[];
  isDevelopingStory?: boolean;
  impact?: 'HIGH' | 'MEDIUM' | 'LOW';
  indicatorData?: EconomicIndicatorData;
  
  // Market Intelligence Context (Objective factual context, NO predictions)
  intelligence?: {
    whyItMatters: string;
    marketsPotentiallyAffected: string[];
    relatedInstruments: string[];
    historicalContext?: string;
    evidence?: string[];
    uncertainty?: string;
  };
}

export interface NewsFilterParams {
  date: string; // YYYY-MM-DD
  category?: string;
  market?: string;
  impact?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export interface NewsProviderResult {
  articles: NormalizedNewsArticle[];
  source: string;
  isLive: boolean;
  fetchedAt: string;
  isFutureDate?: boolean;
  cacheAgeMinutes?: number;
  isStale?: boolean;
}

export interface StoredNewsCache {
  date: string;
  provider: string;
  fetchedAt: number; // Date.now()
  articles: NormalizedNewsArticle[];
}
