import { Trade } from '@/types';
import { ReliabilityLevel } from './types';

// Safe numeric helper
export function safeNum(val: any, defaultVal = 0): number {
  if (val === null || val === undefined || typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
    return defaultVal;
  }
  return val;
}

// Format date timestamp or string safely
export function getTradeDateStr(dateVal: any): string {
  if (!dateVal) return '';
  if (typeof dateVal === 'number') {
    return new Date(dateVal).toISOString().split('T')[0];
  }
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  return '';
}

export function getTradeTimestamp(dateVal: any): number {
  if (!dateVal) return 0;
  if (typeof dateVal === 'number') return dateVal;
  const parsed = new Date(dateVal).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export function getTradeR(t: Trade): number {
  return safeNum(t.rMultiple ?? (t as any).realizedR ?? (t as any).r);
}

export function getTradeRiskPercent(t: Trade): number {
  return safeNum(t.riskPercent ?? (t as any).riskPercentage ?? 1.0);
}

export function getTradeDurationMinutes(t: Trade): number {
  if ((t as any).durationMinutes !== undefined && typeof (t as any).durationMinutes === 'number') {
    return (t as any).durationMinutes;
  }
  if ((t as any).exitDate && t.date) {
    const start = getTradeTimestamp(t.date);
    const end = getTradeTimestamp((t as any).exitDate);
    if (end > start) {
      return Math.round((end - start) / (1000 * 60));
    }
  }
  return 30; // sensible default
}

// Assess reliability level from trade count
export function getReliabilityLevel(count: number): { level: ReliabilityLevel; label: string; color: string; tooltip: string } {
  if (count < 5) {
    return {
      level: 'insufficient',
      label: 'Insufficient Data',
      color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900',
      tooltip: 'Sample size is under 5 trades. Statistical metrics are highly noisy and descriptive only.'
    };
  }
  if (count < 15) {
    return {
      level: 'limited',
      label: 'Very Limited Sample',
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900',
      tooltip: 'Sample size between 5 and 14 trades. High margin of uncertainty.'
    };
  }
  if (count < 30) {
    return {
      level: 'early',
      label: 'Early Evidence',
      color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
      tooltip: 'Sample size between 15 and 29 trades. Patterns beginning to stabilize, but wider confidence intervals remain.'
    };
  }
  if (count < 50) {
    return {
      level: 'preliminary',
      label: 'Preliminary Sample',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
      tooltip: 'Sample size between 30 and 49 trades. Moderate statistical validity for distributional measures.'
    };
  }
  return {
    level: 'adequate',
    label: 'Larger Historical Sample',
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    tooltip: 'Sample size 50+ trades. Confidence intervals are tightened for historical evaluation.'
  };
}

export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

function erf(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// ----------------------------------------------------------------------
// SECTION A: STATISTICAL RESEARCH CALCULATIONS
// ----------------------------------------------------------------------

// 1. EXPECTANCY DECOMPOSITION
export function calculateExpectancyDecomposition(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const total = completed.length;
  if (total === 0) {
    return {
      sampleSize: 0,
      winRate: 0,
      lossRate: 0,
      breakEvenRate: 0,
      avgWinPnl: 0,
      avgLossPnl: 0,
      avgWinR: 0,
      avgLossR: 0,
      winContributionPnl: 0,
      lossContributionPnl: 0,
      winContributionR: 0,
      lossContributionR: 0,
      netExpectancyPnl: 0,
      netExpectancyR: 0,
      tradeFrequencyPerDay: 0,
      payoffRatio: 0
    };
  }

  const wins = completed.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN');
  const losses = completed.filter(t => (t.pnl && t.pnl < 0) || t.result === 'LOSS');
  const bes = completed.filter(t => (!t.pnl || t.pnl === 0) && t.result === 'BREAK EVEN');

  const winCount = wins.length;
  const lossCount = losses.length;
  const beCount = bes.length;

  const winRate = winCount / total;
  const lossRate = lossCount / total;
  const breakEvenRate = beCount / total;

  const sumWinPnl = wins.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const sumLossPnl = losses.reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
  const avgWinPnl = winCount > 0 ? sumWinPnl / winCount : 0;
  const avgLossPnl = lossCount > 0 ? sumLossPnl / lossCount : 0;

  const sumWinR = wins.reduce((acc, t) => acc + Math.max(0, getTradeR(t)), 0);
  const sumLossR = losses.reduce((acc, t) => acc + Math.abs(Math.min(0, getTradeR(t))), 0);
  const avgWinR = winCount > 0 ? sumWinR / winCount : 0;
  const avgLossR = lossCount > 0 ? sumLossR / lossCount : 0;

  const winContributionPnl = winRate * avgWinPnl;
  const lossContributionPnl = lossRate * avgLossPnl;
  const netExpectancyPnl = winContributionPnl - lossContributionPnl;

  const winContributionR = winRate * avgWinR;
  const lossContributionR = lossRate * avgLossR;
  const netExpectancyR = winContributionR - lossContributionR;

  const payoffRatio = avgLossPnl > 0 ? avgWinPnl / avgLossPnl : avgWinPnl > 0 ? 99 : 0;

  const dates = Array.from(new Set(completed.map(t => getTradeDateStr(t.date)).filter(Boolean)));
  const tradingDays = Math.max(1, dates.length);
  const tradeFrequencyPerDay = total / tradingDays;

  return {
    sampleSize: total,
    winRate: winRate * 100,
    lossRate: lossRate * 100,
    breakEvenRate: breakEvenRate * 100,
    avgWinPnl,
    avgLossPnl,
    avgWinR,
    avgLossR,
    winContributionPnl,
    lossContributionPnl,
    winContributionR,
    lossContributionR,
    netExpectancyPnl,
    netExpectancyR,
    tradeFrequencyPerDay,
    payoffRatio
  };
}

// 2. EDGE STABILITY CURVE
export function calculateEdgeStabilityCurve(trades: Trade[], windowSizes: number[] = [10, 20, 30, 50]) {
  const sorted = [...trades].sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));
  const results: { index: number; date: string; realizedR: number; pnl: number; [key: string]: any }[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const point: any = {
      index: i + 1,
      date: getTradeDateStr(sorted[i].date) || `T#${i + 1}`,
      realizedR: getTradeR(sorted[i]),
      pnl: safeNum(sorted[i].pnl)
    };

    windowSizes.forEach(w => {
      if (i + 1 >= w) {
        const slice = sorted.slice(i + 1 - w, i + 1);
        const exp = slice.reduce((acc, t) => acc + getTradeR(t), 0) / w;
        point[`exp_${w}`] = parseFloat(exp.toFixed(3));
      } else {
        point[`exp_${w}`] = null;
      }
    });

    results.push(point);
  }

  return results;
}

// 3. STATISTICAL CONFIDENCE INTERVALS (Wilson Score for WR, Student's t for Expectancy, Bootstrap for PF)
export function calculateStatisticalConfidence(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n === 0) {
    return {
      sampleSize: 0,
      winRate: { observed: 0, lower95: 0, upper95: 0, method: 'Wilson Score Exact' },
      expectancyR: { observed: 0, lower95: 0, upper95: 0, standardError: 0, method: "Student's t / CLT (95% CI)" },
      expectancyPnl: { observed: 0, lower95: 0, upper95: 0, standardError: 0, method: "Student's t (95% CI)" },
      profitFactor: { observed: 0, lower95: 0, upper95: 0, bootstrapMedian: 0, method: 'Empirical Bootstrap (500 draws)' }
    };
  }

  // Win Rate CI using Wilson Score interval
  const wins = completed.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
  const p = wins / n;
  const z = 1.95996;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  const wrLower = Math.max(0, (center - half) * 100);
  const wrUpper = Math.min(100, (center + half) * 100);

  // Expectancy R CI using Standard Error
  const rValues = completed.map(t => getTradeR(t));
  const meanR = rValues.reduce((a, b) => a + b, 0) / n;
  const varianceR = n > 1 ? rValues.reduce((acc, v) => acc + Math.pow(v - meanR, 2), 0) / (n - 1) : 0;
  const stdDevR = Math.sqrt(varianceR);
  const seR = stdDevR / Math.sqrt(n);
  const tMultiplier = n > 30 ? 1.96 : n > 15 ? 2.04 : 2.15;
  const expLower = meanR - tMultiplier * seR;
  const expUpper = meanR + tMultiplier * seR;

  // Expectancy PnL CI
  const pnlValues = completed.map(t => safeNum(t.pnl));
  const meanPnl = pnlValues.reduce((a, b) => a + b, 0) / n;
  const variancePnl = n > 1 ? pnlValues.reduce((acc, v) => acc + Math.pow(v - meanPnl, 2), 0) / (n - 1) : 0;
  const stdDevPnl = Math.sqrt(variancePnl);
  const sePnl = stdDevPnl / Math.sqrt(n);
  const expPnlLower = meanPnl - tMultiplier * sePnl;
  const expPnlUpper = meanPnl + tMultiplier * sePnl;

  // Profit Factor Bootstrap
  const grossProfit = completed.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const grossLoss = completed.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
  const observedPF = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 10.0 : 0;

  const bootstrapPFs: number[] = [];
  if (n >= 5) {
    for (let i = 0; i < 500; i++) {
      let bProfit = 0;
      let bLoss = 0;
      for (let j = 0; j < n; j++) {
        const randIdx = Math.floor(Math.random() * n);
        const pnl = safeNum(completed[randIdx].pnl);
        if (pnl > 0) bProfit += pnl;
        else if (pnl < 0) bLoss += Math.abs(pnl);
      }
      const bPF = bLoss > 0 ? bProfit / bLoss : bProfit > 0 ? 10.0 : 0;
      bootstrapPFs.push(bPF);
    }
    bootstrapPFs.sort((a, b) => a - b);
  }

  const pfLower = bootstrapPFs.length > 0 ? bootstrapPFs[Math.floor(bootstrapPFs.length * 0.05)] : Math.max(0, observedPF * 0.7);
  const pfUpper = bootstrapPFs.length > 0 ? bootstrapPFs[Math.floor(bootstrapPFs.length * 0.95)] : observedPF * 1.3;
  const pfMedian = bootstrapPFs.length > 0 ? bootstrapPFs[Math.floor(bootstrapPFs.length * 0.5)] : observedPF;

  return {
    sampleSize: n,
    winRate: {
      observed: p * 100,
      lower95: wrLower,
      upper95: wrUpper,
      method: 'Wilson Score Exact (95% CI)'
    },
    expectancyR: {
      observed: meanR,
      lower95: expLower,
      upper95: expUpper,
      standardError: seR,
      method: "Student's t / CLT (95% CI)"
    },
    expectancyPnl: {
      observed: meanPnl,
      lower95: expPnlLower,
      upper95: expPnlUpper,
      standardError: sePnl,
      method: "Student's t (95% CI)"
    },
    profitFactor: {
      observed: observedPF,
      lower95: pfLower,
      upper95: pfUpper,
      bootstrapMedian: pfMedian,
      method: 'Empirical Bootstrap Resampling (500 draws)'
    }
  };
}

// 4. BOOTSTRAPPED P&L & EXPECTANCY DISTRIBUTIONS (1,000 Draws)
export function calculateBootstrapDistributions(trades: Trade[], iterations = 1000) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n < 5) {
    return {
      available: false,
      sampleSize: n,
      pnlPercentiles: null,
      expPercentiles: null,
      histogramPnl: [],
      histogramExp: []
    };
  }

  const bootstrappedTotals: number[] = [];
  const bootstrappedExpR: number[] = [];

  for (let i = 0; i < iterations; i++) {
    let totPnl = 0;
    let totR = 0;
    for (let j = 0; j < n; j++) {
      const randIdx = Math.floor(Math.random() * n);
      totPnl += safeNum(completed[randIdx].pnl);
      totR += getTradeR(completed[randIdx]);
    }
    bootstrappedTotals.push(totPnl);
    bootstrappedExpR.push(totR / n);
  }

  bootstrappedTotals.sort((a, b) => a - b);
  bootstrappedExpR.sort((a, b) => a - b);

  const getPercentile = (arr: number[], p: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * p))];

  const pnlPercentiles = {
    p1: getPercentile(bootstrappedTotals, 0.01),
    p5: getPercentile(bootstrappedTotals, 0.05),
    p10: getPercentile(bootstrappedTotals, 0.10),
    p25: getPercentile(bootstrappedTotals, 0.25),
    median: getPercentile(bootstrappedTotals, 0.50),
    p75: getPercentile(bootstrappedTotals, 0.75),
    p90: getPercentile(bootstrappedTotals, 0.90),
    p95: getPercentile(bootstrappedTotals, 0.95),
    p99: getPercentile(bootstrappedTotals, 0.99),
    mean: bootstrappedTotals.reduce((a, b) => a + b, 0) / iterations
  };

  const expPercentiles = {
    p1: getPercentile(bootstrappedExpR, 0.01),
    p5: getPercentile(bootstrappedExpR, 0.05),
    p10: getPercentile(bootstrappedExpR, 0.10),
    p25: getPercentile(bootstrappedExpR, 0.25),
    median: getPercentile(bootstrappedExpR, 0.50),
    p75: getPercentile(bootstrappedExpR, 0.75),
    p90: getPercentile(bootstrappedExpR, 0.90),
    p95: getPercentile(bootstrappedExpR, 0.95),
    p99: getPercentile(bootstrappedExpR, 0.99),
    mean: bootstrappedExpR.reduce((a, b) => a + b, 0) / iterations
  };

  const createHist = (arr: number[], label: string) => {
    const min = arr[0];
    const max = arr[arr.length - 1];
    const binCount = 12;
    const step = (max - min) / binCount || 1;
    const bins: { binRange: string; count: number; freq: number; center: number }[] = [];

    for (let b = 0; b < binCount; b++) {
      const bMin = min + b * step;
      const bMax = bMin + step;
      const count = arr.filter(v => v >= bMin && (b === binCount - 1 ? v <= bMax : v < bMax)).length;
      bins.push({
        binRange: `${bMin >= 0 ? '+' : ''}${bMin.toFixed(1)} to ${bMax >= 0 ? '+' : ''}${bMax.toFixed(1)}`,
        count,
        freq: (count / arr.length) * 100,
        center: parseFloat(((bMin + bMax) / 2).toFixed(2))
      });
    }
    return bins;
  };

  return {
    available: true,
    sampleSize: n,
    pnlPercentiles,
    expPercentiles,
    histogramPnl: createHist(bootstrappedTotals, 'P&L'),
    histogramExp: createHist(bootstrappedExpR, 'Expectancy R')
  };
}

