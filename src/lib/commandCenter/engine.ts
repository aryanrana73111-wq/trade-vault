import { Trade, Strategy, LearningEntry, TradingRule, Session, Market, Emotion, Direction } from '@/types';
import { 
  CommandCenterSummary, 
  CommandCenterTimeRange, 
  ComparisonWindowSize, 
  AttentionItem, 
  CurrentTradingState, 
  CurrentTradingStateMetric, 
  RecentActivityEvent, 
  InvestigationResult,
  PinnedItem
} from '@/types/commandCenter';
import { UserSettings } from '@/lib/settings';
import { formatCurrency, formatNumber } from '@/lib/utils';

// Helper to check if a trade contains a given emotion defensively
export function hasEmotion(trade: Trade, targetEmotion: string): boolean {
  if (!trade) return false;
  const target = targetEmotion.toLowerCase();

  if (Array.isArray(trade.emotions)) {
    if (trade.emotions.some(e => typeof e === 'string' && e.toLowerCase() === target)) return true;
  } else if (typeof trade.emotions === 'string') {
    if ((trade.emotions as string).toLowerCase().includes(target)) return true;
  }

  if (Array.isArray(trade.duringEmotions)) {
    if (trade.duringEmotions.some(e => typeof e === 'string' && e.toLowerCase() === target)) return true;
  } else if (typeof trade.duringEmotions === 'string') {
    if ((trade.duringEmotions as string).toLowerCase().includes(target)) return true;
  }

  return false;
}

// Helper to filter trades by time range
export function filterTradesByTimeRange(trades: Trade[] = [], range: CommandCenterTimeRange): Trade[] {
  if (!Array.isArray(trades)) return [];
  const validTrades = trades.filter(t => t && typeof t.date === 'number');
  if (range === 'all') return validTrades;
  
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  if (range === 'today') {
    return validTrades.filter(t => t.date >= startOfDay);
  }
  
  const DAY_MS = 24 * 60 * 60 * 1000;
  let cutoff = startOfDay;
  
  if (range === '7d') {
    cutoff = now.getTime() - 7 * DAY_MS;
  } else if (range === '30d') {
    cutoff = now.getTime() - 30 * DAY_MS;
  } else if (range === '90d') {
    cutoff = now.getTime() - 90 * DAY_MS;
  }
  
  return validTrades.filter(t => t.date >= cutoff);
}

// ---------------------------------------------------------------------------
// 1. TOP SUMMARY CALCULATIONS
// ---------------------------------------------------------------------------

export function calculateCommandCenterSummary(
  allTrades: Trade[],
  timeRange: CommandCenterTimeRange,
  settings?: UserSettings
): CommandCenterSummary {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  // Today's trades specifically
  const tradesToday = allTrades.filter(t => t.date >= startOfToday);
  const closedToday = tradesToday.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  
  let todayPnl = 0;
  let hasClosedToday = closedToday.length > 0;
  
  closedToday.forEach(t => {
    if (typeof t.pnl === 'number' && !isNaN(t.pnl)) {
      todayPnl += t.pnl;
    }
  });

  const todayPnlFormatted = hasClosedToday
    ? `${todayPnl >= 0 ? '+' : ''}${formatCurrency(todayPnl)}`
    : tradesToday.length > 0
    ? 'Pending Trades'
    : 'No Trades Today';

  // Risk used today
  let riskUsedToday = 0;
  let riskUsedPercentTotal = 0;
  let riskPercentCount = 0;

  tradesToday.forEach(t => {
    if (typeof t.risk === 'number' && !isNaN(t.risk) && t.risk > 0) {
      riskUsedToday += t.risk;
    }
    if (typeof t.riskPercent === 'number' && !isNaN(t.riskPercent) && t.riskPercent > 0) {
      riskUsedPercentTotal += t.riskPercent;
      riskPercentCount++;
    }
  });

  const riskUsedTodayPercent = riskPercentCount > 0 ? riskUsedPercentTotal : null;

  // Streak (based on chronological order of closed trades)
  const sortedClosedAll = [...allTrades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => b.date - a.date); // newest first

  let streakType: 'WIN' | 'LOSS' | 'NONE' = 'NONE';
  let streakCount = 0;

  if (sortedClosedAll.length > 0) {
    const firstResult = sortedClosedAll[0].result;
    if (firstResult === 'WIN' || firstResult === 'LOSS') {
      streakType = firstResult;
      for (const t of sortedClosedAll) {
        if (t.result === streakType) {
          streakCount++;
        } else {
          break;
        }
      }
    }
  }

  const streakText = streakType === 'NONE' || streakCount === 0
    ? 'No Active Streak'
    : `${streakCount} ${streakType === 'WIN' ? 'Win' : 'Loss'}${streakCount > 1 ? 's' : ''}`;

  // Trades in the selected range for period-scoped metrics
  const rangeTrades = filterTradesByTimeRange(allTrades, timeRange);
  const closedInRange = rangeTrades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  // Average R
  let totalR = 0;
  let rCount = 0;
  closedInRange.forEach(t => {
    if (typeof t.rMultiple === 'number' && isFinite(t.rMultiple)) {
      totalR += t.rMultiple;
      rCount++;
    } else if (typeof t.risk === 'number' && t.risk > 0 && typeof t.pnl === 'number') {
      const calculatedR = t.pnl / t.risk;
      if (isFinite(calculatedR)) {
        totalR += calculatedR;
        rCount++;
      }
    }
  });

  const averageR = rCount > 0 ? totalR / rCount : null;
  const averageRFormatted = averageR !== null
    ? `${averageR >= 0 ? '+' : ''}${averageR.toFixed(2)}R`
    : closedInRange.length === 0
    ? 'No Data'
    : 'Insufficient Data';

  // Rule Adherence
  const adherenceTrades = rangeTrades.filter(t => typeof t.ruleAdherence === 'number' && !isNaN(t.ruleAdherence));
  let ruleAdherence: number | null = null;
  if (adherenceTrades.length > 0) {
    const sum = adherenceTrades.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0);
    ruleAdherence = Math.round(sum / adherenceTrades.length);
  }
  const ruleAdherenceFormatted = ruleAdherence !== null ? `${ruleAdherence}%` : 'No Data';

  // Psychology Completion
  let completedPsychCount = 0;
  rangeTrades.forEach(t => {
    const hasEmotions = Array.isArray(t.emotions) && t.emotions.length > 0;
    const hasConfidence = typeof t.confidence === 'number' && t.confidence > 0;
    const hasNotes = Boolean(t.notes && t.notes.trim().length > 0);
    const hasReflections = Boolean(t.learning || t.mistake || t.whatToRepeat || t.whatToAvoid);
    if (hasEmotions || hasConfidence || hasNotes || hasReflections) {
      completedPsychCount++;
    }
  });

  const psychologyCompletion = rangeTrades.length > 0
    ? Math.round((completedPsychCount / rangeTrades.length) * 100)
    : null;
  const psychologyCompletionFormatted = psychologyCompletion !== null ? `${psychologyCompletion}%` : 'No Data';

  return {
    todayPnl: hasClosedToday ? todayPnl : null,
    todayPnlFormatted,
    tradesTodayCount: tradesToday.length,
    riskUsedToday,
    riskUsedTodayPercent,
    currentStreak: {
      type: streakType,
      count: streakCount,
      text: streakText
    },
    averageR,
    averageRFormatted,
    ruleAdherence,
    ruleAdherenceFormatted,
    psychologyCompletion,
    psychologyCompletionFormatted,
    totalTradesInRange: rangeTrades.length,
    closedTradesInRange: closedInRange.length
  };
}

