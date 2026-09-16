import React, { useState, useMemo } from 'react';
import { 
  FlaskConical, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  X, 
  Play, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Filter,
  ShieldAlert,
  Binary,
  Zap,
  PieChart as PieIcon,
  Brain,
  Grid
} from 'lucide-react';
import { ACADEMY_VISUALIZERS, VisualizerMeta } from './artifacts/visualizerRegistry';
import { RiskLab } from './labs/RiskLab';
import { QuantLab } from './labs/QuantLab';
import { ExecutionLab } from './labs/ExecutionLab';
import { PortfolioLab } from './labs/PortfolioLab';
import { PsychologyLab } from './labs/PsychologyLab';
import { ScrollableTabs } from './ScrollableTabs';
import { HorizontalScrollRow } from './HorizontalScrollRow';

export const InteractiveLabsTab: React.FC = () => {
  const [activeLab, setActiveLab] = useState<'risk' | 'quant' | 'execution' | 'portfolio' | 'psychology' | 'registry'>('risk');
  const [selectedVisualizer, setSelectedVisualizer] = useState<VisualizerMeta | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const domains = useMemo(() => {
    const list = Array.from(new Set(ACADEMY_VISUALIZERS.map(v => v.domain)));
    return ['all', ...list];
  }, []);

  const filteredVisualizers = useMemo(() => {
    return ACADEMY_VISUALIZERS.filter(v => {
      const matchesSearch = 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.useCase.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDomain = selectedDomain === 'all' || v.domain === selectedDomain;

      return matchesSearch && matchesDomain;
    });
  }, [searchQuery, selectedDomain]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <FlaskConical className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Laboratories & Visual Models (Phase 5)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            Institutional Trading Labs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Hands-on interactive environments to manipulate mathematical inputs, simulate order book microstructures, explore quantitative distributions, stress-test multi-asset portfolios, and train behavioral discipline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-black whitespace-nowrap">
            5 Interactive Labs + 21 Visualizers
          </span>
        </div>
      </div>

      {/* Main Lab Switcher Tabs */}
      <div className="p-1.5 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <ScrollableTabs
          tabs={[
            { id: 'risk', label: 'Risk Lab', icon: ShieldAlert },
            { id: 'quant', label: 'Quant Lab', icon: Binary },
            { id: 'execution', label: 'Execution Lab', icon: Zap },
            { id: 'portfolio', label: 'Portfolio Lab', icon: PieIcon },
            { id: 'psychology', label: 'Psychology Lab', icon: Brain },
            { id: 'registry', label: 'Visualizer Library (21)', icon: Grid }
          ]}
          activeTab={activeLab}
          onTabChange={(id) => setActiveLab(id as any)}
          ariaLabel="Interactive Trading Labs"
        />
      </div>

      {/* RENDER ACTIVE LAB */}
      {activeLab === 'risk' && <RiskLab />}
      {activeLab === 'quant' && <QuantLab />}
      {activeLab === 'execution' && <ExecutionLab />}
      {activeLab === 'portfolio' && <PortfolioLab />}
      {activeLab === 'psychology' && <PsychologyLab />}

      {/* VISUALIZER REGISTRY TAB (Phase 3 models accessible in full) */}
      {activeLab === 'registry' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search 21 visualizers..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Domain Filter Pills */}
            <div className="w-full sm:w-auto">
              <ScrollableTabs
                tabs={domains.map(dom => ({
                  id: dom,
                  label: dom === 'all' ? 'All Visualizers' : dom
                }))}
                activeTab={selectedDomain}
                onTabChange={(id) => setSelectedDomain(id)}
                ariaLabel="Visualizer domains"
              />
            </div>
          </div>

          {/* Quick Browse Horizontal Row for Featured Visualizer Sandboxes */}
          {selectedDomain === 'all' && searchQuery === '' && (
            <HorizontalScrollRow
              title="Featured Visualizer Sandboxes"
              subtitle="Quick-launch quantitative, microstructure, and risk distribution visualizers"
              showControls={true}
              itemSpacing="gap-3.5"
            >
              {ACADEMY_VISUALIZERS.slice(0, 7).map(vis => (
                <div
                  key={`featured-${vis.id}`}
                  onClick={() => setSelectedVisualizer(vis)}
                  className="min-w-[260px] sm:min-w-[280px] p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between shrink-0 snap-start select-none group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-black flex items-center justify-center">
                        {vis.number}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                        {vis.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
                      {vis.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {vis.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-semibold">{vis.domain}</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Launch <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </HorizontalScrollRow>
          )}

          {/* Visualizers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVisualizers.map(vis => (
              <div
                key={vis.id}
                onClick={() => setSelectedVisualizer(vis)}
                className="group p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500/60 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-black flex items-center justify-center">
                        {vis.number}
                      </span>
                      <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                        {vis.domain}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {vis.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {vis.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {vis.description}
                    </p>
                  </div>

                  {vis.formulaHighlight && (
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 truncate">
                      {vis.formulaHighlight}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium truncate max-w-[180px]">
                    {vis.useCase}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Launch Model
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Visualizer Modal */}
          {selectedVisualizer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
              <div 
                className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        Component #{selectedVisualizer.number}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold uppercase">
                        {selectedVisualizer.category}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                      {selectedVisualizer.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedVisualizer(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {React.createElement(selectedVisualizer.component)}
                </div>

                {/* Modal Footer */}
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    Labeled as Simulation / Educational Example. Interactive parameter changes update in real time.
                  </span>
                  <button
                    onClick={() => setSelectedVisualizer(null)}
                    className="px-4 py-2 rounded-xl font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Close Simulator
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
