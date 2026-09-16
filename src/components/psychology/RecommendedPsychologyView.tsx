import React, { useState, useMemo } from 'react';
import { PSYCHOLOGY_LIBRARY, PsychologyConcept } from '@/data/psychologyLibrary';
import { PSYCHOLOGY_PROTOCOLS, ActionProtocol } from '@/data/psychologyProtocols';
import { PsychologyProtocolModal } from './PsychologyProtocolModal';
import { Button } from '@/components/ui/Button';
import { 
  Brain, 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  Activity, 
  ChevronRight, 
  X,
  GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const RecommendedPsychologyView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedConcept, setSelectedConcept] = useState<PsychologyConcept | null>(null);
  const [activeProtocol, setActiveProtocol] = useState<ActionProtocol | null>(null);

  // Filtered concepts
  const filteredConcepts = useMemo(() => {
    return PSYCHOLOGY_LIBRARY.filter(concept => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = concept.name.toLowerCase().includes(q);
        const matchesDef = concept.definition.toLowerCase().includes(q);
        const matchesManifest = concept.tradingManifestation.toLowerCase().includes(q);
        if (!matchesName && !matchesDef && !matchesManifest) return false;
      }

      if (selectedCategory !== 'ALL' && concept.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  const handleLaunchProtocol = (concept: PsychologyConcept, e: React.MouseEvent) => {
    e.stopPropagation();
    const found = PSYCHOLOGY_PROTOCOLS.find(p => p.name.toLowerCase().includes(concept.name.split(' ')[0].toLowerCase())) || PSYCHOLOGY_PROTOCOLS[0];
    setActiveProtocol(found);
  };

  const categoryBadge: Record<string, string> = {
    'Cognitive Bias': 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    'Emotional State': 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
    'Execution Trap': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    'Risk Distortion': 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800 border border-purple-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
            <Brain className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Institutional Behavioral Finance & Psychology Library
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Systematic trading edges are ruined by behavioral breakdown. Explore cognitive biases, emotional dysregulation patterns, and deploy concrete <span className="font-semibold text-slate-900 dark:text-slate-100">Emergency Action Protocols</span> with mandatory stand-down timers before capital is impaired.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            {PSYCHOLOGY_LIBRARY.length} Core Biases Cataloged
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bias name, manifestation, or symptom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Cognitive Bias">Cognitive Bias</option>
              <option value="Emotional State">Emotional State</option>
              <option value="Execution Trap">Execution Trap</option>
              <option value="Risk Distortion">Risk Distortion</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConcepts.map(concept => (
          <div
            key={concept.id}
            onClick={() => setSelectedConcept(concept)}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", categoryBadge[concept.category])}>
                  {concept.category}
                </span>
                <button
                  onClick={(e) => handleLaunchProtocol(concept, e)}
                  className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-1"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Protocol
                </button>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {concept.name}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {concept.definition}
                </p>
              </div>

              {/* Trading Manifestation Preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Market Manifestation</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                  {concept.tradingManifestation}
                </p>
              </div>

              {/* Warning Signs Preview */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Warning Signs</span>
                <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                  {concept.warningSigns.slice(0, 2).map((sign, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-rose-500 font-bold">•</span>
                      <span className="line-clamp-1">{sign}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {concept.researchSources.length} Research Citation{concept.researchSources.length > 1 ? 's' : ''}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 px-2 font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700"
              >
                Deep Dossier <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Psychology Concept Detail Modal */}
      {selectedConcept && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedConcept(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", categoryBadge[selectedConcept.category])}>
                    {selectedConcept.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-500">Research Dossier</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedConcept.name}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const found = PSYCHOLOGY_PROTOCOLS.find(p => p.name.toLowerCase().includes(selectedConcept.name.split(' ')[0].toLowerCase())) || PSYCHOLOGY_PROTOCOLS[0];
                    setActiveProtocol(found);
                  }}
                  className="gap-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Launch Protocol
                </Button>
                <button 
                  onClick={() => setSelectedConcept(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Definition & Neuro-Economic Reason */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs font-bold uppercase text-slate-400">Formal Definition</span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {selectedConcept.definition}
                  </p>
                </div>

                <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-900/40 space-y-1">
                  <span className="text-xs font-bold uppercase text-purple-900 dark:text-purple-300">Why It Happens (Neuroscience & Evolution)</span>
                  <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-100 leading-relaxed">
                    {selectedConcept.whyItHappens}
                  </p>
                </div>
              </div>

              {/* Concrete Trading Example vs Counterexample */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Destructive Trading Example
                  </span>
                  <p className="text-xs text-rose-950 dark:text-rose-100 leading-relaxed">
                    {selectedConcept.example}
                  </p>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1.5">
                  <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Professional Disciplined Counterexample
                  </span>
                  <p className="text-xs text-emerald-950 dark:text-emerald-100 leading-relaxed">
                    {selectedConcept.counterexample}
                  </p>
                </div>
              </div>

              {/* Warning Signs & Risk Consequences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Behavioral Warning Signs
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedConcept.warningSigns.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Portfolio Risk & Performance Consequences
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedConcept.riskConsequences.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">⚠</span>
                        <span>{r}</span>
                      </li>
                    ))}
                    {selectedConcept.performanceConsequences.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">📉</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prevention & Exercises */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Institutional Prevention Architecture
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {selectedConcept.prevention.map((prev, i) => (
                      <li key={i}>• {prev}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                    Deliberate Practice Exercises
                  </span>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {selectedConcept.exercises.map((ex, i) => (
                      <li key={i}>• {ex}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Academic Sources */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> Academic & Scientific Citations
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                  {selectedConcept.researchSources.map((src, i) => (
                    <li key={i}>• {src}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
              <span className="text-xs text-slate-500">TradeVault Behavioral Architecture</span>
              <Button size="sm" onClick={() => setSelectedConcept(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Modal */}
      <PsychologyProtocolModal
        protocol={activeProtocol}
        onClose={() => setActiveProtocol(null)}
      />
    </div>
  );
};
