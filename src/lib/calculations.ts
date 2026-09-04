import { Trade } from '@/types';

export function calculateTradeMetrics(trade: Partial<Trade>) {
  const { entry, stopLoss, takeProfit, direction, risk, positionSize } = trade;
  
  const hasPrices = Boolean(entry && stopLoss && takeProfit);
  if (!hasPrices || !direction) return null;

  const entryNum = Number(entry);
  const stopLossNum = Number(stopLoss);
  const takeProfitNum = Number(takeProfit);
  const riskNum = Number(risk) || 0;
  const positionSizeNum = Number(positionSize) || 0;

  // Validate relationships
  if (direction === 'BUY') {
    if (stopLossNum >= entryNum || takeProfitNum <= entryNum) return null;
  } else {
    if (stopLossNum <= entryNum || takeProfitNum >= entryNum) return null;
  }

  const riskDistance = direction === 'BUY' ? entryNum - stopLossNum : stopLossNum - entryNum;
  const rewardDistance = direction === 'BUY' ? takeProfitNum - entryNum : entryNum - takeProfitNum;
  
  const riskRewardRatio = riskDistance > 0 ? rewardDistance / riskDistance : 0;
  const potentialProfit = riskNum * riskRewardRatio;
  const potentialLoss = riskNum;

  return {
    riskDistance,
    rewardDistance,
    riskRewardRatio,
    potentialProfit,
    potentialLoss
  };
}

// Calculate Dashboard / Analytics metrics from a list of trades
export function calculateKPIs(trades: Trade[]) {
  const closedTrades = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
  const winningTrades = closedTrades.filter(t => t.result === 'WIN');
  const losingTrades = closedTrades.filter(t => t.result === 'LOSS');
  
  let totalGrossProfit = 0;
  let totalGrossLoss = 0;
  let totalNetPnl = 0;
  let totalRMultiple = 0;
  
  closedTrades.forEach(t => {
    const pnl = t.pnl || 0;
    totalNetPnl += pnl;
    if (pnl > 0) totalGrossProfit += pnl;
    if (pnl < 0) totalGrossLoss += Math.abs(pnl);
    
    // R multiple logic
    if (t.rMultiple !== undefined) {
      totalRMultiple += t.rMultiple;
    } else if (t.risk) {
      totalRMultiple += (pnl / t.risk);
    }
  });

  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  const profitFactor = totalGrossLoss > 0 ? totalGrossProfit / totalGrossLoss : (totalGrossProfit > 0 ? Infinity : 0);
  const expectancy = closedTrades.length > 0 ? totalNetPnl / closedTrades.length : 0;
  const averageR = closedTrades.length > 0 ? totalRMultiple / closedTrades.length : 0;
  const totalTradesCount = trades.length; // all trades
  
  const averageRisk = closedTrades.reduce((acc, t) => acc + (t.risk || 0), 0) / (closedTrades.length || 1);

  // Simple Max Drawdown calculation (approximate from closed trades sequential PnL)
  let peak = 0;
  let maxDrawdown = 0;
  let currentEquity = 0; // relative to 0
  
  // Sort by date ascending to calculate drawdown
  const sortedTrades = [...closedTrades].sort((a, b) => a.date - b.date);
  
  sortedTrades.forEach(t => {
    currentEquity += (t.pnl || 0);
    if (currentEquity > peak) peak = currentEquity;
    const drawdown = peak - currentEquity;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  });

  return {
    netPnl: totalNetPnl,
    winRate,
    totalTrades: totalTradesCount,
    profitFactor,
    expectancy,
    averageR,
    maxDrawdown,
    averageRisk,
    closedTradesCount: closedTrades.length
  };
}
