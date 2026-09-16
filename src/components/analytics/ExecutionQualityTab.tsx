import React, { useMemo, useState } from 'react';
import { Trade } from '@/types';
import { Card } from '@/components/ui/Input';
import { Target, TrendingDown, Clock, MousePointerClick, ShieldAlert, Crosshair, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface ExecutionQualityTabProps {
  trades: Trade[];
}

export function ExecutionQualityTab({ trades }: ExecutionQualityTabProps) {
  const executionStats = useMemo(() => {
    let slippageTotal = 0;
    let spreadTotal = 0;
    let commissionTotal = 0;
    let validSlippageCount = 0;
    let validSpreadCount = 0;
    
    let missedEntries = 0;
    let lateEntries = 0;

    trades.forEach(t => {
      if (t.execution?.slippage !== undefined) {
        slippageTotal += Number(t.execution.slippage);
        validSlippageCount++;
      }
      if (t.execution?.spread !== undefined) {
        spreadTotal += Number(t.execution.spread);
        validSpreadCount++;
      }
      if (t.execution?.commission !== undefined) {
        commissionTotal += Number(t.execution.commission);
      }
      
      if (t.execution?.plannedEntry !== undefined && t.entry) {
        const planned = Number(t.execution.plannedEntry);
        const actual = Number(t.entry);
        if (t.direction === 'BUY') {
          if (actual > planned) lateEntries++;
          else if (actual < planned) missedEntries++;
        } else {
          if (actual < planned) lateEntries++;
          else if (actual > planned) missedEntries++;
        }
      }
    });

    return {
      avgSlippage: validSlippageCount > 0 ? slippageTotal / validSlippageCount : 0,
      avgSpread: validSpreadCount > 0 ? spreadTotal / validSpreadCount : 0,
      totalCommission: commissionTotal,
      lateEntries,
      missedEntries,
      validSlippageCount,
      validSpreadCount
    };
  }, [trades]);

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <Target className="w-8 h-8 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Insufficient Data for Execution Analytics</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          Start recording planned vs. actual entries and execution costs in your journal to generate these insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 shadow-sm border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Slippage</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {executionStats.validSlippageCount > 0 ? formatNumber(executionStats.avgSlippage, 2) : '-'} <span className="text-sm font-normal text-slate-500">ticks/pips</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Based on {executionStats.validSlippageCount} recorded trades</p>
        </Card>

        <Card className="p-5 shadow-sm border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded">
              <Crosshair className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Spread</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {executionStats.validSpreadCount > 0 ? formatNumber(executionStats.avgSpread, 2) : '-'} <span className="text-sm font-normal text-slate-500">ticks/pips</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Based on {executionStats.validSpreadCount} recorded trades</p>
        </Card>

        <Card className="p-5 shadow-sm border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-rose-100 text-rose-600 rounded">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Comm/Fees</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(executionStats.totalCommission)}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Total explicitly tracked costs</p>
        </Card>

        <Card className="p-5 shadow-sm border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Timing Deviation</span>
          </div>
          <div className="flex justify-between items-end">
             <div>
               <div className="text-lg font-bold text-slate-900">{executionStats.lateEntries}</div>
               <div className="text-[10px] text-slate-500">Late Entries</div>
             </div>
             <div>
               <div className="text-lg font-bold text-slate-900">{executionStats.missedEntries}</div>
               <div className="text-[10px] text-slate-500">Early Entries</div>
             </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Vs. Planned Entry Price</p>
        </Card>
      </div>
      
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-start gap-4">
        <ShieldAlert className="w-6 h-6 text-slate-400 shrink-0" />
        <div>
          <h4 className="font-semibold text-slate-900">Why track execution quality?</h4>
          <p className="text-sm text-slate-600 mt-1">
            Institutional traders obsess over transaction costs because slippage, spread, and commissions can erode edge over a large sample.
            If your backtest shows a 0.2R expected value, but you lose 0.15R per trade to execution friction, your strategy is unprofitable in the live market.
          </p>
        </div>
      </div>
    </div>
  );
}
