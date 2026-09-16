import { NewsStoryCluster } from '@/types/newsIntelligence';

export const NEWS_STORY_CLUSTERS: NewsStoryCluster[] = [
  {
    id: 'cluster-fed-sep',
    topicTitle: 'Federal Reserve September Rate Cut & Terminal Neutral Trajectory',
    primaryHeadline: 'US Inflation Exceeds Forecasts, Cooling 50bps Rate Cut Speculation',
    summary: 'Core services inflation remained sticky at 3.2%, solidifying a 25 basis point cut baseline while tempering aggressive 50 basis point easing bets for the September FOMC meeting.',
    sourcesCount: 4,
    sourcesList: [
      { name: 'Bloomberg', url: 'https://www.bloomberg.com', stance: 'Points to sticky shelter costs keeping Fed cautious on 25bps pace.' },
      { name: 'Reuters', url: 'https://www.reuters.com', stance: 'Highlights dissenting dovish voices urging front-loaded 50bps to preserve jobs.' },
      { name: 'Wall Street Journal', url: 'https://www.wsj.com', stance: 'Reports Chair Powell likely favors consensus 25bps with flexible forward guidance.' },
      { name: 'Financial Times', url: 'https://www.ft.com', stance: 'Focuses on global bond yield curve un-inversion and spillover onto foreign exchange.' }
    ],
    status: 'DEVELOPING',
    confirmedFacts: [
      'Headline CPI printed at 3.2% YoY, modestly above the 3.1% consensus estimate.',
      'Core CPI excluding food and energy rose 0.28% MoM, largely driven by transportation and shelter services.',
      'Fed Funds futures pricing has removed nearly all probability of an inter-meeting emergency cut.',
      'The Federal Reserve will release its updated Summary of Economic Projections (Dot Plot) alongside the policy decision.'
    ],
    differingPoints: [
      'Magnitude Debate: Bloomberg and WSJ survey consensus leans 85% towards 25 bps, while select macro funds cited by Reuters continue betting on 50 bps.',
      'Terminal Neutral Rate: Diverging estimates on where rates bottom out (ranging between 3.00% and 3.75% across primary dealers).'
    ],
    uncertainPoints: [
      'Whether Chair Powell will explicitly pre-commit to sequential cuts at subsequent October/November meetings.',
      'The exact composition of FOMC voter dissent regarding labor market weakness versus inflation persistence.'
    ],
    timeline: [
      { time: '2 hours ago', source: 'Bloomberg', headline: 'US Inflation Exceeds Forecasts, Cooling Rate Cut Hopes' },
      { time: '4 hours ago', source: 'Reuters', headline: 'Fed Easing Cycle Faces Test as Core CPI Shows Resilience' },
      { time: '6 hours ago', source: 'Wall Street Journal', headline: 'Fed Officials Signal Measured 25bps Start to Policy Normalization' },
      { time: 'Yesterday', source: 'Financial Times', headline: 'Treasury Yields Rebound as Traders Pare Back Aggressive Cut Bets' }
    ],
    relatedMarkets: ['USD', 'XAU/USD', 'US10Y', 'S&P 500', 'EUR/USD'],
    relatedIndicatorCode: 'US-CPI-YOY',
    relatedEventId: 'event-fomc-rate'
  },
  {
    id: 'cluster-middle-east-oil',
    topicTitle: 'Middle East Maritime Transit Security & Energy Premium Dynamics',
    primaryHeadline: 'Oil Prices Seesaw on Geopolitical Transit Tensions and OPEC+ Policy',
    summary: 'Escalating tensions around critical regional maritime corridors threaten crude export logistics, competing against macroeconomic signs of softening manufacturing consumption.',
    sourcesCount: 3,
    sourcesList: [
      { name: 'Financial Times', url: 'https://www.ft.com', stance: 'Spot war risk insurance surcharges have climbed 15% across regional tankers.' },
      { name: 'CNBC', url: 'https://www.cnbc.com', stance: 'Notes speculative short-covering in WTI futures driving intraday volatility spikes.' },
      { name: 'Bloomberg', url: 'https://www.bloomberg.com', stance: 'Highlights OPEC+ readiness to pause scheduled production increases if demand falters.' }
    ],
    status: 'DEVELOPING',
    confirmedFacts: [
      'Commercial maritime transit times have extended due to rerouted shipping around the Cape of Good Hope.',
      'OPEC+ agreed to defer their planned 180,000 bpd supply restoration by two months.',
      'Global crude inventories in major OECD storage hubs remain at the lower end of the 5-year average range.'
    ],
    differingPoints: [
      'Supply Disruption Probability: Major commodity desks diverge on whether actual oil field production will be disrupted or if friction remains confined to maritime shipping lanes.',
      'Demand Deficit vs Surplus: IEA forecasts an oil market surplus in 2027 while OPEC forecasts continued tightness.'
    ],
    uncertainPoints: [
      'Potential retaliatory moves targeting regional energy infrastructure.',
      'Duration of emergency shipping surcharges and their secondary impact on European natural gas imports.'
    ],
    timeline: [
      { time: '1 day ago', source: 'Financial Times', headline: 'Oil Prices Spike on Middle East Supply Concerns' },
      { time: '2 days ago', source: 'CNBC', headline: 'Tanker Operators Face Higher Insurance Premia Amid Red Sea Incidents' },
      { time: '3 days ago', source: 'Bloomberg', headline: 'OPEC+ Weighs Delaying Scheduled Production Hikes to Support Benchmark Crude' }
    ],
    relatedMarkets: ['WTI Crude', 'Brent Crude', 'USD/CAD', 'Energy Equities'],
    relatedIndicatorCode: 'US-ISM-MFG',
    relatedEventId: 'event-ism-mfg-sep26'
  },
  {
    id: 'cluster-crypto-etf',
    topicTitle: 'Institutional Digital Asset Adoption & Spot ETF Allocation Cycles',
    primaryHeadline: 'Bitcoin Holds $56K Support as Net Inflows Resume Across US Spot ETFs',
    summary: 'Institutional asset managers registered net positive spot Bitcoin ETF inflows following three consecutive weeks of redemptions, stabilizing digital asset sentiment ahead of major macroeconomic catalysts.',
    sourcesCount: 3,
    sourcesList: [
      { name: 'CoinDesk', url: 'https://www.coindesk.com', stance: 'Identifies renewed sovereign wealth and registered investment advisor (RIA) onboarding.' },
      { name: 'Bloomberg Crypto', url: 'https://www.bloomberg.com', stance: 'Highlights basis arbitrage trade unwinding between spot ETFs and CME futures.' },
      { name: 'Reuters', url: 'https://www.reuters.com', stance: 'Points to regulatory clarity initiatives gaining bipartisan traction in Congress.' }
    ],
    status: 'CONFIRMED',
    confirmedFacts: [
      'US Spot Bitcoin ETFs recorded over $260M in net aggregate daily subscriptions.',
      'CME Bitcoin futures open interest remains above $9.5B.',
      'Long-term holder on-chain supply has resumed net accumulation behavior after summer profit-taking.'
    ],
    differingPoints: [
      'Flow Composition: Whether recent inflows represent directional spot conviction or delta-neutral institutional basis trades.',
      'Short-Term Price Targets: Analyst consensus ranges between $52,000 support retest and $68,000 breakout retest.'
    ],
    uncertainPoints: [
      'Correlation with Nasdaq high-beta tech stocks during impending monetary easing.',
      'Potential sell pressure from ongoing government auction distributions.'
    ],
    timeline: [
      { time: '1 day ago', source: 'CoinDesk', headline: 'Bitcoin Surges Past Key Resistance Amid Institutional Inflows' },
      { time: '2 days ago', source: 'Bloomberg', headline: 'Institutional Crypto Asset Custody Reaches New All-Time Record' },
      { time: '3 days ago', source: 'Reuters', headline: 'Spot Digital Asset Products See Stabilizing Flows After Seasonal August Outflows' }
    ],
    relatedMarkets: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'Crypto Equities'],
    relatedIndicatorCode: 'US-FEDFUNDS',
    relatedEventId: 'event-fomc-rate'
  }
];
