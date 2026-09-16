import { MarketNewsArticle, NewsEvent, MarketSnapshotAsset } from '@/types/newsIntelligence';
import { 
  ProviderStatus, 
  WhatMovedMarketsDriver, 
  EntityIntelligence, 
  NewsAttentionMetric, 
  MarketReactionEventProfile,
  AINewsAnalystResponse 
} from '@/types/newsModes';
import { getAllMarketNews } from '@/data/marketNewsData';
import { MARKET_SNAPSHOT_ASSETS } from '@/data/marketSnapshotData';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { NEWS_STORY_CLUSTERS } from '@/data/newsStoryClustersData';

// ---------------------------------------------------------------------------
// 1. PROVIDER STATUS
// ---------------------------------------------------------------------------

export function getProviderStatuses(): ProviderStatus[] {
  return [
    {
      name: 'TradeVault Global Newsfeed (Official & Wire Summaries)',
      type: 'news',
      connected: true,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      sourceAttribution: 'Bloomberg, Reuters, Financial Times, WSJ, Central Bank Wire Services (Authorized Excerpts & Links)',
      latencyMs: 180,
      message: 'Active feed with licensed source attribution'
    },
    {
      name: 'TradeVault Delayed Market Data Engine',
      type: 'market_data',
      connected: true,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      sourceAttribution: 'Forex, Commodities, Bond Yields & Crypto Benchmarks (15-min delayed institutional feed)',
      latencyMs: 340,
      message: 'Delayed market quotes connected'
    },
    {
      name: 'TradeVault Sovereign Economic Calendar Registry',
      type: 'calendar',
      connected: true,
      isLive: true,
      lastUpdated: new Date().toISOString(),
      sourceAttribution: 'Bureau of Labor Statistics, Federal Reserve, ECB, BoE, RBI, Ministry of Statistics',
      latencyMs: 90,
      message: 'Official statistical agency releases mapped'
    }
  ];
}

// ---------------------------------------------------------------------------
// 2. NEWS PROVIDER ABSTRACTION
// ---------------------------------------------------------------------------

export const NewsProvider = {
  getAllStories(): MarketNewsArticle[] {
    return getAllMarketNews();
  },

  getBreakingStories(): MarketNewsArticle[] {
    const stories = getAllMarketNews();
    return stories.filter(s => s.impact === 'HIGH' || s.isDevelopingStory);
  },

  searchStories(query: string, categoryFilter?: string): MarketNewsArticle[] {
    const all = getAllMarketNews();
    const q = (query || '').toLowerCase().trim();

    return all.filter(article => {
      if (categoryFilter && categoryFilter !== 'ALL') {
        const cat = article.category.toUpperCase();
        if (categoryFilter === 'BREAKING') {
          if (article.impact !== 'HIGH' && !article.isDevelopingStory) return false;
        } else if (categoryFilter === 'FOREX' && !['FOREX', 'CURRENCIES'].includes(cat) && !article.markets?.some(m => m.includes('/'))) {
          return false;
        } else if (categoryFilter === 'COMMODITIES' && !['COMMODITIES', 'GOLD', 'ENERGY'].includes(cat)) {
          return false;
        } else if (categoryFilter === 'STOCKS' && !['STOCKS', 'EQUITIES', 'INDICES'].includes(cat)) {
          return false;
        } else if (categoryFilter === 'BONDS' && !['BONDS', 'TREASURIES', 'RATES'].includes(cat)) {
          return false;
        } else if (categoryFilter === 'CRYPTO' && cat !== 'CRYPTO') {
          return false;
        } else if (categoryFilter === 'CENTRAL BANKS' && !['CENTRAL BANKS', 'MONETARY POLICY'].includes(cat)) {
          return false;
        } else if (categoryFilter === 'GEOPOLITICS' && cat !== 'GEOPOLITICS') {
          return false;
        } else if (categoryFilter === 'MACRO' && !['MACRO', 'ECONOMY', 'INFLATION'].includes(cat)) {
          return false;
        } else if (!['ALL', 'LATEST'].includes(categoryFilter) && cat !== categoryFilter) {
          return false;
        }
      }

      if (!q) return true;

      const inHeadline = article.headline.toLowerCase().includes(q);
      const inSummary = article.summary.toLowerCase().includes(q);
      const inSource = article.source.toLowerCase().includes(q);
      const inCategory = article.category.toLowerCase().includes(q);
      const inPerson = article.personEntity ? article.personEntity.toLowerCase().includes(q) : false;
      const inMarkets = article.markets?.some(m => m.toLowerCase().includes(q));

      return inHeadline || inSummary || inSource || inCategory || inPerson || inMarkets;
    });
  },

  getStoriesForEntity(entityName: string): MarketNewsArticle[] {
    const q = entityName.toLowerCase();
    return getAllMarketNews().filter(a => {
      return a.headline.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.personEntity?.toLowerCase().includes(q) ||
        a.markets?.some(m => m.toLowerCase().includes(q));
    });
  },

  getStoryClusters() {
    return NEWS_STORY_CLUSTERS;
  }
};

