import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Award, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  TrendingUp, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MilestoneFeatureDef, markFeatureCelebrated } from '@/lib/milestoneAnalytics';
import { isCelebrationSoundEnabled, setCelebrationSoundEnabled, playTradeSaveChime } from '@/lib/celebrationAudio';

interface MilestoneUnlockCelebrationModalProps {
  isOpen: boolean;
  feature: MilestoneFeatureDef | null;
  tradeCount: number;
  userId?: string;
  onClose: () => void;
  onExplore: (featureId: string) => void;
}

export function MilestoneUnlockCelebrationModal({
  isOpen,
  feature,
  tradeCount,
  userId = 'default_user',
  onClose,
  onExplore
}: MilestoneUnlockCelebrationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => isCelebrationSoundEnabled());
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  // Dismiss & mark permanently celebrated helper (one-time ever)
  const handleDismiss = useCallback(() => {
    if (feature) {
      markFeatureCelebrated(userId, feature.id);
      markFeatureCelebrated('global', feature.id);
    }
    onClose();
  }, [feature, userId, onClose]);

  const handleExploreAction = useCallback(() => {
    if (feature) {
      markFeatureCelebrated(userId, feature.id);
      markFeatureCelebrated('global', feature.id);
      onExplore(feature.id);
    }
    onClose();
  }, [feature, userId, onExplore, onClose]);

  // Mark feature as celebrated immediately when shown so it is NEVER shown again
  useEffect(() => {
    if (isOpen && feature) {
      markFeatureCelebrated(userId, feature.id);
      markFeatureCelebrated('global', feature.id);
    }
  }, [isOpen, feature, userId]);

  // Play audio chime and run upward celebratory particle animation
  useEffect(() => {
    if (!isOpen || !feature) return;

    playTradeSaveChime();

    const canvas = canvasRef.current;
    if (!canvas || isReducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const colors = ['#10B981', '#34D399', '#F59E0B', '#FBBF24', '#3B82F6', '#6366F1', '#EC4899'];
    const particleCount = 45;

    const particles = Array.from({ length: particleCount }).map(() => ({
      x: width * 0.15 + Math.random() * (width * 0.7),
      y: height + Math.random() * 20,
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 5 + 4),
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      waveFreq: Math.random() * 0.04 + 0.02,
      waveAmp: Math.random() * 2 + 1,
      alpha: 1,
      shape: Math.random() > 0.4 ? 'sparkle' : 'petal'
    }));

    let animId: number;
    const startTime = Date.now();

    const drawShape = (context: CanvasRenderingContext2D, shape: string, size: number) => {
      if (shape === 'petal') {
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(-size * 0.6, -size * 0.4, -size * 0.3, -size * 0.9, 0, -size * 1.1);
        context.bezierCurveTo(size * 0.3, -size * 0.9, size * 0.6, -size * 0.4, 0, 0);
        context.fill();
      } else {
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
        p.vy *= 0.985;
        p.x += Math.sin(elapsed * p.waveFreq + idx) * p.waveAmp + p.vx;
        p.rotation += p.rotationSpeed;

        if (elapsed > 1400) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        if (p.y < height * 0.35) {
          p.alpha = Math.max(0, p.alpha - 0.05);
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
      cancelAnimationFrame(animId);
    };
  }, [isOpen, feature, isReducedMotion]);

  if (!isOpen || !feature) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="New Analytics Unlocked"
      onClick={handleDismiss}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-10 w-full h-full"
      />

      {/* Main Modal Card Container (div:nth-of-type(1)) */}
      <div 
        className="relative z-20 w-full max-w-md max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] bg-slate-900 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-amber-950/60 p-4 sm:p-6 text-center flex flex-col justify-between overflow-hidden my-auto animate-in zoom-in-95 duration-200 box-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Child 1: Top Sound Toggle & Close Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 shrink-0 pb-1">
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              setCelebrationSoundEnabled(next);
              if (next) playTradeSaveChime();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-[11px] border border-slate-700/60 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-300">Sound: <strong className="text-amber-400 font-semibold">ON</strong></span>
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
            onClick={handleDismiss}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content container for smaller laptop viewports */}
        <div className="overflow-y-auto overscroll-contain pr-1 -mr-1 space-y-3 sm:space-y-4 py-1 flex-1">
          {/* Child 2: Pulsing Trophy Badge Header */}
          <div className="relative mx-auto w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-xl animate-pulse" />
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 ring-4 ring-amber-500/20">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>

          {/* Child 3: Milestone Title & Copy */}
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs uppercase tracking-widest font-extrabold text-amber-400 block">
              Milestone #{feature.index} Reached
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
              🎉 NEW ANALYTICS UNLOCKED
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
              &ldquo;{feature.name}&rdquo;
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed px-2">
              You&apos;ve completed <strong className="text-amber-400">{tradeCount} qualifying trades</strong>. Your new analytics tool is now available.
            </p>
          </div>

          {/* Child 4: Feature Preview Card */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/80 border border-slate-700/80 text-left space-y-1 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Unlock className="w-3.5 h-3.5 shrink-0" />
              <span>Unlocked Feature #{feature.index}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>

        {/* Child 5: Buttons Container (Fixed inside card, 100% contained, no laptop overflow) */}
        <div className="shrink-0 pt-3 border-t border-slate-800/80 mt-2 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Button 1: Explore Now */}
          <Button
            type="button"
            onClick={handleExploreAction}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 min-h-[40px] sm:min-h-[42px] cursor-pointer text-xs sm:text-sm transition-transform active:scale-[0.98]"
          >
            <span>Explore Now</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Button>

          {/* Button 2: Continue */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full border border-slate-700/90 hover:border-slate-600 bg-slate-800/70 hover:bg-slate-800 text-slate-200 font-semibold py-2.5 px-4 rounded-xl min-h-[40px] sm:min-h-[42px] flex items-center justify-center cursor-pointer text-xs sm:text-sm transition-colors shadow-2xs active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
