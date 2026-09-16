import React from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Share2, 
  Bookmark, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Building2, 
  Calendar,
  AlertCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { MarketNewsArticle } from '@/types/newsIntelligence';
import { MarketDataProvider } from '@/services/news/newsProviders';

interface ProArticleModalProps {
  article: MarketNewsArticle;
  onClose: () => void;
  onSelectRelatedArticle?: (article: MarketNewsArticle) => void;
  onBookmarkToggle?: (articleId: string) => void;
  isBookmarked?: boolean;
}

export function ProArticleModal({
  article,
  onClose,
  onSelectRelatedArticle,
  onBookmarkToggle,
  isBookmarked = false
}: ProArticleModalProps) {
  // Format dates
  const publishedDate = new Date(article.publishedAt);
  const formattedPublishTime = publishedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const updatedTime = article.updatedAt 
    ? new Date(article.updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  // Retrieve actual connected market data for article.markets
  const relatedMarketData = (article.markets || []).map(sym => {
    const data = MarketDataProvider.getAssetBySymbol(sym);
    return {
      symbol: sym,
      data
    };
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header / Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {article.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Source: <strong className="text-slate-700 dark:text-slate-200">{article.source}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onBookmarkToggle && (
              <button
                type="button"
                onClick={() => onBookmarkToggle(article.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  isBookmarked
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark story'}
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Close article modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-5 sm:px-8 py-6 space-y-6">
          
          {/* Article Header & Headline */}
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {article.headline}
            </h1>

            {/* Subheadline / Key takeaways */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {article.summary}
            </p>

            {/* Byline / Source Metadata Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Published: {formattedPublishTime}
              </span>
              {updatedTime && (
                <span className="flex items-center gap-1.5 text-slate-400">
                  • Updated: {updatedTime}
                </span>
              )}
              {article.personEntity && (
                <span className="flex items-center gap-1.5">
                  • Entity: <span className="font-semibold text-slate-700 dark:text-slate-300">{article.personEntity}</span>
                </span>
              )}
              {article.isDevelopingStory && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  DEVELOPING STORY
                </span>
              )}
            </div>
          </div>

          {/* Lead Image if available */}
          {article.imageUrl && (
            <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
              <img
                src={article.imageUrl}
                alt={article.headline}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-[10px] text-slate-300 px-2.5 py-1 rounded-md">
                Source: {article.source} Wire Photo / License
              </div>
            </div>
          )}

          {/* RELATED MARKETS PANEL (With actual connected market data or clean unavailable state) */}
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Related Markets & Quotes
              </h3>
              <span className="text-[10px] text-slate-400">Institutional 15-min Delayed Data</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {relatedMarketData.length > 0 ? (
                relatedMarketData.map(({ symbol, data }) => (
                  <div 
                    key={symbol} 
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {symbol}
                      </span>
                      {data ? (
                        <span className={`text-[10px] font-bold ${data.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {data.change24h >= 0 ? `+${data.change24h}%` : `${data.change24h}%`}
                        </span>
                      ) : null}
                    </div>

                    {data ? (
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                        {data.priceFormatted}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Market data unavailable
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-xs text-slate-400 italic py-2 text-center">
                  No specific financial instruments directly mapped to this macro story.
                </div>
              )}
            </div>
          </div>

          {/* PERMITTED EXCERPT & REPORT DETAILS (Honoring copyright & source attribution) */}
          <div className="space-y-4 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Publisher Attribution & Permitted Wire Brief
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This summary provides essential factual highlights compiled from <strong className="text-slate-800 dark:text-slate-200">{article.source}</strong> reports. In compliance with content licensing guidelines, TradeVault does not reproduce unverified full-text articles without publisher authorization.
              </p>
            </div>

            {/* Confirmed Facts if available */}
            {article.confirmedFacts && article.confirmedFacts.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Key Verified Facts
                </h4>
                <ul className="space-y-1.5">
                  {article.confirmedFacts.map((fact, i) => (
                    <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Why It Matters / Trader Context */}
            {article.whyItMatters && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Why It Matters
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {article.whyItMatters}
                </p>
              </div>
            )}
          </div>

          {/* READ ORIGINAL SOURCE BUTTON (Primary Call to Action) */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Read the complete unabridged report directly at the publisher official website.
            </div>

            <a
              href={article.sourceUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95 whitespace-nowrap"
            >
              <span>Read Original Source at {article.source}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
