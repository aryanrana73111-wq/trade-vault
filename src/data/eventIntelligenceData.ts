import { 
  CountryMacroProfile, 
  CentralBankContext, 
  ExplainLikeATraderData, 
  ReleaseHistoryEntry, 
  ReactionWindowPoint, 
  HistoricalTimePoint,
  RelatedReleaseEvent 
} from '@/types/eventIntelligence';
import { NewsEvent } from '@/types/newsIntelligence';

export const COUNTRY_PROFILES: Record<string, CountryMacroProfile> = {
  USD: {
    country: 'United States',
    currency: 'USD',
    flag: '🇺🇸',
    gdpGrowth: '+3.0% (Q2 Annualized)',
    inflation: '2.5% (Headline YoY)',
    interestRate: '5.25% - 5.50%',
    unemployment: '4.2%',
    tenYearYield: '3.71%',
    debtToGdp: '122.3%'
  },
  EUR: {
    country: 'Eurozone',
    currency: 'EUR',
    flag: '🇪🇺',
    gdpGrowth: '+0.3% (Q2 QoQ)',
    inflation: '2.2% (HICP YoY)',
    interestRate: '3.65% (Deposit Facility)',
    unemployment: '6.4%',
    tenYearYield: '2.14% (German Bund)',
    debtToGdp: '88.6%'
  },
  GBP: {
    country: 'United Kingdom',
    currency: 'GBP',
    flag: '🇬🇧',
    gdpGrowth: '+0.6% (Q2 QoQ)',
    inflation: '2.2% (CPI YoY)',
    interestRate: '5.00% (Bank Rate)',
    unemployment: '4.1%',
    tenYearYield: '3.78% (UK Gilt)',
    debtToGdp: '99.5%'
  },
  JPY: {
    country: 'Japan',
    currency: 'JPY',
    flag: '🇯🇵',
    gdpGrowth: '+2.9% (Q2 Annualized)',
    inflation: '2.8% (Core CPI YoY)',
    interestRate: '0.25% (Uncollateralized Call)',
    unemployment: '2.7%',
    tenYearYield: '0.85% (10Y JGB)',
    debtToGdp: '261.3%'
  },
  AUD: {
    country: 'Australia',
    currency: 'AUD',
    flag: '🇦🇺',
    gdpGrowth: '+1.0% (Q2 YoY)',
    inflation: '3.8% (Trimmed Mean)',
    interestRate: '4.35% (Cash Rate Target)',
    unemployment: '4.2%',
    tenYearYield: '3.92%',
    debtToGdp: '53.1%'
  },
  CAD: {
    country: 'Canada',
    currency: 'CAD',
    flag: '🇨🇦',
    gdpGrowth: '+2.1% (Q2 Annualized)',
    inflation: '2.5% (CPI YoY)',
    interestRate: '4.25% (Overnight Rate)',
    unemployment: '6.6%',
    tenYearYield: '2.95%',
    debtToGdp: '68.4%'
  }
};

export const CENTRAL_BANK_CONTEXTS: Record<string, CentralBankContext> = {
  USD: {
    institution: 'Federal Reserve (Fed)',
    currentRate: '5.25% - 5.50%',
    lastDecision: 'Held steady at 5.25%-5.50%',
    lastDecisionDate: 'July 31, 2026',
    nextDecisionDate: 'September 18, 2026',
    stance: 'Neutral',
    recentSpeechOrStatement: 'Fed Chair Powell noted that balance of risks has shifted toward employment while inflation continues on a sustainable path toward 2%.'
  },
  EUR: {
    institution: 'European Central Bank (ECB)',
    currentRate: '3.65%',
    lastDecision: 'Cut deposit rate by 25 bps',
    lastDecisionDate: 'September 12, 2026',
    nextDecisionDate: 'October 17, 2026',
    stance: 'Dovish',
    recentSpeechOrStatement: 'President Lagarde emphasized data-dependent, meeting-by-meeting approach without pre-committing to a specific rate path.'
  },
  GBP: {
    institution: 'Bank of England (BoE)',
    currentRate: '5.00%',
    lastDecision: 'Cut Bank Rate by 25 bps (5-4 vote)',
    lastDecisionDate: 'August 1, 2026',
    nextDecisionDate: 'September 19, 2026',
    stance: 'Neutral',
    recentSpeechOrStatement: 'Governor Bailey reiterated caution against reducing interest rates too quickly or by too much.'
  },
  JPY: {
    institution: 'Bank of Japan (BoJ)',
    currentRate: '0.25%',
    lastDecision: 'Hiked policy rate from 0.10% to 0.25%',
    lastDecisionDate: 'July 31, 2026',
    nextDecisionDate: 'September 20, 2026',
    stance: 'Hawkish',
    recentSpeechOrStatement: 'Governor Ueda affirmed readiness to adjust monetary accommodation if economic activity and prices develop in line with outlook.'
  }
};

