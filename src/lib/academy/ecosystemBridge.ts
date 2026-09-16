import { Trade, Strategy, TradingRule, LearningEntry, RuleCategory, Market, Direction } from '@/types';
import { Lesson, AcademyConcept, CurriculumConcept } from '@/types/academy';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { ALL_CURRICULUM_CONCEPTS } from '@/data/academy/registry';

// Minimum sample thresholds to prevent statistical hallucinations
export const MIN_TRADES_FOR_STATS = 5;
export const MIN_TRADES_FOR_PSYCHOLOGY = 3;

export interface JournalEmpiricalSummary {
  hasEnoughData: boolean;
  totalTrades: number;
  winRate: number;
  avgWinR: number;
  avgLossR: number;
  payoffRatio: number;
  expectedValueR: number;
  profitFactor: number;
  maxDrawdownPct: number;
  statusLabel: string;
  statement: string;
  subtext: string;
}

export interface PsychologyEmpiricalSummary {
  hasEnoughData: boolean;
  totalEmotionsLogged: number;
  topEmotion: string | null;
  topEmotionCount: number;
  topEmotionPct: number;
  emotionalWinRate: number | null;
  statusLabel: string;
  statement: string;
  subtext: string;
}

/**
 * Calculates empirical statistics from the user's real journal trades.
 * Strictly enforces:
 * - If < 5 trades: returns "Not enough data yet."
 * - If >= 5 trades: returns real empirical metrics with "Your journal currently shows..."
 * - Never invents personalized statistics.
 */
export function getJournalEmpiricalSummary(trades: Trade[]): JournalEmpiricalSummary {
  if (!trades || !Array.isArray(trades)) {
    return {
      hasEnoughData: false,
      totalTrades: 0,
      winRate: 0,
      avgWinR: 0,
      avgLossR: 0,
      payoffRatio: 0,
      expectedValueR: 0,
      profitFactor: 0,
      maxDrawdownPct: 0,
      statusLabel: 'Not enough data yet.',
      statement: 'Not enough data yet.',
      subtext: `Log at least ${MIN_TRADES_FOR_STATS} resolved trades in your Journal to calculate personalized empirical statistics.`
    };
  }

  // Filter closed trades only
  const closed = trades.filter(t => (t.result && t.result !== 'PENDING') || (t.pnl !== undefined && t.pnl !== null));

  if (closed.length < MIN_TRADES_FOR_STATS) {
    return {
      hasEnoughData: false,
      totalTrades: closed.length,
      winRate: 0,
      avgWinR: 0,
      avgLossR: 0,
      payoffRatio: 0,
      expectedValueR: 0,
      profitFactor: 0,
      maxDrawdownPct: 0,
      statusLabel: 'Not enough data yet.',
      statement: 'Not enough data yet.',
      subtext: `Currently ${closed.length}/${MIN_TRADES_FOR_STATS} trades logged. Need at least ${MIN_TRADES_FOR_STATS} resolved trades in your Journal to calculate personalized empirical statistics.`
    };
  }

  let wins = 0;
  let winRSum = 0;
  let winCount = 0;
  let lossRSum = 0;
  let lossCount = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  closed.forEach(t => {
    const pnl = t.pnl ?? 0;
    const r = t.rMultiple !== undefined ? t.rMultiple : (t.rrRatio !== undefined ? (pnl > 0 ? t.rrRatio : -1) : (pnl > 0 ? 1.5 : -1));
    if (pnl > 0) {
      wins += 1;
      grossProfit += pnl;
      winRSum += Math.abs(r);
      winCount += 1;
    } else if (pnl < 0) {
      grossLoss += Math.abs(pnl);
      lossRSum += Math.abs(r);
      lossCount += 1;
    }
  });

  const total = closed.length;
  const winRate = Math.round((wins / total) * 100);
  const avgWinR = winCount > 0 ? Number((winRSum / winCount).toFixed(2)) : 0;
  const avgLossR = lossCount > 0 ? Number((lossRSum / lossCount).toFixed(2)) : 1;
  const payoffRatio = avgLossR > 0 ? Number((avgWinR / avgLossR).toFixed(2)) : avgWinR;

  const pWin = winRate / 100;
  const pLoss = 1 - pWin;
  const expectedValueR = Number(((pWin * avgWinR) - (pLoss * avgLossR)).toFixed(2));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 99 : 0);

  // Peak to trough drawdown
  let peak = 0;
  let running = 0;
  let maxDd = 0;
  closed.forEach(t => {
    running += (t.pnl ?? 0);
    if (running > peak) peak = running;
    const dd = peak > 0 ? ((peak - running) / peak) * 100 : 0;
    if (dd > maxDd) maxDd = dd;
  });

  return {
    hasEnoughData: true,
    totalTrades: total,
    winRate,
    avgWinR,
    avgLossR,
    payoffRatio,
    expectedValueR,
    profitFactor,
    maxDrawdownPct: Number(maxDd.toFixed(1)),
    statusLabel: 'Your journal currently shows…',
    statement: `Your journal currently shows a win rate of ${winRate}% with an expected value of ${expectedValueR >= 0 ? '+' : ''}${expectedValueR} R across ${total} closed trades.`,
    subtext: `Empirical benchmarks: Payoff Ratio: ${payoffRatio}:1 | Profit Factor: ${profitFactor} | Max Drawdown: ${maxDd.toFixed(1)}%`
  };
}

