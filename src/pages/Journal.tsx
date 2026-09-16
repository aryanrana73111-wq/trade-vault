import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trade, Strategy } from '@/types';
import { Card, Input, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Check, 
  X, 
  ArrowRight, 
  GraduationCap, 
  Bot, 
  Calculator, 
  ShieldAlert, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  Plus, 
  CheckCircle2, 
  BookOpenCheck,
  Newspaper,
  Edit3,
  Eye,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { SafeDeleteModal } from '@/components/SafeDeleteModal';
import { TradeEditModal } from '@/components/journal/TradeEditModal';
import { TradeDetailModal } from '@/components/journal/TradeDetailModal';
import { CompletionReminderModal } from '@/components/journal/CompletionReminderModal';
import { MissingDataBanner } from '@/components/journal/MissingDataBanner';
import { MissingInfoPopover } from '@/components/journal/MissingInfoPopover';
import { getTradeCompleteness } from '@/lib/tradeCompleteness';

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export default function Journal() {
  const [searchParams] = useSearchParams();
  const initialStrategy = searchParams.get('strategy') || '';
  const navigate = useNavigate();
  const { activeDashboard } = useAuth();
  
  const { 
    trades: rawTrades, 
    strategies, 
    updateTrade, 
    deleteTrade, 
    deleteMultipleTrades, 
    deleteAllTradeData 
  } = useData();

  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialStrategy);
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [filterSetupQuality, setFilterSetupQuality] = useState<string>('ALL');
  const [filterDataStatus, setFilterDataStatus] = useState<'ALL' | 'COMPLETE' | 'MISSING' | 'NEEDS_REVIEW' | 'PARTIAL'>('ALL');
  const [filterMacroCatalyst, setFilterMacroCatalyst] = useState<'ALL' | 'NEWS_ONLY' | 'NO_NEWS'>('ALL');

  // Trade Edit & Detail modal state
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [detailTrade, setDetailTrade] = useState<Trade | null>(null);
  const [reminderTrade, setReminderTrade] = useState<Trade | null>(null);

  // Multi-selection state
  const [selectedTradeIds, setSelectedTradeIds] = useState<string[]>([]);

  // Deletion modals state
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notification / Toast
  const [notification, setNotification] = useState<NotificationState | null>(null);

  useEffect(() => {
    const seen = new Set<string>();
    const unique = rawTrades.filter(t => {
      if (!t?.id || seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    setTrades(unique.sort((a, b) => b.date - a.date));

    // Cleanup selected IDs that no longer exist
    setSelectedTradeIds(prev => prev.filter(id => unique.some(t => t.id === id)));
  }, [rawTrades]);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const filteredTrades = trades.filter(t => {
    const strategyObj = strategies.find(s => s.id === t.strategy);
    const strategyName = strategyObj ? strategyObj.name : t.strategy;
    
    const matchesSearch = (t.market || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (strategyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDirection = filterDirection === 'ALL' || t.direction === filterDirection;
    const matchesSetupQuality = filterSetupQuality === 'ALL' || t.setupQuality === filterSetupQuality;

    let matchesDataStatus = true;
    if (filterDataStatus !== 'ALL') {
      const completeness = getTradeCompleteness(t);
      if (filterDataStatus === 'COMPLETE') {
        matchesDataStatus = completeness.status === 'Complete';
      } else if (filterDataStatus === 'MISSING') {
        matchesDataStatus = completeness.status !== 'Complete';
      } else if (filterDataStatus === 'NEEDS_REVIEW') {
        matchesDataStatus = completeness.status === 'Needs Review';
      } else if (filterDataStatus === 'PARTIAL') {
        matchesDataStatus = completeness.status === 'Partially Complete';
      }
    }

    let matchesMacro = true;
    const hasNews = Boolean(t.newsEventId || t.newsEventName);
    if (filterMacroCatalyst === 'NEWS_ONLY') {
      matchesMacro = hasNews;
    } else if (filterMacroCatalyst === 'NO_NEWS') {
      matchesMacro = !hasNews;
    }

    return matchesSearch && matchesDirection && matchesSetupQuality && matchesDataStatus && matchesMacro;
  });

  const handleUpdateResult = (id: string, result: 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING') => {
    const trade = trades.find(t => t.id === id);
    if (trade) {
      let pnl = 0;
      if (result === 'WIN') {
        const risk = trade.risk || 0;
        const rr = trade.rrRatio || 0;
        pnl = risk * rr;
      } else if (result === 'LOSS') {
        pnl = -(trade.risk || 0);
      } else if (result === 'PENDING') {
        pnl = 0;
      }
      const rMultiple = result === 'PENDING' ? undefined : (trade.risk && trade.risk > 0 ? pnl / trade.risk : undefined);
      updateTrade(id, { result, pnl: result === 'PENDING' ? undefined : pnl, rMultiple });
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedTradeIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredTrades.map(t => t.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedTradeIds.includes(id));
    if (areAllSelected) {
      setSelectedTradeIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedTradeIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // Single delete execution
  const handleConfirmSingleDelete = async () => {
    if (!tradeToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTrade(tradeToDelete.id);
      setSelectedTradeIds(prev => prev.filter(id => id !== tradeToDelete.id));
      setNotification({
        type: 'success',
        message: `Trade for ${tradeToDelete.market} (${tradeToDelete.direction}) deleted from journal.`
      });
      setTradeToDelete(null);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete trade. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete execution
  const handleConfirmBulkDelete = async () => {
    if (selectedTradeIds.length === 0) return;
    setIsDeleting(true);
    const count = selectedTradeIds.length;
    try {
      await deleteMultipleTrades(selectedTradeIds);
      setSelectedTradeIds([]);
      setBulkDeleteModalOpen(false);
      setNotification({
        type: 'success',
        message: `Successfully deleted ${count} selected trade${count > 1 ? 's' : ''} from journal.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete selected trades. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const areAllFilteredSelected = filteredTrades.length > 0 && 
    filteredTrades.every(t => selectedTradeIds.includes(t.id));

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Trade Journal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review, manage, and audit your logged trades.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => navigate('/add')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Log Trade
          </Button>

          {trades.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setClearAllModalOpen(true)}
              className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-900/50"
              title="Delete all trade journal records for active dashboard"
            >
              <Trash2 className="w-4 h-4" /> Clear Journal
            </Button>
          )}
        </div>
      </div>

      {/* Floating Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              "p-4 rounded-xl border flex items-center justify-between shadow-sm",
              notification.type === 'success' 
                ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200" 
                : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200"
            )}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Missing Data & Completeness Status Banner */}
      <MissingDataBanner
        trades={trades}
        onSelectFilter={(filterId) => {
          if (filterId === 'incomplete') setFilterDataStatus('MISSING');
          else if (filterId === 'needs-review') setFilterDataStatus('NEEDS_REVIEW');
          else if (filterId === 'complete') setFilterDataStatus('COMPLETE');
          else setFilterDataStatus('ALL');
        }}
        activeFilter={filterDataStatus === 'MISSING' ? 'incomplete' : filterDataStatus === 'NEEDS_REVIEW' ? 'needs-review' : filterDataStatus === 'COMPLETE' ? 'complete' : undefined}
      />

      {/* Search and Filters Card */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search market or strategy..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Data Status Filter */}
          <select 
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDataStatus}
            onChange={(e) => setFilterDataStatus(e.target.value as any)}
            title="Filter by Data Completion Status"
          >
            <option value="ALL">All Completeness (100%)</option>
            <option value="COMPLETE">✓ Complete Trades Only</option>
            <option value="MISSING">● Trades with Missing Data</option>
            <option value="NEEDS_REVIEW">▲ Needs Review</option>
            <option value="PARTIAL">● Partially Complete</option>
          </select>

          {/* Setup Quality Filter */}
          <select 
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterSetupQuality}
            onChange={(e) => setFilterSetupQuality(e.target.value)}
          >
            <option value="ALL">All Qualities</option>
            <option value="A+">A+ Setups</option>
            <option value="B">B Setups</option>
            <option value="C">C Setups</option>
          </select>

          {/* Direction Filter */}
          <select 
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
          >
            <option value="ALL">All Directions</option>
            <option value="BUY">BUY / Long</option>
            <option value="SELL">SELL / Short</option>
          </select>

          {/* Macro Catalyst Filter */}
          <select 
            className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterMacroCatalyst}
            onChange={(e) => setFilterMacroCatalyst(e.target.value as any)}
            title="Filter by Macro Economic Catalyst"
          >
            <option value="ALL">All Macro Contexts</option>
            <option value="NEWS_ONLY">⚡ Linked News Catalyst Only</option>
            <option value="NO_NEWS">Standard Sessions (No News)</option>
          </select>
        </div>
      </Card>

      {/* Multi-Selection Control Bar */}
      {filteredTrades.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1 text-sm bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={areAllFilteredSelected}
                onChange={handleSelectAllFiltered}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span>Select All ({filteredTrades.length} displayed)</span>
            </label>
            {selectedTradeIds.length > 0 && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                • {selectedTradeIds.length} trade{selectedTradeIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedTradeIds.length > 0 && (
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedTradeIds([])}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline cursor-pointer"
              >
                Deselect
              </button>
              <Button
                size="sm"
                onClick={() => setBulkDeleteModalOpen(true)}
                className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected ({selectedTradeIds.length})
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Trades List or Empty State */}
      <div className="space-y-4">
        {trades.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed rounded-2xl border-slate-300 dark:border-slate-800"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">Your Trade Journal is Empty</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
              No trades have been recorded yet in this dashboard. Log your trades to track performance, win rate, and execution habits.
            </p>
            <Button onClick={() => navigate('/add')} className="gap-2">
              <Plus className="w-4 h-4" /> Log Your First Trade
            </Button>
          </motion.div>
        ) : filteredTrades.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-center py-12 text-slate-500 border border-dashed rounded-xl border-slate-300 dark:border-slate-800"
          >
            No trades found matching your filters.
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout" initial={true}>
            {filteredTrades.map((trade, index) => (
              <TradeCard 
                key={trade.id} 
                index={index}
                trade={trade} 
                strategies={strategies} 
                isSelected={selectedTradeIds.includes(trade.id)}
                onToggleSelect={() => handleToggleSelect(trade.id)}
                onRequestDelete={() => setTradeToDelete(trade)}
                onUpdateResult={handleUpdateResult} 
                onEdit={() => setEditingTrade(trade)}
                onViewDetails={() => setDetailTrade(trade)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Modal: Single Trade Delete Confirmation */}
      {tradeToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeleting && setTradeToDelete(null)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Delete Trade Record?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to permanently delete this journal entry?
              </p>

              {/* Trade Details Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl mb-4 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Market:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{tradeToDelete.market} ({tradeToDelete.direction})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Date:</span>
                  <span className="text-slate-700 dark:text-slate-300">{format(new Date(tradeToDelete.date), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Result / P&L:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {tradeToDelete.result || 'PENDING'} 
                    {tradeToDelete.pnl !== undefined ? ` • ${tradeToDelete.pnl >= 0 ? '+' : ''}${formatCurrency(tradeToDelete.pnl)}` : ''}
                  </span>
                </div>
                {tradeToDelete.strategy && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Strategy:</span>
                    <span className="text-slate-700 dark:text-slate-300">{tradeToDelete.strategy}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300 mb-5">
                Deleting this trade permanently updates your analytics, win rate, and equity curve calculations. This cannot be undone.
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setTradeToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSingleDelete}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-semibold"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete Trade
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk Delete Confirmation */}
      {bulkDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !isDeleting && setBulkDeleteModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                Delete {selectedTradeIds.length} Selected Trades?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                You are about to permanently delete {selectedTradeIds.length} trade record{selectedTradeIds.length > 1 ? 's' : ''} from your journal.
              </p>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-lg text-xs text-amber-800 dark:text-amber-300 mb-5">
                This will update all performance statistics, win rate, and equity curve calculations for this dashboard. This action cannot be undone.
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setBulkDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmBulkDelete}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white gap-2 font-semibold"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Deleting {selectedTradeIds.length} Trades...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" /> Delete {selectedTradeIds.length} Trades
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Modal: Delete All Trade Data */}
      {clearAllModalOpen && activeDashboard && (
        <SafeDeleteModal
          isOpen={clearAllModalOpen}
          onClose={() => setClearAllModalOpen(false)}
          onConfirm={async () => {
            await deleteAllTradeData();
            setSelectedTradeIds([]);
            setNotification({
              type: 'success',
              message: `All trade records in "${activeDashboard.name}" have been permanently deleted.`
            });
          }}
          title={`Clear All Trade Journal Data`}
          description={`You are about to permanently delete all ${trades.length} recorded trades in "${activeDashboard.name}".`}
          itemsToDelete={[
            `All ${trades.length} trade entries, notes, and screenshots in "${activeDashboard.name}"`,
            `All trade history and performance logs for this dashboard`,
            `Trade-derived win rate, P&L, drawdown, and KPIs for this dashboard`
          ]}
          itemsPreserved={[
            `Strategies in "${activeDashboard.name}" remain saved`,
            `Rules, Learnings, and Academy progress remain intact`,
            `Your other dashboards remain completely unaffected`
          ]}
          expectedConfirmationText="DELETE"
          confirmButtonLabel="Delete All Journal Data"
        />
      )}

      {/* Edit Trade Modal */}
      {editingTrade && (
        <TradeEditModal
          trade={editingTrade}
          isOpen={Boolean(editingTrade)}
          onClose={() => setEditingTrade(null)}
          onSaved={(updatedTrade) => {
            setEditingTrade(null);
            const statusCheck = getTradeCompleteness(updatedTrade);
            if (statusCheck.status !== 'Complete') {
              setReminderTrade(updatedTrade);
            } else {
              setNotification({
                type: 'success',
                message: `Trade ${updatedTrade.market} (${updatedTrade.direction}) updated and 100% complete!`
              });
            }
          }}
        />
      )}

      {/* Trade Detail Modal (Full 9-Section Deep View) */}
      {detailTrade && (
        <TradeDetailModal
          trade={detailTrade}
          isOpen={Boolean(detailTrade)}
          onClose={() => setDetailTrade(null)}
          onEditFullTrade={(t) => {
            setDetailTrade(null);
            setEditingTrade(t);
          }}
        />
      )}

      {/* Post-Save Completion Reminder Modal */}
      {reminderTrade && (
        <CompletionReminderModal
          trade={reminderTrade}
          isOpen={Boolean(reminderTrade)}
          onClose={() => setReminderTrade(null)}
          onCompleteNow={(t) => {
            setReminderTrade(null);
            setEditingTrade(t);
          }}
        />
      )}
    </div>
  );
}

interface TradeCardProps {
  trade: Trade;
  strategies: Strategy[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onRequestDelete: () => void;
  onUpdateResult: (id: string, r: any) => void;
  onEdit: () => void;
  onViewDetails: () => void;
  index?: number;
}

const TradeCard: React.FC<TradeCardProps> = ({ 
  trade, 
  strategies, 
  isSelected,
  onToggleSelect,
  onRequestDelete,
  onUpdateResult,
  onEdit,
  onViewDetails,
  index = 0
}) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const completeness = getTradeCompleteness(trade);
  
  const strategyObj = strategies.find(s => s.id === trade.strategy || s.name === trade.strategy);
  const strategyDisplayName = strategyObj ? strategyObj.name : trade.strategy;

  const handleStrategyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (strategyObj) {
      navigate(`/strategies/${strategyObj.id}`);
    }
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18, ease: 'easeOut' } }}
      transition={{ 
        duration: 0.34, 
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.035, 0.35) 
      }}
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs overflow-hidden transition-shadow duration-200 hover:shadow-md",
        isSelected && "ring-2 ring-blue-500/50 border-blue-300 dark:border-blue-700"
      )}
    >
      <div 
        className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer bg-white dark:bg-slate-900"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-[220px]">
          {/* Checkbox for bulk selection */}
          <div 
            className="p-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              aria-label={`Select trade ${trade.market}`}
            />
          </div>

          <div className={cn(
            "w-1.5 h-12 rounded-full shrink-0",
            trade.direction === 'BUY' ? "bg-green-500" : "bg-red-500"
          )} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 dark:text-slate-100">{trade.market}</span>
              <Badge variant={trade.direction === 'BUY' ? 'success' : 'danger'}>{trade.direction}</Badge>
              {(trade.newsEventName || trade.newsEventId) && (
                <span 
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 flex items-center gap-1"
                  title={`Macro Catalyst: ${trade.newsEventName || 'Linked Event'}`}
                >
                  <Newspaper className="w-2.5 h-2.5" />
                  <span className="max-w-[120px] truncate">{trade.newsEventName || 'Catalyst'}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {format(new Date(trade.date), 'MMM dd, yyyy')} {trade.time ? `• ${trade.time}` : ''}
              </span>
              
              {/* Completeness Status Badge with Interactive Popover */}
              <MissingInfoPopover
                completeness={completeness}
                onCompleteTrade={onEdit}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 flex-1 w-full md:w-auto">
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Entry</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{trade.entry !== undefined ? trade.entry : '-'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Stop Loss</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{trade.stopLoss !== undefined ? trade.stopLoss : '-'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Take Profit</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{trade.takeProfit !== undefined ? trade.takeProfit : '-'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">R:R</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">{trade.rrRatio ? `1 : ${trade.rrRatio}` : '-'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 justify-between w-full md:w-auto mt-4 md:mt-0">
          <div className="text-right min-w-[90px]">
            {trade.result === 'PENDING' ? (
              <div className="text-xs font-semibold text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 px-2.5 py-1 rounded-full border border-yellow-200 dark:border-yellow-900 inline-block">PENDING</div>
            ) : trade.pnl !== undefined ? (
               <div className={cn("font-bold text-base", trade.pnl > 0 ? "text-emerald-600 dark:text-emerald-400" : (trade.pnl < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-500"))}>
                 {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
               </div>
            ) : (
              <div className="text-xs text-slate-400">Result Pending</div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Primary [Edit Trade] Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-8 px-2.5 gap-1 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950/50"
              title="Edit all fields of this trade"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Button>

            {/* Quick [Details] Button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="h-8 px-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="View full trade details"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Details</span>
            </Button>

            {/* Quick delete icon button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestDelete();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete this trade"
              aria-label="Delete trade record"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", expanded && "rotate-180")} />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key={`expanded-content-${trade.id}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-5">
          {/* Quick Actions & Status Strip in Expanded View */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                completeness.status === 'Complete'
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : completeness.status === 'Needs Review'
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              )}>
                {completeness.percentage}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Trade Completeness: {completeness.status}
                  </span>
                  {trade.auditHistory && trade.auditHistory.length > 0 && (
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      {trade.auditHistory.length} edit audit{trade.auditHistory.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {completeness.missingItems.length === 0 
                    ? 'All standard journal fields completed.' 
                    : `Missing: ${completeness.missingItems.map(m => m.label).join(', ')}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails();
                }}
                className="gap-1.5 text-xs font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full Inspection</span>
              </Button>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Trade</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Risk Amount</h4>
                <div className="font-medium text-slate-900 dark:text-slate-100">{trade.risk ? formatCurrency(trade.risk) : '-'}</div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Position Size</h4>
                <div className="font-medium text-slate-900 dark:text-slate-100">{trade.positionSize || '-'}</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Context</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 flex flex-wrap gap-2 mb-2">
                {trade.session && <Badge variant="neutral">{trade.session}</Badge>}
                {trade.timeframe && <Badge variant="neutral">{trade.timeframe}</Badge>}
                {trade.marketCondition && <Badge variant="neutral">{trade.marketCondition}</Badge>}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                {strategyDisplayName ? (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Strategy:</span>
                    {strategyObj ? (
                      <button 
                        onClick={handleStrategyClick}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        {strategyDisplayName} <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="font-medium text-slate-700 dark:text-slate-300">{strategyDisplayName}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-500">No strategy specified.</span>
                )}

                {trade.newsEventName && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-slate-500 flex items-center gap-1 text-xs">
                      <Newspaper className="w-3.5 h-3.5 text-blue-500" />
                      Macro Catalyst:
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/news?tab=calendar&eventId=${trade.newsEventId || ''}`);
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      {trade.newsEventName}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {trade.newsImpact && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        trade.newsImpact === 'HIGH' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {trade.newsImpact}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Emotions</h4>
              <div className="flex flex-wrap gap-1.5">
                {trade.emotions?.length ? trade.emotions.map(e => (
                  <Badge key={e} variant="neutral" className="bg-white dark:bg-slate-800">{e}</Badge>
                )) : <span className="text-sm text-slate-500">None recorded</span>}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">General Notes</h4>
              <div className="text-sm text-slate-600 dark:text-slate-400">{trade.notes || "No notes provided."}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                <X className="w-4 h-4" /> Mistakes
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-red-50/50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">{trade.mistake || "No mistakes recorded."}</div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                <Check className="w-4 h-4" /> Learnings
              </h4>
              <div className="text-sm text-slate-600 dark:text-slate-400 bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg border border-green-100 dark:border-green-900/30">{trade.learning || "No learnings recorded."}</div>
            </div>
            
            {(!trade.result || trade.result === 'PENDING') && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Mark Result</h4>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onUpdateResult(trade.id, 'WIN'); }}>WIN</Button>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onUpdateResult(trade.id, 'LOSS'); }}>LOSS</Button>
                  <Button size="sm" variant="outline" className="flex-1 sm:flex-none" onClick={(e) => { e.stopPropagation(); onUpdateResult(trade.id, 'BREAK EVEN'); }}>BE</Button>
                </div>
              </div>
            )}

            {/* In-Card Delete Action */}
            <div className="pt-3 flex items-center justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete();
                }}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Trade Record</span>
              </button>
            </div>
          </div>
        </div>

          {/* TradeVault Academy Integration Actions */}
          <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-blue-900 dark:text-blue-100">
                    TradeVault Academy Ecosystem Actions (Trade #{trade.id.slice(-6)})
                  </h5>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Single source of truth: analyze this trade without creating duplicate records.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/academy?tab=tutor&tradeId=${trade.id}&market=${trade.market}&result=${trade.result || 'PENDING'}`);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Drill with AI Tutor</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/learning-rules?tab=rules', {
                      state: {
                        prefilledRule: {
                          text: `[Trade ${trade.market} Protocol] ${trade.learning || trade.mistake || 'Enforce planned invalidation and 1% risk limit.'}`,
                          category: 'Execution',
                          priority: 'Important'
                        }
                      }
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Create Rule from Trade</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/calculator', {
                      state: {
                        prefill: {
                          symbol: trade.market,
                          direction: trade.direction,
                          entryPrice: trade.entry ? trade.entry.toString() : '',
                          stopLossPrice: trade.stopLoss ? trade.stopLoss.toString() : '',
                          takeProfitPrice: trade.takeProfit ? trade.takeProfit.toString() : '',
                          riskPercent: trade.riskPercent ? trade.riskPercent.toString() : '1.0'
                        }
                      }
                    });
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Practice in Risk Calculator</span>
                </button>
              </div>
            </div>
          </div>

          {trade.screenshot && (
            <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Chart Screenshot</h4>
              <img src={trade.screenshot} alt="Trade chart screenshot" className="w-full max-w-4xl rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm object-contain bg-white dark:bg-slate-900" />
            </div>
          )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
