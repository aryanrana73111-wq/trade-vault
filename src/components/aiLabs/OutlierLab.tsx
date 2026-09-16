import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { AlertOctagon, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';

interface OutlierLabProps {
  trades: Trade[];
}

export function OutlierLab({ trades }: OutlierLabProps) {
  const outliers = useMemo(() => {
    const closedTrades = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
    if (closedTrades.length < 10) return null;

    const sortedByPnL = [...closedTrades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    
    const largestWin = sortedByPnL[0];
    const largestLoss = sortedByPnL[sortedByPnL.length - 1];
    
    // Find risk outliers (trades where loss > maxRisk or loss > 2x average risk)
    const validRiskTrades = closedTrades.filter(t => (t.risk || 0) > 0);
    const avgRisk = validRiskTrades.length > 0 
      ? validRiskTrades.reduce((acc, t) => acc + (t.risk || 0), 0) / validRiskTrades.length 
      : 100; // default assumption if no risk defined
    
    const riskViolations = closedTrades.filter(t => t.result === 'LOSS' && Math.abs(t.pnl || 0) > (avgRisk * 2));

    return {
      largestWin,
      largestLoss,
      riskViolations
    };
  }, [trades]);

  if (!outliers) {
    return null; // Will just hide if not enough data
  }

  return (
    <Card className="p-6 border-slate-200 shadow-sm mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg shrink-0">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Outlier Analysis</h2>
          <p className="text-xs text-slate-500">
            Identify statistical anomalies and extreme tail events in your trading history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800 uppercase">Largest Windfall</span>
          </div>
          <div className="text-xl font-bold text-emerald-700 mb-1">
            {outliers.largestWin.pnl ? formatCurrency(outliers.largestWin.pnl) : '--'}
          </div>
          <div className="text-xs text-emerald-600">
            {outliers.largestWin.market} • {outliers.largestWin.strategy}
          </div>
        </div>

        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-red-800 uppercase">Largest Drawdown</span>
          </div>
          <div className="text-xl font-bold text-red-700 mb-1">
            {outliers.largestLoss.pnl ? formatCurrency(outliers.largestLoss.pnl) : '--'}
          </div>
          <div className="text-xs text-red-600">
            {outliers.largestLoss.market} • {outliers.largestLoss.strategy}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700 uppercase">Risk Violations</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mb-1">
            {outliers.riskViolations.length} <span className="text-sm font-normal text-slate-500">trades</span>
          </div>
          <div className="text-xs text-slate-500">
            Losses exceeding 2x average risk
          </div>
        </div>

      </div>
    </Card>
  );
}
