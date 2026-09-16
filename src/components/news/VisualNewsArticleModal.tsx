import React, { useState } from 'react';
import { MarketNewsArticle } from '@/types/newsIntelligence';
import { 
  X, 
  ExternalLink, 
  ArrowRight, 
  BrainCircuit, 
  Activity, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Flame, 
  AlertCircle, 
  Info, 
  User, 
  Calendar, 
  Clock, 
  Tag, 
  Globe 
} from 'lucide-react';

interface Props {
  article: MarketNewsArticle;
  onClose: () => void;
  onNavigateToAcademy?: (topic: string) => void;
}

export function VisualNewsArticleModal({ article, onClose, onNavigateToAcademy }: Props) {
  const [imageError, setImageError] = useState(false);

  const getImpactBadge = () => {
    switch (article.impact) {
      case 'HIGH':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-rose-500 text-white rounded-lg shadow-sm flex items-center">
            <Flame className="w-3.5 h-3.5 mr-1.5 text-white shrink-0" /> HIGH IMPACT
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white rounded-lg shadow-sm flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-white shrink-0" /> MEDIUM IMPACT
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-700 text-white rounded-lg shadow-sm flex items-center">
            <Info className="w-3.5 h-3.5 mr-1.5 text-slate-300 shrink-0" /> LOW IMPACT
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/60 dark:bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Touch-Friendly Close Button */}
        <button 
          onClick={onClose}
          type="button"
          aria-label="Close article"
          className="absolute top-3 right-3 z-30 min-w-[44px] min-h-[44px] flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors shadow-lg backdrop-blur-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Image Header */}
        <div className="w-full h-56 sm:h-64 md:h-72 relative bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
          {article.imageUrl && !imageError ? (
            <img 
              src={article.imageUrl} 
              alt={article.headline} 
              onError={() => setImageError(true)}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 p-6 text-center">
              <Tag className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
              <span className="text-slate-800 dark:text-slate-200 font-bold text-lg">{article.category}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Market Intelligence Article</span>
            </div>
          )}

          {/* Gradient Overlay for Text Visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          
          {/* Top category & impact badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md rounded-lg border border-white/20 shadow-xs">
              {article.category}
            </span>
            {getImpactBadge()}
          </div>

          {/* Person / Entity Chip if present */}
          {article.personEntity && (
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 text-white border border-white/20 text-xs font-semibold backdrop-blur-md shadow-md">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>Key Figure: {article.personEntity}</span>
            </div>
          )}
        </div>

        {/* 2. Content Body */}
        <div className="p-5 sm:p-6 md:p-8 space-y-6 flex-grow">
          
          {/* Headline */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {article.headline}
          </h1>

          {/* 3. Source & Date Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{article.source}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(article.publishedAt)}
              </span>
              {article.country && (
                <>
                  <span>•</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{article.country}</span>
                </>
              )}
            </div>

            <a 
              href={article.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>Source URL</span> <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          {/* 4. Important Numbers / Event Data (Previous, Forecast, Actual) */}
          {(article.previous || article.forecast || article.actual) && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Macro Release Data Points
              </h3>
              <div className="grid grid-cols-3 gap-2.5 p-3 sm:p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="p-2">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 font-medium">Previous</div>
                  <div className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
                    {article.previous || '--'}
                  </div>
                </div>
                <div className="p-2 border-l border-r border-slate-200 dark:border-slate-750">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5 font-medium">Forecast</div>
                  <div className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
                    {article.forecast || '--'}
                  </div>
                </div>
                <div className="p-2 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60">
                  <div className="text-xs text-blue-700 dark:text-blue-400 mb-0.5 font-semibold">Actual</div>
                  <div className="text-lg sm:text-xl font-extrabold text-blue-800 dark:text-blue-300">
                    {article.actual || 'Pending'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Summary / What Happened */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
              <Activity className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" /> Summary & Details
            </h3>
            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {article.whatHappened || article.summary}
            </p>
          </div>

          {/* 6. Why It Matters */}
          {article.whyItMatters && (
            <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                <BrainCircuit className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" /> Why It Matters to Traders
              </h3>
              <p className="text-sm sm:text-base text-blue-950 dark:text-blue-100 leading-relaxed font-medium">
                {article.whyItMatters}
              </p>
            </div>
          )}

          {/* 7. Markets to Watch & Trader Impact */}
          {(article.marketsToWatch || article.markets || article.traderImpact) && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
                <BarChart3 className="w-4 h-4 mr-1.5 text-blue-600 dark:text-blue-400" /> Markets to Watch
              </h3>

              {article.traderImpact ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {article.traderImpact.markets.map((m, i) => (
                      <div 
                        key={i} 
                        className="flex items-center px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                      >
                        <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">{m.asset}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                          m.sensitivity === 'HIGH' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60' :
                          m.sensitivity === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60' :
                          'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}>
                          {m.sensitivity}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic bg-slate-50/70 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{article.traderImpact.explanation}"
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {(article.marketsToWatch || article.markets || []).map((m, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 8. Market Reaction & Bull / Bear Context */}
          {article.bullBearContext && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Market Bias & Scenario Evaluation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4">
                  <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-bold mb-1.5 text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 mr-1.5" /> Bullish Case
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                    {article.bullBearContext.bullish}
                  </p>
                </div>

                <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4">
                  <div className="flex items-center text-rose-700 dark:text-rose-400 font-bold mb-1.5 text-xs uppercase tracking-wider">
                    <TrendingDown className="w-4 h-4 mr-1.5" /> Bearish Case
                  </div>
                  <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                    {article.bullBearContext.bearish}
                  </p>
                </div>

                {article.bullBearContext.neutral && (
                  <div className="md:col-span-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center text-slate-600 dark:text-slate-400 font-bold mb-1.5 text-xs uppercase tracking-wider">
                      <Minus className="w-4 h-4 mr-1.5" /> Neutral / Priced In
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {article.bullBearContext.neutral}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9. Action Area & Original Article Link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-5 mt-4">
            {onNavigateToAcademy && (
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAcademy(article.category);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-center sm:justify-start py-2"
              >
                Learn {article.category} concepts in Academy <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            )}
            
            {/* Primary Original Article Button */}
            <a 
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all sm:ml-auto flex items-center justify-center shadow-md shadow-blue-600/20 active:scale-[0.98]"
            >
              <span>Read Full Article on {article.source}</span>
              <ExternalLink className="w-4 h-4 ml-2 shrink-0" />
            </a>
          </div>

        </div>
      </div>
    </div>
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
