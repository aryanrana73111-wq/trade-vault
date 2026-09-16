import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Plus, 
  Calculator, 
  Brain, 
  Layers, 
  BookOpen, 
  LineChart, 
  FlaskConical, 
  Sparkles,
  Info,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Lesson, AcademyConcept, CurriculumConcept } from '@/types/academy';
import { useData } from '@/contexts/DataContext';
import { 
  getJournalEmpiricalSummary, 
  getPsychologyEmpiricalSummary,
  generateRuleFromLesson,
  generateRuleFromConcept,
  generateStrategyTemplateFromLesson,
  generateTradePrefillFromLesson,
  generateRiskCalculatorPrefillFromLesson
} from '@/lib/academy/ecosystemBridge';

interface AcademyEcosystemBridgeProps {
  lesson?: Lesson;
  concept?: AcademyConcept | CurriculumConcept;
  className?: string;
  showAllWorkflows?: boolean;
}

export const AcademyEcosystemBridge: React.FC<AcademyEcosystemBridgeProps> = ({
  lesson,
  concept,
  className = '',
  showAllWorkflows = true
}) => {
  const navigate = useNavigate();
  const { trades, saveRule, saveLearning } = useData();

  const [ruleSaved, setRuleSaved] = useState(false);
  const [learningSaved, setLearningSaved] = useState(false);
  const [savingRuleLoading, setSavingRuleLoading] = useState(false);
  const [savingLearningLoading, setSavingLearningLoading] = useState(false);
  const [showRuleConfirmModal, setShowRuleConfirmModal] = useState(false);

  // Compute empirical real statistics
  const journalStats = getJournalEmpiricalSummary(trades);
  const psychologyStats = getPsychologyEmpiricalSummary(trades);

  const isPsychologyDomain = 
    (lesson && lesson.domain === 'Trading Psychology') || 
    (concept && 'category' in concept && (concept as any).category === 'PSYCHOLOGY & DISCIPLINE');

  const isRiskDomain = 
    (lesson && (lesson.domain === 'Risk Management' || lesson.domain === 'Quantitative Analysis')) || 
    (concept && 'category' in concept && (concept as any).category === 'RISK & CAPITAL PRESERVATION');

  const isStrategyDomain = 
    (lesson && (lesson.domain === 'Technical Analysis' || lesson.level === 4 || lesson.id.includes('strategy'))) ||
    (concept && 'category' in concept && (concept as any).category === 'STRATEGY ENGINEERING');

  const isExecutionDomain = 
    (lesson && (lesson.domain === 'Execution' || lesson.domain === 'Professional Practice')) || 
    (concept && 'category' in concept && (concept as any).category === 'ORDER FLOW & MICROSTRUCTURE');

  // Generate payload for rule
  const rulePayload = lesson 
    ? generateRuleFromLesson(lesson) 
    : concept 
      ? generateRuleFromConcept(concept) 
      : null;

  // Handle direct creation of a Trading Rule from Academy Learning
  const handleCreateRuleDirect = async () => {
    if (!rulePayload) return;
    setSavingRuleLoading(true);
    try {
      await saveRule({
        text: rulePayload.text,
        category: rulePayload.category,
        priority: rulePayload.priority,
        status: 'Active',
        isPinned: false,
        order: 0
      });
      setRuleSaved(true);
      setShowRuleConfirmModal(false);
      setTimeout(() => setRuleSaved(false), 4000);
    } catch (err) {
      console.error('Failed to create rule from Academy lesson:', err);
    } finally {
      setSavingRuleLoading(false);
    }
  };

  // Handle saving lesson key takeaway as a Learning Entry
  const handleSaveToLearnings = async () => {
    if (!lesson && !concept) return;
    setSavingLearningLoading(true);
    try {
      const title = lesson?.title || concept?.title || 'Academy Principle';
      const takeaway = lesson?.description || (concept as any)?.summary || 'Key principle learned in TradeVault Academy.';
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      await saveLearning({
        date: Date.now(),
        dateString,
        content: `[Academy Lesson: ${title}] ${takeaway}`,
        category: isRiskDomain ? 'Risk Management' : isPsychologyDomain ? 'Psychology' : 'Strategy',
        tags: ['TradeVault Academy', lesson?.domain || 'Curriculum']
      });
      setLearningSaved(true);
      setTimeout(() => setLearningSaved(false), 4000);
    } catch (err) {
      console.error('Failed to save learning entry:', err);
    } finally {
      setSavingLearningLoading(false);
    }
  };

  // Workflow: Academy Learning -> Strategy
  const handleOpenStrategy = () => {
    if (lesson) {
      const template = generateStrategyTemplateFromLesson(lesson);
      navigate('/strategies/create', { state: { strategyTemplate: template } });
    } else {
      navigate('/strategies');
    }
  };

  // Workflow: Academy Learning -> Trade (Practice Execution)
  const handleAddTrade = () => {
    if (lesson) {
      const prefill = generateTradePrefillFromLesson(lesson);
      navigate('/add', { state: { prefill, academySource: lesson.title } });
    } else {
      navigate('/add');
    }
  };

  // Workflow: Academy Learning -> Risk Calculator
  const handleOpenRiskCalculator = () => {
    if (lesson) {
      const prefill = generateRiskCalculatorPrefillFromLesson(lesson);
      navigate('/calculator', { state: { prefill, fromAcademy: true } });
    } else {
      navigate('/calculator');
    }
  };

  // Workflow: Academy Learning -> Psychology
  const handleOpenPsychology = () => {
    navigate('/psychology');
  };

  return (
    <div className={`space-y-4 my-5 ${className}`}>
      {/* 1. Real User Journal Empirical Benchmarks */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                  Ecosystem Integration
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  Single Source of Truth
                </span>
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                {isPsychologyDomain ? 'Behavioral & Psychological Data' : 'Empirical Performance Validation'}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
              journalStats.hasEnoughData 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
                : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
            }`}>
              {isPsychologyDomain 
                ? psychologyStats.statusLabel 
                : journalStats.statusLabel}
            </span>
          </div>
        </div>

        {/* Dynamic Empirical Statement */}
        <div className="pt-3">
          {isPsychologyDomain ? (
            psychologyStats.hasEnoughData ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {psychologyStats.statement}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Emotion</span>
                    <p className="text-sm font-bold text-blue-300 mt-0.5">{psychologyStats.topEmotion}</p>
                    <span className="text-[10px] text-slate-400">{psychologyStats.topEmotionCount} trades logged</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Frequency Share</span>
                    <p className="text-sm font-bold text-white mt-0.5">{psychologyStats.topEmotionPct}%</p>
                    <span className="text-[10px] text-slate-400">Of tagged trades</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate Under Emotion</span>
                    <p className={`text-sm font-bold mt-0.5 ${
                      psychologyStats.emotionalWinRate !== null && psychologyStats.emotionalWinRate >= 50 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {psychologyStats.emotionalWinRate !== null ? `${psychologyStats.emotionalWinRate}%` : 'N/A'}
                    </p>
                    <span className="text-[10px] text-slate-400">Empirical win rate</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Not enough data yet.</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    {psychologyStats.subtext} Never invent fake personal biases.
                  </p>
                </div>
              </div>
            )
          ) : (
            journalStats.hasEnoughData ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {journalStats.statement}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Your Win Rate</span>
                    <p className="text-sm font-bold text-white mt-0.5">{journalStats.winRate}%</p>
                    <span className="text-[10px] text-slate-400">{journalStats.totalTrades} closed trades</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Value</span>
                    <p className={`text-sm font-bold mt-0.5 ${journalStats.expectedValueR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {journalStats.expectedValueR >= 0 ? '+' : ''}{journalStats.expectedValueR} R
                    </p>
                    <span className="text-[10px] text-slate-400">Average R per trade</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Payoff Ratio</span>
                    <p className="text-sm font-bold text-white mt-0.5">{journalStats.payoffRatio}:1</p>
                    <span className="text-[10px] text-slate-400">Win {journalStats.avgWinR}R / Loss {journalStats.avgLossR}R</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Peak Drawdown</span>
                    <p className="text-sm font-bold text-rose-400 mt-0.5">{journalStats.maxDrawdownPct}%</p>
                    <span className="text-[10px] text-slate-400">Max historical</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-200/90">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Not enough data yet.</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    {journalStats.subtext}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* 2. Interactive Ecosystem Workflows */}
      {showAllWorkflows && (
        <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Apply This Lesson In TradeVault
            </h5>
            <span className="text-[10px] text-slate-400">Direct Ecosystem Workflows</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* WORKFLOW 1: Academy Learning -> Rule */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Create Trading Rule
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  {rulePayload?.text || 'Enforce this principle as an active rule in your Trading Rules database.'}
                </p>
              </div>

              {ruleSaved ? (
                <div className="py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Rule Saved to Account!</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRuleConfirmModal(true)}
                  disabled={savingRuleLoading}
                  className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add as Trading Rule</span>
                </button>
              )}
            </div>

            {/* WORKFLOW 2: Academy Learning -> Strategy */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Open in Strategies
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  Convert this lesson into a structured institutional strategy with entry, exit, and risk rules.
                </p>
              </div>

              <button
                onClick={handleOpenStrategy}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{lesson ? 'Create Strategy' : 'Open Strategies'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WORKFLOW 3: Academy Learning -> Risk Calculator */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Calculator className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Practice in Risk Calculator
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  Validate invariant 1% risk sizing and stop-loss distance calculations in the live calculator.
                </p>
              </div>

              <button
                onClick={handleOpenRiskCalculator}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WORKFLOW 4: Academy Learning -> Psychology */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Open Psychology
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  Audit your real emotional triggers, FOMO tendencies, and discipline streaks in the Psychology Matrix.
                </p>
              </div>

              <button
                onClick={handleOpenPsychology}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Psychology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WORKFLOW 5: Academy Learning -> Trade (Practice Execution) */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Add Trade (Execution Drill)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  Log a live execution drill applying this lesson's checklist without creating duplicate entries.
                </p>
              </div>

              <button
                onClick={handleAddTrade}
                className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Add Trade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* WORKFLOW 6: Save to Daily Learning Journal */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-2 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Save to My Learnings
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                  Commit this key pedagogical takeaway to your permanent TradeVault Learning Journal.
                </p>
              </div>

              {learningSaved ? (
                <div className="py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Learnings!</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveToLearnings}
                  disabled={savingLearningLoading}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save to Learnings</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Rule Creation */}
      {showRuleConfirmModal && rulePayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Confirm Trading Rule Creation
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will add a new verified rule to your active TradeVault rules database with the following parameters:
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Rule Content:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">{rulePayload.text}</p>
              </div>
              <div className="flex gap-4 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Category:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">{rulePayload.category}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Priority:</span>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">{rulePayload.priority}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRuleConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRuleDirect}
                disabled={savingRuleLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs flex items-center gap-1.5"
              >
                {savingRuleLoading ? 'Saving...' : 'Save to Trading Rules'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
