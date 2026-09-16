import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  Trash2, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  Flame,
  ChevronRight
} from 'lucide-react';
import { NewsUserSettings } from '@/types/newsIntelligence';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { formatEventDateTime } from '@/lib/news/newsStore';

interface MyAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent?: (eventId: string) => void;
}

export const MyAlertsModal: React.FC<MyAlertsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSelectEvent
}) => {
  const [testChimePlaying, setTestChimePlaying] = useState(false);

  if (!isOpen) return null;

  const watchlistedIds = settings.watchlistedEventIds || [];
  const dismissedIds = settings.dismissedAlertIds || [];
  const leadMinutes = settings.preEventWarningMinutes || 30;

  // Filter high impact and watchlisted events
  const monitoredEvents = NEWS_EVENTS.filter(ev => {
    return ev.impact === 'HIGH' || watchlistedIds.includes(ev.id);
  }).slice(0, 10);

  const handleTestChime = () => {
    setTestChimePlaying(true);
    // Simple Web Audio beep
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch {
      // Audio context might be restricted before interaction
    }
    setTimeout(() => setTestChimePlaying(false), 1000);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    onUpdateSettings({
      watchlistedEventIds: watchlistedIds.filter(item => item !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>My Market & Event Alerts</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  {watchlistedIds.length} active
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage upcoming release warnings, catalyst triggers, and volatility notifications
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Quick Settings & Sound Testing */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Pre-Release Lead Warning
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Trigger banner notification before event release
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={leadMinutes}
                onChange={(e) => onUpdateSettings({ preEventWarningMinutes: Number(e.target.value) })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value={15}>15 mins before</option>
                <option value={30}>30 mins before</option>
                <option value={60}>1 hour before</option>
                <option value={120}>2 hours before</option>
              </select>

              <button
                onClick={handleTestChime}
                disabled={testChimePlaying}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{testChimePlaying ? 'Chiming...' : 'Test Sound'}</span>
              </button>
            </div>
          </div>

          {/* Active Alerts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Monitored High-Impact & Watchlisted Catalysts</span>
              <span>{monitoredEvents.length} items</span>
            </div>

            <div className="space-y-2">
              {monitoredEvents.map(ev => {
                const isWatchlisted = watchlistedIds.includes(ev.id);
                const timeMeta = formatEventDateTime(ev.dateTime, settings.timezone);

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-base">
                        {ev.countryCode === 'US' ? '🇺🇸' : ev.countryCode === 'EU' ? '🇪🇺' : '🌐'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {ev.currency}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                            {ev.impact}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {timeMeta.dateStr} • {timeMeta.timeStr}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {ev.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectEvent && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectEvent(ev.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <span>Detail</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}

                      {isWatchlisted && (
                        <button
                          onClick={() => handleRemoveFromWatchlist(ev.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Remove alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
