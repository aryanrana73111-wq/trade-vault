import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, Info, BarChart2, Zap } from 'lucide-react';

interface AssetReactionData {
  symbol: string;
  name: string;
  baseline: number;
  releaseReactionPct: number;
  currentPct: number;
  volatilityPips: number;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  points: { time: string; value: number; label?: string }[];
}

const ASSET_REACTIONS: Record<string, AssetReactionData> = {
  'USD': {
    symbol: 'DXY',
    name: 'US Dollar Index',
    baseline: 104.20,
    releaseReactionPct: +0.48,
    currentPct: +0.35,
    volatilityPips: 42,
    bias: 'BULLISH',
    points: [
      { time: '-30m', value: 104.18 },
      { time: '-15m', value: 104.20 },
      { time: '-5m', value: 104.22 },
      { time: 'Release', value: 104.70, label: 'Release Spike +0.48%' },
      { time: '+5m', value: 104.65 },
      { time: '+15m', value: 104.58 },
      { time: '+30m', value: 104.56 },
      { time: '+1h', value: 104.57 },
      { time: '+2h', value: 104.54 },
    ]
  },
  'GOLD': {
    symbol: 'XAU/USD',
    name: 'Spot Gold',
    baseline: 2490.50,
    releaseReactionPct: -0.85,
    currentPct: -0.62,
    volatilityPips: 210,
    bias: 'BEARISH',
    points: [
      { time: '-30m', value: 2492.00 },
      { time: '-15m', value: 2490.50 },
      { time: '-5m', value: 2489.80 },
      { time: 'Release', value: 2469.30, label: 'Flash Drop -0.85%' },
      { time: '+5m', value: 2474.00 },
      { time: '+15m', value: 2476.50 },
      { time: '+30m', value: 2479.20 },
      { time: '+1h', value: 2475.00 },
      { time: '+2h', value: 2475.10 },
    ]
  },
  'EURUSD': {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    baseline: 1.0850,
    releaseReactionPct: -0.52,
    currentPct: -0.38,
    volatilityPips: 56,
    bias: 'BEARISH',
    points: [
      { time: '-30m', value: 1.0852 },
      { time: '-15m', value: 1.0850 },
      { time: '-5m', value: 1.0848 },
      { time: 'Release', value: 1.0794, label: 'Sharp Liquidity Wick' },
      { time: '+5m', value: 1.0805 },
      { time: '+15m', value: 1.0812 },
      { time: '+30m', value: 1.0810 },
      { time: '+1h', value: 1.0808 },
      { time: '+2h', value: 1.0809 },
    ]
  },
  'SPX': {
    symbol: 'S&P 500',
    name: 'US Benchmark Index',
    baseline: 5580.0,
    releaseReactionPct: -0.72,
    currentPct: -0.45,
    volatilityPips: 38,
    bias: 'BEARISH',
    points: [
      { time: '-30m', value: 5582.0 },
      { time: '-15m', value: 5580.0 },
      { time: '-5m', value: 5578.5 },
      { time: 'Release', value: 5539.8, label: 'Rate-Sens. Selloff' },
      { time: '+5m', value: 5548.0 },
      { time: '+15m', value: 5554.2 },
      { time: '+30m', value: 5558.0 },
      { time: '+1h', value: 5555.0 },
      { time: '+2h', value: 5554.8 },
    ]
  },
  'BTC': {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    baseline: 64200,
    releaseReactionPct: +1.24,
    currentPct: +1.85,
    volatilityPips: 850,
    bias: 'BULLISH',
    points: [
      { time: '-30m', value: 64150 },
      { time: '-15m', value: 64200 },
      { time: '-5m', value: 64310 },
      { time: 'Release', value: 65000, label: 'ETF Inflow Rally' },
      { time: '+5m', value: 65150 },
      { time: '+15m', value: 65280 },
      { time: '+30m', value: 65350 },
      { time: '+1h', value: 65400 },
      { time: '+2h', value: 65389 },
    ]
  }
};

interface Props {
  initialAsset?: string;
  compact?: boolean;
}

