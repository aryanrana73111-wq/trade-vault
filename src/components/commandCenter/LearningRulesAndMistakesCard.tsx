import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Flame, 
  Award, 
  ExternalLink 
} from 'lucide-react';
import { Trade, TradingRule, LearningEntry } from '@/types';
import { MistakeCluster, PersonalLeak, PersonalStrength } from '@/types/commandCenter';
import { formatCurrency } from '@/lib/utils';

interface LearningRulesAndMistakesCardProps {
  mistakes: MistakeCluster[];
  leaks: PersonalLeak[];
  strengths: PersonalStrength[];
  rules: TradingRule[];
  learnings: LearningEntry[];
  onInspectTradeIds: (title: string, ids: string[]) => void;
}

export function LearningRulesAndMistakesCard({
  mistakes,
  leaks,
  strengths,
  rules,
  learnings,
  onInspectTradeIds
}: LearningRulesAndMistakesCardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mistakes' | 'leaks' | 'rules' | 'strengths'>('mistakes');

  return (
    <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Mistake Bank, Execution Leaks & Rule Auditing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Converting empirical trading mistakes into concrete rule modifications and strengths.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('mistakes')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'mistakes' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Mistake Bank ({mistakes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaks')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'leaks' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Personal Leaks ({leaks.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Rules ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('strengths')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'strengths' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Strengths ({strengths.length})
          </button>
        </div>
      </div>

      {/* 1. Mistake Bank */}
      {activeTab === 'mistakes' && (
        <div className="space-y-3">
          {mistakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {mistakes.map((cluster) => (
                <div
                  key={cluster.category}
                  className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {cluster.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {cluster.occurrences}x
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Total Loss Impact:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(cluster.totalPnlImpact)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onInspectTradeIds(`Mistake: ${cluster.category}`, cluster.tradeIds)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold cursor-pointer"
                    >
                      Inspect {cluster.tradeIds.length} Trades
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Repeating Mistake Clusters</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Keep tagging qualitative mistake notes in your trade journal to build your empirical mistake bank.</p>
            </div>
          )}
        </div>
      )}

      {/* 2. Personal Leaks */}
      {activeTab === 'leaks' && (
        <div className="space-y-3">
          {leaks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {leaks.map((leak) => (
                <div
                  key={leak.id}
                  className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {leak.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold">
                      {leak.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    <strong>Action:</strong> {leak.actionRecommendation}
                  </p>

                  <div className="pt-2 border-t border-rose-100 dark:border-rose-900/40 flex items-center justify-between text-xs">
                    <span className="text-rose-700 dark:text-rose-400 font-mono">
                      {leak.frequency} occurrences (n={leak.sampleSize})
                    </span>
                    <button
                      type="button"
                      onClick={() => onInspectTradeIds(`Leak: ${leak.title}`, leak.supportingTradeIds)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold cursor-pointer"
                    >
                      Audit Trades
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Zero Critical Leaks Flagged</p>
            </div>
          )}
        </div>
      )}

      {/* 3. Rules Center */}
      {activeTab === 'rules' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Configured Discipline Rules
            </h4>
            <button
              type="button"
              onClick={() => navigate('/learning-rules')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in Rules Page</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                    {rule.name || rule.text}
                  </span>
                  {rule.description && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      {rule.description}
                    </span>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shrink-0">
                  {rule.category || 'Discipline'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Strengths */}
      {activeTab === 'strengths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strengths.map((str) => (
            <div
              key={str.id}
              className="p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    {str.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold">
                    {str.category}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400">Adherence Rate:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{str.adherenceRate}%</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => onInspectTradeIds(`Strength: ${str.title}`, str.supportingTradeIds)}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 font-bold cursor-pointer"
                >
                  Inspect {str.supportingTradeIds.length} Trades
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
