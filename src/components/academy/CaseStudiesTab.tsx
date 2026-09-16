import React, { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  TrendingDown, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Play
} from 'lucide-react';
import { ACADEMY_CASE_STUDIES } from '@/data/academy/caseStudies';
import { CaseStudy } from '@/types/academy';
import { CaseStudyCard } from './components';
import { ScrollableTabs } from './ScrollableTabs';

export const CaseStudiesTab: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(ACADEMY_CASE_STUDIES[0].id);
  const [userDecisions, setUserDecisions] = useState<Record<string, string>>({});
  const [showConsequence, setShowConsequence] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'interactive' | 'grid'>('interactive');

  const activeCase = ACADEMY_CASE_STUDIES.find(c => c.id === selectedCaseId) || ACADEMY_CASE_STUDIES[0];
  const selectedChoiceId = userDecisions[activeCase.id];
  const isRevealed = showConsequence[activeCase.id];

  const handleSelectChoice = (choiceId: string) => {
    setUserDecisions(prev => ({ ...prev, [activeCase.id]: choiceId }));
  };

  const handleRevealOutcome = () => {
    setShowConsequence(prev => ({ ...prev, [activeCase.id]: true }));
  };

  const handleLaunchCase = (cs: CaseStudy) => {
    setSelectedCaseId(cs.id);
    setViewMode('interactive');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30">
                Institutional Post-Mortems
              </span>
              <span className="text-xs text-slate-400">Real Market History</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1.5">
              Historical Crisis & Decision Lab
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Step into the shoes of hedge fund risk officers during catastrophic market shocks. Make decisions under extreme uncertainty and examine the structural causes of institutional ruin.
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 self-start sm:self-center">
            <button
              onClick={() => setViewMode('interactive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'interactive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Decision Lab</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Cases ({ACADEMY_CASE_STUDIES.length})</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ACADEMY_CASE_STUDIES.map(cs => (
            <CaseStudyCard
              key={cs.id}
              caseStudy={cs}
              onSelect={handleLaunchCase}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Case Study Switcher via ScrollableTabs */}
          <div className="p-2 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <ScrollableTabs
              tabs={ACADEMY_CASE_STUDIES.map(cs => ({
                id: cs.id,
                label: cs.title.split('(')[0].trim(),
                icon: Building2,
                badge: cs.domain
              }))}
              activeTab={selectedCaseId}
              onTabChange={(id) => setSelectedCaseId(id)}
              ariaLabel="Institutional case studies"
            />
          </div>

      {/* Active Case Study Detail */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6">
        {/* Title & Metadata */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {activeCase.domain}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              Era: {activeCase.dateOrEra}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              Asset: {activeCase.marketAsset}
            </span>
          </div>

          <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {activeCase.title}
          </h3>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
            {activeCase.subtitle}
          </p>
        </div>

        {/* Narrative Context & Market Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Background Context & Leverage Setup
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeCase.context}
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              The Catalyst Shock & Crisis
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeCase.marketConditions}
            </p>
          </div>
        </div>

        {/* Available Intelligence */}
        <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2">
            Available Intelligence at Decision Time
          </h4>
          <ul className="space-y-1.5">
            {activeCase.availableInformation.map((info, i) => (
              <li key={i} className="text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* The Critical Decision Point */}
        <div className="p-5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Interactive Decision Crossroads
            </span>
            <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100 mt-1">
              {activeCase.decisionPoint}
            </h4>
          </div>

          <div className="space-y-2.5">
            {activeCase.choices.map(choice => {
              const isSelected = selectedChoiceId === choice.id;
              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice.id)}
                  disabled={isRevealed}
                  className={`w-full text-left p-4 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-600 text-amber-950 dark:text-amber-100 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                  }`}
                >
                  <p className="text-xs font-bold">{choice.label}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{choice.description}</p>
                </button>
              );
            })}
          </div>

          {!isRevealed ? (
            <button
              onClick={handleRevealOutcome}
              disabled={!selectedChoiceId}
              className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
                selectedChoiceId
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              Reveal Institutional Outcome & Consequences
            </button>
          ) : (
            /* Revealed Analysis */
            <div className="pt-4 border-t border-amber-200 dark:border-amber-800/80 space-y-4 animate-in fade-in duration-200">
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    What Actually Happened:
                  </h5>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeCase.consequencesSummary}
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-950 dark:text-blue-200 space-y-2">
                <span className="font-bold block">Institutional Risk Takeaway:</span>
                <p className="leading-relaxed">{activeCase.professionalAnalysis}</p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Core Lessons Learned
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeCase.lessonsLearned.map((lesson, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
};