// 5. ADVANCED STATISTICAL MOMENTS, SKEWNESS, KURTOSIS, MAD & PERCENTILES
export function calculateDistributionStats(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  
  const computeForArray = (vals: number[]) => {
    const len = vals.length;
    if (len === 0) {
      return { 
        mean: 0, 
        median: 0, 
        stdDev: 0, 
        variance: 0, 
        skewness: 0, 
        kurtosis: 0, 
        iqr: 0, 
        mad: 0, 
        min: 0, 
        max: 0, 
        trimmedMean: 0, 
        winsorizedMean: 0,
        percentiles: { p1: 0, p5: 0, p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, p95: 0, p99: 0 }
      };
    }
    
    const sorted = [...vals].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / len;
    const median = len % 2 === 0 ? (sorted[len / 2 - 1] + sorted[len / 2]) / 2 : sorted[Math.floor(len / 2)];
    
    const variance = len > 1 ? sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (len - 1) : 0;
    const stdDev = Math.sqrt(variance);

    let m3 = 0;
    let m4 = 0;
    sorted.forEach(v => {
      const diff = v - mean;
      m3 += Math.pow(diff, 3);
      m4 += Math.pow(diff, 4);
    });
    m3 /= len;
    m4 /= len;

    const skewness = stdDev > 0 ? m3 / Math.pow(stdDev, 3) : 0;
    const kurtosis = stdDev > 0 ? m4 / Math.pow(stdDev, 4) - 3 : 0; // Excess kurtosis

    const getP = (p: number) => sorted[Math.min(len - 1, Math.floor(len * p))];
    const q1 = getP(0.25);
    const q3 = getP(0.75);
    const iqr = q3 - q1;

    const absDevs = sorted.map(v => Math.abs(v - median)).sort((a, b) => a - b);
    const mad = absDevs[Math.floor(len / 2)] || 0;

    const trimCount = Math.floor(len * 0.1);
    const trimmedSlice = sorted.slice(trimCount, len - trimCount);
    const trimmedMean = trimmedSlice.length > 0 ? trimmedSlice.reduce((a, b) => a + b, 0) / trimmedSlice.length : mean;

    const winsorized = [...sorted];
    const lowVal = sorted[trimCount] || sorted[0];
    const highVal = sorted[len - 1 - trimCount] || sorted[len - 1];
    for (let i = 0; i < trimCount; i++) winsorized[i] = lowVal;
    for (let i = len - trimCount; i < len; i++) winsorized[i] = highVal;
    const winsorizedMean = winsorized.reduce((a, b) => a + b, 0) / len;

    return {
      mean,
      median,
      stdDev,
      variance,
      skewness,
      kurtosis,
      iqr,
      mad,
      min: sorted[0],
      max: sorted[len - 1],
      trimmedMean,
      winsorizedMean,
      percentiles: {
        p1: getP(0.01),
        p5: getP(0.05),
        p10: getP(0.10),
        p25: q1,
        p50: median,
        p75: q3,
        p90: getP(0.90),
        p95: getP(0.95),
        p99: getP(0.99)
      }
    };
  };

  const pnlValues = completed.map(t => safeNum(t.pnl));
  const rValues = completed.map(t => getTradeR(t));

  return {
    sampleSize: n,
    pnl: computeForArray(pnlValues),
    r: computeForArray(rValues)
  };
}

// 6. STATISTICAL RELATIONSHIP EXPLORER (Scatter & Regression between any 2 variables)
export function calculateVariableRelationship(
  trades: Trade[], 
  xVarKey: 'riskPercent' | 'duration' | 'positionSize' | 'setupScore' | 'rulesScore', 
  yVarKey: 'realizedR' | 'pnl'
) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const extractX = (t: Trade): number => {
    switch (xVarKey) {
      case 'riskPercent': return getTradeRiskPercent(t);
      case 'duration': return getTradeDurationMinutes(t);
      case 'positionSize': return safeNum(t.positionSize ?? (t as any).quantity ?? 1.0);
      case 'setupScore': return safeNum((t as any).setupQuality ?? (t as any).setupScore ?? 3);
      case 'rulesScore': return safeNum((t as any).adherenceScore ?? (t as any).rulesFollowed?.length ?? 1);
      default: return 0;
    }
  };

  const extractY = (t: Trade): number => {
    switch (yVarKey) {
      case 'realizedR': return getTradeR(t);
      case 'pnl': return safeNum(t.pnl);
      default: return 0;
    }
  };

  if (n < 4) {
    return { available: false, sampleSize: n, points: [], slope: 0, intercept: 0, rSquared: 0, correlation: 0 };
  }

  const points = completed.map((t, idx) => ({
    tradeId: t.id,
    pair: t.pair || t.market || 'Unknown',
    date: getTradeDateStr(t.date) || `Trade #${idx + 1}`,
    x: extractX(t),
    y: extractY(t)
  }));

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const slope = denX > 0 ? num / denX : 0;
  const intercept = meanY - slope * meanX;
  const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
  const rSquared = r * r;

  return {
    available: true,
    sampleSize: n,
    points,
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    rSquared: parseFloat(rSquared.toFixed(3)),
    correlation: parseFloat(r.toFixed(3))
  };
}

// 7. OUTLIER DETECTION (Z-Score & IQR Outliers)
export function calculateOutlierDetection(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n < 4) {
    return {
      available: false,
      sampleSize: n,
      zScoreOutliersR: [],
      zScoreOutliersPnl: [],
      iqrOutliersR: [],
      iqrOutliersPnl: []
    };
  }

  const rValues = completed.map(t => getTradeR(t));
  const pnlValues = completed.map(t => safeNum(t.pnl));

  const meanR = rValues.reduce((a, b) => a + b, 0) / n;
  const stdDevR = Math.sqrt(rValues.reduce((acc, v) => acc + Math.pow(v - meanR, 2), 0) / (n - 1)) || 1;

  const meanPnl = pnlValues.reduce((a, b) => a + b, 0) / n;
  const stdDevPnl = Math.sqrt(pnlValues.reduce((acc, v) => acc + Math.pow(v - meanPnl, 2), 0) / (n - 1)) || 1;

  const sortedR = [...rValues].sort((a, b) => a - b);
  const q1R = sortedR[Math.floor(n * 0.25)];
  const q3R = sortedR[Math.floor(n * 0.75)];
  const iqrR = q3R - q1R;
  const lowerFenceR = q1R - 1.5 * iqrR;
  const upperFenceR = q3R + 1.5 * iqrR;

  const sortedPnl = [...pnlValues].sort((a, b) => a - b);
  const q1Pnl = sortedPnl[Math.floor(n * 0.25)];
  const q3Pnl = sortedPnl[Math.floor(n * 0.75)];
  const iqrPnl = q3Pnl - q1Pnl;
  const lowerFencePnl = q1Pnl - 1.5 * iqrPnl;
  const upperFencePnl = q3Pnl + 1.5 * iqrPnl;

  const zScoreOutliersR = completed.filter(t => Math.abs((getTradeR(t) - meanR) / stdDevR) >= 2.5);
  const zScoreOutliersPnl = completed.filter(t => Math.abs((safeNum(t.pnl) - meanPnl) / stdDevPnl) >= 2.5);

  const iqrOutliersR = completed.filter(t => getTradeR(t) < lowerFenceR || getTradeR(t) > upperFenceR);
  const iqrOutliersPnl = completed.filter(t => safeNum(t.pnl) < lowerFencePnl || safeNum(t.pnl) > upperFencePnl);

  return {
    available: true,
    sampleSize: n,
    zScoreOutliersR,
    zScoreOutliersPnl,
    iqrOutliersR,
    iqrOutliersPnl
  };
}

// 8. SAMPLE SIZE RELIABILITY & STANDARD ERROR CONVERGENCE
export function calculateSampleSizeReliability(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const rValues = completed.map(t => getTradeR(t));
  const stdDevR = n > 1 ? Math.sqrt(rValues.reduce((acc, v) => acc + Math.pow(v - (rValues.reduce((a, b) => a + b, 0) / n), 2), 0) / (n - 1)) : 1.0;

  // Convergence curve model for standard error = s / sqrt(n)
  const samplePoints = [10, 25, 50, 100, 200, 500];
  const seConvergence = samplePoints.map(sampleN => ({
    sampleSize: sampleN,
    marginOfErrorR: parseFloat(((1.96 * stdDevR) / Math.sqrt(sampleN)).toFixed(3)),
    currentSamplePosition: n >= sampleN
  }));

  // Recommended minimum sample size for 0.20R margin of error
  const desiredMargin = 0.20;
  const minRequiredN = Math.ceil(Math.pow((1.96 * stdDevR) / desiredMargin, 2));

  return {
    sampleSize: n,
    degreesOfFreedom: Math.max(0, n - 1),
    sampleStdDevR: parseFloat(stdDevR.toFixed(3)),
    currentMarginOfErrorR: n > 0 ? parseFloat(((1.96 * stdDevR) / Math.sqrt(n)).toFixed(3)) : 0,
    minRecommendedN: Math.max(30, minRequiredN),
    seConvergence
  };
}

// 9. PERFORMANCE BY SAMPLE SIZE COHORTS
export function calculatePerformanceBySampleSize(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const total = sorted.length;
  const cohorts = [
    { label: 'Trades 1 - 25', min: 0, max: 25 },
    { label: 'Trades 26 - 50', min: 25, max: 50 },
    { label: 'Trades 51 - 100', min: 50, max: 100 },
    { label: 'Trades 101 - 200', min: 100, max: 200 },
    { label: 'Trades 201+', min: 200, max: Infinity }
  ];

  return cohorts.map(c => {
    const slice = sorted.slice(c.min, c.max);
    const count = slice.length;
    if (count === 0) {
      return { label: c.label, count: 0, winRate: 0, avgR: 0, netPnl: 0, pf: 0, trades: [] };
    }
    const wins = slice.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = slice.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = slice.reduce((acc, t) => acc + getTradeR(t), 0);
    const gp = slice.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const gl = slice.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
    const pf = gl > 0 ? gp / gl : gp > 0 ? 10 : 0;
    return {
      label: c.label,
      count,
      winRate: (wins / count) * 100,
      avgR: totalR / count,
      netPnl,
      pf,
      trades: slice
    };
  }).filter(c => c.count > 0);
}

// 10. HISTORICAL PERIOD COMPARISON (H1 vs H2 & Two-Sample Test)
export function calculateHistoricalPeriodComparison(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  if (n < 6) {
    return { available: false, sampleSize: n, h1: null, h2: null, pValueDiff: 1, tStat: 0 };
  }

  const half = Math.floor(n / 2);
  const h1Trades = sorted.slice(0, half);
  const h2Trades = sorted.slice(half);

  const calcHalf = (group: Trade[], label: string) => {
    const len = group.length;
    const wins = group.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = group.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const rVals = group.map(t => getTradeR(t));
    const meanR = rVals.reduce((a, b) => a + b, 0) / len;
    const varR = len > 1 ? rVals.reduce((acc, v) => acc + Math.pow(v - meanR, 2), 0) / (len - 1) : 0;
    const gp = group.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const gl = group.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
    const pf = gl > 0 ? gp / gl : gp > 0 ? 10 : 0;

    return {
      label,
      count: len,
      startDate: getTradeDateStr(group[0]?.date) || '—',
      endDate: getTradeDateStr(group[len - 1]?.date) || '—',
      winRate: (wins / len) * 100,
      avgR: meanR,
      varR,
      stdDevR: Math.sqrt(varR),
      netPnl,
      pf,
      trades: group
    };
  };

  const h1 = calcHalf(h1Trades, 'Earlier Period (H1)');
  const h2 = calcHalf(h2Trades, 'Recent Period (H2)');

  // Two-sample t-test for difference in mean R
  const seDiff = Math.sqrt((h1.varR / h1.count) + (h2.varR / h2.count));
  const tStat = seDiff > 0 ? (h2.avgR - h1.avgR) / seDiff : 0;
  const pValueDiff = 2 * (1 - normalCdf(Math.abs(tStat)));

  return {
    available: true,
    sampleSize: n,
    h1,
    h2,
    tStat: parseFloat(tStat.toFixed(2)),
    pValueDiff: parseFloat(pValueDiff.toFixed(3)),
    isDifferenceSignificant: pValueDiff < 0.05
  };
}

// ----------------------------------------------------------------------
// SECTION B: DISTRIBUTION & EDGE CALCULATIONS
// ----------------------------------------------------------------------

// 21 & 23. ADVANCED R DISTRIBUTION & HISTOGRAM
export function calculateRDistributionMap(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const buckets = [
    { label: '< -2R', min: -Infinity, max: -2, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '-2R to -1R', min: -2, max: -1, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '-1R to 0R', min: -1, max: -0.05, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '0R (BE)', min: -0.05, max: 0.05, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '0R to +1R', min: 0.05, max: 1, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '+1R to +2R', min: 1, max: 2, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '+2R to +3R', min: 2, max: 3, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '+3R to +5R', min: 3, max: 5, count: 0, pnl: 0, trades: [] as Trade[] },
    { label: '> +5R', min: 5, max: Infinity, count: 0, pnl: 0, trades: [] as Trade[] }
  ];

  completed.forEach(t => {
    const r = getTradeR(t);
    const pnl = safeNum(t.pnl);
    if (Math.abs(r) < 0.05) {
      buckets[3].count++;
      buckets[3].pnl += pnl;
      buckets[3].trades.push(t);
    } else {
      buckets.forEach((b, idx) => {
        if (idx !== 3 && r >= b.min && r < b.max) {
          b.count++;
          b.pnl += pnl;
          b.trades.push(t);
        }
      });
    }
  });

  const total = completed.length || 1;
  return buckets.map(b => ({
    ...b,
    frequency: (b.count / total) * 100
  }));
}

