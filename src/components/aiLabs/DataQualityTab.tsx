import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Database, 
  FileEdit, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart
} from 'lucide-react';
import { Trade } from '@/types';
import { DataQualityAudit } from '@/types/aiLabs';
import { auditDataQuality } from '@/lib/aiLabs/engine';
import { Button } from '@/components/ui/Button';

interface DataQualityTabProps {
  trades: Trade[];
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
}

export const DataQualityTab: React.FC<DataQualityTabProps> = ({
  trades,
  onOpenEvidence
}) => {
  const audit: DataQualityAudit = auditDataQuality(trades);
  const [filterMissing, setFilterMissing] = useState<string>('all');

  const filteredIncomplete = audit.incompleteTrades.filter(item => {
    if (filterMissing === 'all') return true;
    return item.missingFields.some(f => f.toLowerCase().includes(filterMissing.toLowerCase()));
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Data Quality & Completeness Audit
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          High-integrity records produce reliable AI observations. Incomplete records degrade statistical confidence.
        </p>
      </div>

      {/* Overview Score Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular/Gauge Score */}
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={audit.overallScore >= 80 ? 'text-emerald-500' : audit.overallScore >= 60 ? 'text-blue-500' : 'text-amber-500'}
                strokeDasharray={`${audit.overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{audit.overallScore}%</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">Quality</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {audit.overallScore >= 85 
                ? 'Excellent Journal Integrity' 
                : audit.overallScore >= 65 
                ? 'Moderate Journal Completeness' 
                : 'Data Quality Needs Attention'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
              {audit.completeRecords} of your {audit.totalTrades} recorded trades ({audit.totalTrades > 0 ? ((audit.completeRecords / audit.totalTrades) * 100).toFixed(0) : 100}%) have all essential parameters logged.
            </p>
          </div>
        </div>

        {/* Why Quality Matters Box */}
        <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl p-4 text-xs max-w-sm">
          <strong className="text-blue-900 dark:text-blue-300 block mb-1 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Why Quality Matters
          </strong>
          <span className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed block">
            AI observations are strictly calculated from recorded fields. Omitting session tags or emotional notes prevents behavioral correlation.
          </span>
        </div>
      </div>

      {/* Field Completeness Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Missing Session', count: audit.missingSessions, key: 'Session' },
          { label: 'Missing Strategy', count: audit.missingStrategies, key: 'Strategy' },
          { label: 'Missing Emotion', count: audit.missingPsychology, key: 'Emotion' },
          { label: 'Missing R / Price', count: audit.missingR, key: 'R' },
          { label: 'Missing Adherence', count: audit.missingAdherence, key: 'Adherence' },
          { label: 'Missing Screenshot', count: audit.missingScreenshots, key: 'Screenshot' },
          { label: 'Missing Notes', count: audit.missingNotes, key: 'Notes' },
        ].map((item, idx) => (
          <button
            key={idx}
            onClick={() => setFilterMissing(filterMissing === item.key ? 'all' : item.key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterMissing === item.key
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 shadow-xs'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">{item.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-lg font-bold ${item.count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {item.count}
              </span>
              <span className="text-[10px] text-slate-400">trades</span>
            </div>
          </button>
        ))}
      </div>

      {/* Incomplete Trades Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Trades With Missing Information ({filteredIncomplete.length})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any trade to inspect and identify missing fields.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={filterMissing}
              onChange={(e) => setFilterMissing(e.target.value)}
              className="text-xs p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Incomplete</option>
              <option value="Session">Missing Session</option>
              <option value="Strategy">Missing Strategy</option>
              <option value="Emotion">Missing Emotion</option>
              <option value="R">Missing R / Stop Loss</option>
              <option value="Adherence">Missing Rule Adherence</option>
              <option value="Screenshot">Missing Screenshot</option>
            </select>
          </div>
        </div>

        {filteredIncomplete.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No trades match the selected data completeness filter.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredIncomplete.map(({ trade, missingFields }) => (
              <div
                key={trade.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {trade.market} ({trade.direction})
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">
                      {new Date(trade.date).toLocaleDateString()}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-slate-500">
                      P&L: ${trade.pnl || 0}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Missing:</span>
                    {missingFields.map(f => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium text-[10px]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenEvidence(
                    `Trade #${trade.id.slice(0, 8)} Audit`,
                    `Missing: ${missingFields.join(', ')}`,
                    [trade.id]
                  )}
                  className="text-xs flex items-center gap-1 self-end sm:self-center"
                >
                  <ExternalLink className="w-3 h-3" /> Inspect Trade
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