// ---------------------------------------------------------------------------
// 2. "WHAT NEEDS MY ATTENTION" PANEL
// ---------------------------------------------------------------------------

export function generateAttentionItems(
  trades: Trade[] = [],
  strategies: Strategy[] = [],
  rules: TradingRule[] = [],
  learnings: LearningEntry[] = [],
  settings?: UserSettings,
  windowSize: ComparisonWindowSize = 10
): AttentionItem[] {
  const items: AttentionItem[] = [];
  const safeTrades = Array.isArray(trades) ? trades.filter(t => t && typeof t.date === 'number') : [];
  const safeStrategies = Array.isArray(strategies) ? strategies.filter(Boolean) : [];
  const safeRules = Array.isArray(rules) ? rules.filter(Boolean) : [];
  const safeLearnings = Array.isArray(learnings) ? learnings.filter(Boolean) : [];

  const defaultRiskSetting = settings?.risk?.defaultRisk ?? 1.0;
  const sortedNewestFirst = [...safeTrades].sort((a, b) => b.date - a.date);

  // 1. Risk Above Configured Default
  const elevatedRiskTrades = sortedNewestFirst.filter(t => {
    if (typeof t.riskPercent === 'number' && t.riskPercent > (defaultRiskSetting * 1.25)) {
      return true;
    }
    return false;
  });

  if (elevatedRiskTrades.length > 0) {
    const sample = elevatedRiskTrades.slice(0, 5);
    const avgElevated = sample.reduce((acc, t) => acc + (t.riskPercent || 0), 0) / sample.length;
    items.push({
      id: 'elevated-risk-trades',
      title: 'Position Risk Exceeds Configured Default',
      explanation: `${elevatedRiskTrades.length} recorded trade${elevatedRiskTrades.length > 1 ? 's' : ''} exceeded your default risk target of ${defaultRiskSetting}%.`,
      whyText: `Your default risk is set to ${defaultRiskSetting}%. Recent flagged trade${sample.length > 1 ? 's' : ''} reached an average of ${avgElevated.toFixed(2)}% risk.`,
      severity: elevatedRiskTrades.length >= 3 ? 'critical' : 'warning',
      category: 'risk',
      sampleSize: elevatedRiskTrades.length,
      tradeIds: elevatedRiskTrades.map(t => t.id),
      metricComparison: {
        metricName: 'Position Risk',
        currentValue: `${avgElevated.toFixed(2)}%`,
        baselineValue: `${defaultRiskSetting}% default`
      },
      investigateAction: {
        type: 'trades',
        label: 'Inspect Elevated Risk Trades'
      }
    });
  }

  // 2. Increased Recent Risk (Last N vs Previous N)
  if (sortedNewestFirst.length >= windowSize * 2) {
    const recentBatch = sortedNewestFirst.slice(0, windowSize);
    const prevBatch = sortedNewestFirst.slice(windowSize, windowSize * 2);

    const getBatchAvgRisk = (batch: Trade[]) => {
      const withRisk = batch.filter(t => typeof t.riskPercent === 'number' && t.riskPercent > 0);
      if (withRisk.length === 0) return 0;
      return withRisk.reduce((acc, t) => acc + (t.riskPercent || 0), 0) / withRisk.length;
    };

    const recentRisk = getBatchAvgRisk(recentBatch);
    const prevRisk = getBatchAvgRisk(prevBatch);

    if (recentRisk > 0 && prevRisk > 0 && recentRisk >= prevRisk * 1.3 && (recentRisk - prevRisk) >= 0.3) {
      items.push({
        id: 'recent-risk-escalation',
        title: 'Recent Risk Sizing Drift Detected',
        explanation: `Risk allocation in your last ${windowSize} trades increased notably compared to the preceding ${windowSize} trades.`,
        whyText: `Last ${windowSize} trades averaged ${recentRisk.toFixed(2)}% risk. Previous ${windowSize} trades averaged ${prevRisk.toFixed(2)}% risk (a +${((recentRisk - prevRisk) / prevRisk * 100).toFixed(0)}% increase).`,
        severity: 'warning',
        category: 'risk',
        sampleSize: windowSize * 2,
        tradeIds: recentBatch.map(t => t.id),
        metricComparison: {
          metricName: 'Average Risk %',
          currentValue: `${recentRisk.toFixed(2)}% (Recent ${windowSize})`,
          baselineValue: `${prevRisk.toFixed(2)}% (Previous ${windowSize})`
        },
        investigateAction: {
          type: 'trades',
          label: `Compare Recent ${windowSize} Trades`
        }
      });
    }
  }

  // 3. Incomplete Psychology Records
  const incompletePsychTrades = sortedNewestFirst.filter(t => {
    const hasEmotions = Array.isArray(t.emotions) ? t.emotions.length > 0 : Boolean(t.emotions);
    const hasConfidence = typeof t.confidence === 'number' && t.confidence > 0;
    const hasNotes = Boolean(t.notes && typeof t.notes === 'string' && t.notes.trim().length > 0);
    return !hasEmotions && !hasConfidence && !hasNotes;
  });

  if (incompletePsychTrades.length >= 2) {
    items.push({
      id: 'incomplete-psychology',
      title: 'Incomplete Behavioral & Psychology Records',
      explanation: `${incompletePsychTrades.length} recorded trades have no emotional state, confidence rating, or post-trade notes.`,
      whyText: `Tracking emotions and confidence provides the evidence needed to diagnose FOMO, overtrading, and premature exits. Unlogged records reduce analytics precision.`,
      severity: incompletePsychTrades.length > 5 ? 'warning' : 'notice',
      category: 'psychology',
      sampleSize: incompletePsychTrades.length,
      tradeIds: incompletePsychTrades.map(t => t.id),
      investigateAction: {
        type: 'psychology',
        route: '/psychology',
        label: 'Log Psychology in Workspace'
      }
    });
  }

  // 4. Low Strategy Sample Size
  safeStrategies.forEach(st => {
    if (st.status === 'Active' && st.name) {
      const matchingTrades = safeTrades.filter(t => t.strategy?.toLowerCase() === st.name?.toLowerCase());
      if (matchingTrades.length < 10) {
        items.push({
          id: `low-sample-strategy-${st.id}`,
          title: `Low Sample Size: Strategy "${st.name}"`,
          explanation: `"${st.name}" currently has only ${matchingTrades.length} recorded trade${matchingTrades.length === 1 ? '' : 's'}.`,
          whyText: `Strategies with fewer than 10 trades have high variance. Conclusions regarding edge, win rate, or profitability remain preliminary until sample reaches 20+ trades.`,
          severity: 'notice',
          category: 'strategy',
          sampleSize: matchingTrades.length,
          strategyId: st.id,
          tradeIds: matchingTrades.map(t => t.id),
          investigateAction: {
            type: 'strategy',
            targetId: st.id,
            route: `/strategies/${st.id}`,
            label: `Inspect "${st.name}"`
          }
        });
      }
    }
  });

  // 5. Reduced Rule Adherence (Recent N vs Baseline)
  if (sortedNewestFirst.length >= 6) {
    const sampleCount = Math.min(windowSize, Math.floor(sortedNewestFirst.length / 2));
    const recentSubset = sortedNewestFirst.slice(0, sampleCount);
    const prevSubset = sortedNewestFirst.slice(sampleCount, sampleCount * 2);

    const getAvgAdherence = (list: Trade[]) => {
      const valid = list.filter(t => typeof t.ruleAdherence === 'number' && !isNaN(t.ruleAdherence));
      if (valid.length === 0) return null;
      return valid.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0) / valid.length;
    };

    const recentAdh = getAvgAdherence(recentSubset);
    const prevAdh = getAvgAdherence(prevSubset);

    if (recentAdh !== null && prevAdh !== null && (prevAdh - recentAdh) >= 15) {
      items.push({
        id: 'reduced-rule-adherence',
        title: 'Rule Adherence Drop in Recent Session(s)',
        explanation: `Rule compliance in the latest ${sampleCount} trades dropped by ${Math.round(prevAdh - recentAdh)}% relative to earlier trades.`,
        whyText: `Latest ${sampleCount} trades recorded an average adherence of ${Math.round(recentAdh)}%, down from ${Math.round(prevAdh)}% previously.`,
        severity: recentAdh < 60 ? 'critical' : 'warning',
        category: 'rules',
        sampleSize: sampleCount * 2,
        tradeIds: recentSubset.map(t => t.id),
        metricComparison: {
          metricName: 'Rule Adherence',
          currentValue: `${Math.round(recentAdh)}% (Recent ${sampleCount})`,
          baselineValue: `${Math.round(prevAdh)}% (Previous ${sampleCount})`
        },
        investigateAction: {
          type: 'rules',
          route: '/learning-rules?tab=rules',
          label: 'Review Active Rules Checklist'
        }
      });
    }
  }

  // 6. Repeated Re-Entry Patterns
  const reentryTrades = sortedNewestFirst.filter(t => t.isReentry || (typeof t.reentryReason === 'string' && t.reentryReason.trim().length > 0));
  if (reentryTrades.length >= 2) {
    const losses = reentryTrades.filter(t => t.result === 'LOSS').length;
    items.push({
      id: 'reentry-frequency',
      title: 'Repeated Re-Entry Behavior Logged',
      explanation: `${reentryTrades.length} trades are tagged as re-entries following an initial stop-out or missed move.`,
      whyText: `${losses} of ${reentryTrades.length} flagged re-entries resulted in recorded losses. Rapid re-entries often correlate with emotional frustration or chasing.`,
      severity: losses >= 2 ? 'warning' : 'notice',
      category: 'behavior',
      sampleSize: reentryTrades.length,
      tradeIds: reentryTrades.map(t => t.id),
      investigateAction: {
        type: 'trades',
        label: 'Inspect Re-Entry Trades'
      }
    });
  }

  // 7. Possible FOMO Patterns
  const fomoTrades = sortedNewestFirst.filter(t => hasEmotion(t, 'FOMO'));
  if (fomoTrades.length >= 2) {
    const closedFomo = fomoTrades.filter(t => t.result === 'WIN' || t.result === 'LOSS');
    const fomoLosses = closedFomo.filter(t => t.result === 'LOSS').length;
    items.push({
      id: 'fomo-frequency-pattern',
      title: 'FOMO Tagged in Multiple Recent Trades',
      explanation: `${fomoTrades.length} trades were recorded with "FOMO" emotional state during execution.`,
      whyText: `Historical data shows ${fomoLosses} of ${closedFomo.length || fomoTrades.length} closed FOMO trades closed at a loss. FOMO entries typically suffer from extended entry prices and poor R:R.`,
      severity: fomoLosses >= 2 ? 'warning' : 'notice',
      category: 'psychology',
      sampleSize: fomoTrades.length,
      tradeIds: fomoTrades.map(t => t.id),
      investigateAction: {
        type: 'psychology',
        route: '/psychology',
        label: 'Open Psychology Emotion Breakdown'
      }
    });
  }

  // 8. Possible Revenge Trading Patterns
  const revengeTrades = sortedNewestFirst.filter(t => hasEmotion(t, 'Revenge'));
  if (revengeTrades.length >= 1) {
    items.push({
      id: 'revenge-pattern-flagged',
      title: 'Revenge Trading Emotion Logged',
      explanation: `${revengeTrades.length} trade${revengeTrades.length > 1 ? 's' : ''} explicitly logged a "Revenge" emotional state.`,
      whyText: `Revenge trading represents attempt to recover prior losses immediately, violating planned risk controls and execution criteria.`,
      severity: 'critical',
      category: 'behavior',
      sampleSize: revengeTrades.length,
      tradeIds: revengeTrades.map(t => t.id),
      investigateAction: {
        type: 'trades',
        label: 'Inspect Flagged Revenge Trades'
      }
    });
  }

  // 9. Missing Data Affecting Analytics
  const missingDataTrades = sortedNewestFirst.filter(t => {
    const missingStopLoss = !t.stopLoss || Number(t.stopLoss) <= 0;
    const missingSession = !t.session || t.session === '';
    const missingDirection = !t.direction;
    return missingStopLoss || missingSession || missingDirection;
  });

  if (missingDataTrades.length >= 2) {
    items.push({
      id: 'missing-trade-fields',
      title: 'Incomplete Trade Parameters Affecting Analytics',
      explanation: `${missingDataTrades.length} trades are missing stop loss prices or session classifications.`,
      whyText: `Missing stop loss prevents accurate R multiple calculation; missing session classifications prevents accurate session win rate and drawdown attribution.`,
      severity: 'notice',
      category: 'data_quality',
      sampleSize: missingDataTrades.length,
      tradeIds: missingDataTrades.map(t => t.id),
      investigateAction: {
        type: 'trades',
        label: 'Inspect Incomplete Trades'
      }
    });
  }

  // 10. Large Change in Recent Performance Metrics (Win Rate or Avg R)
  if (sortedNewestFirst.length >= windowSize * 2) {
    const recentClosed = sortedNewestFirst.slice(0, windowSize).filter(t => t.result === 'WIN' || t.result === 'LOSS');
    const prevClosed = sortedNewestFirst.slice(windowSize, windowSize * 2).filter(t => t.result === 'WIN' || t.result === 'LOSS');

    if (recentClosed.length >= 4 && prevClosed.length >= 4) {
      const recentWinRate = (recentClosed.filter(t => t.result === 'WIN').length / recentClosed.length) * 100;
      const prevWinRate = (prevClosed.filter(t => t.result === 'WIN').length / prevClosed.length) * 100;

      if ((prevWinRate - recentWinRate) >= 30) {
        items.push({
          id: 'performance-drawdown-shift',
          title: 'Recent Win Rate Contraction',
          explanation: `Win rate over the last ${recentClosed.length} closed trades is ${Math.round(recentWinRate)}%, compared to ${Math.round(prevWinRate)}% in the previous ${prevClosed.length} trades.`,
          whyText: `Last ${recentClosed.length} trades produced ${recentClosed.filter(t => t.result === 'WIN').length} wins out of ${recentClosed.length}. Previous cohort had ${prevClosed.filter(t => t.result === 'WIN').length} wins out of ${prevClosed.length}.`,
          severity: 'warning',
          category: 'performance',
          sampleSize: recentClosed.length + prevClosed.length,
          tradeIds: recentClosed.map(t => t.id),
          metricComparison: {
            metricName: 'Win Rate',
            currentValue: `${Math.round(recentWinRate)}% (Recent ${recentClosed.length})`,
            baselineValue: `${Math.round(prevWinRate)}% (Previous ${prevClosed.length})`
          },
          investigateAction: {
            type: 'ai_labs',
            route: '/ai-labs?tab=analyst',
            label: 'Run AI Period Comparison'
          }
        });
      }
    }
  }

  return items;
}

