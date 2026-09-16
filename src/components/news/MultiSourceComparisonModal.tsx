import React from 'react';
import { 
  X, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  Clock, 
  Globe, 
  Share2,
  Bookmark
} from 'lucide-react';
import { NewsStoryCluster } from '@/types/newsIntelligence';

interface MultiSourceComparisonModalProps {
  cluster: NewsStoryCluster | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (eventId: string) => void;
  onSelectIndicator?: (indicatorCode: string) => void;
}

export const MultiSourceComparisonModal: React.FC<MultiSourceComparisonModalProps> = ({
  cluster,
  isOpen,
  onClose,
  onSelectEvent,
  onSelectIndicator
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !cluster) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        id="multi-source-comparison-modal"
        className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Layers className="w-3.5 h-3.5" />
                Developing Story • {cluster.sourcesCount} Reporting Sources
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Multi-Source Intelligence Comparison
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {cluster.topicTitle}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {cluster.summary}
            </p>
          </div>
          <button
            id="btn-close-comparison-modal"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sources breakdown pills */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
              Reporting Outlets & Stances
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cluster.sourcesList.map((src, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                        {src.name}
                      </span>
                    </div>
                    {src.stance && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {src.stance}
                      </p>
                    )}
                  </div>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors shrink-0"
                    title={`Open ${src.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Columns: Confirmed vs Differs vs Uncertain */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. What is Confirmed */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>What is Confirmed</span>
              </div>
              <p className="text-xs text-emerald-900/70 dark:text-emerald-300/70">
                Facts corroborated across multiple independent wire reports.
              </p>
              <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {cluster.confirmedFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. What Differs */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>What Differs</span>
              </div>
              <p className="text-xs text-amber-900/70 dark:text-amber-300/70">
                Points of divergent analysis, estimates, or unnamed source leaks.
              </p>
              <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {cluster.differingPoints.map((diff, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. What Remains Uncertain */}
            <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 space-y-3">
              <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-semibold text-sm">
                <HelpCircle className="w-4 h-4 shrink-0 text-neutral-500 dark:text-neutral-400" />
                <span>What Remains Uncertain</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Pending statements, policy votes, and unconfirmed variables.
              </p>
              <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {cluster.uncertainPoints.map((unc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-1.5 shrink-0" />
                    <span>{unc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Timeline of Story Coverage */}
          {cluster.timeline && cluster.timeline.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Coverage Chronology & Updates
                </div>
              </div>
              <div className="relative pl-6 space-y-3 border-l-2 border-neutral-200 dark:border-neutral-800">
                {cluster.timeline.map((item, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700 border-2 border-white dark:border-neutral-900 group-hover:bg-primary-500 transition-colors" />
                    <div className="flex items-baseline gap-2 text-xs">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                        {item.source}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-0.5">
                      {item.headline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Instruments & Navigation Links */}
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Related Markets & Sensitive Pairs:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {cluster.relatedMarkets.map((mkt, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-neutral-200/70 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                  >
                    {mkt}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cluster.relatedEventId && onSelectEvent && (
                <button
                  id="btn-view-calendar-event"
                  onClick={() => {
                    onClose();
                    onSelectEvent(cluster.relatedEventId!);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
                >
                  View Calendar Event →
                </button>
              )}
              {cluster.relatedIndicatorCode && onSelectIndicator && (
                <button
                  id="btn-view-macro-data"
                  onClick={() => {
                    onClose();
                    onSelectIndicator(cluster.relatedIndicatorCode!);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                >
                  View Macro Indicator →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900">
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Cross-verified across {cluster.sourcesCount} financial reporting terminals. TradeVault does not issue trading signals.
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-share-comparison"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? 'Copied!' : 'Share Analysis'}
            </button>
            <button
              id="btn-done-comparison"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
