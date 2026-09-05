import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trade, LearningCategory, LearningEntry } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn, dedupById } from '@/lib/utils';
import { 
  Calendar, 
  Tag as TagIcon, 
  Link2, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles, 
  BookmarkCheck,
  ChevronDown
} from 'lucide-react';

const CATEGORIES: LearningCategory[] = [
  'Risk Management',
  'Strategy',
  'Psychology',
  'Execution',
  'Market Structure',
  'Technical Analysis',
  'Fundamental',
  'Mistake',
  'General',
];

interface TodayLearningFormProps {
  trades: Trade[];
  onSave: (learning: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'>) => Promise<any>;
}

export const TodayLearningForm: React.FC<TodayLearningFormProps> = ({ trades, onSave }) => {
  const [dateString, setDateString] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<LearningCategory>('General');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAddTag = (tagToAdd?: string) => {
    const val = (tagToAdd || tagInput).trim().replace(/^#/, '');
    if (!val) return;
    if (!tags.includes(val)) {
      setTags([...tags, val]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleKeyDownTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!content.trim()) {
      setStatusMessage({ type: 'error', text: 'Please write what you learned today.' });
      return;
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatusMessage({
        type: 'error',
        text: 'You are currently offline. Please reconnect to the internet to save this learning record.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Parse date to timestamp
      const [year, month, day] = dateString.split('-').map(Number);
      const dateTimestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();

      const selectedTrade = trades.find((t) => t.id === selectedTradeId);

      const payload: Omit<LearningEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'dashboardId'> = {
        date: dateTimestamp,
        dateString,
        content: content.trim(),
        category,
        tags,
        relatedTradeId: selectedTradeId || undefined,
        relatedTradeSnapshot: selectedTrade
          ? {
              market: selectedTrade.market,
              direction: selectedTrade.direction,
              date: selectedTrade.date,
              pnl: selectedTrade.pnl,
              result: selectedTrade.result,
            }
          : undefined,
      };

      await onSave(payload);

      // Reset form
      setContent('');
      setCategory('General');
      setTags([]);
      setSelectedTradeId('');
      setDateString(format(new Date(), 'yyyy-MM-dd'));
      setStatusMessage({ type: 'success', text: 'Daily learning saved successfully!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to save learning:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save learning. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTrade = trades.find((t) => t.id === selectedTradeId);

  return (
    <Card className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Step 1: Date Field */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Step 1 · Date
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Journal Entry Date
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {dateString !== format(new Date(), 'yyyy-MM-dd') && (
              <button
                type="button"
                onClick={() => setDateString(format(new Date(), 'yyyy-MM-dd'))}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-1"
              >
                Set Today
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Learning Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
              What did you learn today? <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Step 2 · Core Insight
            </span>
          </div>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Document key market takeaways, execution slip-ups, emotional triggers, or tactical lessons observed today..."
            className="w-full p-3.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-y"
          />
        </div>

        {/* Step 3 & 4: Category & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Step 3: Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 3 · Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LearningCategory)}
                className="w-full appearance-none px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Step 4: Tags */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 4 · Tags (Optional)
            </label>
            <div className="relative">
              <TagIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Press Enter or comma to add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDownTag}
                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Display Added Tags & Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span>Quick tags:</span>
              {['Discipline', 'StopLoss', 'FOMO', 'Breakout', 'Risk', 'Patience'].map((quickTag) => (
                <button
                  key={quickTag}
                  type="button"
                  onClick={() => handleAddTag(quickTag)}
                  className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  +{quickTag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 5: Optional Related Trade Selector */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Step 5 · Related Trade (Optional)
            </label>
            {selectedTrade && (
              <button
                type="button"
                onClick={() => setSelectedTradeId('')}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Unlink Trade
              </button>
            )}
          </div>
          <div className="relative">
            <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedTradeId}
              onChange={(e) => setSelectedTradeId(e.target.value)}
              className="w-full appearance-none pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None (Independent Learning Entry)</option>
              {dedupById(trades)
                .slice()
                .sort((a, b) => b.date - a.date)
                .map((trade) => {
                  const pnlStr = trade.pnl !== undefined ? ` · ${trade.pnl >= 0 ? '+' : ''}${formatCurrency(trade.pnl)}` : '';
                  const dirStr = trade.direction ? `[${trade.direction}] ` : '';
                  const resultStr = trade.result ? ` (${trade.result})` : '';
                  const dateStr = format(new Date(trade.date), 'MMM dd');
                  return (
                    <option key={trade.id} value={trade.id}>
                      {dateStr} — {dirStr}{trade.market}{pnlStr}{resultStr} (Trade #{trade.id.slice(-6)})
                    </option>
                  );
                })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          {selectedTrade && (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className={cn("px-1.5 py-0.5 rounded font-bold text-[10px]", selectedTrade.direction === 'BUY' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300")}>
                  {selectedTrade.direction}
                </span>
                <span className="font-semibold">{selectedTrade.market}</span>
                <span className="text-slate-400">·</span>
                <span>Trade #{selectedTrade.id.slice(-6)}</span>
              </div>
              <span className={cn("font-medium", (selectedTrade.pnl || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                {selectedTrade.pnl !== undefined ? `${(selectedTrade.pnl || 0) >= 0 ? '+' : ''}${formatCurrency(selectedTrade.pnl || 0)}` : (selectedTrade.result || 'Pending')}
              </span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={cn(
              "p-3 rounded-lg text-xs flex items-center gap-2",
              statusMessage.type === 'success'
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            )}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Step 6: Save Action */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Does not create a trade automatically.
          </p>
          <Button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="min-w-[140px]"
          >
            <BookmarkCheck className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Saving...' : 'Save Learning'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
