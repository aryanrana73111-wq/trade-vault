import React, { useState } from 'react';
import { MarketNewsArticle } from '@/types/newsIntelligence';
import { ArrowRight, Flame, AlertCircle, Info, User, Tag } from 'lucide-react';

interface Props {
  article: MarketNewsArticle;
  onClick: () => void;
}

export function HeroStoryCard({ article, onClick }: Props) {
  const [imageError, setImageError] = useState(false);

  const getImpactBadge = () => {
    switch (article.impact) {
      case 'HIGH':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-md border border-rose-200 dark:border-rose-900/60 flex items-center shadow-2xs">
            <Flame className="w-3.5 h-3.5 mr-1.5 text-rose-500 shrink-0" /> HIGH IMPACT
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-900/60 flex items-center shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500 shrink-0" /> MEDIUM IMPACT
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 flex items-center shadow-2xs">
            <Info className="w-3.5 h-3.5 mr-1.5 text-slate-500 shrink-0" /> LOW IMPACT
          </span>
        );
    }
  };

  return (
    <article 
      onClick={onClick}
      className="group cursor-pointer relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-lg dark:hover:shadow-black/50 min-h-[380px] md:min-h-[420px] flex flex-col md:flex-row"
    >
      {/* Image Half */}
      <div className="relative w-full md:w-1/2 h-56 sm:h-64 md:h-auto min-h-[220px] bg-slate-100 dark:bg-slate-800/80 overflow-hidden shrink-0">
        {article.imageUrl && !imageError ? (
          <img 
            src={article.imageUrl} 
            alt={article.headline} 
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 p-6 text-center">
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 mb-2">
              <Tag className="w-8 h-8" />
            </div>
            <span className="text-slate-800 dark:text-slate-200 font-bold text-lg">{article.category}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Market Catalyst Intelligence</span>
          </div>
        )}

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/20 md:to-black/60" />

        {/* Floating entity chip over image if available */}
        {article.personEntity && (
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md text-white border border-white/20 text-xs font-semibold shadow-lg">
            <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Key Entity: {article.personEntity}</span>
          </div>
        )}
      </div>

      {/* Content Half */}
      <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between relative bg-white dark:bg-slate-900">
        <div>
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4 sm:mb-6">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
              {article.category}
            </span>
            {getImpactBadge()}
            {article.country && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-900">
                {article.country}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-3 sm:mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {article.headline}
          </h2>
          
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Footer Area */}
        <div className="mt-auto pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col space-y-1.5">
            <div className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center flex-wrap gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{article.source}</span>
              <span>•</span>
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
            {article.markets && article.markets.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Markets:</span>
                {article.markets.map((m, i) => (
                  <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="button"
            className="flex items-center justify-center px-5 py-2.5 min-h-[44px] bg-blue-50 dark:bg-blue-600/15 hover:bg-blue-100 dark:hover:bg-blue-600/25 text-blue-700 dark:text-blue-400 rounded-xl font-medium transition-colors border border-blue-200 dark:border-blue-600/30 whitespace-nowrap text-sm self-stretch sm:self-auto shadow-2xs"
          >
            <span>Read Story</span> 
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
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
  return `${diffDays} days ago`;
}
