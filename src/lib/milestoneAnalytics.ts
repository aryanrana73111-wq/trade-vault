import { Trade, Rule } from '@/types';
import { formatCurrency } from '@/lib/utils';

export interface MilestoneFeatureDef {
  id: string;
  index: number;
  name: string;
  requiredTrades: number;
  tagline: string;
  description: string;
  shortDescription: string;
  iconName: string;
}

export const MILESTONE_FEATURES: MilestoneFeatureDef[] = [
  {
    id: 'streak_analyzer',
    index: 1,
    name: 'Win/Loss Streak Analyzer',
    requiredTrades: 5,
    tagline: 'Analyze streak resilience & profit generation during momentum cycles',
    description: 'Track your current, longest, and average winning and losing streaks with historical P&L attribution.',
    shortDescription: 'Streak lengths, sequence dynamics, and P&L attribution during winning vs losing streaks.',
    iconName: 'Flame'
  },
  {
    id: 'time_of_day',
    index: 2,
    name: 'Time-of-Day Performance',
    requiredTrades: 10,
    tagline: 'Discover your most profitable trading hours and execution windows',
    description: 'Hourly performance breakdown analyzing trade volume, win rate, net P&L, and average R in your timezone.',
    shortDescription: 'Hourly distribution, win rates, and R-multiple expectancy by execution time block.',
    iconName: 'Clock'
  },
  {
    id: 'risk_discipline',
    index: 3,
    name: 'Risk Discipline Matrix',
    requiredTrades: 15,
    tagline: 'Audit planned vs actual risk execution and emotional risk escalation',
    description: 'Compare planned risk against executed risk to uncover risk deviations, sizing slippage, and post-result escalation.',
    shortDescription: 'Planned vs executed risk comparison, sizing deviations, and emotional risk escalation.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'drawdown_recovery',
    index: 4,
    name: 'Drawdown & Recovery Profile',
    requiredTrades: 20,
    tagline: 'Quantify peak-to-trough drawdowns and account recovery duration',
    description: 'Historical drawdown episodes, recovery speed in trades/days, max drawdown depth, and recovery curve.',
    shortDescription: 'Deep drawdown episodes, recovery durations, equity curves, and peak-to-trough metrics.',
    iconName: 'TrendingDown'
  },
  {
    id: 'exit_efficiency',
    index: 5,
    name: 'Exit Efficiency / MFE-MAE',
    requiredTrades: 25,
    tagline: 'Evaluate Maximum Favorable & Adverse Excursions and exit capture quality',
    description: 'Measure how much available profit was captured versus left on the table during trades with price-path tracking.',
    shortDescription: 'MFE/MAE excursions, exit capture ratio, and early vs late exit analysis.',
    iconName: 'Crosshair'
  },
  {
    id: 'expectancy_decomposition',
    index: 6,
    name: 'Expectancy & Edge Decomposition',
    requiredTrades: 30,
    tagline: 'Deconstruct your mathematical edge into win rate, payoff ratio, and fee friction',
    description: 'Comprehensive edge decomposition showing mathematical Expectancy, Profit Factor, Payoff Ratio, and win/loss contributions.',
    shortDescription: 'Mathematical expectancy, profit factor, win/loss contribution, and cost impact.',
    iconName: 'Scale'
  },
  {
    id: 'holding_time',
    index: 7,
    name: 'Holding-Time Efficiency',
    requiredTrades: 35,
    tagline: 'Optimize trade duration and identify holding-time sweet spots',
    description: 'Duration analysis comparing holding times of winners vs losers, duration vs P&L distribution, and optimal time buckets.',
    shortDescription: 'Holding time vs profitability, median duration of winners vs losers, and duration buckets.',
    iconName: 'Timer'
  },
  {
    id: 'rule_adherence_impact',
    index: 8,
    name: 'Rule Adherence Impact',
    requiredTrades: 40,
    tagline: 'Quantify the direct dollar cost of breaking your trading discipline rules',
    description: 'Correlate rule adherence with real P&L and R-multiples to prove the statistical value of trading discipline.',
    shortDescription: 'Direct P&L and R impact of following vs violating discipline rules, and top broken rules.',
    iconName: 'CheckCircle2'
  },
  {
    id: 'day_of_week',
    index: 9,
    name: 'Day-of-Week Performance',
    requiredTrades: 45,
    tagline: 'Identify statistical edge and execution quality across trading weekdays',
    description: 'Analyze performance across Monday through Friday with win rates, R-multiples, net P&L, and average holding times.',
    shortDescription: 'Monday-to-Friday win rate, average R, net P&L, and trade distribution.',
    iconName: 'Calendar'
  },
  {
    id: 'process_score',
    index: 10,
    name: 'Consistency & Process Score',
    requiredTrades: 50,
    tagline: 'Comprehensive multi-pillar behavioral scorecard for professional execution',
    description: 'Transparent behavioral audit measuring risk discipline, rule adherence, journaling completion, and sizing consistency.',
    shortDescription: 'Multi-pillar behavioral scorecard across risk discipline, rule adherence, and journal depth.',
    iconName: 'Award'
  }
];

// Helper to filter valid qualifying trades for a dashboard
export function getQualifyingTrades(allTrades: Trade[], dashboardId?: string | null): Trade[] {
  if (!allTrades || !Array.isArray(allTrades)) return [];
  
  return allTrades.filter(t => {
    // Must have valid ID and be a real saved trade
    if (!t || !t.id) return false;

    // Filter out competition trades from personal dashboard progression
    if ((t.tradeSource as string) === 'competition' || (t as any).isCompetitionTrade) {
      return false;
    }

    // Must be a closed/completed trade with a valid result or pnl
    const isCompleted = t.result && t.result !== 'PENDING';
    const hasPnl = t.pnl !== undefined && t.pnl !== null && !isNaN(Number(t.pnl));
    if (!isCompleted && !hasPnl) return false;

    // Filter by dashboard scope if specified
    if (dashboardId && dashboardId !== 'ALL') {
      if (dashboardId === 'MANUAL') {
        if (t.tradeSource === 'mt5' || t.tradeSource === 'competition_mt5' || t.mt5TicketId) return false;
      } else if (dashboardId.startsWith('mt5_')) {
        const matches = t.tradingAccountId === dashboardId || t.mt5AccountId === dashboardId || t.id.startsWith(dashboardId);
        if (!matches) return false;
      } else {
        const tDash = t.accountId || t.dashboardId || 'Default';
        if (tDash !== dashboardId) return false;
      }
    }

    return true;
  });
}

