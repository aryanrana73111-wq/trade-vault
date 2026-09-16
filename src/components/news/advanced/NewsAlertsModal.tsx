import React, { useState } from 'react';
import { X, Bell, Zap, Flame, Star, Building2, Plus, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { NewsUserSettings } from '@/types/newsIntelligence';

interface NewsAlertsModalProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onClose: () => void;
}

export function NewsAlertsModal({
  settings,
  onUpdateSettings,
  onClose
}: NewsAlertsModalProps) {
  const [breakingAlerts, setBreakingAlerts] = useState<boolean>(true);
  const [highImpactEvents, setHighImpactEvents] = useState<boolean>(settings.notifyOnHighImpactOnly ?? true);
  const [watchlistAlerts, setWatchlistAlerts] = useState<boolean>(true);
  const [centralBankAlerts, setCentralBankAlerts] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<'INSTANT' | '30M' | 'DAILY'>('INSTANT');
  
  const [customTopics, setCustomTopics] = useState<string[]>(['Inflation', 'Tariffs', 'Crude Oil']);
  const [newTopicInput, setNewTopicInput] = useState<string>('');
  const [toastSaved, setToastSaved] = useState<boolean>(false);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicInput.trim()) return;
    if (!customTopics.includes(newTopicInput.trim())) {
      setCustomTopics([...customTopics, newTopicInput.trim()]);
    }
    setNewTopicInput('');
  };

  const handleRemoveTopic = (topic: string) => {
    setCustomTopics(customTopics.filter(t => t !== topic));
  };

  const handleSave = () => {
    onUpdateSettings({
      notifyOnHighImpactOnly: highImpactEvents,
      breakingNewsAlerts: breakingAlerts
    });
    setToastSaved(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                News & Event Alert Subscriptions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure instant catalyst alerts and custom topic notifications
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Toggles List */}
        <div className="space-y-3">
          {/* 1. Breaking News */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Breaking Macro Wire Alerts
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Emergency geopolitical and sudden sovereign policy releases
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={breakingAlerts}
                onChange={(e) => setBreakingAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* 2. High-Impact Economic Events */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  High-Impact Economic Calendar
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  CPI, Non-Farm Payrolls, GDP, Interest Rate Decisions
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={highImpactEvents}
                onChange={(e) => setHighImpactEvents(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          {/* 3. My Markets News */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  My Markets Portfolio Triggers
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Stories directly matching followed instruments (XAU/USD, BTC, etc.)
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={watchlistAlerts}
                onChange={(e) => setWatchlistAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* 4. Central Banks */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Central Bank Speeches & Dot Plots
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Fed, ECB, BoE, RBI statements & press briefings
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={centralBankAlerts}
                onChange={(e) => setCentralBankAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Custom Topics */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Custom Tracked Keywords & Topics:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {customTopics.map(topic => (
              <span 
                key={topic}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <span>{topic}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTopic(topic)}
                  className="hover:text-rose-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTopic} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newTopicInput}
              onChange={(e) => setNewTopicInput(e.target.value)}
              placeholder="Add keyword (e.g. NVIDIA, Opec, Semiconductors)..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Frequency */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Delivery Frequency & Throttling:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['INSTANT', '30M', 'DAILY'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  frequency === f
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {f === 'INSTANT' ? 'Real-Time' : f === '30M' ? '30-Min Digest' : 'Daily Brief'}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer transition-all flex items-center gap-1.5"
          >
            {toastSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <span>Save Alert Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
