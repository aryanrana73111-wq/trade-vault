import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  HelpCircle, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp,
  Globe2
} from 'lucide-react';
import { MarketNewsArticle, NewsEvent } from '@/types/newsIntelligence';
import { generateAINewsAnalysis } from '@/services/news/newsProviders';
import { AINewsAnalystResponse } from '@/types/newsModes';

interface AiNewsAnalystModalProps {
  article?: MarketNewsArticle | null;
  event?: NewsEvent | null;
  onClose: () => void;
}

const PRESET_QUERIES = [
  'What happened?',
  'Why does this matter?',
  'Which markets are related?',
  'What was the historical reaction?',
  'How does this relate to gold?',
  'Summarize this in simple Hindi',
  'Explain this like a professional trading teacher'
];

export function AiNewsAnalystModal({
  article,
  event,
  onClose
}: AiNewsAnalystModalProps) {
  const [activeQuery, setActiveQuery] = useState<string>('What happened?');
  const [customInput, setCustomInput] = useState<string>('');
  const [analysis, setAnalysis] = useState<AINewsAnalystResponse>(() => 
    generateAINewsAnalysis('What happened?', article, event)
  );

  const handleRunQuery = (queryText: string) => {
    if (!queryText.trim()) return;
    setActiveQuery(queryText);
    const result = generateAINewsAnalysis(queryText, article, event);
    setAnalysis(result);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleRunQuery(customInput.trim());
    setCustomInput('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-linear-to-r from-blue-50/80 via-white to-indigo-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  TradeVault AI News Analyst
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Evidence-First
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Objective empirical analysis grounded in official agency data & verified wire briefs
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

        {/* Current Active Context Indicator */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div className="truncate flex items-center gap-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200">Analyzing Context:</span>
            <span className="truncate">{article?.headline || event?.name || 'US Macro & Economic News'}</span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">
            Source: {analysis.source}
          </span>
        </div>

        {/* Quick Query Selector Pills */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {PRESET_QUERIES.map(q => {
              const isActive = activeQuery === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleRunQuery(q)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>

        {/* Structured Analysis Response Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-slate-50/50 dark:bg-slate-950/30">
          
          {/* Active Query Title */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Query: &ldquo;{analysis.query}&rdquo;
            </span>
            <span className="text-slate-400 text-[11px]">
              Generated at {analysis.timestamp}
            </span>
          </div>

          {/* Section 1: WHAT HAPPENED */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              WHAT HAPPENED
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {analysis.whatHappened}
            </p>
          </div>

          {/* Section 2: WHY IT MATTERS */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              WHY IT MATTERS
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {analysis.whyItMatters}
            </p>
          </div>

          {/* Section 3 & 4: MARKETS INVOLVED & CURRENT MARKET REACTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                MARKETS INVOLVED
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.marketsInvolved.map(m => (
                  <span key={m} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                CURRENT MARKET REACTION
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {analysis.currentMarketReaction}
              </p>
            </div>
          </div>

          {/* Section 5: HISTORICAL CONTEXT */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              HISTORICAL CONTEXT
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {analysis.historicalContext}
            </p>
          </div>

          {/* Section 6 & 7: EVIDENCE vs UNCERTAINTY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                CONFIRMED EVIDENCE
              </h4>
              <ul className="space-y-1.5">
                {analysis.evidence.map((ev, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                UNCERTAINTY & LIMITATIONS
              </h4>
              <ul className="space-y-1.5">
                {analysis.uncertainty.map((un, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{un}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Section 8: WHAT TO WATCH */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              WHAT TO WATCH NEXT
            </h4>
            <ul className="space-y-1.5">
              {analysis.whatToWatch.map((w, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Source Attribution & Anti-Hallucination Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Source: <strong className="text-slate-700 dark:text-slate-200">{analysis.source}</strong>
            </span>
            <span className="text-slate-400 italic">
              Strictly non-advisory • Deterministic factual synthesis
            </span>
          </div>

        </div>

        {/* Custom Input Bar at Bottom */}
        <form onSubmit={handleCustomSubmit} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask a specific question (e.g., 'How does this affect USD/JPY?', 'Summarize in simple Hindi')..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 active:scale-95"
          >
            <span>Analyze</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
