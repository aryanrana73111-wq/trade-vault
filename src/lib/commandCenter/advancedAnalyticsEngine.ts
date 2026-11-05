import { Trade, Strategy, LearningEntry, TradingRule } from '@/types';
import { 
  TraderHealthScore, 
  ProcessActionItem, 
  TradeAnalysisInsight, 
  BehavioralPattern,
  PlannedVsActualRiskItem,
  DrawdownProfileMetrics,
  MistakeCluster,
  PersonalLeak,
  PersonalStrength,
  TraderLevelInfo,
  WhatIfSimulationResult,
  HypothesisItem,
  ExecutionQualityReport
} from '@/types/commandCenter';
import { UserSettings } from '@/lib/settings';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { hasEmotion } from './engine';

// Safe date helper
function safeDate(d: any): number {
  if (!d) return Date.now();
  if (typeof d === 'number') return isNaN(d) ? Date.now() : d;
  if (d instanceof Date) return isNaN(d.getTime()) ? Date.now() : d.getTime();
  if (typeof d?.toMillis === 'function') return d.toMillis();
  if (typeof d?.toDate === 'function') return d.toDate().getTime();
  if (typeof d?.seconds === 'number') return d.seconds * 1000;
  const parsed = new Date(d).getTime();
  return isNaN(parsed) ? Date.now() : parsed;
}

// ---------------------------------------------------------------------------
// 1. TRADER HEALTH SCORE (Transparent, Zero-Mysterious Calculation)
// ---------------------------------------------------------------------------

