import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Save, 
  Plus, 
  ShieldCheck, 
  ArrowRight, 
  Target, 
  Flame, 
  Brain, 
  BookOpen, 
  FileText 
} from 'lucide-react';
import { TodayTradingPlan, PreTradeCheckItem } from '@/types/commandCenter';

const DEFAULT_PRE_TRADE_CHECKS: PreTradeCheckItem[] = [
  { id: 'c1', label: 'Market & pair selected and aligned with current volatility', checked: false, category: 'setup' },
  { id: 'c2', label: 'Playbook strategy identified with explicit invalidation level', checked: false, category: 'setup' },
  { id: 'c3', label: 'Position size calculated strictly within risk limit (< 1%)', checked: false, category: 'risk' },
  { id: 'c4', label: 'Hard Stop-Loss and Take-Profit defined prior to order placement', checked: false, category: 'risk' },
  { id: 'c5', label: 'Execution window valid (London / NY session open)', checked: false, category: 'execution' },
  { id: 'c6', label: 'Emotional state calm, zero FOMO or revenge impulse detected', checked: false, category: 'psychology' }
];

interface TodayPlanAndPreTradeCardProps {
  userId?: string;
  onOpenAddTrade: () => void;
}

export function TodayPlanAndPreTradeCard({ userId = 'default', onOpenAddTrade }: TodayPlanAndPreTradeCardProps) {
  const navigate = useNavigate();
  const planStorageKey = `tv_today_plan_${userId}`;

  const [plan, setPlan] = useState<TodayTradingPlan>(() => {
    try {
      const saved = localStorage.getItem(planStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      todayFocus: 'Execute with strict 1.0% risk discipline and wait for confirmation.',
      riskLimitPercent: 1.0,
      maxTrades: 3,
      preferredSessions: ['London', 'New York'],
      preferredStrategies: ['Breakout Pullback', 'Session Liquidity Sweep'],
      rulesToRemember: ['No entry without hard stop loss', 'Zero trading within 5 mins of high-impact news'],
      psychologyReminder: 'Preserving capital and discipline matters far more than catching every tick.',
      learningObjective: 'Master patient execution at key higher timeframe levels.',
      postTradeRequirement: 'Log screenshot and emotional tags immediately after trade closure.',
      updatedAt: Date.now()
    };
  });

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [draftPlan, setDraftPlan] = useState(plan);
  const [checks, setChecks] = useState<PreTradeCheckItem[]>(DEFAULT_PRE_TRADE_CHECKS);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePlan = () => {
    const updated = { ...draftPlan, updatedAt: Date.now() };
    setPlan(updated);
    try {
      localStorage.setItem(planStorageKey, JSON.stringify(updated));
    } catch {}
    setIsEditingPlan(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const toggleCheck = (id: string) => {
    setChecks(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const allChecksPassed = checks.every(c => c.checked);
  const passedCount = checks.filter(c => c.checked).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5 min-w-0">
      {/* 1. Today's Trading Plan */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                  Today&apos;s Trading Plan
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Personal Operating Blueprint
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isEditingPlan) handleSavePlan();
                else {
                  setDraftPlan(plan);
                  setIsEditingPlan(true);
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isEditingPlan ? (
                <>
                  <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Save Plan</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Plan</span>
                </>
              )}
            </button>
          </div>

          {saveSuccess && (
            <div className="mb-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Today&apos;s plan saved successfully!</span>
            </div>
          )}

          {isEditingPlan ? (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Primary Focus Today:
                </label>
                <input
                  type="text"
                  value={draftPlan.todayFocus}
                  onChange={(e) => setDraftPlan({ ...draftPlan, todayFocus: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Risk Limit (%):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={draftPlan.riskLimitPercent}
                    onChange={(e) => setDraftPlan({ ...draftPlan, riskLimitPercent: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Max Trades:
                  </label>
                  <input
                    type="number"
                    value={draftPlan.maxTrades}
                    onChange={(e) => setDraftPlan({ ...draftPlan, maxTrades: parseInt(e.target.value, 10) || 3 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                  Psychology & Mental Reminder:
                </label>
                <textarea
                  rows={2}
                  value={draftPlan.psychologyReminder}
                  onChange={(e) => setDraftPlan({ ...draftPlan, psychologyReminder: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-0.5">
                  Today&apos;s Focus
                </span>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {plan.todayFocus}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 block">Risk Cap</span>
                  <span className="text-xs font-black font-mono text-slate-900 dark:text-slate-100 block mt-0.5">
                    {plan.riskLimitPercent}% per trade
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-semibold text-slate-400 block">Max Executions</span>
                  <span className="text-xs font-black font-mono text-slate-900 dark:text-slate-100 block mt-0.5">
                    {plan.maxTrades} trades limit
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                  Mindset Anchor:
                </span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{plan.psychologyReminder}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Plan</span>
          <span className="text-slate-500 font-mono">Customized per session</span>
        </div>
      </div>

      {/* 2. Pre-Trade Checkpoint */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                  Before You Trade Checkpoint
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  Execution Safety Checklist ({passedCount}/{checks.length})
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setChecks(DEFAULT_PRE_TRADE_CHECKS)}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 underline font-medium cursor-pointer"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            {checks.map((check) => (
              <label
                key={check.id}
                onClick={() => toggleCheck(check.id)}
                className={`p-2 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-colors ${
                  check.checked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={check.checked}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                />
                <span className={`text-xs font-medium ${check.checked ? 'line-through opacity-85' : ''}`}>
                  {check.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {allChecksPassed ? '✅ All checks passed' : '⚠️ Complete all checks before entry'}
          </span>
          <button
            type="button"
            onClick={onOpenAddTrade}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              allChecksPassed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <span>Launch Add Trade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