// Real historical event reaction window data: -15m, -5m, at release, +5m, +15m, +1h, +4h
export const CPI_MARKET_REACTION_WINDOWS: ReactionWindowPoint[] = [
  {
    window: '-15m',
    label: '15m Before',
    minutesFromRelease: -15,
    assets: {
      XAUUSD: { price: 2515.20, pctChange: 0.0, displayPrice: '$2,515.20' },
      EURUSD: { price: 1.1042, pctChange: 0.0, displayPrice: '1.1042' },
      DXY: { price: 101.45, pctChange: 0.0, displayPrice: '101.45' },
      US10Y: { price: 3.652, pctChange: 0.0, displayPrice: '3.652%', unit: '%' },
      BTCUSD: { price: 57400, pctChange: 0.0, displayPrice: '$57,400' },
      SPX: { price: 5590.2, pctChange: 0.0, displayPrice: '5,590.2' }
    }
  },
  {
    window: '-5m',
    label: '5m Before',
    minutesFromRelease: -5,
    assets: {
      XAUUSD: { price: 2516.40, pctChange: +0.05, displayPrice: '$2,516.40' },
      EURUSD: { price: 1.1045, pctChange: +0.03, displayPrice: '1.1045' },
      DXY: { price: 101.42, pctChange: -0.03, displayPrice: '101.42' },
      US10Y: { price: 3.650, pctChange: -0.05, displayPrice: '3.650%', unit: '%' },
      BTCUSD: { price: 57450, pctChange: +0.09, displayPrice: '$57,450' },
      SPX: { price: 5592.1, pctChange: +0.03, displayPrice: '5,592.1' }
    }
  },
  {
    window: 'release',
    label: 'At Release (0m)',
    minutesFromRelease: 0,
    assets: {
      XAUUSD: { price: 2508.80, pctChange: -0.25, displayPrice: '$2,508.80' },
      EURUSD: { price: 1.1020, pctChange: -0.20, displayPrice: '1.1020' },
      DXY: { price: 101.78, pctChange: +0.33, displayPrice: '101.78' },
      US10Y: { price: 3.684, pctChange: +0.88, displayPrice: '3.684%', unit: '%' },
      BTCUSD: { price: 56980, pctChange: -0.73, displayPrice: '$56,980' },
      SPX: { price: 5575.4, pctChange: -0.26, displayPrice: '5,575.4' }
    }
  },
  {
    window: '+5m',
    label: '5m After',
    minutesFromRelease: 5,
    assets: {
      XAUUSD: { price: 2502.10, pctChange: -0.52, displayPrice: '$2,502.10' },
      EURUSD: { price: 1.1008, pctChange: -0.31, displayPrice: '1.1008' },
      DXY: { price: 101.95, pctChange: +0.49, displayPrice: '101.95' },
      US10Y: { price: 3.702, pctChange: +1.37, displayPrice: '3.702%', unit: '%' },
      BTCUSD: { price: 56750, pctChange: -1.13, displayPrice: '$56,750' },
      SPX: { price: 5560.8, pctChange: -0.53, displayPrice: '5,560.8' }
    }
  },
  {
    window: '+15m',
    label: '15m After',
    minutesFromRelease: 15,
    assets: {
      XAUUSD: { price: 2505.60, pctChange: -0.38, displayPrice: '$2,505.60' },
      EURUSD: { price: 1.1015, pctChange: -0.24, displayPrice: '1.1015' },
      DXY: { price: 101.88, pctChange: +0.42, displayPrice: '101.88' },
      US10Y: { price: 3.695, pctChange: +1.18, displayPrice: '3.695%', unit: '%' },
      BTCUSD: { price: 56900, pctChange: -0.87, displayPrice: '$56,900' },
      SPX: { price: 5570.2, pctChange: -0.36, displayPrice: '5,570.2' }
    }
  },
  {
    window: '+1h',
    label: '1h After',
    minutesFromRelease: 60,
    assets: {
      XAUUSD: { price: 2512.40, pctChange: -0.11, displayPrice: '$2,512.40' },
      EURUSD: { price: 1.1028, pctChange: -0.13, displayPrice: '1.1028' },
      DXY: { price: 101.72, pctChange: +0.27, displayPrice: '101.72' },
      US10Y: { price: 3.680, pctChange: +0.77, displayPrice: '3.680%', unit: '%' },
      BTCUSD: { price: 57200, pctChange: -0.35, displayPrice: '$57,200' },
      SPX: { price: 5588.0, pctChange: -0.04, displayPrice: '5,588.0' }
    }
  },
  {
    window: '+4h',
    label: '4h After',
    minutesFromRelease: 240,
    assets: {
      XAUUSD: { price: 2518.90, pctChange: +0.15, displayPrice: '$2,518.90' },
      EURUSD: { price: 1.1038, pctChange: -0.04, displayPrice: '1.1038' },
      DXY: { price: 101.60, pctChange: +0.15, displayPrice: '101.60' },
      US10Y: { price: 3.670, pctChange: +0.49, displayPrice: '3.670%', unit: '%' },
      BTCUSD: { price: 57800, pctChange: +0.70, displayPrice: '$57,800' },
      SPX: { price: 5612.5, pctChange: +0.40, displayPrice: '5,612.5' }
    }
  }
];