/**
 * Calculates empirical behavioral statistics from the user's recorded emotions.
 * Strictly enforces:
 * - If < 3 trades with recorded emotions: "Not enough data yet."
 * - If >= 3 trades: "Your journal currently shows..."
 */
export function getPsychologyEmpiricalSummary(trades: Trade[]): PsychologyEmpiricalSummary {
  if (!trades || !Array.isArray(trades)) {
    return {
      hasEnoughData: false,
      totalEmotionsLogged: 0,
      topEmotion: null,
      topEmotionCount: 0,
      topEmotionPct: 0,
      emotionalWinRate: null,
      statusLabel: 'Not enough data yet.',
      statement: 'Not enough data yet.',
      subtext: `Record psychological emotions on at least ${MIN_TRADES_FOR_PSYCHOLOGY} trades to unlock behavioral analytics.`
    };
  }

  const emotionalTrades = trades.filter(t => t.emotions && Array.isArray(t.emotions) && t.emotions.length > 0);

  if (emotionalTrades.length < MIN_TRADES_FOR_PSYCHOLOGY) {
    return {
      hasEnoughData: false,
      totalEmotionsLogged: emotionalTrades.length,
      topEmotion: null,
      topEmotionCount: 0,
      topEmotionPct: 0,
      emotionalWinRate: null,
      statusLabel: 'Not enough data yet.',
      statement: 'Not enough data yet.',
      subtext: `Only ${emotionalTrades.length}/${MIN_TRADES_FOR_PSYCHOLOGY} trades have emotions tagged. Log emotions on at least ${MIN_TRADES_FOR_PSYCHOLOGY} trades to detect behavioral triggers.`
    };
  }

  const emotionMap: Record<string, { count: number; wins: number; totalResolved: number }> = {};

  emotionalTrades.forEach(t => {
    const isWin = (t.pnl ?? 0) > 0 || t.result === 'WIN';
    const isResolved = t.result !== 'PENDING';

    t.emotions.forEach(e => {
      if (!emotionMap[e]) {
        emotionMap[e] = { count: 0, wins: 0, totalResolved: 0 };
      }
      emotionMap[e].count += 1;
      if (isResolved) {
        emotionMap[e].totalResolved += 1;
        if (isWin) emotionMap[e].wins += 1;
      }
    });
  });

  const sorted = Object.entries(emotionMap).sort((a, b) => b[1].count - a[1].count);
  if (sorted.length === 0) {
    return {
      hasEnoughData: false,
      totalEmotionsLogged: 0,
      topEmotion: null,
      topEmotionCount: 0,
      topEmotionPct: 0,
      emotionalWinRate: null,
      statusLabel: 'Not enough data yet.',
      statement: 'Not enough data yet.',
      subtext: `Log emotions on at least ${MIN_TRADES_FOR_PSYCHOLOGY} trades to detect behavioral triggers.`
    };
  }

  const [topEmotion, data] = sorted[0];
  const pct = Math.round((data.count / emotionalTrades.length) * 100);
  const winRate = data.totalResolved > 0 ? Math.round((data.wins / data.totalResolved) * 100) : null;

  return {
    hasEnoughData: true,
    totalEmotionsLogged: emotionalTrades.length,
    topEmotion,
    topEmotionCount: data.count,
    topEmotionPct: pct,
    emotionalWinRate: winRate,
    statusLabel: 'Your journal currently shows…',
    statement: `Your journal currently shows '${topEmotion}' is your most frequent emotional state (logged in ${data.count} trades, ${pct}% of emotional entries)${winRate !== null ? ` with a ${winRate}% win rate` : ''}.`,
    subtext: `Based on ${emotionalTrades.length} behavioral entries in your TradeVault Journal.`
  };
}

