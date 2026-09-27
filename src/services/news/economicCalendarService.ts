import { NormalizedEconomicEvent, EconomicCalendarFilterParams } from '@/types/normalizedCalendar';

export const COMPREHENSIVE_ECONOMIC_EVENTS: NormalizedEconomicEvent[] = [
  // --- Sunday, Sep 27, 2026 ---
  {
    id: 'evt-2026-09-27-china-profits',
    date: '2026-09-27',
    time: '01:30',
    dateTime: '2026-09-27T01:30:00Z',
    country: 'China',
    countryCode: 'CN',
    currency: 'CNY',
    event: 'China Industrial Profits (YoY)',
    importance: 'HIGH',
    previous: '4.1%',
    forecast: '3.8%',
    actual: '3.9%',
    status: 'RELEASED',
    source: 'National Bureau of Statistics of China',
    sourceUrl: 'http://www.stats.gov.cn',
    unit: '%',
    category: 'Economy',
    description: 'Year-to-date cumulative profits earned by industrial enterprises above designated size.',
    affectedMarkets: ['AUD/USD', 'USD/CNH', 'Copper', 'WTI Crude']
  },
  {
    id: 'evt-2026-09-27-opec-monitoring',
    date: '2026-09-27',
    time: '14:00',
    dateTime: '2026-09-27T14:00:00Z',
    country: 'Global',
    countryCode: 'WW',
    currency: 'USD',
    event: 'OPEC+ Ministerial Pre-Meeting Quota Compliance Review',
    importance: 'MEDIUM',
    status: 'RELEASED',
    source: 'OPEC Secretariat',
    sourceUrl: 'https://www.opec.org',
    category: 'Energy',
    description: 'Preliminary delegates session evaluating member country voluntary compensation cuts.',
    affectedMarkets: ['WTI Crude', 'Brent']
  },

  // --- Saturday, Sep 26, 2026 ---
  {
    id: 'evt-2026-09-26-cftc-gold',
    date: '2026-09-26',
    time: '01:30',
    dateTime: '2026-09-26T01:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'CFTC Gold Speculative Net Positions',
    importance: 'MEDIUM',
    previous: '241.2K',
    forecast: '248.5K',
    actual: '252.1K',
    revision: 'Upward +10.9K contracts',
    status: 'RELEASED',
    source: 'Commodity Futures Trading Commission',
    sourceUrl: 'https://www.cftc.gov',
    unit: 'Contracts',
    category: 'Commodities',
    description: 'Weekly report on commercial and speculative net commitments in COMEX gold futures.',
    affectedMarkets: ['XAU/USD', 'USD']
  },
  {
    id: 'evt-2026-09-26-baker-hughes',
    date: '2026-09-26',
    time: '17:00',
    dateTime: '2026-09-26T17:00:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'Baker Hughes US Oil Rig Count',
    importance: 'LOW',
    previous: '488',
    forecast: '486',
    actual: '485',
    status: 'RELEASED',
    source: 'Baker Hughes',
    sourceUrl: 'https://www.bakerhughes.com',
    unit: 'Rigs',
    category: 'Energy',
    description: 'Weekly indicator of drilling activity and future crude supply trajectory.',
    affectedMarkets: ['WTI Crude', 'Brent']
  },
  {
    id: 'evt-2026-09-26-ecb-speech',
    date: '2026-09-26',
    time: '18:30',
    dateTime: '2026-09-26T18:30:00Z',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    event: 'ECB Executive Board Member Speech on Digital Euro Framework',
    importance: 'LOW',
    status: 'RELEASED',
    source: 'European Central Bank',
    sourceUrl: 'https://www.ecb.europa.eu',
    category: 'Central Banks',
    description: 'Keynote discussion on payment infrastructure and cross-border settlement architecture.',
    affectedMarkets: ['EUR/USD']
  },

  // --- YESTERDAY: Friday, Sep 25, 2026 ---
  {
    id: 'evt-2026-09-25-us-pce',
    date: '2026-09-25',
    time: '12:30',
    dateTime: '2026-09-25T12:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'Core PCE Price Index (MoM)',
    importance: 'HIGH',
    previous: '0.2%',
    forecast: '0.2%',
    actual: '0.2%',
    revision: 'Prior confirmed',
    status: 'RELEASED',
    source: 'Bureau of Economic Analysis',
    sourceUrl: 'https://www.bea.gov',
    unit: '%',
    category: 'Inflation',
    description: 'The Federal Reserve principal gauge of underlying consumer inflation.',
    affectedMarkets: ['USD', 'XAU/USD', 'EUR/USD', 'S&P 500']
  },
  {
    id: 'evt-2026-09-25-michigan-sentiment',
    date: '2026-09-25',
    time: '14:00',
    dateTime: '2026-09-25T14:00:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'Michigan Consumer Sentiment (Final)',
    importance: 'MEDIUM',
    previous: '69.0',
    forecast: '70.1',
    actual: '70.5',
    revision: 'Prelim 69.8 revised to 70.5',
    status: 'RELEASED',
    source: 'University of Michigan',
    sourceUrl: 'https://www.sca.isr.umich.edu',
    unit: 'Index',
    category: 'Sentiment',
    description: 'Survey of consumer expectations, personal finances, and long-term inflation views.',
    affectedMarkets: ['USD', 'Stocks']
  },

  // --- PAST DATE: Thursday, Sep 24, 2026 ---
  {
    id: 'evt-2026-09-24-us-jobless',
    date: '2026-09-24',
    time: '12:30',
    dateTime: '2026-09-24T12:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'Initial Jobless Claims',
    importance: 'HIGH',
    previous: '221K',
    forecast: '224K',
    actual: '218K',
    revision: 'Down -3K claims',
    status: 'RELEASED',
    source: 'US Department of Labor',
    sourceUrl: 'https://www.dol.gov',
    unit: 'Thousands',
    category: 'Labor',
    description: 'Weekly measure of newly filed unemployment insurance claims.',
    affectedMarkets: ['USD', 'US Treasuries']
  },
  {
    id: 'evt-2026-09-24-us-new-homes',
    date: '2026-09-24',
    time: '14:00',
    dateTime: '2026-09-24T14:00:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'New Home Sales (MoM)',
    importance: 'MEDIUM',
    previous: '728K',
    forecast: '700K',
    actual: '716K',
    status: 'RELEASED',
    source: 'US Census Bureau',
    sourceUrl: 'https://www.census.gov',
    unit: 'Thousands',
    category: 'Housing',
    description: 'Annualized number of new single-family homes sold.',
    affectedMarkets: ['USD', 'Equities']
  },

  // --- PAST DATE: Wednesday, Sep 23, 2026 ---
  {
    id: 'evt-2026-09-23-global-pmi',
    date: '2026-09-23',
    time: '08:00',
    dateTime: '2026-09-23T08:00:00Z',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    event: 'HCOB Flash Eurozone Composite PMI',
    importance: 'HIGH',
    previous: '51.0',
    forecast: '50.6',
    actual: '49.1',
    status: 'RELEASED',
    source: 'S&P Global / HCOB',
    sourceUrl: 'https://www.spglobal.com',
    unit: 'Index',
    category: 'Economy',
    description: 'Survey measuring purchasing manager sentiment across manufacturing and services.',
    affectedMarkets: ['EUR/USD', 'DAX 40']
  },
  {
    id: 'evt-2026-09-23-us-flash-pmi',
    date: '2026-09-23',
    time: '13:45',
    dateTime: '2026-09-23T13:45:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'S&P Global Flash US Services PMI',
    importance: 'HIGH',
    previous: '55.7',
    forecast: '55.2',
    actual: '55.4',
    status: 'RELEASED',
    source: 'S&P Global',
    sourceUrl: 'https://www.spglobal.com',
    unit: 'Index',
    category: 'Economy',
    description: 'Leading indicator of private sector services business activity.',
    affectedMarkets: ['USD', 'S&P 500']
  },

  // --- PAST DATE: Sunday, Sep 20, 2026 ---
  {
    id: 'evt-2026-09-20-pboc-lpr',
    date: '2026-09-20',
    time: '01:15',
    dateTime: '2026-09-20T01:15:00Z',
    country: 'China',
    countryCode: 'CN',
    currency: 'CNY',
    event: 'PBoC 1-Year Loan Prime Rate (LPR)',
    importance: 'HIGH',
    previous: '3.35%',
    forecast: '3.35%',
    actual: '3.35%',
    status: 'RELEASED',
    source: 'People\'s Bank of China',
    sourceUrl: 'http://www.pbc.gov.cn',
    unit: '%',
    category: 'Central Banks',
    description: 'Benchmark interest rate for enterprise lending across Mainland China.',
    affectedMarkets: ['AUD/USD', 'USD/CNH', 'Copper']
  },

  // --- PAST DATE: Friday, Sep 18, 2026 ---
  {
    id: 'evt-2026-09-18-boe-decision',
    date: '2026-09-18',
    time: '11:00',
    dateTime: '2026-09-18T11:00:00Z',
    country: 'United Kingdom',
    countryCode: 'GB',
    currency: 'GBP',
    event: 'Bank of England Official Bank Rate',
    importance: 'HIGH',
    previous: '5.00%',
    forecast: '5.00%',
    actual: '5.00%',
    status: 'RELEASED',
    source: 'Bank of England',
    sourceUrl: 'https://www.bankofengland.co.uk',
    unit: '%',
    category: 'Central Banks',
    description: 'Bank of England Monetary Policy Committee policy interest rate decision.',
    affectedMarkets: ['GBP/USD', 'EUR/GBP', 'UK Gilts']
  },

  // --- PAST DATE: Tuesday, Sep 15, 2026 ---
  {
    id: 'evt-2026-09-15-us-retail-sales',
    date: '2026-09-15',
    time: '12:30',
    dateTime: '2026-09-15T12:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'US Retail Sales (MoM)',
    importance: 'HIGH',
    previous: '1.1%',
    forecast: '0.2%',
    actual: '0.1%',
    status: 'RELEASED',
    source: 'US Census Bureau',
    sourceUrl: 'https://www.census.gov',
    unit: '%',
    category: 'Economy',
    description: 'Primary measure of aggregate consumer retail receipts and spending momentum.',
    affectedMarkets: ['USD', 'S&P 500']
  },

  // --- PAST DATE: Thursday, Sep 10, 2026 ---
  {
    id: 'evt-2026-09-10-us-cpi-headline',
    date: '2026-09-10',
    time: '12:30',
    dateTime: '2026-09-10T12:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'US Consumer Price Index (YoY)',
    importance: 'HIGH',
    previous: '3.4%',
    forecast: '3.1%',
    actual: '3.2%',
    revision: 'Prior confirmed',
    status: 'RELEASED',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov',
    unit: '%',
    category: 'Inflation',
    description: 'Official monthly inflation rate tracking changes in retail prices paid by consumers.',
    affectedMarkets: ['USD', 'XAU/USD', 'EUR/USD', 'S&P 500']
  },

  // --- UPCOMING: Monday, Sep 28, 2026 ---
  {
    id: 'evt-2026-09-28-dallas-fed',
    date: '2026-09-28',
    time: '14:30',
    dateTime: '2026-09-28T14:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'Dallas Fed Manufacturing Index',
    importance: 'MEDIUM',
    previous: '-9.7',
    forecast: '-7.2',
    status: 'SCHEDULED',
    source: 'Federal Reserve Bank of Dallas',
    sourceUrl: 'https://www.dallasfed.org',
    unit: 'Index',
    category: 'Manufacturing',
    description: 'Survey assessing operational conditions in Texas manufacturing sector.',
    affectedMarkets: ['USD', 'WTI Crude']
  },
  {
    id: 'evt-2026-09-28-ecb-lagarde',
    date: '2026-09-28',
    time: '16:00',
    dateTime: '2026-09-28T16:00:00Z',
    country: 'Eurozone',
    countryCode: 'EU',
    currency: 'EUR',
    event: 'ECB President Christine Lagarde Opening Address at Banking Congress',
    importance: 'HIGH',
    status: 'SCHEDULED',
    source: 'European Central Bank',
    sourceUrl: 'https://www.ecb.europa.eu',
    category: 'Central Banks',
    description: 'Keynote remarks regarding Eurozone monetary policy transmission and growth.',
    affectedMarkets: ['EUR/USD', 'Euro Bunds']
  },

  // --- UPCOMING: Tuesday, Sep 29, 2026 ---
  {
    id: 'evt-2026-09-29-us-job-openings',
    date: '2026-09-29',
    time: '14:00',
    dateTime: '2026-09-29T14:00:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'JOLTS Job Openings',
    importance: 'HIGH',
    previous: '7.67M',
    forecast: '7.64M',
    status: 'SCHEDULED',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov',
    unit: 'Millions',
    category: 'Labor',
    description: 'Monthly survey measuring total unfilled job openings and hiring demand.',
    affectedMarkets: ['USD', 'US Treasuries', 'S&P 500']
  },
  {
    id: 'evt-2026-09-29-us-cb-confidence',
    date: '2026-09-29',
    time: '14:00',
    dateTime: '2026-09-29T14:00:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'Conference Board Consumer Confidence',
    importance: 'HIGH',
    previous: '103.3',
    forecast: '102.9',
    status: 'SCHEDULED',
    source: 'The Conference Board',
    sourceUrl: 'https://www.conference-board.org',
    unit: 'Index',
    category: 'Sentiment',
    description: 'Widely followed indicator of consumer attitudes toward current business and employment conditions.',
    affectedMarkets: ['USD', 'S&P 500']
  },

  // --- UPCOMING: Wednesday, Sep 30, 2026 ---
  {
    id: 'evt-2026-09-30-adp-employment',
    date: '2026-09-30',
    time: '12:15',
    dateTime: '2026-09-30T12:15:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'ADP Nonfarm Private Employment Change',
    importance: 'HIGH',
    previous: '99K',
    forecast: '124K',
    status: 'SCHEDULED',
    source: 'ADP Research Institute',
    sourceUrl: 'https://www.adpemploymentreport.com',
    unit: 'Thousands',
    category: 'Labor',
    description: 'Leading preview of private sector non-government payroll employment growth.',
    affectedMarkets: ['USD', 'XAU/USD', 'S&P 500']
  },
  {
    id: 'evt-2026-09-30-eia-crude-stocks',
    date: '2026-09-30',
    time: '14:30',
    dateTime: '2026-09-30T14:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'EIA Weekly Crude Oil Stocks Change',
    importance: 'MEDIUM',
    previous: '-1.63M',
    forecast: '-0.85M',
    status: 'SCHEDULED',
    source: 'Energy Information Administration',
    sourceUrl: 'https://www.eia.gov',
    unit: 'Barrels',
    category: 'Energy',
    description: 'Weekly change in the number of commercial crude oil barrels stored by US firms.',
    affectedMarkets: ['WTI Crude', 'Brent', 'USD/CAD']
  },

  // --- UPCOMING: Friday, Oct 02, 2026 ---
  {
    id: 'evt-2026-10-02-us-nfp',
    date: '2026-10-02',
    time: '12:30',
    dateTime: '2026-10-02T12:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'US Non-Farm Payrolls (NFP)',
    importance: 'HIGH',
    previous: '142K',
    forecast: '146K',
    status: 'SCHEDULED',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov',
    unit: 'Thousands',
    category: 'Labor',
    description: 'Benchmark monthly indicator of net jobs created in the US economy, excluding agriculture.',
    affectedMarkets: ['USD', 'XAU/USD', 'EUR/USD', 'S&P 500', 'US 10Y Yield']
  },
  {
    id: 'evt-2026-10-02-us-unemployment',
    date: '2026-10-02',
    time: '12:30',
    dateTime: '2026-10-02T12:30:00Z',
    country: 'United States',
    countryCode: 'US',
    currency: 'USD',
    event: 'US Unemployment Rate',
    importance: 'HIGH',
    previous: '4.2%',
    forecast: '4.2%',
    status: 'SCHEDULED',
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov',
    unit: '%',
    category: 'Labor',
    description: 'Percentage of the total labor force that is unemployed and actively seeking employment.',
    affectedMarkets: ['USD', 'XAU/USD', 'EUR/USD']
  }
];

export function getEventsForDate(dateStr: string, filters?: EconomicCalendarFilterParams): NormalizedEconomicEvent[] {
  let events = COMPREHENSIVE_ECONOMIC_EVENTS.filter(e => e.date === dateStr);

  if (filters?.currency && filters.currency !== 'ALL') {
    events = events.filter(e => e.currency === filters.currency);
  }

  if (filters?.importance && filters.importance !== 'ALL') {
    events = events.filter(e => e.importance === filters.importance);
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    events = events.filter(e => 
      e.event.toLowerCase().includes(q) ||
      e.country.toLowerCase().includes(q) ||
      e.currency.toLowerCase().includes(q)
    );
  }

  // Sort by time
  return events.sort((a, b) => a.time.localeCompare(b.time));
}

export function getUpcomingEvents(fromDateStr: string, limit: number = 8): NormalizedEconomicEvent[] {
  return COMPREHENSIVE_ECONOMIC_EVENTS
    .filter(e => e.date > fromDateStr)
    .sort((a, b) => a.dateTime.localeCompare(b.dateTime))
    .slice(0, limit);
}
