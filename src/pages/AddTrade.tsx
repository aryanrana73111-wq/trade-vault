import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Input, Label, Textarea, Badge } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useData } from '@/contexts/DataContext';
import { getSettings } from '@/lib/settings';
import { Trade, Market, Direction, Session, Emotion, Timeframe, MarketCondition, Strategy } from '@/types';
import { cn, formatCurrency } from '@/lib/utils';
import { calculateTradeMetrics } from '@/lib/calculations';
import { compressImageToDataUrl } from '@/lib/avatarStorage';
import { UploadCloud, CheckCircle2, X, AlertTriangle, GraduationCap, Newspaper, Swords, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { useArena } from '@/contexts/ArenaContext';
import { useAuth } from '@/contexts/AuthContext';
import { addCompetitionTrade } from '@/lib/arenaService';
import { MarketSelector } from '@/components/common/MarketSelector';

export interface AddTradeProps {
  onSuccess?: (savedTrade: Trade) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function AddTrade({ onSuccess, onCancel, isModal }: AddTradeProps = {}) {
  const navigate = useNavigate();
  const { strategies: rawStrategies, saveTrade } = useData();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  
  const [formData, setFormData] = useState(() => {
    const s = getSettings();
    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      market: (s.entryPreferences.market || '') as Market,
      direction: (s.entryPreferences.direction || 'BUY') as Direction,
      entry: '',
      stopLoss: '',
      takeProfit: '',
      positionSize: '',
      risk: '',
      riskPercent: s.entryPreferences.risk || s.risk.defaultRisk.toString(),
      strategy: s.entryPreferences.strategy || '',
      session: (s.entryPreferences.session || '') as Session,
      timeframe: (s.entryPreferences.timeframe || '') as Timeframe,
      marketCondition: '' as MarketCondition,
      emotions: [] as Emotion[],
      setupQuality: undefined as 'A+' | 'B' | 'C' | undefined,
      setupQualityReason: '',
      notes: '',
      mistake: '',
      learning: '',
      result: '' as 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | '',
      pnl: '',
      screenshot: '',
      exitScreenshot: '',
      newsEventId: '',
      newsEventName: '',
      newsImpact: '',
      
      thesis: {
        marketThesis: '',
        catalyst: '',
        timeHorizon: '',
        invalidation: ''
      },
      execution: {
        plannedEntry: '',
        plannedStop: '',
        plannedTarget: '',
        spread: '',
        commission: '',
        slippage: ''
      }
    };
  });

  const [otherEmotion, setOtherEmotion] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [prefilledFromCalculator, setPrefilledFromCalculator] = useState(false);
  const [academySource, setAcademySource] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const { user } = useAuth();
  const { arenas } = useArena();
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<string[]>([]);

  // Eligible active competitions
  const activeCompetitions = useMemo(() => {
    return arenas.filter(a => a.status === 'active' || (!a.status && (a as any).isLive !== false));
  }, [arenas]);

  useEffect(() => {
    if (location.state?.prefill) {
      const p = location.state.prefill;
      setFormData(prev => ({
        ...prev,
        market: (p.market || prev.market) as Market,
        direction: (p.direction || prev.direction) as Direction,
        entry: p.entry !== undefined ? p.entry : prev.entry,
        stopLoss: p.stopLoss !== undefined ? p.stopLoss : prev.stopLoss,
        takeProfit: p.takeProfit !== undefined ? p.takeProfit : prev.takeProfit,
        positionSize: p.positionSize !== undefined ? p.positionSize : prev.positionSize,
        risk: p.risk !== undefined ? p.risk : prev.risk,
        riskPercent: p.riskPercent !== undefined ? p.riskPercent : prev.riskPercent,
        notes: p.notes !== undefined ? p.notes : prev.notes,
        session: (p.session || prev.session) as Session,
      }));
      setPrefilledFromCalculator(true);
    }
    if (location.state?.newsPrefill) {
      const np = location.state.newsPrefill;
      setFormData(prev => ({
        ...prev,
        market: (np.currency ? (np.currency === 'USD' ? 'EUR/USD' : `${np.currency}/USD`) : prev.market) as Market,
        newsEventId: np.id || '',
        newsEventName: np.name || '',
        newsImpact: np.impact || '',
      }));
    }
    if (location.state?.academySource) {
      setAcademySource(location.state.academySource);
    }
  }, [location.state]);

  useEffect(() => {
    setStrategies(rawStrategies.filter(s => s.status === 'Active'));
  }, [rawStrategies]);

  const selectedStrategyObj = useMemo(() => {
    return strategies.find(s => s.id === formData.strategy || s.name === formData.strategy);
  }, [formData.strategy, strategies]);

  // Strategy Risk Check
  const riskWarning = useMemo(() => {
    if (!selectedStrategyObj || !formData.risk) return null;
    const currentRisk = parseFloat(formData.risk);
    const maxRisk = selectedStrategyObj.riskRules.maxRisk;
    if (maxRisk > 0 && currentRisk > maxRisk) {
      return `Your planned risk ($${currentRisk}) exceeds this strategy's maximum risk ($${maxRisk}).`;
    }
    return null;
  }, [selectedStrategyObj, formData.risk]);

  // Auto Calculations
  const [calc, setCalc] = useState({
    rrRatio: 0,
    potentialProfit: 0,
    potentialLoss: 0,
  });

  useEffect(() => {
    const metrics = calculateTradeMetrics({
      entry: parseFloat(formData.entry),
      stopLoss: parseFloat(formData.stopLoss),
      takeProfit: parseFloat(formData.takeProfit),
      direction: formData.direction as Direction,
      risk: parseFloat(formData.risk),
      positionSize: parseFloat(formData.positionSize)
    });

    if (metrics) {
      setCalc({
        rrRatio: parseFloat(metrics.riskRewardRatio.toFixed(2)),
        potentialProfit: parseFloat(metrics.potentialProfit.toFixed(2)),
        potentialLoss: parseFloat(metrics.potentialLoss.toFixed(2))
      });
    } else {
      setCalc({ rrRatio: 0, potentialProfit: 0, potentialLoss: 0 });
    }
  }, [formData.entry, formData.stopLoss, formData.takeProfit, formData.risk, formData.direction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEmotion = (emotion: string) => {
    setFormData(prev => {
      if (prev.emotions.includes(emotion)) {
        return { ...prev, emotions: prev.emotions.filter(e => e !== emotion) };
      }
      return { ...prev, emotions: [...prev.emotions, emotion] };
    });
  };

  const handleAddOtherEmotion = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && otherEmotion.trim()) {
      e.preventDefault();
      if (!formData.emotions.includes(otherEmotion.trim())) {
        toggleEmotion(otherEmotion.trim());
      }
      setOtherEmotion('');
    }
  };

  const [isDraggingScreenshot, setIsDraggingScreenshot] = useState(false);
  const [isDraggingExitScreenshot, setIsDraggingExitScreenshot] = useState(false);

  const processImageFile = async (file: File, target: 'screenshot' | 'exitScreenshot' = 'screenshot') => {
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file, 1280, 960, 0.82);
      setFormData(prev => ({ ...prev, [target]: compressed }));
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [target]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'screenshot' | 'exitScreenshot' = 'screenshot') => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageFile(file, target);
    }
    e.target.value = '';
  };

  const handleScreenshotDrop = async (e: React.DragEvent, target: 'screenshot' | 'exitScreenshot' = 'screenshot') => {
    e.preventDefault();
    e.stopPropagation();
    if (target === 'exitScreenshot') {
      setIsDraggingExitScreenshot(false);
    } else {
      setIsDraggingScreenshot(false);
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processImageFile(file, target);
    }
  };

  const handleRemoveScreenshot = (target: 'screenshot' | 'exitScreenshot' = 'screenshot') => {
    setFormData(prev => ({ ...prev, [target]: '' }));
  };

  // Allow pasting screenshot anywhere on the form (e.g. Snipping tool / clipboard)
  // Pastes to Entry screenshot first if empty, else Exit screenshot if empty
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setFormData(prev => {
              const target = !prev.screenshot ? 'screenshot' : (!prev.exitScreenshot ? 'exitScreenshot' : 'screenshot');
              processImageFile(file, target);
              return prev;
            });
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    
    let finalPnl = undefined;
    if (formData.result === 'WIN' || formData.result === 'LOSS') {
      if (formData.pnl !== '') {
        finalPnl = parseFloat(formData.pnl);
        if (formData.result === 'LOSS' && finalPnl > 0) finalPnl = -finalPnl;
      } else {
        finalPnl = formData.result === 'WIN' ? calc.potentialProfit : -calc.potentialLoss;
      }
    } else if (formData.result === 'BREAK EVEN') {
      finalPnl = 0;
    }
    
    let ruleAdherence: number | undefined = undefined;
    if (selectedStrategyObj && selectedStrategyObj.checklist.length > 0) {
      const completed = Object.values(checklistState).filter(Boolean).length;
      ruleAdherence = Math.round((completed / selectedStrategyObj.checklist.length) * 100);
    }

    // Parse date and time to timestamp
    let tradeTimestamp = Date.now();
    if (formData.date) {
      const dateStr = formData.time ? `${formData.date}T${formData.time}` : `${formData.date}T12:00`;
      tradeTimestamp = new Date(dateStr).getTime();
    }

    const tradePayload = {
      date: tradeTimestamp,
      time: formData.time,
      market: formData.market,
      direction: formData.direction,
      entry: parseFloat(formData.entry) || 0,
      stopLoss: parseFloat(formData.stopLoss) || 0,
      takeProfit: parseFloat(formData.takeProfit) || 0,
      positionSize: parseFloat(formData.positionSize) || 0,
      risk: parseFloat(formData.risk) || 0,
      riskPercent: parseFloat(formData.riskPercent) || 0,
      strategy: formData.strategy, // Using the name or ID as string
      session: formData.session,
      timeframe: formData.timeframe,
      marketCondition: formData.marketCondition,
      emotions: formData.emotions,
      setupQuality: formData.setupQuality,
      setupQualityReason: formData.setupQualityReason,
      notes: formData.notes,
      mistake: formData.mistake,
      learning: formData.learning,
      screenshot: formData.screenshot,
      entryScreenshot: formData.screenshot || undefined,
      exitScreenshot: formData.exitScreenshot || undefined,
      result: formData.result ? formData.result as any : undefined,
      pnl: finalPnl,
      rrRatio: calc.rrRatio,
      rMultiple: finalPnl && parseFloat(formData.risk) > 0 ? finalPnl / parseFloat(formData.risk) : undefined,
      ruleAdherence,
      checklistState,
      newsEventId: formData.newsEventId || undefined,
      newsEventName: formData.newsEventName || undefined,
      newsImpact: (formData.newsImpact as 'LOW' | 'MEDIUM' | 'HIGH') || undefined,
    };

    try {
      const savedTrade = await saveTrade(tradePayload);
      
      // Link trade into any selected competitions without duplicating canonical record
      if (selectedCompetitionIds.length > 0 && user && savedTrade) {
        for (const compId of selectedCompetitionIds) {
          try {
            const comp = arenas.find(a => a.id === compId);
            const member = comp?.members?.[user.uid];
            await addCompetitionTrade({
              competitionId: compId,
              userId: user.uid,
              userDisplayName: member?.displayName || user.displayName || 'Trader',
              userAvatar: member?.photoURL || user.photoURL || undefined,
              trade: {
                date: new Date(formData.time ? `${formData.date}T${formData.time}` : `${formData.date}T12:00`).getTime(),
                time: formData.time,
                market: formData.market,
                direction: formData.direction,
                entry: parseFloat(formData.entry) || 0,
                exit: undefined,
                stopLoss: parseFloat(formData.stopLoss) || 0,
                takeProfit: parseFloat(formData.takeProfit) || 0,
                positionSize: parseFloat(formData.positionSize) || 1,
                riskAmount: parseFloat(formData.risk) || 0,
                riskPercent: parseFloat(formData.riskPercent) || undefined,
                result: (formData.result ? (formData.result as any) : undefined),
                pnl: finalPnl,
                rMultiple: finalPnl && parseFloat(formData.risk) > 0 ? Number((finalPnl / parseFloat(formData.risk)).toFixed(2)) : undefined,
                strategy: formData.strategy || 'Discretionary',
                session: formData.session,
                timeframe: formData.timeframe,
                screenshot: formData.screenshot || undefined,
                sharedNotes: formData.notes,
                ruleAdherence,
                mistake: formData.mistake || undefined,
                learning: formData.learning || undefined
              },
              addToPersonalJournal: false
            });
          } catch (syncErr) {
            console.error('Failed to sync trade to competition ' + compId, syncErr);
          }
        }
      }

      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);

      if (onSuccess && savedTrade) {
        onSuccess(savedTrade);
        return;
      }

      if (addAnother) {
        setFormData(prev => ({
          ...prev,
          date: format(new Date(), 'yyyy-MM-dd'),
          time: format(new Date(), 'HH:mm'),
          entry: '', stopLoss: '', takeProfit: '', notes: '', mistake: '', learning: '', risk: '', riskPercent: '', positionSize: '', screenshot: '', exitScreenshot: '', result: '', pnl: '',
          setupQuality: undefined, setupQualityReason: ''
        }));
        setChecklistState({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        navigate('/journal');
      }
    } catch (error: any) {
      console.error('Error saving trade:', error);
      alert(error.message || 'Failed to save trade.');
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto relative", isModal ? "pb-4 px-1" : "pb-40 md:pb-24")}>
      {isModal && onCancel ? (
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add New Trade</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter trade details and review behavioral metrics directly in Psychology</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add New Trade</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Document your trade details thoroughly.</p>
        </div>
      )}

      {academySource && (
        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-100 animate-in fade-in duration-150 shadow-sm">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <div>
              <span className="font-bold block">TradeVault Academy Execution Drill</span>
              <span className="text-indigo-700 dark:text-indigo-300">
                Drill context: {academySource} • Maintain strict invariant 1% risk and pre-planned technical invalidation.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAcademySource(null)}
            className="p-1 rounded-md text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {prefilledFromCalculator && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-100 animate-in fade-in duration-150 shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <span className="font-bold block">Pre-filled from Risk Calculator</span>
              <span className="text-blue-700 dark:text-blue-300">
                Loaded {formData.market} ({formData.direction}) • Entry: {formData.entry} • SL: {formData.stopLoss} • Position: {formData.positionSize} • Risk: {formData.risk}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPrefilledFromCalculator(false)}
            className="p-1 rounded-md text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-8">
        
        {/* Date & Time */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Trade Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-base">Date</Label>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="space-y-3">
              <Label className="text-base">Time</Label>
              <Input type="time" name="time" value={formData.time} onChange={handleInputChange} />
            </div>
          </div>
        </Card>

        {/* Market & Direction */}
        <Card className="p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <MarketSelector
                value={formData.market}
                onChange={(m) => setFormData(prev => ({ ...prev, market: m as any }))}
                userId={user?.uid}
                required
                label="Market"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-base">Direction</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'BUY' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.direction === 'BUY' 
                      ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-green-200 hover:bg-green-50'
                  )}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'SELL' }))}
                  className={cn(
                    "flex-1 h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.direction === 'SELL' 
                      ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50'
                  )}
                >
                  SELL (SHORT)
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Trade Parameters & Calculations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-8 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Execution Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Entry Price</Label>
                <Input name="entry" type="number" step="any" placeholder="e.g. 2458.20" required value={formData.entry} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Lot / Position Size</Label>
                <Input name="positionSize" type="number" step="any" placeholder="e.g. 0.50" required value={formData.positionSize} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Stop Loss</Label>
                <Input name="stopLoss" type="number" step="any" placeholder="e.g. 2453.20" required value={formData.stopLoss} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label>Take Profit</Label>
                <Input name="takeProfit" type="number" step="any" placeholder="e.g. 2470.20" value={formData.takeProfit} onChange={handleInputChange} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Risk Amount (USD)</Label>
                <Input name="risk" type="number" step="any" placeholder="e.g. 250" icon={<span className="text-sm font-medium">$</span>} value={formData.risk} onChange={handleInputChange} />
              </div>
            </div>

            {riskWarning && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Strategy Risk Rule Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">{riskWarning}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-sm bg-slate-900 text-white flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-400 mb-6 uppercase tracking-wider">Auto Calculations</h3>
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Risk : Reward</p>
                <div className="text-3xl font-light">
                  1 : <span className="font-bold text-white">{calc.rrRatio > 0 ? calc.rrRatio : '-'}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pot. Loss</p>
                  <p className="text-lg font-semibold text-red-400">{calc.potentialLoss > 0 ? formatCurrency(calc.potentialLoss) : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pot. Profit</p>
                  <p className="text-lg font-semibold text-green-400">{calc.potentialProfit > 0 ? formatCurrency(calc.potentialProfit) : '-'}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Strategy & Context */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Context & Strategy</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base text-slate-800 font-semibold">Strategy</Label>
                {strategies.length > 0 ? (
                  <select 
                    name="strategy" 
                    value={formData.strategy} 
                    onChange={handleInputChange} 
                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Strategy...</option>
                    {strategies.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <Input name="strategy" value={formData.strategy} onChange={handleInputChange} placeholder="e.g. Liquidity Sweep" />
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Session</Label>
                  <select name="session" value={formData.session} onChange={handleInputChange} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['Asian', 'London', 'New York', 'Sydney'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Timeframe</Label>
                  <select name="timeframe" value={formData.timeframe} onChange={handleInputChange} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['1m', '3m', '5m', '15m', '30m', '1H', '4H', 'Daily', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Condition</Label>
                  <select name="marketCondition" value={formData.marketCondition} onChange={handleInputChange} className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['Trending', 'Ranging', 'Breakout', 'Reversal', 'Choppy', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {selectedStrategyObj && selectedStrategyObj.checklist.length > 0 && (
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Strategy Checklist</h4>
                  <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                    {Object.values(checklistState).filter(Boolean).length} / {selectedStrategyObj.checklist.length} completed
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedStrategyObj.checklist.map(item => (
                    <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={checklistState[item.id] || false}
                          onChange={(e) => setChecklistState(prev => ({ ...prev, [item.id]: e.target.checked }))}
                        />
                        <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                        <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                      </div>
                      <span className={cn("text-sm transition-colors", checklistState[item.id] ? "text-slate-400 line-through" : "text-slate-700")}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Macro News Catalyst Link */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5 text-blue-500" />
                  Economic News Catalyst (Optional)
                </Label>
                {formData.newsEventName && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, newsEventId: '', newsEventName: '', newsImpact: '' }))}
                    className="text-[11px] text-rose-500 hover:text-rose-700 font-semibold"
                  >
                    Clear Link
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
                className="flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              >
                <option value="">No News Catalyst (Technical / Discretionary)</option>
                {NEWS_EVENTS.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    [{ev.impact}] {ev.currency} - {ev.name} ({ev.dateTime ? ev.dateTime.split('T')[0] : ''})
                  </option>
                ))}
              </select>

              {formData.newsEventName && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  Trade will be linked to "{formData.newsEventName}" in News Intelligence & Behavioral Diagnostics.
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Label className="text-base font-semibold">SETUP QUALITY</Label>
              <p className="text-xs text-slate-500 -mt-1">How would you rate this setup?</p>
              <div className="flex flex-wrap gap-3">
                {(['A+', 'B', 'C'] as const).map(quality => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, setupQuality: quality === prev.setupQuality ? undefined : quality }))}
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

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-end">
                <Label className="text-base">Strategy / Trade Thesis</Label>
                <span className="text-xs text-slate-400">{formData.strategy.length} chars</span>
              </div>
              <Textarea 
                name="strategy" 
                value={formData.strategy} 
                onChange={handleInputChange}
                className="min-h-[120px]" 
                placeholder="Why did you take this trade? What setup did you identify? What confirmation did you wait for?"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base">Emotions</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {(['Confident', 'Unconfident'] as const).map(emotion => (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotion(emotion)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                      formData.emotions.includes(emotion)
                        ? (emotion === 'Confident'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700 shadow-xs'
                            : 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700 shadow-xs')
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                    )}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Entry & Exit Screenshots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1st: Entry Screenshot */}
          <Card className="p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Entry Screenshot</span>
                  <span className="text-xs font-normal text-slate-400">1st (Execution)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chart setup at the moment of entry</p>
              </div>
              {formData.screenshot && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  Added
                </span>
              )}
            </div>
            
            {formData.screenshot ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-950/5 dark:bg-slate-950">
                <img src={formData.screenshot} alt="Entry Screenshot" className="w-full h-auto object-contain max-h-[300px] mx-auto" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Label htmlFor="entry-screenshot-upload" className="cursor-pointer bg-white text-slate-900 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 shadow-md">
                    Replace
                  </Label>
                  <button type="button" onClick={() => handleRemoveScreenshot('screenshot')} className="bg-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 shadow-md">
                    Remove
                  </button>
                </div>
                <input 
                  id="entry-screenshot-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, 'screenshot')}
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingScreenshot(true);
                }}
                onDragLeave={() => setIsDraggingScreenshot(false)}
                onDrop={(e) => handleScreenshotDrop(e, 'screenshot')}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group min-h-[220px]",
                  isDraggingScreenshot 
                    ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40" 
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                )}
              >
                <Label htmlFor="entry-screenshot-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                  <div className="w-11 h-11 bg-blue-100 dark:bg-blue-950/70 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 text-center">
                    Upload Entry Screenshot
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    PNG, JPG, WEBP or Paste (Ctrl+V)
                  </p>
                  <input 
                    id="entry-screenshot-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'screenshot')}
                  />
                </Label>
              </div>
            )}
          </Card>

          {/* 2nd: Exit Screenshot (Optional) */}
          <Card className="p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Exit Screenshot</span>
                  <span className="text-xs font-normal text-slate-400">2nd (Optional)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Chart outcome when closing or exiting trade</p>
              </div>
              {formData.exitScreenshot ? (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  Added
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 font-medium">
                  Optional
                </span>
              )}
            </div>
            
            {formData.exitScreenshot ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-950/5 dark:bg-slate-950">
                <img src={formData.exitScreenshot} alt="Exit Screenshot" className="w-full h-auto object-contain max-h-[300px] mx-auto" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Label htmlFor="exit-screenshot-upload" className="cursor-pointer bg-white text-slate-900 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-100 shadow-md">
                    Replace
                  </Label>
                  <button type="button" onClick={() => handleRemoveScreenshot('exitScreenshot')} className="bg-red-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 shadow-md">
                    Remove
                  </button>
                </div>
                <input 
                  id="exit-screenshot-upload"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, 'exitScreenshot')}
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingExitScreenshot(true);
                }}
                onDragLeave={() => setIsDraggingExitScreenshot(false)}
                onDrop={(e) => handleScreenshotDrop(e, 'exitScreenshot')}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer group min-h-[220px]",
                  isDraggingExitScreenshot 
                    ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40" 
                    : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                )}
              >
                <Label htmlFor="exit-screenshot-upload" className="cursor-pointer flex flex-col items-center justify-center w-full">
                  <div className="w-11 h-11 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1 text-center">
                    Upload Exit Screenshot
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    Optional • Shows chart at trade exit / conclusion
                  </p>
                  <input 
                    id="exit-screenshot-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'exitScreenshot')}
                  />
                </Label>
              </div>
            )}
          </Card>
        </div>

        {/* Notes & Learning */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Review & Result</h3>
          <div className="space-y-8">
            <div className="space-y-3">
              <Label className="text-base">Trade Result (Optional)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'WIN' ? '' : 'WIN' }))}
                  className={cn(
                    "h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'WIN' 
                      ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-green-200 hover:bg-green-50'
                  )}
                >
                  WIN
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'LOSS' ? '' : 'LOSS' }))}
                  className={cn(
                    "h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'LOSS' 
                      ? 'border-red-500 bg-red-500 text-white shadow-md shadow-red-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-red-200 hover:bg-red-50'
                  )}
                >
                  LOSS
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'BREAK EVEN' ? '' : 'BREAK EVEN', pnl: '0' }))}
                  className={cn(
                    "h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'BREAK EVEN' 
                      ? 'border-blue-500 bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50'
                  )}
                >
                  BREAK EVEN
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, result: prev.result === 'PENDING' ? '' : 'PENDING' }))}
                  className={cn(
                    "h-11 rounded-lg font-bold text-sm transition-all border-2",
                    formData.result === 'PENDING' 
                      ? 'border-yellow-500 bg-yellow-500 text-white shadow-md shadow-yellow-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-yellow-300 hover:bg-yellow-50'
                  )}
                >
                  PENDING
                </button>
              </div>
            </div>

            {(formData.result === 'WIN' || formData.result === 'LOSS') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label>Realized P&L (USD)</Label>
                <Input 
                  name="pnl" 
                  type="number" 
                  step="any" 
                  placeholder={formData.result === 'WIN' ? calc.potentialProfit.toString() : calc.potentialLoss.toString()} 
                  value={formData.pnl} 
                  onChange={handleInputChange} 
                  icon={<span className="text-sm font-medium">$</span>}
                />
                <p className="text-xs text-slate-500">Leave blank to use calculated auto-P&L.</p>
              </div>
            )}
            {formData.result === 'PENDING' && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                Result is pending. Realized P&L will not be calculated.
              </div>
            )}

            <div className="space-y-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Why did you take this trade?" />
              </div>
              <div className="space-y-2">
                <Label className="text-red-600">What mistake did I make?</Label>
                <Textarea name="mistake" value={formData.mistake} onChange={handleInputChange} placeholder="Entered too early, moved SL, overtraded..." className="focus:ring-red-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-green-600">What did I learn from this trade?</Label>
                <Textarea name="learning" value={formData.learning} onChange={handleInputChange} placeholder="What will you do differently next time?" className="focus:ring-green-500" />
              </div>
            </div>
          </div>
        </Card>

        {/* Competition Arena 2.0 Linking Card */}
        <Card className="p-6 border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-white via-white to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/20">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Add this trade to Competition Data?
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optionally link this trade directly into active arena competitions. Uses relational trade linking—never duplicates your canonical financial records.
              </p>
            </div>
            {selectedCompetitionIds.length > 0 && (
              <Badge variant="neutral" className="text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/50">
                {selectedCompetitionIds.length} Selected
              </Badge>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            {/* No Competition Option */}
            <label className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <input
                type="radio"
                name="competition_toggle"
                checked={selectedCompetitionIds.length === 0}
                onChange={() => setSelectedCompetitionIds([])}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">No Competition</span>
                <span className="text-slate-400 block text-[11px]">Keep strictly in personal trading journal</span>
              </div>
            </label>

            {/* Active Competitions List */}
            {activeCompetitions.length > 0 ? (
              activeCompetitions.map((comp) => {
                const isSelected = selectedCompetitionIds.includes(comp.id);
                return (
                  <label
                    key={comp.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/30 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCompetitionIds(prev => [...prev, comp.id]);
                          } else {
                            setSelectedCompetitionIds(prev => prev.filter(id => id !== comp.id));
                          }
                        }}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {comp.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {comp.scoringMode || 'Total R'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {Object.keys(comp.members || {}).length} participants • Ends {new Date(comp.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Trophy className="w-4 h-4 text-amber-500 opacity-80" />
                  </label>
                );
              })
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                You haven&apos;t joined or created any active competitions yet. You can launch one anytime from the <span className="font-semibold text-indigo-600">Competition Arena</span> tab.
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        {isModal ? (
          <div className="sticky bottom-0 p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-3 z-30 -mx-4 -mb-4 mt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
                Cancel
              </Button>
            )}
            <Button type="submit" size="lg" disabled={isSubmitting || !formData.market || !formData.entry} className="w-full sm:w-auto min-w-[160px]">
              Save & View Psychology
            </Button>
          </div>
        ) : (
          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
            <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)} className="w-full sm:w-auto">
              Save & Add Another
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting || !formData.market || !formData.entry} className="w-full sm:w-auto min-w-[160px]">
              Save Trade
            </Button>
          </div>
        )}
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 right-8 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="font-medium text-sm">Trade saved successfully.</span>
        </div>
      )}
    </div>
  );
}
