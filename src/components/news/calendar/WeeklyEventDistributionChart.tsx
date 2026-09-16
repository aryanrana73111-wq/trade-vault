import React from 'react';
import { NewsEvent } from '@/types/newsIntelligence';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';
import { CURRENCY_FLAGS } from '../EconomicCalendarView';

interface WeeklyEventDistributionChartProps {
  events: NewsEvent[];
  onSelectCurrency?: (currency: string) => void;
  onSelectImpact?: (impact: string) => void;
}

export function WeeklyEventDistributionChart({
  events,
  onSelectCurrency,
  onSelectImpact
}: WeeklyEventDistributionChartProps) {
  // Compute counts
  const impactCounts = {
    HIGH: events.filter(e => e.impact === 'HIGH').length,
    MEDIUM: events.filter(e => e.impact === 'MEDIUM').length,
    LOW: events.filter(e => e.impact === 'LOW').length,
    'NON-ECONOMIC': events.filter(e => e.impact === 'NON-ECONOMIC').length
  };

  const currencyMap: Record<string, number> = {};
  events.forEach(e => {
    currencyMap[e.currency] = (currencyMap[e.currency] || 0) + 1;
  });

  const sortedCurrencies = Object.entries(currencyMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxCurrencyCount = Math.max(1, ...sortedCurrencies.map(c => c[1]));

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Macroeconomic Distribution Breakdown ({events.length} Scheduled Releases)
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Interactive Filter
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Impact Distribution */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            Catalysts by Impact Severity
          </span>
          <div className="space-y-2 text-xs">
            {/* High Impact */}
            <div 
              onClick={() => onSelectImpact && onSelectImpact('HIGH')}
              className="flex items-center justify-between cursor-pointer group hover:opacity-90"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-rose-500 font-medium">
                  High Impact (Market-Moving)
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {impactCounts.HIGH}
              </span>
            </div>

            {/* Medium Impact */}
            <div 
              onClick={() => onSelectImpact && onSelectImpact('MEDIUM')}
              className="flex items-center justify-between cursor-pointer group hover:opacity-90"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-amber-500 font-medium">
                  Medium Impact (Secondary)
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {impactCounts.MEDIUM}
              </span>
            </div>

            {/* Low Impact */}
            <div 
              onClick={() => onSelectImpact && onSelectImpact('LOW')}
              className="flex items-center justify-between cursor-pointer group hover:opacity-90"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-yellow-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-yellow-500 font-medium">
                  Low Impact (Routine)
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {impactCounts.LOW}
              </span>
            </div>

            {/* Non-Economic */}
            <div 
              onClick={() => onSelectImpact && onSelectImpact('NON-ECONOMIC')}
              className="flex items-center justify-between cursor-pointer group hover:opacity-90"
            >
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-slate-400 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-500 font-medium">
                  Non-Economic / Holidays
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {impactCounts['NON-ECONOMIC']}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Top Currencies Bar Chart */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            Most Active Currencies This Period
          </span>
          <div className="space-y-1.5 text-xs">
            {sortedCurrencies.map(([curr, count]) => {
              const widthPct = Math.round((count / maxCurrencyCount) * 100);
              return (
                <div 
                  key={curr}
                  onClick={() => onSelectCurrency && onSelectCurrency(curr)}
                  className="flex items-center gap-2.5 cursor-pointer group py-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded px-1 transition-colors"
                >
                  <span className="w-10 flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                    <span>{CURRENCY_FLAGS[curr] || '🌐'}</span>
                    <span>{curr}</span>
                  </span>
                  
                  {/* Visual Bar */}
                  <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-750 rounded-full overflow-hidden flex">
                    <div 
                      style={{ width: `${widthPct}%` }}
                      className="h-full bg-blue-600 rounded-full transition-all group-hover:bg-blue-500"
                    />
                  </div>

                  <span className="w-6 text-right font-mono font-bold text-slate-600 dark:text-slate-400">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
