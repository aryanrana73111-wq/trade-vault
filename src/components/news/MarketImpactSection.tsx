import React from 'react';
import { MarketReactionChart } from './MarketReactionChart';
import { 
  BarChart3, 
  Flame, 
  AlertCircle, 
  Info, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

interface AssetImpactItem {
  asset: string;
  category: string;
  sensitivity: 'HIGH' | 'MEDIUM' | 'LOW';
  typicalReaction: string;
  rationale: string;
  bias: 'UP' | 'DOWN' | 'VOLATILE';
}

const IMPACT_MATRIX: AssetImpactItem[] = [
  {
    asset: 'USD (DXY)',
    category: 'Forex / Reserve',
    sensitivity: 'HIGH',
    typicalReaction: 'Bullish on sticky/higher inflation or hawkish central bank pause',
    rationale: 'Higher terminal rate expectations attract global capital to US Dollar yields.',
    bias: 'UP'
  },
  {
    asset: 'Gold (XAU/USD)',
    category: 'Precious Metals',
    sensitivity: 'HIGH',
    typicalReaction: 'Bearish on rising real yields; spikes rapidly on surprise easing or geopolitical tail risks',
    rationale: 'Non-yielding metal faces direct opportunity cost when risk-free debt yields rise.',
    bias: 'DOWN'
  },
  {
    asset: 'EUR/USD',
    category: 'Major FX',
    sensitivity: 'HIGH',
    typicalReaction: 'Pressured by ECB-Fed divergence if European growth lags US resilience',
    rationale: 'Capital migrates rapidly across the cross-currency swap basis.',
    bias: 'DOWN'
  },
  {
    asset: 'S&P 500 / Nasdaq',
    category: 'US Equities',
    sensitivity: 'MEDIUM',
    typicalReaction: 'High initial volatility; tech stocks sensitive to discount rate changes',
    rationale: 'Balance between economic resilience supporting earnings versus higher discount rates.',
    bias: 'VOLATILE'
  },
  {
    asset: 'Bitcoin (BTC)',
    category: 'Digital Assets',
    sensitivity: 'HIGH',
    typicalReaction: 'Surges with global monetary liquidity expansions; volatile on macro surprises',
    rationale: 'Acts as high-beta global liquidity sponge and alternative store of value.',
    bias: 'UP'
  }
];

export function MarketImpactSection() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Market Impact & Cross-Asset Sensitivity
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time sensitivity matrix detailing how key trading assets absorb upcoming economic catalysts
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-900">
          Catalyst Sensitivity Engine
        </span>
      </div>

      {/* Grid: Reaction Chart + Sensitivity Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Top: Interactive Reaction Curve */}
        <div className="lg:col-span-7">
          <MarketReactionChart initialAsset="GOLD" />
        </div>

        {/* Right / Bottom: Asset Sensitivity Matrix */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Asset Volatility Vulnerability
              </h3>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Live Assessment</span>
            </div>

            <div className="space-y-2.5">
              {IMPACT_MATRIX.map((item, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {item.asset}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {item.typicalReaction}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    {/* Impact Badge with Icon and Text */}
                    {item.sensitivity === 'HIGH' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center">
                        <Flame className="w-3 h-3 mr-1 text-rose-500" /> HIGH
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1 text-amber-500" /> MED
                      </span>
                    )}

                    {/* Bias Arrow */}
                    <div className={`p-1 rounded-md text-xs font-bold ${
                      item.bias === 'UP' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                      item.bias === 'DOWN' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' :
                      'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    }`}>
                      {item.bias === 'UP' && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {item.bias === 'DOWN' && <ArrowDownRight className="w-3.5 h-3.5" />}
                      {item.bias === 'VOLATILE' && <TrendingUp className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Transmission Hint */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">Macro Transmission Flow:</span>
              Inflation & Central Bank Surprise → Real Yield Re-pricing → Dollar Liquidity Shift → Metals & Equities Valuation Compression.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
