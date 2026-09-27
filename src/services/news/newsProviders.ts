import { 
  NormalizedNewsArticle, 
  NewsFilterParams, 
  NewsProviderResult, 
  StoredNewsCache 
} from '@/types/normalizedNews';
import { getArticlesForDate, fetchLiveAggregatedNews } from './liveNewsAggregator';

export interface INewsProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  fetchNews(params: NewsFilterParams): Promise<NormalizedNewsArticle[]>;
}

const CACHE_KEY_PREFIX = 'tradevault_news_cache_v3_';
const MAX_FRESH_CACHE_MS = 15 * 60 * 1000; // 15 minutes
const MAX_STALE_CACHE_MS = 60 * 60 * 1000; // 60 minutes

// 1. Live Provider: fetches from server route /api/news or internal aggregator
export class LiveNewsProvider implements INewsProvider {
  name = 'LiveNewsProvider';

  async isAvailable(): Promise<boolean> {
    if (!navigator.onLine) return false;
    return true;
  }

  async fetchNews(params: NewsFilterParams): Promise<NormalizedNewsArticle[]> {
    // Try server API first if running full-stack
    try {
      const url = new URL('/api/news', window.location.origin);
      url.searchParams.set('date', params.date);
      if (params.category && params.category !== 'All') {
        url.searchParams.set('category', params.category);
      }
      if (params.market && params.market !== 'All Markets') {
        url.searchParams.set('market', params.market);
      }

      const res = await fetch(url.toString(), {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.articles)) {
          return data.articles;
        }
      }
    } catch {
      // Fall through to internal aggregator
    }

    // Direct in-app aggregator
    return await getArticlesForDate(params.date);
  }
}

// 2. RSS News Provider: directly executes client-accessible feeds
export class RSSNewsProvider implements INewsProvider {
  name = 'RSSNewsProvider';

  async isAvailable(): Promise<boolean> {
    return navigator.onLine;
  }

  async fetchNews(params: NewsFilterParams): Promise<NormalizedNewsArticle[]> {
    return await getArticlesForDate(params.date);
  }
}

// 3. Official Source Provider: Federal Reserve, BEA, BLS bulletins
export class OfficialSourceProvider implements INewsProvider {
  name = 'OfficialSourceProvider';

  async isAvailable(): Promise<boolean> {
    return navigator.onLine;
  }

  async fetchNews(params: NewsFilterParams): Promise<NormalizedNewsArticle[]> {
    const all = await getArticlesForDate(params.date);
    return all.filter(a => 
      a.sourceName === 'Federal Reserve' || 
      a.category === 'Central Banks' ||
      a.category === 'Economy'
    );
  }
}

// 4. Cached Fallback Provider: reads from localStorage with strict freshness detection
export class CachedFallbackProvider {
  name = 'CachedFallbackProvider';

