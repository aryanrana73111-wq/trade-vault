import { Trade } from '@/types';
import { calculateTradeMetrics } from './calculations';

export interface EmotionStats {
  emotion: string;
  count: number;
  winRate: number;
  avgR: number;
  netPnl: number;
  avgRuleAdherence: number;
}

export function calculatePsychologyScore(trades: Trade[]): { score: number, breakdown: any } {
  if (trades.length === 0) return { score: 0, breakdown: {} };

  // Rule Adherence
  const tradesWithRules = trades.filter(t => t.ruleAdherence !== undefined);
  const avgRuleAdherence = tradesWithRules.length > 0 
    ? tradesWithRules.reduce((sum, t) => sum + (t.ruleAdherence || 0), 0) / tradesWithRules.length 
    : 100; // default to 100 if no checklist

  // Risk Discipline (how often risk stays near average or doesn't spike)
  let riskDiscipline = 100;
  const risks = trades.filter(t => (t.risk || 0) > 0).map(t => t.risk);
  if (risks.length > 1) {
    const avgRisk = risks.reduce((a, b) => a + b, 0) / risks.length;
    const deviations = risks.filter(r => r > avgRisk * 1.5).length;
    riskDiscipline = Math.max(0, 100 - (deviations / risks.length) * 100 * 2);
  }

  // FOMO & Revenge Control
  const fomoTrades = trades.filter(t => t.emotions.includes('FOMO')).length;
  const revengeTrades = trades.filter(t => t.emotions.includes('Revenge')).length;
  
  const fomoControl = Math.max(0, 100 - (fomoTrades / trades.length) * 100 * 3);
  const revengeControl = Math.max(0, 100 - (revengeTrades / trades.length) * 100 * 4);

  // Negative Emotions
  const negativeEmotions = ['Fear', 'Greed', 'Frustrated', 'Impatient'];
  const negativeTrades = trades.filter(t => t.emotions.some(e => negativeEmotions.includes(e))).length;
  const emotionalStability = Math.max(0, 100 - (negativeTrades / trades.length) * 100 * 2);

  const score = Math.round(
    (avgRuleAdherence * 0.3) + 
    (riskDiscipline * 0.25) + 
    (fomoControl * 0.15) + 
    (revengeControl * 0.2) + 
    (emotionalStability * 0.1)
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      ruleAdherence: Math.round(avgRuleAdherence),
      riskDiscipline: Math.round(riskDiscipline),
      fomoControl: Math.round(fomoControl),
      revengeControl: Math.round(revengeControl),
      emotionalStability: Math.round(emotionalStability)
    }
  };
}

export function analyzeEmotions(trades: Trade[]): EmotionStats[] {
  const emotionMap = new Map<string, Trade[]>();

  trades.forEach(trade => {
    let ems = trade.emotions && trade.emotions.length > 0 ? trade.emotions : ['Unrecorded'];
    ems.forEach(em => {
      if (!emotionMap.has(em)) emotionMap.set(em, []);
      emotionMap.get(em)!.push(trade);
    });
  });

  const stats: EmotionStats[] = [];

  emotionMap.forEach((emTrades, emotion) => {
    const finishedTrades = emTrades.filter(t => t.result === 'WIN' || t.result === 'LOSS');
    const wins = finishedTrades.filter(t => t.result === 'WIN').length;
    const winRate = finishedTrades.length > 0 ? (wins / finishedTrades.length) * 100 : 0;
    
    let totalR = 0;
    let rTradesCount = 0;
    let netPnl = 0;
    
    let totalAdherence = 0;
    let adherenceCount = 0;

    emTrades.forEach(t => {
      if (t.rMultiple !== undefined) {
        totalR += t.rMultiple;
        rTradesCount++;
      }
      if (t.pnl) netPnl += t.pnl;
      if (t.ruleAdherence !== undefined) {
        totalAdherence += t.ruleAdherence;
        adherenceCount++;
      }
    });

    stats.push({
      emotion,
      count: emTrades.length,
      winRate: Math.round(winRate),
      avgR: rTradesCount > 0 ? +(totalR / rTradesCount).toFixed(2) : 0,
      netPnl,
      avgRuleAdherence: adherenceCount > 0 ? Math.round(totalAdherence / adherenceCount) : 100
    });
  });

  return stats.sort((a, b) => b.count - a.count);
}

export function analyzeRuleAdherence(trades: Trade[]) {
  const withAdherence = trades.filter(t => t.ruleAdherence !== undefined && (t.result === 'WIN' || t.result === 'LOSS'));
  
  const followed = withAdherence.filter(t => t.ruleAdherence! >= 90);
  const broken = withAdherence.filter(t => t.ruleAdherence! < 90);

  const calcStats = (arr: Trade[]) => {
    const wins = arr.filter(t => t.result === 'WIN').length;
    const winRate = arr.length > 0 ? (wins / arr.length) * 100 : 0;
    let totalR = 0; let rCount = 0;
    arr.forEach(t => { if (t.rMultiple !== undefined) { totalR += t.rMultiple; rCount++; } });
    return {
      count: arr.length,
      winRate: Math.round(winRate),
      avgR: rCount > 0 ? +(totalR / rCount).toFixed(2) : 0
    };
  };

  return {
    followed: calcStats(followed),
    broken: calcStats(broken)
  };
}

