import React from 'react';
import { Network, Database, LineChart, Brain, Globe, Shield, TrendingUp, Search, Layers, Briefcase, Activity, Book } from 'lucide-react';

const DOMAINS = [
  { id: 'A', name: 'Market Foundations', icon: Database, color: 'text-blue-500' },
  { id: 'B', name: 'Asset Classes', icon: Layers, color: 'text-cyan-500' },
  { id: 'C', name: 'Technical Analysis', icon: TrendingUp, color: 'text-emerald-500' },
  { id: 'D', name: 'Fundamental Analysis', icon: Search, color: 'text-amber-500' },
  { id: 'E', name: 'Macroeconomics', icon: Globe, color: 'text-indigo-500' },
  { id: 'F', name: 'Central Banks', icon: Network, color: 'text-purple-500' },
  { id: 'G', name: 'Risk Management', icon: Shield, color: 'text-rose-500' },
  { id: 'H', name: 'Derivatives', icon: Activity, color: 'text-orange-500' },
  { id: 'I', name: 'Market Microstructure', icon: LineChart, color: 'text-teal-500' },
  { id: 'J', name: 'Execution', icon: Activity, color: 'text-blue-400' },
  { id: 'K', name: 'Quantitative Finance', icon: CalculatorIcon, color: 'text-indigo-400' },
  { id: 'L', name: 'Systematic Trading', icon: Database, color: 'text-slate-500' },
  { id: 'M', name: 'Algorithmic Trading', icon: TerminalIcon, color: 'text-green-500' },
  { id: 'N', name: 'Backtesting & Research', icon: Search, color: 'text-amber-400' },
  { id: 'O', name: 'Portfolio Management', icon: Briefcase, color: 'text-cyan-600' },
  { id: 'P', name: 'Performance Analysis', icon: LineChart, color: 'text-indigo-600' },
  { id: 'Q', name: 'Behavioral Finance', icon: Brain, color: 'text-rose-400' },
  { id: 'R', name: 'Professional Process', icon: CheckIcon, color: 'text-emerald-600' },
  { id: 'S', name: 'Institutional Investing', icon: BuildingIcon, color: 'text-slate-600' },
  { id: 'T', name: 'Market Regulation', icon: Shield, color: 'text-slate-400' }
];

export const UltraMasterMap: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Network className="w-6 h-6 text-indigo-500" />
          <span>Global Knowledge Taxonomy</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
          The structural foundation of ULTRA mode. This 20-domain knowledge graph maps the entirety of professional trading from basic market architecture to algorithmic execution and central bank policy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          return (
            <div key={domain.id} className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group cursor-pointer shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 ${domain.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Domain {domain.id}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {domain.name}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function CalculatorIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
  );
}

function CheckIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
  );
}
