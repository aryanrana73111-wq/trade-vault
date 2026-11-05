import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getArticlesForDate } from './src/services/news/liveNewsAggregator';
import { getEventsForDate, getUpcomingEvents } from './src/services/news/economicCalendarService';
import { createAdminRouter } from './src/server/adminRoutes';
import { createMT5Router } from './src/server/mt5/mt5Routes';
import { createSmartAddTradeRouter } from './src/server/smartAddTradeRoutes';
import { createMarketDataRouter } from './src/server/marketDataRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must always bind to port 3000 per environment constraints
  const PORT = 3000;

  // Support image base64 payloads for MT5 screenshot analyzer
  app.use(express.json({ limit: '15mb' }));

  // 1. Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TradeVault API',
      systemTime: new Date().toISOString()
    });
  });

  // 2. Admin Management API (Protected with server-side authorization)
  app.use('/api/admin', createAdminRouter());

  // 3. MetaTrader 5 (MT5) Connector API
  app.use('/api/mt5', createMT5Router());

  // 4. Smart Add Trade & MT5 Screenshot Vision Analyzer API
  app.use('/api', createSmartAddTradeRouter());

  // 5. Professional Charting Market Data API (OHLCV Candles & Real Providers)
  app.use('/api/market-data', createMarketDataRouter());

  // 2. Live News API (Fetches aggregated RSS & wire summaries with date boundaries)
  app.get('/api/news', async (req: Request, res: Response) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const category = req.query.category as string | undefined;
      const market = req.query.market as string | undefined;
      const searchQuery = req.query.q as string | undefined;

      const articles = await getArticlesForDate(date);

      let filtered = [...articles];
      if (category && category !== 'All' && category !== 'ALL') {
        filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase());
      }
      if (market && market !== 'All Markets') {
        const targetMarket = market.toUpperCase();
        filtered = filtered.filter(a => 
          a.relatedMarkets?.some(m => m.toUpperCase() === targetMarket)
        );
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(a => 
          a.headline.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.sourceName.toLowerCase().includes(q)
        );
      }

      // Sort Newest to Oldest
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      res.json({
        success: true,
        date,
        count: filtered.length,
        fetchedAt: new Date().toISOString(),
        provider: 'Live External News Aggregator (MarketWatch, BBC, CoinDesk, Guardian, Federal Reserve)',
        articles: filtered
      });
    } catch (err: any) {
      console.error('Error fetching /api/news:', err);
      res.status(503).json({
        success: false,
        error: 'Live news is currently unavailable.',
        message: err?.message || 'Upstream feed failure'
      });
    }
  });

  // 3. Economic Calendar API
  app.get('/api/economic-calendar', (req: Request, res: Response) => {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const currency = req.query.currency as string | undefined;
      const importance = req.query.importance as any;
      const searchQuery = req.query.q as string | undefined;

      const events = getEventsForDate(date, {
        date,
        currency,
        importance,
        searchQuery
      });

      res.json({
        success: true,
        date,
        count: events.length,
        events
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 4. Upcoming Economic Events API
  app.get('/api/upcoming-events', (req: Request, res: Response) => {
    try {
      const fromDate = (req.query.fromDate as string) || new Date().toISOString().split('T')[0];
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const events = getUpcomingEvents(fromDate, limit);

      res.json({
        success: true,
        fromDate,
        count: events.length,
        events
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // 5. Mount Vite middlewares in development or serve static in production
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexPath = path.resolve(distPath, 'index.html');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distIndexPath);

  if (isProd) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(distIndexPath);
    });
  } else {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        watch: null
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Guaranteed SPA fallback for all sub-routes in dev mode
    app.use('*', async (req: Request, res: Response, next) => {
      // Don't intercept API routes
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const templatePath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TradeVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