export function detectRevengeTrades(trades: Trade[]) {
  // Sort trades by date + time
  const sorted = [...trades].sort((a, b) => a.date - b.date);
  
  const revengeSequences = [];
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const t1 = sorted[i];
    const t2 = sorted[i+1];
    
    if (t1.result === 'LOSS') {
      const timeDiff = t2.date - t1.date; // assuming date is exact timestamp, but date is just the day + time.
      const minutesDiff = timeDiff / (1000 * 60);
      
      // If next trade is within 60 minutes
      if (minutesDiff > 0 && minutesDiff <= 60) {
        let isRevenge = false;
        if (t2.emotions.includes('Revenge')) isRevenge = true;
        if (t2.risk > t1.risk * 1.2) isRevenge = true; // Risk increased by 20%
        if (t1.market === t2.market && minutesDiff <= 30) isRevenge = true;
        
        if (isRevenge) {
          revengeSequences.push({
            lossTrade: t1,
            revengeTrade: t2,
            minutesDiff: Math.round(minutesDiff),
            riskIncrease: t2.risk > t1.risk ? Math.round(((t2.risk - t1.risk) / t1.risk) * 100) : 0
          });
        }
      }
    }
  }
  
  return revengeSequences;
}

export function detectRiskEscalation(trades: Trade[]) {
  // Look for streaks of wins, followed by an increase in risk
  const sorted = [...trades].sort((a, b) => a.date - b.date);
  
  let winStreak = 0;
  const escalations = [];
  
  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    if (t.result === 'WIN') winStreak++;
    else if (t.result === 'LOSS') winStreak = 0;
    
    if (winStreak >= 2 && i < sorted.length - 1) {
      const nextT = sorted[i+1];
      // Compare nextT risk to average risk of the win streak
      let streakRiskSum = 0;
      for(let j = i - winStreak + 1; j <= i; j++) {
        streakRiskSum += sorted[j].risk;
      }
      const avgStreakRisk = streakRiskSum / winStreak;
      
      if (nextT.risk > avgStreakRisk * 1.2) {
        // Risk escalated by >20%
        escalations.push({
          streak: winStreak,
          avgStreakRisk,
          escalatedRisk: nextT.risk,
          trade: nextT
        });
      }
    }
  }
  
  return escalations;
}

export function getBestPsychologicalState(trades: Trade[]) {
  const finishedTrades = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS');
  if (finishedTrades.length < 5) return null;

  // We group trades by their emotion to find the best performing one
  // but we combine it with rule adherence
  const emotionMap = new Map<string, Trade[]>();

  finishedTrades.forEach(trade => {
    let ems = trade.emotions && trade.emotions.length > 0 ? trade.emotions : ['Unrecorded'];
    ems.forEach(em => {
      if (!emotionMap.has(em)) emotionMap.set(em, []);
      emotionMap.get(em)!.push(trade);
    });
  });

  let bestState = null;
  let highestAvgR = -Infinity;

  emotionMap.forEach((emTrades, emotion) => {
    if (emTrades.length >= 3) {
      const wins = emTrades.filter(t => t.result === 'WIN').length;
      const winRate = Math.round((wins / emTrades.length) * 100);
      let rTotal = 0; let rCount = 0;
      let adherenceTotal = 0; let adherenceCount = 0;
      emTrades.forEach(t => {
        if (t.rMultiple !== undefined) { rTotal += t.rMultiple; rCount++; }
        if (t.ruleAdherence !== undefined) { adherenceTotal += t.ruleAdherence; adherenceCount++; }
      });
      const avgR = rCount > 0 ? rTotal / rCount : -Infinity;
      
      if (avgR > highestAvgR) {
        highestAvgR = avgR;
        bestState = {
          emotion,
          count: emTrades.length,
          winRate,
          avgR: +(avgR.toFixed(2)),
          avgRuleAdherence: adherenceCount > 0 ? Math.round(adherenceTotal / adherenceCount) : 100
        };
      }
    }
  });

  return bestState;
}

