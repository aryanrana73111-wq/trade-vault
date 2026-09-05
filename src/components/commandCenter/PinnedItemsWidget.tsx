import React from 'react';
import { 
  Pin, 
  Trash2, 
  ArrowRight, 
  ExternalLink,
  Target,
  FileText,
  BookOpenCheck,
  Lightbulb,
  Sparkles,
  Info
} from 'lucide-react';
import { PinnedItem, PinnedItemType } from '@/types/commandCenter';
import { useNavigate } from 'react-router-dom';

interface PinnedItemsWidgetProps {
  pinnedItems: PinnedItem[];
  onRemovePin: (pinId: string) => void;
  onClearAllPins?: () => void;
}

export const PinnedItemsWidget: React.FC<PinnedItemsWidgetProps> = ({
  pinnedItems,
  onRemovePin,
  onClearAllPins
}) => {
  const navigate = useNavigate();

  const getItemIcon = (type: PinnedItemType) => {
    switch (type) {
      case 'trade':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'strategy':
        return <Target className="w-4 h-4 text-emerald-500" />;
      case 'learning':
        return <BookOpenCheck className="w-4 h-4 text-amber-500" />;
      case 'rule':
        return <BookOpenCheck className="w-4 h-4 text-indigo-500" />;
      case 'hypothesis':
        return <Lightbulb className="w-4 h-4 text-purple-500" />;
      case 'ai_insight':
        return <Sparkles className="w-4 h-4 text-cyan-500" />;
      default:
        return <Pin className="w-4 h-4 text-slate-400" />;
    }
  };

  const getItemBadge = (type: PinnedItemType) => {
    switch (type) {
      case 'trade':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
      case 'strategy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'learning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'rule':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
      case 'hypothesis':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
      case 'ai_insight':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Pin className="w-5 h-5 fill-blue-600 dark:fill-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Pinned Workspace Items
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {pinnedItems.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Quick-access records pinned for observation. Removing a pin never modifies or deletes the underlying trade or strategy.
            </p>
          </div>
        </div>

        {pinnedItems.length > 0 && onClearAllPins && (
          <button
            onClick={onClearAllPins}
            className="text-xs text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
          >
            Clear All Pins
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-3">
        {pinnedItems.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <Pin className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              No items currently pinned.
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Pin Attention items, strategies, trades, or rules to keep them front-and-center in your Command Center.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedItems.map(item => (
              <div
                key={item.id}
                className="group relative p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getItemBadge(item.type)}`}>
                      {item.badge || item.type}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePin(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                      title="Remove pin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Pinned {new Date(item.pinnedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => navigate(item.route)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <span>View Record</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
