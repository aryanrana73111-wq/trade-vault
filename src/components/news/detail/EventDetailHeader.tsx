import React from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { 
  ArrowLeft, 
  Bookmark, 
  Bell, 
  Share2, 
  ExternalLink, 
  LayoutDashboard,
  Calendar,
  Clock,
  Building2,
  Check
} from 'lucide-react';
import { CURRENCY_FLAGS } from '../EconomicCalendarView';

interface EventDetailHeaderProps {
  event: NewsEvent;
  timezone: string;
  onBackToCalendar: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onOpenAlertModal: () => void;
  isAlertSet: boolean;
  onAddToCommandCenter?: () => void;
  isInCommandCenter?: boolean;
}

export function EventDetailHeader({
  event,
  timezone,
  onBackToCalendar,
  isWatchlisted,
  onToggleWatchlist,
  onOpenAlertModal,
  isAlertSet,
  onAddToCommandCenter,
  isInCommandCenter = false
}: EventDetailHeaderProps) {
  const formattedDate = new Date(event.dateTime).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: timezone === 'UTC' ? 'UTC' : undefined
  });

  const formattedTime = new Date(event.dateTime).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone === 'UTC' ? 'UTC' : undefined
  });

  const getImpactBadge = () => {
    switch (event.impact) {
      case 'HIGH':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'LOW':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900/60';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadge = () => {
    switch (event.status) {
      case 'Released':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60';
      case 'Revised':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'Delayed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900/60';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top navigation row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={onBackToCalendar}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Back to Calendar</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Add to Command Center */}
          {onAddToCommandCenter && (
            <button
              type="button"
              onClick={onAddToCommandCenter}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                isInCommandCenter
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
              title={isInCommandCenter ? 'In Command Center' : 'Add to Command Center'}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isInCommandCenter ? 'In Command Center' : 'Add to Command Center'}
              </span>
            </button>
          )}

          {/* Set Alert */}
          <button
            type="button"
            onClick={onOpenAlertModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isAlertSet
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title="Configure Event Alert"
          >
            <Bell className="w-3.5 h-3.5" fill={isAlertSet ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{isAlertSet ? 'Alert Active' : 'Set Alert'}</span>
          </button>

          {/* Save / Bookmark */}
          <button
            type="button"
            onClick={onToggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isWatchlisted
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
            title={isWatchlisted ? 'Saved to Watchlist' : 'Save Event'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isWatchlisted ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline">{isWatchlisted ? 'Saved' : 'Save Event'}</span>
          </button>
        </div>
      </div>

      {/* Main Title & Metadata banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          {/* Pills: Country flag, Currency, Impact, Status, Category */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl" role="img" aria-label={event.country}>
              {CURRENCY_FLAGS[event.currency] || '🌐'}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs font-mono tracking-wider">
              {event.currency}
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border uppercase tracking-wider ${getImpactBadge()}`}>
              {event.impact} IMPACT
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border uppercase tracking-wider ${getStatusBadge()}`}>
              {event.status}
            </span>
            {event.period && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • {event.period}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {event.name}
          </h1>

          {/* Timing details */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedTime} ({timezone})</span>
            </span>
            {event.source && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{event.source}</span>
              </span>
            )}
          </div>
        </div>

        {/* Source link */}
        {event.sourceUrl && (
          <div className="shrink-0">
            <a
              href={event.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
            >
              <span>Official Release Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
