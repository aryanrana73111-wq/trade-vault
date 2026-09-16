import React, { useState } from 'react';
import { AcademyDomain } from '@/types/academy';
import { getMasteryState } from '@/types/assessment';

interface CompetencyRadarChartProps {
  scores: Record<AcademyDomain, number>;
  targetBenchmark?: number; // default 80%
  size?: number; // default 320
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({
  scores,
  targetBenchmark = 80,
  size = 340
}) => {
  const [hoveredDomain, setHoveredDomain] = useState<AcademyDomain | null>(null);

  const domains: { name: AcademyDomain; label: string }[] = [
    { name: 'Market Knowledge', label: 'Market' },
    { name: 'Technical Analysis', label: 'Tech Analysis' },
    { name: 'Risk Management', label: 'Risk Mgmt' },
    { name: 'Execution', label: 'Execution' },
    { name: 'Trading Psychology', label: 'Trading Psychology' },
    { name: 'Quantitative Analysis', label: 'Quant' },
    { name: 'Portfolio Management', label: 'Portfolio Management' },
    { name: 'Professional Practice', label: 'Professional Practice' }
  ];

  const count = domains.length;
  const center = size / 2;
  const radius = (size / 2) - 48; // padding for labels

  // Helper to compute (x, y) given an angle and normalized radius (0 to 1)
  const getCoordinates = (index: number, normalizedVal: number) => {
    // Start from top (-90 degrees)
    const angle = (Math.PI * 2 / count) * index - (Math.PI / 2);
    const r = radius * Math.max(0, Math.min(1, normalizedVal));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Concentric levels: 25%, 50%, 75%, 100%
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for User's actual scores
  const userPoints = domains.map((d, i) => {
    const val = (scores[d.name] || 0) / 100;
    return getCoordinates(i, val);
  });
  const userPolygonStr = userPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Polygon points for Target Benchmark (80%)
  const benchmarkPoints = domains.map((_, i) => getCoordinates(i, targetBenchmark / 100));
  const benchmarkPolygonStr = benchmarkPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="flex flex-col items-center justify-center space-y-3 w-full">
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none overflow-visible"
        >
          {/* Concentric grid webs */}
          {levels.map((lvl, idx) => {
            const gridPts = domains.map((_, i) => getCoordinates(i, lvl));
            return (
              <polygon
                key={idx}
                points={gridPts.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="#64748b"
                strokeWidth="1"
                strokeOpacity={idx === levels.length - 1 ? '0.35' : '0.15'}
                strokeDasharray={idx < levels.length - 1 ? '2 2' : undefined}
              />
            );
          })}

          {/* Radial axis lines from center to outer ring */}
          {domains.map((_, i) => {
            const outer = getCoordinates(i, 1.0);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke="#64748b"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
            );
          })}

          {/* Target Benchmark (80%) Polygon */}
          <polygon
            points={benchmarkPolygonStr}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* User Score Filled Polygon */}
          <polygon
            points={userPolygonStr}
            fill="#3b82f6"
            fillOpacity="0.28"
            stroke="#2563eb"
            strokeWidth="2.5"
            className="transition-all duration-300"
          />

          {/* Vertex Points & Interactive Target Circles */}
          {userPoints.map((pt, i) => {
            const domain = domains[i].name;
            const score = scores[domain] || 0;
            const isHovered = hoveredDomain === domain;

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDomain(domain)}
                onMouseLeave={() => setHoveredDomain(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '7' : '4.5'}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Axis Labels */}
          {domains.map((d, i) => {
            const coord = getCoordinates(i, 1.18);
            const isHovered = hoveredDomain === d.name;
            const score = scores[d.name] || 0;

            return (
              <text
                key={i}
                x={coord.x}
                y={coord.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9.5"
                fontWeight={isHovered ? '800' : '600'}
                fill={isHovered ? '#2563eb' : '#64748b'}
                className="cursor-pointer transition-colors"
                onMouseEnter={() => setHoveredDomain(d.name)}
                onMouseLeave={() => setHoveredDomain(null)}
              >
                {d.label} ({score}%)
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend & Hover Readout */}
      <div className="w-full flex items-center justify-between text-xs px-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
            <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block opacity-80" />
            Assessed Score
          </span>
          <span className="flex items-center gap-1.5 text-amber-500 font-bold">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
            Institutional Target (80%)
          </span>
        </div>

        {hoveredDomain && (
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
            {hoveredDomain}: <span className="text-blue-600 dark:text-blue-400">{scores[hoveredDomain]}%</span> ({getMasteryState(scores[hoveredDomain])})
          </div>
        )}
      </div>
    </div>
  );
};
