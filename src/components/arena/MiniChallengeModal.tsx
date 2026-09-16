import React, { useState } from 'react';
import { Arena } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { createMiniChallenge } from '@/lib/arenaService';
import { X, Flame, Target } from 'lucide-react';

interface MiniChallengeModalProps {
  arena: Arena;
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: () => void;
}

export function MiniChallengeModal({
  arena,
  isOpen,
  onClose,
  onChallengeCreated
}: MiniChallengeModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState<'P&L' | 'Avg R' | 'Total R' | 'Win Rate' | 'Lowest Drawdown' | 'Rule Adherence'>('Avg R');
  const [durationDays, setDurationDays] = useState(3);
  const [minTrades, setMinTrades] = useState(3);
  const [market, setMarket] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const member = arena.members[user.uid];
      await createMiniChallenge(arena.id, {
        creatorId: user.uid,
        creatorName: member?.displayName || user.displayName || 'Trader',
        title: title.trim(),
        metric,
        durationDays,
        minTrades,
        market: market || undefined,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        expiresAt: Date.now() + durationDays * 24 * 60 * 60 * 1000
      });

      onChallengeCreated();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                Launch Mini-Challenge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Challenge fellow traders in {arena.name}
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label>Challenge Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Beat my 2.5 Avg R this week"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Target Metric</Label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as any)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Avg R">Highest Avg R</option>
                <option value="Total R">Highest Total R</option>
                <option value="Win Rate">Highest Win Rate</option>
                <option value="Lowest Drawdown">Lowest Drawdown</option>
                <option value="Rule Adherence">100% Rule Adherence</option>
                <option value="P&L">Highest Net P&L</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Duration (Days)</Label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value={1}>1 Day (Daily Sprint)</option>
                <option value={3}>3 Days</option>
                <option value={5}>5 Days (Trading Week)</option>
                <option value={7}>7 Days</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Min. Trades Required</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={minTrades}
                onChange={(e) => setMinTrades(parseInt(e.target.value, 10) || 1)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Instrument Constraint (Optional)</Label>
              <Input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="e.g. XAU/USD (or leave blank)"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Target Benchmark (Optional)</Label>
            <Input
              type="number"
              step="any"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g. 2.0 (for 2.0R)"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? 'Launching...' : 'Launch Challenge 🔥'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
