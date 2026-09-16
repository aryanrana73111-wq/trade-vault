import fs from 'fs';
let code = fs.readFileSync('src/components/analytics/StrategyResearchTab.tsx', 'utf-8');

const regex = /const pnlChartData = strategyStats.map/;
code = code.replace(
  regex,
  `const sessionHeatmap = useMemo(() => {
    const sessions = Array.from(new Set(trades.map(t => t.session).filter(Boolean)));
    const strats = strategyStats.map(s => s.strategy);
    
    let bestCell = { strat: '', session: '', value: -Infinity, label: '' };
    let worstCell = { strat: '', session: '', value: Infinity, label: '' };

    strats.forEach(strat => {
      sessions.forEach(session => {
        const cellTrades = trades.filter(t => t.strategy === strat && t.session === session);
        const metrics = calculateInstitutionalMetrics(cellTrades);
        
        if (metrics.closedTradesCount >= 3) {
          if (metrics.expectancy > bestCell.value) bestCell = { strat, session, value: metrics.expectancy, label: 'Highest Expectancy' };
          if (metrics.expectancy < worstCell.value) worstCell = { strat, session, value: metrics.expectancy, label: 'Lowest Expectancy' };
        }
      });
    });
    
    return { bestCell, worstCell };
  }, [trades, strategyStats]);

  const pnlChartData = strategyStats.map`
);

const uiRegex = /<h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">/;
code = code.replace(
  uiRegex,
  `<h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4" />
          Strategy Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">`
);

const uiAppendRegex = /<\/div>\n\s*<\/Card>\n\n\s*\{\/\* Comparison Chart \*\/\}/;
code = code.replace(
  uiAppendRegex,
  `  <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white/40 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-xs uppercase tracking-wider">Strongest Session Pairing</span>
            {sessionHeatmap.bestCell.strat ? (
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.bestCell.strat}</span> 
                <span className="text-slate-500"> on </span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.bestCell.session}</span>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 text-xs">
                  {formatCurrency(sessionHeatmap.bestCell.value)} Avg Expectancy
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Insufficient data</span>
            )}
          </div>
          <div className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-white/40 dark:border-slate-700/50">
            <span className="text-slate-500 dark:text-slate-400 block mb-1 font-medium text-xs uppercase tracking-wider">Weakest Session Pairing</span>
            {sessionHeatmap.worstCell.strat ? (
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.worstCell.strat}</span> 
                <span className="text-slate-500"> on </span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{sessionHeatmap.worstCell.session}</span>
                <div className="text-rose-600 dark:text-rose-400 font-semibold mt-0.5 text-xs">
                  {formatCurrency(sessionHeatmap.worstCell.value)} Avg Expectancy
                </div>
              </div>
            ) : (
              <span className="text-slate-500">Insufficient data</span>
            )}
          </div>
        </div>
      </Card>

      {/* Comparison Chart */}`
);

fs.writeFileSync('src/components/analytics/StrategyResearchTab.tsx', code);
