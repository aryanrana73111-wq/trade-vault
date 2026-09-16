import { db, auth } from './firebase';
import { collection, doc, setDoc, getDocs, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { Trade, Dashboard } from '@/types';
import { cleanUndefined } from '@/lib/utils';

export type SecurityActionType =
  | 'AUTH_LOGIN'
  | 'AUTH_LOGOUT'
  | 'AUTH_SIGNUP'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_SENT'
  | 'PASSWORD_LINKED'
  | 'GOOGLE_LINKED'
  | 'EMAIL_VERIFICATION_SENT'
  | 'TRADES_DELETED'
  | 'DASHBOARD_DELETED'
  | 'ACCOUNT_DELETION_ATTEMPTED'
  | 'INTEGRITY_SCAN_RUN'
  | 'SETTINGS_UPDATED';

export interface SecurityAuditEntry {
  id: string;
  userId: string;
  action: SecurityActionType;
  title: string;
  description: string;
  timestamp: number;
  deviceInfo: string;
  status: 'success' | 'warning' | 'failed';
}

/**
 * Detect client browser, OS, and platform cleanly and safely without intrusive tracking.
 */
export function getDeviceSessionInfo(): {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  clientSummary: string;
  timezone: string;
} {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const timezone = typeof Intl !== 'undefined' 
    ? Intl.DateTimeFormat().resolvedOptions().timeZone 
    : 'UTC';

  // Determine OS
  let os = 'Unknown OS';
  if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Determine Browser
  let browser = 'Unknown Browser';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Google Chrome';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

  // Determine Device Type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  if (/iPad|Tablet/i.test(ua) || (os === 'macOS' && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone/i.test(ua)) {
    deviceType = 'Mobile';
  }

  const clientSummary = `${browser} on ${os} (${deviceType})`;

  return { browser, os, deviceType, clientSummary, timezone };
}

/**
 * Persists a security audit log event to Firestore and updates local cached log.
 */
export async function logSecurityEvent(
  userId: string,
  entry: {
    action: SecurityActionType;
    title: string;
    description: string;
    status?: 'success' | 'warning' | 'failed';
  }
): Promise<void> {
  if (!userId) return;

  const { clientSummary } = getDeviceSessionInfo();
  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  
  const fullEntry: SecurityAuditEntry = {
    id: logId,
    userId,
    action: entry.action,
    title: entry.title,
    description: entry.description,
    timestamp: Date.now(),
    deviceInfo: clientSummary,
    status: entry.status || 'success'
  };

  // 1. Update local cache for immediate display and offline support
  try {
    const storageKey = `tradevault_audit_logs_${userId}`;
    const cachedRaw = localStorage.getItem(storageKey);
    const cached: SecurityAuditEntry[] = cachedRaw ? JSON.parse(cachedRaw) : [];
    const updated = [fullEntry, ...cached.filter(c => c.id !== logId)].slice(0, 50);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {
    // Non-critical local storage error
  }

  // 2. Persist to Firestore under isolated user path users/{userId}/auditLogs/{logId}
  try {
    const logRef = doc(db, 'users', userId, 'auditLogs', logId);
    await setDoc(logRef, cleanUndefined(fullEntry));
  } catch (err) {
    console.warn('Audit log remote persistence note:', err);
  }
}

/**
 * Fetches security audit logs for a given user from Firestore (with local cache fallback).
 */
export async function getSecurityAuditLogs(userId: string, limitCount = 30): Promise<SecurityAuditEntry[]> {
  if (!userId) return [];

  const storageKey = `tradevault_audit_logs_${userId}`;
  let localLogs: SecurityAuditEntry[] = [];
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) localLogs = JSON.parse(cached);
  } catch {
    // Ignore local storage parse issue
  }

  try {
    const logsRef = collection(db, 'users', userId, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), firestoreLimit(limitCount));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const remoteLogs = snap.docs.map(d => ({ ...d.data(), id: d.id } as SecurityAuditEntry));
      
      // Merge remote and local logs
      const combined = [...remoteLogs];
      const seen = new Set(remoteLogs.map(r => r.id));
      for (const loc of localLogs) {
        if (!seen.has(loc.id)) {
          combined.push(loc);
          seen.add(loc.id);
        }
      }
      combined.sort((a, b) => b.timestamp - a.timestamp);
      try {
        localStorage.setItem(storageKey, JSON.stringify(combined.slice(0, 50)));
      } catch {}
      return combined.slice(0, limitCount);
    }
  } catch (err) {
    console.warn('Error reading remote audit logs, using local cache:', err);
  }

  return localLogs.slice(0, limitCount);
}

