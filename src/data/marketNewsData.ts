import { MarketNewsArticle } from '@/types/newsIntelligence';

// Helper to get dates relative to now
const getRelativeDate = (daysOffset: number, hoursOffset: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
};

export const getMarketNews = (): MarketNewsArticle[] => [
  {
    id: 'news-1',
    headline: 'US Inflation Exceeds Forecasts, Cooling 50bps Rate Cut Speculation',
    summary: 'Core CPI came in higher than expected at 3.2% YoY, indicating sticky services inflation that cements a 25 basis point reduction as the Federal Reserve baseline.',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/markets',
    publishedAt: getRelativeDate(0, -2), // 2 hours ago
    updatedAt: getRelativeDate(0, -1),
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    category: 'INFLATION',
    markets: ['USD', 'Gold', 'Stocks', 'Treasuries', 'XAU/USD', 'EUR/USD'],
    impact: 'HIGH',
    country: 'US',
    personEntity: 'Jerome Powell',
    event: 'CPI Release',
    previous: '3.4%',
    forecast: '3.1%',
    actual: '3.2%',
    clusterId: 'cluster-fed-sep',
    isDevelopingStory: true,
    sourceCount: 4,
    sourcesList: ['Bloomberg', 'Reuters', 'Wall Street Journal', 'Financial Times'],
    relatedIndicatorId: 'ind-us-cpi-yoy',
    relatedIndicatorName: 'US CPI YoY',
    relatedEventId: 'event-cpi-sep26',
    confirmedFacts: [
      'Core CPI posted 0.28% MoM increase vs 0.2% expected.',
      'Shelter and transportation services represented over 70% of the upside surprise.',
      'Market-implied probability of a 50bps cut plunged from 34% to 11% following the release.'
    ],
    differingPoints: [
      'Bloomberg analysis suggests the Fed will hold guidance neutral.',
      'Reuters notes dissenting dovish voices urging front-loaded easing to prevent labor spillover.'
    ],
    uncertainPoints: [
      'Whether August PCE price index at month-end will validate or contradict the CPI uptick.',
      'The exact composition of the FOMC Dot Plot projections.'
    ],
    whatHappened: 'US Headline CPI printed at 3.2% YoY vs 3.1% forecast, with Core CPI holding steady at 3.2%.',
    whyItMatters: 'Higher inflation suggests services costs remain resilient, discouraging the Fed from aggressive 50bps rate cuts. A 25bps cut is now widely viewed as the consensus baseline.',
    explainTrader: {
      whatHappened: 'US consumer inflation printed at 3.2% annualized, edging out Wall Street expectations of 3.1%.',
      whyItMatters: 'It takes aggressive 50 basis point emergency cut scenarios completely off the table for the upcoming FOMC meeting.',
      whatDataChanged: 'Short-end US 2-Year Treasury yields jumped 7 basis points to 3.65% as traders priced in a more measured easing pace.',
      relevantMarkets: ['USD / DXY', 'Gold (XAU/USD)', 'US 2Y/10Y Treasuries', 'S&P 500 / Nasdaq'],
      watchNext: 'Upcoming Retail Sales report and the Fed Chair FOMC press conference forward guidance.'
    },
    marketsToWatch: ['USD', 'Gold', 'US Indices', 'Treasuries', 'XAU/USD', 'EUR/USD'],
    traderImpact: {
      markets: [
        { asset: 'USD / DXY', sensitivity: 'HIGH' },
        { asset: 'Gold (XAU/USD)', sensitivity: 'HIGH' },
        { asset: 'US Indices (S&P 500)', sensitivity: 'MEDIUM' }
      ],
      explanation: 'Hot inflation traditionally bolsters the US Dollar and prompts brief consolidations in Gold as yield competition rises.'
    },
    bullBearContext: {
      bullish: 'For USD: Yield advantage remains attractive. For Equities: Strong pricing power reflects durable consumer spending.',
      bearish: 'For Gold: Elevated real yields maintain opportunity costs. For Bond Prices: Yields climb, causing price pullbacks.',
      neutral: 'Markets have largely absorbed the 25bps baseline cut without panic.'
    }
  },
  {
    id: 'news-2',
    headline: 'ECB Cuts Benchmark Deposit Rate by 25bps to 3.50% Amid Growth Headwinds',
    summary: 'European Central Bank policymakers voted to lower the deposit facility rate, citing decelerating wage growth and manufacturing weakness across Germany.',
    source: 'Reuters',
    sourceUrl: 'https://www.reuters.com/markets/europe',
    publishedAt: getRelativeDate(0, -5), // 5 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1541888052187-57351f08f878?auto=format&fit=crop&q=80&w=800',
    category: 'CENTRAL BANKS',
    markets: ['EUR/USD', 'EUR/GBP', 'DAX', 'European Bonds'],
    impact: 'HIGH',
    country: 'EU',
    personEntity: 'Christine Lagarde',
    event: 'ECB Rate Decision',
    previous: '3.75%',
    forecast: '3.50%',
    actual: '3.50%',
    relatedIndicatorId: 'ind-eu-ecb-rate',
    relatedIndicatorName: 'ECB Deposit Facility Rate',
    relatedEventId: 'event-ecb-rate',
    whatHappened: 'The ECB reduced its deposit rate from 3.75% to 3.50%, matching consensus expectations.',
    whyItMatters: 'The Eurozone continues to lead global central banks in loosening monetary policy. Lower sovereign yields narrow the yield spread against the US Dollar.',
    explainTrader: {
      whatHappened: 'ECB delivered its second rate reduction of the year, bringing deposit rates to 3.50%.',
      whyItMatters: 'Lower euro yields make EUR less attractive against USD and GBP on a carry trade basis.',
      whatDataChanged: 'Deposit rate: 3.50% (-25bps); Main refinancing rate: 3.65% (-60bps adjustment).',
      relevantMarkets: ['EUR/USD', 'DAX 40', 'German 10Y Bunds', 'EUR/GBP'],
      watchNext: 'President Lagarde press conference commentary regarding October policy pause.'
    },
    marketsToWatch: ['EUR/USD', 'DAX', 'German Bunds'],
    traderImpact: {
      markets: [
        { asset: 'EUR/USD', sensitivity: 'HIGH' },
        { asset: 'DAX 40', sensitivity: 'MEDIUM' }
      ],
      explanation: 'EUR/USD typically experiences immediate test of local support levels on dovish policy guidance.'
    }
  },
  {
    id: 'news-3',
    headline: 'Bitcoin Stabilizes Above $56K Support as Spot ETF Inflows Rebound',
    summary: 'US Spot Bitcoin ETFs recorded $263 million in net daily subscriptions, halting a three-week stretch of institutional outflows ahead of macroeconomic easing.',
    source: 'CoinDesk',
    sourceUrl: 'https://www.coindesk.com',
    publishedAt: getRelativeDate(0, -9), // 9 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb70208?auto=format&fit=crop&q=80&w=800',
    category: 'CRYPTO',
    markets: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'Crypto Equities'],
    impact: 'MEDIUM',
    clusterId: 'cluster-crypto-etf',
    isDevelopingStory: true,
    sourceCount: 3,
    sourcesList: ['CoinDesk', 'Bloomberg Crypto', 'Reuters'],
    relatedIndicatorId: 'ind-us-fedfunds',
    relatedIndicatorName: 'Federal Funds Target Rate',
    whatHappened: 'Substantial capital re-entered spot Bitcoin ETFs after summer consolidation.',
    whyItMatters: 'ETF absorption acts as a structural baseline for spot liquidity, dampening OTC exchange selling pressure.',
    explainTrader: {
      whatHappened: 'Net $263M entered Bitcoin spot exchange-traded funds across Wall Street providers.',
      whyItMatters: 'Positive flows indicate institutional buyers are accumulating dips prior to global rate cuts.',
      whatDataChanged: 'CME open interest expanded by 4.2% while exchange reserves fell to 3-year lows.',
      relevantMarkets: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'MicroStrategy (MSTR)'],
      watchNext: 'Weekly flow summaries and Fed rate cut liquidity transmission.'
    },
    marketsToWatch: ['BTC/USD', 'ETH/USD', 'Crypto Equities'],
    traderImpact: {
      markets: [
        { asset: 'BTC/USD', sensitivity: 'HIGH' },
        { asset: 'SOL/USD', sensitivity: 'MEDIUM' }
      ],
      explanation: 'Sustained institutional accumulation provides key support along the $54,000–$56,000 demand block.'
    }
  },
  {
    id: 'news-4',
    headline: 'Oil Prices Seesaw as Middle East Shipping Concerns Clash With Demand Weakness',
    summary: 'WTI crude hovered near $68 per barrel as maritime shipping disruptions competed with forecasts of decelerating global refinery throughput.',
    source: 'Financial Times',
    sourceUrl: 'https://www.ft.com',
    publishedAt: getRelativeDate(-1, -2), // 1 day ago
    imageUrl: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&q=80&w=800',
    category: 'COMMODITIES',
    markets: ['WTI Crude', 'Brent Crude', 'USD/CAD', 'Energy Stocks'],
    impact: 'HIGH',
    clusterId: 'cluster-middle-east-oil',
    isDevelopingStory: true,
    sourceCount: 3,
    sourcesList: ['Financial Times', 'CNBC', 'Bloomberg'],
    relatedIndicatorId: 'ind-us-ism-mfg',
    relatedIndicatorName: 'ISM Manufacturing PMI',
    whatHappened: 'Crude oil experienced sharp intraday swings between geopolitical risk and macroeconomic deceleration.',
    whyItMatters: 'Energy prices directly impact headline CPI calculations with a 1-to-2 month transmission lag.',
    explainTrader: {
      whatHappened: 'Crude futures saw high two-way volatility, testing $68 support before rebounding.',
      whyItMatters: 'Sustained cheap oil accelerates disinflation, giving central banks more leeway to cut rates.',
      whatDataChanged: 'OPEC+ deferred scheduled supply increases by two months to counter seasonal inventory builds.',
      relevantMarkets: ['WTI Crude', 'Brent Crude', 'USD/CAD', 'Exxon / Chevron'],
      watchNext: 'EIA official weekly inventory reports and Middle East maritime shipping safety updates.'
    },
    marketsToWatch: ['WTI Crude', 'Brent', 'USD/CAD'],
    traderImpact: {
      markets: [
        { asset: 'WTI Crude', sensitivity: 'HIGH' },
        { asset: 'USD/CAD', sensitivity: 'MEDIUM' }
      ],
      explanation: 'The Canadian Dollar closely tracks oil export terms of trade. Drop in crude weighs on CAD.'
    }
  },
  {
    id: 'news-5',
    headline: 'Bank of Japan Signals Further Rate Normalization as Real Wages Turn Positive',
    summary: 'Governor Kazuo Ueda reaffirmed the BOJ willingness to raise interest rates further if economic projections and corporate wage increases hold firm.',
    source: 'Wall Street Journal',
    sourceUrl: 'https://www.wsj.com/finance',
    publishedAt: getRelativeDate(-2, 0), // 2 days ago
    imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=800',
    category: 'FOREX',
    markets: ['USD/JPY', 'EUR/JPY', 'Nikkei 225', 'Global Carry Trades'],
    impact: 'HIGH',
    country: 'JP',
    personEntity: 'Kazuo Ueda',
    event: 'BOJ Speech',
    relatedIndicatorId: 'ind-jp-boj-rate',
    relatedIndicatorName: 'Bank of Japan Policy Rate',
    relatedEventId: 'event-boj-rate',
    whatHappened: 'BOJ leadership expressed readiness to advance benchmark rates beyond 0.25% in subsequent quarters.',
    whyItMatters: 'The Japanese Yen has been the global financial system primary funding currency. Rate hikes tighten global leverage and trigger carry-trade unwinds.',
    marketsToWatch: ['USD/JPY', 'EUR/JPY', 'Nikkei 225'],
    traderImpact: {
      markets: [
        { asset: 'USD/JPY', sensitivity: 'HIGH' },
        { asset: 'Nikkei 225', sensitivity: 'HIGH' }
      ],
      explanation: 'Hawkish BOJ commentary creates rapid downward momentum in USD/JPY and temporary volatility in Japanese equities.'
    }
  },
  {
    id: 'news-6',
    headline: 'US Retail Sales Rise 0.6%, Demonstrating Resilient Household Balance Sheets',
    summary: 'Consumer spending advanced at twice the projected pace in the previous month, fueled by back-to-school purchasing and resilient services demand.',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com',
    publishedAt: getRelativeDate(-3, 0), // 3 days ago
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=800',
    category: 'ECONOMIC',
    markets: ['USD', 'Stocks', 'Retail Equities', 'Treasuries'],
    impact: 'MEDIUM',
    country: 'US',
    previous: '0.2%',
    forecast: '0.3%',
    actual: '0.6%',
    relatedIndicatorId: 'ind-us-gdp-annual',
    relatedIndicatorName: 'US GDP Annual Growth',
    relatedEventId: 'event-us-retail-sales',
    whatHappened: 'American retail activity expanded by 0.6% MoM against 0.3% anticipated.',
    whyItMatters: 'Personal consumption accounts for approximately 68% of US gross domestic product, diminishing immediate recession fears.',
    marketsToWatch: ['S&P 500', 'USD / DXY', 'US 10Y Yield']
  },
  {
    id: 'news-7',
    headline: 'Gold Holds Near Record Highs Above $2,500 on Central Bank Purchases',
    summary: 'Spot bullion maintained its historic breakout above $2,500/oz as sovereign central banks and wealth funds continued diversification away from fiat currency reserves.',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com',
    publishedAt: getRelativeDate(0, -4), // 4 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800',
    category: 'GOLD',
    markets: ['XAU/USD', 'USD', 'Silver', 'Mining Equities'],
    impact: 'HIGH',
    relatedIndicatorId: 'ind-us-fedfunds',
    relatedIndicatorName: 'Federal Funds Target Rate',
    relatedEventId: 'event-fomc-rate',
    whatHappened: 'Gold prices consolidated firmly above $2,500/oz despite a modestly firmer dollar.',
    whyItMatters: 'Physical sovereign demand provides a rising floor under gold prices, decoupling it from traditional real rate headwinds.',
    explainTrader: {
      whatHappened: 'Gold remained firmly bid above $2,510 following another month of sovereign reserve additions.',
      whyItMatters: 'Structural institutional buying is absorbing algorithmic selling on hot inflation prints.',
      whatDataChanged: 'Global official reserve managers added over 48 tonnes of gold in July and August.',
      relevantMarkets: ['Gold (XAU/USD)', 'Silver (XAG/USD)', 'GDX / Mining Equities', 'DXY'],
      watchNext: 'Treasury real yield direction and upcoming FOMC rate statement guidance.'
    },
    marketsToWatch: ['XAU/USD', 'XAG/USD', 'DXY'],
    traderImpact: {
      markets: [
        { asset: 'XAU/USD', sensitivity: 'HIGH' },
        { asset: 'XAG/USD', sensitivity: 'HIGH' }
      ],
      explanation: 'Dips towards key support zones (e.g. $2,480–$2,500) continue to witness strong institutional dip buying.'
    }
  },
  {
    id: 'news-8',
    headline: 'US 10-Year Treasury Yield Drops to 3.72% Ahead of Major Easing Cycle',
    summary: 'Benchmark bond yields declined to the lowest level since mid-2023 as global fixed income allocators aggressively position for a series of coordinated central bank rate cuts.',
    source: 'Wall Street Journal',
    sourceUrl: 'https://www.wsj.com',
    publishedAt: getRelativeDate(0, -12), // 12 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800',
    category: 'BONDS',
    markets: ['US10Y', 'US02Y', 'USD', 'S&P 500'],
    impact: 'MEDIUM',
    country: 'US',
    relatedIndicatorId: 'ind-us-fedfunds',
    relatedIndicatorName: 'Federal Funds Target Rate',
    whatHappened: 'Benchmark US bond yields extended their downward trajectory across the yield curve.',
    whyItMatters: 'Lower risk-free rates compress borrowing costs across corporate credit and lower mortgage rates.',
    marketsToWatch: ['US10Y', 'USD', 'Nasdaq 100']
  },
  {
    id: 'news-9',
    headline: 'Mega-Cap Technology Earnings Rebound as Cloud AI CapEx Translates to Revenue',
    summary: 'Leading cloud infrastructure and semiconductor providers affirmed strong enterprise demand, driving the Nasdaq back towards record highs.',
    source: 'Financial Times',
    sourceUrl: 'https://www.ft.com',
    publishedAt: getRelativeDate(-4, 0), // 4 days ago
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    category: 'EARNINGS',
    markets: ['Nasdaq', 'S&P 500', 'Tech Equities'],
    impact: 'HIGH',
    country: 'US',
    whatHappened: 'Major technology companies reported revenue expansion exceeding consensus estimates.',
    whyItMatters: 'Technology equities command over 30% weight in the S&P 500, setting direction for global risk appetite.',
    marketsToWatch: ['NDX', 'SPX', 'Semiconductors']
  },
  {
    id: 'news-10',
    headline: 'UK GDP Growth Expands 0.7% in Q2, Beating Bank of England Estimates',
    summary: 'The UK economy grew at the fastest pace in over two years, driven by robust domestic consumer services and business investment.',
    source: 'Financial Times',
    sourceUrl: 'https://www.ft.com',
    publishedAt: getRelativeDate(-5, 0), // 5 days ago
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800',
    category: 'GDP',
    markets: ['GBP/USD', 'EUR/GBP', 'FTSE 100', 'UK Gilts'],
    impact: 'MEDIUM',
    country: 'UK',
    previous: '0.3%',
    forecast: '0.6%',
    actual: '0.7%',
    relatedIndicatorId: 'ind-uk-gdp-yoy',
    relatedIndicatorName: 'UK GDP Annual Growth Rate',
    relatedEventId: 'event-uk-gdp-sep26',
    whatHappened: 'UK output advanced 0.7%, indicating economic acceleration out of previous stagflationary headwinds.',
    whyItMatters: 'Strong growth limits the urgency for aggressive consecutive rate cuts by the Bank of England.',
    marketsToWatch: ['GBP/USD', 'EUR/GBP', 'FTSE 100']
  },
  {
    id: 'news-11',
    headline: 'US Non-Farm Payrolls Show Orderly Labor Market Rebalancing with 142K Jobs',
    summary: 'Hiring picked up from July revised lows while the unemployment rate ticked down to 4.2%, alleviating fears of an abrupt employment slowdown.',
    source: 'Reuters',
    sourceUrl: 'https://www.reuters.com',
    publishedAt: getRelativeDate(-4, 0),
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    category: 'EMPLOYMENT',
    markets: ['USD', 'Gold', 'US Equities', 'EUR/USD'],
    impact: 'HIGH',
    country: 'US',
    previous: '89K',
    forecast: '160K',
    actual: '142K',
    relatedIndicatorId: 'ind-us-nfp',
    relatedIndicatorName: 'Non-Farm Payrolls (Net Change)',
    relatedEventId: 'event-nfp-sep26',
    whatHappened: 'The US added 142,000 jobs while unemployment dipped from 4.3% to 4.2%.',
    whyItMatters: 'Demonstrates the US labor market is normalizing rather than collapsing, reinforcing soft-landing probabilities.',
    marketsToWatch: ['USD', 'Gold', 'S&P 500']
  },
  {
    id: 'news-12',
    headline: 'China Manufacturing Activity Stabilizes as Stimulus Measures Take Effect',
    summary: 'Caixin Manufacturing PMI edged back into expansionary territory at 50.4, providing structural support for industrial commodity prices.',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com',
    publishedAt: getRelativeDate(-3, -6),
    imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&q=80&w=800',
    category: 'MACRO',
    markets: ['AUD/USD', 'Copper', 'Iron Ore', 'Hang Seng'],
    impact: 'MEDIUM',
    country: 'CN',
    previous: '49.8',
    forecast: '50.0',
    actual: '50.4',
    relatedIndicatorId: 'ind-cn-pmi-mfg',
    relatedIndicatorName: 'China Caixin Manufacturing PMI',
    whatHappened: 'Small and medium manufacturing enterprises in China returned to modest monthly expansion.',
    whyItMatters: 'Direct indicator for global commodities demand; directly influences AUD/USD and base industrial metals.',
    marketsToWatch: ['AUD/USD', 'Copper', 'Crude Oil']
  }
];

