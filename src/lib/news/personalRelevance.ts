import { Trade } from '@/types';
import { NewsEvent } from '@/types/newsIntelligence';

export interface UserMarketProfile {
  topMarkets: { market: string; count: number; percentage: number }[];
  primaryCurrencies: string[];
  totalTrades: number;
  tradesWithNewsCatalysts: number;
}

/**
 * Derives top traded markets and active currencies from a user's trade history
 */
export function extractUserMarketProfile(trades: Trade[]): UserMarketProfile {
  if (!trades || trades.length === 0) {
    return {
      topMarkets: [],
      primaryCurrencies: ['USD', 'EUR'],
      totalTrades: 0,
      tradesWithNewsCatalysts: 0
    };
  }

  const marketCounts: Record<string, number> = {};
  let tradesWithNews = 0;

  for (const t of trades) {
    if (!t.market) continue;
    const m = t.market.toUpperCase().trim();
    marketCounts[m] = (marketCounts[m] || 0) + 1;

    if (t.newsEventId || t.newsEventName || (t.notes && /cpi|nfp|fomc|fed|inflation|rate/i.test(t.notes))) {
      tradesWithNews++;
    }
  }

  const total = trades.length;
  const sortedMarkets = Object.entries(marketCounts)
    .map(([market, count]) => ({
      market,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  // Extract currencies mentioned in markets (e.g. XAU/USD -> USD, EUR/USD -> EUR, USD)
  const currencySet = new Set<string>();
  for (const { market } of sortedMarkets) {
    const clean = market.replace('/', '').toUpperCase();
    if (clean.includes('USD')) currencySet.add('USD');
    if (clean.includes('EUR')) currencySet.add('EUR');
    if (clean.includes('GBP')) currencySet.add('GBP');
    if (clean.includes('JPY')) currencySet.add('JPY');
    if (clean.includes('AUD')) currencySet.add('AUD');
    if (clean.includes('CAD')) currencySet.add('CAD');
    if (clean.includes('CHF')) currencySet.add('CHF');
    if (clean.includes('NZD')) currencySet.add('NZD');
    if (clean.includes('XAU') || clean.includes('GOLD')) currencySet.add('USD');
    if (clean.includes('BTC') || clean.includes('ETH')) currencySet.add('USD');
  }

  // Ensure default USD
  if (currencySet.size === 0) currencySet.add('USD');

  return {
    topMarkets: sortedMarkets,
    primaryCurrencies: Array.from(currencySet),
    totalTrades: total,
    tradesWithNewsCatalysts: tradesWithNews
  };
}

export interface EventRelevanceMatch {
  isRelevant: boolean;
  score: number; // 0-100
  reason?: string;
  matchedMarket?: string;
  userTradesOnMarketCount?: number;
}

/**
 * Evaluates whether a calendar event is relevant to a user's specific trading history
 */
export function checkEventRelevance(
  event: NewsEvent,
  userProfile: UserMarketProfile
): EventRelevanceMatch {
  if (!userProfile || userProfile.topMarkets.length === 0) {
    // Default fallback: USD and EUR high impact events are broadly relevant
    if (event.currency === 'USD' && event.impact === 'HIGH') {
      return {
        isRelevant: true,
        score: 75,
        reason: 'Broad USD macro driver'
      };
    }
    return { isRelevant: false, score: 30 };
  }

  const evCurrency = event.currency?.toUpperCase();
  const evAffectedAssets = event.affectedMarkets?.map(m => m.asset.toUpperCase()) || [];
  const evName = event.name.toUpperCase();

  // Check top traded markets
  for (const item of userProfile.topMarkets) {
    const userMarket = item.market.toUpperCase();
    const cleanUserMarket = userMarket.replace('/', '');

    // 1. Direct match in affectedMarkets
    const directAssetMatch = evAffectedAssets.some(asset => {
      const cleanAsset = asset.replace('/', '').replace(/\s+/g, '');
      return cleanAsset.includes(cleanUserMarket) || cleanUserMarket.includes(cleanAsset);
    });

    if (directAssetMatch) {
      return {
        isRelevant: true,
        score: 95,
        matchedMarket: item.market,
        userTradesOnMarketCount: item.count,
        reason: `Direct catalyst for your top traded asset ${item.market} (${item.percentage}% of your trades)`
      };
    }

    // 2. Currency match (e.g. USD event affecting XAU/USD or EUR/USD)
    if (userMarket.includes(evCurrency) || (evCurrency === 'USD' && (userMarket.includes('XAU') || userMarket.includes('BTC')))) {
      return {
        isRelevant: true,
        score: event.impact === 'HIGH' ? 88 : event.impact === 'MEDIUM' ? 70 : 50,
        matchedMarket: item.market,
        userTradesOnMarketCount: item.count,
        reason: `${evCurrency} event directly impacts ${item.market} (${item.percentage}% of your trades)`
      };
    }
  }

  // 3. Fallback currency match from primary currencies
  if (userProfile.primaryCurrencies.includes(evCurrency)) {
    return {
      isRelevant: true,
      score: 60,
      reason: `Matches your active currency exposure (${evCurrency})`
    };
  }

  return { isRelevant: false, score: 20 };
}
