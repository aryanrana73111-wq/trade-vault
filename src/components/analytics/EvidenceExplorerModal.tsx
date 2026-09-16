import React from 'react';
import { X, ExternalLink, Info, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Trade } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { generateEvidenceStrength } from '@/lib/analyticsEngine';

interface EvidenceExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: string;
  methodology: string;
  limitations: string;
  trades: Trade[];
  statisticLabel: string;
  statisticValue: string | React.ReactNode;
}

export function EvidenceExplorerModal({
  isOpen,
  onClose,
  claim,
  methodology,
  limitations,
  trades,
  statisticLabel,
  statisticValue
}: EvidenceExplorerModalProps) {
  if (!isOpen) return null;

  const strength = generateEvidenceStrength(trades.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Evidence Explorer</h2>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Institutional Data Validation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Claim & Verdict */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hypothesis / Claim</div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-sm leading-relaxed">
              "{claim}"
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Key Statistic</div>
              <div className="text-2xl font-bold text-slate-900">{statisticValue}</div>
              <div className="text-xs text-slate-500 mt-0.5">{statisticLabel}</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sample Size</div>
              <div className="text-2xl font-bold text-slate-900">{trades.length} <span className="text-sm font-medium text-slate-500">trades</span></div>
              <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${strength.color}`}>
                {strength.label}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Methodology</div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {methodology}
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Limitations & Assumptions</div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <p>{limitations}</p>
            </div>
          </div>

          {/* Exact Trades Viewer (Preview) */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Underlying Evidence ({trades.length} Records)</span>
            </div>
            
            {trades.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-sm text-slate-500">
                No trades match this evidence query.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 font-medium text-slate-600">Date</th>
                      <th className="px-3 py-2 font-medium text-slate-600">Market</th>
                      <th className="px-3 py-2 font-medium text-slate-600">Direction</th>
                      <th className="px-3 py-2 font-medium text-slate-600">PnL</th>
                      <th className="px-3 py-2 font-medium text-slate-600">R-Mult</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trades.map(t => {
                      const r = t.rMultiple ?? (t.pnl && t.risk ? t.pnl / t.risk : 0);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2 text-slate-600">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{t.market}</td>
                          <td className="px-3 py-2">
                            <span className={t.direction === 'BUY' ? 'text-blue-600' : 'text-red-600'}>{t.direction}</span>
                          </td>
                          <td className="px-3 py-2 font-medium">
                            <span className={(t.pnl || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {formatCurrency(t.pnl || 0)}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-600">
                            {r.toFixed(2)}R
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={onClose}>Close Explorer</Button>
        </div>
      </div>
    </div>
  );
}