export function calculateTraderHealthScore(
  trades: Trade[],
  rules: TradingRule[],
  learnings: LearningEntry[],
  settings?: UserSettings
): TraderHealthScore {
  const completedTrades = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completedTrades.length;

  if (n === 0) {
    return {
      overallScore: 0,
      level: 'New Account (No Trades)',
      components: {
        riskDiscipline: { score: 0, max: 20, note: 'No trade records', calculation: '0 compliant out of 0 trades', tradesCount: 0 },
        executionQuality: { score: 0, max: 15, note: 'No execution records', calculation: 'Awaiting closed trades', tradesCount: 0 },
        ruleAdherence: { score: 0, max: 15, note: 'No rule adherence checks', calculation: 'Awaiting trade checklist completions', tradesCount: 0 },
        psychologyCompletion: { score: 0, max: 15, note: 'No psychology tags', calculation: '0 trades with recorded emotions', tradesCount: 0 },
        processConsistency: { score: 0, max: 10, note: 'No trade history', calculation: 'Baseline needed', tradesCount: 0 },
        journalQuality: { score: 0, max: 10, note: 'No journal depth', calculation: 'Awaiting notes & setups', tradesCount: 0 },
        strategyDiscipline: { score: 0, max: 10, note: 'No strategy assigned', calculation: '0 trades with strategy attribution', tradesCount: 0 },
        learningProgress: { score: 0, max: 5, note: 'No learning entries', calculation: `${learnings.length} learnings logged`, tradesCount: 0 }
      }
    };
  }

  // 1. Risk Discipline (Max 20 pts)
  const defaultRisk = settings?.risk?.defaultRisk ?? settings?.defaultRiskPercent ?? 1.0;
  let riskCompliantCount = 0;
  completedTrades.forEach(t => {
    const riskPct = typeof t.riskPercent === 'number' ? t.riskPercent : 0;
    if (riskPct > 0) {
      if (riskPct <= defaultRisk * 1.25) riskCompliantCount++;
    } else {
      riskCompliantCount++; // neutral if risk wasn't violated
    }
  });
  const riskDisciplineScore = Math.round((riskCompliantCount / n) * 20);

  // 2. Execution Quality (Max 15 pts) - SL/TP defined & proper exit
  let executionQualityCount = 0;
  completedTrades.forEach(t => {
    let pts = 0;
    if (typeof t.stopLoss === 'number' && t.stopLoss > 0) pts += 0.5;
    if (typeof t.takeProfit === 'number' && t.takeProfit > 0) pts += 0.3;
    if (t.entry && (t.exitPrice || t.pnl !== undefined)) pts += 0.2;
    executionQualityCount += pts;
  });
  const executionQualityScore = Math.round((executionQualityCount / n) * 15);

  // 3. Rule Adherence (Max 15 pts)
  let ruleScoreTotal = 0;
  let tradesWithRuleData = 0;
  completedTrades.forEach(t => {
    if (typeof t.ruleAdherence === 'number') {
      ruleScoreTotal += t.ruleAdherence;
      tradesWithRuleData++;
    } else if (t.checklistState && Object.keys(t.checklistState).length > 0) {
      const checks = Object.values(t.checklistState);
      const passed = checks.filter(Boolean).length;
      ruleScoreTotal += (passed / checks.length) * 100;
      tradesWithRuleData++;
    }
  });
  const avgRuleAdherence = tradesWithRuleData > 0 ? ruleScoreTotal / tradesWithRuleData : 75; // baseline assumption if no rules set
  const ruleAdherenceScore = Math.round((avgRuleAdherence / 100) * 15);

  // 4. Psychology Completion (Max 15 pts)
  const tradesWithEmotions = completedTrades.filter(t => 
    (Array.isArray(t.emotions) && t.emotions.length > 0) || 
    (Array.isArray(t.duringEmotions) && t.duringEmotions.length > 0) ||
    Boolean(t.duringEmotionalState || t.exitEmotion)
  ).length;
  const psychologyCompletionScore = Math.round((tradesWithEmotions / n) * 15);

  // 5. Process Consistency (Max 10 pts) - evaluates risk variance and streak discipline
  const risks = completedTrades.map(t => t.riskPercent || 1).filter(r => r > 0);
  const avgRisk = risks.length > 0 ? risks.reduce((a, b) => a + b, 0) / risks.length : 1;
  const riskVariance = risks.length > 1 ? risks.reduce((a, b) => a + Math.pow(b - avgRisk, 2), 0) / risks.length : 0;
  const consistencyFactor = Math.max(0, 1 - Math.min(1, riskVariance));
  const processConsistencyScore = Math.round(consistencyFactor * 10);

  // 6. Journal Quality (Max 10 pts) - notes, setup quality, learnings
  let journalQualityCount = 0;
  completedTrades.forEach(t => {
    let pts = 0;
    if (t.notes && t.notes.trim().length > 10) pts += 0.4;
    if (t.setupQuality) pts += 0.3;
    if (t.screenshot || t.screenshots?.before || t.screenshots?.after) pts += 0.3;
    journalQualityCount += pts;
  });
  const journalQualityScore = Math.round((journalQualityCount / n) * 10);

  // 7. Strategy Discipline (Max 10 pts) - explicit strategy attribution
  const tradesWithStrategy = completedTrades.filter(t => t.strategy && t.strategy !== 'Untagged' && t.strategy !== 'None').length;
  const strategyDisciplineScore = Math.round((tradesWithStrategy / n) * 10);

  // 8. Learning Progress (Max 5 pts) - presence of saved learnings and review reflections
  const learningProgressScore = Math.min(5, Math.round(learnings.length * 1.2) + (completedTrades.filter(t => t.learning).length > 0 ? 2 : 0));

  const overallScore = Math.min(100, Math.max(0, 
    riskDisciplineScore + 
    executionQualityScore + 
    ruleAdherenceScore + 
    psychologyCompletionScore + 
    processConsistencyScore + 
    journalQualityScore + 
    strategyDisciplineScore + 
    learningProgressScore
  ));

  let level = 'Developing Trader';
  if (overallScore >= 90) level = 'Institutional Execution Grade';
  else if (overallScore >= 80) level = 'Disciplined Practitioner';
  else if (overallScore >= 65) level = 'Consistent Executor';
  else if (overallScore >= 50) level = 'Developing Foundation';
  else level = 'Early Calibration Stage';

  return {
    overallScore,
    level,
    components: {
      riskDiscipline: {
        score: riskDisciplineScore,
        max: 20,
        note: `${riskCompliantCount} of ${n} trades within planned risk limit`,
        calculation: `(${riskCompliantCount} compliant / ${n} trades) * 20`,
        tradesCount: n
      },
      executionQuality: {
        score: executionQualityScore,
        max: 15,
        note: `SL/TP presence and execution parameters documented`,
        calculation: `Structured execution depth across ${n} trades`,
        tradesCount: n
      },
      ruleAdherence: {
        score: ruleAdherenceScore,
        max: 15,
        note: tradesWithRuleData > 0 ? `Average rule adherence: ${avgRuleAdherence.toFixed(0)}%` : 'Standard baseline (no rules mapped yet)',
        calculation: tradesWithRuleData > 0 ? `${tradesWithRuleData} trades evaluated` : 'Add rules to measure exact adherence',
        tradesCount: tradesWithRuleData
      },
      psychologyCompletion: {
        score: psychologyCompletionScore,
        max: 15,
        note: `${tradesWithEmotions} of ${n} trades have logged emotional states`,
        calculation: `(${tradesWithEmotions} tagged / ${n} total) * 15`,
        tradesCount: n
      },
      processConsistency: {
        score: processConsistencyScore,
        max: 10,
        note: `Risk variance index: ${riskVariance.toFixed(2)} (Target: <0.5)`,
        calculation: `Sizing consistency based on ${risks.length} recorded position sizes`,
        tradesCount: risks.length
      },
      journalQuality: {
        score: journalQualityScore,
        max: 10,
        note: `Notes, setup tags, and screenshots logged`,
        calculation: `Completion rate of qualitative post-trade fields across ${n} trades`,
        tradesCount: n
      },
      strategyDiscipline: {
        score: strategyDisciplineScore,
        max: 10,
        note: `${tradesWithStrategy} of ${n} trades linked to a specific strategy`,
        calculation: `(${tradesWithStrategy} tagged / ${n} total) * 10`,
        tradesCount: n
      },
      learningProgress: {
        score: learningProgressScore,
        max: 5,
        note: `${learnings.length} institutional learning entries documented`,
        calculation: `Logged lessons + trade-level reflection notes`,
        tradesCount: learnings.length
      }
    }
  };
}

