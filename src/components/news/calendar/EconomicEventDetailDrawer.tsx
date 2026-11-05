import React from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  Flame, 
  Activity, 
  CheckCircle2, 
  Globe, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  FileText,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NormalizedEconomicEvent } from '@/types/normalizedCalendar';
import { CurrencyBadge, CURRENCY_FULL_NAMES } from '../CurrencyBadge';
import { NormalizedNewsArticle } from '@/types/normalizedNews';
import { format, parseISO } from 'date-fns';

interface EconomicEventDetailDrawerProps {
  event: NormalizedEconomicEvent | null;
  timezone: string;
  isOpen: boolean;
  onClose: () => void;
  relatedArticles?: NormalizedNewsArticle[];
  onSelectArticle?: (article: NormalizedNewsArticle) => void;
}

const IMPACT_CONFIG = {
  HIGH: {
    label: 'High Impact',
    color: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60',
    icon: Flame,
    desc: 'High market sensitivity. Significant likelihood of increased volatility across related currency pairs and asset classes.'
  },
  MEDIUM: {
    label: 'Medium Impact',
    color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60',
    icon: Activity,
    desc: 'Moderate market sensitivity. May trigger targeted volatility or confirm broader economic trends.'
  },
  LOW: {
    label: 'Low Impact',
    color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60',
    icon: CheckCircle2,
    desc: 'Lower market sensitivity. Monitored for background economic baseline and revisions.'
  },
  'NON-ECONOMIC': {
    label: 'Non-Economic',
    color: 'text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    icon: Layers,
    desc: 'Non-statistical or administrative market event, working session, or holiday schedule.'
  }
};

export function EconomicEventDetailDrawer({
  event,
  timezone,
  isOpen,
  onClose,
  relatedArticles = [],
  onSelectArticle
}: EconomicEventDetailDrawerProps) {
  if (!isOpen || !event) return null;

  const impactInfo = IMPACT_CONFIG[event.importance] || IMPACT_CONFIG['LOW'];
  const ImpactIcon = impactInfo.icon;

  // Format date and time in user timezone
  const formattedDateTime = (() => {
    try {
      const date = parseISO(event.dateTime);
      const timeStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(date);
      const dateStr = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
      return `${timeStr} · ${dateStr}`;
    } catch {
      return `${event.time} UTC · ${event.date}`;
    }
  })();

  // Calculate difference if both actual and forecast exist as numbers
  const calculatedDiff = (() => {
    if (!event.actual || !event.forecast) return null;
    const cleanActual = parseFloat(event.actual.replace(/[^0-9.-]+/g, ''));
    const cleanForecast = parseFloat(event.forecast.replace(/[^0-9.-]+/g, ''));
    if (isNaN(cleanActual) || isNaN(cleanForecast)) return null;
    const diff = cleanActual - cleanForecast;
    const sign = diff > 0 ? '+' : '';
    const rounded = Math.round(diff * 100) / 100;
    return `${sign}${rounded}`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CurrencyBadge code={event.currency} showFullName={true} size="md" />
              
              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${impactInfo.color}`}>
                <ImpactIcon className="w-3 h-3 text-current" />
                <span>{impactInfo.label}</span>
              </span>

              <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${
                event.status === 'RELEASED'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 animate-pulse'
              }`}>
                {event.status === 'RELEASED' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>RELEASED</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>UPCOMING</span>
                  </>
                )}
              </span>
            </div>

            <h2 id="event-detail-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {event.event}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{formattedDateTime}</span>
              <span>({timezone})</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close event details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Key Metrics: Actual / Forecast / Previous */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Release Statistics & Values
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Previous */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-200 block">
                  Previous
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white block mt-1">
                  {event.previous || '—'}
                </span>
              </div>

              {/* Forecast */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/90 rounded-xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xs">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-200 block">
                  Forecast
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-blue-600 dark:text-sky-300 block mt-1">
                  {event.forecast || '—'}
                </span>
              </div>

              {/* Actual */}
              <div className={`p-3.5 rounded-xl border shadow-2xs ${
                event.status === 'RELEASED' && event.actual
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-600/70 text-emerald-900 dark:text-emerald-100'
                  : 'bg-slate-50 dark:bg-slate-800/90 border-dashed border-slate-300 dark:border-slate-600'
              }`}>
                <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider block ${
                  event.status === 'RELEASED' && event.actual
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-200'
                }`}>
                  Actual (Live)
                </span>
                <span className={`text-base sm:text-lg font-black font-mono block mt-1 ${
                  event.status === 'RELEASED' && event.actual
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-amber-600 dark:text-amber-300 text-xs font-bold'
                }`}>
                  {event.status === 'RELEASED' && event.actual ? event.actual : 'Awaiting Release'}
                </span>
              </div>
            </div>

            {/* Difference / Revision Callout */}
            {(calculatedDiff || event.revision) && (
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                {calculatedDiff && (
                  <div className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                    <span className="font-semibold">Actual vs Forecast Deviation:</span>
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60">{calculatedDiff}</span>
                  </div>
                )}
                {event.revision && (
                  <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <span className="font-semibold">Revision:</span>
                    <span className="font-mono">{event.revision}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Why Traders Watch This (Educational & Analytical, strictly non-predictive) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/90 dark:border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Why Traders Watch This Indicator</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.description || `${event.event} provides benchmark macroeconomic insight into sovereign economic momentum, inflation expectations, and monetary policy conditions.`}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {impactInfo.desc}
            </p>
          </div>

          {/* Related Instruments & Markets */}
          {event.affectedMarkets && event.affectedMarkets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Related Financial Instruments & Pairs
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.affectedMarkets.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Informational correlation based on sovereign currency exposure and macroeconomic sensitivity.
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Release Specification
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Country / Jurisdiction</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {event.country}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Reporting Category</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {event.category || 'General Macroeconomic'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Reporting Frequency</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {event.frequency || 'Monthly / Periodic'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">Measurement Unit</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                  {event.unit || 'Index / Rate'}
                </span>
              </div>
            </div>
          </div>

          {/* Official Source & Links */}
          {event.source && (
            <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Official Statistical Source</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{event.source}</span>
              </div>
              {event.sourceUrl && (
                <a
                  href={event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
                >
                  <span>Official Bulletin</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Related News Articles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Related Market News ({relatedArticles.length})</span>
            </h3>

            {relatedArticles.length > 0 ? (
              <div className="space-y-2.5">
                {relatedArticles.slice(0, 3).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle && onSelectArticle(art)}
                    className="p-3 bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl transition-all cursor-pointer space-y-1 group"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{art.sourceName}</span>
                      <span className="font-mono">{format(parseISO(art.publishedAt), 'h:mm a')}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {art.headline}
                    </h4>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No related real-time articles recorded for this specific release.
              </p>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            TradeVault Institutional Economic Intelligence
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