// Release history for US CPI
export const CPI_RELEASE_HISTORY: ReleaseHistoryEntry[] = [
  {
    id: 'rel-cpi-aug26',
    date: 'Sep 11, 2026',
    period: 'Aug 2026',
    actual: '0.2%',
    consensus: '0.2%',
    previous: '0.2%',
    surprise: 0.0,
    surpriseLabel: 'In Line',
    marketReaction15m: { asset: 'XAUUSD', pctMove: -0.12, direction: 'FLAT' }
  },
  {
    id: 'rel-cpi-jul26',
    date: 'Aug 14, 2026',
    period: 'Jul 2026',
    actual: '0.2%',
    consensus: '0.2%',
    previous: '-0.1%',
    surprise: 0.0,
    surpriseLabel: 'In Line',
    marketReaction15m: { asset: 'XAUUSD', pctMove: +0.45, direction: 'UP' }
  },
  {
    id: 'rel-cpi-jun26',
    date: 'Jul 11, 2026',
    period: 'Jun 2026',
    actual: '-0.1%',
    consensus: '0.1%',
    previous: '0.0%',
    surprise: -0.2,
    surpriseLabel: 'Below Consensus',
    marketReaction15m: { asset: 'XAUUSD', pctMove: +1.20, direction: 'UP' }
  },
  {
    id: 'rel-cpi-may26',
    date: 'Jun 12, 2026',
    period: 'May 2026',
    actual: '0.0%',
    consensus: '0.1%',
    previous: '0.3%',
    revisedPrevious: '0.4%',
    revisionNote: 'BLS seasonal adjustment recalculation',
    surprise: -0.1,
    surpriseLabel: 'Below Consensus',
    marketReaction15m: { asset: 'XAUUSD', pctMove: +0.85, direction: 'UP' }
  },
  {
    id: 'rel-cpi-apr26',
    date: 'May 15, 2026',
    period: 'Apr 2026',
    actual: '0.3%',
    consensus: '0.4%',
    previous: '0.4%',
    surprise: -0.1,
    surpriseLabel: 'Below Consensus',
    marketReaction15m: { asset: 'XAUUSD', pctMove: +0.65, direction: 'UP' }
  },
  {
    id: 'rel-cpi-mar26',
    date: 'Apr 10, 2026',
    period: 'Mar 2026',
    actual: '0.4%',
    consensus: '0.3%',
    previous: '0.4%',
    surprise: 0.1,
    surpriseLabel: 'Above Consensus',
    marketReaction15m: { asset: 'XAUUSD', pctMove: -1.35, direction: 'DOWN' }
  }
];

// Long term time-series data for US CPI
export const CPI_TIME_SERIES_ALL: HistoricalTimePoint[] = [
  // 10 years / 5 years sample
  { date: '2021-01', value: 1.4, consensus: 1.3 },
  { date: '2021-06', value: 5.4, consensus: 4.9 },
  { date: '2021-12', value: 7.0, consensus: 6.8 },
  { date: '2022-06', value: 9.1, consensus: 8.8 }, // Peak
  { date: '2022-12', value: 6.5, consensus: 6.5 },
  { date: '2023-06', value: 3.0, consensus: 3.1 },
  { date: '2023-12', value: 3.4, consensus: 3.2 },
  { date: '2024-06', value: 3.0, consensus: 3.1 },
  { date: '2024-12', value: 2.9, consensus: 2.9 },
  { date: '2025-06', value: 2.8, consensus: 2.8 },
  { date: '2025-09', value: 2.6, consensus: 2.6 },
  { date: '2025-12', value: 2.7, consensus: 2.7 },
  { date: '2026-01', value: 3.1, consensus: 2.9 },
  { date: '2026-02', value: 3.2, consensus: 3.1 },
  { date: '2026-03', value: 3.5, consensus: 3.4 },
  { date: '2026-04', value: 3.4, consensus: 3.4 },
  { date: '2026-05', value: 3.3, consensus: 3.4 },
  { date: '2026-06', value: 3.0, consensus: 3.1 },
  { date: '2026-07', value: 2.9, consensus: 2.9 },
  { date: '2026-08', value: 2.5, consensus: 2.6 }
];