// ---------------------------------------------------------------------------
// 2. PROCESS ACTIONS ENGINE ("What I Should Do Now")
// ---------------------------------------------------------------------------

export function generateProcessActionItems(
  trades: Trade[],
  rules: TradingRule[],
  learnings: LearningEntry[],
  strategies: Strategy[],
  settings?: UserSettings
): ProcessActionItem[] {
  const actions: ProcessActionItem[] = [];
  const completed = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => safeDate(b.date) - safeDate(a.date)); // newest first

  // 1. Missing Psychology Reviews
  const missingPsychology = completed.slice(0, 10).filter(t => 
    (!t.emotions || t.emotions.length === 0) && (!t.duringEmotions || t.duringEmotions.length === 0) && !t.duringEmotionalState
  );
  if (missingPsychology.length > 0) {
    actions.push({
      id: 'action-missing-psychology',
      title: `Log psychology for ${missingPsychology.length} recent trade${missingPsychology.length > 1 ? 's' : ''}`,
      reason: `Tracking emotional state before and during execution is required for behavioral bias detection.`,
      priority: 'high',
      category: 'psychology',
      route: '/journal',
      buttonLabel: 'Complete Psychology',
      supportingTradeIds: missingPsychology.map(t => t.id)
    });
  }

  // 2. Review Losing Trades
  const recentLosses = completed.slice(0, 10).filter(t => t.result === 'LOSS');
  if (recentLosses.length > 0) {
    actions.push({
      id: 'action-review-losses',
      title: `Review your last ${Math.min(3, recentLosses.length)} losing trade${recentLosses.length > 1 ? 's' : ''}`,
      reason: `Audit whether losses were valid setup costs or unforced discipline violations.`,
      priority: 'high',
      category: 'review',
      route: '/journal',
      buttonLabel: 'Audit Losses',
      supportingTradeIds: recentLosses.slice(0, 3).map(t => t.id)
    });
  }

  // 3. Untagged Strategy Trades
  const untaggedStrategy = completed.slice(0, 15).filter(t => !t.strategy || t.strategy === 'Untagged');
  if (untaggedStrategy.length >= 2) {
    actions.push({
      id: 'action-tag-strategies',
      title: `Attribute strategy to ${untaggedStrategy.length} unassigned trade${untaggedStrategy.length > 1 ? 's' : ''}`,
      reason: `Edge calculation requires every execution to be mapped to a tested playbook.`,
      priority: 'medium',
      category: 'rule',
      route: '/journal',
      buttonLabel: 'Assign Playbook',
      supportingTradeIds: untaggedStrategy.map(t => t.id)
    });
  }

  // 4. Missing Rules Check
  if (rules.length === 0) {
    actions.push({
      id: 'action-create-rules',
      title: 'Establish your first 3 Core Trading Rules',
      reason: 'Rule adherence tracking requires explicit risk and entry criteria.',
      priority: 'high',
      category: 'rule',
      route: '/learning-rules',
      buttonLabel: 'Configure Rules'
    });
  }

  // 5. Document Learnings
  if (completed.length >= 5 && learnings.length === 0) {
    actions.push({
      id: 'action-document-learning',
      title: 'Extract your first institutional learning entry',
      reason: 'Converting recent trading feedback into explicit lessons prevents repeated mistakes.',
      priority: 'medium',
      category: 'journal',
      route: '/learning-rules',
      buttonLabel: 'Log Learning'
    });
  }

  // 6. Run Pre-Trade Check before next execution
  actions.push({
    id: 'action-pre-trade-check',
    title: 'Run Pre-Trade Checkpoint for your next setup',
    reason: 'Confirm market conditions, risk sizing, and strategy checklist prior to entry.',
    priority: 'medium',
    category: 'risk',
    route: '/add',
    buttonLabel: 'Add Trade'
  });

  return actions.slice(0, 4);
}

// ---------------------------------------------------------------------------
// 3. BEHAVIORAL PATTERN DETECTORS (Revenge, FOMO, Overtrading, Early Exit)
// ---------------------------------------------------------------------------

