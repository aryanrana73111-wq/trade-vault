import {
  Arena,
  CompetitionRule,
  CompetitionRuleType,
  CompetitionTrade,
  CompetitionViolation,
  RuleEvaluationLog,
  RuleSeverity,
  RuleEnforcement
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

export interface RuleTypeDefinition {
  type: CompetitionRuleType;
  name: string;
  category: 'risk' | 'volume' | 'boundary' | 'discipline' | 'custom';
  defaultUnit: string;
  defaultLimit: number | string | string[];
  comparisonOperator: '>' | '<' | '>=' | '<=' | 'IN' | 'NOT_IN' | '==';
  defaultSeverity: RuleSeverity;
  defaultEnforcement: RuleEnforcement;
  defaultDescription: (limit: any, unit: string) => string;
  placeholder: string;
  explanation: string;
  isNumeric: boolean;
}

export const RULE_TYPE_DEFINITIONS: Record<CompetitionRuleType, RuleTypeDefinition> = {
  MAX_DRAWDOWN: {
    type: 'MAX_DRAWDOWN',
    name: 'Maximum Drawdown',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 200,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Participant is disqualified if absolute drawdown from peak equity exceeds ${unit}${limit}.`,
    placeholder: '200',
    explanation: 'Peak equity minus current equity in competition base currency.',
    isNumeric: true
  },
  MAX_DAILY_LOSS: {
    type: 'MAX_DAILY_LOSS',
    name: 'Maximum Daily Loss',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 100,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Participant is disqualified if cumulative realized losses on any single calendar day exceed ${unit}${limit}.`,
    placeholder: '100',
    explanation: 'Sum of negative realized P&L within a single calendar day (00:00 - 23:59).',
    isNumeric: true
  },
  MAX_WEEKLY_LOSS: {
    type: 'MAX_WEEKLY_LOSS',
    name: 'Maximum Weekly Loss',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 400,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Participant is disqualified if net losses within a rolling 7-day period exceed ${unit}${limit}.`,
    placeholder: '400',
    explanation: 'Net realized losses accumulated over any 7 consecutive days.',
    isNumeric: true
  },
  MAX_RISK_PER_TRADE: {
    type: 'MAX_RISK_PER_TRADE',
    name: 'Maximum Risk Per Trade',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 100,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) =>
      `Individual trade risk amount must not exceed ${unit}${limit}. Trades exceeding this limit will be rejected.`,
    placeholder: '100',
    explanation: 'Initial capital committed at risk per single execution.',
    isNumeric: true
  },
  MAX_TOTAL_RISK: {
    type: 'MAX_TOTAL_RISK',
    name: 'Maximum Total Risk',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 150,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Cumulative open or active risk must not exceed ${unit}${limit}.`,
    placeholder: '150',
    explanation: 'Aggregate concurrent risk exposure across open trades.',
    isNumeric: true
  },
  MAX_TRADES_TOTAL: {
    type: 'MAX_TRADES_TOTAL',
    name: 'Maximum Total Trades',
    category: 'volume',
    defaultUnit: 'Trades',
    defaultLimit: 50,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Traders may log a maximum of ${limit} ${unit} for the duration of the arena.`,
    placeholder: '50',
    explanation: 'Prevents over-trading by capping total submissions in the competition.',
    isNumeric: true
  },
  MAX_TRADES_PER_DAY: {
    type: 'MAX_TRADES_PER_DAY',
    name: 'Maximum Trades Per Day',
    category: 'volume',
    defaultUnit: 'Trades',
    defaultLimit: 5,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Traders cannot exceed ${limit} ${unit} logged in any single 24-hour cycle.`,
    placeholder: '5',
    explanation: 'Restricts revenge trading and rapid-fire churning.',
    isNumeric: true
  },
  MIN_TRADES_TOTAL: {
    type: 'MIN_TRADES_TOTAL',
    name: 'Minimum Trades For Podium',
    category: 'volume',
    defaultUnit: 'Trades',
    defaultLimit: 3,
    comparisonOperator: '<',
    defaultSeverity: 'INFO',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Traders must log at least ${limit} ${unit} to qualify for official podium ranking.`,
    placeholder: '3',
    explanation: 'Enforces sufficient statistical sample size.',
    isNumeric: true
  },
  MAX_POSITION_SIZE: {
    type: 'MAX_POSITION_SIZE',
    name: 'Maximum Position Size',
    category: 'risk',
    defaultUnit: 'Lots',
    defaultLimit: 2,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Position size per execution cannot exceed ${limit} ${unit}.`,
    placeholder: '2',
    explanation: 'Caps allowable contract lots or shares.',
    isNumeric: true
  },
  MAX_LEVERAGE: {
    type: 'MAX_LEVERAGE',
    name: 'Maximum Leverage',
    category: 'risk',
    defaultUnit: 'x',
    defaultLimit: 30,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Account leverage cannot exceed 1:${limit}.`,
    placeholder: '30',
    explanation: 'Maximum leverage factor allowed for any position.',
    isNumeric: true
  },
  ALLOWED_MARKETS: {
    type: 'ALLOWED_MARKETS',
    name: 'Allowed Markets',
    category: 'boundary',
    defaultUnit: 'List',
    defaultLimit: 'EUR/USD, GBP/USD, XAU/USD',
    comparisonOperator: 'IN',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) =>
      `Only trades executed in [${Array.isArray(limit) ? limit.join(', ') : limit}] are permitted.`,
    placeholder: 'EUR/USD, GBP/USD, XAU/USD',
    explanation: 'Permitted trading instruments. Trades in other symbols are rejected.',
    isNumeric: false
  },
  BLOCKED_MARKETS: {
    type: 'BLOCKED_MARKETS',
    name: 'Blocked Markets',
    category: 'boundary',
    defaultUnit: 'List',
    defaultLimit: 'BTC/USD, ETH/USD',
    comparisonOperator: 'NOT_IN',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) =>
      `Trading [${Array.isArray(limit) ? limit.join(', ') : limit}] is strictly prohibited.`,
    placeholder: 'BTC/USD, ETH/USD',
    explanation: 'Blacklisted trading instruments.',
    isNumeric: false
  },
  ALLOWED_SESSIONS: {
    type: 'ALLOWED_SESSIONS',
    name: 'Allowed Sessions',
    category: 'boundary',
    defaultUnit: 'List',
    defaultLimit: 'London, New York',
    comparisonOperator: 'IN',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) =>
      `Trades must take place during permitted sessions: ${Array.isArray(limit) ? limit.join(', ') : limit}.`,
    placeholder: 'London, New York',
    explanation: 'Permitted timing windows.',
    isNumeric: false
  },
  BLOCKED_SESSIONS: {
    type: 'BLOCKED_SESSIONS',
    name: 'Blocked Sessions',
    category: 'boundary',
    defaultUnit: 'List',
    defaultLimit: 'Asian',
    comparisonOperator: 'NOT_IN',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) =>
      `Trading during ${Array.isArray(limit) ? limit.join(', ') : limit} session is prohibited.`,
    placeholder: 'Asian',
    explanation: 'Forbidden market sessions.',
    isNumeric: false
  },
  MAX_LOSS_PER_TRADE: {
    type: 'MAX_LOSS_PER_TRADE',
    name: 'Maximum Loss Per Trade',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 100,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `No single trade may realize a loss greater than ${unit}${limit}.`,
    placeholder: '100',
    explanation: 'Worst single realized loss allowed.',
    isNumeric: true
  },
  MAX_LOSS_STREAK: {
    type: 'MAX_LOSS_STREAK',
    name: 'Maximum Consecutive Losses',
    category: 'discipline',
    defaultUnit: 'Trades',
    defaultLimit: 4,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Traders hitting a streak of ${limit} consecutive losses will receive an intervention lock.`,
    placeholder: '4',
    explanation: 'Limits streak tilt by flagging consecutive losses.',
    isNumeric: true
  },
  TRADING_END_TIME: {
    type: 'TRADING_END_TIME',
    name: 'Trading Cutoff Time',
    category: 'boundary',
    defaultUnit: 'Timestamp',
    defaultLimit: '',
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) =>
      `No trades may be submitted after ${limit}.`,
    placeholder: 'YYYY-MM-DD HH:mm',
    explanation: 'Hard competition trading cutoff deadline.',
    isNumeric: false
  },
  NO_TRADING_AFTER_VIOLATION: {
    type: 'NO_TRADING_AFTER_VIOLATION',
    name: 'Disqualification Trade Lock',
    category: 'discipline',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () =>
      'Immediately lock trading permissions after any disqualifying rule breach.',
    placeholder: '1',
    explanation: 'Fail-closed trading lock upon any disqualifying event.',
    isNumeric: true
  },
  CUSTOM_RULE: {
    type: 'CUSTOM_RULE',
    name: 'Custom Parameter Rule',
    category: 'custom',
    defaultUnit: '$',
    defaultLimit: 100,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) =>
      `Custom rule limit: ${unit}${limit}.`,
    placeholder: '100',
    explanation: 'Creator-defined rule with custom parameters and enforcement.',
    isNumeric: true
  },
  MAX_DAILY_TRADES: {
    type: 'MAX_DAILY_TRADES',
    name: 'Max Trades Per Day',
    category: 'discipline',
    defaultUnit: 'Trades',
    defaultLimit: 10,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `No more than ${limit} trades may be entered per calendar day.`,
    placeholder: '10',
    explanation: 'Daily execution cap to protect against overtrading.',
    isNumeric: true
  },
  PROHIBITED_INSTRUMENTS: {
    type: 'PROHIBITED_INSTRUMENTS',
    name: 'Prohibited Instruments',
    category: 'boundary',
    defaultUnit: 'List',
    defaultLimit: 'CRYPTO, HIGH_VOLATILITY',
    comparisonOperator: 'IN',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `Trading on restricted instruments (${limit}) is strictly barred.`,
    placeholder: 'BTC/USD, ETH/USD',
    explanation: 'Symbols that participants are forbidden from trading.',
    isNumeric: false
  },
  MIN_HOLDING_TIME_SECONDS: {
    type: 'MIN_HOLDING_TIME_SECONDS',
    name: 'Minimum Holding Time',
    category: 'discipline',
    defaultUnit: 'Seconds',
    defaultLimit: 60,
    comparisonOperator: '<',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `Positions held for less than ${limit} seconds will be flagged.`,
    placeholder: '60',
    explanation: 'Prevents ultra-short latency scalping and artificial executions.',
    isNumeric: true
  },
  MAX_OPEN_POSITIONS: {
    type: 'MAX_OPEN_POSITIONS',
    name: 'Max Concurrent Positions',
    category: 'risk',
    defaultUnit: 'Positions',
    defaultLimit: 3,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `Maximum of ${limit} open simultaneous positions permitted.`,
    placeholder: '3',
    explanation: 'Limits concurrent exposure across multiple positions.',
    isNumeric: true
  },
  MANDATORY_STOP_LOSS: {
    type: 'MANDATORY_STOP_LOSS',
    name: 'Mandatory Stop Loss',
    category: 'risk',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () => 'Every position must have a clearly specified protective stop loss.',
    placeholder: '1',
    explanation: 'Enforces hard risk parameters on every single trade.',
    isNumeric: true
  }
};

