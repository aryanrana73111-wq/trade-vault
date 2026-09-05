import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Eye, 
  X, 
  ShieldAlert,
  Flame,
  Clock,
  Layers
} from 'lucide-react';
import { Trade } from '@/types';
import { AIAlert } from '@/types/aiLabs';
import { generateAIAlerts } from '@/lib/aiLabs/engine';
import { Button } from '@/components/ui/Button';

interface AIAlertsTabProps {
  trades: Trade[];
  onOpenEvidence: (title: string, subtitle: string, tradeIds: string[], highlightFields?: string[]) => void;
}

export const AIAlertsTab: React.FC<AIAlertsTabProps> = ({
  trades,
  onOpenEvidence
}) => {
  const initialAlerts = generateAIAlerts(trades, 1.0);
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tradevault_dismissed_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const activeAlerts = initialAlerts.filter(a => !dismissedIds.includes(a.id));

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('tradevault_dismissed_alerts', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleResetDismissed = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('tradevault_dismissed_alerts');
    } catch (e) {
      // ignore
    }
  };

  const getAlertIcon = (type: AIAlert['type'], severity: AIAlert['severity']) => {
    if (severity === 'alert') return <Flame className="w-5 h-5 text-rose-500" />;
    if (severity === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  const getSeverityClasses = (severity: AIAlert['severity']) => {
    switch (severity) {
      case 'alert':
        return 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20';
      case 'warning':
        return 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20';
      case 'info':
      default:
        return 'border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            Actionable AI Alerts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time behavioral warnings grounded in recent trade execution. Not speculative market predictions.
          </p>
        </div>

        {dismissedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDismissed}
            className="text-xs"
          >
            Restore Dismissed ({dismissedIds.length})
          </Button>
        )}
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {activeAlerts.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">All Clear — No Active Behavioral Warnings</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your recent trade logs show standard position sizing, adequate spacing between losses, and consistent data completeness.
            </p>
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 shadow-xs flex flex-col sm:flex-row items-start justify-between gap-4 transition-all ${getSeverityClasses(alert.severity)}`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="mt-0.5 flex-shrink-0">
                  {getAlertIcon(alert.type, alert.severity)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{alert.title}</h4>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {alert.message}
                  </p>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                    <strong className="font-semibold text-slate-600 dark:text-slate-300">Underlying Evidence: </strong>
                    <span>{alert.evidence}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {alert.tradeIds.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenEvidence(alert.title, alert.message, alert.tradeIds)}
                    className="text-xs flex items-center gap-1 bg-white dark:bg-slate-900"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect Trades ({alert.tradeIds.length})
                  </Button>
                )}
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  title="Dismiss Alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