// ---------------------------------------------------------------------------
// 3. CURRENT TRADING STATE (LAST N vs PREVIOUS N)
// ---------------------------------------------------------------------------

export function calculateCurrentTradingState(
  trades: Trade[] = [],
  windowSize: ComparisonWindowSize = 10
): CurrentTradingState {
  const safeTrades = Array.isArray(trades) ? trades.filter(t => t && typeof t.date === 'number') : [];
  const sorted = [...safeTrades].sort((a, b) => b.date - a.date);
  const recentTrades = sorted.slice(0, windowSize);
  const previousTrades = sorted.slice(windowSize, windowSize * 2);

  const metrics: CurrentTradingStateMetric[] = [];

  // 1. Recent Risk
  const getAvgRisk = (list: Trade[]) => {
    const valid = list.filter(t => typeof t.riskPercent === 'number' && t.riskPercent > 0);
    return valid.length > 0 ? valid.reduce((acc, t) => acc + (t.riskPercent || 0), 0) / valid.length : 0;
  };
  const recentRisk = getAvgRisk(recentTrades);
  const prevRisk = getAvgRisk(previousTrades);

  let riskState: 'elevated' | 'normal' | 'reduced' = 'normal';
  let riskBadge: 'warning' | 'info' | 'success' | 'neutral' | 'danger' = 'neutral';
  let riskBadgeText = 'Normal';

  if (recentRisk > 0 && prevRisk > 0) {
    if (recentRisk >= prevRisk * 1.25) {
      riskState = 'elevated';
      riskBadge = 'warning';
      riskBadgeText = 'Elevated';
    } else if (recentRisk <= prevRisk * 0.75) {
      riskState = 'reduced';
      riskBadge = 'info';
      riskBadgeText = 'Reduced';
    }
  }

  metrics.push({
    key: 'risk',
    label: 'Recent Risk Sizing',
    state: riskState,
    badgeText: riskBadgeText,
    badgeVariant: riskBadge,
    currentValueFormatted: recentRisk > 0 ? `${recentRisk.toFixed(2)}%` : 'No Data',
    previousValueFormatted: prevRisk > 0 ? `${prevRisk.toFixed(2)}%` : 'No Data',
    deltaFormatted: recentRisk > 0 && prevRisk > 0 
      ? `${recentRisk >= prevRisk ? '+' : ''}${(recentRisk - prevRisk).toFixed(2)}%` 
      : '—',
    observationNote: recentRisk > 0 && prevRisk > 0
      ? `Recent recorded activity shows average risk at ${recentRisk.toFixed(2)}% compared with ${prevRisk.toFixed(2)}% in the previous cohort.`
      : 'Recent recorded activity does not yet have enough position size data to establish a comparison.',
    sampleTrades: recentTrades
  });

  // 2. Recent Rule Adherence
  const getAvgAdh = (list: Trade[]) => {
    const valid = list.filter(t => typeof t.ruleAdherence === 'number' && !isNaN(t.ruleAdherence));
    return valid.length > 0 ? Math.round(valid.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0) / valid.length) : null;
  };
  const recentAdh = getAvgAdh(recentTrades);
  const prevAdh = getAvgAdh(previousTrades);

  let adhState: 'improved' | 'declined' | 'stable' = 'stable';
  let adhBadge: 'warning' | 'info' | 'success' | 'neutral' | 'danger' = 'neutral';
  let adhBadgeText = 'Stable';

  if (recentAdh !== null && prevAdh !== null) {
    if (recentAdh >= prevAdh + 10) {
      adhState = 'improved';
      adhBadge = 'success';
      adhBadgeText = 'Higher';
    } else if (recentAdh <= prevAdh - 10) {
      adhState = 'declined';
      adhBadge = 'warning';
      adhBadgeText = 'Lower';
    }
  }

  metrics.push({
    key: 'adherence',
    label: 'Recent Rule Adherence',
    state: adhState,
    badgeText: adhBadgeText,
    badgeVariant: adhBadge,
    currentValueFormatted: recentAdh !== null ? `${recentAdh}%` : 'No Data',
    previousValueFormatted: prevAdh !== null ? `${prevAdh}%` : 'No Data',
    deltaFormatted: recentAdh !== null && prevAdh !== null 
      ? `${recentAdh >= prevAdh ? '+' : ''}${recentAdh - prevAdh}%` 
      : '—',
    observationNote: recentAdh !== null && prevAdh !== null
      ? `Recent recorded activity shows rule adherence at ${recentAdh}% compared with ${prevAdh}% in the preceding window.`
      : 'Rule adherence tracking is currently incomplete across the comparison period.',
    sampleTrades: recentTrades
  });

  // 3. Recent FOMO Frequency
  const getFomoRate = (list: Trade[]) => {
    if (list.length === 0) return 0;
    const count = list.filter(t => hasEmotion(t, 'FOMO')).length;
    return Math.round((count / list.length) * 100);
  };
  const recentFomo = getFomoRate(recentTrades);
  const prevFomo = getFomoRate(previousTrades);

  let fomoState: 'elevated' | 'normal' | 'reduced' = 'normal';
  let fomoBadge: 'warning' | 'info' | 'success' | 'neutral' | 'danger' = 'neutral';
  let fomoBadgeText = 'None / Low';

  if (recentFomo > prevFomo && recentFomo >= 20) {
    fomoState = 'elevated';
    fomoBadge = 'danger';
    fomoBadgeText = 'Higher';
  } else if (recentFomo === 0 && prevFomo > 0) {
    fomoState = 'reduced';
    fomoBadge = 'success';
    fomoBadgeText = 'Eliminated';
  } else if (recentFomo > 0) {
    fomoBadgeText = `${recentFomo}% Tagged`;
  }

  metrics.push({
    key: 'fomo',
    label: 'Recent FOMO Frequency',
    state: fomoState,
    badgeText: fomoBadgeText,
    badgeVariant: fomoBadge,
    currentValueFormatted: recentTrades.length > 0 ? `${recentFomo}%` : 'No Data',
    previousValueFormatted: previousTrades.length > 0 ? `${prevFomo}%` : 'No Data',
    deltaFormatted: recentTrades.length > 0 && previousTrades.length > 0
      ? `${recentFomo >= prevFomo ? '+' : ''}${recentFomo - prevFomo}%`
      : '—',
    observationNote: recentTrades.length > 0
      ? `Recent recorded activity shows FOMO tagged on ${recentFomo}% of trades vs ${prevFomo}% previously.`
      : 'Insufficient trade records to calculate behavioral frequency.',
    sampleTrades: recentTrades
  });

  // 4. Recent Avg R
  const getAvgR = (list: Trade[]) => {
    const closed = list.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
    if (closed.length === 0) return null;
    let total = 0;
    let c = 0;
    closed.forEach(t => {
      if (typeof t.rMultiple === 'number' && isFinite(t.rMultiple)) {
        total += t.rMultiple;
        c++;
      } else if (t.risk && t.risk > 0 && typeof t.pnl === 'number') {
        total += (t.pnl / t.risk);
        c++;
      }
    });
    return c > 0 ? total / c : null;
  };
  const recentR = getAvgR(recentTrades);
  const prevR = getAvgR(previousTrades);

  let rState: 'improved' | 'declined' | 'stable' = 'stable';
  let rBadge: 'warning' | 'info' | 'success' | 'neutral' | 'danger' = 'neutral';
  let rBadgeText = 'Stable';

  if (recentR !== null && prevR !== null) {
    if (recentR >= prevR + 0.3) {
      rState = 'improved';
      rBadge = 'success';
      rBadgeText = 'Higher';
    } else if (recentR <= prevR - 0.3) {
      rState = 'declined';
      rBadge = 'warning';
      rBadgeText = 'Lower';
    }
  }

  metrics.push({
    key: 'avg_r',
    label: 'Recent Avg R Multiple',
    state: rState,
    badgeText: rBadgeText,
    badgeVariant: rBadge,
    currentValueFormatted: recentR !== null ? `${recentR >= 0 ? '+' : ''}${recentR.toFixed(2)}R` : 'No Data',
    previousValueFormatted: prevR !== null ? `${prevR >= 0 ? '+' : ''}${prevR.toFixed(2)}R` : 'No Data',
    deltaFormatted: recentR !== null && prevR !== null
      ? `${recentR >= prevR ? '+' : ''}${(recentR - prevR).toFixed(2)}R`
      : '—',
    observationNote: recentR !== null && prevR !== null
      ? `Recent recorded activity shows average realized return at ${recentR.toFixed(2)}R compared with ${prevR.toFixed(2)}R previously.`
      : 'No closed trades in comparison window.',
    sampleTrades: recentTrades
  });

  return {
    windowSize,
    recentTradesCount: recentTrades.length,
    previousTradesCount: previousTrades.length,
    metrics,
    recentTradeIds: recentTrades.map(t => t.id),
    previousTradeIds: previousTrades.map(t => t.id)
  };
}

