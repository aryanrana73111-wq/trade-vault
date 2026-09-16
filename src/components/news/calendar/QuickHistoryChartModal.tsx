import React, { useState } from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Calendar, 
  Clock, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { CURRENCY_FLAGS } from '../EconomicCalendarView';

interface QuickHistoryChartModalProps {
  event: NewsEvent;
  onClose: () => void;
}

export function QuickHistoryChartModal({ event, onClose }: QuickHistoryChartModalProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Fallback mock history points if not present in event.historical
  const historyPoints = event.historical?.recentReleases && event.historical.recentReleases.length > 0 
    ? event.historical.recentReleases.map(r => ({
        date: r.date,
        actual: parseFloat(String(r.actual)) || 0,
        forecast: parseFloat(String(r.forecast)) || 0,
        surprise: parseFloat(String(r.surprise)) || (parseFloat(String(r.actual)) - parseFloat(String(r.forecast))),
        actualFormatted: String(r.actual),
        forecastFormatted: String(r.forecast)
      }))
    : [
        { date: 'Jun 2026', actual: 3.0, forecast: 3.1, surprise: -0.1, actualFormatted: '3.0%', forecastFormatted: '3.1%' },
        { date: 'Jul 2026', actual: 2.9, forecast: 2.9, surprise: 0.0, actualFormatted: '2.9%', forecastFormatted: '2.9%' },
        { date: 'Aug 2026', actual: 2.7, forecast: 2.8, surprise: -0.1, actualFormatted: '2.7%', forecastFormatted: '2.8%' },
        { date: 'Sep 2026', actual: typeof event.actual === 'number' ? event.actual : (parseFloat(String(event.actual)) || 2.5), forecast: typeof event.forecast === 'number' ? event.forecast : (parseFloat(String(event.forecast)) || 2.6), surprise: -0.1, actualFormatted: `${event.actual ?? 2.5}%`, forecastFormatted: `${event.forecast ?? 2.6}%` }
      ];

  const minVal = Math.min(...historyPoints.map(p => Math.min(p.actual, p.forecast))) * 0.9;
  const maxVal = Math.max(...historyPoints.map(p => Math.max(p.actual, p.forecast))) * 1.1;
  const range = (maxVal - minVal) || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label={event.currency}>
              {CURRENCY_FLAGS[event.currency] || '🌐'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {event.currency}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {event.category}
                </span>
                {event.source && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    • {event.source}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {event.name}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggle Bar */}
        <div className="px-5 pt-3 pb-2 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Actual Print
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 border border-dashed border-slate-600 inline-block" /> Consensus / Forecast
            </span>
          </div>
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Chart Track
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Data Table
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-6">
          {viewMode === 'chart' ? (
            <div className="space-y-4">
              {/* SVG Trend Graph */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-750">
                <div className="h-48 w-full flex items-end justify-between gap-4 pt-6 pb-2 px-3">
                  {historyPoints.map((pt, idx) => {
                    const actualH = Math.max(10, ((pt.actual - minVal) / range) * 120);
                    const forecastH = Math.max(10, ((pt.forecast - minVal) / range) * 120);
                    const isAbove = pt.actual > pt.forecast;
                    const isBelow = pt.actual < pt.forecast;

                    return (
                      <div key={pt.date + idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        {/* Values hover indicator */}
                        <div className="text-[10px] font-mono text-center opacity-80 group-hover:opacity-100 transition-opacity">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">{pt.actualFormatted}</span>
                          <span className="text-slate-400 text-[9px] block">exp {pt.forecastFormatted}</span>
                        </div>

                        {/* Bars Comparison */}
                        <div className="flex items-end gap-1.5 w-full justify-center">
                          {/* Forecast Bar */}
                          <div 
                            style={{ height: `${forecastH}px` }} 
                            className="w-3 sm:w-4 rounded-t bg-slate-300 dark:bg-slate-700 border-t border-dashed border-slate-500" 
                            title={`Forecast: ${pt.forecastFormatted}`}
                          />
                          {/* Actual Bar */}
                          <div 
                            style={{ height: `${actualH}px` }} 
                            className={`w-3 sm:w-4 rounded-t shadow-xs transition-transform group-hover:scale-y-105 ${
                              isAbove ? 'bg-emerald-500' : isBelow ? 'bg-rose-500' : 'bg-blue-600'
                            }`}
                            title={`Actual: ${pt.actualFormatted}`}
                          />
                        </div>

                        {/* Label Date */}
                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
                          {pt.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statistical Summary Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Average Surprise</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    ±0.12%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Sample Size</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {event.historical?.sampleSize ? `${event.historical.sampleSize} releases` : '12 releases'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Avg Pip Volatility (15m)</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {event.historical?.windows?.['15m']?.avgAbsMove ? `±${event.historical.windows['15m'].avgAbsMove} pips` : '±42 pips'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Frequency</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {event.frequency || 'Monthly'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Release Period</th>
                    <th className="px-3 py-2.5">Actual</th>
                    <th className="px-3 py-2.5">Forecast</th>
                    <th className="px-3 py-2.5">Surprise</th>
                    <th className="px-3 py-2.5">Deviation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                  {historyPoints.map((pt, idx) => {
                    const isAbove = pt.actual > pt.forecast;
                    const isBelow = pt.actual < pt.forecast;
                    return (
                      <tr key={pt.date + idx} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                        <td className="px-3 py-2 font-sans font-medium text-slate-800 dark:text-slate-200">
                          {pt.date}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                          {pt.actualFormatted}
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                          {pt.forecastFormatted}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            isAbove ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            isBelow ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' :
                            'text-slate-500'
                          }`}>
                            {isAbove ? '+' : ''}{(pt.surprise).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2 font-sans text-slate-500">
                          {isAbove ? 'Beat expectations' : isBelow ? 'Missed consensus' : 'In line'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Explanatory Context */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Trader Interpretation Context</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.simpleExplanation || 'Macroeconomic print directly impacts interest rate expectations and sovereign currency carry differentials.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
