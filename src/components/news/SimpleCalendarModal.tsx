import React, { useState } from 'react';
import { 
  X, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { format, parseISO, addMonths, subMonths, isSameDay, isToday } from 'date-fns';

interface SimpleCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  todayDateStr: string; // YYYY-MM-DD
}

export function SimpleCalendarModal({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  todayDateStr
}: SimpleCalendarModalProps) {
  if (!isOpen) return null;

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    try {
      return parseISO(selectedDate);
    } catch {
      return new Date();
    }
  });

  const selectedDateObj = parseISO(selectedDate);
  const todayDateObj = parseISO(todayDateStr);

  // Yesterday date string
  const yesterdayObj = new Date(todayDateObj);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  // Month navigation
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Build grid for currentMonth
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
  
  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const prevMonthDate = new Date(year, month - 1, d);
    days.push({
      dateStr: prevMonthDate.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Next month padding to fill 35 or 42 grid cells
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    days.push({
      dateStr: nextDate.toISOString().split('T')[0],
      dayNum: d,
      isCurrentMonth: false
    });
  }

  const handlePick = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">Select Date</h2>
              <p className="text-xs text-slate-400">View news and economic events for any specific trading day</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handlePick(todayDateStr)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedDate === todayDateStr
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <span>Today</span>
            <span className="text-[10px] opacity-75">({format(todayDateObj, 'MMM d')})</span>
          </button>

          <button
            type="button"
            onClick={() => handlePick(yesterdayStr)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedDate === yesterdayStr
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <span>Yesterday</span>
            <span className="text-[10px] opacity-75">({format(yesterdayObj, 'MMM d')})</span>
          </button>

          <button
            type="button"
            onClick={() => handlePick('2026-09-24')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedDate === '2026-09-24'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <span>Sep 24</span>
            <span className="text-[10px] text-amber-400 font-normal">Jobless</span>
          </button>

          <button
            type="button"
            onClick={() => handlePick('2026-09-20')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              selectedDate === '2026-09-20'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <span>Sep 20</span>
            <span className="text-[10px] text-emerald-400 font-normal">CPI</span>
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-slate-200">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 px-6 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 px-6 pb-4">
          {days.map(({ dateStr, dayNum, isCurrentMonth }, idx) => {
            const isSelected = dateStr === selectedDate;
            const isTodayDate = dateStr === todayDateStr;
            const isFuture = dateStr > todayDateStr;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePick(dateStr)}
                className={`h-9 w-full rounded-lg text-xs font-medium flex flex-col items-center justify-center relative transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400/50 shadow-md'
                    : isTodayDate
                    ? 'bg-blue-950/60 text-blue-300 border border-blue-500/40 hover:bg-blue-900/50'
                    : !isCurrentMonth
                    ? 'text-slate-600 hover:bg-slate-800/40'
                    : isFuture
                    ? 'text-purple-300/80 hover:bg-purple-950/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span>{dayNum}</span>
                {isTodayDate && (
                  <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-400'} mt-0.5`} />
                )}
                {isFuture && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info & Direct input */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Today
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Future Date
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 text-xs">Jump to:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  handlePick(e.target.value);
                }
              }}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