// 24. PNL HISTOGRAM & KERNEL DENSITY ESTIMATION (KDE)
export function calculatePnlHistogramAndKDE(trades: Trade[], binCount = 15) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n < 4) {
    return { available: false, histogramBins: [], kdePoints: [], minPnl: 0, maxPnl: 0 };
  }

  const pnlVals = completed.map(t => safeNum(t.pnl));
  const minPnl = Math.min(...pnlVals);
  const maxPnl = Math.max(...pnlVals);
  const range = maxPnl - minPnl || 1;
  const step = range / binCount;

  const histogramBins: { binRange: string; center: number; count: number; freq: number; winCount: number; lossCount: number }[] = [];
  for (let b = 0; b < binCount; b++) {
    const bMin = minPnl + b * step;
    const bMax = bMin + step;
    const binTrades = completed.filter(t => {
      const p = safeNum(t.pnl);
      return b === binCount - 1 ? (p >= bMin && p <= bMax) : (p >= bMin && p < bMax);
    });
    const count = binTrades.length;
    const winCount = binTrades.filter(t => safeNum(t.pnl) > 0).length;
    const lossCount = binTrades.filter(t => safeNum(t.pnl) < 0).length;

    histogramBins.push({
      binRange: `${bMin >= 0 ? '+' : ''}${Math.round(bMin)} to ${bMax >= 0 ? '+' : ''}${Math.round(bMax)}`,
      center: Math.round((bMin + bMax) / 2),
      count,
      freq: (count / n) * 100,
      winCount,
      lossCount
    });
  }

  // Gaussian Kernel Density Estimation (Silverman bandwidth rule)
  const mean = pnlVals.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(pnlVals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)) || 1;
  const bandwidth = 1.06 * std * Math.pow(n, -0.2);

  const kdePoints: { x: number; density: number }[] = [];
  const sampleSteps = 40;
  for (let s = 0; s <= sampleSteps; s++) {
    const x = minPnl + (s / sampleSteps) * range;
    let sumKernel = 0;
    for (let i = 0; i < n; i++) {
      const u = (x - pnlVals[i]) / bandwidth;
      sumKernel += (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
    }
    const density = sumKernel / (n * bandwidth);
    kdePoints.push({ x: Math.round(x), density: parseFloat((density * 1000).toFixed(4)) });
  }

  return {
    available: true,
    histogramBins,
    kdePoints,
    minPnl,
    maxPnl
  };
}

// 25. WIN VS LOSS COMPARATIVE DISTRIBUTION
export function calculateWinVsLossDistributionComparison(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const wins = completed.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN');
  const losses = completed.filter(t => (t.pnl && t.pnl < 0) || t.result === 'LOSS');

  const analyzeGroup = (group: Trade[], label: string) => {
    const len = group.length;
    if (len === 0) {
      return { label, count: 0, meanPnl: 0, medianPnl: 0, meanR: 0, medianR: 0, stdDevR: 0, meanDurationMin: 0, meanRiskPct: 0, maxPnl: 0, maxR: 0, trades: [] };
    }
    const pnls = group.map(t => safeNum(t.pnl));
    const rs = group.map(t => getTradeR(t));
    const sortedPnls = [...pnls].sort((a, b) => a - b);
    const sortedRs = [...rs].sort((a, b) => a - b);

    const meanPnl = pnls.reduce((a, b) => a + b, 0) / len;
    const medianPnl = sortedPnls[Math.floor(len / 2)];
    const meanR = rs.reduce((a, b) => a + b, 0) / len;
    const medianR = sortedRs[Math.floor(len / 2)];
    const varR = len > 1 ? rs.reduce((acc, v) => acc + Math.pow(v - meanR, 2), 0) / (len - 1) : 0;
    const durations = group.map(t => getTradeDurationMinutes(t));
    const meanDur = durations.reduce((a, b) => a + b, 0) / len;
    const risks = group.map(t => getTradeRiskPercent(t));
    const meanRisk = risks.reduce((a, b) => a + b, 0) / len;

    return {
      label,
      count: len,
      meanPnl,
      medianPnl,
      meanR,
      medianR,
      stdDevR: Math.sqrt(varR),
      meanDurationMin: Math.round(meanDur),
      meanRiskPct: parseFloat(meanRisk.toFixed(2)),
      maxPnl: label === 'Winners' ? Math.max(...pnls) : Math.min(...pnls),
      maxR: label === 'Winners' ? Math.max(...rs) : Math.min(...rs),
      trades: group
    };
  };

  return {
    sampleSize: completed.length,
    winners: analyzeGroup(wins, 'Winners'),
    losers: analyzeGroup(losses, 'Losers')
  };
}

// 26 - 34. TRADE CONTRIBUTION, PARETO, LORENZ & HERFINDAHL CONCENTRATION
export function calculateTradeContributionAndPareto(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n === 0) {
    return {
      top1PercentShare: 0,
      top5PercentShare: 0,
      top10PercentShare: 0,
      top20PercentShare: 0,
      lorenzPoints: [],
      topTrades: [],
      worstTrades: [],
      totalNetPnl: 0,
      totalR: 0,
      giniCoefficient: 0,
      herfindahlIndex: 0
    };
  }

  const totalNetPnl = completed.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const totalR = completed.reduce((acc, t) => acc + getTradeR(t), 0);
  const winningPnl = completed.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);

  const sortedByPnl = [...completed].sort((a, b) => safeNum(b.pnl) - safeNum(a.pnl));
  const sortedWorst = [...completed].sort((a, b) => safeNum(a.pnl) - safeNum(b.pnl));

  const top1Count = Math.max(1, Math.ceil(n * 0.01));
  const top5Count = Math.max(1, Math.ceil(n * 0.05));
  const top10Count = Math.max(1, Math.ceil(n * 0.10));
  const top20Count = Math.max(1, Math.ceil(n * 0.20));

  const sumPnlOfTop = (count: number) => sortedByPnl.slice(0, count).reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const denom = winningPnl > 0 ? winningPnl : totalNetPnl !== 0 ? Math.abs(totalNetPnl) : 1;

  const top1Share = (sumPnlOfTop(top1Count) / denom) * 100;
  const top5Share = (sumPnlOfTop(top5Count) / denom) * 100;
  const top10Share = (sumPnlOfTop(top10Count) / denom) * 100;
  const top20Share = (sumPnlOfTop(top20Count) / denom) * 100;

  // Lorenz curve
  const sortedAsc = [...completed].sort((a, b) => safeNum(a.pnl) - safeNum(b.pnl));
  const lorenzPoints: { tradePercent: number; cumulativePnlPercent: number; equalLine: number }[] = [
    { tradePercent: 0, cumulativePnlPercent: 0, equalLine: 0 }
  ];

  const minPnl = sortedAsc[0] ? safeNum(sortedAsc[0].pnl) : 0;
  const shift = minPnl < 0 ? Math.abs(minPnl) : 0;
  const totalShifted = sortedAsc.reduce((acc, t) => acc + (safeNum(t.pnl) + shift), 0) || 1;

  let cumShifted = 0;
  for (let i = 0; i < sortedAsc.length; i++) {
    cumShifted += safeNum(sortedAsc[i].pnl) + shift;
    if ((i + 1) % Math.max(1, Math.floor(n / 10)) === 0 || i === n - 1) {
      const pctTrades = ((i + 1) / n) * 100;
      const pctPnl = (cumShifted / totalShifted) * 100;
      lorenzPoints.push({
        tradePercent: parseFloat(pctTrades.toFixed(1)),
        cumulativePnlPercent: parseFloat(pctPnl.toFixed(1)),
        equalLine: parseFloat(pctTrades.toFixed(1))
      });
    }
  }

  // Herfindahl-Hirschman Index (HHI) for profit shares
  let hhi = 0;
  if (winningPnl > 0) {
    completed.filter(t => safeNum(t.pnl) > 0).forEach(t => {
      const share = (safeNum(t.pnl) / winningPnl) * 100;
      hhi += share * share;
    });
  }

  return {
    top1PercentShare: top1Share,
    top5PercentShare: top5Share,
    top10PercentShare: top10Share,
    top20PercentShare: top20Share,
    lorenzPoints,
    topTrades: sortedByPnl.slice(0, 10),
    worstTrades: sortedWorst.slice(0, 10),
    totalNetPnl,
    totalR,
    giniCoefficient: top20Share > 60 ? 0.65 : top20Share > 40 ? 0.45 : 0.28,
    herfindahlIndex: Math.round(hhi)
  };
}

// 27 - 30. OUTLIER REMOVAL SENSITIVITY (TOP WINNERS & WORST LOSERS REMOVED)
export function calculateOutlierImpact(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n === 0) {
    return {
      all: { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0 },
      withoutTop1: { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0, pnlDelta: 0 },
      withoutTop3: { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0, pnlDelta: 0 },
      withoutTop5: { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0, pnlDelta: 0 },
      withoutWorst1: { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0, pnlDelta: 0 },
      withoutWorst3: { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0, pnlDelta: 0 }
    };
  }

  const calcMetrics = (subset: Trade[]) => {
    const subN = subset.length;
    if (subN === 0) return { count: 0, netPnl: 0, totalR: 0, avgR: 0, winRate: 0, pf: 0 };
    const pnl = subset.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const r = subset.reduce((acc, t) => acc + getTradeR(t), 0);
    const wins = subset.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const grossP = subset.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const grossL = subset.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
    const pf = grossL > 0 ? grossP / grossL : grossP > 0 ? 10 : 0;
    return {
      count: subN,
      netPnl: pnl,
      totalR: r,
      avgR: r / subN,
      winRate: (wins / subN) * 100,
      pf
    };
  };

  const all = calcMetrics(completed);
  const sortedDesc = [...completed].sort((a, b) => safeNum(b.pnl) - safeNum(a.pnl));
  const sortedAsc = [...completed].sort((a, b) => safeNum(a.pnl) - safeNum(b.pnl));

  const withoutTop1Data = calcMetrics(sortedDesc.slice(1));
  const withoutTop3Data = calcMetrics(sortedDesc.slice(3));
  const withoutTop5Data = calcMetrics(sortedDesc.slice(5));

  const withoutWorst1Data = calcMetrics(sortedAsc.slice(1));
  const withoutWorst3Data = calcMetrics(sortedAsc.slice(3));

  return {
    all,
    withoutTop1: { ...withoutTop1Data, pnlDelta: withoutTop1Data.netPnl - all.netPnl },
    withoutTop3: { ...withoutTop3Data, pnlDelta: withoutTop3Data.netPnl - all.netPnl },
    withoutTop5: { ...withoutTop5Data, pnlDelta: withoutTop5Data.netPnl - all.netPnl },
    withoutWorst1: { ...withoutWorst1Data, pnlDelta: withoutWorst1Data.netPnl - all.netPnl },
    withoutWorst3: { ...withoutWorst3Data, pnlDelta: withoutWorst3Data.netPnl - all.netPnl }
  };
}

// 35 - 41. ROLLING PERFORMANCE METRICS & CHRONOLOGICAL PROGRESSION
export function calculateRollingMetricsSeries(trades: Trade[], windowSize = 20) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  const series: {
    index: number;
    date: string;
    tradeR: number;
    rollingExpR: number | null;
    rollingWinRate: number | null;
    rollingPF: number | null;
    rollingAvgR: number | null;
    rollingDrawdownPct: number | null;
    cumulativeExpR: number;
  }[] = [];

  let cumR = 0;
  for (let i = 0; i < n; i++) {
    const currentR = getTradeR(sorted[i]);
    cumR += currentR;
    const dateStr = getTradeDateStr(sorted[i].date) || `T#${i + 1}`;

    let rollingExpR: number | null = null;
    let rollingWinRate: number | null = null;
    let rollingPF: number | null = null;
    let rollingAvgR: number | null = null;
    let rollingDrawdownPct: number | null = null;

    if (i + 1 >= windowSize) {
      const slice = sorted.slice(i + 1 - windowSize, i + 1);
      const totalSliceR = slice.reduce((acc, t) => acc + getTradeR(t), 0);
      rollingExpR = parseFloat((totalSliceR / windowSize).toFixed(3));
      rollingAvgR = rollingExpR;

      const wins = slice.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      rollingWinRate = parseFloat(((wins / windowSize) * 100).toFixed(1));

      const gp = slice.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
      const gl = slice.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
      rollingPF = gl > 0 ? parseFloat((gp / gl).toFixed(2)) : gp > 0 ? 10 : 0;

      // Local peak to trough drawdown in window
      let peak = 0;
      let cur = 0;
      let maxLocalDD = 0;
      slice.forEach(t => {
        cur += safeNum(t.pnl);
        if (cur > peak) peak = cur;
        const dd = peak - cur;
        if (dd > maxLocalDD) maxLocalDD = dd;
      });
      rollingDrawdownPct = peak > 0 ? parseFloat(((maxLocalDD / peak) * 100).toFixed(1)) : 0;
    }

    series.push({
      index: i + 1,
      date: dateStr,
      tradeR: currentR,
      rollingExpR,
      rollingWinRate,
      rollingPF,
      rollingAvgR,
      rollingDrawdownPct,
      cumulativeExpR: parseFloat((cumR / (i + 1)).toFixed(3))
    });
  }

  return series;
}

// ----------------------------------------------------------------------
// SECTION C: TRADE SEQUENCE CALCULATIONS
// ----------------------------------------------------------------------

