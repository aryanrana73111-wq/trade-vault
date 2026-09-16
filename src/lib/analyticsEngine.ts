import { Trade } from '@/types';

// =========================================================================
// ANALYTICS ENGINE: MATHEMATICAL CORE & METRICS
// =========================================================================

export interface AnalyticsMetrics {
  totalTrades: number;
  closedTradesCount: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  winRate: number;
  lossRate: number;
  profitFactor: number | 'MAX';
  expectancy: number;
  averageR: number;
  medianR: number;
  payoffRatio: number;
  averageWin: number;
  averageLoss: number;
  largestWinner: number;
  largestLoser: number;
  maxDrawdown: number;
  averageDrawdown: number;
  recoveryFactor: number;
  riskOfRuin: number | null; // Approximation if possible
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  calmarRatio: number | null;
  sqn: number | null;
}

export function calculateInstitutionalMetrics(trades: Trade[]): AnalyticsMetrics {
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const wins = closed.filter(t => t.result === 'WIN');
  const losses = closed.filter(t => t.result === 'LOSS');

  // Baseline sums
  let grossProfit = 0;
  let grossLoss = 0;
  let netPnl = 0;
  const returns: number[] = [];
  const rMultiples: number[] = [];
  
  closed.forEach(t => {
    const pnl = t.pnl || 0;
    netPnl += pnl;
    returns.push(pnl);
    if (pnl > 0) grossProfit += pnl;
    if (pnl < 0) grossLoss += Math.abs(pnl);

    let r: number | null = null;
    if (t.rMultiple !== undefined && isFinite(t.rMultiple)) {
      r = t.rMultiple;
    } else if (t.risk && Number(t.risk) > 0 && t.pnl !== undefined) {
      r = pnl / Number(t.risk);
    }
    if (r !== null && isFinite(r)) {
      rMultiples.push(r);
    }
  });

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const lossRate = closed.length > 0 ? (losses.length / closed.length) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 'MAX' : 0);
  const expectancy = closed.length > 0 ? netPnl / closed.length : 0;
  const averageR = rMultiples.length > 0 ? rMultiples.reduce((a,b) => a+b, 0) / rMultiples.length : 0;
  
  rMultiples.sort((a, b) => a - b);
  const medianR = rMultiples.length > 0 ? 
    (rMultiples.length % 2 === 0 ? (rMultiples[rMultiples.length/2 - 1] + rMultiples[rMultiples.length/2]) / 2 : rMultiples[Math.floor(rMultiples.length/2)]) 
    : 0;

  const averageWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const averageLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const payoffRatio = averageLoss > 0 ? averageWin / averageLoss : 0;

  const largestWinner = returns.length > 0 ? Math.max(...returns) : 0;
  const largestLoser = returns.length > 0 ? Math.min(...returns) : 0;

  // Drawdown
  let peak = 0;
  let currentEquity = 0;
  let maxDrawdown = 0;
  const drawdowns: number[] = [];
  
  const sortedByDate = [...closed].sort((a,b) => a.date - b.date);
  sortedByDate.forEach(t => {
    currentEquity += (t.pnl || 0);
    if (currentEquity > peak) {
      peak = currentEquity;
      drawdowns.push(0);
    } else {
      const dd = peak - currentEquity;
      drawdowns.push(dd);
      if (dd > maxDrawdown) maxDrawdown = dd;
    }
  });

  const averageDrawdown = drawdowns.length > 0 ? drawdowns.reduce((a,b) => a+b, 0) / drawdowns.length : 0;
  const recoveryFactor = maxDrawdown > 0 ? netPnl / maxDrawdown : 0;

  // Advanced Ratios (Simplified approximations)
  // Sharpe: (Avg Return / StdDev) * sqrt(Trades)
  const meanReturn = returns.length > 0 ? returns.reduce((a,b)=>a+b, 0) / returns.length : 0;
  const variance = returns.length > 0 ? returns.reduce((acc, val) => acc + Math.pow(val - meanReturn, 2), 0) / returns.length : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(returns.length) : null;

  // Sortino: Downside deviation only
  const downsideReturns = returns.filter(r => r < 0);
  const downsideVariance = returns.length > 0 ? downsideReturns.reduce((acc, val) => acc + Math.pow(val, 2), 0) / returns.length : 0;
  const downsideStdDev = Math.sqrt(downsideVariance);
  const sortinoRatio = downsideStdDev > 0 ? (meanReturn / downsideStdDev) * Math.sqrt(returns.length) : null;

  const calmarRatio = maxDrawdown > 0 ? netPnl / maxDrawdown : null; // Typically annualized return / max DD, using net/maxDD here for simplicity

  // System Quality Number (SQN) = (Avg R / StdDev R) * sqrt(Trades)
  const meanR = averageR;
  const rVariance = rMultiples.length > 0 ? rMultiples.reduce((acc, val) => acc + Math.pow(val - meanR, 2), 0) / rMultiples.length : 0;
  const rStdDev = Math.sqrt(rVariance);
  const sqn = rStdDev > 0 ? (meanR / rStdDev) * Math.sqrt(rMultiples.length) : null;

  // Risk of Ruin (Simplified Kelly-based formula for probability of losing 100% based on win rate and payoff)
  let riskOfRuin = null;
  if (winRate > 0 && payoffRatio > 0 && closed.length >= 30) {
    const p = winRate / 100;
    const q = 1 - p;
    // Risk of ruin approximation = ((q / p) ^ units_of_capital) -> simplify to a risk factor for display
    riskOfRuin = Math.pow(q / p, payoffRatio) * 100; // rough representation
    if (riskOfRuin > 100) riskOfRuin = 100;
  }

  return {
    totalTrades: trades.length,
    closedTradesCount: closed.length,
    netPnl,
    grossProfit,
    grossLoss,
    winRate,
    lossRate,
    profitFactor,
    expectancy,
    averageR,
    medianR,
    payoffRatio,
    averageWin,
    averageLoss,
    largestWinner,
    largestLoser,
    maxDrawdown,
    averageDrawdown,
    recoveryFactor,
    riskOfRuin,
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    sqn
  };
}