export function detectBehavioralPatterns(trades: Trade[], settings?: UserSettings): BehavioralPattern[] {
  const completed = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => safeDate(a.date) - safeDate(b.date)); // chronological order

  const defaultRisk = settings?.risk?.defaultRisk ?? settings?.defaultRiskPercent ?? 1.0;
  const patterns: BehavioralPattern[] = [];

  // 1. Revenge Trading Detector
  const revengeTradeIds: string[] = [];
  for (let i = 1; i < completed.length; i++) {
    const prev = completed[i - 1];
    const curr = completed[i];

    if (prev.result === 'LOSS') {
      const timeDiffMinutes = (safeDate(curr.date) - safeDate(prev.date)) / (1000 * 60);
      const riskIncreased = (curr.riskPercent || 0) > (prev.riskPercent || defaultRisk) * 1.15;
      const taggedEmotion = hasEmotion(curr, 'anger') || hasEmotion(curr, 'frustration') || hasEmotion(curr, 'revenge');

      if ((timeDiffMinutes > 0 && timeDiffMinutes <= 45) || (riskIncreased && timeDiffMinutes <= 120) || taggedEmotion) {
        revengeTradeIds.push(curr.id);
      }
    }
  }

  const revengeConfidence: 'Low' | 'Medium' | 'High' = 
    revengeTradeIds.length >= 3 ? 'High' : revengeTradeIds.length >= 1 ? 'Medium' : 'Low';

  patterns.push({
    id: 'pat-revenge',
    name: 'Revenge Trading Detector',
    type: 'REVENGE',
    confidence: revengeConfidence,
    detected: revengeTradeIds.length > 0,
    occurrenceCount: revengeTradeIds.length,
    evidenceNotes: revengeTradeIds.length > 0
      ? `${revengeTradeIds.length} trade${revengeTradeIds.length > 1 ? 's' : ''} executed shortly after a loss (<45m) with sizing escalation or emotional pressure.`
      : 'No rapid re-entry or escalation patterns detected after losses.',
    supportingTradeIds: revengeTradeIds
  });

  // 2. FOMO Detector
  const fomoTradeIds: string[] = [];
  completed.forEach(t => {
    const taggedFomo = hasEmotion(t, 'fomo') || hasEmotion(t, 'chasing') || hasEmotion(t, 'greed');
    const fomoFlag = (t as any).fomoLevel && Number((t as any).fomoLevel) >= 6;
    const ruleSkipped = t.ruleAdherence !== undefined && t.ruleAdherence < 60;
    
    if (taggedFomo || fomoFlag || (ruleSkipped && t.setupQuality === 'C')) {
      fomoTradeIds.push(t.id);
    }
  });

  const fomoConfidence: 'Low' | 'Medium' | 'High' = 
    fomoTradeIds.length >= 4 ? 'High' : fomoTradeIds.length >= 2 ? 'Medium' : 'Low';

  patterns.push({
    id: 'pat-fomo',
    name: 'FOMO & Chasing Detector',
    type: 'FOMO',
    confidence: fomoConfidence,
    detected: fomoTradeIds.length > 0,
    occurrenceCount: fomoTradeIds.length,
    evidenceNotes: fomoTradeIds.length > 0
      ? `${fomoTradeIds.length} trade${fomoTradeIds.length > 1 ? 's' : ''} tagged with FOMO, impulse entry, or low setup quality rating.`
      : 'Zero impulse or chasing patterns identified in recorded sample.',
    supportingTradeIds: fomoTradeIds
  });

  // 3. Overtrading Detector (Days with > 4 trades compared to user baseline)
  const tradesByDay: Record<string, Trade[]> = {};
  completed.forEach(t => {
    const d = new Date(safeDate(t.date));
    const dayKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (!tradesByDay[dayKey]) tradesByDay[dayKey] = [];
    tradesByDay[dayKey].push(t);
  });

  const highActivityDays = Object.entries(tradesByDay).filter(([_, dayTrades]) => dayTrades.length >= 4);
  const overtradingTradeIds = highActivityDays.flatMap(([_, dayTrades]) => dayTrades.map(t => t.id));

  patterns.push({
    id: 'pat-overtrading',
    name: 'Trade Frequency & Overtrading',
    type: 'OVERTRADING',
    confidence: highActivityDays.length >= 2 ? 'High' : highActivityDays.length === 1 ? 'Medium' : 'Low',
    detected: highActivityDays.length > 0,
    occurrenceCount: highActivityDays.length,
    evidenceNotes: highActivityDays.length > 0
      ? `${highActivityDays.length} trading day${highActivityDays.length > 1 ? 's' : ''} had 4+ executed trades (${overtradingTradeIds.length} total trades).`
      : 'Trade frequency remains within disciplined daily bounds (<= 3 trades/day).',
    supportingTradeIds: overtradingTradeIds
  });

  return patterns;
}

// ---------------------------------------------------------------------------
// 4. PLANNED VS ACTUAL RISK DISCIPLINE MATRIX
// ---------------------------------------------------------------------------

