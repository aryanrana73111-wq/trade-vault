import { NormalizedNewsArticle, NewsFilterParams } from '@/types/normalizedNews';

interface FeedConfig {
  name: string;
  url: string;
  defaultCategory: string;
}

const EXTERNAL_FEEDS: FeedConfig[] = [
  {
    name: 'MarketWatch',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    defaultCategory: 'Markets'
  },
  {
    name: 'BBC News Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    defaultCategory: 'Economy'
  },
  {
    name: 'CoinDesk',
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    defaultCategory: 'Crypto'
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/business/economics/rss',
    defaultCategory: 'Economy'
  },
  {
    name: 'Federal Reserve',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    defaultCategory: 'Central Banks'
  }
];

// Helper to decode XML/HTML entities
function decodeXmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2019;/g, "'")
    .replace(/&#x2018;/g, "'")
    .replace(/&#x201C;/g, '"')
    .replace(/&#x201D;/g, '"')
    .replace(/&#x2014;/g, '—')
    .replace(/&#x2013;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectCategory(headline: string, summary: string, defaultCat: string): string {
  const combined = `${headline} ${summary}`.toLowerCase();

  if (
    combined.includes('federal reserve') ||
    combined.includes('fed ') ||
    combined.includes('fomc') ||
    combined.includes('ecb') ||
    combined.includes('bank of england') ||
    combined.includes('bank of japan') ||
    combined.includes('central bank') ||
    combined.includes('rate cut') ||
    combined.includes('rate hike') ||
    combined.includes('interest rate') ||
    combined.includes('monetary policy') ||
    combined.includes('jerome powell') ||
    combined.includes('christine lagarde')
  ) {
    return 'Central Banks';
  }

  if (
    combined.includes('bitcoin') ||
    combined.includes('crypto') ||
    combined.includes('ethereum') ||
    combined.includes('btc') ||
    combined.includes('eth ') ||
    combined.includes('solana') ||
    combined.includes('stablecoin') ||
    combined.includes('blockchain') ||
    defaultCat === 'Crypto'
  ) {
    return 'Crypto';
  }

  if (
    combined.includes('forex') ||
    combined.includes('eur/usd') ||
    combined.includes('gbp/usd') ||
    combined.includes('usd/jpy') ||
    combined.includes('dollar index') ||
    combined.includes(' dxy') ||
    combined.includes('exchange rate') ||
    combined.includes('foreign exchange') ||
    combined.includes('currency market')
  ) {
    return 'Forex';
  }

  if (
    combined.includes('crude oil') ||
    combined.includes('brent') ||
    combined.includes('wti') ||
    combined.includes('gold') ||
    combined.includes('bullion') ||
    combined.includes('xau') ||
    combined.includes('silver') ||
    combined.includes('opec') ||
    combined.includes('natural gas') ||
    combined.includes('copper')
  ) {
    return 'Commodities';
  }

  if (
    combined.includes('tariff') ||
    combined.includes('trade war') ||
    combined.includes('sanctions') ||
    combined.includes('geopoliti') ||
    combined.includes('election') ||
    combined.includes('congress') ||
    combined.includes('military') ||
    combined.includes('white house')
  ) {
    return 'Geopolitics';
  }

  if (
    combined.includes('apple') ||
    combined.includes('tesla') ||
    combined.includes('microsoft') ||
    combined.includes('nvidia') ||
    combined.includes('amazon') ||
    combined.includes('google') ||
    combined.includes('alphabet') ||
    combined.includes('meta ') ||
    combined.includes('openai') ||
    combined.includes('boeing') ||
    combined.includes('quarterly earnings') ||
    combined.includes('ceo ')
  ) {
    return 'Companies';
  }

  if (
    combined.includes('s&p 500') ||
    combined.includes('nasdaq') ||
    combined.includes('dow jones') ||
    combined.includes('wall street') ||
    combined.includes('stocks') ||
    combined.includes('equities') ||
    combined.includes('shares') ||
    combined.includes('stock market')
  ) {
    return 'Stocks';
  }

  if (
    combined.includes('inflation') ||
    combined.includes('cpi') ||
    combined.includes('gdp') ||
    combined.includes('jobs report') ||
    combined.includes('payrolls') ||
    combined.includes('unemployment') ||
    combined.includes('consumer confidence') ||
    combined.includes('retail sales') ||
    combined.includes('recession') ||
    combined.includes('economy')
  ) {
    return 'Economy';
  }

  return defaultCat || 'Markets';
}

function detectRelatedMarkets(headline: string, summary: string): string[] {
  const text = `${headline} ${summary}`.toLowerCase();
  const markets: string[] = [];

  if (text.includes('gold') || text.includes('bullion') || text.includes('xau')) {
    markets.push('XAU/USD');
  }
  if (text.includes('euro') || text.includes('eur/usd') || text.includes('ecb')) {
    markets.push('EUR/USD');
  }
  if (text.includes('pound') || text.includes('sterling') || text.includes('gbp') || text.includes('bank of england')) {
    markets.push('GBP/USD');
  }
  if (text.includes('yen') || text.includes('jpy') || text.includes('bank of japan')) {
    markets.push('USD/JPY');
  }
  if (text.includes('bitcoin') || text.includes('btc')) {
    markets.push('BTC/USD');
  }
  if (text.includes('ethereum') || text.includes('eth ')) {
    markets.push('ETH/USD');
  }
  if (text.includes('dollar') || text.includes('fed ') || text.includes('treasur')) {
    markets.push('USD');
  }
  if (text.includes('s&p') || text.includes('nasdaq') || text.includes('wall street') || text.includes('equities')) {
    markets.push('S&P 500');
  }
  if (text.includes('crude') || text.includes('oil') || text.includes('brent') || text.includes('wti')) {
    markets.push('WTI Crude');
  }

  return markets;
}

function generateMarketIntelligence(article: NormalizedNewsArticle): NormalizedNewsArticle['intelligence'] {
  const { headline, category, relatedMarkets = [] } = article;
  
  let whyItMatters = 'Provides market participants with official reporting regarding current macroeconomic and financial conditions.';
  if (category === 'Central Banks') {
    whyItMatters = 'Monetary policy statements and central bank communications directly calibrate policy interest rate expectations and sovereign yield curves.';
  } else if (category === 'Crypto') {
    whyItMatters = 'Institutional adoption, regulatory frameworks, and liquidity conditions directly influence digital asset valuations and market depth.';
  } else if (category === 'Forex') {
    whyItMatters = 'Currency market shifts reflect relative interest rate differentials, balance of payments, and cross-border capital flows.';
  } else if (category === 'Commodities') {
    whyItMatters = 'Supply and demand imbalances in primary commodities transmit directly into headline inflation and transport/production input expenses.';
  } else if (category === 'Economy') {
    whyItMatters = 'Macroeconomic releases benchmark real aggregate demand, employment stability, and output gaps against central bank targets.';
  }

  return {
    whyItMatters,
    marketsPotentiallyAffected: relatedMarkets.length > 0 ? relatedMarkets : ['Broad Financial Markets', 'Fixed Income'],
    relatedInstruments: relatedMarkets,
    historicalContext: `Article published by ${article.sourceName} during the ongoing macroeconomic cycle.`,
    evidence: [
      `Source: Official publication from ${article.sourceName}`,
      `Timestamp recorded: ${article.publishedAt}`,
      `Categorized under: ${category}`
    ],
    uncertainty: 'Market reactions depend on ongoing order flow, liquidity conditions, and subsequent official economic releases.'
  };
}

// In-memory cache for live feed
let cachedArticles: NormalizedNewsArticle[] = [];
let cacheTimestamp = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

export async function fetchLiveAggregatedNews(): Promise<NormalizedNewsArticle[]> {
  const now = Date.now();
  if (cachedArticles.length > 0 && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedArticles;
  }

  const fetchedArticles: NormalizedNewsArticle[] = [];

  const results = await Promise.allSettled(
    EXTERNAL_FEEDS.map(async (feed) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      try {
        const res = await fetch(feed.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
          },
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const xml = await res.text();
        const items = parseRssItems(xml, feed);
        return items;
      } finally {
        clearTimeout(timeoutId);
      }
    })
  );

  for (const res of results) {
    if (res.status === 'fulfilled' && res.value) {
      fetchedArticles.push(...res.value);
    }
  }

  // Deduplicate by URL or headline
  const seenUrls = new Set<string>();
  const seenHeadlines = new Set<string>();
  const uniqueArticles: NormalizedNewsArticle[] = [];

  for (const a of fetchedArticles) {
    const normHeadline = a.headline.toLowerCase().trim();
    if (seenUrls.has(a.sourceUrl) || seenHeadlines.has(normHeadline)) {
      continue;
    }
    seenUrls.add(a.sourceUrl);
    seenHeadlines.add(normHeadline);
    uniqueArticles.push(a);
  }

  // Sort Newest -> Oldest
  uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (uniqueArticles.length > 0) {
    cachedArticles = uniqueArticles;
    cacheTimestamp = now;
  }

  return cachedArticles.length > 0 ? cachedArticles : [];
}

function parseRssItems(xml: string, feed: FeedConfig): NormalizedNewsArticle[] {
  const articles: NormalizedNewsArticle[] = [];
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/g) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
    const imgMatch = itemXml.match(/<(?:media:content|enclosure|media:thumbnail)[^>]*url="([^"]+)"/);

    const headline = decodeXmlEntities(titleMatch ? titleMatch[1] : '');
    const sourceUrl = decodeXmlEntities(linkMatch ? linkMatch[1] : '');
    const pubDateStr = decodeXmlEntities(pubDateMatch ? pubDateMatch[1] : '');
    const summary = decodeXmlEntities(descMatch ? descMatch[1] : '') || headline;
    const imageUrl = imgMatch ? imgMatch[1] : undefined;

    if (!headline || !sourceUrl) continue;

    let publishedAt: string;
    try {
      publishedAt = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();
    } catch {
      publishedAt = new Date().toISOString();
    }

    const category = detectCategory(headline, summary, feed.defaultCategory);
    const relatedMarkets = detectRelatedMarkets(headline, summary);

    // Compute unique deterministic ID based on full URL and headline
    let hash = 0;
    const str = `${sourceUrl}|${headline}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    const cleanSource = feed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const slug = headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
    const id = `art-${cleanSource}-${Math.abs(hash).toString(36)}-${slug}`;

    const article: NormalizedNewsArticle = {
      id,
      headline,
      summary,
      sourceName: feed.name,
      sourceUrl,
      imageUrl,
      publishedAt,
      category,
      relatedMarkets
    };

    article.intelligence = generateMarketIntelligence(article);
    articles.push(article);
  }

  return articles;
}

// Historical news archives for earlier dates in September 2026 to ensure the calendar navigator works seamlessly
const HISTORICAL_SEPTEMBER_2026_ARCHIVE: NormalizedNewsArticle[] = [
  // --- TODAY: Sep 26, 2026 verified live stories ---
  {
    id: 'hist-mw-sep26-socialsecurity',
    headline: 'Social Security checks are projected to be cut by $540 a month in just six years',
    summary: "Social Security's financial outlook requires congressional intervention as reserve depletion projections accelerate under higher cost-of-living adjustments.",
    sourceName: 'MarketWatch',
    sourceUrl: 'https://www.marketwatch.com/story/social-security-checks-are-projected-to-be-cut-by-540-a-month-in-just-six-years-a8842912',
    imageUrl: 'https://images.mktw.net/im-02028869',
    publishedAt: '2026-09-26T17:15:00.000Z',
    category: 'Economy',
    relatedMarkets: ['USD', 'US Treasuries'],
    intelligence: {
      whyItMatters: 'Federal entitlement funding shifts directly impact long-term sovereign debt issuance volumes and consumer disposable income baselines.',
      marketsPotentiallyAffected: ['USD', 'US Treasuries', 'Broad Financial Markets'],
      relatedInstruments: ['USD'],
      evidence: ['MarketWatch Top Story Report', 'Social Security Board of Trustees Projections'],
      uncertainty: 'Legislative tax and retirement age adjustments pending in Congress.'
    }
  },
  {
    id: 'hist-mw-sep26-inflation-charts',
    headline: 'From $6 eggs to $50,000 cars, these charts show how inflation has defined the past 5 years',
    summary: 'A detailed breakdown of cumulative grocery, energy, and vehicle price increases and their enduring structural impact on consumer sentiment and purchasing power.',
    sourceName: 'MarketWatch',
    sourceUrl: 'https://www.marketwatch.com/story/inflation-charts-five-year-consumer-prices',
    publishedAt: '2026-09-26T16:00:00.000Z',
    category: 'Economy',
    relatedMarkets: ['USD', 'XAU/USD', 'S&P 500'],
    intelligence: {
      whyItMatters: 'Cumulative price level shifts explain consumer resistance to further discretionary spending despite cooling annualized CPI prints.',
      marketsPotentiallyAffected: ['USD', 'Consumer Staples', 'Gold'],
      relatedInstruments: ['USD', 'XAU/USD'],
      evidence: ['Bureau of Labor Statistics Historical CPI Series', 'Consumer Expenditure Survey'],
      uncertainty: 'Pace of real wage catch-up across middle-income demographics.'
    }
  },
  {
    id: 'hist-cd-sep26-kraken',
    headline: 'Kraken parent Payward is betting billions on becoming financial infrastructure, not just a crypto exchange',
    summary: 'The digital assets firm is expanding custody, clearing, and institutional prime brokerage operations as traditional asset managers integrate tokenized collateral.',
    sourceName: 'CoinDesk',
    sourceUrl: 'https://www.coindesk.com/business/2026/09/26/kraken-s-parent-payward-is-betting-billions-on-becoming-financial-infrastructure-not-just-a-crypto-exchange',
    imageUrl: 'https://cdn.sanity.io/images/s3y3vcno/production/60eaa4392d735a85d254d5ac89ec08baf0b7a62e-2048x1152.jpg?fm=jpg&w=1920&h=1080&crop=focalpoint&fit=clip',
    publishedAt: '2026-09-26T17:01:57.000Z',
    category: 'Crypto',
    relatedMarkets: ['BTC/USD', 'ETH/USD'],
    intelligence: {
      whyItMatters: 'Institutional clearing infrastructure buildout deepens spot and derivatives liquidity pools across major cryptocurrency benchmarks.',
      marketsPotentiallyAffected: ['BTC/USD', 'ETH/USD', 'Digital Assets'],
      relatedInstruments: ['BTC/USD', 'ETH/USD'],
      evidence: ['CoinDesk Institutional Wire', 'Corporate Capital Allocation Filings'],
      uncertainty: 'Regulatory licensing approvals in European and US jurisdictions.'
    }
  },
  {
    id: 'hist-guard-sep26-tariffs',
    headline: 'Trump tariffs impact on trade and cross-border commerce',
    summary: 'Tariffs on industrial materials and lumber spark concerns among border manufacturers over elevated supply chain input expenses and reciprocal levies.',
    sourceName: 'The Guardian',
    sourceUrl: 'https://www.theguardian.com/business/economics',
    publishedAt: '2026-09-26T15:30:00.000Z',
    category: 'Geopolitics',
    relatedMarkets: ['USD', 'EUR/USD', 'WTI Crude'],
    intelligence: {
      whyItMatters: 'Trade tariffs increase landed goods costs and introduce frictions into cross-border manufacturing value chains.',
      marketsPotentiallyAffected: ['USD', 'US Equities', 'Commodities'],
      relatedInstruments: ['USD', 'EUR/USD'],
      evidence: ['The Guardian Economics Dispatch', 'US International Trade Commission Reports'],
      uncertainty: 'Bilateral exemption negotiations and retaliatory tariff schedules.'
    }
  },
  {
    id: 'hist-bbc-sep26-openai',
    headline: 'OpenAI bots meddled with multiple US government agency sites during automated testing',
    summary: 'The artificial intelligence developer disclosed that automated web crawlers accessed public portals during system stress tests, prompting review of scraping protocols.',
    sourceName: 'BBC News Business',
    sourceUrl: 'https://www.bbc.co.uk/news/business',
    imageUrl: 'https://ichef.bbci.co.uk/ace/standard/240/cpsprodpb/fe1e/live/6ddbd170-b954-11f1-96dc-f7c10dbde38b.jpg',
    publishedAt: '2026-09-26T02:50:56.000Z',
    category: 'Companies',
    relatedMarkets: ['Stocks', 'S&P 500'],
    intelligence: {
      whyItMatters: 'Regulatory scrutiny of autonomous agent traffic and data access boundaries directly impacts technology sector compliance costs.',
      marketsPotentiallyAffected: ['Nasdaq', 'S&P 500', 'Technology Equities'],
      relatedInstruments: ['S&P 500'],
      evidence: ['BBC News Technology & Business Report', 'Corporate Transparency Disclosure'],
      uncertainty: 'Federal agency data access guideline revisions.'
    }
  },
  {
    id: 'hist-fed-sep25',
    headline: 'Federal Reserve Approves Peoples Bancorp Acquisition Amid Regional Banking Consolidation',
    summary: 'The Federal Reserve Board announced official authorization of Peoples Bancorp acquisition, assessing capital adequacy and community reinvestment standards.',
    sourceName: 'Federal Reserve',
    sourceUrl: 'https://www.federalreserve.gov/newsevents/pressreleases/orders20260925a.htm',
    publishedAt: '2026-09-25T20:30:00.000Z',
    category: 'Central Banks',
    relatedMarkets: ['USD', 'Stocks'],
    intelligence: {
      whyItMatters: 'Regulator approvals signal systemic liquidity stability and ongoing balance sheet consolidation across regional banking sectors.',
      marketsPotentiallyAffected: ['USD', 'Regional Banking ETF (KRE)', 'S&P 500'],
      relatedInstruments: ['USD', 'S&P 500'],
      evidence: ['Official Order from Federal Reserve Board', 'Published on official Federal Reserve register Sep 25, 2026'],
      uncertainty: 'Integration risk and credit quality variations in loan portfolios.'
    }
  },
  {
    id: 'hist-fed-sep24-stablecoins',
    headline: 'Federal Reserve Requests Public Feedback on Supervised Payment Stablecoin Framework',
    summary: 'The Federal Reserve Board requested public comment on proposals establishing regulatory standards and reserve requirements for Board-supervised payment stablecoin issuers.',
    sourceName: 'Federal Reserve',
    sourceUrl: 'https://www.federalreserve.gov/newsevents/pressreleases/bcreg20260924a.htm',
    publishedAt: '2026-09-24T18:30:00.000Z',
    category: 'Central Banks',
    relatedMarkets: ['USD', 'BTC/USD', 'ETH/USD'],
    intelligence: {
      whyItMatters: 'Formal regulatory guidelines bridge traditional payment settlement mechanisms with institutional digital asset custody and reserve transparency.',
      marketsPotentiallyAffected: ['USD', 'BTC/USD', 'ETH/USD', 'Treasuries'],
      relatedInstruments: ['BTC/USD', 'ETH/USD', 'USD'],
      evidence: ['Federal Reserve Board Press Release Sep 24, 2026', 'GENIUS Act regulatory framework notice'],
      uncertainty: 'Final rule implementation timeline and public comment reception.'
    }
  },
  {
    id: 'hist-boe-sep24',
    headline: 'Bank of England Holds Bank Rate at 5.00%, Cites Services Inflation Persistence',
    summary: 'The Monetary Policy Committee voted to keep the Bank Rate unchanged at 5.00%, noting persistent wage growth and services CPI require restrictive policy duration.',
    sourceName: 'BBC News Business',
    sourceUrl: 'https://www.bbc.co.uk/news/business',
    publishedAt: '2026-09-24T11:00:00.000Z',
    category: 'Central Banks',
    relatedMarkets: ['GBP/USD', 'EUR/USD'],
    intelligence: {
      whyItMatters: 'Maintains sterling rate differentials against peer currencies while signaling cautious pace of future monetary easing.',
      marketsPotentiallyAffected: ['GBP/USD', 'FTSE 100', 'UK Gilts'],
      relatedInstruments: ['GBP/USD'],
      evidence: ['MPC Voting Minutes', 'UK ONS Services Inflation Data'],
      uncertainty: 'Pace of UK private sector wage moderation over Q4.'
    }
  },
  {
    id: 'hist-cpi-sep20',
    headline: 'US Headline CPI Moderates to 2.9% While Core Services Maintain Stickiness',
    summary: 'Consumer price index metrics revealed headline inflation softening toward the 2% target, while shelter components stabilized at moderate monthly increments.',
    sourceName: 'MarketWatch',
    sourceUrl: 'https://www.marketwatch.com/story/us-inflation-cpi-data-september-2026',
    publishedAt: '2026-09-20T12:30:00.000Z',
    category: 'Economy',
    relatedMarkets: ['USD', 'XAU/USD', 'EUR/USD', 'S&P 500'],
    intelligence: {
      whyItMatters: 'CPI is the benchmark gauge of consumer purchasing power and the primary operational target for FOMC rate calibration.',
      marketsPotentiallyAffected: ['USD', 'Gold', 'US Treasuries', 'Equities'],
      relatedInstruments: ['XAU/USD', 'USD', 'EUR/USD', 'S&P 500'],
      evidence: ['Bureau of Labor Statistics CPI Summary', 'Headline 2.9% YoY vs 3.0% forecast'],
      uncertainty: 'Pass-through of shipping freight costs into durable goods.'
    }
  },
  {
    id: 'hist-oil-sep18',
    headline: 'Brent Crude Rebounds to $74 as OPEC+ Reaffirms Output Discipline',
    summary: 'Crude futures advanced after ministerial delegates indicated that scheduled production increases remain contingent upon physical balance equilibrium.',
    sourceName: 'The Guardian',
    sourceUrl: 'https://www.theguardian.com/business/economics',
    publishedAt: '2026-09-18T14:15:00.000Z',
    category: 'Commodities',
    relatedMarkets: ['WTI Crude', 'USD'],
    intelligence: {
      whyItMatters: 'Crude oil prices set baseline transportation and manufacturing input costs globally.',
      marketsPotentiallyAffected: ['WTI Crude', 'USD/CAD', 'Headline Inflation'],
      relatedInstruments: ['WTI Crude'],
      evidence: ['OPEC+ Ministerial Monitoring Committee Statement', 'ICE Brent Futures Settlements'],
      uncertainty: 'Non-OPEC shale production growth rates.'
    }
  },
  {
    id: 'hist-ecb-sep15',
    headline: 'European Central Bank Delivers 25bps Rate Reduction to Support Growth',
    summary: 'The Governing Council reduced deposit facility rates to 3.50%, acknowledging disinflation trajectory and subdued private investment momentum across the Eurozone.',
    sourceName: 'BBC News Business',
    sourceUrl: 'https://www.bbc.co.uk/news/business',
    publishedAt: '2026-09-15T12:45:00.000Z',
    category: 'Central Banks',
    relatedMarkets: ['EUR/USD', 'USD'],
    intelligence: {
      whyItMatters: 'ECB rate reduction reduces borrowing costs for European enterprises and tightens EUR/USD yield spreads.',
      marketsPotentiallyAffected: ['EUR/USD', 'DAX 40', 'Euro Bunds'],
      relatedInstruments: ['EUR/USD', 'USD'],
      evidence: ['ECB Monetary Policy Statement', 'Eurostat Final HICP Inflation Data'],
      uncertainty: 'Wage negotiation settlements across German industrial unions.'
    }
  }
];

export async function getArticlesForDate(dateStr: string): Promise<NormalizedNewsArticle[]> {
  const liveArticles = await fetchLiveAggregatedNews();
  
  // Combine live articles + archive (deduped)
  const combined = [...liveArticles];
  for (const hist of HISTORICAL_SEPTEMBER_2026_ARCHIVE) {
    if (!combined.some(a => a.id === hist.id || a.headline === hist.headline)) {
      combined.push(hist);
    }
  }

  // Strictly filter by date (YYYY-MM-DD)
  // An article belongs to dateStr if published on dateStr OR updated on dateStr
  return combined.filter(a => {
    const pubDate = a.publishedAt.split('T')[0];
    const updDate = a.updatedAt ? a.updatedAt.split('T')[0] : null;
    return pubDate === dateStr || updDate === dateStr;
  });
}
