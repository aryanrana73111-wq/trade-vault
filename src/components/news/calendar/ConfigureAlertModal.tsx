import React, { useState } from 'react';
import { NewsEvent, CalendarEventAlert } from '@/types/newsIntelligence';
import { 
  X, 
  Bell, 
  Clock, 
  Check, 
  Trash2, 
  Radio, 
  Smartphone, 
  Monitor, 
  AlertTriangle 
} from 'lucide-react';
import { CURRENCY_FLAGS } from '../EconomicCalendarView';

interface ConfigureAlertModalProps {
  event: NewsEvent;
  existingAlert?: CalendarEventAlert;
  onSaveAlert: (alert: CalendarEventAlert) => void;
  onRemoveAlert: (eventId: string) => void;
  onClose: () => void;
}

export function ConfigureAlertModal({
  event,
  existingAlert,
  onSaveAlert,
  onRemoveAlert,
  onClose
}: ConfigureAlertModalProps) {
  const [leadMinutes, setLeadMinutes] = useState<number>(existingAlert?.leadMinutes ?? 15);
  const [customMinutes, setCustomMinutes] = useState<string>(
    [5, 15, 30, 60].includes(existingAlert?.leadMinutes ?? 15) ? '' : String(existingAlert?.leadMinutes ?? '')
  );
  const [isCustom, setIsCustom] = useState<boolean>(
    ![5, 15, 30, 60].includes(existingAlert?.leadMinutes ?? 15)
  );

  const [inAppEnabled, setInAppEnabled] = useState<boolean>(
    existingAlert ? existingAlert.channels.includes('in_app') : true
  );
  const [browserEnabled, setBrowserEnabled] = useState<boolean>(
    existingAlert ? existingAlert.channels.includes('browser') : true
  );

  const handleSave = () => {
    const finalMinutes = isCustom ? (parseInt(customMinutes, 10) || 15) : leadMinutes;
    const channels: ('in_app' | 'browser')[] = [];
    if (inAppEnabled) channels.push('in_app');
    if (browserEnabled) channels.push('browser');

    if (channels.length === 0) {
      channels.push('in_app');
    }

    const alert: CalendarEventAlert = {
      eventId: event.id,
      eventName: event.name,
      leadMinutes: Math.max(1, finalMinutes),
      channels,
      enabled: true,
      createdAt: existingAlert?.createdAt || new Date().toISOString()
    };

    // Request browser notification permission if selected
    if (browserEnabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    onSaveAlert(alert);
    onClose();
  };

  const handleRemove = () => {
    onRemoveAlert(event.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Release Event Alert
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure early execution notifications
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event Preview Badge */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <span className="text-xl">{CURRENCY_FLAGS[event.currency] || '🌐'}</span>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
              {event.currency} • {event.impact} IMPACT
            </span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {event.name}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Scheduled: {new Date(event.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
            </span>
          </div>
        </div>

        {/* Configuration Body */}
        <div className="p-5 space-y-5">
          {/* Timing Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Alert Lead Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setLeadMinutes(mins);
                    setIsCustom(false);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    !isCustom && leadMinutes === mins
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {mins >= 60 ? '1 Hour' : `${mins} min`}
                </button>
              ))}
            </div>

            {/* Custom Minutes Option */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="radio"
                id="custom-time-radio"
                name="alert-time"
                checked={isCustom}
                onChange={() => setIsCustom(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="custom-time-radio" className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Custom minutes prior:
              </label>
              <input
                type="number"
                min="1"
                max="1440"
                value={customMinutes}
                onChange={(e) => {
                  setCustomMinutes(e.target.value);
                  setIsCustom(true);
                }}
                onFocus={() => setIsCustom(true)}
                placeholder="e.g. 45"
                className="w-20 px-2.5 py-1 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Notification Channels
            </label>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">In-App Live Alert</span>
                    <span className="text-[11px] text-slate-500">Displays prominent banner and audio ping inside TradeVault</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={inAppEnabled}
                  onChange={(e) => setInAppEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">Browser Push Notification</span>
                    <span className="text-[11px] text-slate-500">Native OS notification even when on another browser tab</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={browserEnabled}
                  onChange={(e) => setBrowserEnabled(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Practical Disclaimer */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Alerts trigger based on your client-side clock. Ensure TradeVault remains open or background notifications are permitted by your browser.
            </span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {existingAlert ? (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Alert</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{existingAlert ? 'Update Alert' : 'Set Alert'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