export function analyzeAfterLoss(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) => a.date - b.date);
  
  const categories = {
    immediate: { count: 0, rTotal: 0, rCount: 0 },
    shortWait: { count: 0, rTotal: 0, rCount: 0 }, // 15-60 min
    longWait: { count: 0, rTotal: 0, rCount: 0 }, // > 60 min
  };
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const t1 = sorted[i];
    const t2 = sorted[i+1];
    
    if (t1.result === 'LOSS' && t2.rMultiple !== undefined) {
      const minutesDiff = (t2.date - t1.date) / (1000 * 60);
      
      if (minutesDiff > 0) {
        if (minutesDiff <= 15) {
          categories.immediate.count++;
          categories.immediate.rTotal += t2.rMultiple;
          categories.immediate.rCount++;
        } else if (minutesDiff <= 60) {
          categories.shortWait.count++;
          categories.shortWait.rTotal += t2.rMultiple;
          categories.shortWait.rCount++;
        } else if (minutesDiff < 60 * 24) { // within same day ideally
          categories.longWait.count++;
          categories.longWait.rTotal += t2.rMultiple;
          categories.longWait.rCount++;
        }
      }
    }
  }
  
  return {
    immediate: {
      count: categories.immediate.count,
      avgR: categories.immediate.rCount > 0 ? +(categories.immediate.rTotal / categories.immediate.rCount).toFixed(2) : 0
    },
    shortWait: {
      count: categories.shortWait.count,
      avgR: categories.shortWait.rCount > 0 ? +(categories.shortWait.rTotal / categories.shortWait.rCount).toFixed(2) : 0
    },
    longWait: {
      count: categories.longWait.count,
      avgR: categories.longWait.rCount > 0 ? +(categories.longWait.rTotal / categories.longWait.rCount).toFixed(2) : 0
    }
  };
}

export type SampleSizeReliability = 
  | 'Insufficient Data' 
  | 'Early Evidence' 
  | 'Preliminary Observation' 
  | 'More Reliable Historical Observation';

export function getSampleSizeReliability(count: number): SampleSizeReliability {
  if (count < 5) return 'Insufficient Data';
  if (count <= 14) return 'Early Evidence';
  if (count <= 29) return 'Preliminary Observation';
  return 'More Reliable Historical Observation';
}

export interface TradePsychologyCompletion {
  score: number; // 0 - 100
  status: 'No Psychology Data' | 'Partially Completed' | 'Complete';
  completedCount: number;
  totalCount: number;
  completedItems: string[];
}

export function calculateTradePsychologyCompletion(trade: Trade): TradePsychologyCompletion {
  const items = [
    { name: 'Initial Emotions', done: Boolean(trade.emotions && trade.emotions.length > 0) },
    { name: 'Confidence / Setup Quality', done: Boolean(trade.confidence !== undefined || trade.setupQuality) },
    { name: 'Reason for Entry', done: Boolean(trade.entryReason?.trim() || trade.notes?.trim()) },
    { name: 'Rule Adherence', done: trade.ruleAdherence !== undefined },
    { 
      name: 'During Trade State', 
      done: Boolean(
        trade.duringEmotionalState?.trim() || 
        (trade.duringEmotions && trade.duringEmotions.length > 0) || 
        trade.positionManagement?.trim() ||
        trade.riskChanged !== undefined
      ) 
    },
    { name: 'Post-Trade Emotion', done: Boolean(trade.exitEmotion) },
    { 
      name: 'Review & Reflection', 
      done: Boolean(
        trade.mistake?.trim() || 
        trade.learning?.trim() || 
        trade.whatToRepeat?.trim() || 
        trade.whatToAvoid?.trim()
      ) 
    }
  ];

  const completed = items.filter(i => i.done).map(i => i.name);
  const score = Math.round((completed.length / items.length) * 100);

  let status: 'No Psychology Data' | 'Partially Completed' | 'Complete';
  if (completed.length === 0) {
    status = 'No Psychology Data';
  } else if (completed.length === items.length) {
    status = 'Complete';
  } else {
    status = 'Partially Completed';
  }

  return {
    score,
    status,
    completedCount: completed.length,
    totalCount: items.length,
    completedItems: completed
  };
}

export interface PsychologyOverviewMetrics {
  totalTrades: number;
  tradesWithPsychology: number;
  completionPercent: number | null;
  ruleAdherencePercent: number | null;
  fomoEvents: number;
  possibleRevengeCount: number;
  riskDeviationsCount: number;
  overtradingSignalsCount: number;
  calmWinRate: number | null;
  calmAvgR: number | null;
  reactiveWinRate: number | null;
  reactiveAvgR: number | null;
}

