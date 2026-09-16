import React, { useState } from 'react';
import { NewsUserSettings, ExplanationMode, NewsImpact } from '@/types/newsIntelligence';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { 
  X, 
  Settings, 
  Clock, 
  SlidersHorizontal, 
  Bookmark, 
  Bell, 
  Check, 
  Trash2,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NewsSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NewsUserSettings;
  onSaveSettings: (newSettings: NewsUserSettings) => void;
}

export function NewsSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}: NewsSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<NewsUserSettings>({ ...settings });
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleRemoveWatchlist = (id: string) => {
    setLocalSettings(prev => ({
      ...prev,
      watchlistedEventIds: (prev.watchlistedEventIds || prev.watchlistEventIds || []).filter(item => item !== id),
      watchlistEventIds: (prev.watchlistedEventIds || prev.watchlistEventIds || []).filter(item => item !== id)
    }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              News Intelligence Settings
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Timezone */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white uppercase text-[11px] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              Calendar Timezone Display
            </label>
            <select
              value={localSettings.timezone}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Local">Local Browser Time</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">New York (EST / EDT)</option>
              <option value="Europe/London">London (GMT / BST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
            <span className="text-[11px] text-slate-400 block">
              Economic event releases will be mapped dynamically to this timezone.
            </span>
          </div>

          {/* Default Impact Filter */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              Default Impact Threshold
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'All Releases', val: 'ALL' },
                { label: 'Medium & High', val: 'MEDIUM_HIGH' },
                { label: 'High Only', val: 'HIGH_ONLY' }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, defaultImpactFilter: opt.val as any }))}
                  className={`p-2 rounded-xl border text-center font-semibold transition-colors ${
                    localSettings.defaultImpactFilter === opt.val
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Perspective / Mode */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white uppercase text-[11px]">
              Default Explanation Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'trader', 'professional'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ ...prev, defaultMode: m }))}
                  className={`p-2 rounded-xl border text-center font-semibold capitalize transition-colors ${
                    localSettings.defaultMode === m
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Pre-Event Alert Buffer */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white uppercase text-[11px] flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Pre-Event Risk Advisory Buffer
            </label>
            <div className="flex gap-2">
              {[15, 30, 60].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setLocalSettings(prev => ({ 
                    ...prev, 
                    preEventWarningMinutes: mins,
                    preEventNotificationMinutes: mins 
                  }))}
                  className={`flex-1 p-2 rounded-xl border text-center font-semibold transition-colors ${
                    (localSettings.preEventWarningMinutes || localSettings.preEventNotificationMinutes || 30) === mins
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {mins} Minutes
                </button>
              ))}
            </div>
          </div>

          {/* Watchlisted Events */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white uppercase text-[11px] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-blue-500" />
                Active Event Watchlist ({((localSettings.watchlistedEventIds || localSettings.watchlistEventIds || [])).length})
              </span>
            </label>

            {((localSettings.watchlistedEventIds || localSettings.watchlistEventIds || [])).length === 0 ? (
              <p className="text-slate-400 italic text-[11px] p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                No events currently on your watchlist. Click the bookmark icon next to any release in the calendar.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {((localSettings.watchlistedEventIds || localSettings.watchlistEventIds || [])).map(id => {
                  const ev = NEWS_EVENTS.find(e => e.id === id);
                  return (
                    <div key={id} className="p-2 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {ev ? `${ev.name} (${ev.currency})` : id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWatchlist(id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