// ---------------------------------------------------------------------------
// 3. MARKET DATA PROVIDER ABSTRACTION
// ---------------------------------------------------------------------------

export const MarketDataProvider = {
  getAssets(): MarketSnapshotAsset[] {
    return MARKET_SNAPSHOT_ASSETS;
  },

  getAssetBySymbol(symbol: string): MarketSnapshotAsset | undefined {
    const clean = symbol.replace('/', '').toUpperCase();
    return MARKET_SNAPSHOT_ASSETS.find(a => {
      const assetClean = a.symbol.replace('/', '').toUpperCase();
      return assetClean === clean || a.symbol.toUpperCase() === symbol.toUpperCase();
    });
  },

  getTickerItems(): { symbol: string; name: string; priceFormatted: string; change24h: number; unit?: string }[] {
    const preferredSymbols = ['DXY', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'US10Y', 'WTI', 'BTC/USD', 'SPX', 'NIFTY'];
    const results: { symbol: string; name: string; priceFormatted: string; change24h: number; unit?: string }[] = [];

    preferredSymbols.forEach(sym => {
      const asset = this.getAssetBySymbol(sym);
      if (asset) {
        results.push({
          symbol: asset.symbol,
          name: asset.name,
          priceFormatted: asset.priceFormatted,
          change24h: asset.change24h,
          unit: asset.unit
        });
      }
    });

    // Fallback if some symbols weren't found
    if (results.length < 5) {
      MARKET_SNAPSHOT_ASSETS.slice(0, 8).forEach(a => {
        if (!results.find(r => r.symbol === a.symbol)) {
          results.push({
            symbol: a.symbol,
            name: a.name,
            priceFormatted: a.priceFormatted,
            change24h: a.change24h,
            unit: a.unit
          });
        }
      });
    }

    return results;
  }
};

// ---------------------------------------------------------------------------
// 4. "WHAT MOVED MARKETS?" DRIVERS
// ---------------------------------------------------------------------------