/* =========================================================================
   DATA INTEGRITY INSPECTION ENGINE
   ========================================================================= */

export type IssueSeverity = 'critical' | 'warning' | 'info';

export type IntegrityCategory =
  | 'Orphaned Record'
  | 'Duplicate Entry'
  | 'Invalid Values'
  | 'Date Anomaly'
  | 'Risk Validation'
  | 'Execution Inconsistency'
  | 'Aggregate Discrepancy';

export interface DataIntegrityIssue {
  id: string;
  severity: IssueSeverity;
  category: IntegrityCategory;
  title: string;
  description: string;
  recordId?: string;
  recordLabel?: string;
  dashboardId?: string;
  dashboardName?: string;
  recommendedAction: string;
}

export interface DataIntegrityReport {
  timestamp: number;
  totalRecordsScanned: number;
  cleanRecordsCount: number;
  integrityScore: number; // 0 - 100
  issues: DataIntegrityIssue[];
  metrics: {
    critical: number;
    warning: number;
    info: number;
  };
}

/**
 * Runs a thorough, non-destructive audit across loaded trade records and dashboard metadata.
 * Detects orphaned trades, invalid numeric values, impossible dates, abnormal risks, and aggregate mismatches.
 */
export function runDataIntegrityScan(
  trades: Trade[],
  dashboards: Dashboard[],
  activeDashboard?: Dashboard | null
): DataIntegrityReport {
  const issues: DataIntegrityIssue[] = [];
  const validDashboardIds = new Set(dashboards.map(d => d.id));
  const dashboardMap = new Map(dashboards.map(d => [d.id, d.name]));

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const seenIds = new Map<string, number>();

  let cleanRecordsCount = 0;

  trades.forEach((trade, index) => {
    let tradeHasIssue = false;
    const label = `${trade.market || 'Unknown Market'} (${trade.direction || 'N/A'}) [${trade.id ? trade.id.slice(0, 8) : `Index #${index}`}]`;
    const dashName = trade.dashboardId ? (dashboardMap.get(trade.dashboardId) || 'Unknown Dashboard') : (activeDashboard?.name || 'Active Dashboard');

    // 1. ID Uniqueness & Existence
    if (!trade.id || typeof trade.id !== 'string') {
      issues.push({
        id: `missing-id-${index}`,
        severity: 'critical',
        category: 'Invalid Values',
        title: 'Missing Trade Identifier',
        description: `Trade at position #${index + 1} does not possess a valid unique ID.`,
        recommendedAction: 'Re-save or edit this record to assign a verified identifier.'
      });
      tradeHasIssue = true;
    } else {
      const count = (seenIds.get(trade.id) || 0) + 1;
      seenIds.set(trade.id, count);
      if (count > 1) {
        issues.push({
          id: `dup-id-${trade.id}-${count}`,
          severity: 'critical',
          category: 'Duplicate Entry',
          title: 'Duplicate Record Identifier',
          description: `Multiple trade entries share the exact ID "${trade.id}". This can cause state collisions.`,
          recordId: trade.id,
          recordLabel: label,
          dashboardId: trade.dashboardId,
          dashboardName: dashName,
          recommendedAction: 'Remove or export the duplicated entry to maintain database consistency.'
        });
        tradeHasIssue = true;
      }
    }

    // 2. Orphan Check (Dashboard Reference)
    if (trade.dashboardId && !validDashboardIds.has(trade.dashboardId)) {
      issues.push({
        id: `orphaned-${trade.id}`,
        severity: 'warning',
        category: 'Orphaned Record',
        title: 'Orphaned Dashboard Reference',
        description: `Trade is tagged with dashboard ID "${trade.dashboardId}", which is not present in your active dashboards list.`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        recommendedAction: 'Assign this trade to one of your active trading dashboards.'
      });
      tradeHasIssue = true;
    }

    // 3. Missing Mandatory Core Fields
    if (!trade.market || typeof trade.market !== 'string' || trade.market.trim() === '') {
      issues.push({
        id: `missing-market-${trade.id}`,
        severity: 'warning',
        category: 'Invalid Values',
        title: 'Missing Ticker or Asset Symbol',
        description: `Trade does not have an asset symbol or ticker designated.`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Update trade and specify the currency pair, stock, or crypto asset.'
      });
      tradeHasIssue = true;
    }

    if (!trade.direction || (trade.direction !== 'BUY' && trade.direction !== 'SELL')) {
      issues.push({
        id: `invalid-dir-${trade.id}`,
        severity: 'critical',
        category: 'Invalid Values',
        title: 'Invalid Direction Type',
        description: `Trade direction is neither "BUY" nor "SELL" (found: "${trade.direction}").`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Set direction to either Long (BUY) or Short (SELL).'
      });
      tradeHasIssue = true;
    }

    // 4. Numeric Validity (NaN, Infinity, Negative Values)
    if (trade.entry === undefined || trade.entry === null || isNaN(trade.entry) || !isFinite(trade.entry) || trade.entry <= 0) {
      issues.push({
        id: `invalid-entry-${trade.id}`,
        severity: 'critical',
        category: 'Invalid Values',
        title: 'Non-Numeric or Zero Entry Price',
        description: `Entry price is missing, non-finite, or <= 0 (value: ${trade.entry}).`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Edit trade to specify the valid fill entry price.'
      });
      tradeHasIssue = true;
    }

    if (trade.positionSize !== undefined && (isNaN(trade.positionSize) || !isFinite(trade.positionSize) || trade.positionSize < 0)) {
      issues.push({
        id: `invalid-size-${trade.id}`,
        severity: 'warning',
        category: 'Invalid Values',
        title: 'Negative or Non-Finite Position Size',
        description: `Position size must be a positive number (found: ${trade.positionSize}).`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Adjust position size to a valid positive quantity.'
      });
      tradeHasIssue = true;
    }

    if (trade.pnl !== undefined && (isNaN(trade.pnl) || !isFinite(trade.pnl))) {
      issues.push({
        id: `invalid-pnl-${trade.id}`,
        severity: 'critical',
        category: 'Invalid Values',
        title: 'Non-Finite P&L Calculation',
        description: `Realized P&L contains a NaN or infinite value.`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Recalculate or manually enter the net realized profit/loss.'
      });
      tradeHasIssue = true;
    }

    // 5. Date Validation (Impossible Dates & Timestamps)
    if (!trade.date || isNaN(trade.date) || trade.date <= 0) {
      issues.push({
        id: `invalid-date-${trade.id}`,
        severity: 'critical',
        category: 'Date Anomaly',
        title: 'Invalid Trade Timestamp',
        description: `Trade timestamp is corrupt or missing (value: ${trade.date}).`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Set a valid execution date and time.'
      });
      tradeHasIssue = true;
    } else if (trade.date > now + ONE_DAY_MS) {
      issues.push({
        id: `future-date-${trade.id}`,
        severity: 'warning',
        category: 'Date Anomaly',
        title: 'Future Trade Timestamp',
        description: `Trade date is set in the future (${new Date(trade.date).toLocaleDateString()}).`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Verify the trade date matches actual execution time.'
      });
      tradeHasIssue = true;
    }

    // 6. Stop Loss & Direction Consistency
    if (trade.stopLoss && trade.entry) {
      if (trade.direction === 'BUY' && trade.stopLoss >= trade.entry) {
        issues.push({
          id: `sl-dir-mismatch-${trade.id}`,
          severity: 'info',
          category: 'Execution Inconsistency',
          title: 'Stop Loss Above Long Entry',
          description: `Stop loss (${trade.stopLoss}) is higher than or equal to Long entry (${trade.entry}). While common for trailing stops, verify this was intentional.`,
          recordId: trade.id,
          recordLabel: label,
          dashboardId: trade.dashboardId,
          dashboardName: dashName,
          recommendedAction: 'Ensure stop loss was trailed in profit or adjust price level.'
        });
      } else if (trade.direction === 'SELL' && trade.stopLoss <= trade.entry) {
        issues.push({
          id: `sl-dir-mismatch-short-${trade.id}`,
          severity: 'info',
          category: 'Execution Inconsistency',
          title: 'Stop Loss Below Short Entry',
          description: `Stop loss (${trade.stopLoss}) is below Short entry (${trade.entry}). Verify whether this represents a trailed stop.`,
          recordId: trade.id,
          recordLabel: label,
          dashboardId: trade.dashboardId,
          dashboardName: dashName,
          recommendedAction: 'Confirm stop loss level matches your execution log.'
        });
      }
    }

    // 7. Risk Validation
    if (trade.risk !== undefined && (isNaN(trade.risk) || trade.risk < 0 || trade.risk > 10000000)) {
      issues.push({
        id: `abnormal-risk-${trade.id}`,
        severity: 'warning',
        category: 'Risk Validation',
        title: 'Abnormal Risk Amount',
        description: `Risk value is negative or exceeds realistic threshold ($${trade.risk}).`,
        recordId: trade.id,
        recordLabel: label,
        dashboardId: trade.dashboardId,
        dashboardName: dashName,
        recommendedAction: 'Recheck planned dollar risk on this trade.'
      });
      tradeHasIssue = true;
    }

    if (!tradeHasIssue) {
      cleanRecordsCount++;
    }
  });

  // 8. Aggregate Discrepancy Checks
  if (dashboards.length > 0) {
    dashboards.forEach(dash => {
      const dashTrades = trades.filter(t => !t.dashboardId || t.dashboardId === dash.id);
      const closedTrades = dashTrades.filter(t => (t.result && t.result !== 'PENDING') || t.pnl !== undefined);
      const totalPnl = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      
      if (isNaN(totalPnl) || !isFinite(totalPnl)) {
        issues.push({
          id: `aggregate-pnl-nan-${dash.id}`,
          severity: 'critical',
          category: 'Aggregate Discrepancy',
          title: 'Corrupted Cumulative P&L',
          description: `Cumulative P&L for dashboard "${dash.name}" resulted in NaN/infinite calculation.`,
          dashboardId: dash.id,
          dashboardName: dash.name,
          recommendedAction: 'Inspect individual trades in this dashboard for corrupted P&L inputs.'
        });
      }
    });
  }

  const critical = issues.filter(i => i.severity === 'critical').length;
  const warning = issues.filter(i => i.severity === 'warning').length;
  const info = issues.filter(i => i.severity === 'info').length;

  const total = trades.length;
  let score = 100;
  if (total > 0) {
    const penalty = (critical * 15) + (warning * 5) + (info * 1);
    score = Math.max(0, Math.round(100 - (penalty / total) * 20));
  }

  return {
    timestamp: now,
    totalRecordsScanned: total,
    cleanRecordsCount,
    integrityScore: score,
    issues,
    metrics: { critical, warning, info }
  };
}

