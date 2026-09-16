import React, { useState } from 'react';
import { GitBranch, Link2, Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { EducationalChartCard } from './EducationalChartCard';

interface ConceptNode {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  description: string;
  dependencies: string[];
}

export const EducationalConceptGraph: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('risk-invariance');

  const nodes: ConceptNode[] = [
    {
      id: 'market-auction',
      title: 'Auction Market Theory',
      category: 'MARKETS',
      x: 60,
      y: 110,
      description: 'Markets exist solely to facilitate trade and discover equilibrium price via continuous two-way double auctions.',
      dependencies: []
    },
    {
      id: 'bid-ask-spread',
      title: 'Bid-Ask Microstructure',
      category: 'EXECUTION',
      x: 180,
      y: 50,
      description: 'The difference between passive resting limit buy/sell orders that creates the baseline friction of market entry.',
      dependencies: ['market-auction']
    },
    {
      id: 'order-flow',
      title: 'Aggressive Order Flow',
      category: 'MICROSTRUCTURE',
      x: 180,
      y: 170,
      description: 'Market orders that cross the spread and consume resting liquidity to drive directional price discovery.',
      dependencies: ['market-auction']
    },
    {
      id: 'market-structure',
      title: 'Market Structure & Swings',
      category: 'TECHNICAL ANALYSIS',
      x: 320,
      y: 50,
      description: 'The fractal sequence of Higher Highs / Lows and Lower Highs / Lows mapping institutional trend discovery.',
      dependencies: ['bid-ask-spread', 'order-flow']
    },
    {
      id: 'risk-invariance',
      title: 'Fixed-Fractional Risk Sizing',
      category: 'RISK MANAGEMENT',
      x: 320,
      y: 170,
      description: 'Sizing trade units dynamically so every stop-out loses exactly a fixed percentage of total portfolio equity.',
      dependencies: ['order-flow']
    },
    {
      id: 'expectancy-engine',
      title: 'Mathematical Expectancy (EV)',
      category: 'QUANTITATIVE',
      x: 460,
      y: 110,
      description: 'The net mathematical edge generated per trade: EV = (Win Rate × Win Size) - (Loss Rate × Loss Size).',
      dependencies: ['market-structure', 'risk-invariance']
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNodeId) || nodes[4];

  // Helper to draw connection lines
  const links: { from: ConceptNode; to: ConceptNode }[] = [];
  nodes.forEach(node => {
    node.dependencies.forEach(depId => {
      const parent = nodes.find(n => n.id === depId);
      if (parent) {
        links.push({ from: parent, to: node });
      }
    });
  });

  return (
    <EducationalChartCard
      title="Interconnected Concept Relationship Graph"
      subtitle="Visualizing prerequisite lineages, downstream dependencies, and curricular synthesis"
      badge="Educational Example"
      category="CURRICULUM ARCHITECTURE"
      units="Topological Knowledge Graph"
      whatAmILookingAt="An interactive network graph showing how concepts flow into one another. Market foundations (Auction Theory) branch into Order Flow and Spreads, which then converge to power Market Structure and Fixed Fractional Risk, ultimately synthesizing into the Holy Grail of trading: Positive Mathematical Expectancy (EV)."
      whyItMatters="Trading concepts are not isolated silos. You cannot master Position Sizing without understanding Stop Loss Invalidation, and you cannot master Invalidation without understanding Market Structure."
      commonMistake="Attempting to jump straight into algorithmic execution or quantitative expectancy without understanding resting liquidity and bid/ask mechanics."
      metrics={[
        { label: 'Selected Node', value: activeNode.title, color: 'text-blue-600 dark:text-blue-400', subtext: activeNode.category },
        { label: 'Prerequisites', value: `${activeNode.dependencies.length} Upstream Nodes`, subtext: 'Required Lineage' },
        { label: 'Downstream Links', value: `${nodes.filter(n => n.dependencies.includes(activeNode.id)).length} Dependents`, subtext: 'Concepts Unlocked' },
        { label: 'Total Network', value: `${nodes.length} Nodes / ${links.length} Edges`, subtext: 'Domain Connectivity' }
      ]}
      controls={
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0 mr-1">Inspect Node:</span>
          {nodes.map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedNodeId === n.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {n.title}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* SVG Network Graph Stage */}
        <div className="w-full aspect-[2.4/1] relative bg-slate-900 rounded-2xl border border-slate-800 p-2 overflow-hidden shadow-inner flex items-center justify-center">
          <svg viewBox="0 0 540 220" className="w-full h-full">
            {/* Connecting Edges */}
            {links.map((link, idx) => {
              const isHighlighted = link.to.id === activeNode.id || link.from.id === activeNode.id;
              return (
                <line
                  key={idx}
                  x1={link.from.x}
                  y1={link.from.y}
                  x2={link.to.x}
                  y2={link.to.y}
                  stroke={isHighlighted ? '#3b82f6' : '#334155'}
                  strokeWidth={isHighlighted ? '2.5' : '1.5'}
                  strokeDasharray={isHighlighted ? undefined : '3 3'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = node.id === activeNode.id;
              const isPrereq = activeNode.dependencies.includes(node.id);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className="cursor-pointer transition-all duration-200 group"
                >
                  {/* Outer Glow Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '22' : '16'}
                    fill={isSelected ? '#3b82f6' : isPrereq ? '#10b981' : '#1e293b'}
                    fillOpacity={isSelected ? '0.3' : '0.2'}
                    className="transition-all duration-300"
                  />

                  {/* Core Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? '12' : '9'}
                    fill={isSelected ? '#3b82f6' : isPrereq ? '#10b981' : '#475569'}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />

                  {/* Node Label Text */}
                  <text
                    x={node.x}
                    y={node.y > 110 ? node.y + 22 : node.y - 18}
                    textAnchor="middle"
                    fill={isSelected ? '#60a5fa' : isPrereq ? '#34d399' : '#94a3b8'}
                    fontSize="9.5"
                    fontWeight="bold"
                    className="select-none"
                  >
                    {node.title}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
              {activeNode.category} Node
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              ID: {activeNode.id}
            </span>
          </div>
          <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
            {activeNode.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {activeNode.description}
          </p>

          {activeNode.dependencies.length > 0 && (
            <div className="pt-2 flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-400">Required Prerequisites:</span>
              <div className="flex flex-wrap gap-1">
                {activeNode.dependencies.map(dep => (
                  <span
                    key={dep}
                    onClick={() => setSelectedNodeId(dep)}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 cursor-pointer hover:bg-emerald-100"
                  >
                    {nodes.find(n => n.id === dep)?.title || dep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </EducationalChartCard>
  );
};
