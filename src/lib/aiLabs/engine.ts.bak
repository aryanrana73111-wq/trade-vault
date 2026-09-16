import { Trade, Session } from '@/types';
import { 
  AIObservation, 
  PeriodComparison, 
  DiscoveredPattern, 
  Hypothesis, 
  ScenarioSimulationResult, 
  AIAlert, 
  DataQualityAudit, 
  AIAnswerResponse, 
  EvidenceLevel, 
  AnalysisDateRange, 
  DataAccessPermissions, 
  FocusArea,
  AIMode 
} from '@/types/aiLabs';

// ---------------------------------------------------------------------------
// 1. STATISTICAL & EVIDENCE HELPERS
// ---------------------------------------------------------------------------

export function getEvidenceLevel(sampleSize: number): EvidenceLevel {
  if (sampleSize <= 4) return 'insufficient';
  if (sampleSize <= 14) return 'early';
  if (sampleSize <= 29) return 'preliminary';
  if (sampleSize <= 49) return 'moderate';
  return 'reliable';
}

export function getEvidenceLevelBadge(level: EvidenceLevel): {
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
} {
  switch (level) {
    case 'insufficient':
      return {
        label: 'Insufficient Data (0–4)',
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        dotClass: 'bg-slate-400',
        description: 'Sample size too small to observe a stable historical pattern.'
      };
    case 'early':
      return {
        label: 'Early Evidence (5–14)',
        badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        dotClass: 'bg-amber-500',
        description: 'Emerging pattern observed in a limited sample; high variance expected.'
      };
    case 'preliminary':
      return {
        label: 'Preliminary Observation (15–29)',
        badgeClass: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        dotClass: 'bg-blue-500',
        description: 'Notable historical tendency across a moderate trade sample.'
      };
    case 'moderate':
      return {
        label: 'Moderate Historical Evidence (30–49)',
        badgeClass: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        dotClass: 'bg-indigo-500',
        description: 'Consistent historical pattern supported by a solid trade sample.'
      };
    case 'reliable':
      return {
        label: 'Stronger Historical Evidence (50+)',
        badgeClass: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        dotClass: 'bg-emerald-500',
        description: 'Substantial historical trade history with lower statistical variance.'
      };
  }
}

// ---------------------------------------------------------------------------
// 2. DATE FILTERING & PERIOD COMPARISON ("WHAT CHANGED?")
// ---------------------------------------------------------------------------

export function filterTradesByPeriod(
  trades: Trade[], 
  range: AnalysisDateRange, 
  customStart?: number, 
  customEnd?: number
): { 
  current: Trade[]; 
  previous: Trade[]; 
  currentLabel: string; 
  previousLabel: string 
} {
  const sorted = [...trades].sort((a, b) => b.date - a.date);
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  let days = 30;
  let currentLabel = 'Current 30 Days';
  let previousLabel = 'Previous 30 Days';

  if (range === '7d') {
    days = 7;
    currentLabel = 'Current 7 Days';
    previousLabel = 'Previous 7 Days';
  } else if (range === '30d') {
    days = 30;
    currentLabel = 'Current 30 Days';
    previousLabel = 'Previous 30 Days';
  } else if (range === '90d') {
    days = 90;
    currentLabel = 'Current 90 Days';
    previousLabel = 'Previous 90 Days';
  } else if (range === '6m') {
    days = 182;
    currentLabel = 'Current 6 Months';
    previousLabel = 'Previous 6 Months';
  } else if (range === '1y') {
    days = 365;
    currentLabel = 'Current Year';
    previousLabel = 'Previous Year';
  } else if (range === 'all') {
    // Split all recorded trades in half by count
    const half = Math.floor(sorted.length / 2);
    const current = sorted.slice(0, half);
    const previous = sorted.slice(half);
    return {
      current,
      previous,
      currentLabel: `Recent ${current.length} Trades`,
      previousLabel: `Prior ${previous.length} Trades`
    };
  } else if (range === 'custom' && customStart && customEnd) {
    const duration = customEnd - customStart;
    const current = sorted.filter(t => t.date >= customStart && t.date <= customEnd);
    const prevStart = customStart - duration;
    const previous = sorted.filter(t => t.date >= prevStart && t.date < customStart);
    return {
      current,
      previous,
      currentLabel: 'Custom Period',
      previousLabel: 'Preceding Period'
    };
  }

  const currentCutoff = now - (days * DAY_MS);
  const previousCutoff = now - (days * 2 * DAY_MS);

  const current = sorted.filter(t => t.date >= currentCutoff);
  const previous = sorted.filter(t => t.date >= previousCutoff && t.date < currentCutoff);

  // Fallback: If time-based split leaves previous empty but we have enough trades,
  // split available trades chronologically by count
  if (previous.length === 0 && current.length >= 10) {
    const half = Math.floor(current.length / 2);
    return {
      current: current.slice(0, half),
      previous: current.slice(half),
      currentLabel: `Recent ${half} Trades`,
      previousLabel: `Prior ${current.length - half} Trades`
    };
  }

  return { current, previous, currentLabel, previousLabel };
}

