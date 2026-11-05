import { Router, Response } from 'express';
import { requireFirebaseAuth, optionalFirebaseAuth, AuthenticatedUserRequest } from './authMiddleware';
import { analyzeMT5Screenshot } from './geminiVisionAnalyzer';
import { getHistoricalQuote } from './historicalMarketData';

export function createSmartAddTradeRouter(): Router {
  const router = Router();

  /**
   * POST /api/mt5/analyze-screenshot
   * Visually inspects an MT5/MT4/TradingView/Broker trade receipt or history table screenshot using Gemini Vision.
   */
  router.post('/mt5/analyze-screenshot', optionalFirebaseAuth, async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const { imageBase64, mimeType, analysisId, currentImageId } = req.body || {};

      if (!imageBase64) {
        res.status(400).json({
          success: false,
          error: 'Image payload (imageBase64) is required.'
        });
        return;
      }

      const result = await analyzeMT5Screenshot(imageBase64, mimeType || 'image/jpeg', {
        analysisId,
        currentImageId
      });
      res.json(result);
    } catch (err: any) {
      console.error('Screenshot analysis route error:', err);
      res.status(500).json({
        success: false,
        isReadable: false,
        error: err?.message || 'Screenshot analysis failed.',
        qualityIssue: 'Server failed to analyze image.'
      });
    }
  });

  /**
   * GET /api/market-data/historical-quote
   * Fetches real historical market quote (Bid/Ask/Last) for a specific symbol and timestamp.
   */
  router.get('/market-data/historical-quote', requireFirebaseAuth, async (req: AuthenticatedUserRequest, res: Response) => {
    try {
      const symbol = (req.query.symbol as string) || '';
      const timestampStr = req.query.timestamp as string;
      const direction = (req.query.direction as string)?.toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
      const timezone = (req.query.timezone as string) || 'UTC';

      if (!symbol || !timestampStr) {
        res.status(400).json({
          success: false,
          error: 'Missing required query parameters: symbol, timestamp.'
        });
        return;
      }

      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp) || timestamp <= 0) {
        res.status(400).json({
          success: false,
          error: 'Invalid timestamp parameter.'
        });
        return;
      }

      const quote = await getHistoricalQuote({
        symbol,
        timestamp,
        direction,
        timezone
      });

      res.json({
        success: true,
        quote
      });
    } catch (err: any) {
      const status = err?.status || 500;
      res.status(status).json({
        success: false,
        error: err?.message || 'Failed to retrieve historical quote.',
        isUnavailable: true
      });
    }
  });

  return router;
}
