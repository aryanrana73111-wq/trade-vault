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
import { UploadCloud, CheckCircle2, X, AlertTriangle, Newspaper, Swords, Trophy, Zap, Plus, Sparkles, RefreshCw, Layers, Sliders, Info, HelpCircle, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { NEWS_EVENTS } from '@/data/newsIntelligenceData';
import { useArena } from '@/contexts/ArenaContext';
import { useAuth } from '@/contexts/AuthContext';
import { addCompetitionTrade } from '@/lib/arenaService';
import { MarketSelector } from '@/components/common/MarketSelector';
import { MT5ExtractedTrade } from '@/types/mt5Screenshot';
import { FieldSourceIndicator, FieldSource } from '@/components/common/FieldSourceIndicator';
import { fetchHistoricalPrice } from '@/lib/historicalPriceClient';
import { HistoricalQuoteResult } from '@/types/marketData';
import { calculateRiskAmountFromLot, calculateRealizedPnlFromExit, getInstrumentSpecification } from '@/lib/instrumentSpecs';
import { saveMT5ScreenshotAttachment } from '@/lib/mt5ScreenshotStorage';
import { TradeSaveCelebrationModal, TradeCelebrationData } from '@/components/trades/TradeSaveCelebrationModal';
import { MilestoneUnlockCelebrationModal } from '@/components/dashboard/milestones/MilestoneUnlockCelebrationModal';
import { 
  MILESTONE_FEATURES, 
  MilestoneFeatureDef, 
  getQualifyingTrades, 
  getUnlockedMilestonesCount, 
  getAcknowledgedMilestones, 
  setAcknowledgedMilestones 
} from '@/lib/milestoneAnalytics';

// Feature Flags: Currently locked as requested for upcoming release
const IS_MT5_CONNECTOR_LOCKED = true;
const IS_SCREENSHOT_REVIEW_LOCKED = true;

export interface AddTradeProps {
  onSuccess?: (savedTrade: Trade) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

export default function AddTrade({ onSuccess, onCancel, isModal }: AddTradeProps = {}) {
  const navigate = useNavigate();
  const { trades = [], strategies: rawStrategies, saveTrade } = useData();
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
      extraImages: [] as string[],
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();

  const [entryMode, setEntryMode] = useState<'manual' | 'mt5'>(() => {
    if (location.state?.mode === 'mt5' || new URLSearchParams(location.search).get('tab') === 'mt5') {
      return 'mt5';
    }
    return 'manual';
  });

  const { user } = useAuth();
  const { arenas } = useArena();
  const [selectedCompetitionIds, setSelectedCompetitionIds] = useState<string[]>([]);

  // MT5 Screenshot & Provenance State
  const [mt5ScreenshotUrl, setMt5ScreenshotUrl] = useState<string>('');
  const [rawSymbol, setRawSymbol] = useState<string>('');
  const [normalizedMarket, setNormalizedMarket] = useState<string>('');
  const [symbolMappingSource, setSymbolMappingSource] = useState<string>('');
  const [mt5TicketId, setMt5TicketId] = useState<string>('');
  const [mt5AnalysisId, setMt5AnalysisId] = useState<string>('');
  const [mt5CurrentImageId, setMt5CurrentImageId] = useState<string>('');
  const [tradeSource, setTradeSource] = useState<'manual' | 'mt5_screenshot'>('manual');
  const [screenshotNotice, setScreenshotNotice] = useState<string | null>(null);

  // Field provenance tracking (manual | historical_quote | mt5_screenshot | auto_calculated | quick_result_1r)
  const [fieldSources, setFieldSources] = useState<Record<string, FieldSource>>({});

  // Historical price auto-fetch state
  const [isFetchingHistoricalPrice, setIsFetchingHistoricalPrice] = useState(false);
  const [historicalQuote, setHistoricalQuote] = useState<HistoricalQuoteResult | null>(null);
  const [historicalPriceError, setHistoricalPriceError] = useState<string | null>(null);

  // Smart Risk calculation state & instrument specifications
  const [riskSpecNotice, setRiskSpecNotice] = useState<string | null>(null);
  const [specDetails, setSpecDetails] = useState<any | null>(null);

  // Smart Result & P&L state
  const [quickResultMode, setQuickResultMode] = useState<boolean>(false);
  const [useTpAsExit, setUseTpAsExit] = useState<boolean>(false);
  const [resultPnlNotice, setResultPnlNotice] = useState<string | null>(null);

  // Trade Save Celebration state
  const [celebrationData, setCelebrationData] = useState<TradeCelebrationData | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);
  const [pendingSavedTrade, setPendingSavedTrade] = useState<Trade | null>(null);
  const [pendingAddAnother, setPendingAddAnother] = useState<boolean>(false);

  // Milestone Unlock Celebration state
  const [pendingMilestoneFeature, setPendingMilestoneFeature] = useState<MilestoneFeatureDef | null>(null);
  const [showMilestoneCelebrationModal, setShowMilestoneCelebrationModal] = useState<boolean>(false);
  const [milestoneTradeCount, setMilestoneTradeCount] = useState<number>(0);

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

  // Live Stop & Target Distances (price distance & points)
  const stopDistance = useMemo(() => {
    const entry = parseFloat(formData.entry);
    const sl = parseFloat(formData.stopLoss);
    if (entry > 0 && sl > 0) {
      return Number(Math.abs(entry - sl).toFixed(5));
    }
    return 0;
  }, [formData.entry, formData.stopLoss]);

  const targetDistance = useMemo(() => {
    const entry = parseFloat(formData.entry);
    const tp = parseFloat(formData.takeProfit);
    if (entry > 0 && tp > 0) {
      return Number(Math.abs(tp - entry).toFixed(5));
    }
    return 0;
  }, [formData.entry, formData.takeProfit]);

  // Realized R-Multiple live calculation (never fake)
  const realizedRMultiple = useMemo(() => {
    const pnlNum = parseFloat(formData.pnl);
    const riskNum = parseFloat(formData.risk);
    if (formData.result === 'BREAK EVEN') return 0;
    if (!isNaN(pnlNum) && !isNaN(riskNum) && riskNum > 0 && formData.result && formData.result !== 'PENDING') {
      return Number((pnlNum / riskNum).toFixed(2));
    }
    return null;
  }, [formData.pnl, formData.risk, formData.result]);

  // 7 & 9. Smart Historical Price Auto-Fetch UX (Debounced 650ms)
  useEffect(() => {
    if (!formData.market || !formData.date || !formData.time || entryMode === 'mt5') {
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingHistoricalPrice(true);
      setHistoricalPriceError(null);
      try {
        const res = await fetchHistoricalPrice({
          symbol: formData.market,
          date: formData.date,
          time: formData.time,
          direction: formData.direction as 'BUY' | 'SELL',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        });

        if (res.success && res.quote) {
          setHistoricalQuote(res.quote);
          // If entry is empty, auto-populate suggested entry price
          if (!formData.entry && res.suggestedPrice) {
            setFormData(prev => ({ ...prev, entry: String(res.suggestedPrice) }));
            setFieldSources(prev => ({ ...prev, entry: 'historical_quote' }));
          }
        } else {
          setHistoricalQuote(null);
          if (res.error) setHistoricalPriceError(res.error);
        }
      } catch (err: any) {
        setHistoricalPriceError(err?.message || 'Historical price lookup failed.');
      } finally {
        setIsFetchingHistoricalPrice(false);
      }
    }, 650);

    return () => clearTimeout(timer);
  }, [formData.market, formData.date, formData.time, formData.direction, entryMode]);

  // Manual re-fetch historical quote on demand
  const handleManualFetchHistoricalPrice = async () => {
    if (!formData.market || !formData.date) return;
    setIsFetchingHistoricalPrice(true);
    setHistoricalPriceError(null);
    try {
      const res = await fetchHistoricalPrice({
        symbol: formData.market,
        date: formData.date,
        time: formData.time || '12:00',
        direction: formData.direction as 'BUY' | 'SELL',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      });
      if (res.success && res.quote) {
        setHistoricalQuote(res.quote);
        if (res.suggestedPrice) {
          setFormData(prev => ({ ...prev, entry: String(res.suggestedPrice) }));
          setFieldSources(prev => ({ ...prev, entry: 'historical_quote' }));
        }
      } else {
        setHistoricalPriceError(res.error || 'Quote unavailable.');
      }
    } catch (err: any) {
      setHistoricalPriceError(err?.message || 'Failed to fetch quote.');
    } finally {
      setIsFetchingHistoricalPrice(false);
    }
  };

  // 10. Smart Risk Amount Auto-Calculation from Market Specs, Entry, SL, Lot
  useEffect(() => {
    const entryNum = parseFloat(formData.entry);
    const slNum = parseFloat(formData.stopLoss);
    const lotNum = parseFloat(formData.positionSize);

    if (formData.market && entryNum > 0 && slNum > 0 && lotNum > 0) {
      const riskCalc = calculateRiskAmountFromLot({
        market: formData.market,
        entry: entryNum,
        stopLoss: slNum,
        lot: lotNum,
        direction: formData.direction as Direction
      });

      if (riskCalc.calculable && riskCalc.riskAmount !== undefined) {
        setRiskSpecNotice(null);
        setSpecDetails(riskCalc.specUsed || null);

        // Auto-fill risk if empty or previously auto_calculated
        if (!formData.risk || fieldSources.risk === 'auto_calculated') {
          setFormData(prev => ({ ...prev, risk: String(riskCalc.riskAmount) }));
          setFieldSources(prev => ({ ...prev, risk: 'auto_calculated' }));
        }
      } else {
        setRiskSpecNotice(riskCalc.reason || 'Risk cannot be calculated reliably because instrument specifications are missing.');
        setSpecDetails(null);
      }
    } else {
      setRiskSpecNotice(null);
    }
  }, [formData.market, formData.entry, formData.stopLoss, formData.positionSize, formData.direction]);

  // 4. Apply Extracted Data into Existing Add Trade Form
  const handleApplyExtractedTrade = (extractedTrade: MT5ExtractedTrade, screenshotDataUrl: string) => {
    setFormData(prev => ({
      ...prev,
      date: extractedTrade.tradeDate.value || prev.date,
      time: extractedTrade.openTime.value ? extractedTrade.openTime.value.slice(0, 5) : prev.time,
      market: (extractedTrade.normalizedMarket || extractedTrade.rawSymbol.value || prev.market) as Market,
      direction: (extractedTrade.direction.value || prev.direction) as Direction,
      entry: extractedTrade.entryPrice.value !== null ? String(extractedTrade.entryPrice.value) : prev.entry,
      stopLoss: extractedTrade.stopLoss.value !== null ? String(extractedTrade.stopLoss.value) : prev.stopLoss,
      takeProfit: extractedTrade.takeProfit.value !== null ? String(extractedTrade.takeProfit.value) : prev.takeProfit,
      positionSize: extractedTrade.volume.value !== null ? String(extractedTrade.volume.value) : prev.positionSize,
      pnl: extractedTrade.pnl.value !== null ? String(extractedTrade.pnl.value) : prev.pnl,
      result: extractedTrade.pnl.value !== null
        ? (extractedTrade.pnl.value > 0 ? 'WIN' : (extractedTrade.pnl.value < 0 ? 'LOSS' : 'BREAK EVEN'))
        : prev.result,
      // User directive: this is an extra image, not the chart entry screenshot
      screenshot: prev.screenshot === screenshotDataUrl ? '' : prev.screenshot,
      extraImages: screenshotDataUrl 
        ? Array.from(new Set([screenshotDataUrl, ...(prev.extraImages || [])])) 
        : (prev.extraImages || []),
      // Subjective fields remain completely untouched / blank!
    }));

    setMt5ScreenshotUrl(screenshotDataUrl);
    setRawSymbol(extractedTrade.rawSymbol.value || '');
    setNormalizedMarket(extractedTrade.normalizedMarket || '');
    setSymbolMappingSource(extractedTrade.symbolMappingSource || 'unmapped');
    setMt5TicketId(extractedTrade.ticket.value || '');
    setMt5AnalysisId(extractedTrade.analysisId || '');
    setMt5CurrentImageId(extractedTrade.currentImageId || '');
    setTradeSource('mt5_screenshot');

    const newSources: Record<string, FieldSource> = {};
    if (extractedTrade.rawSymbol.value) newSources.market = 'mt5_screenshot';
    if (extractedTrade.direction.value) newSources.direction = 'mt5_screenshot';
    if (extractedTrade.entryPrice.value !== null) newSources.entry = 'mt5_screenshot';
    if (extractedTrade.volume.value !== null) newSources.positionSize = 'mt5_screenshot';
    if (extractedTrade.stopLoss.value !== null) newSources.stopLoss = 'mt5_screenshot';
    if (extractedTrade.takeProfit.value !== null) newSources.takeProfit = 'mt5_screenshot';
    if (extractedTrade.pnl.value !== null) newSources.pnl = 'mt5_screenshot';
    setFieldSources(prev => ({ ...prev, ...newSources }));

    setScreenshotNotice(
      `Extracted trade data applied from MT5 screenshot (${extractedTrade.rawSymbol.value || 'Trade'}${extractedTrade.ticket.value ? ` • Ticket #${extractedTrade.ticket.value}` : ''}). You can review and adjust any field below.`
    );
  };

  // 11. Smart Result Auto-Fill with Priority Logic
  const handleResultSelect = (newResult: 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | '') => {
    if (formData.result === newResult) {
      setFormData(prev => ({ ...prev, result: '', pnl: '' }));
      setResultPnlNotice(null);
      return;
    }

    setFormData(prev => ({ ...prev, result: newResult }));

    if (newResult === 'PENDING') {
      setFormData(prev => ({ ...prev, pnl: '' }));
      setResultPnlNotice(null);
      return;
    }

    if (newResult === 'BREAK EVEN') {
      setFormData(prev => ({ ...prev, pnl: '0' }));
      setFieldSources(prev => ({ ...prev, pnl: 'auto_calculated' }));
      setResultPnlNotice(null);
      return;
    }

    const entryNum = parseFloat(formData.entry);
    const lotNum = parseFloat(formData.positionSize);
    const riskNum = parseFloat(formData.risk) || calc.potentialLoss;

    // Priority 2: Actual MT5 screenshot data available
    if (fieldSources.pnl === 'mt5_screenshot' && formData.pnl !== '') {
      setResultPnlNotice('Using extracted realized P&L from MT5 screenshot');
      return;
    }

    // Priority 3: TP entered and user enables "Use TP as exit"
    const tpNum = parseFloat(formData.takeProfit);
    if (useTpAsExit && newResult === 'WIN' && tpNum > 0 && entryNum > 0 && lotNum > 0) {
      const tpCalc = calculateRealizedPnlFromExit({
        market: formData.market,
        entry: entryNum,
        exit: tpNum,
        lot: lotNum,
        direction: formData.direction as Direction
      });
      if (tpCalc.calculable && tpCalc.pnl !== undefined) {
        setFormData(prev => ({ ...prev, pnl: String(tpCalc.pnl) }));
        setFieldSources(prev => ({ ...prev, pnl: 'auto_calculated' }));
        setResultPnlNotice(`P&L calculated using Take Profit (${tpNum}) as target exit`);
        return;
      }
    }

    // Priority 4: Quick Result Mode (1R shortcut)
    if (quickResultMode && riskNum > 0) {
      const pnlVal = newResult === 'WIN' ? riskNum : -riskNum;
      setFormData(prev => ({ ...prev, pnl: String(pnlVal) }));
      setFieldSources(prev => ({ ...prev, pnl: 'quick_result_1r' }));
      setResultPnlNotice('Estimated 1R shortcut applied (editable)');
      return;
    }

    // Priority 5: None of the above -> DO NOT invent fake realized P&L
    setResultPnlNotice('Realized P&L needs an exit price or actual result.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // If user manually edits a field, clear its auto source badge
    if (fieldSources[name]) {
      setFieldSources(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
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

    // 5. Save the Original MT5 Screenshot as Trade Attachment
    let savedAttachment: { url: string; metadata: any } | null = null;
    if (mt5ScreenshotUrl && user) {
      try {
        savedAttachment = await saveMT5ScreenshotAttachment({
          uid: user.uid,
          tradeId: '',
          dataUrl: mt5ScreenshotUrl,
          fileName: 'mt5_screenshot.png',
          rawSymbol: rawSymbol || undefined,
          ticketId: mt5TicketId || undefined,
          analysisId: mt5AnalysisId || undefined,
          currentImageId: mt5CurrentImageId || undefined
        });
      } catch (uploadErr) {
        console.warn('Screenshot upload notice:', uploadErr);
      }
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
      screenshot: formData.screenshot || undefined,
      entryScreenshot: formData.screenshot || undefined,
      exitScreenshot: formData.exitScreenshot || undefined,
      extraImages: Array.from(new Set([
        ...(mt5ScreenshotUrl ? [savedAttachment?.url || mt5ScreenshotUrl] : []),
        ...(formData.extraImages || [])
      ])).filter(Boolean) as string[],
      result: formData.result ? formData.result as any : undefined,
      pnl: finalPnl,
      rrRatio: calc.rrRatio,
      rMultiple: finalPnl && parseFloat(formData.risk) > 0 ? finalPnl / parseFloat(formData.risk) : undefined,
      ruleAdherence,
      checklistState,
      newsEventId: formData.newsEventId || undefined,
      newsEventName: formData.newsEventName || undefined,
      newsImpact: (formData.newsImpact as 'LOW' | 'MEDIUM' | 'HIGH') || undefined,

      // MT5 Screenshot & Provenance
      tradeSource: tradeSource || (mt5ScreenshotUrl ? 'mt5_screenshot' : 'manual'),
      rawSymbol: rawSymbol || undefined,
      normalizedMarket: normalizedMarket || undefined,
      symbolMappingSource: symbolMappingSource || undefined,
      mt5TicketId: mt5TicketId || undefined,
      mt5ScreenshotUrl: savedAttachment?.url || mt5ScreenshotUrl || undefined,
      mt5ScreenshotMetadata: savedAttachment?.metadata || undefined,
      mt5AnalysisId: mt5AnalysisId || undefined,
      mt5CurrentImageId: mt5CurrentImageId || undefined,
      fieldSources,
      quickResultMode: quickResultMode || undefined
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

      // 4. Persistence confirmed in Firestore / state!
      setShowToast(true);
      setIsSubmitting(false);
      setTimeout(() => setShowToast(false), 3000);

      // 5. Trigger Trade Save Celebration (Sequence step: only after persistence confirmed!)
      const celebrationItem: TradeCelebrationData = {
        id: savedTrade?.id,
        market: formData.market,
        direction: formData.direction as 'BUY' | 'SELL',
        positionSize: formData.positionSize || '1',
        pnl: finalPnl,
        result: formData.result,
        source: tradeSource || (mt5ScreenshotUrl ? 'mt5_screenshot' : 'manual'),
        rawSymbol: rawSymbol || undefined,
        ticketId: mt5TicketId || undefined
      };

      // 6. Check if this saved trade unlocks an Advanced Analytics Milestone!
      if (user && savedTrade) {
        const dashId = 'default';
        const updatedTrades = [...trades, savedTrade];
        const qualifying = getQualifyingTrades(updatedTrades, dashId);
        const newUnlockedCount = getUnlockedMilestonesCount(qualifying.length);
        const ack = getAcknowledgedMilestones(user.uid, dashId);

        if (newUnlockedCount > ack && ack >= 0) {
          const feat = MILESTONE_FEATURES[newUnlockedCount - 1];
          if (feat) {
            setPendingMilestoneFeature(feat);
            setMilestoneTradeCount(qualifying.length);
            setAcknowledgedMilestones(user.uid, dashId, newUnlockedCount);
          }
        }
      }

      setCelebrationData(celebrationItem);
      setPendingSavedTrade(savedTrade || null);
      setPendingAddAnother(addAnother);
      setShowCelebrationModal(true);
    } catch (error: any) {
      console.error('Error saving trade:', error);
      setIsSubmitting(false);
      alert(error.message || 'Failed to save trade.');
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebrationModal(false);
    
    // If a new milestone was unlocked, chain into Milestone Unlock Celebration!
    if (pendingMilestoneFeature) {
      setShowMilestoneCelebrationModal(true);
      return;
    }

    finalizePostSaveNavigation();
  };

  const handleMilestoneCelebrationClose = (exploreFeatureId?: string) => {
    setShowMilestoneCelebrationModal(false);
    setPendingMilestoneFeature(null);

    if (exploreFeatureId) {
      navigate('/?exploreMilestone=' + exploreFeatureId);
      return;
    }

    finalizePostSaveNavigation();
  };

  const finalizePostSaveNavigation = () => {
    if (onSuccess && pendingSavedTrade) {
      onSuccess(pendingSavedTrade);
      return;
    }

    if (pendingAddAnother) {
      setFormData(prev => ({
        ...prev,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        entry: '', stopLoss: '', takeProfit: '', notes: '', mistake: '', learning: '', risk: '', riskPercent: '', positionSize: '', screenshot: '', exitScreenshot: '', extraImages: [], result: '', pnl: '',
        setupQuality: undefined, setupQualityReason: ''
      }));
      setMt5ScreenshotUrl('');
      setRawSymbol('');
      setNormalizedMarket('');
      setSymbolMappingSource('');
      setMt5TicketId('');
      setMt5AnalysisId('');
      setMt5CurrentImageId('');
      setScreenshotNotice(null);
      setChecklistState({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/journal');
    }
  };

  const handleViewTradeFromCelebration = (tradeId?: string) => {
    setShowCelebrationModal(false);
    if (pendingMilestoneFeature) {
      setShowMilestoneCelebrationModal(true);
      return;
    }
    finalizePostSaveNavigation();
  };

  return (
    <div className={cn("max-w-4xl mx-auto relative", isModal ? "pb-4 px-1" : "pb-16 md:pb-12")}>
      {isModal && onCancel ? (
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Add New Trade</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enter trade details, risk parameters, and execution metrics</p>
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200/80 dark:border-white/[0.08] pb-2">Trade Date & Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Date</Label>
                <FieldSourceIndicator source={fieldSources.date} />
              </div>
              <Input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Time</Label>
                <FieldSourceIndicator source={fieldSources.time} />
              </div>
              <Input type="time" name="time" value={formData.time} onChange={handleInputChange} />
            </div>
          </div>
        </Card>

        {/* Market & Direction */}
        <Card className="p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <MarketSelector
                  value={formData.market}
                  onChange={(m) => {
                    setFormData(prev => ({ ...prev, market: m as any }));
                    if (fieldSources.market) {
                      setFieldSources(prev => {
                        const next = { ...prev };
                        delete next.market;
                        return next;
                      });
                    }
                  }}
                  userId={user?.uid}
                  required
                  label="Market"
                />
              </div>
              <FieldSourceIndicator source={fieldSources.market} />
              {rawSymbol && rawSymbol !== formData.market && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Broker symbol: <strong className="text-slate-600 dark:text-slate-300">{rawSymbol}</strong> (source: {symbolMappingSource || 'normalized'})
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base">Direction</Label>
                <FieldSourceIndicator source={fieldSources.direction} />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'BUY' }))}
                  className={cn(
                    "flex-1 h-11 rounded-xl font-bold text-sm transition-all border",
                    formData.direction === 'BUY' 
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs text-slate-600 dark:text-slate-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                  )}
                >
                  BUY (LONG)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, direction: 'SELL' }))}
                  className={cn(
                    "flex-1 h-11 rounded-xl font-bold text-sm transition-all border",
                    formData.direction === 'SELL' 
                      ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs text-slate-600 dark:text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10'
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200/80 dark:border-white/[0.08] pb-2">Execution Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Entry Price with Smart Historical Auto-Fill */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Entry Price</Label>
                  <FieldSourceIndicator source={fieldSources.entry} />
                </div>
                <Input name="entry" type="number" step="any" placeholder="e.g. 2458.20" required value={formData.entry} onChange={handleInputChange} />

                {/* 7, 8, 9. Historical price suggestion UX */}
                {isFetchingHistoricalPrice && (
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1.5 animate-pulse pt-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Fetching historical price...</span>
                  </p>
                )}

                {historicalQuote && (
                  <div className="p-2.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-xs space-y-1.5 mt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        {historicalQuote.isMarketClosed 
                          ? 'Market closed at selected time' 
                          : (historicalQuote.exactMatch ? 'Suggested from historical market data' : 'Nearest available market price')}
                      </span>
                      <button
                        type="button"
                        onClick={handleManualFetchHistoricalPrice}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                        title="Re-fetch price"
                      >
                        <RefreshCw className={cn("w-3 h-3", isFetchingHistoricalPrice && "animate-spin")} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                      <div>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {historicalQuote.suggestedEntry}
                        </span>
                        {historicalQuote.bid && historicalQuote.ask && (
                          <span className="text-slate-400 ml-1.5 text-[10px]">
                            (Bid: {historicalQuote.bid} / Ask: {historicalQuote.ask})
                          </span>
                        )}
                        <span className="text-slate-400 block text-[10px] truncate max-w-[200px]">
                          {historicalQuote.source}
                        </span>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (historicalQuote.suggestedEntry) {
                            setFormData(prev => ({ ...prev, entry: String(historicalQuote.suggestedEntry) }));
                            setFieldSources(prev => ({ ...prev, entry: 'historical_quote' }));
                          }
                        }}
                        className="h-6 px-2 text-[10px] font-bold text-blue-600 border-blue-300 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                      >
                        Apply Price
                      </Button>
                    </div>

                    {!historicalQuote.exactMatch && historicalQuote.offsetSeconds > 0 && (
                      <div className="text-[10px] text-amber-700 dark:text-amber-400 pt-1 border-t border-blue-200/50 dark:border-blue-900/40">
                        Requested: {formData.time || '12:00'} • Price timestamp: {historicalQuote.formattedTimeUsed?.slice(11, 16) || 'Nearest'} • Diff: {historicalQuote.offsetSeconds}s
                      </div>
                    )}
                  </div>
                )}

                {historicalPriceError && !isFetchingHistoricalPrice && !historicalQuote && (
                  <p className="text-[10px] text-slate-400 pt-0.5">{historicalPriceError}</p>
                )}
              </div>

              {/* Lot / Position Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Lot / Position Size</Label>
                  <FieldSourceIndicator source={fieldSources.positionSize} />
                </div>
                <Input name="positionSize" type="number" step="any" placeholder="e.g. 0.50" required value={formData.positionSize} onChange={handleInputChange} />
              </div>

              {/* Stop Loss */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Stop Loss</Label>
                  <FieldSourceIndicator source={fieldSources.stopLoss} />
                </div>
                <Input name="stopLoss" type="number" step="any" placeholder="e.g. 2453.20" required value={formData.stopLoss} onChange={handleInputChange} />
              </div>

              {/* Take Profit */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Take Profit</Label>
                  <FieldSourceIndicator source={fieldSources.takeProfit} />
                </div>
                <Input name="takeProfit" type="number" step="any" placeholder="e.g. 2470.20" value={formData.takeProfit} onChange={handleInputChange} />
              </div>

              {/* 10. Smart Risk Amount (USD) Auto-Calculation from Instrument Specs */}
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Risk Amount (USD)</Label>
                  <FieldSourceIndicator source={fieldSources.risk} />
                </div>
                <Input name="risk" type="number" step="any" placeholder="e.g. 250" icon={<span className="text-sm font-medium">$</span>} value={formData.risk} onChange={handleInputChange} />
                
                {/* Missing or detected specification notice */}
                {riskSpecNotice && (
                  <div className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2 mt-1">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-semibold block">{riskSpecNotice}</span>
                      <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                        Enter your calculated risk amount manually or select a registered market instrument.
                      </span>
                    </div>
                  </div>
                )}

                {specDetails && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                    <span>
                      Spec: <strong className="text-slate-700 dark:text-slate-300">{specDetails.name}</strong> • Contract: {specDetails.contractSize.toLocaleString()} {specDetails.unitName}
                    </span>
                    <span>Point Value: <strong>${specDetails.pointValue}</strong></span>
                  </div>
                )}
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

          {/* 12. Auto Calculations Card (Live, comprehensive metrics) */}
          <Card className="p-6 shadow-sm bg-slate-900/95 dark:bg-slate-900/80 border-slate-700/50 backdrop-blur-md text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Calculations</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Dynamic
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 text-xs mb-0.5">Risk : Reward</p>
                  <div className="text-2xl font-light">
                    1 : <span className="font-bold text-white">{calc.rrRatio > 0 ? calc.rrRatio : '-'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Pot. Loss</p>
                    <p className="text-base font-semibold text-rose-400">{calc.potentialLoss > 0 ? formatCurrency(calc.potentialLoss) : '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Pot. Profit</p>
                    <p className="text-base font-semibold text-emerald-400">{calc.potentialProfit > 0 ? formatCurrency(calc.potentialProfit) : '-'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-0.5">Stop Distance</p>
                    <p className="font-mono font-medium text-slate-200">{stopDistance > 0 ? `${stopDistance} pts` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Target Distance</p>
                    <p className="font-mono font-medium text-slate-200">{targetDistance > 0 ? `${targetDistance} pts` : '-'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400 mb-0.5">Position Size</p>
                    <p className="font-mono font-medium text-slate-200">{formData.positionSize ? `${formData.positionSize} lots` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-0.5">Realized R</p>
                    <p className={cn("font-mono font-bold", realizedRMultiple !== null && realizedRMultiple > 0 ? "text-emerald-400" : (realizedRMultiple !== null && realizedRMultiple < 0 ? "text-rose-400" : "text-slate-400"))}>
                      {realizedRMultiple !== null ? `${realizedRMultiple > 0 ? '+' : ''}${realizedRMultiple}R` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Strategy & Context */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200/80 dark:border-white/[0.08] pb-2">Context & Strategy</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base text-slate-800 dark:text-slate-200 font-semibold">Strategy</Label>
                {strategies.length > 0 ? (
                  <select 
                    name="strategy" 
                    value={formData.strategy} 
                    onChange={handleInputChange} 
                    className="flex h-11 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <select name="session" value={formData.session} onChange={handleInputChange} className="flex h-11 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['Asian', 'London', 'New York', 'Sydney'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Timeframe</Label>
                  <select name="timeframe" value={formData.timeframe} onChange={handleInputChange} className="flex h-11 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['1m', '3m', '5m', '15m', '30m', '1H', '4H', 'Daily', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-slate-500 font-semibold">Condition</Label>
                  <select name="marketCondition" value={formData.marketCondition} onChange={handleInputChange} className="flex h-11 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="" disabled>Select...</option>
                    {['Trending', 'Ranging', 'Breakout', 'Reversal', 'Choppy', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {selectedStrategyObj && selectedStrategyObj.checklist.length > 0 && (
              <div className="p-5 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xs rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Strategy Checklist</h4>
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
                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-wrap items-center justify-center gap-2.5 p-4 z-10">
                  <Label htmlFor="entry-screenshot-upload" className="cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105 border border-slate-200 dark:border-slate-700">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span>Replace</span>
                  </Label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if (formData.screenshot) {
                        setFormData(prev => ({
                          ...prev,
                          screenshot: '',
                          extraImages: Array.from(new Set([prev.screenshot, ...(prev.extraImages || [])]))
                        }));
                      }
                    }} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105"
                    title="Move to Extra Images / Trade Receipts"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Move to Extra</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveScreenshot('screenshot')} 
                    className="bg-rose-500/90 hover:bg-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform hover:scale-105"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
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

        {/* 3rd Attachment: Extra Images & MT5 Trade Receipts */}
        {(formData.extraImages.length > 0 || mt5ScreenshotUrl) && (
          <Card className="p-6 sm:p-7 shadow-sm border-indigo-200/70 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/20 via-white to-indigo-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Extra Images & Trade Receipts</span>
                  <span className="text-xs font-mono font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/80 dark:bg-indigo-950/80 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    {Array.from(new Set([...(mt5ScreenshotUrl ? [mt5ScreenshotUrl] : []), ...formData.extraImages])).length} Attached
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  MT5 trade screenshots, broker receipts, and higher-timeframe context images (kept separate from your chart entry screenshot)
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <Label htmlFor="extra-screenshot-upload" className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-2xs">
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Add Extra Image</span>
                </Label>
                <input
                  id="extra-screenshot-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const compressed = await compressImageToDataUrl(file, 1600, 1600, 0.88);
                        setFormData(prev => ({
                          ...prev,
                          extraImages: [...(prev.extraImages || []), compressed]
                        }));
                      } catch {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData(prev => ({
                            ...prev,
                            extraImages: [...(prev.extraImages || []), reader.result as string]
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from(new Set([...(mt5ScreenshotUrl ? [mt5ScreenshotUrl] : []), ...formData.extraImages])).map((imgUrl, idx) => {
                const isMT5Receipt = imgUrl === mt5ScreenshotUrl;
                return (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950/5 dark:bg-slate-950 group aspect-video shadow-2xs">
                    <img src={imgUrl} alt={`Extra Image ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1.5 left-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs",
                        isMT5Receipt ? "bg-indigo-600/90 text-white" : "bg-slate-900/80 text-white"
                      )}>
                        {isMT5Receipt ? 'MT5 Receipt' : `Extra Image #${idx + 1}`}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            extraImages: prev.extraImages.filter(u => u !== imgUrl)
                          }));
                          if (isMT5Receipt) {
                            setMt5ScreenshotUrl('');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors text-xs font-semibold flex items-center gap-1 shadow-sm"
                        title="Remove extra image"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Notes & Learning */}
        <Card className="p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-6 border-b border-slate-200/80 dark:border-white/[0.08] pb-2">Review & Result</h3>
          <div className="space-y-6">
            
            {/* Quick Result Mode (1R Shortcut) toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 dark:text-amber-200">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quick Result Mode (1R Shortcut)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-200/60 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                    Shortcut
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When active: Win sets suggested P&L to +1R (+${parseFloat(formData.risk) || calc.potentialLoss}), Loss sets -1R (-${parseFloat(formData.risk) || calc.potentialLoss}), Break Even sets $0. Editable shortcut.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickResultMode(prev => !prev)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border",
                  quickResultMode
                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                )}
              >
                {quickResultMode ? '1R Mode ON' : '1R Mode OFF'}
              </button>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Trade Result (Optional)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => handleResultSelect('WIN')}
                  className={cn(
                    "h-11 rounded-xl font-bold text-sm transition-all border",
                    formData.result === 'WIN' 
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs text-slate-600 dark:text-slate-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                  )}
                >
                  WIN
                </button>
                <button
                  type="button"
                  onClick={() => handleResultSelect('LOSS')}
                  className={cn(
                    "h-11 rounded-xl font-bold text-sm transition-all border",
                    formData.result === 'LOSS' 
                      ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs text-slate-600 dark:text-slate-400 hover:border-rose-500/40 hover:bg-rose-500/10'
                  )}
                >
                  LOSS
                </button>
                <button
                  type="button"
                  onClick={() => handleResultSelect('BREAK EVEN')}
                  className={cn(
                    "h-11 rounded-xl font-bold text-sm transition-all border",
                    formData.result === 'BREAK EVEN' 
                      ? 'border-blue-500 bg-blue-500 text-white shadow-xs'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs text-slate-600 dark:text-slate-400 hover:border-blue-500/40 hover:bg-blue-500/10'
                  )}
                >
                  BREAK EVEN
                </button>
                <button
                  type="button"
                  onClick={() => handleResultSelect('PENDING')}
                  className={cn(
                    "h-11 rounded-xl font-bold text-sm transition-all border",
                    formData.result === 'PENDING' 
                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                      : 'border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-slate-800/60 backdrop-blur-xs text-slate-600 dark:text-slate-400 hover:border-amber-500/40 hover:bg-amber-500/10'
                  )}
                >
                  PENDING
                </button>
              </div>

              {formData.takeProfit && (
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={useTpAsExit}
                    onChange={(e) => {
                      setUseTpAsExit(e.target.checked);
                      if (e.target.checked && formData.result === 'WIN') {
                        handleResultSelect('WIN');
                      }
                    }}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Use Take Profit ({formData.takeProfit}) as target exit price when calculating suggested WIN P&L</span>
                </label>
              )}
            </div>

            {(formData.result === 'WIN' || formData.result === 'LOSS') && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                  <Label>Realized P&L (USD)</Label>
                  <FieldSourceIndicator source={fieldSources.pnl} />
                </div>
                <Input 
                  name="pnl" 
                  type="number" 
                  step="any" 
                  placeholder={formData.result === 'WIN' ? calc.potentialProfit.toString() : calc.potentialLoss.toString()} 
                  value={formData.pnl} 
                  onChange={handleInputChange} 
                  icon={<span className="text-sm font-medium">$</span>}
                />
                
                {resultPnlNotice && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pt-0.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{resultPnlNotice}</span>
                  </p>
                )}
                {!resultPnlNotice && (
                  <p className="text-xs text-slate-500">Leave blank to use calculated auto-P&L.</p>
                )}
              </div>
            )}
            {formData.result === 'PENDING' && (
              <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 backdrop-blur-xs">
                Result is pending. Realized P&L will not be calculated.
              </div>
            )}

            <div className="space-y-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08]">
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Why did you take this trade?" />
              </div>
              <div className="space-y-2">
                <Label className="text-rose-600 dark:text-rose-400">What mistake did I make?</Label>
                <Textarea name="mistake" value={formData.mistake} onChange={handleInputChange} placeholder="Entered too early, moved SL, overtraded..." className="focus:ring-rose-500" />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-600 dark:text-emerald-400">What did I learn from this trade?</Label>
                <Textarea name="learning" value={formData.learning} onChange={handleInputChange} placeholder="What will you do differently next time?" className="focus:ring-emerald-500" />
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
              Save Trade
            </Button>
          </div>
        ) : (
          <div className="mt-8 pt-6 pb-6 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-slate-200/80 dark:border-white/[0.08]">
            <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)} className="w-full sm:w-auto min-h-[44px]">
              Save & Add Another
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting || !formData.market || !formData.entry} className="w-full sm:w-auto min-w-[160px] min-h-[44px]">
              Save Trade
            </Button>
          </div>
        )}
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-24 right-4 sm:right-8 mb-[env(safe-area-inset-bottom,0px)] bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-40 max-w-[calc(100vw-2rem)]">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="font-medium text-sm">Trade saved successfully.</span>
        </div>
      )}

      {/* Trade Save Celebration Modal */}
      <TradeSaveCelebrationModal
        isOpen={showCelebrationModal}
        trade={celebrationData}
        onClose={handleCelebrationClose}
        onViewTrade={handleViewTradeFromCelebration}
      />

      {/* Milestone Unlock Celebration Modal */}
      <MilestoneUnlockCelebrationModal
        isOpen={showMilestoneCelebrationModal}
        feature={pendingMilestoneFeature}
        tradeCount={milestoneTradeCount}
        onClose={() => handleMilestoneCelebrationClose()}
        onExplore={(featId) => handleMilestoneCelebrationClose(featId)}
      />
    </div>
  );
}