export function computePeriodComparison(
  currentTrades: Trade[], 
  previousTrades: Trade[], 
  currentPeriodLabel: string, 
  previousPeriodLabel: string
): PeriodComparison {
  const calcStats = (trades: Trade[]) => {
    const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
    const wins = closed.filter(t => t.result === 'WIN');
    const losses = closed.filter(t => t.result === 'LOSS');
    
    let grossProfit = 0;
    let grossLoss = 0;
    let totalPnl = 0;
    let totalR = 0;
    let rCount = 0;
    let riskSum = 0;
    let riskCount = 0;
    let adherenceSum = 0;
    let adherenceCount = 0;

    let fomoCount = 0;
    let revengeCount = 0;

    const sessionDist: Record<string, number> = {};
    const stratUsage: Record<string, number> = {};

    trades.forEach(t => {
      const pnl = t.pnl || 0;
      totalPnl += pnl;
      if (pnl > 0) grossProfit += pnl;
      if (pnl < 0) grossLoss += Math.abs(pnl);

      if (t.rMultiple !== undefined && isFinite(t.rMultiple)) {
        totalR += t.rMultiple;
        rCount++;
      } else if (t.risk && t.risk > 0) {
        totalR += (pnl / t.risk);
        rCount++;
      }

      if (t.riskPercent && t.riskPercent > 0) {
        riskSum += t.riskPercent;
        riskCount++;
      } else if (t.risk && t.risk > 0) {
        // approximate risk % if only dollar risk is stored (assuming normalized basis)
        riskSum += (t.risk / 10000) * 100;
        riskCount++;
      }

      if (t.ruleAdherence !== undefined && t.ruleAdherence !== null) {
        adherenceSum += t.ruleAdherence;
        adherenceCount++;
      }

      if (t.emotions?.includes('FOMO')) fomoCount++;
      if (t.emotions?.includes('Revenge')) revengeCount++;

      const s = t.session || 'Unassigned';
      sessionDist[s] = (sessionDist[s] || 0) + 1;

      const strat = t.strategy || 'No Strategy';
      stratUsage[strat] = (stratUsage[strat] || 0) + 1;
    });

    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
    const avgR = rCount > 0 ? totalR / rCount : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 100 : 0);
    const avgRiskPercent = riskCount > 0 ? riskSum / riskCount : 0;
    const ruleAdherence = adherenceCount > 0 ? adherenceSum / adherenceCount : 0;
    const fomoFrequency = trades.length > 0 ? (fomoCount / trades.length) * 100 : 0;
    const revengeFrequency = trades.length > 0 ? (revengeCount / trades.length) * 100 : 0;

    return {
      count: trades.length,
      winRate,
      avgR,
      netR: totalR,
      netPnl: totalPnl,
      profitFactor,
      avgRiskPercent,
      ruleAdherence,
      fomoFrequency,
      revengeFrequency,
      sessionDist,
      stratUsage
    };
  };

  const curr = calcStats(currentTrades);
  const prev = calcStats(previousTrades);

  // Combine session distribution keys
  const allSessions = Array.from(new Set([...Object.keys(curr.sessionDist), ...Object.keys(prev.sessionDist)]));
  const sessionDistribution: Record<string, { current: number; previous: number }> = {};
  allSessions.forEach(s => {
    sessionDistribution[s] = {
      current: curr.sessionDist[s] || 0,
      previous: prev.sessionDist[s] || 0
    };
  });

  // Combine strategy keys
  const allStrats = Array.from(new Set([...Object.keys(curr.stratUsage), ...Object.keys(prev.stratUsage)]));
  const strategyUsage: Record<string, { current: number; previous: number }> = {};
  allStrats.forEach(s => {
    strategyUsage[s] = {
      current: curr.stratUsage[s] || 0,
      previous: prev.stratUsage[s] || 0
    };
  });

  return {
    currentPeriodLabel,
    previousPeriodLabel,
    currentCount: curr.count,
    previousCount: prev.count,
    winRate: { current: curr.winRate, previous: prev.winRate, delta: curr.winRate - prev.winRate },
    avgR: { current: curr.avgR, previous: prev.avgR, delta: curr.avgR - prev.avgR },
    netR: { current: curr.netR, previous: prev.netR, delta: curr.netR - prev.netR },
    netPnl: { current: curr.netPnl, previous: prev.netPnl, delta: curr.netPnl - prev.netPnl },
    profitFactor: { current: curr.profitFactor, previous: prev.profitFactor, delta: curr.profitFactor - prev.profitFactor },
    avgRiskPercent: { current: curr.avgRiskPercent, previous: prev.avgRiskPercent, delta: curr.avgRiskPercent - prev.avgRiskPercent },
    ruleAdherence: { current: curr.ruleAdherence, previous: prev.ruleAdherence, delta: curr.ruleAdherence - prev.ruleAdherence },
    fomoFrequency: { current: curr.fomoFrequency, previous: prev.fomoFrequency, delta: curr.fomoFrequency - prev.fomoFrequency },
    revengeFrequency: { current: curr.revengeFrequency, previous: prev.revengeFrequency, delta: curr.revengeFrequency - prev.revengeFrequency },
    sessionDistribution,
    strategyUsage
  };
}

// ---------------------------------------------------------------------------
// 3. STRUCTURED OBSERVATION CARDS GENERATOR
// ---------------------------------------------------------------------------

