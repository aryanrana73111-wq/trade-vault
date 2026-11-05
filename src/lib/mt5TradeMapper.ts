/**
 * TradeVault MT5 Trade Mapper & Normalization Engine
 * 
 * Strict Data Integrity Principles:
 * - MT5 provides objective execution data only.
 * - Subjective fields (strategy, emotions, psychology, mistake, learning, setup quality, notes)
 *   are NEVER fabricated or required. If MT5 does not provide them, they remain null/undefined.
 * - Composite source identity: provider + providerAccountId + positionId + dealId.
 * - Idempotent synchronization strictly PRESERVES user subjective enrichment.
 * - R-multiple requires actual risk denominator; NEVER equates R:R to realized R.
 * - Strict numeric and schema validation rejects corrupted, NaN, Infinity, or negative impossible values.
 */

import { Trade } from '@/types';
import { MT5CompletedTrade, MT5ValidationError } from '@/types/mt5';
import { mapMT5SymbolToMarket } from './mt5SymbolMapper';
import { sanitizeForFirestore } from './firestoreSanitizer';

/**
 * Validates raw MT5 completed trade record before any Firestore operations.
 * Rejects undefined, NaN, Infinity, negative impossible values, invalid timestamps.
 * Reports exact field and cause on rejection.
 */
export function validateMT5Trade(rawTrade: MT5CompletedTrade): { 
  valid: boolean; 
  error?: MT5ValidationError 
} {
  const ticket = String(rawTrade.externalTradeId || rawTrade.mt5DealId || rawTrade.mt5PositionId || 'unknown');

  // 1. Ticket identifier
  if (!rawTrade.externalTradeId && !rawTrade.mt5DealId && !rawTrade.mt5PositionId) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'externalTradeId', reason: 'Missing trade deal or position ticket identifier' }
    };
  }

  // 2. Instrument Symbol
  if (!rawTrade.symbol || typeof rawTrade.symbol !== 'string' || !rawTrade.symbol.trim()) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'symbol', reason: 'Missing or empty instrument symbol' }
    };
  }

  // 3. Direction
  if (rawTrade.direction !== 'BUY' && rawTrade.direction !== 'SELL') {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'direction', reason: `Invalid direction: '${rawTrade.direction}'. Must be BUY or SELL.` }
    };
  }

  // 4. Volume (Lot size must be positive finite number)
  if (typeof rawTrade.volume !== 'number' || isNaN(rawTrade.volume) || !isFinite(rawTrade.volume) || rawTrade.volume <= 0) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'volume', reason: `Invalid volume lot size: ${rawTrade.volume}. Must be a finite positive number.` }
    };
  }

  // 5. Entry price
  if (typeof rawTrade.entryPrice !== 'number' || isNaN(rawTrade.entryPrice) || !isFinite(rawTrade.entryPrice) || rawTrade.entryPrice <= 0) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'entryPrice', reason: `Invalid entry price: ${rawTrade.entryPrice}. Must be a finite positive number.` }
    };
  }

  // 6. Exit price
  if (typeof rawTrade.exitPrice !== 'number' || isNaN(rawTrade.exitPrice) || !isFinite(rawTrade.exitPrice) || rawTrade.exitPrice <= 0) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'exitPrice', reason: `Invalid exit price: ${rawTrade.exitPrice}. Must be a finite positive number.` }
    };
  }

  // 7. P&L (Realized profit/loss must be a finite number)
  if (typeof rawTrade.pnl !== 'number' || isNaN(rawTrade.pnl) || !isFinite(rawTrade.pnl)) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'pnl', reason: `Invalid P&L value: ${rawTrade.pnl}. Must be a finite number.` }
    };
  }

  // 8. Commission & Swap
  if (typeof rawTrade.commission !== 'number' || isNaN(rawTrade.commission) || !isFinite(rawTrade.commission)) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'commission', reason: `Invalid commission: ${rawTrade.commission}. Must be a finite number.` }
    };
  }

  if (typeof rawTrade.swap !== 'number' || isNaN(rawTrade.swap) || !isFinite(rawTrade.swap)) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'swap', reason: `Invalid swap fee: ${rawTrade.swap}. Must be a finite number.` }
    };
  }

  // 9. Timestamps
  const now = Date.now();
  const maxFuture = now + 86400000; // max 24hr future leeway for clock drift

  if (typeof rawTrade.openTime !== 'number' || isNaN(rawTrade.openTime) || rawTrade.openTime <= 0 || rawTrade.openTime > maxFuture) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'openTime', reason: `Invalid open timestamp: ${rawTrade.openTime}. Must be a valid past/current UTC timestamp.` }
    };
  }

  if (typeof rawTrade.closeTime !== 'number' || isNaN(rawTrade.closeTime) || rawTrade.closeTime <= 0 || rawTrade.closeTime > maxFuture) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'closeTime', reason: `Invalid close timestamp: ${rawTrade.closeTime}. Must be a valid past/current UTC timestamp.` }
    };
  }

  if (rawTrade.closeTime < rawTrade.openTime - 120000) {
    return {
      valid: false,
      error: { tradeTicket: ticket, field: 'closeTime', reason: `Close time (${rawTrade.closeTime}) cannot be earlier than open time (${rawTrade.openTime}).` }
    };
  }

  // 10. StopLoss and TakeProfit (optional, but if present must be finite and >= 0)
  if (rawTrade.stopLoss !== undefined && rawTrade.stopLoss !== null) {
    if (typeof rawTrade.stopLoss !== 'number' || isNaN(rawTrade.stopLoss) || !isFinite(rawTrade.stopLoss) || rawTrade.stopLoss < 0) {
      return {
        valid: false,
        error: { tradeTicket: ticket, field: 'stopLoss', reason: `Invalid stopLoss price: ${rawTrade.stopLoss}. Must be a positive finite number or omitted.` }
      };
    }
  }

  if (rawTrade.takeProfit !== undefined && rawTrade.takeProfit !== null) {
    if (typeof rawTrade.takeProfit !== 'number' || isNaN(rawTrade.takeProfit) || !isFinite(rawTrade.takeProfit) || rawTrade.takeProfit < 0) {
      return {
        valid: false,
        error: { tradeTicket: ticket, field: 'takeProfit', reason: `Invalid takeProfit price: ${rawTrade.takeProfit}. Must be a positive finite number or omitted.` }
      };
    }
  }

  return { valid: true };
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
  return isFinite(rr) && !isNaN(rr) && rr > 0 ? Math.round(rr * 100) / 100 : null;
}

