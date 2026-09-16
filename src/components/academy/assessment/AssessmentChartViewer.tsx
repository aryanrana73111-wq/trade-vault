import React from 'react';
import { ChartContextData } from '@/types/assessment';
import { LineChart, ArrowDownRight, Layers } from 'lucide-react';

interface AssessmentChartViewerProps {
  data: ChartContextData;
}

export const AssessmentChartViewer: React.FC<AssessmentChartViewerProps> = ({ data }) => {
  if (data.type === 'market-structure-swing') {
    const points = data.elements.points || [];
    const levels = data.elements.levels || [];

    return (
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-blue-400">
            <LineChart className="w-3.5 h-3.5" />
            {data.caption}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-950 text-blue-300 font-semibold border border-blue-800">
            Educational Visual
          </span>
        </div>

        {/* SVG Chart Stage */}
        <div className="w-full aspect-[2.6/1] bg-slate-950 rounded-xl relative overflow-hidden border border-slate-850 p-2">
          <svg viewBox="0 0 400 160" className="w-full h-full" role="img" aria-label={data.caption}>
            {/* Horizontal Grid lines */}
            <line x1="20" y1="40" x2="380" y2="40" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="20" y1="80" x2="380" y2="80" stroke="#1e293b" strokeDasharray="3 3" />
            <line x1="20" y1="120" x2="380" y2="120" stroke="#1e293b" strokeDasharray="3 3" />

            {/* Support Level Line */}
            <line x1="120" y1="90" x2="380" y2="90" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
            <text x="375" y="85" fill="#34d399" fontSize="8" textAnchor="end" fontWeight="bold">
              Key Higher Low ($142.50)
            </text>

            {/* Swing Price Zig-Zag Polyline */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
              />
            )}

            {/* Swing Points */}
            {points.map((p, idx) => {
              const isBreakdown = idx === points.length - 1;
              return (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isBreakdown ? '5' : '4'}
                    fill={isBreakdown ? '#f43f5e' : '#38bdf8'}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                  {/* Labels for Swing Points */}
                  {idx === 1 && <text x={p.x} y={p.y - 8} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">High</text>}
                  {idx === 2 && <text x={p.x} y={p.y + 12} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">HL</text>}
                  {idx === 3 && <text x={p.x} y={p.y - 8} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">HH</text>}
                  {idx === 4 && <text x={p.x} y={p.y + 12} fill="#34d399" fontSize="8" textAnchor="middle" fontWeight="bold">HL</text>}
                  {idx === 5 && <text x={p.x} y={p.y - 8} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold">HH</text>}
                  {isBreakdown && (
                    <g>
                      <text x={p.x} y={p.y + 15} fill="#f43f5e" fontSize="9" textAnchor="middle" fontWeight="black">
                        Breakdown!
                      </text>
                      <line x1={p.x} y1="90" x2={p.x} y2={p.y} stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Protected Swing Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Violation Point
          </span>
        </div>
      </div>
    );
  }


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
          <svg viewBox="0 0 400 160" className="w-full h-full" role="img" aria-label={data.caption}>
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
          <svg viewBox="0 0 400 160" className="w-full h-full" role="img" aria-label={data.caption}>
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

};
