import React, { useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalMarketStructureDiagram: React.FC = () => {
  const [structureMode, setStructureMode] = useState<'bullish' | 'bearish' | 'transition'>('bullish');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);

  // Structural nodes data
  const bullishNodes = [
    { label: 'HL0', price: 100, x: 50, y: 190, type: 'hl' },
    { label: 'HH1', price: 120, x: 130, y: 80, type: 'hh' },
    { label: 'HL1', price: 110, x: 210, y: 140, type: 'hl' },
    { label: 'HH2', price: 135, x: 300, y: 40, type: 'hh' },
    { label: 'HL2', price: 124, x: 390, y: 100, type: 'hl' },
    { label: 'HH3', price: 148, x: 480, y: 15, type: 'hh' },
  ];

  const bearishNodes = [
    { label: 'LH0', price: 150, x: 50, y: 20, type: 'lh' },
    { label: 'LL1', price: 130, x: 130, y: 130, type: 'll' },
    { label: 'LH1', price: 140, x: 210, y: 70, type: 'lh' },
    { label: 'LL2', price: 118, x: 300, y: 175, type: 'll' },
    { label: 'LH2', price: 128, x: 390, y: 115, type: 'lh' },
    { label: 'LL3', price: 105, x: 480, y: 205, type: 'll' },
  ];

  const transitionNodes = [
    { label: 'HL', price: 110, x: 40, y: 150, type: 'hl' },
    { label: 'HH', price: 135, x: 120, y: 50, type: 'hh' },
    { label: 'HL', price: 122, x: 200, y: 105, type: 'hl' },
    { label: 'LH', price: 130, x: 280, y: 75, type: 'lh' }, // Lower High failure!
    { label: 'BOS', price: 115, x: 360, y: 145, type: 'bos' }, // Break of structure
    { label: 'LL', price: 102, x: 460, y: 200, type: 'll' }, // New Lower Low CHOCH
  ];

  const activeNodes = structureMode === 'bullish' ? bullishNodes : structureMode === 'bearish' ? bearishNodes : transitionNodes;

  // Build SVG path string connecting the nodes
  const pathD = activeNodes.reduce((acc, node, idx) => {
    return idx === 0 ? `M ${node.x} ${node.y}` : `${acc} L ${node.x} ${node.y}`;
  }, '');

  return (
    <EducationalChartCard
      title="Fractal Market Structure & Swing Point Geometry"
      subtitle="Classifying structural swing points (HH/HL vs LH/LL) and regime shifts"
      badge="Educational Example"
      category="TECHNICAL ANALYSIS"
      units="Price Trajectory & Swing Points"
      whatAmILookingAt="A geometric price swing diagram demonstrating clean market structure. In an uptrend, price creates successive Higher Highs (HH) and Higher Lows (HL). In a downtrend, price prints Lower Highs (LH) and Lower Lows (LL). The Transition tab reveals how a failure to make a higher high followed by breaking the prior swing low triggers a Change of Character (CHOCH)."
      whyItMatters="Trend is not a moving average; trend is pure structural progression. Attempting to buy while price is actively forming LH and LL is fighting institutional liquidity flow."
      commonMistake="Mistaking minor intraday noise for structural breaks, or calling a reversal before the key protected swing low has actually closed below."
      metrics={[
        { label: 'Current Regime', value: structureMode === 'bullish' ? 'Uptrend (Expansion)' : structureMode === 'bearish' ? 'Downtrend (Distribution)' : 'Reversal / CHOCH', color: structureMode === 'bullish' ? 'text-emerald-600' : 'text-rose-600', subtext: 'Structural Bias' },
        { label: 'Key Signpost', value: structureMode === 'bullish' ? 'HH & HL Chain' : structureMode === 'bearish' ? 'LH & LL Chain' : 'Break of Structure (BOS)', color: 'text-blue-600 dark:text-blue-400', subtext: 'Order Flow Signature' },
        { label: 'Invalidation Level', value: structureMode === 'bullish' ? 'Prior Protected HL' : 'Prior Protected LH', subtext: 'Structural Stop Loss' },
        { label: 'Trade Direction', value: structureMode === 'bullish' ? 'Long Pullbacks' : structureMode === 'bearish' ? 'Short Rallies' : 'Wait for Retest', subtext: 'Execution Mandate' }
      ]}
      controls={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Structure:</span>
            {(['bullish', 'bearish', 'transition'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setStructureMode(mode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  structureMode === mode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {mode === 'bullish' ? 'Uptrend (HH / HL)' : mode === 'bearish' ? 'Downtrend (LH / LL)' : 'CHOCH Reversal'}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnnotations}
              onChange={e => setShowAnnotations(e.target.checked)}
              className="rounded accent-blue-600"
            />
            <span>Show Node Labels</span>
          </label>
        </div>
      }
    >
      <div className="w-full flex items-center justify-center p-2">
        <div className="w-full max-w-xl aspect-[2.4/1] relative bg-slate-900/90 rounded-2xl border border-slate-800 p-4 overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30" />

          <svg viewBox="0 0 520 220" className="w-full h-full relative z-10">
            {/* Structural Price Line */}
            <path
              d={pathD}
              fill="none"
              stroke={structureMode === 'bullish' ? '#10b981' : structureMode === 'bearish' ? '#ef4444' : '#f59e0b'}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300"
            />

            {/* Swing Point Nodes */}
            {activeNodes.map((node, idx) => {
              const isHigh = node.type === 'hh' || node.type === 'lh';
              const isLow = node.type === 'hl' || node.type === 'll';
              const isBOS = node.type === 'bos';

              return (
                <g key={idx} className="transition-all duration-300">
                  {/* Outer Pulsing Ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    fill={isHigh ? '#10b981' : isLow ? '#3b82f6' : '#ef4444'}
                    fillOpacity="0.25"
                  />
                  {/* Core Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="4.5"
                    fill={isHigh ? '#34d399' : isLow ? '#60a5fa' : '#f87171'}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />

                  {/* Text Badge */}
                  {showAnnotations && (
                    <g transform={`translate(${node.x}, ${isHigh ? node.y - 14 : node.y + 18})`}>
                      <rect
                        x="-18"
                        y="-9"
                        width="36"
                        height="16"
                        rx="4"
                        fill="#0f172a"
                        stroke="#334155"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isHigh ? '#34d399' : isLow ? '#60a5fa' : '#f87171'}
                        fontSize="9"
                        fontWeight="900"
                        fontFamily="monospace"
                      >
                        {node.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </EducationalChartCard>
  );
};
