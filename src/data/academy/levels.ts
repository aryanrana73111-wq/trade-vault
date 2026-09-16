import { LevelInfo } from '@/types/academy';

export const ACADEMY_LEVELS: LevelInfo[] = [
  {
    level: 0,
    title: 'Market Zero',
    subtitle: 'Absolute Beginner — First Principles',
    description: 'Demystify money, financial exchanges, the auction process, and why markets exist before ever placing a trade.',
    domainFocus: ['Market Knowledge'],
    difficulty: 'Beginner',
    prerequisiteLevel: undefined,
    topicsCovered: [
      'What is money?',
      'What is a financial market?',
      'Why markets exist',
      'Buyers and sellers',
      'Price discovery',
      'Supply and demand',
      'Assets',
      'Brokers vs exchanges',
      'Liquidity concept',
      'Market participants',
      'Trading vs investing',
      'Speculation vs hedging'
    ],
    learningOutcomes: [
      'Understand how the continuous double auction matches buyers and sellers.',
      'Differentiate between real capital allocation, speculation, and hedging.',
      'Grasp why liquidity is the lifeblood of any financial market.'
    ]
  },
  {
    level: 1,
    title: 'Market Foundations',
    subtitle: 'Asset Classes & Market Mechanics',
    description: 'Explore global asset classes, the mechanics of bid/ask spreads, leverage, and how derivatives differ from spot assets.',
    domainFocus: ['Market Knowledge'],
    difficulty: 'Beginner',
    prerequisiteLevel: 0,
    topicsCovered: [
      'Equities / Stocks',
      'Foreign Exchange (Forex)',
      'Cryptocurrencies',
      'Commodities & Gold',
      'Bonds & Rates',
      'Indices & ETFs',
      'Futures contracts',
      'Options contracts',
      'Spot vs derivatives',
      'Primary vs secondary markets',
      'Bid, Ask, Spread',
      'Volume & Volatility',
      'Market capitalization',
      'Leverage & Margin',
      'Long vs Short mechanics'
    ],
    learningOutcomes: [
      'Analyze the structural differences between equities, FX, futures, and crypto.',
      'Calculate the cost of the bid-ask spread and financing rates.',
      'Understand the asymmetric risks of financial leverage and margin calls.'
    ]
  },
  {
    level: 2,
    title: 'Trader Fundamentals',
    subtitle: 'Charts, Orders & Precision Terminology',
    description: 'Master order types, candlestick anatomy, tick/pip/point valuations, notional exposure, and execution sessions.',
    domainFocus: ['Execution', 'Technical Analysis'],
    difficulty: 'Beginner',
    prerequisiteLevel: 1,
    topicsCovered: [
      'Candlesticks & OHLC anatomy',
      'Timeframes & fractional aggregation',
      'Market orders',
      'Limit orders',
      'Stop orders & stop-limits',
      'Stop-loss & Take-profit logic',
      'Position size & units',
      'Pips, Ticks, and Points',
      'Contract size & Notional value',
      'Standard, mini, and micro lots',
      'Slippage mechanics',
      'Trading sessions (Tokyo, London, NY)',
      'Direct and indirect trading costs'
    ],
    learningOutcomes: [
      'Interpret multi-timeframe OHLC price action without ambiguity.',
      'Choose the optimal order type based on execution urgency vs price control.',
      'Accurately calculate notional exposure across varied asset classes.'
    ]
  },
  {
    level: 3,
    title: 'Risk & Survival',
    subtitle: 'The Mathematical Bedrock of Capital Preservation',
    description: 'The single most critical module: position sizing mathematics, expected value, risk of ruin, and drawdown recovery.',
    domainFocus: ['Risk Management', 'Quantitative Analysis'],
    difficulty: 'Intermediate',
    prerequisiteLevel: 2,
    topicsCovered: [
      'Risk per trade (% and absolute dollar)',
      'Position sizing formulas',
      'Stop-loss distance mathematics',
      'R-Multiple framework',
      'Risk-to-Reward ratio realism',
      'Expected Value (EV) calculation',
      'Maximum drawdown & asymmetric recovery',
      'Daily and weekly loss thresholds',
      'Risk of Ruin probability models',
      'Losing streak frequency distribution',
      'Leverage risk vs volatility scaling',
      'Concentration & Correlation risk',
      'Liquidity & Tail risk awareness',
      'Risk budgeting per strategy'
    ],
    learningOutcomes: [
      'Formulate dynamic position sizing based strictly on dollar risk rather than arbitrary lot sizes.',
      'Calculate mathematical expectancy and verify positive edge.',
      'Protect account survival by enforcing daily and weekly drawdown caps.'
    ]
  },
  {
    level: 4,
    title: 'Strategy Builder',
    subtitle: 'Objective Price Action & Hypothesis Framing',
    description: 'Deconstruct market structure (HH/HL/LH/LL), liquidity pools, ATR, and momentum while strictly separating observation from hypothesis.',
    domainFocus: ['Technical Analysis'],
    difficulty: 'Intermediate',
    prerequisiteLevel: 3,
    topicsCovered: [
      'Market trends and consolidating ranges',
      'Support and resistance as liquidity zones',
      'Breakouts vs false breakdowns',
      'Pullbacks and value retests',
      'Market structure: Swing highs and swing lows',
      'Higher Highs (HH) & Higher Lows (HL)',
      'Lower Highs (LH) & Lower Lows (LL)',
      'Change of Character (CHoCH) & Break of Structure (BOS)',
      'Momentum indicators & relative strength',
      'Average True Range (ATR) volatility measurement',
      'Moving averages & dynamic baselines',
      'Volume Weighted Average Price (VWAP)',
      'Observation vs Interpretation vs Hypothesis'
    ],
    learningOutcomes: [
      'Map raw price structure objectively without relying on lagging indicator clutter.',
      'Use ATR to define volatility-adjusted risk and stop parameters.',
      'Formulate testable trading hypotheses instead of subjective predictions.'
    ]
  },
  {
    level: 5,
    title: 'Execution Specialist',
    subtitle: 'Systematic Design, Invalidation & Edge Testing',
    description: 'Build complete, rule-based systems from hypothesis to entry/exit filters, backtesting rigor, walk-forward testing, and overfitting prevention.',
    domainFocus: ['Professional Practice', 'Quantitative Analysis'],
    difficulty: 'Intermediate',
    prerequisiteLevel: 4,
    topicsCovered: [
      'Defining a verifiable trading hypothesis',
      'Market regime identification (trend, mean-reversion, chop)',
      'Unambiguous entry, exit, and invalidation rules',
      'Filters: Session, volatility, and volume thresholds',
      'Backtesting methodologies and sample size requirements',
      'Forward testing (paper execution) and walk-forward verification',
      'Expectancy, Win Rate, and Average Win/Loss ratios',
      'Profit Factor and recovery metrics',
      'Sharpe Ratio, Sortino Ratio, and Calmar Ratio',
      'Maximum Adverse Excursion (MAE) & Maximum Favorable Excursion (MFE)',
      'Curve-fitting & overfitting traps'
    ],
    learningOutcomes: [
      'Draft institutional-grade strategy rule sheets with exact invalidation triggers.',
      'Evaluate strategy durability through MAE/MFE trade distribution.',
      'Detect and eliminate survivorship and data-snooping biases in backtests.'
    ]
  },
  {
    level: 6,
    title: 'Behavioral Trader',
    subtitle: 'Market Microstructure & Transaction Cost Analysis',
    description: 'Understand the electronic order book, limit order queues, execution algos (VWAP/TWAP), slippage, and implementation shortfall.',
    domainFocus: ['Execution'],
    difficulty: 'Advanced',
    prerequisiteLevel: 5,
    topicsCovered: [
      'Electronic Limit Order Book (L2 depth) mechanics',
      'Market orders vs passive limit queues',
      'Time-in-Force qualifiers (IOC, FOK, GTC)',
      'Slippage modeling in volatile regimes',
      'Market impact of size relative to average daily volume',
      'Partial fills and queuing priority',
      'Transaction Cost Analysis (TCA)',
      'Implementation shortfall calculation',
      'Algorithmic execution: VWAP & TWAP benchmarks',
      'Smart order routing (SOR) concepts',
      'Hidden orders and iceberg execution'
    ],
    learningOutcomes: [
      'Minimize execution friction and hidden trading costs through order book awareness.',
      'Calculate true implementation shortfall compared to decision price.',
      'Deploy algorithmic slicing techniques to reduce market footprint.'
    ]
  },
  {
    level: 7,
    title: 'Quantitative Trader',
    subtitle: 'Cognitive Biases & Systematic Decision Governance',
    description: 'Diagnose behavioral biases—loss aversion, anchoring, disposition effect, revenge trading—and implement institutional decision hygiene.',
    domainFocus: ['Trading Psychology'],
    difficulty: 'Intermediate',
    prerequisiteLevel: 3,
    topicsCovered: [
      'Loss aversion and Kahneman-Tversky prospect theory',
      'The Disposition Effect (cutting winners, riding losers)',
      'Overconfidence & recency bias after winning streaks',
      'Anchoring to entry prices or breakeven points',
      'FOMO (Fear of Missing Out) and risk escalation',
      'Revenge trading dynamics and circuit breakers',
      'Decision fatigue & cognitive depletion during volatile sessions',
      'Pre-commitment devices and trading checklists',
      'Process-based performance evaluation vs outcome bias'
    ],
    learningOutcomes: [
      'Identify subconscious bias triggers before they degrade execution quality.',
      'Implement structured behavioral circuit breakers for drawdown streaks.',
      'Judge trading execution quality strictly on process adherence rather than single-trade P&L.'
    ]
  },
  {
    level: 8,
    title: 'Portfolio Trader',
    subtitle: 'Statistical Reasoning & Probabilistic Foundations',
    description: 'Apply statistics to trade returns: probability distributions, standard deviations, z-scores, Monte Carlo simulations, and Bayesian updates.',
    domainFocus: ['Quantitative Analysis'],
    difficulty: 'Advanced',
    prerequisiteLevel: 5,
    topicsCovered: [
      'Descriptive statistics: Mean, Median, Variance, and Standard Deviation',
      'Return distributions: Normal vs fat-tailed (leptokurtic)',
      'Z-score calculation and outlier detection',
      'Expected value under conditional probabilities',
      'Bayesian thinking in updating market beliefs',
      'Hypothesis testing, p-values, and statistical significance',
      'Monte Carlo simulations of trade sequences and drawdowns',
      'Signal-to-noise ratio in financial time series',
      'Data snooping, look-ahead bias, and degrees of freedom'
    ],
    learningOutcomes: [
      'Interpret historical trade returns as samples from non-normal probability distributions.',
      'Run Monte Carlo simulations to assess true tail risk and maximum drawdown envelopes.',
      'Apply statistical confidence intervals to strategy performance metrics.'
    ]
  },
  {
    level: 9,
    title: 'Professional Trading Process',
    subtitle: 'Multi-Asset Construction, Correlation & Factor Exposure',
    description: 'Transition from single-instrument trading to multi-asset portfolio construction, correlation matrices, volatility targeting, and risk budgeting.',
    domainFocus: ['Portfolio Management', 'Professional Practice'],
    difficulty: 'Advanced',
    prerequisiteLevel: 8,
    topicsCovered: [
      'Modern portfolio theory & diversification mathematics',
      'Asset correlation matrix and regime-dependent breakdown',
      'Volatility targeting and inverse-volatility weighting',
      'Risk parity principles and marginal risk contribution',
      'Portfolio-level drawdown limits and stress caps',
      'Hedging strategies: Beta hedging and tail-risk options',
      'Alpha vs Beta decomposition',
      'Factor models (Momentum, Value, Carry, Quality)',
      'Rebalancing schedules and portfolio turnover costs'
    ],
    learningOutcomes: [
      'Construct diversified portfolios that maintain stable risk exposure across shifting volatility regimes.',
      'Measure and balance the marginal risk contribution of each portfolio component.',
      'Implement systematic hedging overlays to protect against market beta shocks.'
    ]
  },
  {
    level: 10,
    title: 'Professional Research',
    subtitle: 'Hedge-Fund-Style Research & Governance Processes',
    description: 'Study institutional-style research workflows: investment theses, factor research, risk committee oversight, scenario stress-testing, and post-trade governance.',
    domainFocus: ['Professional Practice', 'Quantitative Analysis', 'Risk Management'],
    difficulty: 'Institutional',
    prerequisiteLevel: 9,
    topicsCovered: [
      'Formulating institutional investment & research theses',
      'Systematic research process: Ideation to production staging',
      'Macroeconomic regime classification frameworks',
      'Factor model design and multi-factor testing',
      'Risk committee oversight and risk budgeting policies',
      'Scenario analysis and extreme event stress-testing',
      'Research journals and reproducible experiment tracking',
      'Model risk and operational risk controls',
      'Institutional documentation and compliance frameworks',
      'Post-trade attribution and slippage governance'
    ],
    learningOutcomes: [
      'Draft institutional-caliber research memos with full risk and operational disclaimers.',
      'Execute multi-factor stress-testing against historical crisis scenarios.',
      'Establish robust governance and post-trade attribution protocols for systematic strategies.'
    ]
  }
];
