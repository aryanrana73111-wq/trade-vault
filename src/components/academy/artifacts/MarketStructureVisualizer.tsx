import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';

export const MarketStructureVisualizer: React.FC = () => {
  const [mode, setMode] = useState<'uptrend' | 'downtrend' | 'choch'>('uptrend');

  const getPoints = () => {
    if (mode === 'uptrend') {
      return [
        { label: 'Low', x: 40, y: 160, type: 'low' },
        { label: 'HH 1', x: 120, y: 60, type: 'high' },
        { label: 'HL 1', x: 180, y: 120, type: 'low' },
        { label: 'HH 2', x: 260, y: 30, type: 'high' },
        { label: 'HL 2', x: 320, y: 90, type: 'low' },
        { label: 'HH 3', x: 400, y: 15, type: 'high' }
      ];
    }
    if (mode === 'downtrend') {
      return [
        { label: 'High', x: 40, y: 20, type: 'high' },
        { label: 'LL 1', x: 120, y: 120, type: 'low' },
        { label: 'LH 1', x: 180, y: 65, type: 'high' },
        { label: 'LL 2', x: 260, y: 150, type: 'low' },
        { label: 'LH 2', x: 320, y: 95, type: 'high' },
        { label: 'LL 3', x: 400, y: 175, type: 'low' }
      ];
    }
    // Change of Character (Uptrend transitioning to Downtrend via broken HL)
    return [
      { label: 'Low', x: 30, y: 160, type: 'low' },
      { label: 'HH 1', x: 100, y: 60, type: 'high' },
      { label: 'HL 1', x: 160, y: 110, type: 'low' },
      { label: 'HH 2', x: 230, y: 30, type: 'high' },
      { label: 'CHoCH (Broken HL)', x: 310, y: 140, type: 'break' },
      { label: 'LH 1', x: 370, y: 95, type: 'high' },
      { label: 'LL 1', x: 440, y: 170, type: 'low' }
    ];
  };

  const points = getPoints();

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Market Structure & Swing Point Geometry
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mapping swing extrema, continuation (BOS), and structural reversals (CHoCH)
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setMode('uptrend')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              mode === 'uptrend' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Uptrend (HH/HL)
          </button>
          <button
            onClick={() => setMode('downtrend')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              mode === 'downtrend' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Downtrend (LH/LL)
          </button>
          <button
            onClick={() => setMode('choch')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              mode === 'choch' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Structure Shift (CHoCH)
          </button>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div className="w-full bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <svg viewBox="0 0 480 200" className="w-full h-48 min-w-[400px]">
          {/* Subtle Grid Lines */}
          <line x1="0" y1="50" x2="480" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-900" strokeWidth="1" />
          <line x1="0" y1="100" x2="480" y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-900" strokeWidth="1" />
          <line x1="0" y1="150" x2="480" y2="150" stroke="currentColor" className="text-slate-100 dark:text-slate-900" strokeWidth="1" />

          {/* Invalidation Line if in CHoCH mode */}
          {mode === 'choch' && (
            <>
              <line x1="160" y1="110" x2="350" y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="355" y="113" fill="#f59e0b" fontSize="10" fontWeight="bold">Key Support / Invalidation (110)</text>
            </>
          )}

          {/* Polyline connecting swing points */}
          <polyline
            fill="none"
            stroke={mode === 'uptrend' ? '#10b981' : mode === 'downtrend' ? '#f43f5e' : '#3b82f6'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
          />

          {/* Points & Labels */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.type === 'break' ? 6 : 4}
                fill={p.type === 'break' ? '#f59e0b' : p.type === 'high' ? '#2563eb' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={p.type === 'high' ? p.y - 10 : p.y + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                className="fill-slate-700 dark:fill-slate-200"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Explanatory Legend */}
      <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          {mode === 'uptrend' && (
            <span><strong>Uptrend Axiom:</strong> Price consistently forms Higher Highs (HH) and Higher Lows (HL). As long as subsequent pullbacks respect the prior swing low, institutional order-flow remains net bullish.</span>
          )}
          {mode === 'downtrend' && (
            <span><strong>Downtrend Axiom:</strong> Price forms Lower Highs (LH) and Lower Lows (LL). Sellers aggressively defend lower price tiers, and rally attempts fail to breach previous swing highs.</span>
          )}
          {mode === 'choch' && (
            <span><strong>Change of Character (CHoCH):</strong> The orange dashed line marks the previous Higher Low. When price breaches and closes below this support, the uptrend is formally broken and invalidation triggers.</span>
          )}
        </div>
      </div>
    </div>
  );
};
