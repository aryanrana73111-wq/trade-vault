/**
 * TradeVault MT5 Trade Mapper & Normalization Engine
 * 
 * Strict Principle:
 * - MT5 provides objective execution data (market, volume, entry, exit, P&L, timestamps, commission, swap).
 * - User provides subjective journaling data (strategy, setup quality, psychology, emotions, mistake, learning, notes).
 * - Subjective fields NEVER block MT5 import and NEVER contain undefined values.
 * - Idempotent re-sync NEVER overwrites existing user enrichment.
 */

import { Trade } from '@/types';
import { MT5CompletedTrade } from '@/types/mt5';
import { mapMT5SymbolToMarket } from './mt5SymbolMapper';
import { sanitizeForFirestore } from './firestoreSanitizer';

/**
 * Derives trading session based on canonical UTC open timestamp
 */
export function deriveSessionFromTimestamp(timestampMs: number): 'Asian' | 'London' | 'New York' | 'Sydney' {
  const d = new Date(timestampMs);
  const utcHour = d.getUTCHours() + d.getUTCMinutes() / 60;

  // Sydney: 21:00 - 06:00 UTC
  // Asian/Tokyo: 00:00 - 09:00 UTC
  // London: 08:00 - 16:30 UTC
  // New York: 13:00 - 21:00 UTC
  if (utcHour >= 13 && utcHour < 21) {
    return 'New York';
  } else if (utcHour >= 8 && utcHour < 16.5) {
    return 'London';
  } else if (utcHour >= 0 && utcHour < 9) {
    return 'Asian';
  }
  return 'Sydney';
}

/**
 * Calculates Risk-to-Reward ratio (R:R) deterministically when valid SL & TP exist.
 * Returns null if not determinable. Never returns NaN or Infinity.
 */
export function calculateRR(
  direction: 'BUY' | 'SELL',
  entry: number,
  stopLoss?: number | null,
  takeProfit?: number | null
): number | null {
  if (!stopLoss || !takeProfit || stopLoss <= 0 || takeProfit <= 0 || entry <= 0) {
    return null;
  }

  const riskDistance = Math.abs(entry - stopLoss);
  const rewardDistance = Math.abs(takeProfit - entry);

  if (riskDistance <= 0.000001) {
    return null;
  }

  const rr = rewardDistance / riskDistance;
  return isFinite(rr) && !isNaN(rr) ? Math.round(rr * 100) / 100 : null;
}

/**
 * Maps raw MT5 completed execution data to TradeVault canonical Trade schema.
 * All optional or subjective fields are strictly defined (null, empty array, or default string),
 * ensuring zero `undefined` values ever reach Firestore.
 */
