import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { 
  Camera, 
  UploadCloud, 
  Clipboard, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Layers, 
  Check, 
  HelpCircle,
  Eye,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { 
  MT5ExtractedTrade, 
  MT5ScreenshotAnalysisResult, 
  ConfidenceLevel 
} from '@/types/mt5Screenshot';
import { analyzeScreenshotWithGemini, checkDuplicateMT5Trade, createDraftTradeFromScreenshot } from '@/lib/mt5ScreenshotClient';
import { compressImageToDataUrl } from '@/lib/avatarStorage';
import { Trade } from '@/types';

interface MT5ScreenshotAutoFillProps {
  onApplyTrade: (trade: MT5ExtractedTrade, screenshotDataUrl: string) => void;
  onApplyMultipleTrades?: (trades: MT5ExtractedTrade[], screenshotDataUrl: string) => void;
  existingTrades?: Trade[];
  currentDashboardId?: string;
  onOpenExistingTrade?: (tradeId: string) => void;
  className?: string;
}

interface ActiveImageMetadata {
  analysisId: string;
  currentImageId: string;
  imageName: string;
  mimeType: string;
  uploadedAt: number;
}

export function MT5ScreenshotAutoFill({
  onApplyTrade,
  onApplyMultipleTrades,
  existingTrades = [],
  currentDashboardId,
  onOpenExistingTrade,
  className
}: MT5ScreenshotAutoFillProps) {
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [activeImageMeta, setActiveImageMeta] = useState<ActiveImageMetadata | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MT5ScreenshotAnalysisResult | null>(null);
  const [selectedTradeIndex, setSelectedTradeIndex] = useState(0);
  const [editableTrades, setEditableTrades] = useState<MT5ExtractedTrade[]>([]);
  const [isEditingBeforeApply, setIsEditingBeforeApply] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; existingTrade?: Trade } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler for MT5 screenshots
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Don't intercept if user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            await processScreenshotFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Rule 2: RESET ANALYSIS STATE BEFORE EVERY UPLOAD
  const processScreenshotFile = async (file: File) => {
    if (!file) return;

    const newAnalysisId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newImageId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Immediately clear all previous state
    setAnalysisResult(null);
    setEditableTrades([]);
    setSelectedTradeIndex(0);
    setDuplicateWarning(null);
    setIsEditingBeforeApply(false);
    setFileName(file.name || 'mt5_screenshot.png');

    const meta: ActiveImageMetadata = {
      analysisId: newAnalysisId,
      currentImageId: newImageId,
      imageName: file.name || 'mt5_screenshot.png',
      mimeType: file.type || 'image/jpeg',
      uploadedAt: Date.now()
    };
    setActiveImageMeta(meta);

    try {
      // Compress to high-res data URL for preview and sending
      const compressed = await compressImageToDataUrl(file, 1600, 1600, 0.90);
      setScreenshotDataUrl(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processScreenshotFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processScreenshotFile(file);
    }
  };

  // Rule 3 & Rule 4: Stateless request with currentImageId & analysisId protection
  const handleStartAnalysis = async (forceNewAnalysisId: boolean | React.MouseEvent = false) => {
    const shouldForceNew = typeof forceNewAnalysisId === 'boolean' ? forceNewAnalysisId : false;
    if (!screenshotDataUrl || isAnalyzing) return;
    setIsAnalyzing(true);
    setDuplicateWarning(null);

    const currentAnalysisId = (shouldForceNew || !activeImageMeta?.analysisId)
      ? (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `analysis_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`)
      : activeImageMeta.analysisId;

    const currentImageId = activeImageMeta?.currentImageId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);

    const updatedMeta: ActiveImageMetadata = {
      analysisId: currentAnalysisId,
      currentImageId,
      imageName: activeImageMeta?.imageName || fileName || 'mt5_screenshot.png',
      mimeType: activeImageMeta?.mimeType || 'image/jpeg',
      uploadedAt: activeImageMeta?.uploadedAt || Date.now()
    };
    setActiveImageMeta(updatedMeta);

    try {
      const result = await analyzeScreenshotWithGemini(screenshotDataUrl, {
        analysisId: currentAnalysisId,
        currentImageId,
        fileName: updatedMeta.imageName
      });
      
      // Rule 4: Only apply the result if response IDs match currentImageId and analysisId
      if (result.analysisId && result.analysisId !== currentAnalysisId) {
        setAnalysisResult({
          success: false,
          isReadable: false,
          qualityIssue: 'Screenshot analysis rejected: Stale analysis session. Please analyze again.',
          detectedCount: 0,
          trades: [],
          analysisVersion: 'mt5-screenshot-v2',
          analysisId: currentAnalysisId,
          currentImageId,
          analyzedAt: Date.now(),
          summary: { detectedFields: [], missingFields: [] }
        });
        setEditableTrades([]);
        return;
      }

      if (result.currentImageId && result.currentImageId !== currentImageId) {
        setAnalysisResult({
          success: false,
          isReadable: false,
          qualityIssue: 'Screenshot analysis rejected: Image ID mismatch. Please analyze the current screenshot again.',
          detectedCount: 0,
          trades: [],
          analysisVersion: 'mt5-screenshot-v2',
          analysisId: currentAnalysisId,
          currentImageId,
          analyzedAt: Date.now(),
          summary: { detectedFields: [], missingFields: [] }
        });
        setEditableTrades([]);
        return;
      }

      // Rule 7: Market Mismatch Protection
      if (result.hasMarketMismatch) {
        setAnalysisResult(result);
        setEditableTrades([]);
        return;
      }

      // If result has trades, guarantee it's marked readable and permitted!
      if (result.trades && result.trades.length > 0) {
        result.isReadable = true;
        result.success = true;
        setAnalysisResult(result);
        setEditableTrades(result.trades);
        setSelectedTradeIndex(0);

        // Check duplicate on the primary trade
        const primaryTicket = result.trades[0]?.ticket?.value;
        if (primaryTicket) {
          const dup = checkDuplicateMT5Trade(primaryTicket, existingTrades, currentDashboardId);
          setDuplicateWarning(dup.isDuplicate ? dup : null);
        }
      } else {
        setAnalysisResult(result);
        setEditableTrades([]);
      }
    } catch (err: any) {
      console.error('Failed to analyze MT5 screenshot:', err);
      setAnalysisResult({
        success: false,
        isReadable: false,
        qualityIssue: err?.message || 'Automatic field extraction was uncertain. You can review or complete fields manually.',
        detectedCount: 0,
        trades: [],
        analysisVersion: 'mt5-screenshot-v2',
        analysisId: currentAnalysisId,
        currentImageId,
        analyzedAt: Date.now(),
        summary: { detectedFields: [], missingFields: [] }
      });
      setEditableTrades([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Rule 1: No EURUSD fallback! Blank draft trade
  const handlePermitManualTrade = () => {
    const draft = createDraftTradeFromScreenshot({
      analysisId: activeImageMeta?.analysisId,
      currentImageId: activeImageMeta?.currentImageId
    });

    setEditableTrades([draft]);
    setSelectedTradeIndex(0);
    setIsEditingBeforeApply(true); // Open fields for user to fill
    setAnalysisResult({
      success: true,
      isReadable: true,
      detectedCount: 1,
      trades: [draft],
      analysisVersion: 'mt5-screenshot-v2',
      analysisId: activeImageMeta?.analysisId,
      currentImageId: activeImageMeta?.currentImageId,
      analyzedAt: Date.now(),
      summary: {
        detectedFields: ['Screenshot Permitted'],
        missingFields: ['Market', 'Direction', 'Volume', 'Entry Price', 'Stop Loss', 'Take Profit', 'Realized P&L']
      }
    });
  };

  const handleSelectTrade = (idx: number) => {
    setSelectedTradeIndex(idx);
    const tr = editableTrades[idx];
    if (tr?.ticket?.value) {
      const dup = checkDuplicateMT5Trade(tr.ticket.value, existingTrades, currentDashboardId);
      setDuplicateWarning(dup.isDuplicate ? dup : null);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleFieldChange = (fieldKey: keyof MT5ExtractedTrade, newValue: any) => {
    setEditableTrades(prev => {
      const updated = [...prev];
      const trade = { ...updated[selectedTradeIndex] };
      const currentField = trade[fieldKey] as any;
      if (currentField && typeof currentField === 'object' && 'value' in currentField) {
        (trade as any)[fieldKey] = {
          ...currentField,
          value: newValue,
          confidence: 'HIGH' // manually verified by user
        };
      } else {
        (trade as any)[fieldKey] = newValue;
      }
      updated[selectedTradeIndex] = trade;
      return updated;
    });
  };

  const handleApplyCurrent = () => {
    const tradeToApply = editableTrades[selectedTradeIndex];
    if (tradeToApply && screenshotDataUrl) {
      onApplyTrade(tradeToApply, screenshotDataUrl);
    }
  };

  const handleApplyAll = () => {
    if (editableTrades.length > 0 && screenshotDataUrl) {
      if (onApplyMultipleTrades) {
        onApplyMultipleTrades(editableTrades, screenshotDataUrl);
      } else {
        onApplyTrade(editableTrades[0], screenshotDataUrl);
      }
    }
  };

  const handleReset = () => {
    setScreenshotDataUrl('');
    setFileName('');
    setActiveImageMeta(null);
    setAnalysisResult(null);
    setEditableTrades([]);
    setDuplicateWarning(null);
    setSelectedTradeIndex(0);
    setIsEditingBeforeApply(false);
  };

  const renderConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300">
            LOW
          </span>
        );
      case 'NOT_FOUND':
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Not Found
          </span>
        );
    }
  };

  const currentTrade = editableTrades[selectedTradeIndex];

  return (
    <Card className={cn("p-6 sm:p-7 shadow-sm border-blue-200/80 dark:border-blue-900/40 bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 relative overflow-hidden", className)}>
      {/* Decorative subtle accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>MT5 Screenshot → Auto Fill</span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  AI Vision
                </span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload an MT5 trade/history screenshot and TradeVault will extract the available trade data automatically.
          </p>
        </div>

        {screenshotDataUrl && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 self-start sm:self-center px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Screenshot</span>
          </button>
        )}
      </div>

      {/* Step 1: Upload / Paste / Drop Container */}
      {!screenshotDataUrl ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center transition-all cursor-pointer group min-h-[170px]",
            isDragging 
              ? "border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 scale-[0.99]" 
              : "border-slate-200 dark:border-slate-700/80 bg-slate-50/40 dark:bg-slate-850/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/60"
          )}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950/80 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-blue-600 dark:text-blue-400 shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Drop MT5 screenshot here, or click to browse
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supports PNG, JPG, JPEG, WEBP • Or simply press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono">Ctrl+V</kbd> to paste
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
              Upload MT5 Screenshot
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Clipboard className="w-3.5 h-3.5 text-indigo-500" />
              Paste from Clipboard
            </span>
          </div>
        </div>
      ) : (
        /* Image Preview & Analysis State */
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Image Preview Thumbnail */}
            <div className="md:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950/10 dark:bg-slate-950 overflow-hidden relative group">
              <img
                src={screenshotDataUrl}
                alt="MT5 Screenshot Preview"
                className="w-full max-h-56 object-contain mx-auto"
              />
              <div className="p-2 bg-slate-900/90 text-white text-[11px] flex items-center justify-between">
                <span className="truncate max-w-[160px] font-mono">{fileName || 'mt5_screenshot.png'}</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Change
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            {/* Analysis CTA or Quality Issue */}
            <div className="md:col-span-8 flex flex-col justify-between h-full min-h-[140px]">
              {!analysisResult && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Screenshot ready for visual inspection
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Our vision model will extract market, lot size, entry/exit prices, stop loss, take profit, P&L, commissions, and trade timestamps directly from your broker screen.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleStartAnalysis}
                      disabled={isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 px-5 shadow-sm flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Analyzing Screenshot...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Analyze Screenshot</span>
                        </>
                      )}
                    </Button>
                    <span className="text-[11px] text-slate-400">
                      Does not auto-save trade. You review first.
                    </span>
                  </div>
                </div>
              )}

              {/* Market Mismatch Rejection Notice (Rule 7) */}
              {analysisResult && analysisResult.hasMarketMismatch && (
                <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 space-y-3.5 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 text-rose-700 dark:text-rose-400 font-bold text-sm">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <span className="text-base font-bold">Screenshot analysis rejected</span>
                  </div>
                  <div className="space-y-1.5 pl-10 text-xs">
                    <p className="font-semibold text-rose-900 dark:text-rose-200">
                      Detected market from image: <span className="font-mono font-bold bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-700">{analysisResult.visibleMarketInImage || 'Unknown'}</span>
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 font-medium">
                      AI returned conflicting market data.
                    </p>
                    <p className="text-rose-700 dark:text-rose-300 font-medium">
                      Please analyze the screenshot again.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 pl-10">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleStartAnalysis(true)}
                      disabled={isAnalyzing}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs h-9 px-4 shadow-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
                      <span>Analyze Again</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleReset}
                      className="text-xs h-9 px-3 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40"
                    >
                      Cancel / Upload Different Screenshot
                    </Button>
                  </div>
                </div>
              )}

              {/* Quality Issue Notice */}
              {analysisResult && !analysisResult.isReadable && !analysisResult.hasMarketMismatch && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900/60 dark:to-transparent border border-amber-300/80 dark:border-amber-700/60 text-slate-800 dark:text-slate-200 space-y-3.5 shadow-sm backdrop-blur-xs transition-all animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold tracking-tight text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      Trade Screenshot Notice • All Trade Data Permitted
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
                    {analysisResult.qualityIssue || 'Automatic field extraction was uncertain, but any screenshot showing trade data is permitted.'} You can permit this screenshot and fill or review the trade fields directly, re-analyze with Vision AI, or upload a different screenshot.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handlePermitManualTrade}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8.5 px-3.5 shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Permit Screenshot & Fill Data</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartAnalysis(true)}
                      disabled={isAnalyzing}
                      className="text-xs h-8.5 px-3 bg-white dark:bg-slate-900 border-amber-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
                      <span>Re-analyze</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs h-8.5 px-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                      Upload Better Screenshot
                    </Button>
                  </div>
                </div>
              )}

              {/* Success Banner */}
              {analysisResult && analysisResult.isReadable && !analysisResult.hasMarketMismatch && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs font-bold">
                        Analysis Complete: {analysisResult.detectedCount} {analysisResult.detectedCount === 1 ? 'trade' : 'trades'} detected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartAnalysis(true)}
                      disabled={isAnalyzing}
                      className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <RefreshCw className={cn("w-3 h-3", isAnalyzing && "animate-spin")} />
                      <span>Re-analyze</span>
                    </button>
                  </div>

                  {/* Summary of detected & omitted subjective fields */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
                    <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="shrink-0 font-bold">Detected:</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {analysisResult.summary.detectedFields.join(' • ') || 'Trade Data Detected'}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-500 font-medium">
                      <span className="shrink-0 font-semibold">Subjective (kept empty):</span>
                      <span className="text-slate-400">
                        Strategy, Emotions, Learnings, Setup Quality (User input only)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multiple Trades Selection Tab */}
          {editableTrades.length > 1 && !analysisResult?.hasMarketMismatch && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Multiple trades detected in screenshot ({editableTrades.length})
                </span>
                <span className="text-[11px] text-slate-400">Select trade to apply into form:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {editableTrades.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTrade(idx)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2",
                      selectedTradeIndex === idx
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    )}
                  >
                    <span>Trade #{idx + 1}</span>
                    <span className="font-mono text-[11px] opacity-90">
                      {t.rawSymbol.value || 'N/A'} ({t.direction.value || '?'}) {t.volume.value ? `${t.volume.value}L` : ''}
                    </span>
                    {t.pnl.value !== null && (
                      <span className={cn(
                        "font-bold font-mono text-[10px]",
                        (t.pnl.value || 0) >= 0 ? "text-emerald-300" : "text-rose-300"
                      )}>
                        {(t.pnl.value || 0) >= 0 ? `+$${t.pnl.value}` : `-$${Math.abs(t.pnl.value || 0)}`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Trade Warning */}
          {duplicateWarning?.isDuplicate && !analysisResult?.hasMarketMismatch && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">This MT5 trade already exists in your journal</span>
                  <span className="text-amber-800 dark:text-amber-300">
                    Ticket #{currentTrade?.ticket?.value || 'N/A'} is already logged as "{duplicateWarning.existingTrade?.market}" ({duplicateWarning.existingTrade?.direction}) on {duplicateWarning.existingTrade?.date ? new Date(duplicateWarning.existingTrade.date).toLocaleDateString() : ''}.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {onOpenExistingTrade && duplicateWarning.existingTrade?.id && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenExistingTrade(duplicateWarning.existingTrade!.id)}
                    className="text-xs h-8 bg-white dark:bg-slate-900"
                  >
                    Open Existing Trade
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyCurrent}
                  className="text-xs h-8 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Update Existing Trade
                </Button>
              </div>
            </div>
          )}

          {/* Rule 11: USER REVIEW SCREEN */}
          {currentTrade && !analysisResult?.hasMarketMismatch && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-850 dark:via-blue-950/20 dark:to-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>MT5 Screenshot Analysis</span>
                    <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Current Screenshot Isolated
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Detected from <strong className="text-slate-700 dark:text-slate-300 font-semibold">CURRENT</strong> screenshot:
                  </p>
                </div>
                {isEditingBeforeApply && (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 self-start sm:self-center">
                    Editing Mode Active
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-5 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                      <th className="pb-2.5 font-medium">Field</th>
                      <th className="pb-2.5 font-medium">Detected from CURRENT screenshot</th>
                      <th className="pb-2.5 font-medium text-center">Confidence</th>
                      {isEditingBeforeApply && <th className="pb-2.5 font-medium text-right">Edit</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {/* Market */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300 w-32">Market</td>
                      <td className="py-2.5 font-bold font-mono text-slate-900 dark:text-slate-100">
                        {currentTrade.rawSymbol.value || currentTrade.normalizedMarket || 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center w-24">
                        {renderConfidenceBadge(currentTrade.rawSymbol.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right w-36">
                          <input
                            type="text"
                            value={currentTrade.rawSymbol.value || ''}
                            onChange={(e) => handleFieldChange('rawSymbol', e.target.value)}
                            placeholder="e.g. XAUUSD"
                            className="w-32 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* Direction */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Direction</td>
                      <td className="py-2.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold font-mono",
                          currentTrade.direction.value === 'BUY'
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : currentTrade.direction.value === 'SELL'
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                            : "text-slate-400"
                        )}>
                          {currentTrade.direction.value || 'Not Found'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.direction.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <select
                            value={currentTrade.direction.value || ''}
                            onChange={(e) => handleFieldChange('direction', e.target.value as any)}
                            className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          >
                            <option value="">None</option>
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                          </select>
                        </td>
                      )}
                    </tr>

                    {/* Volume */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Volume</td>
                      <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currentTrade.volume.value !== null ? currentTrade.volume.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.volume.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.volume.value !== null ? currentTrade.volume.value : ''}
                            onChange={(e) => handleFieldChange('volume', parseFloat(e.target.value) || null)}
                            placeholder="Lots"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* Entry */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Entry</td>
                      <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currentTrade.entryPrice.value !== null ? currentTrade.entryPrice.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.entryPrice.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.entryPrice.value !== null ? currentTrade.entryPrice.value : ''}
                            onChange={(e) => handleFieldChange('entryPrice', parseFloat(e.target.value) || null)}
                            placeholder="Price"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* Exit */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Exit</td>
                      <td className="py-2.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {currentTrade.exitPrice.value !== null ? currentTrade.exitPrice.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.exitPrice.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.exitPrice.value !== null ? currentTrade.exitPrice.value : ''}
                            onChange={(e) => handleFieldChange('exitPrice', parseFloat(e.target.value) || null)}
                            placeholder="Price"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* SL */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">SL</td>
                      <td className="py-2.5 font-mono text-slate-900 dark:text-slate-100">
                        {currentTrade.stopLoss.value !== null ? currentTrade.stopLoss.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.stopLoss.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.stopLoss.value !== null ? currentTrade.stopLoss.value : ''}
                            onChange={(e) => handleFieldChange('stopLoss', parseFloat(e.target.value) || null)}
                            placeholder="Price"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* TP */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">TP</td>
                      <td className="py-2.5 font-mono text-slate-900 dark:text-slate-100">
                        {currentTrade.takeProfit.value !== null ? currentTrade.takeProfit.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.takeProfit.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.takeProfit.value !== null ? currentTrade.takeProfit.value : ''}
                            onChange={(e) => handleFieldChange('takeProfit', parseFloat(e.target.value) || null)}
                            placeholder="Price"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* P&L */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">P&L</td>
                      <td className="py-2.5 font-mono font-bold">
                        {currentTrade.pnl.value !== null ? (
                          <span className={currentTrade.pnl.value >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                            {currentTrade.pnl.value >= 0 ? `+$${currentTrade.pnl.value}` : `-$${Math.abs(currentTrade.pnl.value)}`}
                          </span>
                        ) : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.pnl.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.pnl.value !== null ? currentTrade.pnl.value : ''}
                            onChange={(e) => handleFieldChange('pnl', parseFloat(e.target.value) || null)}
                            placeholder="0.00"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* Commission */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Commission</td>
                      <td className="py-2.5 font-mono text-slate-900 dark:text-slate-100">
                        {currentTrade.commission.value !== null ? currentTrade.commission.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.commission.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.commission.value !== null ? currentTrade.commission.value : ''}
                            onChange={(e) => handleFieldChange('commission', parseFloat(e.target.value) || null)}
                            placeholder="0.00"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* Swap */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Swap</td>
                      <td className="py-2.5 font-mono text-slate-900 dark:text-slate-100">
                        {currentTrade.swap.value !== null ? currentTrade.swap.value : 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.swap.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="number"
                            step="any"
                            value={currentTrade.swap.value !== null ? currentTrade.swap.value : ''}
                            onChange={(e) => handleFieldChange('swap', parseFloat(e.target.value) || null)}
                            placeholder="0.00"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>

                    {/* Ticket */}
                    <tr>
                      <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-300">Ticket</td>
                      <td className="py-2.5 font-mono text-slate-900 dark:text-slate-100">
                        {currentTrade.ticket.value || 'Not Found'}
                      </td>
                      <td className="py-2.5 text-center">
                        {renderConfidenceBadge(currentTrade.ticket.confidence)}
                      </td>
                      {isEditingBeforeApply && (
                        <td className="py-2.5 text-right">
                          <input
                            type="text"
                            value={currentTrade.ticket.value || ''}
                            onChange={(e) => handleFieldChange('ticket', e.target.value || null)}
                            placeholder="Ticket ID"
                            className="w-28 text-right px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 font-mono"
                          />
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons as per Rule 11 */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    type="button"
                    onClick={handleApplyCurrent}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4.5 shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to Add Trade</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditingBeforeApply(prev => !prev)}
                    className="text-xs h-9 px-3.5 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 font-medium"
                  >
                    <span>{isEditingBeforeApply ? 'Done Editing' : 'Edit Before Applying'}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleStartAnalysis(true)}
                    disabled={isAnalyzing}
                    className="text-xs h-9 px-3.5 bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 font-medium flex items-center gap-1.5"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isAnalyzing && "animate-spin")} />
                    <span>Analyze Again</span>
                  </Button>

                  {editableTrades.length > 1 && onApplyMultipleTrades && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyAll}
                      className="text-xs h-9 px-3 flex items-center gap-1.5 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Apply All ({editableTrades.length})</span>
                    </Button>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleReset}
                  className="text-xs h-9 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
