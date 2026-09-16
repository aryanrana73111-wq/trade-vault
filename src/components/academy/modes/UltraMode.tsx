import React, { useState, useRef } from 'react';
import { 
  Terminal, Search, BookOpen, Layers, Activity, FileText, 
  ChevronRight, BrainCircuit, Globe, Calculator, Shield, 
  BarChart4, ArrowRight, Library, Network, LineChart, Cpu, 
  Briefcase, TrendingUp, PieChart, FlaskConical, Target,
  Microscope, Database, Star
} from 'lucide-react';
import { useAcademy } from '@/contexts/AcademyContext';

// Import subcomponents (some will be stubs that we will build out)
import { UltraDashboard } from './ultra/UltraDashboard';
import { UltraLabs } from './ultra/UltraLabs';
import { UltraResearchLibrary } from './ultra/UltraResearchLibrary';

export type UltraSubTab = 
  | 'dashboard'
  | 'knowledge'
  | 'markets'
  | 'quant'
  | 'macro'
  | 'derivatives'
  | 'microstructure'
  | 'execution'
  | 'portfolio'
  | 'systematic'
  | 'research'
  | 'labs'
  | 'case-studies'
  | 'library'
  | 'graph'
  | 'mastery'
  | 'my-research';

interface UltraModeProps {
  onOpenLessonModal?: (lesson: any) => void;
}

const PlaceholderSection: React.FC<{ title: string, icon: any, desc: string }> = ({ title, icon: Icon, desc }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-900 p-8 text-center space-y-4">
    <Icon className="w-12 h-12 text-indigo-500 mx-auto opacity-50" />
    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
    <p className="text-sm font-normal max-w-lg mt-4 text-slate-500 dark:text-slate-400">
      {desc}
    </p>
    <div className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
      RESEARCH MODULE INITIALIZING...
    </div>
  </div>
);

