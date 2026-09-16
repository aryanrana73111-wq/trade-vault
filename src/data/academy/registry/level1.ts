import { CurriculumConcept } from '@/types/academy';

export const LEVEL_1_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c1-asset-classes',
    title: 'Global Asset Classes & Market Structure',
    category: 'MARKETS',
    level: 1,
    difficulty: 'Beginner',
    description: 'Structural characteristics of Equities, Foreign Exchange, Sovereign Debt, Commodities, and Crypto.',
    simpleExplanation: 'Stocks represent company ownership. Currencies trade against each other in pairs. Bonds are loans to governments or corporations. Commodities are physical goods like oil and gold.',
    professionalDefinition: 'The institutional taxonomy of financial claims, differentiated by legal rights (equity residual vs debt seniority), settlement mechanics, trading venues (lit exchange vs decentralized OTC), and macroeconomic drivers.',
    prerequisites: ['c0-financial-markets', 'c0-liquidity-basics'],
    relatedConcepts: ['c1-bid-ask-spread', 'c1-leverage-and-margin'],
    examples: [
      {
        scenario: 'Trading EUR/USD (24/5 OTC market with no single central exchange) vs trading Apple shares (centralized clearing on NASDAQ).',
        analysis: 'FX trades via interbank credit lines with variable ECN liquidity. Equities trade on regulated exchanges governed by the National Market System (Reg NMS).',
        outcome: 'Traders must account for differing trading hours, regulatory protections, and execution transparency.'
      }
    ],
    quizzes: [
      {
        id: 'q1-1',
        question: 'How does the Foreign Exchange (FX) market structurally differ from the US Equity market?',
        options: [
          'FX has one single building in New York where all trades occur',
          'FX is a decentralized, over-the-counter (OTC) global interbank network operating 24 hours a day during business days',
          'FX transactions cannot be settled electronically',
          'FX does not involve buyers and sellers'
        ],
        correctIndex: 1,
        explanation: 'FX operates without a single centralized exchange; transactions clear across global tier-1 banks and ECN networks.'
      }
    ],
    commonMistakes: [
      'Assuming technical patterns operate identically across equity cash sessions and 24/7 crypto or FX markets.',
      'Failing to recognize that bond markets drive global currency and equity valuations.'
    ],
    learningObjectives: [
      'Categorize the 5 major asset classes by risk-return profiles and regulatory structure.',
      'Identify differing trading sessions and liquidity characteristics across global timezones.',
      'Explain the fundamental difference between spot and derivative instruments.'
    ],
    estimatedLearningTime: 16
  },
  {
    id: 'c1-bid-ask-spread',
    title: 'The Bid, Ask, Spread & Cost of Trading',
    category: 'TRADING FUNDAMENTALS',
    level: 1,
    difficulty: 'Beginner',
    description: 'How the spread represents the immediate markup paid by aggressive market orders to passive market makers.',
    simpleExplanation: 'The Bid is the highest price someone is willing to buy for. The Ask is the lowest price someone is willing to sell for. The gap between them is the spread, and you start every market trade with that loss.',
    professionalDefinition: 'The bid-ask spread is the instantaneous liquidity premium demanded by designated market makers and algorithmic liquidity providers to compensate for adverse selection, inventory carrying risk, and processing costs.',
    prerequisites: ['c0-price-discovery', 'c0-liquidity-basics'],
    relatedConcepts: ['c1-slippage-and-impact', 'c4-order-types-and-routing'],
    formulas: [
      {
        name: 'Percentage Bid-Ask Spread',
        expression: 'Spread_pct = ((Ask - Bid) / MidPrice) * 10,000 (bps)',
        variables: [
          { symbol: 'Ask', meaning: 'Lowest resting offer to sell' },
          { symbol: 'Bid', meaning: 'Highest resting offer to buy' },
          { symbol: 'MidPrice', meaning: '(Bid + Ask) / 2' }
        ],
        notes: 'High-frequency institutional desks measure spread friction in basis points (bps = 0.01%).'
      }
    ],
    examples: [
      {
        scenario: 'Buying a stock quoted Bid: $100.00 (x 5,000) / Ask: $100.05 (x 5,000) with a market order.',
        analysis: 'You pay $100.05. If you immediately sell with another market order, you receive $100.00, losing $0.05 per share (5 bps) before price even moves.',
        outcome: 'Frequent market orders create heavy transaction friction that compounds over hundreds of trades.'
      }
    ],
    artifacts: [
      {
        type: 'market-structure',
        title: 'Bid-Ask Spread Mechanics',
        description: 'Interactive visualization of the spread crossing dynamic.'
      }
    ],
    quizzes: [
      {
        id: 'q1-2',
        question: 'If you buy with an aggressive market order, which price do you transact at?',
        options: [
          'The Bid price',
          'The Ask (Offer) price',
          'The midpoint between Bid and Ask',
          'The previous closing price'
        ],
        correctIndex: 1,
        explanation: 'Aggressive buy orders lift the ask; aggressive sell orders hit the bid.'
      }
    ],
    commonMistakes: [
      'Ignoring the spread on lower-priced stocks where a $0.05 spread represents a massive percentage hurdle.',
      'Constantly crossing the spread with market orders on high-frequency setups.'
    ],
    learningObjectives: [
      'Calculate spread cost in absolute dollars and basis points.',
      'Explain adverse selection risk for market makers.',
      'Select between passive limit orders and aggressive market orders.'
    ],
    estimatedLearningTime: 18
  },
  {
    id: 'c1-slippage-and-impact',
    title: 'Slippage, Market Impact & Fill Quality',
    category: 'EXECUTION',
    level: 1,
    difficulty: 'Beginner',
    description: 'Why you don’t always get the price on your screen, and how order size changes the market price.',
    simpleExplanation: 'If you want to buy 10,000 apples, but the first shop only has 1,000 apples for $1, you have to buy from the next shop for $1.10. That extra cost is slippage.',
    professionalDefinition: 'The divergence between the decision price (arrival price) and the volume-weighted average execution price, caused by latency, queue depletion, and endogenous market impact.',
    prerequisites: ['c1-bid-ask-spread'],
    relatedConcepts: ['c4-order-types-and-routing', 'c4-tca-and-execution'],
    formulas: [
      {
        name: 'Implementation Shortfall / Slippage',
        expression: 'Slippage = |ExecutionPrice - ArrivalPrice| / ArrivalPrice',
        notes: 'Measures total execution drag against the moment the trading signal was generated.'
      }
    ],
    examples: [
      {
        scenario: 'A breakout occurs and hundreds of algorithmic traders send market buy orders simultaneously.',
        analysis: 'By the time your order reaches the exchange matching engine, resting asks have already been consumed.',
        outcome: 'Your order fills $0.40 higher than the chart price you clicked, destroying the setup risk-reward ratio.'
      }
    ],
    quizzes: [
      {
        id: 'q1-3',
        question: 'What is the primary cause of execution slippage in fast markets?',
        options: [
          'The broker charging an extra hidden commission fee',
          'Available resting liquidity at top of book being consumed before an order arrives at the matching engine',
          'Federal reserve interest rate adjustments',
          'A glitch in candle rendering charts'
        ],
        correctIndex: 1,
        explanation: 'Slippage occurs when available liquidity at the target price is exhausted before the order can be matched.'
      }
    ],
    commonMistakes: [
      'Backtesting strategies assuming 100% fill rate at the exact breakout price with zero slippage.',
      'Placing large market orders during illiquid market opens or closes.'
    ],
    learningObjectives: [
      'Differentiate between positive slippage, negative slippage, and market impact.',
      'Account for realistic slippage drag in strategy expectation formulas.',
      'Use limit orders with marketable price caps to control maximum slippage.'
    ],
    estimatedLearningTime: 15
  },
  {
    id: 'c1-leverage-and-margin',
    title: 'Leverage, Margin & Liquidation Cascades',
    category: 'TRADING FUNDAMENTALS',
    level: 1,
    difficulty: 'Beginner',
    description: 'The mathematics of borrowed capital, margin requirements, margin calls, and forced liquidations.',
    simpleExplanation: 'Leverage is borrowing money from your broker to trade bigger positions. If you have $10,000 and borrow $40,000, you have 5x leverage. A 20% drop in price wipes out 100% of your money!',
    professionalDefinition: 'Financial gearing that magnifies return on equity through borrowed debt. Initial and maintenance margin ratios govern collateral adequacy, while breach of maintenance thresholds triggers automated liquidation protocols.',
    prerequisites: ['c0-financial-markets'],
    relatedConcepts: ['c3-risk-per-trade', 'c3-asymmetric-drawdowns'],
    formulas: [
      {
        name: 'Leverage Ratio & Liquidation Distance',
        expression: 'Leverage = PositionValue / Equity ; Max_Adverse_Move = (1 / Leverage) * 100%',
        notes: 'At 10x leverage, a 10% move against position causes total equity loss; at 50x leverage, just 2% destroys the account.'
      }
    ],
    examples: [
      {
        scenario: 'Trader with $25,000 account buys $100,000 worth of futures (4x leverage).',
        analysis: 'A 5% favorable move yields +$5,000 (+20% on equity). But a 5% adverse drop loses -$5,000 (-20% on equity).',
        outcome: 'Leverage scales returns symmetrically but accelerates the path to mathematical ruin exponentially.'
      }
    ],
    artifacts: [
      {
        type: 'equity-drawdown',
        title: 'Leverage and Drawdown Simulator',
        description: 'See how leverage speeds up the probability of margin calls.'
      }
    ],
    quizzes: [
      {
        id: 'q1-4',
        question: 'If a trader uses 20x financial leverage, what adverse percentage move in the underlying asset wipes out 100% of their equity?',
        options: [
          '20%',
          '5%',
          '50%',
          '10%'
        ],
        correctIndex: 1,
        explanation: 'At 20x leverage, 100% / 20 = 5%. A 5% decline results in a complete loss of margin equity.'
      }
    ],
    commonMistakes: [
      'Equating high broker leverage availability with the requirement to use it.',
      'Failing to monitor overnight maintenance margin requirements.'
    ],
    learningObjectives: [
      'Calculate effective leverage, initial margin, and maintenance margin.',
      'Explain how broker automated liquidation algorithms execute in thin liquidity.',
      'Recognize how market-wide liquidation cascades trigger flash crashes.'
    ],
    estimatedLearningTime: 20
  },
  {
    id: 'c1-long-vs-short',
    title: 'Long vs Short Mechanics & Borrow Costs',
    category: 'EXECUTION',
    level: 1,
    difficulty: 'Beginner',
    description: 'How short selling works mechanically: borrowing shares, rebate rates, locates, and short squeeze dynamics.',
    simpleExplanation: 'Going long is buying low to sell high. Going short is borrowing someone else’s shares to sell them today, hoping to buy them back later for cheaper and return them, keeping the difference.',
    professionalDefinition: 'Selling borrowed financial securities with the obligation to repurchase in the market to settle the loan. Governed by locate requirements, borrow fees, hard-to-borrow (HTB) rates, and short squeeze asymmetry.',
    prerequisites: ['c0-financial-markets', 'c1-leverage-and-margin'],
    relatedConcepts: ['c1-asset-classes', 'c2-market-structure'],
    examples: [
      {
        scenario: 'Shorting 1,000 shares of a heavily shorted stock with 80% annual borrow fee.',
        analysis: 'If the stock trades sideways for 3 months, you pay substantial financing costs. If unexpected positive news hits, panicked short sellers must buy simultaneously to close.',
        outcome: 'The short squeeze produces an explosive upward cascade with theoretically infinite risk.'
      }
    ],
    quizzes: [
      {
        id: 'q1-5',
        question: 'Why is short selling fundamentally asymmetrical compared to going long?',
        options: [
          'A long position can fall at most to zero (100% max loss), whereas an asset price has theoretically infinite upside potential',
          'Brokers do not allow short sales during market hours',
          'Short selling generates higher dividend payments',
          'Short sales never incur transaction fees'
        ],
        correctIndex: 0,
        explanation: 'A long trade has limited downside (-100%) and unlimited upside; a short trade has limited upside (+100%) and theoretically unlimited upside risk.'
      }
    ],
    caseStudies: [
      {
        title: 'The GameStop Short Squeeze (2021)',
        era: 'January 2021',
        overview: 'Short interest on GameStop exceeded 140% of available float. Retail call buying forced options market makers to buy underlying shares, creating a historic gamma and short squeeze that devastated hedge fund Melvin Capital.',
        keyTakeaway: 'Crowded short positions carry systemic convexity risk when borrow availability vanishes.'
      }
    ],
    commonMistakes: [
      'Shorting into parabolic momentum without a strict stop-loss, exposing the account to catastrophic gap risk.',
      'Overlooking expensive overnight borrow fees on hard-to-borrow tickers.'
    ],
    learningObjectives: [
      'Explain the legal mechanics of locating and borrowing securities.',
      'Quantify the asymmetry of shorting: positive skew vs negative skew.',
      'Identify short squeeze conditions through short interest ratio and days-to-cover.'
    ],
    estimatedLearningTime: 18
  }
];