export function calculatePsychologyOverview(trades: Trade[], defaultUserRisk?: number): PsychologyOverviewMetrics {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      tradesWithPsychology: 0,
      completionPercent: null,
      ruleAdherencePercent: null,
      fomoEvents: 0,
      possibleRevengeCount: 0,
      riskDeviationsCount: 0,
      overtradingSignalsCount: 0,
      calmWinRate: null,
      calmAvgR: null,
      reactiveWinRate: null,
      reactiveAvgR: null,
    };
  }

  const completions = trades.map(t => calculateTradePsychologyCompletion(t));
  const tradesWithPsychology = completions.filter(c => c.score > 0).length;
  const avgCompletion = Math.round(completions.reduce((acc, c) => acc + c.score, 0) / totalTrades);

  // Rule adherence
  const tradesWithAdherence = trades.filter(t => t.ruleAdherence !== undefined);
  const ruleAdherencePercent = tradesWithAdherence.length > 0 
    ? Math.round(tradesWithAdherence.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0) / tradesWithAdherence.length)
    : null;

  // FOMO events
  const fomoEvents = trades.filter(t => 
    t.emotions?.includes('FOMO') || 
    t.duringEmotions?.includes('FOMO') || 
    t.duringEmotionalState?.toLowerCase().includes('fomo')
  ).length;

  // Revenge trades
  const revengeSequences = detectRevengeTrades(trades);
  const possibleRevengeCount = revengeSequences.length + trades.filter(t => t.emotions?.includes('Revenge') || t.isReentry).length;

  // Risk deviations
  const validRisks = trades.map(t => t.risk || 0).filter(r => r > 0);
  const baselineRisk = defaultUserRisk && defaultUserRisk > 0 
    ? defaultUserRisk 
    : (validRisks.length > 0 ? validRisks.reduce((a, b) => a + b, 0) / validRisks.length : 0);
  
  const riskDeviationsCount = baselineRisk > 0 
    ? trades.filter(t => (t.risk || 0) > baselineRisk * 1.3 || t.riskChanged).length 
    : 0;

  // Overtrading signals: clusters of 3+ trades on the same day within 3 hours
  const sorted = [...trades].sort((a, b) => a.date - b.date);
  let overtradingSignalsCount = 0;
  for (let i = 0; i < sorted.length - 2; i++) {
    const t1 = sorted[i];
    const t3 = sorted[i+2];
    const hoursDiff = (t3.date - t1.date) / (1000 * 60 * 60);
    if (hoursDiff > 0 && hoursDiff <= 3) {
      overtradingSignalsCount++;
      i += 2; // skip forward
    }
  }

  // Emotional performance groups
  const calmTrades = trades.filter(t => 
    (t.emotions?.includes('Calm') || t.emotions?.includes('Confident')) && 
    (t.result === 'WIN' || t.result === 'LOSS')
  );
  const calmWins = calmTrades.filter(t => t.result === 'WIN').length;
  const calmWinRate = calmTrades.length >= 3 ? Math.round((calmWins / calmTrades.length) * 100) : null;
  const calmRTrades = calmTrades.filter(t => t.rMultiple !== undefined);
  const calmAvgR = calmRTrades.length >= 3 
    ? +(calmRTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / calmRTrades.length).toFixed(2) 
    : null;

  const reactiveTrades = trades.filter(t => 
    (t.emotions?.some(e => ['FOMO', 'Revenge', 'Fear', 'Greed', 'Frustrated', 'Impatient'].includes(e))) && 
    (t.result === 'WIN' || t.result === 'LOSS')
  );
  const reactiveWins = reactiveTrades.filter(t => t.result === 'WIN').length;
  const reactiveWinRate = reactiveTrades.length >= 3 ? Math.round((reactiveWins / reactiveTrades.length) * 100) : null;
  const reactiveRTrades = reactiveTrades.filter(t => t.rMultiple !== undefined);
  const reactiveAvgR = reactiveRTrades.length >= 3 
    ? +(reactiveRTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / reactiveRTrades.length).toFixed(2) 
    : null;

  return {
    totalTrades,
    tradesWithPsychology,
    completionPercent: avgCompletion,
    ruleAdherencePercent,
    fomoEvents,
    possibleRevengeCount,
    riskDeviationsCount,
    overtradingSignalsCount,
    calmWinRate,
    calmAvgR,
    reactiveWinRate,
    reactiveAvgR
  };
}

export interface BehavioralPattern {
  id: string;
  title: string;
  detectedCount: number;
  status: 'Detected' | 'No Strong Evidence' | 'Insufficient Data';
  observation: string;
  historicalDetail: string;
  evidenceTrades: Trade[];
}