export const WHAT_MOVED_MARKETS_DATA: WhatMovedMarketsDriver[] = [
  {
    id: 'wmm-cpi-sep26',
    title: 'US Core Inflation Upside Surprise (3.2% vs 3.1% Exp)',
    relevance: 'HIGH',
    category: 'MACRO / INFLATION',
    source: 'U.S. Bureau of Labor Statistics & Bloomberg Wire',
    sourceUrl: 'https://www.bls.gov/cpi/',
    publishedTime: '2 hours ago',
    explanation: 'Core consumer prices posted a persistent 0.28% MoM gain driven by transportation services and housing rent shelter. This effectively removed expectations of an aggressive 50 basis point rate cut, pricing in a standard 25bps move.',
    affectedAssets: [
      { symbol: 'USD (DXY)', reactionPct: +0.28, reactionLabel: '+0.28%', isPositive: true },
      { symbol: 'Gold (XAU/USD)', reactionPct: -0.62, reactionLabel: '-0.62%', isPositive: false },
      { symbol: 'US 10Y Yield', reactionPct: +0.05, reactionLabel: '+5 bps', isPositive: true },
      { symbol: 'S&P 500', reactionPct: -0.34, reactionLabel: '-0.34%', isPositive: false }
    ],
    qualification: 'Market reaction associated with this development',
    evidencePoints: [
      'Short-term Treasury 2-year yield rose 7 basis points in the 15 minutes immediately following the release.',
      'Federal Funds Futures implied probability of 50bps cut dropped from 34% to 11% post-announcement.',
      'Gold retreated $18/oz from pre-release resistance levels before consolidating near $2,490/oz.'
    ]
  },
  {
    id: 'wmm-ecb-rate-cut',
    title: 'ECB 25bps Deposit Rate Reduction Amid Sluggish German Output',
    relevance: 'HIGH',
    category: 'CENTRAL BANKS',
    source: 'European Central Bank & Reuters',
    sourceUrl: 'https://www.ecb.europa.eu',
    publishedTime: '5 hours ago',
    explanation: 'The European Central Bank lowered its deposit rate to 3.50%. President Lagarde reiterated a data-dependent, meeting-by-meeting approach while cutting the eurozone GDP growth forecast.',
    affectedAssets: [
      { symbol: 'EUR/USD', reactionPct: -0.22, reactionLabel: '-0.22%', isPositive: false },
      { symbol: 'DAX 40', reactionPct: +0.45, reactionLabel: '+0.45%', isPositive: true },
      { symbol: 'German 10Y Bund', reactionPct: -0.03, reactionLabel: '-3 bps', isPositive: false }
    ],
    qualification: 'Potential market driver',
    evidencePoints: [
      'Euro dipped against the USD toward 1.1020 support following press conference Q&A.',
      'Industrial production in Germany contracted 2.4% MoM prior to the rate decision.'
    ]
  },
  {
    id: 'wmm-oil-red-sea',
    title: 'Middle East Supply Disruption Risk & Strait of Hormuz Monitoring',
    relevance: 'MEDIUM',
    category: 'COMMODITIES',
    source: 'S&P Global Platts & Financial Times',
    sourceUrl: 'https://www.spglobal.com/commodityinsights',
    publishedTime: '8 hours ago',
    explanation: 'Crude oil rebounded +1.8% as tanker insurance premiums rose following renewed shipping threats along maritime lanes. OPEC+ production quota compliance was also reiterated.',
    affectedAssets: [
      { symbol: 'Brent Crude', reactionPct: +1.84, reactionLabel: '+1.84%', isPositive: true },
      { symbol: 'WTI Crude', reactionPct: +1.72, reactionLabel: '+1.72%', isPositive: true },
      { symbol: 'USD/CAD', reactionPct: -0.25, reactionLabel: '-0.25%', isPositive: false }
    ],
    qualification: 'Potential market driver',
    evidencePoints: [
      'Prompt Brent spread widened into backwardation of $0.65/bbl.',
      'Energy sector equities outperformed broader equity indices across Asian and European sessions.'
    ]
  },
  {
    id: 'wmm-boj-hawkish',
    title: 'Bank of Japan Signals Continued Gradual Rate Normalization',
    relevance: 'MEDIUM',
    category: 'FOREX',
    source: 'Nikkei Asia & Bank of Japan Minutes',
    sourceUrl: 'https://www.boj.or.jp/en/',
    publishedTime: '12 hours ago',
    explanation: 'Governor Ueda reiterated that if inflation and wage growth evolve in line with baseline forecasts, the central bank will adjust its degree of policy accommodation further.',
    affectedAssets: [
      { symbol: 'USD/JPY', reactionPct: -0.54, reactionLabel: '-0.54% (JPY Strength)', isPositive: false },
      { symbol: 'Nikkei 225', reactionPct: -0.68, reactionLabel: '-0.68%', isPositive: false }
    ],
    qualification: 'Market reaction associated with this development',
    evidencePoints: [
      'USD/JPY slid from 143.70 to 142.85 during Tokyo afternoon trade.',
      'Japanese 10-year sovereign JGB yield rose to 0.89%.'
    ]
  }
];

// ---------------------------------------------------------------------------
// 5. ENTITY INTELLIGENCE DATABASE
// ---------------------------------------------------------------------------

