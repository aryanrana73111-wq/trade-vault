import React, { useMemo } from 'react';
import { Trade, Rule } from '@/types';
import { calculateRuleAdherenceImpact } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Award } from 'lucide-react';

interface RuleAdherenceImpactProps {
  trades: Trade[];
  rules?: Rule[];
}

export function RuleAdherenceImpact({ trades, rules = [] }: RuleAdherenceImpactProps) {
  const analytics = useMemo(() => calculateRuleAdherenceImpact(trades, rules), [trades, rules]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Rule Adherence & Discipline Impact</h4>
            <p className="text-xs text-slate-400">Direct monetary and R-multiple comparison of strictly following vs violating your playbook rules</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Adherence Rate:</span>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${
            analytics.overallAdherenceRate >= 80
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {analytics.overallAdherenceRate}% Followed
          </span>
        </div>
      </div>

      {/* Side-by-side Followed vs Violated Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rules Followed Card */}
        <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>When Rules Were Followed</span>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
              Discipline Alpha
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <span className="text-xs text-slate-400 block">Total P&L</span>
              <span className="text-2xl font-bold text-emerald-400">
                +{formatCurrency(analytics.pnlWhenRulesFollowed)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Win Rate</span>
              <span className="text-2xl font-bold text-white">
                {analytics.winRateWhenFollowed}%
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Average R</span>
              <span className="text-xl font-bold text-emerald-400">
                +{analytics.avgRWhenRulesFollowed}R
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Sample</span>
              <span className="text-xl font-bold text-slate-300">
                {trades.length - analytics.totalViolationsCount} trades
              </span>
            </div>
          </div>
        </Card>

        {/* Rules Violated Card */}
        <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4" />
              <span>When Rules Were Violated</span>
            </div>
            <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-semibold border border-rose-500/20">
              Discipline Cost
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <span className="text-xs text-slate-400 block">Total P&L</span>
              <span className="text-2xl font-bold text-rose-400">
                {formatCurrency(analytics.pnlWhenRulesViolated)}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Win Rate</span>
              <span className="text-2xl font-bold text-white">
                {analytics.winRateWhenViolated}%
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Average R</span>
              <span className="text-xl font-bold text-rose-400">
                {analytics.avgRWhenRulesViolated}R
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Violations</span>
              <span className="text-xl font-bold text-slate-300">
                {analytics.totalViolationsCount} trades
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Broken Rules List */}
      <Card className="p-4 sm:p-5 bg-slate-900/70 border-slate-800">
        <h5 className="text-sm font-semibold text-white mb-1">Most Frequently Violated Playbook Rules</h5>
        <p className="text-xs text-slate-400 mb-4">Identify which discipline breaches caused the largest drag on your bottom line</p>

        <div className="space-y-2">
          {analytics.mostViolatedRules.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[10px]">
                  #{idx + 1}
                </span>
                <span className="font-medium text-slate-200">{r.ruleText}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">{r.violationCount} instances</span>
                <span className={`font-mono font-bold ${r.impactDollars >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {r.impactDollars >= 0 ? '+' : ''}{formatCurrency(r.impactDollars)}
                </span>
              </div>
            </div>
          ))}
          {analytics.mostViolatedRules.length === 0 && (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero rule violations recorded. Outstanding discipline!</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
