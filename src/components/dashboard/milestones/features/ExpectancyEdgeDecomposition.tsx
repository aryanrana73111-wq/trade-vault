import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { calculateExpectancyDecomposition } from '@/lib/milestoneAnalytics';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/Input';
import { Scale, Zap, Info, DollarSign, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ExpectancyEdgeDecompositionProps {
  trades: Trade[];
}

export function ExpectancyEdgeDecomposition({ trades }: ExpectancyEdgeDecompositionProps) {
  const analytics = useMemo(() => calculateExpectancyDecomposition(trades), [trades]);

  const pieData = useMemo(() => {
    return [
      { name: 'Gross Wins Contribution', value: analytics.grossProfit, color: '#10B981' },
      { name: 'Gross Losses Drag', value: analytics.grossLoss, color: '#F43F5E' }
    ].filter(d => d.value > 0);
  }, [analytics]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Expectancy & Edge Decomposition</h4>
            <p className="text-xs text-slate-400">Deconstructs your mathematical edge across win probability, payoff ratio, and profit factor</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Net Expectancy:</span>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${
            analytics.mathematicalExpectancy >= 0
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {analytics.mathematicalExpectancy >= 0 ? `+${formatCurrency(analytics.mathematicalExpectancy)} / trade` : `-${formatCurrency(Math.abs(analytics.mathematicalExpectancy))} / trade`}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Profit Factor</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold ${analytics.profitFactor >= 1.5 ? 'text-emerald-400' : analytics.profitFactor >= 1.0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {analytics.profitFactor}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">${analytics.grossProfit} win / ${analytics.grossLoss} loss</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Payoff Ratio (Win / Loss)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-white">{analytics.payoffRatio}:1</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Avg Win ${analytics.avgWinDollars} vs Loss ${analytics.avgLossDollars}</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Expectancy in R</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-bold ${analytics.expectancyRMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {analytics.expectancyRMultiple >= 0 ? `+${analytics.expectancyRMultiple}R` : `${analytics.expectancyRMultiple}R`}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Average R return per trade</span>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <span className="text-xs font-medium text-slate-400 block">Fee & Swap Friction</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-300">-${analytics.totalTradingCostImpact}</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Recorded commissions & rollover</span>
        </Card>
      </div>

      {/* Edge Decomposition Formulas & Visual Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5 bg-slate-900/70 border-slate-800 space-y-3">
          <h5 className="text-sm font-semibold text-white">Mathematical Edge Formulation</h5>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-slate-400 block text-[10px]">Expectancy Equation</span>
              <span className="text-emerald-400 font-bold">{analytics.formulas.expectancyFormula}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-slate-400 block text-[10px]">Profit Factor Equation</span>
              <span className="text-blue-400 font-bold">{analytics.formulas.profitFactorFormula}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-slate-400 block text-[10px]">Payoff Ratio Equation</span>
              <span className="text-purple-400 font-bold">{analytics.formulas.payoffFormula}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 bg-slate-900/70 border-slate-800 flex flex-col justify-between">
          <div>
            <h5 className="text-sm font-semibold text-white mb-1">Win Contribution vs Loss Drag</h5>
            <p className="text-xs text-slate-400">Total gross volume composition</p>
          </div>

          <div className="flex items-center justify-center h-48">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0];
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-2 rounded-lg text-xs text-white">
                            <p className="font-bold">{d.name}</p>
                            <p className="text-slate-300">${d.value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">No volume data available.</span>
            )}
          </div>

          <div className="flex items-center justify-around text-xs pt-2 border-t border-slate-800">
            <span className="text-emerald-400 font-bold">Wins: {analytics.winContributionPct}%</span>
            <span className="text-rose-400 font-bold">Losses: {analytics.lossDragPct}%</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
