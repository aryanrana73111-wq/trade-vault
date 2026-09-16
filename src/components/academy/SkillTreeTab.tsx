import React, { useState } from 'react';
import { 
  GitFork, 
  CheckCircle2, 
  Lock, 
  Brain, 
  Sparkles, 
  ArrowRight,
  Filter,
  Layers,
  X,
  Network
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';
import { SkillTreeNode, SkillNodeData } from './components';
import { ACADEMY_CONCEPTS, ACADEMY_LESSONS } from '@/data/academy/curriculum';
import { AcademyDomain, Lesson, CurriculumConcept } from '@/types/academy';
import { CurriculumRegistry } from '@/data/academy/registry';
import { ConceptDependencyGraph } from './ConceptDependencyGraph';
import { LockedPrerequisiteModal } from './LockedPrerequisiteModal';
import { ConceptViewModal } from './ConceptViewModal';

interface SkillTreeTabProps {
  onOpenLesson: (lesson: Lesson) => void;
}

export const SkillTreeTab: React.FC<SkillTreeTabProps> = ({ onOpenLesson }) => {
  const { progress } = useAcademy();
  const [activeViewMode, setActiveViewMode] = useState<'graph' | 'matrix'>('graph');
  const [selectedDomain, setSelectedDomain] = useState<AcademyDomain | 'All'>('All');
  const [activeModalSkill, setActiveModalSkill] = useState<SkillNodeData | null>(null);

  // Modals for concept inspection and locked prerequisites
  const [activeConceptModal, setActiveConceptModal] = useState<CurriculumConcept | null>(null);
  const [lockedModalConcept, setLockedModalConcept] = useState<CurriculumConcept | null>(null);

  const domainsList: AcademyDomain[] = [
    'Market Knowledge',
    'Technical Analysis',
    'Fundamental Analysis',
    'Risk Management',
    'Execution',
    'Trading Psychology',
    'Behavioral Finance',
    'Quantitative Analysis',
    'Portfolio Management',
    'Derivatives',
    'Macro Economics',
    'Market Microstructure',
    'Research',
    'Professional Practice'
  ];

  // Map concepts to Skill Nodes
  const allSkillNodes: SkillNodeData[] = React.useMemo(() => {
    return ACADEMY_CONCEPTS.map(c => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      level: c.level,
      description: c.shortDefinition || c.professionalDefinition || '',
      prerequisites: c.prerequisites || [],
      lessonId: c.lessonId
    }));
  }, []);

  const filteredSkills = React.useMemo(() => {
    if (selectedDomain === 'All') return allSkillNodes;
    return allSkillNodes.filter(s => s.domain === selectedDomain);
  }, [allSkillNodes, selectedDomain]);

  const handleStartSkillLesson = (skill: SkillNodeData) => {
    if (skill.lessonId) {
      const lesson = ACADEMY_LESSONS.find(l => l.id === skill.lessonId);
      if (lesson) {
        onOpenLesson(lesson);
        setActiveModalSkill(null);
        return;
      }
    }
    const fallback = ACADEMY_LESSONS.find(l => l.domain === skill.domain && l.level === skill.level) || ACADEMY_LESSONS[0];
    onOpenLesson(fallback);
    setActiveModalSkill(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Switcher */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
              <GitFork className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Competency Matrix & Prerequisite Graph
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Institutional Skill Tree & Dependency Graph
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Navigate the interconnected dependency graph of trading principles. Master foundational nodes to unlock advanced quantitative risk and microstructure competencies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1 border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setActiveViewMode('graph')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'graph'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Prerequisite Graph</span>
            </button>
            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeViewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Domain Matrix</span>
            </button>
          </div>

          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            {progress.masteredConcepts.length} / {allSkillNodes.length} Mastered
          </span>
        </div>
      </div>

      {activeViewMode === 'graph' ? (
        /* Full Phase 2 Dependency Graph Visualizer */
        <ConceptDependencyGraph
          onSelectConcept={(concept) => setActiveConceptModal(concept)}
          onLockedConceptClick={(concept) => setLockedModalConcept(concept)}
        />
      ) : (
        /* Domain Clusters Matrix View */
        <div className="space-y-5">
          {/* Domain Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDomain('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedDomain === 'All'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              All Domains ({allSkillNodes.length})
            </button>
            {domainsList.map(dom => {
              const count = allSkillNodes.filter(s => s.domain === dom).length;
              return (
                <button
                  key={dom}
                  onClick={() => setSelectedDomain(dom)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    selectedDomain === dom
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <span>{dom}</span>
                  <span className="text-[10px] opacity-75 font-semibold">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Grid of Skill Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSkills.map(skill => {
              const isMastered = progress.masteredConcepts.includes(skill.id);
              const prereqMet = skill.prerequisites.length === 0 || 
                skill.prerequisites.every(p => progress.masteredConcepts.includes(p));

              return (
                <SkillTreeNode
                  key={skill.id}
                  node={skill}
                  isMastered={isMastered}
                  isUnlocked={prereqMet}
                  onSelectNode={(s) => setActiveModalSkill(s)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Skill Detail Modal */}
      {activeModalSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-850 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                    {activeModalSkill.domain}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Level {activeModalSkill.level}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {activeModalSkill.name}
                </h3>
              </div>

              <button
                onClick={() => setActiveModalSkill(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Competency Description
                </span>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeModalSkill.description}
                </p>
              </div>

              {activeModalSkill.prerequisites.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Required Knowledge Nodes
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalSkill.prerequisites.map(p => {
                      const isPrereqDone = progress.masteredConcepts.includes(p);
                      return (
                        <span
                          key={p}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                            isPrereqDone 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isPrereqDone ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span>{p}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setActiveModalSkill(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleStartSkillLesson(activeModalSkill)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Study Concept Module</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concept View Modal */}
      {activeConceptModal && (
        <ConceptViewModal
          concept={activeConceptModal}
          onClose={() => setActiveConceptModal(null)}
          onOpenConnectedLesson={onOpenLesson}
          onSelectConcept={(c) => setActiveConceptModal(c)}
        />
      )}

      {/* Locked Prerequisite Modal */}
      {lockedModalConcept && (
        <LockedPrerequisiteModal
          concept={lockedModalConcept}
          onClose={() => setLockedModalConcept(null)}
          onSelectPrerequisite={(prereq) => {
            setActiveConceptModal(prereq);
          }}
        />
      )}
    </div>
  );
};
