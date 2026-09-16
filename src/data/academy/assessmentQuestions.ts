import { AssessmentQuestion } from '@/types/assessment';

export const COMPREHENSIVE_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 1. Technical Analysis: Chart Interpretation & Structure
  {
    id: 'aq-chart-structure',
    domain: 'Technical Analysis',
    targetLevel: 4,
    type: 'chart-interpretation',
    question: 'What is happening on this chart?',
    context: 'Examine the 4-hour swing sequence on Asset XYZ below:',
    chartData: {
      type: 'market-structure-swing',
      caption: 'Asset XYZ (4H): Swing Sequence & Invalidation Level',
      elements: {
        points: [
          { x: 30, y: 140 }, // Low
          { x: 80, y: 70 },  // High
          { x: 130, y: 110 },// Higher Low
          { x: 190, y: 40 }, // Higher High
          { x: 250, y: 90 }, // Higher Low
          { x: 310, y: 25 }, // Higher High
          { x: 370, y: 115 } // Breakdown below prior HL
        ],
        levels: [
          { price: 90, type: 'support', label: 'Key Swing Higher Low ($142.50)' },
          { price: 25, type: 'resistance', label: 'Swing High ($168.00)' },
          { price: 115, type: 'stop', label: 'Structural Violation ($139.00)' }
        ]
      }
    },
    options: [
      'Normal bullish pullback continuing the unbroken uptrend',
      'A Change of Character (CHoCH): price violated the prior protected swing Higher Low, invalidating the bullish market structure',
      'A liquidity expansion confirming institutional accumulation at highs',
      'A double bottom continuation pattern'
    ],
    correctIndex: 1,
    explanation: 'An uptrend is mathematically defined by consecutive Higher Highs (HH) and Higher Lows (HL). When price prints a decisive break below the last swing HL, market structure changes character (CHoCH). Buying pullbacks without structure confirmation has negative expectancy.',
    skillEvaluated: 'Objective Market Structure & Invalidation Point Analysis',
    practicalApplication: 'Halts premature dip-buying when trend structure has flipped bearish.'
  },

  // 2. Risk Management: Defined Risk Calculation
  {
    id: 'aq-defined-risk',
    domain: 'Risk Management',
    targetLevel: 3,
    type: 'risk-calculation',
    question: 'What is the defined risk on this setup?',
    context: 'Account Equity = $50,000. You plan to buy Stock ABC at $120.00. Technical support invalidation sits at $115.00 ($5.00 stop distance). You execute 100 shares.',
    options: [
      'Total capital outlay of $12,000 (24% of account)',
      'Defined risk of $500 (1.0% of account equity)',
      'Defined risk of $1,200 (2.4% of account equity)',
      'Undefined risk because slippage is unpredictable'
    ],
    correctIndex: 1,
    explanation: 'Defined Risk = Position Size (100 shares) × Stop Distance ($120.00 - $115.00 = $5.00) = $500.00. Relative to account equity ($50,000), $500 represents exactly 1.0% total risk.',
    skillEvaluated: 'Pre-Trade Capital Risk Invariance',
    practicalApplication: 'Prevents confusing total trade notional ($12,000) with actual capital at risk ($500).'
  },

  // 3. Execution: Order Type Selection
  {
    id: 'aq-order-type',
    domain: 'Execution',
    targetLevel: 2,
    type: 'execution-decision',
    question: 'Which order type is appropriate for this market situation?',
    context: 'An earnings release triggered high volatility. The bid-ask spread widened from $0.02 to $0.45. You want to enter a long position, but must strictly avoid paying massive adverse spread friction or slippage.',
    options: [
      'Market Order (to guarantee immediate execution at any price)',
      'Market-on-Close Order (MOC)',
      'Limit Buy Order placed at or inside the current bid (passive execution with zero spread-crossing penalty)',
      'Stop-Market Buy Order 20% above current market price'
    ],
    correctIndex: 2,
    explanation: 'When bid-ask spreads widen, aggressive market orders cross the spread and suffer severe adverse fill slippage. A passive Limit Order guarantees that you only transact at your stated price or better, eliminating spread-crossing tax.',
    skillEvaluated: 'Microstructure Order Type Selection & Slippage Avoidance',
    practicalApplication: 'Saves 20-50 bps of friction per trade during volatile regimes.'
  },

  // 4. Risk Management: Position Sizing Mathematics
  {
    id: 'aq-position-size-calc',
    domain: 'Risk Management',
    targetLevel: 3,
    type: 'numerical',
    question: 'Which position size is correctly calculated?',
    context: 'Account Equity = $100,000. Mandated risk per trade = 1.0% ($1,000). You intend to buy Stock XYZ at $84.00 with an invalidation stop-loss at $80.00 ($4.00 stop distance).',
    options: [
      '125 shares ($10,500 notional)',
      '250 shares ($21,000 notional)',
      '500 shares ($42,000 notional)',
      '1,000 shares ($84,000 notional)'
    ],
    correctIndex: 1,
    explanation: 'Units = Dollar Risk / Stop Distance = $1,000 / $4.00 = 250 shares. If the stop is triggered at $80.00, loss = 250 × $4.00 = $1,000 (exactly 1.0% of portfolio).',
    skillEvaluated: 'Fixed-Fractional Position Sizing Formula',
    practicalApplication: 'The foundation of survival: position size adapts to volatility, not gut feeling.'
  },

  // 5. Technical Analysis: Structure Interpretation
  {
    id: 'aq-market-structure-pattern',
    domain: 'Technical Analysis',
    targetLevel: 4,
    type: 'chart-interpretation',
    question: 'What does this market structure show?',
    context: 'Price makes a new 20-day high by 3 ticks, immediately prints a massive rejection wick leaving resting sell liquidity untouched, and aggressively closes back below the previous high on 3x normal volume.',
    options: [
      'A healthy, high-momentum trend breakout indicating strong institutional accumulation',
      'A Liquidity Sweep (False Breakout / Turtle Soup) that trapped breakout buyers to fill institutional short orders',
      'A standard moving average golden cross pattern',
      'Market consolidation with zero directional information'
    ],
    correctIndex: 1,
    explanation: 'Institutions use breakout liquidity (stop-loss buys and breakout market orders) to unload inventory or establish large short positions without moving price against themselves. A momentary break above resistance followed by an immediate collapse is a classic Liquidity Sweep.',
    skillEvaluated: 'Order Flow Traps & Liquidity Sweep Recognition',
    practicalApplication: 'Prevents buying the top of institutional distribution zones.'
  },

  // 6. Market Knowledge: Auction Theory & Mechanics
  {
    id: 'aq-auction-mechanics',
    domain: 'Market Knowledge',
    targetLevel: 1,
    type: 'multiple-choice',
    question: 'According to Auction Market Theory, why does market price move directional over time?',
    options: [
      'Because buyers outnumber sellers in total head count',
      'Because aggressive market orders exhaust all passive limit order liquidity at a given price level, forcing trade matching to seek the next available tick',
      'Because the exchange algorithm chooses a new price each minute',
      'Because of quarterly dividend adjustments'
    ],
    correctIndex: 1,
    explanation: 'Every transaction matches 1 buyer with 1 seller. Price only moves when aggressive market orders consume all resting limit orders at the best bid or ask, requiring the auction to tick up or down to discover new liquidity.',
    skillEvaluated: 'Continuous Double Auction Equilibrium & Liquidity Consumption',
    practicalApplication: 'Decouples trading decisions from naive "more buyers than sellers" myths.'
  },

  // 7. Psychology: Cognitive Biases
  {
    id: 'aq-psychology-tilt',
    domain: 'Trading Psychology',
    targetLevel: 7,
    type: 'scenario',
    question: 'Which behavioral phenomenon is this trader experiencing?',
    context: 'After suffering 3 consecutive losses totaling -3R, a trader doubles their position size on trade #4 without waiting for a verified setup, desperate to "get back to even before market close".',
    options: [
      'Hyperbolic discounting',
      'Martingale Revenge Trading driven by Loss Aversion and Sunk Cost Fallacy',
      'Base rate neglect',
      'Dunning-Kruger cognitive confidence'
    ],
    correctIndex: 1,
    explanation: 'Revenge trading combined with size escalation (Martingale) is the #1 cause of catastrophic account blowups. Driven by acute loss aversion, the trader abandons systematic edge to avoid confronting the emotional pain of a drawdown.',
    skillEvaluated: 'Emotional Discipline & Gambler’s Fallacy Defense',
    practicalApplication: 'Enforces hard daily loss limits and drawdown cooldown protocols.'
  },

  // 8. Quantitative: Expected Value & Edge
  {
    id: 'aq-quant-ev',
    domain: 'Quantitative Analysis',
    targetLevel: 5,
    type: 'numerical',
    question: 'Calculate the Mathematical Expectancy (EV) per trade for this trading system:',
    context: 'Strategy Metrics: Win Rate = 35%, Average Win = 3.2R, Average Loss = 1.0R. (Assume commission friction = 0.05R per trade).',
    options: [
      '-0.12R per trade (Negative expectancy)',
      '+0.42R per trade (Positive expectancy)',
      '+1.12R per trade',
      '+0.00R per trade (Breakeven)'
    ],
    correctIndex: 1,
    explanation: 'Gross EV = (Win Rate × Win Size) - (Loss Rate × Loss Size) = (0.35 × 3.2R) - (0.65 × 1.0R) = 1.12R - 0.65R = +0.47R. Subtracting 0.05R friction yields Net EV = +0.42R per trade. Despite a low 35% win rate, the asymmetric payoff produces a robust edge.',
    skillEvaluated: 'Expected Value (EV) & Edge Quantification',
    practicalApplication: 'Teaches traders that high win rate is not required for long-term compounding.'
  },

  // 9. Portfolio: Uncorrelated Diversification
  {
    id: 'aq-portfolio-correlation',
    domain: 'Portfolio Management',
    targetLevel: 9,
    type: 'multiple-choice',
    question: 'How does combining 4 strategies with 0.1 correlation affect portfolio Sharpe Ratio compared to running a single strategy with the same standalone return/volatility?',
    options: [
      'Sharpe Ratio remains completely identical',
      'Sharpe Ratio nearly doubles as portfolio variance collapses through covariance cancellation',
      'Sharpe Ratio is cut in half due to multiplied trading fees',
      'Portfolio risk increases linearly'
    ],
    correctIndex: 1,
    explanation: 'Portfolio variance formula: σ_p² = Σ w_i² σ_i² + 2 Σ w_i w_j Cov(i, j). When pairwise correlation approaches zero, cross-terms vanish while expected return scales linearly, nearly doubling the portfolio Sharpe ratio.',
    skillEvaluated: 'Modern Portfolio Theory & Uncorrelated Return Streams',
    practicalApplication: 'Guides allocation away from multiple correlated trend-following setups on the same asset class.'
  },

  // 10. Professional Knowledge: Out-of-Sample Overfitting
  {
    id: 'aq-professional-overfitting',
    domain: 'Professional Practice',
    targetLevel: 10,
    type: 'scenario',
    question: 'An analyst tests 500 combinations of indicator parameters on historical SPY data until finding one with a 92% win rate and zero drawdown. In live forward trading, the system immediately fails. Why?',
    options: [
      'The broker intentionally altered the fill feeds',
      'Curve-fitting / Overfitting: The strategy memorized historical noise rather than identifying a persistent economic or structural market anomaly',
      'Because stocks only go up in backtests',
      'The trading commission rate was too low'
    ],
    correctIndex: 1,
    explanation: 'Optimization without strict out-of-sample data splits and statistical degrees-of-freedom penalties results in curve-fitting noise. A model fit to historical noise has zero predictive capability in forward production.',
    skillEvaluated: 'Institutional Quantitative Validation & Data Snooping Defense',
    practicalApplication: 'Protects traders from buying or designing commercial "holy grail" black box bots.'
  },

  // 11. Risk: Drawdown Recovery Asymmetry
  {
    id: 'aq-drawdown-math',
    domain: 'Risk Management',
    targetLevel: 3,
    type: 'numerical',
    question: 'A trader starts with $100,000 and suffers a 40% drawdown ($60,000 remaining). What return is needed just to reach the original $100,000 watermark?',
    options: [
      '40.0% gain',
      '50.0% gain',
      '66.7% gain ($40,000 on $60,000 base)',
      '100.0% gain'
    ],
    correctIndex: 2,
    explanation: 'Required Gain % = [Drawdown % / (100 - Drawdown %)] × 100 = [40 / 60] × 100 = +66.67%. Losses hurt disproportionately more because the capital denominator shrinks.',
    skillEvaluated: 'Non-Linear Geometric Drawdown Mathematics',
    practicalApplication: 'Instills deep respect for preserving capital during drawdown streaks.'
  },

  // 12. Execution: Transaction Cost Analysis & Market Impact
  {
    id: 'aq-execution-tca',
    domain: 'Execution',
    targetLevel: 6,
    type: 'execution-decision',
    question: 'A crypto fund needs to liquidate $10M of an illiquid altcoin with $2M total daily volume. What is the institutional execution protocol to minimize slippage?',
    options: [
      'Execute a single aggressive market sell order across all exchanges at once',
      'Use an algorithmic TWAP / VWAP execution slicing algorithm over several days, utilizing passive iceberg limit orders to capture resting bid depth',
      'Post a public message on social media warning of the sell-off',
      'Increase leverage to 100x to speed up execution'
    ],
    correctIndex: 1,
    explanation: 'Executing an order that exceeds daily volume as a market order will crash the order book (severe market impact). Institutional execution relies on algorithmic order slicing (TWAP/VWAP) and passive dark/iceberg liquidity provision over extended time horizons.',
    skillEvaluated: 'Institutional Implementation Shortfall & Algorithm Selection',
    practicalApplication: 'Teaches volume participation rates and execution cost containment.'
  }
  ,
  // New visual questions
  {
    id: 'aq-equity-comparison',
    domain: 'Portfolio Management',
    targetLevel: 8,
    type: 'chart-interpretation',
    question: 'Compare the two equity curves. Which trader demonstrates better risk-adjusted returns (higher Sharpe/Sortino) assuming identical total net profit?',
    context: 'Trader A (Blue) vs Trader B (Green)',
    chartData: {
      type: 'equity-curve',
      caption: 'Equity Curve Comparison (100 Trades)',
      elements: {
        points: [
          {x:20, y:120}, {x:60, y:80}, {x:100, y:140}, {x:140, y:60}, {x:180, y:130}, {x:220, y:50}, {x:260, y:140}, {x:300, y:40}, {x:340, y:110}, {x:380, y:30}
        ],
        points2: [
          {x:20, y:120}, {x:60, y:115}, {x:100, y:105}, {x:140, y:100}, {x:180, y:90}, {x:220, y:80}, {x:260, y:70}, {x:300, y:65}, {x:340, y:45}, {x:380, y:30}
        ]
      }
    },
    options: [
      'Trader A (Blue), because they have higher highs',
      'Trader B (Green), because the variance (volatility) of their returns is much lower, leading to smaller drawdowns',
      'They have the exact same risk-adjusted returns since the starting and ending points are identical',
      'Trader A (Blue), because they recovered from drawdowns faster'
    ],
    correctIndex: 1,
    explanation: 'Risk-adjusted return metrics like the Sharpe or Sortino ratio penalize volatility and downside deviation. A smoother equity curve with smaller drawdowns (Trader B) yields a significantly higher risk-adjusted return than a highly volatile curve (Trader A), even if both achieve the same total profit.',
    skillEvaluated: 'Risk-Adjusted Return Analysis'
  },
  {
    id: 'aq-distribution-skew',
    domain: 'Quantitative Analysis',
    targetLevel: 7,
    type: 'chart-interpretation',
    question: 'What does this trade outcome probability distribution indicate about the underlying strategy?',
    context: 'Y-axis: Frequency, X-axis: R-Multiple outcome per trade',
    chartData: {
      type: 'probability-distribution',
      caption: 'Trade Outcome Distribution',
      elements: {
        distribution: [
          {value: -3, count: 5},
          {value: -1, count: 45},
          {value: 0, count: 10},
          {value: 1, count: 20},
          {value: 2, count: 12},
          {value: 5, count: 8}
        ]
      }
    },
    options: [
      'It is a mean-reverting strategy with a high win rate but large tail risks.',
      'It is a trend-following strategy with a positive right skew (fat right tail) and strictly controlled standard losses (-1R), but occasional risk management failures (-3R).',
      'It is a perfectly normal (Gaussian) distribution.',
      'The strategy is guaranteed to lose money over time due to the high frequency of -1R losses.'
    ],
    correctIndex: 1,
    explanation: 'The distribution shows a large cluster of -1R losses (typical of trend following where you get stopped out often), but a long right tail (+2R, +5R) capturing large wins. The existence of -3R events shows occasional failure to respect the 1R stop loss (slippage, gaps, or lack of discipline).',
    skillEvaluated: 'Return Distribution Profiling'
  },
  {
    id: 'aq-drawdown-recovery',
    domain: 'Risk Management',
    targetLevel: 6,
    type: 'chart-interpretation',
    question: 'Looking at this drawdown chart, what happens to the mathematical recovery required as the drawdown deepens?',
    context: 'Peak-to-Trough Drawdown Depth',
    chartData: {
      type: 'drawdown-chart',
      caption: 'Strategy Maximum Drawdown',
      elements: {
        points: [
          {x:20, y:20}, {x:60, y:40}, {x:100, y:30}, {x:140, y:80}, {x:180, y:60}, {x:220, y:140}, {x:260, y:100}, {x:300, y:150}, {x:340, y:120}, {x:380, y:20}
        ]
      }
    },
    options: [
      'The recovery percentage required is exactly equal to the drawdown percentage.',
      'The recovery percentage required grows exponentially; a 50% drawdown requires a 100% gain to recover.',
      'Drawdowns have no mathematical impact on future returns.',
      'A deeper drawdown makes it statistically easier to recover due to mean reversion.'
    ],
    correctIndex: 1,
    explanation: 'The mathematics of ruin dictate that recovery is asymmetrical. A 10% loss requires an 11.1% gain to recover, but a 50% loss requires a 100% gain, and a 90% loss requires a 900% gain. This is why strict risk limits are the bedrock of survival.',
    skillEvaluated: 'Drawdown Mathematics & Asymmetry'
  }

];
