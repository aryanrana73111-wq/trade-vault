import React from 'react';
import { 
  Compass, 
  ShieldCheck, 
  Target, 
  Brain, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Flame, 
  Calendar 
} from 'lucide-react';
import { Trade, Strategy, TradingRule, LearningEntry } from '@/types';
import { PersonalLeak, PersonalStrength, TodayTradingPlan } from '@/types/commandCenter';

interface TradingOperatingSystemBoardProps {
  rules: TradingRule[];
  strategies: Strategy[];
  leaks: PersonalLeak[];
  strengths: PersonalStrength[];
  plan: TodayTradingPlan;
  onOpenRules: () => void;
  onOpenStrategies: () => void;
}

export function TradingOperatingSystemBoard({
  rules,
  strategies,
  leaks,
  strengths,
  plan,
  onOpenRules,
  onOpenStrategies
}: TradingOperatingSystemBoardProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-7 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              My Trading Operating System
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consolidated personal architecture aligning playbook rules, risk bounds, psychological anchors, and growth targets.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-800/60 self-start sm:self-auto">
          Active OS Protocol
        </span>
      </div>

      {/* Grid of OS Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Pillar 1: Risk Architecture */}
        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-blue-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Risk Architecture</span>
            </div>
            <span className="font-mono">{plan.riskLimitPercent}% Cap</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Max risk: <strong className="text-white">{plan.riskLimitPercent}%</strong> • Max daily trades: <strong className="text-white">{plan.maxTrades}</strong>
          </p>
          <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
            Stop loss defined prior to order entry on 100% of trades.
          </div>
        </div>

        {/* Pillar 2: Active Playbooks */}
        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>Active Playbooks</span>
            </div>
            <span className="font-mono">{strategies.length} Defined</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed truncate">
            {strategies.length > 0 ? strategies.map(s => s.name).join(', ') : 'Add strategies in Playbook'}
          </p>
          <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Strategy attribution required</span>
            <button type="button" onClick={onOpenStrategies} className="text-blue-400 font-bold cursor-pointer">
              View
            </button>
          </div>
        </div>

        {/* Pillar 3: Psychology Anchor */}
        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-400">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4" />
              <span>Mindset Anchor</span>
            </div>
            <span className="font-mono">Patience</span>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed line-clamp-2">
            &ldquo;{plan.psychologyReminder}&rdquo;
          </p>
          <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-400">
            Zero impulse or revenge re-entries allowed.
          </div>
        </div>

        {/* Pillar 4: Current Focus & Leaks */}
        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Priority Focus</span>
            </div>
            <span className="font-mono">{leaks.length} Leaks</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {plan.todayFocus}
          </p>
          <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Top leak: {leaks[0]?.title || 'None'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
