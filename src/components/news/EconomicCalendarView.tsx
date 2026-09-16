import React, { useState, useMemo, useEffect } from 'react';
import { 
  NewsEvent, 
  NewsImpact, 
  NewsCategory, 
  ReleaseStatus,
  CalendarEventAlert 
} from '@/types/newsIntelligence';
import { 
  formatEventDateTime 
} from '@/lib/news/newsStore';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  SlidersHorizontal, 
  Bookmark, 
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ChevronLeft,
  ChevronDown,
  Bell,
  BarChart2,
  FileText,
  Share2,
  Download,
  Info,
  Check,
  Flame,
  Globe,
  Radio,
  Eye,
  CalendarCheck
} from 'lucide-react';
import { QuickHistoryChartModal } from './calendar/QuickHistoryChartModal';
import { ConfigureAlertModal } from './calendar/ConfigureAlertModal';
import { RevisionDetailsPopover } from './calendar/RevisionDetailsPopover';
import { AdvancedFilterModal, CalendarFilterState } from './calendar/AdvancedFilterModal';
import { WeeklyEventDistributionChart } from './calendar/WeeklyEventDistributionChart';

interface EconomicCalendarViewProps {
  events: NewsEvent[];
  timezone: string;
  onTimezoneChange?: (tz: string) => void;
  onSelectEvent: (event: NewsEvent) => void;
  watchlistedEventIds: string[];
  onToggleWatchlist: (eventId: string) => void;
  onOpenSettings: () => void;
}

// Currency flag helper
export const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  NZD: '🇳🇿',
  CNY: '🇨🇳',
  WW: '🌐'
};

const TIMEZONE_OPTIONS = [
  { code: 'Asia/Kolkata', label: 'IST (UTC+5:30)', short: 'IST' },
  { code: 'UTC', label: 'UTC (GMT+0)', short: 'UTC' },
  { code: 'Europe/London', label: 'GMT (London)', short: 'GMT' },
  { code: 'America/New_York', label: 'EST / EDT (New York)', short: 'EST' },
  { code: 'Europe/Berlin', label: 'CET (Frankfurt)', short: 'CET' },
  { code: 'Asia/Tokyo', label: 'JST (Tokyo)', short: 'JST' },
  { code: 'Australia/Sydney', label: 'AEST (Sydney)', short: 'AEST' }
];

