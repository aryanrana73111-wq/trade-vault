import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { ShieldCheck, AlertCircle, Info, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RuleAdherenceInsightProps {
  trades: Trade[];
  className?: string;
}

export const RuleAdherenceInsight: React.FC<RuleAdherenceInsightProps> = ({ trades, className }) => {
  const stats = useMemo(() => {
    // Trades with recorded ruleAdherence
    const tradesWithAdherence = trades.filter(
      (t) => t.ruleAdherence !== undefined && typeof t.ruleAdherence === 'number'
    );

    if (tradesWithAdherence.length === 0) {
      return null;
    }

    const followed = tradesWithAdherence.filter((t) => (t.ruleAdherence || 0) >= 90);
    const broken = tradesWithAdherence.filter((t) => (t.ruleAdherence || 0) < 90);

    const calcGroup = (group: Trade[]) => {
      const closed = group.filter((t) => t.result === 'WIN' || t.result === 'LOSS');
      const wins = closed.filter((t) => t.result === 'WIN').length;
      const winRate = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0;
      const totalPnl = group.reduce((sum, t) => sum + (t.pnl || 0), 0);
      return {
        total: group.length,
        closed: closed.length,
        wins,
        winRate,
        totalPnl,
      };
    };

    const overallAdherenceAvg = Math.round(
      tradesWithAdherence.reduce((acc, t) => acc + (t.ruleAdherence || 0), 0) /
        tradesWithAdherence.length
    );

    return {
      totalRecorded: tradesWithAdherence.length,
      overallAdherenceAvg,
      followed: calcGroup(followed),
      broken: calcGroup(broken),
    };
  }, [trades]);

  if (!stats) {
    return (
      <Card className={cn("p-4 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs", className)}>
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Rule Adherence Observations
            </span>
            <p className="mt-0.5 leading-relaxed text-slate-500 dark:text-slate-400">
              No trades with recorded checklist adherence yet. As you mark strategy checklists in Add Trade, objective historical adherence data will automatically populate here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Historical Rule Adherence Data
          </h4>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
          {stats.totalRecorded} Trades Recorded
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {/* Overall Adherence */}
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Average Adherence</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={cn("text-2xl font-bold tracking-tight", stats.overallAdherenceAvg >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
              {stats.overallAdherenceAvg}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Across logged checklist steps</p>
        </div>

        {/* Followed Rules */}
        <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">Rule Compliant</p>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {stats.followed.total}
            </span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">
              trades (≥90% score)
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
            {stats.followed.closed > 0 ? `${stats.followed.winRate}% win rate recorded` : 'No closed trades yet'}
          </p>
        </div>

        {/* Violations */}
        <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">Rule Deviations</p>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              {stats.broken.total}
            </span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">
              trades (&lt;90% score)
            </span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
            {stats.broken.closed > 0 ? `${stats.broken.winRate}% win rate recorded` : 'No closed trades yet'}
          </p>
        </div>
      </div>

      {/* Strict Compliance Notice */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed italic">
        Historical observation notice: Adherence figures represent factual past entries logged in your TradeVault journal. They do not constitute financial advice, psychological diagnosis, or a guarantee of future performance.
      </p>
    </Card>
  );
};