// ---------------------------------------------------------------------------
// 4. RECENT ACTIVITY TIMELINE
// ---------------------------------------------------------------------------

export function generateRecentActivityTimeline(
  trades: Trade[] = [],
  strategies: Strategy[] = [],
  learnings: LearningEntry[] = [],
  rules: TradingRule[] = []
): RecentActivityEvent[] {
  const safeTrades = Array.isArray(trades) ? trades.filter(Boolean) : [];
  const safeStrategies = Array.isArray(strategies) ? strategies.filter(Boolean) : [];
  const safeLearnings = Array.isArray(learnings) ? learnings.filter(Boolean) : [];
  const safeRules = Array.isArray(rules) ? rules.filter(Boolean) : [];

  const events: RecentActivityEvent[] = [];

  // Trades
  safeTrades.forEach(t => {
    const timestamp = t.updatedAt || t.createdAt || t.date || Date.now();
    const isWin = t.result === 'WIN';
    const isLoss = t.result === 'LOSS';
    const resultLabel = t.result ? ` (${t.result})` : '';

    events.push({
      id: `trade-${t.id}-${timestamp}`,
      type: t.updatedAt && t.updatedAt > (t.createdAt || 0) + 60000 ? 'trade_edited' : 'trade_added',
      title: `${t.direction || 'Trade'} ${t.market || ''}${resultLabel}`,
      description: `Strategy: ${t.strategy || 'Unassigned'} • Risk: ${t.riskPercent ? t.riskPercent + '%' : formatCurrency(t.risk || 0)} • Session: ${t.session || 'N/A'}`,
      timestamp,
      recordId: t.id || '',
      route: `/journal`,
      badgeText: t.result || 'TRADE',
      badgeColor: isWin ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : isLoss ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
    });

    // If trade has psychology notes/emotions updated
    const emotionsList = Array.isArray(t.emotions) 
      ? t.emotions.filter(Boolean).join(', ') 
      : typeof t.emotions === 'string' 
      ? t.emotions 
      : '';

    if (emotionsList || t.confidence) {
      events.push({
        id: `psych-${t.id}-${timestamp}`,
        type: 'psychology_updated',
        title: emotionsList ? `Psychology: ${emotionsList}` : `Psychology: Confidence ${t.confidence}/10`,
        description: `Confidence: ${t.confidence ? t.confidence + '/10' : 'N/A'} • Adherence: ${t.ruleAdherence !== undefined ? t.ruleAdherence + '%' : 'N/A'} on ${t.market || 'trade'}`,
        timestamp: timestamp + 50,
        recordId: t.id || '',
        route: `/psychology`,
        badgeText: 'PSYCHOLOGY',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
      });
    }
  });

  // Learnings
  safeLearnings.forEach(l => {
    const timestamp = l.updatedAt || l.createdAt || l.date || Date.now();
    const content = typeof l.content === 'string' ? l.content : '';
    events.push({
      id: `learning-${l.id || timestamp}`,
      type: 'learning_saved',
      title: `Learning: ${l.category || 'General'}`,
      description: content.length > 90 ? `${content.slice(0, 90)}...` : content || 'Recorded learning insight',
      timestamp,
      recordId: l.id || '',
      route: `/learning-rules?tab=learning`,
      badgeText: 'LEARNING',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
    });
  });

  // Rules
  safeRules.forEach(r => {
    const timestamp = r.updatedAt || r.createdAt || Date.now();
    const isUpdate = r.updatedAt && r.updatedAt > (r.createdAt || 0) + 60000;
    const text = typeof r.text === 'string' ? r.text : '';
    events.push({
      id: `rule-${r.id || timestamp}-${timestamp}`,
      type: isUpdate ? 'rule_updated' : 'rule_created',
      title: isUpdate ? `Rule Updated: ${r.priority || 'Rule'}` : `Rule Created: ${r.priority || 'Rule'}`,
      description: text.length > 90 ? `${text.slice(0, 90)}...` : text || 'Recorded rule checklist',
      timestamp,
      recordId: r.id || '',
      route: `/learning-rules?tab=rules`,
      badgeText: 'RULE',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
    });
  });

  // Strategies
  safeStrategies.forEach(s => {
    const timestamp = s.updatedAt || s.createdAt || Date.now();
    events.push({
      id: `strategy-${s.id || timestamp}-${timestamp}`,
      type: 'strategy_updated',
      title: `Strategy: ${s.name || 'Strategy'}`,
      description: s.shortDescription || `Checklist: ${s.checklist?.length || 0} items • Risk: ${s.riskRules?.defaultRisk || 1}%`,
      timestamp,
      recordId: s.id || '',
      route: `/strategies/${s.id}`,
      badgeText: 'STRATEGY',
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300'
    });
  });

  // Sort newest first
  return events.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 25);
}

