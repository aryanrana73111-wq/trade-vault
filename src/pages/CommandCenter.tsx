import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  ShieldCheck, 
  SlidersHorizontal, 
  RefreshCw, 
  Plus, 
  Layers, 
  Calendar,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  BookOpenCheck,
  Search,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { getSettings, UserSettings } from '@/lib/settings';
import { Trade } from '@/types';
import { 
  CommandCenterTimeRange, 
  ComparisonWindowSize, 
  AttentionItem, 
  PinnedItem,
  CommandCenterLayoutConfig
} from '@/types/commandCenter';
import { 
  calculateCommandCenterSummary,
  generateAttentionItems,
  calculateCurrentTradingState,
  generateRecentActivityTimeline
} from '@/lib/commandCenter/engine';
import { CommandCenterSummaryCards } from '@/components/commandCenter/CommandCenterSummaryCards';
import { AttentionPanel } from '@/components/commandCenter/AttentionPanel';
import { CurrentTradingStateCard } from '@/components/commandCenter/CurrentTradingStateCard';
import { QuickInvestigationBar } from '@/components/commandCenter/QuickInvestigationBar';
import { PinnedItemsWidget } from '@/components/commandCenter/PinnedItemsWidget';
import { RecentActivityTimelineWidget } from '@/components/commandCenter/RecentActivityTimelineWidget';
import { ConnectedWorkflowBanner } from '@/components/commandCenter/ConnectedWorkflowBanner';
import { LayoutCustomizerModal } from '@/components/commandCenter/LayoutCustomizerModal';
import { EvidenceDrawer } from '@/components/aiLabs/EvidenceDrawer';
import { MacroMarketIntelligenceWidget } from '@/components/commandCenter/MacroMarketIntelligenceWidget';
import { EventDetailModal } from '@/components/news/EventDetailModal';
import { MyAlertsModal } from '@/components/news/MyAlertsModal';
import { getStoredNewsSettings, saveStoredNewsSettings } from '@/lib/news/newsStore';
import { NewsEvent } from '@/types/newsIntelligence';

const DEFAULT_LAYOUT: CommandCenterLayoutConfig = {
  visibleWidgets: {
    topSummary: true,
    attentionPanel: true,
    macroIntelligence: true,
    tradingState: true,
    quickInvestigation: true,
    pinnedItems: true,
    recentActivity: true,
    connectedWorkflow: true
  },
  widgetOrder: [
    'topSummary',
    'macroIntelligence',
    'attentionPanel',
    'tradingState',
    'quickInvestigation',
    'pinnedItems',
    'recentActivity',
    'connectedWorkflow'
  ],
  visibleMetrics: {
    todayPnl: true,
    tradesToday: true,
    riskUsedToday: true,
    currentStreak: true,
    averageR: true,
    ruleAdherence: true,
    psychologyCompletion: true
  },
  recentWindowSize: 10,
  timeRange: '30d'
};

// Helper to safely load and sanitize layout config
function getSanitizedLayout(key: string): CommandCenterLayoutConfig {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const visibleWidgets = {
          ...DEFAULT_LAYOUT.visibleWidgets,
          ...(typeof parsed.visibleWidgets === 'object' && parsed.visibleWidgets !== null ? parsed.visibleWidgets : {})
        };
        const visibleMetrics = {
          ...DEFAULT_LAYOUT.visibleMetrics,
          ...(typeof parsed.visibleMetrics === 'object' && parsed.visibleMetrics !== null ? parsed.visibleMetrics : {})
        };
        const validOrder = Array.isArray(parsed.widgetOrder) && parsed.widgetOrder.length > 0
          ? parsed.widgetOrder.filter((w: string) => Object.keys(DEFAULT_LAYOUT.visibleWidgets).includes(w))
          : DEFAULT_LAYOUT.widgetOrder;
        
        // Ensure all default widgets are in the list
        const missingWidgets = DEFAULT_LAYOUT.widgetOrder.filter(w => !validOrder.includes(w));

        return {
          visibleWidgets,
          visibleMetrics,
          widgetOrder: [...validOrder, ...missingWidgets],
          recentWindowSize: parsed.recentWindowSize || 10,
          timeRange: parsed.timeRange || '30d'
        };
      }
    }
  } catch (e) {
    console.error('Failed to load command center layout config:', e);
  }
  return DEFAULT_LAYOUT;
}

