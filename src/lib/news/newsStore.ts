import { 
  NewsEvent, 
  NewsAcademyArticle, 
  NewsUserSettings, 
  NewsImpact, 
  NewsCategory, 
  ExplanationMode 
} from '@/types/newsIntelligence';
import { NEWS_EVENTS, DEFAULT_NEWS_SETTINGS, NEWS_KNOWLEDGE_NODES } from '@/data/newsIntelligenceData';
import { NEWS_ACADEMY_ARTICLES } from '@/data/newsAcademyData';
import { Trade } from '@/types';

const STORAGE_KEY = 'tradevault_news_settings_v1';

export function getStoredNewsSettings(): NewsUserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NEWS_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_NEWS_SETTINGS,
      ...parsed,
      userNotes: { ...DEFAULT_NEWS_SETTINGS.userNotes, ...(parsed.userNotes || {}) }
    };
  } catch (err) {
    console.error('Failed to parse stored news settings:', err);
    return DEFAULT_NEWS_SETTINGS;
  }
}

export function saveStoredNewsSettings(settings: NewsUserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save news settings:', err);
  }
}

export function formatEventDateTime(isoString: string, timezone: string): { dateStr: string; timeStr: string; relativeStr: string } {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) {
      return { dateStr: 'Invalid date', timeStr: '--:--', relativeStr: '' };
    }

    let tzOption: string | undefined = undefined;
    if (timezone === 'UTC') tzOption = 'UTC';
    else if (timezone === 'America/New_York' || timezone === 'EST') tzOption = 'America/New_York';
    else if (timezone === 'Europe/London' || timezone === 'GMT') tzOption = 'Europe/London';
    else if (timezone === 'Europe/Berlin' || timezone === 'CET') tzOption = 'Europe/Berlin';
    else if (timezone === 'Asia/Kolkata' || timezone === 'IST') tzOption = 'Asia/Kolkata';
    else if (timezone === 'Asia/Tokyo' || timezone === 'JST') tzOption = 'Asia/Tokyo';
    else if (timezone === 'Australia/Sydney' || timezone === 'AEST') tzOption = 'Australia/Sydney';

    const dateOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: tzOption
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: tzOption
    };

    const dateStr = d.toLocaleDateString('en-US', dateOptions);
    const timeStr = d.toLocaleTimeString('en-US', timeOptions);

    // Relative string
    const diffMs = d.getTime() - Date.now();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    let relativeStr = '';
    if (Math.abs(diffHours) < 1) {
      const diffMins = Math.round(diffMs / (1000 * 60));
      relativeStr = diffMins > 0 ? `In ${diffMins} mins` : `${Math.abs(diffMins)} mins ago`;
    } else if (Math.abs(diffHours) < 24) {
      relativeStr = diffHours > 0 ? `In ${diffHours} hrs` : `${Math.abs(diffHours)} hrs ago`;
    } else {
      relativeStr = diffDays > 0 ? `In ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
    }

    return { dateStr, timeStr, relativeStr };
  } catch (err) {
    return { dateStr: isoString.split('T')[0] || isoString, timeStr: '--:--', relativeStr: '' };
  }
}

export interface SurpriseResult {
  hasSurprise: boolean;
  diff: number;
  diffFormatted: string;
  direction: 'Above consensus' | 'Below consensus' | 'In line' | 'Unknown';
  badgeColor: string;
  isPositive: boolean;
  isNegative: boolean;
  isInLine: boolean;
}

export function calculateSurprise(
  actual?: number | string,
  forecast?: number | string
): SurpriseResult {
  if (actual === undefined || forecast === undefined || actual === null || forecast === null || actual === '' || forecast === '') {
    return {
      hasSurprise: false,
      diff: 0,
      diffFormatted: 'N/A',
      direction: 'Unknown',
      badgeColor: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800',
      isPositive: false,
      isNegative: false,
      isInLine: false
    };
  }

  const actNum = typeof actual === 'number' ? actual : parseFloat(String(actual).replace(/[^0-9.-]/g, ''));
  const fctNum = typeof forecast === 'number' ? forecast : parseFloat(String(forecast).replace(/[^0-9.-]/g, ''));

  if (isNaN(actNum) || isNaN(fctNum)) {
    return {
      hasSurprise: false,
      diff: 0,
      diffFormatted: 'N/A',
      direction: 'Unknown',
      badgeColor: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800',
      isPositive: false,
      isNegative: false,
      isInLine: false
    };
  }

  const rawDiff = actNum - fctNum;
  const roundedDiff = Math.round(rawDiff * 100) / 100;
  const tolerance = 0.001;

  if (Math.abs(roundedDiff) <= tolerance) {
    return {
      hasSurprise: true,
      diff: 0,
      diffFormatted: '0.00',
      direction: 'In line',
      badgeColor: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800',
      isPositive: false,
      isNegative: false,
      isInLine: true
    };
  }

  if (roundedDiff > 0) {
    return {
      hasSurprise: true,
      diff: roundedDiff,
      diffFormatted: `+${roundedDiff > 100 ? roundedDiff.toLocaleString() : roundedDiff}`,
      direction: 'Above consensus',
      badgeColor: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800',
      isPositive: true,
      isNegative: false,
      isInLine: false
    };
  } else {
    return {
      hasSurprise: true,
      diff: roundedDiff,
      diffFormatted: `${roundedDiff < -100 ? roundedDiff.toLocaleString() : roundedDiff}`,
      direction: 'Below consensus',
      badgeColor: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800',
      isPositive: false,
      isNegative: true,
      isInLine: false
    };
  }
}

export function calculatePersonalRelevance(
  markets: string[] = [],
  headline: string = '',
  summary: string = '',
  userTradedMarkets: string[] = []
): { isRelevant: boolean; matchedMarket: string } {
  if (!userTradedMarkets || userTradedMarkets.length === 0) {
    return { isRelevant: false, matchedMarket: '' };
  }

  const combinedText = `${markets.join(' ')} ${headline} ${summary}`.toUpperCase();

  for (const userMarket of userTradedMarkets) {
    const clean = userMarket.toUpperCase().replace('/', '');
    const withSlash = userMarket.toUpperCase();

    // Check specific popular pairings and keywords
    if (clean === 'XAUUSD' || clean === 'GOLD') {
      if (combinedText.includes('XAU') || combinedText.includes('GOLD') || combinedText.includes('BULLION')) {
        return { isRelevant: true, matchedMarket: 'XAU/USD' };
      }
    } else if (clean === 'BTCUSD' || clean === 'BITCOIN') {
      if (combinedText.includes('BTC') || combinedText.includes('BITCOIN') || combinedText.includes('CRYPTO')) {
        return { isRelevant: true, matchedMarket: 'BTC/USD' };
      }
    } else if (clean === 'EURUSD') {
      if (combinedText.includes('EUR') || combinedText.includes('EURO') || combinedText.includes('ECB')) {
        return { isRelevant: true, matchedMarket: 'EUR/USD' };
      }
    } else if (clean === 'GBPUSD') {
      if (combinedText.includes('GBP') || combinedText.includes('POUND') || combinedText.includes('STERLING') || combinedText.includes('BOE')) {
        return { isRelevant: true, matchedMarket: 'GBP/USD' };
      }
    } else if (clean === 'USDJPY') {
      if (combinedText.includes('JPY') || combinedText.includes('YEN') || combinedText.includes('BOJ')) {
        return { isRelevant: true, matchedMarket: 'USD/JPY' };
      }
    } else if (combinedText.includes(clean) || combinedText.includes(withSlash)) {
      return { isRelevant: true, matchedMarket: userMarket };
    }
  }

  return { isRelevant: false, matchedMarket: '' };
}

export function computeArticlePrioritizationScore(
  article: {
    impact: string;
    publishedAt: string;
    source: string;
    isDevelopingStory?: boolean;
    markets?: string[];
    headline?: string;
    summary?: string;
  },
  userTradedMarkets: string[] = []
): number {
  let score = 50;

  // 1. Personal Relevance
  const relevance = calculatePersonalRelevance(
    article.markets || [],
    article.headline || '',
    article.summary || '',
    userTradedMarkets
  );
  if (relevance.isRelevant) score += 35;

  // 2. Economic Importance
  if (article.impact === 'HIGH') score += 25;
  else if (article.impact === 'MEDIUM') score += 12;
  else score += 4;

  // 3. Developing Story
  if (article.isDevelopingStory) score += 15;

  // 4. Recency
  const ageHours = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
  if (ageHours <= 3) score += 25;
  else if (ageHours <= 12) score += 18;
  else if (ageHours <= 24) score += 10;
  else if (ageHours <= 72) score += 4;

  // 5. Source Quality
  const tier1 = ['bloomberg', 'reuters', 'financial times', 'wsj', 'wall street journal'];
  if (tier1.some(s => (article.source || '').toLowerCase().includes(s))) {
    score += 10;
  }

  return score;
}

export interface UniversalSearchResultItem {
  id: string;
  type: 'Event' | 'Academy' | 'Authority' | 'Concept' | 'Asset' | 'Note';
  title: string;
  subtitle: string;
  badge: string;
  linkUrl?: string;
  targetTab?: string;
  targetId?: string;
  details?: string;
}

export function searchUniversalIntelligence(query: string, settings: NewsUserSettings): UniversalSearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: UniversalSearchResultItem[] = [];

  // 1. Search Events
  for (const event of NEWS_EVENTS) {
    const match = 
      event.name.toLowerCase().includes(q) ||
      event.code.toLowerCase().includes(q) ||
      event.currency.toLowerCase().includes(q) ||
      event.country.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q) ||
      event.source.toLowerCase().includes(q) ||
      event.simpleExplanation.toLowerCase().includes(q);

    if (match) {
      results.push({
        id: `event-${event.id}`,
        type: 'Event',
        title: `${event.name} (${event.code})`,
        subtitle: `${event.currency} • ${event.category} • Source: ${event.source}`,
        badge: `${event.impact} IMPACT`,
        targetTab: 'calendar',
        targetId: event.id,
        details: event.simpleExplanation
      });
    }
  }

  // 2. Search Academy Articles
  for (const article of NEWS_ACADEMY_ARTICLES) {
    const match = 
      article.title.toLowerCase().includes(q) ||
      article.code.toLowerCase().includes(q) ||
      article.category.toLowerCase().includes(q) ||
      article.simpleDefinition.toLowerCase().includes(q) ||
      article.beginnerContent.toLowerCase().includes(q);

    if (match) {
      results.push({
        id: `academy-${article.id}`,
        type: 'Academy',
        title: article.title,
        subtitle: `${article.category} • ${article.difficulty} • ${article.estimatedReadTime}`,
        badge: 'ACADEMY LESSON',
        targetTab: 'academy',
        targetId: article.id,
        details: article.simpleDefinition
      });
    }
  }

  // 3. Search Knowledge Nodes / Concepts
  for (const node of NEWS_KNOWLEDGE_NODES) {
    if (node.name.toLowerCase().includes(q) || node.description.toLowerCase().includes(q)) {
      results.push({
        id: `node-${node.id}`,
        type: 'Concept',
        title: node.name,
        subtitle: `Macro Factor • Category: ${node.category}`,
        badge: 'KNOWLEDGE MAP',
        targetTab: 'knowledge-map',
        targetId: node.id,
        details: node.description
      });
    }
  }

  // 4. Search Notes
  for (const [key, noteText] of Object.entries(settings.userNotes)) {
    if (noteText.toLowerCase().includes(q)) {
      const ev = NEWS_EVENTS.find(e => e.id === key);
      const title = ev ? `Note on ${ev.name}` : `Personal Note (${key})`;
      results.push({
        id: `note-${key}`,
        type: 'Note',
        title,
        subtitle: noteText.slice(0, 80) + (noteText.length > 80 ? '...' : ''),
        badge: 'MY NOTE',
        targetTab: 'calendar',
        targetId: key,
        details: noteText
      });
    }
  }

  return results.slice(0, 15);
}

export interface NewsTradePerformanceMetrics {
  totalTrades: number;
  newsTradesCount: number;
  nonNewsTradesCount: number;
  newsWinRate: number;
  nonNewsWinRate: number;
  newsNetPnl: number;
  nonNewsNetPnl: number;
  avgRiskPercentNews: number;
  newsEmotionsFrequency: Record<string, number>;
  recommendations: string[];
}

export function computeNewsTradePerformance(trades: Trade[]): NewsTradePerformanceMetrics {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  const newsTrades: Trade[] = [];
  const nonNewsTrades: Trade[] = [];

  for (const t of completed) {
    const isExplicitNews = Boolean(t.newsEventId || t.newsEventName);
    const mentionsNewsInNotes = 
      (t.notes && /nfp|cpi|fomc|fed|powell|rates|inflation|ecb|boj|pmi|news|gdp/i.test(t.notes)) ||
      (t.entryReason && /nfp|cpi|fomc|fed|powell|rates|inflation|ecb|boj|pmi|news|gdp/i.test(t.entryReason));

    if (isExplicitNews || mentionsNewsInNotes) {
      newsTrades.push(t);
    } else {
      nonNewsTrades.push(t);
    }
  }

  const newsWins = newsTrades.filter(t => t.result === 'WIN').length;
  const nonNewsWins = nonNewsTrades.filter(t => t.result === 'WIN').length;

  const newsWinRate = newsTrades.length > 0 ? Math.round((newsWins / newsTrades.length) * 100) : 0;
  const nonNewsWinRate = nonNewsTrades.length > 0 ? Math.round((nonNewsWins / nonNewsTrades.length) * 100) : 0;

  const newsNetPnl = newsTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const nonNewsNetPnl = nonNewsTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);

  const totalNewsRisk = newsTrades.reduce((acc, t) => acc + (parseFloat(String(t.riskPercent || '1')) || 1), 0);
  const avgRiskPercentNews = newsTrades.length > 0 ? parseFloat((totalNewsRisk / newsTrades.length).toFixed(2)) : 0;

  const newsEmotionsFrequency: Record<string, number> = {};
  for (const t of newsTrades) {
    if (t.emotions && Array.isArray(t.emotions)) {
      for (const em of t.emotions) {
        newsEmotionsFrequency[em] = (newsEmotionsFrequency[em] || 0) + 1;
      }
    }
  }

  const recommendations: string[] = [];
  if (newsTrades.length > 0) {
    if (newsWinRate < nonNewsWinRate) {
      recommendations.push(`Your win rate on news-linked trades (${newsWinRate}%) is lower than standard trades (${nonNewsWinRate}%). Consider waiting for post-release volatility contraction rather than trading the immediate 5-minute candle.`);
    }
    if (avgRiskPercentNews > 1.5) {
      recommendations.push(`Your average risk during news releases is ${avgRiskPercentNews}%. Institutional risk models recommend sizing down by 50% during high-impact releases to account for spread expansion and slippage.`);
    }
    if (newsEmotionsFrequency['FOMO'] || newsEmotionsFrequency['Impatient']) {
      recommendations.push(`FOMO and Impatience appear frequently in news trades. Implement a mandatory 15-minute wait rule post-release before entering positions.`);
    }
  } else {
    recommendations.push('Link your trades to economic catalysts in the "Add Trade" form to unlock personalized behavioral diagnostics and news edge analysis.');
  }

  return {
    totalTrades: completed.length,
    newsTradesCount: newsTrades.length,
    nonNewsTradesCount: nonNewsTrades.length,
    newsWinRate,
    nonNewsWinRate,
    newsNetPnl,
    nonNewsNetPnl,
    avgRiskPercentNews,
    newsEmotionsFrequency,
    recommendations
  };
}