// ---------------------------------------------------------------------------
// 5. QUICK INVESTIGATION (SEARCH & FILTER ENGINE)
// ---------------------------------------------------------------------------

export function searchAndInvestigate(
  queryRaw: string = '',
  trades: Trade[] = [],
  strategies: Strategy[] = [],
  rules: TradingRule[] = [],
  learnings: LearningEntry[] = [],
  settings?: UserSettings
): InvestigationResult {
  const query = (queryRaw || '').trim().toLowerCase();
  
  const result: InvestigationResult = {
    query: queryRaw || '',
    matchedTrades: [],
    matchedStrategies: [],
    matchedRules: [],
    matchedLearnings: [],
    summaryMessage: '',
    isInsufficient: false,
    filtersApplied: {}
  };

  if (!query) {
    result.summaryMessage = 'Please enter an investigation query, such as "FOMO trades" or "XAU/USD London".';
    return result;
  }

  const safeTrades = Array.isArray(trades) ? trades.filter(Boolean) : [];
  const safeStrategies = Array.isArray(strategies) ? strategies.filter(Boolean) : [];
  const safeRules = Array.isArray(rules) ? rules.filter(Boolean) : [];
  const safeLearnings = Array.isArray(learnings) ? learnings.filter(Boolean) : [];

  // Detect explicit patterns in natural language query
  // Example 1: "last 10 XAU/USD London trades"
  const limitMatch = query.match(/last\s+(\d+)/i) || query.match(/(\d+)\s+trades/i);
  const limit = limitMatch ? parseInt(limitMatch[1], 10) : undefined;
  if (limit) result.filtersApplied.limit = limit;

  // Market detection
  const commonMarkets = ['xau/usd', 'btc/usd', 'eth/usd', 'eur/usd', 'gbp/usd', 'jpy/usd', 'nasdaq', 'us30', 'spx'];
  let matchedMarket: string | undefined;
  for (const m of commonMarkets) {
    if (query.includes(m)) {
      matchedMarket = m;
      break;
    }
  }
  if (matchedMarket) result.filtersApplied.market = matchedMarket.toUpperCase();

  // Session detection
  let matchedSession: string | undefined;
  if (query.includes('london')) matchedSession = 'London';
  else if (query.includes('new york') || query.includes('ny')) matchedSession = 'New York';
  else if (query.includes('asian') || query.includes('asia') || query.includes('tokyo')) matchedSession = 'Asian';
  if (matchedSession) result.filtersApplied.session = matchedSession;

  // Emotion detection
  const commonEmotions = ['fomo', 'revenge', 'fear', 'greed', 'calm', 'hesitant', 'impatient', 'confident'];
  let matchedEmotion: string | undefined;
  for (const emo of commonEmotions) {
    if (query.includes(emo)) {
      matchedEmotion = emo.charAt(0).toUpperCase() + emo.slice(1);
      break;
    }
  }
  if (matchedEmotion) result.filtersApplied.emotion = matchedEmotion;

  // Direction detection
  if (query.includes('buy') || query.includes('long')) result.filtersApplied.direction = 'BUY';
  else if (query.includes('sell') || query.includes('short')) result.filtersApplied.direction = 'SELL';

  // Risk condition detection
  const riskMatch = query.match(/risk\s*(?:>|exceeded|over|above)\s*(\d+(?:\.\d+)?)/i);
  let riskThreshold: number | undefined;
  if (riskMatch) {
    riskThreshold = parseFloat(riskMatch[1]);
    result.filtersApplied.riskCondition = `>${riskThreshold}%`;
  } else if (query.includes('risk > default') || query.includes('risk above default')) {
    riskThreshold = settings?.risk?.defaultRisk ?? 1.0;
    result.filtersApplied.riskCondition = `>${riskThreshold}% (default)`;
  }

  // Incomplete psychology check
  const checkIncompletePsych = query.includes('incomplete psych') || query.includes('missing psych') || query.includes('without psych');

  // Filter Trades
  let filteredTrades = [...safeTrades];

  if (matchedMarket) {
    filteredTrades = filteredTrades.filter(t => t.market && t.market.toLowerCase().includes(matchedMarket!.toLowerCase()));
  }

  if (matchedSession) {
    filteredTrades = filteredTrades.filter(t => t.session && t.session.toLowerCase() === matchedSession!.toLowerCase());
  }

  if (matchedEmotion) {
    filteredTrades = filteredTrades.filter(t => hasEmotion(t, matchedEmotion!));
  }

  if (result.filtersApplied.direction) {
    filteredTrades = filteredTrades.filter(t => t.direction === result.filtersApplied.direction);
  }

  if (riskThreshold !== undefined) {
    filteredTrades = filteredTrades.filter(t => (t.riskPercent || 0) > riskThreshold!);
  }

  if (checkIncompletePsych) {
    filteredTrades = filteredTrades.filter(t => {
      const hasEmotions = Array.isArray(t.emotions) ? t.emotions.length > 0 : Boolean(t.emotions);
      const hasConfidence = typeof t.confidence === 'number' && t.confidence > 0;
      const hasNotes = Boolean(t.notes && typeof t.notes === 'string' && t.notes.trim().length > 0);
      return !hasEmotions && !hasConfidence && !hasNotes;
    });
  }

  // Result filter (e.g. "losing", "winning")
  if (query.includes('loss') || query.includes('losing')) {
    filteredTrades = filteredTrades.filter(t => t.result === 'LOSS');
  } else if (query.includes('win') || query.includes('winning')) {
    filteredTrades = filteredTrades.filter(t => t.result === 'WIN');
  }

  // Free text search if no specific tags matched
  if (!matchedMarket && !matchedSession && !matchedEmotion && !result.filtersApplied.direction && riskThreshold === undefined && !checkIncompletePsych) {
    const terms = query.split(/\s+/).filter(t => t.length > 2);
    filteredTrades = filteredTrades.filter(t => {
      const emotionsStr = Array.isArray(t.emotions) ? t.emotions.join(' ') : (typeof t.emotions === 'string' ? t.emotions : '');
      const str = `${t.market || ''} ${t.strategy || ''} ${t.session || ''} ${t.notes || ''} ${emotionsStr}`.toLowerCase();
      return terms.some(term => str.includes(term));
    });
  }

  // Sort newest first
  filteredTrades.sort((a, b) => (b.date || 0) - (a.date || 0));

  // Apply limit
  if (limit && limit > 0) {
    filteredTrades = filteredTrades.slice(0, limit);
  }

  result.matchedTrades = filteredTrades;

  // Matched Strategies
  result.matchedStrategies = safeStrategies.filter(s => 
    (s.name && s.name.toLowerCase().includes(query)) || 
    (s.shortDescription && typeof s.shortDescription === 'string' && s.shortDescription.toLowerCase().includes(query))
  );

  // Matched Rules
  result.matchedRules = safeRules.filter(r => 
    (r.text && typeof r.text === 'string' && r.text.toLowerCase().includes(query)) || 
    (r.category && typeof r.category === 'string' && r.category.toLowerCase().includes(query))
  );

  // Matched Learnings
  result.matchedLearnings = safeLearnings.filter(l => 
    (l.content && typeof l.content === 'string' && l.content.toLowerCase().includes(query)) || 
    (l.category && typeof l.category === 'string' && l.category.toLowerCase().includes(query)) ||
    (Array.isArray(l.tags) && l.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(query)))
  );

  const totalHits = result.matchedTrades.length + result.matchedStrategies.length + result.matchedRules.length + result.matchedLearnings.length;

  if (totalHits === 0) {
    result.isInsufficient = true;
    result.summaryMessage = `No recorded data matches "${queryRaw}". Verify that the criteria match your recorded journal entries.`;
  } else {
    result.summaryMessage = `Found ${result.matchedTrades.length} trade${result.matchedTrades.length === 1 ? '' : 's'}${result.matchedStrategies.length > 0 ? `, ${result.matchedStrategies.length} strategies` : ''}${result.matchedRules.length > 0 ? `, ${result.matchedRules.length} rules` : ''}${result.matchedLearnings.length > 0 ? `, ${result.matchedLearnings.length} learnings` : ''} matching your investigation query.`;
  }

  return result;
}
