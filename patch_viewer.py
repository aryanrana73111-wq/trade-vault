import os

f = "src/components/academy/assessment/AssessmentChartViewer.tsx"
with open(f, 'r') as file:
    content = file.read()
    
# Replace the end of the file `return null;` with our new render blocks
new_blocks = """
  if (data.type === 'equity-curve') {
    const p1 = data.elements.points || [];
    const p2 = data.elements.points2 || [];
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-blue-400">
            <LineChart className="w-3.5 h-3.5" />
            {data.caption}
          </span>
        </div>
        <div className="w-full aspect-[2.6/1] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-850 p-2">
          <svg viewBox="0 0 400 160" className="w-full h-full">
            <line x1="20" y1="40" x2="380" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="20" y1="80" x2="380" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="20" y1="120" x2="380" y2="120" stroke="#1e293b" strokeDasharray="3 3" />
            
            {p1.length > 1 && (
              <polyline fill="none" stroke="#38bdf8" strokeWidth="2" points={p1.map(p => `${p.x},${p.y}`).join(' ')} />
            )}
            {p2.length > 1 && (
              <polyline fill="none" stroke="#10b981" strokeWidth="2" points={p2.map(p => `${p.x},${p.y}`).join(' ')} />
            )}
          </svg>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-sky-500 rounded-full" /> Trader A</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Trader B</span>
        </div>
      </div>
    );
  }

  if (data.type === 'probability-distribution') {
    const dist = data.elements.distribution || [];
    const maxCount = Math.max(...dist.map(d => d.count), 1);
    
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-blue-400">
            <LineChart className="w-3.5 h-3.5" />
            {data.caption}
          </span>
        </div>
        <div className="w-full aspect-[2.6/1] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-850 p-4 flex items-end justify-center gap-1">
          {dist.map((d, i) => {
            const h = (d.count / maxCount) * 100;
            const isNegative = d.value < 0;
            return (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <div 
                  className={`w-full rounded-t-sm transition-all ${isNegative ? 'bg-rose-500/80 group-hover:bg-rose-400' : 'bg-emerald-500/80 group-hover:bg-emerald-400'}`} 
                  style={{ height: `${h}%` }}
                />
                <span className="text-[8px] text-slate-500 mt-1">{d.value}R</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (data.type === 'drawdown-chart') {
    const points = data.elements.points || [];
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-rose-400">
            <ArrowDownRight className="w-3.5 h-3.5" />
            {data.caption}
          </span>
        </div>
        <div className="w-full aspect-[2.6/1] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-850 p-2">
          <svg viewBox="0 0 400 160" className="w-full h-full">
            <line x1="20" y1="20" x2="380" y2="20" stroke="#f43f5e" strokeDasharray="3 3" />
            <text x="375" y="15" fill="#f43f5e" fontSize="8" textAnchor="end">0% (High Water Mark)</text>
            
            {points.length > 1 && (
              <polyline fill="none" stroke="#f43f5e" strokeWidth="2" points={points.map(p => `${p.x},${p.y}`).join(' ')} />
            )}
            {/* Fill area under curve */}
            {points.length > 1 && (
              <polygon 
                fill="#f43f5e" 
                fillOpacity="0.2"
                points={`20,20 ${points.map(p => `${p.x},${p.y}`).join(' ')} ${points[points.length-1].x},20`} 
              />
            )}
          </svg>
        </div>
      </div>
    );
  }

  return null;
"""

content = content.replace("  return null;", new_blocks)

with open(f, 'w') as file:
    file.write(content)

print("Done patching viewer")
