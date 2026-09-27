import React from 'react';
import { 
  X, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Layers, 
  Info,
  HelpCircle,
  Sparkles,
  FileText
} from 'lucide-react';
import { NormalizedNewsArticle } from '@/types/normalizedNews';
import { format, parseISO } from 'date-fns';

interface MarketIntelligenceDrawerProps {
  article: NormalizedNewsArticle | null;
  onClose: () => void;
}

export function MarketIntelligenceDrawer({ article, onClose }: MarketIntelligenceDrawerProps) {
  if (!article) return null;

  const intel = article.intelligence || {
    whyItMatters: 'Provides official reporting regarding macroeconomic and monetary policy trends.',
    marketsPotentiallyAffected: article.relatedMarkets || ['Broad Financial Markets'],
    relatedInstruments: article.relatedMarkets || [],
    historicalContext: `Reported by ${article.sourceName} during current economic monitoring cycle.`,
    evidence: [`Official report by ${article.sourceName}`, `Published: ${article.publishedAt}`],
    uncertainty: 'Market reactions depend on ongoing liquidity conditions and subsequent economic data releases.'
  };

  const formattedPub = (() => {
    try {
      return format(parseISO(article.publishedAt), 'PPpp');
    } catch {
      return article.publishedAt;
    }
  })();

  const formattedUpd = article.updatedAt ? (() => {
    try {
      return format(parseISO(article.updatedAt), 'PPpp');
    } catch {
      return article.updatedAt;
    }
  })() : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Market Intelligence
                </span>
                <span className="text-xs text-slate-400">{article.category}</span>
              </div>
              <h2 className="text-sm font-semibold text-slate-100 mt-0.5">Professional Macro Context</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Article Info Card */}
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
            <h1 className="text-base font-bold text-slate-100 leading-snug">
              {article.headline}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {article.summary}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-200">{article.sourceName}</span>
                <span>•</span>
                <span>Published: {formattedPub}</span>
                {formattedUpd && (
                  <>
                    <span>•</span>
                    <span className="text-amber-400 font-medium">Updated: {formattedUpd}</span>
                  </>
                )}
              </div>

              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 hover:text-blue-300 border border-blue-500/30 font-medium transition-colors"
              >
                <span>Read Original</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Section 1: Why It Matters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Why It Matters</span>
            </div>
            <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs leading-relaxed text-slate-200">
              {intel.whyItMatters}
            </div>
          </div>

          {/* Section 2: Markets Potentially Affected */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Markets Potentially Affected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {intel.marketsPotentiallyAffected.map((market, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {market}
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: Related Instruments */}
          {intel.relatedInstruments && intel.relatedInstruments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Related Instruments</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {intel.relatedInstruments.map((inst, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-purple-950/40 border border-purple-800/40 text-xs font-mono font-semibold text-purple-300"
                  >
                    {inst}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Historical Context */}
          {intel.historicalContext && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Historical Context</span>
              </div>
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs leading-relaxed text-slate-300">
                {intel.historicalContext}
              </div>
            </div>
          )}

          {/* Section 5: Factual Evidence & Citations */}
          {intel.evidence && intel.evidence.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Source Evidence</span>
              </div>
              <ul className="space-y-1.5">
                {intel.evidence.map((point, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/30 p-2.5 rounded-lg border border-slate-800/60"
                  >
                    <span className="text-blue-400 font-bold mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 6: Uncertainty & Variables to Monitor */}
          {intel.uncertainty && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span>Uncertainty & Variables</span>
              </div>
              <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs leading-relaxed text-amber-200/90">
                {intel.uncertainty}
              </div>
            </div>
          )}

          {/* Institutional Compliance Notice */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">Neutral Context Policy:</span> TradeVault Market Intelligence provides objective macroeconomic context and historical records. It does not predict future asset prices or generate directional trading advice.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