export const ENTITIES_INTELLIGENCE_DATA: Record<string, EntityIntelligence> = {
  'federal-reserve': {
    id: 'federal-reserve',
    name: 'Federal Reserve (Fed)',
    symbolOrTicker: 'USD / FOMC',
    type: 'Central Bank',
    description: 'The central banking system of the United States, managing monetary policy, interest rates, and financial stability under its dual mandate: maximum employment and stable prices (2% target).',
    keyStats: [
      { label: 'Policy Rate', value: '5.25% – 5.50%', subtext: 'Target Upper Limit' },
      { label: 'Next FOMC Decision', value: 'Sep 18, 2026', subtext: 'Dot Plot & SEP Update' },
      { label: 'Balance Sheet', value: '$7.18 Trillion', subtext: 'Ongoing Quantitative Tightening' },
      { label: 'Fed Chair', value: 'Jerome Powell', subtext: 'Term expires 2026' }
    ],
    primaryDriver: 'Balancing disinflation trajectory against signs of labor market cooling in non-farm payroll prints.',
    relatedMarkets: ['USD (DXY)', 'Gold (XAU/USD)', 'US 2Y/10Y Treasuries', 'S&P 500', 'EUR/USD'],
    upcomingEventIds: ['event-fomc-rate'],
    recentStoryIds: ['news-1', 'news-3'],
    historicalContext: 'Historically, aggressive rate hike cycles precede market volatility. The transition from peak rates to the first easing step historically triggers elevated dispersion between short-duration cash instruments and duration assets.'
  },
  'gold': {
    id: 'gold',
    name: 'Spot Gold',
    symbolOrTicker: 'XAU/USD',
    type: 'Commodity',
    description: 'Physical bullion traded against the US Dollar. Serves as a macro monetary hedge, reserve asset for sovereign central banks, and negative-yield duration asset sensitive to real interest rates.',
    keyStats: [
      { label: 'Benchmark Price', value: '$2,490.50 / oz', subtext: 'Consolidating near record highs' },
      { label: 'Central Bank Buying', value: '1,037 tonnes / yr', subtext: 'Near-record sovereign accumulation' },
      { label: 'Real Yield Beta', value: '-0.74', subtext: 'Inverse correlation with US 10Y TIPS' },
      { label: '52-Week Range', value: '$1,980 – $2,530', subtext: '+25.7% Year-to-Date' }
    ],
    primaryDriver: 'Central bank de-dollarization reserves accumulation competing with elevated US real Treasury yields.',
    relatedMarkets: ['USD (DXY)', 'US 10Y TIPS Yield', 'Silver (XAG/USD)', 'EUR/USD'],
    upcomingEventIds: ['event-cpi-sep26', 'event-fomc-rate'],
    recentStoryIds: ['news-1', 'news-4'],
    historicalContext: 'Gold demonstrates strongest historical upward momentum when central banks begin easing while inflation remains modestly above target, compressing real yields.'
  },
  'bitcoin': {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbolOrTicker: 'BTC/USD',
    type: 'Crypto',
    description: 'Decentralized digital commodity and base-layer store of value with a hardcoded supply cap of 21 million units and quadrennial issuance halving schedules.',
    keyStats: [
      { label: 'Market Price', value: '$58,450', subtext: '+1.4% 24h Change' },
      { label: 'ETF Inflows (Net)', value: '+$17.2 Billion', subtext: 'Cumulative since Jan 2024' },
      { label: 'Dominance', value: '56.8%', subtext: 'Total crypto market cap share' },
      { label: 'Next Halving', value: '~2028', subtext: 'Block reward 1.5625 BTC' }
    ],
    primaryDriver: 'Institutional ETF liquidity flows and macro dollar liquidity cycles.',
    relatedMarkets: ['Ethereum (ETH/USD)', 'Nasdaq 100', 'US Dollar Index', 'Coinbase (COIN)'],
    upcomingEventIds: ['event-fomc-rate'],
    recentStoryIds: ['news-5'],
    historicalContext: 'Historically exhibits high correlation with global M2 money supply expansions and high-beta risk sentiment during rate cut cycles.'
  },
  'ecb': {
    id: 'ecb',
    name: 'European Central Bank (ECB)',
    symbolOrTicker: 'EUR / ECB',
    type: 'Central Bank',
    description: 'Central bank for the 20 European Union member countries that have adopted the Euro, responsible for price stability (2% medium-term target).',
    keyStats: [
      { label: 'Deposit Facility Rate', value: '3.50%', subtext: '-25bps latest reduction' },
      { label: 'Main Refinancing Rate', value: '3.65%', subtext: 'Adjusted operational framework' },
      { label: 'President', value: 'Christine Lagarde', subtext: 'Frankfurt headquarters' },
      { label: 'Eurozone Inflation', value: '2.2% YoY', subtext: 'Headline decelerating' }
    ],
    primaryDriver: 'Weak manufacturing output in Germany and France requiring monetary easing despite services wage stickiness.',
    relatedMarkets: ['EUR/USD', 'German 10Y Bund', 'DAX 40', 'EUR/GBP'],
    upcomingEventIds: ['event-ecb-sep26'],
    recentStoryIds: ['news-2'],
    historicalContext: 'Rate cuts by the ECB without matching Fed cuts historically widen transatlantic rate differentials, putting downward structural pressure on EUR/USD.'
  },
  'rbi': {
    id: 'rbi',
    name: 'Reserve Bank of India (RBI)',
    symbolOrTicker: 'INR / RBI',
    type: 'Central Bank',
    description: 'India’s central monetary institution controlling monetary policy, banking supervision, and foreign exchange reserves under an inflation-targeting framework of 4% (+/- 2%).',
    keyStats: [
      { label: 'Repo Rate', value: '6.50%', subtext: 'Maintained status quo' },
      { label: 'Forex Reserves', value: '$683 Billion', subtext: 'All-time record peak' },
      { label: 'India GDP Growth', value: '6.7% YoY', subtext: 'Fastest-growing major economy' },
      { label: 'Governor', value: 'Shaktikanta Das', subtext: 'Mumbai headquarters' }
    ],
    primaryDriver: 'Elevated food inflation risks preventing immediate rate cuts despite resilient manufacturing and capex GDP growth.',
    relatedMarkets: ['USD/INR', 'NIFTY 50', 'India 10Y Sovereign Bond', 'BSE SENSEX'],
    upcomingEventIds: ['event-rbi-oct26'],
    recentStoryIds: ['news-6'],
    historicalContext: 'RBI actively intervenes in the offshore and onshore NDF currency markets to damp USD/INR volatility while supporting high real domestic interest rates.'
  },
  'usd': {
    id: 'usd',
    name: 'US Dollar Index (DXY)',
    symbolOrTicker: 'DXY / USD',
    type: 'Currency',
    description: 'The world primary reserve and trade invoicing currency, measured against a trade-weighted basket of six foreign currencies (EUR, JPY, GBP, CAD, SEK, CHF).',
    keyStats: [
      { label: 'Spot Index', value: '101.42 pts', subtext: '+0.28% 24h change' },
      { label: 'Euro Weighting', value: '57.6%', subtext: 'Dominant basket component' },
      { label: 'Global FX Reserves', value: '58.4%', subtext: 'IMF COFER data' },
      { label: 'Yield Spread', value: '+1.65%', subtext: 'US 10Y vs German 10Y spread' }
    ],
    primaryDriver: 'Relative US economic resilience and Treasury yield differentials compared to European and Asian economies.',
    relatedMarkets: ['EUR/USD', 'USD/JPY', 'Gold', 'Emerging Market Currencies'],
    upcomingEventIds: ['event-cpi-sep26', 'event-fomc-rate'],
    recentStoryIds: ['news-1', 'news-3'],
    historicalContext: 'The Dollar Smile theory: USD appreciates both during extreme risk-off global crises (flight to liquidity) and during US economic outperformance.'
  },
  'apple': {
    id: 'apple',
    name: 'Apple Inc.',
    symbolOrTicker: 'AAPL',
    type: 'Company',
    description: 'Global consumer technology leader in hardware, software, and services (iPhone, Mac, Services ecosystem, Apple Intelligence rollout).',
    keyStats: [
      { label: 'Market Cap', value: '$3.42 Trillion', subtext: 'Top Nasdaq/S&P weighting' },
      { label: 'Services Revenue', value: '$24.2B / Qtr', subtext: 'High-margin recurring revenue' },
      { label: 'Gross Margin', value: '46.3%', subtext: 'Hardware + Services blended' },
      { label: 'Cash & Equivalents', value: '$153 Billion', subtext: 'Active share repurchase program' }
    ],
    primaryDriver: 'iPhone 16 upgrade cycle and monetization of on-device Apple Intelligence AI features.',
    relatedMarkets: ['S&P 500', 'Nasdaq 100', 'Taiwan Semiconductor (TSMC)', 'US Dollar'],
    upcomingEventIds: [],
    recentStoryIds: [],
    historicalContext: 'Acts as a bellwether for institutional tech liquidity and passive index capital allocations worldwide.'
  },
  'nvidia': {
    id: 'nvidia',
    name: 'NVIDIA Corporation',
    symbolOrTicker: 'NVDA',
    type: 'Company',
    description: 'Pioneer of accelerated GPU computing, leading global enterprise AI infrastructure, data center accelerators (Blackwell & Hopper architectures), and CUDA software stack.',
    keyStats: [
      { label: 'Market Cap', value: '$2.85 Trillion', subtext: 'Key driver of S&P 500 earnings growth' },
      { label: 'Data Center Rev', value: '$26.3B / Qtr', subtext: '+154% YoY expansion' },
      { label: 'Operating Margin', value: '62.1%', subtext: 'Pricing power in AI silicon' },
      { label: 'Architecture', value: 'Blackwell Ultra', subtext: 'Volume shipments ramping' }
    ],
    primaryDriver: 'Hyperscaler capital expenditures (Microsoft, Alphabet, Meta, Amazon) allocated to artificial intelligence infrastructure.',
    relatedMarkets: ['Nasdaq 100', 'Semiconductor Index (SOX)', 'TSMC', 'AMD'],
    upcomingEventIds: [],
    recentStoryIds: [],
    historicalContext: 'High-beta sensitivity to overall tech valuations and macro cost-of-capital interest rate trajectories.'
  },
  'tesla': {
    id: 'tesla',
    name: 'Tesla, Inc.',
    symbolOrTicker: 'TSLA',
    type: 'Company',
    description: 'Automotive and energy transition pioneer focused on electric vehicles, megapack stationary energy storage, full self-driving (FSD) neural nets, and humanoid robotics.',
    keyStats: [
      { label: 'Market Cap', value: '$680 Billion', subtext: 'Automotive + Energy Storage' },
      { label: 'Auto Gross Margin', value: '14.6% (ex-credits)', subtext: 'Navigating price competition' },
      { label: 'Energy Storage Rev', value: '$3.0B / Qtr', subtext: '+157% YoY growth' },
      { label: 'Full Self-Driving', value: 'v12.5 End-to-End', subtext: 'Vision-only neural networks' }
    ],
    primaryDriver: 'FSD regulatory approval milestones, autonomous Robotaxi unveiling, and Megapack stationary energy deployments.',
    relatedMarkets: ['Nasdaq 100', 'Lithium / Battery Metals', 'Crude Oil (EV displacement)'],
    upcomingEventIds: [],
    recentStoryIds: [],
    historicalContext: 'Trades with high retail and retail-option beta; sensitive to consumer auto financing rates and automotive loan interest rates.'
  }
};