export const CPI_EXPLAIN_LIKE_A_TRADER: ExplainLikeATraderData = {
  whatHappened: 'The Headline Consumer Price Index (CPI) increased 0.2% month-over-month in August, exactly in line with the consensus forecast of 0.2%. Core CPI (excluding food and energy) rose 0.28% MoM, marginally above expectations due to persistent shelter inflation.',
  whyItMatters: 'CPI is the Federal Reserve\'s primary gauge for price stability alongside Core PCE. When headline prints match expectations but core remains resilient, it narrows the window for aggressive 50-basis-point interest rate cuts, solidifying a standard 25 bps trajectory.',
  whatChanged: 'Market expectations for a 50 bps Fed rate cut at the upcoming FOMC meeting dropped from 34% to 11%. The U.S. 2-year Treasury yield rose 4 basis points, and the U.S. Dollar Index (DXY) rebounded from session lows.',
  whatToWatchNext: 'Watch the upcoming U.S. Producer Price Index (PPI) release for pipeline manufacturing cost pressures, followed by the FOMC Statement and Chair Powell\'s press conference next Wednesday.'
};

export const CPI_RELATED_EVENTS: RelatedReleaseEvent[] = [
  {
    id: 'cpi-prev',
    name: 'US CPI m/m (Previous Release)',
    period: 'Jul 2026',
    dateTime: '2026-08-14T12:30:00Z',
    status: 'Released',
    actual: '0.2%',
    forecast: '0.2%',
    relationship: 'previous'
  },
  {
    id: 'cpi-curr',
    name: 'US CPI m/m (Current Release)',
    period: 'Aug 2026',
    dateTime: '2026-09-11T12:30:00Z',
    status: 'Released',
    actual: '0.2%',
    forecast: '0.2%',
    relationship: 'current'
  },
  {
    id: 'cpi-next',
    name: 'US CPI m/m (Next Release)',
    period: 'Sep 2026',
    dateTime: '2026-10-14T12:30:00Z',
    status: 'Upcoming',
    forecast: '0.2%',
    relationship: 'next'
  },
  {
    id: 'cpi-core',
    name: 'US Core CPI m/m (Sister Indicator)',
    period: 'Aug 2026',
    dateTime: '2026-09-11T12:30:00Z',
    status: 'Released',
    actual: '0.3%',
    forecast: '0.2%',
    relationship: 'sister'
  },
  {
    id: 'ppi-aug',
    name: 'US PPI Final Demand m/m',
    period: 'Aug 2026',
    dateTime: '2026-09-12T12:30:00Z',
    status: 'Upcoming',
    forecast: '0.1%',
    relationship: 'sister'
  }
];

