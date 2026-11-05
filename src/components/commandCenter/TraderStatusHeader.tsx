import React, { useState } from 'react';
import { 
  Activity, 
  Target, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Brain, 
  BookOpenCheck, 
  Award, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  ChevronRight, 
  Flame, 
  Crosshair 
} from 'lucide-react';
import { CommandCenterSummary, TraderHealthScore } from '@/types/commandCenter';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface TraderStatusHeaderProps {
  summary: CommandCenterSummary;
  healthScore: TraderHealthScore;
}

export function TraderStatusHeader({ summary, healthScore }: TraderStatusHeaderProps) {
  const [showHealthModal, setShowHealthModal] = useState(false);

  return (
    <div className="space-y-4">
      {/* Top Bar with Health Score Dial & Quick Stats */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Health Score Dial */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${
                  healthScore.overallScore >= 80
                    ? 'text-emerald-500'
                    : healthScore.overallScore >= 60
                    ? 'text-blue-500'
                    : 'text-amber-500'
                } transition-all duration-1000 ease-out`}
                strokeDasharray={`${healthScore.overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base sm:text-lg font-black font-mono leading-none">
                {healthScore.overallScore}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                /100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Trading Process Health
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                {healthScore.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              Evidence-based composite score measuring risk discipline, execution, rule compliance, and journal depth.
            </p>
          </div>
        </div>

        {/* Right: View Calculation Button */}
        <button
          type="button"
          onClick={() => setShowHealthModal(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>View Health Calculation</span>
        </button>
      </div>

      {/* 12-Card Status Grid (100% Real Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Card 1: Today's P&L */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Period P&L
          </span>
          <span className={`text-sm sm:text-base font-black font-mono mt-1 block truncate ${
            (summary.todayPnl || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {summary.todayPnlFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
            {summary.tradesTodayCount} today
          </span>
        </div>

        {/* Card 2: Win Rate */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Win Rate
          </span>
          <span className={`text-sm sm:text-base font-black font-mono mt-1 block truncate ${
            (summary.winRate || 0) >= 50 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {summary.winRate !== null ? `${formatNumber(summary.winRate, 1)}%` : '--'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
            {summary.closedTradesInRange} closed trades
          </span>
        </div>

        {/* Card 3: Profit Factor */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Profit Factor
          </span>
          <span className={`text-sm sm:text-base font-black font-mono mt-1 block truncate ${
            (summary.profitFactor || 0) >= 1.5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
          }`}>
            {summary.profitFactor !== null ? formatNumber(summary.profitFactor, 2) : '--'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
            Gross gains / losses
          </span>
        </div>

        {/* Card 4: Average R */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Average R
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-blue-600 dark:text-blue-400 mt-1 block truncate">
            {summary.averageRFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
            Realized expectancy
          </span>
        </div>

        {/* Card 5: Rule Adherence */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Rule Adherence
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 block truncate">
            {summary.ruleAdherenceFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
            Checklist integrity
          </span>
        </div>

        {/* Card 6: Psychology Completion */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.08] shadow-2xs">
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
            Psychology
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-purple-600 dark:text-purple-400 mt-1 block truncate">
            {summary.psychologyCompletionFormatted}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block truncate">
            Emotional tags logged
          </span>
        </div>
      </div>

      {/* Transparent Health Breakdown Modal */}
      {showHealthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowHealthModal(false)}
        >
          <div 
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Trader Health Score: Transparent Breakdown
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every point is calculated directly from your recorded trade records, checklist audits, and journal depth. There are no mysterious AI estimates or hidden variables.
            </p>

            <div className="space-y-3">
              {Object.entries(healthScore.components).map(([key, comp]) => (
                <div 
                  key={key} 
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">
                      {comp.score} / {comp.max} pts
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all"
                      style={{ width: `${(comp.score / comp.max) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{comp.note}</span>
                    <span>{comp.calculation}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
