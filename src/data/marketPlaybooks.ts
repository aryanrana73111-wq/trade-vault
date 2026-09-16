export interface MarketPlaybookItem {
  id: string;
  symbol: string;
  name: string;
  assetClass: 'Commodities' | 'Crypto' | 'Forex' | 'Equities' | 'Indices';
  liquidityTier: 'Deepest Tier 1' | 'High Institutional Tier 1' | 'Tier 2 Liquid' | 'High Beta Emerging';
  averageDailyVolatility: string;
  typicalSessions: string[];
  majorDrivers: string[];
  macroSensitivities: string[];
  trendBehavior: string;
  rangeBehavior: string;
  breakoutBehavior: string;
  riskConsiderations: string[];
  commonMistakes: string[];
  suitableStrategyFamilies: string[];
  unsuitableConditions: string[];
  executionConsiderations: string[];
  whatToWatch: string[];
}

export type MarketPlaybook = MarketPlaybookItem;

export const MARKET_PLAYBOOKS: MarketPlaybookItem[] = [
  {
    id: 'playbook-xauusd',
    symbol: 'XAU/USD',
    name: 'Spot Gold / US Dollar',
    assetClass: 'Commodities',
    liquidityTier: 'Deepest Tier 1',
    averageDailyVolatility: '1.2% - 2.4% (Typical daily range: $25 - $65)',
    typicalSessions: ['London Open (07:00-11:00 UTC)', 'New York Session / US Cash Open (12:30-17:00 UTC)', 'London Fix (15:00 UTC)'],
    majorDrivers: [
      'US Real Yields (US 10-Year TIPS inverse correlation)',
      'US Dollar Index (DXY) trade-weighted strength',
      'Central Bank Reserve Purchases (PBoC, RBI, CBR)',
      'Geopolitical risk premiums and flight-to-safety capital flows',
      'COMEX Gold futures open interest and ETF liquidation/accumulation cycles'
    ],
    macroSensitivities: [
      'Federal Reserve interest rate projections (dot plot and rate cut expectations)',
      'US CPI, PCE inflation prints, and non-farm payroll surprises',
      'Global sovereign credit spread widenings'
    ],
    trendBehavior: 'Gold exhibits explosive, multi-week momentum bursts when real yields break key psychological levels, punctuated by sharp liquidity purges. Pullbacks during strong macro trends are frequently shallow and front-run by institutional physical buyers.',
    rangeBehavior: 'During neutral rate cycles, Gold establishes clear multi-day liquidity pools, frequently sweeping Asian session highs/lows prior to true London or New York direction establishment.',
    breakoutBehavior: 'High failure rate for breakout trades on lower timeframes (<15m) without US session catalyst volume. Legitimate multi-month breakouts on daily charts tend to yield sustained expansion.',
    riskConsiderations: [
      'Gold volatility can expand 3x instantly during unscheduled geopolitical breaking news.',
      'Slippage during New York open (13:30 UTC) or FOMC releases can exceed standard retail broker tolerance.',
      'Contract sizing is large: 1.0 standard lot on Gold is 100 troy ounces ($10 per $0.10 price delta).'
    ],
    commonMistakes: [
      'Counter-trend shorting during structural real-yield breakdown rallies.',
      'Ignoring the inverse correlation with 10Y real yields (TIPS).',
      'Trading breakout strategies during quiet Asian session consolidation.',
      'Failing to adjust stop-loss width in dollars when daily ATR expands past $45.'
    ],
    suitableStrategyFamilies: [
      'Trend Following (Moving Average Ribbon / Multi-Timeframe Pullback)',
      'Market Structure Liquidity Sweep (Asian Range Sweep into London Open)',
      'Macro Real-Yield Divergence Trading',
      'Breakout & Retest on 1H/4H timeframe with volume confirmation'
    ],
    unsuitableConditions: [
      'Tight scalping during pre-FOMC blackout quiet periods.',
      'Mean-reversion shorting when central bank reserve accumulation is accelerating.'
    ],
    executionConsiderations: [
      'Spread widens substantially between 21:00 and 23:00 UTC during NY-Asian market roll.',
      'Watch London Bullion Market Association (LBMA) 15:00 UTC benchmarking fix for sharp institutional rebalancing.'
    ],
    whatToWatch: [
      'US 10-Year TIPS Real Yield daily close',
      'DXY (US Dollar Index) key technical pivot zones',
      'COMEX Gold Commitment of Traders (CoT) Net Commercial position changes',
      'Gold/Silver ratio (GSR) expansions and contractions'
    ]
  },
  {
    id: 'playbook-btcusd',
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    assetClass: 'Crypto',
    liquidityTier: 'Deepest Tier 1',
    averageDailyVolatility: '2.5% - 5.5% (Typical daily range: $1,800 - $5,200)',
    typicalSessions: ['24/7 Continuous Trading', 'US ETF Cash Open / RTH (13:30-20:00 UTC)', 'Asian Morning Open (00:00-04:00 UTC)'],
    majorDrivers: [
      'Spot Bitcoin ETF net flows (IBIT, FBTC institutional creations/redemptions)',
      'Derivatives Open Interest (OI), perpetual funding rates, and liquidation heatmaps',
      'Global fiat liquidity conditions (Fed Balance Sheet, global M2 growth cycles)',
      'Long-term holder cost basis and miner distribution dynamics',
      'Stablecoin circulating supply expansions (USDT, USDC inflows)'
    ],
    macroSensitivities: [
      'High correlation with US tech equity beta (Nasdaq 100) during risk-on regimes',
      'Sensitivity to regulatory enforcement actions and sovereign policy directives',
      'Sensitivity to US Treasury yields and liquidity draining operations'
    ],
    trendBehavior: 'Sustained power trends characterized by aggressive short/long liquidation cascades. Once a trend begins after multi-month volatility compression, it often exceeds traditional technical projection targets.',
    rangeBehavior: 'Extended sideways ranges with predatory stop-hunts around visible range bounds. Weekend liquidity thinning often produces false breakouts that get entirely retraced on Monday US cash open.',
    breakoutBehavior: 'Genuine breakouts require matching spot volume alongside perpetual open interest expansion. Breakouts driven purely by leveraged futures with negative or flat spot ETF flows frequently fail as bull/bear traps.',
    riskConsiderations: [
      'Leverage trap: using >5x leverage leaves positions vulnerable to flash liquidation cascades.',
      'Weekend liquidity fragmentation can trigger abrupt wicks that hit exchange stop orders without sustained spot volume.',
      'Perpetual funding drag: holding directional perpetual futures against negative funding rates degrades expected return.'
    ],
    commonMistakes: [
      'Using tight equity-style stop losses (<0.5%) that get hunted by automated market-maker algorithms.',
      'Chasing green candles after 8%+ daily expansions when perpetual funding rates are at extreme positive percentiles (>0.05% per 8h).',
      'Confusing weekend low-volume pump movements with institutional spot accumulation.'
    ],
    suitableStrategyFamilies: [
      'Trend Following / Breakout on Daily and 4H timeframes',
      'Funding Rate & Open Interest Contrarian Mean Reversion',
      'Volume Weighted Average Price (VWAP) Band Mean Reversion during ranges',
      'Halving Cycle Multi-Month Structural Momentum'
    ],
    unsuitableConditions: [
      'Scalping breakout entries during illiquid Sunday afternoons.',
      'Heavy leveraged directional exposure during high-impact US macro releases.'
    ],
    executionConsiderations: [
      'Compare spot exchange order books (Coinbase, Binance spot) against futures to confirm spot-led price discovery.',
      'Always calculate position size based on dollar risk rather than standard contract units.'
    ],
    whatToWatch: [
      'Daily Spot Bitcoin ETF aggregate net inflow/outflow metrics',
      'Aggregate CME and Perpetual Futures Open Interest (OI)',
      'Perpetual Funding Rates across Binance, Bybit, and OKX',
      'Liquidation heatmaps highlighting clustered stop-loss density'
    ]
  },
  {
    id: 'playbook-eurusd',
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    assetClass: 'Forex',
    liquidityTier: 'Deepest Tier 1',
    averageDailyVolatility: '0.45% - 0.90% (Typical daily range: 45 - 90 pips)',
    typicalSessions: ['Frankfurt / London Open (07:00-11:00 UTC)', 'London / New York Overlap (12:30-16:00 UTC)'],
    majorDrivers: [
      'ECB vs. Federal Reserve monetary policy divergence (2-Year Sovereign Yield spreads: DE02Y vs US02Y)',
      'Eurozone economic growth differential vs United States (PMI surveys, GDP)',
      'Global trade balances and energy price shocks affecting Eurozone import costs',
      'Risk sentiment: Euro behaves as pro-cyclical currency vs safe-haven US Dollar'
    ],
    macroSensitivities: [
      'ECB Press Conferences and interest rate decisions',
      'US CPI, PCE, Federal Reserve FOMC decisions',
      'Eurozone Harmonized Index of Consumer Prices (HICP)'
    ],
    trendBehavior: 'EUR/USD trends are macro-driven, persistent, and orderly on daily/weekly charts, but intraday price action is dominated by two-way institutional liquidity flow, institutional option hedging, and mean-reversion tendencies.',
    rangeBehavior: 'Displays exceptionally clean market structure during absence of central bank surprises. Frequently respects order blocks, daily open/previous day value areas, and London fix boundaries.',
    breakoutBehavior: 'Intraday breakout attempts before the London open (07:00 UTC) fail over 70% of the time. True breakouts occur during high-volume overlap when US data triggers yield spread re-pricing.',
    riskConsiderations: [
      'Very low volatility can tempt traders to over-leverage to compensate for small pip ranges.',
      'Slippage during ECB/Fed rate announcements and Non-Farm Payrolls can blow through stop orders.'
    ],
    commonMistakes: [
      'Trading EUR/USD during the late New York afternoon or Asian session where spread-to-range ratio is disadvantageous.',
      'Ignoring 2-year yield spreads between German Bunds and US Treasuries.'
    ],
    suitableStrategyFamilies: [
      'Session-Based Liquidity Sweeps (London Day High/Low sweeps)',
      'Yield Spread Macro Trend Following',
      'VWAP & Value Area Mean Reversion during London/NY overlap',
      'Multi-day Market Structure Shift (MSS) entries'
    ],
    unsuitableConditions: [
      'Directional breakout trading during quiet holiday trading periods.',
      'Trading immediately preceding ECB/Fed interest rate announcements without defined risk.'
    ],
    executionConsiderations: [
      'Toughest bid-ask spread efficiency in global finance (<0.2 pips during London/NY peak).',
      'Be aware of 10:00 AM New York (14:00/15:00 UTC) FX option expiration strikes.'
    ],
    whatToWatch: [
      'Germany 2-Year vs US 2-Year Sovereign Yield Spread',
      'DXY (US Dollar Index) resistance/support pivots',
      'Eurozone Flash Manufacturing & Services PMI releases',
      'CFTC EUR speculative net positioning percentiles'
    ]
  },
  {
    id: 'playbook-sp500',
    symbol: 'S&P 500 (ES / SPY)',
    name: 'E-mini S&P 500 Index Futures',
    assetClass: 'Indices',
    liquidityTier: 'Deepest Tier 1',
    averageDailyVolatility: '0.8% - 1.8% (Typical daily range: 40 - 95 index points)',
    typicalSessions: ['Regular Trading Hours / RTH (13:30-20:00 UTC / 9:30 AM-4:00 PM EST)', 'Overnight / ETH (Globex)'],
    majorDrivers: [
      'Corporate Earnings season (Mega-Cap tech contributions: AAPL, MSFT, NVDA, AMZN, GOOGL, META)',
      'US Real Interest Rates and Federal Reserve Balance Sheet liquidity',
      'Options Market Gamma Exposure (0DTE options positioning, Call/Put wall strikes)',
      'Macro data surprises: Non-Farm Payrolls, CPI, ISM Manufacturing & Services',
      'Systematic Volatility Control and CTA trend-follower buying/selling thresholds'
    ],
    macroSensitivities: [
      'VIX index shifts and term structure contango/backwardation',
      'US 10-Year Treasury Yield surges',
      'Credit default swap (CDS) spreads and high-yield credit spreads (HYG/LQD)'
    ],
    trendBehavior: 'Long-term structural upward drift due to index rebalancing, corporate buybacks, and passive retirement inflows. Downtrends are asymmetric: violent, volatile, and fast ("elevator down, escalator up").',
    rangeBehavior: 'In positive gamma regimes (VIX < 15, spot above dealer call walls), market exhibits tight ranges with strong mean-reversion toward VWAP. In negative gamma regimes (VIX > 22), ranges expand violently.',
    breakoutBehavior: 'Intraday breakouts above or below the Opening Range (Initial Balance: first 60 minutes) have high statistical follow-through when backed by NYSE Market Breadth (Advancing vs Declining issues > 3:1).',
    riskConsiderations: [
      '0DTE (zero days to expiration) options volume accounts for over 45% of total S&P options volume, causing intraday pinning or sudden gamma squeeze moves.',
      'Holding long positions without hedge through corporate earnings clusters exposes capital to gap risk.'
    ],
    commonMistakes: [
      'Shorting strong trend-days that hold above the volume-weighted average price (VWAP).',
      'Buying breakout calls when dealer positioning is deeply in positive gamma (dealer hedging dampens realized volatility).',
      'Ignoring NYSE Tick ($TICK) extremes when entering intraday reversal trades.'
    ],
    suitableStrategyFamilies: [
      'Opening Range Breakout (ORB) with Market Breadth Confirmation',
      'Volume Profile Value Area Pullback & Reject',
      'Gamma Exposure (GEX) Strike Reversal & Pinning Strategies',
      'Long-Term Systematic Momentum with 200-day Simple Moving Average Filter'
    ],
    unsuitableConditions: [
      'Mean-reversion dip buying when market is trading in deep negative gamma below key put walls.',
      'Entering positions in the final 15 minutes of trading during month-end institutional index rebalances.'
    ],
    executionConsiderations: [
      'Primary liquidity resides in the CME E-mini (ES) and Micro E-mini (MES) futures contract.',
      'Monitor regular trading hours (RTH) gaps against previous day high/low/close.'
    ],
    whatToWatch: [
      'Cboe Volatility Index (VIX) and VIX 3-Month curve',
      'NYSE Market Breadth ($ADD, $TICK)',
      'Key Dealer Gamma Pivot level (Zero Gamma level)',
      '10-Year US Treasury Note Yield (TNX)'
    ]
  },
  {
    id: 'playbook-gbpusd',
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    assetClass: 'Forex',
    liquidityTier: 'High Institutional Tier 1',
    averageDailyVolatility: '0.65% - 1.30% (Typical daily range: 75 - 140 pips)',
    typicalSessions: ['London Open (07:00-11:00 UTC)', 'London / NY Overlap (12:30-16:00 UTC)'],
    majorDrivers: [
      'Bank of England (BoE) interest rate expectations and MPC voting split',
      'UK Inflation (CPI prints tend to have higher dispersion than Eurozone)',
      'Global risk appetite: Sterling exhibits higher beta than the Euro to global equities and risk sentiment',
      'UK Gilt market yields and fiscal policy announcements'
    ],
    macroSensitivities: [
      'UK GDP, Retail Sales, and wage growth reports',
      'Federal Reserve FOMC decisions and US macro indicators'
    ],
    trendBehavior: 'Known historically as "The Cable", GBP/USD produces energetic intraday swings with extensive wick creation. Trending days often print strong directional candles with shallow pullbacks during London hours.',
    rangeBehavior: 'Range bounds are frequently tested with violent fakeouts (liquidity traps) designed to capture retail breakout stops before reversing back inside the Value Area.',
    breakoutBehavior: 'London open breakouts have higher follow-through than EUR/USD, but require strict risk management due to wider average adverse excursion (MAE).',
    riskConsiderations: [
      'Higher pip value and wider ATR require strict reduction in lot size compared to EUR/USD.',
      'UK political developments and fiscal statements can produce sudden multi-pip slippage.'
    ],
    commonMistakes: [
      'Applying EUR/USD stop-loss pip widths to GBP/USD without scaling for GBP higher ATR.',
      'Trading counter-trend against a London morning directional momentum impulse.'
    ],
    suitableStrategyFamilies: [
      'London Breakout Strategy (Asian Range breakout with London volume filter)',
      'Market Structure Shift + Fair Value Gap (FVG) retest on 15m/1H',
      'BoE vs Fed Monetary Policy Divergence Swings'
    ],
    unsuitableConditions: [
      'Trading during low-liquidity bank holidays in the City of London.',
      'Scalping inside tight 15-pip ranges during the Asian session.'
    ],
    executionConsiderations: [
      'Expect wider spreads during high-impact UK data (06:00 or 07:00 UTC releases).',
      'London 16:00 (15:00 UTC) fix sees prominent institutional turnover in Sterling pairs.'
    ],
    whatToWatch: [
      'UK 10-Year Gilt yields',
      'EUR/GBP cross rate (provides clear signal on whether move is idiosyncratic Sterling or broader USD move)',
      'BoE Monetary Policy Committee (MPC) speech tone'
    ]
  },
  {
    id: 'playbook-usdjpy',
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    assetClass: 'Forex',
    liquidityTier: 'Deepest Tier 1',
    averageDailyVolatility: '0.70% - 1.50% (Typical daily range: 80 - 180 pips)',
    typicalSessions: ['Tokyo / Asian Open (00:00-06:00 UTC)', 'London / New York Overlap (12:30-16:00 UTC)', 'Tokyo Fix (00:55 UTC)'],
    majorDrivers: [
      'US 10-Year Treasury Yield vs Japan 10-Year JGB yield differential (primary macro driver)',
      'Bank of Japan (BoJ) monetary policy, Yield Curve Control (YCC), and interest rate hikes',
      'Ministry of Finance (MoF) currency intervention threats or physical intervention executions',
      'Global risk aversion (Yen acts as historical safe-haven during acute market stress)'
    ],
    macroSensitivities: [
      'US Inflation prints (CPI, PPI) directly moving US Treasury yields',
      'BoJ Governor press conferences and overnight policy statements',
      'Global commodity prices (Japan is a major net energy importer)'
    ],
    trendBehavior: 'One of the cleanest macro trending pairs in foreign exchange when US-Japan sovereign bond yields diverge. Can maintain multi-thousand-pip secular trends lasting months.',
    rangeBehavior: 'Intraday price action respects key round psychological numbers (e.g. 150.00, 155.00), often consolidating around these levels for days before the next yield shock.',
    breakoutBehavior: 'Breakouts tied to US bond yield breakouts have exceptional follow-through. Technical-only breakouts without bond yield confirmation are prone to false moves.',
    riskConsiderations: [
      'Japanese Ministry of Finance intervention risk: official intervention operations can drop USD/JPY 300-500 pips in under 3 minutes.',
      'Holding short positions carries negative swap when US rates are significantly above Japanese rates.'
    ],
    commonMistakes: [
      'Fighting a macro uptrend without a confirmed reversal in US 10-Year Treasury yields.',
      'Underestimating the velocity of MoF currency intervention sell-offs.',
      'Ignoring Tokyo 9:55 AM Fix (00:55 UTC) corporate commercial yen purchasing flows.'
    ],
    suitableStrategyFamilies: [
      'US 10-Year Yield Spread Trend-Following',
      'Asian Session Range Retest during London Open',
      'Intervention Exhaustion Reversals (with defined invalidation)'
    ],
    unsuitableConditions: [
      'Entering long positions directly into explicit verbal intervention warning levels without stop loss.',
      'Scalping immediately preceding unannounced Bank of Japan rate decisions.'
    ],
    executionConsiderations: [
      'Tight spreads across Asian, London, and NY sessions.',
      'Tokyo Fix at 00:55 UTC frequently exhibits sharp order imbalances on the 5th, 10th, 15th, 20th, 25th, and 30th of the month (Gotobi days).'
    ],
    whatToWatch: [
      'US 10-Year Treasury Yield (US10Y)',
      'Japan 10-Year Government Bond Yield (JP10Y)',
      'Nikkei 225 equity movements',
      'Japanese MoF official verbal warnings ("watching with a high sense of urgency")'
    ]
  }
];
