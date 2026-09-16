import { CurriculumConcept } from '@/types/academy';

export const LEVEL_4_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c4-order-types-and-routing',
    title: 'Order Types & Algorithmic Routing',
    category: 'EXECUTION',
    level: 4,
    difficulty: 'Intermediate',
    description: 'Master advanced execution mechanics: Limit, Stop-Market, Stop-Limit, Icebergs, and institutional TWAP/VWAP execution algorithms.',
    simpleExplanation: 'A market order buys right now at whatever price is available. A limit order says "only buy if I can get this price or better." An iceberg order is a massive order sliced into tiny pieces so nobody sees how big it is.',
    professionalDefinition: 'The tactical syntax of exchange order submission: passive limit orders providing liquidity, aggressive market orders consuming liquidity, conditional stop triggers, and synthetic execution algorithms designed to minimize market impact.',
    prerequisites: ['c1-bid-ask-spread', 'c1-slippage-and-impact'],
    relatedConcepts: ['c4-order-book-depth', 'c4-tca-and-execution'],
    formulas: [
      {
        name: 'VWAP Benchmark',
        expression: 'VWAP = ∑(Price_i * Volume_i) / ∑(Volume_i)',
        notes: 'Institutional benchmark measuring whether execution beat the market volume-weighted average price.'
      }
    ],
    examples: [
      {
        scenario: 'An asset manager needs to purchase 500,000 shares of a stock that trades 2,000,000 shares per day (25% of daily volume).',
        analysis: 'Sending a single market order would blow through the entire order book, causing massive double-digit slippage. Instead, they run a VWAP slice algorithm that trickles orders over 6.5 hours.',
        outcome: 'Execution matches the day’s volume profile with minimal market distortion.'
      }
    ],
    artifacts: [
      {
        type: 'order-book-depth',
        title: 'Order Routing Sandbox',
        description: 'Compare Market vs Limit vs Stop-Limit execution in shifting liquidity queues.'
      }
    ],
    quizzes: [
      {
        id: 'q4-1',
        question: 'What is the significant danger of using a plain Stop-Loss Market order on a thinly traded asset during high volatility?',
        options: [
          'The order will be rejected by the exchange',
          'Once triggered, the stop turns into a market order that can fill at prices drastically worse than the trigger price (severe negative slippage)',
          'The order cannot be canceled after submission',
          'Brokers will charge double commissions'
        ],
        correctIndex: 1,
        explanation: 'A stop-market order guarantees execution, but guarantees zero price control; in an empty order book, it can fill miles below the trigger.'
      }
    ],
    commonMistakes: [
      'Using Stop-Limit orders without realizing that if price gaps through the limit price, the order will never fill and the trader remains trapped in a freefalling loss.',
      'Placing large retail block orders in illiquid pre-market or after-hours sessions.'
    ],
    learningObjectives: [
      'Differentiate execution guarantees between Market, Limit, Stop-Market, and Stop-Limit orders.',
      'Explain how institutional TWAP and VWAP execution algorithms operate.',
      'Deploy synthetic order types to minimize implementation shortfall.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c4-order-book-depth',
    title: 'Order Book Depth (L2/L3) & Queue Dynamics',
    category: 'MARKET MICROSTRUCTURE',
    level: 4,
    difficulty: 'Intermediate',
    description: 'Read the electronic Limit Order Book (LOB): price-time priority (FIFO), size priority, and spoofing detection.',
    simpleExplanation: 'The order book is like people standing in line at an airline ticket counter. First come, first served. You can see how many people want to buy at each price level and how many want to sell.',
    professionalDefinition: 'The continuous double auction queue maintaining unexecuted limit orders across price ticks, prioritized by Price-Time (FIFO) or Pro-Rata allocation models.',
    prerequisites: ['c0-price-discovery', 'c1-bid-ask-spread'],
    relatedConcepts: ['c4-order-types-and-routing', 'c4-toxic-order-flow'],
    examples: [
      {
        scenario: 'A 50,000-share bid appears at $100.00 right before an earnings announcement, and disappears 20 milliseconds before any trades hit it.',
        analysis: 'The order was likely non-firm algorithmic spoofing designed to feign demand and induce retail traders into bidding higher.',
        outcome: 'Institutional microstructure monitors verify whether resting depth actually absorbs volume or cancels.'
      }
    ],
    quizzes: [
      {
        id: 'q4-2',
        question: 'Under standard Price-Time Priority (FIFO) matching engines, who gets filled first when a market order hits the best bid?',
        options: [
          'The largest limit order regardless of when it was placed',
          'The limit order that was submitted earliest at that price level',
          'The trader using the most expensive broker',
          'Orders are selected randomly'
        ],
        correctIndex: 1,
        explanation: 'At the same price tier, FIFO rules give fill priority to the order that entered the matching engine queue first.'
      }
    ],
    commonMistakes: [
      'Treating Level 2 resting orders as permanent support/resistance (over 90% of limit orders are canceled by HFT algorithms before execution).',
      'Ignoring hidden orders and iceberg slicing.'
    ],
    learningObjectives: [
      'Interpret Level 2 depth tiers and bid-ask order book imbalances.',
      'Understand matching engine priority rules (Price-Time vs Pro-Rata).',
      'Detect phantom liquidity and spoofing tactics.'
    ],
    estimatedLearningTime: 24
  },
  {
    id: 'c4-tca-and-execution',
    title: 'Transaction Cost Analysis (TCA) & Hidden Drag',
    category: 'EXECUTION',
    level: 4,
    difficulty: 'Intermediate',
    description: 'Calculate total friction: commissions, exchange fees, bid-ask spread crossing, slippage, and market impact.',
    simpleExplanation: 'Every time you trade, you pay a tax. Even with "zero commission" brokers, you pay the spread and slippage. If you trade 500 times a year, these tiny fees can easily eat half your total profits.',
    professionalDefinition: 'The systematic post-trade auditing framework measuring total trading friction against benchmark metrics (Arrival Price, VWAP, Close) to optimize routing venues and minimize drag.',
    prerequisites: ['c1-bid-ask-spread', 'c1-slippage-and-impact'],
    relatedConcepts: ['c4-dark-pools-and-ecns', 'c7-backtesting-rigor'],
    formulas: [
      {
        name: 'Total Transaction Drag Formula',
        expression: 'Total Friction = Commissions + Exchange Fees + 0.5 * Spread + Slippage + Market Impact',
        notes: 'High-turnover strategies often fail because total friction exceeds strategy alpha.'
      }
    ],
    examples: [
      {
        scenario: 'A trader executes 1,000 round-trip trades a year. Average friction per trade is $15 (spread + slippage + fee).',
        analysis: 'Total annual execution friction = $15 * 1,000 = $15,000.',
        outcome: 'On a $50,000 account, the trader needs a 30% gross return just to break even after execution friction.'
      }
    ],
    quizzes: [
      {
        id: 'q4-3',
        question: 'Why do high-frequency or high-turnover day trading strategies frequently fail in real accounts despite looking profitable in simple backtests?',
        options: [
          'Because retail computers lack processing power',
          'Because real-world cumulative friction (bid-ask spread crossing, slippage, and exchange fees) compounds to eliminate strategy edge',
          'Because the SEC bans high-turnover retail trading',
          'Because candlestick charts are inaccurate'
        ],
        correctIndex: 1,
        explanation: 'Cumulative friction compounds with every execution; failing to model realistic spreads and slippage produces illusory paper backtests.'
      }
    ],
    commonMistakes: [
      'Assuming "zero commission" trading means free trading (ignoring payment for order flow and wider spreads).',
      'Ignoring execution drag when calculating expected value.'
    ],
    learningObjectives: [
      'Conduct a comprehensive Transaction Cost Analysis (TCA) on personal trade history.',
      'Quantify the true dollar drag of crossing spreads across hundreds of executions.',
      'Optimize execution style to harvest rebates or use passive limit fills.'
    ],
    estimatedLearningTime: 20
  },
  {
    id: 'c4-dark-pools-and-ecns',
    title: 'Dark Pools, Internalizers & Payment for Order Flow (PFOF)',
    category: 'MARKET MICROSTRUCTURE',
    level: 4,
    difficulty: 'Advanced',
    description: 'Where does retail order flow really go? Wholesalers, internalizers, dark liquidity, and off-exchange trading.',
    simpleExplanation: 'When you click "Buy" on your retail broker, your order rarely goes to the New York Stock Exchange. Instead, a giant market maker pays your broker for your order and fills it internally because retail flow is safe and profitable for them.',
    professionalDefinition: 'Off-exchange trading venues (Alternative Trading Systems) that match orders without pre-trade quote transparency. Wholesalers pay retail brokers for uninformed order flow (PFOF), routing it away from lit exchange books.',
    prerequisites: ['c0-financial-markets', 'c4-order-book-depth'],
    relatedConcepts: ['c4-toxic-order-flow', 'c10-prime-brokerage'],
    examples: [
      {
        scenario: 'A retail trader buys 100 shares of Microsoft on a zero-commission mobile app.',
        analysis: 'The broker routes the order to a wholesaler (e.g., Citadel Securities or Virtu). The wholesaler fills inside the NBBO spread and pays the broker a fraction of a cent per share.',
        outcome: 'The trade never touches NASDAQ or NYSE lit books.'
      }
    ],
    quizzes: [
      {
        id: 'q4-4',
        question: 'Why do wholesale market-making firms pay retail brokers for order flow (PFOF)?',
        options: [
          'Out of charity to encourage retail stock ownership',
          'Because retail order flow is generally small, non-institutional, and "uninformed," allowing market makers to profit consistently from the bid-ask spread with minimal adverse selection risk',
          'To bypass SEC registration rules',
          'Because retail traders always hold positions for decades'
        ],
        correctIndex: 1,
        explanation: 'Wholesalers eagerly buy retail flow because it does not represent informed institutional block buying that would push prices against their inventory.'
      }
    ],
    caseStudies: [
      {
        title: 'Flash Boys & Lit vs Dark Fragmentation (2014)',
        era: '2010s US Equity Markets',
        overview: 'Documented how HFT latency arbitrage and venue fragmentation allowed high-speed algorithms to front-run orders routing across disparate lit and dark exchanges.',
        keyTakeaway: 'Market microstructure routing choices directly determine fill quality and slippage.'
      }
    ],
    commonMistakes: [
      'Believing your retail orders move the public exchange market price directly.',
      'Misunderstanding price improvement vs exchange rebate economics.'
    ],
    learningObjectives: [
      'Explain the business model of Payment for Order Flow (PFOF).',
      'Compare pre-trade and post-trade transparency in lit markets vs dark pools.',
      'Evaluate how order routing impacts execution speed and price improvement.'
    ],
    estimatedLearningTime: 25
  },
  {
    id: 'c4-toxic-order-flow',
    title: 'Toxic Order Flow & Adverse Selection',
    category: 'INSTITUTIONAL TRADING',
    level: 4,
    difficulty: 'Advanced',
    description: 'Why resting limit orders get filled right before the market crashes: the mechanics of adverse selection.',
    simpleExplanation: 'Adverse selection means: when someone eagerly sells to your limit buy order, it’s usually because they know something you don’t, and price is about to drop right through your price!',
    professionalDefinition: 'The statistical phenomenon where passive limit orders are preferentially executed by informed, toxic aggressive flow immediately prior to adverse price jumps, degrading passive execution profitability.',
    prerequisites: ['c4-order-book-depth', 'c1-bid-ask-spread'],
    relatedConcepts: ['c4-tca-and-execution', 'c6-expected-value'],
    formulas: [
      {
        name: 'VPIN (Volume-Synchronized Probability of Toxicity)',
        expression: 'VPIN = ∑ |V_buy_τ - V_sell_τ| / (2 * V_bar)',
        notes: 'Measures the imbalance between buyer and seller-initiated volume in constant-volume buckets.'
      }
    ],
    examples: [
      {
        scenario: 'A trader places a passive limit buy order at $50.00 support. Suddenly, a multi-million-dollar hedge fund liquidation begins.',
        analysis: 'Your limit order fills instantly. But price immediately cascades through $50 down to $46.',
        outcome: 'You experienced adverse selection: you were filled precisely because the flow was overwhelmingly informed and toxic.'
      }
    ],
    quizzes: [
      {
        id: 'q4-5',
        question: 'What is "adverse selection" in limit order execution?',
        options: [
          'Selecting the wrong stock symbol on the order entry ticket',
          'The tendency for limit orders to be executed when the market is moving rapidly against the trader, because informed flow is consuming resting inventory',
          'The broker canceling an order without permission',
          'Paying high commission fees'
        ],
        correctIndex: 1,
        explanation: 'Adverse selection occurs when passive limit orders fill because an informed party aggressively drives price through the queue.'
      }
    ],
    commonMistakes: [
      'Assuming that getting filled quickly on a limit order is always a good sign.',
      'Leaving resting limit orders active right ahead of high-impact macro data releases.'
    ],
    learningObjectives: [
      'Define adverse selection and toxic order flow mathematically.',
      'Explain VPIN and order flow toxicity indicators.',
      'Design adaptive limit order cancel policies during volatility spikes.'
    ],
    estimatedLearningTime: 22
  }
];
