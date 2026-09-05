import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label, Textarea } from '@/components/ui/Input';
import { UserAvatar } from '@/components/UserAvatar';
import { Camera, Trash2, CheckCircle2, AlertCircle, Loader2, Lock } from 'lucide-react';
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
  const { user, profile, updateProfile, uploadAvatar, removeAvatar } = useAuth();
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
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-semibold text-slate-900">User Profile</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, trading style, preferences, and profile image.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Avatar Upload Section */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-2xl">
        <Label className="block text-sm font-semibold text-slate-800 mb-3">
          Profile Photo
        </Label>
        
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Clickable Large Circular Avatar */}
          <div className="relative group">
            <UserAvatar
              avatarUrl={profile?.avatarUrl}
              size="xl"
              className="ring-4 ring-white shadow-md cursor-pointer group-hover:opacity-90"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change profile picture"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              aria-label="Upload profile photo"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
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
            <h4 className="text-sm font-semibold text-slate-800">
              {profile?.fullName || user?.displayName || 'Trader'}
            </h4>
            <p className="text-xs text-slate-500">
              Upload JPG, PNG, or WEBP (Max 5MB). Changes appear instantly across the dashboard and header.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="text-xs h-8"
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
                  className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5"
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
            <Label htmlFor="profile-fullname" className="block text-sm font-medium text-slate-700 mb-1">
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
            <Label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
              <span>Email Address</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Auth Managed
              </span>
            </Label>
            <Input
              id="profile-email"
              type="email"
              value={user?.email || profile?.email || ''}
              readOnly
              disabled
              className="h-10 bg-slate-100/70 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profile-style" className="block text-sm font-medium text-slate-700 mb-1">
              Trading Style
            </Label>
            <select
              id="profile-style"
              value={tradingStyle}
              onChange={(e) => setTradingStyle(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              {TRADING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="profile-experience" className="block text-sm font-medium text-slate-700 mb-1">
              Trading Experience
            </Label>
            <select
              id="profile-experience"
              value={tradingExperience}
              onChange={(e) => setTradingExperience(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">Select Experience Level</option>
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profile-markets" className="block text-sm font-medium text-slate-700 mb-1">
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
            <Label htmlFor="profile-session" className="block text-sm font-medium text-slate-700 mb-1">
              Preferred Trading Session
            </Label>
            <select
              id="profile-session"
              value={preferredTradingSession}
              onChange={(e) => setPreferredTradingSession(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            >
              <option value="">Select Session</option>
              {TRADING_SESSIONS.map((sess) => (
                <option key={sess} value={sess}>
                  {sess}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="profile-account-type" className="block text-sm font-medium text-slate-700 mb-1">
            Default Account Type
          </Label>
          <select
            id="profile-account-type"
            value={defaultAccountType}
            onChange={(e) => setDefaultAccountType(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="profile-bio" className="block text-sm font-medium text-slate-700 mb-1">
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
    </div>
  );
}
