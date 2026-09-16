export type NewsImpact = 'LOW' | 'MEDIUM' | 'HIGH' | 'NON-ECONOMIC';

export type NewsCategory = 
  | 'Monetary Policy'
  | 'Inflation'
  | 'Employment'
  | 'Growth'
  | 'Manufacturing'
  | 'Services'
  | 'Consumer'
  | 'Housing'
  | 'Trade'
  | 'Central Bank'
  | 'Government'
  | 'Energy'
  | 'Business'
  | 'Sentiment'
  | 'Crypto'
  | 'Speeches'
  | 'Auctions'
  | 'Other';

export type ReleaseStatus = 'Upcoming' | 'Released' | 'Revised' | 'Delayed' | 'Cancelled';

export type ValueInterpretation = 'positive' | 'negative' | 'context-dependent';

export type HawkishDovishStance = 'Hawkish' | 'Neutral' | 'Dovish' | 'Mixed / Unclear';

export type SensitivityLevel = 'Very High' | 'High' | 'Medium' | 'Low';

export type EvidenceConfidence = 
  | 'Insufficient Data' 
  | 'Early Evidence' 
  | 'Preliminary Evidence' 
  | 'More Reliable Historical Observation';

export type ExplanationMode = 'beginner' | 'trader' | 'professional';

export type NewsSection = 
  | 'calendar'
  | 'high-impact'
  | 'academy'
  | 'search'
  | 'reaction-lab'
  | 'scenario-lab'
  | 'knowledge-map'
  | 'performance'
  | 'watchlist'
  | 'settings';

export interface AffectedMarketItem {
  asset: string;
  sensitivity: SensitivityLevel;
  rationale: string;
  historicalTendency?: string;
}

export interface OfficialCommentItem {
  speaker: string;
  title: string;
  quote: string;
  source: string;
  timestamp: string;
  simplifiedExplanation: string;
  marketInterpretation: string;
}

export interface ScenarioDefinition {
  title: string;
  condition: string;
  transmission: string[];
  marketTendency: string;
  disclaimer: string;
}

export interface HistoricalReactionObservation {
  date: string;
  actual: number | string;
  forecast: number | string;
  surprise: number | string;
  assetReactions: Record<string, { pctMove: number; direction: 'UP' | 'DOWN' | 'FLAT' }>;
}

export interface HistoricalReactionStats {
  sampleSize: number;
  confidence: EvidenceConfidence;
  windows: {
    '5m': { avgAbsMove: number; positivePercent: number; negativePercent: number; largestMove: number; smallestMove: number };
    '15m': { avgAbsMove: number; positivePercent: number; negativePercent: number; largestMove: number; smallestMove: number };
    '30m': { avgAbsMove: number; positivePercent: number; negativePercent: number; largestMove: number; smallestMove: number };
    '1h': { avgAbsMove: number; positivePercent: number; negativePercent: number; largestMove: number; smallestMove: number };
    '4h': { avgAbsMove: number; positivePercent: number; negativePercent: number; largestMove: number; smallestMove: number };
    '1D': { avgAbsMove: number; positivePercent: number; negativePercent: number; largestMove: number; smallestMove: number };
  };
  recentReleases: HistoricalReactionObservation[];
}

export interface TransmissionChannelFlow {
  origin: string;
  nodes: { label: string; description: string }[];
  summary: string;
}

export interface NewsEvent {
  id: string;
  name: string;
  code: string; // e.g. FOMC, NFP, CPI
  country: string;
  countryCode: string; // e.g. 'US', 'EU', 'GB', 'JP'
  currency: string;
  category: NewsCategory;
  impact: NewsImpact;
  dateTime: string; // ISO string e.g. '2026-09-08T12:30:00Z'
  period: string; // e.g. 'Aug', 'Q2', 'Jul'
  status: ReleaseStatus;
  source: string;
  sourceUrl?: string;
  sourceTimestamp?: string;
  unit: string;
  
  // Numerical & Qualitative Release Data
  previous?: number | string;
  revisedPrevious?: number | string;
  revisionDetails?: {
    previousPublished: number | string;
    revisedValue: number | string;
    revisionDate: string;
    reason?: string;
  };
  forecast?: number | string;
  forecastType?: 'Consensus' | 'Forecast' | 'Model Estimate';
  actual?: number | string;
  surprise?: number | string;
  surpriseFormatted?: string;
  surpriseDirection?: 'Stronger than expected' | 'Near expectations' | 'Weaker than expected' | 'In line' | 'Mixed';
  