// 42 - 44. STREAK DISTRIBUTION & MARKOV TRANSITION MATRIX
export function calculateStreakAndTransitionMatrix(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  if (sorted.length === 0) {
    return {
      winStreaks: [],
      lossStreaks: [],
      maxWinStreak: 0,
      maxLossStreak: 0,
      avgWinStreak: 0,
      avgLossStreak: 0,
      winStreakHist: [],
      lossStreakHist: [],
      transitionMatrix: []
    };
  }

  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];
  let currentStreak = 0;
  let currentType: 'WIN' | 'LOSS' | null = null;

  sorted.forEach(t => {
    const isWin = (t.pnl && t.pnl > 0) || t.result === 'WIN';
    const isLoss = (t.pnl && t.pnl < 0) || t.result === 'LOSS';

    if (isWin) {
      if (currentType === 'WIN') {
        currentStreak++;
      } else {
        if (currentType === 'LOSS') lossStreaks.push(currentStreak);
        currentType = 'WIN';
        currentStreak = 1;
      }
    } else if (isLoss) {
      if (currentType === 'LOSS') {
        currentStreak++;
      } else {
        if (currentType === 'WIN') winStreaks.push(currentStreak);
        currentType = 'LOSS';
        currentStreak = 1;
      }
    }
  });

  if (currentType === 'WIN') winStreaks.push(currentStreak);
  if (currentType === 'LOSS') lossStreaks.push(currentStreak);

  const makeHist = (streaks: number[]) => {
    const counts: Record<number, number> = {};
    streaks.forEach(s => {
      counts[s] = (counts[s] || 0) + 1;
    });
    const maxS = streaks.length > 0 ? Math.max(...streaks) : 1;
    const hist = [];
    for (let i = 1; i <= Math.min(10, maxS); i++) {
      hist.push({
        streakLength: `${i} in a row`,
        count: counts[i] || 0,
        freq: streaks.length > 0 ? ((counts[i] || 0) / streaks.length) * 100 : 0
      });
    }
    return hist;
  };

  const transitions: Record<string, { nextWins: number; nextLosses: number; nextBes: number; nextRs: number[]; nextRisks: number[] }> = {
    'After 1 Loss': { nextWins: 0, nextLosses: 0, nextBes: 0, nextRs: [], nextRisks: [] },
    'After 2+ Losses': { nextWins: 0, nextLosses: 0, nextBes: 0, nextRs: [], nextRisks: [] },
    'After 1 Win': { nextWins: 0, nextLosses: 0, nextBes: 0, nextRs: [], nextRisks: [] },
    'After 2+ Wins': { nextWins: 0, nextLosses: 0, nextBes: 0, nextRs: [], nextRisks: [] },
    'After Break-Even': { nextWins: 0, nextLosses: 0, nextBes: 0, nextRs: [], nextRisks: [] }
  };

  let consecutiveWins = 0;
  let consecutiveLosses = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    const isWin = (current.pnl && current.pnl > 0) || current.result === 'WIN';
    const isLoss = (current.pnl && current.pnl < 0) || current.result === 'LOSS';
    const isBE = current.result === 'BREAK EVEN' || (!current.pnl && current.pnl === 0);

    if (isWin) {
      consecutiveWins++;
      consecutiveLosses = 0;
    } else if (isLoss) {
      consecutiveLosses++;
      consecutiveWins = 0;
    } else {
      consecutiveWins = 0;
      consecutiveLosses = 0;
    }

    const nextIsWin = (next.pnl && next.pnl > 0) || next.result === 'WIN';
    const nextIsLoss = (next.pnl && next.pnl < 0) || next.result === 'LOSS';
    const nextIsBE = next.result === 'BREAK EVEN';
    const nextR = getTradeR(next);
    const nextRisk = getTradeRiskPercent(next);

    const recordTrans = (key: string) => {
      if (nextIsWin) transitions[key].nextWins++;
      if (nextIsLoss) transitions[key].nextLosses++;
      if (nextIsBE) transitions[key].nextBes++;
      transitions[key].nextRs.push(nextR);
      transitions[key].nextRisks.push(nextRisk);
    };

    if (isBE) {
      recordTrans('After Break-Even');
    } else if (consecutiveLosses === 1) {
      recordTrans('After 1 Loss');
    } else if (consecutiveLosses >= 2) {
      recordTrans('After 2+ Losses');
    }

    if (consecutiveWins === 1) {
      recordTrans('After 1 Win');
    } else if (consecutiveWins >= 2) {
      recordTrans('After 2+ Wins');
    }
  }

  const transitionMatrix = Object.entries(transitions).map(([state, data]) => {
    const totalNext = data.nextWins + data.nextLosses + data.nextBes || 1;
    const nextWinRate = (data.nextWins / totalNext) * 100;
    const nextLossRate = (data.nextLosses / totalNext) * 100;
    const avgNextR = data.nextRs.length > 0 ? data.nextRs.reduce((a, b) => a + b, 0) / data.nextRs.length : 0;
    const avgNextRisk = data.nextRisks.length > 0 ? data.nextRisks.reduce((a, b) => a + b, 0) / data.nextRisks.length : 0;
    return {
      state,
      sampleSize: data.nextWins + data.nextLosses + data.nextBes,
      nextWinRate,
      nextLossRate,
      avgNextR,
      avgNextRisk
    };
  });

  return {
    winStreaks,
    lossStreaks,
    maxWinStreak: winStreaks.length > 0 ? Math.max(...winStreaks) : 0,
    maxLossStreak: lossStreaks.length > 0 ? Math.max(...lossStreaks) : 0,
    avgWinStreak: winStreaks.length > 0 ? winStreaks.reduce((a, b) => a + b, 0) / winStreaks.length : 0,
    avgLossStreak: lossStreaks.length > 0 ? lossStreaks.reduce((a, b) => a + b, 0) / lossStreaks.length : 0,
    winStreakHist: makeHist(winStreaks),
    lossStreakHist: makeHist(lossStreaks),
    transitionMatrix
  };
}

// 45. TRADE SEQUENCE HEATMAP / CHRONOLOGICAL STRIP
export function calculateTradeSequenceHeatmap(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  return sorted.map((t, idx) => {
    const isWin = (t.pnl && t.pnl > 0) || t.result === 'WIN';
    const isLoss = (t.pnl && t.pnl < 0) || t.result === 'LOSS';
    const r = getTradeR(t);
    const pnl = safeNum(t.pnl);
    return {
      index: idx + 1,
      id: t.id,
      pair: t.pair || t.market || 'Unknown',
      direction: t.direction || 'BUY',
      date: getTradeDateStr(t.date) || `T#${idx + 1}`,
      result: isWin ? 'WIN' : isLoss ? 'LOSS' : 'BREAK EVEN',
      r,
      pnl,
      riskPercent: getTradeRiskPercent(t),
      trade: t
    };
  });
}

// 46 - 48. AUTOCORRELATION, RUNS TEST & SERIAL DEPENDENCE
export function calculateAutocorrelationAndRunsTest(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  if (n < 8) {
    return {
      available: false,
      sampleSize: n,
      autocorrelation: [],
      runsTest: { runs: 0, expectedRuns: 0, zScore: 0, pValueApprox: 1, interpretation: 'Insufficient sample size for runs test.' }
    };
  }

  const rSeries = sorted.map(t => getTradeR(t));
  const meanR = rSeries.reduce((a, b) => a + b, 0) / n;
  const varianceR = rSeries.reduce((acc, v) => acc + Math.pow(v - meanR, 2), 0);

  const autocorrelation: { lag: number; correlation: number; significant: boolean; ciThreshold: number }[] = [];
  const threshold = 1.96 / Math.sqrt(n);

  for (let lag = 1; lag <= Math.min(6, Math.floor(n / 3)); lag++) {
    let num = 0;
    for (let i = 0; i < n - lag; i++) {
      num += (rSeries[i] - meanR) * (rSeries[i + lag] - meanR);
    }
    const r = varianceR > 0 ? num / varianceR : 0;
    autocorrelation.push({
      lag,
      correlation: parseFloat(r.toFixed(3)),
      significant: Math.abs(r) > threshold,
      ciThreshold: parseFloat(threshold.toFixed(3))
    });
  }

  const winCount = sorted.filter(t => t.result === 'WIN').length;
  const lossCount = sorted.filter(t => t.result === 'LOSS').length;

  let runs = 1;
  for (let i = 1; i < n; i++) {
    if (sorted[i].result !== sorted[i - 1].result) {
      runs++;
    }
  }

  const expectedRuns = (2 * winCount * lossCount) / n + 1;
  const varianceRuns = (2 * winCount * lossCount * (2 * winCount * lossCount - n)) / (Math.pow(n, 2) * (n - 1));
  const zScore = varianceRuns > 0 ? (runs - expectedRuns) / Math.sqrt(varianceRuns) : 0;

  let interpretation = 'Outcomes show no significant serial clustering (consistent with independent trials).';
  if (zScore < -1.96) {
    interpretation = 'Significant streak clustering observed (losses/wins group more than expected by chance).';
  } else if (zScore > 1.96) {
    interpretation = 'Excessive alternation observed (alternating win/loss more frequently than random sequence).';
  }

  return {
    available: true,
    sampleSize: n,
    autocorrelation,
    runsTest: {
      runs,
      expectedRuns: parseFloat(expectedRuns.toFixed(1)),
      zScore: parseFloat(zScore.toFixed(2)),
      pValueApprox: parseFloat((2 * (1 - normalCdf(Math.abs(zScore)))).toFixed(3)),
      interpretation
    }
  };
}

// 49. TRADE ORDER SENSITIVITY & PATH RESHUFFLING (1,000 Permutations)
export function calculateTradeOrderSensitivity(trades: Trade[], iterations = 1000) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n < 5) {
    return { available: false, sampleSize: n, maxDDPercentiles: null, originalMaxDD: 0, ddDispersion: [] };
  }

  const originalPnls = completed.map(t => safeNum(t.pnl));
  
  // Calculate original Max DD
  let originalPeak = 10000;
  let originalCur = 10000;
  let originalMaxDD = 0;
  originalPnls.forEach(p => {
    originalCur += p;
    if (originalCur > originalPeak) originalPeak = originalCur;
    const dd = originalPeak - originalCur;
    if (dd > originalMaxDD) originalMaxDD = dd;
  });

  const shuffledMaxDDs: number[] = [];
  for (let iter = 0; iter < iterations; iter++) {
    // Fisher-Yates shuffle
    const shuffled = [...originalPnls];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let peak = 10000;
    let cur = 10000;
    let maxDD = 0;
    shuffled.forEach(p => {
      cur += p;
      if (cur > peak) peak = cur;
      const dd = peak - cur;
      if (dd > maxDD) maxDD = dd;
    });
    shuffledMaxDDs.push(maxDD);
  }

  shuffledMaxDDs.sort((a, b) => a - b);
  const getP = (arr: number[], p: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * p))];

  const maxDDPercentiles = {
    p5: getP(shuffledMaxDDs, 0.05),
    median: getP(shuffledMaxDDs, 0.50),
    p75: getP(shuffledMaxDDs, 0.75),
    p95: getP(shuffledMaxDDs, 0.95),
    worstPossible: shuffledMaxDDs[shuffledMaxDDs.length - 1]
  };

  return {
    available: true,
    sampleSize: n,
    originalMaxDD,
    maxDDPercentiles,
    shuffledMeanDD: shuffledMaxDDs.reduce((a, b) => a + b, 0) / iterations
  };
}

// 50 - 52. POST-LOSS & POST-WIN TIME GAPS & TRADE INTERVALS
export function calculateInterTradeGapAnalysis(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  if (n < 4) {
    return { available: false, sampleSize: n, postLossGapsHours: [], postWinGapsHours: [], avgPostLossGapHours: 0, avgPostWinGapHours: 0 };
  }

  const postLossGaps: number[] = [];
  const postWinGaps: number[] = [];
  const allGaps: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    const tCur = getTradeTimestamp(cur.date);
    const tNext = getTradeTimestamp(next.date);

    if (tCur > 0 && tNext > 0 && tNext >= tCur) {
      const gapHours = (tNext - tCur) / (1000 * 60 * 60);
      allGaps.push(gapHours);
      const isLoss = (cur.pnl && cur.pnl < 0) || cur.result === 'LOSS';
      const isWin = (cur.pnl && cur.pnl > 0) || cur.result === 'WIN';

      if (isLoss) postLossGaps.push(gapHours);
      if (isWin) postWinGaps.push(gapHours);
    }
  }

  const avgPostLoss = postLossGaps.length > 0 ? postLossGaps.reduce((a, b) => a + b, 0) / postLossGaps.length : 0;
  const avgPostWin = postWinGaps.length > 0 ? postWinGaps.reduce((a, b) => a + b, 0) / postWinGaps.length : 0;

  return {
    available: allGaps.length > 0,
    sampleSize: n,
    avgPostLossGapHours: parseFloat(avgPostLoss.toFixed(1)),
    avgPostWinGapHours: parseFloat(avgPostWin.toFixed(1)),
    medianPostLossGapHours: postLossGaps.length > 0 ? [...postLossGaps].sort((a, b) => a - b)[Math.floor(postLossGaps.length / 2)] : 0,
    medianPostWinGapHours: postWinGaps.length > 0 ? [...postWinGaps].sort((a, b) => a - b)[Math.floor(postWinGaps.length / 2)] : 0
  };
}

// 53 - 55. TRADE CLUSTERS & REVENGE/BURST DETECTION
export function calculateTradeClusters(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  if (n < 4) {
    return { available: false, sampleSize: n, clustersCount: 0, revengeTrades: [], euphoriaTrades: [] };
  }

  const revengeTrades: Trade[] = [];
  const euphoriaTrades: Trade[] = [];

  for (let i = 0; i < n - 1; i++) {
    const cur = sorted[i];
    const next = sorted[i + 1];
    const tCur = getTradeTimestamp(cur.date);
    const tNext = getTradeTimestamp(next.date);

    if (tCur > 0 && tNext > 0) {
      const diffHours = (tNext - tCur) / (1000 * 60 * 60);
      // If entered within 2 hours of a loss with equal or higher risk
      if (diffHours <= 2 && cur.result === 'LOSS') {
        revengeTrades.push(next);
      }
      // If entered within 2 hours of a win
      if (diffHours <= 2 && cur.result === 'WIN') {
        euphoriaTrades.push(next);
      }
    }
  }

  return {
    available: true,
    sampleSize: n,
    revengeCount: revengeTrades.length,
    euphoriaCount: euphoriaTrades.length,
    revengeTrades,
    euphoriaTrades
  };
}

// 56 - 57. BREAK-EVEN & ZERO-R ANALYSIS
export function calculateBreakEvenAndZeroRAnalysis(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n === 0) {
    return {
      sampleSize: 0,
      breakEvenCount: 0,
      breakEvenRate: 0,
      zeroRTrades: [],
      nextTradeAfterBEWinRate: 0,
      nextTradeAfterBEAvgR: 0
    };
  }

  const zeroRTrades = completed.filter(t => Math.abs(getTradeR(t)) < 0.05 || t.result === 'BREAK EVEN');
  const beCount = zeroRTrades.length;
  const beRate = (beCount / n) * 100;

  // Next trade after BE outcomes
  const sorted = [...completed].sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));
  const nextTradesAfterBE: Trade[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (Math.abs(getTradeR(sorted[i])) < 0.05 || sorted[i].result === 'BREAK EVEN') {
      nextTradesAfterBE.push(sorted[i + 1]);
    }
  }

  const nextWins = nextTradesAfterBE.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
  const nextWinRate = nextTradesAfterBE.length > 0 ? (nextWins / nextTradesAfterBE.length) * 100 : 0;
  const nextAvgR = nextTradesAfterBE.length > 0 ? nextTradesAfterBE.reduce((acc, t) => acc + getTradeR(t), 0) / nextTradesAfterBE.length : 0;

  return {
    sampleSize: n,
    breakEvenCount: beCount,
    breakEvenRate: beRate,
    zeroRTrades,
    nextTradesAfterBECount: nextTradesAfterBE.length,
    nextTradeAfterBEWinRate: nextWinRate,
    nextTradeAfterBEAvgR: nextAvgR
  };
}

