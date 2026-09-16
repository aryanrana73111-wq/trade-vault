import React, { useState } from 'react';
import { NEWS_KNOWLEDGE_NODES } from '@/data/newsIntelligenceData';
import { NewsKnowledgeNode } from '@/types/newsIntelligence';
import { 
  Network, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  ExternalLink, 
  BookOpen, 
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface KnowledgeMapViewProps {
  onOpenAcademy?: (articleId: string) => void;
  onOpenCalendar?: () => void;
}

export function KnowledgeMapView({
  onOpenAcademy,
  onOpenCalendar
}: KnowledgeMapViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('cpi');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const selectedNode = NEWS_KNOWLEDGE_NODES.find(n => n.id === selectedNodeId) || NEWS_KNOWLEDGE_NODES[0];

  const categories = ['ALL', 'Indicator', 'Policy', 'Driver', 'Asset'];

  const filteredNodes = NEWS_KNOWLEDGE_NODES.filter(n => {
    if (filterCategory !== 'ALL' && n.category !== filterCategory) return false;
    return true;
  });

  const upstreamNodes = NEWS_KNOWLEDGE_NODES.filter(n => (selectedNode?.upstreamIds || selectedNode?.inputs || []).includes(n.id));
  const downstreamNodes = NEWS_KNOWLEDGE_NODES.filter(n => (selectedNode?.downstreamIds || selectedNode?.outputs || []).includes(n.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-900 text-white rounded-3xl border border-cyan-900/40 shadow-md">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-cyan-600/30 text-cyan-400 border border-cyan-500/30">
              <Network className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Interconnected Macro Ecosystem</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Macro News Knowledge & Transmission Map
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Understand how economic indicators, central bank rate mandates, treasury yields, and currency valuations feed into one another across the global financial system.
          </p>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Explorer List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Macro Entities</h3>
            <div className="flex gap-1 text-[11px]">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                    filterCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredNodes.map(node => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedNodeId === node.id
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{node.name}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {node.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">{node.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Node Detail & Flow Analysis */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {selectedNode.category} Node
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>
            </div>

            {/* Upstream & Downstream Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Upstream Inputs */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <ArrowLeft className="w-4 h-4 text-blue-500" />
                  <span>Upstream Inputs & Catalysts ({upstreamNodes.length})</span>
                </div>
                {upstreamNodes.length > 0 ? (
                  <div className="space-y-2">
                    {upstreamNodes.map(up => (
                      <div
                        key={up.id}
                        onClick={() => setSelectedNodeId(up.id)}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block">{up.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{up.description}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Primary root economic driver</p>
                )}
              </div>

              {/* Downstream Outputs */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <span>Downstream Impact & Transmission ({downstreamNodes.length})</span>
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </div>
                {downstreamNodes.length > 0 ? (
                  <div className="space-y-2">
                    {downstreamNodes.map(down => (
                      <div
                        key={down.id}
                        onClick={() => setSelectedNodeId(down.id)}
                        className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:border-emerald-400 transition-colors"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block">{down.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{down.description}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Terminal price asset</p>
                )}
              </div>
            </div>
          </div>

          {/* Direct Educational Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            {onOpenAcademy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenAcademy(selectedNode.id === 'cpi' ? 'lesson-cpi' : selectedNode.id === 'fomc' ? 'lesson-fomc' : 'lesson-nfp')}
                className="text-xs gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Learn in Academy
              </Button>
            )}
            {onOpenCalendar && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenCalendar}
                className="text-xs gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> View Related Calendar Releases
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
