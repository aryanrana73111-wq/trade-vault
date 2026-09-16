import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  RefreshCw, 
  CheckCircle2, 
  FileSearch, 
  Hash, 
  Layers, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Trade, Dashboard } from '@/types';
import { 
  runDataIntegrityScan, 
  DataIntegrityReport, 
  IssueSeverity, 
  logSecurityEvent 
} from '@/lib/securityService';

interface DataIntegrityTabProps {
  trades: Trade[];
  dashboards: Dashboard[];
  activeDashboard: Dashboard | null;
  userId?: string;
}

export function DataIntegrityTab({ trades, dashboards, activeDashboard, userId }: DataIntegrityTabProps) {
  const [scanKey, setScanKey] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | IssueSeverity>('all');
  const [lastScannedTime, setLastScannedTime] = useState<Date>(() => new Date());

  // Run integrity analysis
  const report: DataIntegrityReport = useMemo(() => {
    // depend on scanKey, trades, dashboards, activeDashboard
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    scanKey;
    return runDataIntegrityScan(trades, dashboards, activeDashboard);
  }, [scanKey, trades, dashboards, activeDashboard]);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    // Brief deliberate delay for optical feedback
    await new Promise(r => setTimeout(r, 450));
    setScanKey(prev => prev + 1);
    setLastScannedTime(new Date());
    setIsScanning(false);

    if (userId) {
      try {
        await logSecurityEvent(userId, {
          action: 'INTEGRITY_SCAN_RUN',
          title: 'Data Integrity Audit Executed',
          description: `Scanned ${trades.length} trade records across ${dashboards.length} dashboards. Found ${report.issues.length} potential anomalies.`,
          status: report.issues.length === 0 ? 'success' : 'warning'
        });
      } catch {}
    }
  };

  const filteredIssues = useMemo(() => {
    if (severityFilter === 'all') return report.issues;
    return report.issues.filter(i => i.severity === severityFilter);
  }, [report.issues, severityFilter]);

  return (
    <div className="space-y-6">
      {/* Overview & Action Header */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Database Diagnostics
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[11px] text-slate-500">
                Last checked: {lastScannedTime.toLocaleTimeString()}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Journal Data Integrity & Relational Auditor
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated audit inspecting for orphaned trades, duplicate IDs, invalid mathematical numbers, and date anomalies.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              onClick={handleTriggerScan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Inspecting Records...' : 'Run Integrity Scan'}
            </Button>
          </div>
        </div>

        {/* Score & Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          {/* Integrity Score */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Integrity Score</div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-2xl font-black ${
                report.integrityScore >= 90
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : report.integrityScore >= 70
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {report.integrityScore}%
              </span>
              <span className="text-[11px] text-slate-400">/ 100</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {report.cleanRecordsCount} / {report.totalRecordsScanned} clean trades
            </div>
          </div>

          {/* Critical Issues */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Critical Errors</div>
            <div className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
              {report.metrics.critical}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">NaN, missing ID, invalid dir</div>
          </div>

          {/* Warnings */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Warnings</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {report.metrics.warning}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Orphans, future dates, risk</div>
          </div>

          {/* Notices */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Execution Notices</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {report.metrics.info}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Trailing SL, direction checks</div>
          </div>
        </div>
      </div>

      {/* When 0 issues: Clean Verification Certificate */}
      {report.issues.length === 0 ? (
        <div className="p-8 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl shadow-xs text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              100% Relational Integrity Confirmed
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              All {report.totalRecordsScanned} trade entries, timestamps, mathematical parameters, and dashboard associations comply with TradeVault relational invariants.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" />
            Zero Orphaned or Corrupted Records Detected
          </div>
        </div>
      ) : (
        /* Issues List & Filter Tabs */
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Detected Diagnostics ({report.issues.length})
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review diagnosed entries below. Recommendations guide resolution without altering your trading stats.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => setSeverityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  severityFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                All ({report.issues.length})
              </button>
              {report.metrics.critical > 0 && (
                <button
                  onClick={() => setSeverityFilter('critical')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    severityFilter === 'critical'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  Critical ({report.metrics.critical})
                </button>
              )}
              {report.metrics.warning > 0 && (
                <button
                  onClick={() => setSeverityFilter('warning')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    severityFilter === 'warning'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  }`}
                >
                  Warnings ({report.metrics.warning})
                </button>
              )}
              {report.metrics.info > 0 && (
                <button
                  onClick={() => setSeverityFilter('info')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    severityFilter === 'info'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                  }`}
                >
                  Notices ({report.metrics.info})
                </button>
              )}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className={`p-4 rounded-xl border transition-colors ${
                  issue.severity === 'critical'
                    ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                    : issue.severity === 'warning'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                    : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          issue.severity === 'critical'
                            ? 'bg-red-600 text-white'
                            : issue.severity === 'warning'
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {issue.severity}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {issue.category}
                      </span>
                      {issue.dashboardName && (
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          in <span className="font-semibold text-slate-700 dark:text-slate-300">{issue.dashboardName}</span>
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {issue.title}
                    </h5>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {issue.description}
                    </p>

                    {issue.recordLabel && (
                      <div className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block mt-1">
                        Target Record: {issue.recordLabel}
                      </div>
                    )}
                  </div>

                  <div className="sm:max-w-xs w-full bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[11px] mb-1">
                      Recommended Action:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {issue.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
