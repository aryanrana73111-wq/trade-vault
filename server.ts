import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { getArticlesForDate } from './src/services/news/liveNewsAggregator';
import { getEventsForDate, getUpcomingEvents } from './src/services/news/economicCalendarService';
import { createAdminRouter } from './src/server/adminRoutes';
import { createMT5Router } from './src/server/mt5/mt5Routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

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
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
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
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TradeVault server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
