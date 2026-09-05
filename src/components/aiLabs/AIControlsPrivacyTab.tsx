import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  FileText, 
  Eye, 
  RefreshCw,
  Info
} from 'lucide-react';
import { DataAccessPermissions, AIMode } from '@/types/aiLabs';
import { Button } from '@/components/ui/Button';

interface AIControlsPrivacyTabProps {
  permissions: DataAccessPermissions;
  onUpdatePermissions: (newPerms: DataAccessPermissions) => void;
  mode: AIMode;
  onUpdateMode: (m: AIMode) => void;
  totalTradesCount: number;
}

export const AIControlsPrivacyTab: React.FC<AIControlsPrivacyTabProps> = ({
  permissions,
  onUpdatePermissions,
  mode,
  onUpdateMode,
  totalTradesCount
}) => {
  const togglePerm = (key: keyof DataAccessPermissions) => {
    onUpdatePermissions({
      ...permissions,
      [key]: !permissions[key]
    });
  };

  const handleExportInsights = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      tradesAnalyzed: totalTradesCount,
      permissions,
      mode,
      disclaimer: "TradeVault AI observations are retrospective historical calculations. They are not predictive financial advice."
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TradeVault_AI_Analysis_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('tradevault_dismissed_alerts');
      alert('AI observation cache and dismissed alert states have been reset.');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          AI Controls & Privacy Governance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure granular data permissions, analysis modes, and review privacy architecture.
        </p>
      </div>

      {/* Security Architecture Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            <Lock className="w-4 h-4" /> 100% Read-Only AI
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            AI has strictly zero write access. It cannot create, modify, or delete your trades, risk rules, or balances.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" /> Strict Tenant Isolation
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All analytical calculations are strictly confined to your authenticated Firestore account. No cross-user data pooling.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" /> No Black-Box Models
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All metrics reflect verifiable mathematical calculations from your journaled trades, always paired with Show Me Why.
          </p>
        </div>
      </div>

      {/* Granular Scope Permissions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          Granular Data Access Scopes
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Toggle which categories of your trading journal AI is permitted to incorporate in analysis.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            { key: 'trades' as const, label: 'Trade Execution Data', desc: 'Allows analyzing entry, stop loss, take profit, market, direction, and P&L.' },
            { key: 'psychology' as const, label: 'Psychology & Emotions', desc: 'Allows correlating emotional tags (FOMO, Calm, Revenge) with trade outcomes.' },
            { key: 'strategies' as const, label: 'Strategy Classification', desc: 'Allows grouping and comparing metrics by strategy name and setup tags.' },
            { key: 'journal' as const, label: 'Journal & Trade Notes', desc: 'Allows reviewing qualitative trade notes and trade preparation entries.' },
            { key: 'learningRules' as const, label: 'Checklists & Rule Adherence', desc: 'Allows calculating rule adherence percentages and pre-trade criteria compliance.' },
            { key: 'riskBehavior' as const, label: 'Risk Sizing & Behavior', desc: 'Allows tracking position size drift, risk percentage changes, and drawdown behavior.' },
          ].map(item => (
            <div
              key={item.key}
              onClick={() => togglePerm(item.key)}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-700 cursor-pointer flex items-start gap-3 bg-slate-50/50 dark:bg-slate-800/40 transition-colors"
            >
              <input
                type="checkbox"
                checked={permissions[item.key]}
                onChange={() => {}}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  {item.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug block mt-0.5">
                  {item.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analyst Mode Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-600" />
          Default AI Output Mode
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'evidence' as const,
              title: 'Evidence Mode',
              desc: 'Purely factual observations, metrics, exact percentages, sample counts, and period comparisons. Zero editorial commentary.'
            },
            {
              id: 'coach' as const,
              title: 'Coach Mode',
              desc: 'Factual observations paired with probing reflection questions to help you review discipline, emotional triggers, and routine.'
            },
            {
              id: 'research' as const,
              title: 'Research Mode',
              desc: 'Academic depth: structured supporting vs contradicting evidence, sample variance warnings, and alternative explanations.'
            }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => onUpdateMode(m.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                mode === m.id
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block mb-1">
                {m.title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed block">
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Data Export & Cache Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Export & Cache Tools</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Download your current intelligence configurations or reset local alert dismissals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCache}
            className="text-xs flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Alert Cache
          </Button>

          <Button
            size="sm"
            onClick={handleExportInsights}
            className="text-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Insights JSON
          </Button>
        </div>
      </div>
    </div>
  );
};
