/**
 * TradeVault Celebration Audio Engine
 * Uses Web Audio API for a short, professional, positive success chime.
 * No external network audio dependencies.
 */

const STORAGE_KEY = 'tradevault_celebration_sound';

export function isCelebrationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(STORAGE_KEY);
  return val === null ? true : val === 'true';
}

export function setCelebrationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a short, uplifting, professional 3-note chord chime (C5 -> E5 -> G5 -> C6).
 * Safe, subtle, harmonic, ~0.9s duration.
 */
export function playTradeSaveChime(): void {
  if (!isCelebrationSoundEnabled()) return;

  // Respect system reduced-motion / quiet preference
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic chime notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.50Hz)
    const notes = [
      { freq: 523.25, start: 0, duration: 0.7, gain: 0.10 },
      { freq: 659.25, start: 0.08, duration: 0.75, gain: 0.12 },
      { freq: 783.99, start: 0.16, duration: 0.85, gain: 0.14 },
      { freq: 1046.50, start: 0.24, duration: 1.0, gain: 0.15 }
    ];

    notes.forEach(({ freq, start, duration, gain }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Soft sine overtone with very slight triangle warmness
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(gain, now + start + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    });
  } catch {
    // Autoplay or audio permission restrictions handled gracefully
  }
}