export function generateAIObservations(
  currentTrades: Trade[],
  previousTrades: Trade[],
  permissions: DataAccessPermissions,
  focusAreas: FocusArea[],
  mode: AIMode
): AIObservation[] {
  const observations: AIObservation[] = [];
  const totalTrades = currentTrades.length;

  if (totalTrades < 3) {
    return observations;
  }

  const comparison = computePeriodComparison(currentTrades, previousTrades, 'Current Period', 'Previous Period');
  const level = getEvidenceLevel(totalTrades);

  // 1. Risk Behavior Observation
  if (permissions.riskBehavior && (focusAreas.includes('risk') || focusAreas.includes('consistency'))) {
    const currRisk = comparison.avgRiskPercent.current;
    const prevRisk = comparison.avgRiskPercent.previous;
    const riskDiff = currRisk - prevRisk;

    if (Math.abs(riskDiff) >= 0.25 && prevRisk > 0) {
      const isEscalation = riskDiff > 0;
      const affectedTrades = currentTrades.filter(t => (t.riskPercent || 0) > prevRisk * 1.15 || (t.risk || 0) > 0);
      
      observations.push({
        id: 'obs-risk-shift',
        title: isEscalation ? 'Potential Risk Escalation' : 'Risk Contraction Observed',
        category: 'risk',
        observation: isEscalation 
          ? `Average recorded risk was higher during the current period (${currRisk.toFixed(2)}% vs ${prevRisk.toFixed(2)}%).`
          : `Average recorded risk decreased during the current period (${currRisk.toFixed(2)}% vs ${prevRisk.toFixed(2)}%).`,
        evidence: `Current average risk: ${currRisk.toFixed(2)}% (${currentTrades.length} trades) vs Previous: ${prevRisk.toFixed(2)}% (${previousTrades.length} trades). Difference: ${riskDiff > 0 ? '+' : ''}${riskDiff.toFixed(2)}%.`,
        sampleSize: {
          current: currentTrades.length,
          previous: previousTrades.length
        },
        dateRange: `${comparison.currentPeriodLabel} vs ${comparison.previousPeriodLabel}`,
        evidenceLevel: level,
        possibleAlternatives: [
          'Position sizing differences may be driven by different instrument volatility or stop distances.',
          'Trades taken on higher-conviction setups may have deliberately used elevated position sizing.',
          'Recent trade cluster occurred during a period of varying account equity.'
        ],
        tradeIds: affectedTrades.map(t => t.id),
        highlightFields: ['risk', 'riskPercent', 'positionSize', 'entry', 'stopLoss'],
        showMeWhy: {
          detected: `A shift of ${Math.abs(riskDiff).toFixed(2)}% in average risk per trade was calculated across consecutive periods.`,
          fieldsUsed: ['riskPercent', 'risk', 'date'],
          tradesAnalyzed: totalTrades + previousTrades.length,
          supportingEvidence: `${affectedTrades.length} current trades recorded risk exceeding the previous period average.`,
          contradictingEvidence: `${currentTrades.length - affectedTrades.length} trades maintained risk within historical parameters.`,
          confoundingFactors: [
            'Market volatility fluctuations',
            'Changes in account starting balance'
          ],
          dataToImprove: 'Recording precise stop-loss distances in pips/points and account balance at entry would verify position sizing consistency.'
        },
        coachQuestions: [
          'Did this risk change reflect an intentional strategy adjustment, or did sizing drift during live execution?',
          'How comfortable did you feel managing open risk during this period compared to previous sessions?'
        ],
        researchNotes: {
          supportingCount: affectedTrades.length,
          contradictingCount: currentTrades.length - affectedTrades.length,
          dataGaps: affectedTrades.filter(t => !t.riskPercent).length > 0 ? ['Some trades only recorded dollar risk without percentage of equity.'] : []
        }
      });
    }
  }

  // 2. Psychology: FOMO & Discipline Correlation
  if (permissions.psychology && (focusAreas.includes('psychology') || focusAreas.includes('execution'))) {
    const fomoTrades = currentTrades.filter(t => t.emotions?.includes('FOMO'));
    const calmTrades = currentTrades.filter(t => t.emotions?.includes('Calm') || (!t.emotions?.includes('FOMO') && !t.emotions?.includes('Revenge')));

    if (fomoTrades.length >= 2 && calmTrades.length >= 2) {
      const fomoWins = fomoTrades.filter(t => t.result === 'WIN').length;
      const calmWins = calmTrades.filter(t => t.result === 'WIN').length;
      const fomoWinRate = (fomoWins / fomoTrades.length) * 100;
      const calmWinRate = (calmWins / calmTrades.length) * 100;

      const fomoAvgR = fomoTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / fomoTrades.length;
      const calmAvgR = calmTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / calmTrades.length;

      const deltaR = calmAvgR - fomoAvgR;

      observations.push({
        id: 'obs-psychology-fomo',
        title: 'Emotional State Performance Divergence',
        category: 'psychology',
        observation: `Trades logged with FOMO showed lower historical Avg R (${fomoAvgR.toFixed(2)}R) compared to Calm/disciplined trades (${calmAvgR.toFixed(2)}R).`,
        evidence: `FOMO tagged: ${fomoTrades.length} trades (Win Rate: ${fomoWinRate.toFixed(1)}%, Avg R: ${fomoAvgR.toFixed(2)}R). Calm/Disciplined: ${calmTrades.length} trades (Win Rate: ${calmWinRate.toFixed(1)}%, Avg R: ${calmAvgR.toFixed(2)}R). Delta: ${deltaR.toFixed(2)}R.`,
        sampleSize: {
          current: currentTrades.length
        },
        dateRange: comparison.currentPeriodLabel,
        evidenceLevel: getEvidenceLevel(fomoTrades.length + calmTrades.length),
        possibleAlternatives: [
          'FOMO entries may have coincided with choppy market conditions or late session breakouts.',
          'Traders may disproportionately self-tag trades as FOMO post-facto when a trade results in a loss.'
        ],
        tradeIds: [...fomoTrades.map(t => t.id), ...calmTrades.map(t => t.id)],
        highlightFields: ['emotions', 'result', 'rMultiple', 'pnl', 'ruleAdherence'],
        showMeWhy: {
          detected: 'Statistically measurable divergence between trades logged with emotional tags vs calm tags.',
          fieldsUsed: ['emotions', 'rMultiple', 'result', 'ruleAdherence'],
          tradesAnalyzed: fomoTrades.length + calmTrades.length,
          supportingEvidence: `${fomoTrades.length} trades tagged with FOMO generated an average R of ${fomoAvgR.toFixed(2)}R.`,
          contradictingEvidence: `${fomoWins} FOMO trades still reached winning targets.`,
          confoundingFactors: [
            'Hindsight bias during emotional tagging',
            'Cluster of FOMO trades during a single adverse market day'
          ],
          dataToImprove: 'Tagging pre-trade emotion before entry rather than post-exit eliminates retrospective attribution bias.'
        },
        coachQuestions: [
          'What specific market cues or personal triggers preceded your FOMO entries?',
          'What rule or pause mechanism would help you step away when experiencing urgency?'
        ],
        researchNotes: {
          supportingCount: fomoTrades.length,
          contradictingCount: fomoWins,
          dataGaps: currentTrades.filter(t => !t.emotions || t.emotions.length === 0).length > 0 
            ? [`${currentTrades.filter(t => !t.emotions || t.emotions.length === 0).length} trades lacked recorded emotional tags.`] 
            : []
        }
      });
    }
  }

  // 3. Rule Adherence Impact
  if (permissions.learningRules && (focusAreas.includes('rules') || focusAreas.includes('consistency'))) {
    const highAdherence = currentTrades.filter(t => (t.ruleAdherence || 0) >= 80);
    const lowAdherence = currentTrades.filter(t => t.ruleAdherence !== undefined && t.ruleAdherence < 80);

    if (highAdherence.length >= 3 && lowAdherence.length >= 2) {
      const highAvgR = highAdherence.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / highAdherence.length;
      const lowAvgR = lowAdherence.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / lowAdherence.length;

      observations.push({
        id: 'obs-rule-adherence',
        title: 'Rule Adherence Outcome Correlation',
        category: 'rules',
        observation: `Trades with high rule adherence (≥80%) averaged ${highAvgR.toFixed(2)}R, whereas low adherence trades averaged ${lowAvgR.toFixed(2)}R.`,
        evidence: `High adherence (≥80%): ${highAdherence.length} trades, Avg R ${highAvgR.toFixed(2)}R. Low adherence (<80%): ${lowAdherence.length} trades, Avg R ${lowAvgR.toFixed(2)}R.`,
        sampleSize: {
          current: highAdherence.length + lowAdherence.length
        },
        dateRange: comparison.currentPeriodLabel,
        evidenceLevel: getEvidenceLevel(highAdherence.length + lowAdherence.length),
        possibleAlternatives: [
          'Traders may be more critical of rule adherence following an unexpected market spike or stop-out.',
          'Rule definitions may be overly rigid for certain fast-moving volatility setups.'
        ],
        tradeIds: [...highAdherence.map(t => t.id), ...lowAdherence.map(t => t.id)],
        highlightFields: ['ruleAdherence', 'checklistState', 'rMultiple', 'result'],
        showMeWhy: {
          detected: 'Strong historical performance divergence correlated with pre-trade checklist and execution rule compliance.',
          fieldsUsed: ['ruleAdherence', 'checklistState', 'rMultiple', 'result'],
          tradesAnalyzed: highAdherence.length + lowAdherence.length,
          supportingEvidence: `${highAdherence.length} compliant trades achieved a positive net expected value.`,
          confoundingFactors: [
            'Subjective scoring of rules',
            'Differences across distinct market regimes'
          ],
          dataToImprove: 'Standardize checklist criteria across all strategies for objective scoring.'
        },
        coachQuestions: [
          'Which specific checklist item was most frequently skipped during the low adherence trades?',
          'Can you simplify your rule set so compliance is effortless during high-stress market moments?'
        ]
      });
    }
  }

  // 4. Session Distribution Shift
  if (permissions.trades && (focusAreas.includes('execution') || focusAreas.includes('strategy'))) {
    const sessionEntries = Object.entries(comparison.sessionDistribution);
    if (sessionEntries.length >= 2) {
      const londonTrades = currentTrades.filter(t => t.session === 'London');
      const nyTrades = currentTrades.filter(t => t.session === 'New York');

      if (londonTrades.length >= 3 && nyTrades.length >= 3) {
        const londonAvgR = londonTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / londonTrades.length;
        const nyAvgR = nyTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / nyTrades.length;

        if (Math.abs(londonAvgR - nyAvgR) >= 0.3) {
          const better = londonAvgR > nyAvgR ? 'London' : 'New York';
          const betterAvg = Math.max(londonAvgR, nyAvgR);
          const other = better === 'London' ? 'New York' : 'London';
          const otherAvg = Math.min(londonAvgR, nyAvgR);

          observations.push({
            id: 'obs-session-divergence',
            title: 'Session Performance Variation',
            category: 'execution',
            observation: `Historical ${better} session trades recorded higher average R (${betterAvg.toFixed(2)}R) than ${other} session trades (${otherAvg.toFixed(2)}R).`,
            evidence: `${better}: ${better === 'London' ? londonTrades.length : nyTrades.length} trades, Avg ${betterAvg.toFixed(2)}R vs ${other}: ${other === 'London' ? londonTrades.length : nyTrades.length} trades, Avg ${otherAvg.toFixed(2)}R.`,
            sampleSize: {
              current: londonTrades.length + nyTrades.length
            },
            dateRange: comparison.currentPeriodLabel,
            evidenceLevel: getEvidenceLevel(londonTrades.length + nyTrades.length),
            possibleAlternatives: [
              'Different market liquidity or spread conditions between session open and close.',
              'Potential difference in fatigue or focus levels depending on your local time zone.',
              'Different instruments may have been traded predominantly during one session.'
            ],
            tradeIds: [...londonTrades.map(t => t.id), ...nyTrades.map(t => t.id)],
            highlightFields: ['session', 'market', 'rMultiple', 'result'],
            showMeWhy: {
              detected: `Comparison of average realized R across major trading sessions showed an average divergence of ${Math.abs(betterAvg - otherAvg).toFixed(2)}R.`,
              fieldsUsed: ['session', 'rMultiple', 'result', 'market'],
              tradesAnalyzed: londonTrades.length + nyTrades.length,
              supportingEvidence: `${better} session generated consistent positive expectation across recorded entries.`,
              confoundingFactors: [
                'Macro news releases clustered primarily in US session',
                'Instrument concentration'
              ],
              dataToImprove: 'Log specific time of entry to differentiate session open from session close.'
            },
            coachQuestions: [
              `Are your setups specifically tailored to the liquidity characteristics of ${better}?`,
              'Does trading the other session introduce fatigue or rushed execution?'
            ]
          });
        }
      }
    }
  }

  // 5. Overtrading / Execution Density
  if (focusAreas.includes('overtrading') || focusAreas.includes('execution')) {
    const tradesByDay: Record<string, Trade[]> = {};
    currentTrades.forEach(t => {
      const d = new Date(t.date).toISOString().split('T')[0];
      if (!tradesByDay[d]) tradesByDay[d] = [];
      tradesByDay[d].push(t);
    });

    const highDensityDays = Object.entries(tradesByDay).filter(([_, list]) => list.length >= 4);
    if (highDensityDays.length >= 1) {
      const highDensityTrades = highDensityDays.flatMap(([_, list]) => list);
      const normalTrades = currentTrades.filter(t => !highDensityTrades.includes(t));

      const highDensityAvgR = highDensityTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / highDensityTrades.length;
      const normalAvgR = normalTrades.length > 0 
        ? normalTrades.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / normalTrades.length 
        : 0;

      observations.push({
        id: 'obs-overtrading-cluster',
        title: 'High Trade-Frequency Day Performance',
        category: 'overtrading',
        observation: `On days with 4+ trades (${highDensityDays.length} days, ${highDensityTrades.length} trades), historical Avg R was ${highDensityAvgR.toFixed(2)}R compared to ${normalAvgR.toFixed(2)}R on moderate-volume days.`,
        evidence: `High-frequency days: ${highDensityTrades.length} trades across ${highDensityDays.length} days, Avg R: ${highDensityAvgR.toFixed(2)}R. Normal days: ${normalTrades.length} trades, Avg R: ${normalAvgR.toFixed(2)}R.`,
        sampleSize: {
          current: currentTrades.length
        },
        dateRange: comparison.currentPeriodLabel,
        evidenceLevel: getEvidenceLevel(highDensityTrades.length),
        possibleAlternatives: [
          'High trade frequency may occur during trending, highly volatile market days offering more valid setups.',
          'Re-entry attempts following early stop-outs may compress overall day performance.'
        ],
        tradeIds: highDensityTrades.map(t => t.id),
        highlightFields: ['date', 'time', 'rMultiple', 'result', 'emotions'],
        showMeWhy: {
          detected: 'Grouped trades by calendar date and identified days where trade count reached or exceeded 4 entries.',
          fieldsUsed: ['date', 'rMultiple', 'result', 'emotions'],
          tradesAnalyzed: currentTrades.length,
          supportingEvidence: `Cluster of ${highDensityTrades.length} trades taken across high-volume days.`,
          confoundingFactors: [
            'Market volatility expansion providing multiple valid setups',
            'Position scaling'
          ],
          dataToImprove: 'Recording explicit entry reasons allows distinguishing between planned scale-ins and unplanned impulse re-entries.'
        },
        coachQuestions: [
          'What led to taking 4 or more trades on those specific days?',
          'Did earlier trades on those days influence the decision to take subsequent trades?'
        ]
      });
    }
  }

  return observations;
}