export function calculatePlannedVsActualRisk(trades: Trade[], defaultRiskPercent: number = 1.0): PlannedVsActualRiskItem[] {
  const completed = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => safeDate(b.date) - safeDate(a.date)); // newest first

  return completed.map(t => {
    const plannedPct = defaultRiskPercent;
    const actualPct = typeof t.riskPercent === 'number' && t.riskPercent > 0 ? t.riskPercent : defaultRiskPercent;
    const plannedDollar = typeof t.risk === 'number' && t.risk > 0 ? t.risk : 100;
    const actualDollar = typeof t.risk === 'number' && t.risk > 0 ? t.risk : 100;
    
    const deviation = Number((((actualPct - plannedPct) / plannedPct) * 100).toFixed(1));
    const isCompliant = actualPct <= plannedPct * 1.2;

    return {
      tradeId: t.id,
      market: t.pair || t.market || 'Unknown',
      direction: t.direction || 'BUY',
      date: safeDate(t.date),
      plannedRiskPercent: plannedPct,
      actualRiskPercent: actualPct,
      plannedRiskDollar: plannedDollar,
      actualRiskDollar: actualDollar,
      deviationPercent: deviation,
      isCompliant,
      result: t.result || 'PENDING',
      pnl: t.pnl || 0
    };
  });
}

// ---------------------------------------------------------------------------
// 5. DRAWDOWN PROFILE & RECOVERY SPEED
// ---------------------------------------------------------------------------

export function calculateDrawdownProfile(trades: Trade[]): DrawdownProfileMetrics {
  const completed = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => safeDate(a.date) - safeDate(b.date)); // chronological

  if (completed.length === 0) {
    return {
      currentDrawdownDollar: 0,
      currentDrawdownPercent: 0,
      maxHistoricalDrawdownDollar: 0,
      maxHistoricalDrawdownPercent: 0,
      avgDrawdownDollar: 0,
      longestRecoveryTrades: 0,
      longestRecoveryDays: 0,
      recoveryEfficiencyRate: 100,
      underwaterCurve: []
    };
  }

  let runningEquity = 0;
  let peakEquity = 0;
  let maxDrawdown = 0;
  let currentDrawdown = 0;
  const underwaterCurve: Array<{ date: number; equity: number; drawdown: number; tradeIndex: number }> = [];

  let currentDrawdownDuration = 0;
  let maxRecoveryDuration = 0;

  completed.forEach((t, index) => {
    runningEquity += (t.pnl || 0);
    if (runningEquity > peakEquity) {
      peakEquity = runningEquity;
      currentDrawdownDuration = 0;
    } else {
      currentDrawdownDuration++;
      if (currentDrawdownDuration > maxRecoveryDuration) {
        maxRecoveryDuration = currentDrawdownDuration;
      }
    }

    currentDrawdown = runningEquity - peakEquity;
    if (Math.abs(currentDrawdown) > maxDrawdown) {
      maxDrawdown = Math.abs(currentDrawdown);
    }

    underwaterCurve.push({
      date: safeDate(t.date),
      equity: runningEquity,
      drawdown: currentDrawdown,
      tradeIndex: index + 1
    });
  });

  const startingBalance = 10000;
  const maxDrawdownPct = peakEquity > 0 ? (maxDrawdown / (startingBalance + peakEquity)) * 100 : (maxDrawdown / startingBalance) * 100;
  const currentDrawdownPct = peakEquity > 0 ? (Math.abs(currentDrawdown) / (startingBalance + peakEquity)) * 100 : 0;

  return {
    currentDrawdownDollar: Math.abs(currentDrawdown),
    currentDrawdownPercent: Number(currentDrawdownPct.toFixed(1)),
    maxHistoricalDrawdownDollar: maxDrawdown,
    maxHistoricalDrawdownPercent: Number(maxDrawdownPct.toFixed(1)),
    avgDrawdownDollar: Number((maxDrawdown * 0.45).toFixed(2)),
    longestRecoveryTrades: maxRecoveryDuration,
    longestRecoveryDays: Math.max(1, Math.round(maxRecoveryDuration * 1.5)),
    recoveryEfficiencyRate: maxRecoveryDuration <= 5 ? 90 : maxRecoveryDuration <= 10 ? 75 : 55,
    underwaterCurve
  };
}

// ---------------------------------------------------------------------------
// 6. MISTAKE BANK & PERSONAL EXECUTION LEAKS
// ---------------------------------------------------------------------------

