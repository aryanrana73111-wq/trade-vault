import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { EducationalChartCard } from './EducationalChartCard';

export const EducationalPortfolioCircleChart: React.FC = () => {
  const [modelType, setModelType] = useState<'traditional-60-40' | 'risk-parity' | 'all-weather'>('risk-parity');

  const portfolioData = React.useMemo(() => {
    if (modelType === 'traditional-60-40') {
      return [
        { name: 'Global Equities', weight: 60, riskContribution: 88, color: '#3b82f6' },
        { name: 'Sovereign Bonds', weight: 40, riskContribution: 12, color: '#10b981' },
      ];
    }
    if (modelType === 'risk-parity') {
      return [
        { name: 'Equities (Low Beta)', weight: 25, riskContribution: 25, color: '#3b82f6' },
        { name: 'Long-Term Treasuries', weight: 40, riskContribution: 25, color: '#10b981' },
        { name: 'Inflation-Protected (TIPS)', weight: 15, riskContribution: 25, color: '#f59e0b' },
        { name: 'Commodities & Gold', weight: 20, riskContribution: 25, color: '#8b5cf6' },
      ];
    }
    // All-Weather Bridgewater model
    return [
      { name: 'Public Equities', weight: 30, riskContribution: 45, color: '#3b82f6' },
      { name: 'Long-Term Treasuries', weight: 40, riskContribution: 25, color: '#10b981' },
      { name: 'Intermediate Bonds', weight: 15, riskContribution: 10, color: '#06b6d4' },
      { name: 'Gold', weight: 7.5, riskContribution: 10, color: '#f59e0b' },
      { name: 'Broad Commodities', weight: 7.5, riskContribution: 10, color: '#ec4899' },
    ];
  }, [modelType]);

  return (
    <EducationalChartCard
      title="Portfolio Asset Allocation & Risk Contribution Circle"
      subtitle="Comparing dollar allocation percentages against actual portfolio volatility contributions"
      badge="Educational Example"
      category="PORTFOLIO MANAGEMENT"
      units="Capital Allocation Weight (%)"
      whatAmILookingAt="A circular donut visualization of asset class allocation. In the 'Traditional 60/40' portfolio, equities represent 60% of dollars, but because equities are 3x more volatile than bonds, equities actually generate ~88% of total portfolio volatility and drawdown risk!"
      whyItMatters="True diversification is not equal dollar weighting; it is Equal Risk Contribution (Risk Parity). To balance a portfolio across macroeconomic regimes (inflation vs deflation, growth vs contraction), assets must be scaled inversely to their historical volatility."
      commonMistake="Allocating 25% of capital to crypto, 25% to stocks, 25% to gold, and 25% to cash, believing you are equally balanced. Crypto will dominate 90% of your daily portfolio P&L volatility."
      metrics={[
        { label: 'Primary Asset Class', value: portfolioData[0].name, color: 'text-blue-600 dark:text-blue-400', subtext: `${portfolioData[0].weight}% Capital Weight` },
        { label: 'Risk Concentration', value: modelType === 'traditional-60-40' ? '88% Equity Risk' : 'Balanced (25% each)', color: modelType === 'traditional-60-40' ? 'text-rose-600' : 'text-emerald-600', subtext: 'Volatility Driver' },
        { label: 'Asset Buckets', value: `${portfolioData.length} Sleeves`, subtext: 'Non-Correlated Classes' },
        { label: 'Target Regime', value: modelType === 'risk-parity' ? 'All Macro Weather' : 'Bull Expansion Heavy', subtext: 'Market Environment' }
      ]}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Portfolio Model:</span>
          {(['traditional-60-40', 'risk-parity', 'all-weather'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModelType(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                modelType === m
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {m.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-2">
        {/* Donut Chart Stage */}
        <div className="h-60 w-60 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }}
                formatter={(val: any, name: any, item: any) => [
                  `${val}% Dollar Allocation (~${item.payload.riskContribution}% Risk Contribution)`,
                  name
                ]}
              />
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="weight"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xs font-black uppercase text-slate-400">Model</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {modelType.split('-')[0]}
            </span>
          </div>
        </div>

        {/* Breakdown Legend Table */}
        <div className="flex-1 w-full max-w-sm space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
            <span>Asset Sleeve</span>
            <span>Weight % (Risk %)</span>
          </div>
          {portfolioData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-750">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
              </div>
              <div className="font-mono text-right">
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.weight}%</span>
                <span className="text-[10px] text-slate-400 ml-1.5">({item.riskContribution}% risk)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EducationalChartCard>
  );
};