/**
 * Normalizes input list values (e.g. "EUR/USD, GBP/USD") into trimmed array
 */
export function normalizeListValue(val: number | string | string[]): string[] {
  if (Array.isArray(val)) return val.map((s) => String(s).trim().toUpperCase());
  if (typeof val === 'string') {
    return val
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
  }
  return [String(val).trim().toUpperCase()];
}

/**
 * Calculates competition-scoped equity curve, peak equity, and maximum drawdown
 */
export function computeParticipantEquityMetrics(
  startingBalance: number,
  trades: CompetitionTrade[]
) {
  // Sort trades chronologically by execution time
  const sorted = [...trades].sort((a, b) => {
    const timeA = a.date || a.createdAt || 0;
    const timeB = b.date || b.createdAt || 0;
    return timeA - timeB;
  });

  let currentEquity = startingBalance;
  let peakEquity = startingBalance;
  let maxDrawdown = 0;

  for (const t of sorted) {
    if (t.pnl !== undefined && !isNaN(Number(t.pnl))) {
      currentEquity += Number(t.pnl);
      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }
      const dd = Math.max(0, peakEquity - currentEquity);
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }
  }

  const currentDrawdown = Math.max(0, peakEquity - currentEquity);

  return {
    startingBalance,
    currentEquity: Number(currentEquity.toFixed(2)),
    peakEquity: Number(peakEquity.toFixed(2)),
    currentDrawdown: Number(currentDrawdown.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2))
  };
}

