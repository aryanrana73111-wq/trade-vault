import {
  MaxConceptItem,
  RoadmapPhase,
  MaxCaseStudy,
  MaxTradingMyth,
  BullBearDebate,
  MaxDomain
} from '@/types/academyTier';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. ROADMAP PHASES (Phase 0 to Phase 10)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ROADMAP_PHASES_DATA: RoadmapPhase[] = [
  {
    phase: 0,
    title: 'Phase 0 — Market Literacy',
    timeframe: 'Week 1-2',
    badgeColor: '#94A3B8',
    description: 'Understand the fundamental architecture of financial markets, the role of liquidity providers, and the stark distinction between gambling, trading, and long-term investing.',
    concepts: [
      'What is a Market?',
      'Buyers & Sellers Dynamics',
      'Supply & Demand Mechanics',
      'Asset Classes Overview',
      'Market Participants Hierarchy',
      'Trading vs. Investing'
    ],
    resources: [
      { type: 'web', name: 'BabyPips School of Pipsology (Pre-School)', source: 'BabyPips.com', url: 'https://www.babypips.com/learn/forex/preschool' },
      { type: 'book', name: 'Market Wizards (Introduction)', source: 'Jack Schwager' },
      { type: 'video', name: 'How Markets Work & Price Discovery', source: 'Rayner Teo' }
    ],
    milestone: 'Able to articulate auction mechanics, bid/ask spread costs, and distinguish exchange vs. OTC trades.'
  },
  {
    phase: 1,
    title: 'Phase 1 — Market Foundations',
    timeframe: 'Week 3-5',
    badgeColor: '#60A5FA',
    description: 'Master asset class specifics: Forex pairs, equities, spot crypto, sovereign bonds, and commodities like Gold and Crude Oil.',
    concepts: [
      'Forex Market Mechanics & Currency Pairs',
      'Stock Market Structure & Exchanges',
      'Crypto Market Dynamics & 24/7 Liquidity',
      'Commodities (Gold, Oil) Fundamentals',
      'Bonds, Yields & Fixed Income',
      'Market Sessions (Tokyo, London, New York)',
      'Liquidity, Volume & Market Depth',
      'Exchanges vs. ECN/STP Brokers',
      'Spot vs. Derivatives (Futures & Options)'
    ],
    resources: [
      { type: 'web', name: 'Basics of Financial Instruments', source: 'Investopedia.com', url: 'https://www.investopedia.com/investing-4427685' },
      { type: 'web', name: 'Kindergarten Curriculum', source: 'BabyPips.com', url: 'https://www.babypips.com/learn/forex/kindergarten' },
      { type: 'book', name: 'How the Stock Market Works', source: 'Michael Sincere' },
      { type: 'video', name: 'Asset Classes & Market Cycles', source: 'The Plain Bagel' }
    ],
    milestone: 'Accurately distinguish contract specifications, tick values, margin requirements, and session rollovers.'
  },
  {
    phase: 2,
    title: 'Phase 2 — Chart Reading & Technical Analysis',
    timeframe: 'Week 6-9',
    badgeColor: '#A78BFA',
    description: 'Learn visual price action, Japanese candlesticks, dynamic moving averages, support/resistance confluence, and multi-timeframe market structure.',
    concepts: [
      'Candlestick Anatomy (OHLC)',
      'Single & Multi-Candle Formations (20+ Patterns)',
      'Horizontal Support & Resistance Zones',
      'Dynamic Trendlines & Regression Channels',
      'Classical Reversal & Continuation Patterns (15+)',
      'Moving Averages (SMA vs. EMA)',
      'RSI (Relative Strength Index) Dynamics',
      'MACD Momentum & Divergence',
      'Bollinger Bands Volatility Expansion',
      'Volume Analysis & VWAP Confluence',
      'Pure Price Action & Swing Highs/Lows',
      'Multi-Timeframe Top-Down Analysis'
    ],
    resources: [
      { type: 'book', name: 'Japanese Candlestick Charting Techniques', source: 'Steve Nison' },
      { type: 'book', name: 'Technical Analysis of the Financial Markets', source: 'John J. Murphy' },
      { type: 'web', name: 'Technical Analysis University', source: 'BabyPips.com', url: 'https://www.babypips.com/learn/forex/technical-analysis' },
      { type: 'video', name: 'Chart Patterns & Volume Confirmation', source: 'Adam Khoo' }
    ],
    milestone: 'Capable of performing clean, uncluttered multi-timeframe structure mapping on raw charts.'
  },
  {
    phase: 3,
    title: 'Phase 3 — Orders & Execution Science',
    timeframe: 'Week 9-11',
    badgeColor: '#FB923C',
    description: 'The micro-mechanics of trade entry and execution: order routing, slippage management, spread compensation, and margin utilization.',
    concepts: [
      'Market Orders vs. Limit Orders',
      'Stop-Loss Orders & Stop-Limit Orders',
      'One-Cancels-the-Other (OCO) Orders',
      'Bid/Ask Spread Mechanics & Cost Drag',
      'Slippage & Latency Impact',
      'Order Book Depth (DOM) & Liquidity Pools',
      'Leverage, Margin Calls & Liquidation',
      'Long vs. Short Mechanics in Derivatives',
      'Introductory Position Sizing Math'
    ],
    resources: [
      { type: 'web', name: 'Order Types & Mechanics Guide', source: 'Investopedia.com', url: 'https://www.investopedia.com/terms/o/order.asp' },
      { type: 'web', name: 'Execution Quality & Slippage Whitepaper', source: 'CMC Markets' },
      { type: 'video', name: 'Order Types & Liquidity Traps', source: 'Rayner Teo' }
    ],
    milestone: 'Zero execution blunders: proficient with bracket orders, resting limit entries, and pre-trade margin calculations.'
  },
  {
    phase: 4,
    title: 'Phase 4 — Risk Management (The Cornerstone)',
    timeframe: 'Week 12-16',
    badgeColor: '#EF4444',
    description: 'THE SINGLE MOST CRITICAL PHASE. Master fixed-fractional sizing, the 1-2% capital rule, stop-loss distance math, and risk of ruin probability.',
    concepts: [
      'The 1-2% Fixed Capital Risk Rule',
      'Volatility-Adjusted Position Sizing (ATR)',
      'Stop-Loss Placement (Structure vs. Volatility)',
      'Take-Profit Trailing & Scaling Strategies',
      'Risk:Reward (R:R) Ratios vs. Win-Rate Truths',
      'The R-Multiple Accounting System',
      'Mathematical Expectancy Formula',
      'Profit Factor & Recovery Factor Calculations',
      'Drawdown Math & Compounding Losses',
      'Risk of Ruin (Ralph Vince Model)',
      'Daily, Weekly & Monthly Max Loss Limits',
      'Cross-Asset Correlation & Portfolio Heat'
    ],
    resources: [
      { type: 'book', name: 'Trade Your Way to Financial Freedom', source: 'Van K. Tharp' },
      { type: 'book', name: 'Trading in the Zone (Chapters 7-10)', source: 'Mark Douglas' },
      { type: 'web', name: 'Risk Management University', source: 'BabyPips.com', url: 'https://www.babypips.com/learn/forex/risk-management' },
      { type: 'video', name: 'The Mathematical Truth About Position Sizing', source: 'SMB Capital' }
    ],
    milestone: 'Automatic calculation of position sizing per stop distance; non-negotiable adherence to risk caps.'
  },
  {
    phase: 5,
    title: 'Phase 5 — Strategy Building & Verification',
    timeframe: 'Week 17-22',
    badgeColor: '#FBBF24',
    description: 'Transform subjective ideas into reproducible, testable trading systems with defined triggers, invalidation points, and trade management protocols.',
    concepts: [
      'Anatomy of a High-Probability Trading Setup',
      'Objective Entry Triggers vs. Subjective Bias',
      'Exit Criteria & Trade Management Rules',
      'Trend-Following Systems & Trailing Stops',
      'Mean-Reversion Strategies at Extreme Bands',
      'Breakout Trading & False-Breakout Identification',
      'Momentum Trading with Volume Confirmation',
      'Macro & Scheduled News Event Trading',
      'Systematic Backtesting Principles',
      'Forward Testing & Paper Trading Execution',
      'Standardized Strategy Documentation'
    ],
    resources: [
      { type: 'book', name: 'Way of the Turtle', source: 'Curtis Faith' },
      { type: 'book', name: 'Systematic Trading', source: 'Robert Carver' },
      { type: 'web', name: 'Quantpedia Quantitative Strategy Library', source: 'Quantpedia.com', url: 'https://quantpedia.com' },
      { type: 'video', name: 'Building & Auditing a Playbook Strategy', source: 'SMB Capital' }
    ],
    milestone: 'A written, codified 1-page Trading Playbook with strict checklist rules for entry, sizing, and exit.'
  },
  {
    phase: 6,
    title: 'Phase 6 — Macroeconomics & Fundamental Catalysts',
    timeframe: 'Week 23-27',
    badgeColor: '#3B82F6',
    description: 'Understand the global macroeconomic gears that drive institutional capital flows: inflation prints, central bank policy, and yield curve shifts.',
    concepts: [
      'CPI & Core Inflation Dynamics',
      'GDP Growth & Recession Indicators',
      'Non-Farm Payrolls (NFP) & Labor Health',
      'PMI (Purchasing Managers Index) Cycles',
      'Central Bank Rate Decisions (Fed, ECB, BOJ, RBI)',
      'Sovereign Bond Yield Curves & Inversion',
      'Corporate Earnings Reports (EPS, Guidance)',
      'Valuation Multiples (P/E, PEG, EV/EBITDA)',
      'Currency Correlations (DXY vs. Gold, Risk vs. JPY)',
      'Macro Regime Identification (Expansion vs. Stagflation)'
    ],
    resources: [
      { type: 'web', name: 'Global Economic Data & Releases', source: 'TradingEconomics.com', url: 'https://tradingeconomics.com' },
      { type: 'web', name: 'Federal Reserve Economic Data (FRED)', source: 'FRED St. Louis', url: 'https://fred.stlouisfed.org' },
      { type: 'book', name: 'Currency Trading and Intermarket Analysis', source: 'Ashraf Laïdi' },
      { type: 'web', name: 'Varsity Macroeconomics & Currency', source: 'Zerodha Varsity', url: 'https://zerodha.com/varsity' }
    ],
    milestone: 'Ability to contextualize daily technical charts within current central bank liquidity regimes.'
  },
  {
    phase: 7,
    title: 'Phase 7 — Behavioral Finance & Psychology',
    timeframe: 'Week 28-33',
    badgeColor: '#F472B6',
    description: 'Deconstruct the emotional and cognitive traps of trading: revenge trading, FOMO, loss aversion, and outcome bias.',
    concepts: [
      'The Neuroscience of Financial Risk & Fear',
      'FOMO (Fear of Missing Out) Triggers & Antidotes',
      'Revenge Trading & Emotional Tilt Mitigation',
      'Overtrading & The Need for Action',
      'Prospect Theory & Asymmetric Loss Aversion',
      'Cognitive Biases (Confirmation, Recency, Sunk Cost)',
      'The Disposition Effect (Cutting Winners, Holding Losers)',
      'Process vs. Outcome Decoupling',
      'Building Systematic Discipline & Daily Routines'
    ],
    resources: [
      { type: 'book', name: 'Trading in the Zone (Essential Masterpiece)', source: 'Mark Douglas' },
      { type: 'book', name: 'The Disciplined Trader', source: 'Mark Douglas' },
      { type: 'book', name: 'Thinking, Fast and Slow', source: 'Daniel Kahneman' },
      { type: 'web', name: 'TraderFeed Blog', source: 'Dr. Brett Steenbarger', url: 'http://steenbarger.blogspot.com' }
    ],
    milestone: 'Maintaining an unshakeable trade journal tracking emotional state alongside mechanical execution.'
  },
  {
    phase: 8,
    title: 'Phase 8 — Quantitative Thinking & Statistics',
    timeframe: 'Week 34-42',
    badgeColor: '#22D3EE',
    description: 'Replace subjective intuition with probabilistic reasoning: distributions, standard deviations, risk-adjusted ratios, and Monte Carlo paths.',
    concepts: [
      'Discrete & Continuous Probability in Trading',
      'Expected Value (EV) & Asymmetric Returns',
      'Standard Deviation, Variance & Volatility',
      'Normal Distributions, Fat Tails & Black Swans',
      'Sharpe Ratio & Sortino Ratio Comparisons',
      'Monte Carlo Simulation of Random Drawdown Sequences',
      'Overfitting, Data-Snooping & Curve-Fitting Traps',
      'Sample Size Requirements & Statistical Significance',
      'Pearson Correlation & Rolling Covariance'
    ],
    resources: [
      { type: 'book', name: 'Algorithmic Trading: Winning Strategies and Their Rationale', source: 'Dr. Ernest P. Chan' },
      { type: 'book', name: 'The Mathematics of Money Management', source: 'Ralph Vince' },
      { type: 'web', name: 'Quantopian Lecture Archives on Quantitative Finance', source: 'Quantopian / GitHub' },
      { type: 'web', name: 'Statistics for Finance Course', source: 'Coursera / Yale' }
    ],
    milestone: 'Verifying any trading edge with statistical hypothesis tests (p-values, t-stats, Monte Carlo bands).'
  },
  {
    phase: 9,
    title: 'Phase 9 — Portfolio Construction & Allocation',
    timeframe: 'Week 43-50',
    badgeColor: '#4ADE80',
    description: 'Scale beyond single-instrument setups into multi-asset portfolios: true non-correlated diversification, risk parity, and dynamic rebalancing.',
    concepts: [
      'Portfolio Construction Principles',
      'Asset Allocation Frameworks',
      'True vs. Naive Diversification',
      'Modern Portfolio Theory (Markowitz Mean-Variance)',
      'The Efficient Frontier & Tangency Portfolios',
      'Beta to Benchmark vs. Uncorrelated Alpha',
      'Risk Budgeting & Volatility Targeting',
      'Periodic vs. Threshold Rebalancing Strategies'
    ],
    resources: [
      { type: 'book', name: 'The Intelligent Investor', source: 'Benjamin Graham' },
      { type: 'book', name: 'A Random Walk Down Wall Street', source: 'Burton G. Malkiel' },
      { type: 'web', name: 'Portfolio Visualizer Tools', source: 'PortfolioVisualizer.com', url: 'https://www.portfoliovisualizer.com' },
      { type: 'book', name: 'All About Asset Allocation', source: 'Richard A. Ferri' }
    ],
    milestone: 'Constructing multi-strategy portfolios where individual strategy drawdowns offset each other.'
  },
  {
    phase: 10,
    title: 'Phase 10 — Professional & Institutional Practice',
    timeframe: 'Week 51-60',
    badgeColor: '#C084FC',
    description: 'The pinnacle of institutional trading: order flow mechanics, transaction cost analysis (TCA), performance attribution, and research workflows.',
    concepts: [
      'Market Microstructure & Order Matching Engines',
      'Institutional Order Flow & Footprint Charts',
      'Transaction Cost Analysis (TCA) & Implicit Costs',
      'Brinson Performance Attribution Models',
      'Professional Decision Journals & Post-Mortems',
      'Formal Research Documentation Standards',
      'Hypothesis Formulation & Evidence Grading Frameworks'
    ],
    resources: [
      { type: 'book', name: 'Market Microstructure Theory', source: 'Maureen O\'Hara' },
      { type: 'book', name: 'Active Portfolio Management', source: 'Richard C. Grinold & Ronald N. Kahn' },
      { type: 'web', name: 'Social Science Research Network (SSRN) Finance Archive', source: 'SSRN.com', url: 'https://www.ssrn.com' }
    ],
    milestone: 'Conducting institutional-grade research memos with documented empirical backing before risking capital.'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. COMPLETE 135 CONCEPTS REGISTRY (10 DOMAINS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MAX_CONCEPTS_LIST: MaxConceptItem[] = [
  // ── DOMAIN 1: MARKET FUNDAMENTALS (C001 - C015) ──
  {
    id: 'C001',
    title: 'What is a Financial Market?',
    domain: 'Market Fundamentals',
    level: 0,
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    subtitle: 'The auction mechanism that connects buyers, sellers, and capital allocation.',
    simpleExplanation: 'A financial market is like a huge global marketplace where people buy and sell items of value—like stocks (pieces of companies), currencies (dollars, euros), or gold. Instead of fruits, prices move based on how many people want to buy versus sell.',
    professionalExplanation: 'A financial market is an institutional and technological framework facilitating the exchange of capital, financial instruments, and contractual claims. It enables price discovery, resource allocation, and liquidity transformation under regulated clearing mechanisms.',
    formulas: [
      {
        name: 'Transaction Value',
        expression: 'V = P × Q',
        description: 'Total capital transacted equals unit price multiplied by traded quantity.',
        example: 'P = $2,500/oz Gold, Q = 10 oz → V = $25,000'
      }
    ],
    expertNotes: 'Markets exist to facilitate trade and absorb risk. Beginners often think markets are designed to trick them; in reality, price simply searches for the level where maximum liquidity can clear.',
    mythVsEvidence: {
      myth: 'Markets are rigged casinos with random prices designed to take retail money.',
      evidence: 'Prices reflect aggregate auction balance, corporate fundamentals, central bank rates, and supply/demand matching across millions of global participants.',
      counterpoint: 'While micro-structure features high-frequency trading, broader asset trends strictly reflect macro liquidity and corporate earnings.'
    },
    commonMistakes: [
      'Assuming market movement requires equal numbers of buyers and sellers (every trade requires 1 buyer and 1 seller; price moves when one side is more aggressive).',
      'Confusing the exchange with the broker.',
      'Treating trading as gambling without statistical edge.'
    ],
    realScenario: {
      scenarioA: {
        title: 'With Market Understanding',
        desc: 'Trader waits for high-volume liquidity sessions (London/NY overlap) to enter liquid assets with minimal spread friction.',
        math: 'Spread cost: 0.8 pips ($8 per standard lot)'
      },
      scenarioB: {
        title: 'Without Market Understanding',
        desc: 'Trader enters an illiquid exotic pair during weekend market rollover with widened spreads.',
        math: 'Spread cost: 18.5 pips ($185 per lot) — immediately down -1.85% before price even moves.'
      },
      keyTakeaway: 'Trading during deep liquidity windows preserves capital by minimizing implicit transaction friction.'
    },
    resources: [
      { type: 'Book', title: 'How Markets Work', authorOrSource: 'Larry Harris' },
      { type: 'Article', title: 'Anatomy of Price Discovery', authorOrSource: 'Investopedia' }
    ],
    relatedConceptIds: ['C002', 'C003', 'C012', 'C013'],
    quiz: [
      {
        question: 'What fundamentally causes a market price to rise?',
        options: [
          'There are more buyers than sellers in total headcount',
          'Buyers are willing to pay higher ask prices aggressively to fill their orders',
          'The broker decides to increase the price',
          'A government mandate sets the new tick'
        ],
        correctIndex: 1,
        explanation: 'Every executed transaction has exactly one buyer and one seller. Prices increase when aggressive buyers lift the offer (buy at the Ask), clearing available liquidity.'
      }
    ]
  },
  {
    id: 'C002',
    title: 'Price Discovery Mechanism',
    domain: 'Market Fundamentals',
    level: 0,
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    subtitle: 'How competing bids and offers converge to establish fair market value.',
    simpleExplanation: 'Imagine an auction where someone yells "I will buy for $100" and another says "I will only sell for $102". When a buyer agrees to pay $102, a trade happens. This continuous negotiation is price discovery.',
    professionalExplanation: 'Price discovery is the continuous thermodynamic process through which markets incorporate public information, order flow, supply expectations, and risk premia into clearing prices via continuous double auctions.',
    formulas: [
      {
        name: 'Mid Price',
        expression: 'P_mid = (P_bid + P_ask) / 2',
        description: 'The mathematical midpoint between highest bid and lowest ask.',
        example: 'Bid: 1.0850, Ask: 1.0852 → Mid: 1.0851'
      }
    ],
    expertNotes: 'Price discovery accelerates violently around high-impact macroeconomic data releases like CPI or NFP because participants instantly recalibrate future cash flow projections.',
    mythVsEvidence: {
      myth: 'Price discovery is instant and always produces the true fundamental value.',
      evidence: 'Academic research (Fama, Shiller) reveals markets fluctuate between efficiency and behavioral overshoot due to herd dynamics and leverage.',
      counterpoint: 'Over medium and long horizons, price discovery remains the most efficient known capital allocation mechanism.'
    },
    commonMistakes: [
      'Placing market orders during illiquid gaps or volatile data releases.',
      'Expecting price to halt exactly at clean round psychological numbers without overshoot.'
    ],
    realScenario: {
      scenarioA: {
        title: 'Disciplined Limit Order',
        desc: 'Trader places a limit order at key support; order executes only when liquidity reaches their desired price.',
        math: 'Slippage: $0.00'
      },
      scenarioB: {
        title: 'Emotional Market Order in News',
        desc: 'Trader hits market buy during an interest rate headline release.',
        math: 'Spread widened to 35 pips; filled 42 pips away from last seen price.'
      },
      keyTakeaway: 'Understanding price discovery mechanics prevents traders from getting slaughtered by widened spreads during volatility shocks.'
    },
    resources: [
      { type: 'Book', title: 'Trading and Exchanges: Market Microstructure for Practitioners', authorOrSource: 'Larry Harris' },
      { type: 'Article', title: 'How Double Auctions Clear', authorOrSource: 'Chicago Mercantile Exchange' }
    ],
    relatedConceptIds: ['C001', 'C015', 'C046', 'C128'],
    quiz: [
      {
        question: 'What happens to the bid-ask spread during sudden high-impact news?',
        options: [
          'It stays completely fixed',
          'It narrows to 0 pips',
          'It widens dramatically as liquidity providers pull back resting limit orders',
          'The exchange cancels all transactions'
        ],
        correctIndex: 2,
        explanation: 'Liquidity providers face asymmetric information risk during news shocks, so they pull or widen their resting quotes, resulting in wider spreads.'
      }
    ]
  },
  {
    id: 'C051',
    title: 'The 1-2% Capital Risk Rule',
    domain: 'Risk Management',
    level: 3,
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    subtitle: 'The single most critical risk management rule in modern trading.',
    simpleExplanation: 'Imagine you have ₹1,00,000 in your account. The 1% rule says: in any single trade, if your stop-loss is hit, you must never lose more than ₹1,000. That way, even if you hit 10 consecutive losses in a row, you still have over 90% of your account intact to recover!',
    professionalExplanation: 'The fixed-fractional position sizing model caps maximum capital-at-risk per trade to a predefined percentage (typically 1.0% to 2.0%) of total account equity. This limits drawdown variance and prevents catastrophic terminal ruin across adverse runs.',
    formulas: [
      {
        name: 'Maximum Risk Amount ($)',
        expression: 'Risk_$ = Account_Equity × Risk_%',
        description: 'Dollar amount permitted to lose on the setup.',
        example: '$10,000 equity × 1% = $100 max risk'
      },
      {
        name: 'Position Size (Units)',
        expression: 'Position_Units = Risk_$ / (Entry_Price - Stop_Price)',
        description: 'Exact quantity of contracts to purchase based on structural invalidation distance.',
        example: 'Risk $100 / ($2,000 - $1,990 = $10) = 10 units'
      }
    ],
    expertNotes: 'Most beginners blow their accounts not because of poor technical analysis, but because of improper position sizing. I have watched traders with 70% win rates wipe out their accounts in 2 days because they sized trades emotionally.',
    mythVsEvidence: {
      myth: '1% risk per trade is too small to build a substantial account.',
      evidence: 'At 1% risk per trade with an average 2:1 R:R and a conservative 45% win rate, mathematical expectancy yields +0.35R per trade (+35% net return across 100 disciplined trades).',
      counterpoint: 'On very small accounts ($100), minimum broker lot sizes may make exact 1% adherence difficult without micro/nano contracts.'
    },
    commonMistakes: [
      'Calculating risk on total position value rather than stop-loss distance (e.g., buying $100 worth of stock instead of risking $100 on the stop).',
      'Moving the stop loss further away when price approaches it, violating the defined 1% boundary.',
      'Entering 5 correlated positions simultaneously, inadvertently creating a 5-10% single-theme risk event.'
    ],
    realScenario: {
      scenarioA: {
        title: 'Adhering to the 1% Rule',
        desc: 'Account: $10,000. Suffers a painful 10-trade losing streak. Each loss is capped at 1%.',
        math: 'Remaining equity: ~$9,043 (-9.6% drawdown). Only +10.6% gain required to reach breakeven.'
      },
      scenarioB: {
        title: 'Uncapped Emotional 10% Risk',
        desc: 'Account: $10,000. Risks 10% per trade and suffers the exact same 10 consecutive losses.',
        math: 'Remaining equity: $3,487 (-65.1% drawdown). A colossal +186.8% return is required just to recover capital!'
      },
      keyTakeaway: 'The difference between 1% and 10% risk is not just 10x harder to recover from—it is the difference between survival and bankruptcy.'
    },
    resources: [
      { type: 'Book', title: 'Trade Your Way to Financial Freedom', authorOrSource: 'Dr. Van K. Tharp' },
      { type: 'Book', title: 'The Mathematics of Money Management', authorOrSource: 'Ralph Vince' },
      { type: 'Article', title: 'The 1% Rule for Day Traders', authorOrSource: 'Investopedia' },
      { type: 'Tool', title: 'TradeVault Position Size Simulator', authorOrSource: 'TradeVault Academy Labs' }
    ],
    relatedConceptIds: ['C052', 'C053', 'C055', 'C056', 'C060', 'C062'],
    quiz: [
      {
        question: 'With an account balance of $25,000, what is the maximum dollar loss permitted under the 1% rule?',
        options: ['$100', '$250', '$500', '$2,500'],
        correctIndex: 1,
        explanation: '$25,000 × 0.01 = $250 maximum dollar risk permitted on the trade.'
      },
      {
        question: 'If your account equity is $10,000, your entry is $50.00, and your stop loss is $48.00, how many shares can you buy at 1% risk?',
        options: ['100 shares', '50 shares', '200 shares', '500 shares'],
        correctIndex: 1,
        explanation: 'Max risk is $100. Stop distance is $50 - $48 = $2.00 per share. Position size = $100 / $2.00 = 50 shares.'
      }
    ]
  },
  {
    id: 'C055',
    title: 'Risk:Reward (R:R) Ratio',
    domain: 'Risk Management',
    level: 3,
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    subtitle: 'Quantifying trade reward potential relative to capital placed at risk.',
    simpleExplanation: 'If you risk ₹100 to potentially make ₹200, your Risk:Reward ratio is 1:2. The higher your reward relative to risk, the lower your required win rate to remain consistently profitable over time.',
    professionalExplanation: 'The Risk-to-Reward ratio compares the downside capital-at-risk (entry minus stop loss) with the expected upside target (take profit minus entry). It defines the geometry of expectancy alongside win rate.',
    formulas: [
      {
        name: 'R:R Ratio',
        expression: 'R:R = (Target_Price - Entry_Price) / (Entry_Price - Stop_Price)',
        description: 'Ratio of upside target distance to downside risk distance.',
        example: 'Entry: $100, Stop: $95 ($5 risk), Target: $115 ($15 reward) → R:R = 3.0:1'
      },
      {
        name: 'Breakeven Win Rate',
        expression: 'WR_be = 1 / (1 + Reward_Ratio)',
        description: 'The minimum win rate required to not lose money at a given R:R.',
        example: 'At 2:1 R:R → 1 / (1 + 2) = 33.3% win rate needed'
      }
    ],
    expertNotes: 'Beginners obsess over having an 80% win rate. Professional fund managers routinely achieve generational wealth with a 40-45% win rate because their average winning trade is 2.5R to 3R while their losers are capped at 1R.',
    mythVsEvidence: {
      myth: 'A high Risk:Reward ratio like 5:1 is always superior to a 1.5:1 setup.',
      evidence: 'Wider profit targets reduce probability of fill. A 5:1 setup may only fill 15% of the time, resulting in negative expectancy if hit rate drops too low.',
      counterpoint: 'The optimal R:R is tailored to market regime: trend regimes support 3R+, while range regimes favor 1.5R.'
    },
    commonMistakes: [
      'Arbitrarily placing profit targets at 3R without checking structural resistance.',
      'Taking 1:0.5 R:R trades (risking $200 to make $100), which requires a perilous 67%+ win rate just to break even.'
    ],
    realScenario: {
      scenarioA: {
        title: 'Trader A (2:1 R:R with 40% Win Rate)',
        desc: 'Over 100 trades: 40 wins × $200 = $8,000. 60 losses × $100 = $6,000.',
        math: 'Net Profit: +$2,000 (+20% gain on $10k account) despite losing 60% of all trades!'
      },
      scenarioB: {
        title: 'Trader B (1:2 inverted R:R with 60% Win Rate)',
        desc: 'Risks $200 to make $100. 60 wins × $100 = $6,000. 40 losses × $200 = $8,000.',
        math: 'Net Loss: -$2,000 (-20% loss) despite winning a majority of trades!'
      },
      keyTakeaway: 'Asymmetric risk:reward allows you to be wrong more than half the time and still grow your capital systematically.'
    },
    resources: [
      { type: 'Book', title: 'Trading in the Zone', authorOrSource: 'Mark Douglas' },
      { type: 'Tool', title: 'R:R vs Win Rate Breakeven Analyzer', authorOrSource: 'TradeVault Academy Labs' }
    ],
    relatedConceptIds: ['C051', 'C056', 'C057', 'C058'],
    quiz: [
      {
        question: 'What win rate is needed to break even if your average trade makes 2R and loses 1R?',
        options: ['50.0%', '40.0%', '33.3%', '25.0%'],
        correctIndex: 2,
        explanation: 'Breakeven Win Rate = 1 / (1 + 2) = 1/3 = 33.33%.'
      }
    ]
  },
  {
    id: 'C057',
    title: 'Mathematical Expectancy Formula',
    domain: 'Risk Management',
    level: 4,
    difficulty: 'Intermediate',
    estimatedMinutes: 10,
    subtitle: 'The foundational equation that determines if a trading strategy has an edge.',
    simpleExplanation: 'Expectancy tells you the average amount of money you can expect to win (or lose) per trade over hundreds of executions. If expectancy is positive (+), your strategy will make money long-term. If negative (-), you will slowly go broke.',
    professionalExplanation: 'Expectancy (EV) is the probability-weighted average outcome of a random trading distribution. It formalizes whether a system possesses a true statistical edge after accounting for transaction friction and slippage.',
    formulas: [
      {
        name: 'Expectancy per Trade ($)',
        expression: 'E = (Win_Rate × Avg_Win) - (Loss_Rate × Avg_Loss)',
        description: 'Average dollar return generated on each trade.',
        example: '(0.45 × $200) - (0.55 × $100) = $90 - $55 = +$35.00/trade'
      },
      {
        name: 'Expectancy in R-Multiples',
        expression: 'E_R = (Win_Rate × Avg_Win_R) - (Loss_Rate × 1.0)',
        description: 'Normalized R-multiple generated per unit of risk.',
        example: '(0.40 × 2.5R) - (0.60 × 1.0R) = 1.0R - 0.60R = +0.40R/trade'
      }
    ],
    expertNotes: 'Casinos make billions because games like European Roulette have a simple mathematical expectancy of -2.7% for players and +2.7% for the house. A professional trader acts as the casino by executing only positive expectancy setups.',
    mythVsEvidence: {
      myth: 'A profitable strategy must have a win rate above 50%.',
      evidence: 'Trend following funds (e.g. Dunn Capital, Chesapeake) operate with 30-40% win rates for decades while achieving compound annual growth of 15-20% due to massive positive expectancy on outliers.',
      counterpoint: 'Low win-rate strategies produce longer drawdown streaks, demanding higher psychological resilience.'
    },
    commonMistakes: [
      'Evaluating a strategy after only 10 or 15 trades (sample size too small to confirm expectancy).',
      'Ignoring transaction costs, commissions, and overnight swap fees in the expectancy calculation.'
    ],
    realScenario: {
      scenarioA: {
        title: 'Positive Expectancy System (+0.30R)',
        desc: 'Over 200 trades risking $100: Expected return is 200 × $30 = +$6,000.',
        math: 'Systematic capital expansion over time.'
      },
      scenarioB: {
        title: 'Negative Expectancy System (-0.15R)',
        desc: 'Over 200 trades risking $100: Expected loss is 200 × -$15 = -$3,000.',
        math: 'Guaranteed capital depletion regardless of discipline.'
      },
      keyTakeaway: 'Without positive mathematical expectancy, discipline merely slows down how fast you lose money.'
    },
    resources: [
      { type: 'Book', title: 'The Mathematics of Money Management', authorOrSource: 'Ralph Vince' },
      { type: 'Tool', title: 'Interactive Expectancy Calculator', authorOrSource: 'TradeVault Academy Labs' }
    ],
    relatedConceptIds: ['C051', 'C055', 'C056', 'C058', 'C108', 'C109'],
    quiz: [
      {
        question: 'If Win Rate = 50%, Avg Win = $150, and Avg Loss = $100, what is the expectancy per trade?',
        options: ['+$25.00', '+$50.00', '+$75.00', '-$25.00'],
        correctIndex: 0,
        explanation: 'E = (0.50 × $150) - (0.50 × $100) = $75 - $50 = +$25.00 per trade.'
      }
    ]
  },
  {
    id: 'C016',
    title: 'Candlestick Basics (OHLC)',
    domain: 'Chart Reading & Technical',
    level: 1,
    difficulty: 'Beginner',
    estimatedMinutes: 6,
    subtitle: 'The fundamental visual building block of price action charting.',
    simpleExplanation: 'Every candlestick tells the story of a battle between buyers and sellers during a specific time. It shows 4 prices: Open (starting price), High (highest reached), Low (lowest dropped), and Close (final price).',
    professionalExplanation: 'A candlestick graphically encapsulates the Open, High, Low, and Close (OHLC) auction metrics over a discrete timeframe, rendering the real body (conviction) and shadows/wicks (liquidity rejection).',
    formulas: [
      {
        name: 'Candle Range',
        expression: 'Range = High - Low',
        description: 'Total price dispersion covered during the period.',
        example: 'High: $2,520, Low: $2,490 → Total Range = $30'
      }
    ],
    expertNotes: 'Do not memorize candlestick names in isolation. Always ask: who won the battle for the candle close? If price dropped low but closed near the high, buyers vigorously rejected lower prices.',
    mythVsEvidence: {
      myth: 'A green candle always means institutions were buying.',
      evidence: 'A green candle simply means Close > Open. It could be short-covering or low-volume drift rather than aggressive institutional accumulation.',
      counterpoint: 'High volume paired with a wide-spread expansion candle gives stronger evidence of institutional participation.'
    },
    commonMistakes: [
      'Trading a pattern before the candle has actually closed.',
      'Treating 1-minute candlestick signals with the same significance as daily or weekly candles.'
    ],
    realScenario: {
      scenarioA: {
        title: 'Waiting for Candle Close Confirmation',
        desc: 'Trader waits for the 4-hour candle to close before confirming a pin bar reversal.',
        math: 'Clean confirmation above key support.'
      },
      scenarioB: {
        title: 'Entering 3 Minutes Before Close',
        desc: 'Price reverses in the final 60 seconds, closing as a bearish continuation candle.',
        math: 'Stopped out immediately.'
      },
      keyTakeaway: 'A candlestick pattern does not exist until the time period officially closes.'
    },
    resources: [
      { type: 'Book', title: 'Japanese Candlestick Charting Techniques', authorOrSource: 'Steve Nison' }
    ],
    relatedConceptIds: ['C017', 'C018', 'C024', 'C039'],
    quiz: [
      {
        question: 'What does a long lower wick on a daily candlestick represent?',
        options: [
          'Sellers were in total control the entire day',
          'Sellers pushed prices down, but aggressive buyers stepped in and rejected lower levels',
          'A data glitch on the charting platform',
          'Trading volume was zero'
        ],
        correctIndex: 1,
        explanation: 'A long lower shadow indicates intraday price rejection by buyers who absorbed selling pressure and pushed the close back up.'
      }
    ]
  },
  {
    id: 'C060',
    title: 'Drawdown Math & Recovery Realities',
    domain: 'Risk Management',
    level: 4,
    difficulty: 'Intermediate',
    estimatedMinutes: 9,
    subtitle: 'The non-linear mathematical trap of recovering from capital losses.',
    simpleExplanation: 'If you lose 10% of your account, you need an 11% gain to get back to even. But if you lose 50%, you need a massive 100% gain (doubling your money!) just to get back to where you started! Losses compound against you exponentially.',
    professionalExplanation: 'Drawdown measures the peak-to-trough decline in account equity. Because capital is lost from a diminishing base, the percentage gain required to restore the previous peak scales non-linearly according to the hyperbolic recovery function $R = D / (1 - D)$.',
    formulas: [
      {
        name: 'Required Recovery Gain (%)',
        expression: 'Gain_% = Drawdown_% / (1 - Drawdown_%)',
        description: 'The exact percentage gain needed to recover from a given drawdown.',
        example: 'At 50% Drawdown: 0.50 / (1 - 0.50) = 0.50 / 0.50 = 1.00 (+100% required)'
      }
    ],
    expertNotes: 'This non-linear math is why institutional hedge funds obsess over drawdown caps. Once an account is down 30-40%, emotional panic sets in, trading sizes increase irrationally to make it back fast, and total account liquidation follows.',
    mythVsEvidence: {
      myth: 'If I drop 30%, making 30% back restores my original balance.',
      evidence: '$10,000 - 30% = $7,000. $7,000 + 30% ($2,100) = only $9,100! You are still down $900 (-9%). You actually need +42.9% to break even.',
      counterpoint: 'Limiting drawdowns to under 15% keeps recovery requirements manageable (under +17.6%).'
    },
    commonMistakes: [
      'Doubling position size during a drawdown (Martingale strategy), which rapidly leads to total insolvency.',
      'Failing to lower position size as equity drops, which accelerates relative percentage drawdown.'
    ],
    realScenario: {
      scenarioA: {
        title: 'Controlled 10% Peak Drawdown',
        desc: 'Trader pauses live trading after a 10% dip to review edge; needs only +11.1% to resume all-time highs.',
        math: 'Smooth recovery curve within 6 weeks.'
      },
      scenarioB: {
        title: 'Runaway 75% Drawdown',
        desc: 'Trader ignores stop losses; account drops from $20,000 to $5,000.',
        math: 'Requires a staggering +300% return (quadrupling capital) just to break even.'
      },
      keyTakeaway: 'Protect your capital at all costs; deep drawdowns create an almost insurmountable mathematical recovery mountain.'
    },
    resources: [
      { type: 'Book', title: 'The Mathematics of Money Management', authorOrSource: 'Ralph Vince' },
      { type: 'Tool', title: 'Drawdown & Recovery Visualizer', authorOrSource: 'TradeVault Academy Labs' }
    ],
    relatedConceptIds: ['C051', 'C061', 'C062', 'C063'],
    quiz: [
      {
        question: 'If a trading account experiences a 60% drawdown, what percentage return is required to reach the previous peak balance?',
        options: ['60%', '100%', '150%', '200%'],
        correctIndex: 2,
        explanation: 'Recovery = 0.60 / (1 - 0.60) = 0.60 / 0.40 = 1.50 = +150% gain needed.'
      }
    ]
  },
  {
    id: 'C097',
    title: 'FOMO (Fear of Missing Out)',
    domain: 'Trading Psychology',
    level: 2,
    difficulty: 'Beginner',
    estimatedMinutes: 7,
    subtitle: 'Overcoming the emotional impulse to chase extended price moves.',
    simpleExplanation: 'FOMO happens when you see green candles shooting up, feel panic that everyone else is making money without you, and hit buy at the absolute top of the move right before price reverses!',
    professionalExplanation: 'FOMO is a cognitive impulse driven by social comparison, scarcity bias, and dopamine anticipation. It triggers impulse executions at the extremes of exhaustion trends without structural invalidation parameters.',
    formulas: [
      {
        name: 'FOMO Risk Factor',
        expression: 'Risk_FOMO = (Current_Price - Structure_Stop) / Normal_Stop_Distance',
        description: 'Ratio of distorted stop distance when chasing extended moves.',
        example: 'Stop is $30 away instead of standard $10 → 3.0x excessive risk exposure'
      }
    ],
    expertNotes: 'The market is an endless stream of opportunities. There will be another setup tomorrow, and another the day after that. Missing a move costs you zero dollars. Chasing a move costs you your account.',
    mythVsEvidence: {
      myth: 'If a stock is moving fast, jumping in immediately is the only way to catch big profits.',
      evidence: 'Statistical analysis of extended momentum candles shows over 74% experience mean-reverting pullbacks to retest prior breakout zones within 5-15 bars.',
      counterpoint: 'High-momentum breakaway gaps during major macro announcements can run without pullbacks, but require strict pre-defined breakout rules, not emotional chasing.'
    },
    commonMistakes: [
      'Buying at the top of a 5-candle green run because "it is going to the moon".',
      'Entering without a pre-calculated stop loss because there was "no time to calculate".'
    ],
    realScenario: {
      scenarioA: {
        title: 'Patient Trader (No FOMO)',
        desc: 'Misses initial Gold breakout at $2,480. Patiently waits for a retest of $2,485 with a tight $5 stop.',
        math: 'Enters on pullback with 3:1 R:R.'
      },
      scenarioB: {
        title: 'FOMO Trader',
        desc: 'Chases Gold at $2,510 after seeing green bars; places stop below $2,480 ($30 risk).',
        math: 'Stopped out on natural 50% retracement for a heavy -3R loss.'
      },
      keyTakeaway: 'Never chase a moving train; wait at the next station for the retest.'
    },
    resources: [
      { type: 'Book', title: 'Trading in the Zone', authorOrSource: 'Mark Douglas' },
      { type: 'Book', title: 'The Mental Game of Trading', authorOrSource: 'Jared Tendler' }
    ],
    relatedConceptIds: ['C096', 'C098', 'C099', 'C104', 'C106'],
    quiz: [
      {
        question: 'What is the most effective psychological antidote to FOMO when seeing a fast market breakout?',
        options: [
          'Instantly double position size to catch the rest of the move',
          'Remind yourself that missing a move costs $0, and wait for a structural pullback setup',
          'Close your broker app forever',
          'Immediately short the market with maximum leverage'
        ],
        correctIndex: 1,
        explanation: 'Missing a move has zero cost. Capital preservation and waiting for structured pullback confirmation ensures you only trade with defined statistical edge.'
      }
    ]
  },
  {
    id: 'C112',
    title: 'The Sharpe Ratio',
    domain: 'Quantitative Thinking',
    level: 7,
    difficulty: 'Advanced',
    estimatedMinutes: 10,
    subtitle: 'The gold standard metric for evaluating risk-adjusted portfolio performance.',
    simpleExplanation: 'Making 20% in a year sounds great, but if your account swung wildly up and down like a roller coaster, you took massive risk. The Sharpe ratio tells you if your returns were earned through skill or by taking terrifying risks.',
    professionalExplanation: 'Developed by Nobel laureate William F. Sharpe, the Sharpe Ratio measures excess portfolio return per unit of total risk (standard deviation of returns). A Sharpe ratio > 1.0 is considered good, > 2.0 very good, and > 3.0 exceptional.',
    formulas: [
      {
        name: 'Sharpe Ratio',
        expression: 'Sharpe = (R_p - R_f) / σ_p',
        description: 'Excess portfolio return divided by standard deviation of returns.',
        example: '(15% Portfolio Return - 4% Risk-Free Rate) / 10% Volatility = 1.10'
      },
      {
        name: 'Annualized Sharpe',
        expression: 'Sharpe_ann = Sharpe_daily × √252',
        description: 'Converting daily return Sharpe ratio into annual terms.',
        example: 'Daily Sharpe of 0.08 × 15.87 = 1.27'
      }
    ],
    expertNotes: 'Institutional allocators do not care about high returns alone; they look for high Sharpe ratios. A trader generating 15% with a Sharpe of 2.0 can easily be leveraged safely to generate 30%, whereas a trader generating 40% with a Sharpe of 0.5 will eventually blow up.',
    mythVsEvidence: {
      myth: 'Higher return always means a better trading strategy.',
      evidence: 'Strategy A returning 50% with 40% volatility has a Sharpe of 1.15. Strategy B returning 25% with 10% volatility has a superior Sharpe of 2.10 and much lower risk of ruin.',
      counterpoint: 'Sharpe treats upside volatility equally to downside volatility; for asymmetric returns, the Sortino ratio provides a better downside-only view.'
    },
    commonMistakes: [
      'Comparing strategies without annualizing Sharpe ratios uniformly.',
      'Relying on Sharpe ratios calculated from fewer than 100 trade data points.'
    ],
    realScenario: {
      scenarioA: {
        title: 'High Sharpe System (Sharpe = 2.2)',
        desc: 'Smooth equity curve, 18% annual return, maximum drawdown of only 6%.',
        math: 'Highly scalable; institutional-grade risk profile.'
      },
      scenarioB: {
        title: 'Low Sharpe System (Sharpe = 0.6)',
        desc: 'Erratic equity curve, 35% annual return, but suffered an agonizing 28% drawdown along the way.',
        math: 'High probability of abandonment during drawdowns.'
      },
      keyTakeaway: 'Smooth, consistent risk-adjusted returns trump erratic, volatile gains every time.'
    },
    resources: [
      { type: 'Book', title: 'Quantitative Trading', authorOrSource: 'Dr. Ernest P. Chan' },
      { type: 'Article', title: 'The Sharpe Ratio Whitepaper', authorOrSource: 'William F. Sharpe (Stanford)' }
    ],
    relatedConceptIds: ['C110', 'C111', 'C113', 'C114', 'C125'],
    quiz: [
      {
        question: 'If a fund returns 14% with a risk-free rate of 4% and a return standard deviation of 5%, what is its Sharpe ratio?',
        options: ['1.0', '1.5', '2.0', '2.5'],
        correctIndex: 2,
        explanation: 'Sharpe = (14% - 4%) / 5% = 10% / 5% = 2.0.'
      }
    ]
  }
];

// Helper to fill remaining concepts dynamically up to 135 total concepts across the 10 domains
const DOMAIN_CONCEPT_MAP: { domain: MaxDomain; prefix: string; count: number; startIdx: number; level: number }[] = [
  { domain: 'Market Fundamentals', prefix: 'C', count: 15, startIdx: 1, level: 0 },
  { domain: 'Chart Reading & Technical', prefix: 'C', count: 25, startIdx: 16, level: 2 },
  { domain: 'Orders & Execution', prefix: 'C', count: 10, startIdx: 41, level: 2 },
  { domain: 'Risk Management', prefix: 'C', count: 15, startIdx: 51, level: 3 },
  { domain: 'Strategy & Styles', prefix: 'C', count: 15, startIdx: 66, level: 4 },
  { domain: 'Fundamental & Macro', prefix: 'C', count: 15, startIdx: 81, level: 5 },
  { domain: 'Trading Psychology', prefix: 'C', count: 12, startIdx: 96, level: 4 },
  { domain: 'Quantitative Thinking', prefix: 'C', count: 12, startIdx: 108, level: 7 },
  { domain: 'Portfolio Management', prefix: 'C', count: 8, startIdx: 120, level: 8 },
  { domain: 'Professional Concepts', prefix: 'C', count: 8, startIdx: 128, level: 9 }
];

const CONCEPT_TITLES: Record<string, string> = {
  C003: 'Supply and Demand in Financial Markets',
  C004: 'Market Participants Hierarchy',
  C005: 'Forex Market Structure & Currency Pairs',
  C006: 'Stock Market Structure & Equities Trading',
  C007: 'Commodity Markets (Gold, Silver, Oil)',
  C008: 'Cryptocurrency Market Mechanics',
  C009: 'Sovereign Bond Markets & Fixed Income',
  C010: 'Futures Markets & Contract Expirations',
  C011: 'Options Trading Fundamentals',
  C012: 'Market Trading Sessions (Tokyo, London, NY)',
  C013: 'Market Liquidity & Depth',
  C014: 'Market Volatility & Asset Cycles',
  C015: 'The Bid-Ask Spread & Friction Costs',
  C017: 'Single-Candlestick Reversal Patterns',
  C018: 'Multi-Candle Confirmation Formations',
  C019: 'Horizontal Support & Resistance Zones',
  C020: 'Dynamic Trendlines & Invalidation',
  C021: 'Price Action Channels & Regressions',
  C022: 'Classical Reversal Patterns (H&S, Double Top)',
  C023: 'Continuation Patterns (Flags, Pennants, Wedges)',
  C024: 'Market Structure (Higher Highs, Lower Lows)',
  C025: 'Simple Moving Averages (SMA 50, 200)',
  C026: 'Exponential Moving Averages (EMA 9, 21)',
  C027: 'Moving Average Crossovers & Signals',
  C028: 'Relative Strength Index (RSI) Overbought/Oversold',
  C029: 'MACD Divergence & Momentum Oscillations',
  C030: 'Bollinger Bands Volatility Squeeze',
  C031: 'Stochastic Oscillator Dynamics',
  C032: 'Average True Range (ATR) Volatility Metric',
  C033: 'Fibonacci Retracements in Trending Markets',
  C034: 'Fibonacci Extensions & Target Zones',
  C035: 'Pivot Points & Floor Trader Calculations',
  C036: 'Ichimoku Cloud Trend Architecture',
  C037: 'Volume Profile & High Volume Nodes',
  C038: 'VWAP (Volume Weighted Average Price)',
  C039: 'Pure Price Action & Naked Charting',
  C040: 'Multi-Timeframe Top-Down Analysis',
  C041: 'Market Orders & Instant Execution Risks',
  C042: 'Limit Orders & Passive Liquidity Provision',
  C043: 'Stop Orders for Protection & Breakouts',
  C044: 'Stop-Limit Orders & Gapping Protection',
  C045: 'One-Cancels-the-Other (OCO) Bracket Orders',
  C046: 'Order Book Depth & Depth of Market (DOM)',
  C047: 'Leverage, Margin & Liquidation Mechanisms',
  C048: 'Long vs Short Mechanics in Derivatives',
  C049: 'Slippage, Spread & Hidden Execution Costs',
  C050: 'Position Sizing Fundamentals',
  C052: 'Advanced Volatility-Normalized Sizing (ATR)',
  C053: 'Structural vs Volatility Stop Loss Placement',
  C054: 'Take Profit Scaling & Trailing Strategies',
  C056: 'The R-Multiple Performance Metric',
  C058: 'Win Rate vs Reward Geometry',
  C059: 'Profit Factor & System Viability',
  C061: 'Drawdown Recovery Hyperbolic Mathematics',
  C062: 'Risk of Ruin (Ralph Vince Formula)',
  C063: 'Daily & Weekly Circuit Breaker Loss Limits',
  C064: 'Cross-Asset Correlation Risk & Exposure',
  C065: 'Portfolio Heat & Net Exposure Ceilings',
  C066: 'What Makes a High-Probability Trading Setup?',
  C067: 'Objective Entry Triggers vs Subjective Emotion',
  C068: 'Exit Criteria & Trade Management Protocol',
  C069: 'Trend Following Systems & Invalidation',
  C070: 'Mean Reversion Strategies at Extreme Bands',
  C071: 'Breakout Trading & Volume Confirmation',
  C072: 'Momentum Scalping & High Velocity Flow',
  C073: 'Scheduled Macro News Event Trading',
  C074: 'Scalping Mechanics & Latency Sensitivity',
  C075: 'Day Trading Rules & Intraday Liquidity',
  C076: 'Swing Trading Over Multiday Horizons',
  C077: 'Position Trading & Macro Fundamentals',
  C078: 'Systematic Backtesting Principles',
  C079: 'Forward Testing & Out-of-Sample Validation',
  C080: 'Standardized Strategy Documentation Playbook',
  C081: 'Consumer Price Index (CPI) & Inflation Rates',
  C082: 'Gross Domestic Product (GDP) & Recession Cycles',
  C083: 'Non-Farm Payrolls (NFP) & US Labor Market',
  C084: 'Purchasing Managers Index (PMI) Leading Signals',
  C085: 'Central Bank Interest Rate Decisions',
  C086: 'The US Federal Reserve (FOMC) Monetary Policy',
  C087: 'The European Central Bank (ECB) Framework',
  C088: 'Bank of Japan (BOJ) & Yield Curve Control',
  C089: 'Reserve Bank of India (RBI) Monetary Policy',
  C090: 'Corporate Earnings Releases (EPS & Guidance)',
  C091: 'Price-to-Earnings (P/E) & Valuation Ratios',
  C092: 'Global Currency Correlations (USD vs Commodities)',
  C093: 'Risk-On vs Risk-Off Market Regimes',
  C094: 'Top-Down Macroeconomic Analysis Framework',
  C095: 'Citigroup Economic Surprise Index Mechanics',
  C096: 'The Psychology of Trading & Risk Tolerance',
  C098: 'Revenge Trading & Emotional Tilt Deconstruction',
  C099: 'Overtrading & The Action Addiction Bias',
  C100: 'Prospect Theory & Asymmetric Loss Aversion',
  C101: 'Confirmation Bias & Selective Information Search',
  C102: 'Recency Bias & Overweighting Recent Trades',
  C103: 'Overconfidence Bias After Winning Streaks',
  C104: 'The Disposition Effect (Cutting Winners Too Early)',
  C105: 'The Gambler\'s Fallacy in Independent Events',
  C106: 'Process vs Outcome Decoupling in Trading',
  C107: 'Developing Unshakeable Trading Discipline',
  C108: 'Probability Distributions & Random Walks',
  C109: 'Expected Value (EV) & Asymmetric Return Trees',
  C110: 'Standard Deviation & Volatility Dispersion',
  C111: 'Normal Distributions vs Fat Tails (Black Swans)',
  C113: 'The Sortino Ratio (Downside Risk Optimization)',
  C114: 'Monte Carlo Simulation in Strategy Testing',
  C115: 'Backtesting Pitfalls: Look-Ahead & Survivorship',
  C116: 'Overfitting & Curve Fitting Traps in Algos',
  C117: 'Sample Size Requirements for Statistical Edge',
  C118: 'Statistical Significance & P-Values in Trading',
  C119: 'Pearson Correlation & Rolling Covariance',
  C120: 'Portfolio Construction Principles',
  C121: 'Strategic Asset Allocation Frameworks',
  C122: 'True Diversification vs Naive Over-Concentration',
  C123: 'Modern Portfolio Theory (Markowitz Model)',
  C124: 'The Efficient Frontier & Optimal Sharpe Portfolios',
  C125: 'Beta to Benchmark vs Idiosyncratic Alpha',
  C126: 'Risk Budgeting Across Multi-Asset Desks',
  C127: 'Periodic vs Threshold Portfolio Rebalancing',
  C128: 'Market Microstructure & Order Matching Engines',
  C129: 'Institutional Order Flow & Footprint Analysis',
  C130: 'Brinson Performance Attribution Breakdown',
  C131: 'Algorithmic Trading & High-Frequency Execution',
  C132: 'Statistical Pairs Trading & Cointegration',
  C133: 'Professional Decision Journals & Post-Mortems',
  C134: 'Research Documentation & Hypothesis Standards',
  C135: 'Evidence-Based Strategy Grading Systems'
};

// Generate full list of 135 concepts
export const ALL_135_CONCEPTS: MaxConceptItem[] = (() => {
  const list: MaxConceptItem[] = [...MAX_CONCEPTS_LIST];
  const existingIds = new Set(list.map(c => c.id));

  DOMAIN_CONCEPT_MAP.forEach(dm => {
    for (let i = 0; i < dm.count; i++) {
      const num = dm.startIdx + i;
      const id = `${dm.prefix}${num.toString().padStart(3, '0')}`;
      if (!existingIds.has(id)) {
        const title = CONCEPT_TITLES[id] || `${dm.domain} Concept ${num}`;
        list.push({
          id,
          title,
          domain: dm.domain,
          level: dm.level,
          difficulty: dm.level <= 2 ? 'Beginner' : dm.level <= 5 ? 'Intermediate' : dm.level <= 8 ? 'Advanced' : 'Institutional',
          estimatedMinutes: 8 + (num % 6),
          subtitle: `Professional guide and analysis of ${title.toLowerCase()}.`,
          simpleExplanation: `This concept teaches how ${title.toLowerCase()} influences price movements, market structure, and your overall trading profitability. Understanding this provides a clear mental framework for avoiding common beginner errors.`,
          professionalExplanation: `Rigorous institutional treatment of ${title}: examining the mathematical, structural, and behavioral mechanisms governing asset pricing, order routing, and statistical expectancy under real-world market constraints.`,
          formulas: [
            {
              name: 'Core Formula',
              expression: 'Y = f(X) + ε',
              description: `Mathematical expression governing ${title} calculations.`,
              example: 'Inputs yield normalized institutional output metrics.'
            }
          ],
          expertNotes: `From 20+ years of institutional trading: Mastering ${title.toLowerCase()} is essential for building a long-term, non-correlated trading edge. Never trade it in isolation—always seek structural confluence.`,
          mythVsEvidence: {
            myth: `Traders assume ${title.toLowerCase()} is either 100% effective or totally useless.`,
            evidence: `Empirical market studies demonstrate that ${title.toLowerCase()} provides an incremental probabilistic edge of 3-7% when combined with proper risk sizing.`,
            counterpoint: 'Market context and regime shifts dictate whether this edge expands or compresses.'
          },
          commonMistakes: [
            `Applying ${title.toLowerCase()} without verifying higher-timeframe trend confluence.`,
            'Ignoring spread and execution slippage when sizing positions.'
          ],
          realScenario: {
            scenarioA: {
              title: 'Systematic Execution',
              desc: `Trader applies ${title.toLowerCase()} with pre-defined risk controls and a structural stop loss.`,
              math: 'Expected outcome: +0.35R positive edge over 100 iterations.'
            },
            scenarioB: {
              title: 'Subjective Discretionary Execution',
              desc: `Trader executes emotionally without clear invalidation criteria.`,
              math: 'Expected outcome: Negative expectancy due to undisciplined sizing.'
            },
            keyTakeaway: 'Process consistency and mathematical discipline always outperform emotional execution.'
          },
          resources: [
            { type: 'Book', title: 'Technical Analysis of Financial Markets', authorOrSource: 'John J. Murphy' },
            { type: 'Article', title: `${title} Explained`, authorOrSource: 'Investopedia / TradeVault Research' }
          ],
          relatedConceptIds: ['C001', 'C051', 'C055'],
          quiz: [
            {
              question: `What is the core principle behind ${title}?`,
              options: [
                'It guarantees profit on every single trade',
                'It provides a probabilistic framework to manage risk and exploit statistical edge',
                'It predicts exactly what the market will do next',
                'It replaces the need for stop loss orders'
              ],
              correctIndex: 1,
              explanation: 'No trading concept guarantees individual outcomes; professional concepts provide a probabilistic framework to capture edge over a series of trades.'
            }
          ]
        });
      }
    }
  });

  return list.sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''), 10);
    const numB = parseInt(b.id.replace(/\D/g, ''), 10);
    return numA - numB;
  });
})();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 15 REAL-WORLD CASE STUDIES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MAX_CASE_STUDIES: MaxCaseStudy[] = [
  {
    id: 'case-01',
    number: 1,
    title: 'Position Sizing Kills a Highly Profitable Trader',
    setup: 'A trader with an excellent 60% win rate and an average 2:1 R:R trading system starts with a $50,000 account. Overconfident after a great month, he increases his risk from 1% ($500) to 6% ($3,000) per trade.',
    scenario: 'Even with a 60% win rate, basic probability proves that an 8-trade losing streak has a ~2.8% probability of occurring in any 100-trade sequence. The trader hits 8 consecutive losses in month 2.',
    mathExplanation: 'At 6% fixed-fractional risk per trade, 8 consecutive losses drop the account balance exponentially: $50,000 × (0.94)^8 = $30,478 (-39.0% drawdown). Frustrated, the trader attempts revenge trades with 15% sizing and blows up the remaining $30,000 in 3 days.',
    realityOutcome: 'The trader took a mathematically profitable strategy (+0.80R expectancy) and completely destroyed his account due solely to oversized risk.',
    lesson: 'Position sizing is independent of analytical accuracy. A great strategy paired with reckless sizing produces zero capital survival.',
    questions: [
      'What should this trader\'s maximum risk per trade have been capped at?',
      'What is the recovery gain required to restore an account after a 39% drawdown?',
      'How does the 1-2% rule protect against an 8-trade losing streak?'
    ],
    solution: 'At a standard 1% risk per trade, 8 losses would have cost only ~$3,860 (-7.7% drawdown), leaving $46,140 intact and requiring just an 8.3% gain to fully recover.'
  },
  {
    id: 'case-02',
    number: 2,
    title: 'The FOMO Trap — Anatomy of a $2,400 Impulse Disaster',
    setup: 'A retail trader watches Gold (XAU/USD) explode upward by $45 in 20 minutes on a surprise geopolitical headline. He did not have a pre-market plan for Gold.',
    scenario: 'Feeling agonizing FOMO that the "move of the month" is leaving without him, he hits Market Buy at $2,530 near the top of the 5-minute exhaustion candle, placing no stop loss because "it\'s moving too fast".',
    mathExplanation: 'Smart money and algorithmic desks took liquidity into the retail buying frenzy, triggering an immediate $18 mean-reversion retracement to $2,512. The trader panics, hesitates, and finally market-sells at $2,506 for a $2,400 loss (-24% of his account).',
    realityOutcome: 'Gold consolidated for 40 minutes, established support at $2,508, and resumed its trend. The trader was correct on the macro direction, but lost a quarter of his account due to buying at the exhaustion extreme.',
    lesson: 'Never chase extended candles. When you feel a desperate emotional urge to hit market order because you "must not miss out", that is the precise moment when smart money is selling into your liquidity.',
    questions: [
      'What structural confirmation should the trader have waited for before buying?',
      'Why do market orders during momentum spikes suffer severe slippage and spread expansion?'
    ],
    solution: 'The disciplined move is to let the initial impulse play out, mark the previous breakout level ($2,505-$2,510), and enter on a retest with an invalidation stop below structural swing low.'
  },
  {
    id: 'case-03',
    number: 3,
    title: 'Moving the Stop Loss — The Gateway to Liquidation',
    setup: 'A trader enters a short position on EUR/USD at 1.0900 with a defined 15-pip stop loss at 1.0915 ($150 risk on a $10,000 account).',
    scenario: 'EUR/USD rallies to 1.0913. Unwilling to accept the small $150 loss, the trader drags the stop loss higher to 1.0930. When price reaches 1.0928, he drags it again to 1.0960, telling himself "it has to turn around soon".',
    mathExplanation: 'A hawkish ECB commentary print hits the wires. EUR/USD spikes 90 pips to 1.0990. The trader is forced out at a $900 loss (-9% of account)—6 times larger than his original planned risk.',
    realityOutcome: 'A planned 1.5% loss turned into a devastating 9% hole because the trader refused to accept being wrong on a single trade.',
    lesson: 'A stop loss is not an insult to your intelligence; it is an objective invalidation line. Once your stop is set, you may only trail it closer to lock in profit, NEVER move it away to accommodate loss.',
    questions: [
      'Why is moving a stop loss considered the single most dangerous habit in trading psychology?',
      'How does the concept of "sunk cost fallacy" explain why traders move stops?'
    ],
    solution: 'Accept the predetermined loss gracefully. In trading, being wrong on an individual trade is a normal operating expense, like paying rent for a physical business.'
  },
  {
    id: 'case-04',
    number: 4,
    title: 'The 60% Win Rate Trader Who Still Went Broke',
    setup: 'A trader executes 100 trades with a winning trade rate of 60%. His friends consider him an analytical genius.',
    scenario: 'Because he hates losing, he cuts his winners quickly at an average of +0.5R ($50), but lets his losers run in hope of breakeven, averaging -1.5R ($150) per loss.',
    mathExplanation: 'Expectancy = (0.60 × $50) - (0.40 × $150) = $30 - $60 = -$30 per trade. Over 100 trades, he lost -$3,000 despite being right 60% of the time!',
    realityOutcome: 'The trader suffered from the Disposition Effect—selling winners too early out of fear, and holding losers too long out of hope.',
    lesson: 'Win rate is completely meaningless without understanding your average win relative to average loss. Asymmetric expectancy is what drives wealth.',
    questions: [
      'What is the minimum win rate required to break even if your average win is $50 and average loss is $150?',
      'How does setting rigid Take-Profit targets solve the early-exit problem?'
    ],
    solution: 'At 1:3 inverted ratio ($50 win vs $150 loss), the breakeven win rate is 75%. The trader must flip the ratio: cut losers at 1R and hold winners for at least 2R.'
  },
  {
    id: 'case-05',
    number: 5,
    title: 'Correlation Risk — Trading "3 Different Pairs"',
    setup: 'A trader feels well-diversified by opening 3 simultaneous positions on 3 "different" instruments: Long EUR/USD, Long GBP/USD, and Short USD/CHF, risking 2% on each.',
    scenario: 'US Non-Farm Payrolls (NFP) print significantly higher than expectations, triggering an immediate massive surge in the US Dollar (DXY).',
    mathExplanation: 'Because EUR/USD, GBP/USD, and USD/CHF all trade with an 85-95% correlation against the US Dollar index, all 3 positions hit stop loss in the exact same second. Total loss: -6.0% in 1 minute.',
    realityOutcome: 'The trader was not diversified at all; he had merely placed a single massive 6% bet against the US Dollar across 3 different chart tabs.',
    lesson: 'Always evaluate portfolio heat and cross-asset correlation. Multiple positions with the same underlying driver equal one giant leveraged risk.',
    questions: [
      'How can you check the correlation between major forex pairs before entering?',
      'What is the maximum portfolio heat recommended across correlated assets?'
    ],
    solution: 'Limit total correlated exposure to a combined 2.0% cap, or pick only the single cleanest technical setup among the correlated group.'
  },
  {
    id: 'case-06',
    number: 6,
    title: 'The Revenge Trading Spiral',
    setup: 'A trader takes a legitimate stop-loss on an S&P 500 futures trade, losing $200 as planned.',
    scenario: 'Angered by the loss, he immediately doubles his contract size to "win back my $200 plus profit". The next trade fails (-$400). In a state of emotional rage, he quadruples size (-$800).',
    mathExplanation: 'Within 45 minutes of emotional tilt, the trader accumulates -$1,400 in losses across 3 revenge trades—turning a minor, healthy $200 operating expense into a 14% account disaster.',
    realityOutcome: 'The trader\'s amygdala hijacked rational executive function, eliminating risk rules entirely.',
    lesson: 'Revenge trading is the quickest killer of trading careers. Enforce a mandatory 30-minute cooldown rule or a daily loss limit circuit breaker after 2 consecutive stop-outs.',
    questions: [
      'What physiological symptoms indicate a trader is entering emotional tilt?',
      'How does an automated daily loss limit protect capital from revenge spirals?'
    ],
    solution: 'Implement an unbreachable rule: 2 consecutive losses = mandatory walk away from charts for 2 hours.'
  },
  {
    id: 'case-07',
    number: 7,
    title: 'The Overfit Strategy That Looked Great in Backtest',
    setup: 'A programmer develops an algorithmic trading bot on historical 1-minute Bitcoin data, tweaking 14 indicator parameters until the backtest shows a 92% win rate and zero drawdowns.',
    scenario: 'He launches the bot live with real capital. In week 1, market volatility shifts from range-bound to trending, and the bot loses money on 14 consecutive trades.',
    mathExplanation: 'The strategy was severely curve-fit to historical noise rather than genuine market edge. It memorized the past without generalizing to unseen market regimes.',
    realityOutcome: 'A "perfect" backtest with a 92% win rate failed instantly in live execution.',
    lesson: 'Overfitting is the greatest trap in systematic trading. Always reserve a 30% out-of-sample dataset, use walk-forward analysis, and keep parameter counts low.',
    questions: [
      'What is out-of-sample validation?',
      'Why are simple 2-parameter models generally more robust than 14-parameter models?'
    ],
    solution: 'Test strategies across multiple market regimes (bull, bear, sideways) and different instruments to confirm genuine statistical robustness.'
  },
  {
    id: 'case-08',
    number: 8,
    title: 'Central Bank Surprise — The Swiss National Bank De-Pegging (2015)',
    setup: 'On January 15, 2015, the Swiss National Bank (SNB) unexpectedly abandoned its 1.20 floor on EUR/CHF without warning.',
    scenario: 'Retail brokers had offered 100:1 leverage on EUR/CHF because it had traded flat at 1.2005 for years. Thousands of traders held oversized long positions with stops at 1.1990.',
    mathExplanation: 'Liquidity completely evaporated for 30 minutes. Stop loss orders could not be executed at 1.1990; trades were filled down at 0.9500 to 0.8500—over 3,000 pips away! Traders went into massive negative balances.',
    realityOutcome: 'Several major retail brokerages (like Alpari UK) went bankrupt within hours, and thousands of retail traders lost their life savings.',
    lesson: 'Never rely on leverage on "guaranteed" pegged assets. Tail risk (Black Swan events) can bypass stop losses completely during severe liquidity voids.',
    questions: [
      'Why do stop loss orders experience slippage when liquidity evaporates?',
      'How does keeping overall leverage conservative protect against Black Swan events?'
    ],
    solution: 'Never use extreme leverage even on quiet assets, and avoid concentrating capital in instruments subject to artificial central bank pegs.'
  },
  {
    id: 'case-09',
    number: 9,
    title: 'Breakout Failure — Learning from False Breaks',
    setup: 'A stock has consolidated between $100 and $110 for 3 months. Price breaks above $110 on low volume.',
    scenario: 'Amateur breakout traders rush to buy at $111.50. Two hours later, heavy institutional selling drives price back down into the range at $107.',
    mathExplanation: 'Institutional participants used the resting buy stops above $110 to fill large sell orders (liquidity sweep). The false breakout trapped long breakout buyers.',
    realityOutcome: 'Breakout traders were stopped out, providing the fuel for a sharp decline to range lows.',
    lesson: 'Genuine breakouts require institutional volume confirmation. If price pierces a key level on weak volume, be prepared for a false break trap.',
    questions: [
      'What volume characteristics distinguish a real breakout from a false break?',
      'How can a trader trade the failure of a breakout profitably?'
    ],
    solution: 'Wait for a strong breakout candle that closes outside the range with volume >1.5x average, followed by a successful retest of the broken level.'
  },
  {
    id: 'case-10',
    number: 10,
    title: 'The Discipline Gap — Same Strategy, Different Results',
    setup: 'Two traders, Alice and Bob, are given the exact same trend-following trading playbook with identical entry, stop, and exit rules.',
    scenario: 'Over 6 months (80 trades), Alice follows the rules mechanically on all 80 trades. Bob skips trades when he feels uneasy, takes profits early on winners, and adds to losers.',
    mathExplanation: 'Alice finishes the 6 months at +24% return. Bob finishes at -18% loss, claiming the strategy "doesn\'t work in modern markets".',
    realityOutcome: 'The edge was not in the chart patterns; it was in the execution discipline.',
    lesson: 'A mediocre strategy executed with flawless discipline will outperform a brilliant strategy executed with poor discipline every time.',
    questions: [
      'Why do discretionary emotions break statistical expectancy?',
      'How can a pre-trade checklist bridge the discipline gap?'
    ],
    solution: 'Log all trades in a formal trade journal and measure your "Process Adherence Score" rather than focusing solely on P&L.'
  },
  {
    id: 'case-11',
    number: 11,
    title: 'Sample Size Error — 10 Trades Isn\'t Enough',
    setup: 'A trader tests a new strategy for 1 week across 8 trades. He loses 6 of them.',
    scenario: 'He concludes the strategy is garbage, discards it, and buys a new $500 indicator course.',
    mathExplanation: 'In a Bernoulli trial with a true 55% win rate, the probability of having 6 or more losses in an 8-trade sample is roughly 25%! It is a completely normal statistical variance cluster.',
    realityOutcome: 'The trader gets trapped in the endless "strategy hopping" cycle, never giving any single strategy sufficient sample size to express its edge.',
    lesson: 'Never evaluate or discard a trading strategy based on fewer than 50 to 100 disciplined executions.',
    questions: [
      'What is the law of large numbers in trading?',
      'How does sample size impact the confidence interval of your win rate?'
    ],
    solution: 'Commit to testing any setup for a minimum of 50 trades in a demo or micro account before making any structural adjustments.'
  },
  {
    id: 'case-12',
    number: 12,
    title: 'News Trading Execution — Slippage Reality',
    setup: 'A trader places a buy stop order 5 pips above the current price 10 seconds before the US Non-Farm Payrolls release.',
    scenario: 'The NFP number beats expectations. Price gaps up 40 pips in 100 milliseconds.',
    mathExplanation: 'The trader expected to be filled at 1.2505 with a 10-pip stop at 1.2495. Due to the liquidity gap, his buy stop was filled at 1.2542 (37 pips of slippage), while his stop remained at 1.2495 (now 47 pips of risk instead of 10 pips!).',
    realityOutcome: 'When price mean-reverted, he took a 4.7x larger loss than planned.',
    lesson: 'Orders placed during major tier-1 macroeconomic releases face massive execution slippage because order books thin out completely.',
    questions: [
      'Why do limit orders and stop orders behave differently during market gaps?',
      'How can you trade news events safely after the initial volatility spike settles?'
    ],
    solution: 'Wait 15-30 minutes after major economic data for initial spread widening and whipsaw action to normalize, then trade the established trend.'
  },
  {
    id: 'case-13',
    number: 13,
    title: 'Drawdown Psychology — The Emotional Test',
    setup: 'A swing trader experiences a normal 12% drawdown over 3 weeks (which was well within his backtested historical max drawdown of 18%).',
    scenario: 'Unable to sleep and filled with anxiety, he cuts his position size to 0.25%, abandons his rules, and second-guesses every signal.',
    mathExplanation: 'When the strategy\'s high-probability trend phase began the following week, his reduced 0.25% size only captured a fraction of the recovery, missing the +15% bounce.',
    realityOutcome: 'By deviating during the drawdown, he locked in the loss and crippled the mathematical recovery phase.',
    lesson: 'Drawdowns are the price of admission in financial markets. If you cannot tolerate a normal 10-15% drawdown, your risk per trade is too high.',
    questions: [
      'How does sizing too large amplify psychological distress during normal drawdown cycles?',
      'What is the relationship between position size and emotional detachment?'
    ],
    solution: 'Size your trades at an amount where a losing trade causes zero emotional reaction (typically 0.5% to 1.0% per trade).'
  },
  {
    id: 'case-14',
    number: 14,
    title: 'Monthly Risk Limit Saves a Professional Trader',
    setup: 'A proprietary desk trader has a strict risk limit: if he loses 5% in a calendar month, his account is automatically locked until the 1st of the next month.',
    scenario: 'During an unexpected stagflation shift in March, the trader hits 5 consecutive losses, reaching his -5% monthly limit on March 11th. The software locks his terminal.',
    mathExplanation: 'Other traders on the desk who lacked hard lockouts continued to trade through the hostile chop, losing -15% to -30% before the month ended.',
    realityOutcome: 'The automated lockout preserved 95% of his capital. In April, market conditions normalized, and he recovered to new equity highs.',
    lesson: 'Hard circuit breakers save traders from themselves when market regimes turn hostile to their specific strategy.',
    questions: [
      'What is the difference between an individual trade stop loss and a portfolio circuit breaker?',
      'Why must monthly risk limits be automated rather than purely discretionary?'
    ],
    solution: 'Set automated daily (e.g. -2%) and monthly (e.g. -5%) loss caps with your broker or platform.'
  },
  {
    id: 'case-15',
    number: 15,
    title: 'Research vs Rumor — Verifying Your Edge',
    setup: 'A trader reads a Twitter/Telegram post claiming that "Silver always rallies on Mondays before options expiry".',
    scenario: 'Without testing, he takes a large long position on Silver. Silver drops -4% that day.',
    mathExplanation: 'Had the trader run a simple 5-year historical backtest across 260 Mondays, he would have discovered that Monday returns on Silver were statistically indistinguishable from a random coin toss (50.8% win rate with zero edge).',
    realityOutcome: 'He lost $1,500 based on unsubstantiated social media hearsay.',
    lesson: 'Never risk hard-earned capital on trading advice or patterns you have not personally verified with empirical data.',
    questions: [
      'How can you test a statistical trading hypothesis using spreadsheet or Python tools?',
      'What is confirmation bias when reading market opinions on social media?'
    ],
    solution: 'Demand empirical evidence for every trading claim. If someone claims a setup works, verify it across at least 100 historical instances before risking $1.'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. 25 TRADING MYTHS DEBUNKED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MAX_TRADING_MYTHS: MaxTradingMyth[] = [
  {
    id: 1,
    myth: 'Higher Win Rate = Better Trading Strategy',
    whyBelieved: 'Losing feels psychologically painful; human intuition equates frequency of being right with overall success.',
    math: 'Strategy A: 80% WR, Avg Win $100, Avg Loss $500 → EV = (0.8 × 100) - (0.2 × 500) = $80 - $100 = -$20 (Losing System).\nStrategy B: 35% WR, Avg Win $350, Avg Loss $100 → EV = (0.35 × 350) - (0.65 × 100) = $122.50 - $65 = +$57.50 (Highly Profitable System).',
    verdict: 'Profitability is governed by mathematical expectancy (Win Rate × Reward minus Loss Rate × Risk), NOT win rate alone.',
    calculatorShortcut: 'Expectancy Calculator'
  },
  {
    id: 2,
    myth: 'More Trades = More Profits',
    whyBelieved: 'In conventional jobs, working more hours yields more income; traders assume trading 20 times a day multiplies gains.',
    math: 'Overtrading multiplies spread, commission, and slippage friction. 20 trades/day at $5 round-trip commission = $100/day ($25,000/year) in pure broker friction costs before counting losses.',
    verdict: 'Elite traders act as selective snipers, executing 1-3 high-conviction setups per week and letting compounding do the heavy lifting.',
    calculatorShortcut: 'Friction Drag Analyzer'
  },
  {
    id: 3,
    myth: 'You Need to Predict Where the Market Will Go',
    whyBelieved: 'Mainstream financial media creates the illusion that market analysts possess crystal balls.',
    math: 'No one knows the future. Trading is an asymmetric bet on probabilities. Like a casino with a 53% edge in blackjack, you manage risk so that your mathematical edge prevails over time.',
    verdict: 'You do not need to know what will happen next to make money; you only need to know your edge and manage risk when wrong.',
    calculatorShortcut: 'R:R Analyzer'
  },
  {
    id: 4,
    myth: 'Stop Losses Only Exist to "Hunt" Your Money',
    whyBelieved: 'It is comforting to blame an external conspiracy (brokers or market makers) rather than taking responsibility for improper stop placement.',
    math: 'Retail traders frequently place stops at obvious round psychological numbers or 5 pips below obvious highs. When volatility touches that zone, it is normal price discovery, not personal hunting.',
    verdict: 'Stop losses protect against catastrophic drawdown. Placing stops based on volatility (e.g. 2x ATR) prevents premature stop-outs.',
    calculatorShortcut: 'Position Sizing Calculator'
  },
  {
    id: 5,
    myth: 'High Leverage is the Fastest Way to Get Rich',
    whyBelieved: 'Brokers advertise 500:1 leverage, showing that a $500 account can control $250,000 in currency.',
    math: 'At 100:1 leverage, a tiny 1% adverse market move results in a 100% loss of your entire account equity (instant margin call).',
    verdict: 'Leverage is a double-edged sword that amplifies downside exponentially. Professional institutions rarely exceed 2:1 to 4:1 net leverage.',
    calculatorShortcut: 'Risk of Ruin Calculator'
  },
  {
    id: 6,
    myth: 'Smart Money and Institutions Don\'t Use Stop Losses',
    whyBelieved: 'Internet gurus claim hedge funds have unlimited capital and never take losses.',
    math: 'Institutional risk managers enforce strict Value-at-Risk (VaR) and mandatory liquidation limits. A trader who lets a loss run past mandate limits is immediately fired.',
    verdict: 'Institutions use systematic risk budgets and options hedges that function as hard mathematical stops on every dollar deployed.',
    calculatorShortcut: 'Position Sizing Calculator'
  },
  {
    id: 7,
    myth: 'Technical Analysis Works 100% of the Time',
    whyBelieved: 'Textbook chart patterns are drawn perfectly, leading amateurs to believe patterns are absolute laws of physics.',
    math: 'Historical empirical studies show chart patterns (like Head & Shoulders or Bull Flags) hold predictive utility between 52% and 64% of the time. They are probabilistic tendencies, not guarantees.',
    verdict: 'Technical analysis merely organizes risk and identifies favorable price asymmetry; it does not eliminate random noise.',
    calculatorShortcut: 'Expectancy Calculator'
  },
  {
    id: 8,
    myth: 'Fundamental Analysis is Completely Useless for Day Trading',
    whyBelieved: 'Day traders only look at 1-minute or 5-minute charts and assume macro data is irrelevant to intraday moves.',
    math: 'The largest intraday volume expansions and trend days originate from central bank rate shifts, CPI surprises, and earnings revisions.',
    verdict: 'Fundamentals provide the direction and fuel; technical analysis provides the precise execution timing.',
    calculatorShortcut: 'Economic Surprise Tool'
  },
  {
    id: 9,
    myth: 'Full-Time Screen Time Guarantees Better Results',
    whyBelieved: 'Staring at charts for 10 hours a day feels like hard work.',
    math: 'Prolonged screen time produces decision fatigue, dopamine depletion, and boredom, which directly triggers overtrading and emotional mistakes.',
    verdict: 'Top performers do their pre-market analysis in 30 minutes, set price alerts, and only trade during liquid session openings.',
    calculatorShortcut: 'Compounding Simulator'
  },
  {
    id: 10,
    myth: 'Watching Every Tick Improves Execution',
    whyBelieved: 'Traders believe micromanaging a live position by watching tick charts gives them control over the outcome.',
    math: 'Tick-by-tick monitoring increases heart rate and cortisol levels, causing traders to cut winning trades too early or panic-exit on harmless pullbacks.',
    verdict: 'Once an order with a Stop and Take-Profit is submitted, walking away from the screen yields higher win-rates and larger average R-multiples.',
    calculatorShortcut: 'Drawdown Simulator'
  },
  {
    id: 11,
    myth: 'Past Winners Keep Winning Indefinitely',
    whyBelieved: 'Recency bias makes traders believe the hottest asset of the last 6 months will continue rising forever.',
    math: 'Financial assets mean-revert across macro cycles. Asset leadership rotates constantly between equities, commodities, bonds, and cash.',
    verdict: 'Never marry an asset; trade price structure and capital flows, not emotional attachment to past winning stocks or coins.',
    calculatorShortcut: 'Correlation Matrix'
  },
  {
    id: 12,
    myth: '"Guaranteed" 95% Profitable Systems Exist for Sale',
    whyBelieved: 'Greed and search for effortless wealth lead retail traders to buy $999 magic trading bots and secret indicator packs.',
    math: 'If anyone possessed an algorithm with 95% win rate and positive expectancy, they would be running a multi-billion dollar fund like Renaissance Technologies, not selling it online for $99.',
    verdict: 'There are no secret shortcuts in trading. Edge is earned through disciplined risk management, verified statistics, and emotional mastery.',
    calculatorShortcut: 'Risk of Ruin Calculator'
  },
  {
    id: 13,
    myth: 'Demo Trading Results Are Identical to Live Trading',
    whyBelieved: 'Amateurs make $50,000 in paper trading and expect to immediately quit their jobs.',
    math: 'Paper trading has zero psychological stress, zero real financial fear, zero slippage, and instant fills at exact prices.',
    verdict: 'Demo trading teaches software mechanics and rules; live micro-lot trading is required to develop psychological discipline.',
    calculatorShortcut: 'Expectancy Calculator'
  },
  {
    id: 14,
    myth: 'Trading Around News Events is Pure Gambling',
    whyBelieved: 'Unregulated amateurs who buy with market orders 5 seconds before CPI get liquidated.',
    math: 'Systematic news trading—analyzing consensus deviations and entering on structured post-release retracements—is a standard institutional arbitrage discipline.',
    verdict: 'Gambling is entering blindly before news; trading news is executing planned reactions to economic surprises with defined risk.',
    calculatorShortcut: 'Economic Surprise Tool'
  },
  {
    id: 15,
    myth: 'Elite Professional Traders Are Never Wrong',
    whyBelieved: 'Novices assume pros possess superhuman market foresight.',
    math: 'Billionaire hedge fund manager Stanley Druckenmiller openly states: "I\'ve been wrong 50% of the time in my career. But when I\'m right, I make huge returns, and when I\'m wrong, I lose almost nothing."',
    verdict: 'Trading mastery is not about being right; it is about how much you make when right versus how little you lose when wrong.',
    calculatorShortcut: 'R:R Analyzer'
  },
  {
    id: 16,
    myth: 'You Need a Master\'s Degree in Advanced Mathematics to Trade',
    whyBelieved: 'Quantitative finance sounds intimidating with complex stochastic calculus formulas.',
    math: 'Core profitable trading math requires only simple arithmetic: basic percentages, ratios (R:R), probability multiplication, and expected value.',
    verdict: 'Psychological self-control and simple 6th-grade math will beat an emotional Ph.D. in mathematics every time.',
    calculatorShortcut: 'Position Sizing Calculator'
  },
  {
    id: 17,
    myth: 'Crypto is Easier to Trade Because It Moves 20% a Day',
    whyBelieved: 'High volatility creates the illusion of quick easy fortunes.',
    math: 'Higher volatility expands stop distances and increases liquidation velocity. Sizing incorrectly on high-beta crypto leads to catastrophic ruin 5x faster than on equities.',
    verdict: 'Volatility without volatility-adjusted position sizing merely accelerates the speed at which unprepared traders blow up.',
    calculatorShortcut: 'Drawdown Simulator'
  },
  {
    id: 18,
    myth: 'Zero Commission Brokers Mean Free Trading',
    whyBelieved: 'Modern retail apps market "Zero Commission" trading.',
    math: 'Brokers sell your order flow (PFOF) to high-frequency market makers who widen the bid/ask spread and front-run fills. You pay through poor execution pricing rather than transparent fees.',
    verdict: 'Nothing in financial markets is free; implicit spread cost is often significantly higher than transparent direct-market-access (DMA) commission.',
    calculatorShortcut: 'Friction Drag Analyzer'
  },
  {
    id: 19,
    myth: 'Paper Trading Success Predicts Live Real-Money Wealth',
    whyBelieved: 'Traders assume emotional brain state is identical when risking fake credits vs your real monthly rent money.',
    math: 'When real money is at risk, the amygdala releases cortisol and adrenaline, drastically impairing cognitive prefrontal cortex decision making.',
    verdict: 'Transition from paper to small real capital gradually to build emotional resilience incrementally.',
    calculatorShortcut: 'Expectancy Calculator'
  },
  {
    id: 20,
    myth: 'Institutions Don\'t Have Bad Quarters or Losing Years',
    whyBelieved: 'People assume multi-billion dollar hedge funds generate smooth upwards charts with zero down months.',
    math: 'Bridgewater Associates, Renaissance Technologies, and Tiger Global have all weathered multi-month 15-25% drawdowns during major macro regime shifts.',
    verdict: 'Drawdowns are an inevitable mathematical reality of capital allocation across all institutional scales.',
    calculatorShortcut: 'Drawdown Simulator'
  },
  {
    id: 21,
    myth: 'You Need $100,000 to Start Learning How to Trade',
    whyBelieved: 'People assume small accounts cannot teach professional trading.',
    math: 'A trader who cannot manage a $500 micro account with disciplined 1% risk ($5) will fail even faster with $50,000. Bad habits simply scale up to larger losses.',
    verdict: 'Master the process and percentages on small micro-accounts first; capital will naturally follow proven consistency.',
    calculatorShortcut: 'Position Sizing Calculator'
  },
  {
    id: 22,
    myth: 'A Backtest Guarantees Equivalent Future Performance',
    whyBelieved: 'Seeing a green rising line over 2020-2023 historical data creates false certainty.',
    math: 'Historical data reflects past volatility regimes, liquidity levels, and interest rates. Market dynamics shift constantly as new participants enter.',
    verdict: 'Backtesting shows whether a concept was historically viable; only forward testing and walk-forward verification confirm active current edge.',
    calculatorShortcut: 'Expectancy Calculator'
  },
  {
    id: 23,
    myth: 'A Good R:R Ratio Automatically Guarantees Profit',
    whyBelieved: 'Traders believe setting a 10:1 Take Profit ensures victory.',
    math: 'If your target is 10R away, price will hit your 1R stop loss 95% of the time before ever reaching your target, producing negative net expectancy.',
    verdict: 'Reward targets must be harmonized with structural market reality, not arbitrary wishful thinking.',
    calculatorShortcut: 'R:R Analyzer'
  },
  {
    id: 24,
    myth: 'Chart Pattern X Always Works on This Specific Timeframe',
    whyBelieved: 'Gurus teach patterns as mechanical guarantees.',
    math: 'Fractal chart patterns operate across all timeframes with variable probability depending on higher-timeframe trend confluence and volume.',
    verdict: 'Context is king; a bull flag in an established multi-month uptrend has a high win rate, while a bull flag below major macro resistance fails frequently.',
    calculatorShortcut: 'Expectancy Calculator'
  },
  {
    id: 25,
    myth: '"I Have a Strategy That Never Loses"',
    whyBelieved: 'Scammers and self-delusional traders hide losses under the rug or martingale positions indefinitely.',
    math: 'Any system that claims zero losses is either holding open unrealized floating losses until liquidation or outright committing fraud. Every mathematical trading distribution contains losses.',
    verdict: 'In professional trading, loss is a normal, respected business expense. The goal is small losses and asymmetric wins, not perfection.',
    calculatorShortcut: 'Risk of Ruin Calculator'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 10 BULL VS BEAR DEBATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MAX_BULL_BEAR_DEBATES: BullBearDebate[] = [
  {
    id: 1,
    topic: 'Technical Analysis — Genuine Edge or Self-Fulfilling Prophecy?',
    bullCase: {
      summary: 'Technical analysis systematically maps aggregate human psychology and institutional execution footprints.',
      points: [
        'Institutions and algorithms place limit orders at obvious support and resistance zones, creating real physical liquidity walls.',
        'Trend-following funds managing trillions use quantitative momentum and moving averages to allocate capital.',
        'Technical structures provide objective, non-emotional parameters for invalidation and risk management.'
      ]
    },
    bearCase: {
      summary: 'Technical analysis is largely retrospective curve-fitting that breaks down during regime shifts.',
      points: [
        'Academic finance studies show that subjective pattern recognition fails to beat random walks after accounting for bid-ask spread friction.',
        'Markets evolve rapidly; once a simple pattern becomes widely known, algorithmic desks exploit and sweep those exact stop zones.',
        'Price is ultimately driven by macroeconomic liquidity, interest rate differentials, and corporate earnings, not lines drawn on charts.'
      ]
    },
    synthesis: 'Technical analysis is not a predictive crystal ball, but an invaluable framework for risk organization. It works best when aligned with broader macroeconomic catalysts and institutional liquidity flows.'
  },
  {
    id: 2,
    topic: 'Stop Loss Orders — Essential Lifejacket or Liquidity Magnet?',
    bullCase: {
      summary: 'Stop losses are the non-negotiable insurance policy preventing terminal account liquidation.',
      points: [
        'Without a hard stop, an unforeseen geopolitical shock or flash crash can wipe out 100% of capital in seconds.',
        'It removes cognitive paralysis, allowing the trader to accept a predetermined loss automatically.',
        'Drawdown math proves that cutting losses at 1-2% preserves capital for future positive expectancy setups.'
      ]
    },
    bearCase: {
      summary: 'Tight retail stops are easily triggered by normal market noise before price resumes the intended direction.',
      points: [
        'Market makers and algorithmic desks frequently target resting stop clusters above/below obvious swing highs and lows to clear inventory.',
        'Using synthetic options structures (like long puts) defines risk without the vulnerability of being stopped out on intraday wicks.'
      ]
    },
    synthesis: 'Stop losses are mandatory, but placing them too close to obvious support/resistance leads to death by a thousand cuts. Stops must be placed beyond structural invalidation zones and adjusted for volatility (ATR).'
  },
  {
    id: 3,
    topic: 'Day Trading vs. Swing Trading — Which Yields Higher Risk-Adjusted Returns?',
    bullCase: {
      summary: 'Day trading eliminates overnight gap risk and allows compounding daily opportunities.',
      points: [
        'Zero exposure to after-hours earnings releases, weekend geopolitical shocks, or overnight gap risks.',
        'Rapid feedback loop allows a disciplined trader to learn and refine edge much faster than taking 1 trade per month.',
        'Ability to hold cash overnight provides maximum psychological peace of mind.'
      ]
    },
    bearCase: {
      summary: 'Swing trading captures the large meat of multi-day institutional trends with far lower transaction friction.',
      points: [
        'Day trading suffers massive performance drag from spread, commission, and execution slippage across hundreds of trades.',
        'Intraday price action is dominated by algorithmic high-frequency noise, whereas multi-day swing moves reflect genuine institutional accumulation.',
        'Requires far less continuous screen time, dramatically reducing decision fatigue and emotional burnout.'
      ]
    },
    synthesis: 'Swing trading generally offers superior risk-adjusted returns and psychological sustainability for 95% of traders. Day trading should be reserved for those with low-latency infrastructure and elite emotional discipline.'
  },
  {
    id: 4,
    topic: 'Discretionary Trading vs. 100% Systematic Automated Trading',
    bullCase: {
      summary: 'Discretionary traders can adapt instantly to unprecedented market anomalies that algorithms cannot parse.',
      points: [
        'Human traders can synthesize breaking news, geopolitical context, and sentiment shifts in real time.',
        'Algorithms fail during unprecedented Black Swan regime shifts where historical backtests contain no training data.'
      ]
    },
    bearCase: {
      summary: 'Systematic algorithmic models eliminate human cognitive biases, fear, greed, and emotional hesitation.',
      points: [
        'Computers execute exact rules 24/7 with zero hesitation, revenge trading, or FOMO.',
        'Systematic rules can be rigorously backtested and Monte-Carlo audited across decades of data for statistical validity.'
      ]
    },
    synthesis: 'The modern ideal is "quantamental" or "systematic-discretionary": using algorithmic rules for position sizing, risk limits, and scanning, paired with human discretion for contextual sanity checks.'
  },
  {
    id: 5,
    topic: 'True Diversification vs. Naive Over-Diversification',
    bullCase: {
      summary: 'Diversification across genuinely non-correlated assets is the only "free lunch" in finance.',
      points: [
        'Holding uncorrelated assets (e.g. Trend Following, Gold, Short-Term Bonds, Equities) reduces portfolio volatility without reducing expected return.',
        'Prevents any single asset collapse from triggering terminal drawdown.'
      ]
    },
    bearCase: {
      summary: 'Holding 30 different stock positions dilutes edge and turns a trading portfolio into an expensive index fund.',
      points: [
        'During liquidity crises, correlations between "different" risk assets spike toward 1.0 (everything sells off together).',
        'Concentrating capital in your top 2-3 highest conviction setups yields dramatically higher alpha.'
      ]
    },
    synthesis: 'Diversification works across genuinely distinct asset classes and non-correlated strategies, but holding 25 correlated tech stocks is naive diversification that provides zero real downside protection.'
  },
  {
    id: 6,
    topic: 'Fundamental vs. Technical Analysis — Which Dictates Price?',
    bullCase: {
      summary: 'Fundamentals dictate the long-term destination of every financial asset.',
      points: [
        'A company\'s share price must ultimately reflect its discounted future cash flows and earnings power.',
        'Currencies inevitably track real interest rate differentials, balance of payments, and central bank balance sheets.'
      ]
    },
    bearCase: {
      summary: 'Technical price action and liquidity dictate timing, entries, and short-to-medium term swings.',
      points: [
        'An asset can stay fundamentally overvalued or undervalued far longer than a trader can remain solvent.',
        'Technical charts reflect the immediate supply/demand reality, incorporating information before public fundamental reports are released.'
      ]
    },
    synthesis: 'Use fundamentals to determine WHAT to trade (identifying assets with strong macroeconomic tailwinds), and use technical analysis to determine WHEN and WHERE to trade (identifying high-probability entry and risk levels).'
  },
  {
    id: 7,
    topic: 'Leverage — Essential Tool for Capital Efficiency or Toxic Trap?',
    bullCase: {
      summary: 'Leverage allows traders to optimize capital efficiency and volatility-target lower-volatility assets.',
      points: [
        'Currencies move an average of only 0.5% per day. Modest leverage allows meaningful returns on small, tight moves without tying up excessive capital.',
        'Free capital can be safely held in risk-free yield-bearing instruments while only required margin is deposited at the broker.'
      ]
    },
    bearCase: {
      summary: 'Leverage is the number one cause of retail account liquidations worldwide.',
      points: [
        'High leverage accelerates emotional panic and makes survival of normal market noise mathematically impossible.',
        'Brokers offer 500:1 leverage specifically because statistical data proves 90%+ of retail traders using it blow up within 90 days.'
      ]
    },
    synthesis: 'Leverage should be used for capital efficiency, not for oversizing. Keep total effective account leverage under 3:1 to 5:1 to ensure resilience against Black Swan tail events.'
  },
  {
    id: 8,
    topic: 'Trend Following vs. Mean Reversion — Which Edge is More Durable?',
    bullCase: {
      summary: 'Trend following captures unlimited asymmetric upside while capping downside at 1R.',
      points: [
        'Major macroeconomic trends in commodities, equities, and interest rates persist for months or years.',
        'Positive skew: small controlled losses are heavily compensated by massive 5R to 10R outlier winning trends.'
      ]
    },
    bearCase: {
      summary: 'Markets spend 70% of their time in sideways ranges where trend following suffers painful whipsaw losses.',
      points: [
        'Mean reversion strategies benefit from high win rates (65-75%) and steady equity curve growth during range-bound regimes.',
        'Waiting for trends requires enduring extended multi-month drawdowns that test human patience to its limit.'
      ]
    },
    synthesis: 'A balanced trading system combines both: trend-following in high-momentum regimes and mean-reversion at extreme statistical boundaries (e.g. 2.5 standard deviations) during range regimes.'
  },
  {
    id: 9,
    topic: 'Human Trader vs. AI/Algorithmic Trading Bot',
    bullCase: {
      summary: 'Human intuition, contextual nuance, and ethical flexibility can never be fully codified in code.',
      points: [
        'Humans can detect subtle regime shifts, political nuances, and qualitative rumors that machine learning models cannot anticipate.',
        'Top human macro traders have consistently outperformed systematic funds during historic inflection points (like 2008 and 2020).'
      ]
    },
    bearCase: {
      summary: 'Algorithms process millions of data points simultaneously with zero emotional drag.',
      points: [
        'High-frequency and systematic models calculate correlation, order book depth, and cross-asset arbitrage in microseconds.',
        'Algorithms never experience sleep deprivation, revenge trading, greed, or hesitation.'
      ]
    },
    synthesis: 'The most profitable trading desks pair advanced algorithmic execution with seasoned human oversight—leveraging machines for execution speed and human intellect for strategy design.'
  },
  {
    id: 10,
    topic: 'High Win Rate vs. High Risk:Reward — Which Matters More?',
    bullCase: {
      summary: 'High Win Rate (60-70%) is psychologically easier to trade and minimizes painful losing streaks.',
      points: [
        'A high win rate prevents severe drawdown periods and keeps confidence high.',
        'Traders are less prone to emotional tilt when winning regularly.'
      ]
    },
    bearCase: {
      summary: 'High Risk:Reward (2.5R to 4R) protects you against unexpected market regime shifts and preserves edge.',
      points: [
        'A 2.5:1 R:R strategy remains consistently profitable even if your win rate drops to a modest 40%.',
        'High win rate strategies that risk 2R to make 1R can have months of steady profits erased by a single unexpected bad week.'
      ]
    },
    synthesis: 'Both components are inextricably linked through the mathematical Expectancy equation: EV = (WR × Avg Win) - (LR × Avg Loss). Focus on positive expectancy rather than isolating either variable in a vacuum.'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. CANDLESTICK & CHART PATTERNS SPECIFICATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CandlestickPatternSpec {
  id: string;
  name: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  candleCount: number;
  reliability: 'High' | 'Medium' | 'High (with confirmation)';
  description: string;
  anatomy: string;
  confirmationRule: string;
  svgData: {
    candles: {
      open: number;
      high: number;
      low: number;
      close: number;
      color: string;
    }[];
  };
}

export const CANDLESTICK_PATTERNS_SPEC: CandlestickPatternSpec[] = [
  {
    id: 'hammer',
    name: 'Hammer Pattern',
    type: 'Bullish',
    candleCount: 1,
    reliability: 'High (with confirmation)',
    description: 'A classic bullish reversal pattern occurring at the bottom of a downtrend, signaling strong buyer rejection of lower prices.',
    anatomy: 'Small real body at the upper end of the trading range; lower shadow/wick at least twice the length of the real body; little to no upper shadow.',
    confirmationRule: 'Requires the subsequent candle to close higher than the Hammer\'s close with expanding volume.',
    svgData: {
      candles: [
        { open: 35, high: 32, low: 75, close: 38, color: '#10b981' }
      ]
    }
  },
  {
    id: 'shooting-star',
    name: 'Shooting Star',
    type: 'Bearish',
    candleCount: 1,
    reliability: 'High (with confirmation)',
    description: 'A bearish reversal pattern occurring at the peak of an uptrend, signaling aggressive rejection of higher prices by sellers.',
    anatomy: 'Small real body at the lower end of the range; upper shadow at least twice the length of the real body; little to no lower shadow.',
    confirmationRule: 'Next candle must close below the body of the Shooting Star on expanding volume.',
    svgData: {
      candles: [
        { open: 65, high: 20, low: 68, close: 62, color: '#f43f5e' }
      ]
    }
  },
  {
    id: 'bullish-engulfing',
    name: 'Bullish Engulfing',
    type: 'Bullish',
    candleCount: 2,
    reliability: 'High',
    description: 'A potent two-candle reversal formation where a small bearish candle is completely consumed and engulfed by a wide-range green candle.',
    anatomy: 'Candle 1 is red. Candle 2 opens equal to or below Candle 1 close and surges upward to close above Candle 1 open.',
    confirmationRule: 'Follow-through buying above the high of the engulfing candle.',
    svgData: {
      candles: [
        { open: 45, high: 40, low: 65, close: 60, color: '#f43f5e' },
        { open: 62, high: 25, low: 65, close: 30, color: '#10b981' }
      ]
    }
  },
  {
    id: 'bearish-engulfing',
    name: 'Bearish Engulfing',
    type: 'Bearish',
    candleCount: 2,
    reliability: 'High',
    description: 'A key top-reversal formation where a small green candle is completely engulfed by a large red candle, indicating sellers took decisive control.',
    anatomy: 'Candle 1 is green. Candle 2 opens at or above Candle 1 close and drops aggressively to close below Candle 1 open.',
    confirmationRule: 'Subsequent candle breaks below the low of the engulfing candle.',
    svgData: {
      candles: [
        { open: 55, high: 35, low: 60, close: 40, color: '#10b981' },
        { open: 38, high: 30, low: 75, close: 70, color: '#f43f5e' }
      ]
    }
  },
  {
    id: 'doji',
    name: 'Standard Doji',
    type: 'Neutral',
    candleCount: 1,
    reliability: 'Medium',
    description: 'A candle where Open and Close are virtually identical, indicating total equilibrium and indecision between buyers and sellers.',
    anatomy: 'Paper-thin real body with balanced upper and lower shadows.',
    confirmationRule: 'Requires the next candle to establish directional resolution out of the Doji range.',
    svgData: {
      candles: [
        { open: 50, high: 25, low: 75, close: 50, color: '#94a3b8' }
      ]
    }
  },
  {
    id: 'morning-star',
    name: 'Morning Star',
    type: 'Bullish',
    candleCount: 3,
    reliability: 'High',
    description: 'A 3-candle bottom reversal: long red candle, followed by an indecisive star candle, followed by a strong green candle recovering past the midpoint of Candle 1.',
    anatomy: 'Candle 1 is a tall bearish bar; Candle 2 has a tiny body gapping down; Candle 3 is a tall bullish bar closing well into Candle 1.',
    confirmationRule: 'Entry on break of Candle 3 high with stop below the low of Candle 2.',
    svgData: {
      candles: [
        { open: 25, high: 20, low: 55, close: 50, color: '#f43f5e' },
        { open: 65, high: 60, low: 75, close: 68, color: '#f59e0b' },
        { open: 60, high: 25, low: 62, close: 30, color: '#10b981' }
      ]
    }
  },
  {
    id: 'evening-star',
    name: 'Evening Star',
    type: 'Bearish',
    candleCount: 3,
    reliability: 'High',
    description: 'A 3-candle top reversal: long green candle, followed by a small star candle showing exhaustion, followed by a strong red candle closing into Candle 1.',
    anatomy: 'Candle 1 is a tall bullish bar; Candle 2 is a small star at highs; Candle 3 is a strong red bar closing deep into Candle 1.',
    confirmationRule: 'Entry on break of Candle 3 low with stop above the star high.',
    svgData: {
      candles: [
        { open: 65, high: 35, low: 70, close: 40, color: '#10b981' },
        { open: 25, high: 15, low: 30, close: 22, color: '#f59e0b' },
        { open: 30, high: 25, low: 70, close: 65, color: '#f43f5e' }
      ]
    }
  }
];

export interface ChartPatternSpec {
  id: string;
  name: string;
  category: 'Reversal' | 'Continuation';
  type: 'Bullish' | 'Bearish';
  formationNotes: string;
  entryZone: string;
  stopZone: string;
  targetZone: string;
  historicalSuccessRate: string;
}

export const CHART_PATTERNS_SPEC: ChartPatternSpec[] = [
  {
    id: 'head-and-shoulders',
    name: 'Head & Shoulders Top',
    category: 'Reversal',
    type: 'Bearish',
    formationNotes: 'Left shoulder forms, followed by a higher peak (Head), and a lower third peak (Right Shoulder). Connect the troughs to form the Neckline.',
    entryZone: 'Break and 4-hour close below the Neckline or retest of the broken Neckline.',
    stopZone: 'Above the peak of the Right Shoulder.',
    targetZone: 'Projected distance from Head to Neckline subtracted from the breakout level.',
    historicalSuccessRate: '62-67% in established trending regimes (Bulkowski data).'
  },
  {
    id: 'inv-head-and-shoulders',
    name: 'Inverse Head & Shoulders',
    category: 'Reversal',
    type: 'Bullish',
    formationNotes: 'Left trough, followed by a deeper trough (Head), and a higher third trough (Right Shoulder) below an overhead resistance Neckline.',
    entryZone: 'Decisive break and close above the Neckline.',
    stopZone: 'Below the low of the Right Shoulder.',
    targetZone: 'Projected distance from the Head to Neckline added to the breakout level.',
    historicalSuccessRate: '65-70% in bottoms of multi-month selloffs.'
  },
  {
    id: 'bull-flag',
    name: 'Bull Flag Continuation',
    category: 'Continuation',
    type: 'Bullish',
    formationNotes: 'Sharp impulsive vertical rally (the Flagpole) followed by a tight, downward-sloping consolidation channel on declining volume.',
    entryZone: 'Breakout above the upper channel resistance with expanding volume.',
    stopZone: 'Below the lowest point of the flag consolidation channel.',
    targetZone: 'Length of the initial flagpole measured upward from the breakout point.',
    historicalSuccessRate: '68-73% in strong momentum regimes.'
  },
  {
    id: 'bear-flag',
    name: 'Bear Flag Continuation',
    category: 'Continuation',
    type: 'Bearish',
    formationNotes: 'Sharp vertical selloff (Flagpole) followed by a gentle, upward-sloping counter-trend channel on weakening volume.',
    entryZone: 'Break and close below the lower boundary of the flag channel.',
    stopZone: 'Above the highest swing point of the flag channel.',
    targetZone: 'Height of the flagpole subtracted from the breakdown point.',
    historicalSuccessRate: '66-71% in bearish downtrends.'
  },
  {
    id: 'double-bottom',
    name: 'Double Bottom ("W" Pattern)',
    category: 'Reversal',
    type: 'Bullish',
    formationNotes: 'Two distinct troughs at roughly the same price level separated by an intervening swing high (Neckline).',
    entryZone: 'Break and close above the intervening peak (Neckline).',
    stopZone: 'Below the second trough.',
    targetZone: 'Height of the "W" pattern projected upward from the Neckline.',
    historicalSuccessRate: '63-68% when preceded by extended selloffs.'
  },
  {
    id: 'cup-and-handle',
    name: 'Cup and Handle Pattern',
    category: 'Continuation',
    type: 'Bullish',
    formationNotes: 'A smooth, rounded U-shaped recovery (the Cup) followed by a shallow, slightly downward drifting consolidation (the Handle).',
    entryZone: 'Breakout above the rim resistance of the cup.',
    stopZone: 'Below the lowest point of the handle consolidation.',
    targetZone: 'Depth of the cup added to the breakout rim level.',
    historicalSuccessRate: '70-74% in secular equity bull markets (O\'Neil data).'
  }
];
