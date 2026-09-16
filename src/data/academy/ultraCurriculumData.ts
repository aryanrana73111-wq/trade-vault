import {
  UltraMasterclass,
  UltraResearchPaper,
  UltraBook,
  FormulaCompendiumEntry,
  CompetencyTrack
} from '@/types/academyTier';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 22 ADVANCED MASTERCLASSES (MC01 - MC22)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ULTRA_MASTERCLASSES: UltraMasterclass[] = [
  {
    id: 'MC01',
    number: 1,
    title: 'Market Microstructure Masterclass',
    lessonsCount: 6,
    durationMinutes: 70,
    prerequisite: 'Phase 3 & 4 Completion',
    category: 'Institutional Execution',
    description: 'Deconstruct modern electronic exchange mechanics, continuous double auctions, limit order books (LOB), and high-frequency market making inventory dynamics.',
    lessons: [
      { id: 'MC01-L1', title: 'The Continuous Double Auction Architecture', summary: 'How modern matching engines (CME Globex, Nasdaq INET) clear orders with price-time priority.', durationMin: 12 },
      { id: 'MC01-L2', title: 'Limit Order Book (LOB) Dynamics & Micro-Price', summary: 'Understanding Bid/Ask depth, queue position, cancellation rates, and volume-weighted micro-price.', durationMin: 14 },
      { id: 'MC01-L3', title: 'Adverse Selection & The Glosten-Milgrom Model', summary: 'Why market makers widen spreads when toxic informed order flow enters the market.', durationMin: 12 },
      { id: 'MC01-L4', title: 'High-Frequency Trading (HFT) & Dark Pools', summary: 'Internalization, Payment for Order Flow (PFOF), and hidden institutional liquidity pools.', durationMin: 10 },
      { id: 'MC01-L5', title: 'Order Flow Toxicity (VPIN Metric)', summary: 'Calculating Volume-Synchronized Probability of Toxicity to anticipate flash volatility.', durationMin: 12 },
      { id: 'MC01-L6', title: 'Practical Microstructure Signals for Retail Desks', summary: 'Reading DOM imbalance, iceberg orders, and resting liquidity sweeps on the tape.', durationMin: 10 }
    ],
    includedCalculators: ['Micro-Price Calculator', 'VPIN Toxicity Estimator'],
    researchPaperIds: ['paper-05', 'paper-06'],
    practicalAssignment: 'Audit order book depth on a major asset during London/NY open and record liquidity imbalance prior to breakouts.'
  },
  {
    id: 'MC02',
    number: 2,
    title: 'Order Flow & Smart Money Concepts',
    lessonsCount: 7,
    durationMinutes: 85,
    prerequisite: 'MC01 Market Microstructure',
    category: 'Price Action & Flow',
    description: 'Master institutional footprint charts, volume delta, cumulative volume delta (CVD), liquidity sweeps, and fair value gap mechanics.',
    lessons: [
      { id: 'MC02-L1', title: 'Footprint & Bid-Ask Cluster Charts', summary: 'Visualizing executed volume on bids vs asks at every price tick.', durationMin: 15 },
      { id: 'MC02-L2', title: 'Volume Delta & Delta Divergence', summary: 'Detecting absorption when price makes a new high but delta prints negative.', durationMin: 12 },
      { id: 'MC02-L3', title: 'Cumulative Volume Delta (CVD) Framework', summary: 'Tracking multi-session institutional accumulation vs aggressive retail market orders.', durationMin: 14 },
      { id: 'MC02-L4', title: 'Liquidity Pools, Equal Highs & Stop Sweeps', summary: 'Why institutions push price into resting retail stops to fill large size.', durationMin: 12 },
      { id: 'MC02-L5', title: 'Fair Value Gaps (FVG) & Imbalance Inefficiencies', summary: 'The auction theory behind single-print imbalances and structural rebalances.', durationMin: 10 },
      { id: 'MC02-L6', title: 'Point of Control (POC) & Value Area Migration', summary: 'Trading market profile value areas (VAH, VAL) and developing POC shifts.', durationMin: 12 },
      { id: 'MC02-L7', title: 'Institutional Order Flow Execution Checklist', summary: 'Step-by-step entry protocol combining higher timeframe bias with footprint triggers.', durationMin: 10 }
    ],
    includedCalculators: ['Delta Divergence Detector', 'Value Area Calculator'],
    researchPaperIds: ['paper-05'],
    practicalAssignment: 'Chart 5 institutional liquidity sweeps on XAUUSD or EURUSD where aggressive delta failed to break structural support.'
  },
  {
    id: 'MC03',
    number: 3,
    title: 'Statistical Edge in Trading',
    lessonsCount: 6,
    durationMinutes: 75,
    prerequisite: 'Phase 8 Quantitative Thinking',
    category: 'Quantitative Analysis',
    description: 'Transform subjective chart watching into rigorous statistical edge validation with expected value, t-statistics, and p-value significance testing.',
    lessons: [
      { id: 'MC03-L1', title: 'What is a Statistical Edge?', summary: 'Defining positive mathematical expectancy in finite random sample spaces.', durationMin: 12 },
      { id: 'MC03-L2', title: 'Expectancy — The Complete Mathematical Framework', summary: 'Calculating EV, edge per trade, and expected compounding trajectories.', durationMin: 14 },
      { id: 'MC03-L3', title: 'Sample Size Requirements & Standard Error', summary: 'Why 30 trades tell you nothing and 200 trades provide 95% confidence intervals.', durationMin: 12 },
      { id: 'MC03-L4', title: 'Variance, Standard Deviation & Volatility Drag', summary: 'How distribution dispersion erodes compound geometric growth over time.', durationMin: 12 },
      { id: 'MC03-L5', title: 'The Distribution of Trading Returns (Fat Tails)', summary: 'Why financial returns deviate drastically from Gaussian normal bell curves.', durationMin: 13 },
      { id: 'MC03-L6', title: 'Hypothesis Testing for Trading Rules (P-Values)', summary: 'Conducting two-sample t-tests to prove your strategy is not lucky coin flipping.', durationMin: 12 }
    ],
    includedCalculators: ['Expectancy Calculator', 'Sample Size Confidence Estimator'],
    researchPaperIds: ['paper-08', 'paper-09'],
    practicalAssignment: 'Calculate the t-statistic and p-value of your last 50 trades to determine if your win rate is statistically significant.'
  },
  {
    id: 'MC04',
    number: 4,
    title: 'Advanced Backtesting & Validation',
    lessonsCount: 6,
    durationMinutes: 80,
    prerequisite: 'MC03 Statistical Edge',
    category: 'Quantitative Analysis',
    description: 'Learn the institutional backtesting standard: eliminating look-ahead bias, survivorship bias, data-snooping, and walk-forward optimization.',
    lessons: [
      { id: 'MC04-L1', title: 'The Science of Rigorous Backtesting', summary: 'Why 95% of retail backtests produce disastrous live trading losses.', durationMin: 12 },
      { id: 'MC04-L2', title: 'The Look-Ahead Bias Trap', summary: 'How indicators referencing future bars within the same calculation destroy validity.', durationMin: 14 },
      { id: 'MC04-L3', title: 'Survivorship Bias & Delisted Assets', summary: 'Accounting for bankrupt or delisted stocks to avoid hyper-inflated returns.', durationMin: 12 },
      { id: 'MC04-L4', title: 'Overfitting, Curve-Fitting & Parameter Sensitivity', summary: 'Testing parameter cliffs to ensure strategy robustness across slight shifts.', durationMin: 14 },
      { id: 'MC04-L5', title: 'Walk-Forward Optimization Framework', summary: 'Rolling in-sample training with subsequent out-of-sample forward verification.', durationMin: 15 },
      { id: 'MC04-L6', title: 'Reporting Results Honestly (The Institutional Tear Sheet)', summary: 'Generating Sharpe, Sortino, Calmar, Max Drawdown, and Ulcer Index audit sheets.', durationMin: 13 }
    ],
    includedCalculators: ['Backtest Quality Auditor', 'Overfitting Red-Flag Checker'],
    researchPaperIds: ['paper-09'],
    practicalAssignment: 'Perform a walk-forward optimization on a moving-average crossover system across 10 years of data.'
  },
  {
    id: 'MC05',
    number: 5,
    title: 'Monte Carlo Simulation & Scenario Analysis',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'MC03 Statistical Edge',
    category: 'Quantitative Analysis',
    description: 'Simulate 10,000 randomized permutations of your trading returns to calculate exact drawdown distributions and risk-of-ruin confidence intervals.',
    lessons: [
      { id: 'MC05-L1', title: 'Why Trade Sequence Matters More Than Win Rate', summary: 'How identical trades arranged in different orders cause either wealth or bankruptcy.', durationMin: 12 },
      { id: 'MC05-L2', title: 'Running Monte Carlo Resampling Without Replacement', summary: 'Shuffling trade order randomly across 1,000 hypothetical futures.', durationMin: 14 },
      { id: 'MC05-L3', title: 'Confidence Bands (10th, 50th, 90th Percentiles)', summary: 'Understanding worst-case expected drawdowns at the 95th percentile.', durationMin: 14 },
      { id: 'MC05-L4', title: 'Calculating Probability of Terminal Ruin', summary: 'The exact percentage probability of your equity breaching a -30% drawdown ceiling.', durationMin: 13 },
      { id: 'MC05-L5', title: 'Stress-Testing Position Sizing with Monte Carlo', summary: 'Finding the optimal fixed-fractional size that maximizes CAGR while capping ruin risk under 1%.', durationMin: 12 }
    ],
    includedCalculators: ['Monte Carlo 1000-Path Simulator'],
    researchPaperIds: ['paper-08'],
    practicalAssignment: 'Run a 1,000-run Monte Carlo simulation on your last 30 trade results to identify your 95% worst-case drawdown.'
  },
  {
    id: 'MC06',
    number: 6,
    title: 'Portfolio Construction & Risk Budgeting Theory',
    lessonsCount: 6,
    durationMinutes: 75,
    prerequisite: 'Phase 9 Portfolio Management',
    category: 'Portfolio Management',
    description: 'Markowitz Modern Portfolio Theory, the Efficient Frontier, Risk Parity, volatility targeting, and multi-strategy non-correlated allocation.',
    lessons: [
      { id: 'MC06-L1', title: 'Modern Portfolio Theory (Markowitz Mean-Variance)', summary: 'Mathematical derivation of covariance matrices and portfolio variance reduction.', durationMin: 15 },
      { id: 'MC06-L2', title: 'The Efficient Frontier & The Tangency Portfolio', summary: 'Locating the optimal risk-return tradeoff with maximum Sharpe ratio.', durationMin: 12 },
      { id: 'MC06-L3', title: 'Risk Parity Framework (Bridgewater All-Weather)', summary: 'Equalizing risk contribution rather than capital allocation across asset classes.', durationMin: 14 },
      { id: 'MC06-L4', title: 'Volatility Targeting & Dynamic De-leveraging', summary: 'Scaling exposure inversely to realized market volatility to preserve capital.', durationMin: 12 },
      { id: 'MC06-L5', title: 'Correlation Breakdown During Liquidity Shocks', summary: 'Why correlations converge to 1.0 in financial panics and how to hedge tail risk.', durationMin: 12 },
      { id: 'MC06-L6', title: 'Constructing a 3-Strategy Uncorrelated Book', summary: 'Combining Trend Following, Mean Reversion, and Macro Carry into one smoothed equity curve.', durationMin: 10 }
    ],
    includedCalculators: ['Efficient Frontier Visualizer', 'Risk Parity Weighting Tool'],
    researchPaperIds: ['paper-07'],
    practicalAssignment: 'Construct a 4-asset portfolio and calculate the risk contribution of each asset based on rolling 30-day volatility.'
  },
  {
    id: 'MC07',
    number: 7,
    title: 'Behavioral Finance for Elite Traders',
    lessonsCount: 6,
    durationMinutes: 70,
    prerequisite: 'Phase 7 Psychology',
    category: 'Behavioral Finance',
    description: 'Deep-dive into cognitive neurobiology, prospect theory, the endowment effect, loss aversion, and systematic psychological protocols for peak execution.',
    lessons: [
      { id: 'MC07-L1', title: 'Kahneman & Tversky\'s Prospect Theory in Live Trading', summary: 'The mathematical S-curve of loss aversion: why losing $100 hurts 2.5x more than winning $100 feels good.', durationMin: 14 },
      { id: 'MC07-L2', title: 'The Neurochemistry of Trading: Dopamine vs Cortisol', summary: 'How adrenaline and cortisol degrade prefrontal cortex executive reasoning under risk.', durationMin: 12 },
      { id: 'MC07-L3', title: 'The Sunk Cost Fallacy & Anchoring on Entry Price', summary: 'Why the market does not know or care where you bought your position.', durationMin: 11 },
      { id: 'MC07-L4', title: 'Outcome Bias & Deconstructing Process vs Luck', summary: 'Separating good decisions that lost money from terrible decisions that got lucky.', durationMin: 12 },
      { id: 'MC07-L5', title: 'Building Unbreachable Execution Rules & Daily State', summary: 'Somatic grounding, pre-market checklists, and emotional tilt circuit breakers.', durationMin: 11 },
      { id: 'MC07-L6', title: 'The Professional Trader\'s Decision Journal Protocol', summary: 'Logging psychological state, physiological pulse, and conviction ratings per trade.', durationMin: 10 }
    ],
    includedCalculators: ['Cognitive Bias Simulator'],
    researchPaperIds: ['paper-04'],
    practicalAssignment: 'Complete a 10-point cognitive bias audit on your 3 largest historical losing trades.'
  },
  {
    id: 'MC08',
    number: 8,
    title: 'Macro-Driven Trading Framework',
    lessonsCount: 6,
    durationMinutes: 80,
    prerequisite: 'Phase 6 Fundamentals & Macro',
    category: 'Macro Economics',
    description: 'Track global liquidity, real interest rate differentials, sovereign bond spreads, and currency cross-flows to trade with macro tailwinds.',
    lessons: [
      { id: 'MC08-L1', title: 'The Global Liquidity Cycle & Central Bank Balance Sheets', summary: 'How Fed, ECB, BOJ, and PBOC aggregate liquidity drives all major asset trends.', durationMin: 15 },
      { id: 'MC08-L2', title: 'Real Yields vs Nominal Yields in Asset Pricing', summary: 'Why 10-year TIPS real yields are the primary gravitational pull for Gold and Tech stocks.', durationMin: 13 },
      { id: 'MC08-L3', title: 'The Sovereign Yield Curve: Inversion & Steepening', summary: 'Decoding 10Y-2Y curve inversion as a recession predictor and subsequent bull steepeners.', durationMin: 14 },
      { id: 'MC08-L4', title: 'The US Dollar Smile Theory & Risk Regimes', summary: 'Understanding Stephen Jen\'s Dollar Smile: why USD rallies in both crises and boom periods.', durationMin: 12 },
      { id: 'MC08-L5', title: 'Commodity Super-Cycles & Supply Inelasticity', summary: 'Trading energy, base metals, and agricultural commodities through CAPEX cycles.', durationMin: 14 },
      { id: 'MC08-L6', title: 'Creating a Weekly Institutional Macro Dashboard', summary: 'Building your weekly prep routine: calendar, central bank speeches, and sentiment positioning.', durationMin: 12 }
    ],
    includedCalculators: ['Real Yield Spread Calculator', 'Dollar Smile Regime Tool'],
    researchPaperIds: ['paper-10', 'paper-11', 'paper-12'],
    practicalAssignment: 'Map current US 10-year real yields against Gold (XAU/USD) over the last 12 months to measure correlation.'
  },
  {
    id: 'MC09',
    number: 9,
    title: 'Advanced Risk Management Systems',
    lessonsCount: 6,
    durationMinutes: 75,
    prerequisite: 'Phase 4 Risk Management',
    category: 'Risk Management',
    description: 'Kelly Criterion mathematics, fractional Kelly sizing, volatility-normalized position sizing, and institutional capital allocation models.',
    lessons: [
      { id: 'MC09-L1', title: 'Deriving the Full Kelly Criterion Formula', summary: 'Mathematical proof of optimal capital growth rate $f = (bp - q) / b$.', durationMin: 14 },
      { id: 'MC09-L2', title: 'Why Full Kelly Destroys Traders: The Case for Half & Quarter Kelly', summary: 'Why full Kelly produces 50%+ drawdowns and why institutions cap sizing at 0.25 Kelly.', durationMin: 13 },
      { id: 'MC09-L3', title: 'Volatility-Adjusted Position Sizing (ATR Fixed-Dollar Risk)', summary: 'Normalizing contract size dynamically based on instantaneous asset volatility.', durationMin: 13 },
      { id: 'MC09-L4', title: 'Value at Risk (VaR) & Expected Shortfall (CVaR)', summary: 'Calculating parametric and historical VaR at the 99% confidence level.', durationMin: 13 },
      { id: 'MC09-L5', title: 'Dynamic Portfolio De-Risking During Drawdown Cycles', summary: 'Decreasing risk budget by 20% for every 3% drop from peak equity.', durationMin: 11 },
      { id: 'MC09-L6', title: 'Institutional Risk Mandate Documentation', summary: 'Writing your personal Fund Mandate: maximum daily, weekly, and cross-asset loss limits.', durationMin: 11 }
    ],
    includedCalculators: ['Kelly Criterion Explorer', 'Value at Risk (VaR) Estimator'],
    researchPaperIds: ['paper-01', 'paper-06'],
    practicalAssignment: 'Calculate your personal Half-Kelly fraction based on your win rate and average win/loss ratio from your journal.'
  },
  {
    id: 'MC10',
    number: 10,
    title: 'Execution & Transaction Cost Analysis (TCA)',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'Phase 3 Orders & Execution',
    category: 'Institutional Execution',
    description: 'Quantify explicit and implicit trading costs: spread, commission, market impact, slippage, and implementation shortfall.',
    lessons: [
      { id: 'MC10-L1', title: 'The Hidden Drag: Implementation Shortfall Breakdown', summary: 'Perold\'s framework for measuring decision price vs actual fill execution price.', durationMin: 14 },
      { id: 'MC10-L2', title: 'Market Impact Modeling (Square Root Law)', summary: 'How large order sizes move the bid-ask quotes before filling completely.', durationMin: 13 },
      { id: 'MC10-L3', title: 'Slippage Attribution: Latency vs Market Volatility', summary: 'Separating broker execution latency slippage from natural price movement.', durationMin: 12 },
      { id: 'MC10-L4', title: 'Algorithmic Order Types: TWAP, VWAP & Icebergs', summary: 'Slicing parent orders into child orders to minimize institutional market footprint.', durationMin: 14 },
      { id: 'MC10-L5', title: 'Conducting a Quarterly TCA Audit on Your Trades', summary: 'Calculating total transaction drag as a percentage of gross profitability.', durationMin: 12 }
    ],
    includedCalculators: ['Implementation Shortfall Calculator'],
    researchPaperIds: ['paper-06'],
    practicalAssignment: 'Audit your last 20 trade executions to calculate total dollar friction lost to spread and slippage.'
  },
  {
    id: 'MC11',
    number: 11,
    title: 'Hypothesis Testing for Traders',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'MC03 Statistical Edge',
    category: 'Quantitative Analysis',
    description: 'Apply the scientific method to market research: formulating null hypotheses, data cleaning, testing statistical significance, and avoiding false discoveries.',
    lessons: [
      { id: 'MC11-L1', title: 'The Scientific Method Applied to Financial Markets', summary: 'Moving from "I feel" to "The null hypothesis is rejected at p < 0.01".', durationMin: 14 },
      { id: 'MC11-L2', title: 'Formulating Testable Hypotheses', summary: 'Defining strict dependent variables, independent variables, and control periods.', durationMin: 12 },
      { id: 'MC11-L3', title: 'Data Cleaning & Outlier Treatment', summary: 'Handling market holidays, weekend gaps, bad broker ticks, and stock splits.', durationMin: 13 },
      { id: 'MC11-L4', title: 'The Multiple Comparison Problem (Bonferroni Correction)', summary: 'Why testing 100 random indicators guarantees finding 5 "statistically significant" fake edges.', durationMin: 14 },
      { id: 'MC11-L5', title: 'Writing an Institutional Research Memorandum', summary: 'Standardizing research documentation for strategy proposals.', durationMin: 12 }
    ],
    includedCalculators: ['P-Value & T-Statistic Calculator'],
    researchPaperIds: ['paper-08', 'paper-15'],
    practicalAssignment: 'Formulate one trading hypothesis, define a data collection method, and calculate the t-stat.'
  },
  {
    id: 'MC12',
    number: 12,
    title: 'Advanced Candlestick & Price Action Dynamics',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'Phase 2 Chart Reading',
    category: 'Price Action & Flow',
    description: 'Beyond basic patterns: multi-timeframe candle fractal nesting, wick liquidation traps, absorption profiles, and session open auctions.',
    lessons: [
      { id: 'MC12-L1', title: 'Fractal Nature of Candlesticks Across Scales', summary: 'Deconstructing how a 1-day hammer is built of intraday accumulation structures.', durationMin: 13 },
      { id: 'MC12-L2', title: 'Wick Liquidation Traps & Stop-Run Reversals', summary: 'Identifying when a long wick sweeps previous session extremes on thin volume.', durationMin: 13 },
      { id: 'MC12-L3', title: 'Inside Bar Breakout & Expansion Mechanics', summary: 'Trading volatility contraction leading into powerful range expansions.', durationMin: 12 },
      { id: 'MC12-L4', title: 'The Initial Balance (IB) & Session Auction Open', summary: 'Using the first 60 minutes of Tokyo, London, and NY to predict day type.', durationMin: 14 },
      { id: 'MC12-L5', title: 'Naked Charting: Pure Price Action Framework', summary: 'Removing all lagging indicators to trade pure swing structure and liquidity.', durationMin: 13 }
    ],
    includedCalculators: ['Initial Balance Range Analyzer'],
    researchPaperIds: ['paper-02'],
    practicalAssignment: 'Mark the Initial Balance (first 60 minutes) of London session on 5 consecutive days and classify the session day type.'
  },
  {
    id: 'MC13',
    number: 13,
    title: 'Correlation & Regime Analysis',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'Phase 8 Quantitative Thinking',
    category: 'Quantitative Analysis',
    description: 'Rolling covariance, correlation breakdown matrices, regime switching models (Markov chains), and cross-asset beta modeling.',
    lessons: [
      { id: 'MC13-L1', title: 'Rolling Pearson Correlation vs Static Correlation', summary: 'Why 1-year average correlation hides violent multi-week correlation inversions.', durationMin: 13 },
      { id: 'MC13-L2', title: 'Cross-Asset Flight-to-Safety Dynamics', summary: 'Tracking capital rotations between Equities, Gold, Treasuries, and the Swiss Franc.', durationMin: 13 },
      { id: 'MC13-L3', title: 'Market Regime Classification (Trending vs Mean Reverting)', summary: 'Using Hurst exponents and ATR to classify current market regime.', durationMin: 14 },
      { id: 'MC13-L4', title: 'Correlation Breakdown Under Market Stress', summary: 'Why diversified portfolios suddenly move together during liquidity contractions.', durationMin: 13 },
      { id: 'MC13-L5', title: 'Constructing a Rolling Correlation Heatmap Matrix', summary: 'Building a dynamic matrix of 8 major global assets to prevent double exposure.', durationMin: 12 }
    ],
    includedCalculators: ['Rolling Correlation Matrix Lab'],
    researchPaperIds: ['paper-07', 'paper-13'],
    practicalAssignment: 'Calculate the 30-day rolling correlation between S&P 500 and 10-Year US Treasury yields.'
  },
  {
    id: 'MC14',
    number: 14,
    title: 'Volatility Trading Concepts & Implied Volatility',
    lessonsCount: 5,
    durationMinutes: 70,
    prerequisite: 'Phase 1 & Phase 8',
    category: 'Derivatives & Volatility',
    description: 'Historical vs Implied Volatility (IV), the VIX volatility index, volatility smiles, and volatility mean reversion strategies.',
    lessons: [
      { id: 'MC14-L1', title: 'Historical Realized Volatility vs Implied Volatility', summary: 'The difference between backward-looking price variance and forward-looking option prices.', durationMin: 14 },
      { id: 'MC14-L2', title: 'The CBOE VIX Index: The Fear Gauge Decoded', summary: 'How the VIX is calculated from S&P 500 out-of-the-money option strips.', durationMin: 14 },
      { id: 'MC14-L3', title: 'Volatility Clustering (Mandelbrot & Engle ARCH)', summary: 'Why big price swings cluster together, and why quiet periods precede explosive volatility.', durationMin: 14 },
      { id: 'MC14-L4', title: 'The Volatility Smile & Skew', summary: 'Why downside puts trade at a structural premium to upside calls in equities.', durationMin: 14 },
      { id: 'MC14-L5', title: 'Trading Volatility Expansions with Bollinger Squeezes', summary: 'Detecting multi-week volatility compressions before massive directional breakouts.', durationMin: 14 }
    ],
    includedCalculators: ['Volatility Cone & Squeeze Detector'],
    researchPaperIds: ['paper-13'],
    practicalAssignment: 'Map the VIX curve (front month vs 3-month futures) to determine if volatility is in contango or backwardation.'
  },
  {
    id: 'MC15',
    number: 15,
    title: 'Derivatives for Risk Management & Hedging',
    lessonsCount: 5,
    durationMinutes: 70,
    prerequisite: 'Phase 4 Risk Management',
    category: 'Derivatives & Volatility',
    description: 'Protecting underlying portfolios using protective puts, collars, futures delta hedging, and tail risk options.',
    lessons: [
      { id: 'MC15-L1', title: 'The Protective Put as Portfolio Insurance', summary: 'Hedging catastrophic equity downside while keeping unlimited upside participation.', durationMin: 14 },
      { id: 'MC15-L2', title: 'Zero-Cost Collars for Equity Portfolios', summary: 'Financing downside put protection by selling out-of-the-money covered calls.', durationMin: 14 },
      { id: 'MC15-L3', title: 'Futures Delta Hedging for Spot Portfolios', summary: 'Using E-mini S&P or Micro futures to dynamically hedge portfolio beta during macro events.', durationMin: 14 },
      { id: 'MC15-L4', title: 'Currency Hedging for Global Portfolios', summary: 'Using FX forwards and futures to neutralize foreign exchange drag on foreign holdings.', durationMin: 14 },
      { id: 'MC15-L5', title: 'Tail Risk Hedging Principles (The Taleb Model)', summary: 'Allocating 1-2% annually to deep out-of-the-money puts to monetize Black Swans.', durationMin: 14 }
    ],
    includedCalculators: ['Protective Collar Payoff Simulator'],
    researchPaperIds: ['paper-01'],
    practicalAssignment: 'Calculate the exact strike and cost of a 10% out-of-the-money 90-day protective put on a portfolio.'
  },
  {
    id: 'MC16',
    number: 16,
    title: 'Quantitative Strategy Development Pipeline',
    lessonsCount: 5,
    durationMinutes: 75,
    prerequisite: 'MC04 Advanced Backtesting',
    category: 'Quantitative Analysis',
    description: 'The end-to-end institutional workflow: ideation, alpha signal generation, portfolio optimization, transaction cost modeling, and execution routing.',
    lessons: [
      { id: 'MC16-L1', title: 'From Economic Rationale to Mathematical Factor', summary: 'Why every quantitative factor must have a fundamental or behavioral reason to exist.', durationMin: 15 },
      { id: 'MC16-L2', title: 'Alpha Factor Cross-Sectional Ranking', summary: 'Creating standardized z-scores across asset universes to rank relative attractiveness.', durationMin: 15 },
      { id: 'MC16-L3', title: 'Information Coefficient (IC) & Factor Decay', summary: 'Measuring the predictive power and lifespan of quantitative signals over time.', durationMin: 15 },
      { id: 'MC16-L4', title: 'Portfolio Optimization Constraints', summary: 'Enforcing sector neutralities, maximum single-stock weights, and turnover constraints.', durationMin: 15 },
      { id: 'MC16-L5', title: 'Paper Trading & Live Incubation Protocols', summary: 'The mandatory 90-day live incubation phase before allocating institutional capital.', durationMin: 15 }
    ],
    includedCalculators: ['Information Coefficient Calculator'],
    researchPaperIds: ['paper-09'],
    practicalAssignment: 'Design an alpha signal based on 20-day momentum and calculate its rank correlation to subsequent 5-day returns.'
  },
  {
    id: 'MC17',
    number: 17,
    title: 'Market Structure & Institutional Flow Architecture',
    lessonsCount: 5,
    durationMinutes: 70,
    prerequisite: 'Phase 2 & MC02',
    category: 'Price Action & Flow',
    description: 'Break of structure (BOS), change of character (CHoCH), premium vs discount pricing, and institutional order block validation.',
    lessons: [
      { id: 'MC17-L1', title: 'Fractal Market Structure: Major vs Minor Swings', summary: 'Mapping true higher timeframe swing points without getting lost in intraday sub-waves.', durationMin: 14 },
      { id: 'MC17-L2', title: 'Break of Structure (BOS) vs Change of Character (CHoCH)', summary: 'Identifying the exact structural pivot where an auction shifts from trend to reversal.', durationMin: 14 },
      { id: 'MC17-L3', title: 'Premium vs Discount Pricing (Fibonacci 50% Equilibrium)', summary: 'Why institutions only buy in discount (lower 50%) and sell in premium (upper 50%).', durationMin: 14 },
      { id: 'MC17-L4', title: 'Institutional Order Block Validation Criteria', summary: 'Separating high-probability order blocks from random consolidation bars.', durationMin: 14 },
      { id: 'MC17-L5', title: 'The Complete Smart Money Execution Blueprint', summary: 'Combining HTF bias, liquidity sweep, displacement candle, and FVG entry.', durationMin: 14 }
    ],
    includedCalculators: ['Premium/Discount Equilibrium Range Tool'],
    researchPaperIds: ['paper-02'],
    practicalAssignment: 'Identify 3 valid Change of Character (CHoCH) shifts on a 1-hour chart and verify if a 50% retracement occurred.'
  },
  {
    id: 'MC18',
    number: 18,
    title: 'Professional Performance Attribution',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'Phase 10 Professional Practice',
    category: 'Professional Practice',
    description: 'Deconstruct returns using the Brinson-Fachler model, Fama-French multi-factor regressions, and Sharpe style analysis to pinpoint exact alpha sources.',
    lessons: [
      { id: 'MC18-L1', title: 'The Brinson-Fachler Attribution Model', summary: 'Separating asset allocation decisions, selection decisions, and interaction effects.', durationMin: 13 },
      { id: 'MC18-L2', title: 'Fama-French 3-Factor & 5-Factor Regressions', summary: 'Proving whether your trading returns come from market beta, size, value, or true alpha.', durationMin: 14 },
      { id: 'MC18-L3', title: 'Maximum Adverse Excursion (MAE) & Maximum Favorable Excursion (MFE)', summary: 'Auditing your entry precision and exit efficiency across all closed trades.', durationMin: 13 },
      { id: 'MC18-L4', title: 'The Gain-to-Pain Ratio & The Ulcer Index', summary: 'Alternative performance metrics that penalize volatility and long drawdowns heavily.', durationMin: 12 },
      { id: 'MC18-L5', title: 'Building Your Monthly Institutional Audit Report', summary: 'Standardizing executive performance decks for prop firm audits or investor review.', durationMin: 13 }
    ],
    includedCalculators: ['MAE/MFE Efficiency Analyzer'],
    researchPaperIds: ['paper-01', 'paper-08'],
    practicalAssignment: 'Calculate the MFE (Maximum Favorable Excursion) on your last 10 winners to see if you left more than 50% on the table.'
  },
  {
    id: 'MC19',
    number: 19,
    title: 'Central Bank Policy Analysis & Rate Differentials',
    lessonsCount: 5,
    durationMinutes: 70,
    prerequisite: 'Phase 6 Macro',
    category: 'Macro Economics',
    description: 'Taylor Rule modeling, Fed dot plots, OIS (Overnight Index Swaps) market probabilities, forward guidance, and trading FOMC press conferences.',
    lessons: [
      { id: 'MC19-L1', title: 'The Taylor Rule: Estimating Equilibrium Policy Rates', summary: 'Mathematical modeling of where central banks should set rates based on inflation and GDP gaps.', durationMin: 14 },
      { id: 'MC19-L2', title: 'Reading CME FedWatch & SOFR Futures Curve', summary: 'How institutional bond desks price cut/hike probabilities into short-term debt.', durationMin: 14 },
      { id: 'MC19-L3', title: 'Decoding FOMC Statements & Forward Guidance Linguistic Shifts', summary: 'Analyzing hawk-to-dove semantic word replacements in official policy releases.', durationMin: 14 },
      { id: 'MC19-L4', title: 'The Carry Trade Mechanics & Unhedged Currency Flow', summary: 'Borrowing low-yielding currencies (JPY) to fund high-yielding debt (USD/INR) and unwinds.', durationMin: 14 },
      { id: 'MC19-L5', title: 'Playbook for Trading Rate Decision Days', summary: 'Pre-event positioning, immediate headline reaction, and Powell/Lagarde presser execution.', durationMin: 14 }
    ],
    includedCalculators: ['Taylor Rule Rate Estimator', 'CME Rate Probability Tool'],
    researchPaperIds: ['paper-11'],
    practicalAssignment: 'Review the latest FOMC Dot Plot and calculate the market-implied terminal rate versus the Fed median forecast.'
  },
  {
    id: 'MC20',
    number: 20,
    title: 'Cross-Market Intermarket Analysis',
    lessonsCount: 5,
    durationMinutes: 65,
    prerequisite: 'Phase 6 & MC08',
    category: 'Macro Economics',
    description: 'The interconnections between Commodities, Currencies, Bonds, and Equities: John Murphy\'s intermarket laws and leading economic signals.',
    lessons: [
      { id: 'MC20-L1', title: 'The Four Pillars: Stocks, Bonds, Commodities, Currencies', summary: 'How capital flows cyclically through the four asset super-classes.', durationMin: 13 },
      { id: 'MC20-L2', title: 'Bonds Lead Stocks: The Credit Market Alarm System', summary: 'Why high-yield credit spreads widen weeks before stock market corrections.', durationMin: 13 },
      { id: 'MC20-L3', title: 'Copper & The "Dr. Copper" Economic Barometer', summary: 'Using industrial metal demand to predict global manufacturing and GDP expansions.', durationMin: 13 },
      { id: 'MC20-L4', title: 'Crude Oil, Inflation Expectations & The Energy Pass-Through', summary: 'How Brent/WTI crude pricing shifts breakeven inflation rates and treasury yields.', durationMin: 13 },
      { id: 'MC20-L5', title: 'Constructing an Intermarket Risk Radar', summary: 'Tracking 6 core ratios: HYG/LQD, AUD/JPY, XAU/WTI, SPX/TLT to identify market turnarounds.', durationMin: 13 }
    ],
    includedCalculators: ['Credit Spread Risk Radar'],
    researchPaperIds: ['paper-10', 'paper-12'],
    practicalAssignment: 'Track the ratio of High Yield Bonds (HYG) to Investment Grade (LQD) over the last 60 days to audit credit appetite.'
  },
  {
    id: 'MC21',
    number: 21,
    title: 'Research Documentation & Empirical Standards',
    lessonsCount: 5,
    durationMinutes: 60,
    prerequisite: 'Phase 10 Professional Practice',
    category: 'Professional Practice',
    description: 'Write reproducible research notes, maintain audit trails, version-control quantitative code, and follow institutional peer review standards.',
    lessons: [
      { id: 'MC21-L1', title: 'The Institutional Research Standard', summary: 'Why memory is unreliable and documented process is the only asset that scales.', durationMin: 12 },
      { id: 'MC21-L2', title: 'Structuring an Investment Thesis Memorandum', summary: 'Writing Context, Hypothesis, Empirical Proof, Invalidation Points, and Sizing.', durationMin: 12 },
      { id: 'MC21-L3', title: 'Version Control & Audit Logging for Trading Models', summary: 'Tracking model parameter modifications and rationale to prevent revisionist history.', durationMin: 12 },
      { id: 'MC21-L4', title: 'The Post-Mortem Protocol on Systemic Losses', summary: 'Conducting non-defensive post-trade audits when systems hit maximum drawdown.', durationMin: 12 },
      { id: 'MC21-L5', title: 'Peer Review & Devil\'s Advocate Challenge Sessions', summary: 'Inviting critical counter-arguments to destroy your thesis before risking real money.', durationMin: 12 }
    ],
    includedCalculators: ['Research Memo Generator'],
    researchPaperIds: ['paper-15'],
    practicalAssignment: 'Write a full 1-page Research Memorandum for your primary trading setup using the TradeVault template.'
  },
  {
    id: 'MC22',
    number: 22,
    title: 'Evidence-Based Strategy Building',
    lessonsCount: 5,
    durationMinutes: 70,
    prerequisite: 'All Prior Masterclasses',
    category: 'Quantitative Analysis',
    description: 'The capstone masterclass: synthesizing David Aronson\'s evidence-based technical analysis principles to build institutional, audited trading strategies.',
    lessons: [
      { id: 'MC22-L1', title: 'Subjective vs Objective Technical Analysis', summary: 'Replacing arbitrary hand-drawn lines with mathematically verifiable rule sets.', durationMin: 14 },
      { id: 'MC22-L2', title: 'The Data-Mining Bias Correction (White\'s Reality Check)', summary: 'Statistically penalizing the best performing rule among thousands tested.', durationMin: 14 },
      { id: 'MC22-L3', title: 'Signal Combination & Non-Redundant Indicators', summary: 'Pairing price momentum with volume profile and volatility filters to avoid multicollinearity.', durationMin: 14 },
      { id: 'MC22-L4', title: 'Creating the Execution Algorithm & Risk Overlay', summary: 'Embedding dynamic volatility sizing and daily circuit breakers directly into code.', durationMin: 14 },
      { id: 'MC22-L5', title: 'Final Certification Capstone: Strategy Submission & Audit', summary: 'The formal TradeVault Academy capstone: submitting your strategy for internal review.', durationMin: 14 }
    ],
    includedCalculators: ['Evidence-Based Strategy Auditor'],
    researchPaperIds: ['paper-08', 'paper-15'],
    practicalAssignment: 'Submit your completed Trading Strategy Playbook with backtest audit, drawdown boundaries, and risk rules.'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 15 CURATED ACADEMIC RESEARCH PAPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ULTRA_RESEARCH_PAPERS: UltraResearchPaper[] = [
  {
    id: 'paper-01',
    title: 'Do Individual Day Traders Make Money? Evidence from Taiwan',
    authors: 'Brad M. Barber, Yi-Tsung Lee, Yu-Jane Liu, Terrance Odean',
    year: 2008,
    source: 'Social Science Research Network (SSRN) / UC Berkeley',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=529063',
    plainSummary: 'Examined all day trading activity on the Taiwan Stock Exchange over 15 years (360,000+ individual traders). Found that the vast majority lose money after transaction costs, while an elite top ~1% generate predictable, abnormal profits net of fees.',
    keyFinding: 'Less than 1% of day traders consistently earn net positive returns after accounting for transaction commissions, bid-ask spreads, and taxes.',
    traderTakeaway: 'Trading is an extreme high-performance skill where transaction cost drag and emotional execution eliminate 99% of unprepared participants. Surviving requires institutional risk discipline.',
    limitations: 'Taiwan market specific during 1995-2006, characterized by high stamp duties and retail dominance without modern zero-fee routing.',
    relatedConceptIds: ['C049', 'C051', 'C057', 'C130']
  },
  {
    id: 'paper-02',
    title: 'Foundations of Technical Analysis: Computational Algorithms and Statistical Inference',
    authors: 'Andrew W. Lo, Harry Mamaysky, Jiang Wang',
    year: 2000,
    source: 'Journal of Finance, Vol. 55, No. 4',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=233816',
    plainSummary: 'MIT researchers used non-parametric kernel regression algorithms to mathematically detect technical chart patterns (head and shoulders, double bottoms) across hundreds of US stocks over 30 years.',
    keyFinding: 'Certain technical chart patterns do provide incremental statistical information and lead to statistically significant shifts in empirical return distributions.',
    traderTakeaway: 'Technical patterns are not pure imagination; they reflect algorithmic and human behavioral clustering that produces slight probabilistic tendencies.',
    limitations: 'Statistical edge is modest and easily erased by excessive transaction costs if traded without proper R:R filters.',
    relatedConceptIds: ['C016', 'C022', 'C023', 'C039']
  },
  {
    id: 'paper-03',
    title: 'Returns to Buying Winners and Selling Losers: Implications for Stock Market Efficiency',
    authors: 'Narasimhan Jegadeesh, Sheridan Titman',
    year: 1993,
    source: 'Journal of Finance, Vol. 48, No. 1',
    url: 'https://www.jstor.org/stable/2328882',
    plainSummary: 'The seminal academic study establishing price momentum: buying assets that performed well over the past 3 to 12 months and shorting past losers generates significant positive abnormal returns.',
    keyFinding: 'Cross-sectional momentum is one of the most persistent and robust market anomalies documented across global asset classes over a century of data.',
    traderTakeaway: 'Trend following and momentum trading have a rigorous, empirically proven basis: winners tend to keep winning due to slow institutional information diffusion.',
    limitations: 'Momentum strategies experience occasional severe "momentum crashes" when market regimes suddenly invert.',
    relatedConceptIds: ['C069', 'C072', 'C125']
  },
  {
    id: 'paper-04',
    title: 'The Disposition to Sell Winners Too Early and Ride Losers Too Long',
    authors: 'Terrance Odean',
    year: 1998,
    source: 'Journal of Finance, Vol. 53, No. 5',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=14187',
    plainSummary: 'Analyzed 10,000 retail brokerage trading accounts. Discovered that traders sell their winning positions significantly faster than their losing positions to lock in the psychological gratification of being right.',
    keyFinding: 'Retail investors held losing trades for an average of 124 days while selling winners after only 102 days, with the sold winning stocks subsequent outperforming the held losing stocks.',
    traderTakeaway: 'The instinctive human urge to grab quick profits and let losers run is the primary psychological bias destroying retail expectancy.',
    limitations: 'Discount brokerage data before modern algorithmic order automation.',
    relatedConceptIds: ['C100', 'C104', 'C106']
  },
  {
    id: 'paper-05',
    title: 'Market Microstructure and Price Discovery in High-Frequency Trading',
    authors: 'Maureen O\'Hara',
    year: 2015,
    source: 'Journal of Financial Economics',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2557432',
    plainSummary: 'Examines how continuous algorithmic trading, sub-millisecond execution, and fragmented electronic order books have transformed how prices are discovered and liquidity is provided.',
    keyFinding: 'Modern market liquidity is largely "phantom liquidity" that vanishes during sudden volatility shocks as automated market making algorithms pull bids simultaneously.',
    traderTakeaway: 'Never rely on thin resting depth in order books during news shocks; liquidity is fleeting and execution slippage can be massive.',
    limitations: 'Equities and futures focus; decentralized OTC crypto markets have even higher fragmentation.',
    relatedConceptIds: ['C002', 'C013', 'C046', 'C128']
  },
  {
    id: 'paper-06',
    title: 'The Cost of Institutional Equity Trades',
    authors: 'Wayne H. Wagner, Michael Edwards',
    year: 1993,
    source: 'Financial Analysts Journal',
    url: 'https://www.cfainstitute.org/en/research/financial-analysts-journal',
    plainSummary: 'Analyzed the complete breakdown of transaction costs for institutional asset managers, detailing commissions, market impact, and timing delays.',
    keyFinding: 'Market impact (pushing the market against oneself) and timing slippage account for over 70% of total trade friction, vastly exceeding explicit broker commissions.',
    traderTakeaway: 'Execution quality, order timing, and patience when working orders into resting liquidity matter as much as stock picking.',
    limitations: 'Pre-dates electronic dark pools, though the physics of market impact remains unchanged.',
    relatedConceptIds: ['C015', 'C049', 'C130']
  },
  {
    id: 'paper-07',
    title: 'International Diversification and the Breakdown of Correlation in Market Crashes',
    authors: 'Patrick Odier, Bruno Solnik',
    year: 1993,
    source: 'Financial Analysts Journal',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=24159',
    plainSummary: 'Investigated global cross-asset correlations during peaceful versus turbulent market periods. Proved that correlations spike toward 1.0 during severe crashes.',
    keyFinding: 'Assets that appear uncorrelated in calm markets experience correlation spikes during liquidity selloffs as global investors liquidate everything for cash.',
    traderTakeaway: 'True downside diversification requires non-correlated strategies (like Trend Following or Cash), not just owning a basket of different equities.',
    limitations: 'Cross-border capital restrictions were higher in the early 1990s.',
    relatedConceptIds: ['C064', 'C122', 'C123']
  },
  {
    id: 'paper-08',
    title: 'The Deflated Sharpe Ratio: Correcting for Selection Bias, Backtest Overfitting and Non-Normality',
    authors: 'David H. Bailey, Marcos López de Prado',
    year: 2014,
    source: 'Journal of Portfolio Management',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2460551',
    plainSummary: 'Introduces a mathematical framework (the Deflated Sharpe Ratio) to adjust standard Sharpe ratios downward based on how many strategy variations and parameters were tested.',
    keyFinding: 'Testing just 20 different parameter variations on a random data series produces a 95% probability of discovering a "statistically significant" false strategy with a Sharpe > 1.5.',
    traderTakeaway: 'Backtest overfitting is the most prevalent form of self-deception in trading. Always penalize your Sharpe ratio based on trial count.',
    limitations: 'Requires tracking the exact count of all failed parameter iterations.',
    relatedConceptIds: ['C112', 'C115', 'C116', 'C118']
  },
  {
    id: 'paper-09',
    title: 'Pseudo-Mathematics and Financial Charlatanism: The Effects of Backtest Overfitting on Out-of-Sample Performance',
    authors: 'David H. Bailey, Jonathan Borwein, Marcos López de Prado, Qiji Jim Zhu',
    year: 2014,
    source: 'Notices of the American Mathematical Society',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2308659',
    plainSummary: 'Demonstrates mathematically how easy it is to produce historical backtests with astronomical Sharpe ratios that have zero true predictive power in live markets.',
    keyFinding: 'Any strategy optimized on in-sample data without rigorous walk-forward and out-of-sample holds will inevitably collapse live.',
    traderTakeaway: 'Never trust a backtest that has not been verified on fresh out-of-sample data or forward paper testing.',
    limitations: 'Focuses heavily on mathematical modeling rather than manual discretionary trading.',
    relatedConceptIds: ['C078', 'C079', 'C116']
  },
  {
    id: 'paper-10',
    title: 'Macroeconomic News and Asset Prices in Real Time',
    authors: 'Roberto Rigobon, Brian Sack',
    year: 2008,
    source: 'Journal of Monetary Economics',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=320142',
    plainSummary: 'Measured the high-frequency tick reaction of Treasury yields, stock indices, and exchange rates to scheduled US economic announcements (CPI, NFP, GDP).',
    keyFinding: 'Asset prices incorporate over 85% of the surprise component of macroeconomic releases within the first 60 to 120 seconds following publication.',
    traderTakeaway: 'Do not attempt to front-run news headlines with manual market orders; trade the subsequent multi-day structural trend or post-announcement retracement.',
    limitations: 'Focuses on US releases; emerging markets like India show slightly longer price adjustment windows.',
    relatedConceptIds: ['C073', 'C081', 'C083', 'C095']
  },
  {
    id: 'paper-11',
    title: 'Federal Reserve Policy Actions and Market Expectations: A High-Frequency Assessment',
    authors: 'Refet S. Gürkaynak, Brian Sack, Eric T. Swanson',
    year: 2005,
    source: 'American Economic Review',
    url: 'https://www.aeaweb.org/articles?id=10.1257/0002828053828446',
    plainSummary: 'Separated FOMC policy statements into two distinct dimensions: the immediate "target rate" decision vs the "path" of future interest rates conveyed by forward guidance.',
    keyFinding: 'Market bond yields and currencies react far more violently to forward guidance language (the future expected path) than to the current 25 bps rate change itself.',
    traderTakeaway: 'Pay closer attention to central bank press conferences and linguistic trajectory shifts than the raw rate number on the calendar.',
    limitations: 'Analyzed the Greenspan era before modern Quantitative Easing (QE) balance sheet expansion tools.',
    relatedConceptIds: ['C085', 'C086', 'C094']
  },
  {
    id: 'paper-12',
    title: 'Is Gold a Safe Haven? International Evidence',
    authors: 'Dirk G. Baur, Brian M. Lucey',
    year: 2010,
    source: 'Journal of Banking & Finance',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1436154',
    plainSummary: 'Investigated whether Gold acts as a hedge (uncorrelated on average) or a safe haven (holding value during extreme market selloffs) across global markets.',
    keyFinding: 'Gold is a definitive safe haven during extreme stock market crash days, but its safe haven duration is typically short (10 to 15 days) before normal macro factors re-emerge.',
    traderTakeaway: 'Gold surges during immediate geopolitical and financial panic, but long-term Gold prices are governed by US real interest rates and dollar strength.',
    limitations: 'Historical data through 2008; central bank physical gold accumulation has accelerated post-2022.',
    relatedConceptIds: ['C007', 'C092', 'C093']
  },
  {
    id: 'paper-13',
    title: 'Volatility Clustering, Fat Tails, and the ARCH Model',
    authors: 'Robert F. Engle',
    year: 1982,
    source: 'Econometrica, Vol. 50, No. 4',
    url: 'https://www.jstor.org/stable/1912773',
    plainSummary: 'Nobel prize-winning discovery proving that market volatility is not constant over time: large price changes tend to be followed by large price changes, and small by small.',
    keyFinding: 'Volatility clusters systematically in financial markets, allowing statistical modeling of future volatility regimes using Autoregressive Conditional Heteroskedasticity (ARCH).',
    traderTakeaway: 'Periods of calm consolidation are mathematically guaranteed to be followed by high-volatility expansions; position sizes must adapt dynamically.',
    limitations: 'ARCH models struggle with sudden exogenous geopolitical jumps.',
    relatedConceptIds: ['C014', 'C030', 'C032', 'C110']
  },
  {
    id: 'paper-14',
    title: 'Trading is Hazardous to Your Wealth: The Common Stock Investment Performance of Individual Investors',
    authors: 'Brad M. Barber, Terrance Odean',
    year: 2000,
    source: 'Journal of Finance, Vol. 55, No. 2',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=219228',
    plainSummary: 'Examined 66,465 households with accounts at a large discount broker. Found that households that traded most frequently earned the lowest net returns.',
    keyFinding: 'The top 20% highest turnover traders lagged the market by an average of 6.5% annually due to trading costs and emotional overconfidence.',
    traderTakeaway: 'Patience and selective setup execution dramatically outperform hyperactive daily churning of your portfolio.',
    limitations: 'Focused on retail stock accounts in the late 1990s tech bubble.',
    relatedConceptIds: ['C099', 'C103', 'C107']
  },
  {
    id: 'paper-15',
    title: 'Evidence-Based Technical Analysis: Applying the Scientific Method and Statistical Logic',
    authors: 'David R. Aronson',
    year: 2006,
    source: 'John Wiley & Sons, Inc.',
    url: 'https://www.wiley.com/en-us/Evidence+Based+Technical+Analysis',
    plainSummary: 'Tested 6,402 technical trading rules across 100 years of S&P 500 data using White\'s Reality Check to correct for data-mining bias.',
    keyFinding: 'Most classic chart indicators fail statistical significance once data-mining corrections are applied, but a minority of objective momentum and trend rules hold robust edge.',
    traderTakeaway: 'Strip away subjective guru folklore. Keep trading rules objective, mathematically testable, and rigorously audited against false discovery rates.',
    limitations: 'Focuses on end-of-day daily equity data.',
    relatedConceptIds: ['C078', 'C115', 'C118', 'C135']
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. TOP 30 PROFESSIONAL TRADING BOOKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ULTRA_BOOKS_LIBRARY: UltraBook[] = [
  {
    id: 1,
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    year: 2000,
    category: 'Psychology',
    level: 'Beginner',
    keyLesson: 'Mastering the probability mindset: decoupling individual trade outcomes from your statistical edge.',
    whyRecommended: 'The undisputed masterwork on trading psychology. Replaces fear, greed, and frustration with probabilistic thinking.',
    freeAlternative: 'Mark Douglas 4-part live seminar archives available on YouTube.',
    externalSearchQuery: 'Trading in the Zone Mark Douglas'
  },
  {
    id: 2,
    title: 'Market Wizards: Interviews with Top Traders',
    author: 'Jack D. Schwager',
    year: 1989,
    category: 'Wisdom',
    level: 'Beginner',
    keyLesson: 'Elite traders use wildly different strategies, but every single one shares ironclad risk management discipline.',
    whyRecommended: 'Deep psychological interviews with trading legends (Druckenmiller, Jones, Seykota, Kovner) demonstrating real market grit.',
    externalSearchQuery: 'Market Wizards Jack Schwager'
  },
  {
    id: 3,
    title: 'Reminiscences of a Stock Operator',
    author: 'Edwin Lefèvre',
    year: 1923,
    category: 'Wisdom',
    level: 'Beginner',
    keyLesson: 'Human nature never changes in financial markets: fear, greed, hope, and ignorance remain constant over centuries.',
    whyRecommended: 'The timeless fictionalized biography of Jesse Livermore. Essential reading for understanding market sentiment and tape reading.',
    freeAlternative: 'Public domain audiobook freely available on LibriVox.',
    externalSearchQuery: 'Reminiscences of a Stock Operator Edwin Lefevre'
  },
  {
    id: 4,
    title: 'Technical Analysis of the Financial Markets',
    author: 'John J. Murphy',
    year: 1999,
    category: 'Technical',
    level: 'Intermediate',
    keyLesson: 'The comprehensive dictionary of classical chart patterns, moving averages, volume confirmation, and oscillators.',
    whyRecommended: 'Known across Wall Street as the "Bible of Technical Analysis" used for CMT (Chartered Market Technician) certification.',
    externalSearchQuery: 'Technical Analysis of Financial Markets John Murphy'
  },
  {
    id: 5,
    title: 'Trade Your Way to Financial Freedom',
    author: 'Dr. Van K. Tharp',
    year: 1998,
    category: 'Risk/Position',
    level: 'Intermediate',
    keyLesson: 'Position sizing accounts for 90% of trading performance; setups account for less than 10%.',
    whyRecommended: 'Introduced the revolutionary R-multiple framework and mathematical expectancy model to retail traders.',
    externalSearchQuery: 'Trade Your Way to Financial Freedom Van Tharp'
  },
  {
    id: 6,
    title: 'Way of the Turtle',
    author: 'Curtis M. Faith',
    year: 2007,
    category: 'Strategy',
    level: 'Intermediate',
    keyLesson: 'How Richard Dennis taught complete novices to make hundreds of millions using systematic trend following.',
    whyRecommended: 'Provides the exact, complete mathematical rules for the famous Turtle Trading System (entry, sizing, stops).',
    externalSearchQuery: 'Way of the Turtle Curtis Faith'
  },
  {
    id: 7,
    title: 'The Disciplined Trader',
    author: 'Mark Douglas',
    year: 1990,
    category: 'Psychology',
    level: 'Intermediate',
    keyLesson: 'Developing self-discipline to navigate an environment with total psychological freedom and zero external boundaries.',
    whyRecommended: 'Mark Douglas\'s earlier foundational work on emotional trauma, fear of loss, and rule enforcement.',
    externalSearchQuery: 'The Disciplined Trader Mark Douglas'
  },
  {
    id: 8,
    title: 'Japanese Candlestick Charting Techniques',
    author: 'Steve Nison',
    year: 1991,
    category: 'Technical',
    level: 'Beginner',
    keyLesson: 'The definitive Western introduction to Eastern candlestick charting, Dojis, Hammers, and multi-candle formations.',
    whyRecommended: 'Steve Nison personally brought candlesticks from Japan to the West; this is the authoritative original text.',
    externalSearchQuery: 'Japanese Candlestick Charting Techniques Steve Nison'
  },
  {
    id: 9,
    title: 'Evidence-Based Technical Analysis',
    author: 'David R. Aronson',
    year: 2006,
    category: 'Quant',
    level: 'Advanced',
    keyLesson: 'Applying scientific hypothesis testing and White\'s Reality Check to debunk subjective chart folklore.',
    whyRecommended: 'The ultimate reality check for chart readers: bridges technical analysis with academic statistics.',
    externalSearchQuery: 'Evidence-Based Technical Analysis David Aronson'
  },
  {
    id: 10,
    title: 'How I Made $2,000,000 in the Stock Market',
    author: 'Nicolas Darvas',
    year: 1960,
    category: 'Strategy',
    level: 'Beginner',
    keyLesson: 'The Darvas Box theory: buying high-momentum stocks breaking out to all-time highs with trailing stop losses.',
    whyRecommended: 'A classic real-world account of a professional dancer who developed a breakout trading edge from hotels.',
    freeAlternative: 'Public domain text online.',
    externalSearchQuery: 'How I Made 2000000 in Stock Market Nicolas Darvas'
  },
  {
    id: 11,
    title: 'Algorithmic Trading: Winning Strategies and Their Rationale',
    author: 'Dr. Ernest P. Chan',
    year: 2013,
    category: 'Quant',
    level: 'Advanced',
    keyLesson: 'Mean reversion, momentum, and statistical pairs trading using cointegration and Python/Matlab backtests.',
    whyRecommended: 'The standard entry textbook for quantitative algorithmic traders with fully reproducible code and formulas.',
    externalSearchQuery: 'Algorithmic Trading Ernie Chan'
  },
  {
    id: 12,
    title: 'Quantitative Trading: How to Build Your Own Algorithmic Business',
    author: 'Dr. Ernest P. Chan',
    year: 2008,
    category: 'Quant',
    level: 'Advanced',
    keyLesson: 'Setting up retail quantitative trading infrastructure, backtesting data pipelines, and execution servers.',
    whyRecommended: 'Practical, no-nonsense roadmap for individual retail quants building algorithmic systems.',
    externalSearchQuery: 'Quantitative Trading Ernie Chan'
  },
  {
    id: 13,
    title: 'Active Portfolio Management: A Quantitative Approach',
    author: 'Richard C. Grinold & Ronald N. Kahn',
    year: 1999,
    category: 'Academic',
    level: 'Research',
    keyLesson: 'The Fundamental Law of Active Management: IR = IC × √Breadth.',
    whyRecommended: 'The primary institutional text used by quantitative hedge funds (Barclays Global Investors, BlackRock).',
    externalSearchQuery: 'Active Portfolio Management Grinold Kahn'
  },
  {
    id: 14,
    title: 'The Quants: How a New Breed of Math Whizzes Conquered Wall Street',
    author: 'Scott Patterson',
    year: 2010,
    category: 'Wisdom',
    level: 'Intermediate',
    keyLesson: 'The history of quantitative finance (Jim Simons, Ed Thorp, Cliff Asness) and the 2007 "Quant Meltdown".',
    whyRecommended: 'Gripping historical narrative that teaches the dangers of correlation breakdown when models crowd into identical trades.',
    externalSearchQuery: 'The Quants Scott Patterson'
  },
  {
    id: 15,
    title: 'Inside the Black Box: A Simple Guide to Quantitative and High-Frequency Trading',
    author: 'Rishi K. Narang',
    year: 2013,
    category: 'Quant',
    level: 'Advanced',
    keyLesson: 'Deconstructing the quantitative "black box" into alpha models, risk models, transaction cost models, and execution.',
    whyRecommended: 'Crystal-clear explanation of how quantitative funds operate without getting bogged down in equations.',
    externalSearchQuery: 'Inside the Black Box Rishi Narang'
  },
  {
    id: 16,
    title: 'Statistical Arbitrage: Algorithmic Trading Insights and Techniques',
    author: 'Andrew Pole',
    year: 2007,
    category: 'Quant',
    level: 'Advanced',
    keyLesson: 'Pairs trading mathematics, Kalman filters, spread stationarity, and cointegration testing.',
    whyRecommended: 'Mastery guide for market-neutral statistical arbitrage strategies.',
    externalSearchQuery: 'Statistical Arbitrage Andrew Pole'
  },
  {
    id: 17,
    title: 'Advances in Financial Machine Learning',
    author: 'Marcos López de Prado',
    year: 2018,
    category: 'Academic',
    level: 'Research',
    keyLesson: 'Fractionally differentiated features, triple barrier labeling, and purging/embargoing to prevent data leakage.',
    whyRecommended: 'The gold standard text on applying modern machine learning correctly to financial time-series data.',
    externalSearchQuery: 'Advances in Financial Machine Learning Lopez de Prado'
  },
  {
    id: 18,
    title: 'Machine Learning for Asset Managers',
    author: 'Marcos López de Prado',
    year: 2020,
    category: 'Academic',
    level: 'Research',
    keyLesson: 'Hierarchical Risk Parity (HRP), denoising covariance matrices, and detecting false trading strategies.',
    whyRecommended: 'Concise Cambridge University Press monograph on modern institutional portfolio construction.',
    externalSearchQuery: 'Machine Learning for Asset Managers Lopez de Prado'
  },
  {
    id: 19,
    title: 'Market Microstructure Theory',
    author: 'Maureen O\'Hara',
    year: 1995,
    category: 'Academic',
    level: 'Research',
    keyLesson: 'The economics of bid-ask spreads, order matching dynamics, and asymmetric information models.',
    whyRecommended: 'The seminal academic foundation for anyone wanting to understand how orders actually fill at the exchange.',
    externalSearchQuery: 'Market Microstructure Theory Maureen OHara'
  },
  {
    id: 20,
    title: 'Options, Futures, and Other Derivatives',
    author: 'John C. Hull',
    year: 2021,
    category: 'Academic',
    level: 'Advanced',
    keyLesson: 'The Black-Scholes-Merton options pricing model, Greeks, binomial trees, and volatility smiles.',
    whyRecommended: 'Known as the universal "Bible of Derivatives" taught in every top MBA and financial engineering master\'s program.',
    externalSearchQuery: 'Options Futures and Other Derivatives John Hull'
  },
  {
    id: 21,
    title: 'A Random Walk Down Wall Street',
    author: 'Burton G. Malkiel',
    year: 1973,
    category: 'Academic',
    level: 'Intermediate',
    keyLesson: 'The Efficient Market Hypothesis (EMH) and why beating the market consistently is exceptionally difficult.',
    whyRecommended: 'Essential reading to understand the academic null hypothesis you are trying to overcome as a trader.',
    externalSearchQuery: 'A Random Walk Down Wall Street Malkiel'
  },
  {
    id: 22,
    title: 'Dynamic Hedging: Managing Vanilla and Exotic Options',
    author: 'Nassim Nicholas Taleb',
    year: 1997,
    category: 'Academic',
    level: 'Research',
    keyLesson: 'Practical options trading from a former floor pit trader: gamma risk, skew, and discrete delta hedging.',
    whyRecommended: 'Taleb\'s only purely technical trading book; reveals how professional options market makers truly manage risk.',
    externalSearchQuery: 'Dynamic Hedging Nassim Nicholas Taleb'
  },
  {
    id: 23,
    title: 'The Black Swan: The Impact of the Highly Improbable',
    author: 'Nassim Nicholas Taleb',
    year: 2007,
    category: 'Wisdom',
    level: 'Intermediate',
    keyLesson: 'Fat-tailed distributions, rare extreme events (Black Swans), and the dangerous illusion of predictive certainty.',
    whyRecommended: 'Fundamentally reshapes how you think about risk, stop losses, and financial survivability.',
    externalSearchQuery: 'The Black Swan Nassim Nicholas Taleb'
  },
  {
    id: 24,
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    year: 2011,
    category: 'Behavioral',
    level: 'Beginner',
    keyLesson: 'System 1 (fast, emotional, impulsive) vs System 2 (slow, deliberative, logical) thinking in human decision-making.',
    whyRecommended: 'Written by the Nobel laureate father of behavioral economics. Explains every cognitive bias that ruins traders.',
    externalSearchQuery: 'Thinking Fast and Slow Daniel Kahneman'
  },
  {
    id: 25,
    title: 'Misbehaving: The Making of Behavioral Economics',
    author: 'Richard H. Thaler',
    year: 2015,
    category: 'Behavioral',
    level: 'Intermediate',
    keyLesson: 'How real human beings deviate systematically from rational economic theory: mental accounting, fairness, nudges.',
    whyRecommended: 'Entertaining, deeply insightful exploration of market inefficiencies born of human irrationality by a Nobel laureate.',
    externalSearchQuery: 'Misbehaving Richard Thaler'
  },
  {
    id: 26,
    title: 'Beyond Greed and Fear: Understanding Behavioral Finance',
    author: 'Hersh Shefrin',
    year: 2002,
    category: 'Behavioral',
    level: 'Intermediate',
    keyLesson: 'Heuristic-driven bias and frame dependence among professional fund managers, analysts, and retail investors.',
    whyRecommended: 'The premier practitioner guide to applied behavioral finance in investment management.',
    externalSearchQuery: 'Beyond Greed and Fear Hersh Shefrin'
  },
  {
    id: 27,
    title: 'Irrational Exuberance',
    author: 'Robert J. Shiller',
    year: 2000,
    category: 'Behavioral',
    level: 'Intermediate',
    keyLesson: 'The structural, cultural, and psychological factors driving speculative bubbles (dot-com bubble, real estate).',
    whyRecommended: 'Published by Nobel laureate Shiller right at the March 2000 dot-com peak; masterclass in bubble anatomy.',
    externalSearchQuery: 'Irrational Exuberance Robert Shiller'
  },
  {
    id: 28,
    title: 'Predictably Irrational: The Hidden Forces That Shape Our Decisions',
    author: 'Dan Ariely',
    year: 2008,
    category: 'Behavioral',
    level: 'Beginner',
    keyLesson: 'Human decision-making is not merely irrational, but predictably irrational in reproducible laboratory settings.',
    whyRecommended: 'Fascinating experiments revealing how social norms, anchoring, and pricing relativity distort judgment.',
    externalSearchQuery: 'Predictably Irrational Dan Ariely'
  },
  {
    id: 29,
    title: 'Zerodha Varsity (Complete Modules 1-13)',
    author: 'Karthik Rangappa & Zerodha Team',
    year: 2024,
    category: 'India',
    level: 'Beginner',
    keyLesson: 'Comprehensive, institutional-quality modules covering technical analysis, futures, options, risk management, and Indian markets.',
    whyRecommended: 'The absolute finest 100% free trading education platform in India. Zero commercial upsells, pristine clarity.',
    freeAlternative: 'Available completely free at zerodha.com/varsity and the Varsity mobile app.',
    externalSearchQuery: 'Zerodha Varsity trading modules'
  },
  {
    id: 30,
    title: 'How to Avoid Loss and Earn Consistently in the Stock Market',
    author: 'Prasenjit Paul',
    year: 2015,
    category: 'India',
    level: 'Beginner',
    keyLesson: 'Capital preservation and disciplined stock selection principles tailored specifically to the Indian NSE/BSE ecosystem.',
    whyRecommended: 'Clear, practical Indian market guide emphasizing risk management and avoiding speculative penny stock traps.',
    externalSearchQuery: 'Prasenjit Paul How to Avoid Loss'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. FORMULA COMPENDIUM (75+ Formulas across 7 sections)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ULTRA_FORMULAS_COMPENDIUM: FormulaCompendiumEntry[] = [
  // Section 1: Risk & Position Sizing
  {
    id: 'F01',
    name: 'Fixed-Fractional Dollar Risk',
    section: 'Risk & Sizing',
    formula: 'Risk_$ = Equity × Risk_%',
    variables: [
      { symbol: 'Equity', meaning: 'Current net account balance ($ or ₹)' },
      { symbol: 'Risk_%', meaning: 'Max fraction risked per trade (e.g. 0.01 for 1%)' }
    ],
    workedExample: '$25,000 Equity × 0.01 (1%) = $250.00 maximum loss allowed.',
    commonMistake: 'Calculating on total position size instead of stop distance risk.',
    calculatorKey: 'pos-size'
  },
  {
    id: 'F02',
    name: 'Position Sizing by Stop Distance',
    section: 'Risk & Sizing',
    formula: 'Position_Units = Risk_$ / (Entry_Price - Stop_Price)',
    variables: [
      { symbol: 'Risk_$', meaning: 'Maximum dollar capital at risk' },
      { symbol: 'Entry_Price', meaning: 'Intended fill entry price' },
      { symbol: 'Stop_Price', meaning: 'Structural invalidation price' }
    ],
    workedExample: '$100 Risk / ($2,500 Entry - $2,480 Stop = $20 Distance) = 5.0 units.',
    commonMistake: 'Rounding up units, inadvertently exceeding the defined 1% risk limit.',
    calculatorKey: 'pos-size'
  },
  {
    id: 'F03',
    name: 'Full Kelly Criterion',
    section: 'Risk & Sizing',
    formula: 'f* = (b × p - q) / b',
    variables: [
      { symbol: 'f*', meaning: 'Fraction of total capital to wager' },
      { symbol: 'b', meaning: 'Odds received on win (Reward:Risk ratio)' },
      { symbol: 'p', meaning: 'Probability of winning (Win Rate)' },
      { symbol: 'q', meaning: 'Probability of losing (1 - p)' }
    ],
    workedExample: 'p = 0.50, b = 2.0 (2:1 R:R), q = 0.50 → f* = (2.0 × 0.50 - 0.50) / 2.0 = (1.0 - 0.50) / 2.0 = 0.25 (25% Kelly).',
    commonMistake: 'Using full Kelly in practice; professional desks use Half-Kelly (12.5%) or Quarter-Kelly (6.25%) to survive variance.',
    calculatorKey: 'kelly'
  },
  {
    id: 'F04',
    name: 'Half-Kelly Fraction',
    section: 'Risk & Sizing',
    formula: 'f_half = 0.5 × [(b × p - q) / b]',
    variables: [
      { symbol: 'f_half', meaning: 'Conservative growth fraction' },
      { symbol: 'b, p, q', meaning: 'Kelly standard odds and probabilities' }
    ],
    workedExample: 'Full Kelly = 20% → Half-Kelly = 10% risk. Reduces drawdown variance by over 75% with 75% of maximum growth.',
    commonMistake: 'Failing to re-estimate win rate after market regime shifts.'
  },
  {
    id: 'F05',
    name: 'ATR Volatility-Adjusted Stop Distance',
    section: 'Risk & Sizing',
    formula: 'Stop_Distance = Multiple × ATR(n)',
    variables: [
      { symbol: 'Multiple', meaning: 'Multiplier (typically 1.5 to 2.5)' },
      { symbol: 'ATR(n)', meaning: 'Average True Range over n periods (typically 14)' }
    ],
    workedExample: 'ATR(14) = $12.00, Multiplier = 2.0 → Stop Distance = 2.0 × $12 = $24.00 below entry.',
    commonMistake: 'Using fixed pip stops regardless of whether asset volatility has doubled or halved.'
  },
  // Section 2: Performance & Expectancy Metrics
  {
    id: 'F06',
    name: 'Mathematical Expectancy per Trade',
    section: 'Performance',
    formula: 'EV = (WR × Avg_Win) - (LR × Avg_Loss)',
    variables: [
      { symbol: 'WR', meaning: 'Historical Win Rate (e.g. 0.45)' },
      { symbol: 'Avg_Win', meaning: 'Average dollar profit on winning trades' },
      { symbol: 'LR', meaning: 'Loss Rate (1 - WR)' },
      { symbol: 'Avg_Loss', meaning: 'Average dollar loss on losing trades' }
    ],
    workedExample: 'WR = 40% ($300 win), LR = 60% ($100 loss) → EV = (0.40 × 300) - (0.60 × 100) = $120 - $60 = +$60.00/trade.',
    commonMistake: 'Evaluating EV on a sample size smaller than 50 trades.',
    calculatorKey: 'expectancy'
  },
  {
    id: 'F07',
    name: 'Expectancy in R-Multiples',
    section: 'Performance',
    formula: 'EV_R = (WR × Avg_Win_R) - (LR × 1.0)',
    variables: [
      { symbol: 'Avg_Win_R', meaning: 'Average win expressed as a multiple of risk R' },
      { symbol: '1.0', meaning: 'Normalized 1R unit loss' }
    ],
    workedExample: '(0.45 × 2.2R) - (0.55 × 1.0R) = 0.99R - 0.55R = +0.44R per trade.',
    commonMistake: 'Allowing losses to exceed 1.0R, distorting the R-multiple baseline.',
    calculatorKey: 'expectancy'
  },
  {
    id: 'F08',
    name: 'Profit Factor',
    section: 'Performance',
    formula: 'Profit_Factor = Gross_Profits / Gross_Losses',
    variables: [
      { symbol: 'Gross_Profits', meaning: 'Total cumulative dollar wins' },
      { symbol: 'Gross_Losses', meaning: 'Total cumulative dollar losses (absolute value)' }
    ],
    workedExample: '$42,000 wins / $24,000 losses = 1.75 Profit Factor. (>1.5 is good; >2.0 is institutional grade).',
    commonMistake: 'Assuming a high profit factor on 10 trades guarantees long-term viability.'
  },
  {
    id: 'F09',
    name: 'Sharpe Ratio (Annualized)',
    section: 'Performance',
    formula: 'Sharpe = [(R_p - R_f) / σ_p] × √252',
    variables: [
      { symbol: 'R_p', meaning: 'Mean daily portfolio return' },
      { symbol: 'R_f', meaning: 'Risk-free rate (e.g. US Treasury yield)' },
      { symbol: 'σ_p', meaning: 'Daily return standard deviation' },
      { symbol: '√252', meaning: 'Annualization factor for trading days' }
    ],
    workedExample: 'Daily excess return = 0.06%, Daily std dev = 0.8% → (0.0006 / 0.008) × 15.87 = 1.19 Sharpe.',
    commonMistake: 'Treating upside volatility as negative risk (use Sortino instead).'
  },
  {
    id: 'F10',
    name: 'Sortino Ratio',
    section: 'Performance',
    formula: 'Sortino = (R_p - R_f) / σ_downside',
    variables: [
      { symbol: 'σ_downside', meaning: 'Standard deviation of negative returns only (downside semi-variance)' }
    ],
    workedExample: 'Excess return = 12%, Downside deviation = 6% → Sortino = 12% / 6% = 2.0.',
    commonMistake: 'Including positive windfall days in the denominator risk calculation.'
  },
  {
    id: 'F11',
    name: 'Drawdown Recovery Hyperbolic Function',
    section: 'Performance',
    formula: 'Recovery_% = Drawdown_% / (1 - Drawdown_%)',
    variables: [
      { symbol: 'Drawdown_%', meaning: 'Peak-to-trough decline as decimal (e.g. 0.40)' }
    ],
    workedExample: '40% Drawdown: 0.40 / (1 - 0.40) = 0.40 / 0.60 = 0.667 (+66.7% gain needed to recover).',
    commonMistake: 'Assuming an equal percentage gain restores an account after a drawdown.',
    calculatorKey: 'drawdown'
  },
  // Section 3: Statistics & Probability
  {
    id: 'F12',
    name: 'Risk of Ruin (Ralph Vince Formula)',
    section: 'Statistics',
    formula: 'RoR = [(1 - Edge) / (1 + Edge)] ^ (Capital_Units)',
    variables: [
      { symbol: 'Edge', meaning: 'Expected net statistical advantage' },
      { symbol: 'Capital_Units', meaning: 'Account size divided by risk per trade (e.g. $10,000 / $100 = 100 units)' }
    ],
    workedExample: 'Edge = 0.20, Capital Units = 40 → [(0.80) / (1.20)] ^ 40 = (0.667)^40 ≈ 0.00000008 (<0.001% chance of ruin).',
    commonMistake: 'Underestimating ruin risk when capital units drop below 20 (oversizing).',
    calculatorKey: 'ruin'
  },
  {
    id: 'F13',
    name: 'Standard Error of the Mean Return',
    section: 'Statistics',
    formula: 'SE = σ / √N',
    variables: [
      { symbol: 'σ', meaning: 'Sample standard deviation of returns' },
      { symbol: 'N', meaning: 'Total number of closed trades' }
    ],
    workedExample: 'σ = 2.5%, N = 100 trades → SE = 2.5% / √100 = 2.5% / 10 = 0.25%.',
    commonMistake: 'Claiming a strategy edge when the mean return is smaller than 2 times SE.'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. 4 INTERNAL COMPETENCY CERTIFICATION TRACKS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ULTRA_COMPETENCY_TRACKS: CompetencyTrack[] = [
  {
    id: 'track-a',
    code: 'TVA-CMA',
    name: 'Certified Market Analyst (Level 1)',
    targetRole: 'Technical & Fundamental Synthesis Specialist',
    description: 'Validates thorough competence in multi-timeframe price action, support/resistance auction structure, macroeconomic liquidity regimes, and candlestick dynamics.',
    questionCount: 40,
    scenariosCount: 3,
    domainsCovered: ['Market Fundamentals', 'Chart Reading & Technical', 'Fundamental & Macro'],
    prerequisites: 'Complete Phase 0, 1, 2, and 6 in Roadmap',
    badgeName: 'Market Analyst Credential'
  },
  {
    id: 'track-b',
    code: 'TVA-CRS',
    name: 'Certified Risk Specialist (Level 2)',
    targetRole: 'Capital Preservation & Sizing Officer',
    description: 'Validates mathematical mastery of fixed-fractional sizing, stop distance geometry, drawdown recovery limits, portfolio heat, and Ralph Vince risk of ruin models.',
    questionCount: 45,
    scenariosCount: 5,
    domainsCovered: ['Risk Management', 'Orders & Execution', 'Trading Psychology'],
    prerequisites: 'Complete Phase 3, 4, and 7; pass Position Sizing Lab',
    badgeName: 'Risk Guardian Credential'
  },
  {
    id: 'track-c',
    code: 'TVA-CSR',
    name: 'Certified Systematic Researcher (Level 3)',
    targetRole: 'Quantitative Strategy Auditor',
    description: 'Validates institutional research standards: walk-forward backtesting, eliminating look-ahead and survivorship bias, Monte Carlo simulation, and hypothesis testing.',
    questionCount: 50,
    scenariosCount: 4,
    domainsCovered: ['Quantitative Thinking', 'Portfolio Management', 'Professional Concepts'],
    prerequisites: 'Complete Masterclasses MC03, MC04, MC05, MC11',
    badgeName: 'Systematic Researcher Credential'
  },
  {
    id: 'track-d',
    code: 'TVA-MTR',
    name: 'Master Trader & Researcher (Comprehensive)',
    targetRole: 'Institutional-Grade Multi-Asset Trader',
    description: 'The pinnacle TradeVault internal certification: 100 comprehensive questions across all 10 domains, 10 complex live scenario decisions, and an audited Trading Playbook.',
    questionCount: 100,
    scenariosCount: 10,
    domainsCovered: ['All 10 Domains', 'MC01-MC22 Masterclasses'],
    prerequisites: 'All 3 prior tracks + 1 approved Research Project',
    badgeName: 'Master Researcher Fellow'
  }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. HINDI TRADING TERMINOLOGY GLOSSARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface HindiGlossaryItem {
  english: string;
  hindi: string;
  hinglish: string;
  explanation: string;
}

export const HINDI_TRADING_GLOSSARY: HindiGlossaryItem[] = [
  {
    english: 'Position Sizing',
    hindi: 'स्थिति का आकार (Position Size)',
    hinglish: 'Position Sizing',
    explanation: 'Har trade mein kitne shares ya lots khareedne hain taaki aapka risk 1% se zyada na ho.'
  },
  {
    english: 'Risk Management',
    hindi: 'जोखिम प्रबंधन (Risk Management)',
    hinglish: 'Risk Management',
    explanation: 'Apni capital ko nuksan se bachane ke niyam; trading mein sabse zaroori skill.'
  },
  {
    english: 'Stop Loss',
    hindi: 'हानि-रोक आदेश (Stop Loss)',
    hinglish: 'Stop Loss (SL)',
    explanation: 'Ek automatic order jo trade galat jaane par loss ko ek tay seema par kaat deta hai.'
  },
  {
    english: 'Take Profit',
    hindi: 'लाभ-वसूली आदेश (Take Profit)',
    hinglish: 'Take Profit (TP)',
    explanation: 'Target price jahan pahunchte hi aapka profit book ho jata hai.'
  },
  {
    english: 'Drawdown',
    hindi: 'पूंजी में गिरावट (Drawdown)',
    hinglish: 'Drawdown',
    explanation: 'Account ke peak (sabse unche balance) se lekar sabse neeche girne tak ka percentage loss.'
  },
  {
    english: 'Expectancy',
    hindi: 'अपेक्षित मूल्य (Mathematical Expectancy)',
    hinglish: 'Expectancy',
    explanation: 'Har trade par average kitna paisa banega ya dubega over 100 trades.'
  },
  {
    english: 'Win Rate',
    hindi: 'जीत दर (Win Rate)',
    hinglish: 'Win Rate (%)',
    explanation: 'Kul 100 trades mein se kitne trades profit mein band hue.'
  },
  {
    english: 'Leverage',
    hindi: 'उत्तोलन (Leverage)',
    hinglish: 'Leverage',
    explanation: 'Broker se udhaar lekar bade size ka trade lena; zyada leverage se account blow-up ka khatra hota hai.'
  },
  {
    english: 'Margin',
    hindi: 'जमानत राशि (Margin)',
    hinglish: 'Margin',
    explanation: 'Trade open rakhne ke liye broker ke paas jama ki gayi security amount.'
  },
  {
    english: 'Liquidity',
    hindi: 'तरलता (Liquidity)',
    hinglish: 'Liquidity',
    explanation: 'Market mein buyers aur sellers ki sankhya; jahan liquidity zyada hoti hai wahan spread kam hota hai.'
  },
  {
    english: 'Volatility',
    hindi: 'अस्थिरता (Volatility)',
    hinglish: 'Volatility',
    explanation: 'Price kitni tezi se aur kitna bada move karti hai.'
  },
  {
    english: 'Revenge Trading',
    hindi: 'प्रतिशोध व्यापार (Revenge Trading)',
    hinglish: 'Revenge Trading',
    explanation: 'Loss hone ke baad gusse mein aakar turant bina setup ke trade lena jo account khatam kar deta hai.'
  }
];
