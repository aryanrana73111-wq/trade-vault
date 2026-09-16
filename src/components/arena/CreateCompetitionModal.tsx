import React, { useState } from 'react';
import { Arena, CompetitionScoringMode, PrivacyMode, FairPlayMode } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { createCompetition } from '@/lib/arenaService';
import {
  X,
  Trophy,
  Copy,
  Check,
  Globe,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface CreateCompetitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (arena: Arena) => void;
}

export function CreateCompetitionModal({
  isOpen,
  onClose,
  onCreated
}: CreateCompetitionModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Success state with generated code
  const [createdArena, setCreatedArena] = useState<Arena | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Step 1: Basics & Capital
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(14);
  const [startingBalance, setStartingBalance] = useState('10000');
  const [maxMembers, setMaxMembers] = useState<number | undefined>(undefined);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );

  // Step 2: Scoring & Risk Rules
  const [scoringMode, setScoringMode] = useState<CompetitionScoringMode>('Total R');
  const [fairPlayMode, setFairPlayMode] = useState<FairPlayMode>('Fair Play');
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('Standard');
  const [minTrades, setMinTrades] = useState(5);
  const [maxRiskPercent, setMaxRiskPercent] = useState('2.0');

  // Step 3: Permissions & Review
  const [permissions, setPermissions] = useState({
    profile: true,
    performance: true,
    tradeDetails: true,
    research: true,
    psychology: true,
    screenshots: true
  });

  if (!isOpen) return null;

  const handleCopyCodeOnly = (code: string) => {
    // Strictly copy ONLY the raw code, without any prefix or extra text
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const arena = await createCompetition({
        ownerId: user.uid,
        name: name.trim(),
        description: description.trim(),
        durationDays,
        startingBalance: parseFloat(startingBalance) || 10000,
        scoringMode,
        privacyMode,
        fairPlayMode,
        timezone,
        maxMembers: maxMembers && Number(maxMembers) > 0 ? Number(maxMembers) : undefined,
        minTrades: minTrades > 0 ? minTrades : 3,
        // No market or session restrictions: All markets and all sessions supported
        allowedMarkets: [],
        allowedSessions: [],
        riskLimits: {
          maxRiskPercentPerTrade: parseFloat(maxRiskPercent) || 2.0
        },
        initialPermissions: permissions,
        ownerDisplayName: user.displayName || 'Competition Host',
        ownerPhotoURL: user.photoURL || undefined
      });

      setCreatedArena(arena);
    } catch (err: any) {
      console.error('Failed to create competition:', err);
      setError(err.message || 'Failed to create competition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndEnter = () => {
    if (createdArena) {
      onCreated(createdArena);
      onClose();
    }
  };

  // SUCCESS VIEW: Copy Only Code & Enter Arena
  if (createdArena) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-6 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Competition Created!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{createdArena.name}</span> is ready for traders.
            </p>
          </div>

          {/* Code Box with STRICT RAW CODE COPY */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Competition Joining Code
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400 tracking-wider select-all">
              {createdArena.code}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Share this code with other traders to invite them to compete.
            </p>

            <Button
              type="button"
              onClick={() => handleCopyCodeOnly(createdArena.code)}
              className={`w-full py-2.5 h-11 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                copiedCode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Competition code copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY CODE</span>
                </>
              )}
            </Button>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              onClick={handleFinishAndEnter}
              variant="outline"
              className="w-full h-11 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
            >
              <span>Enter Competition Arena</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                Create Competition Arena
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Step {step} of 3 • {step === 1 ? 'Arena & Capital' : step === 2 ? 'Scoring & Risk' : 'Review & Launch'}
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

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 px-1 truncate transition-colors ${
              step === 1
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            1. Arena & Capital
          </button>
          <button
            type="button"
            onClick={() => name.trim() && setStep(2)}
            disabled={!name.trim()}
            className={`py-2.5 px-1 truncate transition-colors ${
              step === 2
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'text-slate-400 hover:text-slate-600 disabled:opacity-40'
            }`}
          >
            2. Scoring & Risk
          </button>
          <button
            type="button"
            onClick={() => name.trim() && setStep(3)}
            disabled={!name.trim()}
            className={`py-2.5 px-1 truncate transition-colors ${
              step === 3
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'text-slate-400 hover:text-slate-600 disabled:opacity-40'
            }`}
          >
            3. Review & Launch
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Basic Information & Capital */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <Label>Competition Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TradeVault Championship 2026"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Description / Objective</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Strict 1% risk discipline, high R:R setups, and transparent execution."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Starting Balance ($)</Label>
                  <Input
                    type="number"
                    min="100"
                    step="100"
                    value={startingBalance}
                    onChange={(e) => setStartingBalance(e.target.value)}
                    placeholder="10000"
                    required
                  />
                  <p className="text-[11px] text-slate-400">Baseline equity used for Return % & Equity curve.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Duration</Label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value={3}>3 Days (Weekend Sprint)</option>
                    <option value={7}>7 Days (1 Week)</option>
                    <option value={14}>14 Days (2 Weeks)</option>
                    <option value={30}>30 Days (Monthly Championship)</option>
                    <option value={90}>90 Days (Quarterly League)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Max Participants</Label>
                  <select
                    value={maxMembers || ''}
                    onChange={(e) => setMaxMembers(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Unlimited (Group)</option>
                    <option value={2}>2 Traders (1-on-1 Duel)</option>
                    <option value={5}>5 Traders (Small Circle)</option>
                    <option value={10}>10 Traders (Inner Team)</option>
                    <option value={25}>25 Traders (Trading Desk)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Timezone Reference</Label>
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="e.g. Europe/London"
                  />
                </div>
              </div>

              {/* Informational Note on Universal Market & Session Support */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Unrestricted Market & Session Freedom:</strong> Participants can trade any supported or custom market (Forex, Gold, Crypto, Indices, Stocks, Commodities) during the competition. No session restriction is applied.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Continue to Scoring →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Scoring & Risk Rules */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-2">
                <Label>Ranking & Scoring System</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Total R', 'Avg R', 'P&L', 'ROI', 'Discipline', 'Consistency', 'Risk-adjusted', 'Custom Composite'] as CompetitionScoringMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setScoringMode(mode)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        scoringMode === mode
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100 font-bold ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{mode}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        {mode === 'Total R' && 'Fair for varying account sizes'}
                        {mode === 'Avg R' && 'Rewards quality expectancy'}
                        {mode === 'P&L' && 'Direct dollar gain'}
                        {mode === 'ROI' && 'Percentage return'}
                        {mode === 'Discipline' && 'Rule compliance & execution'}
                        {mode === 'Consistency' && 'Steady win streak & low DD'}
                        {mode === 'Risk-adjusted' && 'Sharpe/Sortino equivalent'}
                        {mode === 'Custom Composite' && 'Weighted balance metric'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Fair Play Audit Mode</Label>
                  <select
                    value={fairPlayMode}
                    onChange={(e) => setFairPlayMode(e.target.value as FairPlayMode)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Fair Play">Fair Play (Timestamp checks + audit trail)</option>
                    <option value="Locked">Locked (Zero edits allowed once submitted)</option>
                    <option value="Standard">Standard (Casual rules)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Privacy Exposure Mode</Label>
                  <select
                    value={privacyMode}
                    onChange={(e) => setPrivacyMode(e.target.value as PrivacyMode)}
                    className="w-full h-10 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Standard">Standard (Full allowed projection)</option>
                    <option value="Selective">Selective (Hide dollar amounts, show R only)</option>
                    <option value="Minimal">Minimal (Rankings & win rate only)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Min. Trades for Podium Qualification</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={minTrades}
                    onChange={(e) => setMinTrades(parseInt(e.target.value, 10) || 1)}
                  />
                  <p className="text-[11px] text-slate-400">Prevents 1-trade flukes from winning.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Max Risk Allowed per Trade (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={maxRiskPercent}
                    onChange={(e) => setMaxRiskPercent(e.target.value)}
                  />
                  <p className="text-[11px] text-slate-400">Flags trades exceeding this risk boundary.</p>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  ← Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Review & Launch →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Launch (NO market or session restriction) */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Competition Freedom summary */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    Open Market Arena
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Starting Balance</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${parseFloat(startingBalance).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scoring Mode</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{scoringMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{durationDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Markets Allowed</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">All Markets (Forex, Crypto, Gold, Custom...)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sessions Allowed</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">All Sessions (24/7)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fair Play Policy</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{fairPlayMode}</span>
                </div>
              </div>

              {/* Default Sharing Permissions for Host */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <Label className="text-xs">Your Initial Sharing Settings</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'performance', label: 'Performance (P&L, R)' },
                    { key: 'tradeDetails', label: 'Trade Levels & Size' },
                    { key: 'research', label: 'Strategy & Session' },
                    { key: 'psychology', label: 'Discipline & Rules' },
                    { key: 'screenshots', label: 'Execution Charts' }
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-medium cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(permissions as any)[item.key]}
                        onChange={(e) =>
                          setPermissions(p => ({ ...p, [item.key]: e.target.checked }))
                        }
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  ← Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[160px]"
                >
                  {isSubmitting ? 'Launching Arena...' : 'Create & Launch Arena 🚀'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
