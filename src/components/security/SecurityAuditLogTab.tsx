import React, { useState, useEffect } from 'react';
import { 
  History, 
  RefreshCw, 
  Download, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSecurityAuditLogs, SecurityAuditEntry } from '@/lib/securityService';

interface SecurityAuditLogTabProps {
  userId: string;
}

export function SecurityAuditLogTab({ userId }: SecurityAuditLogTabProps) {
  const [logs, setLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const entries = await getSecurityAuditLogs(userId, 50);
      setLogs(entries);
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [userId]);

  const handleDownloadLogsJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      userId,
      totalEntries: logs.length,
      auditLogs: logs
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tradevault_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action.includes(actionFilter);
    const matchesQuery = searchQuery === '' || 
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.deviceInfo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Event Log Stream
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Account Security & Activity Audit Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tamper-evident record of authentication events, credential modifications, and destructive operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadLogsJSON}
              disabled={logs.length === 0}
              className="text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Log (JSON)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchLogs}
              disabled={loading}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit log entries..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            {[
              { label: 'All Events', value: 'ALL' },
              { label: 'Auth Logins', value: 'LOGIN' },
              { label: 'Passwords', value: 'PASSWORD' },
              { label: 'Deletions', value: 'DELET' },
              { label: 'Integrity', value: 'INTEGRITY' }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setActionFilter(f.value)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                  actionFilter === f.value
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span>Loading security audit records...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Security Events Recorded</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Security events such as logins, credential updates, data purges, and diagnostics scans will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Action</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Device / Client</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                        {log.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-md">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[200px]">{log.deviceInfo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : log.status === 'warning'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                          : 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                      }`}>
                        {log.status === 'success' && <CheckCircle2 className="w-3 h-3" />}
                        {log.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                        {log.status === 'failed' && <XCircle className="w-3 h-3" />}
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
