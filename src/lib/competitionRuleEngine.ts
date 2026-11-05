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
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';

export interface RuleTypeDefinition {
  type: CompetitionRuleType;
  name: string;
  category: 'risk' | 'volume' | 'boundary' | 'discipline' | 'news' | 'time' | 'objectives' | 'custom';
  defaultUnit: string;
  defaultLimit: number | string | string[];
  comparisonOperator: '>' | '<' | '>=' | '<=' | 'IN' | 'NOT_IN' | '==';
  defaultSeverity: RuleSeverity;
  defaultEnforcement: RuleEnforcement;
  defaultDescription: (limit: any, unit: string) => string;
  placeholder: string;
  explanation: string;
  isNumeric: boolean;
  // Explicit semantics
  whatIsMeasured: string;
  whenMeasured: string;
  howCalculated: string;
  whenResets: string;
  violationAction: string;
}

export const RULE_TYPE_DEFINITIONS: Record<CompetitionRuleType, RuleTypeDefinition> = {
  // -------------------------------------------------------------
  // 1. RISK & LOSS (Rules 1 - 10)
  // -------------------------------------------------------------
  MAX_TOTAL_LOSS: {
    type: 'MAX_TOTAL_LOSS',
    name: 'Maximum Total Loss',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 1000,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Participant is disqualified if cumulative realized losses exceed ${unit}${limit}.`,
    placeholder: '1000',
    explanation: 'Absolute total loss cap measured against starting balance.',
    isNumeric: true,
    whatIsMeasured: 'Cumulative realized net loss across all competition executions',
    whenMeasured: 'Immediately upon trade closure and during re-sync',
    howCalculated: 'Sum of all negative trade P&Ls including commissions and swap fees',
    whenResets: 'Never (applies for entire competition lifespan)',
    violationAction: 'Disqualify participant and permanently lock new competition trading'
  },
  MAX_DRAWDOWN: {
    type: 'MAX_DRAWDOWN',
    name: 'Maximum Drawdown',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 200,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Participant is disqualified if absolute drawdown from peak equity exceeds ${unit}${limit}.`,
    placeholder: '200',
    explanation: 'Peak equity minus current equity in competition base currency.',
    isNumeric: true,
    whatIsMeasured: 'Peak equity minus current equity / balance',
    whenMeasured: 'Continuous on every execution and sync',
    howCalculated: 'Peak reached balance minus (current balance + closed P&L)',
    whenResets: 'Never (trailing high-water mark)',
    violationAction: 'Disqualify participant and lock trading permissions'
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
    defaultDescription: (limit, unit) => `Participant is disqualified if cumulative realized losses on any single calendar day exceed ${unit}${limit}.`,
    placeholder: '100',
    explanation: 'Sum of negative realized P&L within a single calendar day (00:00 - 23:59).',
    isNumeric: true,
    whatIsMeasured: 'Realized net losses within a single calendar day',
    whenMeasured: 'On every closed trade execution',
    howCalculated: 'Sum of negative P&Ls between 00:00:00 and 23:59:59 UTC/Competition timezone',
    whenResets: 'Daily at 00:00:00 competition timezone',
    violationAction: 'Disqualify participant and lock trading permissions'
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
    defaultDescription: (limit, unit) => `Participant is disqualified if net losses within a rolling 7-day period exceed ${unit}${limit}.`,
    placeholder: '400',
    explanation: 'Net realized losses accumulated over any 7 consecutive days.',
    isNumeric: true,
    whatIsMeasured: 'Net losses within a rolling 7-day period',
    whenMeasured: 'On every closed execution',
    howCalculated: 'Sum of P&Ls over the preceding 7 calendar days',
    whenResets: 'Rolling weekly window',
    violationAction: 'Disqualify participant and lock trading permissions'
  },
  MAX_MONTHLY_LOSS: {
    type: 'MAX_MONTHLY_LOSS',
    name: 'Maximum Monthly Loss',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 800,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Participant is disqualified if net losses within a rolling 30-day period exceed ${unit}${limit}.`,
    placeholder: '800',
    explanation: 'Net realized losses accumulated over any 30 consecutive days.',
    isNumeric: true,
    whatIsMeasured: 'Net losses within a rolling 30-day calendar period',
    whenMeasured: 'On every closed execution',
    howCalculated: 'Sum of P&Ls over the preceding 30 days',
    whenResets: 'Rolling monthly window',
    violationAction: 'Disqualify participant'
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
    defaultDescription: (limit, unit) => `No single trade may realize a loss greater than ${unit}${limit}.`,
    placeholder: '100',
    explanation: 'Worst single realized loss allowed.',
    isNumeric: true,
    whatIsMeasured: 'Realized net loss of any single closed trade',
    whenMeasured: 'At trade close',
    howCalculated: 'Math.abs(trade.pnl) for trades where pnl < 0',
    whenResets: 'Never (per-trade limit)',
    violationAction: 'Disqualify participant'
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
    defaultDescription: (limit, unit) => `Individual trade risk amount must not exceed ${unit}${limit}. Trades exceeding this limit will be rejected.`,
    placeholder: '100',
    explanation: 'Initial capital committed at risk per single execution.',
    isNumeric: true,
    whatIsMeasured: 'Initial planned dollar risk calculated from entry, stop loss, and position size',
    whenMeasured: 'Pre-trade entry validation',
    howCalculated: 'Math.abs(entry - stopLoss) * positionSize * contractSize (or explicit riskAmount)',
    whenResets: 'Per-trade validation',
    violationAction: 'Block and strictly reject oversized trade'
  },
  MAX_TOTAL_RISK: {
    type: 'MAX_TOTAL_RISK',
    name: 'Maximum Total Open Risk',
    category: 'risk',
    defaultUnit: '$',
    defaultLimit: 250,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Cumulative open risk exposure across active positions must not exceed ${unit}${limit}.`,
    placeholder: '250',
    explanation: 'Aggregate concurrent risk exposure across open trades.',
    isNumeric: true,
    whatIsMeasured: 'Sum of dollar risk across all concurrent open positions',
    whenMeasured: 'Before opening any new position',
    howCalculated: 'Sum of individual open position risk amounts',
    whenResets: 'Dynamic (resets as positions close)',
    violationAction: 'Block opening of additional position'
  },
  MAX_POSITION_SIZE: {
    type: 'MAX_POSITION_SIZE',
    name: 'Maximum Position Size',
    category: 'risk',
    defaultUnit: 'Lots',
    defaultLimit: 2,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `Position size per execution cannot exceed ${limit} ${unit}.`,
    placeholder: '2',
    explanation: 'Caps allowable contract lots or shares.',
    isNumeric: true,
    whatIsMeasured: 'Volume / lot size of execution',
    whenMeasured: 'Pre-trade entry validation',
    howCalculated: 'trade.positionSize or trade.volume in standard lots',
    whenResets: 'Per-trade validation',
    violationAction: 'Reject trade execution'
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
    defaultDescription: (limit, unit) => `Account leverage cannot exceed 1:${limit}.`,
    placeholder: '30',
    explanation: 'Maximum leverage factor allowed for any position.',
    isNumeric: true,
    whatIsMeasured: 'Account or trade margin leverage factor',
    whenMeasured: 'On account connection and trade execution',
    howCalculated: 'Notional position value divided by margin collateral',
    whenResets: 'Continuous',
    violationAction: 'Disqualify participant if account exceeds maximum permitted leverage'
  },

  // -------------------------------------------------------------
  // 2. TRADING FREQUENCY (Rules 11 - 17)
  // -------------------------------------------------------------
  MAX_TRADES_PER_DAY: {
    type: 'MAX_TRADES_PER_DAY',
    name: 'Maximum Trades Per Day',
    category: 'volume',
    defaultUnit: 'Trades',
    defaultLimit: 5,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Traders cannot exceed ${limit} ${unit} logged in any single 24-hour cycle.`,
    placeholder: '5',
    explanation: 'Restricts rapid churning and overtrading.',
    isNumeric: true,
    whatIsMeasured: 'Total number of executions opened on a calendar day',
    whenMeasured: 'On every trade submission',
    howCalculated: 'Count of trades where trade date is on current calendar day',
    whenResets: 'Daily at 00:00:00 competition timezone',
    violationAction: 'Block subsequent trade submissions for the remainder of the day'
  },
  MAX_TRADES_PER_WEEK: {
    type: 'MAX_TRADES_PER_WEEK',
    name: 'Maximum Trades Per Week',
    category: 'volume',
    defaultUnit: 'Trades',
    defaultLimit: 25,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Traders cannot exceed ${limit} ${unit} within any 7-day period.`,
    placeholder: '25',
    explanation: 'Weekly volume cap.',
    isNumeric: true,
    whatIsMeasured: 'Total trades logged in rolling 7 days',
    whenMeasured: 'On trade entry',
    howCalculated: 'Count of trades in the last 7 calendar days',
    whenResets: 'Rolling weekly window',
    violationAction: 'Warn and block further entries'
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
    defaultDescription: (limit, unit) => `Traders may log a maximum of ${limit} ${unit} for the duration of the arena.`,
    placeholder: '50',
    explanation: 'Overall competition execution cap.',
    isNumeric: true,
    whatIsMeasured: 'Total cumulative trade count',
    whenMeasured: 'On each trade submission',
    howCalculated: 'Total count of trades in competition',
    whenResets: 'Never (competition lifespan)',
    violationAction: 'Disqualify participant if exceeded'
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
    defaultDescription: (limit, unit) => `Traders hitting a streak of ${limit} consecutive losses will receive an intervention lock.`,
    placeholder: '4',
    explanation: 'Limits streak tilt by flagging consecutive losses.',
    isNumeric: true,
    whatIsMeasured: 'Count of unbroken sequential losing trades',
    whenMeasured: 'Immediately upon trade closure',
    howCalculated: 'Sequential count of trades where pnl < 0 until broken by a winning trade',
    whenResets: 'Upon logging a profitable trade',
    violationAction: 'Trigger mandatory cooldown warning'
  },
  MAX_REENTRIES: {
    type: 'MAX_REENTRIES',
    name: 'Maximum Re-entries',
    category: 'discipline',
    defaultUnit: 'Entries',
    defaultLimit: 2,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `Maximum of ${limit} re-entries allowed on the same market within 60 minutes after a stop out.`,
    placeholder: '2',
    explanation: 'Prevents rapid compulsive re-entering.',
    isNumeric: true,
    whatIsMeasured: 'Re-entries on same symbol within 60 minutes of a loss',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Count of trades on same symbol within 1 hour following a loss',
    whenResets: '60 minutes after prior trade exit',
    violationAction: 'Block re-entry trade'
  },
  MAX_SAME_SYMBOL_TRADES_PER_DAY: {
    type: 'MAX_SAME_SYMBOL_TRADES_PER_DAY',
    name: 'Max Same-Symbol Trades Per Day',
    category: 'volume',
    defaultUnit: 'Trades',
    defaultLimit: 3,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Traders cannot execute more than ${limit} trades on the same instrument on a single day.`,
    placeholder: '3',
    explanation: 'Prevents symbol fixation.',
    isNumeric: true,
    whatIsMeasured: 'Trades entered on a specific symbol within one day',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Count of trades sharing the candidate symbol on current date',
    whenResets: 'Daily at midnight competition timezone',
    violationAction: 'Block additional trades on that symbol'
  },
  MAX_OPEN_POSITIONS: {
    type: 'MAX_OPEN_POSITIONS',
    name: 'Maximum Open Positions',
    category: 'risk',
    defaultUnit: 'Positions',
    defaultLimit: 3,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `Maximum of ${limit} open simultaneous positions permitted.`,
    placeholder: '3',
    explanation: 'Limits concurrent exposure across multiple positions.',
    isNumeric: true,
    whatIsMeasured: 'Number of active simultaneous open positions',
    whenMeasured: 'Before entering any new trade',
    howCalculated: 'Count of open positions reported by broker/connector',
    whenResets: 'Dynamic as positions close',
    violationAction: 'Disqualify participant if exceeded'
  },

  // -------------------------------------------------------------
  // 3. TRADING BEHAVIOR (Rules 18 - 24)
  // -------------------------------------------------------------
  NO_OVERTRADING: {
    type: 'NO_OVERTRADING',
    name: 'No Overtrading (Objective)',
    category: 'discipline',
    defaultUnit: 'Trades/hr',
    defaultLimit: 3,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `No more than ${limit} executions allowed within any rolling 60-minute window.`,
    placeholder: '3',
    explanation: 'Deterministic overtrading prevention.',
    isNumeric: true,
    whatIsMeasured: 'Execution frequency within a rolling 60-minute window',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Count of executions opened in the past 60 minutes',
    whenResets: 'Rolling 60 minutes',
    violationAction: 'Block trade submission'
  },
  NO_REVENGE_TRADING: {
    type: 'NO_REVENGE_TRADING',
    name: 'No Revenge Trading (Objective)',
    category: 'discipline',
    defaultUnit: 'Minutes',
    defaultLimit: 15,
    comparisonOperator: '<',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `Mandatory ${limit} ${unit} cooldown required after any losing trade on the same symbol.`,
    placeholder: '15',
    explanation: 'Enforces objective time buffer after a loss.',
    isNumeric: true,
    whatIsMeasured: 'Elapsed time between a losing trade close and next entry on same symbol',
    whenMeasured: 'Pre-trade submission',
    howCalculated: '(candidateTrade.date - priorLosingTrade.exitTime) in minutes',
    whenResets: 'After cooldown period elapses',
    violationAction: 'Block trade until cooldown window completes'
  },
  NO_EXCESSIVE_REENTRY: {
    type: 'NO_EXCESSIVE_REENTRY',
    name: 'No Excessive Re-entry',
    category: 'discipline',
    defaultUnit: 'Minutes',
    defaultLimit: 5,
    comparisonOperator: '<',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `No new trade allowed on same market within ${limit} ${unit} of closing prior trade.`,
    placeholder: '5',
    explanation: 'Prevents immediate churn re-entry.',
    isNumeric: true,
    whatIsMeasured: 'Interval between trade close and subsequent entry on same symbol',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Time difference between close and open',
    whenResets: 'After threshold minutes elapse',
    violationAction: 'Block trade'
  },
  NO_RISK_ESCALATION: {
    type: 'NO_RISK_ESCALATION',
    name: 'No Risk Escalation After Loss',
    category: 'discipline',
    defaultUnit: '%',
    defaultLimit: 0,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: () => 'Traders cannot increase risk amount on the next trade immediately following a losing trade.',
    placeholder: '0',
    explanation: 'Blocks Martingale-style risk escalation.',
    isNumeric: true,
    whatIsMeasured: 'Risk comparison between trade following a loss and the prior trade',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'candidateTrade.riskAmount > previousLosingTrade.riskAmount',
    whenResets: 'Upon next profitable trade',
    violationAction: 'Block trade and require risk reduction'
  },
  NO_LOT_SIZE_ESCALATION: {
    type: 'NO_LOT_SIZE_ESCALATION',
    name: 'No Lot-Size Escalation After Loss',
    category: 'discipline',
    defaultUnit: 'Lots',
    defaultLimit: 0,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: () => 'Position size cannot exceed the prior losing trade position size.',
    placeholder: '0',
    explanation: 'Blocks volume escalation after taking a loss.',
    isNumeric: true,
    whatIsMeasured: 'Lot size comparison after loss',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'candidateTrade.positionSize > previousTrade.positionSize',
    whenResets: 'Upon winning trade',
    violationAction: 'Block oversized trade'
  },
  NO_TRADING_AFTER_DAILY_LIMIT: {
    type: 'NO_TRADING_AFTER_DAILY_LIMIT',
    name: 'No Trading After Daily Limit',
    category: 'discipline',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () => 'Trading is completely prohibited for the remainder of the day once daily loss limit is touched.',
    placeholder: '1',
    explanation: 'Hard lockout after hitting daily loss threshold.',
    isNumeric: true,
    whatIsMeasured: 'Whether daily loss threshold was hit earlier today',
    whenMeasured: 'On all subsequent trade attempts today',
    howCalculated: 'Current daily loss >= daily loss threshold',
    whenResets: 'Midnight competition timezone',
    violationAction: 'Disqualify participant if trade executed'
  },
  NO_TRADING_AFTER_VIOLATION: {
    type: 'NO_TRADING_AFTER_VIOLATION',
    name: 'No Trading After Disqualification',
    category: 'discipline',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () => 'Immediately and permanently lock trading permissions after any disqualifying rule breach.',
    placeholder: '1',
    explanation: 'Permanent lockdown on disqualification.',
    isNumeric: true,
    whatIsMeasured: 'Participant disqualification status',
    whenMeasured: 'On any trade submission or sync',
    howCalculated: 'member.isDisqualified === true',
    whenResets: 'Never (permanent unless creator overrides)',
    violationAction: 'Hard reject any trade submission'
  },

  // -------------------------------------------------------------
  // 4. NEWS TRADING (Rules 25 - 30)
  // -------------------------------------------------------------
  NEWS_TRADING_ALLOWED: {
    type: 'NEWS_TRADING_ALLOWED',
    name: 'News Trading Allowed',
    category: 'news',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'INFO',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () => 'Trading through major economic calendar releases is fully permitted.',
    placeholder: '1',
    explanation: 'Explicit permission to trade during news events.',
    isNumeric: true,
    whatIsMeasured: 'Permission flag',
    whenMeasured: 'Always',
    howCalculated: 'Flag check',
    whenResets: 'Never',
    violationAction: 'None (Informational)'
  },
  NO_NEWS_TRADING: {
    type: 'NO_NEWS_TRADING',
    name: 'News Trading Not Allowed',
    category: 'news',
    defaultUnit: 'Minutes',
    defaultLimit: 5,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `No trades may be opened within ${limit} ${unit} before or after high-impact economic news.`,
    placeholder: '5',
    explanation: 'Universal news restriction window.',
    isNumeric: true,
    whatIsMeasured: 'Time proximity between trade execution and scheduled high-impact calendar event',
    whenMeasured: 'At trade execution time',
    howCalculated: 'Math.abs(tradeTimestamp - eventTimestamp) in minutes',
    whenResets: 'After news window expires',
    violationAction: 'Disqualify participant if hard rule, or reject trade'
  },
  RESTRICTED_NEWS_WINDOW: {
    type: 'RESTRICTED_NEWS_WINDOW',
    name: 'Restricted News Window',
    category: 'news',
    defaultUnit: 'Minutes',
    defaultLimit: 5,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `Restricted news window: ${limit} minutes before and ${limit} minutes after high-impact news.`,
    placeholder: '5',
    explanation: 'Configurable time buffer surrounding high-impact releases.',
    isNumeric: true,
    whatIsMeasured: 'Proximity to high-impact economic release',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Compare trade execution time with economic calendar events',
    whenResets: 'Once window expires',
    violationAction: 'Block trade execution'
  },
  RESTRICTED_INSTRUMENTS_DURING_NEWS: {
    type: 'RESTRICTED_INSTRUMENTS_DURING_NEWS',
    name: 'Restricted Instruments During News',
    category: 'news',
    defaultUnit: 'Minutes',
    defaultLimit: 5,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Restricts instruments sharing the currency of high-impact news within ${limit} ${unit} (e.g. USD news restricts USD pairs).`,
    placeholder: '5',
    explanation: 'Currency-specific news restriction.',
    isNumeric: true,
    whatIsMeasured: 'Currency match between news event and trade symbol during active window',
    whenMeasured: 'Trade execution time',
    howCalculated: 'Check if symbol contains the currency of an event within +/- window minutes',
    whenResets: 'Window expiration',
    violationAction: 'Disqualify participant or reject trade'
  },
  MIN_TIME_BEFORE_NEWS: {
    type: 'MIN_TIME_BEFORE_NEWS',
    name: 'Minimum Time Before News',
    category: 'news',
    defaultUnit: 'Minutes',
    defaultLimit: 10,
    comparisonOperator: '<',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `Positions cannot be opened within ${limit} ${unit} prior to high-impact economic releases.`,
    placeholder: '10',
    explanation: 'Pre-event restriction buffer.',
    isNumeric: true,
    whatIsMeasured: 'Minutes prior to news release',
    whenMeasured: 'Pre-trade submission',
    howCalculated: '(eventTimestamp - tradeTimestamp) in minutes',
    whenResets: 'Post-event',
    violationAction: 'Block trade entry'
  },
  MIN_TIME_AFTER_NEWS: {
    type: 'MIN_TIME_AFTER_NEWS',
    name: 'Minimum Time After News',
    category: 'news',
    defaultUnit: 'Minutes',
    defaultLimit: 10,
    comparisonOperator: '<',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit, unit) => `Positions cannot be opened until at least ${limit} ${unit} after high-impact economic releases.`,
    placeholder: '10',
    explanation: 'Post-event volatility buffer.',
    isNumeric: true,
    whatIsMeasured: 'Minutes elapsed since news release',
    whenMeasured: 'Pre-trade submission',
    howCalculated: '(tradeTimestamp - eventTimestamp) in minutes',
    whenResets: 'After threshold minutes elapse',
    violationAction: 'Block trade entry'
  },

  // -------------------------------------------------------------
  // 5. TIME CONSTRAINTS (Rules 31 - 37)
  // -------------------------------------------------------------
  ALLOWED_TRADING_HOURS: {
    type: 'ALLOWED_TRADING_HOURS',
    name: 'Allowed Trading Hours',
    category: 'time',
    defaultUnit: 'Hours',
    defaultLimit: '08:00 - 17:00 UTC',
    comparisonOperator: 'IN',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit) => `Trades may only be entered during allowed hours: ${limit}.`,
    placeholder: '08:00 - 17:00 UTC',
    explanation: 'Allowed execution hour window.',
    isNumeric: false,
    whatIsMeasured: 'Time of day of trade entry',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Compare execution UTC hour with allowed range',
    whenResets: 'Daily',
    violationAction: 'Block trade execution outside hours'
  },
  BLOCKED_TRADING_HOURS: {
    type: 'BLOCKED_TRADING_HOURS',
    name: 'Blocked Trading Hours',
    category: 'time',
    defaultUnit: 'Hours',
    defaultLimit: '21:00 - 06:00 UTC',
    comparisonOperator: 'NOT_IN',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'STRICT_REJECT',
    defaultDescription: (limit) => `Trading is prohibited during blocked hours: ${limit}.`,
    placeholder: '21:00 - 06:00 UTC',
    explanation: 'Restricted hours buffer.',
    isNumeric: false,
    whatIsMeasured: 'Time of day of trade entry',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Compare execution UTC hour with blocked range',
    whenResets: 'Daily',
    violationAction: 'Block trade execution'
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
    defaultDescription: (limit) => `Trades must take place during permitted sessions: ${Array.isArray(limit) ? limit.join(', ') : limit}.`,
    placeholder: 'London, New York',
    explanation: 'Permitted market session windows.',
    isNumeric: false,
    whatIsMeasured: 'Market session calculated from trade timestamp',
    whenMeasured: 'Pre-trade entry and on sync',
    howCalculated: 'Derive session from canonical UTC timestamp',
    whenResets: 'Continuous per session transition',
    violationAction: 'Reject trade or disqualify participant'
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
    defaultDescription: (limit) => `Trading during ${Array.isArray(limit) ? limit.join(', ') : limit} session is prohibited.`,
    placeholder: 'Asian',
    explanation: 'Forbidden market sessions.',
    isNumeric: false,
    whatIsMeasured: 'Market session calculated from trade timestamp',
    whenMeasured: 'Pre-trade entry and on sync',
    howCalculated: 'Derive session from canonical UTC timestamp',
    whenResets: 'Continuous per session transition',
    violationAction: 'Reject trade execution'
  },
  NO_WEEKEND_TRADING: {
    type: 'NO_WEEKEND_TRADING',
    name: 'Weekend Trading Restricted',
    category: 'time',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () => 'Holding positions over the weekend (Friday 21:00 UTC to Sunday 21:00 UTC) is prohibited.',
    placeholder: '1',
    explanation: 'Restricts weekend gap risk exposure.',
    isNumeric: true,
    whatIsMeasured: 'Whether position is open over the weekend',
    whenMeasured: 'Friday 21:00 UTC through Sunday 21:00 UTC',
    howCalculated: 'Timestamp falls on Saturday or Sunday UTC',
    whenResets: 'Weekly on market reopen',
    violationAction: 'Disqualify participant if holding position across weekend'
  },
  NO_OVERNIGHT_TRADING: {
    type: 'NO_OVERNIGHT_TRADING',
    name: 'Overnight Trading Restricted',
    category: 'time',
    defaultUnit: 'Flag',
    defaultLimit: 1,
    comparisonOperator: '==',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: () => 'All positions must be closed before the daily rollover (21:00 UTC).',
    placeholder: '1',
    explanation: 'Restricts holding positions past daily rollover.',
    isNumeric: true,
    whatIsMeasured: 'Position open across daily rollover',
    whenMeasured: 'At daily rollover (21:00 UTC)',
    howCalculated: 'Position open time and close time cross daily rollover hour',
    whenResets: 'Daily',
    violationAction: 'Warn and flag violation'
  },
  MAX_TRADE_DURATION: {
    type: 'MAX_TRADE_DURATION',
    name: 'Maximum Trade Duration',
    category: 'time',
    defaultUnit: 'Hours',
    defaultLimit: 24,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `No position may be held for longer than ${limit} ${unit}.`,
    placeholder: '24',
    explanation: 'Maximum holding time cap.',
    isNumeric: true,
    whatIsMeasured: 'Trade holding duration',
    whenMeasured: 'Upon trade closure',
    howCalculated: '(closeTime - openTime) in hours',
    whenResets: 'Per trade',
    violationAction: 'Flag violation'
  },

  // -------------------------------------------------------------
  // 6. MARKETS (Rules 38 - 40)
  // -------------------------------------------------------------
  ALLOWED_MARKETS: {
    type: 'ALLOWED_MARKETS',
    name: 'Allowed Markets',
    category: 'boundary',
    defaultUnit: 'List',
    defaultLimit: 'EUR/USD, GBP/USD, XAU/USD',
    comparisonOperator: 'IN',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `Only trades executed in [${Array.isArray(limit) ? limit.join(', ') : limit}] are permitted.`,
    placeholder: 'EUR/USD, GBP/USD, XAU/USD',
    explanation: 'Permitted trading instruments. Trades in other symbols are rejected.',
    isNumeric: false,
    whatIsMeasured: 'Symbol of trade execution',
    whenMeasured: 'Pre-trade entry and on sync',
    howCalculated: 'Match symbol against permitted whitelist',
    whenResets: 'Never (applies throughout competition)',
    violationAction: 'Disqualify participant if traded prohibited symbol'
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
    defaultDescription: (limit) => `Trading [${Array.isArray(limit) ? limit.join(', ') : limit}] is strictly prohibited.`,
    placeholder: 'BTC/USD, ETH/USD',
    explanation: 'Blacklisted trading instruments.',
    isNumeric: false,
    whatIsMeasured: 'Symbol of trade execution',
    whenMeasured: 'Pre-trade entry and on sync',
    howCalculated: 'Match symbol against blacklist',
    whenResets: 'Never',
    violationAction: 'Disqualify participant'
  },
  MAX_CORRELATED_EXPOSURE: {
    type: 'MAX_CORRELATED_EXPOSURE',
    name: 'Maximum Correlated Exposure',
    category: 'boundary',
    defaultUnit: 'Positions',
    defaultLimit: 2,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit) => `Maximum of ${limit} simultaneous open positions sharing the same base or quote currency.`,
    placeholder: '2',
    explanation: 'Prevents stacking correlated risk across the same currency.',
    isNumeric: true,
    whatIsMeasured: 'Concurrent positions sharing common currency',
    whenMeasured: 'Pre-trade submission',
    howCalculated: 'Count open positions containing the currency pair',
    whenResets: 'Dynamic as positions close',
    violationAction: 'Reject additional correlated position'
  },

  // -------------------------------------------------------------
  // 7. ACCOUNT OBJECTIVES (Rules 41 - 45)
  // -------------------------------------------------------------
  PROFIT_TARGET: {
    type: 'PROFIT_TARGET',
    name: 'Profit Target',
    category: 'objectives',
    defaultUnit: '$',
    defaultLimit: 1000,
    comparisonOperator: '>=',
    defaultSeverity: 'INFO',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Target profit milestone: ${unit}${limit}.`,
    placeholder: '1000',
    explanation: 'Evaluation milestone profit target.',
    isNumeric: true,
    whatIsMeasured: 'Cumulative realized net profit',
    whenMeasured: 'Continuous',
    howCalculated: 'Net P&L >= profit target',
    whenResets: 'Upon completion',
    violationAction: 'Mark objective achieved'
  },
  MIN_TRADING_DAYS: {
    type: 'MIN_TRADING_DAYS',
    name: 'Minimum Trading Days',
    category: 'objectives',
    defaultUnit: 'Days',
    defaultLimit: 5,
    comparisonOperator: '<',
    defaultSeverity: 'INFO',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Participant must execute trades on at least ${limit} distinct calendar days.`,
    placeholder: '5',
    explanation: 'Requires minimum participation span.',
    isNumeric: true,
    whatIsMeasured: 'Distinct calendar days on which at least one trade was closed',
    whenMeasured: 'At competition conclusion',
    howCalculated: 'Count of unique dates in trade list',
    whenResets: 'Never',
    violationAction: 'Disqualify from podium if minimum days not met'
  },
  MAX_TRADING_DAYS: {
    type: 'MAX_TRADING_DAYS',
    name: 'Maximum Trading Days',
    category: 'objectives',
    defaultUnit: 'Days',
    defaultLimit: 30,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Trading must be concluded within ${limit} calendar days.`,
    placeholder: '30',
    explanation: 'Timeframe limit to achieve objectives.',
    isNumeric: true,
    whatIsMeasured: 'Calendar days elapsed since first trade',
    whenMeasured: 'Continuous',
    howCalculated: '(Date.now() - firstTradeDate) in days',
    whenResets: 'Never',
    violationAction: 'Expire evaluation'
  },
  CONSISTENCY_RULE: {
    type: 'CONSISTENCY_RULE',
    name: 'Consistency Rule (Best-Day % Limit)',
    category: 'objectives',
    defaultUnit: '%',
    defaultLimit: 40,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Profit earned on any single best day cannot exceed ${limit}${unit} of total net profits.`,
    placeholder: '40',
    explanation: 'Prevents one-hit-wonder lucky trades from dominating results.',
    isNumeric: true,
    whatIsMeasured: 'Percentage of total net profit generated on the highest-profit day',
    whenMeasured: 'Continuous on every closed trade',
    howCalculated: '(bestDayProfit / totalNetProfit) * 100',
    whenResets: 'Continuous',
    violationAction: 'Flag consistency warning; require additional profits to balance ratio'
  },
  BEST_DAY_PROFIT_LIMIT: {
    type: 'BEST_DAY_PROFIT_LIMIT',
    name: 'Best-Day Profit Limit',
    category: 'objectives',
    defaultUnit: '$',
    defaultLimit: 500,
    comparisonOperator: '>',
    defaultSeverity: 'WARNING',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `No single calendar day may account for more than ${unit}${limit} in profit.`,
    placeholder: '500',
    explanation: 'Caps single-day profit windfalls.',
    isNumeric: true,
    whatIsMeasured: 'Total profit earned on single calendar day',
    whenMeasured: 'At day end',
    howCalculated: 'Sum of profitable trade P&Ls on that date',
    whenResets: 'Daily',
    violationAction: 'Warn and cap ranking bonus'
  },

  // -------------------------------------------------------------
  // 8. CUSTOM (Rule 46)
  // -------------------------------------------------------------
  CUSTOM_RULE: {
    type: 'CUSTOM_RULE',
    name: 'Custom Rule',
    category: 'custom',
    defaultUnit: '$',
    defaultLimit: 100,
    comparisonOperator: '>',
    defaultSeverity: 'DISQUALIFY',
    defaultEnforcement: 'AUTOMATIC',
    defaultDescription: (limit, unit) => `Custom rule limit: ${unit}${limit}.`,
    placeholder: '100',
    explanation: 'Creator-defined rule with custom parameters and enforcement.',
    isNumeric: true,
    whatIsMeasured: 'Creator-specified metric',
    whenMeasured: 'On trade execution',
    howCalculated: 'Evaluated against custom numeric limit',
    whenResets: 'Configured by creator',
    violationAction: 'Configured action'
  },

  // -------------------------------------------------------------
  // Legacy Aliases for backwards compatibility
  // -------------------------------------------------------------
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
    isNumeric: true,
    whatIsMeasured: 'Daily trade count',
    whenMeasured: 'Daily',
    howCalculated: 'Count of trades today',
    whenResets: 'Daily',
    violationAction: 'Warn'
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
    defaultDescription: (limit, unit) => `Traders must log at least ${limit} ${unit} to qualify for official podium ranking.`,
    placeholder: '3',
    explanation: 'Enforces sufficient statistical sample size.',
    isNumeric: true,
    whatIsMeasured: 'Total trade count',
    whenMeasured: 'End of arena',
    howCalculated: 'Total trades logged',
    whenResets: 'Never',
    violationAction: 'Ineligible for podium ranking'
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
    isNumeric: false,
    whatIsMeasured: 'Traded symbol',
    whenMeasured: 'On trade entry',
    howCalculated: 'Match against prohibited list',
    whenResets: 'Never',
    violationAction: 'Disqualify'
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
    isNumeric: true,
    whatIsMeasured: 'Trade duration in seconds',
    whenMeasured: 'On trade close',
    howCalculated: 'closeTime - openTime in seconds',
    whenResets: 'Per trade',
    violationAction: 'Flag warning'
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
    isNumeric: true,
    whatIsMeasured: 'Presence of valid stopLoss price on trade',
    whenMeasured: 'On trade entry',
    howCalculated: 'stopLoss > 0',
    whenResets: 'Per trade',
    violationAction: 'Disqualify participant if trade opened without stop loss'
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
    defaultDescription: (limit) => `No trades may be submitted after ${limit}.`,
    placeholder: 'YYYY-MM-DD HH:mm',
    explanation: 'Hard competition trading cutoff deadline.',
    isNumeric: false,
    whatIsMeasured: 'Submission time against cutoff deadline',
    whenMeasured: 'On trade submission',
    howCalculated: 'tradeTime > cutoffTimestamp',
    whenResets: 'Never',
    violationAction: 'Reject trade and disqualify'
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
  const sorted = [...trades].sort((a, b) => {
    const timeA = a.date || a.createdAt || 0;
    const timeB = b.date || b.createdAt || 0;
    return timeA - timeB;
  });

  let currentEquity = startingBalance;
  let peakEquity = startingBalance;
  let maxDrawdown = 0;
  let totalNetProfit = 0;
  let totalRealizedLoss = 0;

  for (const t of sorted) {
    if (t.pnl !== undefined && !isNaN(Number(t.pnl))) {
      const p = Number(t.pnl);
      currentEquity += p;
      if (p > 0) totalNetProfit += p;
      if (p < 0) totalRealizedLoss += Math.abs(p);

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
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    totalNetProfit: Number(totalNetProfit.toFixed(2)),
    totalRealizedLoss: Number(totalRealizedLoss.toFixed(2))
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
  const sorted = [...trades].sort((a, b) => (b.date || b.createdAt || 0) - (a.date || a.createdAt || 0));
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
      semantics: {
        whatIsMeasured: string;
        howCalculated: string;
        whenResets: string;
        violationAction: string;
      };
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

  // 1. Candidate Trade Immediate Parameter Checks
  if (candidateTrade) {
    const tradeTime = candidateTrade.date || candidateTrade.createdAt || now;
    const tradeMarket = candidateTrade.market?.trim().toUpperCase() || '';
    const tradeRisk = Number(candidateTrade.riskAmount) || 0;
    const tradeLotSize = Number(candidateTrade.positionSize) || 0;

    for (const rule of rules) {
      const isInstantDq = rule.severity === 'DISQUALIFY' || rule.enforcement === 'INSTANT_DISQUALIFY';

      // 1. Market Whitelist / Blacklist
      if (rule.type === 'BLOCKED_MARKETS') {
        const blockedList = normalizeListValue(rule.limitValue);
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

      // 2. Risk per trade
      if (rule.type === 'MAX_RISK_PER_TRADE') {
        const limit = Number(rule.limitValue);
        if (limit > 0 && tradeRisk > limit) {
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
            actualValue: tradeRisk,
            limitValue: limit,
            unit: rule.unit || '$',
            comparisonOperator: '>',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Trade risk of ${rule.unit || '$'}${tradeRisk} exceeds maximum allowed risk of ${rule.unit || '$'}${limit}.`
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

      // 3. Position Size
      if (rule.type === 'MAX_POSITION_SIZE') {
        const limit = Number(rule.limitValue);
        if (limit > 0 && tradeLotSize > limit) {
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
            actualValue: tradeLotSize,
            limitValue: limit,
            unit: rule.unit || 'Lots',
            comparisonOperator: '>',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Position size of ${tradeLotSize} ${rule.unit || 'Lots'} exceeds maximum limit of ${limit}.`
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

      // 4. News Trading Restrictions (Deterministic using NEWS_EVENTS economic calendar)
      if (rule.type === 'NO_NEWS_TRADING' || rule.type === 'RESTRICTED_NEWS_WINDOW' || rule.type === 'RESTRICTED_INSTRUMENTS_DURING_NEWS') {
        const windowMinutes = Number(rule.limitValue) || 5;
        const matchingNews = NEWS_EVENTS.find(event => {
          const eventTime = new Date(event.dateTime).getTime();
          const diffMinutes = Math.abs(tradeTime - eventTime) / (60 * 1000);
          if (diffMinutes > windowMinutes) return false;

          // If currency-matched:
          if (rule.type === 'RESTRICTED_INSTRUMENTS_DURING_NEWS' && event.currency && tradeMarket) {
            return tradeMarket.includes(event.currency.toUpperCase());
          }
          return event.impact === 'HIGH';
        });

        if (matchingNews) {
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
            actualValue: `${matchingNews.name} (${matchingNews.currency})`,
            limitValue: `±${windowMinutes}m window`,
            unit: 'News',
            comparisonOperator: 'NOT_IN',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: `Trade entered within restricted news window of ${matchingNews.name} (${matchingNews.currency}) release.`
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

      // 5. Revenge Trading Check (Objective: Cooldown or no risk escalation after a loss)
      if (rule.type === 'NO_REVENGE_TRADING') {
        const cooldownMinutes = Number(rule.limitValue) || 15;
        // Find most recent closed trade
        const priorTrades = userTrades.filter(t => t.id !== candidateTrade.id);
        const lastTrade = priorTrades.sort((a, b) => (b.date || b.createdAt || 0) - (a.date || a.createdAt || 0))[0];

        if (lastTrade && (lastTrade.result === 'LOSS' || (lastTrade.pnl !== undefined && Number(lastTrade.pnl) < 0))) {
          const lastTradeCloseTime = lastTrade.exit ? (lastTrade.date + (lastTrade.durationSeconds ? lastTrade.durationSeconds * 1000 : 0)) : (lastTrade.date || 0);
          const elapsedMinutes = (tradeTime - lastTradeCloseTime) / (60 * 1000);

          if (elapsedMinutes >= 0 && elapsedMinutes < cooldownMinutes && lastTrade.market === candidateTrade.market) {
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
              actualValue: `${Math.round(elapsedMinutes)}m elapsed`,
              limitValue: `${cooldownMinutes}m cooldown`,
              unit: 'Minutes',
              comparisonOperator: '>=',
              timestamp: now,
              severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
              actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
              status: isInstantDq ? 'LOCKED' : 'WARNED',
              details: `Objective cooldown active: Re-entering "${candidateTrade.market}" within ${cooldownMinutes} minutes of taking a loss is prohibited.`
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

      // 6. Weekend Trading Check
      if (rule.type === 'NO_WEEKEND_TRADING') {
        const d = new Date(tradeTime);
        const day = d.getUTCDay(); // 0 is Sunday, 6 is Saturday
        const hour = d.getUTCHours();
        // Friday after 21:00 UTC (day 5, hour >= 21) or Saturday (day 6) or Sunday before 21:00 UTC (day 0, hour < 21)
        const isWeekend = (day === 5 && hour >= 21) || (day === 6) || (day === 0 && hour < 21);
        if (isWeekend) {
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
            actualValue: 'Weekend Execution',
            limitValue: 'Trading Prohibited Friday 21:00 - Sunday 21:00 UTC',
            unit: 'Time',
            comparisonOperator: '==',
            timestamp: now,
            severity: isInstantDq ? 'DISQUALIFY' : 'WARNING',
            actionTaken: isInstantDq ? 'DISQUALIFY' : 'TRADE_REJECTED',
            status: isInstantDq ? 'LOCKED' : 'WARNED',
            details: 'Opening positions over the weekend is prohibited.'
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

  // 2. Evaluate Continuous Portfolio & Discipline Rules
  for (const rule of rules) {
    let actualValue: number | string = 0;
    let limitValue: number | string = rule.limitValue as any;
    let percentUsed = 0;
    let isViolation = false;
    let isWarning = false;
    const warningThreshold = rule.warningThresholdPercent || 80;
    const def = RULE_TYPE_DEFINITIONS[rule.type] || RULE_TYPE_DEFINITIONS.CUSTOM_RULE;

    switch (rule.type) {
      case 'MAX_DRAWDOWN': {
        const limit = Number(rule.limitValue);
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

      case 'MAX_TOTAL_LOSS': {
        const limit = Number(rule.limitValue);
        actualValue = equityMetrics.totalRealizedLoss;
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

      case 'MAX_TRADES_PER_DAY':
      case 'MAX_DAILY_TRADES': {
        const limit = Number(rule.limitValue);
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

      case 'CONSISTENCY_RULE': {
        const limit = Number(rule.limitValue) || 40; // Max % of profit from best day
        // Find highest day profit
        const dayProfitMap: Record<string, number> = {};
        allTrades.forEach((t) => {
          const dateStr = new Date(t.date || t.createdAt || now).toISOString().split('T')[0];
          const p = Number(t.pnl) || 0;
          if (p > 0) dayProfitMap[dateStr] = (dayProfitMap[dateStr] || 0) + p;
        });
        const bestDayProfit = Math.max(0, ...Object.values(dayProfitMap));
        const totalProfit = equityMetrics.totalNetProfit;
        const consistencyRatio = totalProfit > 0 ? Number(((bestDayProfit / totalProfit) * 100).toFixed(1)) : 0;
        actualValue = consistencyRatio;
        percentUsed = limit > 0 ? Number(((consistencyRatio / limit) * 100).toFixed(1)) : 0;
        if (totalProfit > 100 && consistencyRatio > limit) {
          isWarning = true; // Consistency is an informational warning requiring profit smoothing
        }
        break;
      }

      default:
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
      description: rule.description,
      semantics: {
        whatIsMeasured: def.whatIsMeasured,
        howCalculated: def.howCalculated,
        whenResets: def.whenResets,
        violationAction: def.violationAction
      }
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
        comparisonOperator: '>',
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
    complianceStatus,
    violations,
    warnings,
    evaluationLogs,
    utilizations,
    firstDisqualifyingViolation,
    firstTradeRejectionViolation
  };
}

/**
 * -------------------------------------------------------------
 * RULES LIBRARY TEMPLATES (Part 36)
 * -------------------------------------------------------------
 */
export interface CompetitionRulesTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  rules: Omit<CompetitionRule, 'id' | 'competitionId' | 'createdAt' | 'updatedAt' | 'version' | 'history' | 'createdBy'>[];
}

export const COMPETITION_RULES_TEMPLATES: CompetitionRulesTemplate[] = [
  {
    id: 'conservative',
    name: 'Conservative Competition',
    description: 'Tightly controlled risk parameters designed for disciplined capital preservation.',
    badge: 'Low Risk',
    rules: [
      {
        name: 'Maximum Drawdown',
        type: 'MAX_DRAWDOWN',
        limitValue: 150,
        unit: '$',
        description: 'Trailing drawdown cannot exceed $150 from peak balance.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Daily Loss',
        type: 'MAX_DAILY_LOSS',
        limitValue: 75,
        unit: '$',
        description: 'Daily loss limit capped at $75.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Risk Per Trade',
        type: 'MAX_RISK_PER_TRADE',
        limitValue: 50,
        unit: '$',
        description: 'Trade risk capped at $50 per execution.',
        severity: 'WARNING',
        enforcement: 'STRICT_REJECT',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Trades Per Day',
        type: 'MAX_TRADES_PER_DAY',
        limitValue: 4,
        unit: 'Trades',
        description: 'Strict limit of 4 trades per calendar day to eliminate overtrading.',
        severity: 'WARNING',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Restricted News Window',
        type: 'RESTRICTED_NEWS_WINDOW',
        limitValue: 5,
        unit: 'Minutes',
        description: 'Trading restricted 5m before and 5m after high-impact news releases.',
        severity: 'WARNING',
        enforcement: 'STRICT_REJECT',
        isActive: true,
        warningThresholdPercent: 80
      }
    ]
  },
  {
    id: 'balanced',
    name: 'Balanced Competition',
    description: 'Standard institutional risk controls balancing operational flexibility with safety guardrails.',
    badge: 'Standard',
    rules: [
      {
        name: 'Maximum Drawdown',
        type: 'MAX_DRAWDOWN',
        limitValue: 250,
        unit: '$',
        description: 'Maximum trailing drawdown capped at $250.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Daily Loss',
        type: 'MAX_DAILY_LOSS',
        limitValue: 125,
        unit: '$',
        description: 'Daily loss limit capped at $125.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Risk Per Trade',
        type: 'MAX_RISK_PER_TRADE',
        limitValue: 100,
        unit: '$',
        description: 'Trade risk capped at $100 per execution.',
        severity: 'WARNING',
        enforcement: 'STRICT_REJECT',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Trades Per Day',
        type: 'MAX_TRADES_PER_DAY',
        limitValue: 8,
        unit: 'Trades',
        description: 'Cap of 8 trades per day.',
        severity: 'WARNING',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Weekend Trading Restricted',
        type: 'NO_WEEKEND_TRADING',
        limitValue: 1,
        unit: 'Flag',
        description: 'Positions must not be held over the weekend.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      }
    ]
  },
  {
    id: 'prop_style',
    name: 'Prop-Style Competition',
    description: 'Proprietary trading evaluation structure modeled after industry-standard two-phase benchmarks.',
    badge: 'Prop Challenge',
    rules: [
      {
        name: 'Maximum Drawdown',
        type: 'MAX_DRAWDOWN',
        limitValue: 500,
        unit: '$',
        description: 'Maximum total account drawdown cannot exceed $500 (5%).',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Daily Loss',
        type: 'MAX_DAILY_LOSS',
        limitValue: 250,
        unit: '$',
        description: 'Maximum daily loss limit cannot exceed $250 (2.5%).',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Risk Per Trade',
        type: 'MAX_RISK_PER_TRADE',
        limitValue: 150,
        unit: '$',
        description: 'Maximum risk of $150 per single execution.',
        severity: 'WARNING',
        enforcement: 'STRICT_REJECT',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Position Size',
        type: 'MAX_POSITION_SIZE',
        limitValue: 3,
        unit: 'Lots',
        description: 'Maximum position size of 3 standard lots.',
        severity: 'WARNING',
        enforcement: 'STRICT_REJECT',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'News Trading Prohibited',
        type: 'NO_NEWS_TRADING',
        limitValue: 5,
        unit: 'Minutes',
        description: 'No trades permitted within 5 minutes before or after high-impact economic news releases.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Consistency Rule',
        type: 'CONSISTENCY_RULE',
        limitValue: 40,
        unit: '%',
        description: 'Profit earned on best day cannot exceed 40% of total profits.',
        severity: 'WARNING',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      }
    ]
  },
  {
    id: 'high_risk',
    name: 'High-Risk Arena',
    description: 'High-frequency environment with wide drawdowns for momentum and aggressive breakout trading.',
    badge: 'Aggressive',
    rules: [
      {
        name: 'Maximum Drawdown',
        type: 'MAX_DRAWDOWN',
        limitValue: 600,
        unit: '$',
        description: 'Drawdown limit of $600.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Daily Loss',
        type: 'MAX_DAILY_LOSS',
        limitValue: 300,
        unit: '$',
        description: 'Daily loss limit of $300.',
        severity: 'DISQUALIFY',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      },
      {
        name: 'Maximum Trades Per Day',
        type: 'MAX_TRADES_PER_DAY',
        limitValue: 20,
        unit: 'Trades',
        description: 'Up to 20 trades per calendar day.',
        severity: 'WARNING',
        enforcement: 'AUTOMATIC',
        isActive: true,
        warningThresholdPercent: 80
      }
    ]
  },
  {
    id: 'custom',
    name: 'Custom Competition',
    description: 'Build your own rule configuration from scratch using the 46 universal rule types.',
    badge: 'Fully Custom',
    rules: []
  }
];

/**
 * Generates initial default rules for a newly created competition or arena
 */
export function generateDefaultCompetitionRules(arenaId: string, ownerId: string): CompetitionRule[] {
  const now = Date.now();
  const template = COMPETITION_RULES_TEMPLATES.find(t => t.id === 'balanced') || COMPETITION_RULES_TEMPLATES[0];

  return template.rules.map(r => ({
    id: uuidv4(),
    competitionId: arenaId,
    name: r.name,
    type: r.type,
    limitValue: r.limitValue,
    unit: r.unit,
    description: r.description,
    severity: r.severity,
    enforcement: r.enforcement,
    isActive: r.isActive,
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: ownerId,
    warningThresholdPercent: r.warningThresholdPercent || 80,
    history: []
  }));
}
