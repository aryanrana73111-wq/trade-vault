import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  FileSpreadsheet, 
  FileCode, 
  EyeOff, 
  Sparkles, 
  Brain, 
  AlertTriangle, 
  Lock,
  CheckCircle2,
  HelpCircle,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Trade, Dashboard, UserProfile } from '@/types';
import { SafeDeleteModal } from '@/components/SafeDeleteModal';
import { AccountDeleteModal } from '@/components/security/AccountDeleteModal';
import { exportTradesToCSV, exportAccountDataToJSON, logSecurityEvent } from '@/lib/securityService';

interface PrivacyCenterTabProps {
  user: any;
  profile: UserProfile | null;
  trades: Trade[];
  dashboards: Dashboard[];
  activeDashboard: Dashboard | null;
  strategies: any[];
  learnings: any[];
  rules: any[];
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onDeleteAllTrades: () => Promise<void>;
  onDeleteDashboard: (id: string) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

export function PrivacyCenterTab({
  user,
  profile,
  trades,
  dashboards,
  activeDashboard,
  strategies,
  learnings,
  rules,
  onUpdateProfile,
  onDeleteAllTrades,
  onDeleteDashboard,
  onDeleteAccount
}: PrivacyCenterTabProps) {
  // Destructive Modals State
  const [showDeleteTradesModal, setShowDeleteTradesModal] = useState(false);
  const [showDeleteDashboardModal, setShowDeleteDashboardModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Privacy toggles (stored in user profile preferences)
  const privacySettings = profile?.preferences || {};
  const [aiReviewEnabled, setAiReviewEnabled] = useState(privacySettings.aiSuggestions !== false);
  const [psychologyEnabled, setPsychologyEnabled] = useState(privacySettings.psychologyAnalysis !== false);
  const [screenShareMode, setScreenShareMode] = useState(Boolean(privacySettings.privacyMasking));

  const handleTogglePreference = async (key: string, value: boolean) => {
    setStatusMessage(null);
    try {
      const updatedPrefs = {
        ...privacySettings,
        [key]: value
      };
      if (key === 'aiSuggestions') setAiReviewEnabled(value);
      if (key === 'psychologyAnalysis') setPsychologyEnabled(value);
      if (key === 'privacyMasking') setScreenShareMode(value);

      await onUpdateProfile({ preferences: updatedPrefs as any });
      setStatusMessage({ type: 'success', text: 'Privacy preferences updated.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to update preferences.' });
    }
  };

  const handleExportCSV = () => {
    try {
      exportTradesToCSV(trades, `tradevault_${activeDashboard?.name || 'journal'}`);
      setStatusMessage({ type: 'success', text: `Exported ${trades.length} trades to CSV successfully.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to export trades.' });
    }
  };

  const handleExportJSON = () => {
    try {
      exportAccountDataToJSON({
        user,
        profile,
        dashboards,
        trades,
        strategies,
        learnings,
        rules
      });
      setStatusMessage({ type: 'success', text: 'Full account data backup exported to JSON.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to export JSON backup.' });
    }
  };

  const hasGoogle = user?.providerData?.some((p: any) => p.providerId === 'google.com') ?? false;
  const hasPassword = user?.providerData?.some((p: any) => p.providerId === 'password') ?? false;

  return (
    <div className="space-y-6">
      {/* Status banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border animate-in fade-in duration-150 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Transparent Data Privacy Architecture */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Data Governance & Trust
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Privacy Transparency & Architecture
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How TradeVault stores, processes, and protects your trading proprietary data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              What TradeVault Stores
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We store your trade execution records, notes, strategy playbooks, rules checklist, and profile preferences under your private UID. No broker API keys are stored.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              UID-Level Isolation
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforced at the database layer via Firestore Security Rules. No other user or external tenant can read, query, or write to your private subcollections.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              AI Insights & Modeling Policy
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              When AI trade reviews or psychology insights are generated, your trade parameters are processed securely server-side. Your trading data is never used to train public foundation models.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-xs">
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Zero Commercial Monetization
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              TradeVault does not sell, broker, or monetize your trading data, order flow, or journal notes to prop firms, brokers, or advertisers.
            </p>
          </div>
        </div>
      </div>

      {/* Data Export Center */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Data Portability & Export Center
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export your entire trading history anytime. Download standard RFC-compliant CSV files or complete JSON backups.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Export Trades to CSV
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Clean spreadsheet export with all trade tickers, dates, entry/exit prices, position sizing, P&L, mistakes, and notes. Compatible with Excel, Numbers, and Google Sheets.
              </p>
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download Trades ({trades.length} Records)
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  Export Full Account (JSON)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Comprehensive machine-readable backup containing all dashboards, trade tickets, strategies, rules checklists, and daily reflections.
              </p>
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportJSON}
                className="w-full text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON Backup
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Controls & Toggles */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Privacy & Feature Toggles
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customize which telemetry and automated analytics are active for your account.
          </p>
        </div>

        <div className="space-y-3">
          {/* AI Suggestions Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                AI Trade Suggestions & Analysis
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Allow AI to analyze execution logs and provide optimization feedback.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={aiReviewEnabled}
                onChange={(e) => handleTogglePreference('aiSuggestions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Psychology Analysis Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Psychology & Tilt Detection Engine
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Monitors revenge trading, FOMO entries, and emotional discipline patterns.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={psychologyEnabled}
                onChange={(e) => handleTogglePreference('psychologyAnalysis', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Streamer Screen Share Privacy Mode */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Screen-Sharing & Streamer Mode
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Mask account balance numbers and user email when recording or streaming.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={screenShareMode}
                onChange={(e) => handleTogglePreference('privacyMasking', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <div>
            <h4 className="text-sm font-bold text-red-700 dark:text-red-400">
              Data Management & Danger Zone
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Irreversible destructive actions. All deletions are audited and permanent.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {/* Delete All Trades */}
          <div className="p-3.5 rounded-xl border border-red-100 dark:border-red-950/50 bg-red-50/40 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                Delete All Trades in Current Dashboard
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                Permanently deletes all {trades.length} trades from "{activeDashboard?.name || 'Active Dashboard'}". Strategies and rules are preserved.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteTradesModal(true)}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Trades
            </Button>
          </div>

          {/* Delete Current Dashboard */}
          {dashboards.length > 1 && (
            <div className="p-3.5 rounded-xl border border-red-100 dark:border-red-950/50 bg-red-50/40 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 block">
                  Delete Current Dashboard ("{activeDashboard?.name}")
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                  Permanently removes this portfolio dashboard and all associated trades, strategies, and rules.
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDashboardModal(true)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Dashboard
              </Button>
            </div>
          )}

          {/* Delete TradeVault Account */}
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-100/50 dark:bg-red-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300 block">
                Permanently Delete TradeVault Account
              </span>
              <span className="text-xs text-red-600/80 dark:text-red-400/80 block mt-0.5">
                Completely purges your entire account, all dashboards, all trade logs, and terminates your authentication credentials.
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setShowDeleteAccountModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* SafeDeleteModal for Trades */}
      <SafeDeleteModal
        isOpen={showDeleteTradesModal}
        onClose={() => setShowDeleteTradesModal(false)}
        onConfirm={async () => {
          if (user) {
            await logSecurityEvent(user.uid, {
              action: 'TRADES_DELETED',
              title: 'All Trades Purged',
              description: `All trades deleted in dashboard "${activeDashboard?.name}".`,
              status: 'warning'
            });
          }
          await onDeleteAllTrades();
          setShowDeleteTradesModal(false);
          setStatusMessage({ type: 'success', text: 'All trades in this dashboard have been permanently deleted.' });
        }}
        title="Delete All Trades"
        description="Are you sure you want to delete all trades in this dashboard? This action is permanent and cannot be undone."
        expectedConfirmationText="DELETE TRADES"
        itemsToDelete={['All execution records', 'Trade notes', 'Screenshots']}
        itemsPreserved={['Rules', 'Strategies']}
      />

      {/* SafeDeleteModal for Dashboard */}
      {activeDashboard && (
        <SafeDeleteModal
          isOpen={showDeleteDashboardModal}
          onClose={() => setShowDeleteDashboardModal(false)}
          onConfirm={async () => {
            if (user) {
              await logSecurityEvent(user.uid, {
                action: 'DASHBOARD_DELETED',
                title: 'Dashboard Deleted',
                description: `Dashboard "${activeDashboard.name}" and all associated data deleted.`,
                status: 'warning'
              });
            }
            await onDeleteDashboard(activeDashboard.id);
            setShowDeleteDashboardModal(false);
            setStatusMessage({ type: 'success', text: `Dashboard "${activeDashboard.name}" was deleted.` });
          }}
          title="Delete Dashboard"
          description={`Are you sure you want to delete "${activeDashboard.name}" and all its data? This cannot be undone.`}
          expectedConfirmationText={`DELETE ${activeDashboard.name.toUpperCase()}`}
          itemsToDelete={[`Dashboard "${activeDashboard.name}"`, 'Associated trades']}
        />
      )}

      {/* Account Deletion Modal */}
      <AccountDeleteModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={onDeleteAccount}
        userEmail={user?.email || 'Your account'}
        hasGoogleProvider={hasGoogle}
        hasPasswordProvider={hasPassword}
      />
    </div>
  );
}