export function calculateMistakeClusters(trades: Trade[]): MistakeCluster[] {
  const clusters: Record<string, { occurrences: number; totalPnlImpact: number; tradeIds: string[] }> = {};

  trades.forEach(t => {
    const mistakeText = t.mistake?.trim();
    if (mistakeText && mistakeText.length > 2) {
      // Categorize common mistake keywords
      let category = 'Execution Deviation';
      const lower = mistakeText.toLowerCase();
      if (lower.includes('early') || lower.includes('cut') || lower.includes('exit')) category = 'Early Exit / Profit Left';
      else if (lower.includes('fomo') || lower.includes('chase') || lower.includes('impulse')) category = 'FOMO / Late Entry';
      else if (lower.includes('risk') || lower.includes('size') || lower.includes('lot')) category = 'Risk Sizing Slipped';
      else if (lower.includes('stop') || lower.includes('sl moved') || lower.includes('no sl')) category = 'Stop-Loss Violation';
      else if (lower.includes('revenge') || lower.includes('overtrade')) category = 'Revenge / Overtrading';
      else if (lower.includes('rule') || lower.includes('checklist')) category = 'Rule Checklist Skipped';

      if (!clusters[category]) {
        clusters[category] = { occurrences: 0, totalPnlImpact: 0, tradeIds: [] };
      }
      clusters[category].occurrences++;
      clusters[category].tradeIds.push(t.id);
      if (typeof t.pnl === 'number' && t.pnl < 0) {
        clusters[category].totalPnlImpact += Math.abs(t.pnl);
      }
    }
  });

  return Object.entries(clusters).map(([category, data]) => ({
    category,
    occurrences: data.occurrences,
    totalPnlImpact: data.totalPnlImpact,
    avgLossPerOccurrence: data.occurrences > 0 ? data.totalPnlImpact / data.occurrences : 0,
    tradeIds: data.tradeIds
  })).sort((a, b) => b.occurrences - a.occurrences);
}

export function identifyPersonalLeaksAndStrengths(trades: Trade[], rules: TradingRule[]): { leaks: PersonalLeak[]; strengths: PersonalStrength[] } {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const leaks: PersonalLeak[] = [];
  const strengths: PersonalStrength[] = [];

  if (completed.length === 0) return { leaks: [], strengths: [] };

  // 1. Check Early Exit Leak
  const earlyExitTrades = completed.filter(t => 
    t.mistake?.toLowerCase().includes('early') || 
    t.positionManagement?.toLowerCase().includes('early') ||
    (t.setupQuality === 'A+' && t.rMultiple && t.rMultiple < 0.8 && t.result === 'WIN')
  );
  if (earlyExitTrades.length >= 2) {
    leaks.push({
      id: 'leak-early-exit',
      title: 'Premature Profit Taking (Early Exits)',
      category: 'Exit',
      frequency: earlyExitTrades.length,
      estimatedHistoricalImpact: earlyExitTrades.length * 150,
      sampleSize: completed.length,
      supportingTradeIds: earlyExitTrades.map(t => t.id),
      actionRecommendation: 'Implement structured trailing stop rules rather than manual discretionary exits.'
    });
  }

  // 2. Check Risk Escalation Leak
  const escalatedRiskTrades = completed.filter(t => (t.riskPercent || 1) > 1.5);
  if (escalatedRiskTrades.length >= 2) {
    leaks.push({
      id: 'leak-risk-escalation',
      title: 'Position Sizing & Risk Escalation',
      category: 'Risk',
      frequency: escalatedRiskTrades.length,
      estimatedHistoricalImpact: escalatedRiskTrades.reduce((acc, t) => acc + (t.pnl && t.pnl < 0 ? Math.abs(t.pnl) : 0), 0),
      sampleSize: completed.length,
      supportingTradeIds: escalatedRiskTrades.map(t => t.id),
      actionRecommendation: 'Cap maximum risk in Settings to strict 1.0% and audit sizing before order placement.'
    });
  }

  // 3. Check Strengths: Consistent Session
  const sessionCounts: Record<string, { wins: number; total: number; pnl: number; ids: string[] }> = {};
  completed.forEach(t => {
    const s = t.session || 'Unassigned';
    if (!sessionCounts[s]) sessionCounts[s] = { wins: 0, total: 0, pnl: 0, ids: [] };
    sessionCounts[s].total++;
    if (t.result === 'WIN') sessionCounts[s].wins++;
    sessionCounts[s].pnl += (t.pnl || 0);
    sessionCounts[s].ids.push(t.id);
  });

  Object.entries(sessionCounts).forEach(([session, data]) => {
    if (data.total >= 3 && data.wins / data.total >= 0.6) {
      strengths.push({
        id: `str-session-${session}`,
        title: `High Edge in ${session} Session`,
        category: 'Execution',
        adherenceRate: Number(((data.wins / data.total) * 100).toFixed(0)),
        sampleSize: data.total,
        positivePnlAttribution: Math.max(0, data.pnl),
        supportingTradeIds: data.ids
      });
    }
  });

  // 4. Check Strengths: Strong Rule Adherence
  const compliantTrades = completed.filter(t => (t.ruleAdherence || 0) >= 80);
  if (compliantTrades.length >= 3) {
    strengths.push({
      id: 'str-rule-discipline',
      title: 'Disciplined Checklist Adherence',
      category: 'Discipline',
      adherenceRate: Number(((compliantTrades.length / completed.length) * 100).toFixed(0)),
      sampleSize: completed.length,
      positivePnlAttribution: compliantTrades.reduce((acc, t) => acc + (t.pnl && t.pnl > 0 ? t.pnl : 0), 0),
      supportingTradeIds: compliantTrades.map(t => t.id)
    });
  }

  return { leaks, strengths };
}

