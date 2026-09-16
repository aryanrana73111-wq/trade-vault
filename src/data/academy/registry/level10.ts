import { CurriculumConcept } from '@/types/academy';

export const LEVEL_10_CONCEPTS: CurriculumConcept[] = [
  {
    id: 'c10-multi-manager-allocations',
    title: 'The Multi-Manager Pod Shop Model (Citadel, Millennium, Point72)',
    category: 'INSTITUTIONAL TRADING',
    level: 10,
    difficulty: 'Institutional',
    description: 'How the world’s most successful hedge funds operate: autonomous Portfolio Manager (PM) pods, strict capital pass-through, and zero tolerance for factor risk.',
    simpleExplanation: 'Top hedge funds don’t have one master trader. They have 200 small independent teams (called pods). Each team gets $50 million to $500 million to trade a specific strategy. If a team loses 3% to 5%, their capital is cut. If they lose 7%, their risk limits are terminated. The fund blends all 200 pods together to make steady, low-risk profits every single month.',
    professionalDefinition: 'The multi-strategy multi-manager fund architecture where hundreds of discrete portfolio management teams trade market-neutral books under strict factor constraints (zero beta, zero sector bias, zero size exposure), whose decorrelated returns are levered at the fund level to produce high Sharpe ratios (Sharpe > 2.5-3.0).',
    prerequisites: ['c3-risk-per-trade', 'c7-systematic-architecture', 'c9-macro-liquidity-and-rates'],
    relatedConcepts: ['c10-risk-limits-and-mandates', 'c10-alpha-vs-beta'],
    examples: [
      {
        scenario: 'A Portfolio Manager pod is allocated $100M gross market value in healthcare equity long/short.',
        analysis: 'The PM holds $50M long and $50M short, hedging out market beta and sector risk. If the pod loses -$3M (-3%), capital is halved to $50M. At -$5M (-5%), the PM is liquidated and replaced.',
        outcome: 'The centralized fund limits catastrophic drawdown risk while compounding high Sharpe alpha.'
      }
    ],
    artifacts: [
      {
        type: 'portfolio-weights',
        title: 'Multi-Pod Capital Allocation Simulator',
        description: 'Simulate capital reallocation across 10 decorrelated trading pods with drawdown limits.'
      }
    ],
    quizzes: [
      {
        id: 'q10-1',
        question: 'What happens to an institutional Portfolio Manager (PM) at a top multi-manager platform if their pod hits its hard contractual drawdown limit (e.g., -5% or -7%)?',
        options: [
          'The fund gives them 10x more leverage to win it back',
          'Their positions are systematically de-risked or liquidated by the central risk management desk, and their book is closed or downsized',
          'The PM is promoted to Chief Executive Officer',
          'Nothing, drawdowns are ignored in hedge funds'
        ],
        correctIndex: 1,
        explanation: 'Multi-manager platforms enforce unyielding central risk management: hitting contractual loss thresholds triggers automated book de-risking and liquidation.'
      }
    ],
    caseStudies: [
      {
        title: 'The Rise of Platform Hedge Funds (2010–2025)',
        era: 'Modern Wall Street',
        overview: 'Firms like Citadel and Millennium generated unprecedented consistent alpha with almost zero annual drawdowns by aggregating hundreds of low-correlation, market-neutral pods with aggressive leverage and strict stop-outs.',
        keyTakeaway: 'Portfolio construction and decorrelation generate higher risk-adjusted returns than individual directional brilliance.'
      }
    ],
    commonMistakes: [
      'Assuming hedge fund managers are allowed to take massive directional market bets.',
      'Failing to implement personal hard drawdown circuit breakers mirroring institutional pod rules.'
    ],
    learningObjectives: [
      'Deconstruct the economics of multi-manager pod hedge fund platforms.',
      'Explain why decorrelation across pods allows 5x-8x balance sheet leverage.',
      'Apply institutional pod-style drawdown constraints to personal trading accounts.'
    ],
    estimatedLearningTime: 30
  },
  {
    id: 'c10-risk-limits-and-mandates',
    title: 'Institutional Risk Mandates: VaR, Stress Testing & Factor Neutrality',
    category: 'RISK MANAGEMENT',
    level: 10,
    difficulty: 'Institutional',
    description: 'The math behind professional risk management: Value-at-Risk (VaR), Expected Shortfall (CVaR), and Barra factor decomposition.',
    simpleExplanation: 'At a bank or hedge fund, the risk manager can press a button and shut down your trading at any second. They track Value-at-Risk (how much you could lose in a bad day), stress test your book against historic crashes (like 2008 or 2020), and force you to keep your market beta near zero.',
    professionalDefinition: 'The quantitative oversight framework enforcing Value-at-Risk (VaR), Conditional VaR (Expected Shortfall), idiosyncratic volatility bounds, liquidity horizon limits, and strict neutrality across Barra risk factors (Momentum, Value, Size, Volatility, Growth).',
    prerequisites: ['c6-probability-distributions', 'c3-asymmetric-drawdowns'],
    relatedConcepts: ['c10-multi-manager-allocations', 'c10-portfolio-risk-parity'],
    formulas: [
      {
        name: 'Parametric Value-at-Risk (VaR)',
        expression: 'VaR_α = (Z_α * σ * √t - μ * t) * Portfolio_Value',
        variables: [
          { symbol: 'Z_α', meaning: 'Standard normal deviate for confidence level (e.g. 1.645 for 95%, 2.326 for 99%)' },
          { symbol: 'σ', meaning: 'Portfolio return volatility' },
          { symbol: 't', meaning: 'Time horizon in days' }
        ],
        notes: 'VaR states: "Over the next t days, we are 99% confident our maximum loss will not exceed $X."'
      },
      {
        name: 'Expected Shortfall (CVaR)',
        expression: 'ES_α = E[ Loss | Loss > VaR_α ]',
        notes: 'Measures the average loss in the extreme tail beyond the VaR cutoff.'
      }
    ],
    examples: [
      {
        scenario: 'A trading desk holds a $20M portfolio with daily volatility of 1.5%.',
        analysis: 'Daily 99% VaR = 2.326 * 0.015 * $20,000,000 = $697,800.',
        outcome: 'The risk department requires the desk to hold sufficient liquid margin collateral to cover at least a $700,000 single-day loss.'
      }
    ],
    quizzes: [
      {
        id: 'q10-2',
        question: 'What is the primary advantage of Expected Shortfall (Conditional VaR) over traditional Value-at-Risk (VaR)?',
        options: [
          'It is easier to calculate by hand',
          'It satisfies mathematical coherence (subadditivity) and explicitly measures the expected loss severity deep within the tail when the VaR threshold is breached',
          'It guarantees that losses never occur',
          'It eliminates the need for stop-loss orders'
        ],
        correctIndex: 1,
        explanation: 'VaR tells you the cutoff price, but remains blind to how deep the loss is if a catastrophic tail event occurs; Expected Shortfall measures the average loss in that tail.'
      }
    ],
    commonMistakes: [
      'Relying solely on 95% VaR, which ignores the severe losses that happen in the remaining 5% tail.',
      'Believing that historical covariance matrices remain static during market panic shocks.'
    ],
    learningObjectives: [
      'Calculate historical, parametric, and Monte Carlo Value-at-Risk.',
      'Compute Conditional Value-at-Risk (Expected Shortfall).',
      'Conduct historical stress testing simulating 1987, 2008, and March 2020 liquidity shocks.'
    ],
    estimatedLearningTime: 28
  },
  {
    id: 'c10-prime-brokerage',
    title: 'Prime Brokerage, Financing & Cross-Margining',
    category: 'INSTITUTIONAL TRADING',
    level: 10,
    difficulty: 'Institutional',
    description: 'How institutions fund their trades: repo facilities, securities lending, unencumbered cash, and synthetic prime brokerage.',
    simpleExplanation: 'Retail traders use retail brokers. Billion-dollar hedge funds use Prime Brokers at Goldman Sachs or Morgan Stanley. The prime broker loans them hundreds of millions of dollars, lends them shares to short, and clears all their trades across 50 different global exchanges.',
    professionalDefinition: 'The centralized bundled suite of institutional services provided by Tier-1 investment banks to hedge funds, encompassing global trade clearing, custody, securities lending (borrow locates for shorts), cross-margining leverage, and capital introduction.',
    prerequisites: ['c1-leverage-and-margin', 'c1-long-vs-short'],
    relatedConcepts: ['c10-multi-manager-allocations', 'c8-futures-basis-and-funding'],
    examples: [
      {
        scenario: 'A hedge fund holds $200M in long equities and $180M in short equities.',
        analysis: 'Under retail Regulation T rules, they would need enormous cash collateral. Under a prime broker’s Portfolio Margining (TIMS) model, their net market risk is recognized as minimal.',
        outcome: 'The prime broker extends leverage requiring only $30M in equity collateral.'
      }
    ],
    quizzes: [
      {
        id: 'q10-3',
        question: 'What is the role of a Prime Broker for institutional hedge funds?',
        options: [
          'To write the trading software and pick which stocks to buy',
          'To provide securities lending, leverage financing, cross-margining clearing, and custody across multiple execution venues',
          'To regulate retail day-trading rules',
          'To guarantee fund investors a fixed 10% dividend'
        ],
        correctIndex: 1,
        explanation: 'Prime brokers act as the institutional backbones of hedge funds, financing leverage and providing clearing/custody.'
      }
    ],
    commonMistakes: [
      'Ignoring counterparty risk with prime brokers (e.g. Lehman Brothers collapse freezing client hedge fund assets in 2008).',
      'Confusing Reg T retail margin with risk-based institutional portfolio margining.'
    ],
    learningObjectives: [
      'Explain the institutional operations of Prime Brokerage and securities lending.',
      'Differentiate between Regulation T margin and Portfolio Margining.',
      'Analyze liquidity haircuts and rehypothecation risks.'
    ],
    estimatedLearningTime: 25
  },
  {
    id: 'c10-portfolio-risk-parity',
    title: 'Risk Parity & Equal Risk Contribution (ERC)',
    category: 'PORTFOLIO MANAGEMENT',
    level: 10,
    difficulty: 'Institutional',
    description: 'Bridgewater’s All Weather architecture: allocate capital so that every asset class contributes an identical amount of risk to the portfolio.',
    simpleExplanation: 'In a traditional 60% stock / 40% bond portfolio, stocks are so volatile that they drive 90% of the entire portfolio’s risk! In a Risk Parity portfolio, you size each asset inversely to its volatility, so stocks, bonds, gold, and commodities all contribute equal risk.',
    professionalDefinition: 'An asset allocation strategy that balances portfolio risk by equalizing the marginal risk contribution (MRC) of each asset class: w_i * (Cov(R)_i / σ_p) = (1/N) * σ_p, eliminating cyclical vulnerability to inflation or growth surprises.',
    prerequisites: ['c3-risk-per-trade', 'c6-z-score-standard-deviation'],
    relatedConcepts: ['c9-macro-liquidity-and-rates', 'c10-alpha-vs-beta'],
    formulas: [
      {
        name: 'Marginal Contribution to Risk (MCR)',
        expression: 'MCR_i = ∂σ_p / ∂w_i = (Σ * w)_i / σ_p',
        notes: 'In a true Risk Parity portfolio, w_i * MCR_i is equal for all assets i = 1...N.'
      }
    ],
    examples: [
      {
        scenario: 'Stocks have 16% volatility; government bonds have 4% volatility.',
        analysis: 'To make their risk contributions equal, the portfolio must hold 4x more dollar weight in bonds than in stocks (80% bonds / 20% stocks).',
        outcome: 'The resulting portfolio achieves an identical equity-like return with a 60% smaller maximum drawdown.'
      }
    ],
    quizzes: [
      {
        id: 'q10-4',
        question: 'Why does a traditional "60/40" portfolio (60% Equities / 40% Bonds) fail to provide true diversification in market crashes?',
        options: [
          'Because bonds are banned during crashes',
          'Because equity volatility is so much higher than bond volatility that equities account for over 90% of the portfolio’s total variance and drawdown risk',
          'Because 60 + 40 does not equal 100',
          'Because brokers refuse to rebalance'
        ],
        correctIndex: 1,
        explanation: 'Equities dominate the risk profile; risk parity solves this by equalizing risk contributions rather than capital dollars.'
      }
    ],
    caseStudies: [
      {
        title: 'Bridgewater Associates All Weather Portfolio',
        era: '1996–Present',
        overview: 'Ray Dalio’s Bridgewater pioneered the Risk Parity framework, designing an all-weather portfolio engineered to survive the four economic seasons: rising growth, falling growth, rising inflation, and falling inflation.',
        keyTakeaway: 'Macro environments shift unpredictably; balanced risk contribution survives regime transitions.'
      }
    ],
    commonMistakes: [
      'Equating equal dollar weighting (1/N capital) with equal risk weighting.',
      'Using extreme leverage on low-volatility assets without monitoring interest rate liquidity shocks.'
    ],
    learningObjectives: [
      'Calculate covariance matrices and marginal risk contributions (MCR).',
      'Construct an Equal Risk Contribution (ERC) portfolio allocation.',
      'Leverage decorrelated low-volatility assets to optimize portfolio Sharpe ratio.'
    ],
    estimatedLearningTime: 30
  },
  {
    id: 'c10-alpha-vs-beta',
    title: 'True Alpha vs Leveraged Beta & Factor Attribution',
    category: 'INSTITUTIONAL TRADING',
    level: 10,
    difficulty: 'Institutional',
    description: 'Separate luck from skill: CAPM regression, Fama-French 5-factor decomposition, and idiosyncratic alpha generation.',
    simpleExplanation: 'Beta is just riding the wave: when the market goes up 20% and your portfolio goes up 20%, you didn’t do anything special; you just had Beta. Alpha is what you made through pure skill after removing everything the market did. If the market dropped 10% and you made 8%, that is pure institutional Alpha.',
    professionalDefinition: 'The formal econometric decomposition of portfolio returns into systematic benchmark exposure (Beta β) and idiosyncratic excess risk-adjusted return (Jensen’s Alpha α): R_p - R_f = α + β*(R_m - R_f) + ε, extended via multi-factor models (Value, Size, Momentum, Quality, Investment).',
    prerequisites: ['c6-expected-value', 'c7-systematic-architecture'],
    relatedConcepts: ['c10-multi-manager-allocations', 'c10-risk-limits-and-mandates'],
    formulas: [
      {
        name: 'Jensen’s Alpha (CAPM)',
        expression: 'α = R_p - [ R_f + β_p * (R_m - R_f) ]',
        variables: [
          { symbol: 'R_p', meaning: 'Portfolio realized return' },
          { symbol: 'R_f', meaning: 'Risk-free return rate' },
          { symbol: 'β_p', meaning: 'Covariance(R_p, R_m) / Variance(R_m)' },
          { symbol: 'R_m', meaning: 'Market benchmark return' }
        ],
        notes: 'A positive statistically significant alpha (t > 2.0) proves skill over market exposure.'
      }
    ],
    examples: [
      {
        scenario: 'Fund A returns +30% in a year when the market gained +28% (Beta = 1.05). Fund B returns +12% when the market lost -15% (Beta = 0.02).',
        analysis: 'Fund A generated virtually zero Alpha (just rode market Beta with leverage). Fund B generated +12% of pure idiosyncratic Alpha.',
        outcome: 'Institutional allocators pay high incentive fees to Fund B while firing Fund A.'
      }
    ],
    quizzes: [
      {
        id: 'q10-5',
        question: 'What is Jensen’s Alpha in portfolio performance evaluation?',
        options: [
          'The total dollar profit made by the trader',
          'The excess risk-adjusted return of a portfolio over what would be predicted by the Capital Asset Pricing Model (CAPM) given its market risk exposure (Beta)',
          'The number of trades taken in a month',
          'The highest price of the stock during the year'
        ],
        correctIndex: 1,
        explanation: 'Alpha measures genuine risk-adjusted excess return attributable to manager skill rather than passive benchmark beta.'
      }
    ],
    commonMistakes: [
      'Mistaking a bull market rally for personal trading genius (confusing Beta with Alpha).',
      'Paying high management fees for closet indexing strategies.'
    ],
    learningObjectives: [
      'Perform multi-factor regression analysis to isolate Alpha and Factor Betas.',
      'Decompose trading returns into systematic factor exposures vs idiosyncratic edge.',
      'Design market-neutral strategies delivering pure un-levered Alpha.'
    ],
    estimatedLearningTime: 28
  }
];