// ---------------------------------------------------------------------------
// 4. AUTOMATIC PATTERN DISCOVERY
// ---------------------------------------------------------------------------

export function discoverPatterns(trades: Trade[], permissions: DataAccessPermissions): DiscoveredPattern[] {
  const patterns: DiscoveredPattern[] = [];
  if (trades.length < 6) return patterns;

  // Pattern 1: Session Comparison for top market
  const markets = Array.from(new Set(trades.map(t => t.market).filter(Boolean)));
  for (const market of markets.slice(0, 3)) {
    const marketTrades = trades.filter(t => t.market === market);
    const london = marketTrades.filter(t => t.session === 'London');
    const ny = marketTrades.filter(t => t.session === 'New York');

    if (london.length >= 3 && ny.length >= 3) {
      const londonAvgR = london.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / london.length;
      const nyAvgR = ny.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / ny.length;
      const londonWins = (london.filter(t => t.result === 'WIN').length / london.length) * 100;
      const nyWins = (ny.filter(t => t.result === 'WIN').length / ny.length) * 100;

      if (Math.abs(londonAvgR - nyAvgR) >= 0.25) {
        const isLondonHigher = londonAvgR > nyAvgR;
        const higherSession = isLondonHigher ? 'London' : 'New York';
        const lowerSession = isLondonHigher ? 'New York' : 'London';

        patterns.push({
          id: `pattern-session-${market}`,
          title: `Potential Historical Pattern: ${market} Session Divergence`,
          description: `${market} trades logged during ${higherSession} had higher historical Avg R than during ${lowerSession}.`,
          setupA: {
            label: `${higherSession} Session`,
            count: isLondonHigher ? london.length : ny.length,
            avgR: isLondonHigher ? londonAvgR : nyAvgR,
            winRate: isLondonHigher ? londonWins : nyWins
          },
          setupB: {
            label: `${lowerSession} Session`,
            count: isLondonHigher ? ny.length : london.length,
            avgR: isLondonHigher ? nyAvgR : londonAvgR,
            winRate: isLondonHigher ? nyWins : londonWins
          },
          sampleSize: london.length + ny.length,
          dateRange: 'All Recorded Trades',
          evidenceLevel: getEvidenceLevel(london.length + ny.length),
          supportingTradeIds: (isLondonHigher ? london : ny).map(t => t.id),
          contradictingTradeIds: (isLondonHigher ? ny : london).map(t => t.id),
          alternativeExplanation: `${market} volatility and spread characteristics vary between European and American market opens. Higher performance in one session may also reflect personal energy levels.`,
          showMeWhy: {
            detected: `Divergence of ${Math.abs(londonAvgR - nyAvgR).toFixed(2)}R between ${higherSession} and ${lowerSession} on ${market}.`,
            fieldsUsed: ['market', 'session', 'rMultiple', 'result'],
            tradesAnalyzed: london.length + ny.length,
            supportingEvidence: `${isLondonHigher ? london.length : ny.length} trades in ${higherSession} averaged ${(isLondonHigher ? londonAvgR : nyAvgR).toFixed(2)}R.`,
            contradictingEvidence: `${isLondonHigher ? ny.length : london.length} trades in ${lowerSession} averaged ${(isLondonHigher ? nyAvgR : londonAvgR).toFixed(2)}R.`,
            confoundingFactors: [
              'Differing market regimes (trending vs ranging) during recorded dates',
              'Macro news releases impacting US sessions'
            ],
            dataToImprove: 'Record exact entry timestamp and spread to verify execution friction.'
          }
        });
      }
    }
  }

  // Pattern 2: Directional Comparison (BUY vs SELL)
  const buys = trades.filter(t => t.direction === 'BUY');
  const sells = trades.filter(t => t.direction === 'SELL');

  if (buys.length >= 5 && sells.length >= 5) {
    const buyAvgR = buys.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / buys.length;
    const sellAvgR = sells.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / sells.length;
    const buyWins = (buys.filter(t => t.result === 'WIN').length / buys.length) * 100;
    const sellWins = (sells.filter(t => t.result === 'WIN').length / sells.length) * 100;

    if (Math.abs(buyAvgR - sellAvgR) >= 0.3) {
      const isBuyBetter = buyAvgR > sellAvgR;
      const topDir = isBuyBetter ? 'BUY (Long)' : 'SELL (Short)';
      const otherDir = isBuyBetter ? 'SELL (Short)' : 'BUY (Long)';

      patterns.push({
        id: 'pattern-directional-bias',
        title: `Potential Directional Performance Disparity`,
        description: `Historical ${topDir} trades generated a higher average R than ${otherDir} trades.`,
        setupA: {
          label: topDir,
          count: isBuyBetter ? buys.length : sells.length,
          avgR: isBuyBetter ? buyAvgR : sellAvgR,
          winRate: isBuyBetter ? buyWins : sellWins
        },
        setupB: {
          label: otherDir,
          count: isBuyBetter ? sells.length : buys.length,
          avgR: isBuyBetter ? sellAvgR : buyAvgR,
          winRate: isBuyBetter ? sellWins : buyWins
        },
        sampleSize: buys.length + sells.length,
        dateRange: 'All Recorded Trades',
        evidenceLevel: getEvidenceLevel(buys.length + sells.length),
        supportingTradeIds: (isBuyBetter ? buys : sells).map(t => t.id),
        contradictingTradeIds: (isBuyBetter ? sells : buys).map(t => t.id),
        alternativeExplanation: 'The broader macro trend during the recorded period may have favored one direction, creating asymmetrical market momentum.',
        showMeWhy: {
          detected: `A divergence of ${Math.abs(buyAvgR - sellAvgR).toFixed(2)}R between Long and Short trade outcomes.`,
          fieldsUsed: ['direction', 'rMultiple', 'result'],
          tradesAnalyzed: buys.length + sells.length,
          supportingEvidence: `${isBuyBetter ? buys.length : sells.length} ${topDir} trades achieved ${(isBuyBetter ? buyAvgR : sellAvgR).toFixed(2)}R.`,
          confoundingFactors: [
            'Underlying macro secular bull/bear market trend',
            'Timeframes utilized'
          ],
          dataToImprove: 'Tag higher-timeframe trend alignment on entry to see if directional bias is setup-dependent.'
        }
      });
    }
  }

  // Pattern 3: Strategy Comparison (if 2+ strategies with sufficient sample)
  if (permissions.strategies) {
    const strats = Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)));
    if (strats.length >= 2) {
      const stratStats = strats.map(name => {
        const list = trades.filter(t => t.strategy === name);
        const avgR = list.length > 0 ? list.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / list.length : 0;
        const winRate = list.length > 0 ? (list.filter(t => t.result === 'WIN').length / list.length) * 100 : 0;
        return { name, list, count: list.length, avgR, winRate };
      }).filter(s => s.count >= 4);

      if (stratStats.length >= 2) {
        stratStats.sort((a, b) => b.avgR - a.avgR);
        const best = stratStats[0];
        const runnerUp = stratStats[1];

        if (best.avgR - runnerUp.avgR >= 0.25) {
          patterns.push({
            id: `pattern-strategy-${best.name}-${runnerUp.name}`,
            title: `Potential Strategy Outcome Contrast`,
            description: `Strategy "${best.name}" historically yielded higher Avg R (${best.avgR.toFixed(2)}R) than "${runnerUp.name}" (${runnerUp.avgR.toFixed(2)}R).`,
            setupA: {
              label: best.name,
              count: best.count,
              avgR: best.avgR,
              winRate: best.winRate
            },
            setupB: {
              label: runnerUp.name,
              count: runnerUp.count,
              avgR: runnerUp.avgR,
              winRate: runnerUp.winRate
            },
            sampleSize: best.count + runnerUp.count,
            dateRange: 'All Recorded Trades',
            evidenceLevel: getEvidenceLevel(best.count + runnerUp.count),
            supportingTradeIds: best.list.map(t => t.id),
            contradictingTradeIds: runnerUp.list.map(t => t.id),
            alternativeExplanation: `"${best.name}" may have been deployed primarily in favorable market conditions, or may have a different risk-to-reward architecture.`,
            showMeWhy: {
              detected: `Comparison between top strategies with at least 4 recorded trades revealed an Avg R difference of ${(best.avgR - runnerUp.avgR).toFixed(2)}R.`,
              fieldsUsed: ['strategy', 'rMultiple', 'result', 'risk'],
              tradesAnalyzed: best.count + runnerUp.count,
              supportingEvidence: `"${best.name}" maintained ${best.winRate.toFixed(1)}% win rate across ${best.count} recorded trades.`,
              confoundingFactors: [
                'Disparity in sample sizes',
                'Different market regimes during strategy execution'
              ],
              dataToImprove: 'Accumulate at least 20+ trades per strategy to reduce sample noise.'
            }
          });
        }
      }
    }
  }

  return patterns;
}