/**
 * Calculates realized R-multiple strictly against an actual risk denominator.
 * CRITICAL RULE: NEVER equates rMultiple = rrRatio!
 * If reliable risk information is unavailable, returns null.
 */
export function calculateRealizedR(
  pnl: number,
  riskAmount?: number | null
): number | null {
  if (typeof riskAmount !== 'number' || isNaN(riskAmount) || !isFinite(riskAmount) || riskAmount <= 0) {
    return null;
  }

  if (typeof pnl !== 'number' || isNaN(pnl) || !isFinite(pnl)) {
    return null;
  }

  const r = pnl / riskAmount;
  return isFinite(r) && !isNaN(r) ? Math.round(r * 100) / 100 : null;
}

/**
 * Derives trading session based on canonical UTC or broker timestamp
 */
export function deriveSessionFromTimestamp(
  timestampMs: number, 
  brokerTimezone?: string
): 'Asian' | 'London' | 'New York' | 'Sydney' | undefined {
  if (!timestampMs || timestampMs <= 0) return undefined;

  try {
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
  } catch {
    return undefined;
  }
}

/**
 * Maps raw MT5 completed execution data to TradeVault canonical Trade schema.
 * NEVER fabricates subjective values (strategy, timeframe, setupQuality, psychology, etc.).
 * Constructs composite source trade identity to isolate accounts.
 */
