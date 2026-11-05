import { auth } from './firebase';
import { MT5ScreenshotAnalysisResult, MT5ExtractedTrade } from '../types/mt5Screenshot';
import { Trade } from '../types';

/**
 * Prepares image file or base64 string for server-side Gemini Vision inspection
 */
export async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = file.type || 'image/jpeg';
      let cleanBase64 = result;
      if (result.includes(';base64,')) {
        cleanBase64 = result.split(';base64,')[1] || '';
      }
      resolve({ base64: cleanBase64, mimeType });
    };
    reader.readAsDataURL(file);
  });
}

export interface ScreenshotAnalysisOptions {
  analysisId: string;
  currentImageId: string;
  fileName?: string;
}

/**
 * Sends screenshot to server for visual analysis via Gemini Vision
 * Enforces strict currentImageId & analysisId validation to prevent cross-image contamination.
 */
export async function analyzeScreenshotWithGemini(
  input: File | string,
  options?: ScreenshotAnalysisOptions
): Promise<MT5ScreenshotAnalysisResult> {
  const analysisId = options?.analysisId || `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const currentImageId = options?.currentImageId || `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  let base64 = '';
  let mimeType = 'image/jpeg';

  if (typeof input === 'string') {
    if (input.startsWith('data:')) {
      const match = input.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1] || 'image/jpeg';
        base64 = match[2] || '';
      } else {
        base64 = input;
      }
    } else {
      base64 = input;
    }
  } else if (input instanceof File) {
    const extracted = await fileToBase64(input);
    base64 = extracted.base64;
    mimeType = extracted.mimeType;
  }

  // Pre-flight image size check
  if (!base64 || base64.length < 500) {
    return {
      success: false,
      isReadable: false,
      qualityIssue: 'Screenshot image payload is too small or empty. Please upload a clear MT5 screenshot.',
      detectedCount: 0,
      trades: [],
      analysisVersion: 'mt5-screenshot-v2',
      analysisId,
      currentImageId,
      analyzedAt: Date.now(),
      summary: { detectedFields: [], missingFields: [] }
    };
  }

  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/mt5/analyze-screenshot', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      imageBase64: base64,
      mimeType,
      analysisId,
      currentImageId
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      isReadable: false,
      qualityIssue: errData.qualityIssue || errData.error || 'Server could not automatically parse all fields from image.',
      detectedCount: 0,
      trades: [],
      analysisVersion: 'mt5-screenshot-v2',
      analysisId,
      currentImageId,
      analyzedAt: Date.now(),
      summary: { detectedFields: [], missingFields: [] },
      errorMessage: errData.error
    };
  }

  const data: MT5ScreenshotAnalysisResult = await res.json();

  // Rule 4: CURRENT IMAGE ID PROTECTION
  // Verify that the response belongs strictly to this exact current image and analysis ID!
  if (data.analysisId && data.analysisId !== analysisId) {
    console.warn(`[TradeVault Security] Analysis ID mismatch: expected ${analysisId}, received ${data.analysisId}. Rejecting response.`);
    return {
      success: false,
      isReadable: false,
      qualityIssue: 'Screenshot response validation failed (stale or mismatched analysis ID). Please try again.',
      detectedCount: 0,
      trades: [],
      analysisVersion: 'mt5-screenshot-v2',
      analysisId,
      currentImageId,
      analyzedAt: Date.now(),
      summary: { detectedFields: [], missingFields: [] },
      errorMessage: 'Analysis ID mismatch'
    };
  }

  if (data.currentImageId && data.currentImageId !== currentImageId) {
    console.warn(`[TradeVault Security] Image ID mismatch: expected ${currentImageId}, received ${data.currentImageId}. Rejecting response.`);
    return {
      success: false,
      isReadable: false,
      qualityIssue: 'Screenshot response validation failed (image ID mismatch). Please analyze the current screenshot again.',
      detectedCount: 0,
      trades: [],
      analysisVersion: 'mt5-screenshot-v2',
      analysisId,
      currentImageId,
      analyzedAt: Date.now(),
      summary: { detectedFields: [], missingFields: [] },
      errorMessage: 'Image ID mismatch'
    };
  }
  
  // Guarantee: if any trades or trade data were detected and no mismatch, mark readable and successful!
  if (data.trades && data.trades.length > 0 && !data.hasMarketMismatch) {
    data.isReadable = true;
    data.success = true;
    data.detectedCount = data.trades.length;
  }
  
  return data;
}

/**
 * Creates a clean draft trade structure bound to the screenshot so any user screenshot
 * can be permitted and completed seamlessly.
 * STRICT RULE: NEVER default to EURUSD or any hardcoded demo market.
 */
export function createDraftTradeFromScreenshot(params?: {
  rawSymbol?: string;
  direction?: 'BUY' | 'SELL';
  entryPrice?: number;
  lotSize?: number;
  analysisId?: string;
  currentImageId?: string;
}): MT5ExtractedTrade {
  const symbol = params?.rawSymbol || '';
  return {
    id: `trade_${Date.now()}`,
    analysisId: params?.analysisId,
    currentImageId: params?.currentImageId,
    tradeDate: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    openTime: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    closeTime: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    rawSymbol: { value: symbol || null, confidence: symbol ? 'HIGH' : 'NOT_FOUND', source: 'current_screenshot' },
    normalizedMarket: symbol,
    symbolMappingSource: symbol ? 'exact' : 'unmapped',
    direction: { value: params?.direction || null, confidence: params?.direction ? 'HIGH' : 'NOT_FOUND', source: 'current_screenshot' },
    volume: { value: params?.lotSize ?? null, confidence: params?.lotSize !== undefined ? 'HIGH' : 'NOT_FOUND', source: 'current_screenshot' },
    entryPrice: { value: params?.entryPrice ?? null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    exitPrice: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    stopLoss: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    takeProfit: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    pnl: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    grossPnl: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    commission: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    swap: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    fees: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    balance: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    equity: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    ticket: { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' },
    currency: { value: 'USD', confidence: 'HIGH', source: 'current_screenshot' },
    timezone: 'Timezone unknown',
    rawRowText: 'Draft entry for current screenshot'
  };
}

/**
 * Checks for duplicate MT5 trades based on ticket/deal ID across existing user trades
 */
export function checkDuplicateMT5Trade(
  ticketId: string | null | undefined,
  existingTrades: Trade[],
  dashboardId?: string
): { isDuplicate: boolean; existingTrade?: Trade } {
  if (!ticketId || !ticketId.trim() || !Array.isArray(existingTrades)) {
    return { isDuplicate: false };
  }

  const cleanTicket = ticketId.trim();

  const found = existingTrades.find(t => {
    // If dashboardId provided, match within dashboard, otherwise match across user's trades
    if (dashboardId && t.dashboardId && t.dashboardId !== dashboardId) {
      return false;
    }
    const tId = t.mt5TicketId || t.orderId || t.externalTradeId || t.mt5DealId || t.mt5PositionId;
    return tId && String(tId).trim() === cleanTicket;
  });

  if (found) {
    return { isDuplicate: true, existingTrade: found };
  }

  return { isDuplicate: false };
}
