import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Loader2, 
  ShieldAlert, 
  Lock, 
  Eye, 
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/Button';
import { Input, Label } from '@/components/ui/Input';
import { getFriendlyAuthErrorMessage } from '@/lib/authErrors';

interface AccountDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
  hasGoogleProvider: boolean;
  hasPasswordProvider: boolean;
}

export function AccountDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  hasGoogleProvider,
  hasPasswordProvider
}: AccountDeleteModalProps) {
  const [typedConfirmation, setTypedConfirmation] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reauthSuccess, setReauthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const EXPECTED_TEXT = 'PERMANENTLY DELETE';
  const isConfirmed = typedConfirmation.trim() === EXPECTED_TEXT;

  const handleReauthGoogle = async () => {
    setError(null);
    try {
      setIsDeleting(true);
      await signInWithPopup(auth, googleProvider);
      setReauthSuccess(true);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExecute = async () => {
    if (!isConfirmed || isDeleting) return;
    setError(null);

    try {
      setIsDeleting(true);

      // If user has password provider and entered password, re-authenticate first to prevent requires-recent-login
      if (hasPasswordProvider && password && auth.currentUser && auth.currentUser.email) {
        try {
          const cred = EmailAuthProvider.credential(auth.currentUser.email, password);
          await reauthenticateWithCredential(auth.currentUser, cred);
        } catch (reauthErr: any) {
          setError(getFriendlyAuthErrorMessage(reauthErr));
          setIsDeleting(false);
          return;
        }
      }

      await onConfirm();
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Account deletion failure:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Security confirmation required: For your security, deleting an account requires recent authentication. Please re-authenticate below and try again.');
      } else {
        setError(getFriendlyAuthErrorMessage(err));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 overflow-hidden">
        {/* Warning Accent Banner */}
        <div className="bg-red-600 px-6 py-3 text-white flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>Irreversible Destructive Action</span>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Permanently Delete TradeVault Account
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                You are about to completely delete your account (<span className="font-semibold">{userEmail}</span>) and permanently purge all associated data.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs rounded-xl leading-relaxed font-medium">
              {error}
            </div>
          )}

          {/* Scope Checklist */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs space-y-2">
            <span className="font-semibold text-red-700 dark:text-red-400 block">
              The following will be permanently erased:
            </span>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pl-1">
              <li>All dashboards and portfolio configurations</li>
              <li>All historical trade logs, execution tickets, and notes</li>
              <li>All customized strategies, psychology reflections, and rules</li>
              <li>All Academy progress and calculator history</li>
              <li>Authentication profile and linked login credentials</li>
            </ul>
          </div>

          {/* Re-authentication guidance if needed */}
          {hasPasswordProvider && (
            <div>
              <Label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm your account password:
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10 text-sm"
                  disabled={isDeleting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {hasGoogleProvider && !hasPasswordProvider && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl flex items-center justify-between">
              <div className="text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold block">Google Authentication Security</span>
                <span>Confirm ownership with your Google credentials.</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReauthGoogle}
                disabled={isDeleting || reauthSuccess}
                className="text-xs shrink-0"
              >
                {reauthSuccess ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  'Re-verify with Google'
                )}
              </Button>
            </div>
          )}

          <div>
            <Label htmlFor="account-delete-confirm" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              To proceed, please type <span className="font-mono bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-800">{EXPECTED_TEXT}</span> below:
            </Label>
            <Input
              id="account-delete-confirm"
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={EXPECTED_TEXT}
              className="font-mono text-sm"
              disabled={isDeleting}
              autoComplete="off"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTypedConfirmation('');
                setPassword('');
                setError(null);
                onClose();
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExecute}
              disabled={!isConfirmed || isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Purging Account...
                </>
              ) : (
                'Permanently Delete Account'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
