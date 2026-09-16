import React from 'react';
import { 
  Shield, 
  LineChart, 
  Sliders, 
  Brain, 
  Cpu, 
  PieChart, 
  Briefcase, 
  BookOpen,
  Building,
  Activity,
  Globe,
  Database,
  Search,
  LucideIcon 
} from 'lucide-react';
import { AcademyDomain } from '@/types/academy';

interface DomainProgressProps {
  domain: AcademyDomain;
  masteryPct: number;
  completedLessons?: number;
  totalLessons?: number;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

const DOMAIN_METADATA: Record<AcademyDomain, { icon: LucideIcon; color: string; bg: string; darkBg: string; text: string; border: string }> = {
  'Market Knowledge': {
    icon: BookOpen,
    color: 'bg-sky-500',
    bg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-900/60'
  },
  'Technical Analysis': {
    icon: LineChart,
    color: 'bg-indigo-500',
    bg: 'bg-indigo-50',
    darkBg: 'dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900/60'
  },
  'Fundamental Analysis': {
    icon: Building,
    color: 'bg-orange-500',
    bg: 'bg-orange-50',
    darkBg: 'dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-900/60'
  },
  'Risk Management': {
    icon: Shield,
    color: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900/60'
  },
  'Execution': {
    icon: Sliders,
    color: 'bg-blue-600',
    bg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900/60'
  },
  'Trading Psychology': {
    icon: Brain,
    color: 'bg-purple-500',
    bg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900/60'
  },
  'Behavioral Finance': {
    icon: Activity,
    color: 'bg-pink-500',
    bg: 'bg-pink-50',
    darkBg: 'dark:bg-pink-950/40',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-200 dark:border-pink-900/60'
  },
  'Quantitative Analysis': {
    icon: Cpu,
    color: 'bg-amber-500',
    bg: 'bg-amber-50',
    darkBg: 'dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900/60'
  },
  'Portfolio Management': {
    icon: PieChart,
    color: 'bg-teal-500',
    bg: 'bg-teal-50',
    darkBg: 'dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-900/60'
  },
  'Derivatives': {
    icon: LineChart,
    color: 'bg-cyan-500',
    bg: 'bg-cyan-50',
    darkBg: 'dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-900/60'
  },
  'Macro Economics': {
    icon: Globe,
    color: 'bg-yellow-600',
    bg: 'bg-yellow-50',
    darkBg: 'dark:bg-yellow-950/40',
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-200 dark:border-yellow-900/60'
  },
  'Market Microstructure': {
    icon: Database,
    color: 'bg-fuchsia-500',
    bg: 'bg-fuchsia-50',
    darkBg: 'dark:bg-fuchsia-950/40',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    border: 'border-fuchsia-200 dark:border-fuchsia-900/60'
  },
  'Research': {
    icon: Search,
    color: 'bg-violet-500',
    bg: 'bg-violet-50',
    darkBg: 'dark:bg-violet-950/40',
    text: 'text-violet-700 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-900/60'
  },
  'Professional Practice': {
    icon: Briefcase,
    color: 'bg-rose-500',
    bg: 'bg-rose-50',
    darkBg: 'dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900/60'
  }
};

export const DomainProgress: React.FC<DomainProgressProps> = ({
  domain,
  masteryPct,
  completedLessons,
  totalLessons,
  compact = false,
  onClick,
  className = ''
}) => {
  const meta = DOMAIN_METADATA[domain] || DOMAIN_METADATA['Market Knowledge'];
  const Icon = meta.icon;
  const pct = Math.min(100, Math.max(0, isNaN(masteryPct) ? 0 : Math.round(masteryPct)));

  if (compact) {
    return (
      <div 
        onClick={onClick}
        className={`flex items-center justify-between p-2.5 rounded-xl border ${meta.border} ${meta.bg} ${meta.darkBg} ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${meta.text}`} />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {domain}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${meta.color} transition-all duration-500 rounded-full`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 w-8 text-right">
            {pct}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5 transition-all ${onClick ? 'hover:border-blue-400 cursor-pointer' : ''} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${meta.bg} ${meta.darkBg} ${meta.text} border ${meta.border}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {domain}
            </h4>
            <span className="text-[10px] text-slate-400">
              {pct === 0 ? 'Not started' : pct === 100 ? 'Mastered' : `${pct}% Mastery`}
            </span>
          </div>
        </div>

        {totalLessons !== undefined && (
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {completedLessons || 0}/{totalLessons} Lessons
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${meta.color} transition-all duration-700 rounded-full`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400">
          <span>Tier: {pct > 80 ? 'Institutional' : pct > 50 ? 'Advanced' : pct > 20 ? 'Practitioner' : 'Novice'}</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{pct}%</span>
        </div>
      </div>
    </div>
  );
};