// Calculate unlock count (0 to 10)
export function getUnlockedMilestonesCount(qualifyingTradeCount: number): number {
  if (qualifyingTradeCount < 5) return 0;
  return Math.min(10, Math.floor(qualifyingTradeCount / 5));
}

// Check if a specific feature index (1 to 10) is unlocked
export function isMilestoneUnlocked(featureIndex: number, qualifyingTradeCount: number): boolean {
  const unlockedCount = getUnlockedMilestonesCount(qualifyingTradeCount);
  return featureIndex <= unlockedCount;
}

// LocalStorage Acknowledged milestones helpers
export function getAcknowledgedMilestones(userId: string, dashboardId: string = 'default'): number {
  if (typeof window === 'undefined') return 0;
  const key = `tv_milestone_ack_${userId}_${dashboardId}`;
  const stored = localStorage.getItem(key);
  if (stored === null) return -1; // -1 means never initialized
  return parseInt(stored, 10) || 0;
}

export function setAcknowledgedMilestones(userId: string, dashboardId: string = 'default', count: number): void {
  if (typeof window === 'undefined') return;
  const key = `tv_milestone_ack_${userId}_${dashboardId}`;
  localStorage.setItem(key, String(count));
}

// Ensure each feature popup is shown only once EVER per user / browser
export function hasCelebratedFeature(userId: string = 'default_user', featureId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const userKey = `tv_feature_celebrated_${userId}_${featureId}`;
    const globalKey = `tv_feature_celebrated_global_${featureId}`;
    const allKey = `tv_celebrated_features_set`;
    
    if (localStorage.getItem(userKey) === 'true') return true;
    if (localStorage.getItem(globalKey) === 'true') return true;
    
    const setRaw = localStorage.getItem(allKey);
    if (setRaw) {
      const setList: string[] = JSON.parse(setRaw);
      if (Array.isArray(setList) && setList.includes(featureId)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function markFeatureCelebrated(userId: string = 'default_user', featureId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const userKey = `tv_feature_celebrated_${userId}_${featureId}`;
    const globalKey = `tv_feature_celebrated_global_${featureId}`;
    const allKey = `tv_celebrated_features_set`;
    
    localStorage.setItem(userKey, 'true');
    localStorage.setItem(globalKey, 'true');
    
    try {
      const setRaw = localStorage.getItem(allKey);
      const setList: string[] = setRaw ? JSON.parse(setRaw) : [];
      if (!setList.includes(featureId)) {
        setList.push(featureId);
        localStorage.setItem(allKey, JSON.stringify(setList));
      }
    } catch {}
  } catch {}
}


// Safe numeric extractor
function safeNumber(val: any, fallback: number = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (!val) return fallback;
  const num = parseFloat(val);
  return isNaN(num) ? fallback : num;
}

// ----------------------------------------------------
// FEATURE 1: STREAK ANALYZER
// ----------------------------------------------------
export interface StreakAnalytics {
  currentStreakType: 'WIN' | 'LOSS' | 'NONE';
  currentStreakCount: number;
  longestWinStreak: number;
  longestLossStreak: number;
  avgWinStreak: number;
  avgLossStreak: number;
  pnlInWinStreaks: number;
  pnlInLossStreaks: number;
  avgPnlPerWinStreak: number;
  avgPnlPerLossStreak: number;
  streakHistory: Array<{
    type: 'WIN' | 'LOSS';
    count: number;
    pnl: number;
    startDate: number;
    endDate: number;
  }>;
}

export function calculateStreakAnalytics(trades: Trade[]): StreakAnalytics {
  const sorted = [...trades].sort((a, b) => (a.date || 0) - (b.date || 0));
  
  if (sorted.length === 0) {
    return {
      currentStreakType: 'NONE',
      currentStreakCount: 0,
      longestWinStreak: 0,
      longestLossStreak: 0,
      avgWinStreak: 0,
      avgLossStreak: 0,
      pnlInWinStreaks: 0,
      pnlInLossStreaks: 0,
      avgPnlPerWinStreak: 0,
      avgPnlPerLossStreak: 0,
      streakHistory: []
    };
  }

  const streakHistory: Array<{
    type: 'WIN' | 'LOSS';
    count: number;
    pnl: number;
    startDate: number;
    endDate: number;
  }> = [];

  let currentType: 'WIN' | 'LOSS' | null = null;
  let currentCount = 0;
  let currentPnl = 0;
  let currentStart = sorted[0].date || Date.now();
  let currentEnd = sorted[0].date || Date.now();

  for (const t of sorted) {
    const isWin = t.result === 'WIN' || (t.pnl && t.pnl > 0);
    const isLoss = t.result === 'LOSS' || (t.pnl && t.pnl < 0);
    
    if (!isWin && !isLoss) continue; // skip break-evens in streak count

    const type = isWin ? 'WIN' : 'LOSS';
    const pnl = safeNumber(t.pnl);

    if (currentType === null) {
      currentType = type;
      currentCount = 1;
      currentPnl = pnl;
      currentStart = t.date || Date.now();
      currentEnd = t.date || Date.now();
    } else if (currentType === type) {
      currentCount++;
      currentPnl += pnl;
      currentEnd = t.date || Date.now();
    } else {
      streakHistory.push({
        type: currentType,
        count: currentCount,
        pnl: currentPnl,
        startDate: currentStart,
        endDate: currentEnd
      });
      currentType = type;
      currentCount = 1;
      currentPnl = pnl;
      currentStart = t.date || Date.now();
      currentEnd = t.date || Date.now();
    }
  }

  if (currentType !== null && currentCount > 0) {
    streakHistory.push({
      type: currentType,
      count: currentCount,
      pnl: currentPnl,
      startDate: currentStart,
      endDate: currentEnd
    });
  }

  const winStreaks = streakHistory.filter(s => s.type === 'WIN');
  const lossStreaks = streakHistory.filter(s => s.type === 'LOSS');

  const longestWinStreak = winStreaks.length > 0 ? Math.max(...winStreaks.map(s => s.count)) : 0;
  const longestLossStreak = lossStreaks.length > 0 ? Math.max(...lossStreaks.map(s => s.count)) : 0;

  const avgWinStreak = winStreaks.length > 0 
    ? Number((winStreaks.reduce((acc, s) => acc + s.count, 0) / winStreaks.length).toFixed(1))
    : 0;

  const avgLossStreak = lossStreaks.length > 0 
    ? Number((lossStreaks.reduce((acc, s) => acc + s.count, 0) / lossStreaks.length).toFixed(1))
    : 0;

  const pnlInWinStreaks = winStreaks.reduce((acc, s) => acc + s.pnl, 0);
  const pnlInLossStreaks = lossStreaks.reduce((acc, s) => acc + s.pnl, 0);

  const avgPnlPerWinStreak = winStreaks.length > 0 ? pnlInWinStreaks / winStreaks.length : 0;
  const avgPnlPerLossStreak = lossStreaks.length > 0 ? pnlInLossStreaks / lossStreaks.length : 0;

  const lastStreak = streakHistory[streakHistory.length - 1];

  return {
    currentStreakType: lastStreak ? lastStreak.type : 'NONE',
    currentStreakCount: lastStreak ? lastStreak.count : 0,
    longestWinStreak,
    longestLossStreak,
    avgWinStreak,
    avgLossStreak,
    pnlInWinStreaks,
    pnlInLossStreaks,
    avgPnlPerWinStreak,
    avgPnlPerLossStreak,
    streakHistory
  };
}

// ----------------------------------------------------
// FEATURE 2: TIME-OF-DAY PERFORMANCE
// ----------------------------------------------------
export interface TimeOfDayHourMetric {
  hour: number;
  label: string;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  netPnl: number;
  avgPnl: number;
  avgR: number;
}

export function calculateTimeOfDayAnalytics(trades: Trade[]): TimeOfDayHourMetric[] {
  const hours: Record<number, {
    count: number;
    wins: number;
    losses: number;
    pnl: number;
    rMultiples: number[];
  }> = {};

  for (let i = 0; i < 24; i++) {
    hours[i] = { count: 0, wins: 0, losses: 0, pnl: 0, rMultiples: [] };
  }

  trades.forEach(t => {
    let hour = 12; // default midday
    if (t.time) {
      const parts = t.time.split(':');
      if (parts.length >= 1) {
        const parsedH = parseInt(parts[0], 10);
        if (!isNaN(parsedH) && parsedH >= 0 && parsedH <= 23) {
          hour = parsedH;
        }
      }
    } else if (t.date) {
      hour = new Date(t.date).getHours();
    }

    const pnl = safeNumber(t.pnl);
    const isWin = t.result === 'WIN' || pnl > 0;
    const isLoss = t.result === 'LOSS' || pnl < 0;
    const r = safeNumber(t.rMultiple || (t.risk && t.risk > 0 ? pnl / t.risk : 0));

    hours[hour].count++;
    if (isWin) hours[hour].wins++;
    if (isLoss) hours[hour].losses++;
    hours[hour].pnl += pnl;
    if (r !== 0 || isWin || isLoss) {
      hours[hour].rMultiples.push(r);
    }
  });

  return Object.keys(hours).map(hStr => {
    const h = parseInt(hStr, 10);
    const d = hours[h];
    const winRate = d.count > 0 ? Number(((d.wins / d.count) * 100).toFixed(1)) : 0;
    const avgPnl = d.count > 0 ? Number((d.pnl / d.count).toFixed(2)) : 0;
    const avgR = d.rMultiples.length > 0 
      ? Number((d.rMultiples.reduce((a, b) => a + b, 0) / d.rMultiples.length).toFixed(2)) 
      : 0;

    const formattedHour = `${h.toString().padStart(2, '0')}:00`;

    return {
      hour: h,
      label: formattedHour,
      tradeCount: d.count,
      winCount: d.wins,
      lossCount: d.losses,
      winRate,
      netPnl: d.pnl,
      avgPnl,
      avgR
    };
  });
}

// ----------------------------------------------------
// FEATURE 3: RISK DISCIPLINE MATRIX
// ----------------------------------------------------
export interface RiskDisciplineAnalytics {
  avgPlannedRisk: number;
  avgActualRisk: number;
  avgDeviationPct: number;
  maxDeviationPct: number;
  tradesAbovePlannedRisk: number;
  tradesBelowPlannedRisk: number;
  tradesOnPlannedRisk: number;
  riskEscalationAfterWinsPct: number;
  riskEscalationAfterLossesPct: number;
  disciplinedTradesPct: number;
  riskDeviationHistory: Array<{
    date: number;
    market: string;
    plannedRisk: number;
    actualRisk: number;
    deviation: number;
    result: string;
  }>;
}

export function calculateRiskDisciplineAnalytics(trades: Trade[]): RiskDisciplineAnalytics {
  const sorted = [...trades].sort((a, b) => (a.date || 0) - (b.date || 0));
  
  let totalPlanned = 0;
  let totalActual = 0;
  let totalDeviation = 0;
  let maxDeviation = 0;
  let aboveCount = 0;
  let belowCount = 0;
  let onCount = 0;

  const deviations: Array<{
    date: number;
    market: string;
    plannedRisk: number;
    actualRisk: number;
    deviation: number;
    result: string;
  }> = [];

  let winEscalationCount = 0;
  let winEligibleCount = 0;
  let lossEscalationCount = 0;
  let lossEligibleCount = 0;

  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const plannedRisk = safeNumber(t.risk || (t.riskPercent ? (10000 * t.riskPercent / 100) : 50));
    
    // Compute actual loss risk taken (from SL distance or actual loss amount)
    let actualRisk = plannedRisk;
    if (t.entry && t.stopLoss && t.positionSize) {
      const dist = Math.abs(t.entry - t.stopLoss);
      actualRisk = dist * t.positionSize * (t.market?.includes('JPY') ? 1000 : 1);
    } else if (t.result === 'LOSS' && t.pnl) {
      actualRisk = Math.abs(t.pnl);
    }

    const dev = actualRisk - plannedRisk;
    const devPct = plannedRisk > 0 ? (dev / plannedRisk) * 100 : 0;

    totalPlanned += plannedRisk;
    totalActual += actualRisk;
    totalDeviation += Math.abs(devPct);
    if (Math.abs(devPct) > maxDeviation) {
      maxDeviation = Math.abs(devPct);
    }

    if (devPct > 5) aboveCount++;
    else if (devPct < -5) belowCount++;
    else onCount++;

    deviations.push({
      date: t.date || Date.now(),
      market: t.market || t.pair || 'Trade',
      plannedRisk,
      actualRisk,
      deviation: Number(devPct.toFixed(1)),
      result: t.result || 'CLOSED'
    });

    // Escalation check compared to prior trade
    if (i > 0) {
      const prev = sorted[i - 1];
      const prevPlanned = safeNumber(prev.risk || 50);
      const isPrevWin = prev.result === 'WIN' || (prev.pnl && prev.pnl > 0);
      const isPrevLoss = prev.result === 'LOSS' || (prev.pnl && prev.pnl < 0);

      if (isPrevWin) {
        winEligibleCount++;
        if (actualRisk > prevPlanned * 1.15) {
          winEscalationCount++;
        }
      } else if (isPrevLoss) {
        lossEligibleCount++;
        if (actualRisk > prevPlanned * 1.15) {
          lossEscalationCount++;
        }
      }
    }
  }

  const n = sorted.length || 1;
  const avgPlannedRisk = Number((totalPlanned / n).toFixed(2));
  const avgActualRisk = Number((totalActual / n).toFixed(2));
  const avgDeviationPct = Number((totalDeviation / n).toFixed(1));
  const disciplinedTradesPct = Number(((onCount / n) * 100).toFixed(1));

  const riskEscalationAfterWinsPct = winEligibleCount > 0 
    ? Number(((winEscalationCount / winEligibleCount) * 100).toFixed(1)) 
    : 0;

  const riskEscalationAfterLossesPct = lossEligibleCount > 0 
    ? Number(((lossEscalationCount / lossEligibleCount) * 100).toFixed(1)) 
    : 0;

  return {
    avgPlannedRisk,
    avgActualRisk,
    avgDeviationPct,
    maxDeviationPct: Number(maxDeviation.toFixed(1)),
    tradesAbovePlannedRisk: aboveCount,
    tradesBelowPlannedRisk: belowCount,
    tradesOnPlannedRisk: onCount,
    riskEscalationAfterWinsPct,
    riskEscalationAfterLossesPct,
    disciplinedTradesPct,
    riskDeviationHistory: deviations
  };
}

// ----------------------------------------------------
// FEATURE 4: DRAWDOWN & RECOVERY PROFILE
// ----------------------------------------------------
export interface DrawdownEpisode {
  id: number;
  depthDollars: number;
  depthPercent: number;
  durationTrades: number;
  recoveryDurationTrades: number;
  peakDate: number;
  troughDate: number;
  recoveryDate?: number;
  isRecovered: boolean;
}

export interface DrawdownRecoveryAnalytics {
  maxDrawdownDollars: number;
  maxDrawdownPercent: number;
  avgDrawdownDollars: number;
  currentDrawdownDollars: number;
  currentDrawdownPercent: number;
  drawdownEpisodesCount: number;
  avgDrawdownDurationTrades: number;
  avgRecoveryDurationTrades: number;
  largestRecoveryDollars: number;
  equityCurveWithDrawdown: Array<{
    index: number;
    date: number;
    equity: number;
    peakEquity: number;
    drawdown: number;
    drawdownPct: number;
  }>;
  episodes: DrawdownEpisode[];
}

export function calculateDrawdownRecoveryAnalytics(trades: Trade[], startingBalance: number = 10000): DrawdownRecoveryAnalytics {
  const sorted = [...trades].sort((a, b) => (a.date || 0) - (b.date || 0));

  let runningEquity = startingBalance;
  let peakEquity = startingBalance;
  let maxDdDollars = 0;
  let maxDdPct = 0;
  let largestRecovery = 0;

  const curve: Array<{
    index: number;
    date: number;
    equity: number;
    peakEquity: number;
    drawdown: number;
    drawdownPct: number;
  }> = [];

  const episodes: DrawdownEpisode[] = [];
  let currentEpisode: Partial<DrawdownEpisode> | null = null;
  let episodeCounter = 1;

  for (let i = 0; i < sorted.length; i++) {
    const t = sorted[i];
    const pnl = safeNumber(t.pnl);
    runningEquity += pnl;

    if (runningEquity >= peakEquity) {
      // In new all-time high territory
      if (currentEpisode && !currentEpisode.isRecovered) {
        currentEpisode.recoveryDate = t.date || Date.now();
        currentEpisode.recoveryDurationTrades = i - (currentEpisode.durationTrades || 0);
        currentEpisode.isRecovered = true;
        episodes.push(currentEpisode as DrawdownEpisode);
        const recoveryAmt = (currentEpisode.depthDollars || 0);
        if (recoveryAmt > largestRecovery) {
          largestRecovery = recoveryAmt;
        }
        currentEpisode = null;
      }
      peakEquity = runningEquity;
    } else {
      // In drawdown
      const ddDollars = peakEquity - runningEquity;
      const ddPct = (ddDollars / peakEquity) * 100;

      if (ddDollars > maxDdDollars) maxDdDollars = ddDollars;
      if (ddPct > maxDdPct) maxDdPct = ddPct;

      if (!currentEpisode) {
        currentEpisode = {
          id: episodeCounter++,
          depthDollars: ddDollars,
          depthPercent: ddPct,
          peakDate: sorted[i - 1]?.date || t.date || Date.now(),
          troughDate: t.date || Date.now(),
          durationTrades: 1,
          isRecovered: false
        };
      } else {
        if (ddDollars > (currentEpisode.depthDollars || 0)) {
          currentEpisode.depthDollars = ddDollars;
          currentEpisode.depthPercent = ddPct;
          currentEpisode.troughDate = t.date || Date.now();
        }
        currentEpisode.durationTrades = (currentEpisode.durationTrades || 0) + 1;
      }
    }

    const currentDdDollars = peakEquity - runningEquity;
    const currentDdPct = (currentDdDollars / peakEquity) * 100;

    curve.push({
      index: i + 1,
      date: t.date || Date.now(),
      equity: runningEquity,
      peakEquity,
      drawdown: -currentDdDollars,
      drawdownPct: -currentDdPct
    });
  }

  if (currentEpisode) {
    episodes.push(currentEpisode as DrawdownEpisode);
  }

  const currentDdDollars = peakEquity - runningEquity;
  const currentDdPct = peakEquity > 0 ? (currentDdDollars / peakEquity) * 100 : 0;

  const avgDrawdownDollars = episodes.length > 0
    ? episodes.reduce((acc, e) => acc + e.depthDollars, 0) / episodes.length
    : 0;

  const recoveredEpisodes = episodes.filter(e => e.isRecovered);
  const avgDrawdownDurationTrades = episodes.length > 0
    ? Number((episodes.reduce((acc, e) => acc + (e.durationTrades || 1), 0) / episodes.length).toFixed(1))
    : 0;

  const avgRecoveryDurationTrades = recoveredEpisodes.length > 0
    ? Number((recoveredEpisodes.reduce((acc, e) => acc + (e.recoveryDurationTrades || 1), 0) / recoveredEpisodes.length).toFixed(1))
    : 0;

  return {
    maxDrawdownDollars: Number(maxDdDollars.toFixed(2)),
    maxDrawdownPercent: Number(maxDdPct.toFixed(2)),
    avgDrawdownDollars: Number(avgDrawdownDollars.toFixed(2)),
    currentDrawdownDollars: Number(currentDdDollars.toFixed(2)),
    currentDrawdownPercent: Number(currentDdPct.toFixed(2)),
    drawdownEpisodesCount: episodes.length,
    avgDrawdownDurationTrades,
    avgRecoveryDurationTrades,
    largestRecoveryDollars: Number(largestRecovery.toFixed(2)),
    equityCurveWithDrawdown: curve,
    episodes
  };
}

// ----------------------------------------------------
// FEATURE 5: EXIT EFFICIENCY / MFE-MAE
// ----------------------------------------------------
export interface ExitEfficiencyAnalytics {
  hasPricePathData: boolean;
  eligibleTradesCount: number;
  avgMfePoints: number;
  avgMaePoints: number;
  avgExitCaptureEfficiencyPct: number;
  earlyExitTradesCount: number;
  optimalExitTradesCount: number;
  lateExitTradesCount: number;
  tradesBreakdown: Array<{
    id: string;
    market: string;
    direction: string;
    entry: number;
    exit?: number;
    takeProfit?: number;
    stopLoss?: number;
    mfe?: number;
    mae?: number;
    exitEfficiencyPct?: number;
    hasIntratradeData: boolean;
  }>;
}

export function calculateExitEfficiencyAnalytics(trades: Trade[]): ExitEfficiencyAnalytics {
  let eligibleCount = 0;
  let totalEfficiency = 0;
  let earlyExits = 0;
  let optimalExits = 0;
  let lateExits = 0;
  let totalMfe = 0;
  let totalMae = 0;

  const breakdown = trades.map(t => {
    const entry = safeNumber(t.entry);
    const tp = safeNumber(t.takeProfit);
    const sl = safeNumber(t.stopLoss);
    const exit = safeNumber(t.exitPrice || (t as any).exit || (t.pnl && t.positionSize ? (t.direction === 'BUY' ? entry + t.pnl / t.positionSize : entry - t.pnl / t.positionSize) : 0));
    
    // Check if real MFE/MAE metadata exists on the trade record
    const customMfe = (t as any).mfePrice || (t as any).maxFavorableExcursion;
    const customMae = (t as any).maePrice || (t as any).maxAdverseExcursion;

    const hasIntratrade = Boolean(customMfe || (tp > 0 && sl > 0 && exit > 0));

    let mfe = 0;
    let mae = 0;
    let efficiency = 0;

    if (hasIntratrade && entry > 0 && exit > 0) {
      eligibleCount++;
      const isBuy = t.direction === 'BUY';
      
      // Calculate Excursions
      if (customMfe) {
        mfe = isBuy ? customMfe - entry : entry - customMfe;
      } else if (tp > 0) {
        mfe = Math.abs(tp - entry); // Target reached as ideal MFE
      }

      if (customMae) {
        mae = isBuy ? entry - customMae : customMae - entry;
      } else if (sl > 0) {
        mae = Math.abs(entry - sl) * 0.4;
      }

      const capturedMove = isBuy ? exit - entry : entry - exit;
      if (mfe > 0) {
        efficiency = Math.max(0, Math.min(100, (capturedMove / mfe) * 100));
        totalEfficiency += efficiency;
        totalMfe += mfe;
        totalMae += mae;

        if (efficiency > 75) optimalExits++;
        else if (efficiency > 0 && efficiency <= 50 && t.result === 'WIN') earlyExits++;
        else if (t.result === 'LOSS' || efficiency <= 0) lateExits++;
      }
    }

    return {
      id: t.id,
      market: t.market || t.pair || 'Trade',
      direction: t.direction || 'BUY',
      entry,
      exit: exit > 0 ? exit : undefined,
      takeProfit: tp > 0 ? tp : undefined,
      stopLoss: sl > 0 ? sl : undefined,
      mfe: mfe > 0 ? Number(mfe.toFixed(4)) : undefined,
      mae: mae > 0 ? Number(mae.toFixed(4)) : undefined,
      exitEfficiencyPct: efficiency > 0 ? Number(efficiency.toFixed(1)) : undefined,
      hasIntratradeData: hasIntratrade
    };
  });

  const avgExitCaptureEfficiencyPct = eligibleCount > 0 
    ? Number((totalEfficiency / eligibleCount).toFixed(1))
    : 0;

  return {
    hasPricePathData: eligibleCount > 0,
    eligibleTradesCount: eligibleCount,
    avgMfePoints: eligibleCount > 0 ? Number((totalMfe / eligibleCount).toFixed(4)) : 0,
    avgMaePoints: eligibleCount > 0 ? Number((totalMae / eligibleCount).toFixed(4)) : 0,
    avgExitCaptureEfficiencyPct,
    earlyExitTradesCount: earlyExits,
    optimalExitTradesCount: optimalExits,
    lateExitTradesCount: lateExits,
    tradesBreakdown: breakdown
  };
}

// ----------------------------------------------------
// FEATURE 6: EXPECTANCY & EDGE DECOMPOSITION
// ----------------------------------------------------
export interface ExpectancyDecompositionAnalytics {
  winRate: number;
  lossRate: number;
  winCount: number;
  lossCount: number;
  breakEvenCount: number;
  totalTrades: number;
  avgWinDollars: number;
  avgLossDollars: number;
  avgRDollars: number;
  payoffRatio: number;
  profitFactor: number;
  mathematicalExpectancy: number; // in $ per trade
  expectancyRMultiple: number;   // in R per trade
  grossProfit: number;
  grossLoss: number;
  winContributionPct: number;
  lossDragPct: number;
  totalTradingCostImpact: number; // commissions + swap if recorded
  formulas: {
    expectancyFormula: string;
    profitFactorFormula: string;
    payoffFormula: string;
  };
}

export function calculateExpectancyDecomposition(trades: Trade[]): ExpectancyDecompositionAnalytics {
  const completed = trades.filter(t => t.result && t.result !== 'PENDING');
  const n = completed.length || 1;

  const wins = completed.filter(t => t.result === 'WIN' || (t.pnl && t.pnl > 0));
  const losses = completed.filter(t => t.result === 'LOSS' || (t.pnl && t.pnl < 0));
  const breakEvens = completed.filter(t => t.result === 'BREAK EVEN' || t.pnl === 0);

  const grossProfit = wins.reduce((acc, t) => acc + safeNumber(t.pnl), 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + safeNumber(t.pnl), 0));

  const winRate = Number(((wins.length / n) * 100).toFixed(1));
  const lossRate = Number(((losses.length / n) * 100).toFixed(1));

  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

  const payoffRatio = avgLoss > 0 ? Number((avgWin / avgLoss).toFixed(2)) : (avgWin > 0 ? 99 : 0);
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 99 : 0);

  // Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
  const pWin = wins.length / n;
  const pLoss = losses.length / n;
  const mathematicalExpectancy = (pWin * avgWin) - (pLoss * avgLoss);

  // Expectancy in R = (pWin * avgRWin) - (pLoss * avgRLoss)
  const rValues = completed.map(t => safeNumber(t.rMultiple || (t.risk && t.risk > 0 ? safeNumber(t.pnl) / t.risk : 0)));
  const avgR = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0;

  const totalCost = completed.reduce((acc, t) => {
    const meta = t.mt5ScreenshotMetadata as any;
    const comm = safeNumber(meta?.commission);
    const swap = safeNumber(meta?.swap);
    return acc + Math.abs(comm) + Math.abs(swap);
  }, 0);

  const totalVolume = grossProfit + grossLoss;
  const winContributionPct = totalVolume > 0 ? Number(((grossProfit / totalVolume) * 100).toFixed(1)) : 0;
  const lossDragPct = totalVolume > 0 ? Number(((grossLoss / totalVolume) * 100).toFixed(1)) : 0;

  return {
    winRate,
    lossRate,
    winCount: wins.length,
    lossCount: losses.length,
    breakEvenCount: breakEvens.length,
    totalTrades: completed.length,
    avgWinDollars: Number(avgWin.toFixed(2)),
    avgLossDollars: Number(avgLoss.toFixed(2)),
    avgRDollars: Number(avgR.toFixed(2)),
    payoffRatio,
    profitFactor,
    mathematicalExpectancy: Number(mathematicalExpectancy.toFixed(2)),
    expectancyRMultiple: Number(avgR.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    grossLoss: Number(grossLoss.toFixed(2)),
    winContributionPct,
    lossDragPct,
    totalTradingCostImpact: Number(totalCost.toFixed(2)),
    formulas: {
      expectancyFormula: 'E = (P_win × Avg_Win) - (P_loss × Avg_Loss)',
      profitFactorFormula: 'PF = Total Gross Profit / Total Gross Loss',
      payoffFormula: 'Payoff = Average Win ($) / Average Loss ($)'
    }
  };
}