export function mapMT5TradeToTradeVaultTrade(params: {
  rawTrade: MT5CompletedTrade;
  userId: string;
  dashboardId: string;
  tradingAccountId: string;
  mt5AccountId?: string;
  providerAccountId?: string;
  provider?: string;
  mt5Server?: string;
  syncRunId: string;
  currency?: string;
  tradeSource?: 'mt5' | 'competition_mt5';
  competitionId?: string;
}): Trade {
  const { 
    rawTrade, 
    userId, 
    dashboardId, 
    tradingAccountId, 
    mt5AccountId = tradingAccountId,
    providerAccountId = '',
    provider = 'mt5',
    mt5Server = '',
    syncRunId, 
    currency, 
    tradeSource = 'mt5', 
    competitionId 
  } = params;

  const rawSymbol = String(rawTrade.rawSymbol || rawTrade.symbol).trim();
  const { market, isMapped } = mapMT5SymbolToMarket(rawSymbol);

  // Tickets
  const dealId = rawTrade.mt5DealId ? String(rawTrade.mt5DealId) : String(rawTrade.externalTradeId || '');
  const positionId = rawTrade.mt5PositionId ? String(rawTrade.mt5PositionId) : dealId;
  const orderId = rawTrade.mt5OrderId ? String(rawTrade.mt5OrderId) : dealId;
  const externalId = dealId || positionId || String(Date.now());

  // Composite source identity: provider + providerAccountId + positionId + dealId
  const sourceTradeKey = rawTrade.sourceTradeKey || 
    `${provider}:${providerAccountId || tradingAccountId}:${positionId}:${dealId}`;

  // Unique document ID in TradeVault scoped strictly to tradingAccountId + ticket
  const tradeId = `mt5_${tradingAccountId}_${externalId}`;

  // Canonical UTC timestamps
  const openTimeMs = rawTrade.openTime;
  const closeTimeMs = rawTrade.closeTime;
  const durationSeconds = rawTrade.durationSeconds || Math.max(0, Math.floor((closeTimeMs - openTimeMs) / 1000));

  // Time string in HH:mm
  const openDate = new Date(openTimeMs);
  const timeStr = `${String(openDate.getUTCHours()).padStart(2, '0')}:${String(openDate.getUTCMinutes()).padStart(2, '0')}`;

  // Result derivation: Profit > 0 = WIN, < 0 = LOSS, = 0 = COST TO COST
  const netPnl = rawTrade.pnl;
  const result: 'WIN' | 'LOSS' | 'COST TO COST' = 
    netPnl > 0 ? 'WIN' : (netPnl < 0 ? 'LOSS' : 'COST TO COST');

  // Risk to reward calculation
  const rrRatio = calculateRR(rawTrade.direction, rawTrade.entryPrice, rawTrade.stopLoss, rawTrade.takeProfit);
  const rrString = rrRatio !== null ? `1:${rrRatio}` : undefined;

  // Realized R-multiple: strictly requires actual risk denominator; NEVER set to rrRatio!
  const rMultiple = calculateRealizedR(netPnl, rawTrade.riskAmount);

  const commission = rawTrade.commission || 0;
  const swap = rawTrade.swap || 0;
  const fees = Math.abs(commission) + Math.abs(swap);

  const localTimezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
  const session = deriveSessionFromTimestamp(openTimeMs, rawTrade.brokerTimezone);

  const tradePayload: Trade = {
    id: tradeId,
    userId,
    dashboardId,
    date: openTimeMs,
    time: timeStr,
    market: (isMapped ? market : 'Unmapped Symbol') as any,
    pair: rawSymbol,
    direction: rawTrade.direction,
    entry: rawTrade.entryPrice,
    exitPrice: rawTrade.exitPrice,
    exitTime: closeTimeMs,
    durationSeconds,
    duration: durationSeconds,
    openTime: openTimeMs,
    closeTime: closeTimeMs,
    openTimeUtc: openTimeMs,
    closeTimeUtc: closeTimeMs,
    brokerTimezone: rawTrade.brokerTimezone || undefined,
    userTimezone: localTimezone,
    displayTimezone: localTimezone,
    positionSize: rawTrade.volume,
    lotSize: rawTrade.volume,
    stopLoss: rawTrade.stopLoss ?? undefined,
    takeProfit: rawTrade.takeProfit ?? undefined,
    risk: rawTrade.riskAmount ?? undefined,
    profit: netPnl > 0 ? netPnl : 0,
    loss: netPnl < 0 ? Math.abs(netPnl) : 0,
    pnl: netPnl,
    result,
    rrRatio: rrRatio ?? undefined,
    rMultiple: rMultiple ?? undefined,
    rrString: rrString ?? undefined,
    tradeSource,
    externalTradeId: externalId,
    sourceTradeKey,
    provider,
    providerAccountId,
    providerTradeId: dealId,
    tradingAccountId,
    mt5AccountId,
    mt5DealId: dealId,
    mt5OrderId: orderId,
    mt5PositionId: positionId,
    mt5TicketId: externalId,
    orderId,
    rawSymbol,
    mappedMarket: isMapped ? market : 'Unmapped Symbol',
    brokerServer: rawTrade.brokerServer || mt5Server || 'MT5 Server',
    broker: rawTrade.broker || (rawTrade.brokerServer ? rawTrade.brokerServer.split('-')[0].trim() : 'Broker'),
    server: rawTrade.brokerServer || mt5Server || 'MT5 Server',
    accountCurrency: currency || 'USD',
    importedAt: Date.now(),
    syncId: syncRunId,
    commission,
    swap,
    fees,
    session,
    competitionId: competitionId || undefined,

    // Subjective fields: NEVER FABRICATE DATA. If MT5 does not provide, leave undefined/empty.
    strategy: undefined,
    setupQuality: undefined,
    emotions: [],
    timeframe: undefined,
    notes: rawTrade.comment ? `MT5 Comment: ${rawTrade.comment}` : undefined,
    mistake: undefined,
    learning: undefined,
    screenshot: undefined,
    exitScreenshot: undefined,

    execution: {
      plannedEntry: undefined,
      plannedStop: undefined,
      plannedTarget: undefined,
      spread: undefined,
      commission,
      slippage: undefined
    },
    thesis: undefined,
    createdAt: openTimeMs,
    updatedAt: Date.now()
  };

  return sanitizeForFirestore(tradePayload);
}

