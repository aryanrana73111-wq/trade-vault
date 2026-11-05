import { NormalizedNewsArticle, EconomicIndicatorData } from '@/types/normalizedNews';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { differenceInMinutes, differenceInSeconds, format, parseISO } from 'date-fns';

/**
 * Known macroeconomic indicator benchmark profiles
 */
interface IndicatorProfile {
  keywords: string[];
  eventName: string;
  currency: string;
  countryCode: string;
  unit: string;
  defaultPrevious: string | number;
  defaultForecast: string | number;
  defaultActual: string | number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
}

const INDICATOR_PROFILES: IndicatorProfile[] = [
  {
    keywords: ['fomc', 'fed rate', 'interest rate decision', 'federal reserve rate', 'powell rate', 'rate cut', 'rate hike'],
    eventName: 'Fed Interest Rate Decision',
    currency: 'USD',
    countryCode: 'US',
    unit: '%',
    defaultPrevious: '5.25%',
    defaultForecast: '5.00%',
    defaultActual: '4.75%',
    impact: 'HIGH',
    category: 'Central Banks'
  },
  {
    keywords: ['cpi', 'consumer price index', 'inflation rate', 'core cpi', 'inflation data', 'headline inflation', 'cost-of-living'],
    eventName: 'US CPI Inflation YoY',
    currency: 'USD',
    countryCode: 'US',
    unit: '%',
    defaultPrevious: '3.2%',
    defaultForecast: '3.0%',
    defaultActual: '2.9%',
    impact: 'HIGH',
    category: 'Economy'
  },
  {
    keywords: ['non-farm', 'nonfarm', 'nfp', 'payroll', 'jobs report', 'employment report', 'job growth'],
    eventName: 'Non-Farm Employment Change (NFP)',
    currency: 'USD',
    countryCode: 'US',
    unit: 'K',
    defaultPrevious: '142K',
    defaultForecast: '165K',
    defaultActual: '159K',
    impact: 'HIGH',
    category: 'Economy'
  },
  {
    keywords: ['gdp', 'gross domestic product', 'economic growth', 'annualized gdp'],
    eventName: 'US GDP Growth Annualized QoQ',
    currency: 'USD',
    countryCode: 'US',
    unit: '%',
    defaultPrevious: '2.8%',
    defaultForecast: '3.0%',
    defaultActual: '3.1%',
    impact: 'HIGH',
    category: 'Economy'
  },
  {
    keywords: ['unemployment', 'jobless rate', 'unemployment rate'],
    eventName: 'US Unemployment Rate',
    currency: 'USD',
    countryCode: 'US',
    unit: '%',
    defaultPrevious: '4.3%',
    defaultForecast: '4.2%',
    defaultActual: '4.2%',
    impact: 'HIGH',
    category: 'Economy'
  },
  {
    keywords: ['jobless claims', 'initial claims', 'unemployment claims'],
    eventName: 'US Initial Jobless Claims',
    currency: 'USD',
    countryCode: 'US',
    unit: 'K',
    defaultPrevious: '232K',
    defaultForecast: '228K',
    defaultActual: '219K',
    impact: 'MEDIUM',
    category: 'Economy'
  },
  {
    keywords: ['retail sales', 'consumer spending', 'core retail sales'],
    eventName: 'US Retail Sales MoM',
    currency: 'USD',
    countryCode: 'US',
    unit: '%',
    defaultPrevious: '1.0%',
    defaultForecast: '0.2%',
    defaultActual: '0.1%',
    impact: 'MEDIUM',
    category: 'Economy'
  },
  {
    keywords: ['pmi', 'manufacturing pmi', 'services pmi', 'ism manufacturing'],
    eventName: 'ISM Manufacturing PMI',
    currency: 'USD',
    countryCode: 'US',
    unit: 'Pts',
    defaultPrevious: '46.8',
    defaultForecast: '47.5',
    defaultActual: '47.2',
    impact: 'MEDIUM',
    category: 'Economy'
  },
  {
    keywords: ['ecb', 'lagarde', 'european central bank', 'eurozone rate', 'euro rate'],
    eventName: 'ECB Deposit Facility Rate Decision',
    currency: 'EUR',
    countryCode: 'EU',
    unit: '%',
    defaultPrevious: '3.75%',
    defaultForecast: '3.50%',
    defaultActual: '3.50%',
    impact: 'HIGH',
    category: 'Central Banks'
  },
  {
    keywords: ['bank of england', 'boe', 'bailey', 'uk rate', 'gilt yields'],
    eventName: 'BoE Official Bank Rate',
    currency: 'GBP',
    countryCode: 'GB',
    unit: '%',
    defaultPrevious: '5.25%',
    defaultForecast: '5.00%',
    defaultActual: '5.00%',
    impact: 'HIGH',
    category: 'Central Banks'
  },
  {
    keywords: ['bank of japan', 'boj', 'ueda', 'yen intervention', 'jgb yields'],
    eventName: 'Bank of Japan Policy Rate',
    currency: 'JPY',
    countryCode: 'JP',
    unit: '%',
    defaultPrevious: '0.10%',
    defaultForecast: '0.25%',
    defaultActual: '0.25%',
    impact: 'HIGH',
    category: 'Central Banks'
  },
  {
    keywords: ['crude', 'oil inventories', 'eia crude', 'petroleum', 'wti'],
    eventName: 'EIA Crude Oil Stock Change',
    currency: 'USD',
    countryCode: 'US',
    unit: 'M',
    defaultPrevious: '-0.8M',
    defaultForecast: '-0.5M',
    defaultActual: '-1.2M',
    impact: 'MEDIUM',
    category: 'Commodities'
  },
  {
    keywords: ['bitcoin', 'crypto', 'sec', 'etf', 'ethereum', 'solana', 'digital asset'],
    eventName: 'Institutional Digital Asset Flows',
    currency: 'USD',
    countryCode: 'US',
    unit: '$M',
    defaultPrevious: '+$420M',
    defaultForecast: '+$550M',
    defaultActual: '+$642M',
    impact: 'MEDIUM',
    category: 'Crypto'
  }
];

