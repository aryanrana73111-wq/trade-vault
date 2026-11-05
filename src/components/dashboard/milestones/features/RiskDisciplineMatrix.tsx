import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateRiskDisciplineAnalytics } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface RiskDisciplineMatrixProps {
  trades: Trade[];
}

export function RiskDisciplineMatrix({ trades }: RiskDisciplineMatrixProps) {
  const analytics = useMemo(() => calculateRiskDisciplineAnalytics(trades), [trades]);

  const historyData = useMemo(() => {
    return analytics.riskDeviationHistory.slice(-20).map((d, idx) => ({
      index: idx + 1,
      label: `T${idx + 1} (${d.market})`,
      planned: d.plannedRisk,
      actual: d.actualRisk,
      deviation: d.deviation,
      result: d.result,
      date: format(new Date(d.date), 'MMM dd')
    }));
  }, [analytics.riskDeviationHistory]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Risk Discipline & Sizing Variance</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Audits planned risk vs actual executed risk to eliminate emotional sizing drift</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">Discipline Score:</span>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${
            analytics.disciplinedTradesPct >= 80
              ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30'
              : analytics.disciplinedTradesPct >= 60
              ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30'
              : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {analytics.disciplinedTradesPct}% On-Target
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Avg Planned Risk</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold text-slate-900 dark:text-white">${analytics.avgPlannedRisk}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Actual: ${analytics.avgActualRisk}</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Average Risk Deviation</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${analytics.avgDeviationPct <= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              ±{analytics.avgDeviationPct}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Max Deviation: {analytics.maxDeviationPct}%</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Risk Escalation After Wins</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${analytics.riskEscalationAfterWinsPct <= 15 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {analytics.riskEscalationAfterWinsPct}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Overconfidence inflation rate</span>
        </Card>

        <Card className="p-4 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Risk Escalation After Losses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold ${analytics.riskEscalationAfterLossesPct <= 15 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {analytics.riskEscalationAfterLossesPct}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">Revenge sizing frequency</span>
        </Card>
      </div>

      {/* Sizing Deviation History Chart */}
      <Card className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">Planned vs Actual Risk Trajectory</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tracking sizing variance across recent trades</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-blue-500 dark:bg-blue-400" /> Planned</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-purple-500 dark:bg-purple-400" /> Actual</span>
          </div>
        </div>

        {historyData.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">{d.label} • {d.date}</p>
                          <p className="text-slate-600 dark:text-slate-300">Planned Risk: <strong className="text-blue-600 dark:text-blue-400">${d.planned}</strong></p>
                          <p className="text-slate-600 dark:text-slate-300">Actual Risk: <strong className="text-purple-600 dark:text-purple-400">${d.actual}</strong></p>
                          <p className="text-slate-600 dark:text-slate-300">Deviation: <strong className={d.deviation > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>{d.deviation > 0 ? `+${d.deviation}%` : `${d.deviation}%`}</strong></p>
                          <p className="text-slate-500 dark:text-slate-400">Result: <span className="font-semibold text-slate-900 dark:text-white">{d.result}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="planned" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="actual" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: '#a855f7', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
            No risk variance records found.
          </div>
        )}
      </Card>
    </div>
  );
}
