import { CurriculumConcept } from '@/types/academy';

export const LEVEL_2_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c2-market-structure',
    title: 'Market Structure: Swing Points & Trend Geometry',
    category: 'TECHNICAL ANALYSIS',
    level: 2,
    difficulty: 'Beginner',
    description: 'Deconstruct structural swing highs and swing lows into objective market trends, trend breaks, and range rotations.',
    simpleExplanation: 'An uptrend is like walking up stairs: each step up reaches higher, and each step back rests higher than the step before. A trend change happens when a step breaks through the floor below it.',
    professionalDefinition: 'The recursive hierarchical framework of price action defined by Higher Highs (HH) / Higher Lows (HL) in expansion regimes, and Lower Highs (LH) / Lower Lows (LL) in contraction regimes, demarcated by structural breaks of structure (BOS) and changes of character (CHoCH).',
    prerequisites: ['c0-price-discovery', 'c1-bid-ask-spread'],
    relatedConcepts: ['c2-support-resistance-liquidity', 'c2-auction-market-theory'],
    examples: [
      {
        scenario: 'Asset forms a series of higher swing lows at $120, $125, and $130, before price violently crashes below $130 to close at $122.',
        analysis: 'The break below the most recent higher swing low invalidates the bullish structural sequence, confirming a structural trend shift.',
        outcome: 'Systematic trend followers exit long exposures and reallocate to neutral or short regimes.'
      }
    ],
    artifacts: [
      {
        type: 'market-structure',
        title: 'Recursive Market Structure Visualizer',
        description: 'Toggle between multi-timeframe swing points and identify structural breaks.'
      }
    ],
    quizzes: [
      {
        id: 'q2-1',
        question: 'What constitutes a valid structural Change of Character (CHoCH) in an established uptrend?',
        options: [
          'RSI indicator moving above 70',
          'Price closing below the most recent confirmed swing low that produced the highest high',
          'The 20-period moving average pointing down for one candle',
          'A single high-volume red candle occurring at new highs'
        ],
        correctIndex: 1,
        explanation: 'A trend change requires an objective structural breakdown below the demand origin (the swing low that created the recent high).'
      }
    ],
    commonMistakes: [
      'Labeling internal sub-structure noise on 1-minute charts as major structural pivots.',
      'Assuming an uptrend remains intact after key swing low liquidity has been consumed.'
    ],
    learningObjectives: [
      'Identify swing highs and swing lows with objective algorithmic rules.',
      'Differentiate between minor internal pullbacks and major swing pivots.',
      'Map multi-timeframe fractal market structure from daily to intraday intervals.'
    ],
    estimatedLearningTime: 20
  },
  {
    id: 'c2-support-resistance-liquidity',
    title: 'Support, Resistance & Liquidity Pools',
    category: 'TECHNICAL ANALYSIS',
    level: 2,
    difficulty: 'Intermediate',
    description: 'Why classic support and resistance levels are not magic barriers, but magnets where resting stop orders accumulate.',
    simpleExplanation: 'Support is not a magic floor. It is a place where hundreds of traders put their buy orders, and more importantly, where short sellers place their stop-loss orders. Big players use these areas to find the liquidity they need.',
    professionalDefinition: 'Price zones exhibiting high concentrations of conditional orders (stop-losses, breakout stops, and limit orders). Institutional participants target these liquidity clusters to fulfill large block orders without incurring outsized slippage.',
    prerequisites: ['c2-market-structure', 'c0-liquidity-basics'],
    relatedConcepts: ['c2-liquidity-sweeps', 'c4-order-types-and-routing'],
    examples: [
      {
        scenario: 'An asset tests $100 three consecutive times, creating a clear "triple bottom" on retail charts.',
        analysis: 'Retail traders place buy stops at $100.50 and protective sell stop-losses directly at $99.80. A massive cluster of sell liquidity is now trapped below $100.',
        outcome: 'Price spikes downward through $99.80, triggering the stop-loss sell orders, allowing an institutional buyer to accumulate 500,000 shares before price reverses.'
      }
    ],
    quizzes: [
      {
        id: 'q2-2',
        question: 'Why do major support levels often see price spike briefly below them before aggressively reversing higher?',
        options: [
          'The exchange software malfunctioned during the session',
          'Resting stop-loss sell orders below support provided the necessary liquidity for large buyers to fill their orders without slippage',
          'Trading volume permanently dropped to zero',
          'Moving averages forced the market to reverse'
        ],
        correctIndex: 1,
        explanation: 'Institutional participants require counterparties. Clustered retail stop orders below support provide ready liquidity for large position accumulation.'
      }
    ],
    commonMistakes: [
      'Placing protective stops directly on obvious round numbers or just 1 tick below support lines.',
      'Treating support lines as thin rigid barriers rather than probabilistic liquidity zones.'
    ],
    learningObjectives: [
      'Reframe support and resistance from static lines into institutional liquidity pools.',
      'Anticipate where market stops are clustered across retail chart patterns.',
      'Formulate entry techniques that execute alongside liquidity-hunting algorithms.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c2-auction-market-theory',
    title: 'Auction Market Theory & The Value Area',
    category: 'TECHNICAL ANALYSIS',
    level: 2,
    difficulty: 'Intermediate',
    description: 'How financial markets organize around bell curves of fair value, balance, and directional price discovery.',
    simpleExplanation: 'Markets act like a live auction. Most trading happens at prices that buyers and sellers agree are fair (the Value Area). When price moves outside fair value, the market either rejects it quickly or accepts it and starts building a new value zone.',
    professionalDefinition: 'The analytical framework stating that markets exist to facilitate trade by auctioning from low to high until buying stops, and high to low until selling stops. Governed by Point of Control (POC), Value Area High (VAH), and Value Area Low (VAL).',
    prerequisites: ['c0-price-discovery', 'c2-market-structure'],
    relatedConcepts: ['c2-candlestick-mechanics', 'c6-probability-distributions'],
    formulas: [
      {
        name: 'Value Area Calculation',
        expression: 'Value Area = Price Range containing ~70% of total volume traded',
        notes: 'Mirrors 1 standard deviation (68.2%) of a Gaussian volume distribution.'
      }
    ],
    examples: [
      {
        scenario: 'S&P 500 futures open above yesterday’s Value Area High and fail to attract new buying volume.',
        analysis: 'The auction tests higher prices but finds no responsive buyers. Price rotates back into the prior day’s value area.',
        outcome: 'The market executes an 80% Rule rotation through the Point of Control straight to Value Area Low.'
      }
    ],
    quizzes: [
      {
        id: 'q2-3',
        question: 'In Auction Market Theory, what does the Point of Control (POC) represent?',
        options: [
          'The highest price reached during the trading day',
          'The exact price level where the greatest volume of contracts was traded during the period',
          'The opening price set by the exchange board',
          'The stop-loss price recommended by technical analysts'
        ],
        correctIndex: 1,
        explanation: 'The Point of Control (POC) represents the single price level of maximum commercial consensus and trade facilitation.'
      }
    ],
    commonMistakes: [
      'Buying breakouts at the top of a balanced value area without checking volume acceptance.',
      'Ignoring whether the market is currently in a balancing (mean-reverting) or trending (imbalanced) state.'
    ],
    learningObjectives: [
      'Differentiate between balanced range regimes and trending imbalance regimes.',
      'Calculate Value Area High (VAH), Value Area Low (VAL), and Point of Control (POC).',
      'Deploy responsive vs initiative auction strategies based on market location.'
    ],
    estimatedLearningTime: 25
  },
  {
    id: 'c2-candlestick-mechanics',
    title: 'Candlestick Anatomy & Volume Profile',
    category: 'MARKET MICROSTRUCTURE',
    level: 2,
    difficulty: 'Beginner',
    description: 'Read the battle between buyers and sellers behind candle wicks, body sizes, and volume distributions.',
    simpleExplanation: 'A candlestick shows four numbers: Open, High, Low, and Close. Long wicks show where price was violently rejected. Volume shows how much fuel was behind the move.',
    professionalDefinition: 'OHLC visual aggregations representing time-bracketed price discovery. Candle bodies reflect net aggressive order flow direction, while shadows (wicks) quantify liquidity rejection and buyer-seller exhaustion.',
    prerequisites: ['c0-price-discovery', 'c1-bid-ask-spread'],
    relatedConcepts: ['c2-market-structure', 'c2-support-resistance-liquidity'],
    examples: [
      {
        scenario: 'A candle opens at $50, drops to $46 on heavy volume, but closes at $49.80 with a massive lower wick.',
        analysis: 'Sellers attempted an aggressive markdown, but institutional limit buy orders absorbed all sell flow and reversed price back to opening levels.',
        outcome: 'The resulting pin bar wick confirms aggressive buy absorption at $46.'
      }
    ],
    quizzes: [
      {
        id: 'q2-4',
        question: 'What does a long upper shadow (wick) on a candlestick indicate?',
        options: [
          'Strong and sustained buying pressure that held into the close',
          'Price was pushed higher during the session but encountered aggressive selling or lack of liquidity, causing price to retreat before the close',
          'The market was completely closed for trading during that period',
          'A guaranteed continuation of the bullish trend'
        ],
        correctIndex: 1,
        explanation: 'A long upper shadow signifies that buyers pushed price higher, but sellers responded with sufficient volume to force price back down.'
      }
    ],
    commonMistakes: [
      'Memorizing Japanese candlestick names without understanding the underlying order absorption.',
      'Analyzing candle shapes in isolation without looking at preceding market structure and volume.'
    ],
    learningObjectives: [
      'Deconstruct any candlestick into Open, High, Low, Close, and net directional impulse.',
      'Interpret long shadows as localized liquidity absorption and rejection.',
      'Combine candlestick patterns with volume verification.'
    ],
    estimatedLearningTime: 18
  },
  {
    id: 'c2-liquidity-sweeps',
    title: 'Liquidity Sweeps & Stop Runs',
    category: 'TECHNICAL ANALYSIS',
    level: 2,
    difficulty: 'Intermediate',
    description: 'Recognize how institutional algorithms engineer false breakouts to absorb retail stop orders.',
    simpleExplanation: 'A liquidity sweep is when price pokes just past a recent high or low to trigger everyone’s stop-loss orders, and then instantly zips back the other way. The big players used those stops to fill their own orders.',
    professionalDefinition: 'A deliberate excursion past prominent structural extrema engineered to trigger resting stop-loss liquidity, followed by immediate absorption and directional displacement in the opposing direction.',
    prerequisites: ['c2-support-resistance-liquidity', 'c1-slippage-and-impact'],
    relatedConcepts: ['c2-market-structure', 'c4-order-types-and-routing'],
    examples: [
      {
        scenario: 'Stock breaks out above a 2-week resistance high by $0.20 on high volume, but fails to print a single higher tick and immediately dumps back inside the range.',
        analysis: 'The breakout triggered both retail buy-stop orders and short-seller stop losses. An institutional seller supplied that liquidity to offload a large inventory position.',
        outcome: 'Trapped breakout buyers are now underwater, providing fuel for a sharp selloff.'
      }
    ],
    quizzes: [
      {
        id: 'q2-5',
        question: 'What occurs during an engineered liquidity sweep at key highs?',
        options: [
          'Traders are forced by regulators to liquidate accounts',
          'Price briefly pierces above the high to trigger buy-stop liquidity, which is consumed by institutional sellers who then drive price downward',
          'All bid and ask quotes are permanently canceled',
          'The asset is delisted from the exchange'
        ],
        correctIndex: 1,
        explanation: 'Liquidity sweeps deliberately harvest clustered resting stops above highs to fill large opposing limit orders.'
      }
    ],
    commonMistakes: [
      'Buying immediately as soon as price breaches a major high without waiting for volume acceptance or structure confirmation.',
      'Failing to recognize that trapped breakout traders accelerate opposing moves when they panic sell.'
    ],
    learningObjectives: [
      'Identify classic liquidity sweep footprints across key swing highs and lows.',
      'Distinguish genuine breakout expansion from false breakout sweeps.',
      'Design systematic entry rules triggered after liquidity has been swept.'
    ],
    estimatedLearningTime: 22
  }
];
