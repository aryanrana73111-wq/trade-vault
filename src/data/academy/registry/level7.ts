import { CurriculumConcept } from '@/types/academy';

export const LEVEL_7_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c7-systematic-architecture',
    title: 'Rule-Based System Architecture & Signal Logic',
    category: 'SYSTEMATIC TRADING',
    level: 7,
    difficulty: 'Advanced',
    description: 'Transform discretionary ideas into unambiguous, fully algorithmic rules for Setup, Trigger, Sizing, Invalidation, and Profit Targets.',
    simpleExplanation: 'A systematic strategy leaves zero room for guessing. Every single step—when to enter, how much to buy, where the stop goes, and when to exit—is written in exact logical rules that a computer could execute.',
    professionalDefinition: 'The formalization of a trading methodology into deterministic state machines: Universe Selection -> Regime Filter -> Signal Generation -> Position Sizing -> Order Execution -> Portfolio Risk Management.',
    prerequisites: ['c3-risk-per-trade', 'c6-expected-value'],
    relatedConcepts: ['c7-backtesting-rigor', 'c7-trading-playbook'],
    examples: [
      {
        scenario: 'Discretionary trader says "buy when it looks strong" vs systematic trader specifying "buy when 20-EMA crosses 50-EMA while ADX > 25 and close > prior day high, risking exactly 1% with stop at lowest low of 5 bars."',
        analysis: 'The discretionary trader cannot be backtested or audited. The systematic trader can be simulated across 20 years of tick data.',
        outcome: 'Systematic rules eliminate emotional hesitation and enable objective optimization.'
      }
    ],
    quizzes: [
      {
        id: 'q7-1',
        question: 'What is the primary advantage of a fully systematic trading model over discretionary trading?',
        options: [
          'It is guaranteed to never lose money',
          'It removes subjective emotional bias, allows rigorous statistical backtesting, and ensures consistent rule execution',
          'It eliminates all transaction fees',
          'It requires no risk management'
        ],
        correctIndex: 1,
        explanation: 'Systematic architectures enable rigorous scientific validation and eliminate the emotional inconsistency that ruins discretionary trading.'
      }
    ],
    commonMistakes: [
      'Having vague entry rules like "buy when momentum feels good."',
      'Overcomplicating the strategy with 12 contradictory indicators (curve-fitting).'
    ],
    learningObjectives: [
      'Deconstruct any trading edge into the 5 core system pillars: Universe, Filter, Trigger, Size, Exit.',
      'Code deterministic state logic for trade lifecycle management.',
      'Eliminate ambiguity from trading rules.'
    ],
    estimatedLearningTime: 24
  },
  {
    id: 'c7-backtesting-rigor',
    title: 'Backtesting Rigor: Survivorship & Lookahead Bias',
    category: 'SYSTEMATIC TRADING',
    level: 7,
    difficulty: 'Advanced',
    description: 'Avoid the fatal backtest sins: lookahead bias, survivorship bias, snooping, and unrealistic fill assumptions.',
    simpleExplanation: 'Lookahead bias is accidentally letting your strategy "peek into the future" in the code. Survivorship bias is testing only stocks that exist today, forgetting about all the bankrupt companies that crashed to zero along the way. Both create fake profitable backtests.',
    professionalDefinition: 'The rigorous simulation of trading strategies across historical market data, requiring survivorship-bias-free datasets, strict point-in-time data alignment, realistic order book fills, and zero lookahead leakage.',
    prerequisites: ['c6-sample-size-significance', 'c7-systematic-architecture'],
    relatedConcepts: ['c7-walk-forward-testing', 'c4-tca-and-execution'],
    examples: [
      {
        scenario: 'A strategy backtested on the S&P 500 from 2000 to 2020 shows a 25% annual return, but only includes current members of the S&P 500 index.',
        analysis: 'The backtest automatically excluded Enron, WorldCom, Lehman Brothers, and hundreds of other companies that went bankrupt and were removed from the index.',
        outcome: 'When run live on current stocks, the strategy fails completely because of survivorship bias.'
      }
    ],
    quizzes: [
      {
        id: 'q7-2',
        question: 'What is "Lookahead Bias" in trading backtests?',
        options: [
          'Looking ahead to next year’s tax returns',
          'Using data in the backtest algorithm that would not have been known or available at the exact historical timestamp of the trade execution',
          'Using modern computers to backtest old data',
          'Looking at multiple monitors simultaneously'
        ],
        correctIndex: 1,
        explanation: 'Lookahead bias occurs when future data (like today’s closing price before the day ends, or restated financial earnings) leaks into past decision logic.'
      }
    ],
    caseStudies: [
      {
        title: 'The Quant Meltdown (August 2007)',
        era: 'August 2007',
        overview: 'Dozens of multi-factor quantitative equity market-neutral hedge funds using identical backtested valuation and momentum factors suffered simultaneous liquidations as crowded models unwound.',
        keyTakeaway: 'Backtests showing high historical Sharpe ratios can conceal catastrophic factor crowding risk.'
      }
    ],
    commonMistakes: [
      'Assuming market orders in backtests always fill at the exact closing price of the signal candle.',
      'Testing strategies on data that has already been adjusted for future stock splits and dividend distributions.'
    ],
    learningObjectives: [
      'Detect and eliminate lookahead bias from algorithm code.',
      'Utilize survivorship-bias-free point-in-time data.',
      'Incorporate realistic execution latency and tick slippage models.'
    ],
    estimatedLearningTime: 26
  },
  {
    id: 'c7-walk-forward-testing',
    title: 'Walk-Forward Optimization & Out-of-Sample Validation',
    category: 'SYSTEMATIC TRADING',
    level: 7,
    difficulty: 'Institutional',
    description: 'The gold standard of quantitative validation: train on in-sample data, test on out-of-sample data, and roll forward.',
    simpleExplanation: 'Never test a strategy on the same data you used to build it! Divide your data into two rooms. Build and tune your strategy in Room 1 (In-Sample). Then test it blindly in Room 2 (Out-of-Sample). If it only works in Room 1, it was overfitted garbage.',
    professionalDefinition: 'The iterative validation protocol that optimizes parameters over a historical in-sample training window, steps forward to evaluate performance on untouched out-of-sample data, and repeats over rolling chronological windows to quantify parameter stability.',
    prerequisites: ['c7-backtesting-rigor'],
    relatedConcepts: ['c6-sample-size-significance', 'c10-multi-manager-allocations'],
    formulas: [
      {
        name: 'Walk-Forward Efficiency Ratio (WFE)',
        expression: 'WFE = Annualized OOS Return / Annualized In-Sample Return',
        notes: 'A WFE ratio > 50-60% suggests robust parameter stability across unobserved market regimes.'
      }
    ],
    examples: [
      {
        scenario: 'A strategy optimizes moving average lengths to find the highest return from 2010 to 2015 (In-Sample: 35% return). It then trades blindly on 2016 data (Out-of-Sample).',
        analysis: 'In 2016, the strategy makes 22% return (WFE = 63%). The parameters are then re-estimated and stepped forward to 2017.',
        outcome: 'Walk-forward testing simulates live operational deployment with realistic parameter decay.'
      }
    ],
    quizzes: [
      {
        id: 'q7-3',
        question: 'What is the purpose of Out-of-Sample (OOS) testing in systematic strategy development?',
        options: [
          'To test strategies when the stock market is completely closed',
          'To verify whether strategy performance holds up on fresh, unseen market data that was never used during parameter optimization, proving resistance to overfitting',
          'To guarantee that win rates never drop below 90%',
          'To speed up computer simulation runtimes'
        ],
        correctIndex: 1,
        explanation: 'Out-of-sample testing confirms that the strategy discovered a genuine repeatable market edge rather than merely memorizing historical noise.'
      }
    ],
    commonMistakes: [
      'Repeatedly tweaking rules after looking at out-of-sample results (turning out-of-sample data back into in-sample data).',
      'Over-optimizing across hundreds of parameter combinations until an artificial equity curve appears.'
    ],
    learningObjectives: [
      'Design train/test split protocols for financial time series.',
      'Calculate Walk-Forward Efficiency (WFE) ratios.',
      'Distinguish between parameter robustness and parameter curve-fitting.'
    ],
    estimatedLearningTime: 28
  },
  {
    id: 'c7-regime-detection',
    title: 'Market Regime Filtering (Trend vs Range vs High Vol)',
    category: 'SYSTEMATIC TRADING',
    level: 7,
    difficulty: 'Advanced',
    description: 'Classify whether the market is trending, mean-reverting, or in volatility expansion to adapt strategy rules.',
    simpleExplanation: 'No strategy works all the time. Trend-following strategies print money when markets are moving fast, but bleed money in choppy ranges. A regime filter acts like a weather forecast: don’t use an umbrella when it’s sunny!',
    professionalDefinition: 'The quantitative classification of market states (Low Vol Bull, High Vol Bear, Choppy Sideways Range) using volatility metrics (ATR, VIX), trend filters (ADX, Moving Average Slopes), and Hidden Markov Models (HMM).',
    prerequisites: ['c2-market-structure', 'c6-z-score-standard-deviation'],
    relatedConcepts: ['c7-systematic-architecture', 'c8-implied-vs-historical-volatility'],
    examples: [
      {
        scenario: 'A breakout strategy trades when the 50-day ADX < 15 (choppy range).',
        analysis: 'Breakouts in low-trend environments experience an 80% failure rate (false breakout sweeps).',
        outcome: 'Adding a regime filter (ADX > 25 and Realized Volatility expanding) cuts false trades by 65% and doubles Sharpe ratio.'
      }
    ],
    quizzes: [
      {
        id: 'q7-4',
        question: 'Why do trend-following strategies typically struggle during low-volatility range-bound regimes?',
        options: [
          'Because brokers do not permit trend following in low volatility',
          'Because breakout signals repeatedly hit false extensions and reverse back into the range, causing repeated small stop-loss whipsaws',
          'Because volume goes completely to zero',
          'Because moving averages stop calculating'
        ],
        correctIndex: 1,
        explanation: 'In range regimes, price mean-reverts instead of continuing, whipsawing trend-following stop-losses.'
      }
    ],
    commonMistakes: [
      'Expecting a single static strategy to perform identically across all market environments.',
      'Failing to scale position sizes down when market volatility regimes double.'
    ],
    learningObjectives: [
      'Classify market regimes using ADX, ATR, and moving average dispersion.',
      'Build dynamic regime filters that enable or disable specific strategy playbooks.',
      'Adapt risk targets to high-volatility vs low-volatility regimes.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c7-trading-playbook',
    title: 'Institutional Playbook Architecture & Execution Checklists',
    category: 'TECHNICAL ANALYSIS',
    level: 7,
    difficulty: 'Intermediate',
    description: 'Organize high-conviction trading setups into a standardized, institutional-grade Playbook with verified historical statistics.',
    simpleExplanation: 'A trading playbook is like an NFL team’s playbook. You don’t make up random plays on the field. You have 3 or 4 specific plays that you have practiced a thousand times. When the market shows that exact setup, you execute automatically.',
    professionalDefinition: 'The systematic documentation repository detailing setup prerequisites, catalyst triggers, entry execution mechanics, stop invalidations, scaling targets, and historical expectancy statistics for each distinct strategy setup.',
    prerequisites: ['c2-market-structure', 'c3-r-multiples', 'c7-systematic-architecture'],
    relatedConcepts: ['c5-outcome-bias', 'c10-risk-limits-and-mandates'],
    examples: [
      {
        scenario: 'Trader develops the "Liquidity Sweep & Break of Structure" playbook setup.',
        analysis: 'Every trade in this category must meet 5 mandatory checkboxes: 1) Major swing high swept, 2) Bearish CHoCH on 5-min chart, 3) Entry on premium pullback, 4) Stop above sweep candle, 5) Target 1 at opposing liquidity.',
        outcome: 'Execution becomes 100% consistent and auditable against the journal.'
      }
    ],
    quizzes: [
      {
        id: 'q7-5',
        question: 'What is the purpose of an institutional Trading Playbook?',
        options: [
          'To brag about winning trades on social media',
          'To strictly standardize trading setups, define exact entry/exit criteria, and track empirical performance per specific trade archetype',
          'To predict macroeconomic news events 1 year in advance',
          'To replace stop-loss orders with mental notes'
        ],
        correctIndex: 1,
        explanation: 'A playbook standardizes setups into auditable, repeatable archetypes with empirical expectancy metrics.'
      }
    ],
    commonMistakes: [
      'Trading 20 different random setups every week without mastering a single playbook play.',
      'Failing to track win rates and expectancy per setup category in the journal.'
    ],
    learningObjectives: [
      'Construct a 5-step institutional playbook sheet for personal edge setups.',
      'Implement pre-flight execution checklists to eliminate impulsive trades.',
      'Tag and audit journal trades by Playbook Archetype.'
    ],
    estimatedLearningTime: 20
  }
];
