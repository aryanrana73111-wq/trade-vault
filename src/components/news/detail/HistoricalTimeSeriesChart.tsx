import React, { useState } from 'react';
import { HistoricalTimePoint, TimeSeriesRange } from '@/types/eventIntelligence';
import { BarChart3, LineChart, TrendingUp, Calendar, Info } from 'lucide-react';

interface HistoricalTimeSeriesChartProps {
  data: HistoricalTimePoint[];
  unit?: string;
  eventName: string;
}

export function HistoricalTimeSeriesChart({
  data,
  unit = '%',
  eventName
}: HistoricalTimeSeriesChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeSeriesRange>('1Y');
  const [viewMode, setViewMode] = useState<'actual' | 'comparison'>('comparison');
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalTimePoint | null>(null);

  // Filter by range
  const getFilteredData = (): HistoricalTimePoint[] => {
    switch (selectedRange) {
      case '1M':
        return data.slice(-2);
      case '3M':
        return data.slice(-4);
      case '6M':
        return data.slice(-6);
      case '1Y':
        return data.slice(-12);
      case '5Y':
        return data.slice(-16);
      case '10Y':
      case 'MAX':
      default:
        return data;
    }
  };

  const points = getFilteredData();

  // Compute SVG scale
  const minVal = Math.min(...points.map(p => Math.min(p.value, p.consensus ?? p.value))) * 0.9;
  const maxVal = Math.max(...points.map(p => Math.max(p.value, p.consensus ?? p.value))) * 1.1;
  const range = (maxVal - minVal) || 1;

  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 25;

  const getX = (idx: number) => {
    if (points.length <= 1) return chartWidth / 2;
    return paddingX + (idx / (points.length - 1)) * (chartWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    return chartHeight - paddingY - ((val - minVal) / range) * (chartHeight - paddingY * 2);
  };

  // Build SVG path
  const actualPath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(p.value).toFixed(1)}`)
    .join(' ');

  const consensusPath = points
    .filter(p => p.consensus !== undefined)
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(p.consensus!).toFixed(1)}`)
    .join(' ');

  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Historical Track & Consensus Accuracy
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Long-term time-series evolution ({unit})
            </span>
          </div>
        </div>

        {/* View Mode & Range Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Actual vs Forecast
            </button>
            <button
              type="button"
              onClick={() => setViewMode('actual')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                viewMode === 'actual'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Actual Only
            </button>
          </div>

          {/* Range buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
            {(['1M', '3M', '6M', '1Y', '5Y', '10Y', 'MAX'] as TimeSeriesRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRange(r)}
                className={`px-2 py-1 rounded-lg transition-colors ${
                  selectedRange === r
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative p-3 rounded-xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-4 left-6 z-10 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-xs font-mono animate-in fade-in">
            <span className="font-sans font-bold text-slate-900 dark:text-white block mb-0.5">
              Period: {hoveredPoint.date}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                Actual: {hoveredPoint.value}{unit}
              </span>
              {hoveredPoint.consensus !== undefined && (
                <span className="text-slate-500 dark:text-slate-400">
                  Consensus: {hoveredPoint.consensus}{unit}
                </span>
              )}
            </div>
          </div>
        )}

        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-56 select-none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingY + ratio * (chartHeight - paddingY * 2);
            const val = (maxVal - ratio * range).toFixed(1);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {val}{unit}
                </text>
              </g>
            );
          })}

          {/* Forecast / Consensus Line (Dashed) */}
          {viewMode === 'comparison' && consensusPath && (
            <path
              d={consensusPath}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Actual Print Line (Solid Blue) */}
          <path
            d={actualPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Points */}
          {points.map((p, idx) => {
            const cx = getX(idx);
            const cy = getY(p.value);
            const isHovered = hoveredPoint?.date === p.date;

            return (
              <g 
                key={p.date + idx} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Date Label on Axis */}
                <text
                  x={cx}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono"
                >
                  {p.date}
                </text>

                {/* Actual Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  className={`transition-all ${
                    isHovered 
                      ? 'fill-blue-600 stroke-4 stroke-white dark:stroke-slate-900' 
                      : 'fill-blue-600'
                  }`}
                />

                {/* Consensus Circle */}
                {viewMode === 'comparison' && p.consensus !== undefined && (
                  <circle
                    cx={cx}
                    cy={getY(p.consensus)}
                    r={3}
                    className="fill-slate-400"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend & Context footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 inline-block rounded" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">Actual Published Value</span>
          </div>
          {viewMode === 'comparison' && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-slate-400 inline-block" />
              <span>Consensus Forecast</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] opacity-75">
          <Info className="w-3.5 h-3.5" />
          <span>Past accuracy does not imply future forecast reliability</span>
        </div>
      </div>
    </div>
  );
}
