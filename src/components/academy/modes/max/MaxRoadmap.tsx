import React, { useState } from 'react';
import { Compass, CheckCircle2, Lock, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react';
import { MAX_ROADMAP_DATA } from '@/data/academy/maxRoadmapData';
import { useAcademy } from '@/contexts/AcademyContext';

interface MaxRoadmapProps {
  onOpenConcept?: (concept: any) => void;
}

export const MaxRoadmap: React.FC<MaxRoadmapProps> = ({ onOpenConcept }) => {
  const { progress } = useAcademy();
  const currentPhase = progress.currentLevel ?? 1;
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({ 1: true });

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto pb-20">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2">
        <Compass className="w-8 h-8 text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          MAX Learning Roadmap
        </h2>
        <p className="text-sm text-slate-500 max-w-2xl mx-auto">
          A structured 15-level journey covering all domains of professional trading. Expand each level to view modules and start learning.
        </p>
      </div>

      <div className="space-y-4">
        {MAX_ROADMAP_DATA.map((phaseData) => {
          const isCompleted = currentPhase > phaseData.phase;
          const isCurrent = currentPhase === phaseData.phase;
          const isLocked = false; // Intentionally unlocked for the user
          const isExpanded = !!expandedLevels[phaseData.phase];

          return (
            <div key={phaseData.phase} className="p-1 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
              <button 
                onClick={() => toggleLevel(phaseData.phase)}
                className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 shadow-xs transition-colors ${
                      isCompleted 
                        ? 'bg-emerald-500 text-white' 
                        : isCurrent
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold">{phaseData.phase}</span>}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{phaseData.timeframe}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white" style={{ color: isCurrent ? phaseData.badgeColor : undefined }}>
                      {phaseData.title}
                    </h3>
                  </div>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    {phaseData.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {phaseData.concepts.map((concept, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (onOpenConcept) {
                            onOpenConcept({
                              id: `concept-${phaseData.phase}-${idx}`,
                              title: concept,
                              domain: phaseData.title,
                              difficulty: 'Intermediate',
                              description: `Comprehensive lesson on ${concept}.`,
                              format: 'Interactive',
                              durationMin: 15,
                              relatedIds: []
                            });
                          }
                        }}
                        className="flex flex-col text-left p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors group shadow-xs hover:shadow-sm"
                      >
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 mb-2">
                          {concept}
                        </span>
                        <div className="mt-auto flex items-center justify-between text-slate-400 group-hover:text-amber-500">
                          <span className="text-[10px] uppercase font-bold tracking-wider">Lesson</span>
                          <PlayCircle className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                    <div className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-1">Level Milestone</div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                      {phaseData.milestone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