// ---------------------------------------------------------------------------
// ECOSYSTEM WORKFLOW GENERATORS
// ---------------------------------------------------------------------------

export interface RuleGenerationPayload {
  text: string;
  category: RuleCategory;
  priority: 'Critical' | 'Important' | 'Optional';
  source: string;
}

export interface StrategyTemplatePayload {
  name: string;
  shortDescription: string;
  detailedDescription: string;
  markets: string[];
  sessions: string[];
  timeframes: string[];
  entryRules: { id: string; text: string }[];
  invalidationRules: { id: string; text: string }[];
  exitRules: {
    takeProfitLogic: string;
    stopLossLogic: string;
    partialExitRules: string;
    trailingStopRules: string;
    minimumRR: string;
  };
  riskRules: {
    defaultRisk: string;
    maxRisk: string;
    minRR: string;
    maxTradesPerDay: string;
  };
  checklist: { id: string; text: string }[];
  notes: string;
}

export interface TradePrefillPayload {
  market: Market;
  direction: Direction;
  riskPercent: string;
  session: string;
  notes: string;
  strategy?: string;
}

export interface RiskCalculatorPrefillPayload {
  riskPercent: string;
  symbol: string;
  direction: Direction;
  entryPrice?: string;
  stopLossPrice?: string;
  takeProfitPrice?: string;
}

/**
 * Maps any Academy Lesson to a real, high-quality TradingRule object.
 * Workflow: Academy Learning -> Rule
 */
export function generateRuleFromLesson(lesson: Lesson): RuleGenerationPayload {
  let category: RuleCategory = 'General';
  let ruleText = '';
  let priority: 'Critical' | 'Important' | 'Optional' = 'Important';

  const domain = lesson.domain;

  if (domain === 'Risk Management') {
    category = 'Risk Management';
    priority = 'Critical';
    if (lesson.id.includes('position-sizing')) {
      ruleText = `Calculate position size backwards from stop loss distance so total risk never exceeds 1.0% of account equity.`;
    } else if (lesson.id.includes('drawdown') || lesson.id.includes('ruin')) {
      ruleText = `Halt trading for the day if drawdown reaches 2.5% of account balance to prevent tilt and risk of ruin.`;
    } else if (lesson.id.includes('expected-value') || lesson.id.includes('edge')) {
      ruleText = `Only execute setups with a minimum planned Risk-to-Reward ratio of 1.5R and documented positive expected value.`;
    } else {
      ruleText = `Strictly enforce risk invariance: dollar risk per trade must remain constant regardless of market volatility.`;
    }
  } else if (domain === 'Trading Psychology') {
    category = 'Psychology';
    priority = 'Critical';
    if (lesson.id.includes('bias') || lesson.id.includes('fomo')) {
      ruleText = `Never chase an entry after a breakout has extended; require a retest or pass on the trade.`;
    } else {
      ruleText = `Implement a mandatory 15-minute screen pause after any loss or breakeven exit before evaluating another setup.`;
    }
  } else if (domain === 'Execution') {
    category = 'Execution';
    priority = 'Important';
    ruleText = `Use passive limit orders for entry when crossing the spread would incur unacceptable friction and slippage.`;
  } else if (domain === 'Technical Analysis' || domain === 'Market Knowledge') {
    category = 'Market';
    priority = 'Important';
    ruleText = `Always confirm higher timeframe market structure alignment (H4/Daily) before executing on lower timeframe triggers.`;
  } else {
    category = 'Strategy';
    priority = 'Important';
    ruleText = `Execute only trades that meet all pre-trade checklist criteria for the defined strategy setup.`;
  }

  return {
    text: `[Academy Level ${lesson.level}: ${lesson.title}] ${ruleText}`,
    category,
    priority,
    source: `Academy Level ${lesson.level}: ${lesson.title}`
  };
}

