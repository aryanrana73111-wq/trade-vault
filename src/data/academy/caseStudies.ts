import { CaseStudy } from '@/types/academy';

export const ACADEMY_CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-1998-ltcm',
    title: '1998 Long-Term Capital Management (LTCM)',
    subtitle: 'Extreme Leverage, Correlation Breakdown & Liquidity Spiral',
    dateOrEra: 'August–September 1998',
    marketAsset: 'Fixed Income Arbitrage & Sovereign Debt',
    domain: 'Risk Management',
    difficulty: 'Institutional',
    context: 'Long-Term Capital Management was a premier hedge fund staffed by Nobel laureates Myron Scholes and Robert Merton. They traded fixed income relative-value spreads, assuming mean-reversion with tiny margins. To turn 1% yield spreads into 40% returns, they leveraged their equity over 25:1 to 30:1 (with off-balance-sheet derivatives exposure exceeding $1 trillion).',
    marketConditions: 'In August 1998, the Russian government unexpectedly defaulted on its domestic ruble bonds (GKO) and devalued its currency. A global "flight to quality" ensued as capital fled emerging markets into US Treasuries.',
    availableInformation: [
      'Historical models assumed 4-standard-deviation events occur once every several millennia.',
      'Sovereign yield spreads widened to historic records rather than converging.',
      'LTCM held massive illiquid positions that represented a significant percentage of global open interest in certain bonds.',
      'Financing counterparties (major Wall Street banks) began demanding increased margin collateral.'
    ],
    decisionPoint: 'Russian default hits. Spreads blow out, creating an immediate $500M daily loss. LTCM equity plummets from $4.7B to $2.3B. The fund can either: (A) Cut positions immediately at market prices to de-lever; (B) Double down and hold, relying on historical mean-reversion models; or (C) Seek emergency private recapitalization before counterparty liquidation.',
    choices: [
      {
        id: 'c1',
        label: 'A: Aggressively liquidate all spread positions with market orders',
        description: 'Attempt to de-lever immediately by closing illiquid bond positions.',
        isInstitutionalBestPractice: false,
        consequence: 'Because LTCM owned such a vast percentage of the market, selling into an evaporating order book triggered immense market impact and negative slippage, accelerating their own insolvency.'
      },
      {
        id: 'c2',
        label: 'B: Hold positions and add margin to wait for mean reversion',
        description: 'Trust that historical mathematics will reassert fair value once panic subsides.',
        isInstitutionalBestPractice: false,
        consequence: 'Spreads continued widening for weeks. As John Maynard Keynes famously noted: "The market can stay irrational longer than you can stay solvent." Capital fell to under $400M.'
      },
      {
        id: 'c3',
        label: 'C: Orderly institutional consortium restructuring (The Fed bailout)',
        description: 'Federal Reserve Bank of New York coordinates a $3.625B capital injection by 14 major Wall Street institutions to orchestrate an orderly multi-month liquidation.',
        isInstitutionalBestPractice: true,
        consequence: 'Systemic market collapse was averted, but LTCM equity partners were largely wiped out.'
      }
    ],
    consequencesSummary: 'LTCM lost $4.6 billion in capital in less than 4 months. The Federal Reserve had to orchestrate a private consortium rescue because a forced fire-sale by LTCM would have cascaded through global banking counterparties.',
    professionalAnalysis: 'LTCM proved that models calibrated strictly to benign historical regimes fail catastrophically during structural shifts. When panic occurs, correlations between supposedly independent trades converge to +1.0, and liquidity evaporates when everyone rushes for the exit simultaneously.',
    lessonsLearned: [
      'Never confuse high statistical probability in normal regimes with immunity to tail-risk ruin.',
      'Leverage converts temporary mark-to-market fluctuations into permanent terminal liquidations.',
      'Liquidity is an illusion until you actually try to exit large size in a panic.',
      'Correlations are non-stationary and approach +1.0 during systemic crises.'
    ],
    chartData: [
      { time: 'Jan 98', price: 100, benchmark: 100 },
      { time: 'Apr 98', price: 104, benchmark: 102 },
      { time: 'Jun 98', price: 92, benchmark: 103 },
      { time: 'Aug 98', price: 54, benchmark: 98, annotation: 'Russian Default Shock' },
      { time: 'Sep 98', price: 12, benchmark: 95, annotation: 'Fed Consortium Rescue' },
      { time: 'Dec 98', price: 10, benchmark: 105 }
    ]
  },
  {
    id: 'cs-2015-chf-peg',
    title: '2015 Swiss Franc (EUR/CHF) "Black Swan"',
    subtitle: 'The Death of the 1.2000 Peg & Infinite Slippage',
    dateOrEra: 'January 15, 2015',
    marketAsset: 'Foreign Exchange (EUR/CHF)',
    domain: 'Execution',
    difficulty: 'Advanced',
    context: 'Since 2011, the Swiss National Bank (SNB) had enforced a minimum exchange rate floor of 1.2000 EUR/CHF, repeatedly promising to defend the floor with "the utmost determination". Hundreds of retail and institutional traders placed massive leveraged buy positions at 1.2005 with stop-losses at 1.1995, believing the central bank was a permanent, unbreakable safety net.',
    marketConditions: 'On Thursday, January 15, 2015 at 9:30 AM Zurich time, without any warning, the SNB abruptly announced the immediate cancellation of the 1.2000 peg.',
    availableInformation: [
      'The SNB officially discontinued the minimum exchange rate.',
      'Electronic liquidity instantly vanished; every major bank removed all Bid quotes for EUR/CHF.',
      'Retail broker platforms froze as price experienced a total liquidity vacuum.',
      'Stop-loss orders placed at 1.1995 could not fill because there were literally ZERO buyers anywhere in the world between 1.2000 and 1.0200.'
    ],
    decisionPoint: 'At 9:31 AM, EUR/CHF collapses through 1.2000. Stop-losses do not trigger at 1.1995. The quote screen is blank. Traders can only watch or spam market orders.',
    choices: [
      {
        id: 'chf1',
        label: 'A: Assume your 1.1995 stop-loss capped your risk at 10 pips',
        description: 'Rely on the mistaken belief that brokers guarantee fill prices on stop-loss orders.',
        isInstitutionalBestPractice: false,
        consequence: 'Stops converted to market orders and executed 1,500 to 2,000 pips lower near 0.9800 to 0.8500! Account balances went deeply negative, resulting in immediate debt.'
      },
      {
        id: 'chf2',
        label: 'B: Pre-trade institutional risk design: Never trade heavily on artificial pegs',
        description: 'Understand that artificial price floors distort natural market clearing and create catastrophic pressure cookers with asymmetric downside.',
        isInstitutionalBestPractice: true,
        consequence: 'Traders who avoided excessive leverage on pegged instruments avoided total ruin.'
      }
    ],
    consequencesSummary: 'EUR/CHF collapsed by over 30% in minutes. Major retail brokerages (like FXCM and Alpari UK) suffered hundreds of millions in negative customer balances, driving Alpari into insolvency and requiring private bailouts for others.',
    professionalAnalysis: 'This event is the ultimate real-world proof of Gapping and Execution Slippage. In an electronic continuous double auction, if there are no bids resting in the order book, a Stop-Loss is mathematically powerless to protect you from an instantaneous price vacuum.',
    lessonsLearned: [
      'Stop-loss orders do NOT guarantee your fill price; they only guarantee the next available bid.',
      'Artificial government or central-bank price pegs create catastrophic tail risk when they break.',
      'Brokers operating with high leverage can go bankrupt overnight if customers incur negative equity.',
      'True tail risk cannot be hedged within the same market venue where the shock occurs.'
    ],
    chartData: [
      { time: '09:20', price: 1.2010 },
      { time: '09:29', price: 1.2008 },
      { time: '09:30', price: 1.2000, annotation: 'SNB Abruptly Abandons Peg' },
      { time: '09:32', price: 1.0500, annotation: 'Liquidity Vacuum - No Bids' },
      { time: '09:35', price: 0.8600, annotation: 'Extreme Intraday Low' },
      { time: '10:00', price: 1.0150 }
    ]
  },
  {
    id: 'cs-2021-archegos',
    title: '2021 Archegos Capital Management Collapse',
    subtitle: 'Total Return Swaps, Hidden Concentration & Margin Call Cascades',
    dateOrEra: 'March 2021',
    marketAsset: 'US Equities (ViacomCBS, Discovery, Baidu)',
    domain: 'Risk Management',
    difficulty: 'Institutional',
    context: 'Bill Hwang\'s family office, Archegos Capital Management, built massive $100B+ concentrated positions in a small handful of stocks using synthetic Total Return Swaps (TRS) across multiple prime brokers (Credit Suisse, Nomura, Morgan Stanley, Goldman Sachs). By using swaps, Archegos bypassed regulatory 13F disclosure requirements, so no single bank knew he held identical 5x leveraged bets with four other banks.',
    marketConditions: 'In late March 2021, ViacomCBS announced a secondary stock offering, causing the stock to drop 9%. Because Archegos was leveraged roughly 5:1 to 8:1 on highly concentrated positions, this drop triggered margin calls.',
    availableInformation: [
      'ViacomCBS and Discovery began falling rapidly.',
      'Prime brokers issued formal margin calls demanding billions in cash collateral.',
      'Archegos had zero remaining liquidity to meet the calls.',
      'Prime brokers held secret meetings to coordinate an orderly liquidation, but trust broke down and Goldman Sachs broke ranks to liquidate first.'
    ],
    decisionPoint: 'As a prime broker holding billions in swap collateral that is falling 15% a day: Do you wait and work an orderly block sale with other banks, or immediately dump all collateral into the market to save your own balance sheet?',
    choices: [
      {
        id: 'arch1',
        label: 'A: Wait for mutual coordination with competing prime brokers',
        description: 'Credit Suisse and Nomura hesitated, waiting for consensus on orderly liquidation.',
        isInstitutionalBestPractice: false,
        consequence: 'Goldman Sachs and Morgan Stanley dumped their collateral blocks first at favorable prices. Credit Suisse was left holding toxic inventory, suffering a catastrophic $5.5B loss that directly damaged the bank\'s solvency.'
      },
      {
        id: 'arch2',
        label: 'B: Enforce immediate hard margin liquidation (First out gets the best price)',
        description: 'Immediately liquidate client swap collateral to limit bank counterparty loss.',
        isInstitutionalBestPractice: true,
        consequence: 'Goldman Sachs and Morgan Stanley exited with minimal losses, proving the Wall Street adage: "If you must panic, panic first."'
      }
    ],
    consequencesSummary: 'Archegos collapsed completely, erasing $20 billion in personal equity in 48 hours. Credit Suisse suffered a $5.5 billion loss, which ultimately contributed to its emergency takeover by UBS two years later.',
    professionalAnalysis: 'Archegos illustrates Concentration Risk combined with Hidden Leverage. When a single participant controls a significant fraction of an asset\'s float with debt, the asset is not trading on fundamental value; it is trading on the solvency of that single participant\'s margin balance.',
    lessonsLearned: [
      'Concentration risk kills: diversification across non-correlated names is mandatory.',
      'Synthetic leverage and swaps obscure true counterparty exposure.',
      'When liquidation cascades begin, early execution is the only survival defense.',
      'Never trade so large that your own liquidation moves the price against you.'
    ],
    chartData: [
      { time: 'Jan 21', price: 38 },
      { time: 'Feb 21', price: 65 },
      { time: 'Mar 15', price: 100, annotation: 'Peak Leverage' },
      { time: 'Mar 23', price: 85, annotation: 'Viacom Secondary Offering' },
      { time: 'Mar 26', price: 42, annotation: 'Forced Prime Broker Block Liquidations' },
      { time: 'Apr 05', price: 44 }
    ]
  },
  {
    id: 'cs-2020-covid-crash',
    title: 'March 2020 COVID-19 Liquidity Shock & V-Reversal',
    subtitle: 'Limit Down Circuit Breakers & The Volatility Spike',
    dateOrEra: 'February–April 2020',
    marketAsset: 'Global Equities (S&P 500) & US Treasuries',
    domain: 'Quantitative Analysis',
    difficulty: 'Advanced',
    context: 'In February 2020, as COVID-19 spread globally and economies initiated lockdowns, the S&P 500 suffered the fastest 30% collapse from all-time highs in financial history. Volatility (VIX) spiked to 82.7 (levels not seen since 2008). Market-wide circuit breakers halted trading 4 times in 10 days.',
    marketConditions: 'Even traditional safe havens failed: US Treasuries and Gold temporarily sold off alongside equities as hedge funds faced margin calls in risk-parity funds and were forced to sell anything with liquidity to raise cash.',
    availableInformation: [
      'Global economic shutdown; historical volatility broke all 5-year models.',
      'S&P 500 futures hit "limit down" (-5%) in overnight sessions repeatedly.',
      'The Federal Reserve announced emergency unlimited quantitative easing (QE) and secondary market corporate credit facilities on March 23.'
    ],
    decisionPoint: 'On March 23, 2020, the S&P 500 is down 35% from its peak. News headlines scream total economic depression. Systemic trend followers are 100% short. Do you follow retail panic and sell, or recognize the institutional liquidity injection and follow price structure?',
    choices: [
      {
        id: 'cov1',
        label: 'A: Sell everything and wait for "all-clear" news headlines',
        description: 'Cash out at the market bottom due to macro fear.',
        isInstitutionalBestPractice: false,
        consequence: 'Traders who sold at the bottom missed the fastest +60% bull market rally in history as markets rallied months before the economy improved.'
      },
      {
        id: 'cov2',
        label: 'B: Follow market structure & central bank liquidity signals',
        description: 'Observe the Fed\'s balance sheet expansion and wait for a technical Higher Low (HL) confirmation on daily charts.',
        isInstitutionalBestPractice: true,
        consequence: 'Price broke market structure to the upside in early April, confirming a new regime transition supported by monetary stimulus.'
      }
    ],
    consequencesSummary: 'The market bottomed precisely when pandemic news was at its bleakest (March 23). Equities then surged to new all-time highs within 5 months.',
    professionalAnalysis: 'Markets are forward-looking discounting mechanisms. They bottom not when the news is good, but when the news stops getting worse and incremental liquidity overwhelms panic selling.',
    lessonsLearned: [
      'Never trade personal economic opinions over actual market price action and liquidity flows.',
      'In a panic, even uncorrelated assets can temporarily correlate to +1.0 during the "dash for cash".',
      'Central bank balance sheet liquidity is the dominant macro driver of asset prices.',
      'Volatility-adjusted sizing (ATR scaling) keeps you solvent during 5-sigma regime shifts.'
    ],
    chartData: [
      { time: 'Feb 15', price: 3380 },
      { time: 'Mar 01', price: 2950 },
      { time: 'Mar 12', price: 2480, annotation: 'Circuit Breaker Halt #2' },
      { time: 'Mar 23', price: 2191, annotation: 'Fed Emergency Unlimited QE' },
      { time: 'Apr 15', price: 2800, annotation: 'Daily Structure CHoCH' },
      { time: 'Aug 15', price: 3390, annotation: 'New All-Time High' }
    ]
  }
];
