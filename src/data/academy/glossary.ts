import { GlossaryTerm } from '@/types/academy';

export const TRADING_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'Alpha (α)',
    domain: 'Professional Practice',
    level: 9,
    definition: 'The active return on an investment or strategy above and beyond the market benchmark return.',
    institutionalContext: 'Hedge funds justify performance fees solely on pure idiosyncratic alpha, not passive market beta exposure.',
    relatedTerms: ['Beta', 'Sharpe Ratio', 'Benchmarking']
  },
  {
    term: 'Average True Range (ATR)',
    domain: 'Technical Analysis',
    level: 4,
    definition: 'A technical volatility indicator measuring the average range of price movement over N periods, including overnight session gaps.',
    institutionalContext: 'Used for volatility-scaled position sizing and dynamic stop-loss placement.',
    relatedTerms: ['Volatility', 'True Range', 'Standard Deviation']
  },
  {
    term: 'Beta (β)',
    domain: 'Portfolio Management',
    level: 9,
    definition: 'A measure of the sensitivity or systematic covariance of an asset or portfolio relative to the broader market index.',
    institutionalContext: 'A beta of 1.2 means the asset is expected to move 12% for every 10% move in the market index.',
    relatedTerms: ['Alpha', 'Correlation', 'Hedging']
  },
  {
    term: 'Bid-Ask Spread',
    domain: 'Market Knowledge',
    level: 1,
    definition: 'The instantaneous price difference between the highest price a buyer bids and the lowest price a seller asks.',
    institutionalContext: 'The core compensation required by liquidity providers for inventory holding risk.',
    relatedTerms: ['Liquidity', 'Slippage', 'Order Book']
  },
  {
    term: 'Break of Structure (BOS)',
    domain: 'Technical Analysis',
    level: 4,
    definition: 'When price cleanly breaks and closes beyond the previous major swing high in an uptrend or swing low in a downtrend.',
    institutionalContext: 'Confirms structural trend continuation in order-flow analysis.',
    relatedTerms: ['Market Structure', 'Change of Character', 'Swing Points']
  },
  {
    term: 'Change of Character (CHoCH)',
    domain: 'Technical Analysis',
    level: 4,
    definition: 'The failure of price to maintain structural swing integrity, violating the most recent protective swing low/high.',
    institutionalContext: 'Signals an early potential transition from a trending regime to consolidation or reversal.',
    relatedTerms: ['Market Structure', 'BOS', 'Swing Points']
  },
  {
    term: 'Disposition Effect',
    domain: 'Trading Psychology',
    level: 7,
    definition: 'The behavioral anomaly where traders prematurely sell winning positions to lock in gains while stubbornly holding losing positions to avoid pain.',
    institutionalContext: 'A direct manifestation of Kahneman-Tversky prospect theory and loss aversion.',
    relatedTerms: ['Loss Aversion', 'Revenge Trading', 'Confirmation Bias']
  },
  {
    term: 'Expected Value (EV)',
    domain: 'Quantitative Analysis',
    level: 3,
    definition: 'The statistical average profit or loss generated per trade across a large sample of executions.',
    institutionalContext: 'Quantifies whether a systematic strategy possesses a positive mathematical edge.',
    relatedTerms: ['Expectancy', 'R-Multiple', 'Win Rate']
  },
  {
    term: 'Implementation Shortfall',
    domain: 'Execution',
    level: 6,
    definition: 'The difference between the portfolio manager\'s paper decision price and the final volume-weighted executed fill price.',
    institutionalContext: 'Decomposes execution drag into spread crossing, market impact, and latency.',
    relatedTerms: ['TCA', 'VWAP', 'Slippage']
  },
  {
    term: 'Leptokurtic Distribution (Fat Tails)',
    domain: 'Quantitative Analysis',
    level: 8,
    definition: 'A return distribution with heavier tails and a higher peak than a normal Gaussian distribution.',
    institutionalContext: 'Proves that extreme market crashes and outlier events occur far more frequently in finance than standard bell curves assume.',
    relatedTerms: ['Z-Score', 'Monte Carlo', 'Standard Deviation']
  },
  {
    term: 'Maximum Adverse Excursion (MAE)',
    domain: 'Quantitative Analysis',
    level: 5,
    definition: 'The maximum unrealized loss (drawdown) experienced by a trade before it reaches its exit or target.',
    institutionalContext: 'Used to optimize stop-loss placement by identifying where winning trades typically experience peak pain.',
    relatedTerms: ['MFE', 'Backtesting', 'Drawdown']
  },
  {
    term: 'Notional Value',
    domain: 'Market Knowledge',
    level: 1,
    definition: 'The total underlying monetary value controlled by a derivative contract or leveraged position.',
    institutionalContext: 'Crucial for understanding true economic risk beyond the small margin deposit.',
    relatedTerms: ['Leverage', 'Margin', 'Position Sizing']
  },
  {
    term: 'R-Multiple',
    domain: 'Risk Management',
    level: 3,
    definition: 'A standardized risk unit where initial dollar risk is designated as 1.0R, expressing profits and losses as multiples of that initial risk.',
    institutionalContext: 'Enables consistent mathematical performance evaluation across varying asset classes.',
    relatedTerms: ['Position Sizing', 'Expected Value', 'Risk per Trade']
  },
  {
    term: 'Risk Parity',
    domain: 'Portfolio Management',
    level: 9,
    definition: 'An asset allocation approach where capital is distributed inversely proportional to each asset\'s volatility, ensuring equal risk contribution.',
    institutionalContext: 'Pioneered by Bridgewater Associates\' All Weather strategy to diversify across economic regimes.',
    relatedTerms: ['Volatility Targeting', 'Correlation', 'Portfolio Management']
  },
  {
    term: 'Slippage',
    domain: 'Execution',
    level: 2,
    definition: 'The difference between the expected order price and the actual executed fill price due to market movement or order book thinness.',
    institutionalContext: 'A primary component of transaction friction in aggressive order execution.',
    relatedTerms: ['Bid-Ask Spread', 'Market Orders', 'Order Book']
  },
  {
    term: 'Volume-Weighted Average Price (VWAP)',
    domain: 'Execution',
    level: 4,
    definition: 'The benchmark average price an asset has traded at over the session, weighted by volume at each price tier.',
    institutionalContext: 'The standard execution target against which institutional broker algorithms are measured.',
    relatedTerms: ['TWAP', 'Order Book', 'TCA']
  }
];
