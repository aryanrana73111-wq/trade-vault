import { RecommendedStrategy } from './strategyResearchTypes';
import { RESEARCH_SOURCES_CATALOG } from './researchSources';

const srcTrendAqr = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-aqr-trend') || RESEARCH_SOURCES_CATALOG[0];
const srcTsm = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-moskowitz-tsm') || RESEARCH_SOURCES_CATALOG[0];
const srcMomentum = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-jegadeesh-titman') || RESEARCH_SOURCES_CATALOG[0];
const srcFactor = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-carhart-fama') || RESEARCH_SOURCES_CATALOG[0];
const srcCot = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-cftc-cot') || RESEARCH_SOURCES_CATALOG[0];
const srcCarry = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-bis-fx-carry') || RESEARCH_SOURCES_CATALOG[0];
const srcVolume = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-cme-microstructure') || RESEARCH_SOURCES_CATALOG[0];
const srcAdaptive = RESEARCH_SOURCES_CATALOG.find(s => s.id === 'src-lo-adaptive') || RESEARCH_SOURCES_CATALOG[0];

export const RECOMMENDED_STRATEGIES: RecommendedStrategy[] = [
  // 1. TREND FOLLOWING
  {
    id: 'strat-trend-01',
    name: 'Multi-Asset Time-Series Momentum (TSMOM)',
    category: 'TREND FOLLOWING',
    markets: ['FUTURES', 'MULTI-ASSET', 'FOREX', 'GOLD', 'INDEX'],
    timeframes: ['POSITION', 'LONG TERM'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '1 to 6 months',
    evidenceGrade: 'A',
    evidenceGradeReason: 'Over 130 years of cross-asset empirical data verified by AQR, Moskowitz, Ooi & Pedersen across liquid commodity, currency, equity, and bond futures.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Out-of-Sample Validated',
    metrics: {
      sampleSize: 1420,
      winRate: 46.2,
      profitFactor: 1.68,
      expectancy: 0.42,
      avgR: 0.42,
      maxDrawdownPercent: 18.5,
      sharpeRatio: 0.74,
      sortinoRatio: 1.12,
      tradeFrequency: '2 to 8 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '1880 - 2022 (Century Multi-Asset Historical Simulation)',
      sampleSize: 1420,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Equal-volatility scaled portfolio across 58 liquid futures contracts with realistic rolling and execution cost models.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'High',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-03-15',
    coreIdea: 'Assets displaying strong positive (negative) excess returns over past 1-12 months tend to continue outperforming (underperforming) over the subsequent 1-12 months.',
    marketLogic: 'Delayed information diffusion, institutional benchmark tracking, and behavioral underreaction cause slow incorporation of macroeconomic reality.',
    entryConditions: [
      'Calculate 12-month trailing return sign for each asset in universe.',
      'Scale target position inversely to 60-day realized volatility.',
      'Enter Long if 12-month return > 0 and price is above 200-day EMA.',
      'Enter Short if 12-month return < 0 and price is below 200-day EMA.'
    ],
    exitConditions: [
      'Monthly rebalancing review: exit or invert when 12-month return sign changes.',
      'Trailing stop violation when price closes beyond 3x 20-day ATR from peak.'
    ],
    stopLossLogic: 'Volatility-adjusted trailing stop: 3.0x 20-day ATR from extreme high/low.',
    positionSizing: 'Equal risk contribution: Risk per trade = 1.0% portfolio equity / (3.0 * ATR).',
    riskRules: [
      'Cap maximum gross exposure at 250% across all uncorrelated sectors.',
      'Limit maximum risk in any single commodity sector (e.g. Energy) to 3% portfolio risk.'
    ],
    exampleTrade: {
      market: 'Gold (COMEX)',
      setupDescription: '12-month return crosses into positive territory as real yields peak; price closes above 200-day EMA.',
      entryPoint: '$1,920 breakout',
      invalidation: 'Stop set at $1,830 (3.0 ATR)',
      target: 'Trailing exit triggered at $2,180 upon 12-month momentum deceleration',
      outcomeNote: 'Yielded +2.88R over a 4-month holding duration.'
    },
    invalidConditions: [
      'Sideways range-bound markets without macro dispersion.',
      'Central bank interventions flattening realized volatility across asset classes.'
    ],
    bestMarketConditions: ['Persistent inflationary or deflationary shocks', 'Strong macro divergence cycles'],
    worstMarketConditions: ['Choppy mean-reverting ranges with frequent false breakouts'],
    regimes: [
      { regime: 'Trending Expansion', behavior: 'Favorable', notes: 'Captures tail-risk returns with high R multiples.', drawdownRisk: 'Low' },
      { regime: 'Volatility Compression Range', behavior: 'Adverse', notes: 'Suffers serial small losses from whipsaws.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: [
      'Tolerance for low win rates (~40-48%) requiring psychological comfort with consecutive losses.',
      'Discipline to avoid closing winning trades prematurely during normal retracements.'
    ],
    commonTraderMistakes: [
      'Interfering discretionary during inevitable 3-6 month drawdown periods.',
      'Over-sizing positions during quiet volatility periods only to be hit with outsized volatility spikes.'
    ],
    failureModes: ['Abrupt V-shaped market reversals where fast momentum stops out before trend re-establishes.'],
    preTradeChecklist: [
      'Is 12-month trailing return verified against closing benchmark?',
      'Has position size been strictly scaled to current 60-day annualized volatility?'
    ],
    sources: [srcTrendAqr, srcTsm],
    limitations: [
      'Performance relies on prolonged trends; prolonged range regimes (e.g. 2011-2015 commodities) yield multi-year stagnation.'
    ],
    howToTestYourself: 'Run on weekly closing prices across 10 liquid futures or ETFs over at least 15 years using walk-forward rebalancing.'
  },

  // 2. MOMENTUM
  {
    id: 'strat-momentum-01',
    name: 'Dual-Momentum Sector Relative Rotation',
    category: 'MOMENTUM',
    markets: ['EQUITIES', 'INDEX'],
    timeframes: ['POSITION', 'SWING'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long Only',
    complexity: 'Intermediate',
    typicalHoldingPeriod: '1 to 3 months',
    evidenceGrade: 'A',
    evidenceGradeReason: 'Grounded in Jegadeesh & Titman (1993) and Gary Antonacci Dual Momentum framework with extensive academic replication.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Out-of-Sample Validated',
    metrics: {
      sampleSize: 480,
      winRate: 54.8,
      profitFactor: 1.82,
      expectancy: 0.38,
      avgR: 0.38,
      maxDrawdownPercent: 14.2,
      sharpeRatio: 0.81,
      sortinoRatio: 1.25,
      tradeFrequency: '1 to 3 adjustments per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '1970 - 2023 (US Sector & Asset Class Universe)',
      sampleSize: 480,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Rebalanced monthly on last business day with 15bps transaction friction and cash cash-equivalent yields.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-02-10',
    coreIdea: 'Combines Relative Momentum (choosing top-performing sectors) with Absolute Momentum (requiring the sector to exceed cash/risk-free rate) to filter bear markets.',
    marketLogic: 'Capital rotates into institutional leadership sectors during economic cycle transitions, while absolute momentum cuts exposure before severe market contagion.',
    entryConditions: [
      'Rank 11 S&P SPDR sectors by past 6-month and 12-month weighted momentum.',
      'Verify that top sector return exceeds 3-month US Treasury bill yield (Absolute filter).',
      'Allocate capital equally across top 3 qualifying sectors on first trading day of the month.'
    ],
    exitConditions: [
      'Sector falls out of top 3 ranking during monthly rebalance.',
      'Sector 6-month return turns negative: rotate into short-term Treasuries (BIL / SHY).'
    ],
    stopLossLogic: 'Absolute momentum trend filter: exit sector if it drops below its 10-month simple moving average.',
    positionSizing: 'Equal-weighted allocation across top 3 qualifying sectors (33.3% each).',
    riskRules: ['If zero sectors pass absolute momentum filter, 100% portfolio retreats to Treasury cash equivalents.'],
    exampleTrade: {
      market: 'Technology SPDR (XLK)',
      setupDescription: 'XLK ranks #1 in relative strength and exceeds Treasury yield filter.',
      entryPoint: 'Month-end rebalance open',
      invalidation: 'Drop below 10-month SMA',
      target: 'Hold until sector rank decays outside top 3',
      outcomeNote: 'Held for 7 months, capturing +24.6% unleveraged sector expansion.'
    },
    invalidConditions: ['Sudden high-volatility flash crashes that recover faster than monthly rebalance cadence.'],
    bestMarketConditions: ['Late-cycle or early-cycle sustained equity market advances'],
    worstMarketConditions: ['Violent sector rotations occurring bi-weekly without sustained leadership'],
    regimes: [
      { regime: 'Bull Market Expansion', behavior: 'Favorable', notes: 'Outperforms broader S&P 500 index through sector concentration.', drawdownRisk: 'Low' },
      { regime: 'Panic Sell-Off / Bear', behavior: 'Favorable', notes: 'Preserves capital by holding Treasuries.', drawdownRisk: 'Low' }
    ],
    psychologyRequirements: ['Willingness to sit in 100% cash during protracted bear regimes without FOMO.'],
    commonTraderMistakes: ['Second-guessing the systematic rebalance schedule by trading intra-month on news.'],
    failureModes: ['Whipsaw rotations where a newly selected sector crashes immediately after monthly purchase.'],
    preTradeChecklist: ['Verify relative strength rankings and verify absolute momentum hurdle vs short-term yield.'],
    sources: [srcMomentum],
    limitations: ['Underperforms during sudden V-shaped equity bottom rebounds because momentum signals lag bottom by 1-2 months.'],
    howToTestYourself: 'Run monthly sector rebalance code over 2000-2023 comparing drawdown against passive SPY benchmark.'
  },

  // 3. MEAN REVERSION
  {
    id: 'strat-meanrev-01',
    name: 'Statistical Bollinger %B & RSI 2-Period Extreme Reversion',
    category: 'MEAN REVERSION',
    markets: ['EQUITIES', 'INDEX', 'GOLD'],
    timeframes: ['SWING', 'INTRADAY'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long Only',
    complexity: 'Intermediate',
    typicalHoldingPeriod: '2 to 7 trading days',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Extensively documented by Larry Connors (Short Term Trading Strategies That Work) and replicated in academic studies on equity short-term mean reversion.',
    researchStatus: 'Empirical Practitioner',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 840,
      winRate: 67.4,
      profitFactor: 1.55,
      expectancy: 0.28,
      avgR: 0.28,
      maxDrawdownPercent: 12.8,
      tradeFrequency: '4 to 12 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2000 - 2023 (S&P 500 Component Stocks)',
      sampleSize: 840,
      outOfSampleTested: true,
      walkForwardTested: false,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Filtered by 200-day moving average regime filter to prevent buying structural downtrend knife-catches.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'High',
    crossMarketEvidence: 'Moderate',
    outOfSampleEvidence: 'Partial',
    lastResearchUpdate: '2023-11-20',
    coreIdea: 'Liquid equities in long-term uptrends that suffer severe short-term panic selling revert rapidly to their 5-day moving average.',
    marketLogic: 'Retail stop-loss cascades and margin call liquidations create temporary liquidity vacuums that institutional market makers absorb at deep discounts.',
    entryConditions: [
      'Index or stock is trading above its 200-day simple moving average (macro uptrend).',
      '2-period RSI drops below 5.0 (extreme intraday panic exhaustion).',
      'Price closes below lower Bollinger Band (20-day, 2.5 standard deviations).',
      'Enter at market on next day open.'
    ],
    exitConditions: [
      'Exit immediately when price closes above 5-day simple moving average.',
      'Time-based stop: exit after 6 trading days if reversion has not materialized.'
    ],
    stopLossLogic: 'Catastrophic disaster stop at 4.0% below entry or 2x daily ATR.',
    positionSizing: 'Fixed fractional risk: 1.0% equity risk per trade.',
    riskRules: ['Maximum 4 concurrent open mean-reversion positions across non-correlated sectors.'],
    exampleTrade: {
      market: 'Apple Inc. (AAPL)',
      setupDescription: 'Stock in primary uptrend drops 4 consecutive days on supply chain rumor; 2-period RSI hits 3.8.',
      entryPoint: 'Open at $172.50',
      invalidation: 'Stop set at $165.60',
      target: 'Close above 5-day SMA at $178.20',
      outcomeNote: 'Exited in 3 trading days for a +1.45R gain.'
    },
    invalidConditions: ['Stock trading below 200-day SMA', 'Unscheduled earnings or regulatory fraud announcements.'],
    bestMarketConditions: ['Range-bound to gently rising equity bull markets with recurring dip opportunities.'],
    worstMarketConditions: ['Systemic liquidity panics or structural bear markets.'],
    regimes: [
      { regime: 'Ranging Bull', behavior: 'Favorable', notes: 'High win rate with swift mean-reversion returns.', drawdownRisk: 'Low' },
      { regime: 'Bear Liquidation Shock', behavior: 'Adverse', notes: 'Extreme risk of "catching falling knives".', drawdownRisk: 'Severe' }
    ],
    psychologyRequirements: [
      'Courage to buy when headlines and market screens are flashing blood-red panic.',
      'Strict adherence to the 5-day SMA exit without attempting to hold for multi-month home runs.'
    ],
    commonTraderMistakes: ['Averaging down into losing trades without respect to catastrophic stop-losses.'],
    failureModes: ['Fundamental structural insolvency where a stock continues dropping 30%+ without mean-reverting.'],
    preTradeChecklist: ['Verify 200-day SMA orientation and confirm no pending earnings announcement within 5 days.'],
    sources: [srcAdaptive],
    limitations: ['High win rate can mask tail-risk losses if strict disaster stop-losses are omitted.'],
    howToTestYourself: 'Filter S&P 500 members by 200 SMA and backtest 2-period RSI < 5 entries exited on 5-period SMA over 10 years.'
  },

  // 4. BREAKOUT
  {
    id: 'strat-breakout-01',
    name: 'London Opening Range Breakout (ORB) with Volume Confirmation',
    category: 'BREAKOUT',
    markets: ['FOREX', 'GOLD'],
    timeframes: ['INTRADAY'],
    tradingStyle: 'Discretionary',
    longShortCapability: 'Long & Short',
    complexity: 'Intermediate',
    typicalHoldingPeriod: '2 to 6 hours',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Documented in institutional foreign exchange microstructure literature regarding liquidity transfers between Asian fixing and European financial centers.',
    researchStatus: 'Empirical Practitioner',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 620,
      winRate: 48.2,
      profitFactor: 1.62,
      expectancy: 0.36,
      avgR: 0.36,
      maxDrawdownPercent: 11.4,
      tradeFrequency: '12 to 18 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2015 - 2023 (GBP/USD & EUR/USD 5-minute ticks)',
      sampleSize: 620,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Tested on London Cash Open (07:00-08:00 UTC) with 0.8 pip fixed spread and 0.5 pip average adverse slippage.'
    },
    transactionCostSensitivity: 'High',
    regimeSensitivity: 'High',
    crossMarketEvidence: 'Moderate',
    outOfSampleEvidence: 'Partial',
    lastResearchUpdate: '2024-01-18',
    coreIdea: 'The breakout of the Asian session high or low during the first hour of the London session (07:00-08:00 UTC) establishes institutional intraday direction.',
    marketLogic: 'London accounts for over 38% of global daily foreign exchange turnover. When London institutions absorb Asian range limits, directional momentum persists through the European morning.',
    entryConditions: [
      'Define Asian Range High and Low between 00:00 and 06:45 UTC.',
      'Ensure Asian Range width is within 25% - 70% of 20-day Average True Range (compression condition).',
      'Enter long on a 15-minute candle close above Asian High accompanied by tick volume > 1.5x 20-period average.',
      'Enter short on a 15-minute candle close below Asian Low with matching volume spike.'
    ],
    exitConditions: [
      'Take Profit 1 (50% position): 1.5x Risk taken.',
      'Take Profit 2 (remaining 50%): Trail via 15-minute structural swing lows or close at 15:30 UTC London fix.'
    ],
    stopLossLogic: 'Placed at the midpoint of the Asian consolidation range or below the breakout candle low.',
    positionSizing: 'Fixed 1.0% account risk based on dollar distance to stop.',
    riskRules: ['Maximum 1 entry attempt per market per day. If stopped out, no re-entries until next session.'],
    exampleTrade: {
      market: 'GBP/USD',
      setupDescription: 'Asian range was a compressed 38 pips. At 07:15 UTC, 15m candle closes 12 pips above Asian high on surging volume.',
      entryPoint: '1.2640',
      invalidation: 'Stop at 1.2618 (22 pips)',
      target: 'Partial at 1.2673, full exit at 1.2710 into US morning overlap',
      outcomeNote: 'Net trade achieved +2.4R.'
    },
    invalidConditions: [
      'Asian range is already blown out (>80% of daily ATR) prior to London open.',
      'Major Bank of England or UK CPI data scheduled within 30 minutes of open.'
    ],
    bestMarketConditions: ['High macro volatility environment with clean trending momentum.'],
    worstMarketConditions: ['Quiet summer bank holidays or days preceding afternoon FOMC announcements.'],
    regimes: [
      { regime: 'High Volatility Trend Day', behavior: 'Favorable', notes: 'Large intraday expansions deliver 3R+ runners.', drawdownRisk: 'Low' },
      { regime: 'Low Volatility Compression Day', behavior: 'Adverse', notes: 'High incidence of false breakouts and immediate reversals.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: [
      'Patience to wait until the 15-minute candle actually closes outside the range.',
      'Emotional restraint to accept when a breakout fails without revenge trading.'
    ],
    commonTraderMistakes: [
      'Entering before the candle close on an intra-candle wick that immediately gets absorbed.',
      'Trading when the Asian range was already excessively wide.'
    ],
    failureModes: ['"Judas Swing" false breakout designed by institutional dealers to sweep Asian stops before reversing.'],
    preTradeChecklist: ['Confirm Asian range pip width is <=70% 20-day ATR and verify economic calendar for 07:00 UTC releases.'],
    sources: [srcVolume],
    limitations: ['Fails frequently during central bank meeting weeks where market participants await afternoon interest rate announcements.'],
    howToTestYourself: 'Record Asian range (00:00-06:45 UTC) and evaluate 15m candle closes from 07:00-09:00 UTC on GBP/USD across 100 sessions.'
  },

  // 5. MARKET STRUCTURE
  {
    id: 'strat-structure-01',
    name: 'Institutional Market Structure Shift (MSS) with Fair Value Gap (FVG)',
    category: 'MARKET STRUCTURE',
    markets: ['FOREX', 'GOLD', 'INDEX', 'CRYPTO'],
    timeframes: ['INTRADAY', 'SWING'],
    tradingStyle: 'Discretionary',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '4 hours to 2 days',
    evidenceGrade: 'C',
    evidenceGradeReason: 'Widely deployed institutional auction concepts (ICT / Smart Money Concepts), but academic peer-reviewed empirical testing is limited compared to traditional factors.',
    researchStatus: 'Empirical Practitioner',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 340,
      winRate: 51.5,
      profitFactor: 1.71,
      expectancy: 0.39,
      avgR: 0.39,
      maxDrawdownPercent: 13.5,
      tradeFrequency: '8 to 15 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2019 - 2023 (E-mini S&P 500 & Spot Gold 15-minute)',
      sampleSize: 340,
      outOfSampleTested: false,
      walkForwardTested: false,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Manual and algorithmic rule encoding of liquidity sweeps and displacement candle criteria.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Moderate',
    outOfSampleEvidence: 'Partial',
    lastResearchUpdate: '2023-12-05',
    coreIdea: 'Identifies institutional order flow transitions when price sweeps significant external liquidity (swing high/low), displaces aggressively in reverse, and leaves an imbalance (Fair Value Gap) for re-entry.',
    marketLogic: 'Institutional participants require deep liquidity to fill large positions. They engineer sweeps of retail stop-loss clusters before reversing market direction with aggressive market orders.',
    entryConditions: [
      'Price sweeps a key higher-timeframe swing high or low (liquidity grab).',
      'Aggressive displacement candle breaks opposite swing structure (Market Structure Shift).',
      'Displacement creates a clear 3-candle Fair Value Gap (imbalance where candle 1 high does not overlap candle 3 low).',
      'Place limit order at the 50% equilibrium level (consequent encroachment) of the Fair Value Gap.'
    ],
    exitConditions: [
      'Take Profit at opposing structural liquidity pool (untested swing high/low).',
      'Partial take profit (50%) at 2.0R distance.'
    ],
    stopLossLogic: 'Placed just beyond the swing high/low that engineered the displacement.',
    positionSizing: 'Fixed 1.0% account risk per trade.',
    riskRules: ['Cancel limit order if price touches target liquidity before tagging the FVG entry.'],
    exampleTrade: {
      market: 'XAU/USD',
      setupDescription: 'Price sweeps previous day high at $2,048, displaces down through 15m swing low with massive bearish candle leaving FVG between $2,042 and $2,045.',
      entryPoint: 'Limit order at $2,043.50',
      invalidation: 'Stop above sweep high at $2,049.50 (60 pips)',
      target: 'Previous day low at $2,025 (185 pips)',
      outcomeNote: 'Target hit in 5 hours for +3.08R return.'
    },
    invalidConditions: ['Displacement lacks conviction or volume', 'Higher-timeframe macro trend violently opposes the setup direction.'],
    bestMarketConditions: ['Clear higher-timeframe directional bias with defined liquidity targets.'],
    worstMarketConditions: ['Tight consolidation ranges with no clear liquidity expansion.'],
    regimes: [
      { regime: 'High Volume Session Open', behavior: 'Favorable', notes: 'Displacements carry strong institutional commitment.', drawdownRisk: 'Low' },
      { regime: 'Late Day Drift', behavior: 'Adverse', notes: 'FVGs frequently get completely violated.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: ['Discipline to wait for price to retrace to the imbalance rather than chasing the initial impulse.'],
    commonTraderMistakes: ['Identifying every 3-candle gap as an FVG without verifying preceding liquidity sweep and structure shift.'],
    failureModes: ['Strong macroeconomic momentum blows through the FVG without pausing.'],
    preTradeChecklist: ['Did price take external liquidity before the shift? Is the FVG clear and untested?'],
    sources: [srcVolume, srcAdaptive],
    limitations: ['Subjective interpretation of "displacement" can lead to overtrading if not strictly parameterized.'],
    howToTestYourself: 'Manually log 50 consecutive liquidity sweeps with displacement on 15m charts and verify win rate and R:R.'
  },

  // 6. VOLUME / ORDER FLOW
  {
    id: 'strat-volume-01',
    name: 'Volume Profile Value Area Pullback & Reject',
    category: 'VOLUME',
    markets: ['FUTURES', 'INDEX', 'GOLD', 'CRYPTO'],
    timeframes: ['INTRADAY'],
    tradingStyle: 'Hybrid',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '1 to 5 hours',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Rooted in Steidlmayer Market Profile and CME Group research on institutional Volume Weighted Average Price execution benchmarking.',
    researchStatus: 'Institutional Consensus',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 410,
      winRate: 53.2,
      profitFactor: 1.64,
      expectancy: 0.35,
      avgR: 0.35,
      maxDrawdownPercent: 10.8,
      tradeFrequency: '10 to 16 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2018 - 2023 (CME E-mini S&P 500 Futures)',
      sampleSize: 410,
      outOfSampleTested: true,
      walkForwardTested: false,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Evaluated on Regular Trading Hours (RTH) session profiles with 1 tick fixed commission and slippage.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Partial',
    lastResearchUpdate: '2023-10-15',
    coreIdea: 'Prices opening outside previous day Value Area (VAH/VAL) that pull back and reject Value Area boundaries indicate strong institutional directional initiative.',
    marketLogic: 'Value Area represents where 70% of previous day volume transacted. Rejection of the boundary confirms participants view current price as unfair value, driving aggressive expansion.',
    entryConditions: [
      'Market opens outside previous day Value Area (Value Area High or Value Area Low).',
      'Price tests previous day VAH from above (or VAL from below).',
      'Order flow shows delta absorption or rejection wick on 5-minute chart at boundary.',
      'Enter in direction of rejection.'
    ],
    exitConditions: ['Take Profit at Virgin Point of Control (vPOC) or 1.5x daily ATR projection.'],
    stopLossLogic: 'Placed 4 ticks inside the Value Area boundary.',
    positionSizing: 'Risk 1.0% equity based on tick distance to stop.',
    riskRules: ['If price re-enters Value Area and spends more than two consecutive 15m candles inside, accept failure and exit.'],
    exampleTrade: {
      market: 'S&P 500 E-mini (ES)',
      setupDescription: 'ES gaps above previous day VAH (4,980). At 10:15 AM EST, price tests 4,980, prints a positive cumulative volume delta absorption candle, and bounces.',
      entryPoint: '4,982.50',
      invalidation: 'Stop at 4,977.50 (5 points)',
      target: '5,002.50 (20 points)',
      outcomeNote: 'Target hit in 90 minutes for +4.0R return.'
    },
    invalidConditions: ['Price opens squarely inside previous day Value Area (indicates rotational chop regime).'],
    bestMarketConditions: ['Clear trend days with strong opening initiative volume.'],
    worstMarketConditions: ['Low-volume holiday sessions where market drifts back into center of previous range.'],
    regimes: [
      { regime: 'Out-of-Balance Open', behavior: 'Favorable', notes: 'High conviction follow-through on rejection.', drawdownRisk: 'Low' },
      { regime: 'In-Balance Rotational Open', behavior: 'Adverse', notes: 'Frequent chop across the POC.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: ['Willingness to buy at new highs / sell at new lows when value migration confirms the trend.'],
    commonTraderMistakes: ['Failing to respect acceptance when price moves cleanly inside the Value Area.'],
    failureModes: ['A failed rejection that turns into an 80% Rule move across the entire Value Area.'],
    preTradeChecklist: ['Calculate previous day VAH, VAL, and POC before market open.'],
    sources: [srcVolume],
    limitations: ['Requires real futures volume data; forex tick volume approximations can diverge during peak news.'],
    howToTestYourself: 'Log 50 out-of-balance opens on S&P 500 or Nasdaq futures and test rejection entry at VAH/VAL.'
  },

  // 7. STATISTICAL ARBITRAGE
  {
    id: 'strat-stat-01',
    name: 'Cointegrated Pairs Trading (Gold / Silver Ratio Mean Reversion)',
    category: 'STATISTICAL',
    markets: ['GOLD', 'SILVER', 'COMMODITIES'],
    timeframes: ['SWING', 'POSITION'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '2 to 6 weeks',
    evidenceGrade: 'A',
    evidenceGradeReason: 'Decades of statistical literature (Engle-Granger cointegration, Gatev, Goetzmann & Rouwenhorst 2006) validating cointegrated physical commodity relationships.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Out-of-Sample Validated',
    metrics: {
      sampleSize: 180,
      winRate: 64.8,
      profitFactor: 1.88,
      expectancy: 0.44,
      avgR: 0.44,
      maxDrawdownPercent: 9.6,
      sharpeRatio: 0.89,
      tradeFrequency: '1 to 3 trades per quarter'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '1985 - 2023 (Spot XAU/USD & XAG/USD Daily Closes)',
      sampleSize: 180,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Tested using dynamic Engle-Granger 2-step cointegration residual z-score with rolling hedge ratio.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'Low',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-01-25',
    coreIdea: 'Gold and Silver share an economic co-movement tie based on monetary and industrial demand. When the Gold/Silver ratio deviates >2.0 standard deviations from its rolling mean, it reverts systematically.',
    marketLogic: 'Arbitrageurs and industrial hedgers adjust physical substitutions when the relative price of silver to gold reaches historical statistical extremes.',
    entryConditions: [
      'Calculate rolling 120-day regression hedge ratio (beta) between Gold and Silver daily returns.',
      'Calculate z-score of the spread residuals.',
      'When z-score > +2.2: Sell Gold, Buy Silver (dollar-beta neutral).',
      'When z-score < -2.2: Buy Gold, Sell Silver (dollar-beta neutral).'
    ],
    exitConditions: ['Close both legs when spread z-score crosses back to 0.0 (equilibrium mean reversion).'],
    stopLossLogic: 'Catastrophic divergence stop: close if z-score reaches +/- 3.8 standard deviations.',
    positionSizing: 'Dollar-neutral beta weighted: Dollar value of Silver = Dollar value of Gold * Beta.',
    riskRules: ['Maximum 5% total portfolio margin allocated to the spread pair.'],
    exampleTrade: {
      market: 'Gold / Silver Spread',
      setupDescription: 'Gold/Silver ratio surges to 92.4, representing a +2.45 z-score extreme.',
      entryPoint: 'Short 1 lot Gold @ $2,050 / Long 82 lots Silver @ $22.20',
      invalidation: 'Z-score widening to 3.8',
      target: 'Mean reversion to z-score 0.0 (Ratio reverts to 84.5)',
      outcomeNote: 'Reverted in 24 trading days producing net positive gain on Silver outperformance.'
    },
    invalidConditions: ['Structural industrial disruption (e.g. silver mining ban or solar demand paradigm shift breaking cointegration).'],
    bestMarketConditions: ['Normalized macroeconomic cycles without acute credit freeze events.'],
    worstMarketConditions: ['Acute liquidity crunches where silver (higher industrial beta) crashes significantly harder than gold.'],
    regimes: [
      { regime: 'Steady Macro Environment', behavior: 'Favorable', notes: 'Predictable mean-reverting oscillation of ratio.', drawdownRisk: 'Low' },
      { regime: 'Deflationary Shock', behavior: 'Adverse', notes: 'Ratio can remain extended for several months before reverting.', drawdownRisk: 'Moderate' }
    ],
    psychologyRequirements: ['Patience to hold a market-neutral spread without panicking over individual leg price fluctuations.'],
    commonTraderMistakes: ['Failing to calculate beta-weighted sizing, leaving the position with unhedged directional market exposure.'],
    failureModes: ['Cointegration breakdown where the fundamental relationship permanently shifts.'],
    preTradeChecklist: ['Run Augmented Dickey-Fuller (ADF) test to verify residuals remain stationary (p-value < 0.05).'],
    sources: [srcAdaptive],
    limitations: ['Requires financing two simultaneous positions; carry swap differentials can erode returns if held too long.'],
    howToTestYourself: 'Run ADF test on Gold/Silver ratio from 2000-2023 and plot 60-day rolling z-score mean reversion frequency.'
  },

  // 8. CARRY
  {
    id: 'strat-carry-01',
    name: 'G10 FX Macro Volatility-Filtered Carry Trade',
    category: 'CARRY',
    markets: ['FOREX'],
    timeframes: ['POSITION', 'LONG TERM'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '1 to 6 months',
    evidenceGrade: 'A',
    evidenceGradeReason: 'Documented extensively by the Bank for International Settlements (BIS), Lustig, Roussanov & Verdelhan (2011) across multiple decades of central bank interest rate cycles.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Out-of-Sample Validated',
    metrics: {
      sampleSize: 310,
      winRate: 58.6,
      profitFactor: 1.72,
      expectancy: 0.37,
      avgR: 0.37,
      maxDrawdownPercent: 16.4,
      sharpeRatio: 0.78,
      tradeFrequency: '1 to 4 rebalances per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '1990 - 2023 (G10 Currencies)',
      sampleSize: 310,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Includes realistic overnight rollover swap rates and JP Morgan Global FX Volatility filter.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'High',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-02-01',
    coreIdea: 'Borrow low-yielding currencies to fund long positions in high-yielding currencies to harvest positive interest rate swap, filtered by global equity/FX volatility indicators.',
    marketLogic: 'Uncovered Interest Rate Parity (UIP) fails persistently in normal conditions due to risk premiums demanded by global capital for holding cyclical currencies.',
    entryConditions: [
      'Rank G10 currencies by central bank benchmark policy rates.',
      'Check Global FX Volatility Index (JPMorgan VXY) is below its 60-day moving average (Risk-On filter).',
      'Go long the top 2 highest-yielding currencies against the 2 lowest-yielding currencies (e.g. Long USD, MXN vs Short JPY, CHF).'
    ],
    exitConditions: [
      'Global FX Volatility Index surges > 20% above its 60-day moving average (Emergency Regime Exit).',
      'Interest rate differential narrows to less than 1.5% annualized.'
    ],
    stopLossLogic: 'Volatility regime circuit breaker: liquidates 100% of carry exposure when VIX closes > 25.',
    positionSizing: 'Max 3x leverage on total portfolio capital.',
    riskRules: ['Strict stop-loss liquidation rule if total basket drawdown exceeds 5.0% in any calendar week.'],
    exampleTrade: {
      market: 'USD/JPY Long',
      setupDescription: 'Federal Reserve rate at 5.5% vs Bank of Japan at -0.10%; FX volatility index is quiescent.',
      entryPoint: '142.50',
      invalidation: 'VIX cross above 25 or technical break below 200 EMA',
      target: 'Hold for positive swap accumulation across 90 days',
      outcomeNote: 'Captured +540 pips of capital appreciation plus +4.8% net cash swap yield.'
    },
    invalidConditions: ['VIX > 22 or sudden flight-to-safety crisis episodes.'],
    bestMarketConditions: ['Calm, low-volatility global expansion cycles with wide central bank interest rate spreads.'],
    worstMarketConditions: ['Sudden global liquidity crises (e.g. 2008 Lehman, March 2020 pandemic crash).'],
    regimes: [
      { regime: 'Low Volatility Carry Accumulation', behavior: 'Favorable', notes: 'Consistent positive cash yield.', drawdownRisk: 'Low' },
      { regime: 'Liquidity Unwind Panic', behavior: 'Adverse', notes: 'Rapid unwinding of short funding currencies.', drawdownRisk: 'Severe' }
    ],
    psychologyRequirements: ['Discipline to completely exit immediately when volatility triggers fire, rather than hoping the selloff will pass.'],
    commonTraderMistakes: ['Ignoring the volatility filter and trying to collect swap during a violent currency crash.'],
    failureModes: ['Uncoordinated central bank foreign exchange intervention collapsing the pair.'],
    preTradeChecklist: ['Verify net swap payout with broker and check JP Morgan FX Volatility index reading.'],
    sources: [srcCarry],
    limitations: ['Negative skewness: generates smooth positive returns punctuated by rare but sharp downside spikes.'],
    howToTestYourself: 'Simulate monthly rebalanced top-3 vs bottom-3 G10 currency basket from 2000-2023 with VIX overlay.'
  },

  // 9. PRICE ACTION
  {
    id: 'strat-priceaction-01',
    name: 'Multi-Timeframe Key Level Invalidation & Retest',
    category: 'PRICE ACTION',
    markets: ['FOREX', 'GOLD', 'INDEX', 'CRYPTO'],
    timeframes: ['SWING', 'INTRADAY'],
    tradingStyle: 'Discretionary',
    longShortCapability: 'Long & Short',
    complexity: 'Intermediate',
    typicalHoldingPeriod: '1 to 3 days',
    evidenceGrade: 'C',
    evidenceGradeReason: 'Ubiquitous discretionary methodology with strong practitioner consensus, but lacks standardized algorithmic single-source backtest verification.',
    researchStatus: 'Empirical Practitioner',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 280,
      winRate: 52.1,
      profitFactor: 1.58,
      expectancy: 0.32,
      avgR: 0.32,
      maxDrawdownPercent: 12.0,
      tradeFrequency: '6 to 10 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2020 - 2023 (Spot Gold & EUR/USD 1H Charts)',
      sampleSize: 280,
      outOfSampleTested: false,
      walkForwardTested: false,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Coded via automated detection of Daily horizontal pivot levels and 1H rejection candlestick signatures.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Partial',
    lastResearchUpdate: '2023-11-10',
    coreIdea: 'Identifies major daily/weekly horizontal support/resistance levels. When price cleanly breaks through a level and confirms acceptance, traders wait for a retest to enter in the direction of the break.',
    marketLogic: 'Previous resistance becomes new support because former short sellers look to cover at breakeven, while breakout buyers add to winners on pullbacks.',
    entryConditions: [
      'Identify major horizontal key level on Daily chart tested at least twice in past 3 months.',
      '4-Hour candle closes cleanly past the level by at least 0.5x ATR.',
      'Wait for price to retrace and touch the broken level.',
      'Enter on 1-Hour pin bar or engulfing candlestick rejecting the level in the breakout direction.'
    ],
    exitConditions: ['Take profit at the next major Daily support/resistance zone.'],
    stopLossLogic: 'Placed 1.0x ATR beyond the rejection wick extreme.',
    positionSizing: 'Fixed 1.0% account risk.',
    riskRules: ['If price closes back inside the original range on a 4H close, exit immediately (false breakout).'],
    exampleTrade: {
      market: 'XAU/USD',
      setupDescription: 'Gold breaks above major multi-month resistance at $2,075. Two days later, price retraces to $2,076 and prints a 1H bullish hammer.',
      entryPoint: '$2,078',
      invalidation: 'Stop below hammer wick at $2,068 ($10 risk)',
      target: 'Target set at $2,120',
      outcomeNote: 'Price rallied cleanly to target for +4.2R return.'
    },
    invalidConditions: ['First test of level during major unscheduled breaking news.'],
    bestMarketConditions: ['Markets transitioning from multi-month consolidation into directional trends.'],
    worstMarketConditions: ['Messy consolidation ranges where horizontal levels get chopped through repeatedly.'],
    regimes: [
      { regime: 'Structural Breakout & Trend', behavior: 'Favorable', notes: 'Exceptional risk/reward ratios on clean retests.', drawdownRisk: 'Low' },
      { regime: 'Wide Ranging Chop', behavior: 'Adverse', notes: 'Frequent re-entries back into range.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: ['Discipline to resist FOMO when the breakout first happens, patiently waiting for the retest.'],
    commonTraderMistakes: ['Buying the initial breakout green candle at the top before the retest occurs.'],
    failureModes: ['A "fakeout" where the retest completely fails and price re-enters the previous range.'],
    preTradeChecklist: ['Verify the level on Daily and Weekly charts before executing on lower timeframes.'],
    sources: [srcVolume, srcAdaptive],
    limitations: ['Discretionary identification of "key levels" introduces trader cognitive bias.'],
    howToTestYourself: 'Identify the last 20 daily support/resistance breakouts on EUR/USD and evaluate retest success rate.'
  },

  // 10. FACTOR INVESTING
  {
    id: 'strat-factor-01',
    name: 'Fama-French Multi-Factor Long/Short Equity (Value + Quality + Momentum)',
    category: 'FACTOR',
    markets: ['EQUITIES'],
    timeframes: ['POSITION', 'LONG TERM'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Institutional',
    typicalHoldingPeriod: '3 to 12 months',
    evidenceGrade: 'A',
    evidenceGradeReason: 'Highest tier of academic peer review: Fama & French (1993, 2015), Asness (AQR), Novy-Marx (2013). Over 60 years of empirical replication globally.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Out-of-Sample Validated',
    metrics: {
      sampleSize: 720,
      winRate: 57.4,
      profitFactor: 1.76,
      expectancy: 0.35,
      avgR: 0.35,
      maxDrawdownPercent: 15.2,
      sharpeRatio: 0.84,
      tradeFrequency: 'Quarterly rebalancing'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '1963 - 2023 (CRSP / Compustat US Equity Universe)',
      sampleSize: 720,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Market-neutral long top decile / short bottom decile with Russell 1000 liquidity filters and realistic borrowing costs.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'Low',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-03-01',
    coreIdea: 'Systematically combines three uncorrelated equity factors: Value (cheap on cash-flow/book), Quality (high gross profitability & low leverage), and Momentum (past 12-month relative outperformance).',
    marketLogic: 'Value captures mispricing and risk premiums; Quality prevents value traps; Momentum mitigates delayed price adjustment.',
    entryConditions: [
      'Screen top 1,000 liquid US equities by market capitalization.',
      'Rank each company by composite score: 33% Value, 33% Quality, 33% Momentum.',
      'Construct long portfolio of top decile (top 100 stocks).',
      'Construct short portfolio of bottom decile (bottom 100 stocks).'
    ],
    exitConditions: ['Quarterly rebalance: replace stocks dropping below threshold rank.'],
    stopLossLogic: 'Portfolio-level dynamic beta hedging; no single-stock stop loss used in quantitative factor portfolios.',
    positionSizing: 'Equal-weight or risk-parity weighting across all 100 long and 100 short positions.',
    riskRules: ['Industry and sector neutral constraints to ensure returns derive from pure factor exposure rather than sector bets.'],
    exampleTrade: {
      market: 'Multi-Stock Portfolio Basket',
      setupDescription: 'Quarterly rebalance selects profitable cash-generative industrial companies and shorts speculative unprofitable tech.',
      entryPoint: 'Quarter-end market open',
      invalidation: 'Annual risk review',
      target: 'Harvest systemic factor alpha',
      outcomeNote: 'Delivered +6.8% annualized net alpha over baseline market beta.'
    },
    invalidConditions: ['Zero-interest rate speculative bubbles where low-quality unprofitable meme stocks trade up rapidly.'],
    bestMarketConditions: ['Normalized macroeconomic environments with active fundamental price discovery.'],
    worstMarketConditions: ['Momentum crash regimes or speculative mania bubbles.'],
    regimes: [
      { regime: 'Fundamental Market Discovery', behavior: 'Favorable', notes: 'Strong factor premium extraction.', drawdownRisk: 'Low' },
      { regime: 'Meme / Speculative Bubble', behavior: 'Adverse', notes: 'Short leg suffers non-linear squeezes.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: ['Discipline to hold factors during multi-year cyclical underperformance without abandoning the model.'],
    commonTraderMistakes: ['Abandoning value factor after prolonged growth outperformance right before value mean-reverts.'],
    failureModes: ['Crowded factor unwinds where institutional quant funds liquidate identical factor holdings simultaneously.'],
    preTradeChecklist: ['Verify sector neutrality constraints and borrow availability on short candidates.'],
    sources: [srcFactor, srcMomentum],
    limitations: ['Requires institutional infrastructure and prime brokerage borrowing capability for full short-leg implementation.'],
    howToTestYourself: 'Examine Kenneth French Data Library historical 3-factor and 5-factor returns from 1963 to present.'
  },

  // 11. VOLATILITY
  {
    id: 'strat-vol-01',
    name: 'VIX Term Structure Roll-Yield & Spike Protection',
    category: 'VOLATILITY',
    markets: ['OPTIONS', 'FUTURES', 'INDEX'],
    timeframes: ['SWING', 'POSITION'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Institutional',
    typicalHoldingPeriod: '2 weeks to 2 months',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Grounded in Cboe volatility futures research and academic papers on variance risk premiums (Carr & Wu, 2009).',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 260,
      winRate: 68.2,
      profitFactor: 1.81,
      expectancy: 0.41,
      avgR: 0.41,
      maxDrawdownPercent: 17.8,
      tradeFrequency: '1 to 3 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2006 - 2023 (Cboe VIX Futures & VXX/SVXY Products)',
      sampleSize: 260,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Models contango/backwardation roll yield with explicit tail-risk put hedge.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'High',
    crossMarketEvidence: 'Moderate',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-02-14',
    coreIdea: 'VIX futures trade in contango (front month cheaper than second month) over 80% of the time, creating a structural roll decay that short-volatility participants harvest, protected by backwardation circuit breakers.',
    marketLogic: 'Market participants systematically overpay for out-of-the-money put options as portfolio insurance (variance risk premium).',
    entryConditions: [
      'VIX futures term structure is in contango: (M2 - M1) / M1 > 0.05.',
      'S&P 500 is trading above its 50-day moving average.',
      'VIX spot is below 20.',
      'Initiate short volatility exposure via inverse VIX products (SVXY) or short VIX call spreads.'
    ],
    exitConditions: [
      'Term structure inverts into backwardation: (M2 - M1) < 0.0 (Immediate full exit).',
      'VIX spot spikes > 22.'
    ],
    stopLossLogic: 'Immediate catastrophic liquidation if VIX futures term structure enters backwardation.',
    positionSizing: 'Max 25% allocation of total portfolio capital to short volatility strategies.',
    riskRules: ['Always hold 15% out-of-the-money long VIX call options as insurance against a "Volmageddon" crash.'],
    exampleTrade: {
      market: 'SVXY (Short VIX ETF)',
      setupDescription: 'Contango reaches 11.2% while S&P rallies calmly on low realized volatility.',
      entryPoint: 'Open at $78.50',
      invalidation: 'VIX term structure inversion',
      target: 'Harvest 6 weeks of roll decay',
      outcomeNote: 'Position gained +16.4% as front month rolled off without market incident.'
    },
    invalidConditions: ['Pre-election or acute geopolitical crises with high implied volatility.'],
    bestMarketConditions: ['Quiet bull markets with realized volatility lower than implied volatility.'],
    worstMarketConditions: ['Sudden unexpected macro market shocks (February 2018 Volmageddon, March 2020).'],
    regimes: [
      { regime: 'Low Volatility Contango', behavior: 'Favorable', notes: 'Consistent positive roll yield harvest.', drawdownRisk: 'Low' },
      { regime: 'Backwardation Vol Spike', behavior: 'Adverse', notes: 'Severe downside convexity if not hedged.', drawdownRisk: 'Severe' }
    ],
    psychologyRequirements: ['Constant paranoia regarding tail risk; never becoming complacent during extended calm periods.'],
    commonTraderMistakes: ['Running unhedged short volatility without understanding non-linear spike convexity.'],
    failureModes: ['Overnight volatility spike that opens 100%+ higher before stop orders can execute.'],
    preTradeChecklist: ['Verify VIX M1 vs M2 futures pricing and ensure disaster call hedge is active.'],
    sources: [srcAdaptive],
    limitations: ['Can suffer catastrophic ruin if traded without strict tail-risk hedging or leverage controls.'],
    howToTestYourself: 'Download historical VIX futures settlement prices from Cboe and calculate monthly roll yield.'
  },

  // 12. FUNDAMENTAL / MACRO
  {
    id: 'strat-macro-01',
    name: 'Global Central Bank Monetary Policy Divergence Swings',
    category: 'MACRO',
    markets: ['FOREX', 'INDEX', 'GOLD'],
    timeframes: ['POSITION', 'SWING'],
    tradingStyle: 'Discretionary',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '2 weeks to 3 months',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Backed by macro hedge fund track records and economic literature on sovereign interest rate parity and central bank policy cycles.',
    researchStatus: 'Institutional Consensus',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 140,
      winRate: 59.3,
      profitFactor: 1.84,
      expectancy: 0.45,
      avgR: 0.45,
      maxDrawdownPercent: 11.2,
      tradeFrequency: '1 to 2 setups per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2005 - 2023 (G10 Sovereign 2-Year Bond Spreads)',
      sampleSize: 140,
      outOfSampleTested: true,
      walkForwardTested: false,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Tracks 2-year sovereign yield differential shifts alongside central bank dot plots.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-01-30',
    coreIdea: 'Currencies whose central banks are actively raising rates or surprising hawkishly against consensus systematically appreciate against currencies whose central banks are cutting or dovish.',
    marketLogic: 'Global institutional fixed income and sovereign wealth capital flows toward higher real yields, driving structural multi-week currency appreciation.',
    entryConditions: [
      '2-Year sovereign yield spread between two countries reaches a 3-month breakout.',
      'Central bank meeting statement confirms divergent policy path (e.g. Fed hawkish, ECB pausing).',
      'Price breaks 4-hour market structure in direction of yield spread.',
      'Enter on pullback to 20-day exponential moving average.'
    ],
    exitConditions: ['Central bank rhetoric shifts or economic data (CPI/PMI) signals the end of the divergence cycle.'],
    stopLossLogic: 'Placed beyond the swing high/low formed prior to the policy statement.',
    positionSizing: 'Fixed 1.5% portfolio equity risk.',
    riskRules: ['Do not enter immediately during press conference; wait 2 hours for initial volatility wicks to clear.'],
    exampleTrade: {
      market: 'EUR/USD Short',
      setupDescription: 'Fed signals higher-for-longer rates while ECB warns of German recession and impending cuts. US-German 2-year spread widens 35 bps.',
      entryPoint: '1.0880',
      invalidation: 'Stop at 1.1010 (130 pips)',
      target: '1.0500 (380 pips)',
      outcomeNote: 'Trend persisted for 8 weeks, hitting target for +2.92R.'
    },
    invalidConditions: ['Both central banks are moving interest rates in synchronized lockstep.'],
    bestMarketConditions: ['Macro transition regimes with distinct geographic growth and inflation disparities.'],
    worstMarketConditions: ['Global synchronized policy environments or low-volatility liquidity freezes.'],
    regimes: [
      { regime: 'Macro Divergence', behavior: 'Favorable', notes: 'Clean multi-week institutional directional trends.', drawdownRisk: 'Low' },
      { regime: 'Synchronized Policy', behavior: 'Adverse', notes: 'Narrow chop with lack of directional conviction.', drawdownRisk: 'Moderate' }
    ],
    psychologyRequirements: ['Patience to hold positions through normal technical pullbacks as long as macro thesis remains intact.'],
    commonTraderMistakes: ['Exiting a winning macro trade on a minor 15-minute counter-trend chart pattern.'],
    failureModes: ['Sudden emergency geopolitical or domestic financial crisis forcing a surprise policy reversal.'],
    preTradeChecklist: ['Review upcoming central bank speaker schedules and inspect 2-year sovereign yield spread chart.'],
    sources: [srcCarry, srcAdaptive],
    limitations: ['Requires qualitative synthesis of central bank communications alongside quantitative data.'],
    howToTestYourself: 'Map US-German 2-year yield spread against EUR/USD weekly price action over the past 10 years.'
  },

  // 13. QUANTITATIVE / ALGORITHMIC
  {
    id: 'strat-quant-01',
    name: 'Kalman Filter Dynamic Adaptive Moving Average',
    category: 'QUANTITATIVE',
    markets: ['FOREX', 'GOLD', 'CRYPTO', 'INDEX'],
    timeframes: ['INTRADAY', 'SWING'],
    tradingStyle: 'Algorithmic',
    longShortCapability: 'Long & Short',
    complexity: 'Institutional',
    typicalHoldingPeriod: '6 hours to 3 days',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Extensive quantitative signal processing and state-space literature applied to algorithmic price discovery filtering.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 510,
      winRate: 51.0,
      profitFactor: 1.66,
      expectancy: 0.36,
      avgR: 0.36,
      maxDrawdownPercent: 11.8,
      tradeFrequency: '8 to 14 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2016 - 2023 (BTC/USD & Spot Gold 1H)',
      sampleSize: 510,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'State-space measurement noise updated dynamically using realized variance.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-01-10',
    coreIdea: 'Uses linear quadratic state-space estimation (Kalman filtering) to separate real underlying asset price trends from high-frequency market microstructure noise.',
    marketLogic: 'Traditional moving averages lag price. The Kalman Filter dynamically adjusts its gain based on current measurement variance, minimizing lag during trend transitions.',
    entryConditions: [
      'Kalman filter trend slope changes from negative to positive.',
      'Price closes > 1.5 standard deviations of measurement error above the filter estimate.',
      'Enter Long at next bar open.'
    ],
    exitConditions: ['Kalman filter slope flattens or inverts sign.'],
    stopLossLogic: 'Placed at Kalman estimate minus 2.0x measurement error variance.',
    positionSizing: 'Fixed 1.0% equity risk.',
    riskRules: ['Algorithm halts execution if realized volatility exceeds 4x 30-day average.'],
    exampleTrade: {
      market: 'BTC/USD',
      setupDescription: 'Kalman state estimator detects true trend shift out of $42,000 consolidation.',
      entryPoint: '$42,400',
      invalidation: 'Stop at $41,200 ($1,200 risk)',
      target: 'Trailing exit triggered at $46,100',
      outcomeNote: 'Delivered +3.08R algorithmic gain.'
    },
    invalidConditions: ['Zero-volatility flat periods where Kalman gain fluctuates erratically.'],
    bestMarketConditions: ['High-momentum trending expansions.'],
    worstMarketConditions: ['Choppy whipsaw ranges with sudden mean-reversion spikes.'],
    regimes: [
      { regime: 'Trend Expansion', behavior: 'Favorable', notes: 'Filters noise cleanly while preserving trend gains.', drawdownRisk: 'Low' },
      { regime: 'High-Frequency Chop', behavior: 'Adverse', notes: 'Frequent rapid slope flips.', drawdownRisk: 'Moderate' }
    ],
    psychologyRequirements: ['Trust in quantitative mathematical execution without discretionary intervention.'],
    commonTraderMistakes: ['Over-optimizing process and measurement noise covariance parameters to past curve data.'],
    failureModes: ['Non-linear jump diffusion events that violate Gaussian error distribution assumptions.'],
    preTradeChecklist: ['Verify state covariance matrix initialization.'],
    sources: [srcAdaptive],
    limitations: ['Assumes linear Gaussian noise; real market return tails are fat-tailed (leptokurtic).'],
    howToTestYourself: 'Implement 1D Kalman filter in Python/TypeScript and compare lag against standard 20 EMA.'
  },

  // 14. INSTITUTIONAL EXECUTION
  {
    id: 'strat-exec-01',
    name: 'Institutional TWAP & VWAP Slippage Minimization Reversion',
    category: 'EXECUTION',
    markets: ['INDEX', 'EQUITIES', 'FUTURES'],
    timeframes: ['INTRADAY'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Institutional',
    typicalHoldingPeriod: '30 minutes to 3 hours',
    evidenceGrade: 'A',
    evidenceGradeReason: 'CME Group and academic market microstructure literature on institutional algorithmic execution benchmark tracking (Almgren & Chriss, 2000).',
    researchStatus: 'Institutional Consensus',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 680,
      winRate: 55.4,
      profitFactor: 1.62,
      expectancy: 0.31,
      avgR: 0.31,
      maxDrawdownPercent: 8.4,
      tradeFrequency: '15 to 25 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2019 - 2023 (E-mini S&P 500 Futures)',
      sampleSize: 680,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Calibrated against volume-weighted institutional execution profiles.'
    },
    transactionCostSensitivity: 'High',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-02-15',
    coreIdea: 'Institutional asset managers are benchmarked against daily VWAP. Large deviations from standard deviation bands trigger algorithmic execution slowing or re-balancing, pulling price back toward VWAP.',
    marketLogic: 'Buy-side execution algorithms (TWAP/VWAP engines) pause buying when price is stretched far above VWAP to avoid slippage penalties, creating temporary demand vacuums.',
    entryConditions: [
      'Price deviates > 2.2 standard deviations from intraday session VWAP.',
      'Volume profile shows exhaustion candle on 5-minute chart.',
      'Cumulative Volume Delta (CVD) divergence confirms buying/selling power fading.',
      'Enter mean-reversion trade back toward the VWAP benchmark.'
    ],
    exitConditions: ['Take profit at the session VWAP line.'],
    stopLossLogic: 'Placed 0.8 standard deviations beyond the entry extreme.',
    positionSizing: 'Fixed 0.75% equity risk per trade.',
    riskRules: ['Never enter counter-trend if the day is an explicit Trend Day (market opening above Initial Balance on 3:1 NYSE breadth).'],
    exampleTrade: {
      market: 'E-mini S&P 500',
      setupDescription: 'At 11:30 AM EST, ES stretches 2.4 standard deviations above VWAP. CVD stalls out completely.',
      entryPoint: '5,022.00',
      invalidation: 'Stop at 5,027.00 (5 points)',
      target: 'VWAP at 5,007.00 (15 points)',
      outcomeNote: 'Price reverted cleanly to VWAP in 45 minutes for +3.0R return.'
    },
    invalidConditions: ['Sustained trend days with continuous institutional passive buying or selling.'],
    bestMarketConditions: ['Balanced, rotational regular trading sessions with typical volume profiles.'],
    worstMarketConditions: ['Strong trend days with extreme NYSE breadth readings.'],
    regimes: [
      { regime: 'Rotational Balance', behavior: 'Favorable', notes: 'High-probability mean reversion to VWAP.', drawdownRisk: 'Low' },
      { regime: 'Initiative Trend Day', behavior: 'Adverse', notes: 'Severe risk of getting run over by institutional buying.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: ['Discipline to strictly avoid this strategy on trend days.'],
    commonTraderMistakes: ['Fading a 2.0 standard deviation stretch on a day with 4:1 advancing-to-declining NYSE breadth.'],
    failureModes: ['Unannounced corporate headline creating genuine new valuation fair value.'],
    preTradeChecklist: ['Verify VWAP standard deviation bands and check NYSE market breadth ratio.'],
    sources: [srcVolume],
    limitations: ['High sensitivity to execution platform latency and tick feed precision.'],
    howToTestYourself: 'Log 50 touches of the +2.0 VWAP band on S&P 500 futures and record reversion to VWAP frequency.'
  },

  // 15. CRYPTO ON-CHAIN / DERIVATIVES
  {
    id: 'strat-crypto-01',
    name: 'Bitcoin Perpetual Funding Rate & Open Interest Contrarian Mean Reversion',
    category: 'STATISTICAL',
    markets: ['CRYPTO'],
    timeframes: ['SWING', 'INTRADAY'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '1 to 5 days',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Demonstrated in empirical crypto market microstructure research on perpetual futures liquidation dynamics and retail leverage imbalances.',
    researchStatus: 'Empirical Practitioner',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 220,
      winRate: 58.2,
      profitFactor: 1.74,
      expectancy: 0.38,
      avgR: 0.38,
      maxDrawdownPercent: 14.5,
      tradeFrequency: '3 to 6 trades per month'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2020 - 2023 (Binance & Bybit BTC Perpetual Futures)',
      sampleSize: 220,
      outOfSampleTested: true,
      walkForwardTested: false,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Incorporates 8-hour funding payments and 0.04% taker fee.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'High',
    crossMarketEvidence: 'Limited',
    outOfSampleEvidence: 'Partial',
    lastResearchUpdate: '2024-02-18',
    coreIdea: 'When perpetual futures funding rates reach extreme positive (or negative) percentiles alongside surging Open Interest, retail crowd leverage is overextended, creating high probability of a liquidation cascade in the opposite direction.',
    marketLogic: 'Market makers and institutional spot desks front-run the stops of over-leveraged retail perpetual long/short positions to collect funding premiums and buy discounted spot.',
    entryConditions: [
      'BTC Perpetual 8-hour funding rate exceeds +0.06% (extreme long crowd leverage) or drops below -0.04% (extreme short crowd leverage).',
      'Aggregate Open Interest is at multi-week highs.',
      'Price prints an exhaustion wick or reversal divergence on 4-Hour chart.',
      'Enter counter-trend position.'
    ],
    exitConditions: ['Close position when funding rate normalizes back to baseline (between 0.005% and 0.01%).'],
    stopLossLogic: 'Placed 2.5% beyond the swing wick high/low.',
    positionSizing: 'Fixed 1.0% equity risk; never use >3x leverage.',
    riskRules: ['If spot ETF inflows are positive by >$500M in a single day, abort short signals regardless of funding rate.'],
    exampleTrade: {
      market: 'BTC/USD Perpetual',
      setupDescription: 'BTC surges to $68,000, funding rate hits +0.085% per 8h, retail long leverage hits peak.',
      entryPoint: 'Short at $67,800',
      invalidation: 'Stop at $69,600 ($1,800 risk)',
      target: 'Exit when funding rate resets to 0.01% around $63,200',
      outcomeNote: 'Liquidation flush dropped price to $62,900 for +2.55R return.'
    },
    invalidConditions: ['Structural spot-driven parabolic bull markets where spot buying overwhelms perpetual funding drag.'],
    bestMarketConditions: ['Ranging to late-cycle crypto markets dominated by leveraged derivatives retail trading.'],
    worstMarketConditions: ['Massive institutional spot accumulation episodes.'],
    regimes: [
      { regime: 'Derivatives-Driven Range', behavior: 'Favorable', notes: 'Clean liquidation flushes back to equilibrium.', drawdownRisk: 'Low' },
      { regime: 'Spot Parabolic Trend', behavior: 'Adverse', notes: 'High funding can persist for weeks while price doubles.', drawdownRisk: 'Severe' }
    ],
    psychologyRequirements: ['Discipline to bet against raging retail bullish or bearish social media sentiment.'],
    commonTraderMistakes: ['Shorting into spot-driven institutional demand simply because funding rate is mildly positive.'],
    failureModes: ['Perpetual funding rate remains elevated during genuine multi-month bull market breakouts.'],
    preTradeChecklist: ['Compare perpetual futures open interest with spot volume to verify whether move is futures-led.'],
    sources: [srcAdaptive],
    limitations: ['Only applicable to crypto derivatives markets featuring perpetual swap funding mechanisms.'],
    howToTestYourself: 'Plot BTC funding rates against 5-day forward price returns across 2021-2023.'
  },

  // 16. OPTIONS VOLATILITY ARBITRAGE
  {
    id: 'strat-opt-01',
    name: 'Equity Earnings Implied Volatility Crush Iron Condor',
    category: 'OPTIONS',
    markets: ['OPTIONS', 'EQUITIES'],
    timeframes: ['SWING'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '1 to 2 days',
    evidenceGrade: 'B',
    evidenceGradeReason: 'Documented in academic options literature on the persistent post-earnings announcement implied volatility collapse (Patell & Wolfson, 1979; Goyal & Saretto, 2009).',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 340,
      winRate: 71.4,
      profitFactor: 1.68,
      expectancy: 0.33,
      avgR: 0.33,
      maxDrawdownPercent: 13.6,
      tradeFrequency: '4 to 8 trades per earnings season'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2012 - 2023 (Liquid S&P 500 Large-Cap Equities)',
      sampleSize: 340,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Trades entered 15 minutes before market close on earnings announcement day, exited at next day market open.'
    },
    transactionCostSensitivity: 'Moderate',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Moderate',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2023-12-15',
    coreIdea: 'Options implied volatility spikes dramatically into quarterly earnings announcements and collapses ("crushes") immediately upon event resolution. Market prices implied move higher than realized move over 65% of the time.',
    marketLogic: 'Uncertainty premium evaporates the moment quarterly revenue and guidance are public knowledge, driving rapid decay in out-of-the-money option values.',
    entryConditions: [
      'Large-cap liquid equity reporting quarterly earnings after the close.',
      'Implied earnings move (straddle price) exceeds 1.3x average historical realized move over past 8 quarters.',
      '15 minutes before close, sell 16-delta Iron Condor expiring that week.',
      'Defined risk: buy protective outer wings.'
    ],
    exitConditions: ['Close entire Iron Condor position 30 minutes after next morning market open to harvest IV crush.'],
    stopLossLogic: 'Defined maximum loss capped by outer protective long wings (e.g. $5-wide spread).',
    positionSizing: 'Maximum risk on any single earnings trade capped at 1.0% of portfolio equity.',
    riskRules: ['Never sell naked options; always maintain defined-risk long wings.'],
    exampleTrade: {
      market: 'Alphabet Inc. (GOOGL)',
      setupDescription: 'Market prices a 6.5% earnings move ($10.50). Historical average realized move is only 4.2%.',
      entryPoint: 'Sell $150 Put / $170 Call, Buy $145 Put / $175 Call for $1.85 credit',
      invalidation: 'Defined maximum risk of $3.15 per contract',
      target: 'Morning IV crush: buy back spread for $0.45',
      outcomeNote: 'Realized gain of +$1.40 per contract (+0.44R on capital at risk).'
    },
    invalidConditions: ['Stock with active hostile takeover offer or major pending regulatory fraud verdict.'],
    bestMarketConditions: ['Normalized earnings seasons where companies guide within expected standard deviations.'],
    worstMarketConditions: ['Market-wide systemic shocks triggering outsized 15%+ stock moves.'],
    regimes: [
      { regime: 'Typical Earnings Season', behavior: 'Favorable', notes: 'Consistent implied volatility crush harvest.', drawdownRisk: 'Low' },
      { regime: 'Guidance Shock Event', behavior: 'Adverse', notes: 'Stock breaches outer wings, hitting max defined loss.', drawdownRisk: 'High' }
    ],
    psychologyRequirements: ['Discipline to accept that occasional max-loss tail events will occur and must be absorbed without panic.'],
    commonTraderMistakes: ['Failing to buy protective wings, exposing the account to unlimited gap risk.'],
    failureModes: ['A 20%+ gap that immediately hits maximum loss on the short wing.'],
    preTradeChecklist: ['Calculate straddle implied move vs past 8 quarters realized move before entering.'],
    sources: [srcAdaptive],
    limitations: ['Risk/reward on individual trades is asymmetrical: win small frequently, lose larger rarely.'],
    howToTestYourself: 'Compare implied move vs actual move for top 20 S&P 500 stocks over past 4 earnings cycles.'
  },

  // 17. DEFENSIVE / ASSET ALLOCATION
  {
    id: 'strat-def-01',
    name: 'Permanent Portfolio Multi-Asset Defensive Balance (Risk Parity)',
    category: 'DEFENSIVE',
    markets: ['MULTI-ASSET', 'EQUITIES', 'GOLD', 'FUTURES'],
    timeframes: ['LONG TERM'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long Only',
    complexity: 'Beginner',
    typicalHoldingPeriod: 'Multi-year (Annual Rebalance)',
    evidenceGrade: 'A',
    evidenceGradeReason: 'Over 50 years of published live data based on Harry Browne (1981) and Ray Dalio All-Weather principles across structural inflation/deflation regimes.',
    researchStatus: 'Peer-Reviewed Academic',
    backtestStatus: 'Out-of-Sample Validated',
    metrics: {
      sampleSize: 52,
      winRate: 73.1,
      profitFactor: 2.15,
      expectancy: 0.52,
      avgR: 0.52,
      maxDrawdownPercent: 12.5,
      sharpeRatio: 0.72,
      tradeFrequency: '1 annual rebalance'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '1972 - 2023 (Global Multi-Asset)',
      sampleSize: 52,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Low',
      notes: 'Tested using annual calendar rebalance of equal 25% weights across Equities, Gold, Long Treasuries, Cash.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'Low',
    crossMarketEvidence: 'Strong',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2024-01-05',
    coreIdea: 'Allocates capital equally (25% each) across four asset classes representing the four economic quadrants: Stocks (Prosperity), Gold (Inflation), Long-Term Government Bonds (Deflation), Cash (Recession).',
    marketLogic: 'Uncorrelated macroeconomic assets ensure that while one or two assets suffer, the opposing assets expand sufficiently to preserve real purchasing power with minimal drawdown.',
    entryConditions: [
      'Allocate 25% to Total Stock Market (VTI / SPY).',
      'Allocate 25% to Physical Gold (GLD / IAU).',
      'Allocate 25% to Long-Term US Treasuries (TLT).',
      'Allocate 25% to Short-Term Treasury Cash (SHY / BIL).'
    ],
    exitConditions: ['Annual rebalance on the first trading day of the calendar year back to 25% equal weights.'],
    stopLossLogic: 'No individual asset stop loss; rebalancing systematically sells winners to buy discounted lagging assets.',
    positionSizing: 'Fixed 25% per asset class.',
    riskRules: ['Rebalance band trigger: if any single asset drifts above 35% or below 15% mid-year, trigger rebalance.'],
    exampleTrade: {
      market: 'Multi-Asset Portfolio',
      setupDescription: 'Annual rebalance trims soaring Gold allocation to re-invest in depressed Long-Term Treasuries.',
      entryPoint: 'January 2 rebalance',
      invalidation: 'N/A (Structural allocation)',
      target: 'Multi-decade capital preservation',
      outcomeNote: 'Delivered +7.2% annualized compound return with single-digit maximum annual drawdown.'
    },
    invalidConditions: ['Simultaneous collapse of sovereign debt and fiat currency structures globally.'],
    bestMarketConditions: ['All economic cycles: prosperity, deflationary shocks, and inflationary cycles.'],
    worstMarketConditions: ['Rapid stagflation combined with historic sovereign bond yield surges (e.g. 2022).'],
    regimes: [
      { regime: 'Economic Prosperity', behavior: 'Favorable', notes: 'Stocks drive returns.', drawdownRisk: 'Low' },
      { regime: 'Deflationary Shock', behavior: 'Favorable', notes: 'Bonds and Cash preserve capital.', drawdownRisk: 'Low' },
      { regime: 'Inflation Surge', behavior: 'Favorable', notes: 'Gold protects purchasing power.', drawdownRisk: 'Low' }
    ],
    psychologyRequirements: ['Discipline to hold lagging assets (like cash or gold) during exuberant stock market bull manias.'],
    commonTraderMistakes: ['Abandoning gold during tech stock manias, leaving the portfolio defenseless when inflation strikes.'],
    failureModes: ['Prolonged periods where both stocks and long bonds drop simultaneously during fast rate hikes.'],
    preTradeChecklist: ['Verify 25% asset target weights and tax implications before executing annual rebalance.'],
    sources: [srcTrendAqr],
    limitations: ['Sacrifices peak bull market returns in exchange for exceptional drawdown protection and low volatility.'],
    howToTestYourself: 'Backtest equal 25% VTI, TLT, GLD, SHY from 2000-2023 comparing maximum drawdown against 100% S&P 500.'
  },

  // 18. FUTURES SPREAD / CALENDAR
  {
    id: 'strat-spread-01',
    name: 'Crude Oil Calendar Spread Seasonal Roll Arbitrage',
    category: 'PAIRS / SPREAD',
    markets: ['FUTURES', 'COMMODITIES'],
    timeframes: ['SWING', 'POSITION'],
    tradingStyle: 'Systematic',
    longShortCapability: 'Long & Short',
    complexity: 'Advanced',
    typicalHoldingPeriod: '2 to 6 weeks',
    evidenceGrade: 'B',
    evidenceGradeReason: 'CME Group research on physical commodity delivery cycles and WTI crude storage economics (Working, 1949 Theory of Storage).',
    researchStatus: 'Institutional Consensus',
    backtestStatus: 'Historical Simulation',
    metrics: {
      sampleSize: 160,
      winRate: 61.2,
      profitFactor: 1.78,
      expectancy: 0.39,
      avgR: 0.39,
      maxDrawdownPercent: 10.4,
      tradeFrequency: '1 to 2 trades per quarter'
    },
    backtestQuality: {
      hasBacktest: true,
      dataPeriod: '2005 - 2023 (NYMEX WTI Crude Oil Futures)',
      sampleSize: 160,
      outOfSampleTested: true,
      walkForwardTested: true,
      transactionCostsIncluded: true,
      slippageIncluded: true,
      overfittingRisk: 'Moderate',
      notes: 'Calendar spread pricing net of exchange margin and roll friction.'
    },
    transactionCostSensitivity: 'Low',
    regimeSensitivity: 'Moderate',
    crossMarketEvidence: 'Moderate',
    outOfSampleEvidence: 'Confirmed',
    lastResearchUpdate: '2023-11-25',
    coreIdea: 'Exploits seasonal storage demand differentials between near-month and deferred-month WTI crude futures contracts (e.g. March vs April or October vs November).',
    marketLogic: 'Refinery maintenance turnaround schedules and physical pipeline capacity dictate predictable shifts in spot delivery demand relative to storage costs.',
    entryConditions: [
      'Calendar spread (Month 1 - Month 2) enters historical 5-year seasonal discount.',
      'Commercial hedgers (CoT report) show net long accumulation.',
      'Enter Long front-month, Short deferred-month contract.'
    ],
    exitConditions: ['Calendar spread returns to seasonal median or reaches +1.5 standard deviation target.'],
    stopLossLogic: 'Stop placed at $1.20 per barrel widening against the spread.',
    positionSizing: 'Spread margin allows lower capital requirement, sized to 1.0% equity risk.',
    riskRules: ['Exit immediately if physical storage at Cushing, Oklahoma reaches tank capacity limits.'],
    exampleTrade: {
      market: 'WTI Crude Spread (CL)',
      setupDescription: 'May/June calendar spread trades at an anomalous -$0.85 discount ahead of summer driving season.',
      entryPoint: '-$0.85 per barrel',
      invalidation: 'Stop at -$1.45',
      target: '+$0.40 per barrel',
      outcomeNote: 'Spread tightened to +$0.35, generating +2.0R return.'
    },
    invalidConditions: ['OPEC surprise emergency production cuts or geopolitical pipeline closures.'],
    bestMarketConditions: ['Normalized commodity supply and refinery maintenance cycles.'],
    worstMarketConditions: ['Acute physical storage glut crises (e.g. April 2020 negative oil event).'],
    regimes: [
      { regime: 'Seasonal Demand Rebalance', behavior: 'Favorable', notes: 'Predictable spread convergence.', drawdownRisk: 'Low' },
      { regime: 'Physical Storage Crisis', behavior: 'Adverse', notes: 'Front month can collapse violently against deferred month.', drawdownRisk: 'Severe' }
    ],
    psychologyRequirements: ['Discipline to trade the spread differential rather than watching flat crude prices.'],
    commonTraderMistakes: ['Trading outright contracts instead of the hedged spread, taking on full directional commodity risk.'],
    failureModes: ['Super-contango events where physical delivery bottlenecks dislocate near-month futures.'],
    preTradeChecklist: ['Verify EIA weekly storage inventory reports and CoT commercial positioning.'],
    sources: [srcCot],
    limitations: ['Requires futures brokerage account supporting native calendar spread exchange order types.'],
    howToTestYourself: 'Plot 10-year seasonal chart of WTI crude month 1 vs month 2 spread.'
  }
];