// Helper to safely load pinned items
function getSanitizedPins(key: string): PinnedItem[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => p && typeof p === 'object' && p.id);
      }
    }
  } catch (e) {
    console.error('Failed to load command center pinned items:', e);
  }
  return [];
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class CommandCenterErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Trading Command Center Error caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tradevault_cc_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-3xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Command Center Encountered a Display Error
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            A temporary rendering exception occurred while preparing your operational data. You can restore default preferences or refresh the view.
          </p>
          {this.state.error && (
            <div className="text-[11px] text-left font-mono bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 overflow-x-auto max-h-32">
              {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Workspace Preferences & Reload</span>
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const CommandCenterView: React.FC = () => {
  const navigate = useNavigate();
  const { user, activeDashboard } = useAuth();
  const { trades = [], strategies = [], learnings = [], rules = [], loading } = useData();

  const [settings, setSettings] = useState<UserSettings>(() => getSettings());
  const [timeRange, setTimeRange] = useState<CommandCenterTimeRange>('30d');
  const [windowSize, setWindowSize] = useState<ComparisonWindowSize>(10);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Evidence Drawer state
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceSubtitle, setEvidenceSubtitle] = useState('');
  const [evidenceTrades, setEvidenceTrades] = useState<Trade[]>([]);
  const [evidenceHighlights, setEvidenceHighlights] = useState<string[]>([]);

  // Macro & News Intelligence State
  const [newsSettings, setNewsSettings] = useState(() => getStoredNewsSettings());
  const [selectedNewsEvent, setSelectedNewsEvent] = useState<NewsEvent | null>(null);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  const handleUpdateNewsSettings = (updates: any) => {
    setNewsSettings(prev => {
      const updated = { ...prev, ...updates };
      saveStoredNewsSettings(updated);
      return updated;
    });
  };

  // Layout configuration persisted per user & dashboard
  const layoutStorageKey = `tradevault_cc_layout_${user?.uid || 'guest'}_${activeDashboard?.id || 'default'}`;
  const [layoutConfig, setLayoutConfig] = useState<CommandCenterLayoutConfig>(() => {
    return getSanitizedLayout(layoutStorageKey);
  });

  // Re-sync layout when user or dashboard changes
  useEffect(() => {
    setLayoutConfig(getSanitizedLayout(layoutStorageKey));
  }, [layoutStorageKey]);

  // Pinned items persisted per user & dashboard
  const pinsStorageKey = `tradevault_cc_pins_${user?.uid || 'guest'}_${activeDashboard?.id || 'default'}`;
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => {
    return getSanitizedPins(pinsStorageKey);
  });

  useEffect(() => {
    setPinnedItems(getSanitizedPins(pinsStorageKey));
  }, [pinsStorageKey]);

  // Listen to settings update events
  useEffect(() => {
    const handleSettingsUpdate = () => setSettings(getSettings());
    window.addEventListener('tradevault_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('tradevault_settings_updated', handleSettingsUpdate);
  }, []);

  // Save layout config changes
  const handleSaveLayout = (newConfig: CommandCenterLayoutConfig) => {
    setLayoutConfig(newConfig);
    try {
      localStorage.setItem(layoutStorageKey, JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to persist layout config:', e);
    }
  };

  const handleResetLayoutDefaults = () => {
    setLayoutConfig(DEFAULT_LAYOUT);
    try {
      localStorage.removeItem(layoutStorageKey);
    } catch (e) {
      // ignore
    }
  };

  // Pinned items actions
  const handlePinAttentionItem = (item: AttentionItem) => {
    setPinnedItems(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const exists = safePrev.some(p => p && p.recordId === item.id);
      let updated: PinnedItem[];
      if (exists) {
        updated = safePrev.filter(p => p.recordId !== item.id);
      } else {
        const newPin: PinnedItem = {
          id: `pin-${Date.now()}`,
          recordId: item.id,
          type: item.category === 'rules' ? 'rule' : item.category === 'strategy' ? 'strategy' : 'ai_insight',
          title: item.title,
          subtitle: item.explanation,
          pinnedAt: Date.now(),
          route: item.investigateAction?.route || '/command-center',
          badge: item.category ? item.category.toUpperCase() : 'ALERT'
        };
        updated = [newPin, ...safePrev];
      }
      try {
        localStorage.setItem(pinsStorageKey, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleRemovePin = (pinId: string) => {
    setPinnedItems(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = safePrev.filter(p => p.id !== pinId);
      try {
        localStorage.setItem(pinsStorageKey, JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleClearAllPins = () => {
    setPinnedItems([]);
    try {
      localStorage.removeItem(pinsStorageKey);
    } catch (e) {
      // ignore
    }
  };

  const isItemPinned = (recordId: string) => {
    return Array.isArray(pinnedItems) && pinnedItems.some(p => p && p.recordId === recordId);
  };

  // Calculations with safe fallbacks
  const safeTrades = Array.isArray(trades) ? trades : [];
  const safeStrategies = Array.isArray(strategies) ? strategies : [];
  const safeRules = Array.isArray(rules) ? rules : [];
  const safeLearnings = Array.isArray(learnings) ? learnings : [];

  const summary = useMemo(() => {
    try {
      return calculateCommandCenterSummary(safeTrades, timeRange, settings);
    } catch (e) {
      console.error('Error calculating command center summary:', e);
      return calculateCommandCenterSummary([], timeRange, settings);
    }
  }, [safeTrades, timeRange, settings]);

  const attentionItems = useMemo(() => {
    try {
      return generateAttentionItems(safeTrades, safeStrategies, safeRules, safeLearnings, settings, windowSize);
    } catch (e) {
      console.error('Error generating attention items:', e);
      return [];
    }
  }, [safeTrades, safeStrategies, safeRules, safeLearnings, settings, windowSize]);

  const currentState = useMemo(() => {
    try {
      return calculateCurrentTradingState(safeTrades, windowSize);
    } catch (e) {
      console.error('Error calculating current trading state:', e);
      return calculateCurrentTradingState([], windowSize);
    }
  }, [safeTrades, windowSize]);

  const timelineEvents = useMemo(() => {
    try {
      return generateRecentActivityTimeline(safeTrades, safeStrategies, safeLearnings, safeRules);
    } catch (e) {
      console.error('Error generating timeline events:', e);
      return [];
    }
  }, [safeTrades, safeStrategies, safeLearnings, safeRules]);

  // Investigation / Evidence Drawer handlers
  const handleInvestigateAttention = (item: AttentionItem) => {
    if (item.investigateAction?.route) {
      navigate(item.investigateAction.route);
      return;
    }
    const tradeIds = item.tradeIds || [];
    const matched = safeTrades.filter(t => tradeIds.includes(t.id));
    setEvidenceTitle(item.title);
    setEvidenceSubtitle(item.whyText);
    setEvidenceTrades(matched.length > 0 ? matched : safeTrades.slice(0, 5));
    setEvidenceHighlights(item.category === 'risk' ? ['riskPercent', 'risk'] : []);
    setEvidenceOpen(true);
  };

  const handleInspectCohortTrades = (tradeIds: string[], label: string) => {
    const matched = safeTrades.filter(t => (tradeIds || []).includes(t.id));
    setEvidenceTitle(label);
    setEvidenceSubtitle(`Grounded inspection of ${matched.length} recorded trade records in this cohort.`);
    setEvidenceTrades(matched);
    setEvidenceHighlights(['riskPercent', 'emotions', 'ruleAdherence', 'pnl']);
    setEvidenceOpen(true);
  };

  const handleOpenTradeDrawer = (matchedTrades: Trade[], title: string) => {
    setEvidenceTitle(title);
    setEvidenceSubtitle(`Found ${matchedTrades.length} recorded trades matching your query criteria.`);
    setEvidenceTrades(matchedTrades);
    setEvidenceHighlights([]);
    setEvidenceOpen(true);
  };

  // Count metrics for workflow banner
  const workflowCounts = {
    trades: safeTrades.length,
    psychology: safeTrades.filter(t => {
      const hasEmotions = Array.isArray(t.emotions) ? t.emotions.length > 0 : Boolean(t.emotions);
      return hasEmotions || t.confidence;
    }).length,
    learnings: safeLearnings.length,
    rules: safeRules.length,
    strategies: safeStrategies.length
  };

  // Widget rendering by layout config order
  const renderWidget = (widgetKey: string) => {
    const isVisible = layoutConfig?.visibleWidgets?.[widgetKey as keyof CommandCenterLayoutConfig['visibleWidgets']];
    if (isVisible === false) {
      return null;
    }

    switch (widgetKey) {
      case 'topSummary':
        return (
          <CommandCenterSummaryCards 
            key="topSummary"
            summary={summary}
            visibleMetrics={layoutConfig?.visibleMetrics || DEFAULT_LAYOUT.visibleMetrics}
          />
        );
      case 'macroIntelligence':
        return (
          <MacroMarketIntelligenceWidget
            key="macroIntelligence"
            timezone={newsSettings.timezone}
            trades={safeTrades}
            onSelectEvent={(ev) => setSelectedNewsEvent(ev)}
            onOpenMyAlerts={() => setIsAlertsModalOpen(true)}
          />
        );
      case 'attentionPanel':
        return (
          <AttentionPanel 
            key="attentionPanel"
            items={attentionItems}
            onInvestigate={handleInvestigateAttention}
            onPinItem={handlePinAttentionItem}
            isPinned={isItemPinned}
          />
        );
      case 'tradingState':
        return (
          <CurrentTradingStateCard 
            key="tradingState"
            state={currentState}
            onWindowSizeChange={(size) => setWindowSize(size)}
            onInspectCohort={handleInspectCohortTrades}
          />
        );
      case 'quickInvestigation':
        return (
          <QuickInvestigationBar 
            key="quickInvestigation"
            trades={safeTrades}
            strategies={safeStrategies}
            rules={safeRules}
            learnings={safeLearnings}
            settings={settings}
            onOpenTradeDrawer={handleOpenTradeDrawer}
          />
        );
      case 'pinnedItems':
        return (
          <PinnedItemsWidget 
            key="pinnedItems"
            pinnedItems={pinnedItems}
            onRemovePin={handleRemovePin}
            onClearAllPins={handleClearAllPins}
          />
        );
      case 'recentActivity':
        return (
          <RecentActivityTimelineWidget 
            key="recentActivity"
            events={timelineEvents}
          />
        );
      case 'connectedWorkflow':
        return (
          <ConnectedWorkflowBanner 
            key="connectedWorkflow"
            counts={workflowCounts}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-20 pt-8 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center animate-pulse">
            <Compass className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
            <div className="h-3.5 w-72 bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-pulse" />
      </div>
    );
  }

  const safeOrder = Array.isArray(layoutConfig?.widgetOrder) && layoutConfig.widgetOrder.length > 0 
    ? layoutConfig.widgetOrder 
    : DEFAULT_LAYOUT.widgetOrder;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 pt-2 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Compass className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Trading Command Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Live Operations
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Centralized observation and investigation workspace analyzing your recorded {activeDashboard ? `"${activeDashboard.name}"` : ''} trading activity.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls: Time Range & Layout Customizer */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {/* Read-Only Badge */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="hidden sm:inline">Read-Only</span>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['today', '7d', '30d', '90d', 'all'] as CommandCenterTimeRange[]).map((r) => {
              const labels: Record<CommandCenterTimeRange, string> = {
                today: 'Today',
                '7d': '7D',
                '30d': '30D',
                '90d': '90D',
                all: 'All'
              };
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                    timeRange === r
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* Customize Workspace Button */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
        </div>
      </div>

      {/* Empty State if 0 trades recorded */}
      {safeTrades.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Your Command Center will become more informative as you record trades.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
              As you enter trades, log emotions, and test strategies, this workspace automatically observes risk drift, rule compliance, behavioral patterns, and actionable items.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/add')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record First Trade</span>
            </button>
            <button
              onClick={() => navigate('/learning-rules?tab=rules')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <BookOpenCheck className="w-4 h-4" />
              <span>Set Trading Rules</span>
            </button>
          </div>
        </div>
      ) : (
        /* Normal Layout Rendering */
        <div className="space-y-6">
          {safeOrder.map(widgetKey => renderWidget(widgetKey))}
        </div>
      )}

      {/* Layout Customizer Modal */}
      <LayoutCustomizerModal 
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={layoutConfig}
        onSaveConfig={handleSaveLayout}
        onResetDefaults={handleResetLayoutDefaults}
      />

      {/* Evidence Drawer for Underlying Trades */}
      <EvidenceDrawer 
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        title={evidenceTitle}
        subtitle={evidenceSubtitle}
        trades={evidenceTrades}
        highlightFields={evidenceHighlights}
      />

      {/* Economic Event Intelligence Detail Modal */}
      {selectedNewsEvent && (
        <EventDetailModal
          event={selectedNewsEvent}
          onClose={() => setSelectedNewsEvent(null)}
          timezone={newsSettings.timezone}
          userNote={newsSettings.userNotes[selectedNewsEvent.id] || ''}
          onSaveNote={(id, note) => {
            handleUpdateNewsSettings({
              userNotes: { ...newsSettings.userNotes, [id]: note }
            });
          }}
          isWatchlisted={(newsSettings.watchlistedEventIds || []).includes(selectedNewsEvent.id)}
          onToggleWatchlist={(id) => {
            const list = newsSettings.watchlistedEventIds || [];
            const next = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
            handleUpdateNewsSettings({ watchlistedEventIds: next });
          }}
        />
      )}

      {/* My Alerts Modal */}
      <MyAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        settings={newsSettings}
        onUpdateSettings={handleUpdateNewsSettings}
        onSelectEvent={(eventId) => {
          const ev = safeTrades; // search in NEWS_EVENTS
          import('@/data/newsIntelligenceData').then(m => {
            const found = m.NEWS_EVENTS.find(e => e.id === eventId);
            if (found) setSelectedNewsEvent(found);
          });
        }}
      />
    </div>
  );
};

export const CommandCenter: React.FC = () => {
  return (
    <CommandCenterErrorBoundary>
      <CommandCenterView />
    </CommandCenterErrorBoundary>
  );
};

export default CommandCenter;
