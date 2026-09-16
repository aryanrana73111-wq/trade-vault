import os
import re

path = 'src/pages/Analytics.tsx'
with open(path, 'r') as f:
    content = f.read()

statcard_def = """function StatCard({ title, value, icon, trend, tooltip, sampleSize }: { title: string, value: React.ReactNode, icon: React.ReactNode, trend: 'up' | 'down' | 'neutral' | 'none', tooltip?: string, sampleSize?: number }) {
  return (
    <Card className="p-6 shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-32 relative overflow-hidden group hover:border-blue-200 transition-colors">
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
          {tooltip && (
            <div className="group/tooltip relative">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-500 cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                {tooltip}
                {sampleSize !== undefined && (
                  <div className="mt-1 pt-1 border-t border-slate-700 font-mono">
                    n = {sampleSize} trades
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2 relative z-10">
        <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</span>
      </div>
    </Card>
  );
}"""

content = re.sub(r'function StatCard\(\{ title.*?\) \{\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\}', statcard_def, content, flags=re.DOTALL)

content = content.replace('title="Net P&L"', 'title="Net P&L" tooltip="Total Realized Profit & Loss" sampleSize={kpis.closedTradesCount}')
content = content.replace('title="Win Rate"', 'title="Win Rate" tooltip="Winning Trades / Total Closed Trades" sampleSize={kpis.closedTradesCount}')
content = content.replace('title="Profit Factor"', 'title="Profit Factor" tooltip="Gross Profit / Gross Loss" sampleSize={kpis.closedTradesCount}')
content = content.replace('title="Expectancy"', 'title="Expectancy" tooltip="Average Net P&L per Trade" sampleSize={kpis.closedTradesCount}')
content = content.replace('title="Average R"', 'title="Average R" tooltip="Average Risk Multiple (R-Multiple) per Trade" sampleSize={kpis.closedTradesCount}')
content = content.replace('title="Max Drawdown"', 'title="Max Drawdown" tooltip="Maximum Peak-to-Trough Equity Drop" sampleSize={kpis.closedTradesCount}')
content = content.replace('title="Avg Win"', 'title="Avg Win" tooltip="Average Gross Profit per Winning Trade" sampleSize={kpis.winTrades}')
content = content.replace('title="Avg Loss"', 'title="Avg Loss" tooltip="Average Gross Loss per Losing Trade" sampleSize={kpis.lossTrades}')


with open(path, 'w') as f:
    f.write(content)

print("StatCard fixed")
