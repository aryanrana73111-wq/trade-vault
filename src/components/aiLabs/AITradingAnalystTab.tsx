import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Calendar, 
  Sparkles, 
  HelpCircle, 
  Eye, 
  Brain, 
  ShieldAlert, 
  Target, 
  Sliders, 
  Search, 
  RefreshCw,
  Send,
  MessageSquare,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Trade } from '@/types';
import { 
  AIObservation, 
  AnalysisDateRange, 
  DataAccessPermissions, 
  FocusArea, 
  AIMode, 
  PeriodComparison,
  ShowMeWhyDetails,
  AIAnswerResponse
} from '@/types/aiLabs';
import { 
  getEvidenceLevel, 
  getEvidenceLevelBadge, 
  computePeriodComparison, 
  generateAIObservations,
  auditDataQuality,
  answerTradingQuestion
} from '@/lib/aiLabs/engine';
import { Button } from '@/components/ui/Button';

interface AITradingAnalystTabProps {
  trades: Trade[];
  dateRange: AnalysisDateRange;
  setDateRange: (r: AnalysisDateRange) => void;
  permissions: DataAccessPermissions;
  mode: AIMode;
  setMode: (m: AIMode) => void;
  lastAnalyzedAt: Date;
  onRefreshAnalysis: () => void;
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
  onOpenShowMeWhy: (title: string, details: ShowMeWhyDetails, tradeIds: string[]) => void;
}

