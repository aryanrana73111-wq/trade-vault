import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, TrendingUp, AlertCircle } from 'lucide-react';

export const ExpectedValueVisualizer: React.FC = () => {
  const [winRate, setWinRate] = useState(45);
  const [avgWinR, setAvgWinR] = useState(2.2);
  const [avgLossR, setAvgLossR] = useState(1.0);
  const [sampleTrades, setSampleTrades] = useState(100);

  const pWin = winRate / 100;
  const pLoss = 1 - pWin;
  const ev = (pWin * avgWinR) - (pLoss * avgLossR);
  const totalR = ev * sampleTrades;
  const profitFactor = (pLoss * avgLossR) > 0 ? (pWin * avgWinR) / (pLoss * avgLossR) : 99;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 my-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Expected Value & Payoff Simulator
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            E = (P_win * W_avg) - (P_loss * L_avg)
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
          ev > 0 
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800'
        }`}>
          {ev > 0 ? 'Positive Edge (+EV)' : 'Negative Edge (-EV)'}
        </span>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Win Rate: <span className="text-blue-600 font-bold">{winRate}%</span>
          </label>
          <input
            type="range"
            min={20}
            max={85}
            step={1}
            value={winRate}
            onChange={(e) => setWinRate(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>20% (Trend Follower)</span>
            <span>85% (Scalper)</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Average Win: <span className="text-emerald-600 font-bold">+{avgWinR.toFixed(1)}R</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={5.0}
            step={0.1}
            value={avgWinR}
            onChange={(e) => setAvgWinR(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>0.5R</span>
            <span>5.0R</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
            Average Loss: <span className="text-red-600 font-bold">-{avgLossR.toFixed(1)}R</span>
          </label>
          <input
            type="range"
            min={0.5}
            max={2.5}
            step={0.1}
            value={avgLossR}
            onChange={(e) => setAvgLossR(Number(e.target.value))}
            className="w-full accent-red-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>0.5R</span>
            <span>2.5R</span>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Expected Value</span>
          <p className={`text-xl font-black mt-0.5 ${ev >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {ev >= 0 ? '+' : ''}{ev.toFixed(3)} R
          </p>
          <span className="text-[10px] text-slate-500">Per closed trade</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Profit Factor</span>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {profitFactor.toFixed(2)}
          </p>
          <span className="text-[10px] text-slate-500">Gross Win / Gross Loss</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">Win / Loss Ratio</span>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {(avgWinR / avgLossR).toFixed(2)}:1
          </p>
          <span className="text-[10px] text-slate-500">Payoff asymmetry</span>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 font-semibold uppercase">100-Trade Expectancy</span>
          <p className={`text-xl font-black mt-0.5 ${totalR >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalR >= 0 ? '+' : ''}{totalR.toFixed(1)} R
          </p>
          <span className="text-[10px] text-slate-500">Net cumulative yield</span>
        </div>
      </div>

      {/* Visual Payoff Representation */}
      <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">Probability & Payoff Balance</p>
        <div className="h-6 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
          <div 
            className="bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${winRate}%` }}
          >
            {winRate >= 15 ? `${winRate}% Win (${avgWinR}R)` : ''}
          </div>
          <div 
            className="bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white transition-all"
            style={{ width: `${100 - winRate}%` }}
          >
            {100 - winRate >= 15 ? `${100 - winRate}% Loss (${avgLossR}R)` : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