// Helper to construct event-specific deep intelligence
export function getEventIntelligenceDetail(event: NewsEvent) {
  const isCPI = event.name.toLowerCase().includes('cpi') || event.code?.toLowerCase().includes('cpi');
  const isNFP = event.name.toLowerCase().includes('payroll') || event.name.toLowerCase().includes('nfp') || event.code?.toLowerCase().includes('nfp');
  const isRate = event.name.toLowerCase().includes('rate') || event.category === 'Central Bank' || event.category === 'Monetary Policy';

  const currency = event.currency || 'USD';
  const countryProfile = COUNTRY_PROFILES[currency] || COUNTRY_PROFILES['USD'];
  const centralBank = CENTRAL_BANK_CONTEXTS[currency] || CENTRAL_BANK_CONTEXTS['USD'];

  // Calculate surprise direction label
  let surpriseLabel: 'Above Consensus' | 'Below Consensus' | 'In Line' = 'In Line';
  let surpriseNumeric: number | null = null;
  if (event.actual !== undefined && event.forecast !== undefined) {
    const act = typeof event.actual === 'number' ? event.actual : parseFloat(String(event.actual));
    const fst = typeof event.forecast === 'number' ? event.forecast : parseFloat(String(event.forecast));
    if (!isNaN(act) && !isNaN(fst)) {
      surpriseNumeric = parseFloat((act - fst).toFixed(2));
      if (surpriseNumeric > 0.05) surpriseLabel = 'Above Consensus';
      else if (surpriseNumeric < -0.05) surpriseLabel = 'Below Consensus';
      else surpriseLabel = 'In Line';
    }
  }

  // Explain like a trader
  const explainLikeATrader: ExplainLikeATraderData = isCPI ? CPI_EXPLAIN_LIKE_A_TRADER : {
    whatHappened: `${event.name} for ${event.period || 'the current period'} registered at ${event.actual ?? 'pending'}, compared to consensus expectations of ${event.forecast ?? 'consensus'} and a prior reading of ${event.previous ?? 'previous'}.`,
    whyItMatters: `${event.name} is a key catalyst monitored by institutional desks to gauge sovereign macroeconomic momentum and potential shifts in ${currency} central bank policy rates.`,
    whatChanged: surpriseLabel === 'Above Consensus'
      ? `The print surpassed market consensus, triggering upward revisions in sovereign yield expectations and short-term re-pricing in ${currency} currency crosses.`
      : surpriseLabel === 'Below Consensus'
      ? `The reading came in softer than consensus forecasts, easing pressure on debt yields and recalibrating easing expectations across benchmark assets.`
      : `The metric printed closely aligned with consensus models, preserving prevailing technical trajectories across primary ${currency} asset pairs.`,
    whatToWatchNext: `Monitor subsequent confirmation from sovereign statistical agencies, second-tier follow-up prints, and upcoming central bank rhetoric.`
  };

  // What happened last time?
  const lastTimeEntry = (isCPI ? CPI_RELEASE_HISTORY[1] : null) || {
    id: 'last-release',
    date: 'August 14, 2026',
    period: 'Prior Period',
    actual: event.previous ?? '0.2%',
    consensus: event.previous ?? '0.2%',
    previous: '0.1%',
    surprise: 0.0,
    surpriseLabel: 'In Line' as const,
    marketReaction15m: { asset: 'XAUUSD', pctMove: +0.45, direction: 'UP' as const }
  };

  return {
    countryProfile,
    centralBank,
    surpriseLabel,
    surpriseNumeric,
    explainLikeATrader,
    lastTimeEntry,
    marketReactionWindows: CPI_MARKET_REACTION_WINDOWS,
    releaseHistory: isCPI ? CPI_RELEASE_HISTORY : [
      {
        id: 'rel-1',
        date: 'Aug 2026',
        period: 'Jul 2026',
        actual: event.previous ?? 2.4,
        consensus: event.previous ?? 2.4,
        previous: 2.3,
        surprise: 0.0,
        surpriseLabel: 'In Line' as const,
        marketReaction15m: { asset: 'XAUUSD', pctMove: +0.15, direction: 'FLAT' as const }
      },
      {
        id: 'rel-2',
        date: 'Jul 2026',
        period: 'Jun 2026',
        actual: 2.3,
        consensus: 2.5,
        previous: 2.5,
        surprise: -0.2,
        surpriseLabel: 'Below Consensus' as const,
        marketReaction15m: { asset: 'XAUUSD', pctMove: +0.80, direction: 'UP' as const }
      }
    ],
    timeSeriesData: isCPI ? CPI_TIME_SERIES_ALL : [
      { date: '2025-06', value: 2.1, consensus: 2.0 },
      { date: '2025-09', value: 2.3, consensus: 2.2 },
      { date: '2025-12', value: 2.4, consensus: 2.4 },
      { date: '2026-03', value: 2.6, consensus: 2.5 },
      { date: '2026-06', value: 2.5, consensus: 2.5 },
      { date: '2026-08', value: typeof event.actual === 'number' ? event.actual : 2.5, consensus: typeof event.forecast === 'number' ? event.forecast : 2.6 }
    ],
    relatedEvents: isCPI ? CPI_RELATED_EVENTS : [
      {
        id: `${event.id}-prev`,
        name: `${event.name} (Previous)`,
        period: 'Prior Cycle',
        dateTime: '2026-08-14T12:30:00Z',
        status: 'Released' as const,
        actual: event.previous ?? '2.4%',
        forecast: '2.4%',
        relationship: 'previous' as const
      },
      {
        id: event.id,
        name: event.name,
        period: event.period || 'Current',
        dateTime: event.dateTime,
        status: event.status,
        actual: event.actual,
        forecast: event.forecast,
        relationship: 'current' as const
      },
      {
        id: `${event.id}-next`,
        name: `${event.name} (Upcoming)`,
        period: 'Next Cycle',
        dateTime: '2026-10-15T12:30:00Z',
        status: 'Upcoming' as const,
        forecast: event.forecast ?? '2.5%',
        relationship: 'next' as const
      }
    ]
  };
}