/**
 * Calculates daily loss per calendar day
 */
export function computeDailyLosses(trades: CompetitionTrade[]): Record<string, number> {
  const dailyMap: Record<string, number> = {};
  for (const t of trades) {
    const timestamp = t.date || t.createdAt || Date.now();
    const dateStr = new Date(timestamp).toISOString().split('T')[0];
    const pnl = Number(t.pnl) || 0;
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + pnl;
  }
  return dailyMap;
}

/**
 * Calculates consecutive loss streak
 */
export function computeLossStreak(trades: CompetitionTrade[]): number {
  const sorted = [...trades].sort((a, b) => (b.date || b.createdAt) - (a.date || a.createdAt));
  let streak = 0;
  for (const t of sorted) {
    if (t.result === 'LOSS' || (t.pnl !== undefined && Number(t.pnl) < 0)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export interface RuleEvaluationResult {
  isCompliant: boolean;
  complianceStatus: 'ACTIVE' | 'WARNING' | 'DISQUALIFIED';
  violations: CompetitionViolation[];
  warnings: CompetitionViolation[];
  evaluationLogs: RuleEvaluationLog[];
  utilizations: Record<
    string,
    {
      ruleId: string;
      ruleName: string;
      ruleType: CompetitionRuleType;
      currentValue: number | string;
      limitValue: number | string;
      unit: string;
      percentUsed: number;
      status: 'SAFE' | 'WARNING' | 'VIOLATION';
      description: string;
    }
  >;
  firstDisqualifyingViolation?: CompetitionViolation;
  firstTradeRejectionViolation?: CompetitionViolation;
}

/**
 * Core Rule Engine Evaluation
 * Authoritatively evaluates a participant's trades against all active competition rules.
 */
export function evaluateCompetitionRules(
  arena: Arena,
  userId: string,
  userTrades: CompetitionTrade[],
  candidateTrade?: Partial<CompetitionTrade>
): RuleEvaluationResult {
  const rules = (arena.rules || []).filter((r) => r.isActive !== false);
  const now = Date.now();
  const userName =
    arena.members[userId]?.displayName || candidateTrade?.userDisplayName || 'Trader';
  const userAvatar =
    arena.members[userId]?.photoURL || candidateTrade?.userAvatar || undefined;

  // Combine existing trades with candidate trade if provided
  const allTrades = candidateTrade
    ? [...userTrades.filter((t) => t.id !== candidateTrade.id), candidateTrade as CompetitionTrade]
    : [...userTrades];

  const startingBalance = arena.startingBalance || 10000;
  const equityMetrics = computeParticipantEquityMetrics(startingBalance, allTrades);
  const dailyLossMap = computeDailyLosses(allTrades);
  const lossStreak = computeLossStreak(allTrades);

  const violations: CompetitionViolation[] = [];
  const warnings: CompetitionViolation[] = [];
  const evaluationLogs: RuleEvaluationLog[] = [];
  const utilizations: RuleEvaluationResult['utilizations'] = {};

  let hasDisqualification = false;
  let firstDisqualifyingViolation: CompetitionViolation | undefined;
  let firstTradeRejectionViolation: CompetitionViolation | undefined;

  // Evaluate candidate trade immediate parameters first if candidate exists
  if (candidateTrade) {
    for (const rule of rules) {
      const isInstantDq = rule.enforcement === 'INSTANT_DISQUALIFY';

      if (rule.type === 'BLOCKED_MARKETS') {
        const blockedList = normalizeListValue(rule.limitValue);
        const tradeMarket = candidateTrade.market?.trim().toUpperCase() || '';
        if (tradeMarket && blockedList.includes(tradeMarket)) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: candidateTrade.market || 'Unknown',
            limitValue: Array.isArray(rule.limitValue) ? rule.limitValue.join(', ') : String(rule.limitValue),
            unit: 'Market',
            comparisonOperator: 'NOT_IN',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Traded prohibited symbol "${candidateTrade.market}".`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }

      if (rule.type === 'ALLOWED_MARKETS') {
        const allowedList = normalizeListValue(rule.limitValue);
        const tradeMarket = candidateTrade.market?.trim().toUpperCase() || '';
        if (tradeMarket && allowedList.length > 0 && !allowedList.includes(tradeMarket)) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: candidateTrade.market || 'Unknown',
            limitValue: Array.isArray(rule.limitValue) ? rule.limitValue.join(', ') : String(rule.limitValue),
            unit: 'Market',
            comparisonOperator: 'IN',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Market "${candidateTrade.market}" is outside permitted symbol list.`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }

      if (rule.type === 'ALLOWED_SESSIONS' && candidateTrade.session) {
        const allowedSessions = normalizeListValue(rule.limitValue);
        const tradeSession = candidateTrade.session.trim().toUpperCase();
        if (!allowedSessions.includes(tradeSession)) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: candidateTrade.session,
            limitValue: String(rule.limitValue),
            unit: 'Session',
            comparisonOperator: 'IN',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Session "${candidateTrade.session}" is outside permitted sessions.`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }

      if (rule.type === 'BLOCKED_SESSIONS' && candidateTrade.session) {
        const blockedSessions = normalizeListValue(rule.limitValue);
        const tradeSession = candidateTrade.session.trim().toUpperCase();
        if (blockedSessions.includes(tradeSession)) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: candidateTrade.session,
            limitValue: String(rule.limitValue),
            unit: 'Session',
            comparisonOperator: 'NOT_IN',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Session "${candidateTrade.session}" is prohibited.`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }

      if (rule.type === 'TRADING_END_TIME' && rule.limitValue) {
        const cutoffTime = new Date(String(rule.limitValue)).getTime();
        const tradeTime = candidateTrade.date || candidateTrade.createdAt || now;
        if (!isNaN(cutoffTime) && tradeTime > cutoffTime) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: new Date(tradeTime).toISOString(),
            limitValue: String(rule.limitValue),
            unit: 'Timestamp',
            comparisonOperator: '>',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Trade submitted after competition end cutoff deadline.`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }

      if (rule.type === 'MAX_RISK_PER_TRADE') {
        const limit = Number(rule.limitValue);
        const actual = Number(candidateTrade.riskAmount) || 0;
        if (actual > limit) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: actual,
            limitValue: limit,
            unit: rule.unit || '$',
            comparisonOperator: '>',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Trade risk of ${rule.unit || '$'}${actual} exceeds allowed maximum of ${rule.unit || '$'}${limit}.`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }

      if (rule.type === 'MAX_POSITION_SIZE') {
        const limit = Number(rule.limitValue);
        const actual = Number(candidateTrade.positionSize) || 0;
        if (actual > limit) {
          const violation: CompetitionViolation = {
            id: uuidv4(),
            competitionId: arena.id,
            userId,
            userName,
            userAvatar,
            ruleId: rule.id,
            ruleName: rule.name,
            ruleType: rule.type,
            ruleVersion: rule.version,
            actualValue: actual,
            limitValue: limit,
            unit: rule.unit || 'Lots',
            comparisonOperator: '>',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Position size of ${actual} ${rule.unit || 'Lots'} exceeds maximum limit of ${limit}.`
          };
          if (isInstantDq) {
            hasDisqualification = true;
            if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
            violations.push(violation);
          } else {
            if (!firstTradeRejectionViolation) firstTradeRejectionViolation = violation;
            warnings.push(violation);
          }
        }
      }
    }
  }

  // Evaluate state-wide continuous rules
  for (const rule of rules) {
    let actualValue: number | string = 0;
    let limitValue: number | string = rule.limitValue as any;
    let percentUsed = 0;
    let isViolation = false;
    let isWarning = false;
    const warningThreshold = rule.warningThresholdPercent || 80;

    switch (rule.type) {
      case 'MAX_DRAWDOWN': {
        const limit = Number(rule.limitValue);
        // Compare exact numeric values: Drawdown > limit triggers violation
        actualValue = equityMetrics.maxDrawdown;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'MAX_DAILY_LOSS': {
        const limit = Number(rule.limitValue);
        // Find maximum daily negative loss
        let worstDayLoss = 0;
        Object.values(dailyLossMap).forEach((pnl) => {
          if (pnl < 0) {
            const loss = Math.abs(pnl);
            if (loss > worstDayLoss) worstDayLoss = loss;
          }
        });
        actualValue = worstDayLoss;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'MAX_TRADES_TOTAL': {
        const limit = Number(rule.limitValue);
        actualValue = allTrades.length;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'MAX_TRADES_PER_DAY': {
        const limit = Number(rule.limitValue);
        // Find max trades on any single day
        const dayCountMap: Record<string, number> = {};
        allTrades.forEach((t) => {
          const dateStr = new Date(t.date || t.createdAt || now).toISOString().split('T')[0];
          dayCountMap[dateStr] = (dayCountMap[dateStr] || 0) + 1;
        });
        const maxDayTrades = Math.max(0, ...Object.values(dayCountMap));
        actualValue = maxDayTrades;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'MAX_LOSS_PER_TRADE': {
        const limit = Number(rule.limitValue);
        let worstTradeLoss = 0;
        allTrades.forEach((t) => {
          if (t.pnl !== undefined && Number(t.pnl) < 0) {
            const loss = Math.abs(Number(t.pnl));
            if (loss > worstTradeLoss) worstTradeLoss = loss;
          }
        });
        actualValue = worstTradeLoss;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'MAX_LOSS_STREAK': {
        const limit = Number(rule.limitValue);
        actualValue = lossStreak;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'MAX_RISK_PER_TRADE': {
        const limit = Number(rule.limitValue);
        let highestRisk = 0;
        allTrades.forEach((t) => {
          const r = Number(t.riskAmount) || 0;
          if (r > highestRisk) highestRisk = r;
        });
        actualValue = highestRisk;
        percentUsed = limit > 0 ? Number(((actualValue / limit) * 100).toFixed(1)) : 0;
        if (actualValue > limit) {
          isViolation = true;
        } else if (actualValue >= limit * (warningThreshold / 100)) {
          isWarning = true;
        }
        break;
      }

      case 'CUSTOM_RULE': {
        // Evaluate custom rule if numeric
        if (typeof rule.limitValue === 'number' || !isNaN(Number(rule.limitValue))) {
          const limit = Number(rule.limitValue);
          actualValue = equityMetrics.currentDrawdown; // default to drawdown or general risk metric
          percentUsed = limit > 0 ? Number(((Number(actualValue) / limit) * 100).toFixed(1)) : 0;
          if (Number(actualValue) > limit) {
            isViolation = true;
          } else if (Number(actualValue) >= limit * (warningThreshold / 100)) {
            isWarning = true;
          }
        }
        break;
      }

      default:
        // Market / Session / End-time handled in pre-screening
        break;
    }

    const ruleStatus = isViolation ? 'VIOLATION' : isWarning ? 'WARNING' : 'SAFE';

    utilizations[rule.id] = {
      ruleId: rule.id,
      ruleName: rule.name,
      ruleType: rule.type,
      currentValue: actualValue,
      limitValue: typeof rule.limitValue === 'object' ? JSON.stringify(rule.limitValue) : rule.limitValue,
      unit: rule.unit,
      percentUsed: Math.min(percentUsed, 999),
      status: ruleStatus,
      description: rule.description
    };

    evaluationLogs.push({
      id: uuidv4(),
      timestamp: now,
      userId,
      userName,
      ruleId: rule.id,
      ruleType: rule.type,
      limitValue: typeof rule.limitValue === 'object' ? JSON.stringify(rule.limitValue) : rule.limitValue,
      actualValue,
      result: isViolation ? 'VIOLATION' : isWarning ? 'WARNING' : 'PASS'
    });

    if (isViolation) {
      const violation: CompetitionViolation = {
        id: uuidv4(),
        competitionId: arena.id,
        userId,
        userName,
        userAvatar,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type,
        ruleVersion: rule.version,
        actualValue,
        limitValue: Number(rule.limitValue) || String(rule.limitValue),
        unit: rule.unit,
        comparisonOperator: rule.type === 'MIN_TRADES_TOTAL' ? '<' : '>',
        timestamp: now,
        severity: rule.severity,
        actionTaken: rule.severity === 'DISQUALIFY' ? 'DISQUALIFY' : 'WARNING',
        status: rule.severity === 'DISQUALIFY' ? 'LOCKED' : 'WARNED',
        details: `${rule.name}: Actual ${actualValue} exceeded limit of ${rule.limitValue} ${rule.unit}.`
      };

      if (rule.severity === 'DISQUALIFY') {
        hasDisqualification = true;
        if (!firstDisqualifyingViolation) firstDisqualifyingViolation = violation;
        violations.push(violation);
      } else {
        warnings.push(violation);
      }
    } else if (isWarning) {
      const warnEntry: CompetitionViolation = {
        id: uuidv4(),
        competitionId: arena.id,
        userId,
        userName,
        userAvatar,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleType: rule.type,
        ruleVersion: rule.version,
        actualValue,
        limitValue: Number(rule.limitValue) || String(rule.limitValue),
        unit: rule.unit,
        comparisonOperator: '>=',
        timestamp: now,
        severity: 'WARNING',
        actionTaken: 'WARNING',
        status: 'WARNED',
        details: `Approaching limit for ${rule.name}: ${actualValue} / ${rule.limitValue} ${rule.unit} (${percentUsed}%).`
      };
      warnings.push(warnEntry);
    }
  }

  const complianceStatus = hasDisqualification
    ? 'DISQUALIFIED'
    : warnings.length > 0
    ? 'WARNING'
    : 'ACTIVE';

  return {
    isCompliant: !hasDisqualification && !firstTradeRejectionViolation,
    complianceStatus: hasDisqualification
      ? 'DISQUALIFIED'
      : (firstTradeRejectionViolation || warnings.length > 0)
      ? 'WARNING'
      : 'ACTIVE',
    violations,
    warnings,
    evaluationLogs,
    utilizations,
    firstDisqualifyingViolation,
    firstTradeRejectionViolation
  };
}

/**
 * Generates initial default rules for a newly created competition or arena
 */
export function generateDefaultCompetitionRules(arenaId: string, ownerId: string): CompetitionRule[] {
  const now = Date.now();
  return [
    {
      id: uuidv4(),
      competitionId: arenaId,
      name: 'Maximum Drawdown',
      type: 'MAX_DRAWDOWN',
      limitValue: 200,
      unit: '$',
      description: 'Participant is disqualified if maximum absolute drawdown from peak equity exceeds $200.',
      severity: 'DISQUALIFY',
      enforcement: 'AUTOMATIC',
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      warningThresholdPercent: 80,
      history: []
    },
    {
      id: uuidv4(),
      competitionId: arenaId,
      name: 'Maximum Daily Loss',
      type: 'MAX_DAILY_LOSS',
      limitValue: 100,
      unit: '$',
      description: 'Participant is disqualified if cumulative realized losses on any single calendar day exceed $100.',
      severity: 'DISQUALIFY',
      enforcement: 'AUTOMATIC',
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      warningThresholdPercent: 80,
      history: []
    },
    {
      id: uuidv4(),
      competitionId: arenaId,
      name: 'Maximum Risk Per Trade',
      type: 'MAX_RISK_PER_TRADE',
      limitValue: 100,
      unit: '$',
      description: 'Trade risk amount must not exceed $100 per single execution. Oversized trades are strictly rejected.',
      severity: 'WARNING',
      enforcement: 'STRICT_REJECT',
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      warningThresholdPercent: 80,
      history: []
    },
    {
      id: uuidv4(),
      competitionId: arenaId,
      name: 'Maximum Trades Per Day',
      type: 'MAX_TRADES_PER_DAY',
      limitValue: 10,
      unit: 'Trades',
      description: 'Traders cannot exceed 10 logged trades in any single day to prevent overtrading.',
      severity: 'WARNING',
      enforcement: 'AUTOMATIC',
      isActive: true,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: ownerId,
      warningThresholdPercent: 80,
      history: []
    }
  ];
}

/**
 * Safe test/simulation evaluator for the creator test mode.
 * Runs purely in memory and does NOT write to the database or modify participant state.
 */
export function simulateRuleTest(
  rule: CompetitionRule,
  simulatedValue: number | string
): {
  result: 'PASS' | 'WARNING' | 'VIOLATION';
  percentUsed: number;
  message: string;
  actionText: string;
} {
  const isNumeric = typeof rule.limitValue === 'number' || !isNaN(Number(rule.limitValue));
  if (isNumeric) {
    const numLimit = Number(rule.limitValue);
    const numActual = Number(simulatedValue);

    if (isNaN(numActual)) {
      return {
        result: 'PASS',
        percentUsed: 0,
        message: 'Invalid simulated numeric value',
        actionText: 'None'
      };
    }

    const percentUsed = numLimit > 0 ? Number(((numActual / numLimit) * 100).toFixed(1)) : 0;
    const warningLimit = numLimit * ((rule.warningThresholdPercent || 80) / 100);

    // Exact boundary comparison
    if (numActual > numLimit) {
      return {
        result: 'VIOLATION',
        percentUsed,
        message: `Simulated value ${rule.unit}${numActual} exceeds limit ${rule.unit}${numLimit} (Boundary breached by ${rule.unit}${(numActual - numLimit).toFixed(2)}).`,
        actionText: rule.severity === 'DISQUALIFY' ? 'DISQUALIFY & LOCK PARTICIPANT' : 'LOG WARNING'
      };
    }

    if (numActual >= warningLimit) {
      return {
        result: 'WARNING',
        percentUsed,
        message: `Simulated value ${rule.unit}${numActual} is in warning territory (${percentUsed}% of limit).`,
        actionText: 'EMIT INFORMATIONAL WARNING'
      };
    }

    return {
      result: 'PASS',
      percentUsed,
      message: `Simulated value ${rule.unit}${numActual} is within safe operational limit of ${rule.unit}${numLimit} (${percentUsed}%).`,
      actionText: 'PERMIT TRADE'
    };
  }

  // String / List comparison
  const simulatedStr = String(simulatedValue).trim().toUpperCase();
  const list = normalizeListValue(rule.limitValue);

  if (rule.type === 'BLOCKED_MARKETS' || rule.type === 'BLOCKED_SESSIONS') {
    if (list.includes(simulatedStr)) {
      return {
        result: 'VIOLATION',
        percentUsed: 100,
        message: `"${simulatedValue}" is in the prohibited list [${list.join(', ')}].`,
        actionText: rule.severity === 'DISQUALIFY' ? 'DISQUALIFY & LOCK PARTICIPANT' : 'LOG WARNING'
      };
    }
    return {
      result: 'PASS',
      percentUsed: 0,
      message: `"${simulatedValue}" is not blocked. Permitted.`,
      actionText: 'PERMIT TRADE'
    };
  }

  if (rule.type === 'ALLOWED_MARKETS' || rule.type === 'ALLOWED_SESSIONS') {
    if (!list.includes(simulatedStr)) {
      return {
        result: 'VIOLATION',
        percentUsed: 100,
        message: `"${simulatedValue}" is NOT in the allowed list [${list.join(', ')}].`,
        actionText: rule.severity === 'DISQUALIFY' ? 'DISQUALIFY & LOCK PARTICIPANT' : 'LOG WARNING'
      };
    }
    return {
      result: 'PASS',
      percentUsed: 0,
      message: `"${simulatedValue}" is permitted in allowed list.`,
      actionText: 'PERMIT TRADE'
    };
  }

  return {
    result: 'PASS',
    percentUsed: 0,
    message: 'Condition passed.',
    actionText: 'PERMIT TRADE'
  };
}