  // Economic interpretation metadata
  higher_value_interpretation: ValueInterpretation;
  lower_value_interpretation: ValueInterpretation;
  
  // Core Explanatory Layers
  simpleExplanation: string;
  whyItMatters: string;
  whatItMeasures: string;
  whoReleasesIt: string;
  frequency: string;
  
  // Markets Affected
  affectedMarkets: AffectedMarketItem[];
  
  // Post-Release / What Actually Happened
  headlineResult?: string;
  mainChange?: string;
  importantComponents?: string[];
  revisions?: string;
  importantDetails?: string;
  officialCommentary?: OfficialCommentItem[];
  
  // Hawkish / Dovish Interpretation
  hawkishDovish?: {
    stance: HawkishDovishStance;
    explanation: string;
    rationale: string;
  };
  
  // Visual Transmission Channel
  transmission: TransmissionChannelFlow;
  
  // Historical reaction analysis
  historical?: HistoricalReactionStats;
  
  // Conditional Scenarios (Hawkish, Dovish, In-Line, Mixed)
  scenarios?: {
    hawkish: ScenarioDefinition;
    dovish: ScenarioDefinition;
    inLine: ScenarioDefinition;
    mixed: ScenarioDefinition;
  };
  
  // Academy reference
  academyTopicId?: string;
}

export interface NewsAcademyQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface NewsAcademyArticle {
  id: string;
  slug: string;
  title: string;
  code: string;
  category: NewsCategory;
  currency: string;
  impact: NewsImpact;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedReadTime: string;

  // 30 structured sections
  simpleDefinition: string;
  fullDefinition: string;
  whyItExists: string;
  whoPublishesIt: string;
  howCalculated: string;
  releaseFrequency: string;
  whyTradersCare: string;
  affectedMarkets: AffectedMarketItem[];
  whatHigherLowerMeans: {
    higher: string;
    lower: string;
    context: string;
  };
  whenRelationshipBreaks: string[];
  forecastVsActualVsPrevious: string;
  revisionsExplanation: string;
  hawkishDovishRelevance?: string;
  transmissionFlow: {
    steps: string[];
    description: string;
  };
  realWorldExample: {
    title: string;
    date: string;
    eventContext: string;
    outcome: string;
    lesson: string;
  };
  historicalExample: {
    date: string;
    context: string;
    marketReaction: string;
  };
  visualExplanationSteps: string[];
  scenarioFramework: {
    hawkish: string;
    dovish: string;
    inLine: string;
    mixed: string;
  };
  commonMistakes: string[];
  beginnerMistakes: string[];
  professionalInterpretation: string;
  riskConsiderations: string[];
  relatedNewsCodes: string[];
  relatedAcademyLessonIds: string[];
  quiz: NewsAcademyQuizQuestion[];
  
  // Explanations per mode
  beginnerContent: string;
  traderContent: string;
  professionalContent: string;
}

export type NewsTabId = 
  | 'calendar' 
  | 'radar' 
  | 'academy' 
  | 'reaction-lab' 
  | 'scenario-lab' 
  | 'knowledge-map' 
  | 'my-performance' 
  | 'search';

export interface NewsKnowledgeNode {
  id: string;
  name: string;
  category: 'Driver' | 'Policy' | 'Indicator' | 'Yield' | 'Currency' | 'Asset';
  description: string;
  upstreamIds: string[];
  downstreamIds?: string[];
  inputs?: string[];
  outputs?: string[];
  relatedLessonId?: string;
  relatedNewsCode?: string;
}

export interface CalendarEventAlert {
  eventId: string;
  eventName: string;
  leadMinutes: number; // 5, 15, 30, 60, or custom
  channels: ('in_app' | 'browser')[];
  enabled: boolean;
  createdAt: string;
}