export function getStreaks(trades: Trade[]) {
  const closed = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN').sort((a,b) => a.date - b.date);
  
  let currentStreak = 0;
  let currentStreakType: 'WIN' | 'LOSS' | null = null;
  
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  const winStreaks: number[] = [];
  const lossStreaks: number[] = [];

  closed.forEach(t => {
    if (t.result === 'WIN') {
      if (currentStreakType === 'WIN') {
        currentStreak++;
      } else {
        if (currentStreakType === 'LOSS' && currentStreak > 0) lossStreaks.push(currentStreak);
        currentStreakType = 'WIN';
        currentStreak = 1;
      }
      if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
    } else if (t.result === 'LOSS') {
      if (currentStreakType === 'LOSS') {
        currentStreak++;
      } else {
        if (currentStreakType === 'WIN' && currentStreak > 0) winStreaks.push(currentStreak);
        currentStreakType = 'LOSS';
        currentStreak = 1;
      }
      if (currentStreak > maxLossStreak) maxLossStreak = currentStreak;
    } else {
      // Break even breaks streak
      if (currentStreakType === 'WIN' && currentStreak > 0) winStreaks.push(currentStreak);
      if (currentStreakType === 'LOSS' && currentStreak > 0) lossStreaks.push(currentStreak);
      currentStreakType = null;
      currentStreak = 0;
    }
  });
  
  if (currentStreakType === 'WIN' && currentStreak > 0) winStreaks.push(currentStreak);
  if (currentStreakType === 'LOSS' && currentStreak > 0) lossStreaks.push(currentStreak);

  const avgWinStreak = winStreaks.length > 0 ? winStreaks.reduce((a,b)=>a+b,0) / winStreaks.length : 0;
  const avgLossStreak = lossStreaks.length > 0 ? lossStreaks.reduce((a,b)=>a+b,0) / lossStreaks.length : 0;

  return {
    current: { count: currentStreak, type: currentStreakType },
    maxWinStreak,
    maxLossStreak,
    avgWinStreak,
    avgLossStreak
  };
}

export function generateEvidenceStrength(sampleSize: number) {
  if (sampleSize < 5) return { label: 'Insufficient Data', color: 'text-slate-500 bg-slate-100', rank: 0 };
  if (sampleSize < 15) return { label: 'Early Evidence', color: 'text-amber-600 bg-amber-50', rank: 1 };
  if (sampleSize < 30) return { label: 'Preliminary Evidence', color: 'text-blue-600 bg-blue-50', rank: 2 };
  return { label: 'Stronger Historical Observation', color: 'text-emerald-700 bg-emerald-50', rank: 3 };
}