// ----------------------------------------------------
// FEATURE 7: HOLDING-TIME EFFICIENCY
// ----------------------------------------------------
export interface HoldingTimeBucket {
  range: string;
  label: string;
  tradeCount: number;
  winRate: number;
  netPnl: number;
  avgR: number;
}

export interface HoldingTimeAnalytics {
  avgHoldingMinutes: number;
  medianHoldingMinutes: number;
  avgWinDurationMinutes: number;
  avgLossDurationMinutes: number;
  shortestProfitableTrade: { market: string; minutes: number; pnl: number } | null;
  longestLosingTrade: { market: string; minutes: number; pnl: number } | null;
  buckets: HoldingTimeBucket[];
  scatterData: Array<{
    market: string;
    minutes: number;
    pnl: number;
    rMultiple: number;
    result: string;
  }>;
}

export function calculateHoldingTimeAnalytics(trades: Trade[]): HoldingTimeAnalytics {
  const validTrades: Array<{
    market: string;
    minutes: number;
    pnl: number;
    rMultiple: number;
    result: string;
  }> = [];

  trades.forEach(t => {
    // Estimate holding time from open and close timestamps or timeframe
    let durationMins = 0;
    if (t.openTime && t.closeTime) {
      const open = new Date(t.openTime).getTime();
      const close = new Date(t.closeTime).getTime();
      if (close > open) durationMins = Math.round((close - open) / 60000);
    }

    if (durationMins <= 0) {
      // Approximate from timeframe if available
      const tf = t.timeframe || '15m';
      if (tf.includes('1m')) durationMins = 12;
      else if (tf.includes('5m')) durationMins = 35;
      else if (tf.includes('15m')) durationMins = 75;
      else if (tf.includes('1h') || tf.includes('H1')) durationMins = 240;
      else if (tf.includes('4h') || tf.includes('H4')) durationMins = 720;
      else if (tf.includes('D') || tf.includes('Daily')) durationMins = 1440;
      else durationMins = 60;
    }

    const pnl = safeNumber(t.pnl);
    const r = safeNumber(t.rMultiple || (t.risk && t.risk > 0 ? pnl / t.risk : 0));

    validTrades.push({
      market: t.market || t.pair || 'Trade',
      minutes: durationMins,
      pnl,
      rMultiple: r,
      result: t.result || (pnl >= 0 ? 'WIN' : 'LOSS')
    });
  });

  if (validTrades.length === 0) {
    return {
      avgHoldingMinutes: 0,
      medianHoldingMinutes: 0,
      avgWinDurationMinutes: 0,
      avgLossDurationMinutes: 0,
      shortestProfitableTrade: null,
      longestLosingTrade: null,
      buckets: [],
      scatterData: []
    };
  }

  const sortedMins = [...validTrades].map(v => v.minutes).sort((a, b) => a - b);
  const mid = Math.floor(sortedMins.length / 2);
  const median = sortedMins.length % 2 !== 0 ? sortedMins[mid] : (sortedMins[mid - 1] + sortedMins[mid]) / 2;

  const wins = validTrades.filter(v => v.result === 'WIN' || v.pnl > 0);
  const losses = validTrades.filter(v => v.result === 'LOSS' || v.pnl < 0);

  const avgWinDuration = wins.length > 0 ? wins.reduce((acc, w) => acc + w.minutes, 0) / wins.length : 0;
  const avgLossDuration = losses.length > 0 ? losses.reduce((acc, l) => acc + l.minutes, 0) / losses.length : 0;
  const avgHolding = validTrades.reduce((acc, v) => acc + v.minutes, 0) / validTrades.length;

  const shortestProfitable = wins.length > 0 
    ? [...wins].sort((a, b) => a.minutes - b.minutes)[0]
    : null;

  const longestLosing = losses.length > 0
    ? [...losses].sort((a, b) => b.minutes - a.minutes)[0]
    : null;

  // Bucket classification: < 15m, 15m-1h, 1h-4h, 4h-1d, > 1d
  const bucketDefs = [
    { range: '<15m', label: 'Scalp (< 15m)', min: 0, max: 15 },
    { range: '15m-1h', label: 'Short Intraday (15m-1h)', min: 15, max: 60 },
    { range: '1h-4h', label: 'Medium Intraday (1h-4h)', min: 60, max: 240 },
    { range: '4h-1d', label: 'Extended Intraday (4h-24h)', min: 240, max: 1440 },
    { range: '>1d', label: 'Swing (> 24h)', min: 1440, max: Infinity }
  ];

  const buckets: HoldingTimeBucket[] = bucketDefs.map(b => {
    const matching = validTrades.filter(t => t.minutes >= b.min && t.minutes < b.max);
    const winCount = matching.filter(m => m.result === 'WIN' || m.pnl > 0).length;
    const netPnl = matching.reduce((acc, m) => acc + m.pnl, 0);
    const avgR = matching.length > 0 ? matching.reduce((acc, m) => acc + m.rMultiple, 0) / matching.length : 0;

    return {
      range: b.range,
      label: b.label,
      tradeCount: matching.length,
      winRate: matching.length > 0 ? Number(((winCount / matching.length) * 100).toFixed(1)) : 0,
      netPnl: Number(netPnl.toFixed(2)),
      avgR: Number(avgR.toFixed(2))
    };
  });

  return {
    avgHoldingMinutes: Math.round(avgHolding),
    medianHoldingMinutes: Math.round(median),
    avgWinDurationMinutes: Math.round(avgWinDuration),
    avgLossDurationMinutes: Math.round(avgLossDuration),
    shortestProfitableTrade: shortestProfitable ? {
      market: shortestProfitable.market,
      minutes: shortestProfitable.minutes,
      pnl: shortestProfitable.pnl
    } : null,
    longestLosingTrade: longestLosing ? {
      market: longestLosing.market,
      minutes: longestLosing.minutes,
      pnl: longestLosing.pnl
    } : null,
    buckets,
    scatterData: validTrades
  };
}

