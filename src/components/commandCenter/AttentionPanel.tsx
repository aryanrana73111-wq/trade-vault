import React, { useState } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ExternalLink,
  ShieldAlert,
  Brain,
  Target,
  BookOpenCheck,
  Zap,
  Pin,
  CheckCircle2
} from 'lucide-react';
import { AttentionItem } from '@/types/commandCenter';

interface AttentionPanelProps {
  items: AttentionItem[];
  onInvestigate: (item: AttentionItem) => void;
  onPinItem?: (item: AttentionItem) => void;
  isPinned?: (recordId: string) => boolean;
}

export const AttentionPanel: React.FC<AttentionPanelProps> = ({
  items,
  onInvestigate,
  onPinItem,
  isPinned = (_id: string) => false,
}) => {
  const [expandedWhyIds, setExpandedWhyIds] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const toggleWhy = (id: string) => {
    setExpandedWhyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'risk':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'psychology':
      case 'behavior':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'strategy':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'rules':
        return <BookOpenCheck className="w-4 h-4 text-emerald-500" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-indigo-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSeverityBadge = (severity: 'critical' | 'warning' | 'notice') => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3" /> Critical Attention
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" /> Cautionary Observation
          </span>
        );
      case 'notice':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Info className="w-3 h-3" /> Behavioral Notice
          </span>
        );
    }
  };

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(i => i.category === filterCategory);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                What Needs My Attention
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated behavioral, risk, and discipline observations grounded in your recorded journal data.
            </p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {['all', 'risk', 'psychology', 'strategy', 'rules', 'behavior'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize whitespace-nowrap transition-colors ${
                filterCategory === cat
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Attention Flags in This Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Your recorded trades currently meet configured risk limits, rule adherence standards, and psychology completion targets.
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedWhyIds[item.id];
            const pinned = isPinned(item.id);

            return (
              <div 
                key={item.id} 
                className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 break-words">
                          {item.title}
                        </h3>
                        {getSeverityBadge(item.severity)}
                        {item.sampleSize !== undefined && (
                          <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium shrink-0">
                            Sample: {item.sampleSize} trades
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 break-words leading-relaxed">
                        {item.explanation}
                      </p>

                      {/* Comparison Metric if available */}
                      {item.metricComparison && (
                        <div className="mt-2 inline-flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs max-w-full">
                          <span className="text-slate-500 dark:text-slate-400 truncate">{item.metricComparison.metricName}:</span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{item.metricComparison.currentValue}</span>
                          <span className="text-slate-400">vs</span>
                          <span className="text-slate-500 dark:text-slate-400">{item.metricComparison.baselineValue}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    {onPinItem && (
                      <button
                        onClick={() => onPinItem(item)}
                        className={`p-2 rounded-lg text-xs font-medium border transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer ${
                          pinned
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-300'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title={pinned ? 'Pinned in Command Center' : 'Pin to Command Center'}
                      >
                        <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-blue-600 dark:fill-blue-400' : ''}`} />
                      </button>
                    )}

                    <button
                      onClick={() => onInvestigate(item)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer min-h-[36px]"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Why am I seeing this? (Attention Item Transparency) */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    onClick={() => toggleWhy(item.id)}
                    className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium focus:outline-hidden cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why am I seeing this?</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Mathematical & Evidence Breakdown:
                      </div>
                      <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                        {item.whyText}
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 pt-1 min-w-0">
                        <span className="text-[10px] sm:text-[11px] text-slate-400">
                          Based on {(item.tradeIds || []).length} underlying trade record{(item.tradeIds || []).length === 1 ? '' : 's'}.
                        </span>
                        <button
                          onClick={() => onInvestigate(item)}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          View Underlying Trades →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
