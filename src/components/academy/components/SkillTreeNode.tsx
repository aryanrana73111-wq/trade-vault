import React from 'react';
import { CheckCircle2, Lock, Sparkles, Brain, ArrowUpRight } from 'lucide-react';
import { AcademyDomain } from '@/types/academy';

export interface SkillNodeData {
  id: string;
  name: string;
  domain: AcademyDomain;
  level: number;
  description: string;
  prerequisites: string[];
  lessonId?: string;
}

interface SkillTreeNodeProps {
  node: SkillNodeData;
  isUnlocked: boolean;
  isMastered: boolean;
  onSelectNode: (node: SkillNodeData) => void;
  className?: string;
}

export const SkillTreeNode: React.FC<SkillTreeNodeProps> = ({
  node,
  isUnlocked,
  isMastered,
  onSelectNode,
  className = ''
}) => {
  return (
    <div
      onClick={() => onSelectNode(node)}
      className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 relative ${
        isMastered
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-xs hover:border-emerald-500'
          : isUnlocked
          ? 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 shadow-xs'
          : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/40 opacity-60 hover:opacity-80'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          L{node.level}
        </span>

        <div>
          {isMastered ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mastered</span>
            </span>
          ) : isUnlocked ? (
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </span>
          )}
        </div>
      </div>

      <div>
        <h5 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {node.name}
        </h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {node.description}
        </p>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
        <span className="text-slate-400 font-medium">
          {node.prerequisites.length > 0 ? `${node.prerequisites.length} prereq(s)` : 'Foundational'}
        </span>

        <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
          <span>Explore</span>
          <ArrowUpRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
