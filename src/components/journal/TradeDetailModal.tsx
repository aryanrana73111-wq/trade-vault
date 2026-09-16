import React, { useState } from 'react';
import { Trade } from '@/types';
import { getTradeCompleteness, SectionStatus } from '@/lib/tradeCompleteness';
import { useData } from '@/contexts/DataContext';
import { compressImageToDataUrl } from '@/lib/avatarStorage';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import { 
  X, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  UploadCloud, 
  Lock, 
  ShieldCheck, 
  History, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Globe2,
  Flame,
  Link2,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { EventDetailModal } from '@/components/news/EventDetailModal';
import { calculateSurprise } from '@/lib/news/newsStore';
import { NewsEvent } from '@/types/newsIntelligence';

interface TradeDetailModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  onEditFullTrade: (trade: Trade) => void;
}

export function TradeDetailModal({
  trade,
  isOpen,
  onClose,
  onEditFullTrade
}: TradeDetailModalProps) {
  const { updateTrade, deleteTrade } = useData();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inspectEvent, setInspectEvent] = useState<NewsEvent | null>(null);

  // Inline editing state for simple fields: Notes, Mistake, Learning
  const [editingField, setEditingField] = useState<'notes' | 'mistake' | 'learning' | null>(null);
  const [inlineValue, setInlineValue] = useState('');
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Screenshot upload state
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  // Find linked event or events on trade date
  const linkedEvent = React.useMemo(() => {
    if (!trade) return null;
    if (trade.newsEventId) {
      return NEWS_EVENTS.find(e => e.id === trade.newsEventId) || null;
    }
    if (trade.newsEventName) {
      return NEWS_EVENTS.find(e => e.name.toLowerCase() === trade.newsEventName?.toLowerCase()) || null;
    }
    return null;
  }, [trade?.newsEventId, trade?.newsEventName]);

  const tradeDateStr = React.useMemo(() => {
    if (!trade) return '';
    try {
      return format(new Date(trade.date), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  }, [trade?.date]);

  const eventsOnTradeDate = React.useMemo(() => {
    if (!tradeDateStr) return [];
    return NEWS_EVENTS.filter(e => {
      if (linkedEvent && e.id === linkedEvent.id) return false;
      const evDate = e.dateTime?.slice(0, 10);
      return evDate === tradeDateStr;
    }).slice(0, 4);
  }, [tradeDateStr, linkedEvent]);

  if (!isOpen || !trade) return null;

  const completeness = getTradeCompleteness(trade);
  const { sections, percentage, status } = completeness;

  // Handle inline edit save
  const handleStartInlineEdit = (field: 'notes' | 'mistake' | 'learning') => {
    setEditingField(field);
    setInlineValue(trade[field] || '');
  };

  const handleSaveInlineEdit = async () => {
    if (!editingField) return;
    setIsSavingInline(true);
    try {
      await updateTrade(trade.id, { [editingField]: inlineValue.trim() || undefined });
      setEditingField(null);
    } catch (err: any) {
      console.error('Failed to save inline edit:', err);
      alert('Failed to save edit.');
    } finally {
      setIsSavingInline(false);
    }
  };

  // Screenshot handling
  const handleScreenshotFile = async (file: File) => {
    if (!file) return;
    setIsUploadingScreenshot(true);
    try {
      const compressed = await compressImageToDataUrl(file, 1280, 960, 0.82);
      await updateTrade(trade.id, { screenshot: compressed });
    } catch (err: any) {
      console.error('Screenshot upload failed:', err);
      alert('Could not process screenshot image.');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleDeleteScreenshot = async () => {
    if (!confirm('Are you sure you want to delete this screenshot?')) return;
    try {
      await updateTrade(trade.id, { screenshot: undefined });
    } catch (err: any) {
      console.error('Failed to delete screenshot:', err);
    }
  };

  // Safe delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTrade(trade.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete trade:', err);
      alert('Failed to delete trade.');
      setIsDeleting(false);
    }
  };

  // Helper component to render section header status badge
  const renderStatusBadge = (sec: SectionStatus) => {
    if (sec.status === 'Complete') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/60">
          <Check className="w-3 h-3" />
          <span>Complete</span>
        </span>
      );
    }
    if (sec.status === 'Not Applicable') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          <span>Not Applicable</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span>Missing</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-1.5 rounded-xl font-black text-sm uppercase tracking-wide flex items-center gap-1",
              trade.direction === 'BUY'
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300"
            )}>
              {trade.direction === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trade.direction}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{trade.market}</h2>
                <span className="text-xs text-slate-400 font-mono">#{trade.id.slice(0, 8)}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(trade.date), 'MMMM dd, yyyy')}
                </span>
                {trade.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trade.time}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onEditFullTrade(trade)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Trade</span>
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Completeness Bar */}
        <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Journal Completeness:
            </span>
            <span className={cn(
              "font-bold font-mono",
              percentage === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {percentage}%
            </span>
            <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ml-1">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  percentage === 100 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {completeness.missingItems.length > 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Missing: {completeness.missingItems.slice(0, 3).map(m => m.label).join(', ')}{completeness.missingItems.length > 3 ? '...' : ''}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>All key journal fields completed</span>
            </div>
          )}
        </div>

        {/* Scrollable Body with the 9 Structured Sections */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          
          {/* 1. TRADE SUMMARY */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>1. Trade Summary</span>
              </h3>
              {renderStatusBadge(sections.summary)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Market</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{trade.market}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Direction</span>
                <span className={cn("font-semibold", trade.direction === 'BUY' ? "text-emerald-600" : "text-rose-600")}>
                  {trade.direction}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {format(new Date(trade.date), 'yyyy-MM-dd')}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Time</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{trade.time || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 2. EXECUTION */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>2. Execution & Outcome</span>
              </h3>
              {renderStatusBadge(sections.execution)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Entry Price</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{trade.entry}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Exit Price</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {trade.exitPrice !== undefined && trade.exitPrice !== null ? trade.exitPrice : (
                    <span className="text-slate-400 font-normal italic">Pending / Missing</span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Result</span>
                <span className={cn(
                  "font-bold",
                  trade.result === 'WIN' ? "text-emerald-600" :
                  trade.result === 'LOSS' ? "text-rose-600" :
                  trade.result === 'BREAK EVEN' ? "text-slate-600" : "text-amber-500"
                )}>
                  {trade.result || 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Realized P&L</span>
                <span className={cn(
                  "font-bold font-mono",
                  (trade.pnl || 0) > 0 ? "text-emerald-600" : (trade.pnl || 0) < 0 ? "text-rose-600" : "text-slate-600"
                )}>
                  {trade.pnl !== undefined ? formatCurrency(trade.pnl) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. RISK */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>3. Risk Management</span>
              </h3>
              {renderStatusBadge(sections.risk)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Stop Loss</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {trade.stopLoss ? trade.stopLoss : <span className="text-rose-500 text-xs">Missing ●</span>}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Take Profit</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {trade.takeProfit ? trade.takeProfit : <span className="text-rose-500 text-xs">Missing ●</span>}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Planned Risk ($)</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {trade.risk ? `$${trade.risk}` : <span className="text-rose-500 text-xs">Missing ●</span>}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">R Multiple</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {trade.rMultiple !== undefined ? `${trade.rMultiple}R` : (trade.rrRatio ? `${trade.rrRatio}R (Planned)` : 'N/A')}
                </span>
              </div>
            </div>
          </div>

          {/* 4. STRATEGY */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>4. Strategy & Context</span>
              </h3>
              {renderStatusBadge(sections.strategy)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Setup Quality</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {trade.setupQuality ? (
                    <span className={cn(
                      "inline-flex items-center gap-1",
                      trade.setupQuality === 'A+' ? 'text-emerald-600 dark:text-emerald-400' :
                      trade.setupQuality === 'B' ? 'text-amber-600 dark:text-amber-400' :
                      'text-rose-600 dark:text-rose-400'
                    )}>
                      {trade.setupQuality === 'A+' ? '🟢' : trade.setupQuality === 'B' ? '🟡' : '🔴'} {trade.setupQuality}
                    </span>
                  ) : <span className="text-slate-400 text-xs">Not Rated</span>}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Playbook Strategy</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {trade.strategy || <span className="text-rose-500 text-xs">Missing ●</span>}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Trading Session</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {trade.session || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Chart Timeframe</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {trade.timeframe || 'N/A'}
                </span>
              </div>
            </div>
            {trade.setupQualityReason && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Setup Quality Reason</span>
                <p className="text-sm text-slate-600 dark:text-slate-300">{trade.setupQualityReason}</p>
              </div>
            )}
          </div>

          {/* 4b. MACRO & ECONOMIC CATALYST CONTEXT */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Macro & Economic Catalyst Context
                </h3>
              </div>
              {linkedEvent ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                  Linked Catalyst
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                  Session Background
                </span>
              )}
            </div>

            <div className="mt-3 space-y-3">
              {linkedEvent ? (
                <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{linkedEvent.countryCode === 'US' ? '🇺🇸' : linkedEvent.countryCode === 'EU' ? '🇪🇺' : '🌐'}</span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{linkedEvent.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                        {linkedEvent.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>Act: <strong>{linkedEvent.actual ?? '--'}{linkedEvent.unit}</strong></span>
                      <span>Cons: <strong>{linkedEvent.forecast ?? '--'}{linkedEvent.unit}</strong></span>
                      <span>Prev: <strong>{linkedEvent.previous ?? '--'}{linkedEvent.unit}</strong></span>
                      {(() => {
                        const s = calculateSurprise(linkedEvent.actual, linkedEvent.forecast);
                        return s.hasSurprise ? (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${s.badgeColor}`}>
                            {s.diffFormatted}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectEvent(linkedEvent)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Event Intelligence</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTrade(trade.id, { newsEventId: undefined, newsEventName: undefined, newsImpact: undefined })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                      title="Unlink catalyst"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ) : trade.newsEventName ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      {trade.newsEventName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Impact: {trade.newsImpact || 'HIGH'}
                    </span>
                  </div>
                </div>
              ) : eventsOnTradeDate.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Releases on Trade Date ({tradeDateStr}):
                    </span>
                    <span className="text-[11px]">Click to link as catalyst for analytics</span>
                  </div>
                  <div className="space-y-1.5">
                    {eventsOnTradeDate.map(ev => (
                      <div
                        key={ev.id}
                        className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {ev.currency} • {ev.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                            {ev.impact}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setInspectEvent(ev)}
                            className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-xs font-medium"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTrade(trade.id, {
                              newsEventId: ev.id,
                              newsEventName: ev.name,
                              newsImpact: (ev.impact === 'NON-ECONOMIC' ? 'LOW' : ev.impact) as 'HIGH' | 'MEDIUM' | 'LOW'
                            })}
                            className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Link Catalyst</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 py-1">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>No major scheduled news catalyst on this trade date. Executed during standard market conditions.</span>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                Statistical context correlation only. Observational analysis never implies direct causality.
              </div>
            </div>
          </div>

          {/* 5. SCREENSHOT (WITH ADD / REPLACE / DELETE POST-CREATION) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  <span>5. Chart Screenshot</span>
                </h3>
              </div>
              {renderStatusBadge(sections.screenshot)}
            </div>

            <div className="mt-3">
              {trade.screenshot ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/10 dark:bg-slate-950">
                  <img 
                    src={trade.screenshot} 
                    alt="Trade Chart" 
                    className="w-full max-h-80 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-200 rounded-lg shadow-md hover:bg-white transition-colors flex items-center gap-1">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleScreenshotFile(file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleDeleteScreenshot}
                      className="p-1.5 text-rose-600 bg-white/95 dark:bg-slate-900/95 rounded-lg shadow-md hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Delete screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30">
                  <label className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      Add Chart Screenshot Later
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Supports PNG, JPG, WEBP • Secure, client-compressed storage
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={isUploadingScreenshot}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotFile(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* 6. PSYCHOLOGY */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>6. Psychology & Mindset</span>
              </h3>
              {renderStatusBadge(sections.psychology)}
            </div>
            <div className="mt-3">
              {trade.emotions && trade.emotions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {trade.emotions.map(em => (
                    <span 
                      key={em}
                      className="px-2.5 py-1 text-xs rounded-full font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60"
                    >
                      {em}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-rose-500 text-xs">No emotional tags logged ●</span>
              )}

              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Personal psychology data is private to your journal.</span>
              </div>
            </div>
          </div>

          {/* 7. NOTES (INLINE EDITABLE) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>7. Market Notes & Confluences</span>
              </h3>
              <div className="flex items-center gap-2">
                {renderStatusBadge(sections.notes)}
                {editingField !== 'notes' && (
                  <button
                    type="button"
                    onClick={() => handleStartInlineEdit('notes')}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Notes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              {editingField === 'notes' ? (
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    placeholder="Enter market notes..."
                    className="text-xs"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingField(null)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveInlineEdit}
                      disabled={isSavingInline}
                      className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSavingInline ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {trade.notes || <span className="text-rose-500 italic">No notes recorded ●</span>}
                </p>
              )}
            </div>
          </div>

          {/* 8. MISTAKE (INLINE EDITABLE) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>8. Mistake Analysis</span>
              </h3>
              <div className="flex items-center gap-2">
                {renderStatusBadge(sections.mistake)}
                {editingField !== 'mistake' && (
                  <button
                    type="button"
                    onClick={() => handleStartInlineEdit('mistake')}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Mistake"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              {editingField === 'mistake' ? (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    placeholder="Enter mistake analysis (or 'Clean execution')..."
                    className="text-xs"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingField(null)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveInlineEdit}
                      disabled={isSavingInline}
                      className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSavingInline ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {trade.mistake || <span className="text-rose-500 italic">No mistake analysis recorded ●</span>}
                </p>
              )}
            </div>
          </div>

          {/* 9. LEARNING (INLINE EDITABLE) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <span>9. Key Learning & Rule Takeaway</span>
              </h3>
              <div className="flex items-center gap-2">
                {renderStatusBadge(sections.learning)}
                {editingField !== 'learning' && (
                  <button
                    type="button"
                    onClick={() => handleStartInlineEdit('learning')}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Learning"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              {editingField === 'learning' ? (
                <div className="space-y-2">
                  <Textarea
                    rows={2}
                    value={inlineValue}
                    onChange={(e) => setInlineValue(e.target.value)}
                    placeholder="Enter key learning or tactical insight..."
                    className="text-xs"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingField(null)}
                      className="text-xs h-7"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveInlineEdit}
                      disabled={isSavingInline}
                      className="text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSavingInline ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {trade.learning || <span className="text-rose-500 italic">No learning recorded ●</span>}
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Footer with Delete and Close */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Trade</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold"
          >
            Close
          </Button>
        </div>

        {/* Delete Confirmation Safety Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Delete Trade Permanently?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                This action cannot be undone. Any linked competition trade projections will be safely updated.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="w-full text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Event Detail Modal for Macro Catalyst */}
        {inspectEvent && (
          <EventDetailModal
            event={inspectEvent}
            onClose={() => setInspectEvent(null)}
            timezone="UTC"
          />
        )}

      </div>
    </div>
  );
}
