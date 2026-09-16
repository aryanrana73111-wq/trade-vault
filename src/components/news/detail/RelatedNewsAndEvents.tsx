import React from 'react';
import { MarketNewsArticle } from '@/types/newsIntelligence';
import { RelatedReleaseEvent } from '@/types/eventIntelligence';
import { Newspaper, CalendarDays, ExternalLink, ArrowRight, Clock, ChevronRight } from 'lucide-react';

interface RelatedNewsAndEventsProps {
  articles: MarketNewsArticle[];
  relatedEvents: RelatedReleaseEvent[];
  onSelectArticle: (article: MarketNewsArticle) => void;
  onSelectRelatedEvent?: (eventId: string) => void;
}

export function RelatedNewsAndEvents({
  articles,
  relatedEvents,
  onSelectArticle,
  onSelectRelatedEvent
}: RelatedNewsAndEventsProps) {
  return (
    <div className="space-y-6">
      {/* 1. RELATED RELEASE EVENTS TIMELINE */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Release Sequence & Sister Indicators
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Historical lineage and complementary macroeconomic releases
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {relatedEvents.map((rel) => {
            const isCurrent = rel.relationship === 'current';
            const isNext = rel.relationship === 'next';
            const isSister = rel.relationship === 'sister';

            return (
              <div
                key={rel.id}
                onClick={() => onSelectRelatedEvent && onSelectRelatedEvent(rel.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 ring-1 ring-blue-500/30'
                    : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isNext
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                        : isSister
                        ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                        : 'bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300'
                    }`}>
                      {rel.relationship}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rel.period}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 my-1">
                    {rel.name}
                  </h3>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                  {rel.actual ? (
                    <span className="font-bold text-slate-900 dark:text-white">
                      Act: {rel.actual}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">
                      Fst: {rel.forecast || '—'}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RELATED NEWS COVERAGE */}
      {articles.length > 0 && (
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Related Intelligence & Coverage
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Verified financial journalism surrounding this release
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {articles.length} stories linked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {articles.slice(0, 4).map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 hover:bg-white dark:hover:bg-slate-850 hover:shadow-sm cursor-pointer transition-all flex gap-3.5 items-start"
              >
                {art.imageUrl && (
                  <img
                    src={art.imageUrl}
                    alt={art.headline}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                    <span className="font-bold uppercase text-blue-600 dark:text-blue-400">
                      {art.source}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(art.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {art.headline}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
