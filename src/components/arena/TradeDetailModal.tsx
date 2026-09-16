import React, { useState } from 'react';
import { CompetitionTrade, Arena } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { disputeCompetitionTrade } from '@/lib/arenaService';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Layers,
  Flag,
  CheckCircle2,
  Check,
  ExternalLink,
  Pencil,
  Camera,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';

interface TradeDetailModalProps {
  trade: CompetitionTrade | null;
  arena: Arena;
  isOpen: boolean;
  onClose: () => void;
  onDisputeRaised?: () => void;
  onEditTrade?: (trade: CompetitionTrade) => void;
}

export function TradeDetailModal({
  trade,
  arena,
  isOpen,
  onClose,
  onDisputeRaised,
  onEditTrade
}: TradeDetailModalProps) {
  const { user } = useAuth();
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  if (!isOpen || !trade) return null;

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !disputeReason.trim()) return;

    setIsSubmittingDispute(true);
    try {
      const member = arena.members[user.uid];
      await disputeCompetitionTrade(
        arena.id,
        trade.id,
        user.uid,
        member?.displayName || user.displayName || 'Trader',
        disputeReason.trim()
      );
      setDisputeSuccess(true);
      setShowDisputeForm(false);
      if (onDisputeRaised) onDisputeRaised();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to raise dispute.');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const tradeDateStr = trade.date
    ? format(new Date(trade.date), 'MMM d, yyyy')
    : 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${
              trade.direction === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {trade.direction}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {trade.market}
                </h2>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase flex-shrink-0 ${
                  trade.result === 'WIN'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                    : trade.result === 'LOSS'
                    ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {trade.result || 'OPEN'}
                </span>
                {trade.isBackfilled && (
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex-shrink-0">
                    Backfilled
                  </span>
                )}
                {trade.status === 'Disputed' && (
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 flex-shrink-0">
                    In Review
                  </span>
                )}
                {(trade.editsCount || 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex-shrink-0">
                    Edited ({trade.editsCount})
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Logged by <span className="font-semibold text-slate-700 dark:text-slate-200">{trade.userDisplayName || 'Trader'}</span> • {tradeDateStr} {trade.time || ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Key Outcome Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Return on Risk</span>
              <p className={`text-base sm:text-lg font-bold truncate ${
                (trade.rMultiple || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                (trade.rMultiple || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600'
              }`}>
                {(trade.rMultiple || 0) > 0 ? `+${trade.rMultiple}R` : `${trade.rMultiple || 0}R`}
              </p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Realized P&L</span>
              <p className={`text-base sm:text-lg font-bold truncate ${
                (trade.pnl || 0) > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                (trade.pnl || 0) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600'
              }`}>
                {trade.pnl !== undefined ? `$${trade.pnl.toLocaleString()}` : 'Masked'}
              </p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Risk Capital</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                {trade.riskAmount ? `$${trade.riskAmount}` : 'Masked'}
              </p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">Rule Adherence</span>
              <p className="text-base sm:text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
                {trade.ruleAdherence ? `${trade.ruleAdherence}%` : '100%'}
              </p>
            </div>
          </div>

          {/* Execution Levels */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Execution Parameters</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Entry Price</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{trade.entry ?? 'Masked'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Exit Price</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{trade.exit ?? 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Stop Loss</span>
                <span className="font-bold text-rose-600 block truncate">{trade.stopLoss ?? 'Masked'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Take Profit</span>
                <span className="font-bold text-emerald-600 block truncate">{trade.takeProfit ?? 'Masked'}</span>
              </div>
            </div>
          </div>

          {/* Context: Strategy & Session */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Market Context</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Strategy</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{trade.strategy || 'Discretionary'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Session</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{trade.session || 'Unspecified'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 min-w-0">
                <span className="text-slate-400 block truncate">Timeframe</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate">{trade.timeframe || '15m'}</span>
              </div>
            </div>
          </div>

          {/* Post-Trade Learning */}
          {(trade.learning || (trade.sharedNotes && trade.sharedNotes.startsWith('Learning: '))) && (
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Post-Trade Learning</span>
              </h3>
              <p className="text-xs p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-100 leading-relaxed whitespace-pre-wrap break-words">
                {trade.learning || trade.sharedNotes?.replace('Learning: ', '')}
              </p>
            </div>
          )}

          {/* Shared Notes */}
          {trade.sharedNotes && !trade.sharedNotes.startsWith('Learning: ') && (
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shared Notes / Edge</h3>
              <p className="text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {trade.sharedNotes}
              </p>
            </div>
          )}

          {/* Screenshots: Trade Execution (Entry) & Trade Close (Exit) */}
          {(trade.entryScreenshot || trade.exitScreenshot || trade.screenshot) && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Trade Verification Charts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Entry Screenshot */}
                {(trade.entryScreenshot || (!trade.exitScreenshot && trade.screenshot)) && (
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          1. Trade Execution / Entry Chart
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ 
                          url: (trade.entryScreenshot || trade.screenshot)!, 
                          title: 'Trade Execution / Entry Chart' 
                        })}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Eye className="w-3 h-3" /> Full View
                      </button>
                    </div>
                    <div 
                      onClick={() => setPreviewImage({ 
                        url: (trade.entryScreenshot || trade.screenshot)!, 
                        title: 'Trade Execution / Entry Chart' 
                      })}
                      className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black max-h-56 flex items-center justify-center cursor-pointer group relative"
                    >
                      <img
                        src={trade.entryScreenshot || trade.screenshot}
                        alt="Trade Execution Chart"
                        className="w-full object-contain max-h-56 transition-transform duration-200 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-md bg-white/20 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Expand
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Exit Screenshot */}
                {trade.exitScreenshot && (
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          2. Trade Close / Exit Chart
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ 
                          url: trade.exitScreenshot!, 
                          title: 'Trade Close / Exit Chart' 
                        })}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Eye className="w-3 h-3" /> Full View
                      </button>
                    </div>
                    <div 
                      onClick={() => setPreviewImage({ 
                        url: trade.exitScreenshot!, 
                        title: 'Trade Close / Exit Chart' 
                      })}
                      className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black max-h-56 flex items-center justify-center cursor-pointer group relative"
                    >
                      <img
                        src={trade.exitScreenshot}
                        alt="Trade Close Chart"
                        className="w-full object-contain max-h-56 transition-transform duration-200 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-md bg-white/20 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> Expand
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dispute form or button */}
          {showDisputeForm ? (
            <form onSubmit={handleDispute} className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-200">
                <Flag className="w-4 h-4 text-purple-600" />
                <span>Flag Trade for Host / Group Review</span>
              </div>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Explain reason for flag (e.g. unrealistic entry price, mismatched screenshot, post-facto backfill without confirmation)..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDisputeForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmittingDispute || !disputeReason.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSubmittingDispute ? 'Flagging...' : 'Submit Flag'}
                </Button>
              </div>
            </form>
          ) : disputeSuccess ? (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Trade has been flagged for review. The dispute is recorded in the audit trail.
            </div>
          ) : (
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Immutable audit record ID: {trade.id.slice(0, 14)}...
              </span>
              {user && user.uid !== trade.userId && (
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(true)}
                  className="text-xs text-slate-500 hover:text-purple-600 flex items-center gap-1 font-medium transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Flag / Dispute
                </button>
              )}
            </div>
          )}

        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <div>
            {user && (user.uid === trade.userId || arena.ownerId === user.uid) && onEditTrade && (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  onEditTrade(trade);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Trade</span>
              </Button>
            )}
          </div>
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      {/* Full-size Image Lightbox */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                {previewImage.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="w-full h-full object-contain max-h-[75vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