// ---------------------------------------------------------------------------
// 5. HYPOTHESIS TESTING ENGINE
// ---------------------------------------------------------------------------

export function testHypothesis(
  trades: Trade[],
  criteria: {
    market?: string;
    strategy?: string;
    session?: string;
    direction?: string;
  }
): {
  supportingTradeIds: string[];
  contradictingTradeIds: string[];
  neutralTradeIds: string[];
  totalRelevantTrades: number;
  evidenceLevel: EvidenceLevel;
  status: Hypothesis['status'];
} {
  // Filter trades matching criteria
  const relevant = trades.filter(t => {
    if (criteria.market && criteria.market !== 'All' && t.market !== criteria.market) return false;
    if (criteria.strategy && criteria.strategy !== 'All' && t.strategy !== criteria.strategy) return false;
    if (criteria.session && criteria.session !== 'All' && t.session !== criteria.session) return false;
    if (criteria.direction && criteria.direction !== 'All' && t.direction !== criteria.direction) return false;
    return true;
  });

  const supporting: string[] = [];
  const contradicting: string[] = [];
  const neutral: string[] = [];

  relevant.forEach(t => {
    const r = t.rMultiple !== undefined ? t.rMultiple : (t.pnl && t.risk ? t.pnl / t.risk : 0);
    const result = t.result;

    if (result === 'WIN' || r >= 0.5) {
      supporting.push(t.id);
    } else if (result === 'LOSS' || r <= -0.5) {
      contradicting.push(t.id);
    } else {
      neutral.push(t.id);
    }
  });

  const total = relevant.length;
  const level = getEvidenceLevel(total);

  return {
    supportingTradeIds: supporting,
    contradictingTradeIds: contradicting,
    neutralTradeIds: neutral,
    totalRelevantTrades: total,
    evidenceLevel: level,
    status: level
  };
}

