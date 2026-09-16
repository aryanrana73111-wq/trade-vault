import os
import re

path = 'src/pages/Journal.tsx'
with open(path, 'r') as f:
    content = f.read()

badge_html = """            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {format(new Date(trade.date), 'MMM dd, yyyy')} {trade.time ? `• ${trade.time}` : ''}
              </span>
              {missingFields.length === 0 ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Complete</span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" title={`Missing: ${missingFields.join(', ')}`}>
                  Missing Data
                </span>
              )}
            </div>"""

content = content.replace("""            <div className="text-sm text-slate-500 dark:text-slate-400">
              {format(new Date(trade.date), 'MMM dd, yyyy')} {trade.time ? `• ${trade.time}` : ''}
            </div>""", badge_html)

logic_insert = """  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const missingFields: string[] = [];
  if (!trade.session || trade.session === 'Other') missingFields.push('Session');
  if (!trade.strategy) missingFields.push('Strategy');
  if (!trade.emotions || trade.emotions.length === 0) missingFields.push('Emotions');
  if (trade.rMultiple === undefined && trade.result !== 'PENDING') missingFields.push('Result/R');
  if (!trade.notes) missingFields.push('Notes');
"""

content = content.replace("""  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();""", logic_insert)

with open(path, 'w') as f:
    f.write(content)

print("TradeCard fixed")
