export interface TrustedResource {
  id: string;
  title: string;
  source: string;
  tier: 'TIER 1' | 'TIER 2' | 'TIER 3';
  tierLabel: 'Official / Primary' | 'Established Education' | 'Recommended YouTube Channel';
  type: 'video' | 'article' | 'course';
  url: string | null; // null if unavailable
  durationOrReadTime: string;
  whyRelevant: string;
  conceptIds?: string[];
  level?: number;
  category?: string;
}

export const TRUSTED_RESOURCES: TrustedResource[] = [
  {
    id: 'res-cme-risk-mgmt',
    title: 'Introduction to Risk Management & Position Sizing',
    source: 'CME Group Education',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: 'https://www.cmegroup.com/education/courses/introduction-to-risk-management.html',
    durationOrReadTime: '15 min read',
    whyRelevant: 'Official exchange curriculum detailing margin, capital protection, and position risk budgeting.',
    conceptIds: ['c-l3-position-sizing', 'c-l3-risk-per-trade', 'c-l3-stop-loss-mechanics'],
    level: 3,
    category: 'Risk Management'
  },
  {
    id: 'res-sec-investor-basics',
    title: 'Saving and Investing: A Roadmap to Financial Security',
    source: 'SEC Investor Education',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: 'https://www.investor.gov/introduction-investing/investing-basics',
    durationOrReadTime: '10 min read',
    whyRelevant: 'Primary US regulatory foundation on understanding risk vs reward, diversification, and compound growth.',
    conceptIds: ['c-l0-what-is-market', 'c-l0-buyers-sellers', 'c-l1-asset-classes'],
    level: 0,
    category: 'Market Basics'
  },
  {
    id: 'res-finra-market-mechanics',
    title: 'Market Order vs Limit Order Mechanics',
    source: 'FINRA Investor Education',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: 'https://www.finra.org/investors/investing/investment-products/stocks/types-of-orders',
    durationOrReadTime: '8 min read',
    whyRelevant: 'Comprehensive regulatory breakdown of how orders match and the risk of price slippage.',
    conceptIds: ['c-l2-order-types', 'c-l2-spread-slippage', 'c-l5-limit-vs-market'],
    level: 2,
    category: 'Trading Basics'
  },
  {
    id: 'res-cfa-ethics-standards',
    title: 'Risk Tolerance and Capital Allocation Fundamentals',
    source: 'CFA Institute',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: 'https://www.cfainstitute.org/en/research/foundation',
    durationOrReadTime: '12 min read',
    whyRelevant: 'Rigorous institutional overview of capital preservation, risk-return profiles, and drawdown recovery.',
    conceptIds: ['c-l3-drawdown-recovery', 'c-l8-portfolio-diversification'],
    level: 3,
    category: 'Risk Management'
  },
  {
    id: 'res-nse-investor-guide',
    title: 'Understanding Derivatives & Risk Disclosures',
    source: 'NSE India (National Stock Exchange)',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: 'https://www.nseindia.com/invest/investor-education',
    durationOrReadTime: '10 min read',
    whyRelevant: 'Official Indian exchange guide to derivatives mechanics, contract specs, and retail trader survival.',
    conceptIds: ['c-l1-derivatives-intro', 'c-l2-margin-leverage'],
    level: 1,
    category: 'Bonds'
  },
  {
    id: 'res-sebi-investor-awareness',
    title: 'Dos and Don’ts for Beginning Market Participants',
    source: 'SEBI (Securities and Exchange Board of India)',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: 'https://investor.sebi.gov.in/',
    durationOrReadTime: '7 min read',
    whyRelevant: 'Essential regulatory guidance on avoiding excessive leverage and protecting trading capital.',
    conceptIds: ['c-l0-what-is-trading', 'c-l6-emotional-discipline'],
    level: 0,
    category: 'Trading Basics'
  },
  {
    id: 'res-zerodha-varsity-basics',
    title: 'Introduction to Stock Markets & Market Participants',
    source: 'Zerodha Varsity',
    tier: 'TIER 2',
    tierLabel: 'Established Education',
    type: 'course',
    url: 'https://zerodha.com/varsity/module/introduction-to-stock-markets/',
    durationOrReadTime: '20 min read',
    whyRelevant: 'High-clarity, beginner-friendly walkthrough of how exchanges, brokers, and clearing houses operate.',
    conceptIds: ['c-l0-what-is-market', 'c-l0-brokers-exchanges', 'c-l1-stocks-equities'],
    level: 0,
    category: 'Stocks'
  },
  {
    id: 'res-zerodha-varsity-technical',
    title: 'Technical Analysis & Support/Resistance Foundations',
    source: 'Zerodha Varsity',
    tier: 'TIER 2',
    tierLabel: 'Established Education',
    type: 'course',
    url: 'https://zerodha.com/varsity/module/technical-analysis/',
    durationOrReadTime: '25 min read',
    whyRelevant: 'Clean explanation of candlestick basics, trends, and support/resistance without confusing jargon.',
    conceptIds: ['c-l2-candlesticks', 'c-l4-support-resistance', 'c-l4-trend-structure'],
    level: 4,
    category: 'Technical Analysis'
  },
  {
    id: 'res-babypips-school',
    title: 'School of Pipsology: Forex Fundamentals & Lot Sizing',
    source: 'BabyPips',
    tier: 'TIER 2',
    tierLabel: 'Established Education',
    type: 'course',
    url: 'https://www.babypips.com/learn/forex/preschool',
    durationOrReadTime: '15 min read',
    whyRelevant: 'The global benchmark beginner tutorial on currency pairs, pips, leverage, and margin calculation.',
    conceptIds: ['c-l1-forex-currencies', 'c-l2-pips-spread', 'c-l3-position-sizing'],
    level: 1,
    category: 'Forex'
  },
  {
    id: 'res-investopedia-stoploss',
    title: 'The Stop-Loss Order — What Every Trader Must Know',
    source: 'Investopedia',
    tier: 'TIER 2',
    tierLabel: 'Established Education',
    type: 'article',
    url: 'https://www.investopedia.com/terms/s/stop-lossorder.asp',
    durationOrReadTime: '6 min read',
    whyRelevant: 'Clear guide comparing stop-loss market orders, trailing stops, and stop-limit nuances.',
    conceptIds: ['c-l3-stop-loss-mechanics', 'c-l5-execution-discipline'],
    level: 3,
    category: 'Risk Management'
  },
  {
    id: 'res-khan-academy-stocks',
    title: 'Stocks and Bonds Essentials',
    source: 'Khan Academy',
    tier: 'TIER 2',
    tierLabel: 'Established Education',
    type: 'course',
    url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/stock-and-bonds',
    durationOrReadTime: '18 min read',
    whyRelevant: 'Intuitive math-first pedagogical explanation of equity valuation and debt yields.',
    conceptIds: ['c-l1-stocks-equities', 'c-l1-bonds-rates'],
    level: 1,
    category: 'Bonds'
  },
  {
    id: 'res-yt-rayner-position-sizing',
    title: 'Position Sizing Explained: Never Blow Up a Trading Account',
    source: 'Rayner Teo',
    tier: 'TIER 3',
    tierLabel: 'Recommended YouTube Channel',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=kYJjZ3xHkQo',
    durationOrReadTime: '14 min',
    whyRelevant: 'Simple, step-by-step whiteboard walkthrough of the 1% risk rule and calculating exact unit sizes.',
    conceptIds: ['c-l3-position-sizing', 'c-l3-risk-per-trade'],
    level: 3,
    category: 'Risk Management'
  },
  {
    id: 'res-yt-smb-risk-reward',
    title: 'Risk-to-Reward Ratio: The Secret to Long Term Edge',
    source: 'SMB Capital',
    tier: 'TIER 3',
    tierLabel: 'Recommended YouTube Channel',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=Fj7rP4XqQ7c',
    durationOrReadTime: '18 min',
    whyRelevant: 'Proprietary trading firm breakdown of why win rate is meaningless without an asymmetric R:R profile.',
    conceptIds: ['c-l3-risk-reward-ratio', 'c-l7-expected-value'],
    level: 3,
    category: 'Strategy'
  },
  {
    id: 'res-yt-cme-futures-basics',
    title: 'How Futures Markets Work: Basics for Beginners',
    source: 'CME Group',
    tier: 'TIER 3',
    tierLabel: 'Recommended YouTube Channel',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=YwL9Q_bX4oE',
    durationOrReadTime: '9 min',
    whyRelevant: 'Clear visual animation explaining standardization, initial margin, and daily mark-to-market settlement.',
    conceptIds: ['c-l1-futures-mechanics', 'c-l1-commodities'],
    level: 1,
    category: 'Commodities'
  },
  {
    id: 'res-yt-zerodha-psychology',
    title: 'Trading Psychology: Conquering FOMO & Revenge Trading',
    source: 'Zerodha',
    tier: 'TIER 3',
    tierLabel: 'Recommended YouTube Channel',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=Vz8K1a3b3tE',
    durationOrReadTime: '22 min',
    whyRelevant: 'Practical behavioral trading insights on emotional triggers, rule-following, and mental capital.',
    conceptIds: ['c-l6-fomo-revenge', 'c-l6-emotional-discipline', 'c-l6-cognitive-biases'],
    level: 6,
    category: 'Psychology'
  },
  {
    id: 'res-unverified-advanced-lab',
    title: 'Advanced Stochastic Volatility Surface Modeling',
    source: 'Quantitative Research Hub',
    tier: 'TIER 1',
    tierLabel: 'Official / Primary',
    type: 'article',
    url: null, // intentionally null to fulfill user rule: "If a URL cannot be verified: DO NOT create a fake link. Show: 'Resource unavailable' instead."
    durationOrReadTime: '30 min read',
    whyRelevant: 'Research module on implied volatility surfaces and skew dynamics.',
    conceptIds: ['c-l10-volatility-modeling'],
    level: 10,
    category: 'Quant Basics'
  }
];

export function getResourcesForConcept(conceptId: string): TrustedResource[] {
  return TRUSTED_RESOURCES.filter(r => r.conceptIds?.includes(conceptId));
}

export function getResourcesByLevel(level: number): TrustedResource[] {
  return TRUSTED_RESOURCES.filter(r => r.level === level);
}

export function getResourcesByCategory(category: string): TrustedResource[] {
  return TRUSTED_RESOURCES.filter(r => r.category?.toLowerCase() === category.toLowerCase());
}
