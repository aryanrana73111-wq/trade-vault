import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Check, 
  LayoutGrid
} from 'lucide-react';
import { CommandCenterLayoutConfig } from '@/types/commandCenter';

interface LayoutCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CommandCenterLayoutConfig;
  onSaveConfig: (newConfig: CommandCenterLayoutConfig) => void;
  onResetDefaults: () => void;
}

const WIDGET_LABELS: Record<string, string> = {
  topSummary: 'Top Performance & Discipline Summary',
  attentionPanel: 'What Needs My Attention (Smart Panel)',
  tradingState: 'Current Trading State (Comparative Cohort)',
  quickInvestigation: 'Quick Investigation & Search Bar',
  pinnedItems: 'Pinned Workspace Items',
  recentActivity: 'Recent Activity Timeline',
  connectedWorkflow: 'Connected Trading Cycle Banner'
};

const METRIC_LABELS: Record<string, string> = {
  todayPnl: 'Today P&L',
  tradesToday: 'Trades Today',
  riskUsedToday: 'Risk Used Today',
  currentStreak: 'Current Streak',
  averageR: 'Average R',
  ruleAdherence: 'Rule Adherence',
  psychologyCompletion: 'Psychology Completion'
};

export const LayoutCustomizerModal: React.FC<LayoutCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetDefaults
}) => {
  const [localConfig, setLocalConfig] = useState<CommandCenterLayoutConfig>(config);

  React.useEffect(() => {
    if (isOpen && config) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const safeWidgets = localConfig?.visibleWidgets || {};
  const safeMetrics = localConfig?.visibleMetrics || {};
  const safeOrder = Array.isArray(localConfig?.widgetOrder) ? localConfig.widgetOrder : [];

  const toggleWidget = (widgetKey: keyof CommandCenterLayoutConfig['visibleWidgets']) => {
    setLocalConfig(prev => ({
      ...prev,
      visibleWidgets: {
        ...prev.visibleWidgets,
        [widgetKey]: !prev.visibleWidgets[widgetKey]
      }
    }));
  };

  const toggleMetric = (metricKey: keyof CommandCenterLayoutConfig['visibleMetrics']) => {
    setLocalConfig(prev => ({
      ...prev,
      visibleMetrics: {
        ...prev.visibleMetrics,
        [metricKey]: !prev.visibleMetrics[metricKey]
      }
    }));
  };

  const moveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...safeOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setLocalConfig(prev => ({ ...prev, widgetOrder: newOrder }));
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const handleReset = () => {
    onResetDefaults();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Personalize Command Center
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize visible widgets and metrics. Preferences are saved automatically per dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-6">
          {/* Section 1: Widgets Ordering and Visibility */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Widget Visibility & Arrangement Order
            </h3>
            <div className="space-y-2">
              {safeOrder.map((widgetKey, idx) => {
                const isVisible = safeWidgets[widgetKey as keyof CommandCenterLayoutConfig['visibleWidgets']];
                return (
                  <div
                    key={widgetKey}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleWidget(widgetKey as keyof CommandCenterLayoutConfig['visibleWidgets'])}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isVisible
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}
                        title={isVisible ? 'Visible' : 'Hidden'}
                      >
                        {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <span className={`text-xs font-semibold ${
                        isVisible ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 line-through'
                      }`}>
                        {WIDGET_LABELS[widgetKey] || widgetKey}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveWidget(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveWidget(idx, 'down')}
                        disabled={idx === localConfig.widgetOrder.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Summary Metrics to Show */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Top Summary KPI Cards
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(METRIC_LABELS).map(([metricKey, label]) => {
                const isSelected = localConfig.visibleMetrics[metricKey as keyof CommandCenterLayoutConfig['visibleMetrics']];
                return (
                  <button
                    key={metricKey}
                    onClick={() => toggleMetric(metricKey as keyof CommandCenterLayoutConfig['visibleMetrics'])}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Apply Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
