import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Label, Card } from '@/components/ui/Input';
import { Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, KeyRound, Mail } from 'lucide-react';
import { getFriendlyAuthErrorMessage } from '@/lib/authErrors';
import { logSecurityEvent } from '@/lib/securityService';

interface GoogleNoticeState {
  show: boolean;
  email: string;
  reason: 'login_attempt' | 'signup_attempt';
}

interface LoginProps {
  defaultSignUp?: boolean;
}

export default function Login({ defaultSignUp = false }: LoginProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState<GoogleNoticeState | null>(null);
  const [invalidCredentialHelp, setInvalidCredentialHelp] = useState<string | null>(null);
  const [linkingPassword, setLinkingPassword] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // If already authenticated, redirect to Welcome Home immediately
  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setGoogleNotice(null);
    setInvalidCredentialHelp(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (isSignUp) {
      if (!password) {
        setError('Please enter a password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        try {
          await sendEmailVerification(res.user);
          await logSecurityEvent(res.user.uid, {
            action: 'AUTH_SIGNUP',
            title: 'Account Created',
            description: `New user account created with email/password (${cleanEmail}). Verification email dispatched.`,
            status: 'success'
          });
        } catch (vErr) {
          console.warn('Post-signup verification email note:', vErr);
        }
        navigate('/home');
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          // Account already exists. Attempt direct sign in with the provided password!
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, password);
            navigate('/home');
            return;
          } catch (signInErr: any) {
            // Check if created with Google
            let isGoogle = false;
            try {
              const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
              if (methods.includes('google.com')) {
                isGoogle = true;
              }
            } catch {
              // Protected
            }

            setIsSignUp(false);
            if (isGoogle) {
              setGoogleNotice({
                show: true,
                email: cleanEmail,
                reason: 'signup_attempt'
              });
              return;
            }

            setInvalidCredentialHelp(cleanEmail);
            setMessage('This email is already registered. If this is your password, please check and try again, or click "Send Reset Link" below to set a new password.');
            return;
          }
        }
        setError(getFriendlyAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      try {
        setLoading(true);
        let loginUser = null;
        try {
          const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
          loginUser = res.user;
        } catch (initialErr: any) {
          // If password had trailing/leading spaces and failed, try trimmed password
          if (
            password.trim() !== password &&
            (initialErr.code === 'auth/invalid-credential' || initialErr.code === 'auth/wrong-password')
          ) {
            const res = await signInWithEmailAndPassword(auth, cleanEmail, password.trim());
            loginUser = res.user;
          } else {
            throw initialErr;
          }
        }
        if (loginUser) {
          try {
            await logSecurityEvent(loginUser.uid, {
              action: 'AUTH_LOGIN',
              title: 'Email/Password Sign-In',
              description: `User authenticated successfully with email credentials (${cleanEmail}).`,
              status: 'success'
            });
          } catch {}
        }
        navigate('/home');
      } catch (err: any) {
        // Check if user signed up via Google
        let isGoogleAccount = false;
        try {
          const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
          if (methods.includes('google.com') && !methods.includes('password')) {
            isGoogleAccount = true;
          }
        } catch {
          // Protected
        }

        if (isGoogleAccount) {
          setGoogleNotice({
            show: true,
            email: cleanEmail,
            reason: 'login_attempt'
          });
          return;
        }

        // Handle invalid credentials with quick action resolution
        if (
          err.code === 'auth/invalid-credential' || 
          err.code === 'auth/invalid-login-credentials' || 
          err.code === 'auth/wrong-password'
        ) {
          setInvalidCredentialHelp(cleanEmail);
          setError('Incorrect email or password. If you originally signed up with Google, please use "Continue with Google", or click "Send Reset Link" below.');
          return;
        }

        if (err.code === 'auth/user-not-found') {
          setError('No account found with this email. Switch to "Create Account" below to register.');
          return;
        }

        setError(getFriendlyAuthErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      setGoogleNotice(null);
      setInvalidCredentialHelp(null);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        try {
          await logSecurityEvent(res.user.uid, {
            action: 'AUTH_LOGIN',
            title: 'Google OAuth Sign-In',
            description: `User authenticated with Google OAuth 2.0 (${res.user.email}).`,
            status: 'success'
          });
        } catch {}
      }
      navigate('/home');
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Securely links password credential to existing Google account
  const handleLinkPasswordViaGoogle = async () => {
    if (!password || password.length < 6) {
      setError('Please enter a password of at least 6 characters to link to your account.');
      return;
    }

    try {
      setLinkingPassword(true);
      setError('');
      setMessage('');

      // 1. Authenticate with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 2. Link Email/Password credential directly to this authenticated user
      const credential = EmailAuthProvider.credential(user.email!, password);
      await linkWithCredential(user, credential);

      try {
        await logSecurityEvent(user.uid, {
          action: 'PASSWORD_LINKED',
          title: 'Password Credentials Linked',
          description: `Password credentials successfully linked to existing Google account (${user.email}).`,
          status: 'success'
        });
      } catch {}

      navigate('/home');
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setMessage('This password credential is now linked! You can sign in with your email and password.');
        navigate('/home');
      } else if (err.code === 'auth/provider-already-linked') {
        navigate('/home');
      } else {
        setError(getFriendlyAuthErrorMessage(err));
      }
    } finally {
      setLinkingPassword(false);
    }
  };

  const handleResetPassword = async (targetEmail?: string) => {
    const cleanEmail = (targetEmail || email).trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address to receive a password reset link.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, cleanEmail);
      if (auth.currentUser?.uid) {
        try {
          await logSecurityEvent(auth.currentUser.uid, {
            action: 'PASSWORD_RESET_SENT',
            title: 'Password Reset Dispatched',
            description: `Password reset email dispatched to ${cleanEmail}.`,
            status: 'success'
          });
        } catch {}
      }
      setMessage(`Password reset email sent to ${cleanEmail}. Check your inbox (or spam) to set or reset your password. Once set, you can sign in directly!`);
      setError('');
      setGoogleNotice(null);
      setInvalidCredentialHelp(null);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-950 overflow-hidden">
      {/* 1. Full-Screen Video Background */}
      {!videoError ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none filter brightness-90"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
            type="video/mp4"
          />
        </video>
      ) : (
        /* Video Fallback Background */
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 z-0" />
      )}

      {/* Subtle Dark / Neutral Overlay for high readability */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Ambient gradient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md mx-auto my-auto">
        {/* Top Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white font-sans">TradeVault</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium">
            Evidence-First Trading Operating System
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/80 rounded-2xl p-6 sm:p-8 text-slate-100">
          <div className="mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create your TradeVault account' : 'Welcome back'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              {isSignUp
                ? 'Capture every execution and build a disciplined trading process'
                : 'Sign in to access your evidence-based trading workspace'}
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/10 text-rose-300 text-sm rounded-xl border border-rose-500/20 backdrop-blur-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs leading-relaxed">{error}</div>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 text-emerald-300 text-sm rounded-xl border border-emerald-500/20 backdrop-blur-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs leading-relaxed">{message}</div>
            </div>
          )}

          {/* Quick Resolution Box for Invalid Credentials / Forgot Password */}
          {invalidCredentialHelp && (
            <div className="mb-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 backdrop-blur-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-300 mt-0.5 border border-amber-500/40">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-200">
                    Having trouble signing in?
                  </h4>
                  <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                    If this account was registered with Google, you can sign in directly with Google. Or click below to receive a password reset link to set your password.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={handleGoogle}
                  disabled={loading}
                  className="text-xs h-9 bg-slate-900/80 border-amber-500/30 hover:bg-amber-500/20 text-amber-200 flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Use Google Sign-In
                </Button>

                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(invalidCredentialHelp)}
                  disabled={loading}
                  className="text-xs h-9 bg-slate-900/80 border-amber-500/30 hover:bg-amber-500/20 text-amber-200 flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  Send Reset Link
                </Button>
              </div>
            </div>
          )}

          {/* Special Google Account Guidance & Linking Box */}
          {googleNotice && (
            <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 backdrop-blur-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-300 mt-0.5 border border-blue-500/40">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-200">
                    {googleNotice.reason === 'signup_attempt' 
                      ? 'Account Already Exists via Google' 
                      : 'Google Sign-In Account Detected'}
                  </h4>
                  <p className="text-xs text-blue-300/80 mt-1 leading-relaxed">
                    The email <strong className="font-semibold text-blue-100">{googleNotice.email}</strong> is registered using Google Sign-In.
                    {googleNotice.reason === 'login_attempt' && ' You have not set a standalone email password yet.'}
                    {googleNotice.reason === 'signup_attempt' && ' Your existing trades and journals are safely stored under this Google account.'}
                  </p>
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <Button 
                  type="button"
                  onClick={handleGoogle}
                  disabled={loading || linkingPassword}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-10 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>

                {password && password.length >= 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLinkPasswordViaGoogle}
                    disabled={loading || linkingPassword}
                    className="w-full text-xs h-10 border-blue-500/30 text-blue-200 hover:bg-blue-500/20 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    {linkingPassword ? 'Linking Password...' : 'Verify Google & Set This Password'}
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => setGoogleNotice(null)}
                  className="w-full text-center text-[11px] text-blue-400 hover:underline pt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-300">
                Email address
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (googleNotice) setGoogleNotice(null);
                    if (invalidCredentialHelp) setInvalidCredentialHelp(null);
                  }}
                  placeholder="name@example.com"
                  className="bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="block text-xs font-medium text-slate-300">
                  Password
                </Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => handleResetPassword(email)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (invalidCredentialHelp) setInvalidCredentialHelp(null);
                  }}
                  placeholder="••••••••"
                  className="pr-10 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-1 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-slate-300">
                  Confirm Password
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10 bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-1 rounded transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-1">
              <Button 
                type="submit" 
                disabled={loading || linkingPassword} 
                className="w-full text-sm font-semibold h-11 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer" 
                size="lg"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Continue'}
              </Button>
            </div>
            
            {!isSignUp && (
              <div className="text-center pt-1">
                <button 
                  type="button" 
                  onClick={() => handleResetPassword(email)} 
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>

          <div className="mt-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                disabled={loading || linkingPassword} 
                onClick={handleGoogle} 
                className="w-full flex items-center justify-center gap-3 h-11 bg-slate-950/80 hover:bg-slate-800 border-slate-700 text-slate-200 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                type="button" 
                onClick={() => { 
                  setIsSignUp(!isSignUp); 
                  setError(''); 
                  setMessage(''); 
                  setGoogleNotice(null); 
                  setInvalidCredentialHelp(null); 
                }} 
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>

          {/* Small footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400 tracking-wide flex items-center justify-center gap-2">
              <span>Secure</span>
              <span className="text-slate-600">•</span>
              <span>Private</span>
              <span className="text-slate-600">•</span>
              <span>Evidence-First Trading</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