export function mapMT5TradeToTradeVaultTrade(params: {
  rawTrade: MT5CompletedTrade;
  userId: string;
  dashboardId: string;
  tradingAccountId: string;
  syncRunId: string;
}): Trade {
  const { rawTrade, userId, dashboardId, tradingAccountId, syncRunId } = params;
  const externalId = String(rawTrade.externalTradeId || Date.now());
  const { market } = mapMT5SymbolToMarket(rawTrade.symbol);

  // Canonical UTC ms timestamps
  const openTimeMs = rawTrade.openTime ? Number(rawTrade.openTime) : Date.now();
  const closeTimeMs = rawTrade.closeTime ? Number(rawTrade.closeTime) : openTimeMs;
  const durationSeconds = rawTrade.durationSeconds || Math.max(0, Math.floor((closeTimeMs - openTimeMs) / 1000));

  // Time string in HH:mm
  const openDate = new Date(openTimeMs);
  const timeStr = `${String(openDate.getUTCHours()).padStart(2, '0')}:${String(openDate.getUTCMinutes()).padStart(2, '0')}`;

  // Session derivation
  const session = deriveSessionFromTimestamp(openTimeMs);

  // Result derivation: Profit > 0 = WIN, < 0 = LOSS, = 0 = BREAK EVEN / COST TO COST
  const netPnl = Number(rawTrade.pnl) || 0;
  const result: 'WIN' | 'LOSS' | 'BREAK EVEN' = 
    netPnl > 0 ? 'WIN' : (netPnl < 0 ? 'LOSS' : 'BREAK EVEN');

  // Risk to reward calculation
  const rrRatio = calculateRR(rawTrade.direction, rawTrade.entryPrice, rawTrade.stopLoss, rawTrade.takeProfit);

  const tradeId = `mt5_${tradingAccountId}_${externalId}`;

  const tradePayload: Trade = {
    id: tradeId,
    userId,
    dashboardId,
    date: openTimeMs,
    time: timeStr,
    market,
    direction: rawTrade.direction,
    entry: Number(rawTrade.entryPrice) || 0,
    exitPrice: Number(rawTrade.exitPrice) || Number(rawTrade.entryPrice) || 0,
    exitTime: closeTimeMs,
    durationSeconds,
    positionSize: Number(rawTrade.volume) || 0.1,
    stopLoss: rawTrade.stopLoss ?? undefined,
    takeProfit: rawTrade.takeProfit ?? undefined,
    pnl: netPnl,
    result,
    rrRatio: rrRatio ?? undefined,
    rMultiple: rrRatio ? (result === 'WIN' ? rrRatio : -1.0) : undefined,
    tradeSource: 'mt5',
    externalTradeId: externalId,
    tradingAccountId,
    mt5AccountId: rawTrade.mt5AccountId || tradingAccountId,
    brokerServer: rawTrade.brokerServer || 'MT5 Server',
    importedAt: Date.now(),
    syncId: syncRunId,
    commission: Number(rawTrade.commission) || 0,
    swap: Number(rawTrade.swap) || 0,
    session,
    timeframe: 'Not Recorded',
    
    // Subjective fields are initialized cleanly without undefined
    strategy: undefined,
    setupQuality: undefined,
    emotions: [],
    notes: `MT5 Execution • ${rawTrade.brokerServer || 'Broker'} • Ticket #${externalId}`,
    mistake: undefined,
    learning: undefined,
    screenshot: undefined,
    exitScreenshot: undefined,

    execution: {
      plannedEntry: '',
      plannedStop: '',
      plannedTarget: '',
      spread: '',
      commission: String(rawTrade.commission || '0'),
      slippage: ''
    },
    thesis: {
      marketThesis: '',
      catalyst: '',
      timeHorizon: '',
      invalidation: ''
    },
    createdAt: openTimeMs,
    updatedAt: Date.now()
  };

  return sanitizeForFirestore(tradePayload);
}

/**
 * Merge MT5 re-synced data with an existing TradeVault trade without overwriting
 * the user's subjective enrichment (strategy, emotions, notes, learning, screenshot, setup quality).
 */
export function mergeMT5TradeWithExisting(
  existing: Trade,
  freshRawTrade: MT5CompletedTrade
): Partial<Trade> {
  const closeTimeMs = freshRawTrade.closeTime ? Number(freshRawTrade.closeTime) : (existing.exitTime || Date.now());
  const netPnl = Number(freshRawTrade.pnl) || 0;
  const result: 'WIN' | 'LOSS' | 'BREAK EVEN' = 
    netPnl > 0 ? 'WIN' : (netPnl < 0 ? 'LOSS' : 'BREAK EVEN');

  const rrRatio = calculateRR(
    freshRawTrade.direction, 
    freshRawTrade.entryPrice, 
    freshRawTrade.stopLoss, 
    freshRawTrade.takeProfit
  );

  // Only refresh source-controlled execution data
  const updatedExecutionFields: Partial<Trade> = {
    exitPrice: Number(freshRawTrade.exitPrice) || existing.exitPrice,
    exitTime: closeTimeMs,
    durationSeconds: freshRawTrade.durationSeconds || existing.durationSeconds,
    pnl: netPnl,
    commission: Number(freshRawTrade.commission) || existing.commission || 0,
    swap: Number(freshRawTrade.swap) || existing.swap || 0,
    result,
    rrRatio: rrRatio ?? existing.rrRatio,
    rMultiple: rrRatio ? (result === 'WIN' ? rrRatio : -1.0) : existing.rMultiple,
    stopLoss: freshRawTrade.stopLoss ?? existing.stopLoss,
    takeProfit: freshRawTrade.takeProfit ?? existing.takeProfit,
    updatedAt: Date.now()
  };

  return sanitizeForFirestore(updatedExecutionFields);
}
