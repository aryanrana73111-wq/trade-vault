import { 
  NewsEvent, 
  NewsKnowledgeNode, 
  NewsUserSettings 
} from '@/types/newsIntelligence';
import { EXTENDED_CALENDAR_EVENTS } from './extendedCalendarEvents';

export const DEFAULT_NEWS_SETTINGS: NewsUserSettings = {
  timezone: 'LOCAL',
  defaultImpactFilter: 'ALL',
  defaultMode: 'trader',
  preEventWarningMinutes: 30,
  watchlistCurrencies: ['USD', 'EUR', 'GBP', 'JPY'],
  watchlistAssets: ['XAU/USD', 'BTC/USD', 'EUR/USD'],
  watchlistedEventIds: ['event-fomc-rate', 'event-nfp-sep26', 'event-cpi-sep26'],
  bookmarkedArticleIds: ['academy-fomc', 'academy-cpi', 'academy-nfp'],
  learnedArticleIds: [],
  userNotes: {
    'event-fomc-rate': 'Key focus is the revised dot plot and chair remarks regarding neutral rate estimate.',
    'event-nfp-sep26': 'Prior 2-month revisions have been driving gold more than the headline print itself.'
  }
};

export const NEWS_KNOWLEDGE_NODES: NewsKnowledgeNode[] = [
  {
    id: 'node-inflation',
    name: 'Inflation Pressures',
    category: 'Driver',
    description: 'Underlying cost-of-living and input price changes across raw materials, wages, and services.',
    upstreamIds: [],
    downstreamIds: ['node-cpi', 'node-pce'],
    relatedLessonId: 'academy-cpi',
    relatedNewsCode: 'CPI'
  },
  {
    id: 'node-labor',
    name: 'Labor Market Slack',
    category: 'Driver',
    description: 'Employment conditions, wage pressures, and worker availability influencing aggregate demand.',
    upstreamIds: [],
    downstreamIds: ['node-nfp', 'node-jobless'],
    relatedLessonId: 'academy-nfp',
    relatedNewsCode: 'NFP'
  },
  {
    id: 'node-cpi',
    name: 'CPI / Core CPI',
    category: 'Indicator',
    description: 'Measures consumer basket price changes; key input for short-term monetary policy expectations.',
    upstreamIds: ['node-inflation'],
    downstreamIds: ['node-fed'],
    relatedLessonId: 'academy-cpi',
    relatedNewsCode: 'CPI'
  },
  {
    id: 'node-pce',
    name: 'Core PCE Price Index',
    category: 'Indicator',
    description: 'The Federal Reserve official preferred inflation benchmark; chains substitution effects.',
    upstreamIds: ['node-inflation'],
    downstreamIds: ['node-fed'],
    relatedLessonId: 'academy-pce',
    relatedNewsCode: 'PCE'
  },
  {
    id: 'node-nfp',
    name: 'Non-Farm Payrolls (NFP)',
    category: 'Indicator',
    description: 'Net monthly job creation outside agricultural sectors; measures economic velocity.',
    upstreamIds: ['node-labor'],
    downstreamIds: ['node-fed'],
    relatedLessonId: 'academy-nfp',
    relatedNewsCode: 'NFP'
  },
  {
    id: 'node-jobless',
    name: 'Initial Jobless Claims',
    category: 'Indicator',
    description: 'Weekly frequency proxy for immediate lay-off trends and labor turnover velocity.',
    upstreamIds: ['node-labor'],
    downstreamIds: ['node-fed'],
    relatedNewsCode: 'CLAIMS'
  },
  {
    id: 'node-fed',
    name: 'Central Bank Policy (Fed / ECB / BoE / BoJ)',
    category: 'Policy',
    description: 'Monetary stance, policy rate targets, quantitative tightening/easing, and forward guidance.',
    upstreamIds: ['node-cpi', 'node-pce', 'node-nfp', 'node-jobless'],
    downstreamIds: ['node-yields'],
    relatedLessonId: 'academy-fomc',
    relatedNewsCode: 'FOMC'
  },
  {
    id: 'node-yields',
    name: 'Treasury & Sovereign Yields',
    category: 'Yield',
    description: 'Discount rate for all global capital assets; drives real returns on riskless assets.',
    upstreamIds: ['node-fed'],
    downstreamIds: ['node-usd', 'node-gold', 'node-equities'],
    relatedNewsCode: 'TREASURIES'
  },
  {
    id: 'node-usd',
    name: 'US Dollar (DXY & FX)',
    category: 'Currency',
    description: 'Global reserve currency; responds directly to interest-rate differentials and global risk appetite.',
    upstreamIds: ['node-yields'],
    downstreamIds: ['node-gold', 'node-crypto', 'node-equities']
  },
  {
    id: 'node-gold',
    name: 'Gold (XAU/USD)',
    category: 'Asset',
    description: 'Non-yielding store of value; sensitive to real interest rates, dollar fluctuations, and geopolitical tail risk.',
    upstreamIds: ['node-yields', 'node-usd'],
    downstreamIds: []
  },
  {
    id: 'node-crypto',
    name: 'Bitcoin (BTC/USD)',
    category: 'Asset',
    description: 'High-beta monetary liquidity proxy; sensitive to dollar liquidity conditions and risk appetite.',
    upstreamIds: ['node-usd'],
    downstreamIds: []
  },
  {
    id: 'node-equities',
    name: 'US Equities (S&P 500 / Nasdaq)',
    category: 'Asset',
    description: 'Corporate earnings discounted by risk-free rates; sensitive to economic growth vs cost of capital.',
    upstreamIds: ['node-yields', 'node-usd'],
    downstreamIds: []
  }
];