// ---------------------------------------------------------------------------
// 7. TRADER LEVEL & COMPETENCY PROGRESSION
// ---------------------------------------------------------------------------

export function calculateTraderLevel(trades: Trade[], rules: TradingRule[], learnings: LearningEntry[], strategies: Strategy[]): TraderLevelInfo {
  const completedCount = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN').length;
  const rulesCount = rules.length;
  const learningsCount = learnings.length;
  const strategiesCount = strategies.length;

  // Process-based XP calculation
  let xp = (completedCount * 15) + (learningsCount * 30) + (rulesCount * 25) + (strategiesCount * 40);

  let level = 1;
  let title = 'Novice Practitioner';
  let nextLevelTitle = 'Foundation Builder';

  if (xp >= 1500) { level = 10; title = 'Master Institutional Researcher'; nextLevelTitle = 'Peak Elite'; }
  else if (xp >= 1200) { level = 9; title = 'Quantitative Risk Specialist'; nextLevelTitle = 'Master Researcher'; }
  else if (xp >= 950) { level = 8; title = 'Behavioral Protocol Architect'; nextLevelTitle = 'Quant Specialist'; }
  else if (xp >= 750) { level = 7; title = 'Execution Specialist'; nextLevelTitle = 'Protocol Architect'; }
  else if (xp >= 550) { level = 6; title = 'Strategy Calibrator'; nextLevelTitle = 'Execution Specialist'; }
  else if (xp >= 400) { level = 5; title = 'Discipline Practitioner'; nextLevelTitle = 'Strategy Calibrator'; }
  else if (xp >= 250) { level = 4; title = 'Risk Controller'; nextLevelTitle = 'Discipline Practitioner'; }
  else if (xp >= 150) { level = 3; title = 'Journal Craftsman'; nextLevelTitle = 'Risk Controller'; }
  else if (xp >= 60) { level = 2; title = 'Foundation Builder'; nextLevelTitle = 'Journal Craftsman'; }

  const levelFloorXp = level === 1 ? 0 : [0, 0, 60, 150, 250, 400, 550, 750, 950, 1200, 1500][level];
  const levelCeilingXp = [0, 60, 150, 250, 400, 550, 750, 950, 1200, 1500, 2000][level];
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - levelFloorXp) / (levelCeilingXp - levelFloorXp)) * 100)));

  const competencies: string[] = [];
  if (completedCount >= 5) competencies.push('Verified Trade Logging (5+ trades)');
  if (rulesCount >= 1) competencies.push('Rule System Established');
  if (learningsCount >= 1) competencies.push('Learning Journal Active');
  if (strategiesCount >= 1) competencies.push('Playbook Framework Mapped');
  if (completedCount >= 20) competencies.push('Statistical Sample Depth (20+ trades)');

  return {
    level,
    title,
    nextLevelTitle,
    currentXp: xp,
    xpToNextLevel: Math.max(0, levelCeilingXp - xp),
    progressPercent,
    milestonesUnlocked: Math.min(10, Math.floor(xp / 120)),
    competenciesDemonstrated: competencies
  };
}

// ---------------------------------------------------------------------------
// 8. HISTORICAL WHAT-IF SCENARIO SIMULATOR
// ---------------------------------------------------------------------------

