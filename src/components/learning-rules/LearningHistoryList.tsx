import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Trade, LearningEntry, LearningCategory } from '@/types';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency, cn, dedupById } from '@/lib/utils';
import {
  Search,
  Filter,
  Calendar,
  Tag as TagIcon,
  Link2,
  Edit2,
  Trash2,
  BookMarked,
  ArrowUpDown,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldPlus,
  BookOpen
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'Risk Management': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  'Strategy': 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'Psychology': 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'Execution': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  'Market Structure': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  'Technical Analysis': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  'Fundamental': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  'Mistake': 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800',
  'General': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

interface LearningHistoryListProps {
  learnings: LearningEntry[];
  trades: Trade[];
  onUpdate: (id: string, updates: Partial<LearningEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onConvertToRule: (learning: LearningEntry) => void;
  onFocusForm?: () => void;
}

export const LearningHistoryList: React.FC<LearningHistoryListProps> = ({
  learnings,
  trades,
  onUpdate,
  onDelete,
  onConvertToRule,
  onFocusForm,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedMarket, setSelectedMarket] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'Today' | '7Days' | '30Days'>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modals state
  const [editingItem, setEditingItem] = useState<LearningEntry | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Edit form state
  const [editContent, setEditContent] = useState<string>('');
  const [editCategory, setEditCategory] = useState<LearningCategory>('General');
  const [editDateString, setEditDateString] = useState<string>('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState<string>('');
  const [editRelatedTradeId, setEditRelatedTradeId] = useState<string>('');

  // Collect unique learnings defensively
  const uniqueLearnings = useMemo(() => {
    return dedupById(learnings);
  }, [learnings]);

  // Collect unique tags and markets
  const allTags = useMemo(() => {
    const set = new Set<string>();
    uniqueLearnings.forEach((l) => l.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [uniqueLearnings]);

  const allMarkets = useMemo(() => {
    const set = new Set<string>();
    uniqueLearnings.forEach((l) => {
      if (l.relatedTradeId) {
        const trade = trades.find((t) => t.id === l.relatedTradeId);
        if (trade?.market) set.add(trade.market);
        else if (l.relatedTradeSnapshot?.market) set.add(l.relatedTradeSnapshot.market);
      }
    });
    return Array.from(set).sort();
  }, [uniqueLearnings, trades]);

  // Filtering
  const filteredLearnings = useMemo(() => {
    return uniqueLearnings.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const contentMatch = item.content.toLowerCase().includes(query);
        const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(query));
        const catMatch = item.category.toLowerCase().includes(query);
        const tradeMatch = item.relatedTradeSnapshot?.market?.toLowerCase().includes(query);
        if (!contentMatch && !tagMatch && !catMatch && !tradeMatch) return false;
      }

      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Tag
      if (selectedTag !== 'All' && !item.tags?.includes(selectedTag)) {
        return false;
      }

      // Market
      if (selectedMarket !== 'All') {
        const trade = trades.find((t) => t.id === item.relatedTradeId);
        const market = trade?.market || item.relatedTradeSnapshot?.market;
        if (market !== selectedMarket) return false;
      }

      // Date
      if (dateFilter === 'Today') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (item.dateString !== todayStr) return false;
      } else if (dateFilter === '7Days') {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        if ((item.date || item.createdAt) < weekAgo) return false;
      } else if (dateFilter === '30Days') {
        const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        if ((item.date || item.createdAt) < monthAgo) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = a.date || a.createdAt;
      const timeB = b.date || b.createdAt;
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [learnings, trades, searchQuery, selectedCategory, selectedTag, selectedMarket, dateFilter, sortOrder]);

  // Paginated records
  const totalPages = Math.ceil(filteredLearnings.length / itemsPerPage) || 1;
  const paginatedLearnings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLearnings.slice(start, start + itemsPerPage);
  }, [filteredLearnings, currentPage, itemsPerPage]);

  const handleStartEdit = (item: LearningEntry) => {
    setEditingItem(item);
    setEditContent(item.content);
    setEditCategory(item.category);
    setEditDateString(item.dateString || format(new Date(item.date || item.createdAt), 'yyyy-MM-dd'));
    setEditTags(item.tags || []);
    setEditRelatedTradeId(item.relatedTradeId || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editContent.trim()) return;
    try {
      const [year, month, day] = editDateString.split('-').map(Number);
      const dateTimestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();
      const trade = trades.find((t) => t.id === editRelatedTradeId);

      await onUpdate(editingItem.id, {
        content: editContent.trim(),
        category: editCategory,
        date: dateTimestamp,
        dateString: editDateString,
        tags: editTags,
        relatedTradeId: editRelatedTradeId || undefined,
        relatedTradeSnapshot: trade
          ? {
              market: trade.market,
              direction: trade.direction,
              date: trade.date,
              pnl: trade.pnl,
              result: trade.result,
            }
          : undefined,
      });
      setEditingItem(null);
    } catch (err) {
      console.error('Failed to update learning:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmationId) return;
    try {
      setIsDeleting(true);
      await onDelete(deleteConfirmationId);
      setDeleteConfirmationId(null);
    } catch (err) {
      console.error('Failed to delete learning:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search learning notes, tags, markets..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {[
                'Risk Management',
                'Strategy',
                'Psychology',
                'Execution',
                'Market Structure',
                'Technical Analysis',
                'Fundamental',
                'Mistake',
                'General',
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            )}

            {/* Related Market Filter */}
            {allMarkets.length > 0 && (
              <select
                value={selectedMarket}
                onChange={(e) => {
                  setSelectedMarket(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Markets</option>
                {allMarkets.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            )}

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Time</option>
              <option value="Today">Today Only</option>
              <option value="7Days">Last 7 Days</option>
              <option value="30Days">Last 30 Days</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="p-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1"
              title={sortOrder === 'newest' ? 'Showing newest first' : 'Showing oldest first'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </span>
            </button>
          </div>
        </div>
      </Card>

      {/* History Items or Empty State */}
      {paginatedLearnings.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            {searchQuery || selectedCategory !== 'All' || selectedTag !== 'All' || dateFilter !== 'All'
              ? 'No matching learnings found.'
              : 'No learning recorded yet.'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            {searchQuery || selectedCategory !== 'All' || selectedTag !== 'All' || dateFilter !== 'All'
              ? 'Try adjusting your search keywords or clearing active filters to view past journal lessons.'
              : 'Consistent recording of your real market realizations turns trading experience into long-term edge.'}
          </p>
          {onFocusForm && !searchQuery && selectedCategory === 'All' && (
            <Button size="sm" onClick={onFocusForm}>
              Add Your First Learning
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedLearnings.map((item) => {
            const trade = trades.find((t) => t.id === item.relatedTradeId);
            const isTradeDeleted = item.relatedTradeId && !trade;

            return (
              <Card
                key={item.id}
                className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  {/* Category & Date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium border",
                        CATEGORY_COLORS[item.category] || CATEGORY_COLORS['General']
                      )}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {item.dateString
                        ? format(new Date(item.dateString + 'T12:00:00'), 'MMM dd, yyyy')
                        : format(new Date(item.date || item.createdAt), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {/* Actions: Convert to Rule, Edit, Delete */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => onConvertToRule(item)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1"
                      title="Convert this learning into a permanent rule"
                    >
                      <ShieldPlus className="w-3.5 h-3.5" />
                      <span>Convert to Rule</span>
                    </button>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Learning"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmationId(item.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete Learning"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed mb-3">
                  {item.content}
                </p>

                {/* Footer: Tags & Related Trade */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          #{t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">No tags</span>
                    )}
                  </div>

                  {/* Related Trade Link */}
                  {item.relatedTradeId && (
                    <div className="flex items-center gap-1 text-[11px]">
                      <Link2 className="w-3.5 h-3.5 text-slate-400" />
                      {trade ? (
                        <span className="text-slate-600 dark:text-slate-300">
                          Related Trade:{' '}
                          <strong className="font-semibold text-slate-900 dark:text-slate-100">
                            {trade.market}
                          </strong>{' '}
                          — Trade #{trade.id.slice(-6)} ({trade.direction}){' '}
                          {trade.pnl !== undefined && (
                            <span
                              className={
                                trade.pnl >= 0
                                  ? 'text-emerald-600 font-medium'
                                  : 'text-rose-600 font-medium'
                              }
                            >
                              · {trade.pnl >= 0 ? '+' : ''}
                              {formatCurrency(trade.pnl)}
                            </span>
                          )}
                        </span>
                      ) : isTradeDeleted ? (
                        <span className="text-slate-400 dark:text-slate-500 italic">
                          Trade no longer available (Trade #{item.relatedTradeId.slice(-6)})
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredLearnings.length)} of{' '}
                {filteredLearnings.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Edit Learning Entry
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={editDateString}
                    onChange={(e) => setEditDateString(e.target.value)}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as LearningCategory)}
                    className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[
                      'Risk Management',
                      'Strategy',
                      'Psychology',
                      'Execution',
                      'Market Structure',
                      'Technical Analysis',
                      'Fundamental',
                      'Mistake',
                      'General',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  What did you learn?
                </label>
                <textarea
                  rows={4}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                />
              </div>

              {/* Related Trade */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Related Trade
                </label>
                <select
                  value={editRelatedTradeId}
                  onChange={(e) => setEditRelatedTradeId(e.target.value)}
                  className="w-full p-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {dedupById(trades).map((t) => (
                    <option key={t.id} value={t.id}>
                      {format(new Date(t.date), 'MMM dd')} · [{t.direction}] {t.market} (Trade #{t.id.slice(-6)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={!editContent.trim()}>
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-full bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Permanently Delete Learning?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This action will permanently delete this learning entry from Firestore. It cannot be recovered and will not reappear after logout or page refresh.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmationId(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