export function detectDetailedBehavioralPatterns(trades: Trade[], defaultRisk?: number): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];
  const sorted = [...trades].sort((a, b) => a.date - b.date);

  // 1. Possible FOMO Pattern
  const fomoTrades = trades.filter(t => 
    t.emotions?.includes('FOMO') || 
    t.duringEmotions?.includes('FOMO') || 
    t.duringEmotionalState?.toLowerCase().includes('fomo')
  );
  patterns.push({
    id: 'fomo-pattern',
    title: 'Possible FOMO Pattern',
    detectedCount: fomoTrades.length,
    status: fomoTrades.length >= 3 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: fomoTrades.length > 0 
      ? `Recorded FOMO was documented on ${fomoTrades.length} trade${fomoTrades.length > 1 ? 's' : ''}.`
      : 'No explicit FOMO emotion was logged in your recent trade entries.',
    historicalDetail: fomoTrades.length >= 3 
      ? 'When FOMO was recorded, check whether entries deviated from your predefined setup confirmation.'
      : 'Maintain vigilance on trade entries following rapid price expansions.',
    evidenceTrades: fomoTrades.slice(0, 5)
  });

  // 2. Possible Revenge Trading Pattern
  const revengeSequences = detectRevengeTrades(trades);
  const explicitRevengeTrades = trades.filter(t => t.emotions?.includes('Revenge') || t.isReentry);
  const totalRevengeEvents = revengeSequences.length + explicitRevengeTrades.length;
  patterns.push({
    id: 'revenge-pattern',
    title: 'Possible Revenge Trading Pattern',
    detectedCount: totalRevengeEvents,
    status: totalRevengeEvents >= 2 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: totalRevengeEvents > 0 
      ? `Recorded ${totalRevengeEvents} instance${totalRevengeEvents > 1 ? 's' : ''} where a trade occurred shortly after a loss or was flagged with revenge/re-entry emotion.`
      : 'No consecutive revenge trading sequences were detected in your historical records.',
    historicalDetail: totalRevengeEvents > 0 
      ? 'Historical observations indicate trades placed immediately after a loss often carry altered risk sizing or expedited entry.'
      : 'Your spacing between closing a loss and initiating the subsequent trade appears deliberate.',
    evidenceTrades: explicitRevengeTrades.slice(0, 5)
  });

  // 3. Possible Risk Escalation
  const escalations = detectRiskEscalation(trades);
  const riskChangedTrades = trades.filter(t => t.riskChanged);
  const totalRiskDeviations = escalations.length + riskChangedTrades.length;
  patterns.push({
    id: 'risk-escalation',
    title: 'Possible Risk Escalation',
    detectedCount: totalRiskDeviations,
    status: totalRiskDeviations >= 2 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: totalRiskDeviations > 0 
      ? `Recorded ${totalRiskDeviations} trade${totalRiskDeviations > 1 ? 's' : ''} with elevated risk sizing or in-trade risk adjustments.`
      : 'Position risk remained within your standard parameters across recorded trades.',
    historicalDetail: totalRiskDeviations > 0 
      ? 'Noticeable risk sizing increases appeared either during positive streaks or via manual position changes.'
      : 'Risk sizing shows consistent discipline without sharp upward spikes.',
    evidenceTrades: riskChangedTrades.slice(0, 5)
  });

  // 4. Possible Rule Skipping
  const ruleSkippingTrades = trades.filter(t => 
    (t.ruleAdherence !== undefined && t.ruleAdherence < 70) ||
    (t.checklistState && Object.values(t.checklistState).filter(Boolean).length < Object.values(t.checklistState).length / 2)
  );
  patterns.push({
    id: 'rule-skipping',
    title: 'Possible Rule Skipping',
    detectedCount: ruleSkippingTrades.length,
    status: ruleSkippingTrades.length >= 3 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: ruleSkippingTrades.length > 0 
      ? `Recorded ${ruleSkippingTrades.length} trade${ruleSkippingTrades.length > 1 ? 's' : ''} with low checklist completion or rule adherence below 70%.`
      : 'Checklist verification and rule adherence remained consistently high.',
    historicalDetail: ruleSkippingTrades.length > 0 
      ? 'Historical data indicates trades executed without completing strategy checklists produced varied outcomes.'
      : 'Rules were consistently acknowledged prior to entry.',
    evidenceTrades: ruleSkippingTrades.slice(0, 5)
  });

  // 5. Possible Overtrading
  let overtradingDays = 0;
  const dayMap = new Map<string, Trade[]>();
  trades.forEach(t => {
    const d = new Date(t.date).toISOString().slice(0, 10);
    if (!dayMap.has(d)) dayMap.set(d, []);
    dayMap.get(d)!.push(t);
  });
  dayMap.forEach((dayTrades) => {
    if (dayTrades.length >= 4) overtradingDays++;
  });
  patterns.push({
    id: 'overtrading',
    title: 'Possible Overtrading',
    detectedCount: overtradingDays,
    status: overtradingDays >= 2 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: overtradingDays > 0 
      ? `Identified ${overtradingDays} day${overtradingDays > 1 ? 's' : ''} with 4 or more executions recorded.`
      : 'Daily execution volume remained measured with no high-density clusters.',
    historicalDetail: overtradingDays > 0 
      ? 'High-frequency sessions frequently correlate with fatigued decision-making in later trades.'
      : 'Trade pacing appears measured across recorded sessions.',
    evidenceTrades: []
  });

  // 6. Possible Disposition Pattern (Cutting winners early / letting losses run)
  const dispositionTrades = trades.filter(t => {
    if (t.result === 'WIN' && t.rrRatio && t.rMultiple) {
      // Planned 1:2 or higher, but closed at < 0.5R
      return t.rrRatio >= 1.5 && t.rMultiple < 0.6;
    }
    return false;
  });
  patterns.push({
    id: 'disposition-pattern',
    title: 'Possible Disposition Pattern',
    detectedCount: dispositionTrades.length,
    status: dispositionTrades.length >= 2 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: dispositionTrades.length > 0 
      ? `Recorded ${dispositionTrades.length} winning trade${dispositionTrades.length > 1 ? 's' : ''} closed significantly earlier than planned target R.`
      : 'Winning trades generally achieved their planned exit zones or stop trailing criteria.',
    historicalDetail: dispositionTrades.length > 0 
      ? 'Premature exits were noted before the initial take-profit or invalidation levels were tested.'
      : 'No noticeable early-exit asymmetry identified.',
    evidenceTrades: dispositionTrades.slice(0, 5)
  });

  // 7. Possible Re-entry Pattern
  const reentryTrades = trades.filter(t => t.isReentry);
  patterns.push({
    id: 'reentry-pattern',
    title: 'Possible Re-entry Pattern',
    detectedCount: reentryTrades.length,
    status: reentryTrades.length >= 2 ? 'Detected' : trades.length < 5 ? 'Insufficient Data' : 'No Strong Evidence',
    observation: reentryTrades.length > 0 
      ? `Logged ${reentryTrades.length} trade${reentryTrades.length > 1 ? 's' : ''} explicitly documented as re-entries into the same market.`
      : 'Re-entries into closed markets were rare in recorded data.',
    historicalDetail: reentryTrades.length > 0 
      ? 'Re-entering the same market after being stopped out presents distinct behavioral variables.'
      : 'Single-entry execution discipline was maintained.',
    evidenceTrades: reentryTrades.slice(0, 5)
  });

  return patterns;
}

