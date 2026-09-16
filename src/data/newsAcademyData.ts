import { NewsAcademyArticle } from '@/types/newsIntelligence';

export const NEWS_ACADEMY_ARTICLES: NewsAcademyArticle[] = [
  // 1. FOMC Rate Decision & Monetary Policy
  {
    id: 'academy-fomc',
    slug: 'fomc-rate-decision',
    title: 'FOMC Rate Decision & Monetary Policy Framework',
    code: 'FOMC',
    category: 'Monetary Policy',
    currency: 'USD',
    impact: 'HIGH',
    difficulty: 'Intermediate',
    estimatedReadTime: '12 min',

    simpleDefinition: 'The Federal Reserve decides the benchmark interest rate that commercial banks charge each other for overnight loans, influencing all borrowing costs worldwide.',
    fullDefinition: 'The Federal Open Market Committee (FOMC) determines the target range for the federal funds rate, conducts open market operations, manages the size and composition of the Federal Reserve balance sheet (Quantitative Tightening/Easing), and issues economic forecasts (Summary of Economic Projections / "Dot Plot") that anchor global capital costs.',
    whyItExists: 'Congress mandated the Federal Reserve with a dual mandate: maximum sustainable employment and price stability (defined as a 2 percent annual inflation target over the longer run). Setting the policy interest rate is the primary tool to achieve balance between these objectives.',
    whoPublishesIt: 'The Federal Open Market Committee (FOMC), consisting of 12 voting members: the seven members of the Board of Governors of the Federal Reserve System, the president of the Federal Reserve Bank of New York, and 4 of the remaining 11 Reserve Bank presidents on a rotating basis.',
    howCalculated: 'Voting members convene in Washington D.C. for a two-day deliberation analyzing domestic growth, employment metrics, inflation gauges, financial conditions, and international developments. A formal roll-call vote is cast at the conclusion of the second day to set the target policy rate range.',
    releaseFrequency: 'Scheduled 8 times per year (every six weeks). Four of these meetings (March, June, September, December) include updated quarterly Summary of Economic Projections ("Dot Plot"). Every meeting is accompanied by a formal press conference by the Fed Chair.',
    whyTradersCare: 'The federal funds rate is the baseline discount rate for the global financial system. Every asset class—currencies, sovereign debt, corporate bonds, equities, real estate, gold, and crypto—is priced relative to the risk-free rate of return on US dollar assets.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'Direct adjustment of dollar yield advantage relative to foreign currencies.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Gold provides no interest yield. Lower interest rates reduce the opportunity cost of holding physical bullion.' },
      { asset: 'Treasury Yields (2Y & 10Y)', sensitivity: 'Very High', rationale: 'Reprices the government risk-free yield curve across all maturities.' },
      { asset: 'US Equities (S&P 500, Nasdaq)', sensitivity: 'High', rationale: 'Higher discount rates reduce the present value of future corporate earnings.' },
      { asset: 'Bitcoin & Crypto', sensitivity: 'Medium', rationale: 'Functions as a high-beta global liquidity barometer.' }
    ],
    whatHigherLowerMeans: {
      higher: 'Higher policy rates tighten borrowing conditions, raise loan costs, cool economic activity, and historically attract foreign capital to USD assets.',
      lower: 'Lower policy rates stimulate borrowing, expand credit availability, reduce cash yields, and encourage risk-taking into equities, commodities, and risk assets.',
      context: 'Markets do not react simply to the absolute rate number, but rather to whether the rate and forward guidance are higher or lower than what was ALREADY PRICED IN by the fed funds futures market.'
    },
    whenRelationshipBreaks: [
      'Sell the Fact Reaction: If a 25 bps rate cut is 100% priced in weeks before the meeting, the actual cut can trigger profit-taking and an immediate USD rally.',
      'Recession Panic: If the Fed cuts aggressively (e.g. emergency 50 bps cut) because the economy is deteriorating rapidly, equities may plunge instead of rallying due to earnings collapse fears.',
      'Sticky Inflation Constraints: If rates are cut while inflation is re-accelerating, long-term bond yields (10Y/30Y) can RISE as bond investors demand higher inflation risk premiums.'
    ],
    forecastVsActualVsPrevious: 'Always compare the decision against the CME FedWatch probabilities immediately prior to the release. A rate move that matches a 98% priced expectation produces minimal headline movement; it is the accompanying press statement and Dot Plot revisions that drive true volatility.',
    revisionsExplanation: 'The policy rate itself is not revised retroactively. However, the Committee quarterly revises its median forecast for future interest rates (the Dot Plot), GDP growth, unemployment, and PCE inflation for the next 3 years.',
    hawkishDovishRelevance: 'Hawkish indicates a preference for tighter monetary policy to combat inflation; Dovish indicates a preference for lower rates and accommodative policy to stimulate employment.',
    transmissionFlow: {
      steps: [
        'FOMC announces target rate & policy statement at 14:00 ET / 18:00 GMT',
        'Fed Funds futures and 2-Year Treasury yields instantly reprice within milliseconds',
        'Commercial banks adjust prime lending rates and money market rates',
        'Global FX dealers rebalance cross-currency interest rate parity differentials',
        'Equity, gold, and crypto trading desks adjust cash-flow discount models during Chair Press Conference at 14:30 ET'
      ],
      description: 'Central Bank Policy Rate → Money Market Funding Rates → Sovereign Yield Curve → Currency Arbitrage → Asset Valuation Models'
    },
    realWorldExample: {
      title: 'September 2024 Fed Easing Kickoff',
      date: 'September 18, 2024',
      eventContext: 'The Fed initiated its easing cycle with a 50 bps cut to 4.75%-5.00%, while markets were split 60/40 between 25 bps and 50 bps.',
      outcome: 'Gold surged to new all-time highs over $2,600/oz in subsequent weeks, while USD/JPY experienced multi-week consolidation after initial whipsawing.',
      lesson: 'The size of the initial move is less important than Chair Powell communication framing the 50 bps cut as a "recalibration" rather than an emergency panic.'
    },
    historicalExample: {
      date: 'March 2020',
      context: 'Two unscheduled emergency rate cuts down to 0.00%-0.25% alongside unlimited Quantitative Easing.',
      marketReaction: 'Initial dollar liquidity squeeze caused a temporary spike in USD and sell-off in gold, before the massive liquidity wave sparked a historical multi-year rally across stocks, crypto, and commodities.'
    },
    visualExplanationSteps: [
      'Step 1: Watch FedWatch tool 24 hours prior to confirm the priced consensus.',
      'Step 2: Read the Statement change markup at 14:00 ET (which sentences were added or deleted).',
      'Step 3: If a SEP meeting, compare new Dot Plot median against prior quarter.',
      'Step 4: Do not enter large market orders between 14:00 and 14:35 ET due to severe spread widening and quote fading.',
      'Step 5: Observe Chair Powell tone and opening statement during the press conference.'
    ],
    scenarioFramework: {
      hawkish: 'Fed holds when cut expected, or raises median rate forecast in Dot Plot. USD strengthens, Gold drops, Equities face valuation headwinds.',
      dovish: 'Fed cuts by more than expected or signals faster rate trajectory. USD softens, Gold rallies, Risk assets bid.',
      inLine: 'Rate decision matches priced expectation. Initial whipsaw subsides as traders wait for Chair press conference nuances.',
      mixed: 'Rate is cut, but press conference warns that future cuts are conditional on further inflation declines. Initial rally followed by sharp reversal.'
    },
    commonMistakes: [
      'Trading market orders at the exact second of release (suffering massive slippage and spread widening).',
      'Assuming a rate cut always means equities go up (ignoring that panic cuts often coincide with bear market crashes).',
      'Looking only at the interest rate number and completely ignoring the statement revisions and Dot Plot.',
      'Closing winning trades before the 14:30 ET press conference, which frequently reverses the initial 14:00 ET knee-jerk reaction.'
    ],
    beginnerMistakes: [
      'Thinking high rates mean a company cannot make profits.',
      'Trying to predict the rate decision instead of managing risk around the event.',
      'Holding maximum position leverage through the announcement without a guaranteed stop loss.'
    ],
    professionalInterpretation: 'Institutional desks trade the "terminal rate differential" and "neutral rate (R-star)" estimates. They observe real yields (TIPS) rather than nominal rates to gauge true financial tightness.',
    riskConsiderations: [
      'Liquidity can evaporate from the order book for 30 to 90 seconds around 14:00 ET.',
      'Broker spreads on EUR/USD and Gold can widen by 5x to 10x normal levels.',
      'Stop loss orders are filled at the next best available price, which may be significantly worse than your placed stop price.'
    ],
    relatedNewsCodes: ['CPI', 'NFP', 'PCE', 'RETAIL'],
    relatedAcademyLessonIds: ['academy-cpi', 'academy-nfp'],
    quiz: [
      {
        question: 'What is the primary dual mandate of the Federal Reserve?',
        options: [
          'Maximizing stock market returns and minimizing the national debt',
          'Price stability (2% inflation target) and maximum sustainable employment',
          'Pegging the US Dollar exchange rate against gold and foreign currencies',
          'Setting tax policy and controlling federal government spending'
        ],
        correctIndex: 1,
        explanation: 'Congress established the Fed statutory dual mandate specifically for price stability and maximum sustainable employment.'
      },
      {
        question: 'Why does Gold (XAU/USD) often rally when real interest rates fall?',
        options: [
          'Because gold is issued by the Federal Reserve',
          'Because commercial banks are forced by law to buy bullion',
          'Because gold yields zero interest, making it more attractive when cash yields drop',
          'Because lower rates instantly shut down gold mining operations'
        ],
        correctIndex: 2,
        explanation: 'Gold is a non-yielding asset. When real returns on risk-free cash and bonds decline, the opportunity cost of holding physical gold decreases.'
      },
      {
        question: 'What is the "Dot Plot"?',
        options: [
          'A chart of daily currency closing prices',
          'A graph showing where each FOMC member projects benchmark rates will be over the next several years',
          'A map of US bank branches',
          'An indicator tracking consumer credit card debt'
        ],
        correctIndex: 1,
        explanation: 'The Dot Plot is part of the quarterly Summary of Economic Projections, plotting where each committee member privately forecasts the fed funds rate.'
      }
    ],
    beginnerContent: 'The Federal Reserve is like the thermostat of the economy. When the economy is overheating and prices are rising too fast, the Fed turns up interest rates to cool things down. When the economy is slowing down and people are losing jobs, the Fed cuts interest rates to make borrowing cheaper and encourage spending. For traders, the Fed announcement is one of the most volatile days of the month.',
    traderContent: 'As a trader, your edge on FOMC day comes from understanding expectations vs reality. Never trade the 14:00 ET print with tight stops because spreads blow out and algorithms sweep both sides of liquidity. Watch the 2-Year Treasury yield: if the 2Y yield is plummeting, the market is pricing in dovish ease; if 2Y is spiking, the stance is hawkish regardless of headline wording.',
    professionalContent: 'Macro institutions evaluate the term structure of the SOFR/Fed Funds curve, the estimated neutral policy rate (R*), balance sheet roll-off runoff velocity (QT), and cross-asset financial conditions indices (GSFCI). Attention focuses heavily on the statement delta—the textual revisions between meetings analyzed via natural language processing algorithms.'
  },

  // 2. US Non-Farm Payrolls (NFP)
  {
    id: 'academy-nfp',
    slug: 'us-non-farm-payrolls',
    title: 'Non-Farm Payrolls (NFP) & Labor Market Dynamics',
    code: 'NFP',
    category: 'Employment',
    currency: 'USD',
    impact: 'HIGH',
    difficulty: 'Beginner',
    estimatedReadTime: '10 min',

    simpleDefinition: 'A monthly government report showing how many jobs American businesses added or lost during the previous month, along with the national unemployment rate and wage growth.',
    fullDefinition: 'The Employment Situation report, released monthly by the Bureau of Labor Statistics, comprises two separate surveys: the Establishment Survey (which produces Non-Farm Payrolls, Average Hourly Earnings, and Average Workweek) and the Household Survey (which produces the Unemployment Rate and Labor Force Participation Rate).',
    whyItExists: 'Employment is the vital pulse of consumer purchasing power. Under its statutory mandate for maximum sustainable employment, the Federal Reserve requires accurate, timely employment data to determine whether the economy requires restrictive, neutral, or stimulative interest rates.',
    whoPublishesIt: 'U.S. Bureau of Labor Statistics (BLS), an independent statistical research agency within the U.S. Department of Labor.',
    howCalculated: 'Derived from the Current Employment Statistics (CES) survey covering approximately 119,000 businesses and government agencies representing 629,000 individual worksites. Payroll counts workers on payroll during the pay period including the 12th day of the calendar month.',
    releaseFrequency: 'Monthly, virtually always on the first Friday following the end of the survey month at 08:30 Eastern Time (12:30 or 13:30 GMT).',
    whyTradersCare: 'NFP is widely regarded as the single most volatile recurring scheduled monthly data release in the financial markets. It sets the baseline narrative for US macroeconomic health for the entire subsequent month.',
    affectedMarkets: [
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'Strong labor markets reinforce higher-for-longer interest rate scenarios, supporting USD.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Generates dramatic initial multi-dollar swings within 60 seconds of the 08:30 ET print.' },
      { asset: 'EUR/USD & GBP/USD', sensitivity: 'High', rationale: 'Foreign exchange pairs reprice dollar valuation trends immediately.' },
      { asset: 'USD/JPY', sensitivity: 'Very High', rationale: 'Highly sensitive to US Treasury yield revisions triggered by the payroll print.' },
      { asset: 'S&P 500 & Nasdaq', sensitivity: 'High', rationale: 'Balances positive consumer demand against the cost of higher interest rate horizons.' }
    ],
    whatHigherLowerMeans: {
      higher: 'A higher than expected payroll print indicates robust hiring, resilient corporate demand, and tight labor conditions that could sustain wage pressure.',
      lower: 'A lower than expected print signals economic cooling, slower business hiring, and rising urgency for the central bank to ease monetary policy.',
      context: 'Always interpret the headline payroll number alongside Average Hourly Earnings. A strong payroll beat accompanied by falling wages can actually be perceived as a non-inflationary "Goldilocks" scenario.'
    },
    whenRelationshipBreaks: [
      'Bad News is Good News: During late-cycle slowdowns, weak job numbers can spark an equity rally because investors celebrate faster rate cuts.',
      'Good News is Bad News: During high inflation episodes, a blowout job number can cause stocks to plummet because it guarantees more aggressive rate hikes.',
      'Revision Erasure: When a current month beats expectations by +20K, but prior two months are quietly revised down by -80K, the market quickly sells off.'
    ],
    forecastVsActualVsPrevious: 'Consensus is compiled by surveys of economists (e.g. Bloomberg, Reuters). A surprise of +/- 50,000 or more from the consensus median routinely triggers significant immediate market dislocation.',
    revisionsExplanation: 'BLS collects additional late survey responses each month. Every NFP release recalculates and revises the previous two months. These revisions often alter the overall trajectory of labor momentum.',
    hawkishDovishRelevance: 'Strong employment data is hawkish (gives Fed green light to keep rates higher); weak employment data is dovish (pressures Fed to lower rates).',
    transmissionFlow: {
      steps: [
        'BLS releases report at 08:30 ET',
        'High-frequency algorithms execute on headline NFP, Unemployment, and Hourly Earnings simultaneously',
        'Short-term Treasury bond yields (2Y) reprice based on implied Fed rate probabilities',
        'Foreign exchange spot rates adjust to reflect yield differential changes',
        'Equities and precious metals balance interest rate discount effects against real economic demand'
      ],
      description: 'Establishment Payroll Data → Wage & Unemployment Metrics → 2Y Treasury Yield Repricing → FX Majors & Gold Velocity'
    },
    realWorldExample: {
      title: 'August 2, 2024 Labor Shock',
      date: 'August 2, 2024',
      eventContext: 'NFP printed just 114,000 against 175,000 expected, while unemployment jumped unexpectedly to 4.3%, triggering the Sahm Rule recession indicator.',
      outcome: 'US 2-Year Treasury yield crashed over 25 basis points in a day, USD/JPY plunged, and global equities experienced intense selling that culminated in the "Black Monday" unwind on August 5.',
      lesson: 'When unemployment crosses key quantitative threshold models (like the Sahm Rule), markets quickly shift from celebrating rate cuts to fearing growth collapse.'
    },
    historicalExample: {
      date: 'April 2020 (Covid Shock)',
      context: 'US non-farm payrolls dropped by an unprecedented -20.5 million jobs in a single month as national lockdowns took effect.',
      marketReaction: 'Historic volatility followed by unprecedented fiscal stimulus and monetary liquidity programs that launched a secular bull run.'
    },
    visualExplanationSteps: [
      '1. Check calendar time and timezone at least 1 hour before 08:30 ET.',
      '2. Note the consensus expectations: Headline jobs, Unemployment rate, and Average hourly earnings MoM.',
      '3. At 08:30 ET, do not attempt to guess the first 1-minute candle.',
      '4. Check the prior 2-month revisions before executing directional positions.',
      '5. Observe the 15-minute chart close to see which side of the range holds institutional volume.'
    ],
    scenarioFramework: {
      hawkish: 'Payrolls beat by >50K, unemployment ticks down, wage growth accelerates. USD rallies, Gold drops, Treasury yields surge.',
      dovish: 'Payrolls miss by >50K, unemployment rises, prior months revised down. USD slides, Gold gains upward momentum, Yields drop.',
      inLine: 'Prints within 10K-15K of consensus with steady unemployment. Market trades technical ranges after brief noise.',
      mixed: 'Headline beats but wages miss, or headline misses but unemployment drops. Initial whipsaw candles with delayed true trend formation.'
    },
    commonMistakes: [
      'Placing market orders 5 seconds before 08:30 ET (gambling with widening spreads).',
      'Ignoring the Unemployment Rate and wage growth numbers.',
      'Failing to account for prior two-month revisions.',
      'Entering positions with tight stops that get hit by the initial liquidity sweep.'
    ],
    beginnerMistakes: [
      'Assuming the market must go up if jobs are added.',
      'Confusing the ADP private payrolls report (released on Wednesday) with official government NFP.',
      'Leaving open limit orders near the pre-news market price.'
    ],
    professionalInterpretation: 'Institutional macro investors focus on the aggregate hours worked index and the employment-to-population ratio of prime-age workers (ages 25-54) to eliminate demographic distortion from aging baby boomers.',
    riskConsiderations: [
      'Spread blowout on major currency pairs can reach 4 to 8 pips on retail brokers.',
      'Slippage on stop orders is frequent during the initial 30 seconds.',
      'High likelihood of false initial breakout ("head-fake") that reverses within 10 minutes.'
    ],
    relatedNewsCodes: ['FOMC', 'CPI', 'RETAIL', 'CLAIMS'],
    relatedAcademyLessonIds: ['academy-fomc', 'academy-cpi'],
    quiz: [
      {
        question: 'Which agency is responsible for collecting and releasing the official monthly NFP report?',
        options: [
          'Federal Bureau of Investigation (FBI)',
          'U.S. Bureau of Labor Statistics (BLS)',
          'Automated Data Processing (ADP)',
          'Federal Reserve Bank of New York'
        ],
        correctIndex: 1,
        explanation: 'The U.S. Bureau of Labor Statistics (BLS) compiles the official Employment Situation report.'
      },
      {
        question: 'Why can a strong headline payroll number sometimes cause gold to drop?',
        options: [
          'Because gold miners are laid off when jobs increase',
          'Because strong employment supports higher interest rates, raising the opportunity cost of non-yielding gold',
          'Because gold is legally tied to the unemployment rate',
          'Because investors sell gold to buy physical factory machinery'
        ],
        correctIndex: 1,
        explanation: 'A strong labor market enables central banks to keep interest rates higher for longer, increasing yield on cash and dampening demand for non-yielding assets like Gold.'
      },
      {
        question: 'What are "prior month revisions" in the NFP report?',
        options: [
          'Typos made by the news agency that are corrected live on television',
          'Adjustments to the previous two months data based on additional late employer surveys',
          'Predictions of where employment will be five years in the future',
          'A political adjustment requested by Congress'
        ],
        correctIndex: 1,
        explanation: 'As additional survey responses arrive from employers over subsequent weeks, the BLS systematically updates and refines the estimates for the preceding two months.'
      }
    ],
    beginnerContent: 'Think of NFP as the monthly report card for the entire US job market. When companies are hiring lots of people, it means the economy is active. When hiring slows down, it warns that companies are getting cautious. Because American workers drive global consumer spending, traders all over the planet pause what they are doing on the first Friday of each month to watch this number.',
    traderContent: 'NFP strategy is all about patience. The initial 5-minute bar is largely driven by algorithmic headline scrapers that often get caught by conflicting sub-metrics or negative revisions. Wait for the 15-minute close. If the price reclaims the pre-news level after a spike, a mean-reversion trade often offers asymmetric risk-reward with predefined risk.',
    professionalContent: 'Evaluate the Household Survey employment level vs the Establishment CES survey. Persistent divergence often signals reliance on multiple part-time jobholders vs true net job creation. Monitor the Birth-Death statistical adjustment model, which imputes business formations and liquidations during macroeconomic transition periods.'
  },

  // 3. US Consumer Price Index (CPI)
  {
    id: 'academy-cpi',
    slug: 'us-consumer-price-index',
    title: 'Consumer Price Index (CPI) & Inflation Architecture',
    code: 'CPI',
    category: 'Inflation',
    currency: 'USD',
    impact: 'HIGH',
    difficulty: 'Intermediate',
    estimatedReadTime: '11 min',

    simpleDefinition: 'A monthly measurement of how much more or less everyday consumers are paying for a representative basket of goods and services, including food, housing, energy, and transportation.',
    fullDefinition: 'The Consumer Price Index (CPI) measures the average change over time in the prices paid by urban consumers for a fixed market basket of consumer goods and services. Core CPI removes the volatile food and energy sub-components to uncover the underlying, persistent trend in domestic inflation.',
    whyItExists: 'Unchecked inflation destroys purchasing power, distorts investment decisions, and penalizes savers. It is the core input for central banks when evaluating whether monetary policy is appropriately restrictive to protect price stability.',
    whoPublishesIt: 'U.S. Bureau of Labor Statistics (BLS).',
    howCalculated: 'BLS data collectors sample approximately 94,000 prices monthly across 23,000 retail and service establishments, along with 8,000 rental housing units across 75 urban areas nationwide. Shelter (rent and owners equivalent rent) constitutes over one-third of the total index weighting.',
    releaseFrequency: 'Monthly, typically during the second week of the month at 08:30 Eastern Time.',
    whyTradersCare: 'Inflation dictates the path of benchmark interest rates. During an inflation-focused macro regime, CPI releases frequently create more market volatility than the central bank rate decisions themselves, as the data forces the Fed hand.',
    affectedMarkets: [
      { asset: 'Treasury Yields (10Y & 2Y)', sensitivity: 'Very High', rationale: 'Direct repricing of inflation premiums and real interest rate horizons.' },
      { asset: 'USD / DXY', sensitivity: 'Very High', rationale: 'Higher inflation keeps dollar interest rates restrictive, attracting sovereign capital.' },
      { asset: 'Gold (XAU/USD)', sensitivity: 'Very High', rationale: 'Dual relationship: hedge against currency debasement long-term, but pressured by rising real yields short-term.' },
      { asset: 'Nasdaq / Tech Equities', sensitivity: 'High', rationale: 'High valuation growth stocks are deeply sensitive to the discount rates used on future earnings.' },
      { asset: 'Bitcoin (BTC/USD)', sensitivity: 'High', rationale: 'Acts both as a digital monetary debasement hedge and a risk-sensitive liquidity proxy.' }
    ],
    whatHigherLowerMeans: {
      higher: 'Higher than expected CPI means inflation is proving sticky or accelerating, compelling the central bank to keep rates restrictive for longer.',
      lower: 'Lower than expected CPI indicates disinflation is progressing, opening the door for interest rate reductions and looser financial conditions.',
      context: 'Always look at the Month-over-Month (MoM) Core CPI figure down to two decimal places (e.g. 0.28% vs 0.16%) rather than just the rounded Year-over-Year (YoY) headline.'
    },
    whenRelationshipBreaks: [
      'Stagflationary Scare: If CPI comes in hot while economic growth is collapsing, equities can drop precipitously because the Fed cannot rescue the economy with rate cuts.',
      'Base Effects: When calculating YoY changes, if a huge price jump from 12 months ago drops out of the calculation, the YoY rate can plummet even if prices rose that month.',
      'Shelter Lag: Official shelter CPI uses a 6-month survey lag on existing leases. Markets often look past hot official shelter prints if private real-time rent indices (Zillow, Apartment List) show declining rents.'
    ],
    forecastVsActualVsPrevious: 'Compare headline MoM, headline YoY, Core MoM, and Core YoY. Core MoM is the number institutional desks care about most.',
    revisionsExplanation: 'CPI data is subject to annual seasonal adjustment factor revisions each February, which recalculate monthly patterns over the previous 5 years.',
    hawkishDovishRelevance: 'Hot CPI is Hawkish (favors tighter rates); Cool CPI is Dovish (favors rate cuts).',
    transmissionFlow: {
      steps: [
        'CPI published at 08:30 ET',
        'Inflation breakeven rates on TIPS (Treasury Inflation-Protected Securities) adjust',
        'Nominal Treasury yields shift, recalculating real yields (Nominal minus Inflation)',
        'Foreign exchange traders adjust carry trade rate expectations',
        'Equities reprice duration assets based on new cost-of-capital estimates'
      ],
      description: 'Consumer Price Basket → Inflation Breakevens & Real Yields → Fed Rate Path → Equities & FX Repricing'
    },
    realWorldExample: {
      title: 'The June 2022 9.1% Inflation Peak',
      date: 'June 2022',
      eventContext: 'US headline CPI surged to 9.1% YoY, the highest level in 40 years, driven by energy shocks and post-pandemic supply chain bottlenecks.',
      outcome: 'Prompted the Federal Reserve to implement unprecedented consecutive 75 basis-point rate hikes, initiating the aggressive rate-hiking cycle that defined 2022-2023.',
      lesson: 'Extreme inflation shocks override all other economic considerations and force aggressive central bank tightening.'
    },
    historicalExample: {
      date: 'October 1979 (Volcker Era)',
      context: 'Fed Chairman Paul Volcker announced a shift to targeting bank reserves rather than fed funds rates to crush runaway double-digit inflation.',
      marketReaction: 'Interest rates topped 20%, triggering deep recessions but successfully resetting long-term inflation expectations for decades.'
    },
    visualExplanationSteps: [
      '1. Distinguish between Headline CPI (includes food and gas) and Core CPI (strips food and gas).',
      '2. Focus on Core MoM percentage change as the cleanest snapshot of current momentum.',
      '3. Deconstruct the three buckets: Core Goods, Shelter, and "SuperCore" (Services excluding housing).',
      '4. Observe the immediate reaction in the 10-Year Real Yield.'
    ],
    scenarioFramework: {
      hawkish: 'Core MoM >= 0.4%. Fed cut expectations pushed out, bond yields rise, USD rallies, Gold drops.',
      dovish: 'Core MoM <= 0.1%. Easing cycle accelerated, bond yields fall, USD slides, Gold rallies.',
      inLine: 'Core MoM prints 0.2%-0.3% in line with expectations. Steady continuation of baseline trends.',
      mixed: 'Headline misses on energy drop, but Core Services remains stubbornly elevated. Initial dollar weakness followed by recovery.'
    },
    commonMistakes: [
      'Focusing solely on the annual headline number and ignoring the monthly core reading.',
      'Confusing CPI (consumer prices) with PPI (producer/wholesale prices).',
      'Assuming high inflation always pushes gold higher immediately (forgetting that rising real yields can crush gold in the short term).'
    ],
    beginnerMistakes: [
      'Thinking inflation means prices are falling when the inflation rate goes down (that is disinflation, not deflation).',
      'Failing to recognize that shelter costs represent ~36% of the total CPI basket.'
    ],
    professionalInterpretation: 'Track "SuperCore" inflation—Core Services less Housing—which Chair Powell singled out as the primary measure of wage-driven domestic services inflation.',
    riskConsiderations: [
      'CPI days experience significant order book gaps at 08:30 ET.',
      'Stop loss execution on index futures and FX pairs can experience substantial slippage.'
    ],
    relatedNewsCodes: ['FOMC', 'PCE', 'NFP'],
    relatedAcademyLessonIds: ['academy-fomc'],
    quiz: [
      {
        question: 'What is the main difference between Headline CPI and Core CPI?',
        options: [
          'Core CPI only tracks prices in major capital cities',
          'Core CPI excludes food and energy prices due to their high short-term volatility',
          'Headline CPI is published by banks while Core is published by the government',
          'Headline CPI includes taxes while Core CPI does not'
        ],
        correctIndex: 1,
        explanation: 'Core CPI strips out volatile food and energy costs to provide a cleaner read on underlying persistent inflation trends.'
      },
      {
        question: 'What component makes up more than one-third of the total US CPI index basket?',
        options: [
          'Used cars and trucks',
          'Food and beverage groceries',
          'Shelter (Rent and Owners Equivalent Rent)',
          'Airfare and public transit'
        ],
        correctIndex: 2,
        explanation: 'Shelter represents approximately 36% of the headline CPI basket, making housing costs the single largest weighting.'
      }
    ],
    beginnerContent: 'Inflation is the rate at which money loses purchasing power over time. If a cup of coffee cost $3 last year and costs $3.30 this year, that is 10% inflation. CPI is the government official way of measuring this across thousands of items. If CPI is high, your money is buying less, so the central bank increases interest rates to make borrowing expensive and slow down spending.',
    traderContent: 'CPI releases create explosive intraday momentum. On CPI mornings, mark the pre-market high and low on your chart. When the 08:30 ET print hits, watch whether the first 5-minute candle breaks through major key levels with high volume. If the print is a clear one-sided surprise (e.g. Core 0.1% vs 0.3% expected), trend-following strategies on index futures and FX pairs often run for the remainder of the session.',
    professionalContent: 'Model the statistical pass-through from the Bureau of Labor Statistics PPI and import price indices into the Core PCE price index. Pay particular attention to the rent imputation algorithm and medical services CPI methodology, which contrasts with the PCE survey sourcing.'
  },

  // 4. European Central Bank (ECB)
  {
    id: 'academy-ecb',
    slug: 'ecb-rate-decision',
    title: 'European Central Bank (ECB) & Sovereign Spread Mechanics',
    code: 'ECB',
    category: 'Monetary Policy',
    currency: 'EUR',
    impact: 'HIGH',
    difficulty: 'Intermediate',
    estimatedReadTime: '10 min',
    simpleDefinition: 'The European Central Bank determines benchmark interest rates for the 20 European nations that share the single Euro currency.',
    fullDefinition: 'The ECB Governing Council in Frankfurt sets three key policy interest rates: the Deposit Facility Rate (the rate banks earn for placing overnight funds), the Main Refinancing Operations (MRO) rate, and the Marginal Lending Facility rate. The Deposit Facility Rate currently serves as the operational target benchmark.',
    whyItExists: 'The primary statutory objective of the ECB, enshrined in the Treaty on the Functioning of the European Union, is price stability: maintaining year-on-year HICP inflation at 2% over the medium term.',
    whoPublishesIt: 'ECB Governing Council, consisting of the six members of the Executive Board plus the governors of the national central banks of the 20 euro area countries.',
    howCalculated: 'Governing Council meets every six weeks in Frankfurt, assessing Eurozone-wide inflation, labor costs, bank lending surveys, and staff macroeconomic projections.',
    releaseFrequency: 'Eight scheduled monetary policy meetings per calendar year.',
    whyTradersCare: 'Directly impacts the Euro—the second most held reserve currency globally—and influences European sovereign debt spreads (BTP/Bund spread) and banking sector liquidity.',
    affectedMarkets: [
      { asset: 'EUR/USD', sensitivity: 'Very High', rationale: 'Represents the most heavily traded currency pair in global finance.' },
      { asset: 'German Bund Yields (10Y)', sensitivity: 'Very High', rationale: 'The European benchmark sovereign risk-free rate.' },
      { asset: 'EUR/GBP & EUR/JPY', sensitivity: 'High', rationale: 'Cross-currency monetary policy divergence.' }
    ],
    whatHigherLowerMeans: {
      higher: 'Tightens European liquidity, historically strengthens the Euro against low-yielding currencies, but raises borrowing burdens for indebted peripheral economies.',
      lower: 'Eases financing costs across the Eurozone, lowers yields on European debt, and reduces the Euro foreign exchange carry appeal.',
      context: 'Look at the Deposit Facility Rate; it is the operative policy rate that governs European overnight liquidity.'
    },
    whenRelationshipBreaks: [
      'Fragmentation Risk: If higher rates threaten sovereign debt sustainability in peripheral economies (like Italy or Greece), the Euro can sell off despite higher rates.',
      'Fed Dominance: Broad US Dollar momentum often overpowers ECB rate actions in EUR/USD exchange rates.'
    ],
    forecastVsActualVsPrevious: 'ECB policy meetings feature two critical moments: the rate statement at 14:15 CET (12:15 GMT) and President Lagarde press conference at 14:45 CET (12:45 GMT).',
    revisionsExplanation: 'Quarterly meetings (March, June, September, December) feature revised ECB staff macroeconomic projections for GDP and HICP inflation.',
    hawkishDovishRelevance: 'Focus is on whether staff inflation projections show convergence toward 2% and guidance on meeting-by-meeting conditionality.',
    transmissionFlow: {
      steps: [
        'ECB publishes rate decision at 12:15 GMT',
        'Eurozone money market rates (Euribor) and ESTR reprice',
        'Lagarde holds press conference at 12:45 GMT answering journalist questions',
        'German Bunds and Italian BTP yields adjust, impacting EUR exchange rates'
      ],
      description: 'Governing Council Decision → Deposit Rate → Bund/BTP Yield Spread → EUR/USD Currency Valuation'
    },
    realWorldExample: {
      title: 'The "Transmission Protection Instrument" (TPI) Introduction',
      date: 'July 2022',
      eventContext: 'The ECB raised interest rates for the first time in 11 years while simultaneously unveiling the TPI tool to prevent unwarranted fragmentation in peripheral bond yields.',
      outcome: 'Successfully prevented a repeat of the 2011-2012 Eurozone sovereign debt crisis as interest rates rose.',
      lesson: 'The ECB must always manage multi-country sovereign debt cohesion alongside broad inflation control.'
    },
    historicalExample: {
      date: 'July 2012 ("Whatever It Takes")',
      context: 'Mario Draghi historic London speech promising that the ECB was ready to do "whatever it takes to preserve the euro".',
      marketReaction: 'Sovereign bond spreads collapsed across Italy, Spain, and Portugal, restoring global confidence in the survival of the Eurozone.'
    },
    visualExplanationSteps: [
      '1. Note the 12:15 GMT release for the rate numbers.',
      '2. Do not assume the day trend is decided until the 12:45 GMT press conference starts.',
      '3. Watch President Lagarde answers during the unscripted Q&A session.'
    ],
    scenarioFramework: {
      hawkish: 'Rates held higher or forward guidance resists rate cuts. EUR rallies against USD and GBP.',
      dovish: 'Rate cut accompanied by downward revision in European growth forecast. EUR softens.',
      inLine: 'Expected 25 bps cut delivered. Focus rests entirely on press conference wording.',
      mixed: 'Rate is cut, but guidance warns that high domestic services inflation prevents consecutive cuts.'
    },
    commonMistakes: [
      'Trading heavy size at 12:15 GMT and getting caught out by comments during the 12:45 GMT press conference.',
      'Assuming the ECB acts independently without considering what the US Federal Reserve is doing.'
    ],
    beginnerMistakes: [
      'Believing there is only one European interest rate (the ECB sets 3 different official policy rates).',
      'Forgetting that 20 different countries with different economies share the Euro.'
    ],
    professionalInterpretation: 'Track the 10Y Italian BTP / German Bund yield spread. Widening beyond 200 bps triggers political and financial fragmentation alarms in Frankfurt.',
    riskConsiderations: [
      'EUR/USD spreads can widen around the 12:15 GMT statement and throughout the press conference.'
    ],
    relatedNewsCodes: ['FOMC', 'CPI', 'UK-GDP'],
    relatedAcademyLessonIds: ['academy-fomc'],
    quiz: [
      {
        question: 'Where is the headquarters of the European Central Bank located?',
        options: ['Brussels, Belgium', 'Frankfurt, Germany', 'Paris, France', 'Geneva, Switzerland'],
        correctIndex: 1,
        explanation: 'The European Central Bank is headquartered in Frankfurt am Main, Germany.'
      },
      {
        question: 'What is the operational target rate of the ECB that banks earn on overnight reserves?',
        options: ['Main Refinancing Rate', 'Marginal Lending Facility', 'Deposit Facility Rate', 'Euribor 3-Month Rate'],
        correctIndex: 2,
        explanation: 'The Deposit Facility Rate is the primary operational benchmark governing money market liquidity in Europe.'
      }
    ],
    beginnerContent: 'The ECB is the central bank for 20 European countries that use the Euro, like Germany, France, Italy, and Spain. Imagine having 20 different roommates who all have to agree on how to set the thermostat. Setting interest rates for so many different economies at once is challenging, which makes ECB meetings fascinating for currency traders.',
    traderContent: 'Trade EUR/USD during ECB meetings in two distinct acts. Act 1 is the 12:15 GMT rate print: expect quick algorithmic sweeps. Act 2 is the 12:45 GMT press conference: this is where institutional macro money takes directional positions as President Lagarde delivers forward guidance.',
    professionalContent: 'Examine the Eurosystem Target2 balances and the implementation of the Operational Framework review, which established a structural lending portfolio alongside flexible reserve requirement ratios.'
  },

  // 5. Bank of Japan (BoJ)
  {
    id: 'academy-boj',
    slug: 'boj-monetary-policy',
    title: 'Bank of Japan (BoJ) & Yen Carry Trade Mechanics',
    code: 'BOJ',
    category: 'Central Bank',
    currency: 'JPY',
    impact: 'HIGH',
    difficulty: 'Advanced',
    estimatedReadTime: '13 min',
    simpleDefinition: 'The central bank of Japan sets interest rates and monetary policy, playing an outsized role in global markets due to the Yen status as a primary funding currency for global leverage.',
    fullDefinition: 'The Bank of Japan conducts monetary policy through its Policy Board, setting the uncollateralized overnight call rate target and managing Japanese Government Bond (JGB) purchases. For decades, Japan maintained negative interest rates and Yield Curve Control (YCC), making the Yen the premier funding vehicle for global carry trades.',
    whyItExists: 'Formulated to maintain price stability and contribute to the sound development of the national economy. Following decades of deflationary stagnation, the BoJ modern focus is achieving a sustainable 2% inflation cycle backed by rising wages (Shunto wage negotiations).',
    whoPublishesIt: 'Bank of Japan Policy Board, consisting of the Governor, two Deputy Governors, and six Deliberative Members.',
    howCalculated: 'Meets 8 times per year in Tokyo. Decisions are announced during the Tokyo lunch window, followed by a formal press conference by the Governor at approximately 15:30 JST (06:30 GMT).',
    releaseFrequency: 'Eight policy meetings per year. Crucially, the BoJ announcement has NO PRESET EXACT MINUTE—it is released when the board finishes deliberations, typically between 11:30 and 12:30 Tokyo time.',
    whyTradersCare: 'The "Yen Carry Trade" involves investors borrowing cheaply in Japanese Yen to invest in higher-yielding assets worldwide (US Treasuries, Mexican Pesos, global stocks, crypto). When the BoJ raises rates or the Yen surges, trillions of dollars of leveraged investments worldwide face margin liquidation.',
    affectedMarkets: [
      { asset: 'USD/JPY & EUR/JPY', sensitivity: 'Very High', rationale: 'Extreme sensitivity to rate adjustments and foreign exchange interventions.' },
      { asset: 'Nikkei 225', sensitivity: 'Very High', rationale: 'Japanese exporters rely on a competitive yen for overseas earnings.' },
      { asset: 'Bitcoin & Crypto', sensitivity: 'High', rationale: 'High sensitivity to systemic global leverage and margin liquidity.' },
      { asset: 'Global Equities', sensitivity: 'High', rationale: 'Carry trade unwind cascades trigger broad risk-off margin selling.' }
    ],
    whatHigherLowerMeans: {
      higher: 'Raising Japanese interest rates narrows the yield discount against foreign bonds, triggering massive repatriation of Japanese capital back into Yen.',
      lower: 'Keeping rates ultra-low sustains cheap global borrowing and encourages continuous cross-border carry trades.',
      context: 'Because Japan has been near zero rates for so long, even small rate increases (e.g. +15 or +25 bps) have exponential effects on global leveraged positioning.'
    },
    whenRelationshipBreaks: [
      'Intervention Exhaustion: Ministry of Finance currency interventions to strengthen the Yen can fail if US interest rate differentials remain overwhelming.',
      'Market Liquidity Freezes: Rapid Yen surges can trigger cascading stop losses that overwhelm algorithmic market makers across all asset classes.'
    ],
    forecastVsActualVsPrevious: 'Look at both the rate decision and Governor Ueda press conference tone regarding future rate normalization.',
    revisionsExplanation: 'Quarterly meetings include the Outlook for Economic Activity and Prices, featuring the boards median forecasts for GDP and Core CPI.',
    hawkishDovishRelevance: 'Hawkish indicates rate hikes and tapering bond purchases; Dovish indicates commitment to monetary ease and caution.',
    transmissionFlow: {
      steps: [
        'BoJ Policy Board concludes deliberation (~11:45 Tokyo time)',
        'Japanese 10-Year Government Bond yields reprice',
        'Global hedge funds and institutions calculate Yen funding costs',
        'Yen carry trades unwind: investors sell foreign assets and buy back Yen to repay loans',
        'USD/JPY drops sharply while global equities and crypto experience liquidity drains'
      ],
      description: 'BoJ Policy Stance → JGB Yields → Carry Trade Repatriation → Global Margin Contraction'
    },
    realWorldExample: {
      title: 'The August 5, 2024 "Black Monday" Carry Unwind',
      date: 'August 5, 2024',
      eventContext: 'The BoJ surprised markets by hiking rates to 0.25% right as US employment showed signs of weakening.',
      outcome: 'The Nikkei 225 plunged -12.4% in a single trading session (its worst drop since 1987), USD/JPY tumbled from 161 to 142, and crypto plunged as leveraged carry trades were liquidated simultaneously.',
      lesson: 'Japanese monetary policy shifts can trigger tectonic liquidity shocks across global asset classes that appear completely disconnected from Japan.'
    },
    historicalExample: {
      date: 'March 2024 (Ending Negative Rates)',
      context: 'Bank of Japan formally terminated 8 years of negative interest rates and dismantled Yield Curve Control (YCC).',
      marketReaction: 'Marked the historic end of an era of unconventional global central banking experimentation.'
    },
    visualExplanationSteps: [
      '1. Be prepared for an unannounced release time between 02:30 and 04:00 GMT.',
      '2. Watch USD/JPY 1-minute chart for sudden volatility bursts.',
      '3. Follow the Governor press conference at 06:30 GMT for forward guidance.',
      '4. Monitor the 10-Year Japanese Government Bond (JGB) yield.'
    ],
    scenarioFramework: {
      hawkish: 'Rate hike or explicit preparation for further hikes. Yen surges (USD/JPY drops), Nikkei drops, risk assets face pressure.',
      dovish: 'Commitment to slow, cautious normalization. Yen weakens (USD/JPY rallies), Japanese exporters gain.',
      inLine: 'Rate hold with balanced guidance. Initial relief rally in USD/JPY.',
      mixed: 'Rates held, but bond purchase tapering is announced at a faster pace.'
    },
    commonMistakes: [
      'Setting a timer for a specific minute (the BoJ release has no fixed minute).',
      'Ignoring the BoJ because you do not trade Japanese stocks (it affects global liquidity, tech stocks, and crypto).',
      'Underestimating the speed of Yen appreciation once a carry unwind cascade begins.'
    ],
    beginnerMistakes: [
      'Confusing the Bank of Japan (which sets monetary policy) with the Ministry of Finance (which orders FX market intervention).'
    ],
    professionalInterpretation: 'Monitor Japanese domestic institutional asset allocation (pension funds and lifers like GPIF and Japan Post Bank). When domestic JGB yields rise enough to satisfy their liability hurdles, their multi-trillion dollar foreign bond holdings begin repatriating home.',
    riskConsiderations: [
      'USD/JPY spreads and slippage during BoJ decisions can be extreme.',
      'Yen moves frequently trigger secondary margin calls across commodities, gold, and crypto.'
    ],
    relatedNewsCodes: ['FOMC', 'CPI'],
    relatedAcademyLessonIds: ['academy-fomc'],
    quiz: [
      {
        question: 'What is a "Yen Carry Trade"?',
        options: [
          'Transporting physical Japanese Yen in suitcases across borders',
          'Borrowing in low-interest Japanese Yen to invest in higher-yielding global assets',
          'A tourist currency exchange booth at Tokyo Narita airport',
          'A Japanese government export tax on automobiles'
        ],
        correctIndex: 1,
        explanation: 'A carry trade involves borrowing in a low-interest currency (like JPY) to invest in higher-returning assets elsewhere.'
      },
      {
        question: 'Why does the Bank of Japan interest rate decision create uncertainty regarding its exact timing?',
        options: [
          'Because the Japanese clock operates on a different solar cycle',
          'Because the announcement is made as soon as the board concludes deliberations, rather than at a fixed minute',
          'Because the Prime Minister must approve the decision first',
          'Because Tokyo stock exchange regulations forbid fixed-time announcements'
        ],
        correctIndex: 1,
        explanation: 'Unlike the Fed or ECB, the BoJ has no fixed publication minute; it is released whenever the voting members conclude deliberations, typically around the Tokyo midday recess.'
      }
    ],
    beginnerContent: 'Japan had near-zero or negative interest rates for decades because prices were not rising. Because borrowing money in Yen was almost free, global investors borrowed trillions of Yen and invested that cash in American stocks, high-yield bonds, and real estate. When Japan raises interest rates, those investors have to pay back their cheap loans, which can shake up financial markets across the globe.',
    traderContent: 'When trading USD/JPY around BoJ events, keep position sizing at half normal size. The lack of a scheduled minute means liquidity providers pull bid/ask depth well before noon Tokyo time. Watch the JGB 10-year yield: a breakout above key resistance is the purest signal of institutional yen positioning.',
    professionalContent: 'Model the cross-currency basis swap spread (USD/JPY 3M basis) to gauge the cost of dollar funding for Japanese institutional accounts. When hedging costs consume the yield pickup of US Treasuries over JGBs, Japanese repatriation accelerates.'
  }
];
