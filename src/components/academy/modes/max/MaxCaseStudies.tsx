import React, { useState } from 'react';
import { BookOpen, ArrowLeft, TrendingUp, AlertTriangle, Crosshair, ArrowRight } from 'lucide-react';
import { MaxConceptItem } from '@/types/academyTier';

interface MaxCaseStudiesProps {
  onOpenConcept?: (concept: MaxConceptItem) => void;
}

export const MaxCaseStudies: React.FC<MaxCaseStudiesProps> = ({ onOpenConcept }) => {
  const [activeCase, setActiveCase] = useState<any | null>(null);

  const cases = [
    {
      id: 1,
      title: "The Flash Crash Over-Leverage",
      category: "Risk Management",
      difficulty: "Advanced",
      duration: "15m",
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-100 dark:bg-rose-900/30",
      desc: "Analyze how a 100x leveraged trader blew a $50k account during a 3-minute flash crash, despite having a 'stop loss' in place."
    },
    {
      id: 2,
      title: "NFP Stop Hunt Recovery",
      category: "Market Structure",
      difficulty: "Intermediate",
      duration: "12m",
      icon: Crosshair,
      color: "text-amber-500",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      desc: "Step-by-step breakdown of how institutional algorithms swept retail liquidity during Non-Farm Payrolls before continuing the trend."
    },
    {
      id: 3,
      title: "The Perfect Trend Continuation",
      category: "Execution",
      difficulty: "Foundation",
      duration: "10m",
      icon: TrendingUp,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      desc: "Review a textbook pullback entry in a strong macro uptrend, focusing on multi-timeframe alignment and moving average confluence."
    }
  ];

  if (activeCase) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setActiveCase(null)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Case Studies</span>
        </button>
        <div className="flex flex-col items-center justify-center min-h-[500px] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-850 p-8 text-center space-y-4">
          <activeCase.icon className={`w-12 h-12 ${activeCase.color} mx-auto`} />
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Loading Case Study...</h3>
          <p className="text-lg text-slate-500 dark:text-slate-400">"{activeCase.title}"</p>
          <p className="text-sm font-normal max-w-lg mt-4">
            (The interactive case study player is coming soon. It will feature step-by-step chart replay, decision checkpoints, and a detailed post-mortem analysis.)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-500" />
          <span>Market Case Studies</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
          Realistic trading cases analyzing failure, risk, execution, and macro events. Learn from historical scenarios before you encounter them live.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => (
          <div key={c.id} className="flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {c.category}
              </span>
              <span className="text-xs font-bold text-slate-400">{c.duration}</span>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} ${c.color}`}>
                <c.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setActiveCase(c)}
                className="w-full flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
              >
                <span>Analyze Case</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
