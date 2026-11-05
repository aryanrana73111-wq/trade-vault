import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Compass, 
  Clock, 
  DollarSign, 
  Target, 
  Brain 
} from 'lucide-react';
import { CommandCenterSummary, AttentionItem, ProcessActionItem } from '@/types/commandCenter';
import { formatCurrency } from '@/lib/utils';

interface CockpitSummaryBarProps {
  summary: CommandCenterSummary;
  attentionItems: AttentionItem[];
  processActions: ProcessActionItem[];
  onInvestigateAttention: (item: AttentionItem) => void;
  onExecuteAction: (action: ProcessActionItem) => void;
}

export function CockpitSummaryBar({
  summary,
  attentionItems,
  processActions,
  onInvestigateAttention,
  onExecuteAction
}: CockpitSummaryBarProps) {
  const topAttention = attentionItems.slice(0, 3);
  const topActions = processActions.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5 min-w-0">
      {/* 1. LEFT COLUMN: WHERE I AM */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                Where I Am
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              Live State
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Net P&L & Trades */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Period P&L:</span>
              <span className={`text-xs sm:text-sm font-mono font-bold ${
                (summary.todayPnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {summary.todayPnlFormatted}
              </span>
            </div>

            {/* Risk & Streak */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Risk Used</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                  {summary.riskUsedToday > 0 ? formatCurrency(summary.riskUsedToday) : 'None'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Streak</span>
                <span className={`font-mono font-bold mt-0.5 block ${
                  summary.currentStreak.type === 'WIN' ? 'text-emerald-600 dark:text-emerald-400' : summary.currentStreak.type === 'LOSS' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
                }`}>
                  {summary.currentStreak.text}
                </span>
              </div>
            </div>

            {/* Rule Adherence & Psychology */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Rule Adherence</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {summary.ruleAdherenceFormatted}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                <span className="text-[11px] text-slate-400 block">Psychology</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {summary.psychologyCompletionFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Sample: {summary.closedTradesInRange} closed trades</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{summary.totalTradesInRange} in range</span>
        </div>
      </div>

      {/* 2. CENTER COLUMN: WHAT NEEDS ATTENTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                What Needs Attention
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-semibold">
              {topAttention.length} Items
            </span>
          </div>

          {topAttention.length > 0 ? (
            <div className="space-y-2">
              {topAttention.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/40 dark:bg-amber-950/20 flex items-start justify-between gap-2 hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                      {item.explanation}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onInvestigateAttention(item)}
                    className="shrink-0 px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-800 dark:text-amber-200 text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    Investigate
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 space-y-1.5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Clean Operating State</p>
              <p className="text-[11px] text-slate-400">No critical risk or behavioral violations detected.</p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Evidence-based pattern alerts generated from actual trade logs</span>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: WHAT I SHOULD DO NOW */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 uppercase">
                What I Should Do Now
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold">
              Process Actions
            </span>
          </div>

          <div className="space-y-2">
            {topActions.map((act) => (
              <div
                key={act.id}
                className="p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-start justify-between gap-2 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {act.reason}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onExecuteAction(act)}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  <span>{act.buttonLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="truncate">Non-predictive process recommendations to elevate execution</span>
        </div>
      </div>
    </div>
  );
}
