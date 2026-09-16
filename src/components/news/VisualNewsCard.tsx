import React, { useState } from 'react';
import { MarketNewsArticle } from '@/types/newsIntelligence';
import { 
  Flame, 
  AlertCircle, 
  Info, 
  User, 
  Tag, 
  ArrowUpRight, 
  Layers, 
  Sparkles, 
  Bookmark, 
  Activity, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Database 
} from 'lucide-react';
import { calculatePersonalRelevance } from '@/lib/news/newsStore';

interface Props {
  article: MarketNewsArticle;
  onClick: () => void;
  onOpenCluster?: (clusterId: string) => void;
  onSelectIndicator?: (code: string) => void;
  onSelectEvent?: (eventId: string) => void;
  onToggleBookmark?: (articleId: string) => void;
  isBookmarked?: boolean;
  userTradedMarkets?: string[];
}

export function VisualNewsCard({ 
  article, 
  onClick,
  onOpenCluster,
  onSelectIndicator,
  onSelectEvent,
  onToggleBookmark,
  isBookmarked = false,
  userTradedMarkets = []
}: Props) {
  const [imageError, setImageError] = useState(false);
  const [showTraderExplain, setShowTraderExplain] = useState(false);

  // Check personal relevance
  const relevance = calculatePersonalRelevance(
    article.markets || [],
    article.headline || '',
    article.summary || '',
    userTradedMarkets
  );

  const renderImpactBadge = () => {
    switch (article.impact) {
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-rose-500/90 text-white backdrop-blur-md rounded-md border border-rose-400/40 shadow-xs flex items-center">
            <Flame className="w-3 h-3 mr-1 text-white shrink-0" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500/90 text-white backdrop-blur-md rounded-md border border-amber-400/40 shadow-xs flex items-center">
            <AlertCircle className="w-3 h-3 mr-1 text-white shrink-0" /> MED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider bg-slate-700/80 text-white backdrop-blur-md rounded-md border border-slate-600/40 shadow-xs flex items-center">
            <Info className="w-3 h-3 mr-1 text-slate-300 shrink-0" /> LOW
          </span>
        );
    }
  };

  return (
    <article 
      onClick={onClick}
      className={`group cursor-pointer bg-white dark:bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col h-full shadow-xs hover:shadow-md ${
        relevance.isRelevant 
          ? 'border-primary-400 dark:border-primary-600/70 ring-1 ring-primary-500/20' 
          : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Top Banner: Personal Relevance if matched */}
      {relevance.isRelevant && (
        <div className="bg-primary-50 dark:bg-primary-950/50 border-b border-primary-200 dark:border-primary-800/60 px-3.5 py-1 flex items-center justify-between text-[11px] font-semibold text-primary-700 dark:text-primary-300">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Relevant to your active {relevance.matchedMarket} trades
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            Portfolio Priority
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {article.imageUrl && !imageError ? (
          <img 
            src={article.imageUrl} 
            alt={article.headline} 
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-850 p-4 text-center">
            <Tag className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mb-1" />
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{article.category}</span>
          </div>
        )}

        {/* Gradient shadow for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md rounded-md border border-white/20 shadow-xs">
              {article.category}
            </span>

            {/* Developing Story Cluster Badge */}
            {article.isDevelopingStory && article.clusterId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenCluster) onOpenCluster(article.clusterId!);
                }}
                className="px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-500/90 text-white hover:bg-amber-600 backdrop-blur-md rounded-md border border-amber-300/40 shadow-xs flex items-center gap-1 transition-colors"
                title="Click to compare 4 wire reports"
              >
                <Layers className="w-3 h-3 shrink-0" />
                Developing ({article.sourcesCount || 4} Sources)
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {renderImpactBadge()}

            {/* Bookmark button */}
            {onToggleBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(article.id);
                }}
                className={`p-1.5 rounded-md backdrop-blur-md transition-colors ${
                  isBookmarked
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
                }`}
                title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark this article'}
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom meta over image */}
        <div className="absolute bottom-2.5 left-3 right-3 text-xs text-white/95 flex items-center justify-between z-10 drop-shadow-sm font-medium">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="font-semibold truncate">{article.source}</span>
            <span>•</span>
            <span className="shrink-0">{formatTimeAgo(article.publishedAt)}</span>
          </div>
          {article.personEntity && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-blue-600/80 text-white backdrop-blur-xs font-semibold shrink-0">
              <User className="w-2.5 h-2.5" />
              {article.personEntity}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-white dark:bg-neutral-900">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {article.headline}
            </h3>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
          </div>
          
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>

          {/* Explain Like a Trader Trigger */}
          {article.explainTrader && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowTraderExplain(!showTraderExplain);
              }}
              className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 text-xs transition-colors hover:bg-purple-100/70 dark:hover:bg-purple-900/40"
            >
              <div className="flex items-center justify-between font-semibold text-purple-800 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Explain Like a Trader
                </span>
                {showTraderExplain ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>

              {showTraderExplain && (
                <div className="mt-2 pt-2 border-t border-purple-200/60 dark:border-purple-800/60 space-y-2 text-neutral-700 dark:text-neutral-300">
                  <div>
                    <span className="font-semibold text-purple-900 dark:text-purple-200">What Happened: </span>
                    <span>{article.explainTrader.plainEnglish || article.explainTrader.whatHappened}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-900 dark:text-purple-200">Market Moving Mechanism: </span>
                    <span>{article.explainTrader.whyItMovesMarkets || article.explainTrader.whyItMatters}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-900/70 border border-purple-100 dark:border-purple-900">
                    <span className="font-bold text-neutral-900 dark:text-white">Trader Takeaway: </span>
                    <span>{article.explainTrader.traderTakeaway || article.explainTrader.watchNext || article.explainTrader.whatDataChanged}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Why It Matters Preview Snippet if available */}
          {!article.explainTrader && article.whyItMatters && (
            <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 line-clamp-1">
              <span className="font-semibold text-blue-700 dark:text-blue-400">Why it matters: </span>
              {article.whyItMatters}
            </div>
          )}

          {/* Linked Macro Indicators & Calendar Events */}
          {(article.relatedIndicatorCode || article.relatedEventId) && (
            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              {article.relatedIndicatorCode && onSelectIndicator && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIndicator(article.relatedIndicatorCode!);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-medium hover:bg-purple-100 text-[11px]"
                >
                  <Database className="w-3 h-3" />
                  Macro Data: {article.relatedIndicatorCode}
                </button>
              )}
              {article.relatedEventId && onSelectEvent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(article.relatedEventId!);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-medium hover:bg-sky-100 text-[11px]"
                >
                  <Calendar className="w-3 h-3" />
                  Calendar Catalyst
                </button>
              )}
            </div>
          )}
        </div>

        {/* Markets affected */}
        {article.markets && article.markets.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 mt-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Markets:</span>
              {article.markets.slice(0, 3).map((market, idx) => (
                <span key={idx} className="text-[11px] font-medium px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md border border-neutral-200 dark:border-neutral-700">
                  {market}
                </span>
              ))}
              {article.markets.length > 3 && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 text-neutral-500 dark:text-neutral-400">
                  +{article.markets.length - 3}
                </span>
              )}
            </div>

            {article.isDevelopingStory && article.clusterId && onOpenCluster && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCluster(article.clusterId!);
                }}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Compare Sources →
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}