// ----------------------------------------------------
// FEATURE 8: RULE ADHERENCE IMPACT
// ----------------------------------------------------
export interface RuleAdherenceAnalytics {
  totalTradesWithChecklist: number;
  overallAdherenceRate: number;
  pnlWhenRulesFollowed: number;
  pnlWhenRulesViolated: number;
  avgRWhenRulesFollowed: number;
  avgRWhenRulesViolated: number;
  winRateWhenFollowed: number;
  winRateWhenViolated: number;
  totalViolationsCount: number;
  mostViolatedRules: Array<{
    ruleText: string;
    violationCount: number;
    impactDollars: number;
  }>;
}

export function calculateRuleAdherenceImpact(trades: Trade[], rules: Rule[] = []): RuleAdherenceAnalytics {
  let followedTrades: Trade[] = [];
  let violatedTrades: Trade[] = [];

  const violationMap: Record<string, { count: number; pnlImpact: number }> = {};

  trades.forEach(t => {
    const adherence = t.ruleAdherence !== undefined ? t.ruleAdherence : (t.mistake ? 0 : 100);
    const hasViolation = adherence < 80 || Boolean(t.mistake);

    if (hasViolation) {
      violatedTrades.push(t);
      const ruleName = t.mistake || 'Incomplete Checklist';
      if (!violationMap[ruleName]) {
        violationMap[ruleName] = { count: 0, pnlImpact: 0 };
      }
      violationMap[ruleName].count++;
      violationMap[ruleName].pnlImpact += safeNumber(t.pnl);
    } else {
      followedTrades.push(t);
    }
  });

  const pnlFollowed = followedTrades.reduce((acc, t) => acc + safeNumber(t.pnl), 0);
  const pnlViolated = violatedTrades.reduce((acc, t) => acc + safeNumber(t.pnl), 0);

  const rFollowed = followedTrades.map(t => safeNumber(t.rMultiple || (t.risk && t.risk > 0 ? safeNumber(t.pnl) / t.risk : 0)));
  const rViolated = violatedTrades.map(t => safeNumber(t.rMultiple || (t.risk && t.risk > 0 ? safeNumber(t.pnl) / t.risk : 0)));

  const avgRFollowed = rFollowed.length > 0 ? rFollowed.reduce((a, b) => a + b, 0) / rFollowed.length : 0;
  const avgRViolated = rViolated.length > 0 ? rViolated.reduce((a, b) => a + b, 0) / rViolated.length : 0;

  const winFollowed = followedTrades.filter(t => t.result === 'WIN' || (t.pnl && t.pnl > 0)).length;
  const winViolated = violatedTrades.filter(t => t.result === 'WIN' || (t.pnl && t.pnl > 0)).length;

  const winRateFollowed = followedTrades.length > 0 ? (winFollowed / followedTrades.length) * 100 : 0;
  const winRateViolated = violatedTrades.length > 0 ? (winViolated / violatedTrades.length) * 100 : 0;

  const total = trades.length || 1;
  const overallAdherenceRate = Number(((followedTrades.length / total) * 100).toFixed(1));

  const mostViolated = Object.entries(violationMap)
    .map(([ruleText, data]) => ({
      ruleText,
      violationCount: data.count,
      impactDollars: Number(data.pnlImpact.toFixed(2))
    }))
    .sort((a, b) => b.violationCount - a.violationCount);

  return {
    totalTradesWithChecklist: trades.length,
    overallAdherenceRate,
    pnlWhenRulesFollowed: Number(pnlFollowed.toFixed(2)),
    pnlWhenRulesViolated: Number(pnlViolated.toFixed(2)),
    avgRWhenRulesFollowed: Number(avgRFollowed.toFixed(2)),
    avgRWhenRulesViolated: Number(avgRViolated.toFixed(2)),
    winRateWhenFollowed: Number(winRateFollowed.toFixed(1)),
    winRateWhenViolated: Number(winRateViolated.toFixed(1)),
    totalViolationsCount: violatedTrades.length,
    mostViolatedRules: mostViolated
  };
}

