import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConnectedTradingAccount } from '@/types/mt5';
import { mt5ClientService } from '@/services/mt5ClientService';
import { MT5AccountCard } from './MT5AccountCard';
import { ConnectMT5Modal } from './ConnectMT5Modal';
import { MT5OpenPositionsModal } from './MT5OpenPositionsModal';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ConnectMT5SectionProps {
  onTradeImported?: () => void;
  targetDashboardId?: string;
  onSwitchToManual?: () => void;
}

export function ConnectMT5Section({
  onTradeImported,
  targetDashboardId,
  onSwitchToManual
}: ConnectMT5SectionProps) {
  const { activeDashboard } = useAuth();
  const effectiveDashboardId = targetDashboardId || activeDashboard?.id || 'default';

  const [accounts, setAccounts] = useState<ConnectedTradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'connect' | 'create'>('connect');
  const [selectedPositionsAccount, setSelectedPositionsAccount] = useState<ConnectedTradingAccount | null>(null);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await mt5ClientService.getConnectedAccounts();
      setAccounts(data);
    } catch (err) {
      console.warn('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    const unsub = mt5ClientService.subscribeConnectedAccounts((updated) => {
      setAccounts(updated);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                MetaTrader 5 Automatic Import
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Connect Your MT5 Accounts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              TradeVault imports actual completed executions, fills, realized P&L, commissions, and swaps directly from your broker. Connection is <strong className="text-slate-200">strictly read-only</strong> using your Investor Password.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              onClick={() => {
                setModalTab('connect');
                setIsModalOpen(true);
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-xs"
            >
              <Zap className="w-4 h-4" /> Connect Existing MT5
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setModalTab('create');
                setIsModalOpen(true);
              }}
              className="gap-2 bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700 py-2.5 px-4 rounded-xl"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Create MT5 Account
            </Button>

            {onSwitchToManual && (
              <Button
                variant="outline"
                onClick={onSwitchToManual}
                className="gap-1.5 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                <span>Manual Add</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Connected Accounts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Connected Trading Accounts</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
              {accounts.length}
            </span>
          </h4>

          {accounts.length > 0 && (
            <button
              onClick={loadAccounts}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh Accounts</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Loading connected accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-14 text-center space-y-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <Zap className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-base font-bold text-slate-100">No MT5 Accounts Connected Yet</h4>
              <p className="text-xs text-slate-400">
                Connect your IC Markets, FTMO, Exness, Pepperstone, or any custom broker account to automatically import historical and future trades.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              >
                <Plus className="w-4 h-4" /> Connect Your First Account
              </Button>
              {onSwitchToManual && (
                <Button
                  variant="outline"
                  onClick={onSwitchToManual}
                  className="text-xs text-slate-300 border-slate-800 hover:bg-slate-800"
                >
                  Enter Trade Manually
                </Button>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 max-w-md mx-auto grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Investor Read-Only</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Zero Duplicates</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Auto Journal P&L</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map(acc => (
              <MT5AccountCard
                key={acc.id}
                account={acc}
                dashboardId={effectiveDashboardId}
                onRefresh={() => {
                  loadAccounts();
                  if (onTradeImported) onTradeImported();
                }}
                onViewPositions={account => setSelectedPositionsAccount(account)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Safety & Workflow Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>How MT5 Trade Sync Works</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Completed deal executions in MT5 populate your Journal with objective numbers: market, volume, entry, exit, realized P&L, commission, swap, and timestamps.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            You can then open the trade in your Journal to enrich it with subjective notes: strategy, emotions, setup quality, mistakes, and execution psychology.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Broker-Agnostic & Non-Custodial</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            TradeVault is not a broker and does not hold user funds. Passwords are never exposed back to the client.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Disconnecting an MT5 account stops background polling at any time, while keeping your previously imported journal trades safe and intact.
          </p>
        </div>
      </div>

      {/* Modal: Connect MT5 */}
      <ConnectMT5Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetDashboardId={effectiveDashboardId}
        initialTab={modalTab}
        onSuccess={() => {
          loadAccounts();
          if (onTradeImported) onTradeImported();
        }}
      />

      {/* Modal: Open Positions */}
      <MT5OpenPositionsModal
        account={selectedPositionsAccount}
        onClose={() => setSelectedPositionsAccount(null)}
      />
    </div>
  );
}
