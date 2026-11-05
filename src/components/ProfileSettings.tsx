import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { UserAvatar } from '@/components/UserAvatar';
import { Camera, Trash2, CheckCircle2, AlertCircle, Loader2, Lock, LogOut } from 'lucide-react';
import { TradingStyle } from '@/types';

const TRADING_STYLES: TradingStyle[] = [
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

const TRADING_SESSIONS = [
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

export function ProfileSettings() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, uploadAvatar, removeAvatar, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fullName, setFullName] = useState(profile?.fullName || user?.displayName || '');
  const [tradingStyle, setTradingStyle] = useState<string>(profile?.tradingStyle || 'Day Trading');
  const [tradingExperience, setTradingExperience] = useState<string>(profile?.tradingExperience || '');
  const [preferredMarkets, setPreferredMarkets] = useState<string>(profile?.preferredMarkets || '');
  const [preferredTradingSession, setPreferredTradingSession] = useState<string>(profile?.preferredTradingSession || '');
  const [defaultAccountType, setDefaultAccountType] = useState<string>(profile?.defaultAccountType || 'Personal Live');
  const [bio, setBio] = useState<string>(profile?.bio || '');

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || user?.displayName || '');
      setTradingStyle(profile.tradingStyle || 'Day Trading');
      setTradingExperience(profile.tradingExperience || '');
      setPreferredMarkets(profile.preferredMarkets || '');
      setPreferredTradingSession(profile.preferredTradingSession || '');
      setDefaultAccountType(profile.defaultAccountType || 'Personal Live');
      setBio(profile.bio || '');
    }
  }, [profile, user]);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so user can choose the same file again if needed
    e.target.value = '';
    setStatusMessage(null);

    // Validate type (flexible image check)
    const lowerType = file.type?.toLowerCase() || '';
    const isImageByMime = lowerType.startsWith('image/');
    const hasValidExt = /\.(jpe?g|png|webp|gif|jfif|bmp|svg|heic|heif|avif)$/i.test(file.name);
    if (!isImageByMime && !hasValidExt) {
      setStatusMessage({
        type: 'error',
        text: 'Please choose an image file (JPG, PNG, WEBP, etc.).'
      });
      return;
    }

    // Validate size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setStatusMessage({
        type: 'error',
        text: `File is too large (${sizeMB}MB). Maximum allowed size is 15MB.`
      });
      return;
    }

    try {
      setUploadingImage(true);
      await uploadAvatar(file);
      setStatusMessage({
        type: 'success',
        text: 'Profile photo updated successfully!'
      });
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update photo. Please try again.'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setStatusMessage(null);
    try {
      setUploadingImage(true);
      await removeAvatar();
      setStatusMessage({
        type: 'success',
        text: 'Profile photo removed.'
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to remove photo.'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!fullName.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Full Name is required.'
      });
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        tradingStyle,
        tradingExperience,
        preferredMarkets: preferredMarkets.trim(),
        preferredTradingSession,
        defaultAccountType,
        bio: bio.trim(),
      });
      setStatusMessage({
        type: 'success',
        text: 'Profile updated and saved to Firestore.'
      });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to save profile changes. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">User Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, trading style, preferences, and profile image.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-800/60 text-red-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-rose-400 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 max-w-2xl">
        <Label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">
          Profile Photo
        </Label>
        
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Clickable Large Circular Avatar */}
          <div className="relative group">
            <UserAvatar
              avatarUrl={profile?.avatarUrl}
              size="xl"
              className="ring-4 ring-white dark:ring-slate-800 shadow-md cursor-pointer group-hover:opacity-90"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 cursor-pointer"
            >
              {uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="hidden"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {profile?.fullName || user?.displayName || 'Trader'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload JPG, PNG, or WEBP (Max 15MB). Changes appear instantly across the dashboard and header.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="text-xs h-8 cursor-pointer"
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </Button>

              {profile?.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingImage}
                  className="text-xs h-8 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-5 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profile-fullname" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="profile-fullname"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="h-10"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                <Lock className="w-3 h-3" /> Auth Managed
              </span>
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={user?.email || profile?.email || ''}
              readOnly
              disabled
              className="h-10 bg-slate-100/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-white/[0.08]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profile-style" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Trading Style
            </Label>
            <select
              id="profile-style"
              value={tradingStyle}
              onChange={(e) => setTradingStyle(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
              disabled={saving}
            >
              {TRADING_STYLES.map((style) => (
                <option key={style} value={style} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="profile-experience" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Trading Experience
            </Label>
            <select
              id="profile-experience"
              value={tradingExperience}
              onChange={(e) => setTradingExperience(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
              disabled={saving}
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Experience Level</option>
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp} value={exp} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profile-markets" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Preferred Markets
            </Label>
            <Input
              id="profile-markets"
              type="text"
              value={preferredMarkets}
              onChange={(e) => setPreferredMarkets(e.target.value)}
              placeholder="e.g. Forex, Crypto, Indices, Stocks"
              className="h-10"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="profile-session" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Preferred Trading Session
            </Label>
            <select
              id="profile-session"
              value={preferredTradingSession}
              onChange={(e) => setPreferredTradingSession(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
              disabled={saving}
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select Session</option>
              {TRADING_SESSIONS.map((sess) => (
                <option key={sess} value={sess} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {sess}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="profile-account-type" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Default Account Type
          </Label>
          <select
            id="profile-account-type"
            value={defaultAccountType}
            onChange={(e) => setDefaultAccountType(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-slate-200/80 dark:border-white/[0.1] bg-white dark:bg-black px-3 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs"
            disabled={saving}
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="profile-bio" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
            Short Bio / About
          </Label>
          <Textarea
            id="profile-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a brief note about your strategy rules, edge, or market outlook..."
            className="text-sm"
            disabled={saving}
          />
        </div>

        <div className="pt-2 flex items-center justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 font-medium shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving to Cloud...
              </>
            ) : (
              'Save Profile Changes'
            )}
          </Button>
        </div>
      </form>

      {/* Account Session & Log Out Section */}
      <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Account Session</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Signed in as <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{user?.email || 'Active Trader'}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
