import { CurriculumConcept } from '@/types/academy';

export const LEVEL_6_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c6-expected-value',
    title: 'Mathematical Expectancy & Edge Quantification',
    category: 'QUANTITATIVE TRADING',
    level: 6,
    difficulty: 'Intermediate',
    description: 'Calculate and verify whether a trading strategy possesses a genuine statistical edge over the bid-ask spread and market friction.',
    simpleExplanation: 'Expected value is the average amount you can expect to win or lose on every trade if you took it 1,000 times. If EV is positive, you are printing money over time. If EV is negative, no amount of discipline will save you.',
    professionalDefinition: 'The first moment (mean) of a strategy’s return distribution: E[X] = ∑(x_i * p_i). A positive mathematical expectation exceeding all execution transaction friction is the sole prerequisite for sustainable trading viability.',
    prerequisites: ['c3-r-multiples', 'c4-tca-and-execution'],
    relatedConcepts: ['c6-probability-distributions', 'c6-monte-carlo-simulation'],
    formulas: [
      {
        name: 'Expectancy Ratio',
        expression: 'EV = (Win Rate * Avg Win) - (Loss Rate * Avg Loss) - Friction',
        variables: [
          { symbol: 'Win Rate', meaning: 'Fraction of trades closing in profit' },
          { symbol: 'Avg Win', meaning: 'Mean dollar or R gain on winning trades' },
          { symbol: 'Loss Rate', meaning: 'Fraction of trades closing in loss' },
          { symbol: 'Avg Loss', meaning: 'Mean dollar or R loss on losing trades' },
          { symbol: 'Friction', meaning: 'Average round-trip spread, slippage, and fee drag' }
        ],
        notes: 'If EV <= 0 after subtracting friction, the system is mathematically bankrupt.'
      }
    ],
    examples: [
      {
        scenario: 'Strategy generates 52% win rate with 1.2:1 reward-to-risk ratio. Round-trip friction is 0.08R.',
        analysis: 'Gross EV = (0.52 * 1.2) - (0.48 * 1.0) = 0.624 - 0.480 = +0.144R. Net EV = +0.144R - 0.08R = +0.064R.',
        outcome: 'The strategy maintains a verified positive net expectancy of +6.4R per 100 trades.'
      }
    ],
    artifacts: [
      {
        type: 'expected-value',
        title: 'Monte Carlo EV Sandbox',
        description: 'Simulate 1,000 trade paths based on win rate and reward-risk ratios.'
      }
    ],
    quizzes: [
      {
        id: 'q6-1',
        question: 'A strategy wins 60% of the time with an average win of $100 and loses 40% of the time with an average loss of $200. What is its mathematical expectancy?',
        options: [
          '+$20 per trade',
          '-$20 per trade',
          '+$40 per trade',
          '$0 (breakeven)'
        ],
        correctIndex: 1,
        explanation: 'EV = (0.60 * $100) - (0.40 * $200) = $60 - $80 = -$20 per trade. Despite winning 60% of trades, the strategy loses $20 on average every time it executes.'
      }
    ],
    commonMistakes: [
      'Calculating expectancy without subtracting commissions, spread crossing, and slippage.',
      'Assuming that a system with positive past expectancy will maintain the exact same edge indefinitely.'
    ],
    learningObjectives: [
      'Calculate gross and net mathematical expectancy in both dollar and R units.',
      'Identify whether strategy edge originates from high win rate or high win-loss payoff ratio.',
      'Audit trading journal data to confirm statistical edge.'
    ],
    estimatedLearningTime: 24
  },
  {
    id: 'c6-probability-distributions',
    title: 'Fat Tails (Kurtosis) & The Flaw of Normal Distributions',
    category: 'QUANTITATIVE TRADING',
    level: 6,
    difficulty: 'Advanced',
    description: 'Why financial markets are NOT Gaussian bell curves: skewness, fat tails (leptokurtosis), and 6-sigma Black Swan events.',
    simpleExplanation: 'Standard statistics assumes that giant market crashes are as rare as finding a 10-foot tall person (almost impossible). But in financial markets, crashes happen all the time! Markets have "fat tails," meaning extreme events occur far more often than textbook theories predict.',
    professionalDefinition: 'Financial return time series exhibit heavy tails (excess kurtosis > 3) and negative skewness, violating standard Brownian motion assumptions and rendering traditional Gaussian Value-at-Risk (VaR) dangerously optimistic.',
    prerequisites: ['c6-expected-value', 'c3-asymmetric-drawdowns'],
    relatedConcepts: ['c6-z-score-standard-deviation', 'c8-volatility-smile-and-skew'],
    formulas: [
      {
        name: 'Excess Kurtosis',
        expression: 'Kurtosis = (E[(X - μ)^4] / σ^4) - 3',
        notes: 'Excess kurtosis > 0 indicates fat tails where outlier crashes occur with exponentially higher frequency than Gaussian models.'
      }
    ],
    examples: [
      {
        scenario: 'A hedge fund model calculates that a 4% daily drop in the S&P 500 is a "1-in-10,000-year event" under a normal distribution.',
        analysis: 'In reality, 4%+ daily drops happen every few years during market stress because volatility clusters and market liquidity evaporates.',
        outcome: 'The fund was over-leveraged based on Gaussian models and went bankrupt in a routine market correction.'
      }
    ],
    artifacts: [
      {
        type: 'normal-distribution',
        title: 'Fat-Tail vs Gaussian Distribution Explorer',
        description: 'Compare theoretical bell curves with real historical market return tails.'
      }
    ],
    quizzes: [
      {
        id: 'q6-2',
        question: 'Why do financial market returns exhibit "fat tails" (excess kurtosis)?',
        options: [
          'Because computers run out of memory during crashes',
          'Because liquidity is non-linear: during panics, buyers withdraw, leverage liquidations cascade, and volatility clusters, causing extreme price moves far more frequently than a bell curve predicts',
          'Because companies only report earnings once every 10 years',
          'Because all stock prices are set by the government'
        ],
        correctIndex: 1,
        explanation: 'Markets are complex adaptive systems where feedback loops and liquidation cascades generate power-law fat-tail distributions.'
      }
    ],
    caseStudies: [
      {
        title: 'Long-Term Capital Management (LTCM) Collapse (1998)',
        era: 'August 1998',
        overview: 'Nobel-prize-winning economists at LTCM modeled Russian sovereign debt default as a near-impossible statistical anomaly under Gaussian models. When Russia defaulted, cross-market correlations converged to 1, wiping out the $4.6B fund.',
        keyTakeaway: 'Never use normal distribution assumptions to justify extreme leverage in financial markets.'
      }
    ],
    commonMistakes: [
      'Using standard standard-deviation stop-losses without accounting for fat-tail gap risk.',
      'Assuming that a 3-standard-deviation event will only occur once in a lifetime.'
    ],
    learningObjectives: [
      'Define kurtosis, skewness, and leptokurtic return distributions.',
      'Explain why traditional Gaussian VaR failed during the 1998 LTCM and 2008 crises.',
      'Design tail-risk hedges to survive Black Swan market shocks.'
    ],
    estimatedLearningTime: 26
  },
  {
    id: 'c6-monte-carlo-simulation',
    title: 'Monte Carlo Simulation & Sequence Risk',
    category: 'QUANTITATIVE TRADING',
    level: 6,
    difficulty: 'Advanced',
    description: 'Reshuffle your historical trade results 10,000 times to uncover worst-case drawdowns, recovery times, and sequence of returns risk.',
    simpleExplanation: 'Your historical trading record is just one lucky order of trades. What if all your losing trades happened right at the start? Monte Carlo shuffles your deck of trades thousands of times to show you what your worst possible drawdown could look like.',
    professionalDefinition: 'A stochastic simulation method utilizing random sampling with replacement (bootstrap resampling) to generate empirical probability distributions of maximum drawdown, recovery duration, and terminal equity.',
    prerequisites: ['c6-expected-value', 'c3-risk-of-ruin'],
    relatedConcepts: ['c6-probability-distributions', 'c7-backtesting-rigor'],
    formulas: [
      {
        name: 'Bootstrapped Equity Curve',
        expression: 'Equity_t = Equity_0 * ∏(1 + R_random_i)',
        notes: 'Resamples historical R-multiples across thousands of simulated runs.'
      }
    ],
    examples: [
      {
        scenario: 'A strategy’s historical backtest showed a maximum drawdown of 12%.',
        analysis: 'Running 10,000 Monte Carlo resamples reveals that in the 95th percentile worst sequence, the drawdown reaches 28%, and in the 99th percentile, it hits 41%.',
        outcome: 'The trader sizes down before trading live, preventing panic abandonment during the inevitable worst-case sequence.'
      }
    ],
    artifacts: [
      {
        type: 'expected-value',
        title: 'Monte Carlo Path Generator',
        description: 'Visualize thousands of potential equity curve paths from your strategy stats.'
      }
    ],
    quizzes: [
      {
        id: 'q6-3',
        question: 'Why is a single historical backtest drawdown metric insufficient for risk planning?',
        options: [
          'Because historical data is always fake',
          'Because historical backtest was just ONE random sequence of trades; a different sequence of the exact same trades could produce a much deeper drawdown',
          'Because backtests do not include winning trades',
          'Because brokers do not accept backtested strategies'
        ],
        correctIndex: 1,
        explanation: 'Sequence of returns risk means that clustering losing trades together produces far worse drawdowns than the single historical chronological path.'
      }
    ],
    commonMistakes: [
      'Assuming your live account will never experience a drawdown worse than your historical backtest.',
      'Sizing positions based on average return rather than 95th percentile Monte Carlo drawdown.'
    ],
    learningObjectives: [
      'Perform bootstrap Monte Carlo resampling on historical trade journals.',
      'Interpret 95th and 99th percentile Value-at-Risk and Maximum Drawdown metrics.',
      'Stress test capital requirements against worst-case trade sequences.'
    ],
    estimatedLearningTime: 25
  },
  {
    id: 'c6-z-score-standard-deviation',
    title: 'Standard Deviation, Z-Scores & Mean Reversion',
    category: 'QUANTITATIVE TRADING',
    level: 6,
    difficulty: 'Intermediate',
    description: 'Measure statistical dispersion: how many standard deviations price has deviated from its moving mean.',
    simpleExplanation: 'A Z-score tells you how far the current price is stretched from its normal average. If a stock usually moves $1 a day, and today it jumps $3 above average, it has a Z-score of +3. Prices stretched this far often snap back like a rubber band.',
    professionalDefinition: 'The dimensionless standardized measure of distance from the arithmetic mean expressed in units of standard deviation: Z = (X - μ) / σ, fundamental to statistical arbitrage, Bollinger Bands, and mean-reverting pairs trading.',
    prerequisites: ['c2-auction-market-theory', 'c6-expected-value'],
    relatedConcepts: ['c6-probability-distributions', 'c7-systematic-architecture'],
    formulas: [
      {
        name: 'Z-Score Formula',
        expression: 'Z = (Price_t - SMA(Price, n)) / StdDev(Price, n)',
        variables: [
          { symbol: 'Price_t', meaning: 'Current asset price' },
          { symbol: 'SMA', meaning: 'Simple Moving Average over n periods' },
          { symbol: 'StdDev', meaning: 'Standard deviation of price over n periods' }
        ],
        notes: 'Z > +2.5 indicates statistically extreme extension from historical rolling mean.'
      }
    ],
    examples: [
      {
        scenario: 'An exchange-traded fund deviates to a Z-score of +3.2 against its 50-day moving average on no fundamental news.',
        analysis: 'Historically, the ETF stays within ±2 standard deviations 95% of the time. The current move represents a statistical outlier.',
        outcome: 'Statistical arbitrage desks initiate short mean-reversion positions targeting the rolling mean.'
      }
    ],
    quizzes: [
      {
        id: 'q6-4',
        question: 'What does a Z-score of +2.5 indicate about the current price relative to its moving average?',
        options: [
          'The price is 2.5 cents above the average',
          'The price is 2.5 standard deviations above its historical mean, representing an statistically extended state',
          'The company’s revenue grew by 250%',
          'The asset will never fall again'
        ],
        correctIndex: 1,
        explanation: 'Z-score measures dispersion in units of standard deviation. A score of +2.5 means price is 2.5 standard deviations above the mean.'
      }
    ],
    commonMistakes: [
      'Blindly shorting a high Z-score during a genuine structural regime shift or buyout.',
      'Failing to adjust standard deviation lookback periods to market cycle changes.'
    ],
    learningObjectives: [
      'Calculate variance, standard deviation, and Z-scores for any financial time series.',
      'Formulate quantitative mean-reversion entry and exit rules.',
      'Differentiate between stationary mean-reverting assets and non-stationary trending assets.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c6-sample-size-significance',
    title: 'Sample Size, Overfitting & Statistical Significance',
    category: 'QUANTITATIVE TRADING',
    level: 6,
    difficulty: 'Advanced',
    description: 'How to know if your strategy works or if you just got lucky: P-values, degrees of freedom, and Law of Small Numbers.',
    simpleExplanation: 'If you flip a coin 5 times and get 4 heads, that doesn’t mean the coin is magic—you just got a small lucky sample. You need at least 100 to 200 trades before you can mathematically prove your strategy actually works.',
    professionalDefinition: 'Hypothesis testing applied to trading performance: determining whether strategy returns are statistically distinguishable from zero (null hypothesis H_0: μ = 0) using t-statistics, p-values, and adjusting for multiple testing bias (Bonferroni / False Discovery Rate).',
    prerequisites: ['c5-probabilistic-mindset', 'c6-expected-value'],
    relatedConcepts: ['c7-backtesting-rigor', 'c7-systematic-architecture'],
    formulas: [
      {
        name: 't-Statistic of Trading Strategy',
        expression: 't = (Mean_return - 0) / (StdDev / √N)',
        variables: [
          { symbol: 'Mean_return', meaning: 'Average return per trade' },
          { symbol: 'StdDev', meaning: 'Standard deviation of trade returns' },
          { symbol: 'N', meaning: 'Total number of independent trades' }
        ],
        notes: 'A t-statistic >= 2.0 indicates statistical significance at the 95% confidence level (p < 0.05).'
      }
    ],
    examples: [
      {
        scenario: 'A trader shows 12 trades with an 80% win rate and claims they have "cracked the market."',
        analysis: 'With N = 12, the standard error is massive. The t-statistic is only 1.1 (p = 0.28), meaning there is a 28% probability this result was pure random chance.',
        outcome: 'After 100 trades, the win rate regresses to the mean (48%), blowing up the account.'
      }
    ],
    quizzes: [
      {
        id: 'q6-5',
        question: 'Why is a 20-trade sample insufficient to prove a trading strategy has an edge?',
        options: [
          'Because brokers only keep logs for 10 trades',
          'Because with only 20 trials, the statistical standard error is high, and a lucky random streak easily mimics genuine skill',
          'Because 20 trades takes too long to complete',
          'Because win rates cannot be calculated under 50 trades'
        ],
        correctIndex: 1,
        explanation: 'Small sample sizes suffer from high random variance; statistical significance requires sufficient sample size (typically N >= 100-200) to reject the null hypothesis of luck.'
      }
    ],
    commonMistakes: [
      'Declaring a strategy "proven" after 15 or 20 winning trades.',
      'Over-optimizing 50 indicators on 30 trades to create an artificial 100% winning backtest.'
    ],
    learningObjectives: [
      'Calculate t-statistics and p-values for trading systems.',
      'Determine the minimum sample size required for statistical validity.',
      'Avoid data snooping and multiple comparison bias.'
    ],
    estimatedLearningTime: 25
  }
];
