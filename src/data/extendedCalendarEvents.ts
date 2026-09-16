import { NewsEvent } from '@/types/newsIntelligence';

export const EXTENDED_CALENDAR_EVENTS: NewsEvent[] = [
  // --- CURRENT WEEK: SUN SEP 6, 2026 ---
  {
    id: 'event-opec-jmmc',
    name: 'OPEC+ Joint Ministerial Monitoring Committee (JMMC) Communique',
    code: 'OPEC',
    country: 'Global Oil Cartel',
    countryCode: 'WW',
    currency: 'USD',
    category: 'Energy',
    impact: 'NON-ECONOMIC',
    dateTime: '2026-09-06T14:00:00Z',
    period: 'Sep 2026',
    status: 'Released',
    source: 'OPEC Secretariat (Vienna)',
    sourceUrl: 'https://www.opec.org',
    unit: 'mb/d',
    previous: 'N/A',
    forecast: 'N/A',
    forecastType: 'Model Estimate',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'OPEC+ oil ministers discuss production quota compliance, voluntary production cuts, and crude output quotas.',
    whyItMatters: 'Directly impacts energy input costs and crude oil price dynamics (WTI, Brent) and petroleum currencies (CAD, NOK).',
    whatItMeasures: 'Compliance rates and scheduled unwinding of voluntary supply reductions.',
    whoReleasesIt: 'OPEC+ Ministerial Panel.',
    frequency: 'Bi-monthly monitoring meeting.',
    affectedMarkets: [
      { asset: 'Crude Oil (WTI / Brent)', sensitivity: 'High', rationale: 'Direct supply intervention in global energy balance.' },
      { asset: 'USD/CAD', sensitivity: 'Medium', rationale: 'Canadian dollar correlates positively with crude export revenues.' }
    ],
    transmission: {
      origin: 'OPEC+ Quota Compliance',
      nodes: [
        { label: 'Supply Agreement', description: 'Production quotas maintained' },
        { label: 'Crude Futures', description: 'Brent & WTI test support' },
        { label: 'Headline Inflation', description: 'Transport costs factored into CPI' }
      ],
      summary: 'OPEC Supply Statement → Crude Oil Futures → Transportation Inflation Expectations'
    }
  },
  {
    id: 'event-g20-finance',
    name: 'G20 Finance Ministers Working Session Briefing',
    code: 'G20',
    country: 'Global Economic Forum',
    countryCode: 'WW',
    currency: 'EUR',
    category: 'Government',
    impact: 'NON-ECONOMIC',
    dateTime: '2026-09-06T18:30:00Z',
    period: 'Q3 2026',
    status: 'Released',
    source: 'G20 Secretariat',
    unit: 'Text',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Finance ministers and central bank deputies discuss sovereign debt vulnerabilities, multilateral capital flows, and international tax frameworks.',
    whyItMatters: 'Provides qualitative insight into cross-border regulatory direction.',
    whatItMeasures: 'Sovereign financial consensus.',
    whoReleasesIt: 'G20 Presidency.',
    frequency: 'Quarterly ministerial summit.',
    affectedMarkets: [
      { asset: 'Global Equities', sensitivity: 'Low', rationale: 'Informal discussions on debt restructuring.' }
    ],
    transmission: {
      origin: 'G20 Communique',
      nodes: [{ label: 'Policy Statements', description: 'Sovereign coordination framework' }],
      summary: 'Multilateral policy discussions.'
    }
  },

  // --- MON SEP 7, 2026 ---
  {
    id: 'event-us-labor-day',
    name: 'US Labor Day Holiday — New York Markets Closed',
    code: 'US-HOLIDAY',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Other',
    impact: 'NON-ECONOMIC',
    dateTime: '2026-09-07T00:00:00Z',
    period: 'Annual',
    status: 'Released',
    source: 'US Federal Reserve / NYSE / SIFMA',
    unit: 'Holiday',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'US equity and bond markets are closed in observance of the federal Labor Day holiday. Cash liquidity in dollar pairs is significantly thinner.',
    whyItMatters: 'Trading sessions during US bank holidays often exhibit reduced volume and widened spreads across FX and commodity CFDs.',
    whatItMeasures: 'Statutory bank holiday schedule.',
    whoReleasesIt: 'Federal Reserve System & Wall Street exchanges.',
    frequency: 'Annual federal holiday (first Monday of September).',
    affectedMarkets: [
      { asset: 'US Equities (S&P / Nasdaq)', sensitivity: 'Low', rationale: 'Cash markets closed, futures trade on truncated hours.' },
      { asset: 'EUR/USD & GBP/USD', sensitivity: 'Low', rationale: 'Thin liquidity may increase execution slippage during London afternoon.' }
    ],
    transmission: {
      origin: 'Federal Holiday',
      nodes: [{ label: 'Market Closure', description: 'Reduced liquidity, wide spreads' }],
      summary: 'Bank holiday liquidity reduction.'
    }
  },
  {
    id: 'event-de-ind-prod',
    name: 'German Industrial Production (MoM)',
    code: 'DE-IP',
    country: 'Germany',
    countryCode: 'EU',
    currency: 'EUR',
    category: 'Manufacturing',
    impact: 'MEDIUM',
    dateTime: '2026-09-07T06:00:00Z',
    period: 'Jul 2026',
    status: 'Released',
    source: 'Federal Statistical Office of Germany (Destatis)',
    sourceUrl: 'https://www.destatis.de',
    unit: '%',
    previous: -1.4,
    revisedPrevious: -1.7,
    revisionDetails: {
      previousPublished: -1.4,
      revisedValue: -1.7,
      revisionDate: '2026-09-07',
      reason: 'Destatis quarterly recalibration factoring revised energy-intensive industrial sector output.'
    },
    forecast: -0.3,
    forecastType: 'Consensus',
    actual: -0.5,
    surprise: -0.2,
    surpriseFormatted: '-0.2%',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Measures the monthly change in inflation-adjusted output from German manufacturing, mining, and energy utilities.',
    whyItMatters: 'Germany is Europe’s largest industrial powerhouse. Slumping production highlights structural stagnation and prompts ECB policy dovishness.',
    whatItMeasures: 'Factory floor output across automotive, chemical, and mechanical engineering sectors.',
    whoReleasesIt: 'Destatis (Wiesbaden, Germany).',
    frequency: 'Monthly, approximately 38 days after month end.',
    affectedMarkets: [
      { asset: 'EUR/USD', sensitivity: 'Medium', rationale: 'Weaker industrial output reinforces ECB interest rate easing expectations.' },
      { asset: 'DAX 40', sensitivity: 'High', rationale: 'Direct barometer of domestic German corporate order books.' }
    ],
    transmission: {
      origin: 'Destatis Production Release',
      nodes: [
        { label: 'Industrial Output Drop (-0.5%)', description: 'Automotive and chemical contraction' },
        { label: 'Eurozone Growth Trackers', description: 'Q3 GDP forecasts trimmed' },
        { label: 'ECB Easing Sentiment', description: 'Reinforces dovish ECB stance' }
      ],
      summary: 'German Factory Output Miss → Eurozone GDP Drag → Dovish ECB Expectations → EUR/USD Pressured'
    }
  },
  {
    id: 'event-cn-trade-bal',
    name: 'China Trade Balance (USD)',
    code: 'CN-TRADE',
    country: 'China',
    countryCode: 'CN',
    currency: 'CNY',
    category: 'Trade',
    impact: 'HIGH',
    dateTime: '2026-09-07T09:00:00Z',
    period: 'Aug 2026',
    status: 'Released',
    source: 'General Administration of Customs China',
    unit: 'B',
    previous: 84.6,
    forecast: 83.9,
    forecastType: 'Consensus',
    actual: 91.0,
    surprise: 7.1,
    surpriseFormatted: '+$7.1B',
    surpriseDirection: 'Stronger than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Calculates the difference between China’s merchandise exports and imports denominated in US dollars.',
    whyItMatters: 'China is the global export factory. A widening surplus reflects resilient global trade demand and domestic import dynamics.',
    whatItMeasures: 'Net exports of manufactured products, electric vehicles, and battery equipment.',
    whoReleasesIt: 'General Administration of Customs (Beijing).',
    frequency: 'Monthly, around the 7th of each month.',
    affectedMarkets: [
      { asset: 'AUD/USD', sensitivity: 'High', rationale: 'Australia is China’s primary iron ore and commodity supplier.' },
      { asset: 'USD/CNH', sensitivity: 'Medium', rationale: 'Strong surplus provides sovereign support to the Yuan.' }
    ],
    transmission: {
      origin: 'Customs Export Surge',
      nodes: [
        { label: 'Trade Surplus Beats ($91B)', description: 'Exports beat, imports soften' },
        { label: 'Commodity Demand Proxy', description: 'Supports Australian trade partners' },
        { label: 'AUD/USD Lift', description: 'Antipodean currencies bid in Asian trading' }
      ],
      summary: 'China Export Surge → Antipodean Trade Relief → AUD/USD Support'
    }
  },
  {
    id: 'event-eu-sentix',
    name: 'Eurozone Sentix Investor Confidence Index',
    code: 'EU-SENTIX',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    category: 'Sentiment',
    impact: 'LOW',
    dateTime: '2026-09-07T08:30:00Z',
    period: 'Sep 2026',
    status: 'Released',
    source: 'Sentix GmbH',
    unit: 'Index',
    previous: -13.9,
    forecast: -12.5,
    forecastType: 'Consensus',
    actual: -15.4,
    surprise: -2.9,
    surpriseFormatted: '-2.9 pts',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Monthly survey of over 1,000 institutional and private investors assessing current Eurozone economic conditions and 6-month forward outlook.',
    whyItMatters: 'Gauges European financial market sentiment ahead of official PMIs.',
    whatItMeasures: 'Expectations index and present situation index.',
    whoReleasesIt: 'Sentix Economic Research (Frankfurt).',
    frequency: 'Monthly, on the first Monday of each month.',
    affectedMarkets: [
      { asset: 'EUR/USD', sensitivity: 'Low', rationale: 'Sentiment indicator with mild intraday influence.' }
    ],
    transmission: {
      origin: 'Sentix Survey',
      nodes: [{ label: 'Confidence Slips', description: 'Institutional expectations soften' }],
      summary: 'Investor Sentiment Softening'
    }
  },

  // --- TUE SEP 8, 2026 ---
  {
    id: 'event-rba-rate',
    name: 'Reserve Bank of Australia (RBA) Official Cash Rate Decision',
    code: 'RBA-RATE',
    country: 'Australia',
    countryCode: 'AU',
    currency: 'AUD',
    category: 'Central Bank',
    impact: 'HIGH',
    dateTime: '2026-09-08T04:30:00Z',
    period: 'Sep 2026',
    status: 'Released',
    source: 'Reserve Bank of Australia (Sydney)',
    sourceUrl: 'https://www.rba.gov.au',
    unit: '%',
    previous: 4.35,
    forecast: 4.35,
    forecastType: 'Consensus',
    actual: 4.35,
    surprise: 0.0,
    surpriseFormatted: '0.0%',
    surpriseDirection: 'In line',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The RBA Board decides whether to raise, lower, or maintain Australia’s overnight cash rate target.',
    whyItMatters: 'Governs bank funding costs and retail mortgage rates across Australia; directly moves AUD currency crosses.',
    whatItMeasures: 'Target overnight money market rate.',
    whoReleasesIt: 'RBA Governor Michele Bullock & Policy Board.',
    frequency: 'Eight monetary policy decisions per year.',
    affectedMarkets: [
      { asset: 'AUD/USD', sensitivity: 'Very High', rationale: 'Interest rate differential against US Fed Funds.' },
      { asset: 'AUD/NZD & AUD/JPY', sensitivity: 'High', rationale: 'Cross-currency yield divergence.' }
    ],
    transmission: {
      origin: 'RBA Hold at 4.35%',
      nodes: [
        { label: 'Policy Rate Unchanged', description: 'Persistent domestic services inflation noted' },
        { label: 'Hawkish Guidance', description: 'Governor Bullock rules out near-term cuts' },
        { label: 'AUD Demand', description: 'Yield advantage preserved against peers' }
      ],
      summary: 'RBA Cash Rate Maintained → Hawkish Guidance → Aussie Dollar Supported'
    }
  },
  {
    id: 'event-de-cpi-final',
    name: 'Germany Consumer Price Index (CPI Final YoY)',
    code: 'DE-CPI-F',
    country: 'Germany',
    countryCode: 'EU',
    currency: 'EUR',
    category: 'Inflation',
    impact: 'LOW',
    dateTime: '2026-09-08T06:00:00Z',
    period: 'Aug 2026',
    status: 'Released',
    source: 'Destatis',
    unit: '%',
    previous: 1.9,
    forecast: 1.9,
    forecastType: 'Consensus',
    actual: 1.9,
    surprise: 0.0,
    surpriseFormatted: '0.0%',
    surpriseDirection: 'In line',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Final official confirmation of German headline inflation for August.',
    whyItMatters: 'Confirms that German inflation dipped below the ECB 2% ceiling for the first time in three years.',
    whatItMeasures: 'Validated consumer basket price changes.',
    whoReleasesIt: 'Destatis.',
    frequency: 'Monthly confirmation.',
    affectedMarkets: [
      { asset: 'EUR/USD', sensitivity: 'Low', rationale: 'Final print matches preliminary reading; volatility negligible.' }
    ],
    transmission: {
      origin: 'Destatis Final Print',
      nodes: [{ label: '1.9% Confirmed', description: 'Inflation beneath 2% target' }],
      summary: 'Final German CPI confirmed at 1.9%.'
    }
  },
  {
    id: 'event-us-nfib',
    name: 'US NFIB Small Business Optimism Index',
    code: 'NFIB',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Business',
    impact: 'LOW',
    dateTime: '2026-09-08T10:00:00Z',
    period: 'Aug 2026',
    status: 'Released',
    source: 'National Federation of Independent Business',
    unit: 'Index',
    previous: 93.7,
    forecast: 93.6,
    forecastType: 'Consensus',
    actual: 91.2,
    surprise: -2.4,
    surpriseFormatted: '-2.4 pts',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Gauges hiring plans, capital expenditure intentions, and sales outlook of American small enterprise owners.',
    whyItMatters: 'Small businesses represent nearly half of all private US employment.',
    whatItMeasures: 'Composite index of 10 small business components.',
    whoReleasesIt: 'NFIB Research Center.',
    frequency: 'Monthly on the second Tuesday.',
    affectedMarkets: [
      { asset: 'Russell 2000 (Small Caps)', sensitivity: 'Medium', rationale: 'Direct proxy for small business financing hurdles.' }
    ],
    transmission: {
      origin: 'NFIB Index',
      nodes: [{ label: 'Optimism Drops (91.2)', description: 'High borrowing costs cited' }],
      summary: 'Small business sentiment cools on financing friction.'
    }
  },

  // --- WED SEP 9, 2026 ---
  {
    id: 'event-boc-rate',
    name: 'Bank of Canada (BoC) Overnight Rate Decision',
    code: 'BOC-RATE',
    country: 'Canada',
    countryCode: 'CA',
    currency: 'CAD',
    category: 'Central Bank',
    impact: 'HIGH',
    dateTime: '2026-09-09T13:45:00Z',
    period: 'Sep 2026',
    status: 'Released',
    source: 'Bank of Canada (Ottawa)',
    sourceUrl: 'https://www.bankofcanada.ca',
    unit: '%',
    previous: 4.50,
    forecast: 4.25,
    forecastType: 'Consensus',
    actual: 4.25,
    surprise: 0.0,
    surpriseFormatted: '0.0%',
    surpriseDirection: 'In line',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The Bank of Canada announces its target for the overnight lending rate, enacting a 25 bps rate cut.',
    whyItMatters: 'Governs financial conditions across Canada and directly drives USD/CAD carry dynamics.',
    whatItMeasures: 'Canadian benchmark overnight interest rate target.',
    whoReleasesIt: 'BoC Governor Tiff Macklem & Governing Council.',
    frequency: 'Eight policy decisions per calendar year.',
    affectedMarkets: [
      { asset: 'USD/CAD', sensitivity: 'Very High', rationale: 'Widening rate spread against US Federal Funds.' },
      { asset: 'CAD/JPY', sensitivity: 'High', rationale: 'Cross-currency yield divergence.' }
    ],
    transmission: {
      origin: 'BoC 25 bps Cut (4.25%)',
      nodes: [
        { label: 'Policy Rate Cut to 4.25%', description: 'Third consecutive 25 bps reduction' },
        { label: 'Canadian Bond Yields', description: '2Y GoC yields drop 6 bps' },
        { label: 'Loonie Weakness', description: 'USD/CAD tests resistance above 1.3550' }
      ],
      summary: 'BoC Rate Easing → Canadian Yields Drop → USD/CAD Advances'
    }
  },
  {
    id: 'event-us-jolts',
    name: 'US JOLTS Job Openings (Jul)',
    code: 'JOLTS',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Employment',
    impact: 'HIGH',
    dateTime: '2026-09-09T14:00:00Z',
    period: 'Jul 2026',
    status: 'Released',
    source: 'U.S. Bureau of Labor Statistics (BLS)',
    sourceUrl: 'https://www.bls.gov/jlt/',
    unit: 'M',
    previous: 7.91,
    revisedPrevious: 7.67,
    revisionDetails: {
      previousPublished: 7.91,
      revisedValue: 7.67,
      revisionDate: '2026-09-09',
      reason: 'BLS annual establishment sample recalibration lowering June job openings count by 240,000.'
    },
    forecast: 8.10,
    forecastType: 'Consensus',
    actual: 7.67,
    surprise: -0.43,
    surpriseFormatted: '-0.43M',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Calculates the total number of unfilled job positions across the US on the final business day of July.',
    whyItMatters: 'Federal Reserve policymakers monitor JOLTS closely as a reliable barometer of labor market cooling before unemployment rises.',
    whatItMeasures: 'Total job vacancies open to outside applicants across nonfarm business establishments.',
    whoReleasesIt: 'U.S. Bureau of Labor Statistics (BLS).',
    frequency: 'Monthly, approximately one month lag.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'High', rationale: 'Labor demand cooling fuels Fed easing expectations.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'High', rationale: 'Treasury yields decline on slower hiring demand.' }
    ],
    transmission: {
      origin: 'BLS JOLTS Vacancies Miss',
      nodes: [
        { label: 'Job Openings Fall to 7.67M', description: 'Lowest vacancy print since early 2021' },
        { label: 'Fed Funds Pricing', description: 'Odds of 50 bps September cut rise to 42%' },
        { label: 'Treasury Yield Repricing', description: '10Y yield declines 5 bps' },
        { label: 'Gold Rallies', description: 'XAU/USD breaks higher toward $2,520' }
      ],
      summary: 'JOLTS Vacancies Miss → Fed Easing Expectations Rise → US Yields Slide → Gold Rallies'
    }
  },
  {
    id: 'event-eia-crude',
    name: 'EIA Weekly Crude Oil Stocks Change',
    code: 'EIA-OIL',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Energy',
    impact: 'LOW',
    dateTime: '2026-09-09T14:30:00Z',
    period: 'Sep 4',
    status: 'Released',
    source: 'U.S. Energy Information Administration',
    unit: 'M',
    previous: -6.87,
    forecast: -0.9,
    forecastType: 'Consensus',
    actual: 0.83,
    surprise: 1.73,
    surpriseFormatted: '+1.73M bbls',
    surpriseDirection: 'Weaker than expected',
    higher_value_interpretation: 'negative',
    lower_value_interpretation: 'positive',
    simpleExplanation: 'Weekly measure of the change in commercial crude oil barrels stored by US companies (excluding the Strategic Petroleum Reserve).',
    whyItMatters: 'Indicates short-term refinery demand and commercial petroleum inventory buildup.',
    whatItMeasures: 'Net weekly physical inventory flow.',
    whoReleasesIt: 'Energy Information Administration (Washington, DC).',
    frequency: 'Weekly on Wednesdays at 10:30 ET.',
    affectedMarkets: [
      { asset: 'WTI Crude Oil', sensitivity: 'Medium', rationale: 'Inventory build dampens spot crude futures.' }
    ],
    transmission: {
      origin: 'EIA Inventory Data',
      nodes: [{ label: 'Surprise Build (+0.83M)', description: 'Refinery utilization eases' }],
      summary: 'Unexpected inventory buildup softens WTI intraday.'
    }
  },

  // --- THU SEP 10, 2026 (TODAY!) ---
  {
    id: 'event-ecb-press',
    name: 'ECB President Christine Lagarde Press Conference',
    code: 'ECB-CONF',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    category: 'Speeches',
    impact: 'HIGH',
    dateTime: '2026-09-10T12:45:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'European Central Bank (Frankfurt)',
    sourceUrl: 'https://www.ecb.europa.eu',
    unit: 'Speech',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'President Lagarde and Vice-President de Guindos present the economic assessment and take questions from financial journalists.',
    whyItMatters: 'Provides the definitive market explanation for the rate decision and crucial forward guidance on the quarterly trajectory of Eurozone policy.',
    whatItMeasures: 'Central bank forward guidance and updated staff macroeconomic projections (GDP and HICP inflation).',
    whoReleasesIt: 'ECB Communications Bureau.',
    frequency: 'Eight policy press briefings per year.',
    affectedMarkets: [
      { asset: 'EUR/USD', sensitivity: 'Very High', rationale: 'Intraday volatility routinely exceeds 70 pips during the Q&A session.' },
      { asset: 'European Sovereign Debt', sensitivity: 'High', rationale: 'Bund-BTP spreads reprice on debt sustainability comments.' }
    ],
    transmission: {
      origin: 'Lagarde Live Remarks',
      nodes: [
        { label: 'Macro Projection Review', description: 'Updated 2026/2027 inflation path' },
        { label: 'Journalist Q&A', description: 'Clarifies whether October rate cut is on the table' },
        { label: 'EUR/USD Discovery', description: 'Directional intraday trend established' }
      ],
      summary: 'ECB Press Conference → Forward Guidance Clarification → Bund Yield Repricing → EUR/USD Trend Discovery'
    }
  },
  {
    id: 'event-us-claims-sep10',
    name: 'US Initial Jobless Claims',
    code: 'US-CLAIMS',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Employment',
    impact: 'MEDIUM',
    dateTime: '2026-09-10T12:30:00Z',
    period: 'Sep 5',
    status: 'Upcoming',
    source: 'U.S. Department of Labor (DOL)',
    sourceUrl: 'https://www.dol.gov',
    unit: 'K',
    previous: 227,
    revisedPrevious: 228,
    revisionDetails: {
      previousPublished: 227,
      revisedValue: 228,
      revisionDate: '2026-09-10',
      reason: 'State labor department final filing reconciliation.'
    },
    forecast: 230,
    forecastType: 'Consensus',
    higher_value_interpretation: 'negative',
    lower_value_interpretation: 'positive',
    simpleExplanation: 'Weekly count of US workers filing for state unemployment benefits for the first time.',
    whyItMatters: 'The highest-frequency indicator of layoffs and labor market deterioration in the United States.',
    whatItMeasures: 'First-time unemployment insurance claims.',
    whoReleasesIt: 'Department of Labor (Washington, DC).',
    frequency: 'Weekly on Thursdays at 08:30 ET.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Medium', rationale: 'Spikes in claims accelerate Fed rate cut expectations.' },
      { asset: 'US 2Y Yield', sensitivity: 'Medium', rationale: 'Direct input into short-term rate probability models.' }
    ],
    transmission: {
      origin: 'DOL Weekly Claims',
      nodes: [
        { label: 'First-Time Filings', description: 'Weekly layoff pace' },
        { label: 'Continuing Claims Trend', description: 'Difficulty finding replacement employment' }
      ],
      summary: 'Jobless Claims → Short-End Rate Pricing → Intraday USD Volatility'
    }
  },
  {
    id: 'event-us-ppi-sep10',
    name: 'US Producer Price Index (PPI MoM & Core PPI)',
    code: 'US-PPI',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Inflation',
    impact: 'MEDIUM',
    dateTime: '2026-09-10T12:30:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'U.S. Bureau of Labor Statistics (BLS)',
    sourceUrl: 'https://www.bls.gov/ppi/',
    unit: '%',
    previous: 0.1,
    forecast: 0.2,
    forecastType: 'Consensus',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Measures wholesale price inflation at the factory gate and wholesale pipeline before goods reach retail consumers.',
    whyItMatters: 'Wholesale producer costs feed directly into consumer prices and the Fed’s preferred Core PCE gauge.',
    whatItMeasures: 'Final demand goods and services producer selling prices.',
    whoReleasesIt: 'U.S. Bureau of Labor Statistics.',
    frequency: 'Monthly, typically day before or following CPI.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Medium', rationale: 'Refines expectations for upcoming Core PCE release.' }
    ],
    transmission: {
      origin: 'BLS Producer Prices',
      nodes: [{ label: 'Pipeline Input Costs', description: 'Wholesale inflation feeding retail channels' }],
      summary: 'Factory gate prices shaping PCE expectations.'
    }
  },
  {
    id: 'event-eia-natgas',
    name: 'EIA Weekly Natural Gas Storage Change',
    code: 'EIA-GAS',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Energy',
    impact: 'LOW',
    dateTime: '2026-09-10T14:30:00Z',
    period: 'Sep 4',
    status: 'Upcoming',
    source: 'U.S. Energy Information Administration',
    unit: 'Bcf',
    previous: 13,
    forecast: 49,
    forecastType: 'Consensus',
    higher_value_interpretation: 'negative',
    lower_value_interpretation: 'positive',
    simpleExplanation: 'Measures the net weekly change in underground working natural gas stocks across the contiguous United States.',
    whyItMatters: 'Drives prompt month Henry Hub Natural Gas futures contract pricing.',
    whatItMeasures: 'Billion cubic feet (Bcf) injected or withdrawn.',
    whoReleasesIt: 'EIA.',
    frequency: 'Weekly on Thursdays at 10:30 ET.',
    affectedMarkets: [
      { asset: 'Henry Hub Natural Gas', sensitivity: 'High', rationale: 'Direct supply-demand balance barometer.' }
    ],
    transmission: {
      origin: 'EIA Underground Gas Storage',
      nodes: [{ label: 'Weekly Injections', description: 'Storage capacity tracking before winter' }],
      summary: 'Storage level change impacting energy futures.'
    }
  },
  {
    id: 'event-us-30y-bond',
    name: 'US Treasury 30-Year Bond Auction',
    code: 'US-30Y',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Auctions',
    impact: 'NON-ECONOMIC',
    dateTime: '2026-09-10T17:00:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'U.S. Department of the Treasury',
    unit: '%',
    previous: 4.31,
    forecast: 4.28,
    forecastType: 'Consensus',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Treasury auctions $22 billion in 30-year sovereign debt to primary dealers, institutional funds, and foreign accounts.',
    whyItMatters: 'Weak investor demand (high bid-to-cover tails) pushes benchmark long-term mortgage yields higher.',
    whatItMeasures: 'Auction clearing high yield and indirect bidder participation ratio.',
    whoReleasesIt: 'Bureau of the Fiscal Service.',
    frequency: 'Monthly Treasury debt reopening.',
    affectedMarkets: [
      { asset: 'US 30Y Treasury Yield', sensitivity: 'Medium', rationale: 'Clearing yield indicates long-term institutional inflation premium.' }
    ],
    transmission: {
      origin: 'Treasury Debt Auction',
      nodes: [{ label: 'Dealer Allotment', description: 'Bid-to-cover and foreign demand ratio' }],
      summary: 'Sovereign debt auction results.'
    }
  },

  // --- FRI SEP 11, 2026 ---
  {
    id: 'event-us-core-cpi-mom',
    name: 'US Core CPI (MoM)',
    code: 'CORE-CPI-M',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Inflation',
    impact: 'HIGH',
    dateTime: '2026-09-11T12:30:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'U.S. Bureau of Labor Statistics (BLS)',
    unit: '%',
    previous: 0.2,
    forecast: 0.2,
    forecastType: 'Consensus',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Measures monthly change in consumer prices excluding volatile food and energy costs.',
    whyItMatters: 'The single most critical inflation metric for the Federal Open Market Committee (FOMC) heading into the September 16 rate meeting.',
    whatItMeasures: 'Shelter, transportation services, medical care, and core goods basket price velocity.',
    whoReleasesIt: 'BLS.',
    frequency: 'Monthly.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'A +0.3% or higher print eliminates odds of a 50 bps Fed rate cut.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Real yields reprice instantly upon the 12:30 GMT release.' }
    ],
    transmission: {
      origin: 'BLS Core CPI Print',
      nodes: [
        { label: 'MoM Core Velocity', description: 'Checks shelter component persistence' },
        { label: 'Fed Target Repricing', description: 'Sets 25 vs 50 bps probability' }
      ],
      summary: 'Core CPI Print → Fed Meeting Trajectory → US Dollar Repricing'
    }
  },
  {
    id: 'event-us-uom-sent',
    name: 'University of Michigan Consumer Sentiment (Prelim)',
    code: 'MICH-SENT',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    category: 'Consumer',
    impact: 'MEDIUM',
    dateTime: '2026-09-11T14:00:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'University of Michigan Surveys of Consumers',
    unit: 'Index',
    previous: 67.9,
    forecast: 68.3,
    forecastType: 'Consensus',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Survey measuring American households’ financial optimism and long-term 5-year inflation expectations.',
    whyItMatters: 'Federal Reserve Chairman Jerome Powell has cited Michigan 5-year inflation expectations as a key gauge of whether public inflation expectations remain anchored.',
    whatItMeasures: 'Current economic conditions index and consumer expectations index.',
    whoReleasesIt: 'University of Michigan (Ann Arbor).',
    frequency: 'Twice monthly (Preliminary on 2nd Friday, Final on 4th Friday).',
    affectedMarkets: [
      { asset: 'US Equities', sensitivity: 'Medium', rationale: 'Consumer discretionary spending prospects.' },
      { asset: 'USD / DXY', sensitivity: 'Medium', rationale: 'Inflation expectations component can prompt sudden yield shifts.' }
    ],
    transmission: {
      origin: 'Michigan Survey Data',
      nodes: [
        { label: 'Headline Sentiment (68.3)', description: 'Consumer pocketbook confidence' },
        { label: '5-Year Inflation Expectation', description: 'Inflation expectations anchoring gauge' }
      ],
      summary: 'Consumer Confidence & Long-Term Inflation Expectations.'
    }
  },

  // --- SAT SEP 12, 2026 ---
  {
    id: 'event-cn-new-loans',
    name: 'China New Yuan Loans & Aggregate Financing',
    code: 'CN-LOANS',
    country: 'China',
    countryCode: 'CN',
    currency: 'CNY',
    category: 'Central Bank',
    impact: 'MEDIUM',
    dateTime: '2026-09-12T08:00:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'People’s Bank of China (PBoC)',
    unit: 'B',
    previous: 260,
    forecast: 1020,
    forecastType: 'Consensus',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Measures total volume of new bank loans and broad credit extended across China’s real economy.',
    whyItMatters: 'Critical read on whether monetary easing and infrastructure bond issuance are stimulating corporate borrowing.',
    whatItMeasures: 'Aggregate financing to the real economy and bank credit creation.',
    whoReleasesIt: 'People’s Bank of China (Beijing).',
    frequency: 'Monthly, usually between the 10th and 15th.',
    affectedMarkets: [
      { asset: 'China A50 & Hang Seng', sensitivity: 'High', rationale: 'Liquidity availability for Chinese corporate sectors.' },
      { asset: 'Copper & Industrial Metals', sensitivity: 'High', rationale: 'Credit expansion drives real estate and construction demand.' }
    ],
    transmission: {
      origin: 'PBoC Credit Expansion',
      nodes: [{ label: 'New Credit Creation', description: 'Corporate borrowing demand' }],
      summary: 'Chinese credit expansion indicator.'
    }
  },

  // --- NEXT WEEK: SUN SEP 13 - SAT SEP 19, 2026 ---
  {
    id: 'event-nz-services',
    name: 'New Zealand BusinessNZ Performance of Services Index (PSI)',
    code: 'NZ-PSI',
    country: 'New Zealand',
    countryCode: 'NZ',
    currency: 'NZD',
    category: 'Services',
    impact: 'LOW',
    dateTime: '2026-09-13T22:30:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'BusinessNZ',
    unit: 'Index',
    previous: 44.6,
    forecast: 45.8,
    forecastType: 'Model Estimate',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Measures activity levels and order growth across New Zealand services firms.',
    whyItMatters: 'Provides earliest read on Antipodean weekly open conditions.',
    whatItMeasures: 'Diffusion index of services sector health.',
    whoReleasesIt: 'BusinessNZ (Wellington).',
    frequency: 'Monthly.',
    affectedMarkets: [{ asset: 'NZD/USD', sensitivity: 'Low', rationale: 'Mild Sunday opening liquidity impact.' }],
    transmission: { origin: 'PSI Print', nodes: [{ label: 'Service Output', description: 'Antipodean growth read' }], summary: 'NZ Service Output' }
  },
  {
    id: 'event-eu-ind-prod',
    name: 'Eurozone Industrial Production (MoM)',
    code: 'EU-IP',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    category: 'Manufacturing',
    impact: 'MEDIUM',
    dateTime: '2026-09-14T09:00:00Z',
    period: 'Jul 2026',
    status: 'Upcoming',
    source: 'Eurostat',
    unit: '%',
    previous: -0.1,
    forecast: -0.3,
    forecastType: 'Consensus',
    higher_value_interpretation: 'positive',
    lower_value_interpretation: 'negative',
    simpleExplanation: 'Aggregated factory output across the 20 member nations of the Eurozone.',
    whyItMatters: 'Confirms continent-wide industrial performance following national German and French releases.',
    whatItMeasures: 'Industrial output volume.',
    whoReleasesIt: 'Eurostat (Luxembourg).',
    frequency: 'Monthly.',
    affectedMarkets: [{ asset: 'EUR/USD', sensitivity: 'Medium', rationale: 'European industrial baseline.' }],
    transmission: { origin: 'Eurostat Production', nodes: [{ label: 'Factory Output', description: 'Aggregated Eurozone performance' }], summary: 'Eurozone Industrial Output' }
  },
  {
    id: 'event-uk-cpi-sep26',
    name: 'UK Consumer Price Index (CPI YoY)',
    code: 'UK-CPI',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    category: 'Inflation',
    impact: 'HIGH',
    dateTime: '2026-09-16T06:00:00Z',
    period: 'Aug 2026',
    status: 'Upcoming',
    source: 'UK Office for National Statistics (ONS)',
    unit: '%',
    previous: 2.2,
    forecast: 2.2,
    forecastType: 'Consensus',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'Official measure of consumer price changes across the British economy.',
    whyItMatters: 'Key determining input for the Bank of England Monetary Policy Committee meeting scheduled for September 17.',
    whatItMeasures: 'Basket of goods and services prices in the United Kingdom.',
    whoReleasesIt: 'ONS (London).',
    frequency: 'Monthly.',
    affectedMarkets: [
      { asset: 'GBP/USD', sensitivity: 'Very High', rationale: 'Sterling reprices BoE interest rate path.' },
      { asset: 'EUR/GBP', sensitivity: 'High', rationale: 'Cross-rate inflation divergence.' }
    ],
    transmission: {
      origin: 'ONS UK CPI',
      nodes: [
        { label: 'Headline & Services Inflation', description: 'Services inflation sticky at 5.2%' },
        { label: 'BoE Decision Odds', description: 'Probability of Autumn BoE cut' }
      ],
      summary: 'UK Inflation Print → Bank of England Rate Expectations → GBP/USD Repricing'
    }
  },
  {
    id: 'event-snb-rate-sep26',
    name: 'Swiss National Bank (SNB) Monetary Policy Assessment',
    code: 'SNB-RATE',
    country: 'Switzerland',
    countryCode: 'CH',
    currency: 'CHF',
    category: 'Central Bank',
    impact: 'HIGH',
    dateTime: '2026-09-17T07:30:00Z',
    period: 'Q3 2026',
    status: 'Upcoming',
    source: 'Swiss National Bank (Zurich)',
    unit: '%',
    previous: 1.25,
    forecast: 1.00,
    forecastType: 'Consensus',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The SNB Governing Board sets the SNB policy interest rate.',
    whyItMatters: 'Switzerland was the first major developed economy to begin rate cuts. Franc strength is a major concern for Swiss exporters.',
    whatItMeasures: 'SNB policy rate benchmark.',
    whoReleasesIt: 'SNB Chairman Martin Schlegel.',
    frequency: 'Quarterly monetary policy assessment.',
    affectedMarkets: [
      { asset: 'USD/CHF', sensitivity: 'Very High', rationale: 'Interest rate differential.' },
      { asset: 'EUR/CHF', sensitivity: 'Very High', rationale: 'Primary cross managed by the SNB.' }
    ],
    transmission: {
      origin: 'SNB Rate Cut',
      nodes: [
        { label: 'Policy Rate Trim to 1.00%', description: 'Fighting excessive Franc strength' },
        { label: 'Swiss Franc Moves', description: 'EUR/CHF rebound' }
      ],
      summary: 'SNB Policy Rate Decision → Swiss Franc Repricing'
    }
  },
  {
    id: 'event-boe-rate-sep26',
    name: 'Bank of England (BoE) Official Bank Rate & Minutes',
    code: 'BOE-RATE',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    category: 'Central Bank',
    impact: 'HIGH',
    dateTime: '2026-09-17T11:00:00Z',
    period: 'Sep 2026',
    status: 'Upcoming',
    source: 'Bank of England (London)',
    unit: '%',
    previous: 5.00,
    forecast: 5.00,
    forecastType: 'Consensus',
    higher_value_interpretation: 'context-dependent',
    lower_value_interpretation: 'context-dependent',
    simpleExplanation: 'The 9-member Monetary Policy Committee (MPC) votes on the official Bank Rate and quantitative gilt sales.',
    whyItMatters: 'Primary lending benchmark for the United Kingdom. MPC vote split (e.g. 7-2 vs 5-4) reveals institutional easing momentum.',
    whatItMeasures: 'Bank Rate and MPC vote tally.',
    whoReleasesIt: 'Bank of England Governor Andrew Bailey.',
    frequency: 'Eight policy rounds per year.',
    affectedMarkets: [
      { asset: 'GBP/USD', sensitivity: 'Very High', rationale: 'Immediate sterling volatility.' },
      { asset: 'UK 10Y Gilts', sensitivity: 'Very High', rationale: 'Benchmark borrowing cost across Britain.' }
    ],
    transmission: {
      origin: 'BoE Vote Split',
      nodes: [
        { label: 'Vote Breakdown', description: 'Hawk vs dove division' },
        { label: 'Sterling Exchange Rate', description: 'GBP response' }
      ],
      summary: 'BoE Decision & Vote Split → Gilt Yields → Sterling Movement'
    }
  }
];
