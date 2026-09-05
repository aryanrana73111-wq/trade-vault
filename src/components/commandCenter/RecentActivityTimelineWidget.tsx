import React from 'react';
import { 
  Clock, 
  ArrowRight, 
  ExternalLink,
  FileText,
  Brain,
  BookOpenCheck,
  Target,
  Sparkles
} from 'lucide-react';
import { RecentActivityEvent } from '@/types/commandCenter';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityTimelineWidgetProps {
  events: RecentActivityEvent[];
  maxEvents?: number;
}

export const RecentActivityTimelineWidget: React.FC<RecentActivityTimelineWidgetProps> = ({
  events,
  maxEvents = 10
}) => {
  const navigate = useNavigate();
  const displayEvents = events.slice(0, maxEvents);

  const getEventIcon = (type: RecentActivityEvent['type']) => {
    switch (type) {
      case 'trade_added':
      case 'trade_edited':
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'psychology_updated':
        return <Brain className="w-3.5 h-3.5 text-purple-500" />;
      case 'learning_saved':
        return <BookOpenCheck className="w-3.5 h-3.5 text-amber-500" />;
      case 'rule_created':
      case 'rule_updated':
        return <BookOpenCheck className="w-3.5 h-3.5 text-indigo-500" />;
      case 'strategy_updated':
        return <Target className="w-3.5 h-3.5 text-cyan-500" />;
      case 'ai_analysis_run':
        return <Sparkles className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Recent Activity Timeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live audit stream of recorded actions across trades, psychology logs, and rule changes.
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {events.length} logged actions
        </span>
      </div>

      {/* Timeline Stream */}
      <div className="mt-4">
        {displayEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {displayEvents.map((event) => {
              let timeStr = 'Recently';
              try {
                timeStr = formatDistanceToNow(new Date(event.timestamp), { addSuffix: true });
              } catch (e) {
                // ignore
              }

              return (
                <div key={event.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {event.title}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${event.badgeColor}`}>
                          {event.badgeText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {timeStr}
                      </span>
                      <button
                        onClick={() => navigate(event.route)}
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        title="View Record"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