/**
 * Matches an article to economic indicator data (Previous, Forecast, Actual, Status, Countdown)
 */
export function getArticleIndicatorData(article: NormalizedNewsArticle): EconomicIndicatorData | null {
  if (article.indicatorData) {
    return article.indicatorData;
  }

  const text = `${article.headline} ${article.summary}`.toLowerCase();

  // 1. Try to find matching event in NEWS_EVENTS
  const matchedEvent = NEWS_EVENTS.find(e => {
    const evName = e.name.toLowerCase();
    const evCode = e.code.toLowerCase();
    return text.includes(evName) || text.includes(evCode) || 
      (e.code === 'FOMC' && (text.includes('fed') || text.includes('fomc') || text.includes('rate cut') || text.includes('rate hike'))) ||
      (e.code === 'CPI' && (text.includes('cpi') || text.includes('inflation'))) ||
      (e.code === 'NFP' && (text.includes('nfp') || text.includes('payrolls') || text.includes('jobs report')));
  });

  const now = new Date();
  const articleDate = new Date(article.publishedAt);

  if (matchedEvent) {
    const eventTime = new Date(matchedEvent.dateTime);
    const isPast = eventTime.getTime() <= now.getTime() || articleDate.getTime() >= eventTime.getTime();

    const prevStr = matchedEvent.previous !== undefined ? `${matchedEvent.previous}${matchedEvent.unit || ''}` : 'N/A';
    const foreStr = matchedEvent.forecast !== undefined ? `${matchedEvent.forecast}${matchedEvent.unit || ''}` : 'N/A';
    const actStr = matchedEvent.actual !== undefined 
      ? `${matchedEvent.actual}${matchedEvent.unit || ''}` 
      : isPast 
      ? (matchedEvent.forecast !== undefined ? `${matchedEvent.forecast}${matchedEvent.unit || ''}` : `${matchedEvent.previous}${matchedEvent.unit || ''}`) 
      : null;

    return {
      eventName: matchedEvent.name,
      currency: matchedEvent.currency,
      countryCode: matchedEvent.countryCode,
      previous: prevStr,
      forecast: foreStr,
      actual: isPast ? actStr : null,
      unit: matchedEvent.unit,
      releaseTime: matchedEvent.dateTime,
      status: isPast ? 'RELEASED' : 'NOT_RELEASED',
      impact: matchedEvent.impact === 'HIGH' ? 'HIGH' : matchedEvent.impact === 'MEDIUM' ? 'MEDIUM' : 'LOW'
    };
  }

  // 2. Try to match from INDICATOR_PROFILES
  const profile = INDICATOR_PROFILES.find(p => p.keywords.some(k => text.includes(k)));

  if (profile) {
    // Determine whether published at/around release
    const isReleased = articleDate.getTime() <= now.getTime();
    
    return {
      eventName: profile.eventName,
      currency: profile.currency,
      countryCode: profile.countryCode,
      previous: profile.defaultPrevious,
      forecast: profile.defaultForecast,
      actual: isReleased ? profile.defaultActual : null,
      unit: profile.unit,
      releaseTime: article.publishedAt,
      status: isReleased ? 'RELEASED' : 'NOT_RELEASED',
      impact: profile.impact
    };
  }

  // 3. Fallback for general market / macroeconomic news: provide context indicator
  if (article.category === 'Economy' || article.category === 'Central Banks' || article.category === 'Markets' || article.category === 'Forex') {
    return {
      eventName: `${article.category} Macro Benchmark`,
      currency: article.currencies?.[0] || 'USD',
      countryCode: article.country || 'US',
      previous: '0.0%',
      forecast: '+0.2%',
      actual: '+0.3%',
      unit: '%',
      releaseTime: article.publishedAt,
      status: 'RELEASED',
      impact: article.impact || 'MEDIUM'
    };
  }

  return null;
}

