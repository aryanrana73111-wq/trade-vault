import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Input, Label, Textarea, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useData } from '@/contexts/DataContext';
import { Trade, Market, Direction, Session, Emotion, Timeframe, MarketCondition, Strategy } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { calculateTradeMetrics } from '@/lib/calculations';
import { compressImageToDataUrl } from '@/lib/avatarStorage';
import { getTradeCompleteness } from '@/lib/tradeCompleteness';
import { 
  X, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  History, 
  Sparkles,
  Lock,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Image as ImageIcon,
  Newspaper
} from 'lucide-react';
import { format } from 'date-fns';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';

interface TradeEditModalProps {
  trade: Trade;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updatedTrade: Trade) => void;
}

const COMMON_EMOTIONS: Emotion[] = [
  'Confident', 'Unconfident'
];

export function TradeEditModal({
  trade,
  isOpen,
  onClose,
  onSaved
}: TradeEditModalProps) {
  const { strategies: rawStrategies, updateTrade } = useData();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState<'execution' | 'risk' | 'journal' | 'psychology' | 'history'>('execution');
  
  // Format trade date/time for form controls
  const initialDateStr = trade.date ? format(new Date(trade.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const initialTimeStr = trade.time || (trade.date ? format(new Date(trade.date), 'HH:mm') : '');

  const [formData, setFormData] = useState({
    date: initialDateStr,
    time: initialTimeStr,
    market: trade.market || 'EUR/USD',
    direction: trade.direction || 'BUY',
    entry: trade.entry !== undefined ? String(trade.entry) : '',
    exitPrice: trade.exitPrice !== undefined && trade.exitPrice !== null ? String(trade.exitPrice) : '',
    stopLoss: trade.stopLoss !== undefined && trade.stopLoss !== null ? String(trade.stopLoss) : '',
    takeProfit: trade.takeProfit !== undefined && trade.takeProfit !== null ? String(trade.takeProfit) : '',
    positionSize: trade.positionSize !== undefined && trade.positionSize !== null ? String(trade.positionSize) : '',
    risk: trade.risk !== undefined && trade.risk !== null ? String(trade.risk) : '',
    riskPercent: trade.riskPercent !== undefined && trade.riskPercent !== null ? String(trade.riskPercent) : '',
    strategy: trade.strategy || '',
    session: trade.session || 'London',
    timeframe: trade.timeframe || '15m',
    marketCondition: trade.marketCondition || 'Trending',
    emotions: trade.emotions || [],
    notes: trade.notes || '',
    mistake: trade.mistake || '',
    learning: trade.learning || '',
    screenshot: trade.screenshot || '',
    result: trade.result || '',
    pnl: trade.pnl !== undefined && trade.pnl !== null ? String(trade.pnl) : '',
    confidence: trade.confidence !== undefined ? String(trade.confidence) : '',
    setupQuality: trade.setupQuality || '',
    setupQualityReason: trade.setupQualityReason || '',
    newsEventId: trade.newsEventId || '',
    newsEventName: trade.newsEventName || '',
    newsImpact: trade.newsImpact || ''
  });

  const [otherEmotion, setOtherEmotion] = useState('');
  const [isDraggingScreenshot, setIsDraggingScreenshot] = useState(false);
  const initialFormRef = useRef(formData);

  useEffect(() => {
    setStrategies(rawStrategies.filter(s => s.status === 'Active'));
  }, [rawStrategies]);

  // Re-sync form data whenever trade prop changes
  useEffect(() => {
    const dStr = trade.date ? format(new Date(trade.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
    const tStr = trade.time || (trade.date ? format(new Date(trade.date), 'HH:mm') : '');
    const resetValues = {
      date: dStr,
      time: tStr,
      market: trade.market || 'EUR/USD',
      direction: trade.direction || 'BUY',
      entry: trade.entry !== undefined ? String(trade.entry) : '',
      exitPrice: trade.exitPrice !== undefined && trade.exitPrice !== null ? String(trade.exitPrice) : '',
      stopLoss: trade.stopLoss !== undefined && trade.stopLoss !== null ? String(trade.stopLoss) : '',
      takeProfit: trade.takeProfit !== undefined && trade.takeProfit !== null ? String(trade.takeProfit) : '',
      positionSize: trade.positionSize !== undefined && trade.positionSize !== null ? String(trade.positionSize) : '',
      risk: trade.risk !== undefined && trade.risk !== null ? String(trade.risk) : '',
      riskPercent: trade.riskPercent !== undefined && trade.riskPercent !== null ? String(trade.riskPercent) : '',
      strategy: trade.strategy || '',
      session: trade.session || 'London',
      timeframe: trade.timeframe || '15m',
      marketCondition: trade.marketCondition || 'Trending',
      emotions: trade.emotions || [],
      notes: trade.notes || '',
      mistake: trade.mistake || '',
      learning: trade.learning || '',
      screenshot: trade.screenshot || '',
      result: trade.result || '',
      pnl: trade.pnl !== undefined && trade.pnl !== null ? String(trade.pnl) : '',
      confidence: trade.confidence !== undefined ? String(trade.confidence) : '',
      setupQuality: trade.setupQuality || '',
      setupQualityReason: trade.setupQualityReason || '',
      newsEventId: trade.newsEventId || '',
      newsEventName: trade.newsEventName || '',
      newsImpact: trade.newsImpact || ''
    };
    setFormData(resetValues);
    initialFormRef.current = resetValues;
  }, [trade]);

  // Unsaved changes dirty detection
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormRef.current);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEmotion = (emotion: Emotion | string) => {
    setFormData(prev => {
      if (prev.emotions.includes(emotion as Emotion)) {
        return { ...prev, emotions: prev.emotions.filter(e => e !== emotion) };
      }
      return { ...prev, emotions: [...prev.emotions, emotion as Emotion] };
    });
  };

  const handleAddOtherEmotion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otherEmotion.trim()) {
      e.preventDefault();
      if (!formData.emotions.includes(otherEmotion.trim() as Emotion)) {
        toggleEmotion(otherEmotion.trim());
      }
      setOtherEmotion('');
    }
  };

  const processImageFile = async (file: File) => {
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 1280, 960, 0.82);
      setFormData(prev => ({ ...prev, screenshot: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file);
    }
    e.target.value = '';
  };

  const handleScreenshotDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingScreenshot(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file);
    }
  };

  // Clipboard paste support inside modal
  useEffect(() => {
    if (!isOpen) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Request to close modal safely
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  // Submit and save changes
  const handleSaveChanges = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Parse timestamp
      let tradeTimestamp = trade.date;
      if (formData.date) {
        const dateStr = formData.time ? `${formData.date}T${formData.time}` : `${formData.date}T12:00`;
        const parsed = new Date(dateStr).getTime();
        if (!isNaN(parsed)) {
          tradeTimestamp = parsed;
        }
      }

      // Safe numeric parsing: do NOT fake 0s for missing values!
      const parsedEntry = formData.entry !== '' ? parseFloat(formData.entry) : trade.entry;
      const parsedExitPrice = formData.exitPrice !== '' ? parseFloat(formData.exitPrice) : undefined;
      const parsedStopLoss = formData.stopLoss !== '' ? parseFloat(formData.stopLoss) : undefined;
      const parsedTakeProfit = formData.takeProfit !== '' ? parseFloat(formData.takeProfit) : undefined;
      const parsedPositionSize = formData.positionSize !== '' ? parseFloat(formData.positionSize) : undefined;
      const parsedRisk = formData.risk !== '' ? parseFloat(formData.risk) : undefined;
      const parsedRiskPercent = formData.riskPercent !== '' ? parseFloat(formData.riskPercent) : undefined;
      const parsedPnl = formData.pnl !== '' ? parseFloat(formData.pnl) : undefined;
      const parsedConfidence = formData.confidence !== '' ? parseInt(formData.confidence, 10) : undefined;

      // Realized R multiple calculation if PnL and Risk exist
      let rMultiple = trade.rMultiple;
      if (parsedPnl !== undefined && parsedRisk !== undefined && parsedRisk > 0) {
        rMultiple = Number((parsedPnl / parsedRisk).toFixed(2));
      }

      // Pre-planned RR ratio
      let rrRatio = trade.rrRatio;
      if (
        parsedEntry !== undefined && 
        parsedStopLoss !== undefined && 
        parsedTakeProfit !== undefined &&
        parsedStopLoss > 0 &&
        parsedTakeProfit > 0
      ) {
        const riskDist = Math.abs(parsedEntry - parsedStopLoss);
        const rewardDist = Math.abs(parsedTakeProfit - parsedEntry);
        if (riskDist > 0) {
          rrRatio = Number((rewardDist / riskDist).toFixed(2));
        }
      }

      const updates: Partial<Trade> = {
        date: tradeTimestamp,
        time: formData.time || undefined,
        market: formData.market as Market,
        direction: formData.direction as Direction,
        entry: parsedEntry,
        exitPrice: parsedExitPrice,
        stopLoss: parsedStopLoss,
        takeProfit: parsedTakeProfit,
        positionSize: parsedPositionSize,
        risk: parsedRisk,
        riskPercent: parsedRiskPercent,
        strategy: formData.strategy || undefined,
        session: (formData.session as Session) || undefined,
        timeframe: (formData.timeframe as Timeframe) || undefined,
        marketCondition: (formData.marketCondition as MarketCondition) || undefined,
        emotions: formData.emotions,
        notes: formData.notes,
        mistake: formData.mistake,
        learning: formData.learning,
        screenshot: formData.screenshot || undefined,
        result: formData.result ? (formData.result as any) : undefined,
        pnl: parsedPnl,
        rrRatio,
        rMultiple,
        confidence: parsedConfidence,
        setupQuality: (formData.setupQuality as 'A+' | 'B' | 'C') || undefined,
        setupQualityReason: formData.setupQualityReason || undefined,
        newsEventId: formData.newsEventId || undefined,
        newsEventName: formData.newsEventName || undefined,
        newsImpact: formData.newsImpact ? (formData.newsImpact === 'NON-ECONOMIC' ? 'LOW' : formData.newsImpact as 'HIGH' | 'MEDIUM' | 'LOW') : undefined
      };

      const result = await updateTrade(trade.id, updates);
      setIsSubmitting(false);
      initialFormRef.current = formData;
      if (onSaved && result) {
        onSaved(result);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to update trade:', err);
      alert(err.message || 'Failed to update trade. Please check your network connection.');
      setIsSubmitting(false);
    }
  };

  // Preview completeness status live
  const previewTradeObj = useMemo(() => {
    return {
      ...trade,
      entry: formData.entry !== '' ? parseFloat(formData.entry) : 0,
      exitPrice: formData.exitPrice !== '' ? parseFloat(formData.exitPrice) : undefined,
      stopLoss: formData.stopLoss !== '' ? parseFloat(formData.stopLoss) : undefined,
      takeProfit: formData.takeProfit !== '' ? parseFloat(formData.takeProfit) : undefined,
      risk: formData.risk !== '' ? parseFloat(formData.risk) : undefined,
      strategy: formData.strategy,
      session: formData.session as Session,
      timeframe: formData.timeframe as Timeframe,
      notes: formData.notes,
      mistake: formData.mistake,
      learning: formData.learning,
      screenshot: formData.screenshot,
      result: formData.result as any,
      emotions: formData.emotions
    } as Trade;
  }, [trade, formData]);

  const liveCompleteness = useMemo(() => {
    return getTradeCompleteness(previewTradeObj);
  }, [previewTradeObj]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                Edit Trade #{trade.id.slice(0, 8)}
              </h2>
              {isDirty && (
                <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Refine execution records, add missing insights, or attach screenshots.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live completeness pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <span 
                className={cn(
                  "w-2 h-2 rounded-full",
                  liveCompleteness.status === 'Complete' ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
              <span className="text-slate-700 dark:text-slate-300">
                {liveCompleteness.percentage}% Complete
              </span>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('execution')}
            className={cn(
              "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'execution'
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            Execution & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('risk')}
            className={cn(
              "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'risk'
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            Risk & Strategy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('journal')}
            className={cn(
              "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1",
              activeTab === 'journal'
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <span>Notes, Mistakes & Screenshot</span>
            {(!formData.screenshot || !formData.learning) && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('psychology')}
            className={cn(
              "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
              activeTab === 'psychology'
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            Psychology & Mindset
          </button>
          {trade.auditHistory && trade.auditHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1",
                activeTab === 'history'
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit History ({trade.auditHistory.length})</span>
            </button>
          )}
        </div>

        {/* Scrollable Form Content */}
        <form id="edit-trade-form" onSubmit={handleSaveChanges} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: EXECUTION & PRICING */}
          {activeTab === 'execution' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-market">Market / Asset</Label>
                  <Input
                    id="edit-market"
                    name="market"
                    value={formData.market}
                    onChange={handleInputChange}
                    placeholder="e.g. EUR/USD, BTC/USD, NVDA, US30"
                    required
                  />
                </div>

                <div>
                  <Label>Direction</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, direction: 'BUY' }))}
                      className={cn(
                        "py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150",
                        formData.direction === 'BUY'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      BUY / LONG
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, direction: 'SELL' }))}
                      className={cn(
                        "py-2 px-3 text-xs font-bold rounded-lg border transition-all duration-150",
                        formData.direction === 'SELL'
                          ? "bg-rose-50 text-rose-700 border-rose-500 dark:bg-rose-950/60 dark:text-rose-300"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      SELL / SHORT
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Execution Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Time</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <Label htmlFor="edit-entry">Entry Price</Label>
                  <Input
                    id="edit-entry"
                    type="number"
                    step="any"
                    name="entry"
                    value={formData.entry}
                    onChange={handleInputChange}
                    placeholder="1.0850"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-exitPrice" className="flex items-center justify-between">
                    <span>Exit Price</span>
                    <span className="text-[10px] text-slate-400 font-normal">Leave blank if pending</span>
                  </Label>
                  <Input
                    id="edit-exitPrice"
                    type="number"
                    step="any"
                    name="exitPrice"
                    value={formData.exitPrice}
                    onChange={handleInputChange}
                    placeholder="1.0920"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-result">Result Outcome</Label>
                  <select
                    id="edit-result"
                    name="result"
                    value={formData.result}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pending / Open</option>
                    <option value="WIN">WIN</option>
                    <option value="LOSS">LOSS</option>
                    <option value="BREAK EVEN">BREAK EVEN</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-pnl" className="flex items-center justify-between">
                    <span>Realized P&L ($)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Positive or negative</span>
                  </Label>
                  <Input
                    id="edit-pnl"
                    type="number"
                    step="any"
                    name="pnl"
                    value={formData.pnl}
                    onChange={handleInputChange}
                    placeholder="e.g. 250 or -100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RISK & STRATEGY */}
          {activeTab === 'risk' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-stopLoss">Stop Loss Price</Label>
                  <Input
                    id="edit-stopLoss"
                    type="number"
                    step="any"
                    name="stopLoss"
                    value={formData.stopLoss}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.0820"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-takeProfit">Take Profit Target</Label>
                  <Input
                    id="edit-takeProfit"
                    type="number"
                    step="any"
                    name="takeProfit"
                    value={formData.takeProfit}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.0950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-risk">Risk Amount ($)</Label>
                  <Input
                    id="edit-risk"
                    type="number"
                    step="any"
                    name="risk"
                    value={formData.risk}
                    onChange={handleInputChange}
                    placeholder="e.g. 150"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-riskPercent">Risk Percent (%)</Label>
                  <Input
                    id="edit-riskPercent"
                    type="number"
                    step="any"
                    name="riskPercent"
                    value={formData.riskPercent}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-positionSize">Position Size / Lots</Label>
                  <Input
                    id="edit-positionSize"
                    type="number"
                    step="any"
                    name="positionSize"
                    value={formData.positionSize}
                    onChange={handleInputChange}
                    placeholder="e.g. 1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-strategy">Strategy</Label>
                  <select
                    id="edit-strategy"
                    name="strategy"
                    value={formData.strategy}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Strategy</option>
                    {strategies.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    <option value="Discretionary">Discretionary</option>
                    <option value="Breakout">Breakout</option>
                    <option value="Trend Following">Trend Following</option>
                    <option value="Mean Reversion">Mean Reversion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-session">Session</Label>
                  <select
                    id="edit-session"
                    name="session"
                    value={formData.session}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="London">London</option>
                    <option value="New York">New York</option>
                    <option value="Asian">Asian</option>
                    <option value="London/NY Overlap">London/NY Overlap</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="edit-timeframe">Timeframe</Label>
                  <select
                    id="edit-timeframe"
                    name="timeframe"
                    value={formData.timeframe}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                    <option value="1H">1H</option>
                    <option value="4H">4H</option>
                    <option value="Daily">Daily</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTES, MISTAKES & SCREENSHOT */}
          {activeTab === 'journal' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Screenshot Upload / Replace */}
              <div>
                <Label className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Chart Screenshot</span>
                  </span>
                  {!formData.screenshot && (
                    <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Missing verification
                    </span>
                  )}
                </Label>

                {formData.screenshot ? (
                  <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img 
                      src={formData.screenshot} 
                      alt="Trade execution chart" 
                      className="w-full max-h-60 object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <label className="cursor-pointer px-2.5 py-1 text-xs font-semibold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 rounded-lg shadow-md hover:bg-white transition-colors">
                        Replace
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, screenshot: '' }))}
                        className="p-1 text-rose-600 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-md hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Delete screenshot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingScreenshot(true); }}
                    onDragLeave={() => setIsDraggingScreenshot(false)}
                    onDrop={handleScreenshotDrop}
                    className={cn(
                      "mt-2 border-2 border-dashed rounded-xl p-6 text-center transition-colors duration-150 cursor-pointer",
                      isDraggingScreenshot
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <label className="cursor-pointer flex flex-col items-center">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to upload or drag & drop chart
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">
                        PNG, JPG, WEBP • Or simply paste (Ctrl+V) from clipboard
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Economic News Catalyst */}
              <div className="space-y-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-blue-500" />
                    Economic News Catalyst (Optional)
                  </Label>
                  {formData.newsEventName && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, newsEventId: '', newsEventName: '', newsImpact: '' }))}
                      className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Clear Catalyst Link
                    </button>
                  )}
                </div>

                <select
                  value={formData.newsEventId}
                  onChange={(e) => {
                    const evId = e.target.value;
                    const selectedEv = NEWS_EVENTS.find(item => item.id === evId);
                    if (selectedEv) {
                      setFormData(prev => ({
                        ...prev,
                        newsEventId: selectedEv.id,
                        newsEventName: selectedEv.name,
                        newsImpact: selectedEv.impact
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        newsEventId: '',
                        newsEventName: '',
                        newsImpact: ''
                      }));
                    }
                  }}
                  className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="">No News Catalyst (Technical / Discretionary Execution)</option>
                  {NEWS_EVENTS.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      [{ev.impact}] {ev.currency} - {ev.name} ({ev.dateTime ? ev.dateTime.split('T')[0] : ''})
                    </option>
                  ))}
                </select>

                {formData.newsEventName && (
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-1">
                    Linked to "{formData.newsEventName}" in News Intelligence & Macro Analytics.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-notes">General Notes & Market Thesis</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Key technical confluences, HTF bias, news catalyst..."
                />
              </div>

              <div>
                <Label htmlFor="edit-learning" className="flex items-center justify-between">
                  <span>Key Learning / Takeaway</span>
                  {!formData.learning && (
                    <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Important field
                    </span>
                  )}
                </Label>
                <Textarea
                  id="edit-learning"
                  name="learning"
                  rows={2}
                  value={formData.learning}
                  onChange={handleInputChange}
                  placeholder="What rule did this trade reinforce for future executions?"
                />
              </div>

              <div>
                <Label htmlFor="edit-mistake">Mistake Analysis</Label>
                <Textarea
                  id="edit-mistake"
                  name="mistake"
                  rows={2}
                  value={formData.mistake}
                  onChange={handleInputChange}
                  placeholder="Execution flaw, premature exit, or 'Clean execution according to plan'..."
                />
              </div>
            </div>
          )}

          {/* TAB 4: PSYCHOLOGY & MINDSET */}
          {activeTab === 'psychology' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <Label>Emotions & Psychological State</Label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Select how you felt during entry and execution (strictly private to your personal journal).
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_EMOTIONS.map(emotion => {
                    const isSelected = formData.emotions.includes(emotion);
                    return (
                      <button
                        key={emotion}
                        type="button"
                        onClick={() => toggleEmotion(emotion)}
                        className={cn(
                          "px-3 py-1 text-xs rounded-full font-medium transition-all duration-150 border",
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        )}
                      >
                        {emotion}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3">
                  <Input
                    placeholder="Add custom emotional tag and press Enter..."
                    value={otherEmotion}
                    onChange={(e) => setOtherEmotion(e.target.value)}
                    onKeyDown={handleAddOtherEmotion}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <Label htmlFor="edit-confidence">Confidence Score (1–10)</Label>
                  <Input
                    id="edit-confidence"
                    type="number"
                    min="1"
                    max="10"
                    name="confidence"
                    value={formData.confidence}
                    onChange={handleInputChange}
                    placeholder="e.g. 8"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label className="text-base font-semibold">SETUP QUALITY</Label>
                <p className="text-xs text-slate-500 -mt-1">How would you rate this setup?</p>
                <div className="flex flex-wrap gap-3">
                  {(['A+', 'B', 'C'] as const).map(quality => (
                    <button
                      key={quality}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, setupQuality: quality === prev.setupQuality ? '' : quality }))}
                      className={cn(
                        "px-4 py-2 rounded-lg border font-bold transition-all flex items-center gap-2",
                        formData.setupQuality === quality 
                          ? (quality === 'A+' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : quality === 'B' ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400')
                          : 'border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <span>{quality === 'A+' ? '🟢' : quality === 'B' ? '🟡' : '🔴'}</span>
                      <span>{quality}</span>
                    </button>
                  ))}
                </div>
                {formData.setupQuality && (
                  <div className="space-y-3 mt-3">
                    <p className={cn("text-xs font-medium", 
                      formData.setupQuality === 'A+' ? 'text-emerald-600 dark:text-emerald-400' : 
                      formData.setupQuality === 'B' ? 'text-amber-600 dark:text-amber-400' : 
                      'text-rose-600 dark:text-rose-400'
                    )}>
                      {formData.setupQuality === 'A+' && "Highest-quality setup according to your rules."}
                      {formData.setupQuality === 'B' && "Acceptable setup, but not your strongest setup."}
                      {formData.setupQuality === 'C' && "Weak setup or significant deviation from your ideal setup."}
                    </p>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Why did you rate this setup this way? (Optional)</Label>
                      <Input 
                        name="setupQualityReason"
                        value={formData.setupQualityReason}
                        onChange={handleInputChange}
                        placeholder={
                          formData.setupQuality === 'A+' ? "e.g., All strategy conditions aligned perfectly..." :
                          formData.setupQuality === 'B' ? "e.g., Entry was valid but HTF confirmation was weak..." :
                          "e.g., Entered late and missed the ideal entry..."
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Guaranteed:</strong> Personal psychological tags, confidence ratings, and private notes are NEVER shared across competitions or external leaderboards.
                </span>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT HISTORY */}
          {activeTab === 'history' && trade.auditHistory && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-500" />
                <span>Audit Trail for Financial & Execution Adjustments</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {trade.auditHistory.slice().reverse().map((entry, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 capitalize">
                        {entry.field}
                      </span>
                      <span className="text-slate-400 mx-1.5">:</span>
                      <span className="text-rose-600 dark:text-rose-400 line-through mr-2">
                        {String(entry.oldValue ?? 'None')}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        → {String(entry.newValue ?? 'None')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {format(new Date(entry.changedAt), 'MMM dd, HH:mm:ss')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {liveCompleteness.missingItems.length === 0 
                ? '✓ All key journal fields complete' 
                : `● ${liveCompleteness.missingItems.length} fields missing`}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAttemptClose}
              disabled={isSubmitting}
              className="font-semibold text-xs text-slate-600 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSaveChanges()}
              disabled={isSubmitting}
              className="font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white min-w-28 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Unsaved Changes Safety Dialog */}
        {showUnsavedPrompt && (
          <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl text-center animate-in zoom-in-95 duration-150">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                You have unsaved changes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">
                Do you want to save your journal modifications before leaving?
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setShowUnsavedPrompt(false);
                    handleSaveChanges();
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowUnsavedPrompt(false);
                    onClose();
                  }}
                  className="w-full text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                >
                  Discard Changes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUnsavedPrompt(false)}
                  className="w-full text-xs font-semibold"
                >
                  Continue Editing
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