/**
 * Maps any Academy Concept to a real TradingRule object.
 */
export function generateRuleFromConcept(concept: AcademyConcept | CurriculumConcept): RuleGenerationPayload {
  let category: RuleCategory = 'General';
  const cId = concept.id.toLowerCase();

  if (cId.includes('risk') || cId.includes('position') || cId.includes('drawdown') || cId.includes('ruin') || cId.includes('stop')) {
    category = 'Risk Management';
  } else if (cId.includes('psych') || cId.includes('fomo') || cId.includes('tilt') || cId.includes('bias') || cId.includes('discipline')) {
    category = 'Psychology';
  } else if (cId.includes('exec') || cId.includes('order') || cId.includes('spread') || cId.includes('slippage')) {
    category = 'Execution';
  } else if (cId.includes('structure') || cId.includes('trend') || cId.includes('liquidity') || cId.includes('volume')) {
    category = 'Market';
  } else {
    category = 'Strategy';
  }

  const takeaway = 'keyTakeaways' in concept && Array.isArray(concept.keyTakeaways) && concept.keyTakeaways.length > 0
    ? concept.keyTakeaways[0]
    : ('summary' in concept 
        ? (concept as any).summary 
        : ('shortExplanation' in concept ? (concept as any).shortExplanation : concept.title));

  return {
    text: `[Academy Principle: ${concept.title}] ${takeaway}`,
    category,
    priority: category === 'Risk Management' || category === 'Psychology' ? 'Critical' : 'Important',
    source: `Academy Concept: ${concept.title}`
  };
}

/**
 * Generates an institutional Strategy Template from a Strategy Engineering lesson.
 * Workflow: Academy Learning -> Strategy
 */
export function generateStrategyTemplateFromLesson(lesson: Lesson): StrategyTemplatePayload {
  const isBreakout = lesson.id.includes('breakout') || lesson.title.toLowerCase().includes('breakout');
  const isReversal = lesson.id.includes('reversal') || lesson.title.toLowerCase().includes('reversal');

  if (isBreakout) {
    return {
      name: `Institutional Breakout (${lesson.title})`,
      shortDescription: `Strategy framework designed from Academy Level ${lesson.level}: ${lesson.title}.`,
      detailedDescription: `A systematic strategy capturing volatility expansion following structural consolidation and liquidity sweeps, following the institutional principles taught in ${lesson.title}.`,
      markets: ['EUR/USD', 'GBP/USD', 'BTC/USD', 'XAU/USD'],
      sessions: ['London', 'New York'],
      timeframes: ['15m', '1H', '4H'],
      entryRules: [
        { id: '1', text: 'Consolidation of at least 20 bars on the 15m chart with declining volume' },
        { id: '2', text: 'Clean liquidity sweep of Asian or prior session high/low' },
        { id: '3', text: 'Impulsive break of market structure with candle body close outside range' }
      ],
      invalidationRules: [
        { id: '4', text: 'Immediate failure to hold the breakout level (false breakout rejection candle)' },
        { id: '5', text: 'Price re-enters and closes back inside the middle 50% of the consolidation box' }
      ],
      exitRules: {
        takeProfitLogic: 'Take 50% off at 2.0R; trail remaining 50% below swing lows on 15m.',
        stopLossLogic: 'Placed 2 pips beyond the pre-breakout structural swing point.',
        partialExitRules: 'Scale out 50% at 2R target; move stop to breakeven.',
        trailingStopRules: 'Trail behind every new higher swing low on 15m.',
        minimumRR: '2.0'
      },
      riskRules: {
        defaultRisk: '1.0',
        maxRisk: '1.5',
        minRR: '2.0',
        maxTradesPerDay: '2'
      },
      checklist: [
        { id: 'c1', text: 'Higher timeframe trend (Daily/4H) aligned with breakout direction' },
        { id: 'c2', text: 'High-impact economic news releases checked and clear' },
        { id: 'c3', text: 'Exact position size calculated using 1% invariant risk limit' }
      ],
      notes: `Built directly from TradeVault Academy Level ${lesson.level}: ${lesson.title}.`
    };
  }

  // General Institutional Systematic Strategy
  return {
    name: `Systematic Trend & Structure (${lesson.title})`,
    shortDescription: `Structured trading framework engineered from Academy Level ${lesson.level}.`,
    detailedDescription: `Grounded in institutional market microstructure and risk invariance, designed to execute high-expectancy setups with strict invalidation levels.`,
    markets: ['EUR/USD', 'XAU/USD', 'GBP/USD'],
    sessions: ['London', 'New York'],
    timeframes: ['15m', '1H'],
    entryRules: [
      { id: '1', text: 'Higher timeframe structure (4H/Daily) is trending with clear swing highs/lows' },
      { id: '2', text: 'Price pulls back into discount zone (50-61.8% Fibonacci retracement)' },
      { id: '3', text: 'Lower timeframe shift of market structure confirms buyers/sellers stepping in' }
    ],
    invalidationRules: [
      { id: '4', text: 'Break and close beyond the origin swing point defining the structure' },
      { id: '5', text: 'Violation of the HTF order block' }
    ],
    exitRules: {
      takeProfitLogic: 'Target the liquidity resting above/below the major HTF swing target.',
      stopLossLogic: 'Strict invalidation stop placed 1-2 pips beyond swing extreme.',
      partialExitRules: 'Lock in 1R at first liquidity pool; hold runner to HTF target.',
      trailingStopRules: 'Move stop to breakeven once price reaches +1.5R.',
      minimumRR: '2.0'
    },
    riskRules: {
      defaultRisk: '1.0',
      maxRisk: '1.5',
      minRR: '2.0',
      maxTradesPerDay: '3'
    },
    checklist: [
      { id: 'c1', text: 'Planned entry offers at least 2.0R to the major technical target' },
      { id: 'c2', text: 'Spread is normal (< 1.5 pips) before entering order' },
      { id: 'c3', text: 'Emotional state is Calm (no FOMO or revenge urgency)' }
    ],
    notes: `Derived from TradeVault Academy Level ${lesson.level}: ${lesson.title}.`
  };
}