export interface TradeBehavioralObservation {
  id: string;
  type: 'neutral' | 'advisory' | 'positive';
  message: string;
}

export function analyzeTradeObservations(trade: Trade, previousTrade?: Trade, defaultUserRisk?: number): TradeBehavioralObservation[] {
  const obs: TradeBehavioralObservation[] = [];

  // Risk observation
  if (defaultUserRisk && defaultUserRisk > 0 && trade.risk > defaultUserRisk * 1.25) {
    const diff = Math.round(((trade.risk - defaultUserRisk) / defaultUserRisk) * 100);
    obs.push({
      id: 'risk-high',
      type: 'advisory',
      message: `Planned risk ($${trade.risk}) was ${diff}% higher than your configured default risk ($${defaultUserRisk}).`
    });
  }

  // Risk change during trade
  if (trade.riskChanged) {
    obs.push({
      id: 'risk-modified',
      type: 'advisory',
      message: `Risk was modified during the active trade${trade.riskChangeNotes ? `: "${trade.riskChangeNotes}"` : '.'}`
    });
  }

  // FOMO before entry
  if (trade.emotions?.includes('FOMO')) {
    obs.push({
      id: 'fomo-before',
      type: 'advisory',
      message: 'FOMO was recorded in your emotional state before entering this position.'
    });
  }

  // Calm / Confident before entry
  if (trade.emotions?.includes('Calm') || trade.emotions?.includes('Confident')) {
    obs.push({
      id: 'calm-before',
      type: 'positive',
      message: `Entered with a calm and confident mindset (${trade.emotions.join(', ')}).`
    });
  }

  // Previous trade sequence
  if (previousTrade && previousTrade.result === 'LOSS') {
    const mins = Math.round(Math.abs(trade.date - previousTrade.date) / (1000 * 60));
    if (mins <= 60) {
      obs.push({
        id: 'loss-proximity',
        type: 'advisory',
        message: `This trade was initiated ${mins} minutes after a loss on ${previousTrade.market}.`
      });
    }
  }

  // Re-entry
  if (trade.isReentry) {
    obs.push({
      id: 'is-reentry',
      type: 'advisory',
      message: `Flagged as a re-entry into ${trade.market}${trade.reentryReason ? `: ${trade.reentryReason}` : '.'}`
    });
  }

  // Checklist adherence
  if (trade.checklistState) {
    const total = Object.keys(trade.checklistState).length;
    const checked = Object.values(trade.checklistState).filter(Boolean).length;
    if (total > 0) {
      if (checked === total) {
        obs.push({
          id: 'checklist-complete',
          type: 'positive',
          message: `Complete strategy checklist followed: all ${total} rules were confirmed.`
        });
      } else {
        obs.push({
          id: 'checklist-incomplete',
          type: 'advisory',
          message: `Strategy checklist was partially completed: ${checked} of ${total} rules checked.`
        });
      }
    }
  }

  // Rule adherence score
  if (trade.ruleAdherence !== undefined) {
    if (trade.ruleAdherence >= 90) {
      obs.push({
        id: 'adherence-high',
        type: 'positive',
        message: `High rule adherence recorded (${trade.ruleAdherence}%).`
      });
    } else if (trade.ruleAdherence < 70) {
      obs.push({
        id: 'adherence-low',
        type: 'advisory',
        message: `Lower rule adherence recorded (${trade.ruleAdherence}%).`
      });
    }
  }

  // Position management
  if (trade.positionManagement) {
    obs.push({
      id: 'position-mgmt',
      type: 'neutral',
      message: `In-trade management: ${trade.positionManagement}`
    });
  }

  if (obs.length === 0) {
    obs.push({
      id: 'standard-obs',
      type: 'neutral',
      message: 'Standard trade execution recorded with baseline parameters.'
    });
  }

  return obs;
}

