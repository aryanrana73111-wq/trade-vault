import { CurriculumConcept } from '@/types/academy';

export const LEVEL_3_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c3-risk-per-trade',
    title: 'Fixed-Fractional Sizing & Risk Invariance',
    category: 'RISK MANAGEMENT',
    level: 3,
    difficulty: 'Intermediate',
    description: 'The foundational law of institutional capital preservation: sizing every position so the dollar loss is strictly capped regardless of market volatility.',
    simpleExplanation: 'Never pick how many shares to buy first. First, decide how much money you are willing to lose if wrong (e.g., $200). Then find where your stop-loss belongs on the chart. Your position size is calculated from that distance.',
    professionalDefinition: 'The position sizing methodology enforcing constant risk-per-trade (1R) as a strict percentage of total equity, decoupling stop-loss distance in price points from portfolio dollar exposure.',
    prerequisites: ['c1-leverage-and-margin', 'c2-market-structure'],
    relatedConcepts: ['c3-asymmetric-drawdowns', 'c3-r-multiples'],
    formulas: [
      {
        name: 'Position Sizing Formula',
        expression: 'Position Size = (Account Equity * Risk%) / |Entry Price - Stop Price|',
        variables: [
          { symbol: 'Account Equity', meaning: 'Total net liquidating value' },
          { symbol: 'Risk%', meaning: 'Risk per trade fraction (e.g. 0.01 for 1%)' },
          { symbol: '|Entry - Stop|', meaning: 'Risk distance per share in price units' }
        ],
        notes: 'If stop distance doubles due to higher volatility, position size must be cut in half to preserve dollar risk invariance.'
      }
    ],
    examples: [
      {
        scenario: 'Account is $50,000. Risk target is 1% ($500). Setup A has entry $100 and stop $98 ($2 risk). Setup B has entry $100 and stop $95 ($5 risk).',
        analysis: 'Setup A size = $500 / $2 = 250 shares ($25,000 value). Setup B size = $500 / $5 = 100 shares ($10,000 value).',
        outcome: 'If stopped out on either setup, the trader loses exactly $500 (1%), maintaining mathematical consistency.'
      }
    ],
    artifacts: [
      {
        type: 'risk-diagram',
        title: 'Fixed Fractional Sizing Engine',
        description: 'Interactive calculation of share sizing based on volatility and stop distance.'
      }
    ],
    quizzes: [
      {
        id: 'q3-1',
        question: 'If a trader has a $100,000 account and risks 1% ($1,000) per trade, how many shares should they buy if entering at $50.00 with a stop loss at $47.50?',
        options: [
          '2,000 shares',
          '400 shares',
          '1,000 shares',
          '100 shares'
        ],
        correctIndex: 1,
        explanation: 'Risk per share = $50.00 - $47.50 = $2.50. Shares = $1,000 / $2.50 = 400 shares.'
      },
      {
        id: 'q3-2',
        question: 'If volatility doubles and your stop-loss distance must be twice as wide, how must your position size adjust to keep dollar risk identical?',
        options: [
          'Position size must double',
          'Position size must be cut in half',
          'Position size remains completely unchanged',
          'Position size should be increased by 10x'
        ],
        correctIndex: 1,
        explanation: 'Because Risk = Position Size * Stop Distance, doubling stop distance requires cutting position size in half.'
      }
    ],
    commonMistakes: [
      'Trading fixed share sizes (e.g., always 1,000 shares) regardless of whether the stop is $0.50 or $5.00 away.',
      'Expanding position size after a loss to make back money quickly (Martingale fallacy).'
    ],
    learningObjectives: [
      'Derive and calculate exact position size from equity, risk percentage, and stop distance in seconds.',
      'Maintain strict dollar risk invariance across volatile and quiet market regimes.',
      'Eliminate the emotional temptation of variable, arbitrary bet sizing.'
    ],
    estimatedLearningTime: 20
  },
  {
    id: 'c3-asymmetric-drawdowns',
    title: 'The Mathematics of Asymmetric Drawdowns',
    category: 'RISK MANAGEMENT',
    level: 3,
    difficulty: 'Intermediate',
    description: 'Why losing capital destroys compounding: the exponential gain required to recover from portfolio drawdowns.',
    simpleExplanation: 'If you lose 10%, you only need 11% to get back to even. But if you lose 50%, you must make 100% just to break even! If you lose 90%, you must make 900%!',
    professionalDefinition: 'The non-linear, convex mathematical relationship between drawdown percentage and required breakeven return: R_required = D / (1 - D), demonstrating that capital preservation is mathematically superior to aggressive yield seeking.',
    prerequisites: ['c1-leverage-and-margin'],
    relatedConcepts: ['c3-risk-per-trade', 'c3-risk-of-ruin'],
    formulas: [
      {
        name: 'Drawdown Recovery Formula',
        expression: 'Gain Required = (Drawdown % / (100 - Drawdown %)) * 100',
        variables: [
          { symbol: 'Drawdown %', meaning: 'Peak-to-trough decline in portfolio equity' }
        ],
        notes: 'Notice how required return explodes past 25% drawdown.'
      }
    ],
    examples: [
      {
        scenario: 'Trader A suffers a 20% drawdown. Trader B suffers a 50% drawdown.',
        analysis: 'Trader A needs a +25% return to recover. Trader B needs a +100% return just to return to their starting baseline.',
        outcome: 'Trader B is forced to take catastrophic risks to recover, virtually guaranteeing eventual account ruin.'
      }
    ],
    artifacts: [
      {
        type: 'equity-drawdown',
        title: 'Asymmetric Drawdown Visualizer',
        description: 'See the steep exponential curve of required recovery returns.'
      }
    ],
    quizzes: [
      {
        id: 'q3-3',
        question: 'If a trading portfolio suffers a 50% drawdown, what percentage gain is required to return to the original peak equity?',
        options: [
          '50%',
          '75%',
          '100%',
          '200%'
        ],
        correctIndex: 2,
        explanation: 'If a $100,000 account drops 50% to $50,000, it must gain +$50,000 (+100% on $50,000) to return to $100,000.'
      }
    ],
    commonMistakes: [
      'Assuming that a 10% loss and a 10% gain cancel each other out (they leave you down -1%).',
      'Allowing drawdowns to exceed 15-20% before implementing hard risk circuit breakers.'
    ],
    learningObjectives: [
      'Compute the exact breakeven return required for any drawdown percentage.',
      'Explain the geometric mean drag caused by portfolio volatility.',
      'Establish institutional maximum drawdown limits.'
    ],
    estimatedLearningTime: 18
  },
  {
    id: 'c3-r-multiples',
    title: 'Expectancy in R & R-Multiples',
    category: 'QUANTITATIVE TRADING',
    level: 3,
    difficulty: 'Intermediate',
    description: 'Measure every trade in multiples of initial risk (R) to evaluate trading systems objectively regardless of account balance.',
    simpleExplanation: 'Instead of saying you made $500 or lost $200, talk in "R". If you risked $100 and made $300, that trade is +3R. If you lost $100, it is -1R. This reveals whether your strategy has a true mathematical edge.',
    professionalDefinition: 'The standardization of trade P&L normalized by initial unit of risk (1R), enabling rigorous calculation of mathematical expectancy: E = (WinRate * AvgWinR) - (LossRate * AvgLossR).',
    prerequisites: ['c3-risk-per-trade'],
    relatedConcepts: ['c6-expected-value', 'c6-monte-carlo-simulation'],
    formulas: [
      {
        name: 'System Expectancy Formula (in R)',
        expression: 'EV = (P_win * R_win) - (P_loss * R_loss)',
        variables: [
          { symbol: 'P_win', meaning: 'Historical probability of a winning trade' },
          { symbol: 'R_win', meaning: 'Average gain on winners expressed in R' },
          { symbol: 'P_loss', meaning: 'Historical probability of a losing trade (1 - P_win)' },
          { symbol: 'R_loss', meaning: 'Average loss on losers expressed in R (usually 1.0R)' }
        ],
        notes: 'An expectancy of +0.35R means that over 100 trades, the system generates +35R of net profit.'
      }
    ],
    examples: [
      {
        scenario: 'A strategy has a 40% win rate, but an average winner of +2.5R and average loser of -1.0R.',
        analysis: 'EV = (0.40 * 2.5) - (0.60 * 1.0) = 1.0 - 0.60 = +0.40R per trade.',
        outcome: 'Despite losing 60% of all trades, the strategy generates +40R of net edge over 100 trades.'
      }
    ],
    quizzes: [
      {
        id: 'q3-4',
        question: 'Can a trader be highly profitable with a win rate of only 35%?',
        options: [
          'No, a win rate under 50% is mathematically guaranteed to lose money',
          'Yes, if their average winning trade is sufficiently larger than their average loss (e.g., winners average +3R and losers average -1R)',
          'Only if they never pay commissions',
          'Only in bull markets'
        ],
        correctIndex: 1,
        explanation: 'Profitability is governed by mathematical expectancy. With 35% win rate and 3R average win, EV = (0.35 * 3) - (0.65 * 1) = +0.40R per trade.'
      }
    ],
    commonMistakes: [
      'Obsessing over high win rates (80-90%) with terrible risk-reward ratios that wipe out accounts in a single bad trade.',
      'Cutting winning trades at +0.5R while letting losing trades run to -3R.'
    ],
    learningObjectives: [
      'Convert raw dollar P&L into standardized R-multiples.',
      'Calculate statistical expectancy per trade in R units.',
      'Balance win rate against payoff ratio to achieve positive expectancy.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c3-risk-of-ruin',
    title: 'Risk of Ruin & Streak Probability',
    category: 'QUANTITATIVE TRADING',
    level: 3,
    difficulty: 'Intermediate',
    description: 'The probability of hitting a terminal account drawdown given bet size, win rate, and streak distributions.',
    simpleExplanation: 'Even with a 60% win rate strategy, math guarantees that you will eventually hit 6 or 7 losses in a row over a few hundred trades. If you risk 10% per trade, that streak wipes you out completely.',
    professionalDefinition: 'The mathematical probability that a trader’s capital will decrease to a specified threshold from which trading can no longer continue, modeled via random walks and gambler’s ruin formulas.',
    prerequisites: ['c3-risk-per-trade', 'c3-asymmetric-drawdowns'],
    relatedConcepts: ['c3-r-multiples', 'c6-monte-carlo-simulation'],
    formulas: [
      {
        name: 'Losing Streak Probability',
        expression: 'P(streak of k losses in N trials) ≈ 1 - (1 - (1 - WinRate)^k)^(N - k + 1)',
        notes: 'In a sample of 200 trades with a 50% win rate, the probability of a 7-trade losing streak is over 60%.'
      }
    ],
    examples: [
      {
        scenario: 'Trader risks 10% of account on every trade with a 55% win rate.',
        analysis: 'A routine 6-trade losing streak reduces the account by ~47%, requiring a +90% return to recover.',
        outcome: 'Risk of ruin is near certainty under high fixed-fractional sizing.'
      }
    ],
    quizzes: [
      {
        id: 'q3-5',
        question: 'Why is risking 5% or 10% per trade considered reckless by institutional desks?',
        options: [
          'Because brokers do not permit more than 1% risk by law',
          'Because probabilistic distributions guarantee that losing streaks of 5 to 8 consecutive trades will occur, causing devastating 40-60% drawdowns',
          'Because market makers will freeze the account',
          'Because 10% risk requires too many monitor screens'
        ],
        correctIndex: 1,
        explanation: 'Random distribution of trades guarantees multi-trade losing streaks over any meaningful sample size. High bet sizing makes drawdown irreversible.'
      }
    ],
    commonMistakes: [
      'Believing that after 4 losses, the next trade is "due" to win (the Gambler’s Fallacy).',
      'Assuming that a backtested strategy will never experience a worse losing streak than its historical past.'
    ],
    learningObjectives: [
      'Calculate the statistical probability of consecutive losing streaks across trade samples.',
      'Explain the Gambler’s Fallacy and the independence of successive trade outcomes.',
      'Cap risk-per-trade below 1-2% to keep risk of ruin at virtually 0%.'
    ],
    estimatedLearningTime: 22
  },
  {
    id: 'c3-stop-loss-discipline',
    title: 'Stop-Loss Placement & Invariance Rules',
    category: 'RISK MANAGEMENT',
    level: 3,
    difficulty: 'Intermediate',
    description: 'Place stops where your market thesis is structurally proven wrong, never based on an arbitrary dollar amount.',
    simpleExplanation: 'Do not put your stop at -$100 just because you want to lose $100. Put your stop where the market proves your trade idea was wrong (e.g., below the swing low). Then adjust your share count so that distance equals $100.',
    professionalDefinition: 'The execution discipline of establishing invalidation levels determined solely by market structure and volatility (e.g. ATR buffers), enforcing unconditional trade exit when structural premises fail.',
    prerequisites: ['c3-risk-per-trade', 'c2-market-structure'],
    relatedConcepts: ['c3-asymmetric-drawdowns', 'c5-fom-and-revenge-trading'],
    examples: [
      {
        scenario: 'Trader places a long trade expecting a swing low at $48 to hold. Instead of setting a stop at $47.80, they set a wide stop at $42 because they "don’t want to get stopped out."',
        analysis: 'By the time price reaches $42, the market thesis was invalidated 6 dollars ago, but the trader absorbed a 3x larger loss.',
        outcome: 'Violating structural invalidation destroys the strategy’s mathematical expectancy.'
      }
    ],
    quizzes: [
      {
        id: 'q3-6',
        question: 'Where should a professional stop-loss be placed?',
        options: [
          'At whatever round dollar loss feels comfortable to the trader',
          'At the precise technical price level where the structural premise for entering the trade is objectively invalidated',
          'Always exactly $1.00 below the entry price',
          'Never place a stop loss so that you never take a loss'
        ],
        correctIndex: 1,
        explanation: 'Stops must align with technical invalidation. If the reason for being in the trade is broken, the position must be terminated immediately.'
      }
    ],
    commonMistakes: [
      'Moving a stop-loss further away as price approaches it to avoid taking a loss.',
      'Placing stops so close that normal market noise and bid-ask spreads trigger premature exits.'
    ],
    learningObjectives: [
      'Define trade invalidation using objective structural swing levels and ATR cushions.',
      'Decouple emotional dollar pain from technical invalidation location.',
      'Automate hard stop orders directly in the broker matching system.'
    ],
    estimatedLearningTime: 20
  }
];
