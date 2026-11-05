export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_FOUND';

export interface MT5ExtractedField<T> {
  value: T | null;
  confidence: ConfidenceLevel;
  source: 'current_screenshot';
  rawText?: string;
}

export interface MT5ExtractedTrade {
  id: string; // temporary local id for review
  analysisId?: string;
  currentImageId?: string;
  tradeDate: MT5ExtractedField<string>; // YYYY-MM-DD
  openTime: MT5ExtractedField<string>; // HH:mm:ss or HH:mm
  closeTime: MT5ExtractedField<string>; // HH:mm:ss or HH:mm
  rawSymbol: MT5ExtractedField<string>; // Exact broker symbol e.g. "NAS100", "EURUSD.r", "XAUUSD."
  normalizedMarket: string; // TradeVault canonical market e.g. "NAS100", "EUR/USD", "XAU/USD"
  symbolMappingSource: 'canonical' | 'broker_suffix' | 'exact' | 'unmapped';
  direction: MT5ExtractedField<'BUY' | 'SELL'>;
  volume: MT5ExtractedField<number>; // lots or position size
  entryPrice: MT5ExtractedField<number>;
  exitPrice: MT5ExtractedField<number>;
  stopLoss: MT5ExtractedField<number>;
  takeProfit: MT5ExtractedField<number>;
  pnl: MT5ExtractedField<number>; // Realized net profit/loss
  grossPnl: MT5ExtractedField<number>; // Gross profit/loss if visible
  commission: MT5ExtractedField<number>;
  swap: MT5ExtractedField<number>;
  fees: MT5ExtractedField<number>;
  balance: MT5ExtractedField<number>;
  equity: MT5ExtractedField<number>;
  ticket: MT5ExtractedField<string>; // Ticket, Deal, or Position ID
  currency: MT5ExtractedField<string>; // USD, EUR, etc.
  timezone: string; // "Timezone unknown" or detected timezone
  rawRowText?: string;
}

export interface MT5ScreenshotQuality {
  isReadable: boolean;
  issue?: string;
  resolutionOk: boolean;
  textLegible: boolean;
  contrastOk: boolean;
}

export interface MT5ScreenshotAnalysisResult {
  success: boolean;
  isReadable: boolean;
  qualityIssue?: string;
  detectedCount: number;
  trades: MT5ExtractedTrade[];
  analysisVersion: 'mt5-screenshot-v2';
  analyzedAt: number;
  analysisId?: string;
  currentImageId?: string;
  visibleMarketInImage?: string;
  hasMarketMismatch?: boolean;
  mismatchReason?: string;
  summary: {
    detectedFields: string[];
    missingFields: string[];
  };
  errorMessage?: string;
}

export interface MT5ScreenshotMetadata {
  screenshotId: string;
  analysisId?: string;
  currentImageId?: string;
  storagePath?: string;
  fileName: string;
  mimeType: string;
  uploadedAt: number;
  source: 'mt5_screenshot';
  analysisVersion: 'mt5-screenshot-v2';
  fileSize?: number;
  rawSymbol?: string;
  ticketId?: string;
}
