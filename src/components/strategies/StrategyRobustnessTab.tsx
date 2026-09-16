import React, { useMemo } from 'react';
import { Strategy, Trade } from '@/types';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { Card } from '@/components/ui/Input';
import { ShieldAlert, Info, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface StrategyRobustnessTabProps {
  strategy: Strategy;
  trades: Trade[];
}

export function StrategyRobustnessTab({ strategy, trades }: StrategyRobustnessTabProps) {
  const closedTrades = useMemo(() => trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN'), [trades]);

  const marketRobustness = useMemo(() => {
    const byMarket = new Map<string, Trade[]>();
    closedTrades.forEach(t => {
      const m = t.market || 'Unknown';
      if (!byMarket.has(m)) byMarket.set(m, []);
      byMarket.get(m)!.push(t);
    });
    
    return Array.from(byMarket.entries()).map(([market, mTrades]) => ({
      market,
      trades: mTrades.length,
      metrics: calculateInstitutionalMetrics(mTrades)
    })).sort((a,b) => b.trades - a.trades);
  }, [closedTrades]);

  const sessionRobustness = useMemo(() => {
    const bySession = new Map<string, Trade[]>();
    closedTrades.forEach(t => {
      const s = t.session || 'Unknown';
      if (!bySession.has(s)) bySession.set(s, []);
      bySession.get(s)!.push(t);
    });
    return Array.from(bySession.entries()).map(([session, sTrades]) => ({
      session,
      trades: sTrades.length,
      metrics: calculateInstitutionalMetrics(sTrades)
    })).sort((a,b) => b.trades - a.trades);
  }, [closedTrades]);

  if (closedTrades.length < 10) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Insufficient Data for Robustness Analysis</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          A minimum of 10 trades is required to begin testing strategy robustness across different market conditions. You currently have {closedTrades.length}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium rounded-lg">
        <Info className="w-4 h-4 shrink-0" />
        <p><strong>Robustness Analysis:</strong> Evaluates performance stability across distinct market environments to identify vulnerability to regime changes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Robustness */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            Market Sensitivity
          </h3>
          <div className="space-y-4">
            {marketRobustness.map((m, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{m.market}</div>
                  <div className="text-[11px] text-slate-500">{m.trades} trades</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${m.metrics.expectancy >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Exp: {formatCurrency(m.metrics.expectancy)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    WR: {formatNumber(m.metrics.winRate, 1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Session Robustness */}
        <Card className="p-6 border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            Session Stability
          </h3>
          <div className="space-y-4">
            {sessionRobustness.map((s, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{s.session}</div>
                  <div className="text-[11px] text-slate-500">{s.trades} trades</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-sm ${s.metrics.expectancy >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    Exp: {formatCurrency(s.metrics.expectancy)}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    WR: {formatNumber(s.metrics.winRate, 1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
