import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  GitCompare, 
  Lightbulb, 
  Calculator, 
  FlaskConical, 
  BellRing, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  HelpCircle,
  Eye,
  Info
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Trade } from '@/types';
import { 
  AILabsTab, 
  AnalysisDateRange, 
  DataAccessPermissions, 
  AIMode, 
  ShowMeWhyDetails 
} from '@/types/aiLabs';
import { AITradingAnalystTab } from '@/components/aiLabs/AITradingAnalystTab';
import { PatternLabTab } from '@/components/aiLabs/PatternLabTab';
import { HypothesisLabTab } from '@/components/aiLabs/HypothesisLabTab';
import { ScenarioLabTab } from '@/components/aiLabs/ScenarioLabTab';
import { ExperimentTrackerTab } from '@/components/aiLabs/ExperimentTrackerTab';
import { AIAlertsTab } from '@/components/aiLabs/AIAlertsTab';
import { DataQualityTab } from '@/components/aiLabs/DataQualityTab';
import { AIControlsPrivacyTab } from '@/components/aiLabs/AIControlsPrivacyTab';
import { EvidenceDrawer } from '@/components/aiLabs/EvidenceDrawer';
import { ShowMeWhyModal } from '@/components/aiLabs/ShowMeWhyModal';
import { generateAIAlerts } from '@/lib/aiLabs/engine';

