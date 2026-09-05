import React from 'react';
import { Card } from '@/components/ui/Input';
import { PsychologyOverviewMetrics } from '@/lib/psychology';
import { cn } from '@/lib/utils';
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  TrendingUp,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

interface PsychologyOverviewProps {
  metrics: PsychologyOverviewMetrics;
}

export const PsychologyOverview: React.FC<PsychologyOverviewProps> = ({ metrics }) => {
  return (
    <div className="space-y-4">
      {/* Top 4 primary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Trades & Trades with Psychology */}
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recorded Data
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.tradesWithPsychology} <span className="text-sm font-normal text-slate-400">/ {metrics.totalTrades}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {metrics.totalTrades > 0 ? `${Math.round((metrics.tradesWithPsychology / metrics.totalTrades) * 100)}% of trades have psychology` : 'No trades recorded yet'}
            </p>
          </div>
        </Card>

        {/* Psychology Completion % */}
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg Completion
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.completionPercent !== null ? `${metrics.completionPercent}%` : <span className="text-sm font-medium text-slate-400">Insufficient Data</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Field completion across journal records
            </p>
          </div>
        </Card>

        {/* Rule Adherence % */}
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rule Adherence
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.ruleAdherencePercent !== null ? `${metrics.ruleAdherencePercent}%` : <span className="text-sm font-medium text-slate-400">Insufficient Data</span>}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Adherence to execution protocols
            </p>
          </div>
        </Card>

        {/* Calm / Disciplined Win Rate & Avg R */}
        <Card className="p-4 sm:p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Calm Mindset Win %
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {metrics.calmWinRate !== null ? (
                <span>
                  {metrics.calmWinRate}% <span className="text-xs font-medium text-slate-500">({metrics.calmAvgR !== null ? `${metrics.calmAvgR > 0 ? '+' : ''}${metrics.calmAvgR}R` : ''})</span>
                </span>
              ) : (
                <span className="text-sm font-medium text-slate-400">Insufficient Data</span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Historical performance when calm/confident
            </p>
          </div>
        </Card>
      </div>

      {/* Behavioral Signals Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            metrics.fomoEvents > 0 ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">FOMO Events</div>
            <div className="font-bold text-base text-slate-900 dark:text-slate-100">{metrics.fomoEvents}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            metrics.possibleRevengeCount > 0 ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Possible Revenge Patterns</div>
            <div className="font-bold text-base text-slate-900 dark:text-slate-100">{metrics.possibleRevengeCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            metrics.riskDeviationsCount > 0 ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}>
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Risk Deviations</div>
            <div className="font-bold text-base text-slate-900 dark:text-slate-100">{metrics.riskDeviationsCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            metrics.overtradingSignalsCount > 0 ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          )}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Overtrading Signals</div>
            <div className="font-bold text-base text-slate-900 dark:text-slate-100">{metrics.overtradingSignalsCount}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