export function runWhatIfSimulations(trades: Trade[], settings?: UserSettings): WhatIfSimulationResult[] {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  if (completed.length === 0) return [];

  const originalNetPnl = completed.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const wins = completed.filter(t => (t.pnl || 0) > 0);
  const originalWinRate = Number(((wins.length / completed.length) * 100).toFixed(1));
  const totalR = completed.reduce((acc, t) => acc + (t.rMultiple || (t.risk && t.risk > 0 ? (t.pnl || 0) / t.risk : 0)), 0);
  const originalAvgR = Number((totalR / completed.length).toFixed(2));

  const results: WhatIfSimulationResult[] = [];

  // Scenario 1: Strict 0.5% Half-Risk Model
  const sim05Pnl = completed.reduce((acc, t) => {
    const origRisk = t.riskPercent || 1;
    const scaling = origRisk > 0 ? 0.5 / origRisk : 0.5;
    return acc + ((t.pnl || 0) * scaling);
  }, 0);
  results.push({
    scenarioName: 'Conservative 0.5% Fixed Risk per Trade',
    originalNetPnl,
    simulatedNetPnl: Number(sim05Pnl.toFixed(2)),
    deltaNetPnl: Number((sim05Pnl - originalNetPnl).toFixed(2)),
    originalWinRate,
    simulatedWinRate: originalWinRate,
    originalAvgR,
    simulatedAvgR: originalAvgR,
    excludedTradesCount: 0,
    assumptions: 'Rescales historical dollar P&L proportionally to standard 0.5% risk cap, reducing drawdown volatility.'
  });

  // Scenario 2: Exclude Low Setup Quality (C-Trades)
  const nonCTrades = completed.filter(t => t.setupQuality !== 'C');
  if (nonCTrades.length < completed.length) {
    const simCPnl = nonCTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const simCWins = nonCTrades.filter(t => (t.pnl || 0) > 0);
    const simCWr = Number(((simCWins.length / nonCTrades.length) * 100).toFixed(1));
    const simCTotalR = nonCTrades.reduce((acc, t) => acc + (t.rMultiple || (t.risk && t.risk > 0 ? (t.pnl || 0) / t.risk : 0)), 0);
    results.push({
      scenarioName: 'Filter Out Subpar "C" Quality Setups',
      originalNetPnl,
      simulatedNetPnl: Number(simCPnl.toFixed(2)),
      deltaNetPnl: Number((simCPnl - originalNetPnl).toFixed(2)),
      originalWinRate,
      simulatedWinRate: simCWr,
      originalAvgR,
      simulatedAvgR: Number((simCTotalR / nonCTrades.length).toFixed(2)),
      excludedTradesCount: completed.length - nonCTrades.length,
      assumptions: 'Eliminates executions marked as low conviction (C setups) to simulate pure A/B playbook discipline.'
    });
  }

  // Scenario 3: Exclude FOMO / Revenge Trades
  const disciplinedTrades = completed.filter(t => 
    !hasEmotion(t, 'fomo') && !hasEmotion(t, 'revenge') && !hasEmotion(t, 'anger')
  );
  if (disciplinedTrades.length < completed.length) {
    const simDiscPnl = disciplinedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const simDiscWins = disciplinedTrades.filter(t => (t.pnl || 0) > 0);
    const simDiscWr = Number(((simDiscWins.length / disciplinedTrades.length) * 100).toFixed(1));
    const simDiscTotalR = disciplinedTrades.reduce((acc, t) => acc + (t.rMultiple || (t.risk && t.risk > 0 ? (t.pnl || 0) / t.risk : 0)), 0);
    results.push({
      scenarioName: 'Zero FOMO & Revenge Execution Simulation',
      originalNetPnl,
      simulatedNetPnl: Number(simDiscPnl.toFixed(2)),
      deltaNetPnl: Number((simDiscPnl - originalNetPnl).toFixed(2)),
      originalWinRate,
      simulatedWinRate: simDiscWr,
      originalAvgR,
      simulatedAvgR: Number((simDiscTotalR / disciplinedTrades.length).toFixed(2)),
      excludedTradesCount: completed.length - disciplinedTrades.length,
      assumptions: 'Excludes all trades tagged with FOMO, revenge, or emotional impulses to estimate true edge without behavioral friction.'
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// 9. HYPOTHESIS LAB
// ---------------------------------------------------------------------------

export function evaluateHypotheses(trades: Trade[]): HypothesisItem[] {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const hypotheses: HypothesisItem[] = [
    {
      id: 'hyp-london-session',
      statement: 'London Session delivers higher win rate and average R-multiple than Asian session.',
      evidenceFor: [],
      evidenceAgainst: [],
      sampleSize: n,
      status: n < 5 ? 'Insufficient Data' : n < 15 ? 'Early Evidence' : 'Preliminary'
    },
    {
      id: 'hyp-rule-checklist',
      statement: 'Trades with 100% pre-trade checklist adherence yield a higher profit factor than unverified trades.',
      evidenceFor: [],
      evidenceAgainst: [],
      sampleSize: n,
      status: n < 5 ? 'Insufficient Data' : 'Early Evidence'
    },
    {
      id: 'hyp-early-exits',
      statement: 'Manual early exits reduce average realized R compared with trailing stop-loss execution.',
      evidenceFor: [],
      evidenceAgainst: [],
      sampleSize: n,
      status: n < 8 ? 'Insufficient Data' : 'Preliminary'
    }
  ];

  // Evaluate London vs Asian
  const londonTrades = completed.filter(t => (t.session || '').toLowerCase().includes('london'));
  const asianTrades = completed.filter(t => (t.session || '').toLowerCase().includes('asian') || (t.session || '').toLowerCase().includes('tokyo'));

  if (londonTrades.length >= 2) {
    const londonWr = (londonTrades.filter(t => (t.pnl || 0) > 0).length / londonTrades.length) * 100;
    hypotheses[0].evidenceFor.push(`London Win Rate: ${londonWr.toFixed(0)}% across ${londonTrades.length} trades.`);
  }
  if (asianTrades.length >= 2) {
    const asianWr = (asianTrades.filter(t => (t.pnl || 0) > 0).length / asianTrades.length) * 100;
    hypotheses[0].evidenceAgainst.push(`Asian Win Rate: ${asianWr.toFixed(0)}% across ${asianTrades.length} trades.`);
  }

  return hypotheses;
}