  getCache(date: string): StoredNewsCache | null {
    try {
      // Invalidate and delete any older v1/v2 cache keys
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith('tradevault_news_cache_') && !k.startsWith(CACHE_KEY_PREFIX)) {
            localStorage.removeItem(k);
          }
        }
      }

      const raw = localStorage.getItem(`${CACHE_KEY_PREFIX}${date}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredNewsCache;
      // Sanitize: ensure no legacy colliding IDs exist
      if (parsed && Array.isArray(parsed.articles)) {
        if (parsed.articles.some(a => a.id && a.id.includes('aHR0cHM6Ly93d3cu'))) {
          localStorage.removeItem(`${CACHE_KEY_PREFIX}${date}`);
          return null;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  }

  saveCache(date: string, providerName: string, articles: NormalizedNewsArticle[]): void {
    try {
      const cache: StoredNewsCache = {
        date,
        provider: providerName,
        fetchedAt: Date.now(),
        articles
      };
      localStorage.setItem(`${CACHE_KEY_PREFIX}${date}`, JSON.stringify(cache));
    } catch {
      // Ignore storage errors
    }
  }

  clearCache(date?: string): void {
    try {
      if (date) {
        localStorage.removeItem(`${CACHE_KEY_PREFIX}${date}`);
      } else {
        const keys = Object.keys(localStorage);
        for (const k of keys) {
          if (k.startsWith(CACHE_KEY_PREFIX)) {
            localStorage.removeItem(k);
          }
        }
      }
    } catch {
      // Ignore
    }
  }
}

// Unified NewsProvider Facade
export class NewsProviderService {
  private liveProvider = new LiveNewsProvider();
  private rssProvider = new RSSNewsProvider();
  private officialProvider = new OfficialSourceProvider();
  private cacheProvider = new CachedFallbackProvider();

  async fetchNews(params: NewsFilterParams, forceRefresh: boolean = false): Promise<NewsProviderResult> {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const isFuture = params.date > todayDateStr;

    if (isFuture) {
      return {
        articles: [],
        source: 'None',
        isLive: true,
        fetchedAt: new Date().toISOString(),
        isFutureDate: true
      };
    }

    // 1. Check cache if not forcing refresh
    if (!forceRefresh) {
      const cached = this.cacheProvider.getCache(params.date);
      if (cached && cached.articles.length > 0) {
        const ageMs = Date.now() - cached.fetchedAt;
        const ageMinutes = Math.floor(ageMs / 60000);

        if (ageMs < MAX_FRESH_CACHE_MS) {
          const filtered = this.applyFilters(cached.articles, params);
          return {
            articles: filtered,
            source: cached.provider,
            isLive: true,
            fetchedAt: new Date(cached.fetchedAt).toISOString(),
            cacheAgeMinutes: ageMinutes,
            isStale: false
          };
        } else if (ageMs < MAX_STALE_CACHE_MS) {
          // Stale cache: return with isStale: true so UI indicates clearly
          const filtered = this.applyFilters(cached.articles, params);
          return {
            articles: filtered,
            source: cached.provider,
            isLive: false,
            fetchedAt: new Date(cached.fetchedAt).toISOString(),
            cacheAgeMinutes: ageMinutes,
            isStale: true
          };
        }
      }
    }

    // 2. Hierarchy Attempt 1: Live News Provider
    try {
      if (await this.liveProvider.isAvailable()) {
        const articles = await this.liveProvider.fetchNews(params);
        if (articles && articles.length > 0) {
          this.cacheProvider.saveCache(params.date, 'Live News Provider (Wire & RSS)', articles);
          return {
            articles: this.applyFilters(articles, params),
            source: 'Live External News Provider',
            isLive: true,
            fetchedAt: new Date().toISOString(),
            cacheAgeMinutes: 0,
            isStale: false
          };
        }
      }
    } catch (e) {
      console.warn('LiveNewsProvider fetch failed, falling to next provider:', e);
    }

    // 3. Hierarchy Attempt 2: RSS News Provider
    try {
      if (await this.rssProvider.isAvailable()) {
        const articles = await this.rssProvider.fetchNews(params);
        if (articles && articles.length > 0) {
          this.cacheProvider.saveCache(params.date, 'Permitted RSS News Provider', articles);
          return {
            articles: this.applyFilters(articles, params),
            source: 'Permitted RSS Feeds',
            isLive: true,
            fetchedAt: new Date().toISOString(),
            cacheAgeMinutes: 0,
            isStale: false
          };
        }
      }
    } catch (e) {
      console.warn('RSSNewsProvider fetch failed:', e);
    }

    // 4. Hierarchy Attempt 3: Official Source Provider
    try {
      if (await this.officialProvider.isAvailable()) {
        const articles = await this.officialProvider.fetchNews(params);
        if (articles && articles.length > 0) {
          this.cacheProvider.saveCache(params.date, 'Official Financial Sources', articles);
          return {
            articles: this.applyFilters(articles, params),
            source: 'Official Financial Sources',
            isLive: true,
            fetchedAt: new Date().toISOString(),
            cacheAgeMinutes: 0,
            isStale: false
          };
        }
      }
    } catch (e) {
      console.warn('OfficialSourceProvider failed:', e);
    }

    // 5. Hierarchy Attempt 4: Temporary Cached Fallback (if any existed)
    const fallbackCache = this.cacheProvider.getCache(params.date);
    if (fallbackCache && fallbackCache.articles.length > 0) {
      const ageMs = Date.now() - fallbackCache.fetchedAt;
      const ageMinutes = Math.floor(ageMs / 60000);
      return {
        articles: this.applyFilters(fallbackCache.articles, params),
        source: 'Cached Fallback',
        isLive: false,
        fetchedAt: new Date(fallbackCache.fetchedAt).toISOString(),
        cacheAgeMinutes: ageMinutes,
        isStale: true
      };
    }

    // 6. No provider available and no cache -> Throw/return honest unavailable result
    throw new Error('Live news is currently unavailable.');
  }

  private applyFilters(articles: NormalizedNewsArticle[], params: NewsFilterParams): NormalizedNewsArticle[] {
    let result = [...articles];

    // Filter by category
    if (params.category && params.category !== 'All') {
      const targetCat = params.category.toLowerCase();
      result = result.filter(a => a.category.toLowerCase() === targetCat);
    }

    // Filter by market
    if (params.market && params.market !== 'All Markets') {
      const targetMarket = params.market.toUpperCase();
      result = result.filter(a => 
        a.relatedMarkets?.some(m => m.toUpperCase() === targetMarket)
      );
    }

    // Search query
    if (params.searchQuery) {
      const q = params.searchQuery.toLowerCase().trim();
      result = result.filter(a => 
        a.headline.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.sourceName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    // Deduplicate
    const seen = new Set<string>();
    result = result.filter(a => {
      const key = (a.sourceUrl || a.headline).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Ensure strictly ordered Newest -> Oldest
    result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Ensure unique IDs across all items
    const seenIds = new Set<string>();
    result = result.map((a, i) => {
      let finalId = a.id;
      if (!finalId || finalId.includes('aHR0cHM6Ly93d3cu') || seenIds.has(finalId)) {
        const cleanSource = (a.sourceName || 'news').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const slug = (a.headline || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
        finalId = `art-${cleanSource}-${i}-${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }
      seenIds.add(finalId);
      return {
        ...a,
        id: finalId
      };
    });

    return result;
  }
}

export const newsProvider = new NewsProviderService();

// Backward compatibility exports for legacy sub-components
export const NewsProvider = {
  getAllStories: () => [],
  getBreakingStories: () => [],
  searchStories: () => []
};

export const MarketDataProvider = {
  getAllAssets: () => [],
  getMarketAttentionMetrics: () => ({ attentionIndex: 50, volatilityRegime: 'NORMAL' })
};

export const WHAT_MOVED_MARKETS_DATA: any[] = [];
export const ENTITIES_INTELLIGENCE_DATA: any[] = [];
export const getNewsAttentionMetrics = () => ({ attentionIndex: 50, volatilityRegime: 'NORMAL' });
export const getProviderStatuses = () => [];
export const generateAINewsAnalysis = async () => ({ analysis: '' });

