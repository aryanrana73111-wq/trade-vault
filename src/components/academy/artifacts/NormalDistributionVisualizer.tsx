import React, { useState } from 'react';
import { Activity, AlertTriangle, BarChart2 } from 'lucide-react';

export const NormalDistributionVisualizer: React.FC = () => {
  const [showFatTails, setShowFatTails] = useState(false);
  const [zScore, setZScore] = useState(2.0);

  // Normal probability density function
  const normalPdf = (x: number) => {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
  };

  // Student-t / Leptokurtic (fat tail) approximation
  const fatTailPdf = (x: number) => {
    // Higher peak at 0, fatter tails at |x| > 2
    const df = 3;
    const factor = Math.pow(1 + (x * x) / df, -(df + 1) / 2);
    return factor * 0.38;
  };

  // Generate SVG path for bell curve
  const generatePath = (isFat: boolean) => {
    const points: string[] = [];
    const width = 440;
    const height = 150;
    const xMin = -4;
    const xMax = 4;

    for (let i = 0; i <= 100; i++) {
      const xVal = xMin + (i / 100) * (xMax - xMin);
      const yVal = isFat ? fatTailPdf(xVal) : normalPdf(xVal);
      // Map to SVG coordinates
      const svgX = (i / 100) * width + 20;
      const svgY = height - (yVal / 0.45) * 120;
      points.push(`${svgX.toFixed(1)},${svgY.toFixed(1)}`);
    }
    return `M 20,${height} L ` + points.join(' L ') + ` L ${width + 20},${height} Z`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 my-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Gaussian Bell Curve vs Fat-Tailed Financial Markets
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Why traditional statistical finance models underestimate market crashes
          </p>
        </div>

        <button
          onClick={() => setShowFatTails(!showFatTails)}
          className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${
            showFatTails
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
        >
          {showFatTails ? 'Fat Tails Active (Leptokurtic)' : 'Show Fat Tails Overlay'}
        </button>
      </div>

      {/* SVG Visualization */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <svg viewBox="0 0 480 170" className="w-full h-44 min-w-[400px]">
          {/* Baseline */}
          <line x1="20" y1="150" x2="460" y2="150" stroke="#94a3b8" strokeWidth="1.5" />
          
          {/* Standard Deviation lines */}
          <line x1="240" y1="15" x2="240" y2="150" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="240" y="165" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">Mean (μ)</text>

          <line x1="185" y1="50" x2="185" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="295" y1="50" x2="295" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <text x="185" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">-1σ</text>
          <text x="295" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">+1σ (68.2%)</text>

          <line x1="130" y1="95" x2="130" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="350" y1="95" x2="350" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <text x="130" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">-2σ</text>
          <text x="350" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">+2σ (95.4%)</text>

          <line x1="75" y1="125" x2="75" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="405" y1="125" x2="405" y2="150" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
          <text x="75" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">-3σ</text>
          <text x="405" y="165" textAnchor="middle" fontSize="9" fill="#94a3b8">+3σ (99.7%)</text>

          {/* Normal Curve */}
          <path d={generatePath(false)} fill="#3b82f6" fillOpacity="0.15" stroke="#2563eb" strokeWidth="2" />

          {/* Fat Tails Curve if enabled */}
          {showFatTails && (
            <path d={generatePath(true)} fill="#f59e0b" fillOpacity="0.15" stroke="#d97706" strokeWidth="2.5" />
          )}
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Normal Bell Curve (Gaussian)</span>
          <p className="text-slate-600 dark:text-slate-400">
            Assumes 3σ events occur only once every 370 trading days, and 5σ events occur once in 14,000 years.
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">Financial Reality (Fat Tails)</span>
          <p className="text-slate-600 dark:text-slate-400">
            Excess kurtosis means extreme outlier market crashes (like 1987 or 2020) occur orders of magnitude more frequently than standard models anticipate.
          </p>
        </div>
      </div>
    </div>
  );
};