export function EconomicCalendarView({
  events,
  timezone,
  onTimezoneChange,
  onSelectEvent,
  watchlistedEventIds,
  onToggleWatchlist,
  onOpenSettings
}: EconomicCalendarViewProps) {
  // Calendar Anchor Date (defaults to current app date: Sep 10, 2026)
  const [currentAnchorDate, setCurrentAnchorDate] = useState<Date>(() => new Date('2026-09-10T12:00:00Z'));
  const [activePreset, setActivePreset] = useState<'this_week' | 'today' | 'tomorrow' | 'next_week' | 'prev_week' | 'this_month' | 'custom'>('this_week');

  // Active user timezone (persisted in localStorage)
  const [selectedTz, setSelectedTz] = useState<string>(() => {
    try {
      const stored = localStorage.getItem('tradevault_calendar_tz');
      return stored || timezone || 'Asia/Kolkata';
    } catch {
      return timezone || 'Asia/Kolkata';
    }
  });

  const handleTzChange = (tz: string) => {
    setSelectedTz(tz);
    try {
      localStorage.setItem('tradevault_calendar_tz', tz);
    } catch {
      // ignore
    }
    if (onTimezoneChange) onTimezoneChange(tz);
  };

  // Stored alerts for events
  const [calendarAlerts, setCalendarAlerts] = useState<Record<string, CalendarEventAlert>>(() => {
    try {
      const raw = localStorage.getItem('tradevault_calendar_alerts');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const handleSaveAlert = (alert: CalendarEventAlert) => {
    setCalendarAlerts(prev => {
      const updated = { ...prev, [alert.eventId]: alert };
      try {
        localStorage.setItem('tradevault_calendar_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setToastMessage(`Alert configured: ${alert.leadMinutes}m before ${alert.eventName}`);
  };

  const handleRemoveAlert = (eventId: string) => {
    setCalendarAlerts(prev => {
      const updated = { ...prev };
      delete updated[eventId];
      try {
        localStorage.setItem('tradevault_calendar_alerts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setToastMessage('Alert removed.');
  };

  // Toast notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  // Modals state
  const [historyModalEvent, setHistoryModalEvent] = useState<NewsEvent | null>(null);
  const [alertModalEvent, setAlertModalEvent] = useState<NewsEvent | null>(null);
  const [revisionModalEvent, setRevisionModalEvent] = useState<NewsEvent | null>(null);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [showGraphicalSummary, setShowGraphicalSummary] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedImpacts, setSelectedImpacts] = useState<NewsImpact[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<NewsCategory[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<ReleaseStatus[]>([]);
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});

  // Quick Currency Selector (single currency filter)
  const handleSingleCurrencyFilter = (currency: string) => {
    if (selectedCurrencies.length === 1 && selectedCurrencies[0] === currency) {
      setSelectedCurrencies([]);
    } else {
      setSelectedCurrencies([currency]);
    }
  };

  // Helper to calculate week range [Sunday 00:00 to Saturday 23:59:59]
  const weekBounds = useMemo(() => {
    const d = new Date(currentAnchorDate);
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    const diffToSunday = d.getDate() - day;

    const startOfWeek = new Date(d.setDate(diffToSunday));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const label = `${startOfWeek.toLocaleDateString('en-US', options)} – ${endOfWeek.toLocaleDateString('en-US', options)}`;

    return {
      start: startOfWeek,
      end: endOfWeek,
      label
    };
  }, [currentAnchorDate]);

  // Week navigation
  const navigateWeek = (weekOffset: number) => {
    const newDate = new Date(currentAnchorDate);
    newDate.setDate(newDate.getDate() + weekOffset * 7);
    setCurrentAnchorDate(newDate);
    setActivePreset(weekOffset === 0 ? 'this_week' : 'custom');
  };

  const handleSelectPreset = (preset: 'this_week' | 'today' | 'tomorrow' | 'next_week' | 'prev_week' | 'this_month') => {
    setActivePreset(preset);
    const baseDate = new Date('2026-09-10T12:00:00Z');

    if (preset === 'this_week') {
      setCurrentAnchorDate(baseDate);
      setCustomRange({});
    } else if (preset === 'today') {
      setCurrentAnchorDate(baseDate);
      setCustomRange({ start: '2026-09-10', end: '2026-09-10' });
    } else if (preset === 'tomorrow') {
      const tom = new Date(baseDate);
      tom.setDate(tom.getDate() + 1);
      setCurrentAnchorDate(tom);
      setCustomRange({ start: '2026-09-11', end: '2026-09-11' });
    } else if (preset === 'next_week') {
      const next = new Date(baseDate);
      next.setDate(next.getDate() + 7);
      setCurrentAnchorDate(next);
      setCustomRange({});
    } else if (preset === 'prev_week') {
      const prev = new Date(baseDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentAnchorDate(prev);
      setCustomRange({});
    } else if (preset === 'this_month') {
      setCurrentAnchorDate(baseDate);
      setCustomRange({ start: '2026-09-01', end: '2026-09-30' });
    }
  };

  // Distinct currencies list across all events
  const availableCurrencies = useMemo(() => {
    return Array.from(new Set(events.map(e => e.currency))).sort();
  }, [events]);

  // Filter events according to week bounds, presets, and active filters
  const visibleEvents = useMemo(() => {
    return events.filter(e => {
      const eventDate = new Date(e.dateTime);

      // 1. Date / Week constraint
      if (customRange.start && customRange.end) {
        const start = new Date(customRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customRange.end);
        end.setHours(23, 59, 59, 999);
        if (eventDate < start || eventDate > end) return false;
      } else {
        // Default strictly to current selected week
        if (eventDate < weekBounds.start || eventDate > weekBounds.end) {
          return false;
        }
      }

      // 2. Search query (name, code, country, currency, category, whoReleasesIt)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.currency.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.whoReleasesIt && e.whoReleasesIt.toLowerCase().includes(q)) ||
          (e.simpleExplanation && e.simpleExplanation.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 3. Currency multi-select
      if (selectedCurrencies.length > 0 && !selectedCurrencies.includes(e.currency)) {
        return false;
      }

      // 4. Impact multi-select
      if (selectedImpacts.length > 0 && !selectedImpacts.includes(e.impact)) {
        return false;
      }

      // 5. Category multi-select
      if (selectedCategories.length > 0 && !selectedCategories.includes(e.category)) {
        return false;
      }

      // 6. Status multi-select
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(e.status)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [
    events,
    weekBounds,
    customRange,
    searchQuery,
    selectedCurrencies,
    selectedImpacts,
    selectedCategories,
    selectedStatuses
  ]);

  // Group events by Day (e.g. SUN • SEP 6, MON • SEP 7, TODAY • SEP 10)
  const groupedEventsByDay = useMemo(() => {
    const groups: {
      dateKey: string;
      dayLabel: string;
      dateLabel: string;
      isToday: boolean;
      events: NewsEvent[];
    }[] = [];

    const dateMap = new Map<string, NewsEvent[]>();

    visibleEvents.forEach(e => {
      const d = new Date(e.dateTime);
      const dateKey = d.toISOString().split('T')[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey)!.push(e);
    });

    dateMap.forEach((evList, dateKey) => {
      const [year, month, day] = dateKey.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const isToday = dateKey === '2026-09-10'; // Simulated app date is Sep 10, 2026

      const dayLabel = isToday ? `TODAY • ${weekday}` : weekday;
      const dateLabel = `${monthStr} ${day}`;

      groups.push({
        dateKey,
        dayLabel,
        dateLabel,
        isToday,
        events: evList
      });
    });

    return groups;
  }, [visibleEvents]);

  // Up Next Event Calculation & Live Countdown Timer
  const [nowTime, setNowTime] = useState<number>(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upNextEvent = useMemo(() => {
    // Find next upcoming high or medium impact event
    const appSimulatedNow = new Date('2026-09-10T06:30:00Z').getTime();
    const upcoming = events
      .filter(e => {
        const time = new Date(e.dateTime).getTime();
        return time >= appSimulatedNow && (e.impact === 'HIGH' || e.impact === 'MEDIUM');
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
    return upcoming[0] || null;
  }, [events]);

  // Countdown string for Up Next Event
  const countdownString = useMemo(() => {
    if (!upNextEvent) return '00:00:00';
    const target = new Date(upNextEvent.dateTime).getTime();
    // Simulate current time relative to 06:30:00
    const diff = Math.max(0, target - new Date('2026-09-10T06:30:00Z').getTime());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }, [upNextEvent, nowTime]);

  // "Week at a Glance" Metrics across this week's events
  const weekGlanceStats = useMemo(() => {
    const thisWeekAll = events.filter(e => {
      const t = new Date(e.dateTime);
      return t >= weekBounds.start && t <= weekBounds.end;
    });

    const highImpact = thisWeekAll.filter(e => e.impact === 'HIGH').length;
    const centralBanks = thisWeekAll.filter(e => e.category === 'Central Bank' || e.category === 'Monetary Policy').length;
    const inflation = thisWeekAll.filter(e => e.category === 'Inflation').length;
    const employment = thisWeekAll.filter(e => e.category === 'Employment').length;
    const gdp = thisWeekAll.filter(e => e.category === 'Growth').length;
    const speeches = thisWeekAll.filter(e => e.category === 'Speeches').length;

    return {
      highImpact,
      centralBanks,
      inflation,
      employment,
      gdp,
      speeches,
      total: thisWeekAll.length
    };
  }, [events, weekBounds]);

  // "Currency Summary" (USD: 8 High, EUR: 5 High, etc.)
  const currencySummary = useMemo(() => {
    const counts: Record<string, number> = {};
    const thisWeekAll = events.filter(e => {
      const t = new Date(e.dateTime);
      return t >= weekBounds.start && t <= weekBounds.end && e.impact === 'HIGH';
    });

    thisWeekAll.forEach(e => {
      counts[e.currency] = (counts[e.currency] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [events, weekBounds]);

  // Key Scheduled Events marquee for this week
  const thisWeekKeyEvents = useMemo(() => {
    return events.filter(e => {
      const t = new Date(e.dateTime);
      return t >= weekBounds.start && t <= weekBounds.end && e.impact === 'HIGH';
    }).slice(0, 4);
  }, [events, weekBounds]);

  // Export handlers (ICS, CSV, JSON)
  const handleExport = (type: 'csv' | 'json' | 'ics') => {
    setShowExportMenu(false);
    if (type === 'csv') {
      const headers = ['Date', 'Time', 'Currency', 'Impact', 'Event', 'Status', 'Actual', 'Forecast', 'Previous', 'Unit', 'Source'];
      const rows = visibleEvents.map(e => {
        const { dateStr, timeStr } = formatEventDateTime(e.dateTime, selectedTz);
        return [
          `"${dateStr}"`,
          `"${timeStr}"`,
          `"${e.currency}"`,
          `"${e.impact}"`,
          `"${e.name.replace(/"/g, '""')}"`,
          `"${e.status}"`,
          `"${e.actual ?? ''}"`,
          `"${e.forecast ?? ''}"`,
          `"${e.previous ?? ''}"`,
          `"${e.unit}"`,
          `"${e.source}"`
        ].join(',');
      });
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TradeVault_Calendar_${weekBounds.label.replace(/\s/g, '_')}.csv`;
      a.click();
      setToastMessage('Calendar CSV exported successfully.');
    } else if (type === 'json') {
      const jsonContent = JSON.stringify(visibleEvents, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TradeVault_Calendar_${weekBounds.label.replace(/\s/g, '_')}.json`;
      a.click();
      setToastMessage('Calendar JSON exported successfully.');
    } else if (type === 'ics') {
      // Basic standard ICS calendar file format
      const icsEvents = visibleEvents.map(e => {
        const start = new Date(e.dateTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const end = new Date(new Date(e.dateTime).getTime() + 30 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        return [
          'BEGIN:VEVENT',
          `UID:${e.id}@tradevault.com`,
          `DTSTAMP:${start}`,
          `DTSTART:${start}`,
          `DTEND:${end}`,
          `SUMMARY:[${e.currency}] ${e.name}`,
          `DESCRIPTION:${e.simpleExplanation.replace(/\n/g, ' ')} | Source: ${e.source}`,
          'END:VEVENT'
        ].join('\r\n');
      }).join('\r\n');

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//TradeVault//Economic Calendar//EN',
        icsEvents,
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TradeVault_Calendar_${weekBounds.label.replace(/\s/g, '_')}.ics`;
      a.click();
      setToastMessage('iCalendar (.ics) file exported successfully.');
    }
  };

  // Share Calendar Link
  const handleShare = () => {
    try {
      const shareUrl = `${window.location.origin}/news?tab=calendar&week=${encodeURIComponent(weekBounds.label)}&tz=${selectedTz}`;
      navigator.clipboard.writeText(shareUrl);
      setToastMessage('Shareable calendar link copied to clipboard!');
    } catch {
      setToastMessage('Copied calendar view configuration.');
    }
  };

  // Helper for Impact styling
  const renderImpactBadge = (impact: NewsImpact) => {
    switch (impact) {
      case 'HIGH':
        return (
          <span 
            className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[48px] text-[10px] font-black uppercase tracking-wider rounded-xs bg-rose-600 text-white shadow-xs"
            aria-label="High Impact Economic Event"
            title="High Impact"
          >
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span 
            className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[48px] text-[10px] font-black uppercase tracking-wider rounded-xs bg-amber-500 text-slate-950 shadow-xs"
            aria-label="Medium Impact Economic Event"
            title="Medium Impact"
          >
            MED
          </span>
        );
      case 'LOW':
        return (
          <span 
            className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[48px] text-[10px] font-bold uppercase tracking-wider rounded-xs bg-amber-300 dark:bg-amber-400 text-slate-900"
            aria-label="Low Impact Economic Event"
            title="Low Impact"
          >
            LOW
          </span>
        );
      case 'NON-ECONOMIC':
      default:
        return (
          <span 
            className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[48px] text-[10px] font-semibold uppercase tracking-wider rounded-xs bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300"
            aria-label="Non-Economic Event"
            title="Non-Economic"
          >
            NON-ECO
          </span>
        );
    }
  };

  // Helper for Actual vs Forecast visual signal
  const renderSurpriseSignal = (event: NewsEvent) => {
    if (event.actual === undefined || event.actual === null || event.actual === '—') {
      return null;
    }

    if (event.surpriseDirection === 'Stronger than expected') {
      return (
        <span 
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
          title="Actual above consensus"
        >
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>Above</span>
        </span>
      );
    } else if (event.surpriseDirection === 'Weaker than expected') {
      return (
        <span 
          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400"
          title="Actual below consensus"
        >
          <TrendingDown className="w-3 h-3 shrink-0" />
          <span>Below</span>
        </span>
      );
    } else if (event.surpriseDirection === 'In line') {
      return (
        <span 
          className="text-[11px] font-semibold text-slate-500 dark:text-slate-400"
          title="Actual matched consensus exactly"
        >
          In Line
        </span>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-blue-600 shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-2"
          role="status"
        >
          <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP MARQUEE: UP NEXT + THIS WEEK KEY EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* UP NEXT WIDGET (Requirements 14) */}
        {upNextEvent && (
          <div className="lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white border border-blue-900/60 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Clock className="w-24 h-24 text-blue-400" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                    UP NEXT • LIVE CATALYST
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/80 border border-blue-700/60 text-[10px] font-mono text-blue-200">
                  T-{countdownString}
                </span>
              </div>

              <div className="flex items-start gap-2.5 mt-1">
                <span className="text-2xl">{CURRENCY_FLAGS[upNextEvent.currency] || '🌐'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-200">
                      {upNextEvent.currency}
                    </span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {formatEventDateTime(upNextEvent.dateTime, selectedTz).timeStr}
                    </span>
                    {renderImpactBadge(upNextEvent.impact)}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">
                    {upNextEvent.name}
                  </h4>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-blue-900/50 flex items-center justify-between">
              <div className="text-[11px] text-slate-300 font-mono">
                Consensus: <strong>{upNextEvent.forecast !== undefined ? `${upNextEvent.forecast}${upNextEvent.unit === '%' ? '%' : ''}` : 'N/A'}</strong>
              </div>
              <button
                type="button"
                onClick={() => onSelectEvent(upNextEvent)}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors flex items-center gap-1"
              >
                <span>View Event</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* THIS WEEK'S KEY EVENTS (Requirement 29) */}
        <div className={upNextEvent ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  THIS WEEK&apos;S KEY EVENTS
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {thisWeekKeyEvents.length} Top Scheduled Catalysts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {thisWeekKeyEvents.map(evt => {
                const { dateStr, timeStr } = formatEventDateTime(evt.dateTime, selectedTz);
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => onSelectEvent(evt)}
                    className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 bg-slate-50/50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 text-left transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-base">{CURRENCY_FLAGS[evt.currency] || '🌐'}</span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="font-bold font-mono text-slate-900 dark:text-white">
                            {evt.currency}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono">
                            {dateStr.split(',')[0]} {timeStr}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {evt.name}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. WEEK AT A GLANCE (Requirement 27) & CURRENCY SUMMARY (Requirement 28) */}
      <div className="space-y-3">
        {/* Glance metric cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedImpacts(['HIGH'])}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-500 text-left transition-all shadow-xs group"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">High Impact</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                {weekGlanceStats.highImpact}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-rose-500 font-semibold">Filter →</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategories(['Central Bank', 'Monetary Policy'])}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left transition-all shadow-xs group"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Central Banks</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
                {weekGlanceStats.centralBanks}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-blue-500 font-semibold">Filter →</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategories(['Inflation'])}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 text-left transition-all shadow-xs group"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Inflation Prints</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                {weekGlanceStats.inflation}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-amber-500 font-semibold">Filter →</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategories(['Employment'])}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-left transition-all shadow-xs group"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Employment Data</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {weekGlanceStats.employment}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-emerald-500 font-semibold">Filter →</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategories(['Growth'])}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left transition-all shadow-xs group"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">GDP Releases</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {weekGlanceStats.gdp}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 font-semibold">Filter →</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategories(['Speeches'])}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 text-left transition-all shadow-xs group"
          >
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Major Speeches</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400">
                {weekGlanceStats.speeches}
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-purple-500 font-semibold">Filter →</span>
            </div>
          </button>
        </div>

        {/* Currency Summary Pill Bar (Requirement 28) */}
        <div className="flex flex-wrap items-center gap-2 py-1 px-3 rounded-xl bg-slate-100/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            Currency High Impact:
          </span>
          {currencySummary.map(([curr, count]) => {
            const isSelected = selectedCurrencies.includes(curr);
            return (
              <button
                key={curr}
                type="button"
                onClick={() => handleSingleCurrencyFilter(curr)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>{CURRENCY_FLAGS[curr] || '🌐'}</span>
                <span>{curr}:</span>
                <span className={isSelected ? 'text-white' : 'font-bold text-rose-600 dark:text-rose-400'}>
                  {count} High
                </span>
              </button>
            );
          })}
          {selectedCurrencies.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCurrencies([])}
              className="ml-auto text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Reset Currency Filter
            </button>
          )}
        </div>
      </div>

      {/* 3. PRIMARY WEEK NAVIGATION & TOOLBAR (Requirements 2, 3, 5, 6) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Row 1: Week Title, Navigation Buttons, and Quick Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          {/* Week Header & Prev/Next Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => navigateWeek(-1)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                title="Previous Week"
                aria-label="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('this_week')}
                className="px-3 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => navigateWeek(1)}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                title="Next Week"
                aria-label="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {activePreset === 'this_week' ? 'CURRENT WEEK' : 'SELECTED PERIOD'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                  {weekBounds.label}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <span>Economic Calendar</span>
                <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">
                  ({visibleEvents.length} events scheduled)
                </span>
              </h2>
            </div>
          </div>

          {/* Quick Date Presets Row */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => handleSelectPreset('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activePreset === 'today'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Today (Sep 10)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('tomorrow')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activePreset === 'tomorrow'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('this_week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activePreset === 'this_week'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('next_week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activePreset === 'next_week'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Next Week
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('prev_week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activePreset === 'prev_week'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Previous Week
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('this_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activePreset === 'this_month'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Custom Range</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search, Impact Toggles, Timezone Selector, Filters, Export & Share */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, currency, indicator, speaker (e.g. CPI, Powell, USD)..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>

          {/* Impact Quick Toggles */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 uppercase">
              Impact:
            </span>
            {(['HIGH', 'MEDIUM', 'LOW', 'NON-ECONOMIC'] as NewsImpact[]).map((imp) => {
              const isSelected = selectedImpacts.includes(imp);
              return (
                <button
                  key={imp}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedImpacts(selectedImpacts.filter(i => i !== imp));
                    } else {
                      setSelectedImpacts([...selectedImpacts, imp]);
                    }
                  }}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all border ${
                    isSelected
                      ? imp === 'HIGH'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : imp === 'MEDIUM'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : imp === 'LOW'
                        ? 'bg-amber-300 dark:bg-amber-400 text-slate-900 border-amber-300'
                        : 'bg-slate-500 text-white border-slate-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {imp === 'NON-ECONOMIC' ? 'NON-ECO' : imp}
                </button>
              );
            })}
            {selectedImpacts.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedImpacts([])}
                className="text-[10px] text-slate-400 hover:text-slate-600 ml-1"
                title="Clear impact filter"
              >
                Clear
              </button>
            )}
          </div>

          {/* Actions & Timezone Selector */}
          <div className="flex items-center gap-2 justify-end">
            {/* Timezone Selector (Requirement 6) */}
            <div className="relative flex items-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1.5 hidden sm:inline">
                Calendar Time Zone:
              </span>
              <select
                value={selectedTz}
                onChange={(e) => handleTzChange(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                aria-label="Calendar Time Zone"
              >
                {TIMEZONE_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code}>
                    {opt.short} ({opt.label.split('(')[1] ? opt.label.split('(')[1].replace(')', '') : opt.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Filters Button */}
            <button
              type="button"
              onClick={() => setIsAdvancedFilterOpen(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                selectedCurrencies.length > 0 || selectedCategories.length > 0 || selectedStatuses.length > 0 || selectedImpacts.length > 0
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedCurrencies.length > 0 || selectedCategories.length > 0 || selectedStatuses.length > 0) && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {[selectedCurrencies.length > 0, selectedCategories.length > 0, selectedStatuses.length > 0].filter(Boolean).length}
                </span>
              )}
            </button>

            {/* Graphical Summary Toggle (Requirement 32) */}
            <button
              type="button"
              onClick={() => setShowGraphicalSummary(!showGraphicalSummary)}
              className={`p-2 rounded-xl border transition-colors ${
                showGraphicalSummary
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
              title="Toggle Weekly Event Distribution Chart"
              aria-label="Toggle Weekly Distribution Chart"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            {/* Export Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                title="Export Calendar (ICS, CSV, JSON)"
                aria-label="Export Calendar"
              >
                <Download className="w-4 h-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-30 animate-in fade-in">
                  <button
                    type="button"
                    onClick={() => handleExport('ics')}
                    className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Export iCalendar (.ics)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Export Table (.csv)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport('json')}
                    className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                  >
                    Export Raw JSON (.json)
                  </button>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              title="Copy shareable calendar link"
              aria-label="Share Calendar"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. OPTIONAL GRAPHICAL SUMMARY (Requirement 32) */}
      {showGraphicalSummary && (
        <WeeklyEventDistributionChart
          events={visibleEvents}
          onSelectCurrency={(curr) => handleSingleCurrencyFilter(curr)}
          onSelectImpact={(imp) => setSelectedImpacts([imp as NewsImpact])}
        />
      )}

      {/* 5. MAIN ECONOMIC CALENDAR: FOREX FACTORY INFORMATION ARCHITECTURE */}
      {visibleEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Economic Releases Scheduled
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            No macroeconomic catalysts match your active filters for {weekBounds.label}. Try adjusting currency selections or resetting impact filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCurrencies([]);
              setSelectedImpacts([]);
              setSelectedCategories([]);
              setSelectedStatuses([]);
              setSearchQuery('');
              setCustomRange({});
              setActivePreset('this_week');
              setCurrentAnchorDate(new Date('2026-09-10T12:00:00Z'));
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xs transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEventsByDay.map(group => (
            <div 
              key={group.dateKey}
              className={`rounded-2xl border overflow-hidden transition-all shadow-xs ${
                group.isToday
                  ? 'border-blue-500/80 bg-white dark:bg-slate-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
              }`}
            >
              {/* Day Header Banner (Requirement 4) */}
              <div className={`px-4 sm:px-6 py-2.5 flex items-center justify-between border-b ${
                group.isToday
                  ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500/30'
                  : 'bg-slate-100/70 dark:bg-slate-850/80 border-slate-200/80 dark:border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <span className={`text-xs font-black tracking-wide font-mono ${
                    group.isToday
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {group.dayLabel}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
                    {group.dateLabel}
                  </span>
                  {group.isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                      CURRENT TRADING DAY
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>{group.events.length} releases</span>
                  <span>•</span>
                  <span>{group.events.filter(e => e.impact === 'HIGH').length} High Impact</span>
                </div>
              </div>

              {/* Desktop Wide Table (Requirement 5) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 dark:bg-slate-850/40 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-24">Time ({selectedTz.split('/')[1] || selectedTz})</th>
                      <th className="py-2.5 px-3 w-20">Currency</th>
                      <th className="py-2.5 px-3 w-16 text-center">Impact</th>
                      <th className="py-2.5 px-4">Event Catalyst</th>
                      <th className="py-2.5 px-2 w-10 text-center" title="Set event reminder alert">Alert</th>
                      <th className="py-2.5 px-2 w-10 text-center" title="View comprehensive intelligence breakdown">Detail</th>
                      <th className="py-2.5 px-3 w-28 text-right">Actual</th>
                      <th className="py-2.5 px-3 w-28 text-right">Forecast</th>
                      <th className="py-2.5 px-3 w-28 text-right">Previous</th>
                      <th className="py-2.5 px-3 w-12 text-center" title="Historical charts and reaction distributions">Graph</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {group.events.map(event => {
                      const { timeStr } = formatEventDateTime(event.dateTime, selectedTz);
                      const isAlertSet = Boolean(calendarAlerts[event.id]);
                      const isWatchlisted = watchlistedEventIds.includes(event.id);
                      const hasRevision = Boolean(event.revisionDetails || event.revisedPrevious);

                      return (
                        <tr 
                          key={event.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* 1. TIME */}
                          <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {timeStr}
                          </td>

                          {/* 2. CURRENCY */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleSingleCurrencyFilter(event.currency)}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-mono font-bold text-slate-900 dark:text-white"
                              title={`Filter to ${event.currency} events`}
                            >
                              <span>{CURRENCY_FLAGS[event.currency] || '🌐'}</span>
                              <span>{event.currency}</span>
                            </button>
                          </td>

                          {/* 3. IMPACT */}
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {renderImpactBadge(event.impact)}
                          </td>

                          {/* 4. EVENT NAME & METADATA */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onSelectEvent(event)}
                                className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left group-hover:underline"
                              >
                                {event.name}
                              </button>
                              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {event.category}
                              </span>
                              {event.status === 'Released' && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                  RELEASED
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              <span>Code: {event.code}</span>
                              <span>•</span>
                              <span>Period: {event.period}</span>
                              <span>•</span>
                              <span>Source: {event.source}</span>
                            </div>
                          </td>

                          {/* 5. ALERT */}
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => setAlertModalEvent(event)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isAlertSet
                                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                              title={isAlertSet ? 'Alert configured (Click to edit)' : 'Set release reminder alert'}
                              aria-label={`Set alert for ${event.name}`}
                            >
                              <Bell className="w-4 h-4" fill={isAlertSet ? 'currentColor' : 'none'} />
                            </button>
                          </td>

                          {/* 6. DETAIL */}
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => onSelectEvent(event)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              title="Open detailed event intelligence breakdown"
                              aria-label={`View details for ${event.name}`}
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          </td>

                          {/* 7. ACTUAL + SURPRISE SIGNAL */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {event.actual !== undefined && event.actual !== null && event.actual !== '—' ? (
                              <div className="flex flex-col items-end">
                                <span>{event.actual}{event.unit === '%' ? '%' : ` ${event.unit}`}</span>
                                {renderSurpriseSignal(event)}
                              </div>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500 font-normal">—</span>
                            )}
                          </td>

                          {/* 8. FORECAST */}
                          <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {event.forecast !== undefined && event.forecast !== null ? (
                              <div className="flex flex-col items-end">
                                <span>{event.forecast}{event.unit === '%' ? '%' : ` ${event.unit}`}</span>
                                <span className="text-[10px] text-slate-400">
                                  {event.forecastType || 'Consensus'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* 9. PREVIOUS + REVISION INDICATOR */}
                          <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {event.previous !== undefined && event.previous !== null ? (
                              <div className="flex items-center justify-end gap-1">
                                <span>{event.previous}{event.unit === '%' ? '%' : ` ${event.unit}`}</span>
                                {hasRevision && (
                                  <button
                                    type="button"
                                    onClick={() => setRevisionModalEvent(event)}
                                    className="px-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-xs cursor-pointer"
                                    title="Click to view historical official data revision details"
                                    aria-label="View revision details"
                                  >
                                    *
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          {/* 10. GRAPH */}
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setHistoryModalEvent(event)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                              title="View quick historical prints chart"
                              aria-label={`View historical chart for ${event.name}`}
                            >
                              <BarChart2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Adaptive Cards (Requirements 33) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {group.events.map(event => {
                  const { timeStr } = formatEventDateTime(event.dateTime, selectedTz);
                  const isAlertSet = Boolean(calendarAlerts[event.id]);
                  const hasRevision = Boolean(event.revisionDetails || event.revisedPrevious);

                  return (
                    <div key={event.id} className="p-4 space-y-3">
                      {/* Top Row: Time, Currency, Impact */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{CURRENCY_FLAGS[event.currency] || '🌐'}</span>
                          <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                            {event.currency}
                          </span>
                          <span className="text-slate-400 text-xs">•</span>
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                            {timeStr}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {renderImpactBadge(event.impact)}
                          <button
                            type="button"
                            onClick={() => setAlertModalEvent(event)}
                            className={`p-1.5 rounded-lg ${
                              isAlertSet ? 'text-amber-500' : 'text-slate-400'
                            }`}
                          >
                            <Bell className="w-4 h-4" fill={isAlertSet ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>

                      {/* Event Title */}
                      <button
                        type="button"
                        onClick={() => onSelectEvent(event)}
                        className="text-left font-bold text-xs text-slate-900 dark:text-white hover:text-blue-600 block"
                      >
                        {event.name}
                      </button>

                      {/* Numbers Grid: Actual, Forecast, Previous */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Actual</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {event.actual !== undefined && event.actual !== null ? `${event.actual}${event.unit === '%' ? '%' : ''}` : '—'}
                          </span>
                          {renderSurpriseSignal(event)}
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Forecast</span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {event.forecast !== undefined && event.forecast !== null ? `${event.forecast}${event.unit === '%' ? '%' : ''}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Previous</span>
                          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                            {event.previous !== undefined && event.previous !== null ? `${event.previous}${event.unit === '%' ? '%' : ''}` : '—'}
                            {hasRevision && <span className="text-amber-500 font-bold">*</span>}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Controls */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => setHistoryModalEvent(event)}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>Historical Chart</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectEvent(event)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <span>Full Detail</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. CALENDAR DATA INTEGRITY & ATTRIBUTION FOOTER (Requirement 38, 39) */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Verified Official Sources: U.S. Bureau of Labor Statistics (BLS), Federal Reserve Board, European Central Bank, ONS UK, Bank of Japan, PBoC.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Updated: Sep 10, 2026 • Live Official Feeds</span>
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Quick Historical Chart Modal */}
      {historyModalEvent && (
        <QuickHistoryChartModal
          event={historyModalEvent}
          onClose={() => setHistoryModalEvent(null)}
        />
      )}

      {/* 2. Configure Alert Modal */}
      {alertModalEvent && (
        <ConfigureAlertModal
          event={alertModalEvent}
          existingAlert={calendarAlerts[alertModalEvent.id]}
          onSaveAlert={handleSaveAlert}
          onRemoveAlert={handleRemoveAlert}
          onClose={() => setAlertModalEvent(null)}
        />
      )}

      {/* 3. Revision Details Popover */}
      {revisionModalEvent && (
        <RevisionDetailsPopover
          event={revisionModalEvent}
          onClose={() => setRevisionModalEvent(null)}
        />
      )}

      {/* 4. Advanced Filter Modal */}
      <AdvancedFilterModal
        isOpen={isAdvancedFilterOpen}
        onClose={() => setIsAdvancedFilterOpen(false)}
        availableCurrencies={availableCurrencies}
        filters={{
          currencies: selectedCurrencies,
          impacts: selectedImpacts,
          categories: selectedCategories,
          statuses: selectedStatuses,
          startDate: customRange.start,
          endDate: customRange.end,
          searchQuery
        }}
        onApplyFilters={(newFilters: CalendarFilterState) => {
          setSelectedCurrencies(newFilters.currencies);
          setSelectedImpacts(newFilters.impacts);
          setSelectedCategories(newFilters.categories);
          setSelectedStatuses(newFilters.statuses);
          setSearchQuery(newFilters.searchQuery);
          setCustomRange({
            start: newFilters.startDate,
            end: newFilters.endDate
          });
          if (newFilters.startDate || newFilters.endDate) {
            setActivePreset('custom');
          }
        }}
        onResetFilters={() => {
          setSelectedCurrencies([]);
          setSelectedImpacts([]);
          setSelectedCategories([]);
          setSelectedStatuses([]);
          setSearchQuery('');
          setCustomRange({});
          setActivePreset('this_week');
          setCurrentAnchorDate(new Date('2026-09-10T12:00:00Z'));
        }}
      />
    </div>
  );
}
