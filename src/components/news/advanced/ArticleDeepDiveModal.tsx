import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  ExternalLink, 
  Clock, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Eye, 
  Calendar, 
  Zap,
  Info
} from 'lucide-react';
import { MarketNewsArticle } from '@/types/newsIntelligence';
import { MarketTerminologyTooltip } from './MarketTerminologyTooltip';

interface ArticleDeepDiveModalProps {
  article: MarketNewsArticle;
  onClose: () => void;
  onBookmarkToggle?: (id: string) => void;
  isBookmarked?: boolean;
  onOpenAi?: (article: MarketNewsArticle) => void;
  onOpenNote?: (article: MarketNewsArticle) => void;
  onNavigateToAnalytics?: (symbol: string) => void;
}

export function ArticleDeepDiveModal({
  article,
  onClose,
  onBookmarkToggle,
  isBookmarked = false,
  onOpenAi,
  onOpenNote,
  onNavigateToAnalytics
}: ArticleDeepDiveModalProps) {
  const [viewLevel, setViewLevel] = useState<'PROFESSIONAL' | 'SIMPLE'>('PROFESSIONAL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('1H');
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const primaryMarket = article.markets?.[0] || 'XAU/USD';

  // Story timeline mock for developing stories
  const timelineSteps = [
    { time: '08:30 UTC', label: 'Initial Wire Report', detail: 'Bureau releases preliminary monthly inflation print exceeding expectations.', source: article.source, type: 'INITIAL' },
    { time: '08:45 UTC', label: 'Official Statement', detail: 'Agency releases complete component breakdown showing energy and shelter stickiness.', source: 'Official Statistical Release', type: 'OFFICIAL' },
    { time: '09:15 UTC', label: 'Market Reaction', detail: `${primaryMarket} experiences initial repricing as 2-year sovereign yields shift.`, source: 'Institutional Wire', type: 'REACTION' },
    { time: '10:00 UTC', label: 'Desk Macro Analysis', detail: 'Economists revise terminal rate forecast probabilities upward.', source: 'Market Intelligence Desk', type: 'ANALYSIS' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto min-h-screen sm:min-h-0 sm:max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Navigation Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intelligence Center</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Simple vs Professional Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewLevel('SIMPLE')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewLevel === 'SIMPLE' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Simple
              </button>
              <button
                type="button"
                onClick={() => setViewLevel('PROFESSIONAL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  viewLevel === 'PROFESSIONAL' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500'
                }`}
              >
                Professional
              </button>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
          
          {/* Metadata Bar & Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {article.category}
            </span>

            {article.impact === 'HIGH' && (
              <span className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                <Zap className="w-3 h-3 text-rose-600" />
                High Impact
              </span>
            )}

            {article.isDevelopingStory && (
              <span className="px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Developing Wire
              </span>
            )}

            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{article.source}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Published: {new Date(article.publishedAt).toLocaleString()}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-400">Reading time: ~{article.readingTimeMinutes || 3} min</span>
          </div>

          {/* Headline & Sub-headline */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {article.headline}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium">
              Institutional breakdown of market ramifications, transmission channels, and related sovereign assets.
            </p>
          </div>

          {/* Hero Image (16:9) with graceful gradient fallback */}
          {article.imageUrl ? (
            <div className="relative aspect-16/9 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
              <img
                src={article.imageUrl}
                alt={article.headline}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 text-[11px] text-white/80 font-mono">
                Source: {article.source} • Verified Intelligence Archive
              </div>
            </div>
          ) : (
            <div className="h-44 rounded-3xl bg-linear-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-slate-800 flex items-center justify-center text-slate-400 text-xs">
              <div className="text-center space-y-1">
                <BarChart2 className="w-8 h-8 text-blue-400 mx-auto" />
                <span className="block font-bold text-white text-sm">Market Intelligence Dossier</span>
                <span className="text-slate-400 text-[11px]">{article.source} Wire Archive</span>
              </div>
            </div>
          )}

          {/* FEATURE 26: FACT VS ANALYSIS VISUAL SYSTEM */}
          {/* 1. Key Facts Box (Solid Blue Border) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-l-blue-600 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                KEY VERIFIED FACTS (FACT)
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Officially Reported
              </span>
            </div>

            <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {article.confirmedFacts && article.confirmedFacts.length > 0 ? (
                article.confirmedFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>Reported data release published via official wire distribution network.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span>Headline prints verified against sovereign database disclosures.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* 2. Professional Analysis (Solid Purple Border) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border-l-4 border-l-purple-600 border border-purple-200 dark:border-purple-900/60 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
              INSTITUTIONAL TRANSMISSION ANALYSIS (ANALYSIS)
            </span>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {viewLevel === 'PROFESSIONAL' ? (
                article.summary
              ) : (
                `Simplified Explanation: The news reported today tells us how inflation and economic conditions are shifting. Higher inflation usually makes central banks keep interest rates elevated, which directly affects the US Dollar, Gold prices, and loan costs.`
              )}
            </p>
          </div>

          {/* 3. Market Hypothesis (Dashed Orange Border with Alert) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-l-4 border-dashed border-l-amber-500 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>MARKET HYPOTHESIS & POTENTIAL CATALYSTS (HYPOTHESIS ⚠)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {viewLevel === 'PROFESSIONAL' ? (
                <>Market participants <em>may</em> adjust policy pricing ahead of the next FOMC meeting. Cross-asset volatility <em>could</em> remain elevated in front-end rate contracts and bullion spot spreads.</>
              ) : (
                <>Traders believe prices <em>might</em> fluctuate over the next few sessions. Always verify trade risk and position size.</>
              )}
            </p>
          </div>

          {/* Related Markets Instruments */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Markets Directly Involved & Monitored:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {article.markets?.map(m => (
                <div key={m} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono">{m}</span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Observed Reaction
                  </span>
                </div>
              )) || (
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                  Macro Sovereign Instrument
                </div>
              )}
            </div>
          </div>

          {/* FEATURE 4 & 7: Integrated Asset Price Chart with Event Marker */}
          <div className="p-5 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                  LIVE BENCHMARK REACTION CHART
                </span>
                <h3 className="text-sm font-bold text-white">
                  {primaryMarket} • Price Action Transmission
                </h3>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
                {(['1m', '5m', '15m', '1H', '4H', '1D'] as const).map(tf => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                      selectedTimeframe === tf ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Chart with Vertical Dashed Event Marker */}
            <div className="relative h-44 w-full bg-slate-950/60 rounded-2xl border border-slate-800/80 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Before Event (-0.3%)</span>
                <span className="text-emerald-400 font-bold">After Event (+0.84%)</span>
              </div>

              {/* Chart SVG Line */}
              <div className="relative h-24 w-full">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                  <defs>
                    <linearGradient id="deepDiveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Fill Area */}
                  <path
                    d="M 0,35 Q 25,38 50,30 T 75,15 T 100,8 L 100,50 L 0,50 Z"
                    fill="url(#deepDiveGrad)"
                  />
                  {/* Line */}
                  <path
                    d="M 0,35 Q 25,38 50,30 T 75,15 T 100,8"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                  />
                </svg>

                {/* Vertical Dashed Event Marker */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0 border-r-2 border-dashed border-amber-400 z-10">
                  <div className="absolute top-0 left-1 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                    News Published
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>-60m</span>
                <span className="text-amber-400 font-bold">T-0 (Release)</span>
                <span>+60m</span>
              </div>
            </div>
          </div>

          {/* FEATURE 18: Story Timeline for Developing Stories */}
          {article.isDevelopingStory && (
            <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-750 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Developing Story Chronological Timeline
                </span>
                <span className="text-[11px] text-slate-400">4 Wire Dispatches</span>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-y-2 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-2 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-850" />
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-[11px]">
                          {step.time}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {step.label}
                        </span>
                        <span className="text-[10px] text-slate-400">({step.source})</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uncertainty & Limitations Banner */}
          <div className="p-4 bg-slate-100 dark:bg-slate-850/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block text-slate-700 dark:text-slate-300">Empirical Research Notice:</strong>
              <span>
                This analysis is based on available data feeds and historical observations. Market outcomes remain uncertain and subject to evolving liquidity conditions.
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {/* Ask AI */}
            <button
              type="button"
              onClick={() => onOpenAi?.(article)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-600/20 active:scale-95 cursor-pointer transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI About This</span>
            </button>

            {/* Note */}
            <button
              type="button"
              onClick={() => onOpenNote?.(article)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Private Note</span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={() => onBookmarkToggle?.(article.id)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-500 text-white border-amber-500' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 text-xs font-bold transition-all cursor-pointer"
              title="Share article link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Analyze My Trades */}
            {onNavigateToAnalytics && (
              <button
                type="button"
                onClick={() => onNavigateToAnalytics(primaryMarket)}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Analyze My Trades Around This</span>
              </button>
            )}

            {/* Read Original */}
            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Read Original at {article.source}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
