import React, { useMemo } from 'react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Target, Activity, AlertTriangle, Search } from 'lucide-react';
import { calculateInstitutionalMetrics } from '@/lib/analyticsEngine';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface CorrelationLabProps {
  trades: Trade[];
}

export function CorrelationLab({ trades }: CorrelationLabProps) {
  const correlations = useMemo(() => {
    const closedTrades = trades.filter(t => t.result === 'WIN' || t.result === 'LOSS' || t.result === 'BREAK EVEN');
    if (closedTrades.length < 10) return null;

    // Time of day (Hours) vs Expectancy
    const hourlyGroups = new Map<string, Trade[]>();
    closedTrades.forEach(t => {
      if (!t.time) return;
      const hour = t.time.split(':')[0] + ':00';
      if (!hourlyGroups.has(hour)) hourlyGroups.set(hour, []);
      hourlyGroups.get(hour)!.push(t);
    });
    
    let bestHour = { hour: '-', exp: -99999, size: 0 };
    let worstHour = { hour: '-', exp: 99999, size: 0 };
    
    hourlyGroups.forEach((groupTrades, hour) => {
      if (groupTrades.length >= 3) {
        const metrics = calculateInstitutionalMetrics(groupTrades);
        if (metrics.expectancy > bestHour.exp) bestHour = { hour, exp: metrics.expectancy, size: groupTrades.length };
        if (metrics.expectancy < worstHour.exp) worstHour = { hour, exp: metrics.expectancy, size: groupTrades.length };
      }
    });

    // Session vs Win Rate
    const sessionGroups = new Map<string, Trade[]>();
    closedTrades.forEach(t => {
      const s = t.session || 'Unknown';
      if (!sessionGroups.has(s)) sessionGroups.set(s, []);
      sessionGroups.get(s)!.push(t);
    });

    let bestSession = { name: '-', wr: -1, size: 0 };
    let worstSession = { name: '-', wr: 101, size: 0 };
    
    sessionGroups.forEach((groupTrades, session) => {
      if (groupTrades.length >= 3) {
        const metrics = calculateInstitutionalMetrics(groupTrades);
        if (metrics.winRate > bestSession.wr) bestSession = { name: session, wr: metrics.winRate, size: groupTrades.length };
        if (metrics.winRate < worstSession.wr) worstSession = { name: session, wr: metrics.winRate, size: groupTrades.length };
      }
    });

    return {
      bestHour,
      worstHour,
      bestSession,
      worstSession
    };

  }, [trades]);

  if (!correlations) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Insufficient Data</h3>
        <p className="text-xs text-slate-500 max-w-sm">Requires at least 10 closed trades to find correlations.</p>
      </div>
    );
  }

  return (
    <Card className="p-6 border-slate-200 shadow-sm mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
          <Search className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Correlation Lab</h2>
          <p className="text-xs text-slate-500">
            Algorithmic scan of your data to find hidden performance correlations.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Time of Day vs Expectancy</h4>
          
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-slate-500">Most Profitable Hour</div>
              <div className="text-sm font-semibold text-slate-900">{correlations.bestHour.hour}</div>
              <div className="text-[10px] text-slate-400">({correlations.bestHour.size} trades)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-600">Exp: {formatCurrency(correlations.bestHour.exp)}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-500">Least Profitable Hour</div>
              <div className="text-sm font-semibold text-slate-900">{correlations.worstHour.hour}</div>
              <div className="text-[10px] text-slate-400">({correlations.worstHour.size} trades)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600">Exp: {formatCurrency(correlations.worstHour.exp)}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Session vs Win Rate</h4>
          
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-slate-500">Highest Win Rate Session</div>
              <div className="text-sm font-semibold text-slate-900">{correlations.bestSession.name}</div>
              <div className="text-[10px] text-slate-400">({correlations.bestSession.size} trades)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-emerald-600">WR: {formatNumber(correlations.bestSession.wr, 1)}%</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-slate-500">Lowest Win Rate Session</div>
              <div className="text-sm font-semibold text-slate-900">{correlations.worstSession.name}</div>
              <div className="text-[10px] text-slate-400">({correlations.worstSession.size} trades)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-red-600">WR: {formatNumber(correlations.worstSession.wr, 1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
