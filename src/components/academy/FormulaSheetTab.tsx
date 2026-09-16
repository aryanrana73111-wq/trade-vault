import React, { useState } from 'react';
import { 
  Calculator, 
  Binary, 
  Filter, 
  Search,
  BookOpen
} from 'lucide-react';
import { FormulaCard } from './components';
import { ScrollableTabs } from './ScrollableTabs';
import { TRADING_FORMULAS } from '@/data/academy/formulas';
import { AcademyDomain } from '@/types/academy';

export const FormulaSheetTab: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const domainsList: AcademyDomain[] = [
    'Risk Management',
    'Quantitative Analysis',
    'Execution',
    'Market Knowledge',
    'Portfolio Management'
  ];

  const filteredFormulas = TRADING_FORMULAS.filter(f => {
    if (selectedDomain !== 'All' && f.domain !== selectedDomain) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchExpr = f.expression.toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      if (!matchName && !matchExpr && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Quantitative Formulas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Institutional Formula Sheet & Live Calculator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            The core mathematical formulas governing risk invariance, statistical edge, drawdown recovery, and position sizing. Test parameters live with dynamic recalculations.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold whitespace-nowrap">
          {TRADING_FORMULAS.length} Master Formulas
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas or expressions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
        </div>

        <div className="w-full sm:w-auto">
          <ScrollableTabs
            tabs={[
              { id: 'All', label: 'All' },
              ...domainsList.map(domain => ({ id: domain, label: domain }))
            ]}
            activeTab={selectedDomain}
            onTabChange={(id) => setSelectedDomain(id)}
            ariaLabel="Formula domains"
          />
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFormulas.map(formula => (
          <FormulaCard key={formula.id} formula={formula} />
        ))}
      </div>
    </div>
  );
};
