/**
 * Firebase Auth error helper: maps technical error codes to clear, friendly user messages.
 */
export function getFriendlyAuthErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred. Please try again.';
  
  const code = err.code || '';
  const msg = err.message || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Incorrect email or password. If you originally signed up with Google, please use "Continue with Google".';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again or use "Forgot Password".';
    case 'auth/user-not-found':
      return 'No account was found with this email. Please check the spelling or sign up.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. If you created it with Google, please sign in with Google or link a password.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using Google. Please sign in with Google to access your account.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few moments and try again, or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/credential-already-in-use':
      return 'This credential is already linked to another user account.';
    case 'auth/requires-recent-login':
      return 'For your security, this operation requires recent authentication. Please sign out and sign in again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in window was opened. Please complete authentication in the active window.';
    default:
      // Strip "Firebase: Error (auth/...)" prefix if present
      if (typeof msg === 'string') {
        const match = msg.match(/\((auth\/[^)]+)\)/);
        if (match) {
          return `Authentication error: ${match[1].replace('auth/', '').replace(/-/g, ' ')}. Please try again.`;
        }
        return msg.replace(/^Firebase:\s*/i, '');
      }
      return 'Failed to authenticate. Please try again.';
  }
}
