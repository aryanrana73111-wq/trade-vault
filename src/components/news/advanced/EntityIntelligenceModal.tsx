import React from 'react';
import { X, Building2, TrendingUp, Calendar, BookOpen, ShieldCheck, ExternalLink, Clock } from 'lucide-react';
import { EntityIntelligence } from '@/types/newsModes';
import { MarketDataProvider, NewsProvider } from '@/services/news/newsProviders';
import { MarketNewsArticle } from '@/types/newsIntelligence';

interface EntityIntelligenceModalProps {
  entity: EntityIntelligence;
  onClose: () => void;
  onSelectStory?: (story: MarketNewsArticle) => void;
}

export function EntityIntelligenceModal({
  entity,
  onClose,
  onSelectStory
}: EntityIntelligenceModalProps) {
  // Find related stories for this entity
  const entityStories = NewsProvider.getStoriesForEntity(entity.name).slice(0, 4);

  // Retrieve actual market quotes for related markets
  const relatedQuotes = entity.relatedMarkets.map(m => {
    const asset = MarketDataProvider.getAssetBySymbol(m);
    return {
      symbol: m,
      asset
    };
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {entity.name}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {entity.type}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Institutional Entity Intelligence Dossier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Description */}
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            {entity.description}
          </div>

          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {entity.keyStats.map((st, i) => (
              <div key={i} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {st.label}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white block">
                  {st.value}
                </span>
                {st.subtext && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 truncate">
                    {st.subtext}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Primary Macro Driver */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
              Primary Institutional Market Driver
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              {entity.primaryDriver}
            </p>
          </div>

          {/* Connected Related Markets */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Connected Financial Instruments & Quotes
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {relatedQuotes.map(({ symbol, asset }) => (
                <div key={symbol} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                    {symbol}
                  </span>
                  {asset ? (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                        {asset.priceFormatted}
                      </span>
                      <span className={`text-[10px] font-bold ${asset.change24h >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {asset.change24h >= 0 ? `+${asset.change24h}%` : `${asset.change24h}%`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic block mt-1">
                      Market data unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Historical Context */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Empirical Historical Context
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {entity.historicalContext}
            </p>
          </div>

          {/* Recent Wire Reports */}
          {entityStories.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Recent Entity Intelligence Reports
              </h4>
              <div className="space-y-2">
                {entityStories.map(st => (
                  <div
                    key={st.id}
                    onClick={() => {
                      if (onSelectStory) onSelectStory(st);
                      onClose();
                    }}
                    className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                        {st.headline}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {st.source} • {new Date(st.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      View &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