// ---------------------------------------------------------------------------
// 6. SCENARIO LAB (HISTORICAL WHAT-IF SIMULATOR)
// ---------------------------------------------------------------------------

export function simulateScenario(
  trades: Trade[],
  ruleType: ScenarioSimulationResult['ruleType'],
  config?: any
): ScenarioSimulationResult {
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');

  const calcKPIs = (tradeList: Trade[], customPnlMultiplier?: (t: Trade) => number) => {
    let grossProfit = 0;
    let grossLoss = 0;
    let netPnl = 0;
    let netR = 0;
    let wins = 0;

    tradeList.forEach(t => {
      const mult = customPnlMultiplier ? customPnlMultiplier(t) : 1;
      const basePnl = (t.pnl || 0) * mult;
      netPnl += basePnl;
      if (basePnl > 0) {
        grossProfit += basePnl;
        wins++;
      }
      if (basePnl < 0) grossLoss += Math.abs(basePnl);

      const r = (t.rMultiple !== undefined ? t.rMultiple : (t.risk ? (t.pnl || 0) / t.risk : 0));
      netR += r;
    });

    const winRate = tradeList.length > 0 ? (wins / tradeList.length) * 100 : 0;
    const avgR = tradeList.length > 0 ? netR / tradeList.length : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 100 : 0);

    // Max Drawdown
    let peak = 0;
    let maxDd = 0;
    let equity = 0;
    const sorted = [...tradeList].sort((a, b) => a.date - b.date);
    sorted.forEach(t => {
      const p = (t.pnl || 0) * (customPnlMultiplier ? customPnlMultiplier(t) : 1);
      equity += p;
      if (equity > peak) peak = equity;
      const dd = peak - equity;
      if (dd > maxDd) maxDd = dd;
    });

    return {
      tradeCount: tradeList.length,
      winRate,
      avgR,
      netR,
      netPnl,
      profitFactor,
      maxDrawdown: maxDd
    };
  };

  const actualKPIs = calcKPIs(closed);

  let simulatedTrades: Trade[] = [];
  let name = '';
  let description = '';
  let customMultiplier: ((t: Trade) => number) | undefined = undefined;

  switch (ruleType) {
    case 'fixed_risk':
      name = 'Fixed 1.0% Risk per Trade';
      description = 'Simulates performance if all trades strictly risked exactly 1% ($100 per trade) instead of variable sizing.';
      simulatedTrades = [...closed];
      customMultiplier = (t: Trade) => {
        const actualRisk = t.risk || 100;
        return actualRisk > 0 ? 100 / actualRisk : 1;
      };
      break;

    case 'exclude_fomo':
      name = 'Exclude FOMO & Revenge Trades';
      description = 'Simulates outcomes if no trades tagged with FOMO or Revenge had been taken.';
      simulatedTrades = closed.filter(t => !t.emotions?.includes('FOMO') && !t.emotions?.includes('Revenge'));
      break;

    case 'strict_rules':
      name = 'Strict Rule Adherence Only (≥80%)';
      description = 'Simulates performance when only executing trades where rule adherence was at least 80%.';
      simulatedTrades = closed.filter(t => (t.ruleAdherence || 0) >= 80);
      break;

    case 'session_filter':
      const targetSession = config?.session || 'London';
      name = `${targetSession} Session Exclusivity`;
      description = `Simulates outcomes if you only traded during the ${targetSession} session.`;
      simulatedTrades = closed.filter(t => t.session === targetSession);
      break;

    case 'strategy_filter':
      const targetStrategy = config?.strategy || (closed[0]?.strategy || 'Strategy');
      name = `Exclusive Execution: ${targetStrategy}`;
      description = `Simulates results if only "${targetStrategy}" setups had been traded.`;
      simulatedTrades = closed.filter(t => t.strategy === targetStrategy);
      break;

    case 'custom':
    default:
      name = 'Custom Historical Filter';
      description = 'Simulated subset based on your custom parameter combination.';
      simulatedTrades = closed.filter(t => {
        if (config?.market && config.market !== 'All' && t.market !== config.market) return false;
        if (config?.session && config.session !== 'All' && t.session !== config.session) return false;
        if (config?.minAdherence && (t.ruleAdherence || 0) < config.minAdherence) return false;
        return true;
      });
      break;
  }

  const simulatedKPIs = calcKPIs(simulatedTrades, customMultiplier);
  const includedIds = simulatedTrades.map(t => t.id);
  const excludedIds = closed.filter(t => !includedIds.includes(t.id)).map(t => t.id);

  return {
    id: `sim-${ruleType}-${Date.now()}`,
    name,
    description,
    ruleType,
    actual: actualKPIs,
    simulated: simulatedKPIs,
    includedTradeIds: includedIds,
    excludedTradeIds: excludedIds,
    sampleSize: closed.length,
    dateRange: 'All Closed Trades'
  };
}

// ---------------------------------------------------------------------------
// 7. AI ALERTS ENGINE
// ---------------------------------------------------------------------------

export function generateAIAlerts(trades: Trade[], defaultRisk: number = 1.0): AIAlert[] {
  const alerts: AIAlert[] = [];
  if (trades.length < 2) return alerts;

  const sorted = [...trades].sort((a, b) => b.date - a.date);

  // 1. Risk Behavior Shift Alert
  const recent5 = sorted.slice(0, 5);
  const recentRisk = recent5.reduce((acc, t) => acc + (t.riskPercent || (t.risk ? (t.risk / 10000) * 100 : defaultRisk)), 0) / recent5.length;

  if (recentRisk > defaultRisk * 1.35) {
    alerts.push({
      id: 'alert-risk-shift',
      type: 'risk_behavior',
      title: 'Risk Sizing Elevation Detected',
      message: `Average risk in your last ${recent5.length} trades is ${recentRisk.toFixed(2)}%, compared with configured baseline risk of ${defaultRisk.toFixed(2)}%.`,
      evidence: `Recent ${recent5.length} trades average: ${recentRisk.toFixed(2)}% vs baseline ${defaultRisk.toFixed(2)}%.`,
      severity: 'warning',
      tradeIds: recent5.map(t => t.id),
      date: sorted[0]?.date || Date.now()
    });
  }

  // 2. Re-entry Pattern Detection
  const recentReentries: Trade[] = [];
  for (let i = 0; i < Math.min(sorted.length - 1, 10); i++) {
    const current = sorted[i];
    const prev = sorted[i + 1];
    if (prev.result === 'LOSS' && (current.isReentry || (current.date - prev.date <= 25 * 60 * 1000))) {
      recentReentries.push(current);
    }
  }

  if (recentReentries.length >= 2) {
    alerts.push({
      id: 'alert-reentry-pattern',
      type: 'reentry_pattern',
      title: 'Quick Re-entry Pattern Detected',
      message: `${recentReentries.length} recent trades occurred within minutes following a previous loss.`,
      evidence: `${recentReentries.length} trades flagged as immediate re-entries after a loss in the last 10 recorded entries.`,
      severity: 'alert',
      tradeIds: recentReentries.map(t => t.id),
      date: recentReentries[0]?.date || Date.now()
    });
  }

  // 3. Strategy Sample Warning
  const strategies = Array.from(new Set(trades.map(t => t.strategy).filter(Boolean)));
  strategies.forEach(strat => {
    const stratTrades = trades.filter(t => t.strategy === strat);
    if (stratTrades.length > 0 && stratTrades.length < 5) {
      alerts.push({
        id: `alert-strat-sample-${strat}`,
        type: 'strategy_sample',
        title: `Limited Sample: ${strat}`,
        message: `Strategy "${strat}" has only ${stratTrades.length} recorded trade${stratTrades.length === 1 ? '' : 's'}. Performance metrics may be unstable.`,
        evidence: `Sample size: ${stratTrades.length} trades. Recommended minimum for statistical observation is 15+ trades.`,
        severity: 'info',
        tradeIds: stratTrades.map(t => t.id),
        date: stratTrades[0]?.date || Date.now()
      });
    }
  });

  // 4. Psychology Data Gap Alert
  const missingPsych = trades.filter(t => !t.emotions || t.emotions.length === 0);
  if (missingPsych.length >= 5) {
    alerts.push({
      id: 'alert-psych-gap',
      type: 'psychology_gap',
      title: 'Psychology Data Gap',
      message: `${missingPsych.length} trades have no recorded emotional state or behavioral notes.`,
      evidence: `${missingPsych.length} out of ${trades.length} recorded trades (${((missingPsych.length / trades.length) * 100).toFixed(0)}%) lack emotional tracking.`,
      severity: 'info',
      tradeIds: missingPsych.slice(0, 10).map(t => t.id),
      date: Date.now()
    });
  }

  return alerts;
}