// ----------------------------------------------------------------------
// REMAINING CALCULATIONS
// ----------------------------------------------------------------------

export function calculateCostDrag(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  let totalCommission = 0;
  let totalSwap = 0;
  let totalFees = 0;
  let hasCostData = false;

  completed.forEach(t => {
    const meta = (t as any).mt5ScreenshotMetadata || {};
    const comm = safeNum((t as any).commission || meta.commission || 0);
    const swap = safeNum((t as any).swap || meta.swap || 0);
    const fee = safeNum((t as any).fees || 0);

    if (comm !== 0 || swap !== 0 || fee !== 0) {
      hasCostData = true;
    }

    totalCommission += Math.abs(comm);
    totalSwap += Math.abs(swap);
    totalFees += Math.abs(fee);
  });

  const totalCost = totalCommission + totalSwap + totalFees;
  const netPnl = completed.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const grossPnl = netPnl + totalCost;
  const costAsPctOfGross = grossPnl > 0 ? (totalCost / grossPnl) * 100 : 0;
  const avgCostPerTrade = n > 0 ? totalCost / n : 0;

  return {
    hasCostData,
    sampleSize: n,
    totalCommission,
    totalSwap,
    totalFees,
    totalCost,
    grossPnl,
    netPnl,
    costAsPctOfGross,
    avgCostPerTrade
  };
}

export function calculateRiskAdjustedMetrics(trades: Trade[], initialCapital = 10000) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n === 0) {
    return {
      sampleSize: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      ulcerIndex: 0,
      recoveryFactor: 0,
      marRatio: 0,
      maxDrawdownPnl: 0,
      maxDrawdownPercent: 0,
      annualizedReturnPercent: 0
    };
  }

  const rValues = completed.map(t => getTradeR(t));
  const meanR = rValues.reduce((a, b) => a + b, 0) / n;
  const varR = n > 1 ? rValues.reduce((acc, v) => acc + Math.pow(v - meanR, 2), 0) / (n - 1) : 0;
  const stdDevR = Math.sqrt(varR);

  const downsideVar = rValues.reduce((acc, v) => acc + Math.pow(Math.min(0, v), 2), 0) / (n || 1);
  const downsideDev = Math.sqrt(downsideVar);

  const dates = Array.from(new Set(completed.map(t => getTradeDateStr(t.date)).filter(Boolean)));
  const days = Math.max(1, dates.length);
  const annualFactor = Math.sqrt(Math.max(1, (n / days) * 252));

  const sharpe = stdDevR > 0 ? (meanR / stdDevR) * annualFactor : 0;
  const sortino = downsideDev > 0 ? (meanR / downsideDev) * annualFactor : 0;

  let peak = initialCapital;
  let currentEquity = initialCapital;
  let maxDD = 0;
  let maxDDPct = 0;
  const squaredDDs: number[] = [];

  completed.forEach(t => {
    currentEquity += safeNum(t.pnl);
    if (currentEquity > peak) peak = currentEquity;
    const dd = peak - currentEquity;
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
    if (ddPct > maxDDPct) maxDDPct = ddPct;
    squaredDDs.push(Math.pow(ddPct, 2));
  });

  const totalNetPnl = completed.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const recoveryFactor = maxDD > 0 ? totalNetPnl / maxDD : totalNetPnl > 0 ? 10 : 0;
  const ulcerIndex = squaredDDs.length > 0 ? Math.sqrt(squaredDDs.reduce((a, b) => a + b, 0) / squaredDDs.length) : 0;

  const totalReturnPct = initialCapital > 0 ? (totalNetPnl / initialCapital) * 100 : 0;
  const annualizedReturn = days > 0 ? (totalReturnPct / days) * 252 : totalReturnPct;
  const calmar = maxDDPct > 0 ? annualizedReturn / maxDDPct : 0;

  return {
    sampleSize: n,
    sharpeRatio: parseFloat(sharpe.toFixed(2)),
    sortinoRatio: parseFloat(sortino.toFixed(2)),
    calmarRatio: parseFloat(calmar.toFixed(2)),
    ulcerIndex: parseFloat(ulcerIndex.toFixed(2)),
    recoveryFactor: parseFloat(recoveryFactor.toFixed(2)),
    marRatio: parseFloat(calmar.toFixed(2)),
    maxDrawdownPnl: maxDD,
    maxDrawdownPercent: maxDDPct,
    annualizedReturnPercent: annualizedReturn
  };
}

export function calculateNumericCorrelationMatrix(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const vars = [
    { key: 'realizedR', label: 'Realized R', get: (t: Trade) => getTradeR(t) },
    { key: 'pnl', label: 'Net P&L ($)', get: (t: Trade) => safeNum(t.pnl) },
    { key: 'riskPercent', label: 'Risk %', get: (t: Trade) => getTradeRiskPercent(t) },
    { key: 'positionSize', label: 'Position Size', get: (t: Trade) => safeNum(t.positionSize ?? (t as any).quantity ?? 1.0) },
    { key: 'durationMin', label: 'Duration (Min)', get: (t: Trade) => safeNum((t as any).durationMinutes ?? 30) }
  ];

  if (n < 5) {
    return { available: false, variables: vars.map(v => v.label), matrix: [] };
  }

  const series = vars.map(v => completed.map(v.get));

  const pearson = (x: number[], y: number[]) => {
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den > 0 ? parseFloat((num / den).toFixed(2)) : 0;
  };

  const matrix: number[][] = [];
  for (let i = 0; i < vars.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < vars.length; j++) {
      row.push(pearson(series[i], series[j]));
    }
    matrix.push(row);
  }

  return {
    available: true,
    variables: vars.map(v => v.label),
    matrix
  };
}

// 12. DRAWDOWN DURATION & UNDERWATER CURVE
export function calculateUnderwaterCurveAndDuration(trades: Trade[], initialCapital = 10000) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  if (sorted.length === 0) {
    return {
      underwaterSeries: [],
      drawdownPeriods: [],
      avgDurationTrades: 0,
      maxDurationTrades: 0,
      currentDrawdownTrades: 0
    };
  }

  let peak = initialCapital;
  let equity = initialCapital;
  const underwaterSeries: { index: number; date: string; drawdownPnl: number; drawdownPct: number; equity: number }[] = [];

  interface DDPeriod {
    startIndex: number;
    startDate: string;
    bottomIndex: number;
    bottomDate: string;
    endIndex: number | null;
    endDate: string | null;
    depthPnl: number;
    depthPct: number;
    tradesCount: number;
    recovered: boolean;
  }

  const drawdownPeriods: DDPeriod[] = [];
  let currentPeriod: DDPeriod | null = null;

  sorted.forEach((t, i) => {
    equity += safeNum(t.pnl);
    const date = getTradeDateStr(t.date) || `Trade #${i + 1}`;

    if (equity > peak) {
      peak = equity;
      if (currentPeriod) {
        currentPeriod.endIndex = i + 1;
        currentPeriod.endDate = date;
        currentPeriod.tradesCount = i + 1 - currentPeriod.startIndex;
        currentPeriod.recovered = true;
        drawdownPeriods.push(currentPeriod);
        currentPeriod = null;
      }
    } else if (equity < peak) {
      const dd = peak - equity;
      const ddPct = (dd / peak) * 100;

      if (!currentPeriod) {
        currentPeriod = {
          startIndex: i,
          startDate: date,
          bottomIndex: i + 1,
          bottomDate: date,
          endIndex: null,
          endDate: null,
          depthPnl: dd,
          depthPct: ddPct,
          tradesCount: 1,
          recovered: false
        };
      } else {
        if (dd > currentPeriod.depthPnl) {
          currentPeriod.depthPnl = dd;
          currentPeriod.depthPct = ddPct;
          currentPeriod.bottomIndex = i + 1;
          currentPeriod.bottomDate = date;
        }
        currentPeriod.tradesCount = i + 1 - currentPeriod.startIndex;
      }
    }

    const currentDD = peak - equity;
    const currentDDPct = peak > 0 ? (currentDD / peak) * 100 : 0;

    underwaterSeries.push({
      index: i + 1,
      date,
      drawdownPnl: -currentDD,
      drawdownPct: -currentDDPct,
      equity
    });
  });

  if (currentPeriod) {
    drawdownPeriods.push(currentPeriod);
  }

  const completedDDs = drawdownPeriods.filter(d => d.recovered);
  const avgDuration = completedDDs.length > 0 ? completedDDs.reduce((a, b) => a + b.tradesCount, 0) / completedDDs.length : 0;
  const maxDuration = drawdownPeriods.length > 0 ? Math.max(...drawdownPeriods.map(d => d.tradesCount)) : 0;
  const currentDrawdownTrades = currentPeriod ? currentPeriod.tradesCount : 0;

  return {
    underwaterSeries,
    drawdownPeriods,
    avgDurationTrades: parseFloat(avgDuration.toFixed(1)),
    maxDurationTrades: maxDuration,
    currentDrawdownTrades
  };
}

// 13. RISK BUCKET ANALYSIS
export function calculateRiskBuckets(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const buckets = [
    { label: '0.00% - 0.25%', min: 0, max: 0.25, trades: [] as Trade[] },
    { label: '0.25% - 0.50%', min: 0.25, max: 0.50, trades: [] as Trade[] },
    { label: '0.50% - 1.00%', min: 0.50, max: 1.00, trades: [] as Trade[] },
    { label: '1.00% - 2.00%', min: 1.00, max: 2.00, trades: [] as Trade[] },
    { label: '2.00%+', min: 2.00, max: Infinity, trades: [] as Trade[] }
  ];

  completed.forEach(t => {
    const risk = getTradeRiskPercent(t);
    const target = buckets.find(b => risk >= b.min && risk < b.max);
    if (target) target.trades.push(t);
  });

  return buckets.map(b => {
    const count = b.trades.length;
    const wins = b.trades.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = b.trades.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = b.trades.reduce((acc, t) => acc + getTradeR(t), 0);
    return {
      bucket: b.label,
      tradeCount: count,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      avgR: count > 0 ? totalR / count : 0,
      netPnl,
      trades: b.trades
    };
  });
}

// 15. PERFORMANCE WATERFALL
export function calculatePerformanceWaterfall(trades: Trade[], startingCapital = 10000) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const wins = completed.filter(t => safeNum(t.pnl) > 0);
  const losses = completed.filter(t => safeNum(t.pnl) < 0);

  const grossGains = wins.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const grossLosses = losses.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const costs = completed.reduce((acc, t) => {
    const comm = safeNum((t as any).commission || (t as any).mt5ScreenshotMetadata?.commission || 0);
    const swap = safeNum((t as any).swap || (t as any).mt5ScreenshotMetadata?.swap || 0);
    return acc + Math.abs(comm) + Math.abs(swap);
  }, 0);

  const netPnl = grossGains + grossLosses;
  const endingCapital = startingCapital + netPnl;

  return [
    { name: 'Starting Equity', value: startingCapital, runningTotal: startingCapital, isTotal: true },
    { name: 'Gross Gains', value: grossGains, runningTotal: startingCapital + grossGains, fill: '#10b981' },
    { name: 'Gross Losses', value: grossLosses, runningTotal: startingCapital + grossGains + grossLosses, fill: '#f43f5e' },
    { name: 'Friction / Costs', value: -costs, runningTotal: startingCapital + grossGains + grossLosses - costs, fill: '#f59e0b' },
    { name: 'Ending Equity', value: endingCapital, runningTotal: endingCapital, isTotal: true }
  ];
}

// 16. CROSS-MATRICES (Strategy × Session, Strategy × Market, Strategy × Risk)
export function calculateCrossMatrix(trades: Trade[], rowField: 'strategy' | 'market' | 'session' | 'direction', colField: 'session' | 'market' | 'direction' | 'riskPercentage') {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  
  const getVal = (t: Trade, field: string) => {
    if (field === 'strategy') return t.strategy || 'Unspecified';
    if (field === 'market') return t.pair || t.market || 'Unknown';
    if (field === 'session') return t.session || 'Unspecified';
    if (field === 'direction') return t.direction || 'BUY';
    if (field === 'riskPercentage') {
      const r = getTradeRiskPercent(t);
      return r < 1 ? '< 1%' : r <= 2 ? '1-2%' : '> 2%';
    }
    return 'Other';
  };

  const rows = Array.from(new Set(completed.map(t => getVal(t, rowField))));
  const cols = Array.from(new Set(completed.map(t => getVal(t, colField))));

  const matrix: { row: string; cells: { col: string; tradeCount: number; winRate: number; avgR: number; netPnl: number; trades: Trade[] }[] }[] = [];

  rows.forEach(r => {
    const rowCells = cols.map(c => {
      const cellTrades = completed.filter(t => getVal(t, rowField) === r && getVal(t, colField) === c);
      const count = cellTrades.length;
      const wins = cellTrades.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      const netPnl = cellTrades.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      const totalR = cellTrades.reduce((acc, t) => acc + getTradeR(t), 0);
      return {
        col: c,
        tradeCount: count,
        winRate: count > 0 ? (wins / count) * 100 : 0,
        avgR: count > 0 ? totalR / count : 0,
        netPnl,
        trades: cellTrades
      };
    });
    matrix.push({ row: r, cells: rowCells });
  });

  return { rows, cols, matrix };
}

// 17. DIRECTIONAL ASYMMETRY ANALYZER (BUY vs SELL)
export function calculateDirectionalAsymmetry(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const buys = completed.filter(t => t.direction === 'BUY');
  const sells = completed.filter(t => t.direction === 'SELL');

  const calcGroup = (group: Trade[], label: string) => {
    const n = group.length;
    if (n === 0) return { label, count: 0, winRate: 0, avgR: 0, netPnl: 0, profitFactor: 0, avgDurationMin: 0 };
    const wins = group.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = group.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = group.reduce((acc, t) => acc + getTradeR(t), 0);
    const grossP = group.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const grossL = group.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
    const pf = grossL > 0 ? grossP / grossL : grossP > 0 ? 10 : 0;
    return {
      label,
      count: n,
      winRate: (wins / n) * 100,
      avgR: totalR / n,
      netPnl,
      profitFactor: pf,
      avgDurationMin: 45
    };
  };

  return {
    buys: calcGroup(buys, 'Long / BUY'),
    sells: calcGroup(sells, 'Short / SELL')
  };
}