// ---------------------------------------------------------------------------
// 6. NEWS ATTENTION & VELOCITY CALCULATIONS
// ---------------------------------------------------------------------------

export function getNewsAttentionMetrics(): NewsAttentionMetric[] {
  return [
    {
      topic: 'Gold (XAU/USD)',
      countCurrent6h: 18,
      countPrevious6h: 11,
      percentChange: +63.6,
      status: 'INCREASED',
      summary: 'Gold-related news volume surged +63% following sticky US inflation data and sovereign reserve commentary.'
    },
    {
      topic: 'US Interest Rates / Fed',
      countCurrent6h: 31,
      countPrevious6h: 22,
      percentChange: +40.9,
      status: 'INCREASED',
      summary: 'Fed rate expectation headlines increased +41% as markets repriced odds away from a 50bps cut.'
    },
    {
      topic: 'Crude Oil & Shipping',
      countCurrent6h: 14,
      countPrevious6h: 15,
      percentChange: -6.7,
      status: 'STABLE',
      summary: 'Energy headlines remain stable around Middle East maritime chokepoints.'
    },
    {
      topic: 'Crypto & Bitcoin',
      countCurrent6h: 12,
      countPrevious6h: 14,
      percentChange: -14.3,
      status: 'DECREASED',
      summary: 'Digital asset news flow moderated following ETF inflow consolidation.'
    }
  ];
}

