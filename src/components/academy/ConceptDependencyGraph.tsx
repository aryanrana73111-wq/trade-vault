import React, { useState, useMemo } from 'react';
import { 
  GitFork, 
  Lock, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowRight, 
  ChevronRight, 
  ShieldCheck, 
  Layers, 
  Info,
  Sparkles,
  Play
} from 'lucide-react';
import { CurriculumConcept, CurriculumCategory, ConceptStatus } from '@/types/academy';
import { CurriculumRegistry, ALL_CURRICULUM_CATEGORIES, CATEGORY_METADATA } from '@/data/academy/registry';
import { useAcademy } from '@/contexts/AcademyContext';

interface ConceptDependencyGraphProps {
  onSelectConcept: (concept: CurriculumConcept) => void;
  onLockedConceptClick: (concept: CurriculumConcept) => void;
}

export const ConceptDependencyGraph: React.FC<ConceptDependencyGraphProps> = ({
  onSelectConcept,
  onLockedConceptClick
}) => {
  const { progress } = useAcademy();
  const [selectedLevel, setSelectedLevel] = useState<number | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<CurriculumCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'matrix' | 'tree'>('matrix');

  const completedSet = useMemo(() => new Set([
    ...progress.completedLessons,
    ...progress.masteredConcepts
  ]), [progress.completedLessons, progress.masteredConcepts]);

  const dependencyGraph = useMemo(() => {
    return CurriculumRegistry.getDependencyGraph(Array.from(completedSet));
  }, [completedSet]);

  const allConcepts = useMemo(() => CurriculumRegistry.getAllConcepts(), []);

  // Filter concepts based on controls
  const filteredConcepts = useMemo(() => {
    return allConcepts.filter(concept => {
      if (selectedLevel !== 'ALL' && concept.level !== selectedLevel) return false;
      if (selectedCategory !== 'ALL' && concept.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          concept.title.toLowerCase().includes(q) ||
          concept.category.toLowerCase().includes(q) ||
          concept.simpleExplanation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allConcepts, selectedLevel, selectedCategory, searchQuery]);

  // Group concepts by level (0 to 10)
  const conceptsByLevel = useMemo(() => {
    const map = new Map<number, CurriculumConcept[]>();
    for (let i = 0; i <= 10; i++) {
      map.set(i, []);
    }
    filteredConcepts.forEach(c => {
      const arr = map.get(c.level) || [];
      arr.push(c);
      map.set(c.level, arr);
    });
    return map;
  }, [filteredConcepts]);

  // Summary counts
  const stats = useMemo(() => {
    let completed = 0;
    let unlocked = 0;
    let locked = 0;

    allConcepts.forEach(c => {
      const status = CurriculumRegistry.getConceptStatus(c.id, Array.from(completedSet));
      if (status === 'completed') completed++;
      else if (status === 'locked') locked++;
      else unlocked++;
    });

    return { completed, unlocked, locked, total: allConcepts.length };
  }, [allConcepts, completedSet]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <GitFork className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Concept Dependency Graph
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Deterministic prerequisite progression from Level 0 to Level 10 across 15 financial disciplines.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">
                COMPLETED
              </span>
              <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                {stats.completed}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-center">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 block">
                READY
              </span>
              <span className="text-sm font-black text-blue-800 dark:text-blue-200">
                {stats.unlocked}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-center">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 block">
                LOCKED
              </span>
              <span className="text-sm font-black text-amber-800 dark:text-amber-200">
                {stats.locked}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search concepts, formulas, mechanics..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Level Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedLevel}
              onChange={e => setSelectedLevel(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="ALL">All Levels (0 → 10)</option>
              {Array.from({ length: 11 }).map((_, i) => (
                <option key={i} value={i}>Level {i}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value as any)}
              className="w-full py-2 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
            >
              <option value="ALL">All 15 Curriculum Categories</option>
              {ALL_CURRICULUM_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Mastered / Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Ready to Learn (Prerequisites Met)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Locked (Prerequisites Incomplete)</span>
          </div>
        </div>
      </div>

      {/* Main Graph Grid by Level */}
      <div className="space-y-6">
        {Array.from({ length: 11 }).map((_, level) => {
          const concepts = conceptsByLevel.get(level) || [];
          if (concepts.length === 0) return null;

          return (
            <div key={level} className="space-y-3">
              {/* Level Heading */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black">
                    LEVEL {level}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {concepts.length} {concepts.length === 1 ? 'Concept' : 'Concepts'}
                  </span>
                </div>
              </div>

              {/* Concepts Grid for this Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {concepts.map(concept => {
                  const status = CurriculumRegistry.getConceptStatus(
                    concept.id,
                    Array.from(completedSet)
                  );
                  const isCompleted = status === 'completed';
                  const isLocked = status === 'locked';
                  const missingPrereqs = CurriculumRegistry.getMissingPrerequisites(
                    concept.id,
                    Array.from(completedSet)
                  );
                  const categoryMeta = CATEGORY_METADATA[concept.category] || {
                    label: concept.category,
                    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
                    badgeText: 'text-blue-700 dark:text-blue-300',
                    badgeBorder: 'border-blue-200 dark:border-blue-900'
                  };

                  return (
                    <div
                      key={concept.id}
                      onClick={() => {
                        if (isLocked) {
                          onLockedConceptClick(concept);
                        } else {
                          onSelectConcept(concept);
                        }
                      }}
                      className={`group p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/60 hover:shadow-md'
                          : isLocked
                          ? 'bg-slate-50/80 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-amber-300 dark:hover:border-amber-700'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${categoryMeta.badgeBg} ${categoryMeta.badgeText} ${categoryMeta.badgeBorder}`}>
                            {categoryMeta.label}
                          </span>

                          <div className="flex items-center gap-1">
                            {isCompleted ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" />
                                Mastered
                              </span>
                            ) : isLocked ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                <Lock className="w-3 h-3" />
                                Locked
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                <Play className="w-2.5 h-2.5 fill-current" />
                                Ready
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Concept Title */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {concept.title}
                        </h4>

                        {/* Brief explanation snippet */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {concept.simpleExplanation}
                        </p>
                      </div>

                      {/* Bottom Prerequisites / Action Row */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <GitFork className="w-3 h-3" />
                          <span>
                            {concept.prerequisites.length === 0 
                              ? 'Foundational' 
                              : `${concept.prerequisites.length} prereq${concept.prerequisites.length > 1 ? 's' : ''}`}
                          </span>
                        </div>

                        {isLocked ? (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                            Needs {missingPrereqs.length} prereq{missingPrereqs.length > 1 ? 's' : ''}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            {isCompleted ? 'Review' : 'Start'}
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