export const AITradingAnalystTab: React.FC<AITradingAnalystTabProps> = ({
  trades,
  dateRange,
  setDateRange,
  permissions,
  mode,
  setMode,
  lastAnalyzedAt,
  onRefreshAnalysis,
  onOpenEvidence,
  onOpenShowMeWhy
}) => {
  const [selectedFocus, setSelectedFocus] = useState<FocusArea[]>([
    'risk', 'execution', 'psychology', 'strategy', 'consistency', 'rules'
  ]);
  const [questionInput, setQuestionInput] = useState('');
  const [activeAnswer, setActiveAnswer] = useState<AIAnswerResponse | null>(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

  // Compute period comparison
  const half = Math.floor(trades.length / 2);
  const currentTrades = trades.slice(0, half > 0 ? half : trades.length);
  const previousTrades = trades.slice(half);

  const comparison: PeriodComparison = computePeriodComparison(
    currentTrades, 
    previousTrades, 
    `Recent Period (${currentTrades.length} trades)`, 
    `Prior Period (${previousTrades.length} trades)`
  );

  const observations = generateAIObservations(
    currentTrades,
    previousTrades,
    permissions,
    selectedFocus,
    mode
  );

  const qualityAudit = auditDataQuality(trades);
  const overallEvidenceLevel = getEvidenceLevel(trades.length);
  const overallBadge = getEvidenceLevelBadge(overallEvidenceLevel);

  const toggleFocus = (area: FocusArea) => {
    setSelectedFocus(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleAskQuestion = (q: string) => {
    if (!q.trim()) return;
    setAskingQuestion(true);
    setQuestionInput(q);
    setTimeout(() => {
      const response = answerTradingQuestion(q, trades, permissions);
      setActiveAnswer(response);
      setAskingQuestion(false);
    }, 150);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. TOP METRIC SUMMARY BAR */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Trades Analyzed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{trades.length}</span>
            <span className="text-xs text-slate-400">records</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Date Range</span>
          <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100 mt-1 capitalize">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{dateRange === 'all' ? 'All Time' : dateRange}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Data Completeness</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{qualityAudit.overallScore}%</span>
            <span className="text-xs text-slate-400">audit</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Evidence Level</span>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${overallBadge.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${overallBadge.dotClass}`} />
              {overallBadge.label}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 md:col-span-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Last Analysis</span>
          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 mt-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{lastAnalyzedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* 2. CONTROLS: DATE RANGE, FOCUS AREAS, AI MODE */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" /> Analyst Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize date window, analytical focus, and depth of explanation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              {(['evidence', 'coach', 'research'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 rounded-md capitalize transition-all ${
                    mode === m
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {m} Mode
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshAnalysis}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze
            </Button>
          </div>
        </div>

        {/* Focus Area Chips */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Focus Areas:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'risk', label: 'Risk Management' },
              { id: 'execution', label: 'Execution Quality' },
              { id: 'psychology', label: 'Psychology' },
              { id: 'strategy', label: 'Strategy Usage' },
              { id: 'consistency', label: 'Consistency' },
              { id: 'rules', label: 'Rule Adherence' },
              { id: 'overtrading', label: 'Overtrading' },
            ].map(area => {
              const active = selectedFocus.includes(area.id as FocusArea);
              return (
                <button
                  key={area.id}
                  onClick={() => toggleFocus(area.id as FocusArea)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                    active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {area.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. “WHAT CHANGED?” COMPARISON ENGINE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              “What Changed?” Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparing {comparison.currentPeriodLabel} against {comparison.previousPeriodLabel}
            </p>
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-mono">
            {comparison.currentCount} vs {comparison.previousCount} trades
          </span>
        </div>

        {trades.length < 4 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Not enough recorded data yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              The "What Changed?" comparison engine requires at least 4 completed trades across sequential periods to analyze reliable statistical variations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Win Rate */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Win Rate</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {comparison.winRate.current.toFixed(1)}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                {comparison.winRate.delta >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +{comparison.winRate.delta.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> {comparison.winRate.delta.toFixed(1)}%
                  </span>
                )}
                <span className="text-slate-400 font-normal">vs prev</span>
              </div>
            </div>

            {/* Average R */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Average R</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {comparison.avgR.current.toFixed(2)}R
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                {comparison.avgR.delta >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5" /> +{comparison.avgR.delta.toFixed(2)}R
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" /> {comparison.avgR.delta.toFixed(2)}R
                  </span>
                )}
                <span className="text-slate-400 font-normal">vs prev</span>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Profit Factor</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {comparison.profitFactor.current.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                {comparison.profitFactor.delta >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{comparison.profitFactor.delta.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">
                    {comparison.profitFactor.delta.toFixed(2)}
                  </span>
                )}
                <span className="text-slate-400 font-normal">vs prev</span>
              </div>
            </div>

            {/* Average Risk % */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Avg Risk %</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {comparison.avgRiskPercent.current.toFixed(2)}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                <span className={`${comparison.avgRiskPercent.delta > 0.3 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {comparison.avgRiskPercent.delta >= 0 ? '+' : ''}{comparison.avgRiskPercent.delta.toFixed(2)}%
                </span>
                <span className="text-slate-400 font-normal">vs prev</span>
              </div>
            </div>

            {/* Rule Adherence */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Rule Adherence</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {comparison.ruleAdherence.current.toFixed(0)}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                {comparison.ruleAdherence.delta >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{comparison.ruleAdherence.delta.toFixed(0)}%
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">
                    {comparison.ruleAdherence.delta.toFixed(0)}%
                  </span>
                )}
                <span className="text-slate-400 font-normal">vs prev</span>
              </div>
            </div>

            {/* FOMO Frequency */}
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">FOMO Rate</span>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {comparison.fomoFrequency.current.toFixed(0)}%
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold mt-1">
                <span className={`${comparison.fomoFrequency.delta > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {comparison.fomoFrequency.delta >= 0 ? '+' : ''}{comparison.fomoFrequency.delta.toFixed(0)}%
                </span>
                <span className="text-slate-400 font-normal">vs prev</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. STRUCTURED AI OBSERVATION CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Structured Observations
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {observations.length} pattern{observations.length === 1 ? '' : 's'} identified
          </span>
        </div>

        {observations.length === 0 ? (
          <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No abnormal behavior detected</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your recent trades show stable risk parameters and consistent execution compared to historical baselines.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {observations.map(obs => {
              const badge = getEvidenceLevelBadge(obs.evidenceLevel);
              return (
                <div
                  key={obs.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Top Row: Title + Evidence Level */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                          {obs.category}
                        </span>
                        <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{obs.title}</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badgeClass} flex-shrink-0 flex items-center gap-1`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                        {badge.label.split(' ')[0]} {badge.label.split(' ')[1]}
                      </span>
                    </div>

                    {/* Observation text */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {obs.observation}
                    </p>

                    {/* Evidence Box */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>Evidence:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{obs.evidence}</p>
                      <div className="text-[10px] text-slate-400 pt-1">
                        Sample: {obs.sampleSize.current} trades {obs.sampleSize.previous ? `vs ${obs.sampleSize.previous} prior` : ''} • {obs.dateRange}
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="space-y-2 mt-2">
                      {obs.possibleAlternatives && obs.possibleAlternatives.length > 0 && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">POSSIBLE EXPLANATION: </strong>
                          {obs.possibleAlternatives[0]}
                        </div>
                      )}
                      {obs.counterEvidence && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">COUNTER-EVIDENCE: </strong>
                          {obs.counterEvidence}
                        </div>
                      )}
                      {obs.limitation && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">LIMITATION: </strong>
                          {obs.limitation}
                        </div>
                      )}
                      {obs.nextTest && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <strong className="font-semibold text-slate-700 dark:text-slate-300">NEXT TEST: </strong>
                          {obs.nextTest}
                        </div>
                      )}
                    </div>

                    {/* Coach Mode Reflections if applicable */}
                    {mode === 'coach' && obs.coachQuestions && obs.coachQuestions.length > 0 && (
                      <div className="bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300">
                        <strong className="block mb-1 font-semibold flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Reflection Question:
                        </strong>
                        {obs.coachQuestions[0]}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenShowMeWhy(obs.title, obs.showMeWhy, obs.tradeIds)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" /> Show Me Why
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenEvidence(obs.title, obs.observation, obs.tradeIds, obs.highlightFields as string[])}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Evidence ({obs.tradeIds.length})
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. INTERACTIVE DATA-GROUNDED AI Q&A */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Query Your Trading Data
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask questions answered strictly using your recorded TradeVault records. No predictions or hallucinations.
          </p>
        </div>

        {/* Suggested Quick Questions */}
        <div className="flex flex-wrap gap-1.5">
          {[
            'What changed in my trading recently?',
            'How does FOMO compare with Calm in my recorded trades?',
            'Which sessions have the highest historical Avg R?',
            'When do I most often break my rules?',
            'Which strategies have the largest sample size?'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Question Form */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleAskQuestion(questionInput); }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask an analytical question about your trades..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button type="submit" size="sm" disabled={askingQuestion} className="flex items-center gap-1 text-xs">
            <Send className="w-3.5 h-3.5" /> Ask
          </Button>
        </form>

        {/* Answer Display */}
        {activeAnswer && (
          <div className="mt-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3 animate-in fade-in">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                ANSWER
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {activeAnswer.answer}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Evidence</span>
                <p className="text-slate-700 dark:text-slate-300">{activeAnswer.evidence}</p>
                <div className="text-[10px] text-slate-400 font-mono">Sample: {activeAnswer.sampleSize}</div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">Limitations</span>
                <p className="text-slate-600 dark:text-slate-400">{activeAnswer.limitations}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="text-slate-600 dark:text-slate-400">
                <strong className="font-semibold text-slate-800 dark:text-slate-200">Next Investigation: </strong>
                {activeAnswer.nextInvestigation}
              </div>

              {activeAnswer.relevantTradeIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenEvidence("Query Evidence", activeAnswer.answer, activeAnswer.relevantTradeIds)}
                  className="text-xs flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View {activeAnswer.relevantTradeIds.length} Trades
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
