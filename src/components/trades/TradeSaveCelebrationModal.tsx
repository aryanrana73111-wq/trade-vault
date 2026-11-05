import React, { useEffect, useRef, useState } from 'react';
import { 
  Sparkles, 
  X, 
  ExternalLink, 
  Camera, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { isCelebrationSoundEnabled, setCelebrationSoundEnabled, playTradeSaveChime } from '@/lib/celebrationAudio';

export interface TradeCelebrationData {
  id?: string;
  market: string;
  direction: 'BUY' | 'SELL';
  positionSize?: number | string;
  pnl?: number | null;
  result?: 'WIN' | 'LOSS' | 'BREAK EVEN' | 'PENDING' | string;
  source?: 'mt5_screenshot' | 'manual' | 'mt5_sync' | 'competition' | string;
  rawSymbol?: string;
  ticketId?: string;
}

interface TradeSaveCelebrationModalProps {
  isOpen: boolean;
  trade: TradeCelebrationData | null;
  onClose: () => void;
  onViewTrade?: (tradeId?: string) => void;
  autoCloseDelay?: number; // ms, default 2400
}

export function TradeSaveCelebrationModal({
  isOpen,
  trade,
  onClose,
  onViewTrade,
  autoCloseDelay = 2400
}: TradeSaveCelebrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isCelebrationSoundEnabled());
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Play chime and start canvas animation when opened
  useEffect(() => {
    if (!isOpen || !trade) return;

    // 1. Play audio chime on user-initiated save
    playTradeSaveChime();

    // 2. Auto-close timer
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);

    // 3. Upward Particles Celebration Animation
    const canvas = canvasRef.current;
    if (!canvas || isReducedMotion) {
      return () => clearTimeout(timer);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return () => clearTimeout(timer);

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Subtle, elegant fintech colors: emerald, gold, cyan, soft amethyst, warm amber
    const colors = [
      '#10B981', // emerald-500
      '#34D399', // emerald-400
      '#F59E0B', // amber-500
      '#FBBF24', // amber-400
      '#06B6D4', // cyan-500
      '#6366F1', // indigo-500
      '#A855F7'  // purple-500
    ];

    const particleCount = 45;

    // Upward particles rising from the bottom 40-50% of the screen
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: width * 0.15 + Math.random() * (width * 0.7),
      y: height + Math.random() * 20,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(Math.random() * 4.5 + 3.5), // strictly upward velocity
      size: Math.random() * 5 + 3.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      waveFreq: Math.random() * 0.04 + 0.02,
      waveAmp: Math.random() * 1.8 + 0.8,
      alpha: 0.95,
      shape: Math.random() > 0.4 ? 'petal' : 'sparkle'
    }));

    let animId: number;
    const startTime = Date.now();

    const drawShape = (
      context: CanvasRenderingContext2D, 
      shape: string, 
      size: number
    ) => {
      if (shape === 'petal') {
        // Draw smooth celebratory petal / light leaf
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(-size * 0.6, -size * 0.4, -size * 0.3, -size * 0.9, 0, -size * 1.1);
        context.bezierCurveTo(size * 0.3, -size * 0.9, size * 0.6, -size * 0.4, 0, 0);
        context.fill();
      } else {
        // 4-point sparkle
        context.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          const nextAngle = angle + Math.PI / 4;
          context.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
          context.lineTo(Math.cos(nextAngle) * (size * 0.35), Math.sin(nextAngle) * (size * 0.35));
        }
        context.closePath();
        context.fill();
      }
    };

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.y += p.vy;
        p.vy *= 0.988; // gently decelerate
        p.x += Math.sin(elapsed * p.waveFreq + idx) * p.waveAmp + p.vx;
        p.rotation += p.rotationSpeed;

        // Fade gracefully as particles reach apex
        if (elapsed > 1200) {
          p.alpha = Math.max(0, p.alpha - 0.03);
        }

        // Limit particles within lower/middle 50% of viewport
        if (p.y < height * 0.35) {
          p.alpha = Math.max(0, p.alpha - 0.06);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = Math.max(0, p.alpha);

        drawShape(ctx, p.shape, p.size);

        ctx.restore();
      });

      if (elapsed < 2400) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animId);
    };
  }, [isOpen, trade, autoCloseDelay, isReducedMotion]);

  // Keyboard accessibility: ESC key closes modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setCelebrationSoundEnabled(next);
    if (next) {
      playTradeSaveChime();
    }
  };

  if (!isOpen || !trade) return null;

  const isScreenshotImport = trade.source === 'mt5_screenshot' || trade.source === 'screenshot';
  const isCompetition = trade.source === 'competition';
  const isBuy = trade.direction === 'BUY';
  const hasPnl = trade.pnl !== undefined && trade.pnl !== null;
  const pnlNum = hasPnl ? Number(trade.pnl) : null;
  const lotSizeFormatted = trade.positionSize !== undefined && trade.positionSize !== null && trade.positionSize !== ''
    ? `${Number(trade.positionSize)} lot`
    : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Trade Saved Successfully"
      onClick={onClose}
    >
      {/* Upward particle canvas covering lower/middle viewport */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />

      <div 
        className="relative z-20 w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-950/40 p-6 text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with sound toggle & close button */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={handleToggleSound}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/60 transition-colors text-[11px]"
            title={soundEnabled ? 'Disable Celebration Sound' : 'Enable Celebration Sound'}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Sound: <strong className="text-emerald-400 font-semibold">ON</strong></span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Sound: <strong className="text-slate-500 font-semibold">OFF</strong></span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Celebration Icon Header */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/20">
            <Sparkles className="w-7 h-7 text-white animate-spin-slow" />
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            <span>🎉</span> Trade Saved Successfully!
          </h3>
          <p className="text-sm text-slate-400">
            Your trade has been added to TradeVault.
          </p>
        </div>

        {/* Compact Trade Summary Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-wide">
                {trade.market}
              </span>
              <span 
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider ${
                  isBuy 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {isBuy ? (
                  <TrendingUp className="w-3 h-3 mr-1 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 inline" />
                )}
                {trade.direction}
              </span>
            </div>

            {lotSizeFormatted && (
              <span className="text-xs font-medium text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/50">
                {lotSizeFormatted}
              </span>
            )}
          </div>

          {/* PnL and Source Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-xs">
            <div className="flex items-center gap-1.5">
              {isScreenshotImport ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-md font-medium">
                  <Camera className="w-3 h-3 text-indigo-400" />
                  Imported from MT5 Screenshot
                </span>
              ) : isCompetition ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Competition Entry
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-slate-700/40 border border-slate-600/40 px-2 py-0.5 rounded-md font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Added Manually
                </span>
              )}
            </div>

            {pnlNum !== null ? (
              <span className={`font-mono font-bold text-sm ${pnlNum >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pnlNum >= 0 ? `+${formatCurrency(pnlNum)}` : `-${formatCurrency(Math.abs(pnlNum))}`}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                Open Position
              </span>
            )}
          </div>
        </div>

        {/* Action Button & Auto-dismiss note */}
        <div className="space-y-2 pt-1">
          <Button
            onClick={() => {
              if (onViewTrade) {
                onViewTrade(trade.id);
              }
              onClose();
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <span>View Trade</span>
            <ExternalLink className="w-4 h-4" />
          </Button>

          <p className="text-[11px] text-slate-500">
            Auto-closing in a moment...
          </p>
        </div>

        {/* Auto-closing progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all ease-linear"
            style={{ 
              width: '100%',
              animation: `shrinkWidth ${autoCloseDelay}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