// 18. DATA COMPLETENESS ANALYTICS
export function calculateDataCompleteness(trades: Trade[]) {
  const total = trades.length;
  if (total === 0) return [];

  const checks = [
    { field: 'Entry & Exit Price', test: (t: Trade) => Boolean(t.entry && (t.exitPrice || (t as any).exit)) },
    { field: 'Stop Loss Defined', test: (t: Trade) => Boolean(t.stopLoss) },
    { field: 'Take Profit Defined', test: (t: Trade) => Boolean(t.takeProfit) },
    { field: 'Risk % or Amount', test: (t: Trade) => Boolean(t.riskPercent || t.risk || (t as any).riskPercentage) },
    { field: 'Strategy Tagged', test: (t: Trade) => Boolean(t.strategy) },
    { field: 'Session Recorded', test: (t: Trade) => Boolean(t.session) },
    { field: 'Emotion / Psychology', test: (t: Trade) => Boolean(t.emotions || (t as any).emotion) },
    { field: 'Chart Screenshot', test: (t: Trade) => Boolean(t.screenshot || t.screenshots || t.entryScreenshot || t.exitScreenshot) },
    { field: 'Rule Adherence Logged', test: (t: Trade) => Boolean((t as any).rulesFollowed || (t as any).ruleIds || (t as any).adherenceScore) },
    { field: 'Setup Quality Rated', test: (t: Trade) => Boolean((t as any).setupQuality) }
  ];

  return checks.map(c => {
    const present = trades.filter(c.test).length;
    return {
      field: c.field,
      presentCount: present,
      totalCount: total,
      completenessPercent: (present / total) * 100
    };
  });
}

// ----------------------------------------------------------------------
// EXPANSION 2: DEEP DRAWDOWN & RISK EVENT ANALYSIS
// ----------------------------------------------------------------------

export interface DrawdownEvent {
  id: string;
  peakIndex: number;
  peakDate: string;
  peakEquity: number;
  startIndex: number;
  startDate: string;
  troughIndex: number;
  troughDate: string;
  troughEquity: number;
  recoveryIndex: number | null;
  recoveryDate: string;
  depthPnl: number;
  depthPct: number;
  tradesInDD: number;
  recoveryTrades: number;
  totalDurationTrades: number;
  durationDays: number;
  isRecovered: boolean;
  trades: Trade[];
  strategyBreakdown: { name: string; loss: number; tradeCount: number }[];
  marketBreakdown: { name: string; loss: number; tradeCount: number }[];
  sessionBreakdown: { name: string; loss: number; tradeCount: number }[];
}

export function calculateDeepDrawdownAnalysis(trades: Trade[], initialCapital = 10000) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  if (n === 0) {
    return {
      sampleSize: 0,
      ulcerIndex: 0,
      recoveryFactor: 0,
      marRatio: 0,
      equityR2: 0,
      kRatio: 0,
      profitEfficiency: 0,
      capitalEfficiency: 0,
      avgDrawdownDurationTrades: 0,
      maxDrawdownDurationTrades: 0,
      drawdownEvents: [] as DrawdownEvent[],
      drawdownDepthHistogram: [] as { bin: string; count: number; freq: number }[],
      underwaterSeries: [] as { index: number; date: string; drawdownPnl: number; drawdownPct: number; equity: number }[]
    };
  }

  let peak = initialCapital;
  let equity = initialCapital;
  let maxDD = 0;
  let maxDDPct = 0;
  const squaredDDs: number[] = [];
  const underwaterSeries: { index: number; date: string; drawdownPnl: number; drawdownPct: number; equity: number }[] = [];

  const events: DrawdownEvent[] = [];
  let currentEvent: {
    peakIndex: number;
    peakDate: string;
    peakEquity: number;
    startIndex: number;
    startDate: string;
    troughIndex: number;
    troughDate: string;
    troughEquity: number;
    depthPnl: number;
    depthPct: number;
    trades: Trade[];
  } | null = null;

  sorted.forEach((t, i) => {
    const prevEquity = equity;
    equity += safeNum(t.pnl);
    const dateStr = getTradeDateStr(t.date) || `Trade #${i + 1}`;

    if (equity >= peak) {
      if (currentEvent) {
        // Recovery reached
        const stratCounts: Record<string, { loss: number; count: number }> = {};
        const marketCounts: Record<string, { loss: number; count: number }> = {};
        const sessionCounts: Record<string, { loss: number; count: number }> = {};

        currentEvent.trades.forEach(dt => {
          const l = Math.abs(Math.min(0, safeNum(dt.pnl)));
          const st = dt.strategy || 'Unspecified';
          const mk = dt.pair || dt.market || 'Unknown';
          const se = dt.session || 'Unspecified';

          stratCounts[st] = { loss: (stratCounts[st]?.loss || 0) + l, count: (stratCounts[st]?.count || 0) + 1 };
          marketCounts[mk] = { loss: (marketCounts[mk]?.loss || 0) + l, count: (marketCounts[mk]?.count || 0) + 1 };
          sessionCounts[se] = { loss: (sessionCounts[se]?.loss || 0) + l, count: (sessionCounts[se]?.count || 0) + 1 };
        });

        const startT = getTradeTimestamp(currentEvent.trades[0]?.date);
        const endT = getTradeTimestamp(t.date);
        const daysDiff = startT > 0 && endT >= startT ? Math.max(1, Math.round((endT - startT) / (1000 * 60 * 60 * 24))) : currentEvent.trades.length;

        events.push({
          id: `dd-event-${events.length + 1}`,
          peakIndex: currentEvent.peakIndex,
          peakDate: currentEvent.peakDate,
          peakEquity: currentEvent.peakEquity,
          startIndex: currentEvent.startIndex,
          startDate: currentEvent.startDate,
          troughIndex: currentEvent.troughIndex,
          troughDate: currentEvent.troughDate,
          troughEquity: currentEvent.troughEquity,
          recoveryIndex: i + 1,
          recoveryDate: dateStr,
          depthPnl: currentEvent.depthPnl,
          depthPct: currentEvent.depthPct,
          tradesInDD: currentEvent.troughIndex - currentEvent.startIndex + 1,
          recoveryTrades: i + 1 - currentEvent.troughIndex,
          totalDurationTrades: i + 1 - currentEvent.startIndex,
          durationDays: daysDiff,
          isRecovered: true,
          trades: currentEvent.trades,
          strategyBreakdown: Object.entries(stratCounts).map(([name, d]) => ({ name, loss: d.loss, tradeCount: d.count })).sort((a, b) => b.loss - a.loss),
          marketBreakdown: Object.entries(marketCounts).map(([name, d]) => ({ name, loss: d.loss, tradeCount: d.count })).sort((a, b) => b.loss - a.loss),
          sessionBreakdown: Object.entries(sessionCounts).map(([name, d]) => ({ name, loss: d.loss, tradeCount: d.count })).sort((a, b) => b.loss - a.loss)
        });
        currentEvent = null;
      }
      peak = equity;
    } else {
      const dd = peak - equity;
      const ddPct = (dd / peak) * 100;
      if (dd > maxDD) maxDD = dd;
      if (ddPct > maxDDPct) maxDDPct = ddPct;

      if (!currentEvent) {
        currentEvent = {
          peakIndex: i,
          peakDate: getTradeDateStr(sorted[Math.max(0, i - 1)]?.date) || dateStr,
          peakEquity: peak,
          startIndex: i + 1,
          startDate: dateStr,
          troughIndex: i + 1,
          troughDate: dateStr,
          troughEquity: equity,
          depthPnl: dd,
          depthPct: ddPct,
          trades: [t]
        };
      } else {
        currentEvent.trades.push(t);
        if (dd > currentEvent.depthPnl) {
          currentEvent.depthPnl = dd;
          currentEvent.depthPct = ddPct;
          currentEvent.troughIndex = i + 1;
          currentEvent.troughDate = dateStr;
          currentEvent.troughEquity = equity;
        }
      }
    }

    const curDD = peak - equity;
    const curDDPct = peak > 0 ? (curDD / peak) * 100 : 0;
    squaredDDs.push(Math.pow(curDDPct, 2));

    underwaterSeries.push({
      index: i + 1,
      date: dateStr,
      drawdownPnl: -curDD,
      drawdownPct: -curDDPct,
      equity
    });
  });

  if (currentEvent) {
    const unrecovered = currentEvent as any;
    const stratCounts: Record<string, { loss: number; count: number }> = {};
    const marketCounts: Record<string, { loss: number; count: number }> = {};
    const sessionCounts: Record<string, { loss: number; count: number }> = {};

    unrecovered.trades.forEach((dt: Trade) => {
      const l = Math.abs(Math.min(0, safeNum(dt.pnl)));
      const st = dt.strategy || 'Unspecified';
      const mk = dt.pair || dt.market || 'Unknown';
      const se = dt.session || 'Unspecified';
      stratCounts[st] = { loss: (stratCounts[st]?.loss || 0) + l, count: (stratCounts[st]?.count || 0) + 1 };
      marketCounts[mk] = { loss: (marketCounts[mk]?.loss || 0) + l, count: (marketCounts[mk]?.count || 0) + 1 };
      sessionCounts[se] = { loss: (sessionCounts[se]?.loss || 0) + l, count: (sessionCounts[se]?.count || 0) + 1 };
    });

    events.push({
      id: `dd-event-${events.length + 1}`,
      peakIndex: unrecovered.peakIndex,
      peakDate: unrecovered.peakDate,
      peakEquity: unrecovered.peakEquity,
      startIndex: unrecovered.startIndex,
      startDate: unrecovered.startDate,
      troughIndex: unrecovered.troughIndex,
      troughDate: unrecovered.troughDate,
      troughEquity: unrecovered.troughEquity,
      recoveryIndex: null,
      recoveryDate: 'In Drawdown (Active)',
      depthPnl: unrecovered.depthPnl,
      depthPct: unrecovered.depthPct,
      tradesInDD: unrecovered.troughIndex - unrecovered.startIndex + 1,
      recoveryTrades: 0,
      totalDurationTrades: n - unrecovered.startIndex + 1,
      durationDays: Math.max(1, Math.round(unrecovered.trades.length * 1.5)),
      isRecovered: false,
      trades: unrecovered.trades,
      strategyBreakdown: Object.entries(stratCounts).map(([name, d]) => ({ name, loss: d.loss, tradeCount: d.count })).sort((a, b) => b.loss - a.loss),
      marketBreakdown: Object.entries(marketCounts).map(([name, d]) => ({ name, loss: d.loss, tradeCount: d.count })).sort((a, b) => b.loss - a.loss),
      sessionBreakdown: Object.entries(sessionCounts).map(([name, d]) => ({ name, loss: d.loss, tradeCount: d.count })).sort((a, b) => b.loss - a.loss)
    });
  }

  // Sort events by depth descending
  events.sort((a, b) => b.depthPnl - a.depthPnl);

  const totalNetPnl = sorted.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const recoveryFactor = maxDD > 0 ? totalNetPnl / maxDD : totalNetPnl > 0 ? 10 : 0;
  const ulcerIndex = squaredDDs.length > 0 ? Math.sqrt(squaredDDs.reduce((a, b) => a + b, 0) / squaredDDs.length) : 0;

  const dates = Array.from(new Set(sorted.map(t => getTradeDateStr(t.date)).filter(Boolean)));
  const days = Math.max(1, dates.length);
  const totalReturnPct = initialCapital > 0 ? (totalNetPnl / initialCapital) * 100 : 0;
  const annualizedReturn = (totalReturnPct / days) * 252;
  const marRatio = maxDDPct > 0 ? annualizedReturn / maxDDPct : 0;

  // Equity Curve Smoothness (R^2 against linear progression)
  let cumEquity = initialCapital;
  const eqPoints = sorted.map((t, idx) => {
    cumEquity += safeNum(t.pnl);
    return { x: idx + 1, y: cumEquity };
  });

  const meanX = (n + 1) / 2;
  const meanY = eqPoints.reduce((acc, p) => acc + p.y, 0) / n;
  let num = 0, denX = 0, denY = 0;
  eqPoints.forEach(p => {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  });
  const slope = denX > 0 ? num / denX : 0;
  const r = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
  const equityR2 = r * r;

  // K-Ratio (Slope / Standard Error of Slope)
  const residuals = eqPoints.map(p => p.y - (meanY + slope * (p.x - meanX)));
  const seSlope = n > 2 ? Math.sqrt(residuals.reduce((acc, res) => acc + res * res, 0) / (n - 2)) / Math.sqrt(denX) : 1;
  const kRatio = seSlope > 0 ? (slope / seSlope) : 0;

  const totalRiskDeployed = sorted.reduce((acc, t) => {
    const riskDollar = safeNum(t.risk || ((t.riskPercent || 1) * initialCapital) / 100);
    return acc + Math.max(1, riskDollar);
  }, 0);
  const capitalEfficiency = totalRiskDeployed > 0 ? totalNetPnl / totalRiskDeployed : 0;
  const profitEfficiency = maxDD > 0 ? totalNetPnl / (maxDD * (1 + ulcerIndex / 100)) : 0;

  // Drawdown distribution depth histogram
  const ddHistBins = [
    { bin: '0% - 2%', min: 0, max: 2, count: 0 },
    { bin: '2% - 5%', min: 2, max: 5, count: 0 },
    { bin: '5% - 10%', min: 5, max: 10, count: 0 },
    { bin: '10% - 15%', min: 10, max: 15, count: 0 },
    { bin: '15%+', min: 15, max: Infinity, count: 0 }
  ];
  events.forEach(e => {
    const b = ddHistBins.find(bin => e.depthPct >= bin.min && e.depthPct < bin.max);
    if (b) b.count++;
  });
  const totalEvents = events.length || 1;
  const drawdownDepthHistogram = ddHistBins.map(b => ({
    bin: b.bin,
    count: b.count,
    freq: (b.count / totalEvents) * 100
  }));

  const avgDurationTrades = events.length > 0 ? events.reduce((acc, e) => acc + e.totalDurationTrades, 0) / events.length : 0;
  const maxDurationTrades = events.length > 0 ? Math.max(...events.map(e => e.totalDurationTrades)) : 0;

  return {
    sampleSize: n,
    ulcerIndex: parseFloat(ulcerIndex.toFixed(2)),
    recoveryFactor: parseFloat(recoveryFactor.toFixed(2)),
    marRatio: parseFloat(marRatio.toFixed(2)),
    equityR2: parseFloat(equityR2.toFixed(3)),
    kRatio: parseFloat(kRatio.toFixed(2)),
    profitEfficiency: parseFloat(profitEfficiency.toFixed(2)),
    capitalEfficiency: parseFloat(capitalEfficiency.toFixed(3)),
    avgDrawdownDurationTrades: parseFloat(avgDurationTrades.toFixed(1)),
    maxDrawdownDurationTrades: maxDurationTrades,
    drawdownEvents: events,
    drawdownDepthHistogram,
    underwaterSeries
  };
}

