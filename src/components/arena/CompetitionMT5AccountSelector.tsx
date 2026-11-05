import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink, 
  ChevronDown, 
  Check, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConnectedTradingAccount } from '@/types/mt5';
import { Arena } from '@/types';
import { mt5ClientService } from '@/services/mt5ClientService';
import { MT5AccountCenterModal } from '@/components/mt5/MT5AccountCenterModal';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CompetitionMT5AccountSelectorProps {
  arena: Arena;
  onTradesSynced?: () => void;
}

export function CompetitionMT5AccountSelector({
  arena,
  onTradesSynced
}: CompetitionMT5AccountSelectorProps) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<ConnectedTradingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Selected MT5 account for this competition
  const storageKey = `comp_mt5_acc_${arena.id}_${user?.uid || 'guest'}`;
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    return localStorage.getItem(storageKey) || 'MANUAL';
  });

  // MT5 Account Center Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'connect' | 'create'>('connect');

  const member = user ? arena.members?.[user.uid] : null;
  const isDisqualified = member?.isDisqualified || member?.complianceStatus === 'DISQUALIFIED';

  useEffect(() => {
    let isMounted = true;
    mt5ClientService.getConnectedAccounts()
      .then(accs => {
        if (isMounted) {
          setAccounts(accs);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    const unsub = mt5ClientService.subscribeConnectedAccounts(updated => {
      if (isMounted) {
        setAccounts(updated);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  const handleSelectAccount = (id: string) => {
    setSelectedAccountId(id);
    localStorage.setItem(storageKey, id);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  // Perform MT5 Sync for this Competition
  const handleSyncCompetitionTrades = async () => {
    if (!selectedAccount || !user || isDisqualified) return;
    setIsSyncing(true);
    setSyncStatus('Connecting to MT5...');

    try {
      setSyncStatus('Importing & evaluating competition rules...');
      const res = await mt5ClientService.syncCompetitionMT5Trades(selectedAccount.id, arena.id, 30);
      if (res.errors && res.errors.length > 0) {
        setSyncStatus(`Sync finished: ${res.imported} trades logged, rule violation detected.`);
      } else {
        setSyncStatus(`Sync complete! ${res.imported} trades verified & evaluated.`);
      }
      if (onTradesSynced) onTradesSynced();
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err: any) {
      setSyncStatus(`Sync notice: ${err?.message || 'Sync failed'}`);
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Competition Trading Account
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Rule-Scoped
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Select your MT5 account to automatically sync verified executions into this arena
            </p>
          </div>
        </div>

        {/* Account Selector Dropdown & Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedAccountId}
            onChange={e => {
              const val = e.target.value;
              if (val === '__CONNECT__') {
                setModalTab('connect');
                setIsModalOpen(true);
              } else if (val === '__CREATE__') {
                setModalTab('create');
                setIsModalOpen(true);
              } else {
                handleSelectAccount(val);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="MANUAL">Manual Journal Logging</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                MT5: {acc.broker} • {acc.server} ({acc.accountNumber})
              </option>
            ))}
            <option disabled>──────────</option>
            <option value="__CONNECT__">+ Connect Existing MT5 Account</option>
            <option value="__CREATE__">+ Create New MT5 Account</option>
          </select>

          {selectedAccount && (
            <Button
              size="sm"
              onClick={handleSyncCompetitionTrades}
              disabled={isSyncing || isDisqualified}
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 rounded-xl shadow-xs"
              title="Synchronize trades from MT5 into this competition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync MT5'}</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setModalTab('connect');
              setIsModalOpen(true);
            }}
            className="h-8 px-2.5 text-xs text-slate-300 border-slate-700 hover:bg-slate-800 rounded-xl"
            title="Open MT5 Account Center"
          >
            <Zap className="w-3.5 h-3.5 text-blue-400 mr-1" />
            <span>Account Center</span>
          </Button>
        </div>
      </div>

      {/* Selected Account Status Pill & Sync Banner */}
      {selectedAccount && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">
              {selectedAccount.server} ({selectedAccount.accountNumber})
            </span>
            <span className="text-[11px] text-slate-400">
              • Balance: ${Number(selectedAccount.balance || 0).toLocaleString()} {selectedAccount.currency}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              • {selectedAccount.lastSyncAt ? `Last sync ${formatDistanceToNow(new Date(selectedAccount.lastSyncAt), { addSuffix: true })}` : 'Live bridge'}
            </span>
          </div>

          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Read-Only Synchronization</span>
          </div>
        </div>
      )}

      {syncStatus && (
        <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-900/60 text-blue-300 text-xs flex items-center gap-2 animate-in fade-in">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {isDisqualified && (
        <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Trading locked: You are disqualified from logging or syncing new trades in this competition.</span>
        </div>
      )}

      {/* MT5 Account Center Modal */}
      <MT5AccountCenterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
        onSuccess={newAcc => {
          setSelectedAccountId(newAcc.id);
          localStorage.setItem(storageKey, newAcc.id);
          setIsModalOpen(false);
          if (onTradesSynced) onTradesSynced();
        }}
      />
    </div>
  );
}
