import fs from 'fs';
let code = fs.readFileSync('src/components/analytics/PerformanceTab.tsx', 'utf-8');

const regex = /<\/div>\n\s*<\/div>\n\s*\);\n\}/;
code = code.replace(
  regex,
  `      </div>
      
      {/* Time-Based Periodicity (Daily / Weekly / Monthly) */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm mt-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-purple-500" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Cumulative Progress</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Total P&L</div>
             <div className={\`text-xl font-bold \${metrics.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}\`}>
               {formatCurrency(metrics.netPnl)}
             </div>
           </div>
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Cumulative R</div>
             <div className={\`text-xl font-bold \${metrics.averageR * metrics.closedTradesCount >= 0 ? 'text-emerald-600' : 'text-rose-600'}\`}>
               {metrics.closedTradesCount > 0 ? (metrics.averageR * metrics.closedTradesCount).toFixed(2) + 'R' : '0R'}
             </div>
           </div>
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Average Win</div>
             <div className="text-xl font-bold text-emerald-600">
               {formatCurrency(metrics.averageWin)}
             </div>
           </div>
           <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
             <div className="text-sm text-slate-500 mb-1">Average Loss</div>
             <div className="text-xl font-bold text-rose-600">
               -{formatCurrency(metrics.averageLoss)}
             </div>
           </div>
        </div>
      </Card>
    </div>
  );
}`
);

fs.writeFileSync('src/components/analytics/PerformanceTab.tsx', code);