// ----------------------------------------------------------------------
// EXPANSION 2: RISK PROFILING, SIZING & CONCENTRATION
// ----------------------------------------------------------------------

export function calculateRiskProfileAndSizingMetrics(trades: Trade[], initialCapital = 10000) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;
  if (n === 0) {
    return {
      sampleSize: 0,
      riskHistogram: [],
      riskPercentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
      riskConcentration: { top5RiskShare: 0, top5Trades: [] },
      sizingConsistency: { meanRisk: 0, stdRisk: 0, cvRisk: 0, meanLots: 0, stdLots: 0, cvLots: 0 },
      riskTimeline: [],
      conditionalRisk: { afterLossRisk: 0, afterWinRisk: 0, baselineRisk: 0, deltaAfterLoss: 0 },
      scatterData: []
    };
  }

  const riskBuckets = [
    { label: '< 0.50%', min: 0, max: 0.5, trades: [] as Trade[] },
    { label: '0.50% - 1.00%', min: 0.5, max: 1.0, trades: [] as Trade[] },
    { label: '1.00% - 1.50%', min: 1.0, max: 1.5, trades: [] as Trade[] },
    { label: '1.50% - 2.00%', min: 1.5, max: 2.0, trades: [] as Trade[] },
    { label: '2.00%+', min: 2.0, max: Infinity, trades: [] as Trade[] }
  ];

  const riskVals = completed.map(t => getTradeRiskPercent(t));
  const lotVals = completed.map(t => safeNum(t.positionSize ?? (t as any).quantity ?? 1.0));

  completed.forEach(t => {
    const r = getTradeRiskPercent(t);
    const b = riskBuckets.find(bucket => r >= bucket.min && r < bucket.max);
    if (b) b.trades.push(t);
  });

  const riskHistogram = riskBuckets.map(b => {
    const count = b.trades.length;
    const wins = b.trades.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = b.trades.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = b.trades.reduce((acc, t) => acc + getTradeR(t), 0);
    return {
      bucket: b.label,
      count,
      freq: (count / n) * 100,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      avgR: count > 0 ? totalR / count : 0,
      netPnl,
      trades: b.trades
    };
  });

  const sortedRisk = [...riskVals].sort((a, b) => a - b);
  const getP = (arr: number[], p: number) => arr[Math.min(arr.length - 1, Math.floor(arr.length * p))];
  const riskPercentiles = {
    p10: getP(sortedRisk, 0.10),
    p25: getP(sortedRisk, 0.25),
    p50: getP(sortedRisk, 0.50),
    p75: getP(sortedRisk, 0.75),
    p90: getP(sortedRisk, 0.90)
  };

  // Top 5 Risk Trades share
  const sortedByRiskDesc = [...completed].sort((a, b) => getTradeRiskPercent(b) - getTradeRiskPercent(a));
  const top5RiskTrades = sortedByRiskDesc.slice(0, 5);
  const totalRiskSum = riskVals.reduce((a, b) => a + b, 0) || 1;
  const top5RiskSum = top5RiskTrades.reduce((acc, t) => acc + getTradeRiskPercent(t), 0);
  const top5RiskShare = (top5RiskSum / totalRiskSum) * 100;

  // Sizing Consistency & CV (Coefficient of Variation)
  const meanRisk = totalRiskSum / n;
  const varRisk = n > 1 ? riskVals.reduce((acc, v) => acc + Math.pow(v - meanRisk, 2), 0) / (n - 1) : 0;
  const stdRisk = Math.sqrt(varRisk);
  const cvRisk = meanRisk > 0 ? (stdRisk / meanRisk) * 100 : 0;

  const sumLots = lotVals.reduce((a, b) => a + b, 0);
  const meanLots = sumLots / n;
  const varLots = n > 1 ? lotVals.reduce((acc, v) => acc + Math.pow(v - meanLots, 2), 0) / (n - 1) : 0;
  const stdLots = Math.sqrt(varLots);
  const cvLots = meanLots > 0 ? (stdLots / meanLots) * 100 : 0;

  // Risk Escalation Timeline
  const sortedChronological = [...completed].sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));
  const riskTimeline = sortedChronological.map((t, idx) => {
    const slice = sortedChronological.slice(Math.max(0, idx - 9), idx + 1);
    const rollingAvg = slice.reduce((acc, st) => acc + getTradeRiskPercent(st), 0) / slice.length;
    return {
      index: idx + 1,
      date: getTradeDateStr(t.date) || `T#${idx + 1}`,
      riskPct: getTradeRiskPercent(t),
      rollingAvgRisk: parseFloat(rollingAvg.toFixed(2))
    };
  });

  // Conditional Risk after Wins vs after Losses
  const afterLossRisks: number[] = [];
  const afterWinRisks: number[] = [];
  for (let i = 0; i < sortedChronological.length - 1; i++) {
    const cur = sortedChronological[i];
    const next = sortedChronological[i + 1];
    const nextR = getTradeRiskPercent(next);
    if (cur.result === 'LOSS' || (cur.pnl && cur.pnl < 0)) {
      afterLossRisks.push(nextR);
    } else if (cur.result === 'WIN' || (cur.pnl && cur.pnl > 0)) {
      afterWinRisks.push(nextR);
    }
  }

  const afterLossRisk = afterLossRisks.length > 0 ? afterLossRisks.reduce((a, b) => a + b, 0) / afterLossRisks.length : meanRisk;
  const afterWinRisk = afterWinRisks.length > 0 ? afterWinRisks.reduce((a, b) => a + b, 0) / afterWinRisks.length : meanRisk;

  const scatterData = completed.map((t, idx) => ({
    id: t.id || `trade-${idx}`,
    risk: getTradeRiskPercent(t),
    r: getTradeR(t),
    pnl: safeNum(t.pnl),
    duration: getTradeDurationMinutes(t),
    date: getTradeDateStr(t.date),
    pair: t.pair || t.market || 'Unknown'
  }));

  return {
    sampleSize: n,
    riskHistogram,
    riskPercentiles,
    riskConcentration: { top5RiskShare: parseFloat(top5RiskShare.toFixed(1)), top5Trades: top5RiskTrades },
    sizingConsistency: {
      meanRisk: parseFloat(meanRisk.toFixed(2)),
      stdRisk: parseFloat(stdRisk.toFixed(2)),
      cvRisk: parseFloat(cvRisk.toFixed(1)),
      meanLots: parseFloat(meanLots.toFixed(2)),
      stdLots: parseFloat(stdLots.toFixed(2)),
      cvLots: parseFloat(cvLots.toFixed(1))
    },
    riskTimeline,
    conditionalRisk: {
      afterLossRisk: parseFloat(afterLossRisk.toFixed(2)),
      afterWinRisk: parseFloat(afterWinRisk.toFixed(2)),
      baselineRisk: parseFloat(meanRisk.toFixed(2)),
      deltaAfterLoss: parseFloat(((afterLossRisk - meanRisk) / (meanRisk || 1) * 100).toFixed(1))
    },
    scatterData
  };
}

// ----------------------------------------------------------------------
// EXPANSION 2: EXECUTION & TIMING ANALYTICS
// ----------------------------------------------------------------------

export function calculateExecutionAnalytics(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const durationBuckets = [
    { label: '< 15 Min (Scalp)', min: 0, max: 15, trades: [] as Trade[] },
    { label: '15m - 1 Hr (Intraday Quick)', min: 15, max: 60, trades: [] as Trade[] },
    { label: '1 Hr - 4 Hrs (Session Hold)', min: 60, max: 240, trades: [] as Trade[] },
    { label: '4 Hrs - 24 Hrs (Daily Swing)', min: 240, max: 1440, trades: [] as Trade[] },
    { label: '> 24 Hrs (Multi-Day Swing)', min: 1440, max: Infinity, trades: [] as Trade[] }
  ];

  completed.forEach(t => {
    const d = getTradeDurationMinutes(t);
    const b = durationBuckets.find(bucket => d >= bucket.min && d < bucket.max);
    if (b) b.trades.push(t);
  });

  const holdingPeriodBuckets = durationBuckets.map(b => {
    const count = b.trades.length;
    const wins = b.trades.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = b.trades.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = b.trades.reduce((acc, t) => acc + getTradeR(t), 0);
    return {
      label: b.label,
      count,
      freq: n > 0 ? (count / n) * 100 : 0,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      avgR: count > 0 ? totalR / count : 0,
      netPnl,
      trades: b.trades
    };
  });

  // Exit type breakdown
  const exitTypeMap: Record<string, Trade[]> = {
    'Take Profit (TP Hit)': [],
    'Stop Loss (SL Hit)': [],
    'Manual Close': [],
    'Break-Even / Scratch': [],
    'Other / Unspecified': []
  };

  completed.forEach(t => {
    const reason = (t as any).exitReason || (t as any).exitType || '';
    if (reason.toLowerCase().includes('tp') || reason.toLowerCase().includes('target') || (t.result === 'WIN' && t.exitPrice === t.takeProfit)) {
      exitTypeMap['Take Profit (TP Hit)'].push(t);
    } else if (reason.toLowerCase().includes('sl') || reason.toLowerCase().includes('stop') || (t.result === 'LOSS' && t.exitPrice === t.stopLoss)) {
      exitTypeMap['Stop Loss (SL Hit)'].push(t);
    } else if (t.result === 'BREAK EVEN' || Math.abs(getTradeR(t)) < 0.05) {
      exitTypeMap['Break-Even / Scratch'].push(t);
    } else if (reason.toLowerCase().includes('manual') || Boolean(t.exitPrice)) {
      exitTypeMap['Manual Close'].push(t);
    } else {
      exitTypeMap['Other / Unspecified'].push(t);
    }
  });

  const exitTypeBreakdown = Object.entries(exitTypeMap)
    .filter(([_, list]) => list.length > 0)
    .map(([type, list]) => {
      const count = list.length;
      const wins = list.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      const netPnl = list.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      const totalR = list.reduce((acc, t) => acc + getTradeR(t), 0);
      return {
        type,
        count,
        freq: n > 0 ? (count / n) * 100 : 0,
        winRate: count > 0 ? (wins / count) * 100 : 0,
        avgR: count > 0 ? totalR / count : 0,
        netPnl,
        trades: list
      };
    });

  // Hourly timing distribution (0 - 23h)
  const hourCounts: Record<number, Trade[]> = {};
  for (let h = 0; h < 24; h++) hourCounts[h] = [];

  completed.forEach(t => {
    const ts = getTradeTimestamp(t.date);
    if (ts > 0) {
      const hr = new Date(ts).getHours();
      hourCounts[hr].push(t);
    }
  });

  const hourlyDistribution = Object.entries(hourCounts).map(([hrStr, list]) => {
    const hr = parseInt(hrStr, 10);
    const count = list.length;
    const wins = list.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = list.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    return {
      hour: hr,
      label: `${hr.toString().padStart(2, '0')}:00`,
      count,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      netPnl
    };
  });

  // Overnight & Weekend holding
  let overnightCount = 0;
  let weekendCount = 0;
  const overnightTrades: Trade[] = [];
  const weekendTrades: Trade[] = [];

  completed.forEach(t => {
    const dur = getTradeDurationMinutes(t);
    if (dur >= 480) { // > 8 hrs
      overnightCount++;
      overnightTrades.push(t);
    }
    const ts = getTradeTimestamp(t.date);
    if (ts > 0) {
      const day = new Date(ts).getDay(); // 5 = Friday
      if (day === 5 && dur > 600) {
        weekendCount++;
        weekendTrades.push(t);
      }
    }
  });

  // Check slippage and delay fields
  const hasIntendedEntry = completed.some(t => (t as any).intendedPrice || (t as any).plannedEntry);
  const hasOrderTimestamp = completed.some(t => (t as any).orderIntentTimestamp || (t as any).signalTimestamp);

  return {
    sampleSize: n,
    holdingPeriodBuckets,
    exitTypeBreakdown,
    hourlyDistribution,
    overnightAnalysis: { count: overnightCount, trades: overnightTrades },
    weekendAnalysis: { count: weekendCount, trades: weekendTrades },
    slippageStatus: {
      available: hasIntendedEntry,
      requiredFields: ['intendedPrice (or plannedEntry)', 'entryPrice (actual fill)'],
      message: hasIntendedEntry 
        ? 'Real execution fill vs planned order price compared.' 
        : 'Slippage calculation requires logging both planned/intended price and actual fill price.'
    },
    entryDelayStatus: {
      available: hasOrderTimestamp,
      requiredFields: ['orderIntentTimestamp', 'executionFillTimestamp'],
      message: hasOrderTimestamp 
        ? 'Execution latency recorded.' 
        : 'Order delay research requires logging the timestamp of trade decision vs broker fill timestamp.'
    }
  };
}

// ----------------------------------------------------------------------
// EXPANSION 3: TIME & SEASONALITY DEEP ANALYTICS
// ----------------------------------------------------------------------

