import React from 'react';
import { Lock, X, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CurriculumConcept } from '@/types/academy';
import { CurriculumRegistry } from '@/data/academy/registry';
import { useAcademy } from '@/contexts/AcademyContext';

interface LockedPrerequisiteModalProps {
  concept: CurriculumConcept | null;
  onClose: () => void;
  onSelectPrerequisite: (prereq: CurriculumConcept) => void;
}

export const LockedPrerequisiteModal: React.FC<LockedPrerequisiteModalProps> = ({
  concept,
  onClose,
  onSelectPrerequisite
}) => {
  const { progress } = useAcademy();

  if (!concept) return null;

  const completedSet = new Set([
    ...progress.completedLessons,
    ...progress.masteredConcepts
  ]);

  const missingPrereqs = CurriculumRegistry.getMissingPrerequisites(
    concept.id,
    Array.from(completedSet)
  );

  const allPrereqs = concept.prerequisites
    .map(id => CurriculumRegistry.getConceptById(id))
    .filter((c): c is CurriculumConcept => c !== undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 bg-amber-50/60 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                  Prerequisite Locked
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Level {concept.level}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {concept.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              To protect mathematical understanding and prevent catastrophic trading errors, this concept requires foundational mastery of preceding curriculum topics first.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Required Prerequisites ({allPrereqs.length})
            </h4>

            <div className="space-y-2">
              {allPrereqs.map(prereq => {
                const isDone = completedSet.has(prereq.id);
                return (
                  <div
                    key={prereq.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isDone
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400">
                            Level {prereq.level} • {prereq.category}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {prereq.title}
                        </p>
                      </div>
                    </div>

                    {!isDone && (
                      <button
                        onClick={() => {
                          onSelectPrerequisite(prereq);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <span>Learn</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
