import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Sliders, 
  Info,
  ExternalLink
} from 'lucide-react';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { NewsUserSettings, NewsVolatilityAlert } from '@/types/newsIntelligence';
import { formatEventDateTime } from '@/lib/news/newsStore';

interface AlertsIntelligenceViewProps {
  settings: NewsUserSettings;
  onUpdateSettings: (updates: Partial<NewsUserSettings>) => void;
  onSelectEvent: (eventId: string) => void;
}

export const AlertsIntelligenceView: React.FC<AlertsIntelligenceViewProps> = ({
  settings,
  onUpdateSettings,
  onSelectEvent
}) => {
  const [now, setNow] = useState(Date.now());
  const leadMinutes = settings.preEventWarningMinutes || 30;
  const dismissedIds = settings.dismissedAlertIds || [];

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute active volatility warnings
  const activeAlerts: NewsVolatilityAlert[] = React.useMemo(() => {
    return NEWS_EVENTS.filter(ev => {
      if (ev.impact !== 'HIGH' && ev.impact !== 'MEDIUM') return false;
      const evTime = new Date(ev.dateTime).getTime();
      const diffMinutes = (evTime - now) / (1000 * 60);

      // Warning window: within next 48 hours and not in the distant past
      return diffMinutes > -60 && diffMinutes <= 2880;
    }).map(ev => {
      const evTime = new Date(ev.dateTime).getTime();
      const diffMinutes = Math.round((evTime - now) / (1000 * 60));

      let expectedVolatility: 'Extreme' | 'High' | 'Moderate' = 'High';
      let recommendedRiskAction = 'Widen stop-loss thresholds or wait 15 minutes post-release for spread normalization.';

      if (ev.code === 'FOMC' || ev.code === 'CPI' || ev.code === 'NFP') {
        expectedVolatility = 'Extreme';
        recommendedRiskAction = 'Expect peak spread expansion and slippage. Reduce leverage or avoid entering market orders in first 3 minutes.';
      }

      return {
        id: `alert-${ev.id}`,
        eventId: ev.id,
        eventName: ev.name,
        countryCode: ev.countryCode,
        currency: ev.currency,
        impact: ev.impact,
        scheduledTime: ev.dateTime,
        warningLeadMinutes: leadMinutes,
        affectedInstruments: ev.affectedMarkets.map(m => m.asset),
        catalystSummary: ev.simpleExplanation,
        expectedVolatility,
        recommendedRiskAction,
        dismissed: dismissedIds.includes(ev.id)
      };
    }).sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
  }, [now, leadMinutes, dismissedIds]);

  const handleDismissAlert = (eventId: string) => {
    onUpdateSettings({
      dismissedAlertIds: [...dismissedIds, eventId]
    });
  };

  const handleResetDismissed = () => {
    onUpdateSettings({ dismissedAlertIds: [] });
  };

  const formatCountdown = (iso: string) => {
    const diff = new Date(iso).getTime() - now;
    if (diff <= 0) return 'In Progress / Release Imminent';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="alerts-intelligence-view" className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Macro Risk & Volatility Guard
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Catalyst Volatility Alerts
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Automated alerts highlighting Tier-1 high-impact announcements capable of causing liquidity shockwaves, spread expansion, and rapid slippage.
          </p>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-neutral-500" />
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Pre-Event Warning Window:
          </span>
          <div className="flex items-center gap-1">
            {[15, 30, 60].map(mins => (
              <button
                key={mins}
                onClick={() => onUpdateSettings({ preEventWarningMinutes: mins })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  leadMinutes === mins
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                {mins}m Before
              </button>
            ))}
          </div>
        </div>

        {dismissedIds.length > 0 && (
          <button
            onClick={handleResetDismissed}
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white underline"
          >
            Restore {dismissedIds.length} Dismissed Alerts
          </button>
        )}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {activeAlerts.map(alert => {
          if (alert.dismissed) return null;
          const { dateStr, timeStr } = formatEventDateTime(alert.scheduledTime, settings.timezone);
          const countdown = formatCountdown(alert.scheduledTime);

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                alert.expectedVolatility === 'Extreme'
                  ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white">
                      <Flame className="w-3.5 h-3.5" />
                      {alert.expectedVolatility} Volatility Catalyst
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                      {alert.countryCode} • {alert.currency}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Scheduled: {dateStr} at {timeStr} ({settings.timezone || 'Local'})
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {alert.eventName}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
                    {alert.catalystSummary}
                  </p>
                </div>

                {/* Countdown pill */}
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                    Time to Release
                  </div>
                  <div className="font-mono text-lg font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="w-4 h-4" />
                    <span>{countdown}</span>
                  </div>
                </div>
              </div>

              {/* Trader Risk Guideline */}
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800 flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Risk Management Directive:
                  </span>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    {alert.recommendedRiskAction}
                  </p>
                </div>
              </div>

              {/* Sensitive Markets */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-1 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-neutral-500">Sensitive Instruments:</span>
                  {alert.affectedInstruments.map((inst, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 font-medium text-neutral-800 dark:text-neutral-200">
                      {inst}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDismissAlert(alert.eventId)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Acknowledge & Dismiss
                  </button>
                  <button
                    onClick={() => onSelectEvent(alert.eventId)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
                  >
                    Event Details →
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {activeAlerts.filter(a => !a.dismissed).length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
              No imminent volatility warnings in current window
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              All major macroeconomic releases for the immediate session have concluded or are outside the active alert buffer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