/**
 * Generates pre-filled parameters for Add Trade execution.
 * Workflow: Academy Learning -> Trade
 * Note: Never duplicates trades or creates mock records. Just provides form presets.
 */
export function generateTradePrefillFromLesson(lesson: Lesson): TradePrefillPayload {
  let notes = `[Academy Level ${lesson.level} Drill: ${lesson.title}]\n\nEducational Focus:\n- Strict adherence to technical invalidation point\n- Position size calculated using fixed invariant risk\n- Zero emotional chasing`;

  let market: Market = 'EUR/USD';
  if (lesson.id.includes('crypto') || lesson.title.toLowerCase().includes('crypto')) market = 'BTC/USD';
  if (lesson.id.includes('commodity') || lesson.title.toLowerCase().includes('gold')) market = 'XAU/USD';

  return {
    market,
    direction: 'BUY',
    riskPercent: '1.0',
    session: 'London',
    notes,
    strategy: `Academy Drill - ${lesson.domain}`
  };
}

/**
 * Generates pre-filled parameters for Risk Calculator.
 * Workflow: Academy Learning -> Risk Calculator
 */
export function generateRiskCalculatorPrefillFromLesson(lesson: Lesson): RiskCalculatorPrefillPayload {
  let symbol = 'EUR/USD';
  let entryPrice = '1.08500';
  let stopLossPrice = '1.08200'; // 30 pips
  let takeProfitPrice = '1.09100'; // 60 pips (2.0R)

  if (lesson.id.includes('gold') || lesson.title.toLowerCase().includes('gold')) {
    symbol = 'XAU/USD';
    entryPrice = '2650.00';
    stopLossPrice = '2640.00';
    takeProfitPrice = '2675.00';
  } else if (lesson.id.includes('crypto') || lesson.title.toLowerCase().includes('btc')) {
    symbol = 'BTC/USD';
    entryPrice = '90000';
    stopLossPrice = '88500';
    takeProfitPrice = '94500';
  }

  return {
    riskPercent: '1.0',
    symbol,
    direction: 'BUY',
    entryPrice,
    stopLossPrice,
    takeProfitPrice
  };
}

/**
 * Safely looks up an existing trade by ID.
 * Enforces the Single Source of Truth invariant:
 * Trade ID is the sole reference; no duplicate records are ever created.
 */
export function findTradeById(trades: Trade[], tradeId: string): Trade | undefined {
  if (!trades || !tradeId) return undefined;
  return trades.find(t => t.id === tradeId);
}
