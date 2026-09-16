import React from 'react';
import { Strategy } from '@/types';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Input';
import { CheckCircle2, History, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface StrategyVersionsTabProps {
  strategy: Strategy;
}

export function StrategyVersionsTab({ strategy }: StrategyVersionsTabProps) {
  const versions = strategy.versions || [];

  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
        <Clock className="w-8 h-8 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Historical Versions</h3>
        <p className="text-sm text-slate-500 max-w-sm">
          When you edit strategy rules, the system will automatically snapshot previous versions here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="relative border-l-2 border-slate-200 ml-3 md:ml-6 space-y-8 pb-8">
        {versions.slice().reverse().map((v, idx) => (
          <div key={idx} className="relative pl-6 md:pl-10">
            <span className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
            </span>
            
            <Card className="p-5 border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Version {v.version}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Archived
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Archived on {format(v.updatedAt, 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {v.changes && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rule Changes</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {v.changes}
                    </p>
                  </div>
                )}
                
                {v.reasonForChange && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason for Modification</h4>
                    <p className="text-sm text-slate-700">
                      {v.reasonForChange}
                    </p>
                  </div>
                )}

                {v.performanceBeforeChange && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Performance Before Change</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Trades</div>
                        <div className="text-sm font-bold text-slate-900">{v.performanceBeforeChange.trades}</div>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Win Rate</div>
                        <div className="text-sm font-bold text-slate-900">{formatNumber(v.performanceBeforeChange.winRate, 1)}%</div>
                      </div>
                      <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Expectancy</div>
                        <div className={`text-sm font-bold ${v.performanceBeforeChange.expectancy >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {formatCurrency(v.performanceBeforeChange.expectancy)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {v.researchNotes && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Research Notes</h4>
                    <p className="text-sm text-slate-700 italic">
                      "{v.researchNotes}"
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