// ----------------------------------------------------
// FEATURE 9: DAY-OF-WEEK PERFORMANCE
// ----------------------------------------------------
export interface DayOfWeekMetric {
  dayIndex: number;
  dayName: string;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  netPnl: number;
  avgPnl: number;
  avgR: number;
  avgHoldingMinutes: number;
}

export function calculateDayOfWeekAnalytics(trades: Trade[]): DayOfWeekMetric[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const dayData: Record<number, {
    count: number;
    wins: number;
    losses: number;
    pnl: number;
    rMultiples: number[];
    holdingMins: number[];
  }> = {};

  for (let i = 0; i < 7; i++) {
    dayData[i] = { count: 0, wins: 0, losses: 0, pnl: 0, rMultiples: [], holdingMins: [] };
  }

  trades.forEach(t => {
    let dayIdx = 1;
    if (t.date) {
      dayIdx = new Date(t.date).getDay();
    }

    const pnl = safeNumber(t.pnl);
    const isWin = t.result === 'WIN' || pnl > 0;
    const isLoss = t.result === 'LOSS' || pnl < 0;
    const r = safeNumber(t.rMultiple || (t.risk && t.risk > 0 ? pnl / t.risk : 0));

    dayData[dayIdx].count++;
    if (isWin) dayData[dayIdx].wins++;
    if (isLoss) dayData[dayIdx].losses++;
    dayData[dayIdx].pnl += pnl;
    dayData[dayIdx].rMultiples.push(r);
    dayData[dayIdx].holdingMins.push(60);
  });

  // Display Monday through Friday, plus Sunday/Saturday if they have trades
  const orderedIndices = [1, 2, 3, 4, 5];
  if (dayData[0].count > 0) orderedIndices.unshift(0);
  if (dayData[6].count > 0) orderedIndices.push(6);

  return orderedIndices.map(dIdx => {
    const d = dayData[dIdx];
    const winRate = d.count > 0 ? Number(((d.wins / d.count) * 100).toFixed(1)) : 0;
    const avgPnl = d.count > 0 ? Number((d.pnl / d.count).toFixed(2)) : 0;
    const avgR = d.rMultiples.length > 0 
      ? Number((d.rMultiples.reduce((a, b) => a + b, 0) / d.rMultiples.length).toFixed(2))
      : 0;
    const avgHolding = d.holdingMins.length > 0
      ? Math.round(d.holdingMins.reduce((a, b) => a + b, 0) / d.holdingMins.length)
      : 0;

    return {
      dayIndex: dIdx,
      dayName: days[dIdx],
      tradeCount: d.count,
      winCount: d.wins,
      lossCount: d.losses,
      winRate,
      netPnl: Number(d.pnl.toFixed(2)),
      avgPnl,
      avgR,
      avgHoldingMinutes: avgHolding
    };
  });
}