export interface TimelineStage {
  stage: 'Before Trade' | 'Entry' | 'During Trade' | 'Exit' | 'After Trade';
  title: string;
  items: { label: string; value: string }[];
}

export function buildTradePsychologyTimeline(trade: Trade): TimelineStage[] {
  const stages: TimelineStage[] = [];

  // 1. Before Trade
  const beforeItems: { label: string; value: string }[] = [];
  if (trade.emotions && trade.emotions.length > 0) {
    beforeItems.push({ label: 'Emotions', value: trade.emotions.join(', ') });
  }
  if (trade.confidence !== undefined) {
    beforeItems.push({ label: 'Confidence', value: `${trade.confidence} / 10` });
  }
  if (trade.setupQuality) {
    beforeItems.push({ label: 'Setup Quality', value: trade.setupQuality });
  }
  if (trade.marketCondition) {
    beforeItems.push({ label: 'Condition', value: trade.marketCondition });
  }
  if (trade.entryReason) {
    beforeItems.push({ label: 'Reason', value: trade.entryReason });
  }
  if (beforeItems.length > 0) {
    stages.push({
      stage: 'Before Trade',
      title: 'Pre-Market & Preparation',
      items: beforeItems
    });
  }

  // 2. Entry
  const entryItems: { label: string; value: string }[] = [
    { label: 'Market & Direction', value: `${trade.market} • ${trade.direction}` },
    { label: 'Entry Price', value: trade.entry?.toString() || '-' },
    { label: 'Stop Loss', value: trade.stopLoss?.toString() || '-' },
    { label: 'Take Profit', value: trade.takeProfit ? trade.takeProfit.toString() : 'None' },
    { label: 'Planned Risk', value: trade.risk ? `$${trade.risk}` : '-' }
  ];
  if (trade.session) {
    entryItems.push({ label: 'Session', value: trade.session });
  }
  stages.push({
    stage: 'Entry',
    title: 'Execution & Orders',
    items: entryItems
  });

  // 3. During Trade
  const duringItems: { label: string; value: string }[] = [];
  if (trade.duringEmotionalState) {
    duringItems.push({ label: 'Emotional State', value: trade.duringEmotionalState });
  }
  if (trade.duringEmotions && trade.duringEmotions.length > 0) {
    duringItems.push({ label: 'Mid-Trade Emotions', value: trade.duringEmotions.join(', ') });
  }
  if (trade.ruleAdherence !== undefined) {
    duringItems.push({ label: 'Rule Adherence', value: `${trade.ruleAdherence}%` });
  }
  if (trade.positionManagement) {
    duringItems.push({ label: 'Management Action', value: trade.positionManagement });
  }
  if (trade.riskChanged) {
    duringItems.push({ label: 'Risk Adjusted', value: trade.riskChangeNotes || 'Yes' });
  }
  if (duringItems.length > 0) {
    stages.push({
      stage: 'During Trade',
      title: 'In-Position Management',
      items: duringItems
    });
  }

  // 4. Exit
  const exitItems: { label: string; value: string }[] = [];
  if (trade.result) {
    exitItems.push({ label: 'Outcome', value: trade.result });
  }
  if (trade.pnl !== undefined) {
    exitItems.push({ label: 'Realized P&L', value: `${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` });
  }
  if (trade.rMultiple !== undefined) {
    exitItems.push({ label: 'Realized R', value: `${trade.rMultiple > 0 ? '+' : ''}${trade.rMultiple.toFixed(2)}R` });
  }
  if (exitItems.length > 0) {
    stages.push({
      stage: 'Exit',
      title: 'Closure & Settlement',
      items: exitItems
    });
  }

  // 5. After Trade
  const afterItems: { label: string; value: string }[] = [];
  if (trade.exitEmotion) {
    afterItems.push({ label: 'Emotion Post-Exit', value: trade.exitEmotion });
  }
  if (trade.mistake) {
    afterItems.push({ label: 'Mistake Identified', value: trade.mistake });
  }
  if (trade.learning) {
    afterItems.push({ label: 'Key Learning', value: trade.learning });
  }
  if (trade.whatToRepeat) {
    afterItems.push({ label: 'What to Repeat', value: trade.whatToRepeat });
  }
  if (trade.whatToAvoid) {
    afterItems.push({ label: 'What to Avoid', value: trade.whatToAvoid });
  }
  if (afterItems.length > 0) {
    stages.push({
      stage: 'After Trade',
      title: 'Review & Reflection',
      items: afterItems
    });
  }

  return stages;
}

