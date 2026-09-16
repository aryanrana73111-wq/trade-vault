import os
import re

path = 'src/lib/arenaService.ts'
with open(path, 'r') as f:
    content = f.read()

stats_calc = """
    // Basic stats recalculation (client-side approximation for MVP)
    // In production, this would be a Cloud Function or transaction
    const member = arena.members[userId];
    if (member && permissions.performance) {
      // Just a naive increment for the sake of the prototype leaderboard
      const currentStats = member.stats || { netPnl: 0, roi: 0, winRate: 0, avgR: 0, profitFactor: 0, maxDrawdown: 0, tradeCount: 0, score: 0 };
      
      const newPnl = currentStats.netPnl + (trade.pnl || 0);
      const newTradeCount = currentStats.tradeCount + 1;
      const newAvgR = currentStats.avgR === 0 ? (trade.rMultiple || 0) : (currentStats.avgR + (trade.rMultiple || 0)) / 2;
      
      const newStats = {
        ...currentStats,
        netPnl: newPnl,
        tradeCount: newTradeCount,
        avgR: newAvgR,
        score: newPnl > 0 ? currentStats.score + 10 : currentStats.score + 1
      };
      
      const arenaRef = doc(db, 'arenas', arena.id);
      batch.update(arenaRef, {
        [`members.${userId}.stats`]: newStats
      });
    }
"""

content = content.replace("batch.set(projectionRef, projection, { merge: true });", "batch.set(projectionRef, projection, { merge: true });\n" + stats_calc)

with open(path, 'w') as f:
    f.write(content)