export const UltraMode: React.FC<UltraModeProps> = ({ onOpenLessonModal }) => {
  const { progress } = useAcademy();
  const [activeTab, setActiveTab] = useState<UltraSubTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Slidable nav logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 10) hasDraggedRef.current = true;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart4 },
    { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    { id: 'markets', label: 'Markets', icon: Globe },
    { id: 'quant', label: 'Quant', icon: Calculator },
    { id: 'macro', label: 'Macro', icon: LineChart },
    { id: 'derivatives', label: 'Derivatives', icon: Shield },
    { id: 'microstructure', label: 'Microstructure', icon: Database },
    { id: 'execution', label: 'Execution', icon: Target },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'systematic', label: 'Systematic', icon: Cpu },
    { id: 'research', label: 'Research', icon: Microscope },
    { id: 'labs', label: 'Labs', icon: FlaskConical },
    { id: 'case-studies', label: 'Case Studies', icon: Briefcase },
    { id: 'library', label: 'Resource Library', icon: Library },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'mastery', label: 'Mastery', icon: Star },
    { id: 'my-research', label: 'My Research', icon: FileText },
  ];

  return (
    <div id="ultra-mode-view" className="space-y-6">
      {/* ULTRA TERMINAL HEADER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-6 text-white relative overflow-hidden">
        {/* Deep, research-grade background flare */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-xs shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <span>TradeVault Academy</span>
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-500/30">
                    ULTRA
                  </span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-cyan-400">
                  World-Class Trading Knowledge & Research System
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed mt-2">
              Ascend to institutional-grade research. Access quantitative labs, execution simulators, market regime engines, and peer-reviewed academic papers.
            </p>
          </div>

          {/* GLOBAL SEARCH */}
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, markets, formulas, papers..."
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-white placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* ULTRA TOP NAVIGATION (Scrollable) */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-xs ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!hasDraggedRef.current) setActiveTab(tab.id as UltraSubTab);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <UltraDashboard onNavigateTab={(tab: any) => setActiveTab(tab)} />}
        {activeTab === 'knowledge' && <PlaceholderSection title="Global Knowledge Registry" icon={BookOpen} desc="Explore 60+ extensible knowledge domains from Asset Classes to Econometrics." />}
        {activeTab === 'markets' && <PlaceholderSection title="Global Market Structure" icon={Globe} desc="Deep dive into Exchange markets, OTC, Dark pools, Market makers, and Settlement." />}
        {activeTab === 'quant' && <PlaceholderSection title="Quantitative Trading School" icon={Calculator} desc="Probability, Statistics, Regression, Time Series, and Quant Methods." />}
        {activeTab === 'macro' && <PlaceholderSection title="Macro Research Center" icon={LineChart} desc="Track educational relationships between Inflation, Yield Curves, Credit, and Liquidity." />}
        {activeTab === 'derivatives' && <PlaceholderSection title="Derivatives Academy" icon={Shield} desc="Futures, Options, Greeks, Volatility surfaces, and Payoff diagrams." />}
        
        {activeTab === 'microstructure' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-900 p-8 text-center space-y-4">
            <Database className="w-12 h-12 text-indigo-500 mx-auto" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Market Microstructure Lab</h3>
            <p className="text-sm font-normal max-w-lg mt-4 text-slate-500 dark:text-slate-400">
              Interactive Order Book Simulation. Learn about Bid/Ask spread, tick size, queue priority, and market impact.
            </p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              EDUCATIONAL SIMULATION ONLY — NO LIVE DATA
            </div>
            <div className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              MODULE INITIALIZING...
            </div>
          </div>
        )}

        {activeTab === 'execution' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-900 p-8 text-center space-y-4">
            <Target className="w-12 h-12 text-indigo-500 mx-auto" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Execution Science</h3>
            <p className="text-sm font-normal max-w-lg mt-4 text-slate-500 dark:text-slate-400">
              Compare execution methods (VWAP, TWAP, Implementation Shortfall). View simulated slippage and estimated costs.
            </p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              SIMULATED EXECUTION — NOT A FORECAST
            </div>
            <div className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              MODULE INITIALIZING...
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && <PlaceholderSection title="Portfolio Science" icon={PieChart} desc="Diversification, Covariance, Beta, Factor exposure, and Efficient Frontier." />}
        {activeTab === 'systematic' && <PlaceholderSection title="Systematic Trading" icon={Cpu} desc="Signal generation, Backtesting, Risk parity, and Machine Learning concepts." />}
        
        {activeTab === 'research' && (
          <div className="flex flex-col items-center justify-center min-h-[400px] border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-500 font-bold bg-white dark:bg-slate-900 p-8 text-center space-y-4">
            <Microscope className="w-12 h-12 text-indigo-500 mx-auto" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider">Strategy Research Workbench</h3>
            <p className="text-sm font-normal max-w-lg mt-4 text-slate-500 dark:text-slate-400">
              Workflow: Hypothesis → Market → Data → Signal → Entry → Exit → Risk → Costs → Backtest → Out-of-Sample.
            </p>
            <div className="mt-4 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
              MODULE INITIALIZING...
            </div>
          </div>
        )}

        {activeTab === 'labs' && <UltraLabs />}
        {activeTab === 'case-studies' && <PlaceholderSection title="Case Study Database" icon={Briefcase} desc="Historical failures, Market crashes, Liquidity events, and Quantitative anomalies." />}
        {activeTab === 'library' && <UltraResearchLibrary />}
        {activeTab === 'graph' && <PlaceholderSection title="Global Knowledge Graph" icon={Network} desc="Navigate through a visually connected web of prerequisites, definitions, and relationships." />}
        {activeTab === 'mastery' && <PlaceholderSection title="Ultra Competency Matrix" icon={Star} desc="Track your educational mastery across Market, Risk, Execution, Quant, and Microstructure." />}
        {activeTab === 'my-research' && <PlaceholderSection title="Personal Research Workspace" icon={FileText} desc="Store hypotheses, Bull vs Bear debates, research notes, and stress tests." />}
      </div>
    </div>
  );
};
