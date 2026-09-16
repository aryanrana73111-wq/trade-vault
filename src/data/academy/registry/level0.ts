import { CurriculumConcept } from '@/types/academy';

export const LEVEL_0_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c0-what-is-money',
    title: 'What is Money & The Need for Markets',
    category: 'MARKETS',
    level: 0,
    difficulty: 'Beginner',
    description: 'Demystify money as a consensus ledger solving the coincidence of wants, and why electronic exchanges exist.',
    simpleExplanation: 'Money is an agreed-upon scorekeeper for goods and services. Without money, you would have to trade your bicycle directly for groceries. Markets give everyone a single place to trade using money.',
    professionalDefinition: 'Money functions as an institutionalized unit of account, medium of exchange, and store of value. Financial markets are centralized electronic infrastructures that eliminate bilateral search costs through standardized liquidity pools.',
    prerequisites: [],
    relatedConcepts: ['c0-financial-markets', 'c0-price-discovery'],
    formulas: [
      {
        name: 'Equation of Exchange',
        expression: 'M * V = P * Y',
        variables: [
          { symbol: 'M', meaning: 'Money Supply' },
          { symbol: 'V', meaning: 'Velocity of Money' },
          { symbol: 'P', meaning: 'Average Price Level' },
          { symbol: 'Y', meaning: 'Real Output (Transactions)' }
        ],
        notes: 'Demonstrates how changes in money velocity and supply influence purchasing power and clearing prices.'
      }
    ],
    examples: [
      {
        scenario: 'A modern economy without electronic exchanges versus one with centralized clearing.',
        analysis: 'In an unorganized market, a buyer holding Apple stock looking for US Dollars must independently locate a counterparty. In a central limit order book, settlement is instantaneous with zero search friction.',
        outcome: 'Bid-ask spreads compress from percentages to fractions of a basis point.'
      }
    ],
    artifacts: [
      {
        type: 'market-structure',
        title: 'Continuous Double Auction Visualizer',
        description: 'See how buyers and sellers match at the clearing price.'
      }
    ],
    quizzes: [
      {
        id: 'q0-1',
        question: 'What is the primary economic purpose of financial markets?',
        options: [
          'To generate guaranteed passive income for retail traders',
          'To facilitate capital allocation and price discovery between buyers and sellers',
          'To manipulate prices through market-making software',
          'To remove all financial volatility from global trade'
        ],
        correctIndex: 1,
        explanation: 'Financial markets exist fundamentally to connect capital providers with capital seekers and discover fair clearing prices with minimal friction.'
      }
    ],
    caseStudies: [
      {
        title: 'The Buttonwood Agreement (1792)',
        era: '1792 Wall Street',
        overview: 'Twenty-four stockbrokers signed an agreement under a buttonwood tree to trade securities with set commission rates and standard rules, establishing the precursor to the New York Stock Exchange.',
        keyTakeaway: 'Standardization and institutional trust are required before liquid capital markets can form.'
      }
    ],
    commonMistakes: [
      'Assuming the price of an asset represents objective intrinsic truth rather than marginal transaction consensus.',
      'Believing markets exist to provide retail profits rather than to clear commercial liquidity.'
    ],
    learningObjectives: [
      'Define the three classical functions of money.',
      'Explain how financial markets eliminate bilateral search costs.',
      'Distinguish subjective market value from transactional clearing price.'
    ],
    estimatedLearningTime: 12
  },
  {
    id: 'c0-financial-markets',
    title: 'Financial Markets & Exchange Infrastructure',
    category: 'MARKETS',
    level: 0,
    difficulty: 'Beginner',
    description: 'Understand how centralized exchanges, electronic communication networks (ECNs), and clearinghouses operate.',
    simpleExplanation: 'An exchange is like a gigantic digital town square where thousands of buyers and sellers send their orders. A referee (the clearinghouse) guarantees that everyone gets paid and receives their assets.',
    professionalDefinition: 'Regulated national market system venues consisting of Central Limit Order Books (CLOBs), Alternative Trading Systems (ATS), and central counterparty clearing houses (CCPs) that eliminate counterparty credit risk.',
    prerequisites: ['c0-what-is-money'],
    relatedConcepts: ['c0-price-discovery', 'c0-liquidity-basics'],
    examples: [
      {
        scenario: 'You buy 100 shares of an ETF through an online retail broker.',
        analysis: 'Your broker routes your order to an exchange or market maker. The National Securities Clearing Corporation (NSCC) clears the trade in T+1 settlement.',
        outcome: 'You receive ownership of the securities while the seller receives cash, guaranteed by the clearinghouse.'
      }
    ],
    artifacts: [
      {
        type: 'market-structure',
        title: 'Central Counterparty Clearing Process',
        description: 'Examine bilateral risk versus central clearinghouse protection.'
      }
    ],
    quizzes: [
      {
        id: 'q0-2',
        question: 'What is the role of a central counterparty clearinghouse (CCP)?',
        options: [
          'To decide whether stock prices go up or down tomorrow',
          'To act as the buyer to every seller and seller to every buyer, guaranteeing trade settlement',
          'To provide free leverage to retail accounts',
          'To publish analyst price targets'
        ],
        correctIndex: 1,
        explanation: 'The CCP novates contracts so that traders face the clearinghouse rather than the credit risk of unknown counterparties.'
      }
    ],
    commonMistakes: [
      'Assuming you trade directly with your broker rather than accessing an inter-dealer market or order matching network.',
      'Ignoring counterparty risk in unregulated or offshore trading platforms.'
    ],
    learningObjectives: [
      'Map the lifecycle of a trade from order entry to clearing and settlement.',
      'Explain novation and the function of a clearinghouse.',
      'Contrast lit exchanges with over-the-counter (OTC) bilateral markets.'
    ],
    estimatedLearningTime: 15
  },
  {
    id: 'c0-price-discovery',
    title: 'Continuous Double Auction & Price Discovery',
    category: 'TRADING FUNDAMENTALS',
    level: 0,
    difficulty: 'Beginner',
    description: 'The mathematical mechanism behind every financial chart: how aggressive market orders consume resting limit order books.',
    simpleExplanation: 'Prices move when eager buyers are willing to pay more than the current best price, or eager sellers are willing to accept less. The line on a chart is just the history of the last agreed transactions.',
    professionalDefinition: 'The dynamic algorithm whereby limit orders form an order book queue of liquidity, and market orders consume resting inventory at the top of book, shifting the inside market (best bid / best ask).',
    prerequisites: ['c0-what-is-money', 'c0-financial-markets'],
    relatedConcepts: ['c0-liquidity-basics', 'c1-bid-ask-spread'],
    formulas: [
      {
        name: 'Price Change via Order Imbalance',
        expression: 'ΔP = f(Vol_market_buy - Vol_market_sell, Liquidity_depth)',
        notes: 'Price moves upward when market buy volume exhausts resting asks at the current price level.'
      }
    ],
    examples: [
      {
        scenario: 'Resting ask queue has 10,000 shares at $150.00 and 15,000 shares at $150.10. An institutional buyer sends a market buy order for 20,000 shares.',
        analysis: 'The first 10,000 shares fill at $150.00. The remaining 10,000 shares fill at $150.10. The new traded price is immediately marked at $150.10.',
        outcome: 'Price prints higher because buy demand exceeded the available liquidity tier.'
      }
    ],
    artifacts: [
      {
        type: 'order-book-depth',
        title: 'Level 2 Depth & Liquidity Depletion',
        description: 'Simulate aggressive market orders consuming limit orders.'
      }
    ],
    quizzes: [
      {
        id: 'q0-3',
        question: 'What directly causes the market price of an asset to rise on a tick-by-tick basis?',
        options: [
          'More buyers exist than sellers in the world',
          'Market buy orders aggressively consume all resting limit orders at the best ask price',
          'The company reports good news on social media',
          'Moving averages cross over each other'
        ],
        correctIndex: 1,
        explanation: 'Price changes strictly when aggressive liquidity-taking orders consume all available quantity at the current best quote.'
      }
    ],
    commonMistakes: [
      'Believing there can be "more buyers than sellers" in a cleared trade (every trade has exactly one buyer and one seller).',
      'Thinking charts move because of abstract lines rather than order execution mechanics.'
    ],
    learningObjectives: [
      'Explain why every cleared transaction requires identical quantities bought and sold.',
      'Contrast aggressive market orders with passive limit orders.',
      'Calculate clearing price shifts given order book depth.'
    ],
    estimatedLearningTime: 18
  },
  {
    id: 'c0-trading-vs-investing',
    title: 'Speculation vs Investing vs Hedging',
    category: 'TRADING FUNDAMENTALS',
    level: 0,
    difficulty: 'Beginner',
    description: 'Understand the distinct economic mandates of commercial hedgers, long-term capital allocators, and active speculative traders.',
    simpleExplanation: 'An investor buys a company to own its profits for 10 years. A farmer hedges to guarantee next year’s crop price. A trader buys for 10 minutes or 10 days to profit from a short-term price imbalance.',
    professionalDefinition: 'Capital allocation based on discounted cash flow yield (investing) vs risk-transfer mitigation against commercial liabilities (hedging) vs probabilistic exploitation of short-term variance and order flow (speculation).',
    prerequisites: ['c0-what-is-money'],
    relatedConcepts: ['c0-financial-markets', 'c0-liquidity-basics'],
    examples: [
      {
        scenario: 'An airline buying oil futures contracts vs a hedge fund day-trading crude futures.',
        analysis: 'The airline locks in jet fuel costs to remove volatility from its flight operations. The hedge fund takes the opposite side to capture short-term statistical alpha.',
        outcome: 'The trader provides liquidity and assumes price risk that the commercial enterprise cannot bear.'
      }
    ],
    quizzes: [
      {
        id: 'q0-4',
        question: 'What is the primary role of a commercial hedger in futures markets?',
        options: [
          'To generate maximum speculative leverage',
          'To transfer business price risk to other market participants',
          'To hold assets forever for dividend income',
          'To scalp intraday bid-ask spreads'
        ],
        correctIndex: 1,
        explanation: 'Commercial hedgers use financial derivatives to protect their business operations from adverse price fluctuations.'
      }
    ],
    commonMistakes: [
      'Treating a short-term trading loss as a "long-term investment" to avoid realizing a loss.',
      'Confusing high turnover speculation with passive compounding.'
    ],
    learningObjectives: [
      'Compare time horizons, turnover rates, and risk models of traders vs investors.',
      'Explain the economic benefit of speculators providing liquidity to commercial hedgers.',
      'Avoid the disposition trap of converting failed trades into involuntary investments.'
    ],
    estimatedLearningTime: 14
  },
  {
    id: 'c0-liquidity-basics',
    title: 'Liquidity: The Lifeblood of Markets',
    category: 'MARKETS',
    level: 0,
    difficulty: 'Beginner',
    description: 'Why liquidity determines whether you can enter and exit positions without catastrophic price slippage.',
    simpleExplanation: 'Liquidity is how easily you can turn an asset into cash immediately without moving the price. Cash is completely liquid. A rare painting is illiquid.',
    professionalDefinition: 'The multidimensional market property encompassing tightness (narrow bid-ask spread), depth (large volume available near top of book), and resiliency (speed of quote replenishment following large orders).',
    prerequisites: ['c0-financial-markets', 'c0-price-discovery'],
    relatedConcepts: ['c1-bid-ask-spread', 'c1-slippage-and-impact'],
    formulas: [
      {
        name: 'Amihud Illiquidity Measure',
        expression: 'ILLIQ_t = |R_t| / Volume_t',
        notes: 'Measures the absolute price response per dollar of trading volume.'
      }
    ],
    examples: [
      {
        scenario: 'Selling $500,000 of Apple stock vs selling $500,000 of a micro-cap cryptocurrency.',
        analysis: 'Apple absorbs $500,000 in milliseconds with less than $0.01 price impact. The illiquid micro-cap crashes 35% because the order book has zero depth.',
        outcome: 'Execution in illiquid assets incurs devastating hidden slippage costs.'
      }
    ],
    quizzes: [
      {
        id: 'q0-5',
        question: 'Which of the following describes a highly liquid market?',
        options: [
          'Wide bid-ask spreads and frequent trading halts',
          'Tight bid-ask spreads with substantial order depth allowing large fills with minimal price impact',
          'Only one transaction taking place per hour',
          'No limit orders resting in the queue'
        ],
        correctIndex: 1,
        explanation: 'High liquidity is characterized by tight spreads and deep order books that absorb volume without excessive price distortion.'
      }
    ],
    commonMistakes: [
      'Assuming that a high paper profit on an illiquid asset can be cashed out at the current quoted price.',
      'Ignoring liquidity drying up during market openings, holidays, and high-impact macro releases.'
    ],
    learningObjectives: [
      'Identify the three dimensions of liquidity: tightness, depth, and resiliency.',
      'Calculate market impact on illiquid vs liquid instruments.',
      'Recognize liquidity evaporation during volatility shocks.'
    ],
    estimatedLearningTime: 16
  }
];