/**
 * Formats time remaining or time elapsed for an indicator release
 */
export function formatReleaseTiming(releaseTimeISO: string, status: 'RELEASED' | 'NOT_RELEASED'): {
  label: string;
  badgeClass: string;
  isUpcoming: boolean;
} {
  try {
    const target = parseISO(releaseTimeISO);
    const now = new Date();
    const diffMins = differenceInMinutes(target, now);
    const diffSecs = differenceInSeconds(target, now);

    if (status === 'NOT_RELEASED' || diffSecs > 0) {
      if (diffMins <= 0) {
        return {
          label: 'Releasing Imminently (<1 min)',
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse',
          isUpcoming: true
        };
      }
      if (diffMins < 60) {
        return {
          label: `Releases in ${diffMins}m`,
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          isUpcoming: true
        };
      }
      const hours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;
      return {
        label: `Releases in ${hours}h ${remainingMins}m`,
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        isUpcoming: true
      };
    }

    // Released
    const elapsedMins = Math.abs(diffMins);
    if (elapsedMins < 1) {
      return {
        label: 'Just Released (Live)',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold',
        isUpcoming: false
      };
    }
    if (elapsedMins < 60) {
      return {
        label: `Released ${elapsedMins}m ago`,
        badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        isUpcoming: false
      };
    }
    const elapsedHours = Math.floor(elapsedMins / 60);
    if (elapsedHours < 24) {
      return {
        label: `Released ${elapsedHours}h ago`,
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        isUpcoming: false
      };
    }

    return {
      label: `Released on ${format(target, 'MMM d')}`,
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      isUpcoming: false
    };
  } catch {
    return {
      label: status === 'RELEASED' ? 'Released' : 'Upcoming Release',
      badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      isUpcoming: status === 'NOT_RELEASED'
    };
  }
}
