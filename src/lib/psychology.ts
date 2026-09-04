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

