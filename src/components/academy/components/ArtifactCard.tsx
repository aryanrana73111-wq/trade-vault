import React from 'react';
import { 
  Sparkles, 
  Binary, 
  TrendingDown, 
  Percent, 
  BarChart3, 
  Activity, 
  ArrowRight,
  ShieldAlert 
} from 'lucide-react';
import { AcademyDomain } from '@/types/academy';

export interface ArtifactInfo {
  id: string;
  type: string;
  title: string;
  domain: AcademyDomain;
  description: string;
  formulaHighlight?: string;
  useCase: string;
  badge?: string;
}

interface ArtifactCardProps {
  artifact: ArtifactInfo;
  onLaunch: (artifact: ArtifactInfo) => void;
  className?: string;
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onLaunch,
  className = ''
}) => {
  return (
    <div
      onClick={() => onLaunch(artifact)}
      className={`group p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            Interactive Lab
          </span>

          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {artifact.domain}
          </span>
        </div>

        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-snug">
          {artifact.title}
        </h4>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
          {artifact.description}
        </p>

        {artifact.formulaHighlight && (
          <div className="mt-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans font-bold">Governing Law</span>
            {artifact.formulaHighlight}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-400 truncate max-w-[170px]">
          {artifact.useCase}
        </span>

        <span className="inline-flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0">
          <span>Launch Lab</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
