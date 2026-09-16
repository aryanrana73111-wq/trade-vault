import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Input';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { getStoredNewsSettings, formatEventDateTime } from '@/lib/news/newsStore';
import { 
  Flame, 
  ArrowRight, 
  Clock, 
  Calendar, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export function HighImpactNewsWidget() {
  const navigate = useNavigate();
  const settings = getStoredNewsSettings();
  
  // High impact events sorted by date
  const highImpactEvents = NEWS_EVENTS
    .filter(e => e.impact === 'HIGH')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 4);

  return (
    <Card className="p-4 sm:p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 w-full min-w-0">
      <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">High-Impact News Radar</h2>
            <p className="text-[11px] text-slate-400 truncate">Tier-1 catalysts affecting volatility & spreads</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/news?tab=calendar')}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 transition-colors shrink-0 py-1 px-1.5 min-h-[36px]"
        >
          <span>Calendar</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {highImpactEvents.map(ev => {
          const { dateStr, timeStr, relativeStr } = formatEventDateTime(ev.dateTime, settings.timezone);

          return (
            <div
              key={ev.id}
              onClick={() => navigate(`/news?tab=calendar&eventId=${ev.id}`)}
              className="p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer flex items-center justify-between gap-2 sm:gap-3 group min-w-0"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <span className="text-base sm:text-lg shrink-0">
                  {ev.countryCode === 'US' ? '🇺🇸' : ev.countryCode === 'EU' ? '🇪🇺' : ev.countryCode === 'GB' ? '🇬🇧' : ev.countryCode === 'JP' ? '🇯🇵' : '🌐'}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {ev.name}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded shrink-0">
                      {ev.currency}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex-wrap">
                    <span>{dateStr}</span>
                    <span>•</span>
                    <span>{timeStr}</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">{relativeStr}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="text-right text-xs hidden md:block">
                  <span className="text-[10px] text-slate-400 block uppercase">Forecast</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {ev.forecast !== undefined ? `${ev.forecast}${ev.unit}` : 'N/A'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          Expect spread widening ~60s prior to release
        </span>
        <button
          onClick={() => navigate('/news?tab=radar')}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-left sm:text-right py-1 min-h-[32px] flex items-center"
        >
          View Volatility Radar →
        </button>
      </div>
    </Card>
  );
}
