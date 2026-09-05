import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail,
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

interface GoogleNoticeState {
  show: boolean;
  email: string;
  reason: 'login_attempt' | 'signup_attempt';
}

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
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

  // If already authenticated, redirect to home immediately
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
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
        await createUserWithEmailAndPassword(auth, cleanEmail, password);
        navigate('/');
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          // Account already exists. Attempt direct sign in with the provided password!
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, password);
            navigate('/');
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
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, password);
        } catch (initialErr: any) {
          // If password had trailing/leading spaces and failed, try trimmed password
          if (
            password.trim() !== password &&
            (initialErr.code === 'auth/invalid-credential' || initialErr.code === 'auth/wrong-password')
          ) {
            await signInWithEmailAndPassword(auth, cleanEmail, password.trim());
          } else {
            throw initialErr;
          }
        }
        navigate('/');
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
      await signInWithPopup(auth, googleProvider);
      navigate('/');
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

      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setMessage('This password credential is now linked! You can sign in with your email and password.');
        navigate('/');
      } else if (err.code === 'auth/provider-already-linked') {
        navigate('/');
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          TradeVault
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Your trading data. Your process. Your edge.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow-xl shadow-slate-200/40 sm:rounded-2xl sm:px-10 border-0 ring-1 ring-slate-200">
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs leading-relaxed">{error}</div>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3.5 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-100 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs leading-relaxed">{message}</div>
            </div>
          )}

          {/* Quick Resolution Box for Invalid Credentials / Forgot Password */}
          {invalidCredentialHelp && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">
                    Having trouble signing in?
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
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
                  className="text-xs h-9 bg-white border-amber-300 hover:bg-amber-100/70 text-amber-900 flex items-center justify-center gap-1.5"
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
                  className="text-xs h-9 bg-white border-amber-300 hover:bg-amber-100/70 text-amber-900 flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  Send Reset Link
                </Button>
              </div>
            </div>
          )}

          {/* Special Google Account Guidance & Linking Box */}
          {googleNotice && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">
                    {googleNotice.reason === 'signup_attempt' 
                      ? 'Account Already Exists via Google' 
                      : 'Google Sign-In Account Detected'}
                  </h4>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    The email <strong className="font-semibold text-blue-950">{googleNotice.email}</strong> is registered using Google Sign-In.
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
                    className="w-full text-xs h-10 border-blue-300 text-blue-800 hover:bg-blue-100/60 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    {linkingPassword ? 'Linking Password...' : 'Verify Google & Set This Password'}
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => setGoogleNotice(null)}
                  className="w-full text-center text-[11px] text-blue-600 hover:underline pt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email" className="mb-2 block">Email address</Label>
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
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="block">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => handleResetPassword(email)}
                    className="text-xs text-blue-600 hover:text-blue-500 font-medium"
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
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                <div className="mt-1 relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <Button type="submit" disabled={loading || linkingPassword} className="w-full text-base h-11" size="lg">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </div>
            
            {!isSignUp && (
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => handleResetPassword()} 
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                disabled={loading || linkingPassword} 
                onClick={handleGoogle} 
                className="w-full flex items-center justify-center gap-3 h-11"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
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
                className="text-blue-600 font-medium hover:text-blue-500"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
