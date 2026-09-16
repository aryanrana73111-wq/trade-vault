import { RoadmapPhase } from '@/types/academyTier';

export const MAX_ROADMAP_DATA: RoadmapPhase[] = [
  {
    phase: 1,
    title: 'Market Foundations',
    timeframe: 'Level 1',
    badgeColor: '#60A5FA',
    description: 'Understand the fundamental architecture of financial markets, liquidity, price discovery, and the distinct roles of market participants.',
    concepts: [
      'Financial markets', 'Capital markets', 'Primary market', 'Secondary market', 
      'Exchanges', 'OTC markets', 'Brokers', 'Dealers', 'Market makers', 'Clearing', 
      'Settlement', 'Custody', 'Liquidity', 'Price discovery', 'Auction mechanism', 
      'Market participants', 'Institutional investors', 'Retail traders', 'Proprietary trading', 
      'Hedge funds', 'Asset managers', 'Market sessions', 'Trading hours', 'Tick size', 
      'Contract size', 'Notional value', 'Bid', 'Ask', 'Spread', 'Mid price', 'Volume', 'Turnover', 'Volatility'
    ],
    resources: [],
    milestone: 'Able to articulate auction mechanics, bid/ask spread costs, and distinguish exchange vs. OTC trades.'
  },
  {
    phase: 2,
    title: 'Trading Mechanics',
    timeframe: 'Level 2',
    badgeColor: '#34D399',
    description: 'The micro-mechanics of trade entry and execution: order routing, slippage management, spread compensation, and margin utilization.',
    concepts: [
      'Market Order', 'Limit Order', 'Stop Order', 'Stop-Limit', 'Stop with protection', 
      'Good Till Cancelled', 'Day Order', 'IOC', 'FOK', 'Partial fills', 'Order cancellation', 
      'Order modification', 'Bid/Ask execution', 'Slippage', 'Spread', 'Market impact', 
      'Liquidity', 'Order queue', 'Matching engine', 'Order book', 'Execution priority'
    ],
    resources: [],
    milestone: 'Zero execution blunders: proficient with bracket orders, resting limit entries, and pre-trade margin calculations.'
  },
  {
    phase: 3,
    title: 'Technical Analysis',
    timeframe: 'Level 3',
    badgeColor: '#A78BFA',
    description: 'Learn visual price action, Japanese candlesticks, dynamic moving averages, support/resistance confluence, and multi-timeframe market structure.',
    concepts: [
      'Candlesticks', 'OHLC', 'Candle anatomy', 'Wick', 'Body', 'Momentum candle', 
      'Rejection candle', 'Inside bar', 'Outside bar', 'Engulfing', 'Doji', 'Pin bar', 
      'Hammer', 'Shooting star', 'Market structure', 'Higher high', 'Higher low', 
      'Lower high', 'Lower low', 'Trend', 'Range', 'Breakout', 'Breakdown', 'Retest', 
      'Failed breakout', 'Liquidity sweep', 'Volatility expansion', 'Volatility contraction',
      'Support', 'Resistance', 'Supply/Demand', 'Trendlines', 'Channels', 'Moving averages', 
      'SMA', 'EMA', 'VWAP', 'RSI', 'MACD', 'ATR', 'Bollinger Bands', 'Stochastic', 'ADX', 
      'Volume', 'OBV', 'Pivot points', 'Fibonacci retracement', 'Fibonacci extension', 
      'Multi-timeframe analysis', 'Divergence', 'Momentum', 'Volatility', 'Regime analysis'
    ],
    resources: [],
    milestone: 'Capable of performing clean, uncluttered multi-timeframe structure mapping on raw charts.'
  },
  {
    phase: 4,
    title: 'Risk Management',
    timeframe: 'Level 4',
    badgeColor: '#EF4444',
    description: 'Master fixed-fractional sizing, stop-loss distance math, Kelly criterion, and risk of ruin probability.',
    concepts: [
      'Risk per trade', 'Fixed fractional risk', 'Position sizing', 'Stop placement', 
      'R multiple', 'Risk/reward', 'Maximum daily loss', 'Maximum weekly loss', 
      'Maximum drawdown', 'Leverage', 'Margin', 'Exposure', 'Notional exposure', 
      'Concentration risk', 'Correlation risk', 'Liquidity risk', 'Gap risk', 'Event risk', 
      'Model risk', 'Counterparty risk', 'Operational risk', 'Risk budgeting', 'Portfolio risk', 
      'Stress testing', 'Scenario analysis', 'Risk of ruin', 'Kelly criterion', 'Fractional Kelly', 'Drawdown recovery mathematics'
    ],
    resources: [],
    milestone: 'Automatic calculation of position sizing per stop distance; non-negotiable adherence to risk caps.'
  },
  {
    phase: 5,
    title: 'Strategy Development',
    timeframe: 'Level 5',
    badgeColor: '#FBBF24',
    description: 'Transform subjective ideas into reproducible, testable trading systems with defined triggers, invalidation points, and trade management protocols.',
    concepts: [
      'Trading hypothesis', 'Market thesis', 'Setup', 'Entry condition', 'Exit condition', 
      'Stop condition', 'Position sizing', 'Filters', 'Confirmation', 'Invalidation', 
      'Market regime', 'Strategy rules', 'Discretionary strategy', 'Systematic strategy', 
      'Trend following', 'Mean reversion', 'Breakout', 'Momentum', 'Pullback', 'Range trading', 
      'Event-driven trading', 'Statistical arbitrage concept', 'Pairs trading', 'Carry', 
      'Factor strategies', 'Strategy robustness'
    ],
    resources: [],
    milestone: 'A written, codified 1-page Trading Playbook with strict checklist rules.'
  },
  {
    phase: 6,
    title: 'Fundamental & Macro Analysis',
    timeframe: 'Level 6',
    badgeColor: '#3B82F6',
    description: 'Understand the global macroeconomic gears that drive institutional capital flows: inflation prints, central bank policy, and yield curve shifts.',
    concepts: [
      'Revenue', 'Earnings', 'EPS', 'EBITDA', 'Free cash flow', 'Balance sheet', 'Income statement', 
      'Cash flow statement', 'Debt', 'Leverage', 'Margins', 'ROE', 'ROIC', 'Growth', 'Quality', 'Valuation', 
      'P/E', 'PEG', 'EV/EBITDA', 'Price/Book', 'Free cash flow yield', 'Dividend yield', 'Earnings revisions', 
      'Guidance', 'Corporate actions', 'GDP', 'CPI', 'PPI', 'PMI', 'Employment', 'Unemployment', 'Nonfarm payrolls', 
      'Interest rates', 'Yield curve', 'Real yields', 'Inflation expectations', 'Monetary policy', 'Fiscal policy', 
      'Central banks', 'Liquidity', 'Credit cycle', 'Business cycle', 'Economic surprise', 'Recession', 'Expansion', 
      'Stagflation', 'Deflation', 'Currency policy', 'Global liquidity', 'Geopolitical risk'
    ],
    resources: [],
    milestone: 'Ability to contextualize daily technical charts within current central bank liquidity regimes.'
  },
  {
    phase: 7,
    title: 'Execution',
    timeframe: 'Level 7',
    badgeColor: '#F43F5E',
    description: 'Institutional execution strategies, slippage minimization, and algorithm implementation.',
    concepts: [
      'Execution strategy', 'Trade urgency', 'Liquidity', 'Slippage', 'Market impact', 
      'Spread cost', 'VWAP', 'TWAP', 'Implementation shortfall', 'Arrival price', 
      'Participation algorithms', 'Algorithmic execution', 'Execution benchmarks', 'Execution quality'
    ],
    resources: [],
    milestone: 'Minimized implementation shortfall through intelligent order slicing.'
  },
  {
    phase: 8,
    title: 'Trading Psychology',
    timeframe: 'Level 8',
    badgeColor: '#F472B6',
    description: 'Deconstruct the emotional and cognitive traps of trading: revenge trading, FOMO, loss aversion, and outcome bias.',
    concepts: [
      'FOMO', 'Revenge trading', 'Overtrading', 'Overconfidence', 'Loss aversion', 
      'Recency bias', 'Confirmation bias', 'Anchoring', 'Availability bias', 'Disposition effect', 
      'Gambler\'s fallacy', 'Sunk cost', 'Herd behavior', 'Fear', 'Greed', 'Impulsivity', 
      'Discipline', 'Rule adherence', 'Decision fatigue', 'Trading routines', 'Process focus'
    ],
    resources: [],
    milestone: 'Maintaining an unshakeable trade journal tracking emotional state alongside mechanical execution.'
  },
  {
    phase: 9,
    title: 'Quantitative Trading',
    timeframe: 'Level 9',
    badgeColor: '#22D3EE',
    description: 'Replace subjective intuition with probabilistic reasoning: distributions, standard deviations, risk-adjusted ratios, and Monte Carlo paths.',
    concepts: [
      'Probability', 'Expected value', 'Variance', 'Standard deviation', 'Covariance', 
      'Correlation', 'Distributions', 'Normal distribution', 'Fat tails', 'Skewness', 
      'Kurtosis', 'Regression', 'Correlation vs causation', 'Time series', 'Stationarity', 
      'Autocorrelation', 'Volatility', 'Monte Carlo', 'Bootstrap', 'Hypothesis testing', 
      'Confidence intervals', 'Bayesian reasoning', 'Sampling', 'Statistical significance', 'Multiple testing'
    ],
    resources: [],
    milestone: 'Verifying any trading edge with statistical hypothesis tests.'
  },
  {
    phase: 10,
    title: 'Derivatives',
    timeframe: 'Level 10',
    badgeColor: '#F59E0B',
    description: 'Non-linear instruments: Futures, Options, Greeks, Volatility Surfaces, and hedging applications.',
    concepts: [
      'Futures', 'Forwards', 'Options', 'Swaps', 'Call', 'Put', 'Strike', 'Premium', 
      'Expiration', 'Intrinsic value', 'Time value', 'ITM', 'ATM', 'OTM', 'Exercise', 
      'Assignment', 'Implied volatility', 'Historical volatility', 'Volatility surface', 
      'Volatility smile', 'Skew', 'Delta', 'Gamma', 'Theta', 'Vega', 'Rho', 'Covered call', 
      'Protective put', 'Vertical spreads', 'Calendar spreads', 'Straddles', 'Strangles', 
      'Collars', 'Hedging'
    ],
    resources: [],
    milestone: 'Ability to construct delta-neutral hedges and trade volatility independently of price.'
  },
  {
    phase: 11,
    title: 'Portfolio & Portfolio Risk',
    timeframe: 'Level 11',
    badgeColor: '#4ADE80',
    description: 'Scale beyond single-instrument setups into multi-asset portfolios: true non-correlated diversification, risk parity, and dynamic rebalancing.',
    concepts: [
      'Diversification', 'Asset allocation', 'Strategic allocation', 'Tactical allocation', 
      'Portfolio construction', 'Efficient frontier', 'CAPM', 'Beta', 'Alpha', 'Factor exposure', 
      'Risk parity', 'Minimum variance', 'Portfolio optimization', 'Correlation', 'Covariance', 
      'Portfolio volatility', 'Risk contribution', 'Performance attribution', 'Rebalancing', 'Hedging'
    ],
    resources: [],
    milestone: 'Construct a diversified portfolio optimized for Sharpe and minimized for covariance.'
  },
  {
    phase: 12,
    title: 'Market Microstructure',
    timeframe: 'Level 12',
    badgeColor: '#8B5CF6',
    description: 'Understand the atomic physics of the market: limit order books, HFT, liquidity pools, and tick-by-tick price discovery.',
    concepts: [
      'Limit order book', 'Central limit order book', 'Bid/ask', 'Queue priority', 
      'Price-time priority', 'Market depth', 'Liquidity', 'Spread', 'Market impact', 
      'Adverse selection', 'Information asymmetry', 'Price discovery', 'Order flow', 
      'Dealer markets', 'Auction markets', 'Fragmentation', 'Electronic trading', 
      'Matching algorithms', 'High-frequency trading concepts'
    ],
    resources: [],
    milestone: 'Identify liquidity vacuums and spoofing directly from Level II order book data.'
  },
  {
    phase: 13,
    title: 'Systematic Trading',
    timeframe: 'Level 13',
    badgeColor: '#0EA5E9',
    description: 'Automating edge through rigid mathematical factor models, alpha combinations, and objective universe selection.',
    concepts: [
      'Rule-based systems', 'Signal generation', 'Factors', 'Momentum', 'Value', 
      'Carry', 'Quality', 'Mean reversion', 'Trend following', 'Cross-sectional strategies', 
      'Time-series strategies', 'Signal weighting', 'Portfolio construction', 'Risk allocation', 
      'Rebalancing', 'Model validation'
    ],
    resources: [],
    milestone: 'Design a multi-factor ranking system that isolates uncorrelated alpha sources.'
  },
  {
    phase: 14,
    title: 'Algorithmic Trading',
    timeframe: 'Level 14',
    badgeColor: '#10B981',
    description: 'Implementing systems through code: APIs, latency, execution logic, and automated infrastructure.',
    concepts: [
      'Algorithmic execution', 'Strategy automation', 'Backtesting engines', 'Event-driven systems', 
      'Market data pipelines', 'Order management', 'Execution engines', 'Latency concepts', 
      'APIs', 'Testing', 'Monitoring', 'Fail-safes'
    ],
    resources: [],
    milestone: 'Deploy a robust, latency-aware execution script with hardcoded fail-safes.'
  },
  {
    phase: 15,
    title: 'Professional Trading & Research',
    timeframe: 'Level 15',
    badgeColor: '#F97316',
    description: 'The pinnacle of MAX Mode: institutional idea generation, risk governance, and formal research methodologies.',
    concepts: [
      'Investment process', 'Trade idea generation', 'Research', 'Risk review', 
      'Execution', 'Monitoring', 'Performance review', 'Documentation', 'Governance', 
      'Compliance concepts'
    ],
    resources: [],
    milestone: 'Manage capital using a strict institutional mandate and formal risk committee protocols.'
  }
];