export interface StrategyPsychologyStats {
  strategyName: string;
  totalTrades: number;
  emotions: {
    emotion: string;
    count: number;
    winRate: number;
    avgR: number;
    ruleAdherence: number;
    reliability: SampleSizeReliability;
  }[];
}

export function analyzePsychologyByStrategy(trades: Trade[]): StrategyPsychologyStats[] {
  const stratMap = new Map<string, Trade[]>();

  trades.forEach(t => {
    const sName = t.strategy?.trim() || 'No Strategy';
    if (!stratMap.has(sName)) stratMap.set(sName, []);
    stratMap.get(sName)!.push(t);
  });

  const results: StrategyPsychologyStats[] = [];

  stratMap.forEach((sTrades, strategyName) => {
    const emotionMap = new Map<string, Trade[]>();
    sTrades.forEach(t => {
      const ems = t.emotions?.length ? t.emotions : ['Unrecorded'];
      ems.forEach(e => {
        if (!emotionMap.has(e)) emotionMap.set(e, []);
        emotionMap.get(e)!.push(t);
      });
    });

    const emotionsList: StrategyPsychologyStats['emotions'] = [];
    emotionMap.forEach((eTrades, emotion) => {
      const finished = eTrades.filter(t => t.result === 'WIN' || t.result === 'LOSS');
      const wins = finished.filter(t => t.result === 'WIN').length;
      const winRate = finished.length > 0 ? Math.round((wins / finished.length) * 100) : 0;
      
      const withR = eTrades.filter(t => t.rMultiple !== undefined);
      const avgR = withR.length > 0 ? +(withR.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / withR.length).toFixed(2) : 0;

      const withAdh = eTrades.filter(t => t.ruleAdherence !== undefined);
      const ruleAdherence = withAdh.length > 0 ? Math.round(withAdh.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0) / withAdh.length) : 100;

      emotionsList.push({
        emotion,
        count: eTrades.length,
        winRate,
        avgR,
        ruleAdherence,
        reliability: getSampleSizeReliability(eTrades.length)
      });
    });

    results.push({
      strategyName,
      totalTrades: sTrades.length,
      emotions: emotionsList.sort((a, b) => b.count - a.count)
    });
  });

  return results.sort((a, b) => b.totalTrades - a.totalTrades);
}

export interface SessionPsychologyStats {
  session: string;
  count: number;
  winRate: number;
  avgR: number;
  ruleAdherence: number;
  topEmotions: { emotion: string; count: number }[];
  reliability: SampleSizeReliability;
}

export function analyzePsychologyBySession(trades: Trade[]): SessionPsychologyStats[] {
  const sessions = ['Asian', 'London', 'New York', 'Sydney'];
  const sessionMap = new Map<string, Trade[]>();

  sessions.forEach(s => sessionMap.set(s, []));
  sessionMap.set('Other', []);

  trades.forEach(t => {
    const s = t.session?.trim() || 'Other';
    if (sessionMap.has(s)) {
      sessionMap.get(s)!.push(t);
    } else {
      sessionMap.get('Other')!.push(t);
    }
  });

  const results: SessionPsychologyStats[] = [];

  sessionMap.forEach((sTrades, session) => {
    if (sTrades.length === 0 && session === 'Other') return;

    const finished = sTrades.filter(t => t.result === 'WIN' || t.result === 'LOSS');
    const wins = finished.filter(t => t.result === 'WIN').length;
    const winRate = finished.length > 0 ? Math.round((wins / finished.length) * 100) : 0;

    const withR = sTrades.filter(t => t.rMultiple !== undefined);
    const avgR = withR.length > 0 ? +(withR.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / withR.length).toFixed(2) : 0;

    const withAdh = sTrades.filter(t => t.ruleAdherence !== undefined);
    const ruleAdherence = withAdh.length > 0 ? Math.round(withAdh.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0) / withAdh.length) : 100;

    // Top emotions in session
    const emMap = new Map<string, number>();
    sTrades.forEach(t => {
      (t.emotions || []).forEach(e => emMap.set(e, (emMap.get(e) || 0) + 1));
    });
    const topEmotions = Array.from(emMap.entries())
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    results.push({
      session,
      count: sTrades.length,
      winRate,
      avgR,
      ruleAdherence,
      topEmotions,
      reliability: getSampleSizeReliability(sTrades.length)
    });
  });

  return results;
}


