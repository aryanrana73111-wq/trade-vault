import React, { useState, useMemo } from 'react';
import { 
  PieChart as PieIcon, 
  Layers, 
  Percent, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw,
  Sliders,
  Info
} from 'lucide-react';

interface AssetConfig {
  id: string;
  name: string;
  weight: number; // percentage 0-100
  volatility: number; // annualized stdev percentage
  color: string;
}

interface NormalizedAsset extends AssetConfig {
  normWeight: number;
}

export const PortfolioLab: React.FC = () => {
  // Configurable Portfolio Assets
  const [assets, setAssets] = useState<AssetConfig[]>([
    { id: 'equities', name: 'Global Equities', weight: 45, volatility: 16, color: '#3b82f6' },
    { id: 'treasuries', name: 'US Sovereign Bonds', weight: 25, volatility: 9, color: '#10b981' },
    { id: 'gold', name: 'Gold / Commodities', weight: 15, volatility: 14, color: '#f59e0b' },
    { id: 'highbeta', name: 'High-Beta / Tech', weight: 15, volatility: 45, color: '#8b5cf6' }
  ]);

  // Pairwise Correlation Matrix
  const [correlations, setCorrelations] = useState<Record<string, number>>({
    'equities_treasuries': -0.25,
    'equities_gold': 0.10,
    'equities_highbeta': 0.75,
    'treasuries_gold': 0.20,
    'treasuries_highbeta': -0.15,
    'gold_highbeta': 0.15
  });

  // Helper to fetch correlation between asset i and j
  const getCorr = (idA: string, idB: string): number => {
    if (idA === idB) return 1.0;
    const key1 = `${idA}_${idB}`;
    const key2 = `${idB}_${idA}`;
    return correlations[key1] ?? correlations[key2] ?? 0.0;
  };

  const updateWeight = (id: string, newWeight: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, weight: Math.max(0, newWeight) } : a));
  };

  const updateVol = (id: string, newVol: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, volatility: Math.max(1, newVol) } : a));
  };

  // Normalize weights to sum to exactly 100%
  const totalRawWeight = assets.reduce((sum, a) => sum + a.weight, 0);
  const normalizedAssets: NormalizedAsset[] = useMemo(() => {
    if (totalRawWeight === 0) {
      const equalWeight = 1 / assets.length;
      return assets.map(a => ({ ...a, normWeight: equalWeight }));
    }
    return assets.map(a => ({
      ...a,
      normWeight: a.weight / totalRawWeight
    }));
  }, [assets, totalRawWeight]);

  // Mathematics: Portfolio Volatility & Risk Contribution
  const portfolioMetrics = useMemo(() => {
    const N = normalizedAssets.length;
    let portfolioVariance = 0;
    let weightedSumVol = 0;

    // Herfindahl-Hirschman Concentration Index (HHI)
    let hhi = 0;
    for (const a of normalizedAssets) {
      hhi += a.normWeight * a.normWeight;
      weightedSumVol += a.normWeight * a.volatility;
    }

    // Covariance matrix calculation
    const covarianceMatrix: number[][] = [];
    for (let i = 0; i < N; i++) {
      covarianceMatrix[i] = [];
      for (let j = 0; j < N; j++) {
        const corr = getCorr(normalizedAssets[i].id, normalizedAssets[j].id);
        const cov = corr * (normalizedAssets[i].volatility / 100) * (normalizedAssets[j].volatility / 100);
        covarianceMatrix[i][j] = cov;
      }
    }

    // Portfolio variance: w^T * Sigma * w
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        portfolioVariance += normalizedAssets[i].normWeight * normalizedAssets[j].normWeight * covarianceMatrix[i][j];
      }
    }

    const portfolioVol = Math.sqrt(Math.max(0.00001, portfolioVariance)) * 100;
    const diversificationBenefit = Math.max(0, ((weightedSumVol - portfolioVol) / weightedSumVol) * 100);

    // Marginal Risk Contribution (RC_i = w_i * (Sigma * w)_i / sigma_p^2)
    const riskContributions = normalizedAssets.map((asset, i) => {
      let marginalVol = 0;
      for (let j = 0; j < N; j++) {
        marginalVol += covarianceMatrix[i][j] * normalizedAssets[j].normWeight;
      }
      const absoluteRC = asset.normWeight * marginalVol;
      const percentageRC = (absoluteRC / portfolioVariance) * 100;
      return {
        ...asset,
        riskContributionPct: Math.max(0, percentageRC)
      };
    });

    return {
      portfolioVol,
      weightedSumVol,
      diversificationBenefit,
      hhi,
      riskContributions
    };
  }, [normalizedAssets, correlations]);

  return (
    <div className="space-y-8">
      {/* Simulation Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3">
        <PieIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
          <strong className="font-bold uppercase tracking-wider">Hypothetical Portfolio Constructor:</strong> Models annualized volatility, Markowitz covariance, and Euler marginal risk decomposition under stationary assumptions. In real market crashes, correlations often spike towards +1.0 (loss of diversification).
        </div>
      </div>

      {/* Main Grid: Asset Allocations + Portfolio Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Asset Configuration Sliders (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Hypothetical Asset Allocations & Volatilities
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              Total Weight: {totalRawWeight}%
            </span>
          </div>

          <div className="space-y-4">
            {assets.map(asset => (
              <div 
                key={asset.id} 
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: asset.color }} />
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100">{asset.name}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300">
                    Weight: {asset.weight}% | Vol: {asset.volatility}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Capital Weight (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={asset.weight}
                      onChange={e => updateWeight(asset.id, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Annual Volatility (%)
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      step="1"
                      value={asset.volatility}
                      onChange={e => updateVol(asset.id, Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Top-Level Metrics & Donut (6 Cols) */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
              Modern Portfolio Theory Diagnostics
            </h3>
            <span className="text-xs text-emerald-600 font-bold">
              Markowitz Covariance Engine
            </span>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Portfolio Volatility
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {portfolioMetrics.portfolioVol.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Weighted sum is {portfolioMetrics.weightedSumVol.toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                Diversification Benefit
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                +{portfolioMetrics.diversificationBenefit.toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Free variance reduction from non-correlation
              </span>
            </div>
          </div>

          {/* Capital Allocation vs True Risk Contribution Disparity */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">
                Capital Allocation vs Realized Risk Contribution
              </span>
              <span className="text-[10px] font-mono text-amber-400">
                Notice High-Beta Disparity
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {portfolioMetrics.riskContributions.map(rc => (
                <div key={rc.id} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold" style={{ color: rc.color }}>{rc.name}</span>
                    <span className="font-mono text-slate-400">
                      Capital: {(rc.normWeight * 100).toFixed(0)}% → Risk Contribution: <strong className="text-white">{rc.riskContributionPct.toFixed(1)}%</strong>
                    </span>
                  </div>
                  {/* Two-bar comparison: capital vs risk */}
                  <div className="grid grid-cols-2 gap-2 h-2 rounded-full overflow-hidden bg-slate-800">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rc.normWeight * 100}%` }} />
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, rc.riskContributionPct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix Heatmap */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-500" />
          Interactive Pairwise Correlation Matrix (ρ)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'equities_treasuries', label: 'Equities vs US Treasuries' },
            { key: 'equities_gold', label: 'Equities vs Gold' },
            { key: 'equities_highbeta', label: 'Equities vs High-Beta' },
            { key: 'treasuries_gold', label: 'Treasuries vs Gold' },
            { key: 'treasuries_highbeta', label: 'Treasuries vs High-Beta' },
            { key: 'gold_highbeta', label: 'Gold vs High-Beta' }
          ].map(pair => {
            const val = correlations[pair.key] ?? 0;
            return (
              <div 
                key={pair.key} 
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{pair.label}</span>
                  <span className={`font-mono font-black ${val < 0 ? 'text-emerald-600' : val > 0.5 ? 'text-rose-500' : 'text-slate-600'}`}>
                    {val > 0 ? '+' : ''}{val.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.05"
                  value={val}
                  onChange={e => setCorrelations(prev => ({ ...prev, [pair.key]: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
