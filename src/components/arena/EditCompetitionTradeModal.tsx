import React, { useState, useMemo, useEffect } from 'react';
import { Arena, Direction, Result, CompetitionTrade } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { updateCompetitionTrade } from '@/lib/arenaService';
import { MarketSelector } from '@/components/common/MarketSelector';
import { format } from 'date-fns';
import {
  X,
  Swords,
  AlertTriangle,
  UploadCloud,
  Trash2,
  Camera,
  Eye,
  CheckCircle2,
  Sparkles,
  Lock,
  AlertCircle
} from 'lucide-react';
import { compressImageToDataUrl } from '@/lib/avatarStorage';
import { cn } from '@/lib/utils';

interface EditCompetitionTradeModalProps {
  trade: CompetitionTrade;
  arena: Arena;
  isOpen: boolean;
  onClose: () => void;
  onTradeUpdated: (updatedTrade: CompetitionTrade) => void;
}

export function EditCompetitionTradeModal({
  trade,
  arena,
  isOpen,
  onClose,
  onTradeUpdated
}: EditCompetitionTradeModalProps) {
  const { user } = useAuth();

  const currentMember = user ? arena.members?.[user.uid] : null;
  const isDisqualified = currentMember?.isDisqualified || currentMember?.complianceStatus === 'DISQUALIFIED';

  // Active competition rules for trade limits
  const maxRiskRule = useMemo(() => {
    return (arena.rules || []).find(r => r.isActive !== false && r.type === 'MAX_RISK_PER_TRADE');
  }, [arena.rules]);
  const maxRiskAllowedDollars = maxRiskRule ? Number(maxRiskRule.limitValue) : null;

  const [syncToPersonalJournal, setSyncToPersonalJournal] = useState<boolean>(() => {
    if (trade.inPersonalJournal || trade.personalTradeId) return true;
    const saved = localStorage.getItem('tv_comp_sync_personal_pref');
    return saved !== null ? saved === 'true' : true;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const tradeDateStr = trade.date
    ? format(new Date(trade.date), 'yyyy-MM-dd')
    : format(new Date(trade.createdAt || Date.now()), 'yyyy-MM-dd');
  const tradeTimeStr = trade.time || format(new Date(trade.date || trade.createdAt || Date.now()), 'HH:mm');

  const [formData, setFormData] = useState({
    date: tradeDateStr,
    time: tradeTimeStr,
    market: trade.market || 'XAU/USD',
    direction: (trade.direction || 'BUY') as Direction,
    entry: trade.entry !== undefined ? String(trade.entry) : '',
    stopLoss: trade.stopLoss !== undefined ? String(trade.stopLoss) : '',
    takeProfit: trade.takeProfit !== undefined ? String(trade.takeProfit) : '',
    riskAmount: trade.riskAmount !== undefined ? String(trade.riskAmount) : '100',
    result: (trade.result || 'WIN') as Result,
    pnl: trade.pnl !== undefined ? String(trade.pnl) : '',
    learning: trade.learning || (trade.sharedNotes?.startsWith('Learning: ') ? trade.sharedNotes.replace('Learning: ', '') : trade.sharedNotes || ''),
    entryScreenshot: trade.entryScreenshot || trade.screenshot || '',
    exitScreenshot: trade.exitScreenshot || ''
  });

  useEffect(() => {
    if (trade) {
      const dStr = trade.date
        ? format(new Date(trade.date), 'yyyy-MM-dd')
        : format(new Date(trade.createdAt || Date.now()), 'yyyy-MM-dd');
      const tStr = trade.time || format(new Date(trade.date || trade.createdAt || Date.now()), 'HH:mm');

      setFormData({
        date: dStr,
        time: tStr,
        market: trade.market || 'XAU/USD',
        direction: (trade.direction || 'BUY') as Direction,
        entry: trade.entry !== undefined ? String(trade.entry) : '',
        stopLoss: trade.stopLoss !== undefined ? String(trade.stopLoss) : '',
        takeProfit: trade.takeProfit !== undefined ? String(trade.takeProfit) : '',
        riskAmount: trade.riskAmount !== undefined ? String(trade.riskAmount) : '100',
        result: (trade.result || 'WIN') as Result,
        pnl: trade.pnl !== undefined ? String(trade.pnl) : '',
        learning: trade.learning || (trade.sharedNotes?.startsWith('Learning: ') ? trade.sharedNotes.replace('Learning: ', '') : trade.sharedNotes || ''),
        entryScreenshot: trade.entryScreenshot || trade.screenshot || '',
        exitScreenshot: trade.exitScreenshot || ''
      });
      if (trade.inPersonalJournal || trade.personalTradeId) {
        setSyncToPersonalJournal(true);
      }
    }
  }, [trade]);

  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const calculatedMetrics = useMemo(() => {
    const entry = parseFloat(formData.entry) || 0;
    const stopLoss = parseFloat(formData.stopLoss) || 0;
    const takeProfit = parseFloat(formData.takeProfit) || 0;

    if (entry <= 0 || stopLoss <= 0) {
      return { stopDistance: 0, rewardDistance: 0, rrRatio: 0, warning: null };
    }

    const isBuy = formData.direction === 'BUY';
    const stopDistance = isBuy ? entry - stopLoss : stopLoss - entry;
    const rewardDistance = takeProfit > 0 ? (isBuy ? takeProfit - entry : entry - takeProfit) : 0;

    let warning: string | null = null;
    if (isBuy) {
      if (stopLoss >= entry) warning = 'For a BUY (LONG) trade, Stop Loss is normally below Entry price.';
      if (takeProfit > 0 && takeProfit <= entry) warning = 'For a BUY (LONG) trade, Take Profit is normally above Entry price.';
    } else {
      if (stopLoss <= entry) warning = 'For a SELL (SHORT) trade, Stop Loss is normally above Entry price.';
      if (takeProfit > 0 && takeProfit >= entry) warning = 'For a SELL (SHORT) trade, Take Profit is normally below Entry price.';
    }

    const rrRatio = stopDistance > 0 && rewardDistance > 0 ? rewardDistance / stopDistance : 0;

    return {
      stopDistance: Math.abs(stopDistance),
      rewardDistance: Math.abs(rewardDistance),
      rrRatio: Math.max(0, rrRatio),
      warning
    };
  }, [formData.entry, formData.stopLoss, formData.takeProfit, formData.direction]);

  const handleResultChange = (newResult: Result) => {
    const riskAmt = parseFloat(formData.riskAmount) || 0;
    let defaultPnl = '';

    if (newResult === 'WIN') {
      const rr = calculatedMetrics.rrRatio > 0 ? calculatedMetrics.rrRatio : 2;
      defaultPnl = (riskAmt * rr).toFixed(2);
    } else if (newResult === 'LOSS') {
      defaultPnl = (-riskAmt).toFixed(2);
    } else if (newResult === 'BREAK EVEN') {
      defaultPnl = '0';
    }

    setFormData(prev => ({
      ...prev,
      result: newResult,
      pnl: defaultPnl
    }));
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'entry' | 'exit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageToDataUrl(file);
      setFormData(prev => ({
        ...prev,
        [type === 'entry' ? 'entryScreenshot' : 'exitScreenshot']: compressed
      }));
    } catch (err) {
      console.error('Image compression failed', err);
      setErrorMessage('Failed to process screenshot.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (isDisqualified) {
      setErrorMessage('Your account is currently disqualified from modifying trades in this competition.');
      return;
    }

    setErrorMessage(null);

    const entry = parseFloat(formData.entry);
    const stopLoss = parseFloat(formData.stopLoss);
    const takeProfit = parseFloat(formData.takeProfit);
    const riskAmt = parseFloat(formData.riskAmount);
    let pnl = parseFloat(formData.pnl);

    if (isNaN(entry) || entry <= 0) {
      setErrorMessage('Please enter a valid positive Entry price.');
      return;
    }
    if (isNaN(stopLoss) || stopLoss <= 0) {
      setErrorMessage('Please enter a valid positive Stop Loss price.');
      return;
    }
    if (isNaN(riskAmt) || riskAmt <= 0) {
      setErrorMessage('Please enter a valid positive Risk Amount.');
      return;
    }

    // Client-side rule check: Maximum Risk Per Trade
    if (maxRiskAllowedDollars !== null && maxRiskAllowedDollars > 0 && riskAmt > maxRiskAllowedDollars) {
      setErrorMessage(`Trade risk ($${riskAmt}) exceeds competition limit of $${maxRiskAllowedDollars}.00. Please reduce your risk.`);
      return;
    }

    if (isNaN(pnl)) {
      if (formData.result === 'WIN') {
        const rr = calculatedMetrics.rrRatio > 0 ? calculatedMetrics.rrRatio : 2;
        pnl = riskAmt * rr;
      } else if (formData.result === 'LOSS') {
        pnl = -riskAmt;
      } else {
        pnl = 0;
      }
    }

    setIsSubmitting(true);
    try {
      const rMultiple = riskAmt > 0 ? Number((pnl / riskAmt).toFixed(2)) : 0;
      const tradeRiskPct = (riskAmt / (arena.startingBalance || 10000)) * 100;

      const updatedTrade = await updateCompetitionTrade({
        competitionId: arena.id,
        tradeId: trade.id,
        userId: user.uid,
        updates: {
          date: new Date(`${formData.date}T${formData.time}`).getTime() || Date.now(),
          time: formData.time,
          market: formData.market,
          direction: formData.direction,
          entry,
          stopLoss,
          takeProfit: !isNaN(takeProfit) && takeProfit > 0 ? takeProfit : undefined,
          exit: formData.result === 'WIN' && takeProfit > 0 ? takeProfit : undefined,
          riskAmount: riskAmt,
          riskPercent: tradeRiskPct,
          result: (formData.result || 'WIN') as 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING',
          pnl,
          rMultiple,
          entryScreenshot: formData.entryScreenshot || undefined,
          exitScreenshot: formData.exitScreenshot || undefined,
          screenshot: formData.entryScreenshot || formData.exitScreenshot || undefined,
          sharedNotes: formData.learning ? `Learning: ${formData.learning}` : undefined,
          learning: formData.learning || undefined
        },
        syncToPersonalJournal
      });

      onTradeUpdated(updatedTrade);
      onClose();
    } catch (err: any) {
      console.error('Failed to update trade:', err);
      const raw = err.message || '';
      if (raw.includes('TRADE_REJECTED')) {
        setErrorMessage(raw.replace('TRADE_REJECTED: ', ''));
      } else if (raw.includes('COMPETITION_PARTICIPANT_DISQUALIFIED')) {
        setErrorMessage(raw.replace('COMPETITION_PARTICIPANT_DISQUALIFIED: ', ''));
      } else {
        setErrorMessage(raw || 'Failed to update trade.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
              <Swords className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                Edit Competition Trade
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Update record in <span className="font-semibold text-slate-700 dark:text-slate-300">{arena.name}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDisqualified && (
          <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-3">
            <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-sm text-red-900 dark:text-red-200">
                Trading Privilege Locked — Disqualified
              </p>
              <p className="text-red-800 dark:text-red-300">
                You were disqualified for violating competition rule: <strong>{currentMember?.disqualifiedRuleName || 'Risk Limit Violation'}</strong>.
              </p>
              <p className="text-[11px] text-red-600 dark:text-red-400">
                {currentMember?.disqualificationReason || 'Historical trade records are preserved in read-only mode for audit transparency.'}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))}
                required
                className="text-xs sm:text-sm h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={e => setFormData(p => ({ ...p, time: e.target.value }))}
                required
                className="text-xs sm:text-sm h-10"
              />
            </div>
          </div>

          {/* 2. Market & Direction */}
          <div className="space-y-3">
            <MarketSelector
              value={formData.market}
              onChange={market => setFormData(p => ({ ...p, market }))}
              userId={user?.uid}
              required
              label="Market / Instrument"
            />

            <div className="space-y-1.5">
              <Label className="text-xs">Direction *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, direction: 'BUY' }))}
                  className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border-2 ${
                    formData.direction === 'BUY'
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <span>▲ BUY (LONG)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, direction: 'SELL' }))}
                  className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border-2 ${
                    formData.direction === 'SELL'
                      ? 'border-rose-600 bg-rose-600 text-white shadow-md shadow-rose-500/20 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-rose-400'
                  }`}
                >
                  <span>▼ SELL (SHORT)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Execution Levels: Entry, SL, TP, Risk */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Entry Price *</Label>
              <Input
                type="number"
                step="any"
                value={formData.entry}
                onChange={e => setFormData(p => ({ ...p, entry: e.target.value }))}
                placeholder="2650.50"
                required
                className="text-xs sm:text-sm h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-rose-600 dark:text-rose-400">Stop Loss *</Label>
              <Input
                type="number"
                step="any"
                value={formData.stopLoss}
                onChange={e => setFormData(p => ({ ...p, stopLoss: e.target.value }))}
                placeholder="2645.00"
                required
                className="text-xs sm:text-sm h-10 border-rose-200 dark:border-rose-900/50"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-emerald-600 dark:text-emerald-400">Take Profit *</Label>
              <Input
                type="number"
                step="any"
                value={formData.takeProfit}
                onChange={e => setFormData(p => ({ ...p, takeProfit: e.target.value }))}
                placeholder="2665.00"
                required
                className="text-xs sm:text-sm h-10 border-emerald-200 dark:border-emerald-900/50"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Risk ($) *</Label>
                {maxRiskAllowedDollars !== null && (
                  <span className={cn(
                    "text-[10px] font-mono",
                    (parseFloat(formData.riskAmount) || 0) > maxRiskAllowedDollars
                      ? "text-rose-500 font-bold"
                      : "text-slate-400"
                  )}>
                    Limit: ${maxRiskAllowedDollars}
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="any"
                value={formData.riskAmount}
                onChange={e => setFormData(p => ({ ...p, riskAmount: e.target.value }))}
                placeholder={maxRiskAllowedDollars ? String(maxRiskAllowedDollars) : "50"}
                required
                className={cn(
                  "text-xs sm:text-sm h-10 font-bold",
                  maxRiskAllowedDollars !== null && (parseFloat(formData.riskAmount) || 0) > maxRiskAllowedDollars &&
                    "border-rose-500 focus-visible:ring-rose-500 text-rose-600 dark:text-rose-400"
                )}
              />
            </div>
          </div>

          {/* Inline Risk Rule Breach Warning */}
          {maxRiskAllowedDollars !== null && (parseFloat(formData.riskAmount) || 0) > maxRiskAllowedDollars && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-400 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                <span>Risk (${formData.riskAmount}) exceeds competition rule limit of ${maxRiskAllowedDollars}.00</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-6 px-2 text-[10px] border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50"
                onClick={() => setFormData(p => ({ ...p, riskAmount: String(maxRiskAllowedDollars) }))}
              >
                Set to ${maxRiskAllowedDollars}
              </Button>
            </div>
          )}

          {calculatedMetrics.warning && (
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{calculatedMetrics.warning}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stop Distance</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {calculatedMetrics.stopDistance > 0 ? calculatedMetrics.stopDistance.toFixed(2) : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Reward Distance</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {calculatedMetrics.rewardDistance > 0 ? calculatedMetrics.rewardDistance.toFixed(2) : '-'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk : Reward</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {calculatedMetrics.rrRatio > 0 ? `1 : ${calculatedMetrics.rrRatio.toFixed(2)}` : '-'}
              </span>
            </div>
          </div>

          {/* 4. Result & Profit/Loss */}
          <div className="space-y-2">
            <Label className="text-xs">Outcome / Result *</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleResultChange('WIN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                  formData.result === 'WIN'
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                WIN
              </button>
              <button
                type="button"
                onClick={() => handleResultChange('LOSS')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                  formData.result === 'LOSS'
                    ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-rose-400'
                }`}
              >
                LOSS
              </button>
              <button
                type="button"
                onClick={() => handleResultChange('BREAK EVEN')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                  formData.result === 'BREAK EVEN'
                    ? 'border-slate-600 bg-slate-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
              >
                BREAK EVEN
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Realized Profit / Loss ($) *</Label>
                <span className="text-[10px] text-slate-400">Auto-calculated or override</span>
              </div>
              <Input
                type="number"
                step="any"
                value={formData.pnl}
                onChange={e => setFormData(p => ({ ...p, pnl: e.target.value }))}
                placeholder={formData.result === 'WIN' ? '+200' : '-100'}
                required
                className={`text-sm h-10 font-bold ${
                  parseFloat(formData.pnl) > 0
                    ? 'text-emerald-600'
                    : parseFloat(formData.pnl) < 0
                    ? 'text-rose-600'
                    : ''
                }`}
              />
            </div>
          </div>

          {/* 5. Learning Field */}
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Learning</span>
            </Label>
            <textarea
              value={formData.learning}
              onChange={e => setFormData(p => ({ ...p, learning: e.target.value }))}
              placeholder="What did you learn from this trade?"
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 6. Screenshots: Entry & Exit */}
          <div className="space-y-2">
            <Label className="text-xs">Verification Screenshots</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Entry Screenshot */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-indigo-500" />
                    Entry / Execution Chart
                  </span>
                  {formData.entryScreenshot && (
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, entryScreenshot: '' }))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {formData.entryScreenshot ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-32 bg-black flex items-center justify-center group">
                    <img
                      src={formData.entryScreenshot}
                      alt="Entry chart preview"
                      className="w-full object-cover max-h-32"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: formData.entryScreenshot, title: 'Entry Screenshot' })}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Enlarge
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
                    <UploadCloud className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Upload Entry Chart</span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleScreenshotUpload(e, 'entry')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Exit Screenshot */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-emerald-500" />
                    Exit / Close Chart
                  </span>
                  {formData.exitScreenshot && (
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, exitScreenshot: '' }))}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Remove screenshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {formData.exitScreenshot ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-32 bg-black flex items-center justify-center group">
                    <img
                      src={formData.exitScreenshot}
                      alt="Exit chart preview"
                      className="w-full object-cover max-h-32"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage({ url: formData.exitScreenshot, title: 'Exit Screenshot' })}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Enlarge
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
                    <UploadCloud className="w-5 h-5 text-emerald-500 mb-1" />
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Upload Exit Chart</span>
                    <span className="text-[9px] text-slate-400">PNG, JPG, WebP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleScreenshotUpload(e, 'exit')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={syncToPersonalJournal}
              onChange={e => setSyncToPersonalJournal(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Sync changes to my private Personal Journal</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isDisqualified}
              className={`${
                isDisqualified
                  ? 'bg-slate-400 dark:bg-slate-700 text-slate-200 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              } min-w-[140px] font-bold`}
            >
              {isSubmitting ? 'Updating...' : isDisqualified ? 'Locked (Disqualified)' : 'Save Trade Edits 💾'}
            </Button>
          </div>
        </form>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-indigo-400" />
                {previewImage.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
