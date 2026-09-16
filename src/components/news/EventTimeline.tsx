import React, { useMemo, useState } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { Calendar, Clock, Flame, AlertCircle, Info } from 'lucide-react';

interface Props {
  events: NewsEvent[];
  onSelectEvent?: (event: NewsEvent) => void;
}

export function EventTimeline({ events, onSelectEvent }: Props) {
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);

  const weekDays = useMemo(() => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    return days.map((label, index) => {
      const d = new Date(now);
      d.setDate(diffToMonday + index);
      d.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayEvents = events.filter(e => {
        const eDate = new Date(e.dateTime);
        return eDate >= d && eDate <= dayEnd;
      }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

      return {
        label,
        dateStr: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        events: dayEvents
      };
    });
  }, [events]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center uppercase tracking-wider">
            <Calendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Weekly Catalyst Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key macroeconomic releases scheduled by day
          </p>
        </div>

        {/* Mobile Day Selector Tabs */}
        <div className="flex md:hidden items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {weekDays.map((day, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveDayIdx(idx)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeDayIdx === idx
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {day.label} ({day.events.length})
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Single Day View */}
      <div className="block md:hidden">
        <div className="border-b-2 border-blue-500 pb-2 mb-3 flex items-center justify-between">
          <span className="font-bold text-slate-900 dark:text-slate-100">{weekDays[activeDayIdx].label}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{weekDays[activeDayIdx].dateStr}</span>
        </div>

        <div className="space-y-2.5">
          {weekDays[activeDayIdx].events.length === 0 ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 italic p-4 text-center bg-slate-50 dark:bg-slate-850 rounded-xl">
              No major Tier-1 events scheduled for this day.
            </div>
          ) : (
            weekDays[activeDayIdx].events.map(event => (
              <div 
                key={event.id}
                onClick={() => onSelectEvent?.(event)}
                className="bg-slate-50 dark:bg-slate-850 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-xl p-3 border border-slate-200/80 dark:border-slate-750 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg leading-none" title={event.country}>{getFlagEmoji(event.countryCode)}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{event.currency}</span>
                  </div>
                  {event.impact === 'HIGH' ? (
                    <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 flex items-center">
                      <Flame className="w-2.5 h-2.5 mr-0.5 text-rose-500" /> HIGH
                    </span>
                  ) : event.impact === 'MEDIUM' ? (
                    <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 flex items-center">
                      <AlertCircle className="w-2.5 h-2.5 mr-0.5 text-amber-500" /> MED
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded">
                      LOW
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1">
                  {event.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Tablet / Desktop Grid View */}
      <div className="hidden md:grid grid-cols-5 gap-3.5">
        {weekDays.map((day, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="border-b-2 border-slate-200 dark:border-slate-700 pb-2 mb-3">
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{day.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{day.dateStr}</div>
            </div>
            
            <div className="flex-grow space-y-2.5">
              {day.events.length === 0 ? (
                <div className="text-[11px] text-slate-400 dark:text-slate-500 italic p-3 text-center bg-slate-50 dark:bg-slate-850/50 rounded-lg">
                  No scheduled releases
                </div>
              ) : (
                day.events.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => onSelectEvent?.(event)}
                    className="bg-slate-50 dark:bg-slate-850 hover:bg-blue-50/60 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-750 transition-colors cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-lg leading-none" title={event.country}>{getFlagEmoji(event.countryCode)}</span>
                      {event.impact === 'HIGH' ? (
                        <span className="text-[9px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/60 flex items-center">
                          <Flame className="w-2.5 h-2.5 mr-0.5 text-rose-500" /> HIGH
                        </span>
                      ) : event.impact === 'MEDIUM' ? (
                        <span className="text-[9px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900/60 flex items-center">
                          <AlertCircle className="w-2.5 h-2.5 mr-0.5 text-amber-500" /> MED
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          LOW
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug mb-1 line-clamp-2">
                      {event.code || event.name.substring(0, 32)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-auto">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
