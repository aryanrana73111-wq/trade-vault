import React, { useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  Lock, 
  ShieldAlert, 
  HelpCircle, 
  FileText, 
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { AcademyConcept, Lesson, CurriculumConcept } from '@/types/academy';
import { useAcademy } from '@/contexts/AcademyContext';
import { CurriculumRegistry, CATEGORY_METADATA } from '@/data/academy/registry';
import { ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { getVisualizerById } from './artifacts/visualizerRegistry';
import { AcademyEcosystemBridge } from './AcademyEcosystemBridge';

interface ConceptViewModalProps {
  concept: AcademyConcept | CurriculumConcept | null;
  onClose: () => void;
  onOpenConnectedLesson?: (lesson: Lesson) => void;
  onSelectConcept?: (concept: CurriculumConcept) => void;
}

export const ConceptViewModal: React.FC<ConceptViewModalProps> = ({
  concept,
  onClose,
  onOpenConnectedLesson,
  onSelectConcept
}) => {
  const { progress, toggleBookmark, markConceptMastered } = useAcademy();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Retrieve full structured concept from registry if available
  const richConcept: CurriculumConcept | undefined = concept
    ? (('category' in concept && 'examples' in concept) 
      ? (concept as CurriculumConcept)
      : CurriculumRegistry.getConceptById(concept.id))
    : undefined;

  const visualizer = useMemo(() => {
    if (!concept) return undefined;
    const artifactType = richConcept?.artifacts?.[0]?.type;
    if (artifactType) {
      const match = getVisualizerById(artifactType);
      if (match) return match;
    }
    const cId = concept.id.toLowerCase();
    if (cId.includes('position-sizing') || cId.includes('risk-invariance')) return getVisualizerById('risk-invariance-diagram');
    if (cId.includes('drawdown') || cId.includes('ruin')) return getVisualizerById('underwater-drawdown-curve');
    if (cId.includes('expectancy') || cId.includes('edge')) return getVisualizerById('system-equity-curve');
    if (cId.includes('market-structure') || cId.includes('swing')) return getVisualizerById('market-structure-diagram');
    if (cId.includes('order-book') || cId.includes('level-2')) return getVisualizerById('level-2-order-book');
    if (cId.includes('bid-ask') || cId.includes('spread') || cId.includes('slippage')) return getVisualizerById('bid-ask-friction-visualizer');
    if (cId.includes('option') || cId.includes('derivative') || cId.includes('convex')) return getVisualizerById('options-payoff-diagram');
    if (cId.includes('portfolio') || cId.includes('allocation') || cId.includes('asset-class')) return getVisualizerById('portfolio-circle-chart');
    if (cId.includes('probability') || cId.includes('normal-distribution') || cId.includes('kurtosis')) return getVisualizerById('probability-distribution');
    if (cId.includes('compound') || cId.includes('reinvest')) return getVisualizerById('compounding-growth-curve');
    if (cId.includes('correlation') || cId.includes('diversif')) return getVisualizerById('cross-correlation-chart');
    if (cId.includes('shock') || cId.includes('crisis') || cId.includes('flash-crash')) return getVisualizerById('market-shocks-timeline');
    if (cId.includes('decision') || cId.includes('systematic-rule')) return getVisualizerById('execution-decision-tree');
    return undefined;
  }, [concept, richConcept]);

  if (!concept) return null;

  const completedSet = new Set([
    ...progress.completedLessons,
    ...progress.masteredConcepts
  ]);

  const isBookmarked = progress.bookmarkedConcepts.includes(concept.id);
  const isMastered = completedSet.has(concept.id);
  const isPrereqMet = CurriculumRegistry.isPrerequisiteMet(concept.id, Array.from(completedSet));

  const category = richConcept?.category || 'TRADING FUNDAMENTALS';
  const categoryMeta = CATEGORY_METADATA[category] || {
    label: category,
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-900'
  };

  const connectedLesson = ACADEMY_LESSONS.find(l => l.id === concept.id);

  const primaryFormula = richConcept?.formulas?.[0];
  const formulaText = primaryFormula?.expression || ('formula' in concept ? concept.formula : undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-slate-850/70">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                LEVEL {concept.level}
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${categoryMeta.badgeBg} ${categoryMeta.badgeText} ${categoryMeta.badgeBorder}`}>
                {categoryMeta.label}
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                {concept.difficulty}
              </span>
              {isMastered && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Mastered
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {'title' in concept && concept.title ? concept.title : ('name' in concept ? concept.name : '')}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleBookmark('concept', concept.id)}
              className={`p-2.5 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                isBookmarked 
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Bookmark concept'}
              aria-label="Bookmark Concept"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close Concept Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Simple Explanation / Plain English */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] uppercase font-bold tracking-wider">
                Plain English Explanation
              </span>
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {richConcept?.simpleExplanation || ('shortDefinition' in concept ? concept.shortDefinition : '')}
            </p>
          </div>

          {/* Professional Institutional Definition */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-black tracking-wider">
                Institutional Definition & Mechanics
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {richConcept?.professionalDefinition || ('professionalDefinition' in concept ? concept.professionalDefinition : '')}
            </p>
          </div>

          {/* Formula Section */}
          {formulaText && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2">
              <span className="text-[10px] uppercase font-black text-emerald-800 dark:text-emerald-300 tracking-wider">
                Mathematical Invariant Formula
              </span>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/50 dark:border-emerald-900/40">
                <p className="font-mono text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  {formulaText}
                </p>
              </div>
              {primaryFormula?.variables && primaryFormula.variables.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {primaryFormula.variables.map(v => (
                    <div key={v.symbol} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{v.symbol}:</span>
                      <span>{v.meaning}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interactive Educational Visualization */}
          {visualizer && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase font-black tracking-wider">
                  Interactive Educational Visualization Lab
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {React.createElement(visualizer.component)}
              </div>
            </div>
          )}

          {/* Real Market Examples */}
          {richConcept?.examples && richConcept.examples.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Market Application & Scenario
              </span>
              <div className="space-y-2">
                {richConcept.examples.map((ex, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-amber-50/40 dark:bg-amber-950/15 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      {ex.scenario}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ex.analysis}
                    </p>
                    {ex.outcome && (
                      <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 pt-1 border-t border-amber-200/40 dark:border-amber-900/40">
                        Institutional Takeaway: {ex.outcome}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Case Studies */}
          {richConcept?.caseStudies && richConcept.caseStudies.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Historical Case Study
              </span>
              {richConcept.caseStudies.map((cs, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{cs.title}</h5>
                    {cs.era && <span className="text-[10px] text-slate-400 font-semibold">{cs.era}</span>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{cs.overview}</p>
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 pt-1">
                    Lesson: {cs.keyTakeaway}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Common Mistakes */}
          {richConcept?.commonMistakes && richConcept.commonMistakes.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-rose-500 dark:text-rose-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Common Fatal Mistakes
              </span>
              <ul className="space-y-1.5">
                {richConcept.commonMistakes.map((m, idx) => (
                  <li key={idx} className="p-2.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Real Journal Live Integration & Ecosystem Workflows */}
          <AcademyEcosystemBridge concept={concept} />

          {/* Prerequisites */}
          {richConcept?.prerequisites && richConcept.prerequisites.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Prerequisites ({richConcept.prerequisites.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {richConcept.prerequisites.map(pId => {
                  const prereq = CurriculumRegistry.getConceptById(pId);
                  const isDone = completedSet.has(pId);
                  return (
                    <div
                      key={pId}
                      onClick={() => prereq && onSelectConcept && onSelectConcept(prereq)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40' 
                          : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-blue-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {prereq?.title || pId}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => markConceptMastered(concept.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
              isMastered
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isMastered ? 'Concept Mastered' : 'Mark as Mastered'}</span>
          </button>

          {connectedLesson && onOpenConnectedLesson && (
            <button
              onClick={() => {
                onOpenConnectedLesson(connectedLesson);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Full Interactive Lesson</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
