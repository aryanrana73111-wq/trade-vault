import { GoogleGenAI, Type } from '@google/genai';
import { MT5ExtractedTrade, MT5ScreenshotAnalysisResult, ConfidenceLevel } from '../types/mt5Screenshot';
import { mapMT5SymbolToMarket } from '../lib/mt5SymbolMapper';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

interface RawVisionTradeExtraction {
  tradeDate?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  rawSymbol?: string | null;
  direction?: 'BUY' | 'SELL' | null;
  volume?: number | null;
  entryPrice?: number | null;
  exitPrice?: number | null;
  stopLoss?: number | null;
  takeProfit?: number | null;
  pnl?: number | null;
  grossPnl?: number | null;
  commission?: number | null;
  swap?: number | null;
  fees?: number | null;
  balance?: number | null;
  equity?: number | null;
  ticket?: string | null;
  currency?: string | null;
  timezone?: string | null;
  rawRowText?: string | null;
}

interface RawVisionResponse {
  isReadable: boolean;
  qualityIssue?: string | null;
  tradesDetected: RawVisionTradeExtraction[];
}

/**
 * Server-side MT5 Screenshot Visual Extraction Engine using Gemini Vision
 */
export async function analyzeMT5Screenshot(
  base64Data: string,
  mimeType = 'image/jpeg',
  options?: {
    analysisId?: string;
    currentImageId?: string;
  }
): Promise<MT5ScreenshotAnalysisResult> {
  const now = Date.now();
  const analysisId = options?.analysisId || `analysis_${now}_${Math.random().toString(36).slice(2, 9)}`;
  const currentImageId = options?.currentImageId || `img_${now}_${Math.random().toString(36).slice(2, 9)}`;

  // Basic payload pre-flight checks
  if (!base64Data || base64Data.length < 100) {
    return {
      success: false,
      isReadable: false,
      qualityIssue: 'No screenshot image payload provided.',
      detectedCount: 0,
      trades: [],
      analysisVersion: 'mt5-screenshot-v2',
      analyzedAt: now,
      analysisId,
      currentImageId,
      summary: { detectedFields: [], missingFields: [] },
      errorMessage: 'Missing image payload'
    };
  }

  // Strip data:image/...;base64, prefix if present
  let cleanBase64 = base64Data;
  if (cleanBase64.includes(';base64,')) {
    const parts = cleanBase64.split(';base64,');
    cleanBase64 = parts[1] || '';
  }

  try {
    const systemPrompt = `You are an expert financial and trade screenshot visual inspection engine.
You visually inspect ONLY the CURRENT screenshot image provided in this single request.

CRITICAL DIRECTIVES:
1. ABSOLUTE SOURCE OF TRUTH: THE CURRENT UPLOADED IMAGE IS THE ONLY AUTHORITATIVE SOURCE.
   - You have ZERO access to past screenshots, previous trades, or previous conversations.
   - NEVER assume, recall, or reuse any previous trade, previous symbol, previous analysis, or default symbol (such as EURUSD).
   - If the current image visibly says "XAUUSD.", "NAS100", "US30", "BTCUSD", "GBPUSD", etc., extract that EXACT visible symbol. NEVER return a different symbol.
   - If a field is not visibly printed or present in THIS image, set it to null.
   - NEVER copy example values. The example schema is for syntax reference only.
2. EXTRACT WHAT IS ACTUALLY IN THE CURRENT IMAGE:
   - "visibleMarketInImage": Return the exact ticker/symbol visibly printed on the trade card or row (e.g. "XAUUSD.", "NAS100", "US30", "GBPUSD").
   - "visibleTextSnippet": Return the exact text visible in the trade row/card in this current image (e.g. "XAUUSD., sell 0.22 4 342.62 → 4 345.77 #6828072").
   - Distinguish direction: BUY or SELL.
   - Volume (lots), Entry Price, Exit Price, Stop Loss, Take Profit, Realized P&L, Commission, Swap, Ticket ID.
   - If SL or TP is "—", "None", or blank, return null.
   - Do NOT invent subjective fields (strategy, emotions, notes, setup quality).
3. ISOLATION:
   - Every analysis must be completely isolated and based ONLY on the CURRENT image.
   - If image has absolutely zero trading/financial data, set isReadable: false.`;

    const promptText = `Visually inspect ONLY this current image and extract all visible trade information into JSON adhering to this schema:
{
  "isReadable": boolean,
  "qualityIssue": string or null,
  "visibleMarketInImage": string or null,
  "visibleTextSnippet": string or null,
  "tradesDetected": [
    {
      "tradeDate": "YYYY-MM-DD" or null,
      "openTime": "HH:mm:ss" or "HH:mm" or null,
      "closeTime": "HH:mm:ss" or null,
      "rawSymbol": "Exact visible symbol in current image e.g. XAUUSD. or NAS100" or null,
      "direction": "BUY" or "SELL" or null,
      "volume": number (lots) or null,
      "entryPrice": number or null,
      "exitPrice": number or null,
      "stopLoss": number or null,
      "takeProfit": number or null,
      "pnl": number (net profit or loss, positive or negative) or null,
      "grossPnl": number or null,
      "commission": number or null,
      "swap": number or null,
      "fees": number or null,
      "balance": number or null,
      "equity": number or null,
      "ticket": string or null (ticket number, order ID, or deal ID),
      "currency": string or null (e.g. "USD"),
      "timezone": string or null,
      "rawRowText": string or null (exact text visible on this trade line)
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg'
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.0
      }
    });

    const responseText = response.text?.trim() || '{}';
    let parsed: any;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { isReadable: false, tradesDetected: [] };
      }
    }

    // Support diverse possible response formats from LLM (tradesDetected, trades, trade, etc.)
    let rawTrades: RawVisionTradeExtraction[] = [];
    if (Array.isArray(parsed?.tradesDetected)) {
      rawTrades = parsed.tradesDetected;
    } else if (Array.isArray(parsed?.trades)) {
      rawTrades = parsed.trades;
    } else if (parsed?.trade && typeof parsed.trade === 'object') {
      rawTrades = [parsed.trade];
    } else if (Array.isArray(parsed?.data)) {
      rawTrades = parsed.data;
    }

    // If trades were detected or any trade field was found, the screenshot IS readable and permitted!
    const hasAnyTradeData = rawTrades.some(t => 
      Boolean(t.rawSymbol || t.entryPrice !== undefined || t.direction || t.volume !== undefined || t.pnl !== undefined || t.ticket)
    );

    const isReadable = hasAnyTradeData || Boolean(parsed?.isReadable && rawTrades.length > 0);

    if (!isReadable || rawTrades.length === 0) {
      return {
        success: false,
        isReadable: false,
        qualityIssue: parsed?.qualityIssue || 'No trade data detected in screenshot. Please ensure image displays trading pair, price, or order details.',
        detectedCount: 0,
        trades: [],
        analysisVersion: 'mt5-screenshot-v2',
        analyzedAt: now,
        analysisId,
        currentImageId,
        visibleMarketInImage: parsed?.visibleMarketInImage || undefined,
        summary: { detectedFields: [], missingFields: [] }
      };
    }

    // Process each detected trade row and assign field-level confidence
    const processedTrades: MT5ExtractedTrade[] = rawTrades.map((raw, idx) => {
      const rawSymbolStr = (raw.rawSymbol || '').trim();
      const { market: normalizedMarket, isMapped } = mapMT5SymbolToMarket(rawSymbolStr);

      const symbolMappingSource: 'canonical' | 'broker_suffix' | 'exact' | 'unmapped' = 
        !rawSymbolStr ? 'unmapped' :
        rawSymbolStr === normalizedMarket ? 'exact' :
        isMapped ? 'canonical' : 'broker_suffix';

      const makeField = <T>(val: T | null | undefined, customConfidence?: ConfidenceLevel) => {
        const isPresent = val !== null && val !== undefined && val !== '' && !Number.isNaN(val);
        const confidence: ConfidenceLevel = !isPresent ? 'NOT_FOUND' : (customConfidence || 'HIGH');
        return {
          value: isPresent ? (val as T) : null,
          confidence,
          source: 'current_screenshot' as const
        };
      };

      // Sanitize numbers
      const numOrNull = (n: any): number | null => {
        if (n === null || n === undefined || n === '') return null;
        const parsedNum = typeof n === 'number' ? n : parseFloat(String(n).replace(/[^\d.-]/g, ''));
        return isFinite(parsedNum) ? parsedNum : null;
      };

      const entry = numOrNull(raw.entryPrice);
      const exit = numOrNull(raw.exitPrice);
      const sl = numOrNull(raw.stopLoss);
      const tp = numOrNull(raw.takeProfit);
      const vol = numOrNull(raw.volume);
      const pnl = numOrNull(raw.pnl);
      const grossPnl = numOrNull(raw.grossPnl);
      const comm = numOrNull(raw.commission);
      const swap = numOrNull(raw.swap);
      const fees = numOrNull(raw.fees);
      const balance = numOrNull(raw.balance);
      const equity = numOrNull(raw.equity);

      // Validate direction
      let dir: 'BUY' | 'SELL' | null = null;
      if (raw.direction) {
        const dUpper = String(raw.direction).toUpperCase();
        if (dUpper.includes('BUY') || dUpper === 'LONG') dir = 'BUY';
        if (dUpper.includes('SELL') || dUpper === 'SHORT') dir = 'SELL';
      }

      return {
        id: `trade_${idx + 1}_${now}`,
        analysisId,
        currentImageId,
        tradeDate: makeField(raw.tradeDate || null),
        openTime: makeField(raw.openTime || null),
        closeTime: makeField(raw.closeTime || null),
        rawSymbol: makeField(rawSymbolStr || null),
        normalizedMarket: normalizedMarket || rawSymbolStr,
        symbolMappingSource,
        direction: makeField(dir),
        volume: makeField(vol),
        entryPrice: makeField(entry),
        exitPrice: makeField(exit),
        stopLoss: makeField(sl),
        takeProfit: makeField(tp),
        pnl: makeField(pnl),
        grossPnl: makeField(grossPnl),
        commission: makeField(comm),
        swap: makeField(swap),
        fees: makeField(fees),
        balance: makeField(balance),
        equity: makeField(equity),
        ticket: makeField(raw.ticket ? String(raw.ticket).trim() : null),
        currency: makeField(raw.currency || 'USD'),
        timezone: raw.timezone?.trim() || 'Timezone unknown',
        rawRowText: raw.rawRowText || parsed?.visibleTextSnippet || undefined
      };
    });

    const firstTrade = processedTrades[0];

    // Cross-Screenshot Contamination Block & Market Mismatch Validation Layer (Rules 6 & 7)
    let hasMarketMismatch = false;
    let mismatchReason: string | undefined = undefined;

    const detectedMarketRaw = parsed?.visibleMarketInImage ? String(parsed.visibleMarketInImage).trim() : '';
    const visibleSnippet = parsed?.visibleTextSnippet ? String(parsed.visibleTextSnippet).trim() : '';

    if (firstTrade?.rawSymbol?.value) {
      const extractedMarket = String(firstTrade.rawSymbol.value).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

      // 1. Check against visibleMarketInImage
      if (detectedMarketRaw) {
        const imgMarket = detectedMarketRaw.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (imgMarket && extractedMarket && !imgMarket.includes(extractedMarket) && !extractedMarket.includes(imgMarket)) {
          hasMarketMismatch = true;
          mismatchReason = `Screenshot analysis rejected\nDetected market from image: ${detectedMarketRaw}\nAI returned conflicting market data.\nPlease analyze the screenshot again.`;
        }
      }

      // 2. Check if visibleSnippet contradicts extracted market
      if (!hasMarketMismatch && visibleSnippet) {
        const snippetUpper = visibleSnippet.toUpperCase().replace(/[^A-Z0-9]/g, '');
        // If snippet has clear ticker like XAUUSD, NAS100, US30, BTCUSD but extractedMarket is EURUSD
        const commonTickers = ['XAUUSD', 'GOLD', 'NAS100', 'US30', 'US500', 'SPX500', 'BTCUSD', 'ETHUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GER40'];
        for (const tick of commonTickers) {
          if (snippetUpper.includes(tick) && !extractedMarket.includes(tick) && !tick.includes(extractedMarket)) {
            hasMarketMismatch = true;
            mismatchReason = `Screenshot analysis rejected\nDetected market from image: ${tick}\nAI returned conflicting market data.\nPlease analyze the screenshot again.`;
            break;
          }
        }
      }
    }

    if (hasMarketMismatch) {
      return {
        success: false,
        isReadable: false,
        hasMarketMismatch: true,
        mismatchReason,
        qualityIssue: mismatchReason || 'Screenshot analysis rejected: AI returned conflicting market data. Please analyze the screenshot again.',
        detectedCount: 0,
        trades: [],
        analysisVersion: 'mt5-screenshot-v2',
        analysisId,
        currentImageId,
        visibleMarketInImage: detectedMarketRaw || undefined,
        analyzedAt: now,
        summary: { detectedFields: [], missingFields: [] }
      };
    }

    // Cross-screenshot contamination check on field values (Rule 6)
    // If visibleTextSnippet is present, verify each field visibly appears in the snippet
    if (visibleSnippet && firstTrade) {
      const snipClean = visibleSnippet.replace(/\s+/g, ' ');

      // Check Direction
      if (firstTrade.direction.value) {
        const dir = firstTrade.direction.value.toUpperCase();
        const oppositeDir = dir === 'BUY' ? 'SELL' : 'BUY';
        if (snipClean.toUpperCase().includes(oppositeDir) && !snipClean.toUpperCase().includes(dir)) {
          firstTrade.direction = { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' };
        }
      }

      // Check Ticket ID
      if (firstTrade.ticket.value) {
        const cleanTicket = firstTrade.ticket.value.replace(/[^0-9]/g, '');
        if (cleanTicket && cleanTicket.length >= 4 && !snipClean.includes(cleanTicket)) {
          firstTrade.ticket = { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' };
        }
      }

      // Check Entry Price digits
      if (firstTrade.entryPrice.value !== null) {
        const entryStr = String(Math.floor(firstTrade.entryPrice.value));
        if (entryStr.length >= 3 && !snipClean.includes(entryStr)) {
          // If price does not appear in visible snippet, nullify
          firstTrade.entryPrice = { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' };
        }
      }

      // Check Realized P&L digits
      if (firstTrade.pnl.value !== null) {
        const pnlAbs = Math.abs(firstTrade.pnl.value).toFixed(2);
        const pnlInt = String(Math.floor(Math.abs(firstTrade.pnl.value)));
        if (!snipClean.includes(pnlAbs) && (pnlInt.length >= 2 && !snipClean.includes(pnlInt))) {
          firstTrade.pnl = { value: null, confidence: 'NOT_FOUND', source: 'current_screenshot' };
        }
      }
    }

    // Create overall summary of detected vs missing fields from the first trade
    const detected: string[] = [];
    const missing: string[] = [];

    if (firstTrade) {
      if (firstTrade.rawSymbol.value) detected.push('Market (' + firstTrade.rawSymbol.value + ')'); else missing.push('Market');
      if (firstTrade.direction.value) detected.push('Direction (' + firstTrade.direction.value + ')'); else missing.push('Direction');
      if (firstTrade.entryPrice.value !== null) detected.push('Entry Price'); else missing.push('Entry Price');
      if (firstTrade.exitPrice.value !== null) detected.push('Exit Price'); else missing.push('Exit Price');
      if (firstTrade.volume.value !== null) detected.push('Volume / Lots'); else missing.push('Volume');
      if (firstTrade.stopLoss.value !== null) detected.push('Stop Loss'); else missing.push('Stop Loss');
      if (firstTrade.takeProfit.value !== null) detected.push('Take Profit'); else missing.push('Take Profit');
      if (firstTrade.pnl.value !== null) detected.push('Realized P&L'); else missing.push('P&L');
      if (firstTrade.commission.value !== null) detected.push('Commission'); else missing.push('Commission');
      if (firstTrade.openTime.value) detected.push('Open Time'); else missing.push('Open Time');
      // Subjective fields are explicitly never detected in screenshot
      missing.push('Strategy (Manual input only)');
      missing.push('Emotions (Manual input only)');
      missing.push('Learnings / Mistakes (Manual input only)');
    }

    return {
      success: true,
      isReadable: true,
      detectedCount: processedTrades.length,
      trades: processedTrades,
      analysisVersion: 'mt5-screenshot-v2',
      analysisId,
      currentImageId,
      visibleMarketInImage: parsed?.visibleMarketInImage || firstTrade?.rawSymbol.value || undefined,
      analyzedAt: now,
      summary: {
        detectedFields: detected,
        missingFields: missing
      }
    };
  } catch (error: any) {
    console.error('Error analyzing MT5 screenshot via Gemini:', error);
    return {
      success: false,
      isReadable: false,
      qualityIssue: 'Could not process screenshot image: ' + (error?.message || 'Gemini Vision unavailable'),
      detectedCount: 0,
      trades: [],
      analysisVersion: 'mt5-screenshot-v2',
      analysisId,
      currentImageId,
      analyzedAt: now,
      summary: { detectedFields: [], missingFields: [] },
      errorMessage: error?.message || 'Analysis failed'
    };
  }
}
