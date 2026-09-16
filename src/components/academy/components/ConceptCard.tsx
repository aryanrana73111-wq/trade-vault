import React from 'react';
import { Bookmark, Sparkles, Brain, ArrowRight } from 'lucide-react';
import { AcademyConcept } from '@/types/academy';

interface ConceptCardProps {
  concept: AcademyConcept;
  isBookmarked: boolean;
  onOpenConcept: (concept: AcademyConcept) => void;
  onToggleBookmark: (e: React.MouseEvent, conceptId: string) => void;
  className?: string;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  isBookmarked,
  onOpenConcept,
  onToggleBookmark,
  className = ''
}) => {
  return (
    <div
      onClick={() => onOpenConcept(concept)}
      className={`group p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 ${className}`}
    >
      {/* Header Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-900/50">
            L{concept.level}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {concept.domain}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {concept.difficulty}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(e, concept.id);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            isBookmarked
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark concept'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Concept Name & Definition */}
      <div>
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
          {concept.name}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {concept.shortDefinition || concept.summary || concept.professionalDefinition}
        </p>
      </div>

      {/* Formula or Institutional Insight Teaser */}
      {(concept.formula || concept.mathematicalFormula) && (
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 truncate">
          {concept.formula || concept.mathematicalFormula}
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <Brain className="w-3 h-3 text-indigo-500" />
          Core Concept
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Deconstruct</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