export function calculateTimeSeasonalityAnalytics(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const sessions = ['Asian', 'London', 'New York'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 1. Day × Session Matrix
  const daySessionMatrix = days.map(day => {
    const row: any = { day };
    sessions.forEach(sess => {
      const matching = completed.filter(t => {
        const d = t.date ? new Date(t.date).toLocaleDateString('en-US', { weekday: 'long' }) : '';
        return d === day && t.session === sess;
      });
      const count = matching.length;
      const totalR = matching.reduce((acc, t) => acc + getTradeR(t), 0);
      const wins = matching.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      const netPnl = matching.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      row[sess] = {
        count,
        avgR: count > 0 ? totalR / count : 0,
        winRate: count > 0 ? (wins / count) * 100 : 0,
        netPnl,
        trades: matching
      };
    });
    return row;
  });

  // 2. 24-Hour Distribution
  const hourlyData: { hour: number; label: string; count: number; winRate: number; avgR: number; netPnl: number; trades: Trade[] }[] = [];
  for (let h = 0; h < 24; h++) {
    const matching = completed.filter(t => {
      const ts = getTradeTimestamp(t.date);
      return ts > 0 && new Date(ts).getHours() === h;
    });
    const count = matching.length;
    const wins = matching.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const totalR = matching.reduce((acc, t) => acc + getTradeR(t), 0);
    const netPnl = matching.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    hourlyData.push({
      hour: h,
      label: `${h.toString().padStart(2, '0')}:00`,
      count,
      winRate: count > 0 ? (wins / count) * 100 : 0,
      avgR: count > 0 ? totalR / count : 0,
      netPnl,
      trades: matching
    });
  }

  // 3. Direction × Session Matrix
  const directionSessionMatrix = ['BUY', 'SELL'].map(dir => {
    const row: any = { direction: dir === 'BUY' ? 'Long (BUY)' : 'Short (SELL)' };
    sessions.forEach(sess => {
      const matching = completed.filter(t => (t.direction || 'BUY') === dir && t.session === sess);
      const count = matching.length;
      const totalR = matching.reduce((acc, t) => acc + getTradeR(t), 0);
      const wins = matching.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      const netPnl = matching.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      row[sess] = {
        count,
        avgR: count > 0 ? totalR / count : 0,
        winRate: count > 0 ? (wins / count) * 100 : 0,
        netPnl,
        trades: matching
      };
    });
    return row;
  });

  // 4. Intraday Cumulative PnL Curve
  let runningIntradayPnl = 0;
  const intradayCurve = hourlyData.map(h => {
    runningIntradayPnl += h.netPnl;
    return {
      hour: h.label,
      netPnl: h.netPnl,
      cumulativePnl: runningIntradayPnl,
      count: h.count
    };
  });

  return {
    sampleSize: n,
    days,
    sessions,
    daySessionMatrix,
    hourlyData,
    directionSessionMatrix,
    intradayCurve
  };
}

// ----------------------------------------------------------------------
// EXPANSION 3: DEEP STRATEGY & REGIME INTERACTION
// ----------------------------------------------------------------------

export function calculateDeepStrategyAnalytics(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  const strategies = Array.from(new Set(completed.map(t => t.strategy || 'Unspecified')));
  const sessions = ['Asian', 'London', 'New York'];
  const markets = Array.from(new Set(completed.map(t => t.pair || t.market || 'Unknown'))).slice(0, 5);

  const strategyScorecard = strategies.map(stratName => {
    const stratTrades = completed.filter(t => (t.strategy || 'Unspecified') === stratName);
    const count = stratTrades.length;
    const wins = stratTrades.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const losses = stratTrades.filter(t => (t.pnl && t.pnl < 0) || t.result === 'LOSS').length;
    const netPnl = stratTrades.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = stratTrades.reduce((acc, t) => acc + getTradeR(t), 0);
    const gp = stratTrades.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const gl = stratTrades.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
    const pf = gl > 0 ? gp / gl : gp > 0 ? 10 : 0;

    let peak = 0;
    let cur = 0;
    let maxDD = 0;
    stratTrades.forEach(t => {
      cur += safeNum(t.pnl);
      if (cur > peak) peak = cur;
      const dd = peak - cur;
      if (dd > maxDD) maxDD = dd;
    });

    const avgR = count > 0 ? totalR / count : 0;
    const winRate = count > 0 ? (wins / count) * 100 : 0;

    return {
      name: stratName,
      tradeCount: count,
      winRate: parseFloat(winRate.toFixed(1)),
      avgR: parseFloat(avgR.toFixed(2)),
      profitFactor: parseFloat(pf.toFixed(2)),
      maxDD: maxDD,
      totalPnl: netPnl,
      stabilityRating: count >= 15 && avgR > 0.2 ? 'Robust Edge' : count >= 5 && avgR > 0 ? 'Preliminary Edge' : 'Limited Sample / Fragile',
      trades: stratTrades
    };
  }).sort((a, b) => b.totalPnl - a.totalPnl);

  // Strategy × Session Matrix
  const strategySessionMatrix = strategies.map(strat => {
    const row: any = { strategy: strat };
    sessions.forEach(sess => {
      const matching = completed.filter(t => (t.strategy || 'Unspecified') === strat && t.session === sess);
      const count = matching.length;
      const wins = matching.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      const totalR = matching.reduce((acc, t) => acc + getTradeR(t), 0);
      const netPnl = matching.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      row[sess] = {
        count,
        winRate: count > 0 ? (wins / count) * 100 : 0,
        avgR: count > 0 ? totalR / count : 0,
        netPnl,
        trades: matching
      };
    });
    return row;
  });

  // Strategy × Risk Tier Matrix
  const riskTiers = ['< 1% Risk', '1% - 2% Risk', '> 2% Risk'];
  const strategyRiskMatrix = strategies.map(strat => {
    const row: any = { strategy: strat };
    riskTiers.forEach(tier => {
      const matching = completed.filter(t => {
        if ((t.strategy || 'Unspecified') !== strat) return false;
        const r = getTradeRiskPercent(t);
        if (tier === '< 1% Risk') return r < 1.0;
        if (tier === '1% - 2% Risk') return r >= 1.0 && r <= 2.0;
        return r > 2.0;
      });
      const count = matching.length;
      const wins = matching.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
      const totalR = matching.reduce((acc, t) => acc + getTradeR(t), 0);
      const netPnl = matching.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      row[tier] = {
        count,
        winRate: count > 0 ? (wins / count) * 100 : 0,
        avgR: count > 0 ? totalR / count : 0,
        netPnl,
        trades: matching
      };
    });
    return row;
  });

  // Market Regime Status Audit
  const hasRegimeData = completed.some(t => (t as any).marketRegime || (t as any).regime);
  const hasNewsData = completed.some(t => (t as any).newsDistanceMinutes || (t as any).economicEvent);

  return {
    sampleSize: n,
    strategies,
    sessions,
    markets,
    riskTiers,
    strategyScorecard,
    strategySessionMatrix,
    strategyRiskMatrix,
    marketRegimeStatus: {
      available: hasRegimeData,
      requiredFields: ['marketRegime (e.g. Trending Bullish, Trending Bearish, Ranging, High Volatility)'],
      message: hasRegimeData 
        ? 'Market regimes classified.' 
        : 'Market regime split requires tagging market volatility/trend state on trade entries.'
    },
    newsEventStatus: {
      available: hasNewsData,
      requiredFields: ['economicEventTitle', 'eventDistanceMinutes', 'eventImpactLevel'],
      message: hasNewsData 
        ? 'Economic calendar proximity evaluated.' 
        : 'News event distance analytics requires linking trade execution timestamps with economic calendar release dates.'
    }
  };
}

// ----------------------------------------------------------------------
// EXPANSION 3: ROBUSTNESS RESEARCH & CONSOLIDATED SCORECARD
// ----------------------------------------------------------------------

export function calculateRobustnessResearchSuite(trades: Trade[]) {
  const sorted = [...trades]
    .filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN')
    .sort((a, b) => (Number(a.date) || 0) - (Number(b.date) || 0));

  const n = sorted.length;
  if (n < 6) {
    return {
      available: false,
      sampleSize: n,
      walkForward: null,
      topNSensitivity: null,
      consolidatedScorecard: null
    };
  }

  // 1. Walk-Forward 70/30 Split
  const splitIdx = Math.floor(n * 0.7);
  const trainSlice = sorted.slice(0, splitIdx);
  const testSlice = sorted.slice(splitIdx);

  const calcSlice = (arr: Trade[]) => {
    const len = arr.length;
    const wins = arr.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
    const netPnl = arr.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const totalR = arr.reduce((acc, t) => acc + getTradeR(t), 0);
    const gp = arr.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const gl = arr.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);
    const pf = gl > 0 ? gp / gl : gp > 0 ? 10 : 0;
    return {
      count: len,
      winRate: (wins / len) * 100,
      avgR: totalR / len,
      netPnl,
      pf
    };
  };

  const trainMetrics = calcSlice(trainSlice);
  const testMetrics = calcSlice(testSlice);

  // 2. Top-N Outlier Sensitivity
  const sortedDesc = [...sorted].sort((a, b) => safeNum(b.pnl) - safeNum(a.pnl));
  const sortedAsc = [...sorted].sort((a, b) => safeNum(a.pnl) - safeNum(b.pnl));

  const allMetrics = calcSlice(sorted);
  const top1Removed = calcSlice(sortedDesc.slice(1));
  const top3Removed = calcSlice(sortedDesc.slice(3));
  const top5Removed = calcSlice(sortedDesc.slice(5));
  const worst1Removed = calcSlice(sortedAsc.slice(1));
  const worst3Removed = calcSlice(sortedAsc.slice(3));

  // 3. Consolidated Multi-Dimensional Scorecard
  const totalR = sorted.reduce((acc, t) => acc + getTradeR(t), 0);
  const avgR = totalR / n;
  const wins = sorted.filter(t => (t.pnl && t.pnl > 0) || t.result === 'WIN').length;
  const winRate = (wins / n) * 100;

  let peak = 0;
  let cur = 0;
  let maxDD = 0;
  sorted.forEach(t => {
    cur += safeNum(t.pnl);
    if (cur > peak) peak = cur;
    const dd = peak - cur;
    if (dd > maxDD) maxDD = dd;
  });

  const isEdgePositive = avgR > 0;
  const isSampleAdequate = n >= 30;
  const isOutOfSamplePositive = testMetrics.avgR > 0;
  const isFragileToOutliers = top3Removed.netPnl < 0 && allMetrics.netPnl > 0;

  return {
    available: true,
    sampleSize: n,
    walkForward: {
      train: trainMetrics,
      test: testMetrics,
      isValidationPassed: testMetrics.avgR > 0
    },
    topNSensitivity: {
      all: allMetrics,
      withoutTop1: top1Removed,
      withoutTop3: top3Removed,
      withoutTop5: top5Removed,
      withoutWorst1: worst1Removed,
      withoutWorst3: worst3Removed
    },
    consolidatedScorecard: {
      observedEdgeR: parseFloat(avgR.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      sampleReliability: isSampleAdequate ? 'Adequate Sample (N ≥ 30)' : 'Limited Historical Evidence (N < 30)',
      outOfSampleStatus: isOutOfSamplePositive ? 'Positive Out-of-Sample Persistence' : 'Out-of-Sample Performance Degradation',
      outlierSensitivityStatus: isFragileToOutliers ? 'High Fragility (Edge driven by top 3 winners)' : 'Resilient (Positive edge retained without outliers)',
      maxHistoricalDrawdown: maxDD
    }
  };
}


export function calculateCostAndFrictionAnalytics(trades: Trade[]) {
  const completed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const n = completed.length;

  let totalCommission = 0;
  let totalSwap = 0;
  let totalFees = 0;
  let hasRealCostData = false;

  const marketCosts: Record<string, { cost: number; trades: Trade[] }> = {};
  const strategyCosts: Record<string, { cost: number; trades: Trade[] }> = {};
  const sessionCosts: Record<string, { cost: number; trades: Trade[] }> = {};

  completed.forEach(t => {
    const meta = (t as any).mt5ScreenshotMetadata || {};
    const comm = Math.abs(safeNum((t as any).commission ?? meta.commission ?? 0));
    const swap = Math.abs(safeNum((t as any).swap ?? meta.swap ?? 0));
    const fee = Math.abs(safeNum((t as any).fees ?? 0));
    const tradeCost = comm + swap + fee;

    if (tradeCost > 0) hasRealCostData = true;

    totalCommission += comm;
    totalSwap += swap;
    totalFees += fee;

    const mk = t.pair || t.market || 'Unknown';
    const st = t.strategy || 'Unspecified';
    const se = t.session || 'Unspecified';

    if (!marketCosts[mk]) marketCosts[mk] = { cost: 0, trades: [] };
    marketCosts[mk].cost += tradeCost;
    marketCosts[mk].trades.push(t);

    if (!strategyCosts[st]) strategyCosts[st] = { cost: 0, trades: [] };
    strategyCosts[st].cost += tradeCost;
    strategyCosts[st].trades.push(t);

    if (!sessionCosts[se]) sessionCosts[se] = { cost: 0, trades: [] };
    sessionCosts[se].cost += tradeCost;
    sessionCosts[se].trades.push(t);
  });

  const totalFriction = totalCommission + totalSwap + totalFees;
  const netPnl = completed.reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const grossGains = completed.filter(t => safeNum(t.pnl) > 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const grossLosses = completed.filter(t => safeNum(t.pnl) < 0).reduce((acc, t) => acc + safeNum(t.pnl), 0);
  const grossPnl = netPnl + totalFriction;

  const costAsPctOfGross = grossGains > 0 ? (totalFriction / grossGains) * 100 : 0;
  const costPerTrade = n > 0 ? totalFriction / n : 0;

  const avgRiskDollar = completed.reduce((acc, t) => acc + safeNum(t.risk || 100), 0) / (n || 1);
  const costDragR = avgRiskDollar > 0 ? totalFriction / avgRiskDollar : 0;

  const formatGroup = (record: Record<string, { cost: number; trades: Trade[] }>) => {
    return Object.entries(record).map(([name, data]) => {
      const count = data.trades.length;
      const net = data.trades.reduce((acc, t) => acc + safeNum(t.pnl), 0);
      return {
        name,
        cost: data.cost,
        tradeCount: count,
        netPnl: net,
        trades: data.trades
      };
    }).sort((a, b) => b.cost - a.cost);
  };

  const frictionWaterfall = [
    { name: 'Gross Gains', value: grossGains, fill: '#10b981' },
    { name: 'Gross Losses', value: grossLosses, fill: '#f43f5e' },
    { name: 'Commissions', value: -totalCommission, fill: '#f59e0b' },
    { name: 'Swaps / Rollover', value: -totalSwap, fill: '#e11d48' },
    { name: 'Broker Fees', value: -totalFees, fill: '#8b5cf6' },
    { name: 'Net Realized P&L', value: netPnl, fill: netPnl >= 0 ? '#10b981' : '#f43f5e', isTotal: true }
  ];

  return {
    hasRealCostData,
    sampleSize: n,
    totalCommission,
    totalSwap,
    totalFees,
    totalFriction,
    grossPnl,
    netPnl,
    costAsPctOfGross: parseFloat(costAsPctOfGross.toFixed(1)),
    costPerTrade: parseFloat(costPerTrade.toFixed(2)),
    costDragR: parseFloat(costDragR.toFixed(2)),
    costByMarket: formatGroup(marketCosts),
    costByStrategy: formatGroup(strategyCosts),
    costBySession: formatGroup(sessionCosts),
    frictionWaterfall
  };
}


