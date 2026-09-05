import React from 'react';
import { 
  FileText, 
  Brain, 
  BookOpenCheck, 
  ShieldCheck, 
  Target, 
  Sparkles, 
  ArrowRight,
  Workflow
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectedWorkflowBannerProps {
  counts: {
    trades: number;
    psychology: number;
    learnings: number;
    rules: number;
    strategies: number;
  };
}

export const ConnectedWorkflowBanner: React.FC<ConnectedWorkflowBannerProps> = ({ counts }) => {
  const navigate = useNavigate();

  const STEPS = [
    {
      id: 'trade',
      label: '1. Trade Journal',
      count: counts.trades,
      sub: 'Execution & PnL',
      route: '/journal',
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800'
    },
    {
      id: 'psychology',
      label: '2. Psychology',
      count: counts.psychology,
      sub: 'Emotions & Bias',
      route: '/psychology',
      icon: Brain,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800'
    },
    {
      id: 'learning',
      label: '3. Learnings',
      count: counts.learnings,
      sub: 'Key Discoveries',
      route: '/learning-rules?tab=learning',
      icon: BookOpenCheck,
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800'
    },
    {
      id: 'rules',
      label: '4. Trading Rules',
      count: counts.rules,
      sub: 'Discipline Mandates',
      route: '/learning-rules?tab=rules',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800'
    },
    {
      id: 'strategy',
      label: '5. Strategies',
      count: counts.strategies,
      sub: 'Edge & Setups',
      route: '/strategies',
      icon: Target,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'ai_labs',
      label: '6. AI & Research',
      count: 'Labs',
      sub: 'Evidence Analysis',
      route: '/ai-labs',
      icon: Sparkles,
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Connected Trading Cycle
          </h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Seamless transition: Record Trade → Review Psychology → Extract Learning → Solidify Rule → Optimize Strategy → AI Research
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => navigate(step.route)}
              className="group p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 text-left transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg border ${step.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {typeof step.count === 'number' ? `${step.count} items` : step.count}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {step.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {step.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
