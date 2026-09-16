import { Trade } from '@/types';

export function calculateAdvancedKPIs(trades: Trade[]) {
  const wins = trades.filter(t => (t.pnl || 0) > 0);
  const losses = trades.filter(t => (t.pnl || 0) < 0);
  const netPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl || 0), 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99 : 0;
  const winRate = trades.length > 0 ? wins.length / trades.length : 0;
  
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const expectancy = trades.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / (trades.length || 1);

  // Sharpe, Sortino, Calmar (simplified)
  const returns = trades.map(t => t.pnl || 0);
  const meanReturn = returns.reduce((a,b) => a+b, 0) / (returns.length || 1);
  const variance = returns.reduce((a,b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length || 1);
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0;
  
  const downsideReturns = returns.filter(r => r < 0);
  const downsideVariance = downsideReturns.reduce((a,b) => a + Math.pow(b, 2), 0) / (returns.length || 1);
  const sortinoRatio = Math.sqrt(downsideVariance) > 0 ? meanReturn / Math.sqrt(downsideVariance) : 0;

  return { netPnl, profitFactor, winRate, expectancy, avgWin, avgLoss, sharpeRatio, sortinoRatio };
}

export function generateMonteCarlo(trades: Trade[], numSimulations: number = 1000, numTrades: number = 100) {
    if (trades.length === 0) return [];
    
    // Simple bootstrap sampling
    const outcomes: number[][] = [];
    for (let i=0; i<numSimulations; i++) {
        let equity = 0;
        const path = [0];
        for (let j=0; j<numTrades; j++) {
            const randomTrade = trades[Math.floor(Math.random() * trades.length)];
            equity += (randomTrade.pnl || 0);
            path.push(equity);
        }
        outcomes.push(path);
    }
    
    const percentiles = [];
    for (let t=0; t<=numTrades; t++) {
        const stepValues = outcomes.map(path => path[t]).sort((a,b) => a-b);
        percentiles.push({
            t,
            p5: stepValues[Math.floor(numSimulations * 0.05)],
            p25: stepValues[Math.floor(numSimulations * 0.25)],
            p50: stepValues[Math.floor(numSimulations * 0.50)],
            p75: stepValues[Math.floor(numSimulations * 0.75)],
            p95: stepValues[Math.floor(numSimulations * 0.95)],
        });
    }
    return percentiles;
}
