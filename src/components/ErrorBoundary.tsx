import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert, Database, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  resetDone: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    resetDone: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React application error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/home';
  };

  private handleResetLocalState = () => {
    try {
      localStorage.removeItem('tradevault_settings');
      localStorage.removeItem('tradevault_last_dashboard');
      localStorage.removeItem('tradevault_sidebar_collapsed');
      this.setState({ resetDone: true });
      setTimeout(() => {
        window.location.href = '/home';
      }, 500);
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const componentStack = this.state.errorInfo?.componentStack || '';
      const firstLine = componentStack.trim().split('\n')[0] || 'App Component';

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 text-center selection:bg-blue-600 selection:text-white">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold tracking-wider text-amber-400 uppercase">
                    TRADEVAULT RECOVERY MODE
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {this.props.fallbackTitle || 'Safe Diagnostic Fallback Active'}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-700">
                Status: Resilient Safe Boot
              </span>
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400">Application Boot Status</div>
                <div className="font-semibold text-emerald-400 mt-0.5">Shell mounted (Recovery View)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-slate-400">Failed Component / Location</div>
                <div className="font-semibold text-amber-300 mt-0.5 truncate font-mono" title={firstLine}>
                  {firstLine || 'Root Context / Router'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 sm:col-span-2">
                <div className="text-slate-400">Suggested Root Cause</div>
                <div className="font-medium text-slate-300 mt-0.5">
                  Client runtime exception during render cycle. Local cache or stale state caught safely by root boundary.
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            {this.state.error?.message && (
              <div className="mb-5 p-3.5 bg-rose-950/30 border border-rose-800/50 rounded-xl text-xs font-mono text-rose-300 overflow-x-auto">
                <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">Error Message:</div>
                {this.state.error.message}
              </div>
            )}

            {/* Recovery Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-blue-600/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Workspace</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                <Home className="w-4 h-4" />
                <span>Go to Welcome Home</span>
              </button>

              <button
                onClick={this.handleResetLocalState}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-amber-950/40 text-amber-300 hover:text-amber-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer border border-amber-900/40 ml-auto"
                title="Clears local browser settings without deleting your real Firestore trades"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{this.state.resetDone ? 'Cache Cleared! Redirecting...' : 'Reset Local Cache'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
