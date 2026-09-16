import React, { useState, useMemo } from 'react';
import { 
  Binary, 
  Sparkles, 
  TrendingUp, 
  Shuffle, 
  HelpCircle, 
  AlertOctagon, 
  CheckCircle2, 
  RefreshCw,
  BarChart2,
  LineChart,
  Layers,
  ArrowRight,
  Activity,
  Cpu
} from 'lucide-react';

export const QuantLab: React.FC = () => {
  // Active Sub-Tab in Quant Lab
  const [activeTab, setActiveTab] = useState<'ev' | 'distribution' | 'correlation' | 'montecarlo' | 'overfitting'>('ev');

  // --- Sub-Module 1: Expected Value Parameters ---
  const [winRate, setWinRate] = useState<number>(55);
  const [avgWinAmount, setAvgWinAmount] = useState<number>(300);
  const [avgLossAmount, setAvgLossAmount] = useState<number>(150);
  const [frictionPerTrade, setFrictionPerTrade] = useState<number>(5);

  const evResult = useMemo(() => {
    const pWin = winRate / 100;
    const pLoss = (100 - winRate) / 100;
    const grossEV = (pWin * avgWinAmount) - (pLoss * avgLossAmount);
    const netEV = grossEV - frictionPerTrade;
    const breakevenWinRate = (avgLossAmount + frictionPerTrade) / (avgWinAmount + avgLossAmount) * 100;
    return { grossEV, netEV, breakevenWinRate };
  }, [winRate, avgWinAmount, avgLossAmount, frictionPerTrade]);

  // --- Sub-Module 2: Randomness & Streak Demonstration ---
  const [randomSeed, setRandomSeed] = useState<number>(1);
  const coinFlips = useMemo(() => {
    const flips: boolean[] = [];
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let lastOutcome: boolean | null = null;
    let runningWins = 0;

    for (let i = 0; i < 50; i++) {
      // Deterministic pseudo-randomness based on seed for consistency
      const rand = Math.sin(randomSeed * 9999 + i * 37) * 10000;
      const outcome = (rand - Math.floor(rand)) > (1 - winRate / 100);
      flips.push(outcome);

      if (outcome) runningWins++;

      if (lastOutcome === outcome) {
        currentStreak++;
      } else {
        currentStreak = 1;
        lastOutcome = outcome;
      }

      if (outcome && currentStreak > maxWinStreak) maxWinStreak = currentStreak;
      if (!outcome && currentStreak > maxLossStreak) maxLossStreak = currentStreak;
    }

    return { flips, maxWinStreak, maxLossStreak, winCount: runningWins };
  }, [winRate, randomSeed]);

  // --- Sub-Module 3: Distribution & Kurtosis ---
  const [distributionType, setDistributionType] = useState<'normal' | 'fat_tailed'>('fat_tailed');
  const [volatilitySigma, setVolatilitySigma] = useState<number>(1.5);

  // --- Sub-Module 4: Correlation & Regression ---
  const [targetCorrelation, setTargetCorrelation] = useState<number>(0.65);
  const scatterPoints = useMemo(() => {
    // Generate synthetic (X, Y) with specified correlation
    const pts: { x: number; y: number }[] = [];
    const r = targetCorrelation;
    for (let i = 0; i < 35; i++) {
      const u1 = (Math.sin(i * 12.3) + 1) / 2;
      const u2 = (Math.cos(i * 17.7) + 1) / 2;
      const z1 = (u1 - 0.5) * 4;
      const z2 = (u2 - 0.5) * 4;
      
      const x = z1;
      const y = r * z1 + Math.sqrt(Math.max(0, 1 - r * r)) * z2;
      pts.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
    }
    return pts;
  }, [targetCorrelation]);

  // --- Sub-Module 5: Monte Carlo Simulator ---
  const [mcRunsCount, setMcRunsCount] = useState<number>(8);
  const [mcTradeCount, setMcTradeCount] = useState<number>(40);
  const [mcSeed, setMcSeed] = useState<number>(100);

  const monteCarloTrajectories = useMemo(() => {
    const paths: number[][] = [];
    const pWin = winRate / 100;

    for (let run = 0; run < mcRunsCount; run++) {
      let equity = 10000;
      const path: number[] = [equity];

      for (let t = 0; t < mcTradeCount; t++) {
        const randVal = Math.abs(Math.sin(mcSeed * 100 + run * 50 + t * 7));
        const isWin = (randVal - Math.floor(randVal)) < pWin;
        if (isWin) {
          equity += avgWinAmount - frictionPerTrade;
        } else {
          equity -= avgLossAmount + frictionPerTrade;
        }
        path.push(Math.max(0, Math.round(equity)));
      }
      paths.push(path);
    }
    return paths;
  }, [mcRunsCount, mcTradeCount, mcSeed, winRate, avgWinAmount, avgLossAmount, frictionPerTrade]);

  // --- Sub-Module 6: Overfitting Model ---
  const [polynomialDegree, setPolynomialDegree] = useState<number>(3);

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-3">
        <Binary className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong className="font-bold uppercase tracking-wider">Synthetic Quantitative Simulation:</strong> All outputs, probability sweeps, and Monte Carlo curves in this lab are pure synthetic mathematical demonstrations. Real financial market returns exhibit non-stationarity, fat tails, regime shifts, and structural breaks that cannot be reduced to naive static parameters.
        </div>
      </div>

      {/* Lab Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { id: 'ev', label: 'Expected Value & Randomness' },
          { id: 'distribution', label: 'Distributions & Standard Deviation' },
          { id: 'correlation', label: 'Correlation & Regression' },
          { id: 'montecarlo', label: 'Monte Carlo Simulation' },
          { id: 'overfitting', label: 'Sample Size & Overfitting' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Expected Value & Randomness */}
      {activeTab === 'ev' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Expected Value (EV) Mathematical Engine
                </h3>
                <p className="text-xs text-slate-500">
                  The foundational equation of trading edge: EV = (P(Win) × Win) - (P(Loss) × Loss) - Friction.
                </p>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-xl border ${
                evResult.netEV > 0 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200 dark:border-rose-800'
              }`}>
                {evResult.netEV > 0 ? '+ Positive Edge' : '- Negative Expectancy'}
              </span>
            </div>

            {/* EV Parameter Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase">Win Rate (%)</label>
                  <span className="text-xs font-black text-indigo-600 font-mono">{winRate}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="1"
                  value={winRate}
                  onChange={e => setWinRate(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-emerald-600 uppercase block">Average Win ($)</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="25"
                  value={avgWinAmount}
                  onChange={e => setAvgWinAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-rose-500 uppercase block">Average Loss ($)</label>
                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="25"
                  value={avgLossAmount}
                  onChange={e => setAvgLossAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2">
                <label className="text-xs font-bold text-amber-500 uppercase block">Friction / Slippage ($)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={frictionPerTrade}
                  onChange={e => setFrictionPerTrade(Math.max(0, Number(e.target.value)))}
                  className="w-full text-base font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 font-mono"
                />
              </div>
            </div>

            {/* EV Output Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Net EV Per Executed Trade</span>
                <span className={`text-2xl font-black font-mono ${evResult.netEV >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {evResult.netEV >= 0 ? '+' : ''}${evResult.netEV.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Gross EV: ${evResult.grossEV.toFixed(2)}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Breakeven Win Rate Threshold</span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {evResult.breakevenWinRate.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Minimum accuracy to overcome friction</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Projected 100-Trade PnL</span>
                <span className={`text-2xl font-black font-mono ${evResult.netEV >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {evResult.netEV >= 0 ? '+' : ''}${(evResult.netEV * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Theoretical asymptote at N=100</span>
              </div>
            </div>
          </div>

          {/* Randomness & Streak Clustering Demonstration */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-purple-600" />
                  Randomness Demonstration: The Clustering Illusion
                </h4>
                <p className="text-xs text-slate-500">
                  Humans expect a 55% win rate system to alternate cleanly (Win, Loss, Win). In true Bernoulli processes, streaks cluster heavily by pure chance.
                </p>
              </div>
              <button
                onClick={() => setRandomSeed(prev => prev + 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 hover:bg-purple-100 text-xs font-bold transition-colors border border-purple-200 dark:border-purple-900"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resimulate 50 Flips
              </button>
            </div>

            {/* Streak Output Pills */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Actual Wins: <strong className="text-emerald-600">{coinFlips.winCount}/50 ({((coinFlips.winCount/50)*100).toFixed(0)}%)</strong></span>
              <span>Longest Win Streak: <strong className="text-emerald-600">{coinFlips.maxWinStreak} trades</strong></span>
              <span>Longest Losing Streak: <strong className="text-rose-600">{coinFlips.maxLossStreak} trades</strong></span>
            </div>

            {/* Visual Flips Matrix */}
            <div className="p-4 rounded-2xl bg-slate-900 flex flex-wrap gap-1.5 items-center">
              {coinFlips.flips.map((win, idx) => (
                <div
                  key={idx}
                  title={`Trade #${idx + 1}: ${win ? 'Win' : 'Loss'}`}
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black font-mono transition-transform hover:scale-125 ${
                    win 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {win ? 'W' : 'L'}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Notice how 4 to 7 consecutive losses routinely appear in random sequences even when the edge is mathematically positive. Discipline means executing through the clusters without altering your rules.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Distributions & Standard Deviation */}
      {activeTab === 'distribution' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Probability Distribution & Standard Deviation Visualizer
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing standard deviations (1σ, 2σ, 3σ) and comparing Gaussian bell curves to real financial fat-tailed kurtosis.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDistributionType('normal')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  distributionType === 'normal' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-400'
                }`}
              >
                Normal (Gaussian)
              </button>
              <button
                onClick={() => setDistributionType('fat_tailed')}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  distributionType === 'fat_tailed' ? 'bg-white dark:bg-slate-700 shadow-xs text-indigo-600' : 'text-slate-400'
                }`}
              >
                Fat-Tailed (Real Market)
              </button>
            </div>
          </div>

          {/* SVG Distribution Curve Display */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300">
                {distributionType === 'normal' ? 'Standard Gaussian Bell Curve (Zero Excess Kurtosis)' : 'Student-t Leptokurtic Curve (Heavy Tails & Black Swans)'}
              </span>
              <span className="text-[11px] font-mono text-indigo-400">
                Volatility Sigma (σ): {volatilitySigma}x
              </span>
            </div>

            <div className="h-56 w-full flex items-end justify-center relative border-b border-slate-800 pb-2">
              <svg className="w-full h-full overflow-visible" viewBox="-200 0 400 160">
                {/* 1σ, 2σ, 3σ Zones */}
                <rect x="-68" y="10" width="136" height="150" fill="rgba(99, 102, 241, 0.15)" />
                <rect x="-136" y="10" width="272" height="150" fill="rgba(99, 102, 241, 0.08)" />

                {/* Vertical Center Axis */}
                <line x1="0" y1="10" x2="0" y2="160" stroke="#64748b" strokeDasharray="3 3" />

                {/* Curve Rendering */}
                <path
                  d={distributionType === 'normal'
                    ? "M -180,158 Q -120,155 -70,110 Q -30,50 0,15 Q 30,50 70,110 Q 120,155 180,158"
                    : "M -190,140 Q -100,150 -50,115 Q -20,40 0,5 Q 20,40 50,115 Q 100,150 190,140"
                  }
                  fill="none"
                  stroke={distributionType === 'normal' ? "#38bdf8" : "#818cf8"}
                  strokeWidth="3.5"
                />

                {/* Outlier markers in fat-tailed mode */}
                {distributionType === 'fat_tailed' && (
                  <>
                    <circle cx="-165" cy="142" r="4.5" fill="#f43f5e" />
                    <circle cx="165" cy="142" r="4.5" fill="#10b981" />
                    <text x="-185" y="130" fill="#f43f5e" fontSize="9" fontWeight="bold">Extreme Crash</text>
                    <text x="135" y="130" fill="#10b981" fontSize="9" fontWeight="bold">Extreme Rally</text>
                  </>
                )}
              </svg>
            </div>

            {/* Standard Deviation Band Labels */}
            <div className="grid grid-cols-3 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">±1 Sigma (68.2% Probability)</span>
                <span className="font-bold text-indigo-300 font-mono">Within 1 Standard Deviation</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">±2 Sigma (95.4% Probability)</span>
                <span className="font-bold text-indigo-300 font-mono">Within 2 Standard Deviations</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">±3 Sigma (99.7% Theoretical)</span>
                <span className="font-bold text-indigo-300 font-mono">Real markets see 4σ - 7σ events!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Correlation & Regression */}
      {activeTab === 'correlation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Correlation Explorer & Linear Regression Visualizer
              </h3>
              <p className="text-xs text-slate-500">
                Interact with correlation coefficient (r) between two assets and inspect linear regression fit (y = α + βx).
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              R² Fit: {(targetCorrelation * targetCorrelation).toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Set Correlation Coefficient (r):
                  </label>
                  <span className={`text-sm font-black font-mono ${
                    targetCorrelation > 0 ? 'text-blue-600' : targetCorrelation < 0 ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    {targetCorrelation > 0 ? '+' : ''}{targetCorrelation.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={targetCorrelation}
                  onChange={e => setTargetCorrelation(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  Portfolio Diversification Meaning:
                </span>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  {targetCorrelation > 0.7 
                    ? 'High positive correlation: Holding both assets provides practically zero diversification. Losses in one will compound losses in the other.'
                    : targetCorrelation < -0.4
                    ? 'Negative correlation: Strong natural hedge. When Asset X falls, Asset Y tends to appreciate, stabilizing total portfolio volatility.'
                    : 'Low correlation (Near 0): Ideal orthogonal diversification. Price movements are largely independent.'}
                </p>
              </div>
            </div>

            {/* Scatter Plot SVG */}
            <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-900 flex items-center justify-center">
              <svg viewBox="-120 -100 240 200" className="w-full h-56 overflow-visible">
                {/* Axes */}
                <line x1="-100" y1="0" x2="100" y2="0" stroke="#475569" strokeWidth="1" />
                <line x1="0" y1="-80" x2="0" y2="80" stroke="#475569" strokeWidth="1" />

                {/* Regression Line */}
                <line 
                  x1="-90" 
                  y1={-90 * targetCorrelation * 0.7} 
                  x2="90" 
                  y2={90 * targetCorrelation * 0.7} 
                  stroke="#38bdf8" 
                  strokeWidth="2.5" 
                />

                {/* Scatter Points */}
                {scatterPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x * 45}
                    cy={pt.y * 35}
                    r="3.5"
                    fill="#a855f7"
                    opacity="0.85"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Monte Carlo Simulation */}
      {activeTab === 'montecarlo' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Monte Carlo Multi-Path Equity Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate multiple parallel lifetimes of the exact same trading edge to observe path dependency.
              </p>
            </div>
            <button
              onClick={() => setMcSeed(prev => prev + 17)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-900"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-run Simulation
            </button>
          </div>

          {/* Monte Carlo Visualizer Canvas */}
          <div className="p-4 rounded-2xl bg-slate-900 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{mcRunsCount} Simulated Paths Across {mcTradeCount} Executed Trades</span>
              <span className="font-mono">Starting Equity: $10,000</span>
            </div>

            <div className="h-56 w-full flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 400 180" className="w-full h-full">
                {/* Horizontal Baseline $10,000 */}
                <line x1="10" y1="100" x2="390" y2="100" stroke="#475569" strokeDasharray="3 3" strokeWidth="1" />

                {/* Trajectories */}
                {monteCarloTrajectories.map((path, pathIdx) => {
                  const pointsStr = path
                    .map((val, step) => {
                      const x = 10 + (step / mcTradeCount) * 380;
                      // map $10k to y=100, $15k to y=20, $5k to y=180
                      const y = Math.max(10, Math.min(170, 100 - ((val - 10000) / 10000) * 80));
                      return `${x},${y}`;
                    })
                    .join(' ');

                  const endVal = path[path.length - 1];
                  const color = endVal >= 10000 ? '#10b981' : '#f43f5e';

                  return (
                    <polyline
                      key={pathIdx}
                      points={pointsStr}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                      opacity="0.7"
                    />
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-slate-400">
              Notice that even with an edge, path dependency can cause two traders with the identical strategy to experience wildly different trajectories in a 40-trade sample.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: Sample Size & Overfitting */}
      {activeTab === 'overfitting' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Sample Size Law & Curve-Fitting (Overfitting) Demonstration
              </h3>
              <p className="text-xs text-slate-500">
                Why small sample sizes fool traders, and how excessive curve-fitting memorizes historical noise instead of market signal.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Model Complexity / Parameters:
                  </label>
                  <span className="text-xs font-black text-indigo-600 font-mono">
                    {polynomialDegree === 1 ? 'Underfitted (Degree 1)' : polynomialDegree <= 3 ? 'Balanced Fit (Degree 2-3)' : 'Severe Overfitting (Degree 6+)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={polynomialDegree}
                  onChange={e => setPolynomialDegree(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-slate-100 block">
                  The Danger of Backtest Over-Optimization:
                </span>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  When you add too many indicators, moving averages, or filter rules, your backtest equity curve looks immaculate because you mathematically memorized random past noise. The second live trading begins, out-of-sample performance collapses.
                </p>
              </div>
            </div>

            {/* Visual Polynomial Curve Comparison */}
            <div className="p-4 rounded-2xl bg-slate-900 flex flex-col items-center justify-center space-y-2">
              <span className="text-[10px] font-mono text-slate-400">
                In-Sample Signal (Black Dots) vs Fitted Model (Line)
              </span>
              <svg viewBox="0 0 240 140" className="w-full h-40">
                {/* Data Points */}
                <circle cx="30" cy="90" r="3.5" fill="#e2e8f0" />
                <circle cx="70" cy="70" r="3.5" fill="#e2e8f0" />
                <circle cx="110" cy="80" r="3.5" fill="#e2e8f0" />
                <circle cx="150" cy="40" r="3.5" fill="#e2e8f0" />
                <circle cx="190" cy="55" r="3.5" fill="#e2e8f0" />
                <circle cx="220" cy="20" r="3.5" fill="#e2e8f0" />

                {/* Dynamic Fitted Line */}
                <path
                  d={
                    polynomialDegree === 1
                      ? "M 20,95 L 225,25"
                      : polynomialDegree <= 3
                      ? "M 20,95 Q 110,80 225,22"
                      : "M 20,95 Q 35,60 50,85 T 90,65 T 130,90 T 170,30 T 210,60 T 225,20"
                  }
                  fill="none"
                  stroke={polynomialDegree > 3 ? "#f43f5e" : "#38bdf8"}
                  strokeWidth="3"
                />
              </svg>
              <span className={`text-[11px] font-bold ${polynomialDegree > 3 ? 'text-rose-400' : 'text-sky-300'}`}>
                {polynomialDegree > 3 ? '❌ Overfitted: Guaranteed Live Failure' : '✅ Robust: Preserves Out-of-Sample Edge'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