export interface NewsUserSettings {
  timezone: string; // e.g. 'UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata', 'LOCAL'
  defaultImpactFilter: 'ALL' | 'MEDIUM_HIGH' | 'HIGH_ONLY';
  defaultMode: ExplanationMode;
  preEventWarningMinutes: number; // 15, 30, 60
  preEventNotificationMinutes?: number;
  watchlistCurrencies: string[];
  watchlistAssets: string[];
  watchlistedEventIds: string[];
  watchlistEventIds?: string[];
  watchedIndicatorIds?: string[];
  bookmarkedArticleIds: string[];
  learnedArticleIds: string[];
  dismissedAlertIds?: string[];
  calendarAlerts?: Record<string, CalendarEventAlert>; // eventId -> alert config
  userNotes: Record<string, string>; // eventId or articleId -> note text
  notifyOnHighImpactOnly?: boolean;
  breakingNewsAlerts?: boolean;
  soundAlerts?: boolean;
}

export interface EconomicIndicator {
  id: string;
  code: string; // e.g. US-CPI, US-FEDFUNDS, US-NFP
  name: string;
  country: string;
  countryCode: string;
  currency: string;
  category: 'Inflation' | 'Monetary Policy' | 'Labor' | 'Growth' | 'Business' | 'Trade' | 'Housing' | 'Debt';
  frequency: string;
  unit: string;
  latestValue: number | string;
  previousValue: number | string;
  forecastValue?: number | string;
  releasePeriod: string;
  source: string;
  sourceUrl?: string;
  description: string;
  importance: NewsImpact;
  lastUpdated: string;
  historicalSeries: { date: string; value: number; consensus?: number }[];
  relatedMarkets: string[];
  relatedEventId?: string;
  whatItMeasures: string;
  traderTakeaway: string;
}

export interface NewsStoryCluster {
  id: string;
  topicTitle: string;
  primaryHeadline: string;
  summary: string;
  sourcesCount: number;
  sourcesList: { name: string; url: string; stance?: string }[];
  status: 'DEVELOPING' | 'BREAKING' | 'CONFIRMED';
  confirmedFacts: string[];
  differingPoints: string[];
  uncertainPoints: string[];
  timeline: { time: string; source: string; headline: string; url?: string }[];
  relatedMarkets: string[];
  relatedIndicatorCode?: string;
  relatedEventId?: string;
}

export interface MarketSnapshotAsset {
  symbol: string;
  name: string;
  category: 'Forex' | 'Commodities' | 'Crypto' | 'Indices' | 'Bonds';
  price: number;
  priceFormatted: string;
  change24h: number;
  change7d: number;
  high24h: number;
  low24h: number;
  unit?: string;
  macroDriver: string;
  sparkline: number[];
  relatedNewsCategory: string;
}

export interface NewsVolatilityAlert {
  id: string;
  eventId: string;
  eventName: string;
  countryCode: string;
  currency: string;
  impact: NewsImpact;
  scheduledTime: string; // ISO string
  warningLeadMinutes: number;
  affectedInstruments: string[];
  catalystSummary: string;
  expectedVolatility: 'Extreme' | 'High' | 'Moderate';
  recommendedRiskAction: string;
  dismissed?: boolean;
}

export interface ExplainLikeATrader {
  whatHappened: string;
  whyItMatters: string;
  whatDataChanged: string;
  relevantMarkets: string[];
  watchNext: string;
  plainEnglish?: string;
  whyItMovesMarkets?: string;
  traderTakeaway?: string;
}

export interface MarketNewsArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string; // ISO format
  updatedAt?: string;
  readingTimeMinutes?: number;
  imageUrl?: string;
  category: string;
  markets: string[];
  impact: NewsImpact;
  country?: string;
  personEntity?: string;
  event?: string;
  previous?: string | number;
  forecast?: string | number;
  actual?: string | number;
  relatedStories?: string[];

  // Developing Story Clustering
  clusterId?: string;
  isDevelopingStory?: boolean;
  sourceCount?: number;
  sourcesCount?: number;
  sourcesList?: string[];

  // Related Indicators & Events
  relatedIndicatorId?: string;
  relatedIndicatorCode?: string;
  relatedIndicatorName?: string;
  relatedEventId?: string;

  // Multi-source comparisons
  confirmedFacts?: string[];
  differingPoints?: string[];
  uncertainPoints?: string[];

  // Educational / Trader Context
  whatHappened?: string;
  whyItMatters?: string;
  explainTrader?: ExplainLikeATrader;
  marketsToWatch?: string[];
  traderImpact?: {
    markets: { asset: string; sensitivity: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN' }[];
    explanation: string;
  };
  bullBearContext?: {
    bullish: string;
    bearish: string;
    neutral: string;
  };
}