const BASE_NEWS_EVENTS: NewsEvent[] = [
  // 1. FOMC Rate Decision
  {
    id: 'event-fomc-rate',
    name: 'FOMC Interest Rate Decision & Summary of Economic Projections',
    code: 'FOMC',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Monetary Policy',
    impact: 'HIGH',
    dateTime: '2026-09-16T18:00:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'Federal Reserve Board of Governors',
    sourceUrl: 'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
    sourceTimestamp: '2026-09-16 14:00 EDT',
    unit: '%',
    previous: 5.25,
    forecast: 5.00,
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The Federal Reserve decides whether to increase, lower, or maintain the benchmark interest rate that banks charge each other for overnight loans.',
    whyItMatters: 'The federal funds rate is the baseline borrowing cost for the entire global economy. It directly sets interest rates on mortgages, corporate loans, government debt, and drives international currency capital flows.',
    whatItMeasures: 'The target policy range for the federal funds rate, determined by voting members of the Federal Open Market Committee.',
    whoReleasesIt: 'Federal Open Market Committee (FOMC) / Federal Reserve System.',
    frequency: 'Scheduled 8 times per year (approximately every 6 weeks), with revised quarterly economic projections (Dot Plot).',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'Higher yields attract foreign capital into dollar assets; rate cuts reduce carry advantages.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Gold pays no yield. When rates drop, the opportunity cost of holding non-yielding metal falls.' },
      { asset: 'Treasury Yields (2Y & 10Y)', sensitivity: 'Very High', rationale: 'Direct benchmark repricing of short-end rate curves.' },
      { asset: 'EUR/USD & GBP/USD', sensitivity: 'High', rationale: 'Reprices currency pair interest rate differentials and sovereign rate spreads.' },
      { asset: 'Bitcoin (BTC/USD)', sensitivity: 'Medium', rationale: 'Functions as a high-beta liquidity asset responding to macro monetary expansion or contraction.' },
      { asset: 'US Equities (S&P 500)', sensitivity: 'High', rationale: 'Affects company valuation discount rates and corporate debt refinancing costs.' }
    ],
    hawkishDovish: {
      stance: 'Mixed / Unclear',
      explanation: 'Expectations lean toward a 25 bps reduction, but commentary on the terminal neutral rate remains balanced.',
      rationale: 'Labor market cooling supports rate easing, while sticky services inflation prevents aggressive easing.'
    },
    transmission: {
      origin: 'FOMC Policy Rate',
      nodes: [
        { label: 'FOMC Rate Target', description: 'Sets benchmark target range' },
        { label: 'Short-End Yields (2Y/5Y)', description: 'Banks adjust funding curves' },
        { label: 'US Dollar Valuation', description: 'Capital rebalances across currency pairs' },
        { label: 'Equities, Gold & Crypto', description: 'Valuations discount future cash flows' }
      ],
      summary: 'FOMC Policy Target → Rate Expectations → 2Y/10Y Treasury Yields → US Dollar Index (DXY) → Commodity & Risk Asset Repricing'
    },
    historical: {
      sampleSize: 32,
      confidence: 'More Reliable Historical Observation',
      windows: {
        '5m': { avgAbsMove: 0.62, positivePercent: 52, negativePercent: 48, largestMove: 1.84, smallestMove: 0.12 },
        '15m': { avgAbsMove: 0.88, positivePercent: 50, negativePercent: 50, largestMove: 2.30, smallestMove: 0.18 },
        '30m': { avgAbsMove: 1.15, positivePercent: 53, negativePercent: 47, largestMove: 3.10, smallestMove: 0.24 },
        '1h': { avgAbsMove: 1.42, positivePercent: 51, negativePercent: 49, largestMove: 3.85, smallestMove: 0.35 },
        '4h': { avgAbsMove: 1.80, positivePercent: 49, negativePercent: 51, largestMove: 4.40, smallestMove: 0.45 },
        '1D': { avgAbsMove: 2.15, positivePercent: 48, negativePercent: 52, largestMove: 5.20, smallestMove: 0.55 }
      },
      recentReleases: [
        {
          date: '2026-07-29',
          actual: 5.25,
          forecast: 5.25,
          surprise: 0.0,
          assetReactions: {
            'XAU/USD': { pctMove: 0.85, direction: 'UP' },
            'EUR/USD': { pctMove: 0.42, direction: 'UP' },
            'USD/JPY': { pctMove: -0.68, direction: 'DOWN' },
            'BTC/USD': { pctMove: 1.40, direction: 'UP' }
          }
        },
        {
          date: '2026-06-17',
          actual: 5.25,
          forecast: 5.25,
          surprise: 0.0,
          assetReactions: {
            'XAU/USD': { pctMove: -0.92, direction: 'DOWN' },
            'EUR/USD': { pctMove: -0.55, direction: 'DOWN' },
            'USD/JPY': { pctMove: 0.74, direction: 'UP' },
            'BTC/USD': { pctMove: -1.80, direction: 'DOWN' }
          }
        },
        {
          date: '2026-05-06',
          actual: 5.25,
          forecast: 5.25,
          surprise: 0.0,
          assetReactions: {
            'XAU/USD': { pctMove: 1.10, direction: 'UP' },
            'EUR/USD': { pctMove: 0.38, direction: 'UP' },
            'USD/JPY': { pctMove: -0.45, direction: 'DOWN' },
            'BTC/USD': { pctMove: 2.15, direction: 'UP' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Hawkish Outcome (Hold or Signals Extended Pause)',
        condition: 'Rates kept unchanged or guidance emphasizes inflation persistence, delaying further cuts.',
        transmission: ['Policy rate remains elevated', 'Short-term yields rise', 'USD potentially supportive', 'Gold & Equities may face headwinds'],
        marketTendency: 'Historically associated with USD strength and downward pressure on Gold and long-duration equities.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Real market reaction depends on market positioning, liquidity, and press conference tone.'
      },
      dovish: {
        title: 'Dovish Outcome (25-50 bps Cut with Accommodative Tone)',
        condition: 'Committee cuts by 25 bps or more and indicates ongoing easing into year-end.',
        transmission: ['Borrowing costs decline', 'Treasury yields drop across curve', 'USD carry advantage narrows', 'Gold & Risk assets potentially supported'],
        marketTendency: 'Historically observed to soften USD and support non-yielding assets like Gold and high-beta assets like BTC.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Price action frequently whipsaws if the cut was already fully priced in.'
      },
      inLine: {
        title: 'In-Line with Consensus (Expected 25 bps Cut with Balanced Guidance)',
        condition: 'Cuts 25 bps as priced, data-dependent future approach affirmed.',
        transmission: ['Initial headline spike quickly fades', 'Focus shifts completely to Press Conference statement at 18:30 GMT', 'Spreads temporarily widen'],
        marketTendency: 'Often results in two-sided chop until the press conference clarifies future rate trajectory.',
        disclaimer: 'Execution during press conferences carries heightened spread expansion and slippage risks.'
      },
      mixed: {
        title: 'Mixed Signals (Rate Cut accompanied by Hawkish Dot Plot)',
        condition: 'Rate is cut, but revised member projections indicate fewer subsequent cuts in 2027.',
        transmission: ['Conflicting signals across timeframes', 'Yield curve flattens or inverts', 'High volatility across FX majors'],
        marketTendency: 'Can trigger rapid reversal of initial reaction once projections are digested.',
        disclaimer: 'Mixed releases often produce the highest rate of stop-outs and false breakouts.'
      }
    },
    academyTopicId: 'academy-fomc'
  },

  // 2. US Non-Farm Payrolls (NFP)
  {
    id: 'event-nfp-sep26',
    name: 'US Non-Farm Payrolls & Unemployment Rate',
    code: 'NFP',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Employment',
    impact: 'HIGH',
    dateTime: '2026-09-04T12:30:00Z',
    period: 'Aug 2026',
    status: 'Released',
    source: 'U.S. Bureau of Labor Statistics (BLS)',
    sourceUrl: 'https://www.bls.gov/news.release/empsit.nr0.htm',
    sourceTimestamp: '2026-09-04 08:30 EDT',
    unit: 'K',
    previous: 114,
    revisedPrevious: 97,
    forecast: 160,
    actual: 142,
    surprise: -18,
    surpriseFormatted: '-18K',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Calculates the number of paid workers added or lost across the US economy during the prior month, excluding farm workers and private household employees.',
    whyItMatters: 'Job growth is the primary driver of household income and consumer spending (which represents ~70% of US GDP). The Federal Reserve holds a dual mandate: maximum sustainable employment and price stability.',
    whatItMeasures: 'Net change in employment derived from the BLS establishment survey of over 670,000 individual worksites.',
    whoReleasesIt: 'U.S. Bureau of Labor Statistics (BLS).',
    frequency: 'Monthly, usually on the first Friday of the month at 08:30 ET / 12:30 GMT.',
    headlineResult: 'US Economy Added 142,000 Jobs in August; Prior Months Revised Downward by 86,000 Combined',
    mainChange: 'August job gains (142K) missed consensus forecast (160K), while July was revised from 114K to 89K and June from 179K to 118K.',
    importantComponents: [
      'Unemployment Rate ticked down from 4.3% to 4.2% in line with estimates',
      'Average Hourly Earnings rose +0.4% MoM (above +0.3% expected) and +3.8% YoY',
      'Construction added +34,000 jobs; Healthcare added +31,000; Manufacturing lost -24,000 jobs',
      'Labor Force Participation Rate held steady at 62.7%'
    ],
    revisions: 'Net two-month downward revision of -86,000 (July -25K, June -61K), indicating continued trend softening in labor momentum.',
    importantDetails: 'While the headline payroll growth missed expectations, the decline in the unemployment rate and solid wage growth mitigated immediate recession alarms.',
    officialCommentary: [
      {
        speaker: 'Erika McEntarfer',
        title: 'Commissioner of Labor Statistics',
        quote: 'Job gains occurred in construction and health care, while employment in manufacturing declined.',
        source: 'BLS Employment Situation Press Release',
        timestamp: '2026-09-04 08:30 EDT',
        simplifiedExplanation: 'Job growth is concentrated in a few resilient sectors rather than broadly across manufacturing.',
        marketInterpretation: 'Signals sector divergence: services and healthcare remain resilient while goods manufacturing contracts.'
      }
    ],
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'Subdued job creation strengthens the case for Fed rate easing, dampening USD demand.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Gold rallied initially by +$16/oz on lower yield expectations before consolidating.' },
      { asset: 'EUR/USD', sensitivity: 'High', rationale: 'Traded in an 85-pip range following the release.' },
      { asset: 'USD/JPY', sensitivity: 'Very High', rationale: 'Dropped sharply as US-Japan yield differentials narrowed.' },
      { asset: 'S&P 500 / US Equities', sensitivity: 'High', rationale: 'Mixed reaction: lower rates are positive, but economic slowing dampens earnings outlook.' }
    ],
    hawkishDovish: {
      stance: 'Dovish',
      explanation: 'Labor cooling combined with downward revisions solidifies market pricing for rate reductions.',
      rationale: 'The Fed shifted its primary focus from inflation alone to preserving maximum employment under its dual mandate.'
    },
    transmission: {
      origin: 'BLS Payrolls & Unemployment',
      nodes: [
        { label: 'Establishment Payrolls', description: 'Net jobs created (+142K vs 160K exp)' },
        { label: 'Fed Policy Expectations', description: 'Odds of 50 bps vs 25 bps rate cut repriced' },
        { label: 'Treasury Yield Curve', description: '2Y Yield dropped 8 bps to 3.65%' },
        { label: 'Gold & FX Valuation', description: 'Gold bid, USD/JPY pressured' }
      ],
      summary: 'Payroll Miss & Revisions → Fed Easing Odds Increase → 2Y Yields Fall → USD Weakens → Gold Supported'
    },
    historical: {
      sampleSize: 48,
      confidence: 'More Reliable Historical Observation',
      windows: {
        '5m': { avgAbsMove: 0.74, positivePercent: 48, negativePercent: 52, largestMove: 2.10, smallestMove: 0.15 },
        '15m': { avgAbsMove: 0.96, positivePercent: 49, negativePercent: 51, largestMove: 2.75, smallestMove: 0.22 },
        '30m': { avgAbsMove: 1.22, positivePercent: 51, negativePercent: 49, largestMove: 3.40, smallestMove: 0.30 },
        '1h': { avgAbsMove: 1.48, positivePercent: 50, negativePercent: 50, largestMove: 4.10, smallestMove: 0.40 },
        '4h': { avgAbsMove: 1.85, positivePercent: 52, negativePercent: 48, largestMove: 4.80, smallestMove: 0.50 },
        '1D': { avgAbsMove: 2.30, positivePercent: 50, negativePercent: 50, largestMove: 5.60, smallestMove: 0.65 }
      },
      recentReleases: [
        {
          date: '2026-09-04',
          actual: 142,
          forecast: 160,
          surprise: -18,
          assetReactions: {
            'XAU/USD': { pctMove: 0.78, direction: 'UP' },
            'EUR/USD': { pctMove: 0.35, direction: 'UP' },
            'USD/JPY': { pctMove: -0.92, direction: 'DOWN' },
            'BTC/USD': { pctMove: -1.20, direction: 'DOWN' }
          }
        },
        {
          date: '2026-08-02',
          actual: 114,
          forecast: 175,
          surprise: -61,
          assetReactions: {
            'XAU/USD': { pctMove: 1.65, direction: 'UP' },
            'EUR/USD': { pctMove: 1.12, direction: 'UP' },
            'USD/JPY': { pctMove: -1.85, direction: 'DOWN' },
            'BTC/USD': { pctMove: -3.40, direction: 'DOWN' }
          }
        },
        {
          date: '2026-07-05',
          actual: 206,
          forecast: 190,
          surprise: 16,
          assetReactions: {
            'XAU/USD': { pctMove: -0.85, direction: 'DOWN' },
            'EUR/USD': { pctMove: -0.42, direction: 'DOWN' },
            'USD/JPY': { pctMove: 0.55, direction: 'UP' },
            'BTC/USD': { pctMove: 0.90, direction: 'UP' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Strong Beat Scenario (e.g. >200K Jobs & Rising Wages)',
        condition: 'Payrolls significantly surpass consensus with upward revisions to prior months.',
        transmission: ['Labor tightness reassessed', 'Fed rate cuts priced out or delayed', 'Treasury yields rebound', 'USD potentially strengthens'],
        marketTendency: 'Historically associated with USD appreciation, pressure on Gold, and bond sell-offs.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Watch average hourly earnings; wage deflation can nullify a payroll beat.'
      },
      dovish: {
        title: 'Soft / Weak Scenario (e.g. <120K Jobs & Rising Unemployment)',
        condition: 'Job additions come in below expectations with negative prior revisions and rising unemployment.',
        transmission: ['Growth concerns escalate', 'Aggressive Fed easing priced in', 'Yields fall rapidly', 'USD faces selling pressure'],
        marketTendency: 'Historically observed to boost Gold and weaken USD, though equity reaction depends on recession severity.',
        disclaimer: 'Severe economic weakness can prompt broad de-risking where even Gold experiences liquidity-driven margin liquidation.'
      },
      inLine: {
        title: 'In-Line Consensus Scenario (140K–170K Range)',
        condition: 'Headline figures match expectations without jarring surprises in wages or unemployment.',
        transmission: ['Existing macro trend maintained', 'Initial volatility spike subsides within 30 minutes', 'Spreads normalize'],
        marketTendency: 'Typically produces two-sided moves with price reverting toward pre-announcement ranges.',
        disclaimer: 'Low headline deviation shifts all focus to wage growth and labor participation revisions.'
      },
      mixed: {
        title: 'Divergent Headline vs Unemployment / Wages',
        condition: 'Headline payrolls beat, but unemployment ticks up or wages fall below forecasts.',
        transmission: ['Establishment vs Household survey divergence', 'Whipsaw candles across 5m and 15m charts', 'Unclear directional bias'],
        marketTendency: 'Often results in severe whipsaw price action in the first 15 minutes before the bond market determines direction.',
        disclaimer: 'Traders attempting to trade the first 60 seconds of mixed data face heightened execution slippage and spread expansion.'
      }
    },
    academyTopicId: 'academy-nfp'
  },

  // 3. US Consumer Price Index (CPI)
  {
    id: 'event-cpi-sep26',
    name: 'US Consumer Price Index (CPI & Core CPI YoY)',
    code: 'CPI',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Inflation',
    impact: 'HIGH',
    dateTime: '2026-09-11T12:30:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'U.S. Bureau of Labor Statistics (BLS)',
    sourceUrl: 'https://www.bls.gov/cpi/',
    sourceTimestamp: '2026-09-11 08:30 EDT',
    unit: '%',
    previous: 2.9,
    forecast: 2.6,
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Measures the average change over time in prices paid by urban consumers for a market basket of consumer goods and services.',
    whyItMatters: 'CPI is the most widely quoted inflation barometer. High inflation erodes purchasing power and forces the central bank to keep interest rates restrictive.',
    whatItMeasures: 'Price index covering food, energy, shelter, used vehicles, medical care, and transportation services across US metropolitan areas.',
    whoReleasesIt: 'U.S. Bureau of Labor Statistics (BLS).',
    frequency: 'Monthly, typically around the second week of each month.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'Sticky inflation keeps interest rate expectations high, historically supportive of USD.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Inverse relationship with real interest rates (nominal yields minus inflation expectations).' },
      { asset: 'Treasury Yields (10Y)', sensitivity: 'Very High', rationale: 'Reprices term premium and Fed terminal rate expectations.' },
      { asset: 'EUR/USD', sensitivity: 'High', rationale: 'Drives cross-Atlantic rate differentials.' },
      { asset: 'Bitcoin (BTC/USD)', sensitivity: 'High', rationale: 'Traded both as a monetary hedge and as a high-duration risk asset.' }
    ],
    hawkishDovish: {
      stance: 'Mixed / Unclear',
      explanation: 'Consensus anticipates headline CPI easing to 2.6% YoY, while Core CPI (excluding food & energy) is forecast at 3.2% YoY.',
      rationale: 'Goods deflation is mature; shelter and services inflation remain the primary determinants of monetary stance.'
    },
    transmission: {
      origin: 'BLS Consumer Price Index',
      nodes: [
        { label: 'Headline & Core Print', description: 'Core CPI gauges persistent trend' },
        { label: 'Real Yields (TIPS)', description: 'Nominal yield minus breakeven inflation' },
        { label: 'Fed Policy Trajectory', description: 'Pacing and terminal depth of cuts' },
        { label: 'Gold & Currency Repricing', description: 'Asset discount rates adjust' }
      ],
      summary: 'CPI Surprise → Real Yield Expectations → Federal Reserve Reaction Function → USD & Precious Metals Repricing'
    },
    historical: {
      sampleSize: 36,
      confidence: 'More Reliable Historical Observation',
      windows: {
        '5m': { avgAbsMove: 0.82, positivePercent: 53, negativePercent: 47, largestMove: 2.45, smallestMove: 0.16 },
        '15m': { avgAbsMove: 1.05, positivePercent: 51, negativePercent: 49, largestMove: 3.10, smallestMove: 0.24 },
        '30m': { avgAbsMove: 1.35, positivePercent: 50, negativePercent: 50, largestMove: 3.80, smallestMove: 0.32 },
        '1h': { avgAbsMove: 1.62, positivePercent: 49, negativePercent: 51, largestMove: 4.40, smallestMove: 0.45 },
        '4h': { avgAbsMove: 1.98, positivePercent: 52, negativePercent: 48, largestMove: 5.10, smallestMove: 0.58 },
        '1D': { avgAbsMove: 2.40, positivePercent: 50, negativePercent: 50, largestMove: 6.20, smallestMove: 0.70 }
      },
      recentReleases: [
        {
          date: '2026-08-14',
          actual: 2.9,
          forecast: 3.0,
          surprise: -0.1,
          assetReactions: {
            'XAU/USD': { pctMove: 0.65, direction: 'UP' },
            'EUR/USD': { pctMove: 0.32, direction: 'UP' },
            'USD/JPY': { pctMove: -0.58, direction: 'DOWN' },
            'BTC/USD': { pctMove: 1.45, direction: 'UP' }
          }
        },
        {
          date: '2026-07-11',
          actual: 3.0,
          forecast: 3.1,
          surprise: -0.1,
          assetReactions: {
            'XAU/USD': { pctMove: 1.85, direction: 'UP' },
            'EUR/USD': { pctMove: 0.78, direction: 'UP' },
            'USD/JPY': { pctMove: -1.40, direction: 'DOWN' },
            'BTC/USD': { pctMove: 2.30, direction: 'UP' }
          }
        },
        {
          date: '2026-06-12',
          actual: 3.3,
          forecast: 3.4,
          surprise: -0.1,
          assetReactions: {
            'XAU/USD': { pctMove: 1.20, direction: 'UP' },
            'EUR/USD': { pctMove: 0.60, direction: 'UP' },
            'USD/JPY': { pctMove: -0.85, direction: 'DOWN' },
            'BTC/USD': { pctMove: 1.90, direction: 'UP' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Hotter than Expected (e.g. Core CPI >= 3.4% YoY)',
        condition: 'Core inflation rebounds due to shelter resilience or transport services spikes.',
        transmission: ['Inflation stickiness confirmed', 'Rate cut expectations trimmed', 'Real yields jump', 'USD strengthens, Gold drops'],
        marketTendency: 'Historically associated with USD surges and broad pressure on precious metals and growth equities.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Markets may absorb a slight headline beat if energy was the sole driver.'
      },
      dovish: {
        title: 'Cooler than Expected (e.g. Core CPI <= 3.0% YoY)',
        condition: 'Both headline and core inflation decline faster than forecasted.',
        transmission: ['Disinflation trajectory validated', 'Fed greenlit for deeper cuts', 'Treasury yields slide', 'Risk appetite broadens'],
        marketTendency: 'Historically observed to weigh on the US Dollar and provide strong upward tailwinds to Gold, EUR/USD, and BTC.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Reversals can occur if cool CPI stirs acute economic slowdown fears.'
      },
      inLine: {
        title: 'In-Line Consensus (Headline ~2.6%, Core ~3.2%)',
        condition: 'Actual prints match consensus down to the decimal point.',
        transmission: ['Market pricing unperturbed', 'Immediate reaction muted', 'Focus shifts to upcoming FOMC meeting'],
        marketTendency: 'Typically results in brief chop before the market resumes its prevailing technical trend.',
        disclaimer: 'Look at unrounded 2-decimal BLS data; subtle hundredths of a percent often explain price action.'
      },
      mixed: {
        title: 'Headline Cools while Core Stagnates',
        condition: 'Headline drops due to gasoline declines, but core services remain sticky.',
        transmission: ['Bond market parses sticky core components', 'Initial USD selloff may retrace', 'Choppy intraday price discovery'],
        marketTendency: 'Can generate a false initial breakout followed by a violent reversal once core data is digested.',
        disclaimer: 'The Federal Reserve places far greater weight on Core CPI and Core PCE than volatile headline energy swings.'
      }
    },
    academyTopicId: 'academy-cpi'
  },

  // 4. ECB Interest Rate Decision
  {
    id: 'event-ecb-rate',
    name: 'European Central Bank (ECB) Main Refinancing Rate & Deposit Facility Rate',
    code: 'ECB',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    category: 'Monetary Policy',
    impact: 'HIGH',
    dateTime: '2026-09-10T12:15:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'European Central Bank (ECB) Governing Council',
    sourceUrl: 'https://www.ecb.europa.eu/press/govcdec/mopo/html/index.en.html',
    sourceTimestamp: '2026-09-10 14:15 CEST',
    unit: '%',
    previous: 3.75,
    forecast: 3.50,
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The ECB Governing Council sets the interest rates on the deposit facility, main refinancing operations, and marginal lending facility for the 20 Eurozone member states.',
    whyItMatters: 'Governs financial conditions and bank credit across Europe. Directly impacts the valuation of the Euro (EUR/USD, EUR/GBP, EUR/JPY) and European sovereign bond yields (Bunds, BTPs).',
    whatItMeasures: 'The key ECB policy interest rate benchmarks.',
    whoReleasesIt: 'ECB Governing Council in Frankfurt, Germany.',
    frequency: 'Eight policy meetings per year.',
    affectedMarkets: [
      { asset: 'EUR/USD', sensitivity: 'Very High', rationale: 'Represents the most actively traded currency pair in the world; reacts directly to policy stance differences with the Fed.' },
      { asset: 'German 10Y Bund Yield', sensitivity: 'Very High', rationale: 'The European risk-free benchmark bond yield.' },
      { asset: 'EUR/GBP & EUR/JPY', sensitivity: 'High', rationale: 'Direct cross-currency monetary divergence plays.' },
      { asset: 'Gold (in EUR & USD)', sensitivity: 'Medium', rationale: 'Global liquidity conditions and reserve asset dynamics.' }
    ],
    hawkishDovish: {
      stance: 'Neutral',
      explanation: 'ECB is widely expected to enact a 25 bps reduction in the deposit facility rate to 3.50%, adhering to a meeting-by-meeting data-dependent stance.',
      rationale: 'Eurozone growth remains sluggish (notably in German industry), while domestic wage-driven services inflation continues to normalize gradually.'
    },
    transmission: {
      origin: 'ECB Deposit Facility Rate',
      nodes: [
        { label: 'ECB Policy Decision (12:15 GMT)', description: 'Initial rate announcement' },
        { label: 'Lagarde Press Conference (12:45 GMT)', description: 'Forward guidance and economic projections' },
        { label: 'Euribor & Bund Yields', description: 'European debt yields reprice' },
        { label: 'EUR/USD Cross Rate', description: 'Currency exchange valuation shifts' }
      ],
      summary: 'ECB Policy Target → Press Conference Guidance → Bund / BTP Yield Spreads → EUR/USD Currency Valuation'
    },
    historical: {
      sampleSize: 28,
      confidence: 'Preliminary Evidence',
      windows: {
        '5m': { avgAbsMove: 0.38, positivePercent: 50, negativePercent: 50, largestMove: 1.25, smallestMove: 0.10 },
        '15m': { avgAbsMove: 0.52, positivePercent: 48, negativePercent: 52, largestMove: 1.60, smallestMove: 0.14 },
        '30m': { avgAbsMove: 0.75, positivePercent: 51, negativePercent: 49, largestMove: 2.10, smallestMove: 0.20 },
        '1h': { avgAbsMove: 0.98, positivePercent: 49, negativePercent: 51, largestMove: 2.65, smallestMove: 0.28 },
        '4h': { avgAbsMove: 1.25, positivePercent: 50, negativePercent: 50, largestMove: 3.20, smallestMove: 0.35 },
        '1D': { avgAbsMove: 1.55, positivePercent: 52, negativePercent: 48, largestMove: 3.90, smallestMove: 0.42 }
      },
      recentReleases: [
        {
          date: '2026-07-18',
          actual: 3.75,
          forecast: 3.75,
          surprise: 0.0,
          assetReactions: {
            'EUR/USD': { pctMove: -0.25, direction: 'DOWN' },
            'EUR/GBP': { pctMove: -0.15, direction: 'DOWN' },
            'EUR/JPY': { pctMove: 0.30, direction: 'UP' }
          }
        },
        {
          date: '2026-06-06',
          actual: 3.75,
          forecast: 3.75,
          surprise: 0.0,
          assetReactions: {
            'EUR/USD': { pctMove: 0.45, direction: 'UP' },
            'EUR/GBP': { pctMove: 0.28, direction: 'UP' },
            'EUR/JPY': { pctMove: 0.62, direction: 'UP' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Hawkish Hold or Hesitant Easing',
        condition: 'ECB pauses rate cuts or signals that domestic wage pressures make subsequent cuts improbable.',
        transmission: ['European yields tick higher', 'Yield spread with US Treasuries narrows', 'EUR/USD gains support'],
        marketTendency: 'Historically associated with short-term EUR strength and pressure on European equity indices (DAX, Euro Stoxx).',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Broader USD sentiment can overshadow domestic ECB developments.'
      },
      dovish: {
        title: 'Dovish 25-50 bps Cut & Downward Growth Revision',
        condition: 'ECB cuts rates and lowers 2026/2027 GDP projections, indicating persistent disinflation.',
        transmission: ['Bund yields decline', 'Interest rate carry advantage diminishes', 'EUR/USD faces downward momentum'],
        marketTendency: 'Historically observed to soften EUR against USD and GBP, while offering relief to European corporate bonds.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Real market reaction depends on market positioning, liquidity, and simultaneous news.'
      },
      inLine: {
        title: 'Expected 25 bps Cut with Open Guidance',
        condition: 'ECB implements 25 bps cut and emphasizes dependency on incoming data.',
        transmission: ['Initial muted move at 12:15 GMT', 'Volatile price discovery during President Lagarde press conference at 12:45 GMT'],
        marketTendency: 'Frequently produces a two-step reaction: small spread widening at 12:15 GMT, followed by the true trend at 12:45 GMT.',
        disclaimer: 'Beware trading the release window before the press conference Q&A concludes.'
      },
      mixed: {
        title: 'Rate Cut with Upward Inflation Projection',
        condition: 'Rates are trimmed, but staff projections increase the 2026 inflation expectation.',
        transmission: ['Market questions future easing room', 'Whipsaw in EUR/USD and Bund futures'],
        marketTendency: 'Typically creates an initial EUR drop followed by a sharp recovery as traders price in an earlier end to rate cuts.',
        disclaimer: 'Mixed scenarios carry elevated whipsaw risk for breakout strategies.'
      }
    },
    academyTopicId: 'academy-ecb'
  },

  // 5. UK Gross Domestic Product (GDP)
  {
    id: 'event-uk-gdp-sep26',
    name: 'UK Monthly Gross Domestic Product (GDP MoM & 3M/3M)',
    code: 'UK-GDP',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    category: 'Growth',
    impact: 'HIGH',
    dateTime: '2026-09-11T06:00:00Z',
    period: 'Jul 2026',
    status: 'Upcoming',
    source: 'UK Office for National Statistics (ONS)',
    sourceUrl: 'https://www.ons.gov.uk/economy/grossdomesticproductgdp',
    sourceTimestamp: '2026-09-11 07:00 BST',
    unit: '%',
    previous: 0.0,
    forecast: 0.2,
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Calculates the change in the total monetary value of all goods and services produced within the United Kingdom over the previous month.',
    whyItMatters: 'GDP is the broadest barometer of UK economic health. Solid growth enables the Bank of England (BoE) to maintain restrictive rates, whereas negative growth triggers stagflation or recession alarms.',
    whatItMeasures: 'Aggregate economic output across services, production (manufacturing, mining, energy), and construction sectors.',
    whoReleasesIt: 'Office for National Statistics (ONS), London.',
    frequency: 'Monthly and quarterly.',
    affectedMarkets: [
      { asset: 'GBP/USD', sensitivity: 'High', rationale: 'Direct gauge of sterling economic vitality against the dollar.' },
      { asset: 'EUR/GBP', sensitivity: 'High', rationale: 'Cross-channel growth differential.' },
      { asset: 'UK Gilt Yields (10Y)', sensitivity: 'Medium', rationale: 'Reprices BoE monetary easing schedule.' },
      { asset: 'FTSE 100', sensitivity: 'Medium', rationale: 'FTSE 250 is domestically exposed; FTSE 100 is largely multinational exporters.' }
    ],
    hawkishDovish: {
      stance: 'Neutral',
      explanation: 'Consensus looks for a modest rebound (+0.2% MoM) following flat output in June.',
      rationale: 'Services sector activity showed summer stabilization, but construction and industrial production face headwinds.'
    },
    transmission: {
      origin: 'ONS GDP Release',
      nodes: [
        { label: 'Monthly GDP Output', description: 'Services, manufacturing, and construction' },
        { label: 'Bank of England Policy Odds', description: 'Probability of Autumn BoE rate cut' },
        { label: 'UK Gilt Yields', description: 'Borrowing cost curves adjust' },
        { label: 'Sterling Exchange Rate', description: 'GBP/USD and EUR/GBP rebalance' }
      ],
      summary: 'UK GDP Output → BoE Rate Path Pricing → UK Gilt Yields → Sterling Exchange Rates'
    },
    historical: {
      sampleSize: 24,
      confidence: 'Preliminary Evidence',
      windows: {
        '5m': { avgAbsMove: 0.28, positivePercent: 52, negativePercent: 48, largestMove: 0.95, smallestMove: 0.08 },
        '15m': { avgAbsMove: 0.42, positivePercent: 50, negativePercent: 50, largestMove: 1.30, smallestMove: 0.12 },
        '30m': { avgAbsMove: 0.58, positivePercent: 51, negativePercent: 49, largestMove: 1.70, smallestMove: 0.18 },
        '1h': { avgAbsMove: 0.74, positivePercent: 49, negativePercent: 51, largestMove: 2.15, smallestMove: 0.22 },
        '4h': { avgAbsMove: 0.95, positivePercent: 50, negativePercent: 50, largestMove: 2.60, smallestMove: 0.30 },
        '1D': { avgAbsMove: 1.25, positivePercent: 51, negativePercent: 49, largestMove: 3.20, smallestMove: 0.38 }
      },
      recentReleases: [
        {
          date: '2026-08-15',
          actual: 0.0,
          forecast: 0.1,
          surprise: -0.1,
          assetReactions: {
            'GBP/USD': { pctMove: -0.32, direction: 'DOWN' },
            'EUR/GBP': { pctMove: 0.22, direction: 'UP' }
          }
        },
        {
          date: '2026-07-11',
          actual: 0.4,
          forecast: 0.2,
          surprise: 0.2,
          assetReactions: {
            'GBP/USD': { pctMove: 0.55, direction: 'UP' },
            'EUR/GBP': { pctMove: -0.40, direction: 'DOWN' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Strong Beat (+0.4% or Higher)',
        condition: 'Resilient consumer spending and services expansion fuel solid GDP growth.',
        transmission: ['BoE rate cuts pushed out', 'UK Gilts sell off (yields rise)', 'GBP/USD supported'],
        marketTendency: 'Historically associated with positive Sterling momentum against European and American currencies.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      dovish: {
        title: 'Contraction / Negative Surprise (< -0.1%)',
        condition: 'Manufacturing contractions and high mortgage servicing costs suppress economic activity.',
        transmission: ['Recession concerns surface', 'BoE fast-tracks rate cuts', 'Sterling pressured'],
        marketTendency: 'Historically observed to exert downward pressure on GBP/USD and push EUR/GBP higher.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      inLine: {
        title: 'In-Line Print (+0.2% MoM)',
        condition: 'Growth matches projections without surprising sector divergence.',
        transmission: ['Macro baseline confirmed', 'GBP trades along existing technical ranges'],
        marketTendency: 'Typically produces mild fluctuations that quickly give way to broader London session FX flows.',
        disclaimer: 'Examine revisions to previous months, which frequently alter the net headline impact.'
      },
      mixed: {
        title: 'Positive Monthly GDP with Downward Prior Revisions',
        condition: 'July shows growth, but June and May are revised lower.',
        transmission: ['Underlying trend remains flat', 'Initial GBP pop gets sold into'],
        marketTendency: 'Often results in an initial spike followed by fading as institutional desks evaluate cumulative quarterly momentum.',
        disclaimer: 'Revisions can completely offset headline surprises.'
      }
    },
    academyTopicId: 'academy-gdp'
  },

  // 6. US Retail Sales
  {
    id: 'event-us-retail-sales',
    name: 'US Retail Sales (MoM & Core Retail Sales)',
    code: 'RETAIL',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Consumer',
    impact: 'HIGH',
    dateTime: '2026-09-15T12:30:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'U.S. Census Bureau',
    sourceUrl: 'https://www.census.gov/retail/index.html',
    sourceTimestamp: '2026-09-15 08:30 EDT',
    unit: '%',
    previous: 1.0,
    forecast: 0.2,
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Tracks the total dollar receipts of retail stores across the United States, providing the earliest monthly read on consumer goods spending.',
    whyItMatters: 'Consumer spending drives nearly two-thirds of the American economy. Strong retail sales signal that households are still spending despite high interest rates.',
    whatItMeasures: 'Sales at retail and food services establishments, categorized into durable and non-durable goods (excluding services like healthcare and travel).',
    whoReleasesIt: 'U.S. Census Bureau.',
    frequency: 'Monthly, around the middle of each month.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'High', rationale: 'Indicates consumer resilience and economic growth momentum.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'High', rationale: 'Strong consumer demand delays rate cuts, which can weigh on non-yielding metals.' },
      { asset: 'US Equities (S&P 500)', sensitivity: 'High', rationale: 'Reflects top-line revenue health for consumer discretionary and retail giants.' }
    ],
    hawkishDovish: {
      stance: 'Neutral',
      explanation: 'Forecast anticipates a normalization to +0.2% MoM after a strong +1.0% jump in July.',
      rationale: 'Household debt loads and depleted excess savings are expected to temper discretionary shopping velocity.'
    },
    transmission: {
      origin: 'Census Bureau Retail Sales',
      nodes: [
        { label: 'Retail Receipts', description: 'Consumer goods purchases' },
        { label: 'US GDP Tracking Models', description: 'Atlanta Fed GDPNow adjusts' },
        { label: 'Fed Policy Horizon', description: 'Assesses whether economy is overheating or cooling' },
        { label: 'USD & Equities Reaction', description: 'Growth vs inflation debate' }
      ],
      summary: 'Retail Spending → Economic Growth Tracking → Fed Policy Stance → Equities & Dollar Valuation'
    },
    historical: {
      sampleSize: 30,
      confidence: 'More Reliable Historical Observation',
      windows: {
        '5m': { avgAbsMove: 0.45, positivePercent: 51, negativePercent: 49, largestMove: 1.40, smallestMove: 0.12 },
        '15m': { avgAbsMove: 0.62, positivePercent: 49, negativePercent: 51, largestMove: 1.85, smallestMove: 0.18 },
        '30m': { avgAbsMove: 0.82, positivePercent: 50, negativePercent: 50, largestMove: 2.30, smallestMove: 0.24 },
        '1h': { avgAbsMove: 1.05, positivePercent: 52, negativePercent: 48, largestMove: 2.80, smallestMove: 0.32 },
        '4h': { avgAbsMove: 1.35, positivePercent: 51, negativePercent: 49, largestMove: 3.40, smallestMove: 0.40 },
        '1D': { avgAbsMove: 1.70, positivePercent: 50, negativePercent: 50, largestMove: 4.10, smallestMove: 0.50 }
      },
      recentReleases: [
        {
          date: '2026-08-15',
          actual: 1.0,
          forecast: 0.3,
          surprise: 0.7,
          assetReactions: {
            'XAU/USD': { pctMove: -0.65, direction: 'DOWN' },
            'EUR/USD': { pctMove: -0.42, direction: 'DOWN' },
            'USD/JPY': { pctMove: 0.88, direction: 'UP' }
          }
        },
        {
          date: '2026-07-16',
          actual: 0.0,
          forecast: 0.0,
          surprise: 0.0,
          assetReactions: {
            'XAU/USD': { pctMove: 0.25, direction: 'UP' },
            'EUR/USD': { pctMove: 0.12, direction: 'UP' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Resilient Consumer Beat (> +0.6% MoM)',
        condition: 'Broad-based spending acceleration across electronics, clothing, and dining.',
        transmission: ['Growth recession fears quelled', 'Fed rate cuts priced out', 'USD strengthens, Gold softens'],
        marketTendency: 'Historically associated with USD firmness and upward pressure on US Treasury yields.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      dovish: {
        title: 'Consumer Retrenchment (< -0.2% MoM)',
        condition: 'Discretionary retail spending falls into outright contraction.',
        transmission: ['Growth worries escalate', 'Fed urged to protect soft landing', 'Treasury yields fall, Gold supported'],
        marketTendency: 'Historically observed to soften USD and support safe-haven assets.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      inLine: {
        title: 'Moderate In-Line Print (~ +0.2%)',
        condition: 'Spending tracks mild, orderly cooling.',
        transmission: ['Soft-landing narrative intact', 'Minimal lasting volatility'],
        marketTendency: 'Typically produces brief noise without disrupting dominant multi-day market trends.',
        disclaimer: 'Check Core Retail Sales (excluding auto and gas) to filter out gasoline price swings.'
      },
      mixed: {
        title: 'Headline Beat Driven Solely by Auto/Gas',
        condition: 'Overall sales beat, but Control Group (which feeds GDP) contracts.',
        transmission: ['Superficial headline beat fades', 'Smart money trades the softer Control Group'],
        marketTendency: 'Initial dollar rally frequently reverses within 20 minutes as institutional algorithmic models parse the core control group.',
        disclaimer: 'The Retail Sales Control Group is the critical metric for GDP calculation.'
      }
    },
    academyTopicId: 'academy-retail'
  },

  // 7. Bank of Japan (BoJ) Rate Decision
  {
    id: 'event-boj-rate',
    name: 'Bank of Japan (BoJ) Policy Rate & Outlook Report',
    code: 'BOJ',
    country: 'Japan',
    countryCode: 'JP',
    currency: 'JPY',
    category: 'Central Bank',
    impact: 'HIGH',
    dateTime: '2026-09-20T03:00:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'Bank of Japan Policy Board',
    sourceUrl: 'https://www.boj.or.jp/en/mopo/mpmsche_minu/index.htm',
    sourceTimestamp: '2026-09-20 ~12:00 JST (No fixed time)',
    unit: '%',
    previous: 0.25,
    forecast: 0.25,
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The Bank of Japan decides whether to raise its short-term policy interest rate benchmark, alter government bond purchases, or adjust forward guidance.',
    whyItMatters: 'Japan is the world’s largest creditor nation. When the BoJ raises rates or signals hawkish tightening, it triggers the unwinding of multi-trillion dollar global "Yen Carry Trades" (borrowing in cheap yen to invest in global stocks, crypto, and emerging markets).',
    whatItMeasures: 'The uncollateralized overnight call rate target.',
    whoReleasesIt: 'Bank of Japan Policy Board, Tokyo.',
    frequency: 'Eight scheduled monetary policy meetings annually.',
    affectedMarkets: [
      { asset: 'USD/JPY & EUR/JPY', sensitivity: 'Very High', rationale: 'Direct repricing of the yen carry trade and sovereign yield spreads.' },
      { asset: 'Nikkei 225', sensitivity: 'Very High', rationale: 'Strong yen reduces repatriated profits for Japanese multinational exporters.' },
      { asset: 'Bitcoin & Crypto', sensitivity: 'High', rationale: 'Extreme sensitivity to global margin debt and yen carry liquidation waves.' },
      { asset: 'Global Equities', sensitivity: 'High', rationale: 'Cross-border leverage and foreign portfolio asset reallocation.' }
    ],
    hawkishDovish: {
      stance: 'Neutral',
      explanation: 'Markets expect policy rate hold at 0.25%, with intense scrutiny on Governor Ueda remarks regarding further rate hike timing.',
      rationale: 'BoJ balances sustainable domestic wage growth against recent market volatility following July rate increase.'
    },
    transmission: {
      origin: 'Bank of Japan Policy Board',
      nodes: [
        { label: 'Policy Rate & Bond Purchases', description: 'Short-term rate target and JGB purchase plan' },
        { label: 'Japanese 10Y JGB Yield', description: 'Domestic sovereign debt returns' },
        { label: 'Yen Carry Trade Liquidity', description: 'Global margin and cross-border leveraged positions' },
        { label: 'Global Risk Assets & USD/JPY', description: 'Repatriation of Japanese overseas capital' }
      ],
      summary: 'BoJ Policy Decision → JGB Yields → Yen Carry Trade Unwind → Global Liquidity & FX Repricing'
    },
    historical: {
      sampleSize: 26,
      confidence: 'Preliminary Evidence',
      windows: {
        '5m': { avgAbsMove: 0.72, positivePercent: 48, negativePercent: 52, largestMove: 2.20, smallestMove: 0.15 },
        '15m': { avgAbsMove: 1.10, positivePercent: 47, negativePercent: 53, largestMove: 3.10, smallestMove: 0.22 },
        '30m': { avgAbsMove: 1.45, positivePercent: 49, negativePercent: 51, largestMove: 3.90, smallestMove: 0.35 },
        '1h': { avgAbsMove: 1.80, positivePercent: 50, negativePercent: 50, largestMove: 4.80, smallestMove: 0.45 },
        '4h': { avgAbsMove: 2.30, positivePercent: 51, negativePercent: 49, largestMove: 5.60, smallestMove: 0.60 },
        '1D': { avgAbsMove: 2.90, positivePercent: 48, negativePercent: 52, largestMove: 6.80, smallestMove: 0.75 }
      },
      recentReleases: [
        {
          date: '2026-07-31',
          actual: 0.25,
          forecast: 0.10,
          surprise: 0.15,
          assetReactions: {
            'USD/JPY': { pctMove: -2.85, direction: 'DOWN' },
            'EUR/JPY': { pctMove: -2.40, direction: 'DOWN' },
            'BTC/USD': { pctMove: -4.50, direction: 'DOWN' }
          }
        },
        {
          date: '2026-06-14',
          actual: 0.10,
          forecast: 0.10,
          surprise: 0.0,
          assetReactions: {
            'USD/JPY': { pctMove: 0.95, direction: 'UP' },
            'EUR/JPY': { pctMove: 0.82, direction: 'UP' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Hawkish Hike or Explicit Guidance for Imminent Hike',
        condition: 'BoJ raises rates to 0.50% or Governor Ueda explicitly prepares markets for October hike.',
        transmission: ['JGB yields rise', 'Yen carry trade unwinds rapidly', 'USD/JPY plunges', 'Risk assets experience volatility'],
        marketTendency: 'Historically associated with sharp Yen appreciation, Nikkei drops, and broad global risk-off spillover.',
        disclaimer: 'This is a conditional scenario framework, not a prediction. Yen carry unwind can trigger cascading margin liquidations.'
      },
      dovish: {
        title: 'Dovish Hold with Reassurance of Caution',
        condition: 'BoJ emphasizes that market instability precludes further rate increases in the near term.',
        transmission: ['Yen weakens as carry trade resumes', 'USD/JPY recovers', 'Global risk sentiment relieved'],
        marketTendency: 'Historically observed to weaken the Yen and support Nikkei exporters and global equities.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      inLine: {
        title: 'Neutral Hold with Data-Dependent Language',
        condition: 'Rates kept at 0.25% with neutral remarks on economic conditions.',
        transmission: ['Initial positioning squeeze subsides', 'Trading focuses on Governor Ueda press briefing (~15:30 JST)'],
        marketTendency: 'Frequently produces high volatility during the afternoon press conference rather than the noon release.',
        disclaimer: 'The BoJ announcement has no fixed release minute; it typically emerges between 11:30 and 12:30 Tokyo time.'
      },
      mixed: {
        title: 'Hold on Rates but Accelerated Tapering of JGB Purchases',
        condition: 'Rates stay at 0.25%, but bond buying reduction is steeper than anticipated.',
        transmission: ['Long-term yields climb while front end remains pinned', 'Yen sees moderate demand'],
        marketTendency: 'Yield curve steepens, creating nuanced effects across domestic bank shares vs exporter equities.',
        disclaimer: 'Distinguish between policy interest rate moves and quantitative balance sheet tapering.'
      }
    },
    academyTopicId: 'academy-boj'
  },

  // 8. US ISM Manufacturing PMI
  {
    id: 'event-ism-mfg-sep26',
    name: 'US ISM Manufacturing Purchasing Managers Index (PMI)',
    code: 'ISM-MFG',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Manufacturing',
    impact: 'HIGH',
    dateTime: '2026-09-01T14:00:00Z',
    period: 'Aug 2026',
    status: 'Released',
    source: 'Institute for Supply Management (ISM)',
    sourceUrl: 'https://www.ismworld.org/',
    sourceTimestamp: '2026-09-01 10:00 EDT',
    unit: 'Index',
    previous: 46.8,
    forecast: 47.5,
    actual: 47.2,
    surprise: -0.3,
    surpriseFormatted: '-0.3 pts',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'A monthly survey of purchasing managers across 300+ industrial companies gauging business conditions, order books, production, inventory, and supplier deliveries.',
    whyItMatters: 'A reading above 50 indicates manufacturing expansion; below 50 indicates contraction. ISM Manufacturing is one of the earliest monthly reads on the state of the real economy.',
    whatItMeasures: 'Diffusion index of 5 major indicators: New Orders (30%), Production (25%), Employment (20%), Supplier Deliveries (15%), and Inventories (10%).',
    whoReleasesIt: 'Institute for Supply Management (Tempe, AZ).',
    frequency: 'Monthly, on the first business day of each month at 10:00 ET / 14:00 GMT.',
    headlineResult: 'ISM Manufacturing Inched Up to 47.2 in August but Remains in Contraction for 5th Consecutive Month',
    mainChange: 'Modest tick higher from 46.8 in July to 47.2 in August, missing consensus expectations of 47.5.',
    importantComponents: [
      'New Orders contracted further to 44.6 (from 47.4 in July)',
      'Production dropped to 44.8',
      'Prices Paid rose to 54.0 (indicating ongoing input cost pressures)',
      'Employment index rose slightly to 46.0 but remains in contraction'
    ],
    revisions: 'No revisions applied (diffusion survey methodology).',
    importantDetails: 'Demand remains subdued as companies show reluctance to invest in capital goods amid high borrowing costs and election uncertainty.',
    officialCommentary: [
      {
        speaker: 'Timothy R. Fiore',
        title: 'Chair of the ISM Manufacturing Business Survey Committee',
        quote: 'Demand remains subdued, as companies show an unwillingness to invest in capital and inventory due to current federal monetary policy and election uncertainty.',
        source: 'ISM Manufacturing Report On Business',
        timestamp: '2026-09-01 10:00 EDT',
        simplifiedExplanation: 'Businesses are postponing factory spending and new equipment purchases until interest rates come down.',
        marketInterpretation: 'Subdued manufacturing output supports the case for the Fed to ease borrowing rates.'
      }
    ],
    affectedMarkets: [
      { asset: 'US Equities (S&P 500 / Dow)', sensitivity: 'High', rationale: 'Industrial and cyclical stocks are directly sensitive to factory orders.' },
      { asset: 'USD / DXY', sensitivity: 'Medium', rationale: 'Contractionary prints typically soften Treasury yields and the Dollar.' },
      { asset: 'Crude Oil (WTI)', sensitivity: 'High', rationale: 'Manufacturing activity is a primary driver of industrial fuel and energy demand.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Medium', rationale: 'Benefits from lower real yields when manufacturing momentum slows.' }
    ],
    hawkishDovish: {
      stance: 'Dovish',
      explanation: 'Fifth straight month of sub-50 contraction signals persistent industrial cooling, supporting monetary policy accommodation.',
      rationale: 'Prices Paid rose modestly, but sluggish New Orders prevent second-round demand-pull inflation.'
    },
    transmission: {
      origin: 'ISM Manufacturing Survey',
      nodes: [
        { label: 'New Orders & Production', description: 'Factory activity levels' },
        { label: 'Industrial Commodity Demand', description: 'Oil, copper, and raw materials demand' },
        { label: 'Cyclical Corporate Earnings', description: 'Manufacturing profit outlook' },
        { label: 'Monetary Policy Easing Expectation', description: 'Fed rate path calibration' }
      ],
      summary: 'Factory Output & Orders → Industrial Demand → Cyclical Corporate Earnings → Monetary Policy Easing Expectations'
    },
    historical: {
      sampleSize: 34,
      confidence: 'More Reliable Historical Observation',
      windows: {
        '5m': { avgAbsMove: 0.35, positivePercent: 50, negativePercent: 50, largestMove: 1.15, smallestMove: 0.10 },
        '15m': { avgAbsMove: 0.50, positivePercent: 49, negativePercent: 51, largestMove: 1.55, smallestMove: 0.15 },
        '30m': { avgAbsMove: 0.68, positivePercent: 51, negativePercent: 49, largestMove: 2.10, smallestMove: 0.20 },
        '1h': { avgAbsMove: 0.88, positivePercent: 52, negativePercent: 48, largestMove: 2.65, smallestMove: 0.28 },
        '4h': { avgAbsMove: 1.15, positivePercent: 50, negativePercent: 50, largestMove: 3.30, smallestMove: 0.35 },
        '1D': { avgAbsMove: 1.45, positivePercent: 48, negativePercent: 52, largestMove: 4.10, smallestMove: 0.45 }
      },
      recentReleases: [
        {
          date: '2026-09-01',
          actual: 47.2,
          forecast: 47.5,
          surprise: -0.3,
          assetReactions: {
            'XAU/USD': { pctMove: 0.42, direction: 'UP' },
            'EUR/USD': { pctMove: 0.25, direction: 'UP' },
            'USD/JPY': { pctMove: -0.48, direction: 'DOWN' }
          }
        },
        {
          date: '2026-08-01',
          actual: 46.8,
          forecast: 48.8,
          surprise: -2.0,
          assetReactions: {
            'XAU/USD': { pctMove: 1.10, direction: 'UP' },
            'EUR/USD': { pctMove: 0.65, direction: 'UP' },
            'USD/JPY': { pctMove: -1.25, direction: 'DOWN' }
          }
        }
      ]
    },
    scenarios: {
      hawkish: {
        title: 'Expansionary Rebound (> 50.0)',
        condition: 'New orders and production surge back into economic expansion.',
        transmission: ['Industrial recovery confirmed', 'Bond yields climb', 'USD supported, cyclicals gain'],
        marketTendency: 'Historically associated with USD strength, industrial equity outperformance, and bond selling.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      dovish: {
        title: 'Deep Contraction (< 46.0)',
        condition: 'Sharp decline in new orders and inventory destocking.',
        transmission: ['Growth concerns escalate', 'Yields fall', 'Commodities weaken, Gold supported'],
        marketTendency: 'Historically observed to pressure crude oil and copper while supporting defensive assets.',
        disclaimer: 'This is a conditional scenario framework, not a prediction.'
      },
      inLine: {
        title: 'In-Line (~47.0-47.5)',
        condition: 'Remains in mild contraction in line with consensus.',
        transmission: ['Current slow-grind baseline continues', 'Market attention turns to ISM Services and NFP'],
        marketTendency: 'Typically produces moderate initial volatility that settles quickly.',
        disclaimer: 'Pay attention to the Prices Paid sub-index for hidden cost inflation.'
      },
      mixed: {
        title: 'PMI Drops but Prices Paid Surges',
        condition: 'Activity contracts while input costs rise (stagflationary signal).',
        transmission: ['Dilemma for central bank policy', 'Choppy, contradictory cross-market price action'],
        marketTendency: 'Stagflationary mix can hurt both equities and bonds simultaneously.',
        disclaimer: 'Mixed prints complicate directional conviction.'
      }
    },
    academyTopicId: 'academy-ism'
  }
];

export const NEWS_EVENTS: NewsEvent[] = [
  ...BASE_NEWS_EVENTS,
  ...EXTENDED_CALENDAR_EVENTS
].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