// ----------------------------------------------------
// FEATURE 10: CONSISTENCY & PROCESS SCORE
// ----------------------------------------------------
export interface ComponentProcessScore {
  name: string;
  score: number | null; // null if insufficient data
  weight: number;
  description: string;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'INSUFFICIENT_DATA';
}

export interface ConsistencyProcessScoreAnalytics {
  overallScore: number | null;
  components: ComponentProcessScore[];
  summaryNote: string;
}

export function calculateConsistencyProcessScore(trades: Trade[], rules: Rule[] = []): ConsistencyProcessScoreAnalytics {
  if (trades.length < 5) {
    return {
      overallScore: null,
      components: [
        { name: 'Risk Discipline', score: null, weight: 25, description: 'Deviation between planned and actual risk', status: 'INSUFFICIENT_DATA' },
        { name: 'Rule Adherence', score: null, weight: 20, description: 'Execution alignment with trading rules', status: 'INSUFFICIENT_DATA' },
        { name: 'Journal Completion', score: null, weight: 20, description: 'Documentation depth, notes, and screenshots', status: 'INSUFFICIENT_DATA' },
        { name: 'Risk Consistency', score: null, weight: 15, description: 'Stable position sizing and risk per trade', status: 'INSUFFICIENT_DATA' },
        { name: 'Psychology & Setup Quality', score: null, weight: 20, description: 'Logging emotions, setup grades, and learnings', status: 'INSUFFICIENT_DATA' }
      ],
      summaryNote: 'Requires at least 5 recorded trades for initial process scoring.'
    };
  }

  const n = trades.length;

  // 1. Risk Discipline Score (0 to 100)
  const riskAnalysis = calculateRiskDisciplineAnalytics(trades);
  const riskDisciplineScore = Math.max(0, Math.min(100, Math.round(100 - riskAnalysis.avgDeviationPct * 1.5)));

  // 2. Rule Adherence Score (0 to 100)
  const ruleAnalysis = calculateRuleAdherenceImpact(trades, rules);
  const ruleAdherenceScore = Math.round(ruleAnalysis.overallAdherenceRate);

  // 3. Journal Completion Score
  let journalPoints = 0;
  trades.forEach(t => {
    if (t.notes && t.notes.trim().length > 10) journalPoints += 25;
    if (t.strategy) journalPoints += 25;
    if (t.screenshot || t.entryScreenshot || t.mt5ScreenshotUrl) journalPoints += 25;
    if (t.mistake || t.learning) journalPoints += 25;
  });
  const journalCompletionScore = Math.min(100, Math.round(journalPoints / n));

  // 4. Risk Consistency (Standard Deviation of risk amount)
  const riskAmounts = trades.map(t => safeNumber(t.risk || 50));
  const avgRisk = riskAmounts.reduce((a, b) => a + b, 0) / n;
  const variance = riskAmounts.reduce((acc, r) => acc + Math.pow(r - avgRisk, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const cv = avgRisk > 0 ? (stdDev / avgRisk) * 100 : 0;
  const riskConsistencyScore = Math.max(0, Math.min(100, Math.round(100 - cv * 0.8)));

  // 5. Psychology & Setup Quality Recording
  let psychPoints = 0;
  trades.forEach(t => {
    if (t.setupQuality) psychPoints += 50;
    if (t.emotions && t.emotions.length > 0) psychPoints += 50;
  });
  const psychScore = Math.min(100, Math.round(psychPoints / n));

  const getStatus = (score: number): 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' => {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    return 'NEEDS_ATTENTION';
  };

  const components: ComponentProcessScore[] = [
    {
      name: 'Risk Discipline',
      score: riskDisciplineScore,
      weight: 25,
      description: 'Adherence to planned risk parameters without emotional sizing inflation',
      status: getStatus(riskDisciplineScore)
    },
    {
      name: 'Rule Adherence',
      score: ruleAdherenceScore,
      weight: 20,
      description: 'Pre-trade discipline checklist adherence and violation control',
      status: getStatus(ruleAdherenceScore)
    },
    {
      name: 'Journal Completion',
      score: journalCompletionScore,
      weight: 20,
      description: 'Execution note depth, strategy labeling, and chart screenshot archiving',
      status: getStatus(journalCompletionScore)
    },
    {
      name: 'Risk Consistency',
      score: riskConsistencyScore,
      weight: 15,
      description: 'Position size stability preventing erratic leverage spikes',
      status: getStatus(riskConsistencyScore)
    },
    {
      name: 'Psychology & Setup Quality',
      score: psychScore,
      weight: 20,
      description: 'Consistent tracking of emotional state and A+/B/C setup grades',
      status: getStatus(psychScore)
    }
  ];

  const overallScore = Math.round(
    components.reduce((acc, c) => acc + (c.score || 0) * (c.weight / 100), 0)
  );

  return {
    overallScore,
    components,
    summaryNote: 'Historical process scorecard evaluated across observable execution behaviors.'
  };
}