// ---------------------------------------------------------------------------
// 8. DATA QUALITY AUDIT
// ---------------------------------------------------------------------------

export function auditDataQuality(trades: Trade[]): DataQualityAudit {
  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return {
      totalTrades: 0,
      completeRecords: 0,
      overallScore: 100,
      missingSessions: 0,
      missingStrategies: 0,
      missingPsychology: 0,
      missingR: 0,
      missingScreenshots: 0,
      missingNotes: 0,
      missingAdherence: 0,
      incompleteTrades: []
    };
  }

  let missingSessions = 0;
  let missingStrategies = 0;
  let missingPsychology = 0;
  let missingR = 0;
  let missingScreenshots = 0;
  let missingNotes = 0;
  let missingAdherence = 0;

  const incompleteTrades: { trade: Trade; missingFields: string[] }[] = [];

  trades.forEach(t => {
    const missing: string[] = [];
    if (!t.session || t.session === 'Other') {
      missingSessions++;
      missing.push('Session');
    }
    if (!t.strategy) {
      missingStrategies++;
      missing.push('Strategy');
    }
    if (!t.emotions || t.emotions.length === 0) {
      missingPsychology++;
      missing.push('Emotion/Psychology');
    }
    if (t.rMultiple === undefined && (!t.entry || !t.stopLoss)) {
      missingR++;
      missing.push('R / Entry & Stop Loss');
    }
    if (!t.screenshot && (!t.screenshots || (!t.screenshots.before && !t.screenshots.after))) {
      missingScreenshots++;
      missing.push('Chart Screenshot');
    }
    if (!t.notes && !t.learning) {
      missingNotes++;
      missing.push('Notes / Learning');
    }
    if (t.ruleAdherence === undefined || t.ruleAdherence === null) {
      missingAdherence++;
      missing.push('Rule Adherence');
    }

    if (missing.length > 0) {
      incompleteTrades.push({ trade: t, missingFields: missing });
    }
  });

  const completeRecords = totalTrades - incompleteTrades.length;
  
  // Weighted completeness score
  const completenessFraction = 1 - (
    (missingSessions * 0.15 +
     missingStrategies * 0.20 +
     missingPsychology * 0.15 +
     missingR * 0.25 +
     missingScreenshots * 0.10 +
     missingNotes * 0.05 +
     missingAdherence * 0.10) / (totalTrades * 1.0)
  );

  const overallScore = Math.max(0, Math.min(100, Math.round(completenessFraction * 100)));

  return {
    totalTrades,
    completeRecords,
    overallScore,
    missingSessions,
    missingStrategies,
    missingPsychology,
    missingR,
    missingScreenshots,
    missingNotes,
    missingAdherence,
    incompleteTrades
  };
}

// ---------------------------------------------------------------------------
// 9. DATA-GROUNDED AI Q&A ENGINE
// ---------------------------------------------------------------------------