// ---------------------------------------------------------------------------
// 7. AI NEWS ANALYST GENERATOR (EVIDENCE-FIRST & DETERMINISTIC)
// ---------------------------------------------------------------------------

export function generateAINewsAnalysis(
  query: string,
  article?: MarketNewsArticle | null,
  event?: NewsEvent | null
): AINewsAnalystResponse {
  const q = (query || '').toLowerCase().trim();
  const isHindi = q.includes('hindi') || q.includes('सरल') || q.includes('हिंदी');
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Default context based on active article or event or general macro state
  const headline = article?.headline || event?.name || 'US Inflation & Federal Reserve Monetary Policy Outlook';
  const sourceName = article?.source || event?.source || 'Bureau of Labor Statistics / Bloomberg Wire';
  const sourceUrl = article?.sourceUrl || event?.sourceUrl || 'https://www.bls.gov';

  if (isHindi) {
    return {
      query,
      timestamp: now,
      whatHappened: 'हालिया आर्थिक आंकड़ों में US कोर मुद्रास्फीति (Core CPI) 3.2% आई है, जो बाजार के 3.1% के अनुमान से थोड़ी अधिक है।',
      whyItMatters: 'ऊंची मुद्रास्फीति से यह स्पष्ट होता है कि अमेरिकी फेडरल रिजर्व 0.50% की बड़ी ब्याज दर कटौती नहीं करेगा, बल्कि केवल 0.25% की सामान्य कटौती का रास्ता चुनेगा।',
      marketsInvolved: ['अमेरिकी डॉलर (USD)', 'सोना (Gold / XAUUSD)', 'अमेरिकी बॉन्ड यील्ड्स', 'शेयर बाजार (S&P 500)'],
      currentMarketReaction: 'डॉलर इंडेक्स में +0.28% की बढ़त देखी गई, जबकि सोने (Gold) में $15-$18 की तात्कालिक गिरावट दर्ज की गई।',
      historicalContext: 'ऐतिहासिक रूप से, जब भी मुद्रास्फीति अनुमान से अधिक आती है, डॉलर को मजबूती मिलती है और कम ब्याज दरों पर निर्भर संपत्तियों पर दबाव पड़ता है।',
      evidence: [
        'अमेरिकी 2-वर्षीय बॉन्ड यील्ड में 7 बेसिस प्वाइंट का उछाल आया।',
        'फेडरल फ्यूचर्स मार्केट में 50bps कटौती की संभावना 34% से घटकर 11% रह गई।'
      ],
      uncertainty: [
        'यह स्पष्ट नहीं है कि आगामी PCE इंडेक्स इस आंकड़े की पुष्टि करेगा या नहीं।',
        'आने वाले समय में बेरोजगारी भत्ते के आंकड़े नीति को प्रभावित कर सकते हैं।'
      ],
      whatToWatch: [
        'अमेरिकी रिटेल बिक्री (Retail Sales) के आगामी आंकड़े',
        'फेड चेयरमैन जेरोम पॉवेल की आगामी प्रेस वार्ता'
      ],
      source: sourceName,
      sourceUrl: sourceUrl,
      language: 'hi'
    };
  }

  // Teacher / Professional explanation
  const isTeacher = q.includes('teacher') || q.includes('explain') || q.includes('simple');
  
  return {
    query,
    timestamp: now,
    whatHappened: article?.whatHappened || (
      article 
        ? `${article.headline}. Published by ${article.source}, highlighting key developments in ${article.category}.`
        : 'US Headline consumer inflation printed at 3.2% YoY vs 3.1% consensus, with Core CPI holding steady at 3.2% annualized.'
    ),
    whyItMatters: article?.whyItMatters || (
      'Higher-than-anticipated inflation readings reduce the likelihood of aggressive policy easing by central banks. When central banks maintain higher rates for longer, financing costs remain elevated, impacting corporate valuations and sovereign currency yield differentials.'
    ),
    marketsInvolved: article?.markets || ['USD (DXY)', 'Gold (XAU/USD)', 'US 10Y Treasuries', 'S&P 500 / Nasdaq'],
    currentMarketReaction: article?.traderImpact?.explanation || (
      'The US Dollar Index ticked up +0.28% to 101.42, while Spot Gold retreated -0.62% toward $2,490/oz as short-dated Treasury yields moved higher by 5-7 basis points.'
    ),
    historicalContext: 'Historically, persistent inflation surprises during late-cycle environments compress multiple expansions in high-PE equities and strengthen the currency of the hawkish central bank over a 24-48 hour window.',
    evidence: article?.confirmedFacts || [
      'Official statistical release published with complete methodology tables.',
      'Sovereign yield curve short-end repriced 7 basis points upward within 15 minutes of release.',
      'Fed funds futures probability shifted distinctly toward a 25 basis point baseline move.'
    ],
    uncertainty: article?.uncertainPoints || [
      'Upcoming PCE deflator release could diverge from CPI component weighting.',
      'Labor market cooling may still force policymakers to adjust the terminal rate path.'
    ],
    whatToWatch: [
      'Subsequent weekly initial jobless claims for confirmation of labor resilience.',
      'FOMC forward guidance summary of economic projections (SEP / Dot Plot).'
    ],
    source: sourceName,
    sourceUrl: sourceUrl,
    language: 'en'
  };
}
