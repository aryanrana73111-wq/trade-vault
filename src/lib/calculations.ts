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
  const breakEvenTrades = closedTrades.filter(t => t.result === 'BREAK EVEN');
  
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
    if (t.rMultiple !== undefined && isFinite(t.rMultiple)) {
      totalRMultiple += t.rMultiple;
    } else if (t.risk && t.risk > 0) {
      totalRMultiple += (pnl / t.risk);
    }
  });

  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
  
  // Profit factor: if no losses and profit exists, capped at 100 with isAllWins flag
  const isAllWins = closedTrades.length > 0 && losingTrades.length === 0 && winningTrades.length > 0;
  let profitFactor = 0;
  if (totalGrossLoss > 0) {
    profitFactor = totalGrossProfit / totalGrossLoss;
  } else if (totalGrossProfit > 0) {
    profitFactor = 100; // Represents maximum/all wins
  }

  const expectancy = closedTrades.length > 0 ? totalNetPnl / closedTrades.length : 0;
  const averageR = closedTrades.length > 0 ? totalRMultiple / closedTrades.length : 0;
  const totalTradesCount = trades.length; // all trades
  
  const averageWin = winningTrades.length > 0 ? totalGrossProfit / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalGrossLoss / losingTrades.length : 0;
  const averageRisk = closedTrades.length > 0 
    ? closedTrades.reduce((acc, t) => acc + (t.risk || 0), 0) / closedTrades.length 
    : 0;

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
    winTrades: winningTrades.length,
    lossTrades: losingTrades.length,
    breakEvenTrades: breakEvenTrades.length,
    profitFactor,
    isAllWins,
    expectancy,
    averageR,
    averageWin,
    averageLoss,
    maxDrawdown,
    averageRisk,
    totalGrossProfit,
    totalGrossLoss,
    closedTradesCount: closedTrades.length
  };
}