/* =========================================================================
   AUTHENTIC DATA EXPORT UTILITIES (CSV & JSON)
   ========================================================================= */

/**
 * Generates and downloads a clean, RFC-compliant CSV containing all trade journal details.
 */
export function exportTradesToCSV(trades: Trade[], filenamePrefix = 'tradevault_trades'): void {
  if (!trades || trades.length === 0) {
    throw new Error('No trade records available to export.');
  }

  const headers = [
    'ID',
    'Date (ISO)',
    'Timestamp',
    'Market',
    'Direction',
    'Entry Price',
    'Exit Price',
    'Stop Loss',
    'Take Profit',
    'Position Size',
    'Risk Amount',
    'Realized PnL',
    'Result',
    'R-Multiple',
    'Strategy',
    'Session',
    'Mistake',
    'Learning',
    'Notes'
  ];

  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = trades.map(t => [
    t.id,
    t.date ? new Date(t.date).toISOString() : '',
    t.date || '',
    t.market || '',
    t.direction || '',
    t.entry ?? '',
    t.exitPrice ?? '',
    t.stopLoss ?? '',
    t.takeProfit ?? '',
    t.positionSize ?? '',
    t.risk ?? '',
    t.pnl ?? '',
    t.result ?? '',
    t.rrRatio ?? '',
    t.strategy ?? '',
    t.session ?? '',
    t.mistake ?? '',
    t.learning ?? '',
    t.notes ?? ''
  ].map(escapeCSV).join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a complete, structured JSON backup of user trading data.
 */
export function exportAccountDataToJSON(data: {
  user: any;
  profile?: any;
  dashboards: Dashboard[];
  trades: Trade[];
  strategies?: any[];
  learnings?: any[];
  rules?: any[];
}): void {
  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exporter: 'TradeVault Trust & Security Center',
    version: '1.0',
    account: {
      uid: data.user?.uid || '',
      email: data.user?.email || '',
      profile: data.profile || null
    },
    dashboards: data.dashboards || [],
    trades: data.trades || [],
    strategies: data.strategies || [],
    learnings: data.learnings || [],
    rules: data.rules || []
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tradevault_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
