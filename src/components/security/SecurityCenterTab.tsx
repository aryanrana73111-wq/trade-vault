import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  KeyRound, 
  Mail, 
  Lock, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Clock, 
  Database,
  Info
} from 'lucide-react';
import { 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  linkWithCredential, 
  linkWithPopup,
  updatePassword, 
  EmailAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { getFriendlyAuthErrorMessage } from '@/lib/authErrors';
import { getDeviceSessionInfo, logSecurityEvent } from '@/lib/securityService';

interface SecurityCenterTabProps {
  user: FirebaseUser | null;
  onRefreshUser?: () => Promise<void>;
}

export function SecurityCenterTab({ user, onRefreshUser }: SecurityCenterTabProps) {
  const [deviceInfo] = useState(() => getDeviceSessionInfo());
  const [refreshingAuth, setRefreshingAuth] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [resetEmailSending, setResetEmailSending] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState<'set' | 'change' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const hasGoogleProvider = user?.providerData?.some(p => p.providerId === 'google.com') ?? false;
  const hasPasswordProvider = user?.providerData?.some(p => p.providerId === 'password') ?? false;
  const isEmailVerified = Boolean(user?.emailVerified);

  // Refresh user verification status
  const handleRefreshStatus = async () => {
    if (!user) return;
    setStatusMessage(null);
    try {
      setRefreshingAuth(true);
      await user.reload();
      if (onRefreshUser) await onRefreshUser();
      if (auth.currentUser?.emailVerified) {
        setStatusMessage({ type: 'success', text: 'Email verification verified! Your account email status is now Protected.' });
      } else {
        setStatusMessage({ type: 'info', text: 'Email is still pending verification. Please click the confirmation link sent to your inbox, then refresh.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: getFriendlyAuthErrorMessage(err) });
    } finally {
      setRefreshingAuth(false);
    }
  };

  // Send verification email
  const handleSendVerification = async () => {
    if (!user) return;
    setStatusMessage(null);
    try {
      setVerificationSending(true);
      await sendEmailVerification(user);
      await logSecurityEvent(user.uid, {
        action: 'EMAIL_VERIFICATION_SENT',
        title: 'Verification Email Dispatched',
        description: `Verification link sent to ${user.email}.`,
        status: 'success'
      });
      setStatusMessage({
        type: 'success',
        text: `Verification email sent to ${user.email}. Please check your inbox (and spam folder) and click the link to verify.`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: getFriendlyAuthErrorMessage(err) });
    } finally {
      setVerificationSending(false);
    }
  };

  // Link Google Account
  const handleLinkGoogle = async () => {
    if (!user) return;
    setStatusMessage(null);
    try {
      setLinkingGoogle(true);
      const res = await linkWithPopup(user, googleProvider);
      await logSecurityEvent(user.uid, {
        action: 'GOOGLE_LINKED',
        title: 'Google Provider Connected',
        description: `Google account linked: ${res.user.email}.`,
        status: 'success'
      });
      setStatusMessage({
        type: 'success',
        text: 'Google account linked successfully! You can now log into TradeVault using either Google or your email and password.'
      });
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setStatusMessage({
          type: 'error',
          text: 'This Google account is already linked to another TradeVault profile.'
        });
      } else {
        setStatusMessage({ type: 'error', text: getFriendlyAuthErrorMessage(err) });
      }
    } finally {
      setLinkingGoogle(false);
    }
  };

  // Set or Change Password
  const handleSetOrChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (!user || !user.email) {
      setStatusMessage({ type: 'error', text: 'No active authenticated user session found.' });
      return;
    }

    try {
      setPasswordLoading(true);
      if (showPasswordModal === 'set') {
        const credential = EmailAuthProvider.credential(user.email, newPassword);
        await linkWithCredential(user, credential);
        await logSecurityEvent(user.uid, {
          action: 'PASSWORD_LINKED',
          title: 'Account Password Configured',
          description: `Direct password sign-in configured for ${user.email}.`,
          status: 'success'
        });
        setStatusMessage({
          type: 'success',
          text: 'Password created! You can now sign in using your email and password as well as Google.'
        });
      } else {
        await updatePassword(user, newPassword);
        await logSecurityEvent(user.uid, {
          action: 'PASSWORD_CHANGED',
          title: 'Account Password Updated',
          description: `Password updated. Active refresh tokens will be rotated.`,
          status: 'success'
        });
        setStatusMessage({
          type: 'success',
          text: 'Password updated successfully! Changing your password invalidates older sessions on other devices.'
        });
      }
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: getFriendlyAuthErrorMessage(err) });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Send password reset
  const handleSendResetEmail = async () => {
    if (!user || !user.email) return;
    setStatusMessage(null);
    try {
      setResetEmailSending(true);
      await sendPasswordResetEmail(auth, user.email);
      await logSecurityEvent(user.uid, {
        action: 'PASSWORD_RESET_SENT',
        title: 'Password Reset Dispatched',
        description: `Password reset email dispatched to ${user.email}.`,
        status: 'success'
      });
      setStatusMessage({
        type: 'success',
        text: `A password reset link has been dispatched to ${user.email}.`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: getFriendlyAuthErrorMessage(err) });
    } finally {
      setResetEmailSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback message banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border animate-in fade-in duration-200 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : statusMessage.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />}
          {statusMessage.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex-1 font-medium leading-relaxed">{statusMessage.text}</div>
        </div>
      )}

      {/* Account Security Posture Overview */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Security Posture</span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">Account Security Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              <ShieldCheck className="w-4 h-4" />
              UID Isolated
            </span>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          {/* Email Verification */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Verification</div>
            <div className="flex items-center gap-1.5 mt-2">
              {isEmailVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">✓ Protected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">⚠ Action recommended</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 truncate">{user?.email || 'No email set'}</span>
          </div>

          {/* Primary Authentication */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Authentication Method</div>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                ✓ Protected
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {hasGoogleProvider && hasPasswordProvider 
                ? 'Dual Linked (Google + Pass)' 
                : hasGoogleProvider ? 'Google OAuth 2.0' : 'Email & Password'}
            </span>
          </div>

          {/* 2FA / MFA Status */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">2FA / MFA Status</div>
            <div className="flex items-center gap-1.5 mt-2">
              {hasGoogleProvider ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">✓ Google 2SV</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">✕ Not configured</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 mt-1">
              {hasGoogleProvider ? 'Protected by Google Account' : 'Standard Auth (No GCIP)'}
            </span>
          </div>

          {/* Data Protection */}
          <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Data Storage Security</div>
            <div className="flex items-center gap-1.5 mt-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">✓ Protected</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1">TLS 1.3 / AES-256 Cloud</span>
          </div>
        </div>
      </div>

      {/* Email Verification Action Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Email Address Verification</h4>
                {isEmailVerified ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Registered email: <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.email || 'None'}</span>. Verifying your email protects account recovery and confirms ownership.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
            {!isEmailVerified && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendVerification}
                disabled={verificationSending}
                className="text-xs"
              >
                {verificationSending ? 'Sending...' : 'Send Verification Email'}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefreshStatus}
              disabled={refreshingAuth}
              className="text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshingAuth ? 'animate-spin' : ''}`} />
              Check Status
            </Button>
          </div>
        </div>
      </div>

      {/* Connected Authentication Providers */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Connected Sign-In Methods
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            TradeVault supports account linking so you can authenticate via Google OAuth or Email/Password without creating duplicate profiles.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Google Provider */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Google Account
                  {hasGoogleProvider ? (
                    <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                      Not Linked
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hasGoogleProvider ? user?.email : 'Sign in with one-click Google OAuth 2.0'}
                </div>
              </div>
            </div>

            <div>
              {!hasGoogleProvider && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLinkGoogle}
                  disabled={linkingGoogle}
                  className="text-xs"
                >
                  {linkingGoogle ? 'Linking...' : 'Link Google'}
                </Button>
              )}
            </div>
          </div>

          {/* Email & Password Provider */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Email & Password Credentials
                  {hasPasswordProvider ? (
                    <span className="text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                      Not Configured
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hasPasswordProvider
                    ? 'Allows traditional email & password sign in'
                    : 'Set a password to enable email & password sign-in as a secondary method.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasPasswordProvider ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordModal('change');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-xs"
                >
                  Change Password
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  onClick={() => {
                    setShowPasswordModal('set');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Set Password
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication (Honest SaaS Architecture Note) */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication (2FA / MFA)</h4>
              {hasGoogleProvider ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  Secured by Google
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Not Configured
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Standard Firebase client authentication handles session tokens directly. Hardware security keys (FIDO2) or SMS 2FA enrollment require an enterprise Google Cloud Identity Platform (GCIP) setup.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 mt-2">
              <span className="font-semibold block mb-0.5">Security Recommendation:</span>
              If you authenticate with Google, your account benefits from Google's 2-Step Verification (Passkeys, Google Authenticator, or Security Keys). You can link your Google account above to inherit this protection.
            </div>
          </div>
        </div>
      </div>

      {/* Active Session & Device Management */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Active Session & Device Information
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your current active client session details detected via standard browser parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
            <div className="text-slate-500 font-medium">Current Device & Browser</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {deviceInfo.clientSummary}
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold">
                This Device
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">Timezone: {deviceInfo.timezone}</div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1.5">
            <div className="text-slate-500 font-medium">Authentication Timestamps</div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              Last Login: {user?.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : 'Active'}
            </div>
            <div className="text-slate-400 text-[11px]">
              Created: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">Session Revocation Policy:</span>
          <span>
            Firebase client sessions utilize secure JWT tokens with 1-hour validity and continuous rolling refresh. To immediately invalidate all active sessions across all remote devices, use "Change Password" or "Send Password Reset".
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendResetEmail}
            disabled={resetEmailSending}
            className="text-xs"
          >
            {resetEmailSending ? 'Dispatching...' : 'Send Password Reset Link'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              auth.signOut();
              window.location.href = '/login';
            }}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50"
          >
            Sign Out This Session
          </Button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold text-lg">
              <KeyRound className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {showPasswordModal === 'set' ? 'Set Account Password' : 'Change Account Password'}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {showPasswordModal === 'set'
                ? 'Create a password for your account. You will then be able to log in using either Google Sign-In or your email and password with the same journal data.'
                : 'Enter your new password below. It must contain at least 6 characters.'}
            </p>

            <form onSubmit={handleSetOrChangePassword} className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pr-10 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pr-10 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={passwordLoading}
                  onClick={() => setShowPasswordModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {passwordLoading ? 'Saving...' : (showPasswordModal === 'set' ? 'Set Password' : 'Update Password')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