export function answerTradingQuestion(
  rawQuery: string,
  trades: Trade[],
  permissions: DataAccessPermissions
): AIAnswerResponse {
  const query = rawQuery.toLowerCase().trim();

  if (trades.length === 0) {
    return {
      answer: "I don't have enough recorded data to answer that. You have 0 trades logged in this dashboard.",
      evidence: "0 trades analyzed.",
      sampleSize: "0 trades",
      limitations: "No trading records available.",
      nextInvestigation: "Log at least 5 to 15 completed trades with entry, exit, session, and emotion fields.",
      relevantTradeIds: [],
      hasSufficientData: false
    };
  }

  // Question: What changed in my trading / month / recent?
  if (query.includes('what changed') || query.includes('this month') || query.includes('recent')) {
    const comparison = computePeriodComparison(trades.slice(0, Math.floor(trades.length / 2)), trades.slice(Math.floor(trades.length / 2)), 'Recent Period', 'Prior Period');
    const wrDelta = comparison.winRate.delta;
    const rDelta = comparison.avgR.delta;
    const riskDelta = comparison.avgRiskPercent.delta;

    return {
      answer: `Comparing your recent ${comparison.currentCount} trades against the prior ${comparison.previousCount} trades shows: Win rate changed by ${wrDelta >= 0 ? '+' : ''}${wrDelta.toFixed(1)}%, average R changed by ${rDelta >= 0 ? '+' : ''}${rDelta.toFixed(2)}R, and average risk changed by ${riskDelta >= 0 ? '+' : ''}${riskDelta.toFixed(2)}%.`,
      evidence: `Recent: ${comparison.currentCount} trades, ${comparison.winRate.current.toFixed(1)}% WR, ${comparison.avgR.current.toFixed(2)}R avg. Prior: ${comparison.previousCount} trades, ${comparison.winRate.previous.toFixed(1)}% WR, ${comparison.avgR.previous.toFixed(2)}R avg.`,
      sampleSize: `${comparison.currentCount} vs ${comparison.previousCount} trades`,
      limitations: "Comparison divides available records into two sequential chronological groups without normalizing for external market volatility.",
      nextInvestigation: "Review the 'What Changed?' engine cards to see individual parameter breakdowns for risk, session, and psychology.",
      relevantTradeIds: trades.slice(0, 10).map(t => t.id),
      hasSufficientData: true
    };
  }

  // Question: FOMO vs Calm?
  if (query.includes('fomo') || query.includes('calm') || query.includes('emotion')) {
    if (!permissions.psychology) {
      return {
        answer: "Psychology data access is currently disabled in your AI Controls.",
        evidence: "Data category: Psychology is unchecked.",
        sampleSize: "N/A",
        limitations: "Disabled by user privacy control.",
        nextInvestigation: "Enable 'Psychology' in the AI Controls & Privacy panel to permit analysis.",
        relevantTradeIds: [],
        hasSufficientData: false
      };
    }

    const fomoTrades = trades.filter(t => t.emotions?.includes('FOMO'));
    const calmTrades = trades.filter(t => t.emotions?.includes('Calm'));

    if (fomoTrades.length === 0 && calmTrades.length === 0) {
      return {
        answer: "I don't have enough recorded data to answer that. No trades in this dashboard have been tagged with 'FOMO' or 'Calm'.",
        evidence: "0 FOMO trades, 0 Calm trades found in records.",
        sampleSize: "0 trades",
        limitations: "Emotion tags were not recorded during trade entry.",
        nextInvestigation: "Record emotional states on future entries to enable psychological comparisons.",
        relevantTradeIds: [],
        hasSufficientData: false
      };
    }

    const fomoAvgR = fomoTrades.length > 0 ? fomoTrades.reduce((a, t) => a + (t.rMultiple || 0), 0) / fomoTrades.length : 0;
    const calmAvgR = calmTrades.length > 0 ? calmTrades.reduce((a, t) => a + (t.rMultiple || 0), 0) / calmTrades.length : 0;

    return {
      answer: `In your recorded trades, FOMO-tagged trades averaged ${fomoAvgR.toFixed(2)}R, while Calm-tagged trades averaged ${calmAvgR.toFixed(2)}R.`,
      evidence: `FOMO: ${fomoTrades.length} trades, Avg R ${fomoAvgR.toFixed(2)}R. Calm: ${calmTrades.length} trades, Avg R ${calmAvgR.toFixed(2)}R.`,
      sampleSize: `${fomoTrades.length} FOMO vs ${calmTrades.length} Calm trades`,
      limitations: "Traders may sometimes assign emotional labels in hindsight after seeing the trade outcome.",
      nextInvestigation: "Check the Pattern Lab to see if FOMO trades were concentrated in a specific market session.",
      relevantTradeIds: [...fomoTrades.map(t => t.id), ...calmTrades.map(t => t.id)],
      hasSufficientData: true
    };
  }

  // Question: Sessions?
  if (query.includes('session') || query.includes('london') || query.includes('new york') || query.includes('asian')) {
    const sessions = ['London', 'New York', 'Asian', 'Sydney'];
    const sessionData = sessions.map(name => {
      const list = trades.filter(t => t.session === name);
      const avgR = list.length > 0 ? list.reduce((a, t) => a + (t.rMultiple || 0), 0) / list.length : 0;
      const winRate = list.length > 0 ? (list.filter(t => t.result === 'WIN').length / list.length) * 100 : 0;
      return { name, count: list.length, avgR, winRate, list };
    }).filter(s => s.count > 0);

    if (sessionData.length === 0) {
      return {
        answer: "I don't have enough recorded data to answer that. None of your recorded trades have a session tag assigned.",
        evidence: "Missing session fields on all trades.",
        sampleSize: "0 trades with session tag",
        limitations: "Session metadata unrecorded.",
        nextInvestigation: "Add session information (London, New York, Asian) in Add Trade.",
        relevantTradeIds: [],
        hasSufficientData: false
      };
    }

    sessionData.sort((a, b) => b.avgR - a.avgR);
    const top = sessionData[0];

    return {
      answer: `Historical trade logs show that ${top.name} session currently has the highest historical Avg R (${top.avgR.toFixed(2)}R) with a ${top.winRate.toFixed(1)}% win rate across ${top.count} recorded trades.`,
      evidence: sessionData.map(s => `${s.name}: ${s.count} trades, Avg ${s.avgR.toFixed(2)}R, ${s.winRate.toFixed(1)}% WR`).join(' | '),
      sampleSize: `${trades.length} total trades analyzed`,
      limitations: "Sample sizes vary between sessions. Smaller samples are subject to higher statistical variance.",
      nextInvestigation: "Compare London vs New York in the Pattern Lab side-by-side comparator.",
      relevantTradeIds: top.list.map(t => t.id),
      hasSufficientData: true
    };
  }

  // Question: Rules?
  if (query.includes('rule') || query.includes('break') || query.includes('adherence')) {
    const withAdherence = trades.filter(t => t.ruleAdherence !== undefined);
    if (withAdherence.length === 0) {
      return {
        answer: "I don't have enough recorded data to answer that. No trades have recorded rule adherence percentages.",
        evidence: "Rule adherence field is empty across all records.",
        sampleSize: "0 trades",
        limitations: "Checklist compliance was not tracked on recorded trades.",
        nextInvestigation: "Use the trade checklist in Add Trade to track rule adherence.",
        relevantTradeIds: [],
        hasSufficientData: false
      };
    }

    const broken = withAdherence.filter(t => (t.ruleAdherence || 0) < 70);
    return {
      answer: `You recorded lower rule adherence (<70%) on ${broken.length} out of ${withAdherence.length} evaluated trades (${((broken.length / withAdherence.length) * 100).toFixed(0)}%).`,
      evidence: `High adherence (≥70%): ${withAdherence.length - broken.length} trades. Low adherence (<70%): ${broken.length} trades.`,
      sampleSize: `${withAdherence.length} trades with adherence data`,
      limitations: "Rule adherence is self-scored by the trader.",
      nextInvestigation: "Inspect the underlying trades with the Evidence Drawer to review the exact checklist items skipped.",
      relevantTradeIds: broken.map(t => t.id),
      hasSufficientData: true
    };
  }

  // Question: Strategies?
  if (query.includes('strateg')) {
    const stratMap: Record<string, Trade[]> = {};
    trades.forEach(t => {
      const s = t.strategy || 'Unassigned';
      if (!stratMap[s]) stratMap[s] = [];
      stratMap[s].push(t);
    });

    const entries = Object.entries(stratMap).sort((a, b) => b[1].length - a[1].length);
    const top = entries[0];

    return {
      answer: `Your recorded strategy with the largest sample size is "${top[0]}" with ${top[1].length} trades.`,
      evidence: entries.map(([name, list]) => `"${name}": ${list.length} trades`).join(', '),
      sampleSize: `${trades.length} total trades`,
      limitations: "Strategies with under 15 trades cannot be considered statistically reliable.",
      nextInvestigation: "View the Strategy tab in Pattern Lab to filter setups by strategy.",
      relevantTradeIds: top[1].map(t => t.id),
      hasSufficientData: true
    };
  }

  // General fallback using data
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const wins = closed.filter(t => t.result === 'WIN').length;
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0;
  const avgR = closed.length > 0 ? closed.reduce((acc, t) => acc + (t.rMultiple || 0), 0) / closed.length : 0;

  return {
    answer: `Analysis of your ${trades.length} recorded trades indicates a historical win rate of ${winRate.toFixed(1)}% and an average realized R of ${avgR.toFixed(2)}R across ${closed.length} closed trades.`,
    evidence: `${closed.length} closed trades (${wins} wins, ${closed.length - wins} losses/BE). Total realized R: ${closed.reduce((acc, t) => acc + (t.rMultiple || 0), 0).toFixed(2)}R.`,
    sampleSize: `${trades.length} total trades`,
    limitations: "General metrics do not isolate market condition or session nuances.",
    nextInvestigation: "Try asking about specific sessions, emotional tags (e.g. FOMO), or rule adherence.",
    relevantTradeIds: trades.slice(0, 10).map(t => t.id),
    hasSufficientData: true
  };
}
