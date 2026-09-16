import { Flashcard } from '@/types/academy';

export const ACADEMY_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    level: 0,
    domain: 'Market Knowledge',
    front: 'What is a Financial Market at its fundamental core?',
    back: 'An institutionalized venue enabling price discovery and liquidity transfer between buyers and sellers via a continuous double auction.',
    mnemonic: 'Auction, not a casino.'
  },
  {
    id: 'fc-2',
    level: 1,
    domain: 'Market Knowledge',
    front: 'Why do you start every market order trade in an immediate negative P&L deficit?',
    back: 'Because you buy at the higher Ask price and can only immediately sell back at the lower Bid price. The difference is the Bid-Ask Spread.',
    formula: 'Deficit = Size * (Ask - Bid)'
  },
  {
    id: 'fc-3',
    level: 1,
    domain: 'Market Knowledge',
    front: 'What is the mathematical definition of Effective Leverage?',
    back: 'Effective Leverage = Total Notional Exposure / Account Equity. High leverage shortens the distance to liquidation.',
    formula: 'Leverage = Exposure / Equity'
  },
  {
    id: 'fc-4',
    level: 2,
    domain: 'Execution',
    front: 'What is the critical difference between a STOP-LOSS order and a STOP-LIMIT order?',
    back: 'A standard Stop becomes a Market order (guaranteed fill, uncertain price). A Stop-Limit requires price to be >= limit (uncertain fill, price guaranteed). In a market crash, Stop-Limits can fail to execute!',
    example: 'Gapping markets skip stop-limit price thresholds entirely.'
  },
  {
    id: 'fc-5',
    level: 3,
    domain: 'Risk Management',
    front: 'What is the Position Sizing formula under a 1% risk rule?',
    back: 'Units = (Account Equity * 0.01) / |Entry Price - Stop Price|. Never size by arbitrary lots!',
    formula: 'Size = Dollar Risk / Stop Distance'
  },
  {
    id: 'fc-6',
    level: 3,
    domain: 'Risk Management',
    front: 'What is the formula for Strategy Expected Value (EV)?',
    back: 'EV = (Win Rate * Avg Win R) - (Loss Rate * Avg Loss R). A positive EV means mathematical edge over time.',
    formula: 'EV = (P_win * W_avg) - (P_loss * L_avg)'
  },
  {
    id: 'fc-7',
    level: 3,
    domain: 'Risk Management',
    front: 'Why is a 50% account drawdown so dangerous compared to a 10% drawdown?',
    back: 'Drawdown recovery is non-linear! Recovering from a 10% loss requires an 11% gain. Recovering from a 50% loss requires a 100% gain.',
    formula: 'Gain % = (Drawdown / (1 - Drawdown)) * 100'
  },
  {
    id: 'fc-8',
    level: 4,
    domain: 'Technical Analysis',
    front: 'What structural price action event defines a Change of Character (CHoCH)?',
    back: 'When price in an uptrend violates and closes below the most recent Higher Low (HL), or in a downtrend breaks above the most recent Lower High (LH).',
    example: 'Signals the exhaustion of the prevailing directional regime.'
  },
  {
    id: 'fc-9',
    level: 4,
    domain: 'Technical Analysis',
    front: 'What does Average True Range (ATR) measure and how should it be used for stops?',
    back: 'ATR measures market volatility (noise). Setting stops at 1.5x or 2.0x ATR places your invalidation beyond random market breathing.',
    example: 'Prevents getting stopped out by harmless noise.'
  },
  {
    id: 'fc-10',
    level: 5,
    domain: 'Quantitative Analysis',
    front: 'What is the danger of "Overfitting" in strategy backtesting?',
    back: 'Overfitting memorizes past noise by tuning too many parameters. The historical backtest looks flawless, but the system fails immediately when exposed to unseen live market regimes.',
    mnemonic: 'A suit tailored too tightly bursts at the first move.'
  },
  {
    id: 'fc-11',
    level: 6,
    domain: 'Execution',
    front: 'What is Implementation Shortfall?',
    back: 'The total execution drag between your paper decision price and the final average fill price, accounting for spreads, latency slippage, and market impact.',
    formula: 'Shortfall = (Fill Price - Decision Price) * Quantity'
  },
  {
    id: 'fc-12',
    level: 7,
    domain: 'Trading Psychology',
    front: 'What is the Disposition Effect in behavioral finance?',
    back: 'The subconscious urge to take quick small profits on winning trades while stubbornly holding losing trades to avoid emotional pain.',
    example: 'Rooted in Kahneman-Tversky prospect theory.'
  },
  {
    id: 'fc-13',
    level: 8,
    domain: 'Quantitative Analysis',
    front: 'What do "Fat Tails" (excess kurtosis) prove about financial market returns?',
    back: 'Extreme crash and surge events occur with vastly higher frequency than a normal Gaussian bell curve predicts.',
    example: '1987 Black Monday was a 20-sigma event under normal models, yet it happened.'
  },
  {
    id: 'fc-14',
    level: 9,
    domain: 'Portfolio Management',
    front: 'What is Ray Dalio\'s "Holy Grail" of investing and portfolio construction?',
    back: 'Combining 10 to 15 uncorrelated return streams (correlation ≈ 0) with positive expected value to slash portfolio volatility and drawdowns by 50%+ without sacrificing return.',
    formula: 'Covariance cancellation lowers total portfolio variance.'
  },
  {
    id: 'fc-15',
    level: 10,
    domain: 'Professional Practice',
    front: 'Why do institutional hedge funds separate the Chief Risk Officer from trading profit bonuses?',
    back: 'To eliminate the moral hazard conflict of interest where a trader might take excessive hidden tail risks to maximize their personal annual performance bonus.',
    mnemonic: 'Process governance over individual profit incentives.'
  }
];
