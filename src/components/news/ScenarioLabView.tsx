import React, { useState, useMemo } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { 
  Layers, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ScenarioLabViewProps {
  events: NewsEvent[];
  selectedEventId?: string;
  onSelectEvent: (event: NewsEvent) => void;
}

export function ScenarioLabView({
  events,
  selectedEventId,
  onSelectEvent
}: ScenarioLabViewProps) {
  const [activeEventId, setActiveEventId] = useState<string>(selectedEventId || events[0]?.id || '');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<'hawkish' | 'dovish' | 'inLine' | 'mixed'>('hawkish');

  const activeEvent = useMemo(() => {
    return events.find(e => e.id === activeEventId) || events[0];
  }, [events, activeEventId]);

  if (!activeEvent) return null;

  const currentScenario = activeEvent.scenarios[selectedScenarioKey];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl border border-emerald-900/40 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Conditional Decision Framework</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Conditional Scenario & Transmission Lab
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Formulate rigorous "If / Then" conditional execution trees before data releases. Map the precise sequence from indicator surprise to yields, currency repricing, and risk assets.
          </p>
        </div>
      </div>

      {/* Selector and Scenario Tabs */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-md">
            <label className="block text-slate-400 uppercase font-semibold text-[10px] mb-1">
              Select Macro Catalyst:
            </label>
            <select
              value={activeEventId}
              onChange={(e) => setActiveEventId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.code} - {ev.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Keys Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedScenarioKey('hawkish')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedScenarioKey === 'hawkish' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Hawkish Beat
            </button>
            <button
              type="button"
              onClick={() => setSelectedScenarioKey('dovish')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedScenarioKey === 'dovish' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dovish Miss
            </button>
            <button
              type="button"
              onClick={() => setSelectedScenarioKey('inLine')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedScenarioKey === 'inLine' 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              In-Line Consensus
            </button>
            <button
              type="button"
              onClick={() => setSelectedScenarioKey('mixed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedScenarioKey === 'mixed' 
                  ? 'bg-amber-600 text-white shadow-xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mixed / Divergent
            </button>
          </div>
        </div>
      </div>

      {/* Active Scenario Card */}
      {currentScenario && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                selectedScenarioKey === 'hawkish' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                selectedScenarioKey === 'dovish' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                selectedScenarioKey === 'inLine' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {selectedScenarioKey.toUpperCase()} SCENARIO
              </span>
              <span className="text-xs text-slate-400">• {activeEvent.name}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentScenario.title}
            </h3>
          </div>

          {/* Trigger Condition */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Triggering Economic Condition:
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {currentScenario.condition}
            </p>
          </div>

          {/* Sequential Transmission Nodes */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Sequential Macro Transmission Pathway:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {currentScenario.transmission.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 relative flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    {idx < currentScenario.transmission.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Observed Tendency */}
          <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40">
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block mb-1">
              Historically Observed Market Tendency:
            </span>
            <p className="text-sm text-slate-800 dark:text-slate-200">
              {currentScenario.marketTendency}
            </p>
          </div>

          {/* Conditional Disclaimer */}
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p>
              <strong>Conditional Scenario Rules:</strong> {currentScenario.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