/**
 * Merge MT5 re-synced data with an existing TradeVault trade without overwriting
 * the user's subjective enrichment (strategy, emotions, notes, learning, screenshot, setup quality).
 * Only updates source-controlled fields when source execution data actually changed.
 */
export function mergeMT5TradeWithExisting(
  existing: Trade,
  freshRawTrade: MT5CompletedTrade
): { hasChanged: boolean; updates: Partial<Trade> } {
  const closeTimeMs = freshRawTrade.closeTime;
  const netPnl = freshRawTrade.pnl;
  const result: 'WIN' | 'LOSS' | 'COST TO COST' = 
    netPnl > 0 ? 'WIN' : (netPnl < 0 ? 'LOSS' : 'COST TO COST');

  const rrRatio = calculateRR(
    freshRawTrade.direction, 
    freshRawTrade.entryPrice, 
    freshRawTrade.stopLoss, 
    freshRawTrade.takeProfit
  );

  const rMultiple = calculateRealizedR(netPnl, freshRawTrade.riskAmount ?? existing.risk);

  const commission = freshRawTrade.commission;
  const swap = freshRawTrade.swap;
  const fees = Math.abs(commission) + Math.abs(swap);

  // Check if source execution data actually changed
  const pnlChanged = existing.pnl !== netPnl;
  const exitChanged = existing.exitPrice !== freshRawTrade.exitPrice;
  const closeTimeChanged = existing.closeTime !== closeTimeMs;
  const volumeChanged = existing.positionSize !== freshRawTrade.volume;
  const commChanged = existing.commission !== commission;
  const swapChanged = existing.swap !== swap;
  const slChanged = existing.stopLoss !== freshRawTrade.stopLoss;
  const tpChanged = existing.takeProfit !== freshRawTrade.takeProfit;

  const hasChanged = pnlChanged || exitChanged || closeTimeChanged || volumeChanged || commChanged || swapChanged || slChanged || tpChanged;

  // Source-controlled fields only
  // All user subjective enrichment (strategy, emotions, notes, learning, mistake, screenshots, setupQuality, etc.) is STRICTLY PRESERVED!
  const updatedExecutionFields: Partial<Trade> = {
    exitPrice: freshRawTrade.exitPrice,
    exitTime: closeTimeMs,
    closeTime: closeTimeMs,
    closeTimeUtc: closeTimeMs,
    durationSeconds: freshRawTrade.durationSeconds || Math.max(0, Math.floor((closeTimeMs - freshRawTrade.openTime) / 1000)),
    duration: freshRawTrade.durationSeconds || Math.max(0, Math.floor((closeTimeMs - freshRawTrade.openTime) / 1000)),
    pnl: netPnl,
    profit: netPnl > 0 ? netPnl : 0,
    loss: netPnl < 0 ? Math.abs(netPnl) : 0,
    commission,
    swap,
    fees,
    result,
    rrRatio: rrRatio ?? existing.rrRatio,
    rMultiple: rMultiple ?? existing.rMultiple,
    rrString: rrRatio !== null ? `1:${rrRatio}` : (existing.rrString || undefined),
    stopLoss: freshRawTrade.stopLoss ?? existing.stopLoss,
    takeProfit: freshRawTrade.takeProfit ?? existing.takeProfit,
    positionSize: freshRawTrade.volume,
    lotSize: freshRawTrade.volume,
    rawSymbol: freshRawTrade.rawSymbol || existing.rawSymbol,
    updatedAt: Date.now()
  };

  return {
    hasChanged,
    updates: sanitizeForFirestore(updatedExecutionFields)
  };
}
