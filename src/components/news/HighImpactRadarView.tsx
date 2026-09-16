import React from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { formatEventDateTime } from '@/lib/news/newsStore';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Flame, 
  ChevronRight, 
  ShieldAlert, 
  Layers, 
  Activity, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface HighImpactRadarViewProps {
  events: NewsEvent[];
  timezone: string;
  onSelectEvent: (event: NewsEvent) => void;
  onOpenScenarioLab: (eventId: string) => void;
  onOpenReactionLab: (eventId: string) => void;
  onOpenAcademy?: (articleId: string) => void;
}

export function HighImpactRadarView({
  events,
  timezone,
  onSelectEvent,
  onOpenScenarioLab,
  onOpenReactionLab,
  onOpenAcademy
}: HighImpactRadarViewProps) {
  const navigate = useNavigate();
  const highImpactEvents = events.filter(e => e.impact === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 text-white rounded-3xl border border-rose-900/40 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-rose-600/30 text-rose-400 border border-rose-500/40">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Macro Catalyst Horizon</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            High-Impact Economic Volatility Radar
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Major scheduled central bank meetings, labor releases, and inflation benchmarks. These Tier-1 events routinely expand spreads, drive intermarket trend shifts, and reprice global currency yield curves.
          </p>
        </div>
      </div>

      {/* Grid of High Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highImpactEvents.map(ev => {
          const { dateStr, timeStr, relativeStr } = formatEventDateTime(ev.dateTime, timezone);
          const isUpcoming = ev.status === 'Upcoming';

          return (
            <div
              key={ev.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{ev.countryCode === 'US' ? '🇺🇸' : ev.countryCode === 'EU' ? '🇪🇺' : ev.countryCode === 'GB' ? '🇬🇧' : ev.countryCode === 'JP' ? '🇯🇵' : '🌐'}</span>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">{ev.currency}</span>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                      HIGH IMPACT
                    </span>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    isUpcoming ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {relativeStr}
                  </span>
                </div>

                <div>
                  <h3 
                    onClick={() => onSelectEvent(ev)}
                    className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {ev.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dateStr}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeStr} ({timezone})</span>
                    <span>• {ev.category}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ev.simpleExplanation}
                </p>

                {/* Key Affected Assets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Most Sensitive Assets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ev.affectedMarkets.slice(0, 4).map((m, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium">
                        {m.asset}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status / Numbers box */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Previous</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ev.previous !== undefined ? `${ev.previous}${ev.unit}` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Forecast</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {ev.forecast !== undefined ? `${ev.forecast}${ev.unit}` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Actual</span>
                    <span className={`font-bold ${ev.actual !== undefined ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                      {ev.actual !== undefined ? `${ev.actual}${ev.unit}` : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectEvent(ev)}
                  className="text-xs gap-1"
                >
                  Full Intelligence <ChevronRight className="w-3.5 h-3.5" />
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenScenarioLab(ev.id)}
                    className="text-xs gap-1"
                    title="Open Scenarios"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-500" /> Scenarios
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenReactionLab(ev.id)}
                    className="text-xs gap-1"
                    title="Open Reaction Lab"
                  >
                    <Activity className="w-3.5 h-3.5 text-indigo-500" /> Lab
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-Event Risk Checklist */}
      <div className="p-6 bg-amber-50/70 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h4 className="font-bold text-sm text-amber-900 dark:text-amber-300">
            Institutional Risk Protocol for High-Impact Releases
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">1. Spread Expansion Buffer</span>
            <p className="text-slate-500 text-[11px]">Brokers pull liquidity 60s before high-impact data. Allow 3x-5x wider spreads on open stops or step aside.</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">2. Volatility Contraction Rule</span>
            <p className="text-slate-500 text-[11px]">Wait for the 15-minute candle to close before executing directional setups to avoid initial algorithmic whipsaws.</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-amber-900/30 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">3. Position Sizing Adjustment</span>
            <p className="text-slate-500 text-[11px]">Reduce baseline position risk (e.g. from 1.0% to 0.5%) on trades executed during high-impact release sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
