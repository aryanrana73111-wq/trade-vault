import os
import re

path = 'src/pages/Analytics.tsx'
with open(path, 'r') as f:
    content = f.read()

# We need to replace the entire StatCard function.
statcard_regex = r'function StatCard\(\{ title.*?\}\).*?\n\}\n'

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
        {trend !== 'none' && (
          <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 
            trend === 'down' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : 
            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : trend === 'down' ? <ArrowDownRight className="w-4 h-4 mr-0.5" /> : null}
          </span>
        )}
      </div>
    </Card>
  );
}
"""

# Let's replace the broken block from line 53 to line 89
# The broken block starts at function StatCard and ends at line 89 `}`

content = re.sub(r'function StatCard\(\{ title.*?\n\}\n', statcard_def, content, flags=re.DOTALL)

with open(path, 'w') as f:
    f.write(content)

print("StatCard fixed")
