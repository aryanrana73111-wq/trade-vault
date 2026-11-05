import React, { useMemo } from 'react';
import { Trade, Rule } from '@/types';
import { calculateConsistencyProcessScore } from '@/lib/milestoneAnalytics';
import { Card } from '@/components/ui/Input';
import { Award, CheckCircle2, AlertTriangle, ShieldCheck, BookOpenCheck, Activity, Info } from 'lucide-react';

interface ConsistencyProcessScoreProps {
  trades: Trade[];
  rules?: Rule[];
}

export function ConsistencyProcessScore({ trades, rules = [] }: ConsistencyProcessScoreProps) {
  const analytics = useMemo(() => calculateConsistencyProcessScore(trades, rules), [trades, rules]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Consistency & Process Scorecard</h4>
            <p className="text-xs text-slate-400">Objective, transparent audit of discipline, journal depth, and risk execution consistency</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Composite Process:</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-sm ${
            analytics.overallScore !== null && analytics.overallScore >= 80
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : analytics.overallScore !== null && analytics.overallScore >= 60
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <Award className="w-4 h-4" />
            {analytics.overallScore !== null ? `${analytics.overallScore}/100` : 'Insufficient Data'}
          </span>
        </div>
      </div>

      {/* Non-predictive Disclaimer Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p>
          <strong>Behavioral Audit Only:</strong> This process score measures historical execution discipline and journaling adherence. It is not a predictive guarantee of future market profitability.
        </p>
      </div>

      {/* Pillar Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {analytics.components.map((comp, idx) => (
          <Card key={idx} className="p-4 bg-slate-900/70 border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-white">{comp.name}</span>
                <span className="text-[11px] text-slate-500 block">{comp.description}</span>
              </div>
              <div className="text-right">
                {comp.score !== null ? (
                  <span className={`text-xl font-black ${
                    comp.score >= 80 ? 'text-emerald-400' : comp.score >= 60 ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {comp.score}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 font-semibold">Not enough data</span>
                )}
                <span className="text-[10px] text-slate-500 block">Weight: {comp.weight}%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              {comp.score !== null ? (
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    comp.score >= 80 ? 'bg-emerald-500' : comp.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${comp.score}%` }}
                />
              ) : (
                <div className="h-full bg-slate-700 w-1/4 rounded-full" />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