export function MarketReactionChart({ initialAsset = 'GOLD', compact = false }: Props) {
  const [activeKey, setActiveKey] = useState<string>(() => {
    if (ASSET_REACTIONS[initialAsset]) return initialAsset;
    return 'GOLD';
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const asset = ASSET_REACTIONS[activeKey] || ASSET_REACTIONS['GOLD'];

  // Calculate SVG curve geometry
  const chartGeometry = useMemo(() => {
    const values = asset.points.map(p => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;
    const padding = range * 0.15;
    const yMin = min - padding;
    const yMax = max + padding;
    const ySpan = yMax - yMin;

    const width = 600;
    const height = compact ? 180 : 230;
    const padX = 40;
    const padY = 25;
    const plotW = width - padX * 2;
    const plotH = height - padY * 2;

    const coords = asset.points.map((pt, i) => {
      const x = padX + (i / (asset.points.length - 1)) * plotW;
      const y = padY + plotH - ((pt.value - yMin) / ySpan) * plotH;
      return { ...pt, x, y, index: i };
    });

    const pathD = coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth cubic bezier
      const prev = coords[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, '');

    // Area fill
    const areaD = `${pathD} L ${coords[coords.length - 1].x} ${padY + plotH} L ${coords[0].x} ${padY + plotH} Z`;

    const baselineY = padY + plotH - ((asset.baseline - yMin) / ySpan) * plotH;

    return {
      width,
      height,
      coords,
      pathD,
      areaD,
      baselineY,
      yMin,
      yMax
    };
  }, [asset, compact]);

  const isPositive = asset.currentPct >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
      {/* Header & Asset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Market Catalyst Reaction Curve
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Empirical asset price path around scheduled Tier-1 release announcements
          </p>
        </div>

        {/* Asset Switcher Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto no-scrollbar self-start sm:self-auto max-w-full">
          {Object.keys(ASSET_REACTIONS).map(k => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setActiveKey(k);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[32px] ${
                activeKey === k
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs border border-slate-200 dark:border-slate-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {ASSET_REACTIONS[k].symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Snapshot metrics bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Selected Asset</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{asset.name} ({asset.symbol})</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Release Shock</span>
          <span className={`font-bold flex items-center ${asset.releaseReactionPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {asset.releaseReactionPct >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {asset.releaseReactionPct > 0 ? `+${asset.releaseReactionPct}%` : `${asset.releaseReactionPct}%`}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Immediate Volatility</span>
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Zap className="w-3 h-3 mr-1 text-amber-500" />
            {asset.volatilityPips} pips / pts
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Session Bias</span>
          <span className={`font-bold uppercase ${
            asset.bias === 'BULLISH' ? 'text-emerald-600 dark:text-emerald-400' :
            asset.bias === 'BEARISH' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'
          }`}>
            {asset.bias}
          </span>
        </div>
      </div>

      {/* Responsive SVG Canvas Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg 
          viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`} 
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${activeKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.25" />
              <stop offset="100%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line 
            x1="30" 
            y1={chartGeometry.baselineY} 
            x2={chartGeometry.width - 30} 
            y2={chartGeometry.baselineY} 
            stroke="currentColor" 
            strokeDasharray="4 4"
            className="text-slate-300 dark:text-slate-700" 
            strokeWidth="1"
          />
          <text 
            x="32" 
            y={chartGeometry.baselineY - 4} 
            className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono"
          >
            Pre-Release Baseline ({asset.baseline})
          </text>

          {/* Fill area under curve */}
          <path d={chartGeometry.areaD} fill={`url(#grad-${activeKey})`} />

          {/* Main Reaction Curve */}
          <path 
            d={chartGeometry.pathD} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Release Shock Event Line */}
          {(() => {
            const releasePt = chartGeometry.coords.find(c => c.time === 'Release');
            if (!releasePt) return null;
            return (
              <g>
                <line 
                  x1={releasePt.x} 
                  y1="15" 
                  x2={releasePt.x} 
                  y2={chartGeometry.height - 25} 
                  stroke="currentColor" 
                  strokeDasharray="3 3"
                  className="text-amber-500/70 dark:text-amber-400/70"
                  strokeWidth="1.5"
                />
                <circle 
                  cx={releasePt.x} 
                  cy={releasePt.y} 
                  r="5" 
                  fill={strokeColor} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />
              </g>
            );
          })()}

          {/* Points & Interactive Hover Targets */}
          {chartGeometry.coords.map((pt, idx) => (
            <g key={idx} className="cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === idx ? 6 : 3.5}
                fill={hoverIndex === idx ? strokeColor : '#ffffff'}
                stroke={strokeColor}
                strokeWidth="2"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {/* X-axis tick labels */}
              <text
                x={pt.x}
                y={chartGeometry.height - 8}
                textAnchor="middle"
                className={`text-[10px] select-none font-medium ${
                  pt.time === 'Release' 
                    ? 'fill-amber-600 dark:fill-amber-400 font-bold' 
                    : 'fill-slate-400 dark:fill-slate-500'
                }`}
              >
                {pt.time}
              </text>
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip */}
        {hoverIndex !== null && chartGeometry.coords[hoverIndex] && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 dark:bg-black/90 text-white border border-slate-700 px-3 py-1.5 rounded-lg text-xs shadow-xl backdrop-blur-xs pointer-events-none flex items-center gap-2 z-20"
          >
            <span className="text-slate-300 font-mono">{chartGeometry.coords[hoverIndex].time}:</span>
            <span className="font-bold text-white">{chartGeometry.coords[hoverIndex].value}</span>
            {chartGeometry.coords[hoverIndex].label && (
              <span className="text-[10px] text-amber-400 border-l border-slate-700 pl-2">
                {chartGeometry.coords[hoverIndex].label}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/70 pt-2.5">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          Interactive timeline: Click or hover nodes to observe price discovery
        </span>
        <span className="font-mono text-[10px]">Real-time adaptive render</span>
      </div>
    </div>
  );
}