export const getOlderMarketNews = (): MarketNewsArticle[] => [
  {
    id: 'news-13',
    headline: 'Global Central Bank Gold Reserves Reach Historic Multi-Decade High',
    summary: 'Sovereign reserves continue shifting from sovereign treasuries into physical gold bullion according to World Gold Council quarterly audits.',
    source: 'Financial Times',
    sourceUrl: 'https://www.ft.com',
    publishedAt: getRelativeDate(-10, 0),
    imageUrl: 'https://images.unsplash.com/photo-1534951009808-7d06b8b814ce?auto=format&fit=crop&q=80&w=800',
    category: 'GOLD',
    markets: ['Gold', 'USD', 'Central Banks'],
    impact: 'MEDIUM',
    whatHappened: 'Central banks diversified reserves with over 1,000 tonnes of annual net purchases.',
    whyItMatters: 'Provides long-term inelastic price support for gold independent of commercial speculative cycles.',
    marketsToWatch: ['XAU/USD', 'Silver']
  },
  {
    id: 'news-14',
    headline: 'ISM Manufacturing New Orders Index Shows Early Green Shoots in Capital Goods',
    summary: 'Sub-components of the ISM factory survey recorded their first monthly uptick in export orders in six months.',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com',
    publishedAt: getRelativeDate(-8, 0),
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    category: 'ECONOMIC',
    markets: ['USD', 'Dow Jones', 'Industrial Equities'],
    impact: 'MEDIUM',
    country: 'US',
    relatedIndicatorId: 'ind-us-ism-mfg',
    relatedIndicatorName: 'ISM Manufacturing PMI',
    relatedEventId: 'event-ism-mfg-sep26',
    whatHappened: 'US factory output metrics stabilized above recent summer cyclical lows.',
    whyItMatters: 'Signals that high borrowing costs may have passed their peak drag on domestic industrial capex.',
    marketsToWatch: ['US10Y', 'Dow Jones']
  }
];

export const getAllMarketNews = (): MarketNewsArticle[] => {
  return [...getMarketNews(), ...getOlderMarketNews()].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};
