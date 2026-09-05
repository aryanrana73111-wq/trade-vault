import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const TRADING_STYLES = [
  'Scalping',
  'Day Trading',
  'Swing Trading',
  'Position Trading',
  'Other'
];

const EXPERIENCE_LEVELS = [
  'Beginner (< 1 yr)',
  'Intermediate (1-3 yrs)',
  'Advanced (3-5 yrs)',
  'Professional (5+ yrs)'
];

const SESSIONS = [
  'London',
  'New York',
  'Asian',
  'Sydney',
  'Overlap'
];

const ACCOUNT_TYPES = [
  'Personal Live',
  'Funded / Prop Firm',
  'Demo',
  'Paper'
];

export function OnboardingModal() {
  const { user, profile, updateProfile, loadingProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [tradingStyle, setTradingStyle] = useState('Day Trading');
  const [tradingExperience, setTradingExperience] = useState('Intermediate (1-3 yrs)');
  const [preferredMarkets, setPreferredMarkets] = useState('Forex, Crypto');
  const [preferredTradingSession, setPreferredTradingSession] = useState('New York');
  const [defaultAccountType, setDefaultAccountType] = useState('Personal Live');
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync initial values when user or profile is loaded
  useEffect(() => {
    if (profile || user) {
      if (profile?.fullName || user?.displayName) {
        setFullName(profile?.fullName || user?.displayName || '');
      }
      if (profile?.tradingStyle) {
        setTradingStyle(profile.tradingStyle);
      }
      if (profile?.tradingExperience) {
        setTradingExperience(profile.tradingExperience);
      }
      if (profile?.preferredMarkets) {
        setPreferredMarkets(profile.preferredMarkets);
      }
      if (profile?.preferredTradingSession) {
        setPreferredTradingSession(profile.preferredTradingSession);
      }
      if (profile?.defaultAccountType) {
        setDefaultAccountType(profile.defaultAccountType);
      }
      if (profile?.bio) {
        setBio(profile.bio);
      }
    }
  }, [profile, user]);

  // Show only if user is logged in, profile is loaded, and onboarding is not completed
  if (!user || loadingProfile || !profile || profile.onboardingCompleted) {
    return null;
  }

  const handleSubmit = async (e?: React.FormEvent, skipOptional = false) => {
    if (e) e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }

    if (!tradingStyle) {
      setError('Please select your Trading Style.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        tradingStyle,
        tradingExperience: skipOptional ? '' : tradingExperience,
        preferredMarkets: skipOptional ? '' : preferredMarkets.trim(),
        preferredTradingSession: skipOptional ? '' : preferredTradingSession,
        defaultAccountType: skipOptional ? 'Personal Live' : defaultAccountType,
        bio: skipOptional ? '' : bio.trim(),
        onboardingCompleted: true,
      });
    } catch (err: any) {
      console.error('Failed to save onboarding profile:', err);
      setError(err.message || 'Failed to save profile to Firestore. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white text-center">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to TradeVault</h2>
          <p className="text-blue-100 text-sm mt-1 max-w-sm mx-auto">
            Let&apos;s set up your profile to tailor your trading analytics and journaling.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200">
            <span className="font-semibold">Quick Setup:</span> Required fields are marked with an asterisk (*). All information can be edited later in Settings.
          </div>

          {/* Required: Full Name */}
          <div>
            <Label htmlFor="onboarding-name" className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="onboarding-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="h-10"
              disabled={saving}
            />
          </div>

          {/* Required: Trading Style */}
          <div>
            <Label htmlFor="onboarding-style" className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
              Primary Trading Style <span className="text-red-500">*</span>
            </Label>
            <select
              id="onboarding-style"
              value={tradingStyle}
              onChange={(e) => setTradingStyle(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={saving}
            >
              {TRADING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Optional Preferences
            </span>
          </div>

          {/* Optional: Trading Experience & Session */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="onboarding-exp" className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Trading Experience
              </Label>
              <select
                id="onboarding-exp"
                value={tradingExperience}
                onChange={(e) => setTradingExperience(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={saving}
              >
                <option value="">Select (Optional)</option>
                {EXPERIENCE_LEVELS.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="onboarding-session" className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Preferred Session
              </Label>
              <select
                id="onboarding-session"
                value={preferredTradingSession}
                onChange={(e) => setPreferredTradingSession(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={saving}
              >
                <option value="">Select (Optional)</option>
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional: Markets & Account Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="onboarding-markets" className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Preferred Markets
              </Label>
              <Input
                id="onboarding-markets"
                type="text"
                value={preferredMarkets}
                onChange={(e) => setPreferredMarkets(e.target.value)}
                placeholder="e.g. Gold, Forex, Crypto"
                className="h-9 text-sm"
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="onboarding-account" className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                Default Account Type
              </Label>
              <select
                id="onboarding-account"
                value={defaultAccountType}
                onChange={(e) => setDefaultAccountType(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={saving}
              >
                {ACCOUNT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional: Bio */}
          <div>
            <Label htmlFor="onboarding-bio" className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
              Short Bio / Trading Vision (Optional)
            </Label>
            <Textarea
              id="onboarding-bio"
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Focusing on strict risk discipline and high-probability breakout setups."
              className="text-sm min-h-[60px]"
              disabled={saving}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(undefined, true)}
              disabled={saving}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline font-medium cursor-pointer order-2 sm:order-1"
            >
              Skip optional fields
            </button>

            <Button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20 order-1 sm:order-2 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                'Continue to Journal'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
