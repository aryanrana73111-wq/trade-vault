import React, { useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight, 
  Zap, 
  Layers, 
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConnectedTradingAccount, MT5SyncResult } from '@/types/mt5';
import { formatCurrency } from '@/lib/utils';

interface SuccessCelebrationProps {
  account: ConnectedTradingAccount;
  syncResult?: MT5SyncResult | null;
  onGoToDashboard: () => void;
  onViewPositions?: () => void;
  onSyncNow?: () => void;
  onConnectAnother?: () => void;
  onClose?: () => void;
}

export function SuccessCelebration({
  account,
  syncResult,
  onGoToDashboard,
  onViewPositions,
  onSyncNow,
  onConnectAnother,
  onClose
}: SuccessCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sound chime & confetti animation
  useEffect(() => {
    // 1. Play subtle harmonic chime via Web Audio API (safe, no external assets needed)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        const now = ctx.currentTime;

        // Note 1: C5
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0, now);
        gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.85);

        // Note 2: E5
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.1);
        gain2.gain.setValueAtTime(0, now + 0.1);
        gain2.gain.linearRampToValueAtTime(0.12, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.95);

        // Note 3: G5
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(783.99, now + 0.2);
        gain3.gain.setValueAtTime(0, now + 0.2);
        gain3.gain.linearRampToValueAtTime(0.15, now + 0.25);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.2);
        osc3.stop(now + 1.25);
      }
    } catch {
      // Audio autoplay policy fallback
    }

    // 2. High-performance canvas glowing flower/petal particles (Bottom -> Upward)
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Glowing floral colors: gold, emerald, rose, cyan, amber, lavender
    const colors = ['#10B981', '#34D399', '#6EE7B7', '#F59E0B', '#FBBF24', '#60A5FA', '#818CF8', '#F472B6'];
    const particleCount = 70;

    // Spawn particles from bottom edge with upward velocity
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: width * 0.15 + Math.random() * (width * 0.7),
      y: height + Math.random() * 40,
      vx: (Math.random() - 0.5) * 3.5,
      vy: -(Math.random() * 5.5 + 4.5), // Upward floating velocity
      size: Math.random() * 7 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      waveFreq: Math.random() * 0.05 + 0.02,
      waveAmp: Math.random() * 2 + 1,
      alpha: 1,
      petalCount: 5
    }));

    let animId: number;
    let startTime = Date.now();

    const drawPetal = (context: CanvasRenderingContext2D, size: number) => {
      // Draw smooth petal / flower shape
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(-size * 0.6, -size * 0.5, -size * 0.4, -size, 0, -size * 1.2);
      context.bezierCurveTo(size * 0.4, -size, size * 0.6, -size * 0.5, 0, 0);
      context.fill();
    };

    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.y += p.vy;
        p.vy *= 0.985; // gently decelerate
        p.x += Math.sin(elapsed * p.waveFreq + idx) * p.waveAmp + p.vx;
        p.rotation += p.rotationSpeed;

        // 2 to 3 seconds duration fade
        if (elapsed > 1800) {
          p.alpha = Math.max(0, p.alpha - 0.025);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.globalAlpha = Math.max(0, p.alpha);

        drawPetal(ctx, p.size);

        ctx.restore();
      });

      if (elapsed < 3000) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const maskedAccount = account.accountNumber || `****${(account.id || '').slice(-4)}`;

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
      {/* Confetti Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20 w-full h-full"
      />

      {/* Close button if provided */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors z-30"
          title="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Pulsing Verified Shield & Checkmark */}
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-10 h-10 animate-in zoom-in-75 duration-300" />
        </div>
        <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Headings & Badge */}
      <div className="space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Account Linked Successfully</span>
        </div>

        <h3 className="text-2xl font-bold text-slate-100 tracking-tight">
          MetaTrader 5 Connected!
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Your MT5 trading account is verified and securely connected via a read-only investor session. Execution data will automatically synchronize into your TradeVault journal.
        </p>
      </div>

      {/* Detected Account Metadata Showcase Card */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-5 text-left relative z-10 shadow-inner space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Detected Broker & Server
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-slate-100">{account.broker}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-blue-400 border border-slate-700">
                {account.server}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
              Account Number
            </span>
            <span className="text-xs font-mono font-bold text-slate-200">
              {maskedAccount}
            </span>
          </div>
        </div>

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance</span>
            <p className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
              {formatCurrency(account.balance || 0, account.currency || 'USD')}
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Equity</span>
            <p className="text-sm sm:text-base font-bold text-slate-200 mt-0.5">
              {formatCurrency(account.equity || account.balance || 0, account.currency || 'USD')}
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Leverage</span>
            <p className="text-sm sm:text-base font-bold text-blue-400 mt-0.5">
              1:{account.leverage || 100}
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Mode</span>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Read-Only
            </p>
          </div>
        </div>

        {/* Sync Status Feedback */}
        {syncResult && (
          <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                {syncResult.imported > 0
                  ? `Successfully imported ${syncResult.imported} historical executions (${syncResult.period})`
                  : 'Account synchronized with 0 duplicates.'}
              </span>
            </div>
            <span className="font-mono text-[10px] text-blue-400/80 uppercase font-semibold">
              Live Verified
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-1 relative z-10">
        <Button
          onClick={onGoToDashboard}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          <span>View in Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Button>

        <div className="grid grid-cols-2 gap-2">
          {onViewPositions && (
            <Button
              variant="outline"
              onClick={onViewPositions}
              className="text-xs text-slate-300 border-slate-800 hover:bg-slate-800/80 py-2.5 flex items-center justify-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Open Positions</span>
            </Button>
          )}

          {onConnectAnother && (
            <Button
              variant="outline"
              onClick={onConnectAnother}
              className="text-xs text-slate-300 border-slate-800 hover:bg-slate-800/80 py-2.5 flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Connect Another</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