export const AILabs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { trades, loading } = useData();

  // Active Tab
  const tabParam = searchParams.get('tab') as AILabsTab;
  const activeTab: AILabsTab = [
    'analyst', 'patterns', 'hypothesis', 'scenarios', 'experiments', 'alerts', 'quality', 'controls'
  ].includes(tabParam) ? tabParam : 'analyst';

  const setActiveTab = (tab: AILabsTab) => {
    setSearchParams({ tab });
  };

  // Global AI Configuration State
  const [dateRange, setDateRange] = useState<AnalysisDateRange>('30d');
  const [permissions, setPermissions] = useState<DataAccessPermissions>(() => {
    try {
      const saved = localStorage.getItem('tradevault_ai_permissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      trades: true,
      psychology: true,
      strategies: true,
      journal: true,
      learningRules: true,
      riskBehavior: true
    };
  });

  const [mode, setMode] = useState<AIMode>(() => {
    try {
      const saved = localStorage.getItem('tradevault_ai_mode') as AIMode;
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    return 'evidence';
  });

  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date>(new Date());

  const handleUpdatePermissions = (perms: DataAccessPermissions) => {
    setPermissions(perms);
    try {
      localStorage.setItem('tradevault_ai_permissions', JSON.stringify(perms));
    } catch (e) {
      // ignore
    }
  };

  const handleUpdateMode = (m: AIMode) => {
    setMode(m);
    try {
      localStorage.setItem('tradevault_ai_mode', m);
    } catch (e) {
      // ignore
    }
  };

  const handleRefreshAnalysis = () => {
    setLastAnalyzedAt(new Date());
  };

  // Evidence Drawer State
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceSubtitle, setEvidenceSubtitle] = useState('');
  const [evidenceTrades, setEvidenceTrades] = useState<Trade[]>([]);
  const [evidenceHighlights, setEvidenceHighlights] = useState<string[]>([]);

  const handleOpenEvidence = (
    title: string, 
    subtitle: string, 
    tradeIds: string[], 
    highlightFields?: string[]
  ) => {
    const matched = trades.filter(t => tradeIds.includes(t.id));
    setEvidenceTitle(title);
    setEvidenceSubtitle(subtitle);
    setEvidenceTrades(matched.length > 0 ? matched : trades.slice(0, 5));
    setEvidenceHighlights(highlightFields || []);
    setEvidenceDrawerOpen(true);
  };

  // Show Me Why Modal State
  const [showMeWhyOpen, setShowMeWhyOpen] = useState(false);
  const [showMeWhyTitle, setShowMeWhyTitle] = useState('');
  const [showMeWhyDetails, setShowMeWhyDetails] = useState<ShowMeWhyDetails | null>(null);
  const [showMeWhyTradeIds, setShowMeWhyTradeIds] = useState<string[]>([]);

  const handleOpenShowMeWhy = (title: string, details: ShowMeWhyDetails, tradeIds: string[]) => {
    setShowMeWhyTitle(title);
    setShowMeWhyDetails(details);
    setShowMeWhyTradeIds(tradeIds);
    setShowMeWhyOpen(true);
  };

  // Unread alerts count
  const allAlerts = generateAIAlerts(trades, 1.0);
  const dismissedAlerts: string[] = (() => {
    try {
      const s = localStorage.getItem('tradevault_dismissed_alerts');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      return [];
    }
  })();
  const activeAlertsCount = allAlerts.filter(a => !dismissedAlerts.includes(a.id)).length;

  const TABS: { id: AILabsTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'analyst', label: 'AI Trading Analyst', icon: Sparkles },
    { id: 'patterns', label: 'Pattern Lab', icon: GitCompare },
    { id: 'hypothesis', label: 'Hypothesis Lab', icon: Lightbulb },
    { id: 'scenarios', label: 'Scenario Lab', icon: Calculator },
    { id: 'experiments', label: 'Experiment Tracker', icon: FlaskConical },
    { id: 'alerts', label: 'AI Alerts', icon: BellRing, badge: activeAlertsCount > 0 ? activeAlertsCount : undefined },
    { id: 'quality', label: 'Data Quality', icon: Database },
    { id: 'controls', label: 'AI Controls', icon: ShieldCheck }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 pt-2">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Trading Intelligence & Research Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Evidence-Based AI
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Observe, analyze, test, and explain your trading history using statistical rigour and your recorded TradeVault data.
              </p>
            </div>
          </div>
        </div>

        {/* Global Read-Only Badge */}
        <div className="flex items-center gap-2 text-xs bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 self-start md:self-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Read-Only • Zero Data Modification Guarantee</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 min-w-max pb-1" aria-label="AI & Labs Tabs">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive 
                      ? 'bg-white text-blue-600' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'analyst' && (
          <AITradingAnalystTab
            trades={trades}
            dateRange={dateRange}
            setDateRange={setDateRange}
            permissions={permissions}
            mode={mode}
            setMode={setMode}
            lastAnalyzedAt={lastAnalyzedAt}
            onRefreshAnalysis={handleRefreshAnalysis}
            onOpenEvidence={handleOpenEvidence}
            onOpenShowMeWhy={handleOpenShowMeWhy}
          />
        )}

        {activeTab === 'patterns' && (
          <PatternLabTab
            trades={trades}
            permissions={permissions}
            onOpenEvidence={handleOpenEvidence}
            onOpenShowMeWhy={handleOpenShowMeWhy}
          />
        )}

        {activeTab === 'hypothesis' && (
          <HypothesisLabTab
            trades={trades}
            onOpenEvidence={handleOpenEvidence}
            onOpenShowMeWhy={handleOpenShowMeWhy}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioLabTab
            trades={trades}
            onOpenEvidence={handleOpenEvidence}
            onOpenShowMeWhy={handleOpenShowMeWhy}
          />
        )}

        {activeTab === 'experiments' && (
          <ExperimentTrackerTab
            trades={trades}
            onOpenEvidence={handleOpenEvidence}
            onOpenShowMeWhy={handleOpenShowMeWhy}
          />
        )}

        {activeTab === 'alerts' && (
          <AIAlertsTab
            trades={trades}
            onOpenEvidence={handleOpenEvidence}
          />
        )}

        {activeTab === 'quality' && (
          <DataQualityTab
            trades={trades}
            onOpenEvidence={handleOpenEvidence}
          />
        )}

        {activeTab === 'controls' && (
          <AIControlsPrivacyTab
            permissions={permissions}
            onUpdatePermissions={handleUpdatePermissions}
            mode={mode}
            onUpdateMode={handleUpdateMode}
            totalTradesCount={trades.length}
          />
        )}
      </div>

      {/* Global Evidence Drawer */}
      <EvidenceDrawer
        isOpen={evidenceDrawerOpen}
        onClose={() => setEvidenceDrawerOpen(false)}
        title={evidenceTitle}
        subtitle={evidenceSubtitle}
        trades={evidenceTrades}
        highlightFields={evidenceHighlights}
      />

      {/* Global Show Me Why Modal */}
      {showMeWhyDetails && (
        <ShowMeWhyModal
          isOpen={showMeWhyOpen}
          onClose={() => setShowMeWhyOpen(false)}
          title={showMeWhyTitle}
          details={showMeWhyDetails}
          onViewEvidence={() => {
            handleOpenEvidence(
              `Evidence: ${showMeWhyTitle}`,
              showMeWhyDetails.detected,
              showMeWhyTradeIds,
              showMeWhyDetails.fieldsUsed
            );
          }}
        />
      )}
    </div>
  );
};

export default AILabs;
